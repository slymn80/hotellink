import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

// GET /api/admin/tickets/[id] — Get ticket with replies
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const ticket = await db.supportTicket.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        replies: {
          include: { ticket: false },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })

    return NextResponse.json({ status: 'success', data: ticket })
  } catch (error) {
    console.error('[GET /api/admin/tickets/[id]]', error)
    return NextResponse.json({ error: 'Failed to fetch ticket' }, { status: 500 })
  }
}

// PATCH /api/admin/tickets/[id] — Update ticket status
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { status } = body

    const ticket = await db.supportTicket.update({
      where: { id: params.id },
      data: {
        status,
        ...(status === 'RESOLVED' ? { resolvedAt: new Date() } : {}),
      },
    })

    return NextResponse.json({ status: 'success', data: ticket })
  } catch (error) {
    console.error('[PATCH /api/admin/tickets/[id]]', error)
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 })
  }
}

// POST /api/admin/tickets/[id] — Add a staff reply
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { content } = await req.json()
    if (!content?.trim()) {
      return NextResponse.json({ error: 'Reply content is required' }, { status: 400 })
    }

    const reply = await db.supportReply.create({
      data: {
        ticketId: params.id,
        authorId: session.user.id,
        content: content.trim(),
        isStaff: true,
      },
    })

    // Move ticket to IN_PROGRESS if it was OPEN
    await db.supportTicket.updateMany({
      where: { id: params.id, status: 'OPEN' },
      data: { status: 'IN_PROGRESS' },
    })

    return NextResponse.json({ status: 'success', data: reply }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/tickets/[id]]', error)
    return NextResponse.json({ error: 'Failed to send reply' }, { status: 500 })
  }
}
