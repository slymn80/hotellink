import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import type { VerificationType, VerificationStatus } from '@prisma/client'

// GET /api/admin/verifications — List verifications
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') ?? undefined
    const type = searchParams.get('type') ?? undefined
    const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
    const pageSize = Math.min(50, Number(searchParams.get('pageSize') ?? '20'))

    const validTypes: VerificationType[] = ['HOTEL', 'DOCUMENT', 'IDENTITY', 'AGENCY']
    const validStatuses: VerificationStatus[] = ['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'MORE_INFO_REQUIRED']

    const where = {
      ...(status && validStatuses.includes(status as VerificationStatus) && { status: status as VerificationStatus }),
      ...(type && validTypes.includes(type as VerificationType) && { type: type as VerificationType }),
    }

    const [verifications, total] = await Promise.all([
      db.verification.findMany({
        where,
        orderBy: { submittedAt: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          hotel: {
            select: { name: true, city: true, email: true },
          },
        },
      }),
      db.verification.count({ where }),
    ])

    return NextResponse.json({
      status: 'success',
      data: { items: verifications, total, page, pageSize },
    })
  } catch (error) {
    console.error('[GET /api/admin/verifications]', error)
    return NextResponse.json({ error: 'Failed to fetch verifications' }, { status: 500 })
  }
}
