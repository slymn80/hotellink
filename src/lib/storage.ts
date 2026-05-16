import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Service-role client — server-side only, bypasses RLS
function getAdminClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  })
}

export const BUCKETS = {
  DOCUMENTS: 'documents',
  AVATARS: 'avatars',
  HOTELS: 'hotels',
} as const

export type StorageBucket = (typeof BUCKETS)[keyof typeof BUCKETS]

// ─── Upload ───────────────────────────────────────────────────────────────────

export interface UploadResult {
  url: string
  path: string
}

export async function uploadFile(
  bucket: StorageBucket,
  path: string,
  file: File
): Promise<UploadResult> {
  const supabase = getAdminClient()

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    })

  if (error) throw new Error(`Storage upload failed: ${error.message}`)

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return { url: data.publicUrl, path }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteFile(bucket: StorageBucket, path: string): Promise<void> {
  const supabase = getAdminClient()
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) console.error(`[storage] delete failed: ${error.message}`)
}

// ─── Path builders ────────────────────────────────────────────────────────────

export function buildDocumentPath(userId: string, fileName: string): string {
  const ext = fileName.split('.').pop() ?? 'bin'
  return `${userId}/${Date.now()}.${ext}`
}

export function buildAvatarPath(userId: string, ext = 'jpg'): string {
  return `${userId}/avatar.${ext}`
}

export function buildHotelImagePath(hotelId: string, type: 'logo' | 'cover', ext = 'jpg'): string {
  return `${hotelId}/${type}.${ext}`
}

export function buildGalleryPath(ownerId: string, ownerType: 'candidate' | 'hotel', ext = 'jpg'): string {
  return `${ownerId}/gallery/${Date.now()}.${ext}`
}

// ─── Extract storage path from public URL ─────────────────────────────────────

export function extractStoragePath(publicUrl: string, bucket: StorageBucket): string | null {
  try {
    const marker = `/storage/v1/object/public/${bucket}/`
    const idx = publicUrl.indexOf(marker)
    if (idx === -1) return null
    return publicUrl.slice(idx + marker.length)
  } catch {
    return null
  }
}

// ─── Check if Supabase is configured ─────────────────────────────────────────

export function isStorageConfigured(): boolean {
  return (
    !!supabaseUrl &&
    supabaseUrl !== 'https://placeholder.supabase.co' &&
    !!supabaseServiceKey &&
    supabaseServiceKey !== 'placeholder'
  )
}
