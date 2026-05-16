import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

// GET /api/profile/hotel — Get hotel for current employer
export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const employer = await db.hotelEmployer.findFirst({
      where: { userId: session.user.id },
      include: { hotel: true },
    })

    if (!employer) {
      return NextResponse.json({ error: 'No hotel found' }, { status: 404 })
    }

    return NextResponse.json({ status: 'success', data: employer.hotel })
  } catch (error) {
    console.error('[GET /api/profile/hotel]', error)
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
  employeeCount: z.number().int().min(1).optional(),
  foundedYear: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  amenities: z.array(z.string()).optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  instagramUrl: z.string().url().optional().or(z.literal('')),
  languages: z.array(z.string()).optional(),
  // Working conditions
  accommodationProvided: z.boolean().optional(),
  accommodationDescription: z.string().max(3000).optional(),
  mealProvided: z.boolean().optional(),
  transportProvided: z.boolean().optional(),
  healthInsurance: z.boolean().optional(),
  uniformProvided: z.boolean().optional(),
  daysOffPerWeek: z.number().int().min(0).max(7).optional(),
  workingHoursInfo: z.string().max(200).optional(),
  workingConditionsNotes: z.string().max(5000).optional(),
})

// PATCH /api/profile/hotel — Update hotel profile
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'HOTEL_EMPLOYER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const employer = await db.hotelEmployer.findFirst({
      where: { userId: session.user.id },
    })

    if (!employer || !employer.isAdmin) {
      return NextResponse.json({ error: 'You must be a hotel admin to update the profile' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = updateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
    }

    const hotel = await db.hotel.update({
      where: { id: employer.hotelId },
      data: parsed.data,
    })

    return NextResponse.json({ status: 'success', data: hotel })
  } catch (error) {
    console.error('[PATCH /api/profile/hotel]', error)
    return NextResponse.json({ error: 'Failed to update hotel' }, { status: 500 })
  }
}
