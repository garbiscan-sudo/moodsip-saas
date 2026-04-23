'use client'
import Link from 'next/link'
import { useState } from 'react'
import {
  QrCode, LayoutDashboard, Sparkles, ChevronRight,
  Check, Star, Zap, Shield, RefreshCw
} from 'lucide-react'

const PRICE_MONTHLY = process.env.NEXT_PUBLIC_PRICE_MONTHLY || '299'
const PRICE_YEARLY  = process.env.NEXT_PUBLIC_PRICE_YEARLY  || '2490'

const features = [
  { icon: QrCode,          title: 'QR Kod Menü',          desc: 'Masaya QR yapıştır, müşteri okusun. Saniyeler içinde deneyim başlar.' },
  { icon: Sparkles,        title: 'Mood Quiz',             desc: 'Müşteriye 5 soru sor, ruh haline göre en iyi kokteylli öner.' },
  { icon: LayoutDashboard, title: 'Canlı Panel',           desc: 'Kokteyllerini, sorularını ve görsellerini istediğin zaman güncelle.' },
  { icon: RefreshCw,       title: 'Anlık Güncelleme',      desc: 'Panelden yaptığın değişiklik QR kod sayfasına anında yansır.' },
  { icon: Zap,             title: 'Sıfır Teknik Bilgi',    desc: 'Kod yazmak yok. Sürükle-bırak ile tüm içeriğini yönet.' },
  { icon: Shield,          title: 'Markan, Renklerin',     desc: 'Logo, renk paleti ve metin tonun. Tamamen senin kimliğin.' },
]

