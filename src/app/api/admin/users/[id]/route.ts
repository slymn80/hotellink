import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

const updateSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION']).optional(),
  role: z.enum(['CANDIDATE', 'HOTEL_EMPLOYER', 'HR_AGENCY', 'ADMIN']).optional(),
})

// PATCH /api/admin/users/[id] — Update user status or role
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = updateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const user = await db.user.update({
      where: { id: params.id },
      data: parsed.data,
    })

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        resource: 'user',
        resourceId: params.id,
        newValues: parsed.data,
      },
    })

    return NextResponse.json({ status: 'success', data: user })
  } catch (error) {
    console.error('[PATCH /api/admin/users/[id]]', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
