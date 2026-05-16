import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { db } from '@/lib/prisma'
import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { Stats } from '@/components/landing/Stats'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { Features } from '@/components/landing/Features'
import { HotelShowcase } from '@/components/landing/HotelShowcase'
import { Testimonials } from '@/components/landing/Testimonials'
import { Pricing } from '@/components/landing/Pricing'
import { FAQ } from '@/components/landing/FAQ'
import { CTA } from '@/components/landing/CTA'
import { Footer } from '@/components/landing/Footer'

interface HomePageProps {
  params: { locale: string }
}

export async function generateMetadata({
  params: { locale },
}: HomePageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'hero' })
  return {
    title: 'HotelLink — Hospitality Recruitment Platform in Türkiye',
    description: t('subheadline'),
  }
}

async function getPublicStats() {
  try {
    const [hotelCount, candidateCount, placementCount, nationalityRows] = await Promise.all([
      db.hotel.count({ where: { status: 'VERIFIED', isVerified: true } }),
      db.user.count({ where: { role: 'CANDIDATE', status: 'ACTIVE' } }),
      db.application.count({ where: { status: 'OFFER_ACCEPTED' } }),
      db.candidateProfile.findMany({
        where: { nationality: { not: '' } },
        select: { nationality: true },
        distinct: ['nationality'],
      }),
    ])
    return { hotelCount, candidateCount, placementCount, countryCount: nationalityRows.length }
  } catch {
    return null
  }
}

async function getFeaturedHotels() {
  try {
    const hotels = await db.hotel.findMany({
      where: { status: 'VERIFIED', isVerified: true },
      orderBy: [{ isFeatured: 'desc' }, { viewCount: 'desc' }],
      take: 6,
      select: {
        id: true,
        name: true,
        city: true,
        country: true,
        type: true,
        starRating: true,
        isVerified: true,
        isFeatured: true,
        logoUrl: true,
        coverImageUrl: true,
        jobs: {
          where: { status: 'ACTIVE' },
          select: { department: true },
        },
      },
    })
    return hotels.map((h) => ({
      id: h.id,
      name: h.name,
      city: h.city,
      country: h.country,
      type: h.type as string,
      starRating: h.starRating as string | null,
      isVerified: h.isVerified,
      isFeatured: h.isFeatured,
      logoUrl: h.logoUrl,
      coverImageUrl: h.coverImageUrl,
      openPositions: h.jobs.length,
      departments: Array.from(new Set(h.jobs.map((j) => j.department as string))).slice(0, 3),
    }))
  } catch {
    return null
  }
}

export default async function HomePage() {
  const [stats, hotels] = await Promise.all([getPublicStats(), getFeaturedHotels()])

  return (
    <>
      <Navbar />
      <main>
        <Hero stats={stats} />
        <Stats stats={stats} />
        <HowItWorks />
        <Features />
        <HotelShowcase hotels={hotels} />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA stats={stats} />
      </main>
      <Footer />
    </>
  )
}
