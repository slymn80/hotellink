import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

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
          select: {
            id: true,
            viewCount: true,
            averageRating: true,
            reviewCount: true,
          },
        },
      },
    })

    if (!employer) return NextResponse.json({ error: 'Hotel not found' }, { status: 404 })

    const hotelId = employer.hotelId

    // Stats
    const [activeJobsCount, totalApps, shortlistedCount] = await Promise.all([
      db.job.count({ where: { hotelId, status: 'ACTIVE', deletedAt: null } }),
      db.application.count({ where: { hotelId } }),
      db.application.count({
        where: {
          hotelId,
          status: { in: ['SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED'] },
        },
      }),
    ])

    // Recent applications (last 5)
    const recentApps = await db.application.findMany({
      where: { hotelId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        candidate: {
          select: {
            firstName: true,
            lastName: true,
            nationality: true,
            profilePhoto: true,
            yearsOfExperience: true,
            currentPosition: true,
          },
        },
        job: { select: { title: true, department: true } },
      },
    })

    // Active jobs list (top 5 by application count)
    const activeJobsList = await db.job.findMany({
      where: { hotelId, status: 'ACTIVE', deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        _count: { select: { applications: true } },
      },
    })

    // Application trend (last 6 months, grouped by month)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const trendApps = await db.application.findMany({
      where: { hotelId, createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true, status: true },
      orderBy: { createdAt: 'asc' },
    })

    const monthMap: Record<string, { applications: number; hired: number }> = {}
    for (const app of trendApps) {
      const key = new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      if (!monthMap[key]) monthMap[key] = { applications: 0, hired: 0 }
      monthMap[key].applications++
      if ((app.status as string) === 'HIRED') monthMap[key].hired++
    }
    const applicationTrend = Object.entries(monthMap).map(([month, v]) => ({ month, ...v }))

    // Department breakdown
    const deptApps = await db.application.findMany({
      where: { hotelId },
      include: { job: { select: { department: true } } },
    })

    const deptMap: Record<string, number> = {}
    for (const app of deptApps) {
      const dept = app.job.department
      deptMap[dept] = (deptMap[dept] ?? 0) + 1
    }
    const total = Object.values(deptMap).reduce((a, b) => a + b, 0)
    const departmentBreakdown = Object.entries(deptMap)
      .map(([dept, count]) => ({
        dept,
        count,
        pct: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return NextResponse.json({
      status: 'success',
      data: {
        stats: {
          activeJobs: activeJobsCount,
          totalApplications: totalApps,
          shortlisted: shortlistedCount,
          profileViews: employer.hotel.viewCount,
        },
        recentApplications: recentApps.map((app) => ({
          id: app.id,
          status: app.status,
          createdAt: app.createdAt,
          candidateName: `${app.candidate.firstName} ${app.candidate.lastName}`,
          candidatePhoto: app.candidate.profilePhoto,
          nationality: app.candidate.nationality,
          jobTitle: app.job.title,
          yearsOfExperience: app.candidate.yearsOfExperience,
          currentPosition: app.candidate.currentPosition,
        })),
        activeJobs: activeJobsList.map((job) => ({
          id: job.id,
          title: job.title,
          department: job.department,
          applications: job._count.applications,
          deadline: job.applicationDeadline,
          isFeatured: job.isFeatured,
        })),
        applicationTrend,
        departmentBreakdown,
      },
    })
  } catch (error) {
    console.error('[GET /api/dashboard/hotel]', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
