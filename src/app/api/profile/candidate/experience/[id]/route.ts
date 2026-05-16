import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

const updateSchema = z.object({
  company: z.string().min(1).max(120).optional(),
  position: z.string().min(1).max(120).optional(),
  department: z.string().optional(),
  hotelType: z.string().optional(),
  country: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional().nullable(),
  isCurrent: z.boolean().optional(),
  description: z.string().max(2000).optional(),
})

async function getOwnedExperience(experienceId: string, userId: string) {
  const candidate = await db.candidateProfile.findUnique({ where: { userId } })
  if (!candidate) return null
  return db.workExperience.findFirst({ where: { id: experienceId, candidateId: candidate.id } })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const existing = await getOwnedExperience(id, session.user.id)
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const { startDate, endDate, department, hotelType, ...rest } = parsed.data

    const updated = await db.workExperience.update({
      where: { id },
      data: {
        ...rest,
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(department && { department: department as import('@prisma/client').JobDepartment }),
        ...(hotelType && { hotelType: hotelType as import('@prisma/client').HotelType }),
      },
    })

    return NextResponse.json({ status: 'success', data: updated })
  } catch (error) {
    console.error('[PATCH /api/profile/candidate/experience/[id]]', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const existing = await getOwnedExperience(id, session.user.id)
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await db.workExperience.delete({ where: { id } })
    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('[DELETE /api/profile/candidate/experience/[id]]', error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
