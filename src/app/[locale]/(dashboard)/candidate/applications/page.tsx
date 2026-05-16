'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Briefcase, Clock, MessageSquare,
  ChevronRight, Building2, MapPin, Loader2, Star, Send,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatRelativeDate } from '@/lib/utils'
import { toast } from 'sonner'

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: 'Submitted',
  REVIEWING: 'Under Review',
  SHORTLISTED: 'Shortlisted',
  INTERVIEW_SCHEDULED: 'Interview Scheduled',
  INTERVIEW_COMPLETED: 'Interview Completed',
  OFFER_EXTENDED: 'Offer Extended',
  OFFER_ACCEPTED: 'Offer Accepted',
  OFFER_DECLINED: 'Offer Declined',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
}

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'info' | 'destructive' | 'gold'> = {
  SUBMITTED: 'secondary',
  REVIEWING: 'info',
  SHORTLISTED: 'warning',
  INTERVIEW_SCHEDULED: 'warning',
  INTERVIEW_COMPLETED: 'info',
  OFFER_EXTENDED: 'gold',
  OFFER_ACCEPTED: 'success',
  OFFER_DECLINED: 'destructive',
  REJECTED: 'destructive',
  WITHDRAWN: 'default',
}

interface Application {
  id: string
  status: string
  coverLetter: string | null
  isStarred: boolean
  createdAt: string
  job: {
    id: string
    title: string
    slug: string
    department: string
    type: string
    hotel: {
      id: string
      name: string
      logoUrl: string | null
      city: string
      starRating: string
      isVerified: boolean
      employers: Array<{ userId: string }>
    }
  }
}

