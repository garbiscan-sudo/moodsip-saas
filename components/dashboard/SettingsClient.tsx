'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Check, CreditCard, Lock, Shield } from 'lucide-react'
import type { Bar } from '@/lib/types'

const PRICE_MONTHLY = process.env.NEXT_PUBLIC_PRICE_MONTHLY || '299'
const PRICE_YEARLY  = process.env.NEXT_PUBLIC_PRICE_YEARLY  || '2490'

export default function SettingsClient({ bar, userEmail }: { bar: Bar; userEmail: string }) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [plan, setPlan]     = useState<'monthly' | 'yearly'>('yearly')
  const [payStep, setPayStep] = useState(false)
  const [payLoading, setPayLoading] = useState(false)

  const [branding, setBranding] = useState({
    name:          bar.name,
    tagline:       bar.tagline || '',
    primary_color: bar.primary_color,
  })

  const [payment, setPayment] = useState({
    cardHolder: '', cardNumber: '', expMonth: '', expYear: '', cvc: '',
    buyerName: '', buyerSurname: '', buyerPhone: '',
  })

  async function saveBranding(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('bars').update({
      name:          branding.name,
      tagline:       branding.tagline || null,
      primary_color: branding.primary_color,
    }).eq('id', bar.id)
    if (error) toast.error('Kaydedilemedi')
    else toast.success('Ayarlar kaydedildi')
    setSaving(false)
  }

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault()
    setPayLoading(true)
    try {
      const res = await fetch('/api/iyzico/pay', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          barId:          bar.id,
          plan,
          buyerEmail:     userEmail,
          buyerName:      payment.buyerName,
          buyerSurname:   payment.buyerSurname,
          buyerPhone:     payment.buyerPhone,
          cardHolderName: payment.cardHolder,
          cardNumber:     payment.cardNumber.replace(/\s/g, ''),
          expireMonth:    payment.expMonth,
          expireYear:     payment.expYear,
          cvc:            payment.cvc,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Ödeme başarılı! Aboneliğiniz aktif edildi.')
        setPayStep(false)
        window.location.reload()
      } else {
        toast.error(data.error || 'Ödeme başarısız')
      }
    } catch {
      toast.error('Bir hata oluştu')
    } finally {
      setPayLoading(false)
    }
  }

  function formatCard(v: string) {
    return v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim()
  }

  const isActive = bar.subscription_status === 'active'
  const trialLeft = bar.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(bar.trial_ends_at).getTime() - Date.now()) / 86400000))
    : 0

  return (
    <div className="space-y-6" id="billing">

      {/* ── BRANDING ────────────────────── */}
      <section className="glass rounded-2xl p-6">
        <h2 className="font-semibold mb-5">Bar Bilgileri & Marka</h2>
        <form onSubmit={saveBranding} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/60 mb-1.5">Bar Adı</label>
              <input className="input-field" value={branding.name}
                onChange={e => setBranding(b => ({ ...b, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1.5">Slogan</label>
              <input className="input-field" placeholder="Crafted for your spirit"
                value={branding.tagline}
                onChange={e => setBranding(b => ({ ...b, tagline: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Marka Rengi</label>
            <div className="flex items-center gap-3">
              <input type="color" value={branding.primary_color}
                onChange={e => setBranding(b => ({ ...b, primary_color: e.target.value }))}
                className="w-12 h-12 rounded-xl bg-transparent cursor-pointer border border-glass-border" />
              <input className="input-field flex-1 font-mono" value={branding.primary_color}
                onChange={e => setBranding(b => ({ ...b, primary_color: e.target.value }))} />
              <div className="w-12 h-12 rounded-xl border border-glass-border"
                style={{ background: branding.primary_color }} />
            </div>
            <p className="text-white/30 text-xs mt-1">Bu renk quiz sayfasındaki buton ve vurgularda kullanılır.</p>
          </div>

          <div className="pt-2">
            <button type="submit" disabled={saving} className="btn-gold px-6 py-2.5 text-sm">
              {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
          </div>
        </form>
      </section>

      {/* ── SUBSCRIPTION ────────────────── */}
      <section className="glass rounded-2xl p-6">
        <h2 className="font-semibold mb-5">Abonelik</h2>

        {isActive ? (
          <div className="flex items-center gap-3">
            <div className="badge-green"><Check size={12} /> Aktif Abonelik</div>
            <span className="text-white/40 text-sm capitalize">{bar.subscription_plan} plan</span>
            {bar.current_period_end && (
              <span className="text-white/30 text-sm">
                · {new Date(bar.current_period_end).toLocaleDateString('tr-TR')} tarihine kadar
              </span>
            )}
          </div>
        ) : (
          <>
            {/* Trial status */}
            {bar.subscription_status === 'trial' && (
              <div className="glass rounded-xl p-4 border-gold/20 mb-5">
                <div className="text-gold font-medium mb-1">
                  {trialLeft > 0 ? `Deneme süreniz: ${trialLeft} gün kaldı` : 'Deneme süreniz doldu'}
                </div>
                <div className="text-white/40 text-sm">
                  Abonelik satın alarak quiz sayfanızın aktif kalmasını sağlayın.
                </div>
              </div>
            )}

            {!payStep ? (
              <>
                {/* Plan selector */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                  {(['monthly', 'yearly'] as const).map(p => (
                    <button key={p} onClick={() => setPlan(p)}
                      className={`glass rounded-xl p-4 text-left transition-all border ${
                        plan === p ? 'border-gold bg-gold/5' : 'border-glass-border hover:border-white/20'
                      }`}>
                      <div className="font-semibold mb-1">
                        {p === 'monthly' ? 'Aylık' : 'Yıllık'}
                      </div>
                      <div className="font-serif text-2xl text-gold">
                        ₺{p === 'monthly' ? PRICE_MONTHLY : PRICE_YEARLY}
                      </div>
                      <div className="text-white/40 text-xs mt-1">
                        {p === 'monthly' ? 'KDV dahil / ay' : 'KDV dahil / yıl · %30 tasarruf'}
                      </div>
                    </button>
                  ))}
                </div>
                <button onClick={() => setPayStep(true)} className="btn-gold flex items-center gap-2">
                  <CreditCard size={16} />
                  Aboneliği Başlat
                </button>
              </>
            ) : (
              /* Payment form */
              <form onSubmit={handlePayment} className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-white/40 mb-2">
                  <Lock size={14} className="text-gold" />
                  256-bit SSL şifreleme · İyzico güvencesi
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-white/60 mb-1.5">Ad</label>
                    <input required className="input-field" placeholder="Ahmet"
                      value={payment.buyerName}
                      onChange={e => setPayment(p => ({ ...p, buyerName: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-1.5">Soyad</label>
                    <input required className="input-field" placeholder="Yılmaz"
                      value={payment.buyerSurname}
                      onChange={e => setPayment(p => ({ ...p, buyerSurname: e.target.value }))} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Telefon</label>
                  <input required className="input-field" placeholder="+90 555 000 00 00"
                    value={payment.buyerPhone}
                    onChange={e => setPayment(p => ({ ...p, buyerPhone: e.target.value }))} />
                </div>

                <div className="border-t border-white/5 pt-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-1.5">Kart Üzerindeki İsim</label>
                    <input required className="input-field" placeholder="AHMET YILMAZ"
                      value={payment.cardHolder}
                      onChange={e => setPayment(p => ({ ...p, cardHolder: e.target.value.toUpperCase() }))} />
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm text-white/60 mb-1.5">Kart Numarası</label>
                    <input required className="input-field font-mono tracking-widest" placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      value={payment.cardNumber}
                      onChange={e => setPayment(p => ({ ...p, cardNumber: formatCard(e.target.value) }))} />
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <div>
                      <label className="block text-sm text-white/60 mb-1.5">Ay</label>
                      <input required className="input-field" placeholder="MM" maxLength={2}
                        value={payment.expMonth}
                        onChange={e => setPayment(p => ({ ...p, expMonth: e.target.value.replace(/\D/g,'') }))} />
                    </div>
                    <div>
                      <label className="block text-sm text-white/60 mb-1.5">Yıl</label>
                      <input required className="input-field" placeholder="YY" maxLength={2}
                        value={payment.expYear}
                        onChange={e => setPayment(p => ({ ...p, expYear: e.target.value.replace(/\D/g,'') }))} />
                    </div>
                    <div>
                      <label className="block text-sm text-white/60 mb-1.5">CVV</label>
                      <input required className="input-field" placeholder="000" maxLength={4}
                        value={payment.cvc}
                        onChange={e => setPayment(p => ({ ...p, cvc: e.target.value.replace(/\D/g,'') }))} />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setPayStep(false)} className="btn-outline flex-1 py-2.5 text-sm">
                    Geri
                  </button>
                  <button type="submit" disabled={payLoading} className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2">
                    <Shield size={14} />
                    {payLoading ? 'İşleniyor...' : `₺${plan === 'monthly' ? PRICE_MONTHLY : PRICE_YEARLY} Öde`}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </section>

      {/* ── ACCOUNT ─────────────────────── */}
      <section className="glass rounded-2xl p-6">
        <h2 className="font-semibold mb-4">Hesap</h2>
        <div className="text-sm text-white/40">
          <span className="text-white/60">E-posta: </span>{userEmail}
        </div>
      </section>
    </div>
  )
}
// updated
