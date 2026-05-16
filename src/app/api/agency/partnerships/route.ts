import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

// GET /api/agency/partnerships — Return set of partner hotel IDs
export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'HR_AGENCY') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const agency = await db.hRAgency.findUnique({ where: { userId: session.user.id } })
    if (!agency) return NextResponse.json({ status: 'success', data: { partnerIds: [] } })

    const partnerships = await db.agencyHotelPartnership.findMany({
      where: { agencyId: agency.id, isActive: true },
      select: { hotelId: true },
    })

    return NextResponse.json({ status: 'success', data: { partnerIds: partnerships.map(p => p.hotelId) } })
  } catch (error) {
    console.error('[GET /api/agency/partnerships]', error)
    return NextResponse.json({ error: 'Failed to fetch partnerships' }, { status: 500 })
  }
}

// POST /api/agency/partnerships — Toggle partnership with a hotel
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'HR_AGENCY') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { hotelId } = await req.json()
    if (!hotelId) return NextResponse.json({ error: 'hotelId is required' }, { status: 400 })

    const agency = await db.hRAgency.findUnique({ where: { userId: session.user.id } })
    if (!agency) return NextResponse.json({ error: 'Agency profile not found' }, { status: 404 })

    const existing = await db.agencyHotelPartnership.findUnique({
      where: { agencyId_hotelId: { agencyId: agency.id, hotelId } },
    })

    let isPartner: boolean
    if (existing) {
      await db.agencyHotelPartnership.update({
        where: { agencyId_hotelId: { agencyId: agency.id, hotelId } },
        data: { isActive: !existing.isActive },
      })
      isPartner = !existing.isActive
    } else {
      await db.agencyHotelPartnership.create({
        data: { agencyId: agency.id, hotelId, isActive: true },
      })
      isPartner = true
    }

    return NextResponse.json({ status: 'success', data: { isPartner } })
  } catch (error) {
    console.error('[POST /api/agency/partnerships]', error)
    return NextResponse.json({ error: 'Failed to update partnership' }, { status: 500 })
  }
}
