'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import {
  MapPin, Clock, DollarSign, Globe, Home, ChevronRight,
  UtensilsCrossed, Star, BadgeCheck, Users, Building2,
  ArrowLeft, Bookmark, Share2, Send, CheckCircle, AlertCircle,
  Briefcase, Calendar, Languages,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DEPARTMENT_LABELS, JOB_TYPE_LABELS, formatDate } from '@/lib/utils'
import { toast } from 'sonner'

const STAR_MAP: Record<string, number> = {
  ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5,
}

interface JobDetailClientProps {
  job: {
    id: string
    title: string
    slug: string
    description: string
    requirements: string[]
    responsibilities: string[]
    benefits: string[]
    department: string
    type: string
    city: string
    salaryMin: number | null
    salaryMax: number | null
    salaryCurrency: string
    showSalary: boolean
    accommodationProvided: boolean
    mealProvided: boolean
    transportProvided: boolean
    visaSponsorship: boolean
    workPermitAssistance: boolean
    requiredLanguages: string[]
    experienceMin: number
    experienceMax: number | null
    openings: number
    isFeatured: boolean
    applicationDeadline: string | null
    publishedAt: string | null
    _count: { applications: number }
    hotel: {
      id: string
      name: string
      slug: string
      shortDescription: string | null
      type: string
      starRating: string
      city: string
      country: string
      logoUrl: string | null
      coverImageUrl: string | null
      isVerified: boolean
      amenities: string[]
      averageRating: number | null
      website: string | null
      email: string | null
      _count: { jobs: number }
    }
  }
  locale: string
}

