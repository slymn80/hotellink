import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

const educationSchema = z.object({
  institution: z.string().min(1).max(150),
  degree: z.string().min(1).max(100),
  field: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
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
    const parsed = educationSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
    }

    const { startDate, endDate, ...rest } = parsed.data

    const education = await db.education.create({
      data: {
        candidateId: candidate.id,
        ...rest,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
      },
    })

    return NextResponse.json({ status: 'success', data: education }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/profile/candidate/education]', error)
    return NextResponse.json({ error: 'Failed to create education' }, { status: 500 })
  }
}
