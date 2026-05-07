import type { Metadata } from 'next'
import Link from 'next/link'
import {
  QrCode, LayoutDashboard, Sparkles, ChevronRight,
  Check, Star, Zap, Shield, RefreshCw, HelpCircle
} from 'lucide-react'

import HeroHeading from '@/components/landing/HeroHeading'

export const metadata: Metadata = {
  title: 'MoodSip — İşletmeniz İçin Akıllı Menü Öneri Sistemi',
  description:
    'Müşterilerinize ruh haline göre ürün önerin. Bar, kafe ve restoranlar için QR kod tabanlı interaktif mood quiz sistemi. 14 gün ücretsiz deneyin.',
  alternates: { canonical: 'https://www.moodsip.com.tr' },
}

const PRICE_YEARLY = '25.000'

const features = [
  { icon: QrCode,          title: 'QR Kod Menü',          desc: 'Masaya QR yapıştır, müşteri okusun. Saniyeler içinde deneyim başlar.' },
  { icon: Sparkles,        title: 'Mood Quiz',             desc: 'Müşteriye birkaç soru sor, ruh haline göre en uygun ürünü öner.' },
  { icon: LayoutDashboard, title: 'Canlı Panel',           desc: 'Menüdeki ürünlerini, sorularını ve görsellerini istediğin zaman güncelle.' },
  { icon: RefreshCw,       title: 'Anlık Güncelleme',      desc: 'Panelden yaptığın değişiklik QR kod sayfasına anında yansır.' },
  { icon: Zap,             title: 'Sıfır Teknik Bilgi',    desc: 'Kod yazmak yok. Sürükle-bırak ile tüm içeriğini yönet.' },
  { icon: Shield,          title: 'Markan, Renklerin',     desc: 'Logo, renk paleti ve metin tonun. Tamamen senin kimliğin.' },
]

const testimonials = [
  { quote: 'Müşterilerimiz QR kodu görünce ne olduğunu merak edip deniyor. Ortalama sipariş değeri %23 arttı.', name: 'Emre T.', bar: 'Sakura Lounge, İstanbul' },
  { quote: 'Menü değiştirmek için baskıcıya gitmeye son verdik. Her şeyi panelden birkaç dakikada hallediyoruz.', name: 'Leyla K.', bar: 'The Velvet Bar, İzmir' },
  { quote: 'Misafirlerimiz quizi bir oyun gibi oynuyor. Masada geçirdikleri süre belirgin şekilde uzadı.', name: 'Mehmet A.', bar: 'Copper Mug, Ankara' },
]

const faqs = [
  {
    q: 'MoodSip nedir ve nasıl çalışır?',
    a: 'MoodSip, bar, kafe, restoran ve kafeterya gibi işletmelere özel bir menü öneri sistemidir. Müşteriler masadaki QR kodu okutarak kısa bir mood quizine katılır. Verdikleri yanıtlara göre sistem, onlara en uygun ürünü önerir. Tüm içerik (ürünler, sorular, görseller) işletmenin kendi panelinden yönetilir.',
  },
  {
    q: 'Teknik bilgim yok, kurabilir miyim?',
    a: 'Evet, kesinlikle. MoodSip kod gerektirmez. Üye olduktan sonra ürünlerinizi ekleyin, sorularınızı girin ve QR kodunuzu indirin. Masaya yapıştırın — sistem hazır. Ortalama kurulum süresi 30 dakikadır.',
  },
  {
    q: 'Kaç ürün ve soru ekleyebilirim?',
    a: 'Sınır yoktur. İstediğiniz kadar ürün ve quiz sorusu ekleyebilirsiniz. Görseller, içerik listeleri ve etiketler dahil tüm içeriği panelinden yönetirsiniz.',
  },
  {
    q: 'Müşteri verilerim güvende mi?',
    a: 'MoodSip, quiz sürecinde hiçbir kişisel müşteri verisi toplamaz. Sistem anonim çalışır; müşteriler yalnızca sorulara yanıt verir ve ürün önerisi alır.',
  },
  {
    q: 'Birden fazla şube için kullanabilir miyim?',
    a: 'Her şube için ayrı bir MoodSip hesabı açılabilir. Her hesabın kendine özel QR kodu, paneli ve ürün listesi bulunur.',
  },
  {
    q: '14 günlük deneme bitince ne olur?',
    a: 'Deneme süresi sonunda yıllık abonelik planına geçmeniz gerekir. Abonelik başlatılmazsa quiz sayfası pasif olur ancak verileriniz silinmez.',
  },
]

