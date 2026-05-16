'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2, Mail, ChevronRight,
  ChevronLeft, CheckCircle2, Star, Info, ShieldCheck, ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const HOTEL_TYPES = [
  { value: 'RESORT', label: 'Resort', icon: '🏖️' },
  { value: 'CITY_HOTEL', label: 'City Hotel', icon: '🏙️' },
  { value: 'BOUTIQUE', label: 'Boutique', icon: '🏡' },
  { value: 'APART_HOTEL', label: 'Apart Hotel', icon: '🏢' },
  { value: 'THERMAL_HOTEL', label: 'Thermal Hotel', icon: '♨️' },
  { value: 'VILLA', label: 'Villa', icon: '🌴' },
  { value: 'ECO_HOTEL', label: 'Eco Hotel', icon: '🌿' },
  { value: 'HOSTEL', label: 'Hostel', icon: '🛏️' },
]

const STAR_OPTIONS = [
  { value: 'ONE', label: '1 Star', stars: '★' },
  { value: 'TWO', label: '2 Stars', stars: '★★' },
  { value: 'THREE', label: '3 Stars', stars: '★★★' },
  { value: 'FOUR', label: '4 Stars', stars: '★★★★' },
  { value: 'FIVE', label: '5 Stars', stars: '★★★★★' },
]

const AMENITY_OPTIONS = [
  { value: 'spa', label: 'Spa & Wellness' },
  { value: 'pool', label: 'Swimming Pool' },
  { value: 'gym', label: 'Fitness Center' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'bar', label: 'Bar & Lounge' },
  { value: 'conference', label: 'Conference Center' },
  { value: 'private_beach', label: 'Private Beach' },
  { value: 'kids_club', label: 'Kids Club' },
  { value: 'golf', label: 'Golf Course' },
  { value: 'marina', label: 'Marina' },
  { value: 'water_sports', label: 'Water Sports' },
  { value: 'animation', label: 'Entertainment' },
  { value: 'wifi', label: 'Free Wi-Fi' },
  { value: 'parking', label: 'Free Parking' },
  { value: 'valet', label: 'Valet Parking' },
]

const STEPS = ['Hotel Identity', 'Contact Info', 'Description', 'Verification']

const VERIFICATION_DOCS = [
  {
    key: 'tradeRegistry',
    label: 'Trade Registry Certificate',
    sublabel: 'Ticaret Sicil Belgesi',
    required: true,
    hint: 'Official document proving the hotel is a registered legal entity.',
  },
  {
    key: 'authorizationLetter',
    label: 'Authorization Letter / Signature Circular',
    sublabel: 'Yetki Belgesi / İmza Sirküleri',
    required: true,
    hint: 'Proves you are authorized to act on behalf of the hotel.',
  },
  {
    key: 'taxCertificate',
    label: 'Tax Certificate',
    sublabel: 'Vergi Levhası',
    required: false,
    hint: 'Official tax identification document of the hotel.',
  },
  {
    key: 'hotelLicense',
    label: 'Hotel Operating License',
    sublabel: 'Otel İşletme Belgesi',
    required: false,
    hint: 'Tourism ministry or municipality operating permit.',
  },
]

interface FormData {
  name: string
  type: string
  starRating: string
  city: string
  country: string
  email: string
  phone: string
  website: string
  address: string
  shortDescription: string
  description: string
  amenities: string[]
  documents: Record<string, string>
}

