'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import Image from 'next/image'
import {
  User, MapPin, Phone, Briefcase, Globe, Plus, Trash2,
  Save, Camera, Eye, EyeOff, Loader2, Building2, GraduationCap,
  ImageIcon, Link2, X, Pencil, Check, Star, CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

const profileSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  headline: z.string().max(120).optional(),
  bio: z.string().max(2000).optional(),
  cityOfResidence: z.string().optional(),
  countryOfResidence: z.string().optional(),
  nationality: z.string().optional(),
  currentPosition: z.string().optional(),
  currentCompany: z.string().optional(),
  yearsOfExperience: z.number().min(0).max(50).optional(),
  availabilityStatus: z.string().optional(),
  isOpenToRelocation: z.boolean().optional(),
  linkedinUrl: z.string().optional(),
  portfolioUrl: z.string().optional(),
  videoIntroUrl: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface WorkExperience {
  id: string
  company: string
  position: string
  country?: string | null
  city?: string | null
  startDate: string
  endDate?: string | null
  isCurrent: boolean
  description?: string | null
}

interface Education {
  id: string
  institution: string
  degree: string
  field?: string | null
  country?: string | null
  startDate: string
  endDate?: string | null
  isCurrent: boolean
}

interface CandidateReview {
  id: string
  rating: number
  title?: string | null
  content?: string | null
  isAnonymous: boolean
  createdAt: string
  hotel: {
    name: string
    logoUrl?: string | null
    city?: string | null
    starRating?: number | null
  }
}

const DEFAULT_FEMALE_AVATARS = [
  'https://api.dicebear.com/9.x/lorelei/svg?seed=Natasha&backgroundColor=b6e3f4',
  'https://api.dicebear.com/9.x/lorelei/svg?seed=Sofia&backgroundColor=ffd5dc',
  'https://api.dicebear.com/9.x/lorelei/svg?seed=Elena&backgroundColor=d1d4f9',
  'https://api.dicebear.com/9.x/lorelei/svg?seed=Amira&backgroundColor=c0aede',
  'https://api.dicebear.com/9.x/lorelei/svg?seed=Yuki&backgroundColor=ffdfbf',
  'https://api.dicebear.com/9.x/lorelei/svg?seed=Layla&backgroundColor=d4edda',
]

const DEFAULT_MALE_AVATARS = [
  'https://api.dicebear.com/9.x/micah/svg?seed=James&backgroundColor=b6e3f4',
  'https://api.dicebear.com/9.x/micah/svg?seed=Carlos&backgroundColor=ffd5dc',
  'https://api.dicebear.com/9.x/micah/svg?seed=Hassan&backgroundColor=d1d4f9',
  'https://api.dicebear.com/9.x/micah/svg?seed=Kenji&backgroundColor=c0aede',
  'https://api.dicebear.com/9.x/micah/svg?seed=Oliver&backgroundColor=ffdfbf',
  'https://api.dicebear.com/9.x/micah/svg?seed=Emre&backgroundColor=d4edda',
]

const AVAILABILITY_OPTIONS = [
  { value: 'IMMEDIATELY_AVAILABLE', label: 'Available Now' },
  { value: 'AVAILABLE_IN_2_WEEKS', label: 'Available in 2 weeks' },
  { value: 'AVAILABLE_IN_1_MONTH', label: 'Available in 1 month' },
  { value: 'AVAILABLE_IN_3_MONTHS', label: 'Available in 3 months' },
  { value: 'NOT_AVAILABLE', label: 'Not Available' },
]

function ExperienceForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<WorkExperience>
  onSave: (data: Omit<WorkExperience, 'id'>) => Promise<void>
  onCancel: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    company: initial?.company ?? '',
    position: initial?.position ?? '',
    country: initial?.country ?? '',
    city: initial?.city ?? '',
    startDate: initial?.startDate ? initial.startDate.slice(0, 7) : '',
    endDate: initial?.endDate ? initial.endDate.slice(0, 7) : '',
    isCurrent: initial?.isCurrent ?? false,
    description: initial?.description ?? '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.company || !form.position || !form.startDate) {
      toast.error('Company, position and start date are required')
      return
    }
    setSaving(true)
    await onSave({
      ...form,
      startDate: new Date(form.startDate + '-01').toISOString(),
      endDate: form.isCurrent ? null : form.endDate ? new Date(form.endDate + '-01').toISOString() : null,
    })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-foreground mb-1 block">Company *</label>
          <input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
        </div>
        <div>
          <label className="text-xs font-medium text-foreground mb-1 block">Position *</label>
          <input value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
        </div>
        <div>
          <label className="text-xs font-medium text-foreground mb-1 block">City</label>
          <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
        </div>
        <div>
          <label className="text-xs font-medium text-foreground mb-1 block">Country</label>
          <input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
        </div>
        <div>
          <label className="text-xs font-medium text-foreground mb-1 block">Start Date *</label>
          <input type="month" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
        </div>
        <div>
          <label className="text-xs font-medium text-foreground mb-1 block">End Date</label>
          <input type="month" value={form.endDate} disabled={form.isCurrent}
            onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none disabled:opacity-50" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
        <input type="checkbox" checked={form.isCurrent} onChange={e => setForm(f => ({ ...f, isCurrent: e.target.checked, endDate: '' }))} />
        Currently working here
      </label>
      <div>
        <label className="text-xs font-medium text-foreground mb-1 block">Description</label>
        <textarea value={form.description ?? ''} rows={3}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none" />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        <Button type="submit" size="sm" loading={saving} leftIcon={<Check className="h-3.5 w-3.5" />}>Save</Button>
      </div>
    </form>
  )
}

function EducationForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<Education>
  onSave: (data: Omit<Education, 'id'>) => Promise<void>
  onCancel: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    institution: initial?.institution ?? '',
    degree: initial?.degree ?? '',
    field: initial?.field ?? '',
    country: initial?.country ?? '',
    startDate: initial?.startDate ? initial.startDate.slice(0, 7) : '',
    endDate: initial?.endDate ? initial.endDate.slice(0, 7) : '',
    isCurrent: initial?.isCurrent ?? false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.institution || !form.degree || !form.startDate) {
      toast.error('Institution, degree and start date are required')
      return
    }
    setSaving(true)
    await onSave({
      ...form,
      startDate: new Date(form.startDate + '-01').toISOString(),
      endDate: form.isCurrent ? null : form.endDate ? new Date(form.endDate + '-01').toISOString() : null,
    })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-foreground mb-1 block">Institution *</label>
          <input value={form.institution} onChange={e => setForm(f => ({ ...f, institution: e.target.value }))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
        </div>
        <div>
          <label className="text-xs font-medium text-foreground mb-1 block">Degree *</label>
          <input value={form.degree} placeholder="e.g. Bachelor's" onChange={e => setForm(f => ({ ...f, degree: e.target.value }))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
        </div>
        <div>
          <label className="text-xs font-medium text-foreground mb-1 block">Field of Study</label>
          <input value={form.field} placeholder="e.g. Hospitality Management" onChange={e => setForm(f => ({ ...f, field: e.target.value }))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
        </div>
        <div>
          <label className="text-xs font-medium text-foreground mb-1 block">Start Date *</label>
          <input type="month" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
        </div>
        <div>
          <label className="text-xs font-medium text-foreground mb-1 block">End Date</label>
          <input type="month" value={form.endDate} disabled={form.isCurrent}
            onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none disabled:opacity-50" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
        <input type="checkbox" checked={form.isCurrent} onChange={e => setForm(f => ({ ...f, isCurrent: e.target.checked, endDate: '' }))} />
        Currently studying here
      </label>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        <Button type="submit" size="sm" loading={saving} leftIcon={<Check className="h-3.5 w-3.5" />}>Save</Button>
      </div>
    </form>
  )
}

export default function CandidateProfilePage() {
  const { data: session, update: updateSession } = useSession()
  const router = useRouter()
  const locale = useLocale()
  const searchParams = useSearchParams()
  const isSetup = searchParams.get('setup') === 'true'
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [deletingGallery, setDeletingGallery] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [galleryUrls, setGalleryUrls] = useState<string[]>([])
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState('')
  const [languages, setLanguages] = useState<Array<{ language: string; level: string }>>([])
  const [isPublic, setIsPublic] = useState(true)
  const [isOpenToRelocation, setIsOpenToRelocation] = useState(true)
  const [experiences, setExperiences] = useState<WorkExperience[]>([])
  const [educations, setEducations] = useState<Education[]>([])
  const [showExpForm, setShowExpForm] = useState(false)
  const [editingExp, setEditingExp] = useState<WorkExperience | null>(null)
  const [showEduForm, setShowEduForm] = useState(false)
  const [editingEdu, setEditingEdu] = useState<Education | null>(null)
  const [reviews, setReviews] = useState<CandidateReview[]>([])
  const [profileId, setProfileId] = useState<string | null>(null)

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile/candidate')
        const data = await res.json()
        if (data.status === 'success') {
          const p = data.data
          reset({
            firstName: p.firstName,
            lastName: p.lastName,
            headline: p.headline ?? '',
            bio: p.bio ?? '',
            cityOfResidence: p.cityOfResidence ?? '',
            countryOfResidence: p.countryOfResidence ?? '',
            nationality: p.nationality ?? '',
            currentPosition: p.currentPosition ?? '',
            currentCompany: p.currentCompany ?? '',
            yearsOfExperience: p.yearsOfExperience ?? 0,
            availabilityStatus: p.availabilityStatus ?? 'IMMEDIATELY_AVAILABLE',
            linkedinUrl: p.linkedinUrl ?? '',
            portfolioUrl: p.portfolioUrl ?? '',
            videoIntroUrl: p.videoIntroUrl ?? '',
          })
          setIsPublic(p.isPublic ?? true)
          setIsOpenToRelocation(p.isOpenToRelocation ?? true)
          setAvatarUrl(p.profilePhoto ?? null)
          setGalleryUrls(p.photoUrls ?? [])
          setSkills(p.skills?.map((s: { skill: string }) => s.skill) ?? [])
          setLanguages(p.languages?.map((l: { language: string; level: string }) => ({ language: l.language, level: l.level })) ?? [])
          setExperiences(p.experience ?? [])
          setEducations(p.education ?? [])
          setProfileId(p.id)
          const reviewRes = await fetch(`/api/reviews/candidate?candidateId=${p.id}`)
          const reviewData = await reviewRes.json()
          if (reviewData.status === 'success') setReviews(reviewData.data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [reset])

  const onSubmit = async (data: ProfileFormData) => {
    setSaving(true)
    try {
      const res = await fetch('/api/profile/candidate', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, isPublic, isOpenToRelocation, skills, languages }),
      })
      if (res.ok) {
        if (isSetup) {
          toast.success('Registration complete! Welcome to HotelLink.')
          router.push(`/${locale}/candidate`)
        } else {
          toast.success('Profile updated successfully')
        }
      } else {
        const json = await res.json()
        toast.error(json.error ?? 'Failed to update profile')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', 'avatar')
      const res = await fetch('/api/upload/image', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok) {
        setAvatarUrl(data.data.url)
        await updateSession({ image: data.data.url })
        toast.success('Profile photo updated')
      } else {
        toast.error(data.error ?? 'Upload failed')
      }
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploadingAvatar(false)
      if (avatarInputRef.current) avatarInputRef.current.value = ''
    }
  }

  const handleAvatarDelete = async () => {
    if (!confirm('Remove your profile photo?')) return
    setUploadingAvatar(true)
    try {
      const res = await fetch('/api/upload/image', { method: 'DELETE' })
      if (res.ok) {
        setAvatarUrl(null)
        await updateSession({ image: null })
        toast.success('Profile photo removed')
      } else {
        toast.error('Failed to remove photo')
      }
    } catch {
      toast.error('Failed to remove photo')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSelectDefaultAvatar = async (url: string) => {
    if (avatarUrl === url) return
    setUploadingAvatar(true)
    try {
      const res = await fetch('/api/upload/image', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (res.ok) {
        setAvatarUrl(url)
        await updateSession({ image: url })
        toast.success('Avatar updated')
      } else {
        toast.error(data.error ?? 'Failed to update avatar')
      }
    } catch {
      toast.error('Failed to update avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleGalleryAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploadingGallery(true)
    try {
      for (const file of files) {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('type', 'candidate_gallery')
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
    setDeletingGallery(url)
    try {
      const res = await fetch('/api/upload/gallery', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, ownerType: 'candidate' }),
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

  const handleSaveExperience = async (data: Omit<WorkExperience, 'id'>) => {
    if (editingExp) {
      const res = await fetch(`/api/profile/candidate/experience/${editingExp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const json = await res.json()
        setExperiences(prev => prev.map(e => e.id === editingExp.id ? json.data : e))
        setEditingExp(null)
        toast.success('Experience updated')
      } else {
        toast.error('Failed to update')
      }
    } else {
      const res = await fetch('/api/profile/candidate/experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const json = await res.json()
        setExperiences(prev => [json.data, ...prev])
        setShowExpForm(false)
        toast.success('Experience added')
      } else {
        toast.error('Failed to add')
      }
    }
  }

  const handleDeleteExperience = async (id: string) => {
    if (!confirm('Delete this experience?')) return
    const res = await fetch(`/api/profile/candidate/experience/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setExperiences(prev => prev.filter(e => e.id !== id))
      toast.success('Experience deleted')
    }
  }

  const handleSaveEducation = async (data: Omit<Education, 'id'>) => {
    if (editingEdu) {
      const res = await fetch(`/api/profile/candidate/education/${editingEdu.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const json = await res.json()
        setEducations(prev => prev.map(e => e.id === editingEdu.id ? json.data : e))
        setEditingEdu(null)
        toast.success('Education updated')
      } else {
        toast.error('Failed to update')
      }
    } else {
      const res = await fetch('/api/profile/candidate/education', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const json = await res.json()
        setEducations(prev => [json.data, ...prev])
        setShowEduForm(false)
        toast.success('Education added')
      } else {
        toast.error('Failed to add')
      }
    }
  }

  const handleDeleteEducation = async (id: string) => {
    if (!confirm('Delete this education?')) return
    const res = await fetch(`/api/profile/candidate/education/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setEducations(prev => prev.filter(e => e.id !== id))
      toast.success('Education deleted')
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill('')
    }
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
      {/* Setup mode banner */}
      {isSetup && (
        <div className="rounded-2xl bg-primary/10 border border-primary/20 p-4 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-foreground text-sm">Complete your registration</p>
            <p className="text-xs text-muted-foreground mt-0.5">Fill in your basic details below so hotels can find you. At minimum, your name and nationality are required.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isSetup ? 'Your Profile' : 'My Profile'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isSetup ? 'Tell us a bit about yourself to get started' : 'Keep your profile updated to attract hotel recruiters'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsPublic(!isPublic)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {isPublic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            {isPublic ? 'Public' : 'Private'}
          </button>
          <Button type="submit" variant="gradient" loading={saving} leftIcon={<Save className="h-4 w-4" />}>
            Save Changes
          </Button>
        </div>
      </div>

      {/* Profile Photo */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 font-semibold text-foreground">Profile Photo</h2>

        {/* Current photo + upload */}
        <div className="flex items-center gap-4 mb-5">
          <div className="relative h-20 w-20 flex-shrink-0">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="Profile photo" width={80} height={80}
                className="h-20 w-20 rounded-2xl object-cover" unoptimized />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-ocean-600 text-white text-2xl font-bold">
                {session?.user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
              </div>
            )}
            <button type="button" onClick={() => avatarInputRef.current?.click()} disabled={uploadingAvatar}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-md hover:bg-primary/90 disabled:opacity-60">
              {uploadingAvatar ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Upload your own photo or pick a default below</p>
            <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG or WebP · max 5 MB</p>
            <div className="flex gap-2 mt-2">
              <Button type="button" variant="outline" size="sm" loading={uploadingAvatar}
                onClick={() => avatarInputRef.current?.click()}>
                {avatarUrl ? 'Change Photo' : 'Upload Photo'}
              </Button>
              {avatarUrl && (
                <Button type="button" variant="ghost" size="sm" disabled={uploadingAvatar}
                  onClick={handleAvatarDelete} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Default avatars */}
        <div className="border-t border-border pt-4">
          <p className="text-xs font-medium text-muted-foreground mb-3">Default Avatars</p>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Female</p>
            <div className="flex flex-wrap gap-3">
              {DEFAULT_FEMALE_AVATARS.map((url) => (
                <button key={url} type="button" onClick={() => handleSelectDefaultAvatar(url)}
                  disabled={uploadingAvatar}
                  className={`relative h-12 w-12 rounded-xl overflow-hidden ring-2 transition-all hover:scale-105 ${
                    avatarUrl === url ? 'ring-primary' : 'ring-transparent hover:ring-border'
                  }`}>
                  <Image src={url} alt="Avatar option" fill className="object-cover" unoptimized />
                  {avatarUrl === url && (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Male</p>
            <div className="flex flex-wrap gap-3">
              {DEFAULT_MALE_AVATARS.map((url) => (
                <button key={url} type="button" onClick={() => handleSelectDefaultAvatar(url)}
                  disabled={uploadingAvatar}
                  className={`relative h-12 w-12 rounded-xl overflow-hidden ring-2 transition-all hover:scale-105 ${
                    avatarUrl === url ? 'ring-primary' : 'ring-transparent hover:ring-border'
                  }`}>
                  <Image src={url} alt="Avatar option" fill className="object-cover" unoptimized />
                  {avatarUrl === url && (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handleAvatarChange} />
      </motion.div>

      {/* Photo Gallery */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}
        className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-foreground">Photo Gallery</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Showcase yourself — hotels and recruiters can see these</p>
          </div>
          <Button type="button" variant="outline" size="sm" loading={uploadingGallery}
            leftIcon={<Plus className="h-4 w-4" />} onClick={() => galleryInputRef.current?.click()}
            disabled={galleryUrls.length >= 10}>
            Add Photos
          </Button>
        </div>
        {galleryUrls.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {galleryUrls.map((url) => (
              <div key={url} className="relative group aspect-square">
                <Image src={url} alt="" fill className="rounded-xl object-cover" />
                <button
                  type="button"
                  onClick={() => handleGalleryRemove(url)}
                  disabled={deletingGallery === url}
                  className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {deletingGallery === url ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 rounded-xl border-2 border-dashed border-border text-muted-foreground">
            <ImageIcon className="h-8 w-8 mb-2" />
            <p className="text-sm">No photos yet</p>
          </div>
        )}
        <input ref={galleryInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={handleGalleryAdd} />
        <p className="text-xs text-muted-foreground mt-3">{galleryUrls.length}/10 photos</p>
      </motion.div>

      {/* Basic Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Basic Information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="First Name" error={errors.firstName?.message} leftIcon={<User className="h-4 w-4" />} {...register('firstName')} />
          <Input label="Last Name" error={errors.lastName?.message} leftIcon={<User className="h-4 w-4" />} {...register('lastName')} />
        </div>
        <Input label="Professional Headline" placeholder="e.g. Senior Front Office Manager | 7 Years Luxury Hotel Experience"
          hint="Shown to hotels when they view your profile" {...register('headline')} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Current Position" placeholder="e.g. Front Office Manager" leftIcon={<Briefcase className="h-4 w-4" />} {...register('currentPosition')} />
          <Input label="Current Company / Hotel" placeholder="e.g. Marriott Istanbul" leftIcon={<Building2 className="h-4 w-4" />} {...register('currentCompany')} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Professional Bio</label>
          <textarea placeholder="Tell hotels about your experience, skills, and career goals..." rows={5}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
            maxLength={2000} {...register('bio')} />
        </div>
      </motion.div>

      {/* Contact & Location */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Location & Preferences</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Nationality" placeholder="e.g. Turkish" leftIcon={<Globe className="h-4 w-4" />} {...register('nationality')} />
          <Input label="Current City" placeholder="e.g. Istanbul" leftIcon={<MapPin className="h-4 w-4" />} {...register('cityOfResidence')} />
          <Input label="Current Country" placeholder="e.g. Turkey" leftIcon={<Globe className="h-4 w-4" />} {...register('countryOfResidence')} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Availability</label>
            <select className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              {...register('availabilityStatus')}>
              {AVAILABILITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Years of Experience</label>
            <input type="number" min={0} max={50}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              {...register('yearsOfExperience', { valueAsNumber: true })} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
          <input type="checkbox" checked={isOpenToRelocation} onChange={e => setIsOpenToRelocation(e.target.checked)} className="rounded" />
          Open to relocation
        </label>
      </motion.div>

      {/* Online Presence */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }}
        className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Online Presence</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="LinkedIn URL" placeholder="https://linkedin.com/in/yourname" leftIcon={<Link2 className="h-4 w-4" />} {...register('linkedinUrl')} />
          <Input label="Portfolio / Website" placeholder="https://yourwebsite.com" leftIcon={<Globe className="h-4 w-4" />} {...register('portfolioUrl')} />
          <Input label="Video Introduction URL" placeholder="https://youtube.com/watch?v=..." hint="A short video introducing yourself"
            leftIcon={<Phone className="h-4 w-4" />} {...register('videoIntroUrl')} />
        </div>
      </motion.div>

      {/* Work Experience */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Work Experience</h2>
          {!showExpForm && !editingExp && (
            <Button type="button" variant="outline" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowExpForm(true)}>
              Add
            </Button>
          )}
        </div>
        {showExpForm && (
          <ExperienceForm onSave={handleSaveExperience} onCancel={() => setShowExpForm(false)} />
        )}
        {experiences.length === 0 && !showExpForm && (
          <p className="text-sm text-muted-foreground py-4 text-center">No work experience added yet</p>
        )}
        {experiences.map(exp => (
          <div key={exp.id}>
            {editingExp?.id === exp.id ? (
              <ExperienceForm initial={exp} onSave={handleSaveExperience} onCancel={() => setEditingExp(null)} />
            ) : (
              <div className="flex items-start gap-3 rounded-xl border border-border p-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{exp.position}</p>
                  <p className="text-sm text-muted-foreground">{exp.company}{exp.city ? ` · ${exp.city}` : ''}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(new Date(exp.startDate))} — {exp.isCurrent ? 'Present' : exp.endDate ? formatDate(new Date(exp.endDate)) : ''}
                  </p>
                  {exp.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{exp.description}</p>}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setEditingExp(exp)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleDeleteExperience(exp.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </motion.div>

      {/* Education */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
        className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Education</h2>
          {!showEduForm && !editingEdu && (
            <Button type="button" variant="outline" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowEduForm(true)}>
              Add
            </Button>
          )}
        </div>
        {showEduForm && (
          <EducationForm onSave={handleSaveEducation} onCancel={() => setShowEduForm(false)} />
        )}
        {educations.length === 0 && !showEduForm && (
          <p className="text-sm text-muted-foreground py-4 text-center">No education added yet</p>
        )}
        {educations.map(edu => (
          <div key={edu.id}>
            {editingEdu?.id === edu.id ? (
              <EducationForm initial={edu} onSave={handleSaveEducation} onCancel={() => setEditingEdu(null)} />
            ) : (
              <div className="flex items-start gap-3 rounded-xl border border-border p-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</p>
                  <p className="text-sm text-muted-foreground">{edu.institution}{edu.country ? ` · ${edu.country}` : ''}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(new Date(edu.startDate))} — {edu.isCurrent ? 'Present' : edu.endDate ? formatDate(new Date(edu.endDate)) : ''}
                  </p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setEditingEdu(edu)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleDeleteEducation(edu.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </motion.div>

      {/* Skills */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Skills</h2>
        <div className="flex gap-2">
          <input type="text" value={newSkill} onChange={e => setNewSkill(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            placeholder="Add a skill (e.g. Revenue Management)"
            className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
          <Button type="button" variant="outline" onClick={addSkill} leftIcon={<Plus className="h-4 w-4" />}>Add</Button>
        </div>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.map(skill => (
              <span key={skill} className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                {skill}
                <button type="button" onClick={() => setSkills(skills.filter(s => s !== skill))}>
                  <X className="h-3 w-3 hover:text-destructive" />
                </button>
              </span>
            ))}
          </div>
        )}
      </motion.div>

      {/* Languages */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Languages</h2>
          <Button type="button" variant="outline" size="sm" leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setLanguages([...languages, { language: '', level: 'INTERMEDIATE' }])}>
            Add Language
          </Button>
        </div>
        {languages.map((lang, i) => (
          <div key={i} className="flex gap-3 items-end">
            <div className="flex-1">
              <input type="text" value={lang.language}
                onChange={e => { const u = [...languages]; u[i].language = e.target.value; setLanguages(u) }}
                placeholder="Language (e.g. English)"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none" />
            </div>
            <div className="w-44">
              <select value={lang.level}
                onChange={e => { const u = [...languages]; u[i].level = e.target.value; setLanguages(u) }}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none">
                <option value="BASIC">Basic</option>
                <option value="ELEMENTARY">Elementary</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="UPPER_INTERMEDIATE">Upper Intermediate</option>
                <option value="ADVANCED">Advanced</option>
                <option value="NATIVE">Native</option>
              </select>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => setLanguages(languages.filter((_, idx) => idx !== i))}>
              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
            </Button>
          </div>
        ))}
      </motion.div>

      {/* Ratings received from hotels */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
        className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="font-semibold text-foreground">Ratings from Hotels</h2>
          {reviews.length > 0 && (() => {
            const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            return (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={`h-4 w-4 ${s <= Math.round(avg) ? 'fill-amber-400 text-amber-400' : 'text-border'}`} />
                  ))}
                </div>
                <span className="text-sm font-semibold text-foreground">{avg.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
              </div>
            )
          })()}
        </div>

        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Star className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-sm">No ratings yet</p>
            <p className="text-xs mt-1">Hotels you work with can rate your performance here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map(review => (
              <div key={review.id} className="rounded-xl border border-border p-4 space-y-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-muted overflow-hidden">
                    {review.hotel.logoUrl ? (
                      <Image src={review.hotel.logoUrl} alt={review.hotel.name} width={40} height={40} className="object-cover" unoptimized />
                    ) : (
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">{review.hotel.name}</p>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`h-3.5 w-3.5 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-border'}`} />
                        ))}
                      </div>
                    </div>
                    {review.hotel.city && (
                      <p className="text-xs text-muted-foreground">{review.hotel.city}</p>
                    )}
                  </div>
                </div>
                {review.title && <p className="text-sm font-medium text-foreground">{review.title}</p>}
                {review.content && <p className="text-sm text-muted-foreground">{review.content}</p>}
                <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <div className="flex justify-end">
        <Button type="submit" variant="gradient" size="lg" loading={saving} leftIcon={<Save className="h-4 w-4" />}>
          Save Profile
        </Button>
      </div>
    </form>
  )
}
