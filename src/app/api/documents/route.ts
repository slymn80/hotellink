import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { uploadFile, buildDocumentPath, isStorageConfigured, BUCKETS } from '@/lib/storage'
import type { DocumentType } from '@prisma/client'

// GET /api/documents — Get documents for current candidate
export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const candidate = await db.candidateProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!candidate) {
      return NextResponse.json({ status: 'success', data: [] })
    }

    const documents = await db.document.findMany({
      where: { candidateId: candidate.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ status: 'success', data: documents })
  } catch (error) {
    console.error('[GET /api/documents]', error)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
}

// POST /api/documents — Upload a document
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const candidate = await db.candidateProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate profile not found' }, { status: 400 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const type = formData.get('type') as string | null

    if (!file || !type) {
      return NextResponse.json({ error: 'File and type are required' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
    }

    const allowedTypes = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg', 'image/jpg', 'image/png']

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    const validDocTypes: DocumentType[] = [
      'CV_RESUME', 'PASSPORT', 'VISA', 'WORK_PERMIT', 'RESIDENCE_PERMIT',
      'DEGREE_CERTIFICATE', 'LANGUAGE_CERTIFICATE', 'PROFESSIONAL_CERTIFICATE',
      'REFERENCE_LETTER', 'CRIMINAL_RECORD', 'HEALTH_CERTIFICATE', 'OTHER',
    ]

    if (!validDocTypes.includes(type as DocumentType)) {
      return NextResponse.json({ error: 'Invalid document type' }, { status: 400 })
    }

    let fileUrl: string
    let storagePath: string | undefined

    if (isStorageConfigured()) {
      const path = buildDocumentPath(session.user.id, file.name)
      const result = await uploadFile(BUCKETS.DOCUMENTS, path, file)
      fileUrl = result.url
      storagePath = result.path
    } else {
      // Supabase not configured — store metadata only (file not persisted)
      fileUrl = `/uploads/placeholder/${session.user.id}/${Date.now()}-${file.name}`
    }

    const document = await db.document.create({
      data: {
        candidateId: candidate.id,
        type: type as DocumentType,
        name: file.name,
        fileUrl,
        fileSize: file.size,
        mimeType: file.type,
        status: 'PENDING',
      },
    })

    return NextResponse.json({ status: 'success', data: document }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/documents]', error)
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 })
  }
}
