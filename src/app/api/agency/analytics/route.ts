import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { subMonths, startOfMonth, format } from 'date-fns'

// GET /api/agency/analytics — Real stats for HR agency dashboard
export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'HR_AGENCY') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const agency = await db.hRAgency.findUnique({ where: { userId: session.user.id } })
    if (!agency) return NextResponse.json({ status: 'success', data: getEmptyStats() })

    const now = new Date()
    const sixMonthsAgo = startOfMonth(subMonths(now, 5))

    // Pools and total candidates via pool count
    const pools = await db.candidatePool.findMany({ where: { agencyId: agency.id } })
    const totalPools = pools.length

    // Partner hotels count
    const partnerCount = await db.agencyHotelPartnership.count({
      where: { agencyId: agency.id, isActive: true },
    })

    // Applications placed (HIRED status) in last 6 months — we track by applications where
    // the hotel is one of our partners
    const partnerHotelIds = await db.agencyHotelPartnership.findMany({
      where: { agencyId: agency.id, isActive: true },
      select: { hotelId: true },
    })
    const hotelIds = partnerHotelIds.map(p => p.hotelId)

    const [totalPlaced, activeApplications, recentApplications] = await Promise.all([
      hotelIds.length > 0
        ? db.application.count({ where: { hotelId: { in: hotelIds }, status: 'OFFER_ACCEPTED' } })
        : Promise.resolve(0),
      hotelIds.length > 0
        ? db.application.count({ where: { hotelId: { in: hotelIds }, status: { in: ['SUBMITTED', 'REVIEWING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'OFFER_EXTENDED'] } } })
        : Promise.resolve(0),
      hotelIds.length > 0
        ? db.application.findMany({
            where: { hotelId: { in: hotelIds }, createdAt: { gte: sixMonthsAgo } },
            select: { createdAt: true, status: true },
          })
        : Promise.resolve([]),
    ])

    // Build 6-month pipeline trend
    const monthBuckets: Record<string, { applications: number; placed: number }> = {}
    for (let i = 5; i >= 0; i--) {
      const key = format(subMonths(now, i), 'MMM')
      monthBuckets[key] = { applications: 0, placed: 0 }
    }
    for (const app of recentApplications) {
      const key = format(new Date(app.createdAt), 'MMM')
      if (monthBuckets[key]) {
        monthBuckets[key].applications++
        if (app.status === 'OFFER_ACCEPTED') monthBuckets[key].placed++
      }
    }
    const trend = Object.entries(monthBuckets).map(([month, v]) => ({ month, ...v }))

    const placementRate = totalPlaced > 0 && (totalPlaced + activeApplications) > 0
      ? Math.round((totalPlaced / (totalPlaced + activeApplications)) * 100)
      : 0

    return NextResponse.json({
      status: 'success',
      data: {
        totalPools,
        partnerCount,
        totalPlaced,
        activeApplications,
        placementRate,
        trend,
      },
    })
  } catch (error) {
    console.error('[GET /api/agency/analytics]', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}

function getEmptyStats() {
  const now = new Date()
  const trend = Array.from({ length: 6 }, (_, i) => ({
    month: format(subMonths(now, 5 - i), 'MMM'),
    applications: 0,
    placed: 0,
  }))
  return { totalPools: 0, partnerCount: 0, totalPlaced: 0, activeApplications: 0, placementRate: 0, trend }
}
