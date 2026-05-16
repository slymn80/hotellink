import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { NotificationType } from '@prisma/client'

// POST /api/admin/verifications/[id]/approve
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const verification = await db.verification.findUnique({ where: { id: params.id } })
    if (!verification) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await db.$transaction(async (tx) => {
      await tx.verification.update({
        where: { id: params.id },
        data: { status: 'APPROVED', reviewedBy: session.user.id, reviewedAt: new Date() },
      })

      if (verification.entityType === 'hotel') {
        await tx.hotel.update({
          where: { id: verification.entityId },
          data: { status: 'VERIFIED', isVerified: true, verifiedAt: new Date() },
        })

        // Notify all employers of this hotel
        const employers = await tx.hotelEmployer.findMany({
          where: { hotelId: verification.entityId },
          select: { userId: true, hotel: { select: { name: true, id: true } } },
        })

        await tx.notification.createMany({
          data: employers.map((e) => ({
            userId: e.userId,
            type: NotificationType.HOTEL_VERIFIED,
            title: 'Hotel profile verified!',
            body: `${e.hotel.name} has been verified and is now live on HotelLink.`,
            actionUrl: `/hotel/${e.hotel.id}`,
          })),
        })
      }
    })

    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('[POST /api/admin/verifications/[id]/approve]', error)
    return NextResponse.json({ error: 'Failed to approve' }, { status: 500 })
  }
}
