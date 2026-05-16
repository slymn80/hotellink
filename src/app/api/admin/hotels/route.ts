import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { slugify } from '@/lib/utils'
import type { Prisma } from '@prisma/client'

// GET /api/admin/hotels — List all hotels (admin)
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
    const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
    const pageSize = Math.min(100, Number(searchParams.get('pageSize') ?? '20'))

    const where: Prisma.HotelWhereInput = {
      deletedAt: null,
      ...(query && {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { city: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      }),
      ...(status && { status: status as Prisma.EnumHotelStatusFilter }),
    }

    const [hotels, total] = await Promise.all([
      db.hotel.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          starRating: true,
          city: true,
          country: true,
          status: true,
          isVerified: true,
          isFeatured: true,
          viewCount: true,
          logoUrl: true,
          createdAt: true,
          _count: { select: { jobs: true, reviews: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.hotel.count({ where }),
    ])

    return NextResponse.json({
      status: 'success',
      data: { items: hotels, total, page, pageSize },
    })
  } catch (error) {
    console.error('[GET /api/admin/hotels]', error)
    return NextResponse.json({ error: 'Failed to fetch hotels' }, { status: 500 })
  }
}

const createSchema = z.object({
  name: z.string().min(3).max(120),
  type: z.enum(['BOUTIQUE', 'RESORT', 'CITY_HOTEL', 'HOSTEL', 'MOTEL', 'VILLA', 'APART_HOTEL', 'THERMAL_HOTEL', 'CASINO_HOTEL', 'ECO_HOTEL']),
  starRating: z.enum(['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE']).optional(),
  city: z.string().min(2).max(100),
  country: z.string().max(10).default('TR'),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  website: z.string().url().optional().or(z.literal('')),
  address: z.string().max(300).optional(),
  shortDescription: z.string().max(300).optional(),
  description: z.string().max(5000).optional(),
  amenities: z.array(z.string()).optional(),
  employerEmail: z.string().email().optional(),
  verifyImmediately: z.boolean().optional().default(false),
})

// POST /api/admin/hotels — Admin creates a hotel
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
    }

    const { employerEmail, verifyImmediately, ...hotelData } = parsed.data
    const slug = `${slugify(hotelData.name)}-${Date.now()}`

    const hotel = await db.$transaction(async (tx) => {
      const newHotel = await tx.hotel.create({
        data: {
          ...hotelData,
          slug,
          amenities: hotelData.amenities ?? [],
          ...(verifyImmediately && {
            status: 'VERIFIED',
            isVerified: true,
            verifiedAt: new Date(),
          }),
        },
      })

      // Link employer if email provided
      if (employerEmail) {
        const user = await tx.user.findUnique({ where: { email: employerEmail } })
        if (user && user.role === 'HOTEL_EMPLOYER') {
          const existing = await tx.hotelEmployer.findFirst({ where: { userId: user.id } })
          if (!existing) {
            await tx.hotelEmployer.create({
              data: { userId: user.id, hotelId: newHotel.id, isOwner: true, isAdmin: true },
            })
          }
        }
      }

      // Free subscription
      await tx.subscription.create({
        data: {
          hotelId: newHotel.id,
          plan: 'FREE',
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          jobPostingLimit: 1,
          featuredJobLimit: 0,
          candidateViewLimit: 10,
        },
      })

      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'CREATE',
          resource: 'hotel',
          resourceId: newHotel.id,
          newValues: { name: hotelData.name, createdBy: 'admin' },
        },
      })

      return newHotel
    })

    return NextResponse.json({ status: 'success', data: hotel }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/hotels]', error)
    return NextResponse.json({ error: 'Failed to create hotel' }, { status: 500 })
  }
}
