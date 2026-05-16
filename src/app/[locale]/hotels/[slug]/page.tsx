import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@/lib/prisma'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { HotelProfileClient } from './HotelProfileClient'

interface HotelPageProps {
  params: { locale: string; slug: string }
}

async function getHotel(slug: string) {
  return db.hotel.findFirst({
    where: { slug, status: 'VERIFIED', deletedAt: null },
    include: {
      jobs: {
        where: { status: 'ACTIVE', deletedAt: null },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        take: 20,
      },
      reviews: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          candidate: {
            select: { firstName: true, lastName: true, profilePhoto: true, currentPosition: true },
          },
        },
      },
      _count: {
        select: { jobs: true, favorites: true },
      },
    },
  })
}

export async function generateMetadata({ params }: HotelPageProps): Promise<Metadata> {
  const hotel = await getHotel(params.slug)
  if (!hotel) return {}

  return {
    title: `${hotel.name} — Jobs & Career Opportunities | HotelLink`,
    description: hotel.shortDescription ?? hotel.description?.slice(0, 160) ?? '',
    openGraph: {
      title: hotel.name,
      description: hotel.shortDescription ?? '',
      images: hotel.coverImageUrl ? [hotel.coverImageUrl] : [],
    },
  }
}

export default async function HotelProfilePage({ params }: HotelPageProps) {
  const hotel = await getHotel(params.slug)

  if (!hotel) notFound()

  // Increment view count
  db.hotel
    .update({ where: { id: hotel.id }, data: { viewCount: { increment: 1 } } })
    .catch(() => {})

  const base = JSON.parse(JSON.stringify(hotel))

  return (
    <>
      <Navbar />
      <HotelProfileClient
        hotel={{
          ...base,
          averageRating: hotel.averageRating ? Number(hotel.averageRating) : null,
        }}
        locale={params.locale}
      />
      <Footer />
    </>
  )
}
