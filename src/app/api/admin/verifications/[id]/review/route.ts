import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

// POST /api/admin/verifications/[id]/review — Mark as in review
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await db.verification.update({
      where: { id: params.id },
      data: { status: 'IN_REVIEW', reviewedBy: session.user.id },
    })

    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('[POST /api/admin/verifications/[id]/review]', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
