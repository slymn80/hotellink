import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

// GET /api/admin/payments/export — Download payments as CSV
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') ?? undefined

    const where: Prisma.PaymentWhereInput = {
      ...(status && { status: status as Prisma.EnumPaymentStatusFilter }),
    }

    const payments = await db.payment.findMany({
      where,
      include: { subscription: { select: { plan: true, hotel: { select: { name: true, city: true } } } } },
      orderBy: { createdAt: 'desc' },
      take: 10000,
    })

    const escape = (v: string | number | null | undefined) => {
      if (v == null) return ''
      const s = String(v)
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
    }

    const header = ['ID', 'Hotel', 'City', 'Plan', 'Description', 'Amount', 'Currency', 'Status', 'Paid At', 'Created At']
    const rows = payments.map((p) => [
      escape(p.id),
      escape(p.subscription?.hotel?.name),
      escape(p.subscription?.hotel?.city),
      escape(p.subscription?.plan),
      escape(p.description),
      escape(Number(p.amount)),
      escape(p.currency),
      escape(p.status),
      escape(p.paidAt?.toISOString()),
      escape(p.createdAt.toISOString()),
    ])

    const csv = [header, ...rows].map((r) => r.join(',')).join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="payments-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    })
  } catch (error) {
    console.error('[GET /api/admin/payments/export]', error)
    return NextResponse.json({ error: 'Failed to export payments' }, { status: 500 })
  }
}
