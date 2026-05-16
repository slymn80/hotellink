import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { subDays, startOfMonth, endOfMonth, subMonths, format } from 'date-fns'

// GET /api/admin/stats — Admin platform statistics
export async function GET() {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const now = new Date()
    const monthStart = startOfMonth(now)
    const lastMonthStart = startOfMonth(subDays(monthStart, 1))
    const lastMonthEnd = endOfMonth(subDays(monthStart, 1))
    const sixMonthsAgo = startOfMonth(subMonths(now, 5))

    const [
      totalUsers,
      newUsersThisMonth,
      newUsersLastMonth,
      totalHotels,
      verifiedHotels,
      totalJobs,
      activeJobs,
      totalApplications,
      applicationsThisMonth,
      pendingVerifications,
      revenueThisMonth,
      revenueLastMonth,
      userRoles,
      recentUsers,
      recentApplications,
    ] = await Promise.all([
      db.user.count({ where: { deletedAt: null } }),
      db.user.count({ where: { createdAt: { gte: monthStart } } }),
      db.user.count({ where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } }),
      db.hotel.count({ where: { deletedAt: null } }),
      db.hotel.count({ where: { status: 'VERIFIED' } }),
      db.job.count({ where: { deletedAt: null } }),
      db.job.count({ where: { status: 'ACTIVE', deletedAt: null } }),
      db.application.count(),
      db.application.count({ where: { createdAt: { gte: monthStart } } }),
      db.verification.count({ where: { status: { in: ['PENDING', 'IN_REVIEW'] } } }),
      db.payment.aggregate({
        where: { status: 'COMPLETED', paidAt: { gte: monthStart } },
        _sum: { amount: true },
      }),
      db.payment.aggregate({
        where: { status: 'COMPLETED', paidAt: { gte: lastMonthStart, lte: lastMonthEnd } },
        _sum: { amount: true },
      }),
      db.user.groupBy({
        by: ['role'],
        _count: { _all: true },
        where: { deletedAt: null },
      }),
      // Last 6 months of user registrations
      db.user.findMany({
        where: { createdAt: { gte: sixMonthsAgo }, deletedAt: null },
        select: { createdAt: true },
      }),
      // Last 6 months of applications
      db.application.findMany({
        where: { createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true },
      }),
    ])

    // Build monthly growth data (last 6 months)
    const monthMap: Record<string, { users: number; applications: number }> = {}
    for (let i = 5; i >= 0; i--) {
      const key = format(subMonths(now, i), 'MMM')
      monthMap[key] = { users: 0, applications: 0 }
    }
    for (const u of recentUsers) {
      const key = format(new Date(u.createdAt), 'MMM')
      if (monthMap[key]) monthMap[key].users++
    }
    for (const a of recentApplications) {
      const key = format(new Date(a.createdAt), 'MMM')
      if (monthMap[key]) monthMap[key].applications++
    }
    const growth = Object.entries(monthMap).map(([month, v]) => ({ month, ...v }))

    // Role breakdown with percentages
    const roleBreakdown = userRoles.reduce((acc, item) => ({
      ...acc,
      [item.role]: item._count._all,
    }), {} as Record<string, number>)

    const totalRoleCount = Object.values(roleBreakdown).reduce((a, b) => a + b, 0)
    const ROLE_COLORS: Record<string, string> = {
      CANDIDATE: '#6172F3',
      HOTEL_EMPLOYER: '#0BA5E9',
      HR_AGENCY: '#F59E0B',
      ADMIN: '#10B981',
      SUPER_ADMIN: '#8B5CF6',
    }
    const roleChartData = Object.entries(roleBreakdown).map(([role, count]) => ({
      name: role.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      value: totalRoleCount > 0 ? Math.round((count / totalRoleCount) * 100) : 0,
      count,
      color: ROLE_COLORS[role] ?? '#6B7280',
    }))

    const monthlyRevenue = Number(revenueThisMonth._sum.amount ?? 0)
    const lastMonthRevenue = Number(revenueLastMonth._sum.amount ?? 0)
    const revenueGrowth = lastMonthRevenue > 0
      ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0

    const userGrowthRate = newUsersLastMonth > 0
      ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100
      : 0

    return NextResponse.json({
      status: 'success',
      data: {
        users: {
          total: totalUsers,
          newThisMonth: newUsersThisMonth,
          growthRate: Math.round(userGrowthRate * 10) / 10,
          byRole: roleBreakdown,
          roleChartData,
        },
        hotels: {
          total: totalHotels,
          verified: verifiedHotels,
          pendingVerification: totalHotels - verifiedHotels,
        },
        jobs: {
          total: totalJobs,
          active: activeJobs,
        },
        applications: {
          total: totalApplications,
          thisMonth: applicationsThisMonth,
        },
        revenue: {
          thisMonth: monthlyRevenue,
          lastMonth: lastMonthRevenue,
          growthRate: Math.round(revenueGrowth * 10) / 10,
          currency: 'USD',
        },
        verifications: {
          pending: pendingVerifications,
        },
        growth,
      },
    })
  } catch (error) {
    console.error('[GET /api/admin/stats]', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
