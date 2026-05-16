import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { startOfYear } from 'date-fns'

// GET /api/agency/dashboard — Stats, partner hotels, and recent placements for the agency overview page
export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'HR_AGENCY') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const agency = await db.hRAgency.findUnique({ where: { userId: session.user.id } })
    if (!agency) return NextResponse.json({ status: 'success', data: getEmpty() })

    const yearStart = startOfYear(new Date())

    // Partner hotel IDs
    const partnerships = await db.agencyHotelPartnership.findMany({
      where: { agencyId: agency.id, isActive: true },
      select: { hotelId: true },
    })
    const hotelIds = partnerships.map((p) => p.hotelId)
    const partnerCount = hotelIds.length

    // Pool count
    const candidatePool = await db.candidatePool.count({ where: { agencyId: agency.id } })

    // Total placed (OFFER_ACCEPTED) and open positions across partner hotels
    const [totalPlaced, openPositions] = await Promise.all([
      hotelIds.length > 0
        ? db.application.count({ where: { hotelId: { in: hotelIds }, status: 'OFFER_ACCEPTED' } })
        : Promise.resolve(0),
      hotelIds.length > 0
        ? db.job.count({ where: { hotelId: { in: hotelIds }, status: 'ACTIVE' } })
        : Promise.resolve(0),
    ])

    // Partner hotel details with job + placement counts
    const partnerHotels = hotelIds.length > 0
      ? await db.hotel.findMany({
          where: { id: { in: hotelIds } },
          select: {
            id: true,
            name: true,
            city: true,
            logoUrl: true,
            _count: { select: { jobs: true } },
          },
        })
      : []

    // YTD placements per hotel
    const ytdByHotel = hotelIds.length > 0
      ? await db.application.groupBy({
          by: ['hotelId'],
          where: { hotelId: { in: hotelIds }, status: 'OFFER_ACCEPTED', createdAt: { gte: yearStart } },
          _count: { id: true },
        })
      : []
    const ytdMap: Record<string, number> = {}
    for (const row of ytdByHotel) ytdMap[row.hotelId] = row._count.id

    const partners = partnerHotels.map((h) => ({
      id: h.id,
      name: h.name,
      city: h.city,
      logoUrl: h.logoUrl,
      openPositions: h._count.jobs,
      placedThisYear: ytdMap[h.id] ?? 0,
    }))

    // Recent placements
    const recentApps = hotelIds.length > 0
      ? await db.application.findMany({
          where: { hotelId: { in: hotelIds } },
          orderBy: { updatedAt: 'desc' },
          take: 5,
          select: {
            id: true,
            status: true,
            updatedAt: true,
            job: { select: { title: true } },
            hotel: { select: { name: true } },
            candidate: { select: { firstName: true, lastName: true } },
          },
        })
      : []

    const recentPlacements = recentApps.map((a) => ({
      id: a.id,
      candidateName: `${a.candidate.firstName} ${a.candidate.lastName.charAt(0)}.`,
      role: a.job.title,
      hotel: a.hotel.name,
      status: a.status,
      updatedAt: a.updatedAt.toISOString(),
    }))

    return NextResponse.json({
      status: 'success',
      data: {
        stats: { partnerCount, totalPlaced, candidatePool, openPositions },
        partners,
        recentPlacements,
      },
    })
  } catch (error) {
    console.error('[GET /api/agency/dashboard]', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}

function getEmpty() {
  return {
    stats: { partnerCount: 0, totalPlaced: 0, candidatePool: 0, openPositions: 0 },
    partners: [],
    recentPlacements: [],
  }
}
