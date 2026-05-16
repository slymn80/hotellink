'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import Image from 'next/image'
import {
  Building2, MapPin, Phone, Globe, Mail, Camera, Save,
  Plus, Loader2, ImageIcon, X, Link2, Home, UtensilsCrossed,
  Car, Heart, Shirt, Clock, CalendarDays, QrCode, Star,
  Download,
} from 'lucide-react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import QRCodeSVG from 'react-qr-code'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
  employeeCount: z.number().int().min(1).optional(),
  foundedYear: z.number().int().min(1800).optional(),
  linkedinUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  workingHoursInfo: z.string().max(200).optional(),
  daysOffPerWeek: z.number().int().min(0).max(7).optional(),
  accommodationDescription: z.string().max(3000).optional(),
  workingConditionsNotes: z.string().max(5000).optional(),
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
  const locale = useLocale()
  const [loading, setLoading] = useState(true)
  const [noHotel, setNoHotel] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [deletingGallery, setDeletingGallery] = useState<string | null>(null)
  const [amenities, setAmenities] = useState<string[]>([])
  const [galleryUrls, setGalleryUrls] = useState<string[]>([])
  const [accPhotoUrls, setAccPhotoUrls] = useState<string[]>([])
  const [uploadingAccPhoto, setUploadingAccPhoto] = useState(false)
  const [deletingAccPhoto, setDeletingAccPhoto] = useState<string | null>(null)
  const [conditions, setConditions] = useState({
    accommodationProvided: false, mealProvided: false, transportProvided: false,
    healthInsurance: false, uniformProvided: false,
  })
  const [hotel, setHotel] = useState<{
    id: string; slug: string; logoUrl: string | null; coverImageUrl: string | null
    galleryUrls: string[]; accommodationPhotoUrls: string[]; starRating: string
    averageRating: number | null; reviewCount: number
  } | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const accPhotoInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const res = await fetch('/api/profile/hotel')
        const data = await res.json()
        if (res.status === 404) {
          setNoHotel(true)
          return
        }
        if (data.status === 'success') {
          const h = data.data
          setHotel(h)
          setAmenities(h.amenities ?? [])
          setGalleryUrls(h.galleryUrls ?? [])
          setAccPhotoUrls(h.accommodationPhotoUrls ?? [])
          setConditions({
            accommodationProvided: h.accommodationProvided ?? false,
            mealProvided: h.mealProvided ?? false,
            transportProvided: h.transportProvided ?? false,
            healthInsurance: h.healthInsurance ?? false,
            uniformProvided: h.uniformProvided ?? false,
          })
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
            employeeCount: h.employeeCount ?? undefined,
            foundedYear: h.foundedYear ?? undefined,
            linkedinUrl: h.linkedinUrl ?? '',
            instagramUrl: h.instagramUrl ?? '',
            workingHoursInfo: h.workingHoursInfo ?? '',
            daysOffPerWeek: h.daysOffPerWeek ?? undefined,
            accommodationDescription: h.accommodationDescription ?? '',
            workingConditionsNotes: h.workingConditionsNotes ?? '',
          })
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchHotel()
  }, [reset])

  const handleImageUpload = async (
    file: File,
    type: 'hotel_logo' | 'hotel_cover',
  ) => {
    if (!hotel) return
    const setUploading = type === 'hotel_logo' ? setUploadingLogo : setUploadingCover

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      formData.append('hotelId', hotel.id)

      const res = await fetch('/api/upload/image', { method: 'POST', body: formData })
      const data = await res.json()

      if (res.ok) {
        setHotel(prev => prev ? {
          ...prev,
          logoUrl: type === 'hotel_logo' ? data.data.url : prev.logoUrl,
          coverImageUrl: type === 'hotel_cover' ? data.data.url : prev.coverImageUrl,
        } : prev)
        toast.success(type === 'hotel_logo' ? 'Logo updated' : 'Cover photo updated')
      } else {
        toast.error(data.error ?? 'Upload failed')
      }
    } catch {
      toast.error('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleGalleryAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!hotel) return
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploadingGallery(true)
    try {
      for (const file of files) {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('type', 'hotel_gallery')
        fd.append('hotelId', hotel.id)
        const res = await fetch('/api/upload/image', { method: 'POST', body: fd })
        const data = await res.json()
        if (res.ok) {
          setGalleryUrls(prev => [...prev, data.data.url])
        } else {
          toast.error(data.error ?? 'Upload failed')
        }
      }
      toast.success('Photos added')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploadingGallery(false)
      if (galleryInputRef.current) galleryInputRef.current.value = ''
    }
  }

  const handleGalleryRemove = async (url: string) => {
    if (!hotel) return
    setDeletingGallery(url)
    try {
      const res = await fetch('/api/upload/gallery', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, ownerType: 'hotel', hotelId: hotel.id }),
      })
      if (res.ok) {
        setGalleryUrls(prev => prev.filter(u => u !== url))
        toast.success('Photo removed')
      } else {
        toast.error('Failed to remove photo')
      }
    } catch {
      toast.error('Failed to remove photo')
    } finally {
      setDeletingGallery(null)
    }
  }

  const handleAccPhotoAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!hotel) return
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploadingAccPhoto(true)
    try {
      for (const file of files) {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('type', 'hotel_accommodation')
        fd.append('hotelId', hotel.id)
        const res = await fetch('/api/upload/image', { method: 'POST', body: fd })
        const data = await res.json()
        if (res.ok) setAccPhotoUrls(prev => [...prev, data.data.url])
        else toast.error(data.error ?? 'Upload failed')
      }
      toast.success('Photos added')
    } catch { toast.error('Upload failed') }
    finally {
      setUploadingAccPhoto(false)
      if (accPhotoInputRef.current) accPhotoInputRef.current.value = ''
    }
  }

  const handleAccPhotoRemove = async (url: string) => {
    if (!hotel) return
    setDeletingAccPhoto(url)
    try {
      const res = await fetch('/api/upload/gallery', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, ownerType: 'hotel', hotelId: hotel.id }),
      })
      if (res.ok) {
        setAccPhotoUrls(prev => prev.filter(u => u !== url))
        toast.success('Photo removed')
      } else toast.error('Failed to remove')
    } catch { toast.error('Failed to remove') }
    finally { setDeletingAccPhoto(null) }
  }

  const toggleAmenity = (amenity: string) => {
    setAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    )
  }

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    try {
      const res = await fetch('/api/profile/hotel', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, amenities, ...conditions }),
      })

      if (res.ok) {
        toast.success('Hotel profile updated')
      } else {
        const json = await res.json()
        toast.error(json.error ?? 'Failed to update')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (noHotel) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
          <Building2 className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">No hotel profile yet</h2>
        <p className="text-muted-foreground max-w-sm mb-8">
          Create your hotel profile to start posting jobs and receiving applications from qualified candidates.
        </p>
        <Link href={`/${locale}/hotel/onboarding`}>
          <Button variant="gradient" size="lg" leftIcon={<Plus className="h-5 w-5" />}>
            Create Hotel Profile
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hotel Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Keep your hotel profile updated to attract quality candidates
          </p>
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
            <Image
              src={hotel.coverImageUrl}
              alt="Hotel cover"
              fill
              className="object-cover"
            />
          )}
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            disabled={uploadingCover}
            className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg bg-black/40 px-3 py-1.5 text-xs text-white backdrop-blur-sm hover:bg-black/60 transition-colors disabled:opacity-60"
          >
            {uploadingCover
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Camera className="h-3.5 w-3.5" />
            }
            {uploadingCover ? 'Uploading...' : 'Change Cover'}
          </button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, 'hotel_cover'); e.target.value = '' }}
          />
        </div>
        <div className="p-5 flex items-center gap-4">
          <div className="relative -mt-10">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-card bg-gradient-to-br from-brand-500 to-ocean-600 text-white text-xl font-bold shadow-md overflow-hidden">
              {hotel?.logoUrl ? (
                <Image src={hotel.logoUrl} alt="Hotel logo" width={64} height={64} className="h-full w-full object-cover" />
              ) : (
                <Building2 className="h-7 w-7" />
              )}
            </div>
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              disabled={uploadingLogo}
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow disabled:opacity-60"
            >
              {uploadingLogo
                ? <Loader2 className="h-3 w-3 animate-spin" />
                : <Camera className="h-3 w-3" />
              }
            </button>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, 'hotel_logo'); e.target.value = '' }}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Hotel Logo</p>
            <p className="text-xs text-muted-foreground">PNG or JPG, min 200×200px. Recommended: square format.</p>
          </div>
        </div>
      </motion.div>

      {/* Basic info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl border border-border bg-card p-6 space-y-4"
      >
        <h2 className="font-semibold text-foreground">Hotel Information</h2>
        <Input
          label="Hotel Name"
          error={errors.name?.message}
          leftIcon={<Building2 className="h-4 w-4" />}
          {...register('name')}
        />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Short Description</label>
          <textarea
            rows={2}
            placeholder="One-liner description shown in search results..."
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
            maxLength={300}
            {...register('shortDescription')}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Full Description</label>
          <textarea
            rows={6}
            placeholder="Detailed description of your hotel, culture, and what makes it a great place to work..."
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
            maxLength={5000}
            {...register('description')}
          />
        </div>
      </motion.div>

      {/* Contact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-border bg-card p-6 space-y-4"
      >
        <h2 className="font-semibold text-foreground">Contact & Location</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Phone" leftIcon={<Phone className="h-4 w-4" />} {...register('phone')} />
          <Input label="Email" type="email" leftIcon={<Mail className="h-4 w-4" />} error={errors.email?.message} {...register('email')} />
          <Input label="Website" leftIcon={<Globe className="h-4 w-4" />} placeholder="https://..." error={errors.website?.message} {...register('website')} />
          <Input label="City" leftIcon={<MapPin className="h-4 w-4" />} {...register('city')} />
          <Input label="Country" leftIcon={<Globe className="h-4 w-4" />} {...register('country')} />
        </div>
        <Input label="Full Address" leftIcon={<MapPin className="h-4 w-4" />} {...register('address')} />
      </motion.div>

      {/* Photo Gallery */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }}
        className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-foreground">Photo Gallery</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Showcase your hotel — candidates see these when viewing your profile</p>
          </div>
          <Button type="button" variant="outline" size="sm" loading={uploadingGallery}
            leftIcon={<Plus className="h-4 w-4" />} onClick={() => galleryInputRef.current?.click()}
            disabled={galleryUrls.length >= 20}>
            Add Photos
          </Button>
        </div>
        {galleryUrls.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {galleryUrls.map((url) => (
              <div key={url} className="relative group aspect-square">
                <Image src={url} alt="" fill className="rounded-xl object-cover" />
                <button type="button" onClick={() => handleGalleryRemove(url)} disabled={deletingGallery === url}
                  className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  {deletingGallery === url ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 rounded-xl border-2 border-dashed border-border text-muted-foreground">
            <ImageIcon className="h-8 w-8 mb-2" />
            <p className="text-sm">No gallery photos yet</p>
            <p className="text-xs mt-1">Upload photos of your hotel, rooms, restaurant and facilities</p>
          </div>
        )}
        <input ref={galleryInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={handleGalleryAdd} />
        <p className="text-xs text-muted-foreground mt-3">{galleryUrls.length}/20 photos</p>
      </motion.div>

      {/* Stats & Social */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
        className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Hotel Stats & Social</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input label="Room Count" type="number" leftIcon={<Building2 className="h-4 w-4" />}
            {...register('roomCount', { valueAsNumber: true })} />
          <Input label="Employee Count" type="number" placeholder="e.g. 150"
            leftIcon={<Building2 className="h-4 w-4" />} {...register('employeeCount', { valueAsNumber: true })} />
          <Input label="Founded Year" type="number" placeholder="e.g. 1995"
            leftIcon={<Building2 className="h-4 w-4" />} {...register('foundedYear', { valueAsNumber: true })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="LinkedIn URL" placeholder="https://linkedin.com/company/..." leftIcon={<Link2 className="h-4 w-4" />} {...register('linkedinUrl')} />
          <Input label="Instagram URL" placeholder="https://instagram.com/..." leftIcon={<Link2 className="h-4 w-4" />} {...register('instagramUrl')} />
        </div>
      </motion.div>

      {/* Amenities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl border border-border bg-card p-6"
      >
        <h2 className="mb-4 font-semibold text-foreground">Facilities & Amenities</h2>
        <div className="flex flex-wrap gap-2">
          {AMENITY_OPTIONS.map((amenity) => {
            const selected = amenities.includes(amenity)
            return (
              <button
                key={amenity}
                type="button"
                onClick={() => toggleAmenity(amenity)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                  selected
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {AMENITY_LABELS[amenity] ?? amenity}
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Working Conditions & Accommodation */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.17 }}
        className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <div>
          <h2 className="font-semibold text-foreground">Working Conditions & Accommodation</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Let candidates know what you offer — this builds trust and improves applications</p>
        </div>

        {/* Benefits toggles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {([
            { key: 'accommodationProvided', label: 'Accommodation', icon: Home },
            { key: 'mealProvided', label: 'Meals Provided', icon: UtensilsCrossed },
            { key: 'transportProvided', label: 'Transportation', icon: Car },
            { key: 'healthInsurance', label: 'Health Insurance', icon: Heart },
            { key: 'uniformProvided', label: 'Uniform', icon: Shirt },
          ] as { key: keyof typeof conditions; label: string; icon: React.ElementType }[]).map(({ key, label, icon: Icon }) => (
            <button key={key} type="button"
              onClick={() => setConditions(c => ({ ...c, [key]: !c[key] }))}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                conditions[key]
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-muted/30 text-muted-foreground hover:border-primary/50'
              }`}>
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </div>

        {/* Working hours & days off */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> Working Hours
            </label>
            <input placeholder="e.g. 8 hours/day, shift system"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              {...(register as ReturnType<typeof useForm<FormData>>['register'])('workingHoursInfo' as never)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" /> Days Off per Week
            </label>
            <input type="number" min={0} max={7} placeholder="e.g. 2"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              {...(register as ReturnType<typeof useForm<FormData>>['register'])('daysOffPerWeek' as never, { valueAsNumber: true })} />
          </div>
        </div>

        {/* Accommodation description */}
        {conditions.accommodationProvided && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Accommodation Details</label>
            <textarea rows={4} placeholder="Describe the accommodation: room type, facilities, location relative to hotel..."
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none"
              {...(register as ReturnType<typeof useForm<FormData>>['register'])('accommodationDescription' as never)} />
          </div>
        )}

        {/* General notes */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Additional Notes</label>
          <textarea rows={4} placeholder="Any other information about working conditions, trial period, career growth opportunities..."
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none"
            {...(register as ReturnType<typeof useForm<FormData>>['register'])('workingConditionsNotes' as never)} />
        </div>

        {/* Accommodation photos */}
        {conditions.accommodationProvided && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-foreground">Accommodation Photos</label>
              <Button type="button" variant="outline" size="sm" loading={uploadingAccPhoto}
                leftIcon={<Plus className="h-4 w-4" />} onClick={() => accPhotoInputRef.current?.click()}
                disabled={accPhotoUrls.length >= 10}>
                Add
              </Button>
            </div>
            {accPhotoUrls.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {accPhotoUrls.map(url => (
                  <div key={url} className="relative group aspect-square">
                    <Image src={url} alt="" fill className="rounded-xl object-cover" />
                    <button type="button" onClick={() => handleAccPhotoRemove(url)}
                      disabled={deletingAccPhoto === url}
                      className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      {deletingAccPhoto === url ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 rounded-xl border-2 border-dashed border-border text-muted-foreground">
                <ImageIcon className="h-6 w-6 mb-1" />
                <p className="text-xs">No accommodation photos yet</p>
              </div>
            )}
            <input ref={accPhotoInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={handleAccPhotoAdd} />
          </div>
        )}
      </motion.div>

      {/* QR Code */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.19 }}
        className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <QrCode className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Hotel QR Code</h2>
        </div>
        {hotel && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="rounded-2xl border border-border p-4 bg-white" id="hotel-qr">
              <QRCodeSVG
                value={`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/${locale}/hotels/${hotel.slug}`}
                size={160}
                level="M"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Share your hotel profile</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Candidates can scan this QR code to view your hotel profile, open positions, working conditions and more.
              </p>
              <Button type="button" variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}
                onClick={() => {
                  const svg = document.querySelector('#hotel-qr svg')
                  if (!svg) return
                  const svgData = new XMLSerializer().serializeToString(svg)
                  const link = document.createElement('a')
                  link.href = 'data:image/svg+xml,' + encodeURIComponent(svgData)
                  link.download = `${hotel.slug}-qr.svg`
                  link.click()
                }}>
                Download QR
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Ratings overview */}
      {hotel && (hotel.averageRating || hotel.reviewCount > 0) && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.21 }}
          className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-amber-500" />
            <h2 className="font-semibold text-foreground">Staff Ratings</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-foreground">
                {hotel.averageRating ? Number(hotel.averageRating).toFixed(1) : '—'}
              </p>
              <div className="flex justify-center gap-0.5 mt-1">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={`h-4 w-4 ${Number(hotel.averageRating) >= s ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{hotel.reviewCount} review{hotel.reviewCount !== 1 ? 's' : ''}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Ratings are given by candidates who have worked at or been interviewed by your hotel. They are visible on your public profile.
            </p>
          </div>
        </motion.div>
      )}

      <div className="flex justify-end">
        <Button type="submit" variant="gradient" size="lg" loading={saving} leftIcon={<Save className="h-4 w-4" />}>
          Save Hotel Profile
        </Button>
      </div>
    </form>
  )
}
