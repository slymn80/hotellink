import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

async function getPool(id: string, agencyId: string) {
  const pool = await db.candidatePool.findUnique({ where: { id } })
  if (!pool || pool.agencyId !== agencyId) return null
  return pool
}

// GET /api/agency/pools/[id]
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'HR_AGENCY') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const agency = await db.hRAgency.findUnique({ where: { userId: session.user.id } })
    if (!agency) return NextResponse.json({ error: 'Agency not found' }, { status: 404 })

    const pool = await getPool(params.id, agency.id)
    if (!pool) return NextResponse.json({ error: 'Pool not found' }, { status: 404 })

    return NextResponse.json({ status: 'success', data: pool })
  } catch (error) {
    console.error('[GET /api/agency/pools/[id]]', error)
    return NextResponse.json({ error: 'Failed to fetch pool' }, { status: 500 })
  }
}

// PATCH /api/agency/pools/[id]
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'HR_AGENCY') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const agency = await db.hRAgency.findUnique({ where: { userId: session.user.id } })
    if (!agency) return NextResponse.json({ error: 'Agency not found' }, { status: 404 })

    const existing = await getPool(params.id, agency.id)
    if (!existing) return NextResponse.json({ error: 'Pool not found' }, { status: 404 })

    const body = await req.json()
    const { name, description, isPublic, filters } = body

    const pool = await db.candidatePool.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(isPublic !== undefined && { isPublic }),
        ...(filters !== undefined && { filters }),
      },
    })

    return NextResponse.json({ status: 'success', data: pool })
  } catch (error) {
    console.error('[PATCH /api/agency/pools/[id]]', error)
    return NextResponse.json({ error: 'Failed to update pool' }, { status: 500 })
  }
}

// DELETE /api/agency/pools/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'HR_AGENCY') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const agency = await db.hRAgency.findUnique({ where: { userId: session.user.id } })
    if (!agency) return NextResponse.json({ error: 'Agency not found' }, { status: 404 })

    const pool = await getPool(params.id, agency.id)
    if (!pool) return NextResponse.json({ error: 'Pool not found' }, { status: 404 })

    await db.candidatePool.delete({ where: { id: params.id } })
    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('[DELETE /api/agency/pools/[id]]', error)
    return NextResponse.json({ error: 'Failed to delete pool' }, { status: 500 })
  }
}
