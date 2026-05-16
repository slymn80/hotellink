import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const schema = z.object({
  token: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
})

// POST /api/auth/reset-password
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const { token, email, password } = parsed.data

    const verificationToken = await db.verificationToken.findUnique({
      where: { identifier_token: { identifier: email, token } },
    })

    if (!verificationToken) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 })
    }

    if (verificationToken.expires < new Date()) {
      await db.verificationToken.delete({
        where: { identifier_token: { identifier: email, token } },
      })
      return NextResponse.json({ error: 'Reset link has expired. Please request a new one.' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { email },
        data: { password: hashedPassword },
      })

      await tx.verificationToken.delete({
        where: { identifier_token: { identifier: email, token } },
      })
    })

    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('[POST /api/auth/reset-password]', error)
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
  }
}
