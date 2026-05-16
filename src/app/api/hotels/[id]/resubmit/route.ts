import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

const schema = z.object({
  documents: z.array(z.string().url()).min(1, 'At least one document URL required'),
  notes: z.string().optional(),
})

// POST /api/hotels/[id]/resubmit — Re-submit for verification after rejection
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Confirm caller is an employer of this hotel
    const employer = await db.hotelEmployer.findFirst({
      where: { hotelId: params.id, userId: session.user.id },
    })
    if (!employer) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const hotel = await db.hotel.findUnique({ where: { id: params.id } })
    if (!hotel) return NextResponse.json({ error: 'Hotel not found' }, { status: 404 })
    if (hotel.status !== 'REJECTED') {
      return NextResponse.json({ error: 'Only rejected hotels can be resubmitted' }, { status: 409 })
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    await db.$transaction(async (tx) => {
      // Reset hotel status
      await tx.hotel.update({
        where: { id: params.id },
        data: { status: 'PENDING_VERIFICATION' },
      })

      // Create a fresh verification record
      await tx.verification.create({
        data: {
          type: 'HOTEL',
          entityId: params.id,
          entityType: 'hotel',
          documents: parsed.data.documents,
          notes: parsed.data.notes,
        },
      })
    })

    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('[POST /api/hotels/[id]/resubmit]', error)
    return NextResponse.json({ error: 'Failed to resubmit' }, { status: 500 })
  }
}
