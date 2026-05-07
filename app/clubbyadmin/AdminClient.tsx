'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import {
  Users, CheckCircle, Clock, XCircle,
  ExternalLink, ChevronDown, ChevronUp,
  RefreshCw, ToggleLeft, ToggleRight, Calendar
} from 'lucide-react'
import type { Bar } from '@/lib/types'

interface Props {
  bars: Bar[]
  userEmails: Record<string, string>
  stats: { total: number; active: number; trial: number; expired: number }
}

export default function AdminClient({ bars: initialBars, userEmails, stats }: Props) {
  const supabase = createClient()
  const [bars, setBars] = useState(initialBars)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const filtered = bars.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    (userEmails[b.owner_id] || '').toLowerCase().includes(search.toLowerCase()) ||
    b.slug.toLowerCase().includes(search.toLowerCase())
  )

  function trialDaysLeft(bar: Bar) {
    if (!bar.trial_ends_at) return 0
    return Math.max(0, Math.ceil((new Date(bar.trial_ends_at).getTime() - Date.now()) / 86400000))
  }

  function statusBadge(bar: Bar) {
    switch (bar.subscription_status) {
      case 'active':    return <span className="badge-green text-xs px-2 py-0.5">Aktif</span>
      case 'trial':     return <span className="bg-gold/20 text-gold text-xs px-2 py-0.5 rounded-full">Deneme · {trialDaysLeft(bar)}g</span>
      case 'expired':   return <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full">Süresi Doldu</span>
      case 'cancelled': return <span className="bg-white/10 text-white/40 text-xs px-2 py-0.5 rounded-full">İptal</span>
      default:          return null
    }
  }

  async function extendTrial(barId: string, days: number) {
    setLoading(barId + '_trial')
    const bar = bars.find(b => b.id === barId)!
    const base = bar.trial_ends_at && new Date(bar.trial_ends_at) > new Date()
      ? new Date(bar.trial_ends_at)
      : new Date()
    base.setDate(base.getDate() + days)
    const { error } = await supabase.from('bars')
      .update({ trial_ends_at: base.toISOString(), subscription_status: 'trial' })
      .eq('id', barId)
    if (error) toast.error('Hata oluştu')
    else {
      setBars(prev => prev.map(b => b.id === barId
        ? { ...b, trial_ends_at: base.toISOString(), subscription_status: 'trial' }
        : b))
      toast.success(`${days} gün eklendi`)
    }
    setLoading(null)
  }

  async function toggleSubscription(bar: Bar) {
    setLoading(bar.id + '_sub')
    const newStatus = bar.subscription_status === 'active' ? 'cancelled' : 'active'
    const { error } = await supabase.from('bars')
      .update({ subscription_status: newStatus })
      .eq('id', bar.id)
    if (error) toast.error('Hata oluştu')
    else {
      setBars(prev => prev.map(b => b.id === bar.id ? { ...b, subscription_status: newStatus } : b))
      toast.success(newStatus === 'active' ? 'Abonelik aktif edildi' : 'Abonelik iptal edildi')
    }
    setLoading(null)
  }

  async function setCustomTrialDate(barId: string, dateStr: string) {
    setLoading(barId + '_date')
    const { error } = await supabase.from('bars')
      .update({ trial_ends_at: new Date(dateStr).toISOString(), subscription_status: 'trial' })
      .eq('id', barId)
    if (error) toast.error('Hata oluştu')
    else {
      setBars(prev => prev.map(b => b.id === barId
        ? { ...b, trial_ends_at: new Date(dateStr).toISOString(), subscription_status: 'trial' }
        : b))
      toast.success('Deneme tarihi güncellendi')
    }
    setLoading(null)
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Toplam Bar', value: stats.total,   icon: Users,       color: 'text-white' },
          { label: 'Aktif',      value: stats.active,  icon: CheckCircle, color: 'text-green-400' },
          { label: 'Deneme',     value: stats.trial,   icon: Clock,       color: 'text-gold' },
          { label: 'Pasif',      value: stats.expired, icon: XCircle,     color: 'text-red-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/40 text-sm">{label}</span>
              <Icon size={16} className={color} />
            </div>
            <div className={`font-serif text-3xl ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div>
        <input
          className="input-field w-full max-w-sm"
          placeholder="Bar adı, email veya slug ara..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Bar List */}
      <div className="space-y-3">
        {filtered.map(bar => (
          <div key={bar.id} className="glass rounded-2xl overflow-hidden">
            {/* Row */}
            <div
              className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/2 transition-colors"
              onClick={() => setExpanded(expanded === bar.id ? null : bar.id)}
            >
              <div className="flex items-center gap-4">
                {bar.logo_url
                  ? <img src={bar.logo_url} alt="" className="w-10 h-10 rounded-xl object-cover border border-white/10" />
                  : <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 font-serif text-lg">{bar.name[0]}</div>
                }
                <div>
                  <div className="font-medium">{bar.name}</div>
                  <div className="text-white/40 text-sm">{userEmails[bar.owner_id] || '—'} · /{bar.slug}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {statusBadge(bar)}
                <div className="text-white/30 text-xs">
                  {new Date(bar.created_at).toLocaleDateString('tr-TR')}
                </div>
                {expanded === bar.id ? <ChevronUp size={16} className="text-white/30" /> : <ChevronDown size={16} className="text-white/30" />}
              </div>
            </div>

            {/* Expanded */}
            {expanded === bar.id && (
              <div className="border-t border-white/5 p-5 space-y-5">
                {/* Info */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-white/40 mb-1">Abonelik Durumu</div>
                    <div className="capitalize">{bar.subscription_status}</div>
                  </div>
                  <div>
                    <div className="text-white/40 mb-1">Deneme Bitiş</div>
                    <div>{bar.trial_ends_at ? new Date(bar.trial_ends_at).toLocaleDateString('tr-TR') : '—'}</div>
                  </div>
                  <div>
                    <div className="text-white/40 mb-1">Renk</div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border border-white/10" style={{ background: bar.primary_color }} />
                      {bar.primary_color}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  {/* Trial extend */}
                  <div>
                    <div className="text-white/40 text-xs mb-2">Deneme Süresini Uzat</div>
                    <div className="flex gap-2 flex-wrap">
                      {[7, 14, 30].map(d => (
                        <button
                          key={d}
                          onClick={() => extendTrial(bar.id, d)}
                          disabled={loading === bar.id + '_trial'}
                          className="btn-outline text-xs px-3 py-1.5 flex items-center gap-1"
                        >
                          <RefreshCw size={12} />
                          +{d} gün
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom date */}
                  <div>
                    <div className="text-white/40 text-xs mb-2">Özel Bitiş Tarihi Belirle</div>
                    <div className="flex gap-2 items-center">
                      <input
                        type="date"
                        className="input-field text-sm py-1.5 w-44"
                        min={new Date().toISOString().split('T')[0]}
                        onChange={e => e.target.value && setCustomTrialDate(bar.id, e.target.value)}
                      />
                      <Calendar size={14} className="text-white/30" />
                    </div>
                  </div>

                  {/* Subscription toggle */}
                  <div>
                    <div className="text-white/40 text-xs mb-2">Abonelik Durumu</div>
                    <button
                      onClick={() => toggleSubscription(bar)}
                      disabled={loading === bar.id + '_sub'}
                      className={`flex items-center gap-2 text-sm px-4 py-2 rounded-xl border transition-all ${
                        bar.subscription_status === 'active'
                          ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                          : 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                      }`}
                    >
                      {bar.subscription_status === 'active'
                        ? <><ToggleRight size={16} /> Aboneliği İptal Et</>
                        : <><ToggleLeft size={16} /> Aboneliği Aktif Et</>
                      }
                    </button>
                  </div>

                  {/* Links */}
                  <div className="flex gap-3 pt-2 border-t border-white/5">
                    <a
                      href={`/bar/${bar.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-gold/70 hover:text-gold text-sm transition-colors"
                    >
                      <ExternalLink size={14} /> Quiz Sayfasını Gör
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center text-white/30 py-12">Sonuç bulunamadı</div>
        )}
      </div>
    </div>
  )
}
