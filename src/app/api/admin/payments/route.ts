import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

// GET /api/admin/payments — List all payments (admin)
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') ?? undefined
    const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
    const pageSize = Math.min(100, Number(searchParams.get('pageSize') ?? '20'))

    const where: Prisma.PaymentWhereInput = {
      ...(status && { status: status as Prisma.EnumPaymentStatusFilter }),
    }

    const [payments, total] = await Promise.all([
      db.payment.findMany({
        where,
        include: {
          subscription: { select: { plan: true, hotelId: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.payment.count({ where }),
    ])

    return NextResponse.json({
      status: 'success',
      data: { items: payments, total, page, pageSize },
    })
  } catch (error) {
    console.error('[GET /api/admin/payments]', error)
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}
