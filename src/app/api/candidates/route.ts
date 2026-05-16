import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

// GET /api/candidates — Search candidates (employer/admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const allowedRoles = ['HOTEL_EMPLOYER', 'HR_AGENCY', 'ADMIN', 'SUPER_ADMIN']
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q') ?? undefined
    const availability = searchParams.get('availability') ?? undefined
    const language = searchParams.get('language') ?? undefined
    const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
    const pageSize = Math.min(50, Number(searchParams.get('pageSize') ?? '20'))

    const where: Prisma.CandidateProfileWhereInput = {
      isPublic: true,
      ...(query && {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { headline: { contains: query, mode: 'insensitive' } },
          { bio: { contains: query, mode: 'insensitive' } },
        ],
      }),
      ...(availability && { availabilityStatus: availability as import('@prisma/client').AvailabilityStatus }),
      ...(language && {
        languages: { some: { language: { contains: language, mode: 'insensitive' } } },
      }),
    }

    const [candidates, total] = await Promise.all([
      db.candidateProfile.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, image: true } },
          languages: true,
          skills: { take: 5 },
        },
        orderBy: [{ profileScore: 'desc' }, { updatedAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.candidateProfile.count({ where }),
    ])

    // Mask last names for non-admin users
    const maskedCandidates = candidates.map((c) => ({
      ...c,
      lastName: session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN'
        ? c.lastName
        : c.lastName.charAt(0) + '.',
    }))

    return NextResponse.json({
      status: 'success',
      data: { items: maskedCandidates, total, page, pageSize },
    })
  } catch (error) {
    console.error('[GET /api/candidates]', error)
    return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 })
  }
}
