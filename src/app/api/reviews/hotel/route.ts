import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

const reviewSchema = z.object({
  hotelId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  content: z.string().max(2000).optional(),
  isAnonymous: z.boolean().default(false),
})

// POST /api/reviews/hotel — Candidate reviews a hotel
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Only candidates can review hotels' }, { status: 403 })
    }

    const candidate = await db.candidateProfile.findUnique({ where: { userId: session.user.id } })
    if (!candidate) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const body = await req.json()
    const parsed = reviewSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
    }

    const { hotelId, rating, title, content, isAnonymous } = parsed.data

    const hotel = await db.hotel.findUnique({ where: { id: hotelId } })
    if (!hotel) return NextResponse.json({ error: 'Hotel not found' }, { status: 404 })

    const existing = await db.hotelReview.findUnique({
      where: { hotelId_candidateId: { hotelId, candidateId: candidate.id } },
    })
    if (existing) {
      return NextResponse.json({ error: 'You have already reviewed this hotel' }, { status: 409 })
    }

    const review = await db.$transaction(async (tx) => {
      const r = await tx.hotelReview.create({
        data: { hotelId, candidateId: candidate.id, rating, title, content, isAnonymous },
      })

      // Recalculate hotel average
      const agg = await tx.hotelReview.aggregate({
        where: { hotelId },
        _avg: { rating: true },
        _count: true,
      })

      await tx.hotel.update({
        where: { id: hotelId },
        data: {
          averageRating: agg._avg.rating ?? 0,
          reviewCount: agg._count,
        },
      })

      return r
    })

    return NextResponse.json({ status: 'success', data: review }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/reviews/hotel]', error)
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  }
}

// GET /api/reviews/hotel?hotelId=xxx — Get hotel reviews
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const hotelId = searchParams.get('hotelId')
    if (!hotelId) return NextResponse.json({ error: 'hotelId required' }, { status: 400 })

    const reviews = await db.hotelReview.findMany({
      where: { hotelId },
      orderBy: { createdAt: 'desc' },
      include: {
        candidate: {
          select: { firstName: true, lastName: true, profilePhoto: true, currentPosition: true },
        },
      },
    })

    const formatted = reviews.map(r => ({
      ...r,
      candidate: r.isAnonymous
        ? { firstName: 'Anonymous', lastName: '', profilePhoto: null, currentPosition: null }
        : r.candidate,
    }))

    return NextResponse.json({ status: 'success', data: formatted })
  } catch (error) {
    console.error('[GET /api/reviews/hotel]', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}
