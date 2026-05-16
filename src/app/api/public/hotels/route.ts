import { NextResponse } from 'next/server'
import { db } from '@/lib/prisma'

// GET /api/public/hotels — Featured hotels for landing page (no auth required)
export async function GET() {
  try {
    // Featured first, then verified active hotels, max 6
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

    const result = hotels.map((h) => {
      const depts = Array.from(new Set(h.jobs.map((j) => j.department))).slice(0, 3)
      return {
        id: h.id,
        name: h.name,
        city: h.city,
        country: h.country,
        type: h.type,
        starRating: h.starRating,
        isVerified: h.isVerified,
        isFeatured: h.isFeatured,
        logoUrl: h.logoUrl,
        coverImageUrl: h.coverImageUrl,
        openPositions: (h as { jobs: unknown[] }).jobs.length,
        departments: depts,
      }
    })

    return NextResponse.json({ status: 'success', data: result })
  } catch (error) {
    console.error('[GET /api/public/hotels]', error)
    return NextResponse.json({ error: 'Failed to fetch hotels' }, { status: 500 })
  }
}
