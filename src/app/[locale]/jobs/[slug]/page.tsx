import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@/lib/prisma'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { JobDetailClient } from './JobDetailClient'

interface JobPageProps {
  params: { locale: string; slug: string }
}

async function getJob(slug: string) {
  return db.job.findFirst({
    where: { slug, deletedAt: null },
    include: {
      hotel: {
        select: {
          id: true,
          name: true,
          slug: true,
          shortDescription: true,
          description: true,
          type: true,
          starRating: true,
          city: true,
          country: true,
          logoUrl: true,
          coverImageUrl: true,
          isVerified: true,
          isFeatured: true,
          amenities: true,
          averageRating: true,
          website: true,
          email: true,
          phone: true,
          _count: { select: { jobs: true } },
        },
      },
      _count: { select: { applications: true } },
    },
  })
}

export async function generateMetadata({ params }: JobPageProps): Promise<Metadata> {
  const job = await getJob(params.slug)
  if (!job) return {}

  return {
    title: `${job.title} at ${job.hotel.name} | HotelLink`,
    description: job.description?.slice(0, 160) ?? '',
    openGraph: {
      title: `${job.title} — ${job.hotel.name}`,
      description: job.description?.slice(0, 200) ?? '',
      images: job.hotel.coverImageUrl ? [job.hotel.coverImageUrl] : [],
    },
  }
}

function parseLines(text: string | null | undefined): string[] {
  if (!text) return []
  return text.split('\n').map((s) => s.trim()).filter(Boolean)
}

export default async function JobDetailPage({ params }: JobPageProps) {
  const job = await getJob(params.slug)

  if (!job || job.status !== 'ACTIVE') {
    notFound()
  }

  const base = JSON.parse(JSON.stringify(job))

  return (
    <>
      <Navbar />
      <JobDetailClient
        job={{
          ...base,
          requirements: parseLines(job.requirements),
          responsibilities: parseLines(job.responsibilities),
          benefits: parseLines(job.benefits),
        }}
        locale={params.locale}
      />
      <Footer />
    </>
  )
}
