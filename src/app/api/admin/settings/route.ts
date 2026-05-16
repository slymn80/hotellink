import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

// GET /api/admin/settings — Return all site settings as key→value map
export async function GET() {
  try {
    const session = await auth()
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const rows = await db.siteSettings.findMany({ orderBy: { key: 'asc' } })
    const settings: Record<string, string> = {}
    for (const row of rows) settings[row.key] = row.value

    return NextResponse.json({ status: 'success', data: settings })
  } catch (error) {
    console.error('[GET /api/admin/settings]', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// PATCH /api/admin/settings — Upsert multiple settings at once
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json() as Record<string, string | boolean | number>

    await db.$transaction(
      Object.entries(body).map(([key, value]) =>
        db.siteSettings.upsert({
          where: { key },
          create: { key, value: String(value) },
          update: { value: String(value) },
        })
      )
    )

    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('[PATCH /api/admin/settings]', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
