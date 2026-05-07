import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.moodsip.com.tr'),
  title: {
    default: 'MoodSip — Barınız İçin Akıllı Kokteyl Öneri Sistemi',
    template: '%s | MoodSip',
  },
  description:
    'MoodSip, bar müşterilerine ruh haline göre kokteyl öneren QR kod tabanlı interaktif menü sistemidir. 14 gün ücretsiz deneyin.',
  keywords: [
    'kokteyl öneri sistemi',
    'bar menü sistemi',
    'QR kod bar menü',
    'interaktif bar menüsü',
    'mood quiz kokteyl',
    'bar yönetim paneli',
    'dijital bar menüsü',
    'restoran QR menü',
    'bar yazılımı',
    'kokteyl bar sistemi Türkiye',
  ],
  authors: [{ name: 'MoodSip', url: 'https://www.moodsip.com.tr' }],
  creator: 'MoodSip',
  publisher: 'MoodSip',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://www.moodsip.com.tr',
    siteName: 'MoodSip',
    title: 'MoodSip — Barınız İçin Akıllı Kokteyl Öneri Sistemi',
    description:
      'Müşterilerinize ruh haline göre kokteyl önerin. QR kod ile erişilen interaktif mood quiz ile bar deneyimini dönüştürün.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MoodSip — Akıllı Kokteyl Öneri Sistemi',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MoodSip — Barınız İçin Akıllı Kokteyl Öneri Sistemi',
    description:
      'Müşterilerinize ruh haline göre kokteyl önerin. 14 gün ücretsiz deneyin.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://www.moodsip.com.tr',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'MoodSip',
              url: 'https://www.moodsip.com.tr',
              description:
                'Bar müşterilerine ruh haline göre kokteyl öneren QR kod tabanlı interaktif menü sistemi.',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '25000',
                priceCurrency: 'TRY',
                priceValidUntil: '2026-12-31',
                availability: 'https://schema.org/InStock',
              },
              provider: {
                '@type': 'Organization',
                name: 'MoodSip',
                url: 'https://www.moodsip.com.tr',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.9',
                reviewCount: '38',
              },
            }),
          }}
        />
      </head>
      <body className="bg-obsidian font-sans antialiased">
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a1a',
              color:      '#fff',
              border:     '1px solid rgba(212,175,55,0.3)',
            },
            success: { iconTheme: { primary: '#d4af37', secondary: '#0d0d0d' } },
          }}
        />
        {children}
      </body>
    </html>
  )
}
