import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

const experienceSchema = z.object({
  company: z.string().min(1).max(120),
  position: z.string().min(1).max(120),
  department: z.string().optional(),
  hotelType: z.string().optional(),
  country: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().max(2000).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const candidate = await db.candidateProfile.findUnique({ where: { userId: session.user.id } })
    if (!candidate) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const body = await req.json()
    const parsed = experienceSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
    }

    const { startDate, endDate, department, hotelType, ...rest } = parsed.data

    const experience = await db.workExperience.create({
      data: {
        candidateId: candidate.id,
        ...rest,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        ...(department && { department: department as import('@prisma/client').JobDepartment }),
        ...(hotelType && { hotelType: hotelType as import('@prisma/client').HotelType }),
      },
    })

    return NextResponse.json({ status: 'success', data: experience }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/profile/candidate/experience]', error)
    return NextResponse.json({ error: 'Failed to create experience' }, { status: 500 })
  }
}
