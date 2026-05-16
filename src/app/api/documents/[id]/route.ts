import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { deleteFile, extractStoragePath, isStorageConfigured, BUCKETS } from '@/lib/storage'

// DELETE /api/documents/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const candidate = await db.candidateProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!candidate) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const document = await db.document.findFirst({
      where: { id: params.id, candidateId: candidate.id },
    })

    if (!document) return NextResponse.json({ error: 'Document not found' }, { status: 404 })

    // Delete from Supabase storage if configured
    if (isStorageConfigured() && document.fileUrl) {
      const storagePath = extractStoragePath(document.fileUrl, BUCKETS.DOCUMENTS)
      if (storagePath) {
        await deleteFile(BUCKETS.DOCUMENTS, storagePath)
      }
    }

    await db.document.delete({ where: { id: params.id } })

    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('[DELETE /api/documents/[id]]', error)
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
  }
}
