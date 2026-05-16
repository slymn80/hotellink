import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { NotificationType } from '@prisma/client'
import { sendApplicationStatusEmail } from '@/lib/email'

const updateSchema = z.object({
  status: z.enum([
    'SUBMITTED', 'REVIEWING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED',
    'INTERVIEW_COMPLETED', 'OFFER_EXTENDED', 'OFFER_ACCEPTED', 'OFFER_DECLINED',
    'REJECTED', 'WITHDRAWN',
  ]).optional(),
  isStarred: z.boolean().optional(),
  notes: z.string().max(2000).optional(),
})

// PATCH /api/applications/[id] — Update application status (hotel employer only)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const application = await db.application.findUnique({
      where: { id: params.id },
      include: {
        job: true,
        hotel: { include: { employers: true } },
        candidate: { include: { user: true } },
      },
    })

    if (!application) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Check permissions
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN'
    const isEmployer = application.hotel.employers.some((e) => e.userId === session.user.id)
    const isCandidate = application.candidate.userId === session.user.id

    if (!isAdmin && !isEmployer && !isCandidate) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    // Candidates can only withdraw
    if (isCandidate && !isAdmin && parsed.data.status && parsed.data.status !== 'WITHDRAWN' as string) {
      return NextResponse.json({ error: 'Candidates can only withdraw applications' }, { status: 403 })
    }

    const { notes, ...statusData } = parsed.data
    const updated = await db.application.update({
      where: { id: params.id },
      data: {
        ...(statusData.status && { status: statusData.status as import('@prisma/client').ApplicationStatus }),
        ...(statusData.isStarred !== undefined && { isStarred: statusData.isStarred }),
        ...(notes !== undefined && { employerNotes: notes }),
      },
    })

    // Notify candidate of status change
    if (parsed.data.status && parsed.data.status !== application.status && isEmployer) {
      const statusMessages: Record<string, string> = {
        REVIEWING: 'Your application is being reviewed',
        SHORTLISTED: 'Great news! You\'ve been shortlisted',
        INTERVIEW_SCHEDULED: 'Your interview has been scheduled',
        INTERVIEW_COMPLETED: 'Your interview has been completed',
        OFFER_EXTENDED: 'You\'ve received a job offer!',
        OFFER_ACCEPTED: 'Congratulations! Your offer has been confirmed',
        REJECTED: 'Update on your application status',
      }

      const message = statusMessages[parsed.data.status]
      if (message) {
        await db.notification.create({
          data: {
            userId: application.candidate.userId,
            type: NotificationType.APPLICATION_STATUS_UPDATED,
            title: message,
            body: `Your application for ${application.job.title} has been updated`,
            actionUrl: `/candidate/applications`,
            data: { applicationId: params.id, newStatus: parsed.data.status },
          },
        })

        // Send email notification
        await sendApplicationStatusEmail({
          email: application.candidate.user.email!,
          candidateName: application.candidate.user.name,
          jobTitle: application.job.title,
          hotelName: application.hotel.name,
          newStatus: parsed.data.status,
        })
      }
    }

    return NextResponse.json({ status: 'success', data: updated })
  } catch (error) {
    console.error('[PATCH /api/applications/[id]]', error)
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 })
  }
}

// GET /api/applications/[id] — Get a single application
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const application = await db.application.findUnique({
      where: { id: params.id },
      include: {
        job: {
          include: {
            hotel: { select: { name: true, logoUrl: true, city: true, starRating: true } },
          },
        },
        candidate: {
          include: {
            user: { select: { name: true, image: true } },
            languages: true,
            skills: true,
            documents: {
              where: { type: 'CV_RESUME' },
              select: { id: true, fileUrl: true, name: true },
            },
          },
        },
      },
    })

    if (!application) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ status: 'success', data: application })
  } catch (error) {
    console.error('[GET /api/applications/[id]]', error)
    return NextResponse.json({ error: 'Failed to fetch application' }, { status: 500 })
  }
}
