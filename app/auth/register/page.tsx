'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Eye, EyeOff, ChevronRight } from 'lucide-react'

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s')
    .replace(/ı/g,'i').replace(/ö/g,'o').replace(/ç/g,'c')
    .replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-')
}

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const [form, setForm] = useState({
    email:    '',
    password: '',
    barName:  '',
    tagline:  '',
    slug:     '',
  })

  const set = (k: string, v: string) => {
    setForm(f => ({
      ...f,
      [k]: v,
      ...(k === 'barName' ? { slug: slugify(v) } : {}),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (step === 1) { setStep(2); return }

    setLoading(true)
    try {
      // 1. Auth kaydı
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email:    form.email,
        password: form.password,
        options:  { emailRedirectTo: `${window.location.origin}/dashboard` },
      })
      if (authErr) throw authErr

      const userId = authData.user?.id
      if (!userId) throw new Error('Kullanıcı oluşturulamadı')

      // 2. Bar oluştur
      const { data: bar, error: barErr } = await supabase
        .from('bars')
        .insert({
          owner_id: userId,
          name:     form.barName,
          slug:     form.slug,
          tagline:  form.tagline || null,
        })
        .select('id')
        .single()

      if (barErr) {
        if (barErr.code === '23505') throw new Error('Bu URL zaten alınmış. Farklı bir isim deneyin.')
        throw barErr
      }

      // 3. Varsayılan içerik oluştur
      await supabase.rpc('create_default_bar_content', { p_bar_id: bar.id })

      toast.success('Hoş geldiniz! Paneliniz hazırlanıyor...')
      router.push('/dashboard')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="block text-center mb-8">
          <div className="font-serif text-3xl text-gold tracking-widest">MoodSip</div>
          <div className="text-white/40 text-sm italic mt-1">Crafted for your spirit</div>
        </Link>

        <div className="glass rounded-3xl p-8">
          {/* Steps */}
          <div className="flex items-center gap-3 mb-8">
            {[1, 2].map(s => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  step >= s ? 'bg-gold text-obsidian' : 'bg-white/10 text-white/40'
                }`}>{s}</div>
                <span className={`text-xs transition-colors ${step >= s ? 'text-white/70' : 'text-white/30'}`}>
                  {s === 1 ? 'Hesap Bilgileri' : 'Bar Bilgileri'}
                </span>
                {s < 2 && <div className={`flex-1 h-px ${step > s ? 'bg-gold/40' : 'bg-white/10'}`} />}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 ? (
              <>
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">E-posta</label>
                  <input
                    type="email" required value={form.email}
                    onChange={e => set('email', e.target.value)}
                    placeholder="bar@ornek.com"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Şifre</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'} required
                      value={form.password}
                      onChange={e => set('password', e.target.value)}
                      placeholder="En az 8 karakter"
                      minLength={8}
                      className="input-field pr-12"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Bar Adı</label>
                  <input
                    type="text" required value={form.barName}
                    onChange={e => set('barName', e.target.value)}
                    placeholder="The Velvet Room"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Kısa Slogan (opsiyonel)</label>
                  <input
                    type="text" value={form.tagline}
                    onChange={e => set('tagline', e.target.value)}
                    placeholder="Crafted for your spirit"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">URL (değiştirilebilir)</label>
                  <div className="flex items-center gap-0 glass rounded-xl overflow-hidden border border-glass-border focus-within:border-gold/50 transition-colors">
                    <span className="px-3 py-3 text-white/30 text-sm bg-white/5 border-r border-glass-border shrink-0">
                      moodsip.com/bar/
                    </span>
                    <input
                      type="text" required value={form.slug}
                      onChange={e => set('slug', e.target.value)}
                      placeholder="the-velvet-room"
                      pattern="[a-z0-9\-]+"
                      className="flex-1 bg-transparent px-3 py-3 text-white text-sm focus:outline-none"
                    />
                  </div>
                  <p className="text-white/30 text-xs mt-1">
                    QR kodunuz bu adrese yönlendirir
                  </p>
                </div>
              </>
            )}

            <button type="submit" disabled={loading} className="btn-gold w-full mt-6">
              {loading ? 'Hazırlanıyor...' : step === 1 ? (
                <span className="flex items-center justify-center gap-2">
                  Devam Et <ChevronRight size={16} />
                </span>
              ) : '14 Gün Ücretsiz Başla'}
            </button>
          </form>

          <p className="text-center text-white/30 text-sm mt-6">
            Zaten hesabınız var mı?{' '}
            <Link href="/auth/login" className="text-gold hover:text-gold-light transition-colors">
              Giriş Yapın
            </Link>
          </p>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          Kayıt olarak{' '}
          <span className="underline cursor-pointer hover:text-white/40 transition-colors">Kullanım Koşulları</span>
          'nı kabul etmiş olursunuz.
        </p>
      </div>
    </div>
  )
}
