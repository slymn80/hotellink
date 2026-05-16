import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

const updateSchema = z.object({
  isFeatured: z.boolean().optional(),
  status: z.enum(['PENDING_VERIFICATION', 'VERIFIED', 'REJECTED', 'SUSPENDED']).optional(),
})

// PATCH /api/admin/hotels/[id]
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

    const hotel = await db.hotel.update({
      where: { id: params.id },
      data: {
        ...(parsed.data.isFeatured !== undefined && { isFeatured: parsed.data.isFeatured }),
        ...(parsed.data.status && { status: parsed.data.status as import('@prisma/client').HotelStatus }),
        ...(parsed.data.status === 'VERIFIED' && { isVerified: true }),
      },
    })

    return NextResponse.json({ status: 'success', data: hotel })
  } catch (error) {
    console.error('[PATCH /api/admin/hotels/[id]]', error)
    return NextResponse.json({ error: 'Failed to update hotel' }, { status: 500 })
  }
}
