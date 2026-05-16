import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/en/login?error=invalid_token', req.url))
  }

  const record = await db.verificationToken.findUnique({
    where: { token },
  })

  if (!record || record.expires < new Date() || record.type !== 'email') {
    return NextResponse.redirect(new URL('/en/login?error=token_expired', req.url))
  }

  await db.user.update({
    where: { email: record.identifier },
    data: { emailVerified: new Date() },
  })

  await db.verificationToken.delete({ where: { token } })

  return NextResponse.redirect(new URL('/en/login?verified=1', req.url))
}
