import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <div className="font-serif text-8xl text-gold/20 mb-4">404</div>
      <h1 className="font-serif text-3xl text-gold mb-3">Bar bulunamadı</h1>
      <p className="text-white/40 max-w-sm mb-8">
        Bu bağlantı geçersiz, süresi dolmuş veya bar henüz yayınlanmamış.
      </p>
      <Link href="/" className="btn-outline text-sm">
        MoodSip'e Dön
      </Link>
    </div>
  )
}
