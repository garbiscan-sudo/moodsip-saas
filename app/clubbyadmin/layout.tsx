import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const ADMIN_EMAIL = 'clubbymedia@gmail.com'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?next=/clubbyadmin')
  if (user.email !== ADMIN_EMAIL) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-obsidian">
      <header className="border-b border-white/10 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-serif text-xl text-gold">MoodSip</span>
          <span className="text-white/20">·</span>
          <span className="text-white/40 text-sm">Admin Panel</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/30 text-sm">{user.email}</span>
          <form action="/api/auth/logout" method="POST">
            <button className="text-white/40 hover:text-white text-sm transition-colors">
              Çıkış
            </button>
          </form>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-8">
        {children}
      </main>
    </div>
  )
}
