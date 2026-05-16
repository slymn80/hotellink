import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { sendHotelRejectedEmail } from '@/lib/email'

const schema = z.object({ reason: z.string().min(1) })

// POST /api/admin/hotels/[id]/reject
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Reason is required' }, { status: 400 })

    const hotel = await db.hotel.findUnique({
      where: { id: params.id },
      include: { employers: { include: { user: { select: { email: true, name: true } } }, take: 1 } },
    })

    await db.$transaction(async (tx) => {
      await tx.hotel.update({
        where: { id: params.id },
        data: { status: 'REJECTED', isVerified: false },
      })

      await tx.verification.updateMany({
        where: { entityId: params.id, entityType: 'hotel', status: { in: ['PENDING', 'IN_REVIEW'] } },
        data: {
          status: 'REJECTED',
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
          notes: parsed.data.reason,
        },
      })
    })

    if (hotel?.employers[0]?.user) {
      await sendHotelRejectedEmail({
        email: hotel.employers[0].user.email,
        ownerName: hotel.employers[0].user.name,
        hotelName: hotel.name,
        reason: parsed.data.reason,
      })
    }

    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('[POST /api/admin/hotels/[id]/reject]', error)
    return NextResponse.json({ error: 'Failed to reject hotel' }, { status: 500 })
  }
}
