import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

async function getAccess(userId: string, hotelId: string) {
  return db.hotelEmployer.findFirst({
    where: { userId, hotelId },
  })
}

// GET /api/profile/hotel/[hotelId]
export async function GET(
  _req: NextRequest,
  { params }: { params: { hotelId: string } }
) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const employer = await getAccess(session.user.id, params.hotelId)
    if (!employer) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const hotel = await db.hotel.findUnique({ where: { id: params.hotelId } })
    return NextResponse.json({ status: 'success', data: hotel })
  } catch (error) {
    console.error('[GET /api/profile/hotel/[hotelId]]', error)
    return NextResponse.json({ error: 'Failed to fetch hotel' }, { status: 500 })
  }
}

const updateSchema = z.object({
  name: z.string().min(3).max(120).optional(),
  shortDescription: z.string().max(300).optional(),
  description: z.string().max(5000).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional().or(z.literal('')),
  address: z.string().max(300).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(10).optional(),
  roomCount: z.number().int().min(1).optional(),
  amenities: z.array(z.string()).optional(),
})

// PATCH /api/profile/hotel/[hotelId]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { hotelId: string } }
) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const employer = await getAccess(session.user.id, params.hotelId)
    if (!employer || !employer.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
    }

    const hotel = await db.hotel.update({
      where: { id: params.hotelId },
      data: parsed.data,
    })

    return NextResponse.json({ status: 'success', data: hotel })
  } catch (error) {
    console.error('[PATCH /api/profile/hotel/[hotelId]]', error)
    return NextResponse.json({ error: 'Failed to update hotel' }, { status: 500 })
  }
}
