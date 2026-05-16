import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { slugify } from '@/lib/utils'
import type { Prisma } from '@prisma/client'

// ============================================================
// GET /api/jobs — Public job search
// ============================================================
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const query = searchParams.get('q') ?? undefined
    const city = searchParams.get('city') ?? undefined
    const department = searchParams.get('department') ?? undefined
    const type = searchParams.get('type') ?? undefined
    const salaryMin = searchParams.get('salaryMin') ? Number(searchParams.get('salaryMin')) : undefined
    const salaryMax = searchParams.get('salaryMax') ? Number(searchParams.get('salaryMax')) : undefined
    const language = searchParams.get('language') ?? undefined
    const accommodation = searchParams.get('accommodation') === 'true' ? true : undefined
    const workPermit = searchParams.get('workPermit') === 'true' ? true : undefined
    const isFeatured = searchParams.get('featured') === 'true' ? true : undefined
    const hotelId = searchParams.get('hotelId') ?? undefined
    const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
    const pageSize = Math.min(50, Math.max(1, Number(searchParams.get('pageSize') ?? '20')))
    const sortBy = searchParams.get('sort') ?? 'newest'

    const where: Prisma.JobWhereInput = {
      status: 'ACTIVE',
      deletedAt: null,
      ...(hotelId && { hotelId }),
      ...(query && {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { hotel: { name: { contains: query, mode: 'insensitive' } } },
        ],
      }),
      ...(city && { city: { contains: city, mode: 'insensitive' } }),
      ...(department && { department: department as Prisma.EnumJobDepartmentFilter }),
      ...(type && { type: type as Prisma.EnumJobTypeFilter }),
      ...(salaryMin !== undefined && { salaryMin: { gte: salaryMin } }),
      ...(salaryMax !== undefined && { salaryMax: { lte: salaryMax } }),
      ...(language && { requiredLanguages: { has: language } }),
      ...(accommodation !== undefined && { accommodationProvided: accommodation }),
      ...(workPermit !== undefined && { workPermitAssistance: workPermit }),
      ...(isFeatured !== undefined && { isFeatured }),
    }

    const orderBy: Prisma.JobOrderByWithRelationInput =
      sortBy === 'salary_asc'
        ? { salaryMin: 'asc' }
        : sortBy === 'salary_desc'
          ? { salaryMin: 'desc' }
          : sortBy === 'featured'
            ? { isFeatured: 'desc' }
            : { createdAt: 'desc' }

    const [jobs, total] = await Promise.all([
      db.job.findMany({
        where,
        orderBy: [{ isFeatured: 'desc' }, orderBy],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          hotel: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
              city: true,
              starRating: true,
              isVerified: true,
              type: true,
            },
          },
          _count: {
            select: { applications: true, savedBy: true },
          },
        },
      }),
      db.job.count({ where }),
    ])

    // Increment view counts in background
    if (jobs.length > 0) {
      db.job
        .updateMany({
          where: { id: { in: jobs.map((j) => j.id) } },
          data: { viewCount: { increment: 1 } },
        })
        .catch(() => {}) // Non-blocking
    }

    return NextResponse.json({
      status: 'success',
      data: {
        items: jobs,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        hasNextPage: page * pageSize < total,
        hasPreviousPage: page > 1,
      },
    })
  } catch (error) {
    console.error('[GET /api/jobs]', error)
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}

// ============================================================
// POST /api/jobs — Create a new job (Hotel employers only)
// ============================================================
export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'HOTEL_EMPLOYER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()

    // Get hotel for this employer
    const employer = await db.hotelEmployer.findFirst({
      where: { userId: session.user.id },
      include: {
        hotel: {
          include: {
            subscriptions: {
              where: { status: 'ACTIVE' },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    })

    if (!employer) {
      return NextResponse.json(
        { error: 'You must be associated with a hotel to post jobs' },
        { status: 403 }
      )
    }

    // Check subscription limits
    const subscription = employer.hotel.subscriptions[0]
    if (subscription) {
      const activeJobCount = await db.job.count({
        where: { hotelId: employer.hotelId, status: 'ACTIVE' },
      })

      if (activeJobCount >= subscription.jobPostingLimit) {
        return NextResponse.json(
          { error: 'You have reached your job posting limit. Please upgrade your subscription.' },
          { status: 403 }
        )
      }
    }

    const slug = `${slugify(body.title)}-${employer.hotelId.slice(-6)}-${Date.now()}`

    const job = await db.job.create({
      data: {
        hotelId: employer.hotelId,
        title: body.title,
        slug,
        description: body.description,
        requirements: body.requirements,
        responsibilities: body.responsibilities,
        benefits: body.benefits,
        department: body.department,
        type: body.type ?? 'FULL_TIME',
        status: body.status === 'ACTIVE' ? 'ACTIVE' : 'DRAFT',
        experienceMin: body.experienceMin ?? 0,
        experienceMax: body.experienceMax,
        salaryMin: body.salaryMin,
        salaryMax: body.salaryMax,
        salaryCurrency: body.salaryCurrency ?? 'USD',
        showSalary: body.showSalary ?? true,
        requiredLanguages: body.requiredLanguages ?? [],
        accommodationProvided: body.accommodationProvided ?? false,
        mealProvided: body.mealProvided ?? false,
        transportProvided: body.transportProvided ?? false,
        visaSponsorship: body.visaSponsorship ?? false,
        workPermitAssistance: body.workPermitAssistance ?? false,
        applicationDeadline: body.applicationDeadline ? new Date(body.applicationDeadline) : undefined,
        openings: body.openings ?? 1,
        publishedAt: body.status === 'ACTIVE' ? new Date() : undefined,
      },
      include: {
        hotel: { select: { name: true, city: true } },
      },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE',
        resource: 'job',
        resourceId: job.id,
        newValues: { title: job.title, hotelId: employer.hotelId },
      },
    })

    return NextResponse.json({ status: 'success', data: job }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/jobs]', error)
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
  }
}
