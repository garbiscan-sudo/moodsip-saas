import { createClient } from '@/lib/supabase/server'
import SettingsClient from '@/components/dashboard/SettingsClient'

export default async function SettingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: bar } = await supabase
    .from('bars').select('*').eq('owner_id', user!.id).single()

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="font-serif text-3xl text-gold mb-1">Ayarlar</h1>
        <p className="text-white/40 text-sm">Bar bilgileriniz, marka renginiz ve abonelik yönetimi.</p>
      </div>
      <SettingsClient bar={bar} userEmail={user!.email!} />
    </div>
  )
}
export const dynamic = "force-dynamic"
