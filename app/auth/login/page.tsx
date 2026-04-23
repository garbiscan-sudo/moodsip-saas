'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router   = useRouter()
  const supabase = createClient()
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword(form)
    if (error) {
      toast.error('E-posta veya şifre hatalı')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="block text-center mb-8">
          <div className="font-serif text-3xl text-gold tracking-widest">MoodSip</div>
          <div className="text-white/40 text-sm italic mt-1">Crafted for your spirit</div>
        </Link>

        <div className="glass rounded-3xl p-8">
          <h1 className="font-serif text-2xl text-center mb-8">Hoş Geldiniz</h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-1.5">E-posta</label>
              <input
                type="email" required value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
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
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Şifreniz"
                  className="input-field pr-12"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-gold w-full mt-6">
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          <p className="text-center text-white/30 text-sm mt-6">
            Hesabınız yok mu?{' '}
            <Link href="/auth/register" className="text-gold hover:text-gold-light transition-colors">
              14 gün ücretsiz başlayın
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
