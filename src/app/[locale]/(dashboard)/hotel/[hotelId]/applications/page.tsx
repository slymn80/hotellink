'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Users, Star, Eye, MessageSquare, CheckCircle,
  XCircle, Clock, Loader2, Briefcase,
  Globe, MapPin,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatRelativeDate } from '@/lib/utils'
import { toast } from 'sonner'

interface Application {
  id: string
  status: string
  isStarred: boolean
  coverLetter: string | null
  createdAt: string
  job: { title: string; department: string }
  candidate: {
    id: string
    firstName: string
    lastName: string
    headline: string | null
    cityOfResidence: string | null
    countryOfResidence: string | null
    yearsOfExperience: number | null
    user: { id: string; name: string | null; image: string | null }
    languages: Array<{ language: string; level: string }>
    skills: Array<{ skill: string }>
  }
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'info' | 'destructive' | 'gold' }> = {
  SUBMITTED: { label: 'New', variant: 'info' },
  REVIEWING: { label: 'Reviewing', variant: 'warning' },
  SHORTLISTED: { label: 'Shortlisted', variant: 'gold' },
  INTERVIEW_SCHEDULED: { label: 'Interview', variant: 'warning' },
  INTERVIEW_COMPLETED: { label: 'Interviewed', variant: 'info' },
  OFFER_EXTENDED: { label: 'Offer Sent', variant: 'gold' },
  OFFER_ACCEPTED: { label: 'Accepted', variant: 'success' },
  OFFER_DECLINED: { label: 'Declined', variant: 'destructive' },
  REJECTED: { label: 'Rejected', variant: 'destructive' },
  WITHDRAWN: { label: 'Withdrawn', variant: 'secondary' },
}

const STATUS_TRANSITIONS: Record<string, string[]> = {
  SUBMITTED: ['REVIEWING', 'SHORTLISTED', 'REJECTED'],
  REVIEWING: ['SHORTLISTED', 'REJECTED'],
  SHORTLISTED: ['INTERVIEW_SCHEDULED', 'REJECTED'],
  INTERVIEW_SCHEDULED: ['INTERVIEW_COMPLETED', 'REJECTED'],
  INTERVIEW_COMPLETED: ['OFFER_EXTENDED', 'REJECTED'],
  OFFER_EXTENDED: ['OFFER_ACCEPTED', 'REJECTED'],
}