export function JobDetailClient({ job, locale }: JobDetailClientProps) {
  const { data: session } = useSession()
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [showApplyForm, setShowApplyForm] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const starCount = STAR_MAP[job.hotel.starRating] ?? 0

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/jobs/${job.id}/save`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setSaved(data.saved)
        toast.success(data.saved ? 'Job saved to your list' : 'Job removed from saved')
      } else if (res.status === 401) {
        window.location.href = `/${locale}/login?callbackUrl=/${locale}/jobs/${job.slug}`
      }
    } catch {
      toast.error('Failed to save job')
    } finally {
      setSaving(false)
    }
  }

  const handleApply = async () => {
    if (!session) {
      window.location.href = `/${locale}/login?callbackUrl=/${locale}/jobs/${job.slug}`
      return
    }

    if (session.user.role !== 'CANDIDATE') {
      toast.error('Only candidates can apply for jobs')
      return
    }

    setApplying(true)
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id, coverLetter }),
      })

      const data = await res.json()

      if (res.ok) {
        setApplied(true)
        setShowApplyForm(false)
        toast.success('Application submitted successfully!')
      } else {
        toast.error(data.error ?? 'Failed to submit application')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setApplying(false)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${job.title} at ${job.hotel.name}`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard')
    }
  }

  return (
    <main className="min-h-screen bg-background pt-20">
      {/* Cover image */}
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-r from-brand-600 to-ocean-600 lg:h-64">
        {job.hotel.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={job.hotel.coverImageUrl}
            alt={job.hotel.name}
            className="h-full w-full object-cover opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      </div>

      <div className="container mx-auto max-w-5xl px-4 -mt-8">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href={`/${locale}/jobs`} className="hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Jobs
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="truncate">{job.title}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-ocean-600 text-white text-xl font-bold shadow-md">
                  {job.hotel.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={job.hotel.logoUrl} alt="" className="h-full w-full rounded-2xl object-cover" />
                  ) : (
                    job.hotel.name.charAt(0)
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Link href={`/${locale}/hotels/${job.hotel.slug}`} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                      {job.hotel.name}
                    </Link>
                    {job.hotel.isVerified && <BadgeCheck className="h-4 w-4 text-primary" />}
                    <span className="text-amber-500 text-sm">
                      {'★'.repeat(starCount)}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-foreground">{job.title}</h1>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {job.hotel.city}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {JOB_TYPE_LABELS[job.type as keyof typeof JOB_TYPE_LABELS] ?? job.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {DEPARTMENT_LABELS[job.department as keyof typeof DEPARTMENT_LABELS] ?? job.department}
                    </span>
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="mt-4 flex flex-wrap gap-2">
                {job.isFeatured && <Badge variant="featured">Featured</Badge>}
                {job.accommodationProvided && (
                  <Badge variant="success">
                    <Home className="mr-1 h-3 w-3" /> Accommodation
                  </Badge>
                )}
                {job.mealProvided && (
                  <Badge variant="success">
                    <UtensilsCrossed className="mr-1 h-3 w-3" /> Meals
                  </Badge>
                )}
                {job.workPermitAssistance && (
                  <Badge variant="info">
                    <Globe className="mr-1 h-3 w-3" /> Work Permit
                  </Badge>
                )}
                {job.visaSponsorship && <Badge variant="gold">Visa Sponsorship</Badge>}
              </div>

              {/* Salary */}
              {job.showSalary && job.salaryMin && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 p-3">
                  <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                    {job.salaryMin.toLocaleString()}
                    {job.salaryMax ? ` – ${job.salaryMax.toLocaleString()}` : '+'}{' '}
                    {job.salaryCurrency} / month
                  </span>
                </div>
              )}
            </motion.div>

            {/* Description */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <h2 className="mb-4 text-lg font-semibold text-foreground">About This Role</h2>
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {job.description}
              </p>
            </motion.section>

            {/* Responsibilities */}
            {job.responsibilities?.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <h2 className="mb-4 text-lg font-semibold text-foreground">Key Responsibilities</h2>
                <ul className="space-y-2">
                  {job.responsibilities.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                      {r}
                    </li>
                  ))}
                </ul>
              </motion.section>
            )}

            {/* Requirements */}
            {job.requirements?.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <h2 className="mb-4 text-lg font-semibold text-foreground">Requirements</h2>
                <ul className="space-y-2">
                  {job.requirements.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      {r}
                    </li>
                  ))}
                </ul>
              </motion.section>
            )}

            {/* Benefits */}
            {job.benefits?.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <h2 className="mb-4 text-lg font-semibold text-foreground">Benefits & Perks</h2>
                <ul className="space-y-2">
                  {job.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Star className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                      {b}
                    </li>
                  ))}
                </ul>
              </motion.section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Apply card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-24 rounded-2xl border border-border bg-card p-5 shadow-card"
            >
              {applied ? (
                <div className="text-center py-4">
                  <CheckCircle className="mx-auto h-10 w-10 text-emerald-500 mb-3" />
                  <h3 className="font-semibold text-foreground">Application Submitted!</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    The hotel team will review your profile and get in touch.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4 space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>Openings</span>
                      <span className="font-medium text-foreground">{job.openings}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Applicants</span>
                      <span className="font-medium text-foreground">{job._count.applications}</span>
                    </div>
                    {job.applicationDeadline && (
                      <div className="flex items-center justify-between">
                        <span>Deadline</span>
                        <span className="font-medium text-foreground">
                          {formatDate(new Date(job.applicationDeadline))}
                        </span>
                      </div>
                    )}
                    {job.experienceMin !== undefined && (
                      <div className="flex items-center justify-between">
                        <span>Experience</span>
                        <span className="font-medium text-foreground">
                          {job.experienceMin}+ years
                        </span>
                      </div>
                    )}
                  </div>

                  {showApplyForm && (
                    <div className="mb-4">
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        Cover Letter (optional)
                      </label>
                      <textarea
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        placeholder="Introduce yourself and explain why you're a great fit..."
                        rows={5}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
                        maxLength={2000}
                      />
                      <p className="mt-1 text-right text-xs text-muted-foreground">
                        {coverLetter.length}/2000
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    {!showApplyForm ? (
                      <Button
                        variant="gradient"
                        size="lg"
                        className="w-full"
                        leftIcon={<Send className="h-4 w-4" />}
                        onClick={() => setShowApplyForm(true)}
                      >
                        Apply Now
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="gradient"
                          size="lg"
                          className="w-full"
                          loading={applying}
                          onClick={handleApply}
                        >
                          Submit Application
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          onClick={() => setShowApplyForm(false)}
                        >
                          Cancel
                        </Button>
                      </>
                    )}

                    <Button
                      variant={saved ? 'gradient' : 'outline'}
                      size="sm"
                      className="w-full"
                      loading={saving}
                      leftIcon={<Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />}
                      onClick={handleSave}
                    >
                      {saved ? 'Saved' : 'Save Job'}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      leftIcon={<Share2 className="h-4 w-4" />}
                      onClick={handleShare}
                    >
                      Share
                    </Button>
                  </div>
                </>
              )}
            </motion.div>

            {/* Job details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <h3 className="mb-3 font-semibold text-foreground text-sm">Job Details</h3>
              <div className="space-y-3 text-sm">
                {job.requiredLanguages?.length > 0 && (
                  <div className="flex items-start gap-2">
                    <Languages className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Languages</p>
                      <div className="flex flex-wrap gap-1">
                        {job.requiredLanguages.map((lang) => (
                          <Badge key={lang} variant="secondary" size="sm">{lang}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {job.publishedAt && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span className="text-xs">
                      Posted {formatDate(new Date(job.publishedAt))}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Hotel card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <h3 className="mb-3 font-semibold text-foreground text-sm">About the Hotel</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-ocean-600 text-white text-sm font-bold">
                  {job.hotel.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{job.hotel.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {'★'.repeat(starCount)} · {job.hotel.city}
                  </p>
                </div>
              </div>
              {job.hotel.shortDescription && (
                <p className="text-xs text-muted-foreground line-clamp-3 mb-3">
                  {job.hotel.shortDescription}
                </p>
              )}
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {job.hotel._count.jobs} open positions
                </span>
                {job.hotel.isVerified && (
                  <Badge variant="verified" size="sm">
                    <BadgeCheck className="mr-1 h-2.5 w-2.5" /> Verified
                  </Badge>
                )}
              </div>
              <Link href={`/${locale}/hotels/${job.hotel.slug}`}>
                <Button variant="outline" size="sm" className="w-full">
                  View Hotel Profile
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  )
}
