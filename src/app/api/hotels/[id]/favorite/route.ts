import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

// POST /api/hotels/[id]/favorite — Toggle favorite/unfavorite a hotel
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const candidate = await db.candidateProfile.findUnique({
      where: { userId: session.user.id },
    })
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate profile not found' }, { status: 404 })
    }

    const hotel = await db.hotel.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }], deletedAt: null },
    })
    if (!hotel) {
      return NextResponse.json({ error: 'Hotel not found' }, { status: 404 })
    }

    const existing = await db.favoriteHotel.findUnique({
      where: { candidateId_hotelId: { candidateId: candidate.id, hotelId: hotel.id } },
    })

    if (existing) {
      await db.favoriteHotel.delete({ where: { id: existing.id } })
      return NextResponse.json({ status: 'success', favorited: false })
    } else {
      await db.favoriteHotel.create({ data: { candidateId: candidate.id, hotelId: hotel.id } })
      return NextResponse.json({ status: 'success', favorited: true })
    }
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
