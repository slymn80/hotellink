import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

// GET /api/jobs/saved — List saved jobs for the authenticated candidate
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'CANDIDATE') {
      return NextResponse.json({ status: 'success', data: { items: [], total: 0 } })
    }

    const candidate = await db.candidateProfile.findUnique({
      where: { userId: session.user.id },
    })
    if (!candidate) {
      return NextResponse.json({ status: 'success', data: { items: [], total: 0 } })
    }

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
    const pageSize = Math.min(50, Number(searchParams.get('pageSize') ?? '20'))

    const [items, total] = await Promise.all([
      db.savedJob.findMany({
        where: { candidateId: candidate.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              slug: true,
              department: true,
              type: true,
              city: true,
              salaryMin: true,
              salaryMax: true,
              salaryCurrency: true,
              showSalary: true,
              accommodationProvided: true,
              workPermitAssistance: true,
              isFeatured: true,
              publishedAt: true,
              createdAt: true,
              hotel: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  city: true,
                  logoUrl: true,
                  isVerified: true,
                },
              },
            },
          },
        },
      }),
      db.savedJob.count({ where: { candidateId: candidate.id } }),
    ])

    return NextResponse.json({
      status: 'success',
      data: { items, total, page, pageSize },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
