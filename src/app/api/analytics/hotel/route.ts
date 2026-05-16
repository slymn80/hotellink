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
      include: { hotel: { select: { id: true, viewCount: true, averageRating: true, reviewCount: true } } },
    })

    if (!employer) return NextResponse.json({ error: 'Hotel not found' }, { status: 404 })

    const hotelId = employer.hotelId

    // Application counts by status
    const statusCounts = await db.application.groupBy({
      by: ['status'],
      where: { hotelId },
      _count: true,
    })

    const byStatus: Record<string, number> = {}
    for (const row of statusCounts) byStatus[row.status] = row._count

    const totalApplications = Object.values(byStatus).reduce((a, b) => a + b, 0)
    const shortlisted = (byStatus['SHORTLISTED'] ?? 0) + (byStatus['INTERVIEW_SCHEDULED'] ?? 0) + (byStatus['INTERVIEW_COMPLETED'] ?? 0)
    const hired = byStatus['HIRED'] ?? 0

    // Applications by department (via job)
    const byDept = await db.application.findMany({
      where: { hotelId },
      include: { job: { select: { department: true, title: true } } },
    })

    const deptMap: Record<string, { applications: number; hires: number }> = {}
    for (const app of byDept) {
      const dept = app.job.department
      if (!deptMap[dept]) deptMap[dept] = { applications: 0, hires: 0 }
      deptMap[dept].applications++
      if ((app.status as string) === 'HIRED') deptMap[dept].hires++
    }
    const departmentBreakdown = Object.entries(deptMap).map(([department, v]) => ({
      department, ...v,
    })).sort((a, b) => b.applications - a.applications)

    // Nationality breakdown from candidates
    const candidateProfiles = await db.application.findMany({
      where: { hotelId },
      include: { candidate: { select: { nationality: true } } },
      distinct: ['candidateId'],
    })

    const nationalityMap: Record<string, number> = {}
    for (const app of candidateProfiles) {
      const nat = app.candidate.nationality ?? 'Unknown'
      nationalityMap[nat] = (nationalityMap[nat] ?? 0) + 1
    }
    const nationalityBreakdown = Object.entries(nationalityMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)

    // Active jobs
    const activeJobs = await db.job.count({ where: { hotelId, status: 'ACTIVE', deletedAt: null } })

    // Recent applications (last 8 weeks, grouped by week)
    const eightWeeksAgo = new Date()
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56)

    const recentApps = await db.application.findMany({
      where: { hotelId, createdAt: { gte: eightWeeksAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    })

    // Group into weeks
    const weekMap: Record<string, number> = {}
    for (const app of recentApps) {
      const d = new Date(app.createdAt)
      const weekStart = new Date(d)
      weekStart.setDate(d.getDate() - d.getDay())
      const key = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      weekMap[key] = (weekMap[key] ?? 0) + 1
    }
    const applicationTrend = Object.entries(weekMap).map(([week, applications]) => ({ week, applications }))

    return NextResponse.json({
      status: 'success',
      data: {
        profileViews: employer.hotel.viewCount,
        totalApplications,
        shortlisted,
        hired,
        activeJobs,
        averageRating: employer.hotel.averageRating ? Number(employer.hotel.averageRating) : null,
        reviewCount: employer.hotel.reviewCount,
        departmentBreakdown,
        nationalityBreakdown,
        applicationTrend,
        statusBreakdown: byStatus,
      },
    })
  } catch (error) {
    console.error('[GET /api/analytics/hotel]', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
