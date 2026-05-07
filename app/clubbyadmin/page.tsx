import { createClient } from '@/lib/supabase/server'
import AdminClient from './AdminClient'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = createClient()

  const { data: bars } = await supabase
    .from('bars')
    .select('*')
    .order('created_at', { ascending: false })

  // Her bar için kullanıcı email'ini auth.users'dan çekelim
  const { data: users } = await supabase
    .from('bars')
    .select('owner_id, name')

  const ownerIds = Array.from(new Set((bars || []).map(b => b.owner_id)))

  // Kullanıcı emaillerini çek
  const userEmails: Record<string, string> = {}
  for (const id of ownerIds) {
    const { data } = await supabase.auth.admin.getUserById(id)
    if (data?.user?.email) userEmails[id] = data.user.email
  }

  const stats = {
    total:  bars?.length || 0,
    active: bars?.filter(b => b.subscription_status === 'active').length || 0,
    trial:  bars?.filter(b => b.subscription_status === 'trial').length || 0,
    expired: bars?.filter(b => b.subscription_status === 'expired' || b.subscription_status === 'cancelled').length || 0,
  }

  return <AdminClient bars={bars || []} userEmails={userEmails} stats={stats} />
}
