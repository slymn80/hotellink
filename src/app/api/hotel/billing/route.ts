import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

// GET /api/hotel/billing — Current subscription + payment history
export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'HOTEL_EMPLOYER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const employer = await db.hotelEmployer.findFirst({
      where: { userId: session.user.id },
      include: {
        hotel: {
          include: {
            subscriptions: {
              where: { status: 'ACTIVE' },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    })

    if (!employer) return NextResponse.json({ error: 'Hotel not found' }, { status: 404 })

    const subscription = employer.hotel.subscriptions[0] ?? null

    // Fetch payments for this hotel
    const payments = await db.payment.findMany({
      where: { hotelId: employer.hotelId, status: 'COMPLETED' },
      orderBy: { createdAt: 'desc' },
      take: 12,
    })

    // Count active jobs for usage display
    const [activeJobCount, totalApplications] = await Promise.all([
      db.job.count({ where: { hotelId: employer.hotelId, status: 'ACTIVE' } }),
      db.application.count({ where: { hotelId: employer.hotelId } }),
    ])

    return NextResponse.json({
      status: 'success',
      data: {
        subscription,
        payments,
        usage: {
          activeJobs: activeJobCount,
          jobLimit: subscription?.jobPostingLimit ?? 1,
          totalApplications,
        },
      },
    })
  } catch (error) {
    console.error('[GET /api/hotel/billing]', error)
    return NextResponse.json({ error: 'Failed to fetch billing data' }, { status: 500 })
  }
}
