'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Building2, MapPin, Phone, Globe, Mail, Camera, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

const schema = z.object({
  name: z.string().min(3).max(120),
  shortDescription: z.string().max(300).optional(),
  description: z.string().max(5000).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  address: z.string().max(300).optional(),
  city: z.string().max(100),
  country: z.string().max(100).default('TR'),
  roomCount: z.number().int().min(1).optional(),
})

type FormData = z.infer<typeof schema>

const AMENITY_OPTIONS = [
  'spa', 'pool', 'gym', 'restaurant', 'bar', 'conference', 'valet',
  'concierge', 'kids_club', 'private_beach', 'golf', 'marina', 'tennis',
  'water_sports', 'animation', 'wifi', 'parking', 'laundry',
]

const AMENITY_LABELS: Record<string, string> = {
  spa: 'Spa & Wellness', pool: 'Swimming Pool', gym: 'Fitness Center',
  restaurant: 'Restaurant', bar: 'Bar & Lounge', conference: 'Conference Center',
  valet: 'Valet Parking', concierge: 'Concierge', kids_club: 'Kids Club',
  private_beach: 'Private Beach', golf: 'Golf Course', marina: 'Marina',
  tennis: 'Tennis Courts', water_sports: 'Water Sports', animation: 'Entertainment',
  wifi: 'Free Wi-Fi', parking: 'Free Parking', laundry: 'Laundry Service',
}

export default function HotelProfilePage() {
  const { hotelId } = useParams<{ hotelId: string }>()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [amenities, setAmenities] = useState<string[]>([])
  const [hotel, setHotel] = useState<{ logoUrl: string | null; coverImageUrl: string | null; starRating: string } | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    fetch(`/api/profile/hotel/${hotelId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.status === 'success') {
          const h = d.data
          setHotel(h)
          setAmenities(h.amenities ?? [])
          reset({
            name: h.name,
            shortDescription: h.shortDescription ?? '',
            description: h.description ?? '',
            phone: h.phone ?? '',
            email: h.email ?? '',
            website: h.website ?? '',
            address: h.address ?? '',
            city: h.city,
            country: h.country,
            roomCount: h.roomCount ?? undefined,
          })
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [hotelId, reset])

  const toggleAmenity = (amenity: string) =>
    setAmenities(prev => prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity])

  const uploadImage = async (file: File, type: 'hotel_logo' | 'hotel_cover') => {
    const setUploading = type === 'hotel_logo' ? setUploadingLogo : setUploadingCover
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', type)
      fd.append('hotelId', hotelId)
      const res = await fetch('/api/upload/image', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Upload failed'); return }
      const url: string = data.data.url
      setHotel(prev => prev ? {
        ...prev,
        ...(type === 'hotel_logo' ? { logoUrl: url } : { coverImageUrl: url }),
      } : prev)
      toast.success(type === 'hotel_logo' ? 'Logo updated' : 'Cover image updated')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/profile/hotel/${hotelId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, amenities }),
      })
      if (res.ok) toast.success('Hotel profile updated')
      else { const json = await res.json(); toast.error(json.error ?? 'Failed to update') }
    } catch { toast.error('Network error') }
    finally { setSaving(false) }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hotel Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Keep your hotel profile updated to attract quality candidates</p>
        </div>
        <Button type="submit" variant="gradient" loading={saving} leftIcon={<Save className="h-4 w-4" />}>
          Save Changes
        </Button>
      </div>

      {/* Cover image */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card overflow-hidden"
      >
        <div className="relative h-36 bg-gradient-to-r from-brand-600 to-ocean-600">
          {hotel?.coverImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={hotel.coverImageUrl} alt="" className="h-full w-full object-cover" />
          )}
          <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f, 'hotel_cover') }} />
          <button type="button" onClick={() => coverInputRef.current?.click()}
            disabled={uploadingCover}
            className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg bg-black/40 px-3 py-1.5 text-xs text-white backdrop-blur-sm hover:bg-black/60 transition-colors disabled:opacity-60">
            {uploadingCover ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
            {uploadingCover ? 'Uploading...' : 'Change Cover'}
          </button>
        </div>
        <div className="p-5 flex items-center gap-4">
          <div className="relative -mt-10">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-card bg-gradient-to-br from-brand-500 to-ocean-600 text-white text-xl font-bold shadow-md">
              {hotel?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={hotel.logoUrl} alt="" className="h-full w-full rounded-xl object-cover" />
              ) : (
                <Building2 className="h-7 w-7" />
              )}
            </div>
            <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f, 'hotel_logo') }} />
            <button type="button" onClick={() => logoInputRef.current?.click()}
              disabled={uploadingLogo}
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow disabled:opacity-60">
              {uploadingLogo ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Hotel Logo</p>
            <p className="text-xs text-muted-foreground">PNG or JPG, min 200×200px. Recommended: square format.</p>
          </div>
        </div>
      </motion.div>

      {/* Basic info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Hotel Information</h2>
        <Input label="Hotel Name" error={errors.name?.message} leftIcon={<Building2 className="h-4 w-4" />} {...register('name')} />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Short Description</label>
          <textarea rows={2} placeholder="One-liner description shown in search results..." className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none" maxLength={300} {...register('shortDescription')} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Full Description</label>
          <textarea rows={6} placeholder="Detailed description of your hotel, culture, and what makes it a great place to work..." className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none" maxLength={5000} {...register('description')} />
        </div>
      </motion.div>

      {/* Contact */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Contact & Location</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Phone" leftIcon={<Phone className="h-4 w-4" />} {...register('phone')} />
          <Input label="Email" type="email" leftIcon={<Mail className="h-4 w-4" />} error={errors.email?.message} {...register('email')} />
          <Input label="Website" leftIcon={<Globe className="h-4 w-4" />} placeholder="https://..." error={errors.website?.message} {...register('website')} />
          <Input label="Room Count" type="number" leftIcon={<Building2 className="h-4 w-4" />} {...register('roomCount', { valueAsNumber: true })} />
          <Input label="City" leftIcon={<MapPin className="h-4 w-4" />} {...register('city')} />
          <Input label="Country" leftIcon={<Globe className="h-4 w-4" />} {...register('country')} />
        </div>
        <Input label="Full Address" leftIcon={<MapPin className="h-4 w-4" />} {...register('address')} />
      </motion.div>

      {/* Amenities */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 font-semibold text-foreground">Facilities & Amenities</h2>
        <div className="flex flex-wrap gap-2">
          {AMENITY_OPTIONS.map((amenity) => {
            const selected = amenities.includes(amenity)
            return (
              <button key={amenity} type="button" onClick={() => toggleAmenity(amenity)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all ${selected ? 'bg-primary text-white shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                {AMENITY_LABELS[amenity] ?? amenity}
              </button>
            )
          })}
        </div>
      </motion.div>

      <div className="flex justify-end">
        <Button type="submit" variant="gradient" size="lg" loading={saving} leftIcon={<Save className="h-4 w-4" />}>
          Save Hotel Profile
        </Button>
      </div>
    </form>
  )
}
