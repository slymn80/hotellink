import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

const reviewSchema = z.object({
  candidateId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  content: z.string().max(2000).optional(),
  isAnonymous: z.boolean().default(false),
})

// POST /api/reviews/candidate — Hotel employer reviews a candidate
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'HOTEL_EMPLOYER') {
      return NextResponse.json({ error: 'Only hotel employers can review candidates' }, { status: 403 })
    }

    const employer = await db.hotelEmployer.findFirst({ where: { userId: session.user.id } })
    if (!employer) return NextResponse.json({ error: 'Hotel not found' }, { status: 404 })

    const body = await req.json()
    const parsed = reviewSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
    }

    const { candidateId, rating, title, content, isAnonymous } = parsed.data

    const candidate = await db.candidateProfile.findUnique({ where: { id: candidateId } })
    if (!candidate) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })

    const existing = await db.candidateReview.findUnique({
      where: { candidateId_hotelId: { candidateId, hotelId: employer.hotelId } },
    })
    if (existing) {
      return NextResponse.json({ error: 'You have already reviewed this candidate' }, { status: 409 })
    }

    const review = await db.$transaction(async (tx) => {
      const r = await tx.candidateReview.create({
        data: {
          candidateId,
          hotelId: employer.hotelId,
          reviewerId: session.user.id,
          rating,
          title,
          content,
          isAnonymous,
        },
      })

      // Recalculate candidate average
      const agg = await tx.candidateReview.aggregate({
        where: { candidateId },
        _avg: { rating: true },
        _count: true,
      })

      await tx.candidateProfile.update({
        where: { id: candidateId },
        data: {
          averageRating: agg._avg.rating ?? 0,
          reviewCount: agg._count,
        },
      })

      return r
    })

    return NextResponse.json({ status: 'success', data: review }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/reviews/candidate]', error)
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  }
}

// GET /api/reviews/candidate?candidateId=xxx — Get candidate reviews
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const candidateId = searchParams.get('candidateId')
    if (!candidateId) return NextResponse.json({ error: 'candidateId required' }, { status: 400 })

    const reviews = await db.candidateReview.findMany({
      where: { candidateId },
      orderBy: { createdAt: 'desc' },
      include: {
        hotel: { select: { name: true, logoUrl: true, city: true, starRating: true } },
      },
    })

    const formatted = reviews.map(r => ({
      ...r,
      hotel: r.isAnonymous ? { name: 'Anonymous Hotel', logoUrl: null, city: null, starRating: null } : r.hotel,
    }))

    return NextResponse.json({ status: 'success', data: formatted })
  } catch (error) {
    console.error('[GET /api/reviews/candidate]', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}
