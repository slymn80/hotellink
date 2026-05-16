import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { JobsPageClient } from './JobsPageClient'

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  return {
    title: 'Hospitality Jobs in Türkiye | HotelLink',
    description:
      'Browse hundreds of hospitality jobs at 5-star hotels and resorts across Türkiye. Find front office, F&B, spa, and management positions with visa sponsorship.',
    alternates: {
      canonical: `/${locale}/jobs`,
    },
  }
}

export default function JobsPage() {
  return (
    <>
      <Navbar />
      <JobsPageClient />
      <Footer />
    </>
  )
}
