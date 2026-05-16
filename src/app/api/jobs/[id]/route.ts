import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

// GET /api/jobs/[id] — Get a single job
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const job = await db.job.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
        deletedAt: null,
      },
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
            slug: true,
            shortDescription: true,
            type: true,
            starRating: true,
            city: true,
            country: true,
            logoUrl: true,
            coverImageUrl: true,
            isVerified: true,
            isFeatured: true,
            amenities: true,
            averageRating: true,
            _count: { select: { jobs: true } },
          },
        },
        _count: {
          select: { applications: true, savedBy: true },
        },
      },
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Increment view count non-blocking
    db.job
      .update({ where: { id: job.id }, data: { viewCount: { increment: 1 } } })
      .catch(() => {})

    return NextResponse.json({ status: 'success', data: job })
  } catch (error) {
    console.error('[GET /api/jobs/[id]]', error)
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 })
  }
}

const updateJobSchema = z.object({
  title: z.string().min(3).max(120).optional(),
  description: z.string().min(50).optional(),
  requirements: z.string().optional(),
  responsibilities: z.string().optional(),
  benefits: z.string().optional(),
  department: z.string().optional(),
  type: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'CLOSED', 'FILLED']).optional(),
  experienceMin: z.number().min(0).optional(),
  experienceMax: z.number().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  salaryCurrency: z.string().optional(),
  showSalary: z.boolean().optional(),
  requiredLanguages: z.array(z.string()).optional(),
  accommodationProvided: z.boolean().optional(),
  mealProvided: z.boolean().optional(),
  transportProvided: z.boolean().optional(),
  visaSponsorship: z.boolean().optional(),
  workPermitAssistance: z.boolean().optional(),
  applicationDeadline: z.string().datetime().optional().nullable(),
  openings: z.number().min(1).optional(),
  isFeatured: z.boolean().optional(),
})

// PATCH /api/jobs/[id] — Update a job
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const job = await db.job.findFirst({
      where: { id: params.id, deletedAt: null },
      include: { hotel: { include: { employers: true } } },
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Only hotel employer who owns the hotel OR admin can update
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN'
    const isOwner = job.hotel.employers.some((e) => e.userId === session.user.id)

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = updateJobSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { applicationDeadline, status, ...rest } = parsed.data

    const { department, type: jobType, requiredLanguages, ...restData } = rest
    const updatedJob = await db.job.update({
      where: { id: params.id },
      data: {
        ...restData,
        ...(department && { department: department as import('@prisma/client').JobDepartment }),
        ...(jobType && { type: jobType as import('@prisma/client').JobType }),
        ...(requiredLanguages && { requiredLanguages }),
        ...(applicationDeadline !== undefined && {
          applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
        }),
        ...(status && {
          status,
          ...(status === 'ACTIVE' && !job.publishedAt && { publishedAt: new Date() }),
        }),
      },
    })

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        resource: 'job',
        resourceId: job.id,
        newValues: parsed.data,
      },
    })

    return NextResponse.json({ status: 'success', data: updatedJob })
  } catch (error) {
    console.error('[PATCH /api/jobs/[id]]', error)
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 })
  }
}

// DELETE /api/jobs/[id] — Soft delete a job
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const job = await db.job.findFirst({
      where: { id: params.id, deletedAt: null },
      include: { hotel: { include: { employers: true } } },
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN'
    const isOwner = job.hotel.employers.some((e) => e.userId === session.user.id)

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await db.job.update({
      where: { id: params.id },
      data: { deletedAt: new Date(), status: 'CLOSED' },
    })

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE',
        resource: 'job',
        resourceId: params.id,
      },
    })

    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('[DELETE /api/jobs/[id]]', error)
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 })
  }
}
