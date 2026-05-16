import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

const poolSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().optional(),
})

async function getAgency(userId: string) {
  return db.hRAgency.findUnique({ where: { userId } })
}

// GET /api/agency/pools
export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'HR_AGENCY') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const agency = await getAgency(session.user.id)
    if (!agency) return NextResponse.json({ status: 'success', data: { items: [] } })

    const pools = await db.candidatePool.findMany({
      where: { agencyId: agency.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ status: 'success', data: { items: pools } })
  } catch (error) {
    console.error('[GET /api/agency/pools]', error)
    return NextResponse.json({ error: 'Failed to fetch pools' }, { status: 500 })
  }
}

// POST /api/agency/pools
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'HR_AGENCY') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const agency = await getAgency(session.user.id)
    if (!agency) return NextResponse.json({ error: 'Agency profile not found' }, { status: 404 })

    const body = await req.json()
    const parsed = poolSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
    }

    const pool = await db.candidatePool.create({
      data: { agencyId: agency.id, ...parsed.data },
    })

    return NextResponse.json({ status: 'success', data: pool }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/agency/pools]', error)
    return NextResponse.json({ error: 'Failed to create pool' }, { status: 500 })
  }
}
