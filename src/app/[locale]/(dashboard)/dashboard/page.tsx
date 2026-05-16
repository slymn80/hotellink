import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/prisma'

export default async function DashboardRedirectPage({
  params,
}: {
  params: { locale: string }
}) {
  const session = await auth()
  const locale = params.locale || 'en'

  if (!session) {
    redirect(`/${locale}/login`)
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      role: true,
      password: true,
      onboardingCompleted: true,
      candidate: { select: { id: true } },
      hotelEmployers: { select: { id: true }, take: 1 },
      hrAgency: { select: { id: true } },
    },
  })

  if (!user) {
    redirect(`/${locale}/login`)
  }

  // Step 1: Role not selected yet — only applies to Google (passwordless) users
  // Credential users already chose their role during registration
  if (!user.onboardingCompleted && !user.password) {
    redirect(`/${locale}/onboarding/role`)
  }

  // Step 2: Profile not set up → redirect to profile page per role
  if (user.role === 'CANDIDATE' && !user.candidate) {
    redirect(`/${locale}/candidate/profile`)
  }
  if (user.role === 'HOTEL_EMPLOYER' && !user.hotelEmployers.length) {
    redirect(`/${locale}/hotel/onboarding`)
  }
  if (user.role === 'HR_AGENCY' && !user.hrAgency) {
    redirect(`/${locale}/agency/profile`)
  }

  // Step 3: All set → role dashboard
  const rolePaths: Record<string, string> = {
    CANDIDATE: `/${locale}/candidate`,
    HOTEL_EMPLOYER: `/${locale}/hotel`,
    HR_AGENCY: `/${locale}/agency`,
    ADMIN: `/${locale}/admin`,
    SUPER_ADMIN: `/${locale}/admin`,
  }

  redirect(rolePaths[user.role] ?? `/${locale}/candidate`)
}
