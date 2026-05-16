import type { Metadata } from 'next'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { HotelsPageClient } from './HotelsPageClient'

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  return {
    title: 'Hotels in Türkiye | Find Hospitality Employers | HotelLink',
    description:
      'Browse verified 5-star hotels and resorts in Türkiye actively hiring international hospitality professionals. Discover your next employer.',
    alternates: { canonical: `/${locale}/hotels` },
  }
}

export default function HotelsPage() {
  return (
    <>
      <Navbar />
      <HotelsPageClient />
      <Footer />
    </>
  )
}
