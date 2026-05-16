import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

// GET /api/hotels/favorites — List favorite hotels for the authenticated candidate
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'CANDIDATE') {
      return NextResponse.json({ status: 'success', data: { items: [], total: 0 } })
    }

    const candidate = await db.candidateProfile.findUnique({
      where: { userId: session.user.id },
    })
    if (!candidate) {
      return NextResponse.json({ status: 'success', data: { items: [], total: 0 } })
    }

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
    const pageSize = Math.min(50, Number(searchParams.get('pageSize') ?? '20'))

    const [items, total] = await Promise.all([
      db.favoriteHotel.findMany({
        where: { candidateId: candidate.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          hotel: {
            select: {
              id: true,
              name: true,
              slug: true,
              city: true,
              country: true,
              type: true,
              starRating: true,
              logoUrl: true,
              coverImageUrl: true,
              isVerified: true,
              averageRating: true,
              _count: { select: { jobs: true } },
            },
          },
        },
      }),
      db.favoriteHotel.count({ where: { candidateId: candidate.id } }),
    ])

    const serialized = items.map((item) => ({
      ...item,
      hotel: {
        ...item.hotel,
        averageRating: item.hotel.averageRating ? Number(item.hotel.averageRating) : null,
      },
    }))

    return NextResponse.json({
      status: 'success',
      data: { items: serialized, total, page, pageSize },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
