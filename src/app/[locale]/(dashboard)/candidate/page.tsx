import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { db } from '@/lib/prisma'
import { CandidateDashboardClient } from './CandidateDashboardClient'

export default async function CandidateDashboardPage() {
  const session = await auth()
  const locale = await getLocale()

  if (!session) {
    redirect(`/${locale}/login`)
  }

  if (session.user.role !== 'CANDIDATE') {
    const rolePaths: Record<string, string> = {
      HOTEL_EMPLOYER: `/${locale}/hotel`,
      HR_AGENCY: `/${locale}/agency`,
      ADMIN: `/${locale}/admin`,
      SUPER_ADMIN: `/${locale}/admin`,
    }
    redirect(rolePaths[session.user.role] ?? `/${locale}/dashboard`)
  }

  // Fetch candidate data
  const candidate = await db.candidateProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      languages: true,
      skills: true,
      documents: { orderBy: { createdAt: 'desc' }, take: 5 },
      applications: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          job: { include: { hotel: { select: { name: true, logoUrl: true, city: true } } } },
        },
      },
      _count: {
        select: {
          applications: true,
          savedJobs: true,
          documents: true,
          experience: true,
        },
      },
    },
  })

  // Fetch notifications count
  const unreadNotifications = await db.notification.count({
    where: { userId: session.user.id, isRead: false },
  })

  // Fetch profile views (from analytics/audit log)
  const profileViews = candidate?.viewCount ?? 0

  return (
    <CandidateDashboardClient
      candidate={candidate}
      session={session}
      stats={{
        applications: candidate?._count.applications ?? 0,
        savedJobs: candidate?._count.savedJobs ?? 0,
        profileViews,
        unreadNotifications,
      }}
    />
  )
}
