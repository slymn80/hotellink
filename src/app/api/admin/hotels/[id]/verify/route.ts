import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { sendHotelVerifiedEmail } from '@/lib/email'

// POST /api/admin/hotels/[id]/verify
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const hotel = await db.hotel.findUnique({
      where: { id: params.id },
      include: { employers: { include: { user: { select: { email: true, name: true } } }, take: 1 } },
    })

    await db.$transaction(async (tx) => {
      await tx.hotel.update({
        where: { id: params.id },
        data: { status: 'VERIFIED', isVerified: true },
      })

      await tx.verification.updateMany({
        where: { entityId: params.id, entityType: 'hotel', status: { in: ['PENDING', 'IN_REVIEW'] } },
        data: { status: 'APPROVED', reviewedBy: session.user.id, reviewedAt: new Date() },
      })

      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'UPDATE',
          resource: 'hotel',
          resourceId: params.id,
          newValues: { status: 'VERIFIED', isVerified: true },
        },
      })
    })

    if (hotel?.employers[0]?.user) {
      await sendHotelVerifiedEmail({
        email: hotel.employers[0].user.email,
        ownerName: hotel.employers[0].user.name,
        hotelName: hotel.name,
      })
    }

    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('[POST /api/admin/hotels/[id]/verify]', error)
    return NextResponse.json({ error: 'Failed to verify hotel' }, { status: 500 })
  }
}
