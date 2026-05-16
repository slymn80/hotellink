import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

const LOCALES = ['en', 'tr', 'ru']

// GET /api/admin/content — Return translations grouped by (key, namespace)
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const namespace = searchParams.get('namespace') ?? undefined
    const search = searchParams.get('q') ?? undefined

    const rows = await db.contentTranslation.findMany({
      where: {
        ...(namespace ? { namespace } : {}),
        ...(search ? {
          OR: [
            { key: { contains: search, mode: 'insensitive' } },
            { value: { contains: search, mode: 'insensitive' } },
          ],
        } : {}),
      },
      orderBy: [{ namespace: 'asc' }, { key: 'asc' }],
    })

    // Group rows into { key, namespace, en, tr, ru } objects
    const grouped: Record<string, Record<string, string> & { key: string; namespace: string }> = {}
    for (const row of rows) {
      const compound = `${row.namespace}::${row.key}`
      if (!grouped[compound]) {
        grouped[compound] = { key: row.key, namespace: row.namespace }
      }
      grouped[compound][row.locale] = row.value
    }

    const items = Object.values(grouped)
    const namespaces = Array.from(new Set(rows.map(r => r.namespace))).sort()

    return NextResponse.json({ status: 'success', data: { items, namespaces } })
  } catch (error) {
    console.error('[GET /api/admin/content]', error)
    return NextResponse.json({ error: 'Failed to fetch translations' }, { status: 500 })
  }
}

// PATCH /api/admin/content — Update translations for a key (all locales)
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { key, namespace = 'common', values } = body as {
      key: string
      namespace?: string
      values: Record<string, string>
    }

    if (!key) return NextResponse.json({ error: 'key is required' }, { status: 400 })

    await db.$transaction(
      LOCALES.filter(l => values[l] !== undefined).map(locale =>
        db.contentTranslation.upsert({
          where: { key_locale_namespace: { key, locale, namespace } },
          create: { key, locale, namespace, value: values[locale] },
          update: { value: values[locale] },
        })
      )
    )

    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('[PATCH /api/admin/content]', error)
    return NextResponse.json({ error: 'Failed to update translation' }, { status: 500 })
  }
}

// POST /api/admin/content — Create a new translation key
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { key, namespace = 'common', values } = body as {
      key: string
      namespace?: string
      values: Record<string, string>
    }

    if (!key?.trim()) return NextResponse.json({ error: 'key is required' }, { status: 400 })

    const existing = await db.contentTranslation.findFirst({ where: { key, namespace } })
    if (existing) {
      return NextResponse.json({ error: 'This key already exists in the namespace' }, { status: 409 })
    }

    await db.$transaction(
      LOCALES.map(locale =>
        db.contentTranslation.create({
          data: { key, locale, namespace, value: values?.[locale] ?? '' },
        })
      )
    )

    return NextResponse.json({ status: 'success' }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/content]', error)
    return NextResponse.json({ error: 'Failed to create translation' }, { status: 500 })
  }
}
