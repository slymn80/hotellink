import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

// POST /api/user/delete — Soft-delete the current user's account
export async function POST() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Prevent admin accounts from self-deletion
    if (['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Admin accounts cannot be self-deleted' }, { status: 403 })
    }

    await db.user.update({
      where: { id: session.user.id },
      data: { deletedAt: new Date(), status: 'SUSPENDED' },
    })

    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('[POST /api/user/delete]', error)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
