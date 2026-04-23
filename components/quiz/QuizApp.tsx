'use client'
import { useState, CSSProperties } from 'react'
import Image from 'next/image'
import { ChevronLeft, RotateCcw } from 'lucide-react'
import type { Bar, Cocktail, QuizQuestion } from '@/lib/types'

interface Props {
  bar:       Bar
  questions: (QuizQuestion & { options: { id: string; text: string; subtext?: string | null; tags: string[] }[] })[]
  cocktails: Cocktail[]
}

type Screen = 'hero' | 'quiz' | 'result'

export default function QuizApp({ bar, questions, cocktails }: Props) {
  const [screen, setScreen]   = useState<Screen>('hero')
  const [qIndex, setQIndex]   = useState(0)
  const [answers, setAnswers] = useState<string[][]>([])
  const [results, setResults] = useState<Cocktail[]>([])
  const [selected, setSelected] = useState<number | null>(null)

  const gold = bar.primary_color || '#d4af37'

  // CSS vars injected via inline style on root
  const cssVars = {
    '--bar-gold':  gold,
    '--bar-bg':    bar.bg_color || '#0d0d0d',
  } as CSSProperties

  function startQuiz() {
    setQIndex(0)
    setAnswers([])
    setSelected(null)
    setScreen('quiz')
  }

  function selectOption(optionIndex: number) {
    if (selected !== null) return
    setSelected(optionIndex)
    const tags = questions[qIndex].options[optionIndex]?.tags || []

    setTimeout(() => {
      const newAnswers = [...answers, tags]
      setAnswers(newAnswers)
      setSelected(null)

      if (qIndex < questions.length - 1) {
        setQIndex(i => i + 1)
      } else {
        // Calculate results
        const flatTags = newAnswers.flat()
        const scored = cocktails.map(c => ({
          cocktail: c,
          score: (c.tags || []).reduce((sum, tag) => sum + (flatTags.includes(tag) ? 1 : 0), 0)
            + Math.random() * 0.05,
        }))
        scored.sort((a, b) => b.score - a.score)
        setResults(scored.slice(0, 3).map(s => s.cocktail))
        setScreen('result')
      }
    }, 300)
  }

  function reset() {
    setScreen('hero')
    setQIndex(0)
    setAnswers([])
    setResults([])
    setSelected(null)
  }

  const q        = questions[qIndex]
  const progress = ((qIndex + 1) / questions.length) * 100
  const labels   = ['Mükemmel Eşleşme', 'Harika Seçim', 'Alternatif Öneri']

  // ── HERO ────────────────────────────────────────────
  if (screen === 'hero') return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-12" style={cssVars}>
      {/* Radial glow */}
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 30%, ${gold}10 0%, transparent 60%)` }} />

      {bar.logo_url ? (
        <Image src={bar.logo_url} alt={bar.name} width={80} height={80} className="rounded-2xl mb-6 object-cover" />
      ) : (
        <div className="font-serif text-5xl mb-2" style={{ color: gold }}>{bar.name}</div>
      )}

      {bar.tagline && (
        <p className="font-serif italic text-white/40 mb-12 text-lg">{bar.tagline}</p>
      )}

      <h1 className="font-serif text-4xl md:text-5xl font-normal mb-4 leading-snug">
        Bu gece nasıl{' '}
        <em style={{ color: gold }}>hissediyorsunuz?</em>
      </h1>
      <p className="text-white/50 mb-10 max-w-sm">
        {questions.length} kısa soru — ruh halinize özel kokteyl önerisi.
      </p>

      <button onClick={startQuiz}
        className="font-semibold px-10 py-4 rounded-full transition-all hover:-translate-y-0.5"
        style={{ background: gold, color: '#0d0d0d', boxShadow: `0 8px 24px ${gold}40` }}>
        Quiz'e Başla
      </button>

      <p className="text-white/20 text-xs mt-8 italic">Crafted by MoodSip</p>
    </div>
  )

  // ── QUIZ ────────────────────────────────────────────
  if (screen === 'quiz') return (
    <div className="min-h-screen flex flex-col px-4 py-8 max-w-2xl mx-auto" style={cssVars}>
      {/* Progress */}
      <div className="flex items-center gap-4 mb-8">
        {qIndex > 0 && (
          <button onClick={() => setQIndex(i => i - 1)} className="text-white/30 hover:text-white transition-colors">
            <ChevronLeft size={20} />
          </button>
        )}
        <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: gold }} />
        </div>
        <span className="text-white/30 text-sm tabular-nums">{qIndex + 1}/{questions.length}</span>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="text-4xl text-center mb-6">{q.emoji}</div>
        <h2 className="font-serif text-3xl text-center mb-10 leading-snug">{q.question_text}</h2>

        <div className="grid grid-cols-1 gap-3">
          {q.options.map((opt, idx) => (
            <button
              key={opt.id}
              onClick={() => selectOption(idx)}
              disabled={selected !== null}
              className={`text-left p-5 rounded-2xl border transition-all duration-200 ${
                selected === idx
                  ? 'scale-[0.98] opacity-80'
                  : 'hover:scale-[1.01] hover:-translate-y-0.5'
              }`}
              style={{
                background: selected === idx ? `${gold}18` : 'rgba(255,255,255,0.04)',
                borderColor: selected === idx ? gold : 'rgba(255,255,255,0.08)',
              }}
            >
              <div className="font-medium text-base">{opt.text}</div>
              {opt.subtext && (
                <div className="text-white/40 text-sm mt-1 italic">{opt.subtext}</div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  // ── RESULT ──────────────────────────────────────────
  return (
    <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto" style={cssVars}>
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 0%, ${gold}08 0%, transparent 50%)` }} />

      <div className="text-center mb-10">
        <div className="font-serif text-4xl mb-2" style={{ color: gold }}>
          Önerilen Kokteyller
        </div>
        <p className="text-white/40">Ruh halinize en uygun seçimler</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {results.map((c, i) => (
          <div key={c.id}
            className="rounded-2xl overflow-hidden border border-white/8 bg-white/4 backdrop-blur-sm transition-all hover:-translate-y-1"
            style={{ borderColor: i === 0 ? `${gold}40` : undefined }}>

            {/* Badge */}
            <div className="relative">
              {c.image_url && (
                <div className="aspect-square relative overflow-hidden">
                  <Image src={c.image_url} alt={c.name} fill className="object-cover" />
                </div>
              )}
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: i === 0 ? gold : 'rgba(0,0,0,0.6)', color: i === 0 ? '#0d0d0d' : '#fff' }}>
                {labels[i]}
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-serif text-xl mb-2" style={{ color: gold }}>{c.name}</h3>
              {c.description && (
                <p className="text-white/50 text-sm leading-relaxed mb-4">{c.description}</p>
              )}

              {c.ingredients?.length > 0 && (
                <div className="border-t border-white/8 pt-3">
                  <div className="text-white/60 text-xs font-medium uppercase tracking-wider mb-2">İçindekiler</div>
                  <ul className="space-y-1">
                    {c.ingredients.map(ing => (
                      <li key={ing} className="text-white/40 text-xs flex items-center gap-2">
                        <span style={{ color: gold }}>—</span> {ing}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Reset */}
      <div className="text-center mt-10">
        <button onClick={reset}
          className="inline-flex items-center gap-2 border rounded-full px-6 py-3 text-sm transition-all hover:bg-white/5"
          style={{ borderColor: `${gold}40`, color: gold }}>
          <RotateCcw size={14} />
          Tekrar Dene
        </button>
      </div>

      <p className="text-center text-white/15 text-xs mt-8 italic">Powered by MoodSip</p>
    </div>
  )
}
