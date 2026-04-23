import { createClient } from '@/lib/supabase/server'
import QuestionManager from '@/components/dashboard/QuestionManager'

export default async function QuestionsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: bar } = await supabase
    .from('bars').select('id').eq('owner_id', user!.id).single()

  const { data: questions } = await supabase
    .from('quiz_questions')
    .select('*, options:question_options(*)').eq('bar_id', bar!.id)
    .order('display_order')

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="font-serif text-3xl text-gold mb-1">Quiz Soruları</h1>
        <p className="text-white/40 text-sm">
          Müşteriye sorulacak soruları ve seçeneklerini düzenleyin.
          Her seçenekteki etiketler kokteyl eşleştirmesini belirler.
        </p>
      </div>
      <QuestionManager barId={bar!.id} initialQuestions={questions || []} />
    </div>
  )
}
