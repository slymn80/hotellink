import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { deleteFile, extractStoragePath, isStorageConfigured, BUCKETS } from '@/lib/storage'

const deleteSchema = z.object({
  url: z.string().url(),
  ownerType: z.enum(['candidate', 'hotel']),
  hotelId: z.string().optional(),
})

// DELETE /api/upload/gallery — Remove a single gallery photo
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const parsed = deleteSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const { url, ownerType, hotelId } = parsed.data

    if (ownerType === 'candidate') {
      if (session.user.role !== 'CANDIDATE') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const candidate = await db.candidateProfile.findUnique({ where: { userId: session.user.id } })
      if (!candidate) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

      if (!candidate.photoUrls.includes(url)) {
        return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
      }

      await db.candidateProfile.update({
        where: { userId: session.user.id },
        data: { photoUrls: candidate.photoUrls.filter((u) => u !== url) },
      })

      if (isStorageConfigured()) {
        const path = extractStoragePath(url, BUCKETS.AVATARS)
        if (path) await deleteFile(BUCKETS.AVATARS, path)
      }
    } else {
      if (session.user.role !== 'HOTEL_EMPLOYER') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const employer = await db.hotelEmployer.findFirst({
        where: { userId: session.user.id, ...(hotelId ? { hotelId } : {}) },
        include: { hotel: true },
      })

      if (!employer || !employer.isAdmin) {
        return NextResponse.json({ error: 'Hotel admin access required' }, { status: 403 })
      }

      const inGallery = employer.hotel.galleryUrls.includes(url)
      const inAccommodation = employer.hotel.accommodationPhotoUrls.includes(url)

      if (!inGallery && !inAccommodation) {
        return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
      }

      await db.hotel.update({
        where: { id: employer.hotelId },
        data: inGallery
          ? { galleryUrls: employer.hotel.galleryUrls.filter((u) => u !== url) }
          : { accommodationPhotoUrls: employer.hotel.accommodationPhotoUrls.filter((u) => u !== url) },
      })

      if (isStorageConfigured()) {
        const path = extractStoragePath(url, BUCKETS.HOTELS)
        if (path) await deleteFile(BUCKETS.HOTELS, path)
      }
    }

    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('[DELETE /api/upload/gallery]', error)
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 })
  }
}
