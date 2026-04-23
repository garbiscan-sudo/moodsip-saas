import { createClient } from '@/lib/supabase/server'
import CocktailManager from '@/components/dashboard/CocktailManager'

export default async function CocktailsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: bar } = await supabase
    .from('bars')
    .select('id')
    .eq('owner_id', user!.id)
    .single()

  const { data: cocktails } = await supabase
    .from('cocktails')
    .select('*')
    .eq('bar_id', bar!.id)
    .order('display_order')

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="font-serif text-3xl text-gold mb-1">Kokteyller</h1>
        <p className="text-white/40 text-sm">Quiz sonucunda önerilecek içkileri yönetin.</p>
      </div>
      <CocktailManager barId={bar!.id} initialCocktails={cocktails || []} />
    </div>
  )
}