export default function HotelApplicationsPage() {
  const locale = useLocale()
  const { hotelId } = useParams<{ hotelId: string }>()
  const [applications, setApplications] = useState<Application[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)
  const [ratingAppId, setRatingAppId] = useState<string | null>(null)
  const [ratedCandidates, setRatedCandidates] = useState<Set<string>>(new Set())
  const [ratingForm, setRatingForm] = useState({ rating: 0, title: '', content: '', isAnonymous: false })
  const [submittingRating, setSubmittingRating] = useState(false)

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      params.set('hotelId', hotelId)
      const res = await fetch(`/api/applications?${params.toString()}`)
      const data = await res.json()
      if (data.status === 'success') {
        setApplications(data.data.items)
        setTotal(data.data.total)
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchApplications() }, [statusFilter, hotelId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusUpdate = async (appId: string, newStatus: string) => {
    setUpdating(appId)
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) { toast.success('Application status updated'); fetchApplications() }
    } catch { toast.error('Failed to update status') }
    finally { setUpdating(null) }
  }

  const handleSubmitRating = async (candidateId: string) => {
    if (!ratingForm.rating) { toast.error('Please select a star rating'); return }
    setSubmittingRating(true)
    try {
      const res = await fetch('/api/reviews/candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId, ...ratingForm }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Review submitted!')
        setRatedCandidates(prev => new Set(prev).add(candidateId))
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

  const handleToggleStar = async (appId: string, isStarred: boolean) => {
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isStarred: !isStarred }),
      })
      if (res.ok) setApplications(apps => apps.map(a => a.id === appId ? { ...a, isStarred: !isStarred } : a))
    } catch { /* silent */ }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Applications</h1>
          <p className="text-sm text-muted-foreground mt-1">{total} total applications</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {['', 'SUBMITTED', 'REVIEWING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFER_EXTENDED', 'OFFER_ACCEPTED', 'REJECTED'].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${statusFilter === s ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
            {s ? STATUS_CONFIG[s]?.label ?? s : 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : applications.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold text-foreground">No applications yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Applications from candidates will appear here once you post jobs.</p>
          <Link href={`/${locale}/hotel/${hotelId}/jobs`}>
            <Button variant="gradient" className="mt-4">View Jobs</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app, i) => {
            const config = STATUS_CONFIG[app.status]
            const transitions = STATUS_TRANSITIONS[app.status] ?? []
            return (
              <motion.div key={app.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`rounded-2xl border bg-card p-5 transition-shadow hover:shadow-card ${app.isStarred ? 'border-amber-200 dark:border-amber-800/50' : 'border-border'}`}>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-ocean-600 text-white text-lg font-bold">
                    {app.candidate.firstName.charAt(0)}{app.candidate.lastName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{app.candidate.firstName} {app.candidate.lastName}</h3>
                          <button onClick={() => handleToggleStar(app.id, app.isStarred)}
                            className={`text-lg transition-colors ${app.isStarred ? 'text-amber-500' : 'text-muted-foreground hover:text-amber-500'}`}>★</button>
                        </div>
                        {app.candidate.headline && <p className="text-xs text-muted-foreground">{app.candidate.headline}</p>}
                      </div>
                      <Badge variant={config?.variant ?? 'secondary'} size="sm" className="flex-shrink-0">{config?.label ?? app.status}</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-2">
                      {app.candidate.cityOfResidence && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {app.candidate.cityOfResidence}</span>}
                      {app.candidate.yearsOfExperience !== null && <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {app.candidate.yearsOfExperience}+ years</span>}
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Applied {formatRelativeDate(new Date(app.createdAt))}</span>
                      <span className="text-primary">For: {app.job.title}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {app.candidate.languages.slice(0, 3).map((l) => <Badge key={l.language} variant="secondary" size="sm"><Globe className="mr-1 h-2.5 w-2.5" /> {l.language}</Badge>)}
                      {app.candidate.skills.slice(0, 2).map((s) => <Badge key={s.skill} variant="outline" size="sm">{s.skill}</Badge>)}
                    </div>
                    {app.coverLetter && <p className="text-xs text-muted-foreground line-clamp-2 mb-3 italic border-l-2 border-primary/30 pl-2">"{app.coverLetter}"</p>}
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/${locale}/hotel/${hotelId}/candidates/${app.candidate.id}`}>
                        <Button variant="outline" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />}>View Profile</Button>
                      </Link>
                      <Link href={`/${locale}/messages?with=${app.candidate.user.id}&name=${encodeURIComponent(app.candidate.firstName + ' ' + app.candidate.lastName)}`}>
                        <Button variant="outline" size="sm" leftIcon={<MessageSquare className="h-3.5 w-3.5" />}>Message</Button>
                      </Link>

                      {app.status === 'OFFER_ACCEPTED' && !ratedCandidates.has(app.candidate.id) && (
                        <Button variant="outline" size="sm" leftIcon={<Star className="h-3.5 w-3.5" />}
                          onClick={() => setRatingAppId(ratingAppId === app.id ? null : app.id)}>
                          Rate Candidate
                        </Button>
                      )}
                      {app.status === 'OFFER_ACCEPTED' && ratedCandidates.has(app.candidate.id) && (
                        <span className="text-xs text-emerald-600 flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current" /> Reviewed
                        </span>
                      )}

                      {transitions.length > 0 && (
                        <div className="flex gap-1.5">
                          {transitions.slice(0, 2).map((nextStatus) => {
                            const nextConfig = STATUS_CONFIG[nextStatus]
                            const isPositive = ['REVIEWING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'OFFER_EXTENDED', 'OFFER_ACCEPTED'].includes(nextStatus)
                            return (
                              <Button key={nextStatus} variant={isPositive ? 'gradient' : 'outline'} size="sm"
                                loading={updating === app.id} onClick={() => handleStatusUpdate(app.id, nextStatus)}
                                className={!isPositive ? 'text-muted-foreground' : ''}>
                                {isPositive ? <CheckCircle className="mr-1 h-3.5 w-3.5" /> : <XCircle className="mr-1 h-3.5 w-3.5" />}
                                {nextConfig?.label ?? nextStatus}
                              </Button>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {ratingAppId === app.id && (
                      <div className="mt-3 rounded-xl border border-border bg-muted/30 p-4 space-y-3">
                        <p className="text-sm font-medium text-foreground">Rate {app.candidate.firstName} {app.candidate.lastName}</p>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(s => (
                            <button key={s} type="button" onClick={() => setRatingForm(f => ({ ...f, rating: s }))}
                              className={`text-2xl transition-transform hover:scale-110 ${s <= ratingForm.rating ? 'text-amber-400' : 'text-border'}`}>★</button>
                          ))}
                        </div>
                        <input type="text" placeholder="Title (optional)" maxLength={120} value={ratingForm.title}
                          onChange={e => setRatingForm(f => ({ ...f, title: e.target.value }))}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                        <textarea placeholder="Share your experience... (optional)" rows={3} maxLength={2000} value={ratingForm.content}
                          onChange={e => setRatingForm(f => ({ ...f, content: e.target.value }))}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none" />
                        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                          <input type="checkbox" checked={ratingForm.isAnonymous}
                            onChange={e => setRatingForm(f => ({ ...f, isAnonymous: e.target.checked }))} />
                          Submit anonymously
                        </label>
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="ghost" size="sm" onClick={() => setRatingAppId(null)}>Cancel</Button>
                          <Button type="button" size="sm" variant="gradient" loading={submittingRating}
                            onClick={() => handleSubmitRating(app.candidate.id)}>Submit Review</Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
