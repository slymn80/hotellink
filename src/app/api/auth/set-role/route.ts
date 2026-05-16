import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  role: z.enum(['CANDIDATE', 'HOTEL_EMPLOYER', 'HR_AGENCY']),
})

// POST /api/auth/set-role — Called during Google onboarding to assign a role
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const { role } = parsed.data

    await db.user.update({
      where: { id: session.user.id },
      data: { role, onboardingCompleted: true },
    })

    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('[POST /api/auth/set-role]', error)
    return NextResponse.json({ error: 'Failed to set role' }, { status: 500 })
  }
}
