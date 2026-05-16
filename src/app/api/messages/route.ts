import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { NotificationType } from '@prisma/client'
import { sendMessageNotificationEmail } from '@/lib/email'

const sendMessageSchema = z.object({
  receiverId: z.string().cuid(),
  content: z.string().min(1).max(5000),
  applicationId: z.string().cuid().optional(),
})

// POST /api/messages — Send a message
export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = sendMessageSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { receiverId, content, applicationId } = parsed.data

    if (receiverId === session.user.id) {
      return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 })
    }

    const recipient = await db.user.findUnique({
      where: { id: receiverId, deletedAt: null },
    })

    if (!recipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
    }

    const message = await db.$transaction(async (tx) => {
      const msg = await tx.message.create({
        data: {
          senderId: session.user.id,
          receiverId,
          content,
        },
        include: {
          sender: { select: { id: true, name: true, image: true } },
        },
      })

      await tx.notification.create({
        data: {
          userId: receiverId,
          type: NotificationType.MESSAGE_RECEIVED,
          title: 'New Message',
          body: `${session.user.name ?? 'Someone'} sent you a message`,
          actionUrl: `/dashboard/messages`,
          data: { messageId: msg.id, senderId: session.user.id },
        },
      })

      return msg
    })

    // Send email notification (fire-and-forget, outside transaction)
    await sendMessageNotificationEmail({
      recipientEmail: recipient.email,
      recipientName: recipient.name,
      senderName: session.user.name ?? 'Someone',
      preview: content,
    })

    return NextResponse.json({ status: 'success', data: message }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/messages]', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}

// GET /api/messages — Get conversations for current user
export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const withUserId = searchParams.get('with') ?? undefined
    const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
    const pageSize = Math.min(50, Number(searchParams.get('pageSize') ?? '30'))

    if (withUserId) {
      // Get conversation with a specific user
      const [messages, total] = await Promise.all([
        db.message.findMany({
          where: {
            OR: [
              { senderId: session.user.id, receiverId: withUserId },
              { senderId: withUserId, receiverId: session.user.id },
            ],
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * pageSize,
          take: pageSize,
          include: {
            sender: { select: { id: true, name: true, image: true } },
          },
        }),
        db.message.count({
          where: {
            OR: [
              { senderId: session.user.id, receiverId: withUserId },
              { senderId: withUserId, receiverId: session.user.id },
            ],
          },
        }),
      ])

      // Mark received messages as read
      await db.message.updateMany({
        where: {
          senderId: withUserId,
          receiverId: session.user.id,
          status: 'SENT',
        },
        data: { status: 'READ', readAt: new Date() },
      })

      return NextResponse.json({
        status: 'success',
        data: { items: messages.reverse(), total, page, pageSize },
      })
    }

    // Get list of conversations (latest message per user pair)
    const conversations = await db.$queryRaw<Array<{
      partnerId: string
      partnerName: string | null
      partnerImage: string | null
      lastMessage: string
      lastMessageAt: Date
      unreadCount: bigint
    }>>`
      SELECT DISTINCT ON (partner_id)
        partner_id as "partnerId",
        partner_name as "partnerName",
        partner_image as "partnerImage",
        last_message as "lastMessage",
        last_message_at as "lastMessageAt",
        unread_count as "unreadCount"
      FROM (
        SELECT
          CASE
            WHEN m.sender_id = ${session.user.id} THEN m.receiver_id
            ELSE m.sender_id
          END as partner_id,
          CASE
            WHEN m.sender_id = ${session.user.id} THEN u_r.name
            ELSE u_s.name
          END as partner_name,
          CASE
            WHEN m.sender_id = ${session.user.id} THEN u_r.image
            ELSE u_s.image
          END as partner_image,
          m.content as last_message,
          m.created_at as last_message_at,
          COUNT(CASE WHEN m.receiver_id = ${session.user.id} AND m.status = 'SENT' THEN 1 END) as unread_count,
          ROW_NUMBER() OVER (
            PARTITION BY CASE
              WHEN m.sender_id = ${session.user.id} THEN m.receiver_id
              ELSE m.sender_id
            END
            ORDER BY m.created_at DESC
          ) as rn
        FROM messages m
        LEFT JOIN users u_s ON u_s.id = m.sender_id
        LEFT JOIN users u_r ON u_r.id = m.receiver_id
        WHERE m.sender_id = ${session.user.id} OR m.receiver_id = ${session.user.id}
        GROUP BY m.id, u_r.name, u_r.image, u_s.name, u_s.image
      ) ranked
      WHERE rn = 1
      ORDER BY partner_id, last_message_at DESC
    `

    return NextResponse.json({
      status: 'success',
      data: {
        conversations: conversations.map((c) => ({
          ...c,
          unreadCount: Number(c.unreadCount),
        })),
      },
    })
  } catch (error) {
    console.error('[GET /api/messages]', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}
