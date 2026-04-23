import { createClient } from '@/lib/supabase/server'
import QRCodeGenerator from '@/components/dashboard/QRCodeGenerator'

export default async function QRPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: bar } = await supabase
    .from('bars').select('slug, name').eq('owner_id', user!.id).single()

  const quizUrl = `${process.env.NEXT_PUBLIC_APP_URL}/bar/${bar?.slug}`

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="font-serif text-3xl text-gold mb-1">QR Kod</h1>
        <p className="text-white/40 text-sm">
          Masalara yapıştırın. Müşteri okutunca doğrudan quiz sayfanıza gider.
        </p>
      </div>
      <QRCodeGenerator quizUrl={quizUrl} barName={bar?.name || ''} />
    </div>
  )
}
