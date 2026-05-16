import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import {
  uploadFile,
  deleteFile,
  extractStoragePath,
  buildAvatarPath,
  buildHotelImagePath,
  buildGalleryPath,
  isStorageConfigured,
  BUCKETS,
} from '@/lib/storage'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

/**
 * POST /api/upload/image
 *
 * FormData fields:
 *   file     — image file
 *   type     — 'avatar' | 'hotel_logo' | 'hotel_cover'
 *   hotelId  — required for hotel_logo / hotel_cover
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!isStorageConfigured()) {
      return NextResponse.json(
        { error: 'File storage is not configured. Set Supabase environment variables.' },
        { status: 503 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const uploadType = formData.get('type') as string | null

    if (!file || !uploadType) {
      return NextResponse.json({ error: 'file and type are required' }, { status: 400 })
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only JPEG, PNG, and WebP images are allowed' },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Image must be smaller than 5MB' }, { status: 400 })
    }

    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'

    // ── Avatar ────────────────────────────────────────────────────────────────
    if (uploadType === 'avatar') {
      const path = buildAvatarPath(session.user.id, ext)
      const { url } = await uploadFile(BUCKETS.AVATARS, path, file)

      await db.user.update({
        where: { id: session.user.id },
        data: { image: url },
      })

      if (session.user.role === 'CANDIDATE') {
        await db.candidateProfile.update({
          where: { userId: session.user.id },
          data: { profilePhoto: url },
        })
      }

      return NextResponse.json({ status: 'success', data: { url } })
    }

    // ── Hotel logo / cover ────────────────────────────────────────────────────
    if (uploadType === 'hotel_logo' || uploadType === 'hotel_cover') {
      if (session.user.role !== 'HOTEL_EMPLOYER') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const hotelId = formData.get('hotelId') as string | null

      const employer = await db.hotelEmployer.findFirst({
        where: {
          userId: session.user.id,
          ...(hotelId ? { hotelId } : {}),
        },
        include: { hotel: true },
      })

      if (!employer || !employer.isAdmin) {
        return NextResponse.json({ error: 'Hotel admin access required' }, { status: 403 })
      }

      const imageType = uploadType === 'hotel_logo' ? 'logo' : 'cover'
      const path = buildHotelImagePath(employer.hotelId, imageType, ext)

      // Delete old image if exists
      const oldUrl = imageType === 'logo' ? employer.hotel.logoUrl : employer.hotel.coverImageUrl
      if (oldUrl) {
        const oldPath = extractStoragePath(oldUrl, BUCKETS.HOTELS)
        if (oldPath) await deleteFile(BUCKETS.HOTELS, oldPath)
      }

      const { url } = await uploadFile(BUCKETS.HOTELS, path, file)

      await db.hotel.update({
        where: { id: employer.hotelId },
        data: imageType === 'logo' ? { logoUrl: url } : { coverImageUrl: url },
      })

      return NextResponse.json({ status: 'success', data: { url } })
    }

    // ── Candidate gallery ─────────────────────────────────────────────────────
    if (uploadType === 'candidate_gallery') {
      if (session.user.role !== 'CANDIDATE') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const candidate = await db.candidateProfile.findUnique({ where: { userId: session.user.id } })
      if (!candidate) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

      if (candidate.photoUrls.length >= 10) {
        return NextResponse.json({ error: 'Maximum 10 gallery photos allowed' }, { status: 400 })
      }

      const path = buildGalleryPath(session.user.id, 'candidate', ext)
      const { url } = await uploadFile(BUCKETS.AVATARS, path, file)

      await db.candidateProfile.update({
        where: { userId: session.user.id },
        data: { photoUrls: { push: url } },
      })

      return NextResponse.json({ status: 'success', data: { url } })
    }

    // ── Hotel gallery ─────────────────────────────────────────────────────────
    if (uploadType === 'hotel_gallery') {
      if (session.user.role !== 'HOTEL_EMPLOYER') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const hotelId = formData.get('hotelId') as string | null
      const employer = await db.hotelEmployer.findFirst({
        where: { userId: session.user.id, ...(hotelId ? { hotelId } : {}) },
        include: { hotel: true },
      })

      if (!employer || !employer.isAdmin) {
        return NextResponse.json({ error: 'Hotel admin access required' }, { status: 403 })
      }

      if (employer.hotel.galleryUrls.length >= 20) {
        return NextResponse.json({ error: 'Maximum 20 gallery photos allowed' }, { status: 400 })
      }

      const path = buildGalleryPath(employer.hotelId, 'hotel', ext)
      const { url } = await uploadFile(BUCKETS.HOTELS, path, file)

      await db.hotel.update({
        where: { id: employer.hotelId },
        data: { galleryUrls: { push: url } },
      })

      return NextResponse.json({ status: 'success', data: { url } })
    }

    // ── Hotel accommodation photo ─────────────────────────────────────────────
    if (uploadType === 'hotel_accommodation') {
      if (session.user.role !== 'HOTEL_EMPLOYER') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const hotelId = formData.get('hotelId') as string | null
      const employer = await db.hotelEmployer.findFirst({
        where: { userId: session.user.id, ...(hotelId ? { hotelId } : {}) },
        include: { hotel: true },
      })

      if (!employer || !employer.isAdmin) {
        return NextResponse.json({ error: 'Hotel admin access required' }, { status: 403 })
      }

      if (employer.hotel.accommodationPhotoUrls.length >= 10) {
        return NextResponse.json({ error: 'Maximum 10 accommodation photos allowed' }, { status: 400 })
      }

      const path = buildGalleryPath(employer.hotelId + '_acc', 'hotel', ext)
      const { url } = await uploadFile(BUCKETS.HOTELS, path, file)

      await db.hotel.update({
        where: { id: employer.hotelId },
        data: { accommodationPhotoUrls: { push: url } },
      })

      return NextResponse.json({ status: 'success', data: { url } })
    }

    return NextResponse.json({ error: 'Invalid upload type' }, { status: 400 })
  } catch (error) {
    console.error('[POST /api/upload/image]', error)
    const message = error instanceof Error ? error.message : 'Upload failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PATCH /api/upload/image — Set a default (pre-defined) avatar URL
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { url } = await req.json()
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'url is required' }, { status: 400 })
    }

    await db.user.update({ where: { id: session.user.id }, data: { image: url } })

    if (session.user.role === 'CANDIDATE') {
      await db.candidateProfile.update({
        where: { userId: session.user.id },
        data: { profilePhoto: url },
      })
    }

    return NextResponse.json({ status: 'success', data: { url } })
  } catch (error) {
    console.error('[PATCH /api/upload/image]', error)
    return NextResponse.json({ error: 'Failed to set avatar' }, { status: 500 })
  }
}

// DELETE /api/upload/image — Remove avatar
export async function DELETE(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Get current avatar URL
    const user = await db.user.findUnique({ where: { id: session.user.id }, select: { image: true } })
    const currentUrl = user?.image

    // Clear from DB
    await db.user.update({ where: { id: session.user.id }, data: { image: null } })

    if (session.user.role === 'CANDIDATE') {
      await db.candidateProfile.update({
        where: { userId: session.user.id },
        data: { profilePhoto: null },
      })
    }

    // Delete from storage
    if (isStorageConfigured() && currentUrl) {
      const path = extractStoragePath(currentUrl, BUCKETS.AVATARS)
      if (path) await deleteFile(BUCKETS.AVATARS, path)
    }

    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('[DELETE /api/upload/image]', error)
    return NextResponse.json({ error: 'Failed to delete avatar' }, { status: 500 })
  }
}
