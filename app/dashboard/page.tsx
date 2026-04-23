import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Wine, HelpCircle, QrCode, ArrowRight, TrendingUp } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: bar } = await supabase
    .from('bars')
    .select('*')
    .eq('owner_id', user!.id)
    .single()

  const [{ count: cocktailCount }, { count: questionCount }] = await Promise.all([
    supabase.from('cocktails').select('*', { count: 'exact', head: true }).eq('bar_id', bar?.id),
    supabase.from('quiz_questions').select('*', { count: 'exact', head: true }).eq('bar_id', bar?.id),
  ])

  const trialDaysLeft = bar?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(bar.trial_ends_at).getTime() - Date.now()) / 86400000))
    : 0
type SubscriptionStatus = 'trial' | 'active' | 'cancelled' | 'expired'
  const statusBadge = {
    trial:     { label: `Deneme — ${trialDaysLeft} gün kaldı`, cls: 'badge-gold' },
    active:    { label: 'Aktif Abonelik', cls: 'badge-green' },
    cancelled: { label: 'İptal Edildi', cls: 'badge-red' },
    expired:   { label: 'Süresi Doldu', cls: 'badge-red' },
  }[(bar?.subscription_status as SubscriptionStatus) || 'trial']

  const stats = [
    { label: 'Kokteyl', value: cocktailCount ?? 0, icon: Wine,        href: '/dashboard/cocktails' },
    { label: 'Quiz Sorusu', value: questionCount ?? 0, icon: HelpCircle, href: '/dashboard/questions' },
    { label: 'QR Kod', value: '1 adet', icon: QrCode,       href: '/dashboard/qr' },
  ]

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-4xl text-gold mb-1">{bar?.name}</h1>
          {bar?.tagline && <p className="text-white/40 italic">{bar.tagline}</p>}
        </div>
        <span className={statusBadge.cls}>{statusBadge.label}</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href}
            className="glass rounded-2xl p-6 hover:border-gold/20 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                <Icon size={18} className="text-gold" />
              </div>
              <ArrowRight size={14} className="text-white/20 group-hover:text-gold transition-colors" />
            </div>
            <div className="font-serif text-3xl text-white mb-1">{value}</div>
            <div className="text-white/40 text-sm">{label}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="glass rounded-2xl p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-gold" />
          Hızlı Başlangıç
        </h2>
        <div className="space-y-3">
          {[
            { label: 'Kokteyl ekle veya düzenle', href: '/dashboard/cocktails', done: (cocktailCount ?? 0) > 0 },
            { label: 'Quiz sorularını özelleştir', href: '/dashboard/questions', done: (questionCount ?? 0) > 0 },
            { label: 'QR kodunu indir ve masaya yapıştır', href: '/dashboard/qr', done: false },
          ].map(({ label, href, done }) => (
            <Link key={href} href={href}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group">
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs transition-colors ${
                  done ? 'bg-gold border-gold text-obsidian' : 'border-white/20 group-hover:border-gold/40'
                }`}>
                  {done ? '✓' : ''}
                </div>
                <span className={`text-sm ${done ? 'text-white/40 line-through' : 'text-white/70'}`}>
                  {label}
                </span>
              </div>
              <ArrowRight size={14} className="text-white/20 group-hover:text-gold transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      {/* Quiz URL */}
      {bar?.slug && (
        <div className="glass rounded-2xl p-6 border-gold/10">
          <div className="text-sm text-white/40 mb-2">Quiz sayfanızın adresi</div>
          <div className="flex items-center justify-between gap-4">
            <code className="text-gold text-sm font-mono">
              {process.env.NEXT_PUBLIC_APP_URL}/bar/{bar.slug}
            </code>
            <a href={`/bar/${bar.slug}`} target="_blank" rel="noopener noreferrer"
              className="btn-outline text-xs px-4 py-2">
              Görüntüle
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
