import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ExternalLink, LogOut } from 'lucide-react'
import DashboardSidebarClient from '@/components/dashboard/SidebarClient'

const navItems = [
  { href: '/dashboard',           label: 'Genel Bakış',   icon: 'LayoutDashboard' },
  { href: '/dashboard/cocktails', label: 'Kokteyller',    icon: 'Wine' },
  { href: '/dashboard/questions', label: 'Quiz Soruları', icon: 'HelpCircle' },
  { href: '/dashboard/qr',        label: 'QR Kod',        icon: 'QrCode' },
  { href: '/dashboard/settings',  label: 'Ayarlar',       icon: 'Settings' },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: bar } = await supabase
    .from('bars')
    .select('name, slug, subscription_status, trial_ends_at')
    .eq('owner_id', user.id)
    .single()

  const trialDaysLeft = bar?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(bar.trial_ends_at).getTime() - Date.now()) / 86400000))
    : 0

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r border-white/5 flex flex-col p-4 fixed h-full bg-obsidian z-40">
        <div className="px-2 py-4 mb-6">
          <div className="font-serif text-2xl text-gold tracking-widest">MoodSip</div>
          <div className="text-white/30 text-xs mt-0.5 truncate">{bar?.name}</div>
        </div>

        {bar?.subscription_status === 'trial' && trialDaysLeft > 0 && (
          <div className="glass rounded-xl p-3 mb-4 border-gold/20">
            <div className="text-gold text-xs font-semibold mb-1">
              Deneme: {trialDaysLeft} gün kaldı
            </div>
            <Link href="/dashboard/settings#billing" className="text-white/50 text-xs hover:text-gold transition-colors">
              Abone ol →
            </Link>
          </div>
        )}

        <nav className="flex-1 space-y-1">
          {navItems.map(({ href, label, icon }) => (
            <DashboardSidebarClient key={href} href={href} label={label} icon={icon} />
          ))}
        </nav>

        <div className="space-y-1 border-t border-white/5 pt-4">
          {bar?.slug && (
            <a href={`/bar/${bar.slug}`} target="_blank" rel="noopener noreferrer"
              className="sidebar-link text-gold/70 hover:text-gold">
              <ExternalLink size={16} />
              Quizi Görüntüle
            </a>
          )}
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="sidebar-link w-full text-left">
              <LogOut size={16} />
              Çıkış Yap
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 ml-64 min-h-screen">
        <div className="max-w-5xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  )
}