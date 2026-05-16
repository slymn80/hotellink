'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import {
  Briefcase, Building2, MapPin, Search, Filter,
  CheckCircle2, XCircle, PauseCircle, Loader2, ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Job {
  id: string
  slug: string
  title: string
  department: string
  type: string
  status: string
  createdAt: string
  applicationCount: number
  hotel: { name: string; city: string; isVerified: boolean }
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'success' | 'secondary' | 'warning' | 'destructive' | 'info' }> = {
  ACTIVE: { label: 'Active', variant: 'success' },
  DRAFT: { label: 'Draft', variant: 'secondary' },
  PAUSED: { label: 'Paused', variant: 'warning' },
  CLOSED: { label: 'Closed', variant: 'destructive' },
  FILLED: { label: 'Filled', variant: 'info' },
}

const STATUSES = ['', 'ACTIVE', 'DRAFT', 'PAUSED', 'CLOSED', 'FILLED']

export default function AdminJobsPage() {
  const locale = useLocale()
  const [jobs, setJobs] = useState<Job[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (search) params.set('q', search)
        if (statusFilter) params.set('status', statusFilter)
        params.set('page', String(page))
        params.set('pageSize', '20')

        const res = await fetch(`/api/jobs?${params}`)
        const data = await res.json()
        if (data.status === 'success') {
          setJobs(data.data.items)
          setTotal(data.data.total)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch_()
  }, [search, statusFilter, page])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Job Listings</h1>
          <p className="text-sm text-muted-foreground mt-1">{total} total jobs on the platform</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search jobs or hotels..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1) }}
              className={cn(
                'flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors',
                statusFilter === s ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {s ? STATUS_CONFIG[s]?.label : 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-sm text-muted-foreground">No jobs found</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {jobs.map((job, i) => {
            const cfg = STATUS_CONFIG[job.status]
            return (
              <div
                key={job.id}
                className={cn(
                  'flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors',
                  i < jobs.length - 1 && 'border-b border-border'
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {job.hotel.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground truncate">{job.title}</p>
                    {cfg && <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Building2 className="h-3.5 w-3.5" />
                    {job.hotel.name}
                    <span className="mx-1 text-border">·</span>
                    <MapPin className="h-3.5 w-3.5" />
                    {job.hotel.city}
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
                  <span>{job.applicationCount} apps</span>
                  <span className="text-xs">{new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
                <Link href={`/${locale}/jobs/${job.slug}`}>
                  <Button variant="ghost" size="icon-sm">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled={page * 20 >= total} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
