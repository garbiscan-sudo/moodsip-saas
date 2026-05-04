export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import QuizApp from '@/components/quiz/QuizApp'

interface Props { params: { barSlug: string } }

export async function generateMetadata({ params }: Props) {
  const supabase = createClient()
  const { data: bar } = await supabase
    .from('bars').select('name,tagline').eq('slug', params.barSlug).single()
  return {
    title:       bar ? `${bar.name} — Mood Quiz` : 'MoodSip',
    description: bar?.tagline || 'Ruh haline göre kokteyl önerisi',
  }
}

export default async function BarQuizPage({ params }: Props) {
  const supabase = createClient()

  // Bar bilgisi
  const { data: bar } = await supabase
    .from('bars')
    .select('*')
    .eq('slug', params.barSlug)
    .in('subscription_status', ['trial','active'])
    .single()

  if (!bar) notFound()

  // Sorular + seçenekler
  const { data: questions } = await supabase
    .from('quiz_questions')
    .select('*, options:question_options(*)')
    .eq('bar_id', bar.id)
    .eq('is_active', true)
    .order('display_order')

  // Kokteyller
  const { data: cocktails } = await supabase
    .from('cocktails')
    .select('*')
    .eq('bar_id', bar.id)
    .eq('is_active', true)
    .order('display_order')

  if (!questions?.length || !cocktails?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <div className="font-serif text-4xl text-gold mb-4">{bar.name}</div>
          <p className="text-white/40">Menü henüz hazırlanıyor...</p>
        </div>
      </div>
    )
  }

  return (
    <QuizApp
      bar={bar}
      questions={questions}
      cocktails={cocktails}
    />
  )
}