export default function LandingPage() {
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

        <HeroHeading />

        <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Bar, kafe, restoran ve kafeterya işletmeleri için QR kod tabanlı interaktif menü öneri sistemi.
          Müşteri soruları yanıtlar, sistem en uygun ürünü önerir.
          Menünüzü panelden istediğiniz an güncelleyin.
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
                <div key={opt} className="glass rounded-xl p-3 text-sm text-white/80">
                  {opt}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────── */}
      <section className="px-6 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="section-title mb-4">İşletmenizi dönüştüren her şey</h2>
          <p className="text-white/50 max-w-xl mx-auto">
            Teknik karmaşa yok. Kurulum gerektirmez. Açtığınız günden itibaren çalışır.
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
          <p className="text-white/50">Kurulum yok. Teknik bilgi gerekmez.</p>
        </div>

        <div className="space-y-8">
          {[
            { n: '01', title: 'Üye ol ve paneli aç', desc: '14 günlük ücretsiz denemeni başlat. Kredi kartı gerekmez. İşletme bilgilerini gir, hazırsın.' },
            { n: '02', title: 'Ürünlerini ve soruları ekle', desc: 'Panelden ürünlerini, malzemeleri, görselleri ve mood quiz sorularını ekle. Sürükle bırak ile sırala.' },
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
        </div>

        <div className="glass rounded-3xl p-8 border-gold/20 text-center max-w-md mx-auto">
          <div className="badge-gold mb-4 mx-auto w-fit">Yıllık Plan</div>
          <div className="font-serif text-6xl text-gold mb-2">
            ₺{PRICE_YEARLY}
          </div>
          <div className="text-white/40 text-sm mb-8">
            yıllık · KDV dahil
          </div>

          <div className="space-y-3 text-left mb-8">
            {[
              'Sınırsız ürün & menü ekle',
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
        <h2 className="section-title text-center mb-16">İşletme sahipleri ne diyor?</h2>
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

      {/* ── FAQ ─────────────────────────────── */}
      <section id="faq" className="px-6 py-24 max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="section-title mb-4">Sıkça sorulan sorular</h2>
          <p className="text-white/50">Aklınızdaki soruların cevapları burada.</p>
        </div>

        <div className="space-y-4">
          {faqs.map(({ q, a }) => (
            <div key={q} className="glass rounded-2xl p-6">
              <div className="flex gap-3 items-start mb-3">
                <HelpCircle size={18} className="text-gold shrink-0 mt-0.5" />
                <h3 className="font-semibold text-white">{q}</h3>
              </div>
              <p className="text-white/50 text-sm leading-relaxed pl-7">{a}</p>
            </div>
          ))}
        </div>

        {/* FAQ Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faqs.map(({ q, a }) => ({
                '@type': 'Question',
                name: q,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: a,
                },
              })),
            }),
          }}
        />
      </section>

      {/* ── CTA ─────────────────────────────── */}
      <section className="px-6 py-24 text-center">
        <div className="glass rounded-3xl p-12 max-w-2xl mx-auto border-gold/20">
          <h2 className="font-serif text-4xl mb-4">İşletmenizi dönüştürmeye hazır mısınız?</h2>
          <p className="text-white/50 mb-8">14 gün boyunca ücretsiz deneyin. Beğenmezseniz tek tık iptal.</p>
          <Link href="/auth/register" className="btn-gold">
            Hemen Üye Ol — Ücretsiz Başla
          </Link>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────── */}
      <footer className="border-t border-white/5 px-6 py-8 text-center">
        <div className="font-serif text-gold text-xl tracking-widest mb-2">MoodSip</div>
        <p className="text-white/30 text-sm italic mb-4">İşletmeniz için akıllı menü öneri sistemi</p>
        <div className="flex justify-center gap-6 text-white/20 text-xs">
          <Link href="/auth/login" className="hover:text-white/50 transition-colors">Giriş Yap</Link>
          <Link href="/auth/register" className="hover:text-white/50 transition-colors">Kayıt Ol</Link>
          <Link href="#faq" className="hover:text-white/50 transition-colors">SSS</Link>
          <Link href="#pricing" className="hover:text-white/50 transition-colors">Fiyatlar</Link>
        </div>
      </footer>
    </div>
  )
}
