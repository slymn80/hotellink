import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { z } from 'zod'
import { db } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  confirmPassword: z.string(),
  role: z.enum(['CANDIDATE', 'HOTEL_EMPLOYER', 'HR_AGENCY']),
  agreeTerms: z.boolean().refine((v) => v === true),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { name, email, password, confirmPassword, role } = parsed.data

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user in transaction
    const user = await db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
          onboardingCompleted: true,
          gdprConsentAt: new Date(),
        },
      })

      // Create role-specific profile
      if (role === 'CANDIDATE') {
        await tx.candidateProfile.create({
          data: {
            userId: newUser.id,
            firstName: name.split(' ')[0],
            lastName: name.split(' ').slice(1).join(' ') || '',
            nationality: '',
            profileScore: 10,
          },
        })
      }

      // Log the action
      await tx.auditLog.create({
        data: {
          userId: newUser.id,
          action: 'CREATE',
          resource: 'user',
          resourceId: newUser.id,
          newValues: { email, role },
        },
      })

      return newUser
    })

    // Create verification token
    const token = crypto.randomBytes(32).toString('hex')
    await db.verificationToken.create({
      data: {
        identifier: user.email,
        token,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        type: 'email',
      },
    })

    await sendVerificationEmail({ email: user.email, name: user.name, token })

    return NextResponse.json(
      {
        status: 'success',
        message: 'Account created. Please check your email to verify your account.',
        userId: user.id,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[REGISTER]', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
