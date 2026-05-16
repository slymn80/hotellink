import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { NotificationType } from '@prisma/client'

const applySchema = z.object({
  jobId: z.string().cuid(),
  coverLetter: z.string().max(2000).optional(),
})

// POST /api/applications — Apply for a job
export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'CANDIDATE') {
      return NextResponse.json(
        { error: 'Only candidates can apply for jobs' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const parsed = applySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { jobId, coverLetter } = parsed.data

    // Get candidate profile
    const candidate = await db.candidateProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!candidate) {
      return NextResponse.json(
        { error: 'Please complete your profile before applying' },
        { status: 400 }
      )
    }

    // Get job
    const job = await db.job.findUnique({
      where: { id: jobId, status: 'ACTIVE' },
      include: {
        hotel: {
          include: { employers: { take: 1, include: { user: true } } },
        },
      },
    })

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found or no longer accepting applications' },
        { status: 404 }
      )
    }

    // Check deadline
    if (job.applicationDeadline && job.applicationDeadline < new Date()) {
      return NextResponse.json(
        { error: 'The application deadline for this position has passed' },
        { status: 400 }
      )
    }

    // Check if already applied
    const existingApp = await db.application.findUnique({
      where: { jobId_candidateId: { jobId, candidateId: candidate.id } },
    })

    if (existingApp) {
      return NextResponse.json(
        { error: 'You have already applied for this position' },
        { status: 409 }
      )
    }

    // Create application + notifications in transaction
    const application = await db.$transaction(async (tx) => {
      const app = await tx.application.create({
        data: {
          jobId,
          hotelId: job.hotelId,
          candidateId: candidate.id,
          coverLetter,
          status: 'SUBMITTED',
        },
      })

      // Update job application count
      await tx.job.update({
        where: { id: jobId },
        data: { applicationCount: { increment: 1 } },
      })

      // Notify hotel employer
      if (job.hotel.employers[0]) {
        await tx.notification.create({
          data: {
            userId: job.hotel.employers[0].userId,
            type: NotificationType.APPLICATION_RECEIVED,
            title: 'New Application Received',
            body: `${candidate.firstName} ${candidate.lastName} applied for ${job.title}`,
            actionUrl: `/hotel/applications/${app.id}`,
            data: { applicationId: app.id, jobId, candidateId: candidate.id },
          },
        })
      }

      return app
    })

    return NextResponse.json(
      { status: 'success', data: { applicationId: application.id } },
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST /api/applications]', error)
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    )
  }
}

// GET /api/applications — Get applications for current user
export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
    const pageSize = Math.min(50, Number(searchParams.get('pageSize') ?? '20'))
    const status = searchParams.get('status') ?? undefined
    const hotelIdParam = searchParams.get('hotelId') ?? undefined

    if (session.user.role === 'CANDIDATE') {
      const candidate = await db.candidateProfile.findUnique({
        where: { userId: session.user.id },
      })

      if (!candidate) {
        return NextResponse.json({ status: 'success', data: { items: [], total: 0 } })
      }

      const [applications, total] = await Promise.all([
        db.application.findMany({
          where: {
            candidateId: candidate.id,
            ...(status && { status: status as 'SUBMITTED' }),
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * pageSize,
          take: pageSize,
          include: {
            job: {
              include: {
                hotel: {
                  select: {
                    id: true, name: true, logoUrl: true, city: true, starRating: true, isVerified: true,
                    employers: { take: 1, select: { userId: true } },
                  },
                },
              },
            },
          },
        }),
        db.application.count({
          where: { candidateId: candidate.id, ...(status && { status: status as import('@prisma/client').ApplicationStatus }) },
        }),
      ])

      return NextResponse.json({
        status: 'success',
        data: { items: applications, total, page, pageSize },
      })
    }

    if (session.user.role === 'HOTEL_EMPLOYER') {
      const employer = await db.hotelEmployer.findFirst({
        where: { userId: session.user.id, ...(hotelIdParam && { hotelId: hotelIdParam }) },
      })

      if (!employer) {
        return NextResponse.json({ status: 'success', data: { items: [], total: 0 } })
      }

      const [applications, total] = await Promise.all([
        db.application.findMany({
          where: {
            hotelId: employer.hotelId,
            ...(status && { status: status as import('@prisma/client').ApplicationStatus }),
          },
          orderBy: [{ isStarred: 'desc' }, { createdAt: 'desc' }],
          skip: (page - 1) * pageSize,
          take: pageSize,
          include: {
            candidate: {
              include: {
                user: { select: { id: true, name: true, image: true } },
                languages: true,
                skills: { take: 5 },
              },
            },
            job: { select: { title: true, department: true } },
          },
        }),
        db.application.count({
          where: { hotelId: employer.hotelId, ...(status && { status: status as import('@prisma/client').ApplicationStatus }) },
        }),
      ])

      return NextResponse.json({
        status: 'success',
        data: { items: applications, total, page, pageSize },
      })
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  } catch (error) {
    console.error('[GET /api/applications]', error)
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
  }
}
