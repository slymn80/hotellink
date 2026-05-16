import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/prisma'

// GET /api/auth/check-account?email=xxx
// Returns the sign-in method for a given email (used to show helpful errors on the login page)
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')
  if (!email) return NextResponse.json({ method: 'not_found' })

  const user = await db.user.findUnique({
    where: { email },
    select: {
      password: true,
      accounts: { select: { provider: true }, take: 1 },
    },
  })

  if (!user) return NextResponse.json({ method: 'not_found' })
  if (user.password) return NextResponse.json({ method: 'credentials' })

  const provider = user.accounts[0]?.provider ?? 'google'
  return NextResponse.json({ method: provider })
}
