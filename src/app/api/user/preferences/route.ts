import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

const prefKey = (userId: string) => `user_prefs_${userId}`

// GET /api/user/preferences
export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const row = await db.siteSettings.findUnique({ where: { key: prefKey(session.user.id) } })
    const prefs = row ? JSON.parse(row.value) : {}

    return NextResponse.json({ status: 'success', data: prefs })
  } catch (error) {
    console.error('[GET /api/user/preferences]', error)
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
  }
}

// PATCH /api/user/preferences — Merge-update preferences
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const updates = await req.json()
    const key = prefKey(session.user.id)

    const existing = await db.siteSettings.findUnique({ where: { key } })
    const current = existing ? JSON.parse(existing.value) : {}
    const merged = { ...current, ...updates }

    await db.siteSettings.upsert({
      where: { key },
      create: { key, value: JSON.stringify(merged) },
      update: { value: JSON.stringify(merged) },
    })

    return NextResponse.json({ status: 'success', data: merged })
  } catch (error) {
    console.error('[PATCH /api/user/preferences]', error)
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 })
  }
}
