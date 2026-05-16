import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { NotificationType } from '@prisma/client'

const schema = z.object({ reason: z.string().min(1) })

// POST /api/admin/verifications/[id]/reject
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Reason required' }, { status: 400 })

    const verification = await db.verification.findUnique({ where: { id: params.id } })
    if (!verification) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await db.$transaction(async (tx) => {
      await tx.verification.update({
        where: { id: params.id },
        data: {
          status: 'REJECTED',
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
          notes: parsed.data.reason,
        },
      })

      if (verification.entityType === 'hotel') {
        await tx.hotel.update({
          where: { id: verification.entityId },
          data: { status: 'REJECTED' },
        })

        // Notify all employers of this hotel
        const employers = await tx.hotelEmployer.findMany({
          where: { hotelId: verification.entityId },
          select: { userId: true, hotel: { select: { name: true, id: true } } },
        })

        await tx.notification.createMany({
          data: employers.map((e) => ({
            userId: e.userId,
            type: NotificationType.HOTEL_REJECTED,
            title: 'Verification rejected',
            body: `${e.hotel.name}: ${parsed.data.reason}`,
            actionUrl: `/hotel/${e.hotel.id}`,
          })),
        })
      }
    })

    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('[POST /api/admin/verifications/[id]/reject]', error)
    return NextResponse.json({ error: 'Failed to reject' }, { status: 500 })
  }
}
