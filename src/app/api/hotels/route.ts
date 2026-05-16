import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { slugify } from '@/lib/utils'
import type { Prisma } from '@prisma/client'

// GET /api/hotels — Public hotel search
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const query = searchParams.get('q') ?? undefined
    const city = searchParams.get('city') ?? undefined
    const type = searchParams.get('type') ?? undefined
    const stars = searchParams.get('stars') ? Number(searchParams.get('stars')) : undefined
    const isFeatured = searchParams.get('featured') === 'true' ? true : undefined
    const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
    const pageSize = Math.min(50, Number(searchParams.get('pageSize') ?? '20'))

    const starRatingMap: Record<number, string> = { 1: 'ONE', 2: 'TWO', 3: 'THREE', 4: 'FOUR', 5: 'FIVE' }

    const where: Prisma.HotelWhereInput = {
      status: 'VERIFIED',
      deletedAt: null,
      ...(query && {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { city: { contains: query, mode: 'insensitive' } },
        ],
      }),
      ...(city && { city: { contains: city, mode: 'insensitive' } }),
      ...(type && { type: type as Prisma.EnumHotelTypeFilter }),
      ...(stars && starRatingMap[stars] && { starRating: starRatingMap[stars] as Prisma.EnumHotelStarRatingNullableFilter }),
      ...(isFeatured !== undefined && { isFeatured }),
    }

    const [hotels, total] = await Promise.all([
      db.hotel.findMany({
        where,
        orderBy: [{ isFeatured: 'desc' }, { viewCount: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          name: true,
          slug: true,
          shortDescription: true,
          type: true,
          starRating: true,
          city: true,
          country: true,
          logoUrl: true,
          coverImageUrl: true,
          isVerified: true,
          isFeatured: true,
          amenities: true,
          viewCount: true,
          averageRating: true,
          _count: { select: { jobs: true, favorites: true } },
          jobs: {
            where: { status: 'ACTIVE' },
            select: { id: true, department: true },
            take: 5,
          },
        },
      }),
      db.hotel.count({ where }),
    ])

    return NextResponse.json({
      status: 'success',
      data: {
        items: hotels,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        hasNextPage: page * pageSize < total,
      },
    })
  } catch (error) {
    console.error('[GET /api/hotels]', error)
    return NextResponse.json({ error: 'Failed to fetch hotels' }, { status: 500 })
  }
}

// POST /api/hotels — Register a new hotel
export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'HOTEL_EMPLOYER') {
      return NextResponse.json({ error: 'Only hotel employers can create hotels' }, { status: 403 })
    }

    const body = await req.json()

    const slug = `${slugify(body.name)}-${Date.now()}`
    const documents: string[] = Array.isArray(body.documents)
      ? body.documents.filter((d: unknown) => typeof d === 'string' && d.trim().length > 0)
      : []

    const hotel = await db.$transaction(async (tx) => {
      const newHotel = await tx.hotel.create({
        data: {
          name: body.name,
          slug,
          description: body.description,
          shortDescription: body.shortDescription,
          type: body.type,
          email: body.email,
          phone: body.phone,
          website: body.website,
          address: body.address,
          city: body.city,
          country: body.country ?? 'TR',
          starRating: body.starRating,
          roomCount: body.roomCount,
          amenities: body.amenities ?? [],
        },
      })

      await tx.hotelEmployer.create({
        data: {
          userId: session.user.id,
          hotelId: newHotel.id,
          isOwner: true,
          isAdmin: true,
        },
      })

      // Create verification request with submitted documents
      await tx.verification.create({
        data: {
          type: 'HOTEL',
          entityId: newHotel.id,
          entityType: 'hotel',
          documents,
        },
      })

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

      return newHotel
    })

    return NextResponse.json({ status: 'success', data: hotel }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/hotels]', error)
    return NextResponse.json({ error: 'Failed to create hotel' }, { status: 500 })
  }
}
