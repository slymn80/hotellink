import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

// GET /api/messages/unread — Count of unread messages for current user
export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ count: 0 })

    const count = await db.message.count({
      where: { receiverId: session.user.id, status: 'SENT' },
    })

    return NextResponse.json({ count })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
