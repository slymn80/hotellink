import { NextResponse } from 'next/server'
import { db } from '@/lib/prisma'

// GET /api/public/stats — Real platform stats for landing page (no auth required)
export async function GET() {
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

    return NextResponse.json({
      status: 'success',
      data: {
        hotelCount,
        candidateCount,
        placementCount,
        countryCount: nationalityRows.length,
      },
    })
  } catch (error) {
    console.error('[GET /api/public/stats]', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
