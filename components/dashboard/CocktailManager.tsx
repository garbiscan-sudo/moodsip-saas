'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, GripVertical, X, Check, ToggleLeft, ToggleRight, Tag, Upload, Image as ImageIcon } from 'lucide-react'
import type { Cocktail } from '@/lib/types'
import Image from 'next/image'

const COMMON_TAGS = [
  'bitter','sweet','sour','fresh','strong','light','medium','bold',
  'floral','herbal','smoky','spicy','creamy','fruity','tropical',
  'romantic','playful','mysterious','adventurous','chill','high-energy','nostalgic','social',
]

interface CocktailFormData {
  name: string; description: string; image_url: string; tags: string[]; ingredients: string[]
}
const emptyForm: CocktailFormData = {
  name:'', description:'', image_url:'', tags:[], ingredients:[''],
}

export default function CocktailManager({ barId, initialCocktails }: {
  barId: string; initialCocktails: Cocktail[]
}) {
  const supabase = createClient()
  const [cocktails, setCocktails] = useState<Cocktail[]>(initialCocktails)
  const [modal, setModal] = useState<{ open: boolean; editing: Cocktail | null }>({ open: false, editing: null })
  const [form, setForm] = useState<CocktailFormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function openAdd() {
    setForm(emptyForm)
    setPreview('')
    setModal({ open: true, editing: null })
  }

  function openEdit(c: Cocktail) {
    setForm({
      name:        c.name,
      description: c.description || '',
      image_url:   c.image_url || '',
      tags:        c.tags || [],
      ingredients: c.ingredients?.length ? c.ingredients : [''],
    })
    setPreview(c.image_url || '')
    setModal({ open: true, editing: c })
  }

  function closeModal() {
    setModal({ open: false, editing: null })
    setPreview('')
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Görsel 5MB dan küçük olmalı')
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    setUploading(true)

    try {
      const ext      = file.name.split('.').pop()
      const fileName = `${barId}/${Date.now()}.${ext}`

      const { error } = await supabase.storage
        .from('cocktail-images')
        .upload(fileName, file, { upsert: true })

      if (error) throw error

      const { data } = supabase.storage
        .from('cocktail-images')
        .getPublicUrl(fileName)

      setForm(f => ({ ...f, image_url: data.publicUrl }))
      toast.success('Görsel yüklendi!')
    } catch {
      toast.error('Görsel yüklenemedi')
      setPreview('')
    } finally {
      setUploading(false)
    }
  }

  function setIngredient(i: number, v: string) {
    const arr = [...form.ingredients]; arr[i] = v; setForm(f => ({ ...f, ingredients: arr }))
  }
  function addIngredient() { setForm(f => ({ ...f, ingredients: [...f.ingredients, ''] })) }
  function removeIngredient(i: number) {
    setForm(f => ({ ...f, ingredients: f.ingredients.filter((_, idx) => idx !== i) }))
  }

  function toggleTag(tag: string) {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag],
    }))
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error('Kokteyl adi gerekli'); return }
    setSaving(true)
    try {
      const payload = {
        bar_id:      barId,
        name:        form.name.trim(),
        description: form.description.trim() || null,
        image_url:   form.image_url.trim() || null,
        tags:        form.tags,
        ingredients: form.ingredients.filter(i => i.trim()),
      }

      if (modal.editing) {
        const { data, error } = await supabase
          .from('cocktails').update(payload).eq('id', modal.editing.id).select().single()
        if (error) throw error
        setCocktails(cs => cs.map(c => c.id === data.id ? data : c))
        toast.success('Kokteyl guncellendi')
      } else {
        const { data, error } = await supabase
          .from('cocktails').insert({ ...payload, display_order: cocktails.length }).select().single()
        if (error) throw error
        setCocktails(cs => [...cs, data])
        toast.success('Kokteyl eklendi')
      }
      closeModal()
    } catch {
      toast.error('Kayit edilemedi')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(c: Cocktail) {
    const { error } = await supabase
      .from('cocktails').update({ is_active: !c.is_active }).eq('id', c.id)
    if (!error) setCocktails(cs => cs.map(x => x.id === c.id ? { ...x, is_active: !x.is_active } : x))
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu kokteyı silmek istiyor musunuz?')) return
    setDeleting(id)
    const { error } = await supabase.from('cocktails').delete().eq('id', id)
    if (!error) setCocktails(cs => cs.filter(c => c.id !== id))
    else toast.error('Silinemedi')
    setDeleting(null)
  }

  return (
    <>
      <div className="flex justify-between items-center">
        <span className="text-white/40 text-sm">{cocktails.length} kokteyl</span>
        <button onClick={openAdd} className="btn-gold text-sm px-5 py-2.5 flex items-center gap-2">
          <Plus size={16} /> Kokteyl Ekle
        </button>
      </div>

      {cocktails.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">🍸</div>
          <p className="text-white/40 mb-4">Henuz kokteyl eklenmemis.</p>
          <button onClick={openAdd} className="btn-outline text-sm">Ilk kokteylinizi ekleyin</button>
        </div>
      ) : (
        <div className="space-y-3">
          {cocktails.map(c => (
            <div key={c.id} className={`glass rounded-xl p-4 flex items-center gap-4 transition-opacity ${!c.is_active ? 'opacity-50' : ''}`}>
              <GripVertical size={16} className="text-white/20 cursor-grab shrink-0" />
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-white/5 shrink-0 flex items-center justify-center">
                {c.image_url ? (
                  <Image src={c.image_url} alt={c.name} width={56} height={56} className="object-cover w-full h-full" />
                ) : (
                  <span className="text-2xl">🍹</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{c.name}</div>
                {c.description && <div className="text-white/40 text-xs truncate mt-0.5">{c.description}</div>}
                {c.tags?.length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-1.5">
                    {c.tags.slice(0, 4).map(t => (
                      <span key={t} className="bg-gold/10 text-gold/80 text-xs px-2 py-0.5 rounded-full">{t}</span>
                    ))}
                    {c.tags.length > 4 && <span className="text-white/30 text-xs">+{c.tags.length - 4}</span>}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggleActive(c)} className="text-white/30 hover:text-gold transition-colors">
                  {c.is_active ? <ToggleRight size={20} className="text-gold" /> : <ToggleLeft size={20} />}
                </button>
                <button onClick={() => openEdit(c)} className="text-white/30 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5">
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDelete(c.id)} disabled={deleting === c.id}
                  className="text-white/30 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass rounded-3xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto border-gold/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl text-gold">
                {modal.editing ? 'Kokteyı Duzenle' : 'Yeni Kokteyl'}
              </h2>
              <button onClick={closeModal} className="text-white/30 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Ad *</label>
                <input className="input-field" placeholder="Negroni" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1.5">Aciklama</label>
                <textarea className="input-field resize-none" rows={2}
                  placeholder="Uc esit parca, sifir uzlasma..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1.5">Gorsel</label>

                {preview && (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden mb-3 bg-white/5">
                    <img src={preview} alt="Onizleme" className="w-full h-full object-cover" />
                    <button
                      onClick={() => { setPreview(''); setForm(f => ({ ...f, image_url: '' })) }}
                      className="absolute top-2 right-2 bg-black/60 rounded-full p-1 text-white/60 hover:text-white">
                      <X size={14} />
                    </button>
                    {uploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-white text-sm">Yukleniyor...</div>
                      </div>
                    )}
                  </div>
                )}

                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full border border-dashed border-glass-border rounded-xl p-3 text-sm text-white/40 hover:text-white/70 hover:border-gold/30 transition-all flex items-center justify-center gap-2 mb-2">
                  <Upload size={14} />
                  {uploading ? 'Yukleniyor...' : 'Bilgisayardan Yukle (max 5MB)'}
                </button>

                <input className="input-field text-xs" placeholder="veya gorsel URL si yapistirin..."
                  value={form.image_url}
                  onChange={e => {
                    setForm(f => ({ ...f, image_url: e.target.value }))
                    setPreview(e.target.value)
                  }} />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1.5">Malzemeler</label>
                <div className="space-y-2">
                  {form.ingredients.map((ing, i) => (
                    <div key={i} className="flex gap-2">
                      <input className="input-field flex-1" placeholder={`Malzeme ${i + 1}`}
                        value={ing} onChange={e => setIngredient(i, e.target.value)} />
                      {form.ingredients.length > 1 && (
                        <button onClick={() => removeIngredient(i)} className="text-white/30 hover:text-red-400 transition-colors px-2">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button onClick={addIngredient} className="text-gold/70 hover:text-gold text-sm flex items-center gap-1 transition-colors">
                    <Plus size={14} /> Malzeme ekle
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1.5">Etiketler (quiz eslestirmesi icin)</label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_TAGS.map(tag => (
                    <button key={tag} onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        form.tags.includes(tag) ? 'bg-gold text-obsidian' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70'
                      }`}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={closeModal} className="btn-outline flex-1 py-2.5 text-sm">Iptal</button>
              <button onClick={handleSave} disabled={saving || uploading} className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2">
                {saving ? 'Kaydediliyor...' : <><Check size={14} /> Kaydet</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
