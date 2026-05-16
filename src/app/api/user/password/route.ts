import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
})

// POST /api/user/password — Change password for authenticated user
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, password: true },
    })

    if (!user || !user.password) {
      return NextResponse.json({ error: 'Password change not available for OAuth accounts' }, { status: 400 })
    }

    const valid = await bcrypt.compare(parsed.data.currentPassword, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(parsed.data.newPassword, 12)
    await db.user.update({
      where: { id: session.user.id },
      data: { password: hashed },
    })

    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('[POST /api/user/password]', error)
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
  }
}
