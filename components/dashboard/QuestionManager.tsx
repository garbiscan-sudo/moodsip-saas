'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, X, Check, ChevronDown, ChevronUp, Tag } from 'lucide-react'
import type { QuizQuestion, QuestionOption } from '@/lib/types'

const COMMON_TAGS = [
  'bitter','sweet','sour','fresh','strong','light','medium','bold',
  'floral','herbal','smoky','spicy','creamy','fruity','tropical',
  'romantic','playful','mysterious','adventurous','chill','high-energy','nostalgic','social',
  'gin-based','whiskey-based','rum-based','vodka-based','tequila-based','sparkling-based',
]

const EMOJIS = ['🌙','✨','🌤','🍸','🌠','🎯','💫','🌊','⚡','🎭','🌹','🎶']

type QWithOptions = QuizQuestion & { options: QuestionOption[] }

interface QModalData {
  question_text: string; emoji: string
}
interface OptModalData {
  text: string; subtext: string; tags: string[]
}

export default function QuestionManager({ barId, initialQuestions }: {
  barId: string; initialQuestions: QWithOptions[]
}) {
  const supabase = createClient()
  const [questions, setQuestions] = useState<QWithOptions[]>(initialQuestions)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Question modal
  const [qModal, setQModal] = useState<{ open: boolean; editing: QWithOptions | null }>({ open: false, editing: null })
  const [qForm, setQForm] = useState<QModalData>({ question_text: '', emoji: '🌙' })

  // Option modal
  const [optModal, setOptModal] = useState<{ open: boolean; questionId: string | null; editing: QuestionOption | null }>({ open: false, questionId: null, editing: null })
  const [optForm, setOptForm] = useState<OptModalData>({ text: '', subtext: '', tags: [] })

  // ── Question CRUD ────────────────────────
  function openAddQ() {
    setQForm({ question_text: '', emoji: '🌙' })
    setQModal({ open: true, editing: null })
  }
  function openEditQ(q: QWithOptions) {
    setQForm({ question_text: q.question_text, emoji: q.emoji })
    setQModal({ open: true, editing: q })
  }

  async function saveQuestion() {
    if (!qForm.question_text.trim()) { toast.error('Soru metni gerekli'); return }
    setSaving(true)
    try {
      if (qModal.editing) {
        const { data, error } = await supabase.from('quiz_questions')
          .update({ question_text: qForm.question_text, emoji: qForm.emoji })
          .eq('id', qModal.editing.id).select('*, options:question_options(*)').single()
        if (error) throw error
        setQuestions(qs => qs.map(q => q.id === data.id ? data : q))
        toast.success('Soru güncellendi')
      } else {
        const { data, error } = await supabase.from('quiz_questions')
          .insert({ bar_id: barId, question_text: qForm.question_text, emoji: qForm.emoji, display_order: questions.length })
          .select('*, options:question_options(*)').single()
        if (error) throw error
        setQuestions(qs => [...qs, { ...data, options: [] }])
        toast.success('Soru eklendi')
      }
      setQModal({ open: false, editing: null })
    } catch { toast.error('Kaydedilemedi') }
    finally { setSaving(false) }
  }

  async function deleteQuestion(id: string) {
    if (!confirm('Bu soruyu silmek istediğinize emin misiniz?')) return
    const { error } = await supabase.from('quiz_questions').delete().eq('id', id)
    if (!error) setQuestions(qs => qs.filter(q => q.id !== id))
    else toast.error('Silinemedi')
  }

  // ── Option CRUD ──────────────────────────
  function openAddOpt(questionId: string) {
    setOptForm({ text: '', subtext: '', tags: [] })
    setOptModal({ open: true, questionId, editing: null })
  }
  function openEditOpt(questionId: string, opt: QuestionOption) {
    setOptForm({ text: opt.text, subtext: opt.subtext || '', tags: opt.tags || [] })
    setOptModal({ open: true, questionId, editing: opt })
  }

  async function saveOption() {
    if (!optForm.text.trim()) { toast.error('Seçenek metni gerekli'); return }
    setSaving(true)
    try {
      const { questionId, editing } = optModal
      const q = questions.find(q => q.id === questionId)!
      const payload = {
        question_id:   questionId!,
        text:          optForm.text.trim(),
        subtext:       optForm.subtext.trim() || null,
        tags:          optForm.tags,
        display_order: editing ? editing.display_order : (q.options?.length ?? 0),
      }

      if (editing) {
        const { data, error } = await supabase.from('question_options')
          .update(payload).eq('id', editing.id).select().single()
        if (error) throw error
        setQuestions(qs => qs.map(q => q.id === questionId ? {
          ...q, options: q.options.map(o => o.id === data.id ? data : o)
        } : q))
        toast.success('Seçenek güncellendi')
      } else {
        const { data, error } = await supabase.from('question_options')
          .insert(payload).select().single()
        if (error) throw error
        setQuestions(qs => qs.map(q => q.id === questionId ? {
          ...q, options: [...(q.options || []), data]
        } : q))
        toast.success('Seçenek eklendi')
      }
      setOptModal({ open: false, questionId: null, editing: null })
    } catch { toast.error('Kaydedilemedi') }
    finally { setSaving(false) }
  }

  async function deleteOption(questionId: string, optId: string) {
    const { error } = await supabase.from('question_options').delete().eq('id', optId)
    if (!error) setQuestions(qs => qs.map(q => q.id === questionId ? {
      ...q, options: q.options.filter(o => o.id !== optId)
    } : q))
    else toast.error('Silinemedi')
  }

  function toggleOptTag(tag: string) {
    setOptForm(f => ({
      ...f, tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag]
    }))
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex justify-between items-center">
        <span className="text-white/40 text-sm">{questions.length} soru</span>
        <button onClick={openAddQ} className="btn-gold text-sm px-5 py-2.5 flex items-center gap-2">
          <Plus size={16} /> Soru Ekle
        </button>
      </div>

      {/* Questions list */}
      {questions.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">❓</div>
          <p className="text-white/40 mb-4">Henüz soru eklenmemiş.</p>
          <button onClick={openAddQ} className="btn-outline text-sm">İlk soruyu ekleyin</button>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, qi) => (
            <div key={q.id} className="glass rounded-2xl overflow-hidden">
              {/* Question header */}
              <div className="flex items-center gap-3 p-4">
                <span className="text-xl">{q.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">Soru {qi + 1}</div>
                  <div className="text-white/70 text-sm truncate">{q.question_text}</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-white/30 text-xs mr-2">{q.options?.length ?? 0} seçenek</span>
                  <button onClick={() => openEditQ(q)} className="text-white/30 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => deleteQuestion(q.id)} className="text-white/30 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
                    <Trash2 size={14} />
                  </button>
                  <button onClick={() => setExpanded(expanded === q.id ? null : q.id)}
                    className="text-white/30 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors ml-1">
                    {expanded === q.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              </div>

              {/* Options */}
              {expanded === q.id && (
                <div className="border-t border-white/5 p-4 space-y-2">
                  {(q.options || []).map(opt => (
                    <div key={opt.id} className="flex items-start gap-3 bg-white/3 rounded-xl p-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{opt.text}</div>
                        {opt.subtext && <div className="text-white/40 text-xs mt-0.5 italic">{opt.subtext}</div>}
                        {opt.tags?.length > 0 && (
                          <div className="flex gap-1 flex-wrap mt-1.5">
                            {opt.tags.map(t => (
                              <span key={t} className="bg-gold/10 text-gold/80 text-xs px-2 py-0.5 rounded-full">{t}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => openEditOpt(q.id, opt)} className="text-white/30 hover:text-white p-1 transition-colors">
                          <Pencil size={12} />
                        </button>
                        <button onClick={() => deleteOption(q.id, opt.id)} className="text-white/30 hover:text-red-400 p-1 transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => openAddOpt(q.id)}
                    className="text-gold/70 hover:text-gold text-sm flex items-center gap-1 transition-colors w-full justify-center py-2 rounded-xl border border-dashed border-gold/20 hover:border-gold/40 mt-1">
                    <Plus size={14} /> Seçenek Ekle
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── QUESTION MODAL ─────────────────── */}
      {qModal.open && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass rounded-3xl p-6 w-full max-w-md border-gold/10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-xl text-gold">{qModal.editing ? 'Soruyu Düzenle' : 'Yeni Soru'}</h2>
              <button onClick={() => setQModal({ open: false, editing: null })} className="text-white/30 hover:text-white"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Emoji</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJIS.map(e => (
                    <button key={e} onClick={() => setQForm(f => ({ ...f, emoji: e }))}
                      className={`text-xl p-2 rounded-lg transition-all ${qForm.emoji === e ? 'bg-gold/20 ring-1 ring-gold' : 'hover:bg-white/5'}`}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Soru Metni *</label>
                <textarea className="input-field resize-none" rows={2}
                  placeholder="Bu gece nasıl hissediyorsunuz?"
                  value={qForm.question_text}
                  onChange={e => setQForm(f => ({ ...f, question_text: e.target.value }))} />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setQModal({ open: false, editing: null })} className="btn-outline flex-1 py-2.5 text-sm">İptal</button>
              <button onClick={saveQuestion} disabled={saving} className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2">
                {saving ? 'Kaydediliyor...' : <><Check size={14} /> Kaydet</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── OPTION MODAL ───────────────────── */}
      {optModal.open && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border-gold/10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-xl text-gold">{optModal.editing ? 'Seçeneği Düzenle' : 'Yeni Seçenek'}</h2>
              <button onClick={() => setOptModal({ open: false, questionId: null, editing: null })} className="text-white/30 hover:text-white"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Ana Metin *</label>
                <input className="input-field" placeholder="Kutlamaya hazırım ✨"
                  value={optForm.text} onChange={e => setOptForm(f => ({ ...f, text: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Alt Metin (opsiyonel)</label>
                <input className="input-field" placeholder="Bu gece özel bir şey var"
                  value={optForm.subtext} onChange={e => setOptForm(f => ({ ...f, subtext: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5 flex items-center gap-1.5">
                  <Tag size={12} /> Etiketler
                  <span className="text-white/30">(kokteyl eşleştirmesi)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_TAGS.map(tag => (
                    <button key={tag} onClick={() => toggleOptTag(tag)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        optForm.tags.includes(tag) ? 'bg-gold text-obsidian' : 'bg-white/5 text-white/40 hover:bg-white/10'
                      }`}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setOptModal({ open: false, questionId: null, editing: null })} className="btn-outline flex-1 py-2.5 text-sm">İptal</button>
              <button onClick={saveOption} disabled={saving} className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2">
                {saving ? 'Kaydediliyor...' : <><Check size={14} /> Kaydet</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
