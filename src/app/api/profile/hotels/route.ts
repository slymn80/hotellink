import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

// GET /api/profile/hotels — All hotels for current employer
export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const employers = await db.hotelEmployer.findMany({
      where: { userId: session.user.id },
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
            status: true,
            isVerified: true,
            logoUrl: true,
            _count: { select: { jobs: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    const hotels = employers.map((e) => ({
      ...e.hotel,
      isOwner: e.isOwner,
      isAdmin: e.isAdmin,
    }))

    return NextResponse.json({ status: 'success', data: hotels })
  } catch (error) {
    console.error('[GET /api/profile/hotels]', error)
    return NextResponse.json({ error: 'Failed to fetch hotels' }, { status: 500 })
  }
}
