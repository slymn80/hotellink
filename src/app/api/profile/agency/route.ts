import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

const updateSchema = z.object({
  agencyName: z.string().min(2).max(120).optional(),
  description: z.string().max(3000).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(30).optional(),
  website: z.string().url().optional().or(z.literal('')),
  country: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  licenseNumber: z.string().max(100).optional(),
  specialties: z.array(z.string()).optional(),
})

// GET /api/profile/agency
export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'HR_AGENCY') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const agency = await db.hRAgency.findUnique({
      where: { userId: session.user.id },
    })

    if (!agency) return NextResponse.json({ error: 'Agency not found' }, { status: 404 })

    return NextResponse.json({ status: 'success', data: agency })
  } catch (error) {
    console.error('[GET /api/profile/agency]', error)
    return NextResponse.json({ error: 'Failed to fetch agency profile' }, { status: 500 })
  }
}

// PATCH /api/profile/agency
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'HR_AGENCY') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const nameSlug = (parsed.data.agencyName ?? '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) || 'agency'

    const updated = await db.hRAgency.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        agencyName: parsed.data.agencyName ?? 'My Agency',
        slug: `${nameSlug}-${session.user.id.slice(0, 8)}`,
        email: parsed.data.email ?? session.user.email ?? '',
        country: parsed.data.country ?? 'TR',
        description: parsed.data.description,
        phone: parsed.data.phone,
        website: parsed.data.website,
        city: parsed.data.city,
        licenseNumber: parsed.data.licenseNumber,
        specialties: parsed.data.specialties ?? [],
      },
      update: parsed.data,
    })

    return NextResponse.json({ status: 'success', data: updated })
  } catch (error) {
    console.error('[PATCH /api/profile/agency]', error)
    return NextResponse.json({ error: 'Failed to update agency profile' }, { status: 500 })
  }
}
