import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

// GET /api/admin/hotels/export — Download all matching hotels as CSV
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q') ?? undefined
    const status = searchParams.get('status') ?? undefined

    const where: Prisma.HotelWhereInput = {
      ...(query && {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { city: { contains: query, mode: 'insensitive' } },
        ],
      }),
      ...(status && { status: status as Prisma.EnumHotelStatusFilter }),
    }

    const hotels = await db.hotel.findMany({
      where,
      select: {
        id: true, name: true, type: true, starRating: true,
        city: true, country: true, status: true, isVerified: true,
        isFeatured: true, viewCount: true, email: true, phone: true,
        website: true, createdAt: true,
        _count: { select: { jobs: true, reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10000,
    })

    const escape = (v: string | number | boolean | null | undefined) => {
      if (v == null) return ''
      const s = String(v)
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
    }

    const header = ['ID', 'Name', 'Type', 'Stars', 'City', 'Country', 'Status', 'Verified', 'Featured', 'Views', 'Jobs', 'Reviews', 'Email', 'Phone', 'Website', 'Registered']
    const rows = hotels.map((h) => [
      escape(h.id), escape(h.name), escape(h.type), escape(h.starRating),
      escape(h.city), escape(h.country), escape(h.status),
      escape(h.isVerified), escape(h.isFeatured), escape(h.viewCount),
      escape(h._count.jobs), escape(h._count.reviews),
      escape(h.email), escape(h.phone), escape(h.website),
      escape(h.createdAt.toISOString()),
    ])

    const csv = [header, ...rows].map((r) => r.join(',')).join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="hotels-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    })
  } catch (error) {
    console.error('[GET /api/admin/hotels/export]', error)
    return NextResponse.json({ error: 'Failed to export hotels' }, { status: 500 })
  }
}
