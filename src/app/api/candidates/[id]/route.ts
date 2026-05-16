import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

// GET /api/candidates/[id] — Get candidate profile
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    const isPrivileged =
      session?.user.role === 'HOTEL_EMPLOYER' ||
      session?.user.role === 'HR_AGENCY' ||
      session?.user.role === 'ADMIN' ||
      session?.user.role === 'SUPER_ADMIN'

    const candidate = await db.candidateProfile.findFirst({
      where: {
        OR: [{ id: params.id }, { userId: params.id }],
        // Employers/admins can view profiles even if not public
        ...(isPrivileged ? {} : { isPublic: true }),
      },
      include: {
        user: {
          select: { id: true, name: true, image: true, createdAt: true },
        },
        languages: true,
        skills: true,
        experience: {
          orderBy: { startDate: 'desc' },
        },
        education: {
          orderBy: { startDate: 'desc' },
        },
        certifications: true,
        documents: {
          where: { type: 'CV_RESUME' },
          select: { id: true, type: true, fileUrl: true, name: true },
        },
      },
    })

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    const canSeeFullProfile = isPrivileged || session?.user.id === candidate.userId

    if (!canSeeFullProfile) {
      // Return limited public profile
      return NextResponse.json({
        status: 'success',
        data: {
          id: candidate.id,
          firstName: candidate.firstName,
          lastName: candidate.lastName.charAt(0) + '.',
          headline: candidate.headline,
          cityOfResidence: candidate.cityOfResidence,
          countryOfResidence: candidate.countryOfResidence,
          yearsOfExperience: candidate.yearsOfExperience,
          availabilityStatus: candidate.availabilityStatus,
          languages: candidate.languages,
          skills: candidate.skills.slice(0, 5),
          experience: candidate.experience.map((w) => ({ ...w })),
        },
      })
    }

    return NextResponse.json({ status: 'success', data: candidate })
  } catch (error) {
    console.error('[GET /api/candidates/[id]]', error)
    return NextResponse.json({ error: 'Failed to fetch candidate' }, { status: 500 })
  }
}
