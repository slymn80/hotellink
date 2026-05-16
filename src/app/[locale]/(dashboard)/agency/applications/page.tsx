'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { FileText, Building2, MapPin, Clock, Loader2, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn, formatRelativeDate } from '@/lib/utils'

interface Application {
  id: string
  status: string
  createdAt: string
  job: {
    id: string
    title: string
    slug: string
    department: string
    hotel: { name: string; city: string }
  }
}

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: 'Submitted',
  REVIEWING: 'Reviewing',
  SHORTLISTED: 'Shortlisted',
  INTERVIEW_SCHEDULED: 'Interview',
  OFFER_EXTENDED: 'Offer',
  OFFER_ACCEPTED: 'Accepted',
  OFFER_DECLINED: 'Declined',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
}

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'info' | 'destructive' | 'gold'> = {
  SUBMITTED: 'secondary',
  REVIEWING: 'info',
  SHORTLISTED: 'warning',
  INTERVIEW_SCHEDULED: 'warning',
  OFFER_EXTENDED: 'gold',
  OFFER_ACCEPTED: 'success',
  OFFER_DECLINED: 'destructive',
  REJECTED: 'destructive',
  WITHDRAWN: 'default',
}

const STATUSES = ['', 'SUBMITTED', 'REVIEWING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFER_EXTENDED', 'REJECTED']

export default function AgencyApplicationsPage() {
  const locale = useLocale()
  const [applications, setApplications] = useState<Application[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (statusFilter) params.set('status', statusFilter)
        params.set('pageSize', '20')
        const res = await fetch(`/api/applications?${params}`)
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
    load()
  }, [statusFilter])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Applications</h1>
        <p className="text-sm text-muted-foreground mt-1">{total} applications managed by your agency</p>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              'flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors',
              statusFilter === s ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
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
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-foreground">No applications yet</h3>
          <p className="text-sm text-muted-foreground mt-1">Applications placed through your agency will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <div key={app.id} className="rounded-2xl border border-border bg-card p-4 hover:shadow-card transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {app.job.hotel.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{app.job.title}</h3>
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
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatRelativeDate(new Date(app.createdAt))}
                    </span>
                    <Link href={`/${locale}/jobs/${app.job.slug}`}>
                      <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="h-4 w-4" />}>
                        View Job
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
