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
  title:       'MoodSip — Mood-Based Cocktail Experience',
  description: 'Müşterilerinize ruh haline göre kokteyl önerin. Bar işletmecileri için akıllı menü platformu.',
  keywords:    ['cocktail bar', 'menü sistemi', 'QR kod menü', 'bar yönetimi'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
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