const testimonials = [
  { quote: 'Müşterilerimiz QR kodu görünce ne olduğunu merak edip deniyor. Ortalama sipariş değeri %23 arttı.', name: 'Emre T.', bar: 'Sakura Lounge, İstanbul' },
  { quote: 'Menü değiştirmek için baskıcıya gitmeye son verdik. Her şeyi panelden birkaç dakikada hallediyoruz.', name: 'Leyla K.', bar: 'The Velvet Bar, İzmir' },
  { quote: 'Misafirlerimiz quizi bir oyun gibi oynuyor. Masada geçirdikleri süre belirgin şekilde uzadı.', name: 'Mehmet A.', bar: 'Copper Mug, Ankara' },
]

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly')

  return (
    <div className="min-h-screen bg-obsidian bg-radial-gold">

      {/* ── NAV ─────────────────────────────── */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="font-serif text-2xl text-gold tracking-widest">MoodSip</div>
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="text-white/60 hover:text-white text-sm transition-colors">
            Giriş Yap
          </Link>
          <Link href="/auth/register" className="btn-gold text-sm px-6 py-2.5">
            Ücretsiz Dene
          </Link>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────── */}
      <section className="text-center px-6 pt-16 pb-24 max-w-5xl mx-auto">
        <div className="badge-gold mb-6 mx-auto w-fit">
          <Sparkles size={12} />
          14 gün ücretsiz deneme — kredi kartı gerekmez
        </div>

        <h1 className="font-serif text-5xl md:text-7xl font-normal mb-6 leading-tight">
          Müşterinize{' '}
          <span className="text-gradient-gold italic">ruh haline göre</span>
          <br />kokteyl öner
        </h1>

        <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          QR kod ile erişilen interaktif bir mood quiz. Müşteri soruları yanıtlar,
          sistem en uygun kokteylinizi önerir. Menünüzü panelden istediğiniz an güncelleyin.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/register" className="btn-gold text-base">
            Hemen Başla <ChevronRight size={18} className="inline -mt-0.5" />
          </Link>
          <Link href="#how-it-works" className="btn-outline text-base">
            Nasıl Çalışır?
          </Link>
        </div>

        {/* Mini preview */}
        <div className="mt-16 glass rounded-3xl p-6 max-w-3xl mx-auto border-gold/10">
          <div className="text-white/30 text-xs uppercase tracking-widest mb-4">Müşteri deneyimi önizlemesi</div>
          <div className="bg-obsidian-800 rounded-2xl p-8 text-center">
            <div className="text-3xl mb-3">🌙</div>
            <h3 className="font-serif text-2xl mb-6">Bu gece nasıl hissediyorsunuz?</h3>
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
              {['Kutlamaya hazırım ✨', 'Sessiz bir kaçış 🌊', 'Maceraya açığım 🌋', 'Özel bir an 💫'].map(opt => (
                <button key={opt} className="glass rounded-xl p-3 text-sm text-white/80 hover:border-gold/40 hover:text-white transition-all">
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────── */}
      <section className="px-6 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="section-title mb-4">Her şey dahil</h2>
          <p className="text-white/50 max-w-xl mx-auto">
            Teknik karmaşa yok. Açtığınız günden itibaren çalışır.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass rounded-2xl p-6 hover:border-gold/20 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center mb-4 group-hover:bg-gold/15 transition-colors">
                <Icon size={20} className="text-gold" />
              </div>
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────── */}
      <section id="how-it-works" className="px-6 py-24 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="section-title mb-4">3 adımda canlıya alın</h2>
        </div>

        <div className="space-y-8">
          {[
            { n: '01', title: 'Üye ol ve paneli aç', desc: '14 günlük ücretsiz denemeni başlat. Kredi kartı gerekmez. Bar bilgilerini gir, hazırsın.' },
            { n: '02', title: 'Kokteyllerini ve soruları ekle', desc: 'Panelden kokteyllerini, malzemeleri, görselleri ve mood quiz sorularını ekle. Sürükle bırak ile sırala.' },
            { n: '03', title: 'QR kodu indir ve yapıştır', desc: 'Otomatik oluşturulan QR kodu masalara yapıştır. Müşteriler okuttuğunda doğrudan senin quiz sayfana gider.' },
          ].map(({ n, title, desc }) => (
            <div key={n} className="flex gap-6 items-start glass rounded-2xl p-6">
              <div className="font-serif text-4xl text-gold/30 font-bold min-w-[56px]">{n}</div>
              <div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-white/50">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ─────────────────────────── */}
      <section id="pricing" className="px-6 py-24 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="section-title mb-4">Şeffaf fiyatlandırma</h2>
          <p className="text-white/50 mb-8">Gizli ücret yok. İstediğiniz zaman iptal.</p>

          {/* Toggle */}
          <div className="inline-flex glass rounded-full p-1 gap-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === 'monthly' ? 'bg-gold text-obsidian' : 'text-white/60 hover:text-white'
              }`}
            >
              Aylık
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                billingCycle === 'yearly' ? 'bg-gold text-obsidian' : 'text-white/60 hover:text-white'
              }`}
            >
              Yıllık
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                billingCycle === 'yearly' ? 'bg-obsidian/20' : 'bg-gold/20 text-gold'
              }`}>
                %30 tasarruf
              </span>
            </button>
          </div>
        </div>

        <div className="glass rounded-3xl p-8 border-gold/20 text-center max-w-md mx-auto">
          <div className="badge-gold mb-4 mx-auto w-fit">En popüler</div>
          <div className="font-serif text-6xl text-gold mb-2">
            ₺{billingCycle === 'monthly' ? PRICE_MONTHLY : PRICE_YEARLY}
          </div>
          <div className="text-white/40 text-sm mb-8">
            {billingCycle === 'monthly' ? 'aylık · KDV dahil' : 'yıllık · KDV dahil · aylık ₺207,5'}
          </div>

          <div className="space-y-3 text-left mb-8">
            {[
              'Sınırsız kokteyl ekle',
              'Sınırsız soru & seçenek',
              'Özel QR kod oluşturucu',
              'Marka rengi & logo',
              'Gerçek zamanlı güncelleme',
              'Türkçe destek',
              '14 gün ücretsiz deneme',
            ].map(f => (
              <div key={f} className="flex items-center gap-3 text-sm">
                <Check size={16} className="text-gold shrink-0" />
                <span className="text-white/80">{f}</span>
              </div>
            ))}
          </div>

          <Link href="/auth/register" className="btn-gold w-full block text-center">
            14 Gün Ücretsiz Başla
          </Link>
          <p className="text-white/30 text-xs mt-3">Kredi kartı gerekmez deneme sürecinde</p>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────── */}
      <section className="px-6 py-24 max-w-6xl mx-auto">
        <h2 className="section-title text-center mb-16">Bar sahipleri ne diyor?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(({ quote, name, bar }) => (
            <div key={name} className="glass rounded-2xl p-6">
              <div className="flex gap-0.5 mb-4">
                {Array(5).fill(0).map((_, i) => <Star key={i} size={14} className="text-gold fill-gold" />)}
              </div>
              <p className="text-white/70 text-sm leading-relaxed mb-4 italic">"{quote}"</p>
              <div>
                <div className="font-semibold text-sm">{name}</div>
                <div className="text-white/40 text-xs">{bar}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────── */}
      <section className="px-6 py-24 text-center">
        <div className="glass rounded-3xl p-12 max-w-2xl mx-auto border-gold/20">
          <h2 className="font-serif text-4xl mb-4">Barınızı dönüştürmeye hazır mısınız?</h2>
          <p className="text-white/50 mb-8">14 gün boyunca ücretsiz deneyin. Beğenmezseniz tek tık iptal.</p>
          <Link href="/auth/register" className="btn-gold">
            Hemen Üye Ol — Ücretsiz Başla
          </Link>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────── */}
      <footer className="border-t border-white/5 px-6 py-8 text-center">
        <div className="font-serif text-gold text-xl tracking-widest mb-2">MoodSip</div>
        <p className="text-white/30 text-sm italic">Crafted for your spirit</p>
      </footer>
    </div>
  )
}