export default function CandidateApplicationsPage() {
  const locale = useLocale()
  const [applications, setApplications] = useState<Application[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [ratingAppId, setRatingAppId] = useState<string | null>(null)
  const [ratedHotels, setRatedHotels] = useState<Set<string>>(new Set())
  const [ratingForm, setRatingForm] = useState({ rating: 0, title: '', content: '', isAnonymous: false })
  const [submittingRating, setSubmittingRating] = useState(false)

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (statusFilter) params.set('status', statusFilter)
        params.set('page', String(page))

        const res = await fetch(`/api/applications?${params.toString()}`)
        const data = await res.json()
        if (data.status === 'success') {
          setApplications(data.data.items)
          setTotal(data.data.total)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [statusFilter, page])

  const handleSubmitRating = async (hotelId: string) => {
    if (!ratingForm.rating) { toast.error('Please select a star rating'); return }
    setSubmittingRating(true)
    try {
      const res = await fetch('/api/reviews/hotel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotelId, ...ratingForm }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Review submitted!')
        setRatedHotels(prev => new Set(prev).add(hotelId))
        setRatingAppId(null)
        setRatingForm({ rating: 0, title: '', content: '', isAnonymous: false })
      } else {
        toast.error(data.error ?? 'Failed to submit review')
      }
    } catch {
      toast.error('Failed to submit review')
    } finally {
      setSubmittingRating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Applications</h1>
          <p className="text-sm text-muted-foreground mt-1">{total} total applications</p>
        </div>
        <Link href={`/${locale}/jobs`}>
          <Button variant="gradient" leftIcon={<Briefcase className="h-4 w-4" />}>
            Browse Jobs
          </Button>
        </Link>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['', 'SUBMITTED', 'REVIEWING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFER_EXTENDED', 'OFFER_ACCEPTED', 'REJECTED'].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1) }}
            className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === s
                ? 'bg-primary text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {s ? STATUS_LABELS[s] : 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold text-foreground">No applications yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Start applying to hospitality positions at top hotels in Türkiye
          </p>
          <Link href={`/${locale}/jobs`}>
            <Button variant="gradient" className="mt-4">Browse Jobs</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app, i) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-border bg-card p-4 hover:shadow-card transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-ocean-600 text-white text-sm font-bold">
                  {app.job.hotel.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={app.job.hotel.logoUrl} alt="" className="h-full w-full rounded-xl object-cover" />
                  ) : (
                    app.job.hotel.name.charAt(0)
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-foreground truncate">{app.job.title}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Building2 className="h-3.5 w-3.5" />
                        {app.job.hotel.name}
                        <MapPin className="h-3.5 w-3.5 ml-1" />
                        {app.job.hotel.city}
                      </p>
                    </div>
                    <Badge variant={STATUS_VARIANTS[app.status] ?? 'secondary'} size="sm" className="flex-shrink-0">
                      {STATUS_LABELS[app.status] ?? app.status}
                    </Badge>
                  </div>

                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Applied {formatRelativeDate(new Date(app.createdAt))}
                    </span>
                    {app.coverLetter && (
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        Cover letter included
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex gap-2 flex-wrap">
                  {app.status === 'OFFER_EXTENDED' && (
                    <Button variant="gradient" size="sm">View Offer</Button>
                  )}
                  {app.status === 'INTERVIEW_SCHEDULED' && (
                    <Button variant="outline" size="sm">Interview Details</Button>
                  )}
                  {['SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'OFFER_EXTENDED', 'OFFER_ACCEPTED'].includes(app.status) &&
                    app.job.hotel.employers[0]?.userId && (
                    <Link href={`/${locale}/messages?with=${app.job.hotel.employers[0].userId}&name=${encodeURIComponent(app.job.hotel.name)}`}>
                      <Button variant="outline" size="sm" leftIcon={<Send className="h-3.5 w-3.5" />}>
                        Message Hotel
                      </Button>
                    </Link>
                  )}
                  {app.status === 'OFFER_ACCEPTED' && !ratedHotels.has(app.job.hotel.id) && (
                    <Button
                      variant="outline" size="sm"
                      leftIcon={<Star className="h-3.5 w-3.5" />}
                      onClick={() => setRatingAppId(ratingAppId === app.id ? null : app.id)}
                    >
                      Rate Hotel
                    </Button>
                  )}
                  {app.status === 'OFFER_ACCEPTED' && ratedHotels.has(app.job.hotel.id) && (
                    <span className="text-xs text-emerald-600 flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" /> Reviewed
                    </span>
                  )}
                </div>
                <Link href={`/${locale}/jobs/${app.job.slug}`}>
                  <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="h-4 w-4" />}>
                    View Job
                  </Button>
                </Link>
              </div>

              {/* Inline rating form */}
              {ratingAppId === app.id && (
                <div className="mt-3 rounded-xl border border-border bg-muted/30 p-4 space-y-3">
                  <p className="text-sm font-medium text-foreground">Rate your experience at {app.job.hotel.name}</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button key={s} type="button" onClick={() => setRatingForm(f => ({ ...f, rating: s }))}
                        className={`text-2xl transition-transform hover:scale-110 ${s <= ratingForm.rating ? 'text-amber-400' : 'text-border'}`}>
                        ★
                      </button>
                    ))}
                  </div>
                  <input
                    type="text" placeholder="Title (optional)" maxLength={120}
                    value={ratingForm.title}
                    onChange={e => setRatingForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                  <textarea
                    placeholder="Share your experience... (optional)" rows={3} maxLength={2000}
                    value={ratingForm.content}
                    onChange={e => setRatingForm(f => ({ ...f, content: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none"
                  />
                  <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                    <input type="checkbox" checked={ratingForm.isAnonymous}
                      onChange={e => setRatingForm(f => ({ ...f, isAnonymous: e.target.checked }))} />
                    Submit anonymously
                  </label>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setRatingAppId(null)}>Cancel</Button>
                    <Button type="button" size="sm" variant="gradient" loading={submittingRating}
                      onClick={() => handleSubmitRating(app.job.hotel.id)}>
                      Submit Review
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
