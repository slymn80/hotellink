import type { Metadata, Viewport } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-plus-jakarta',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? 'https://hotellink.com'
  ),
  title: {
    default: 'HotelLink — Hospitality Recruitment Platform in Türkiye',
    template: '%s | HotelLink',
  },
  description:
    'Connect with top hotels and resorts in Türkiye. HotelLink is the multilingual platform for international hospitality recruitment with work permit support.',
  keywords: [
    'hospitality jobs Turkey',
    'hotel jobs Antalya',
    'foreign workers Turkey',
    'work permit Turkey',
    'hotel recruitment platform',
    'otel iş ilanları',
    'туристические вакансии Турция',
  ],
  authors: [{ name: 'HotelLink', url: 'https://hotellink.com' }],
  creator: 'HotelLink',
  publisher: 'HotelLink',
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
    siteName: 'HotelLink',
    title: 'HotelLink — Hospitality Recruitment Platform in Türkiye',
    description:
      'Find international hospitality jobs in Türkiye or hire skilled foreign workers for your hotel. Work permit support included.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'HotelLink - Hospitality Recruitment Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HotelLink — Hospitality Recruitment Platform',
    description: 'International hospitality recruitment platform for Türkiye',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#6172F3' },
    { media: '(prefers-color-scheme: dark)', color: '#0F1C3F' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      suppressHydrationWarning
      className={`${inter.variable} ${plusJakarta.variable}`}
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