export default function HotelOnboardingPage() {
  const locale = useLocale()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState<FormData>({
    name: '', type: '', starRating: '', city: '', country: 'TR',
    email: '', phone: '', website: '', address: '',
    shortDescription: '', description: '', amenities: [], documents: {},
  })

  const set = (key: keyof FormData, value: string | string[] | Record<string, string>) =>
    setForm((p) => ({ ...p, [key]: value }))

  const setDoc = (key: string, value: string) =>
    setForm((p) => ({ ...p, documents: { ...p.documents, [key]: value } }))

  const toggleAmenity = (val: string) =>
    setForm((p) => ({
      ...p,
      amenities: p.amenities.includes(val)
        ? p.amenities.filter((a) => a !== val)
        : [...p.amenities, val],
    }))

  const canProceed = () => {
    if (step === 0) return form.name.trim().length >= 3 && form.type && form.city.trim().length >= 2
    if (step === 1) return form.email.includes('@')
    if (step === 3) {
      const required = VERIFICATION_DOCS.filter(d => d.required)
      return required.every(d => (form.documents[d.key] ?? '').trim().length > 0)
    }
    return true
  }

  const submit = async () => {
    setSubmitting(true)
    try {
      const documentUrls = Object.values(form.documents).filter(Boolean)
      const res = await fetch('/api/hotels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, documents: documentUrls }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Hotel profile created! Pending admin verification.')
        router.push(`/${locale}/hotel/${data.data.id}`)
      } else {
        toast.error(data.error ?? 'Failed to create hotel')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Set Up Your Hotel Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Complete these steps to start posting jobs and receiving applications.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                i < step ? 'bg-emerald-500 text-white' :
                i === step ? 'bg-primary text-white' :
                'bg-muted text-muted-foreground'
              }`}>
                {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-xs whitespace-nowrap ${i === step ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-2 mb-5 transition-colors ${i < step ? 'bg-emerald-500' : 'bg-border'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl border border-border bg-card p-6 space-y-5"
        >
          {step === 0 && (
            <>
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Building2 className="h-4.5 w-4.5 text-primary" /> Hotel Identity
              </h2>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Hotel Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="Grand Resort Antalya"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Hotel Type *</label>
                <div className="grid grid-cols-4 gap-2">
                  {HOTEL_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => set('type', t.value)}
                      className={`flex flex-col items-center gap-1 rounded-xl border p-2.5 text-center transition-colors ${
                        form.type === t.value
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border hover:border-primary/40 text-muted-foreground'
                      }`}
                    >
                      <span className="text-lg">{t.icon}</span>
                      <span className="text-xs font-medium leading-tight">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Star Rating</label>
                <div className="flex gap-2">
                  {STAR_OPTIONS.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => set('starRating', s.value)}
                      className={`flex-1 rounded-xl border py-2 text-center text-sm transition-colors ${
                        form.starRating === s.value
                          ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/20 text-amber-600'
                          : 'border-border hover:border-amber-300 text-muted-foreground'
                      }`}
                    >
                      {s.stars}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">City *</label>
                  <input
                    value={form.city}
                    onChange={(e) => set('city', e.target.value)}
                    placeholder="Antalya"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Country</label>
                  <input
                    value={form.country}
                    onChange={(e) => set('country', e.target.value)}
                    placeholder="TR"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Mail className="h-4.5 w-4.5 text-primary" /> Contact Information
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Business Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    placeholder="hr@yourhotel.com"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    placeholder="+90 xxx xxx xxxx"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Website</label>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => set('website', e.target.value)}
                  placeholder="https://yourhotel.com"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Full Address</label>
                <input
                  value={form.address}
                  onChange={(e) => set('address', e.target.value)}
                  placeholder="Konyaaltı Bulvarı No:1, Antalya"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 flex items-start gap-2 text-sm text-primary">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>This information will be visible to candidates browsing your hotel profile.</span>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5 text-primary" /> Verification Documents
              </h2>
              <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3 flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  To verify your legal representation of this hotel, please provide links to the required documents
                  (e.g. Google Drive, Dropbox, or your company website). Documents with <span className="font-semibold">*</span> are required.
                </span>
              </div>
              <div className="space-y-4">
                {VERIFICATION_DOCS.map((doc) => (
                  <div key={doc.key}>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {doc.label} {doc.required && <span className="text-destructive">*</span>}
                      <span className="ml-1.5 text-xs text-muted-foreground font-normal">({doc.sublabel})</span>
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={form.documents[doc.key] ?? ''}
                        onChange={(e) => setDoc(doc.key, e.target.value)}
                        placeholder="https://drive.google.com/file/..."
                        className="w-full rounded-xl border border-border bg-background pl-3 pr-9 py-2.5 text-sm focus:border-primary focus:outline-none"
                      />
                      {(form.documents[doc.key] ?? '').trim().length > 0 && (
                        <a
                          href={form.documents[doc.key]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                          tabIndex={-1}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{doc.hint}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 flex items-start gap-2 text-sm text-primary">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Your profile will be created in <strong>pending verification</strong> status. An admin will review your documents and activate your profile, typically within 1–2 business days.</span>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Star className="h-4.5 w-4.5 text-primary" /> Description & Amenities
              </h2>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Short Description</label>
                <textarea
                  value={form.shortDescription}
                  onChange={(e) => set('shortDescription', e.target.value)}
                  placeholder="One sentence shown in search results..."
                  rows={2}
                  maxLength={300}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">{form.shortDescription.length}/300</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Full Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Tell candidates about your hotel culture, location, and why it's a great place to work..."
                  rows={5}
                  maxLength={3000}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Facilities & Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {AMENITY_OPTIONS.map((a) => (
                    <button
                      key={a.value}
                      type="button"
                      onClick={() => toggleAmenity(a.value)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors border ${
                        form.amenities.includes(a.value)
                          ? 'bg-primary text-white border-primary'
                          : 'bg-transparent text-muted-foreground border-border hover:border-primary/50'
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          leftIcon={<ChevronLeft className="h-4 w-4" />}
        >
          Back
        </Button>

        {step < STEPS.length - 1 ? (
          <Button
            variant="gradient"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed()}
            rightIcon={<ChevronRight className="h-4 w-4" />}
          >
            Continue
          </Button>
        ) : (
          <Button
            variant="gradient"
            loading={submitting}
            onClick={submit}
            rightIcon={<CheckCircle2 className="h-4 w-4" />}
          >
            Create Hotel Profile
          </Button>
        )}
      </div>
    </div>
  )
}
