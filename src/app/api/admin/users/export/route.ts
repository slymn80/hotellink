import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

// GET /api/admin/users/export — Download all matching users as CSV
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q') ?? undefined
    const role = searchParams.get('role') ?? undefined
    const status = searchParams.get('status') ?? undefined

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(query && {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      }),
      ...(role && { role: role as Prisma.EnumUserRoleFilter }),
      ...(status && { status: status as Prisma.EnumUserStatusFilter }),
    }

    const users = await db.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10000,
    })

    const escape = (v: string | null | undefined) => {
      if (v == null) return ''
      const s = String(v)
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
    }

    const header = ['ID', 'Name', 'Email', 'Role', 'Status', 'Joined', 'Last Login']
    const rows = users.map((u) => [
      escape(u.id),
      escape(u.name),
      escape(u.email),
      escape(u.role),
      escape(u.status),
      escape(u.createdAt.toISOString()),
      escape(u.lastLoginAt?.toISOString()),
    ])

    const csv = [header, ...rows].map((r) => r.join(',')).join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="users-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    })
  } catch (error) {
    console.error('[GET /api/admin/users/export]', error)
    return NextResponse.json({ error: 'Failed to export users' }, { status: 500 })
  }
}
