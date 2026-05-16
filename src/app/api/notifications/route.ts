import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

// GET /api/notifications — Get notifications for current user
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const unreadOnly = searchParams.get('unread') === 'true'
    const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
    const pageSize = Math.min(50, Number(searchParams.get('pageSize') ?? '20'))

    const where = {
      userId: session.user.id,
      ...(unreadOnly && { isRead: false }),
    }

    const [notifications, total, unreadCount] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.notification.count({ where }),
      db.notification.count({ where: { userId: session.user.id, isRead: false } }),
    ])

    return NextResponse.json({
      status: 'success',
      data: { items: notifications, total, unreadCount, page, pageSize },
    })
  } catch (error) {
    console.error('[GET /api/notifications]', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

// PATCH /api/notifications — Mark notifications as read
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const ids: string[] = body.ids ?? []
    const markAll: boolean = body.markAll ?? false

    if (markAll) {
      await db.notification.updateMany({
        where: { userId: session.user.id, isRead: false },
        data: { isRead: true, readAt: new Date() },
      })
    } else if (ids.length > 0) {
      await db.notification.updateMany({
        where: { userId: session.user.id, id: { in: ids } },
        data: { isRead: true, readAt: new Date() },
      })
    }

    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('[PATCH /api/notifications]', error)
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 })
  }
}
