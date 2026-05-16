'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { Building2, Globe2, Phone, Mail, MapPin, FileText, Save, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface AgencyProfile {
  agencyName: string
  description: string
  email: string
  phone: string
  website: string
  country: string
  city: string
  licenseNumber: string
  specialties: string[]
  isVerified: boolean
}

const SPECIALTY_OPTIONS = [
  'Hotel Recruitment', 'Executive Search', 'Seasonal Staffing',
  'Language-Specific Placement', 'Chef & Kitchen', 'Front Office',
  'Spa & Wellness', 'Housekeeping', 'F&B', 'Management',
]

export default function AgencyProfilePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const locale = useLocale()
  const searchParams = useSearchParams()
  const isSetup = searchParams.get('setup') === 'true'
  const [profile, setProfile] = useState<AgencyProfile>({
    agencyName: '',
    description: '',
    email: session?.user?.email ?? '',
    phone: '',
    website: '',
    country: '',
    city: '',
    licenseNumber: '',
    specialties: [],
    isVerified: false,
  })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/profile/agency')
      .then((r) => r.json())
      .then((d) => {
        if (d.status === 'success') {
          setProfile({
            agencyName: d.data.agencyName ?? '',
            description: d.data.description ?? '',
            email: d.data.email ?? session?.user?.email ?? '',
            phone: d.data.phone ?? '',
            website: d.data.website ?? '',
            country: d.data.country ?? '',
            city: d.data.city ?? '',
            licenseNumber: d.data.licenseNumber ?? '',
            specialties: d.data.specialties ?? [],
            isVerified: d.data.isVerified ?? false,
          })
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [session])

  const toggleSpecialty = (s: string) => {
    setProfile((p) => ({
      ...p,
      specialties: p.specialties.includes(s)
        ? p.specialties.filter((x) => x !== s)
        : [...p.specialties, s],
    }))
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile.agencyName.trim()) {
      toast.error('Agency name is required')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/profile/agency', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Failed to save')
      } else if (isSetup) {
        toast.success('Registration complete! Welcome to HotelLink.')
        router.push(`/${locale}/agency`)
      } else {
        toast.success('Agency profile saved')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {isSetup && (
        <div className="rounded-2xl bg-primary/10 border border-primary/20 p-4 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-foreground text-sm">Complete your registration</p>
            <p className="text-xs text-muted-foreground mt-0.5">Enter your agency details below. At minimum, your agency name is required to activate your account.</p>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isSetup ? 'Your Agency Profile' : 'Agency Profile'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isSetup ? 'Tell us about your agency to get started' : 'Your public agency page seen by hotels and candidates'}
          </p>
        </div>
        {profile.isVerified && <Badge variant="success">Verified Agency</Badge>}
      </div>

      <form onSubmit={save} className="space-y-5">
        {/* Basic info */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Building2 className="h-4.5 w-4.5 text-primary" />
            Basic Information
          </h2>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Agency Name *</label>
            <input
              type="text"
              value={profile.agencyName}
              onChange={(e) => setProfile((p) => ({ ...p, agencyName: e.target.value }))}
              placeholder="Your agency name"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">About Your Agency</label>
            <textarea
              value={profile.description}
              onChange={(e) => setProfile((p) => ({ ...p, description: e.target.value }))}
              placeholder="Describe your agency's expertise, markets, and services..."
              rows={4}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">License Number</label>
            <input
              type="text"
              value={profile.licenseNumber}
              onChange={(e) => setProfile((p) => ({ ...p, licenseNumber: e.target.value }))}
              placeholder="Recruitment license number (if applicable)"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Contact */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Mail className="h-4.5 w-4.5 text-primary" />
            Contact Information
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Business Email *</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Phone</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+90 xxx xxx xxxx"
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Website</label>
              <input
                type="url"
                value={profile.website}
                onChange={(e) => setProfile((p) => ({ ...p, website: e.target.value }))}
                placeholder="https://youragency.com"
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">City</label>
              <input
                type="text"
                value={profile.city}
                onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value }))}
                placeholder="İstanbul"
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Country</label>
            <input
              type="text"
              value={profile.country}
              onChange={(e) => setProfile((p) => ({ ...p, country: e.target.value }))}
              placeholder="Türkiye"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Specialties */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
            <FileText className="h-4.5 w-4.5 text-primary" />
            Specialties
          </h2>
          <div className="flex flex-wrap gap-2">
            {SPECIALTY_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSpecialty(s)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors border ${
                  profile.specialties.includes(s)
                    ? 'bg-primary text-white border-primary'
                    : 'bg-transparent text-muted-foreground border-border hover:border-primary/50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <Button type="submit" variant="gradient" loading={saving} leftIcon={<Save className="h-4 w-4" />}>
          Save Profile
        </Button>
      </form>
    </div>
  )
}
