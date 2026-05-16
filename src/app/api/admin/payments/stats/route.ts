import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns'

// GET /api/admin/payments/stats
export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const now = new Date()
    const thisMonthStart = startOfMonth(now)
    const lastMonthStart = startOfMonth(subMonths(now, 1))
    const lastMonthEnd = endOfMonth(subMonths(now, 1))

    const [revenueThisMonth, revenueLastMonth, activeSubscriptions, failedPayments, hotelCount] = await Promise.all([
      db.payment.aggregate({
        where: { status: 'COMPLETED', paidAt: { gte: thisMonthStart } },
        _sum: { amount: true },
      }),
      db.payment.aggregate({
        where: { status: 'COMPLETED', paidAt: { gte: lastMonthStart, lte: lastMonthEnd } },
        _sum: { amount: true },
      }),
      db.subscription.count({ where: { status: 'ACTIVE' } }),
      db.payment.count({ where: { status: 'FAILED', createdAt: { gte: thisMonthStart } } }),
      db.hotel.count(),
    ])

    const thisRevNum = Number(revenueThisMonth._sum.amount ?? 0)
    const lastRevNum = Number(revenueLastMonth._sum.amount ?? 0)
    const growthRate = lastRevNum > 0 ? Math.round(((thisRevNum - lastRevNum) / lastRevNum) * 100) : 0
    const avgPerHotel = hotelCount > 0 ? Math.round(thisRevNum / hotelCount) : 0

    // 7-month revenue trend
    const trend: Array<{ month: string; revenue: number }> = []
    for (let i = 6; i >= 0; i--) {
      const monthDate = subMonths(now, i)
      const start = startOfMonth(monthDate)
      const end = endOfMonth(monthDate)
      const agg = await db.payment.aggregate({
        where: { status: 'COMPLETED', paidAt: { gte: start, lte: end } },
        _sum: { amount: true },
      })
      trend.push({ month: format(monthDate, 'MMM'), revenue: Number(agg._sum.amount ?? 0) })
    }

    return NextResponse.json({
      status: 'success',
      data: {
        revenueThisMonth: Math.round(thisRevNum),
        revenueLastMonth: Math.round(lastRevNum),
        growthRate,
        activeSubscriptions,
        avgRevenuePerHotel: avgPerHotel,
        failedPayments,
        trend,
      },
    })
  } catch (error) {
    console.error('[GET /api/admin/payments/stats]', error)
    return NextResponse.json({ error: 'Failed to fetch payment stats' }, { status: 500 })
  }
}
