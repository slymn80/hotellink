import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

const schema = z.object({
  email: z.string().email(),
})

// POST /api/auth/forgot-password — Send password reset email
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const { email } = parsed.data

    const user = await db.user.findUnique({
      where: { email, deletedAt: null },
    })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ status: 'success' })
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await db.verificationToken.upsert({
      where: { identifier_token: { identifier: email, token } },
      update: { token, expires },
      create: { identifier: email, token, expires },
    })

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/en/reset-password?token=${token}&email=${encodeURIComponent(email)}`

    await sendPasswordResetEmail({ email, resetUrl, name: user.name })

    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('[POST /api/auth/forgot-password]', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
