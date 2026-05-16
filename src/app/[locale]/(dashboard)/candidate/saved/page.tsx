'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { Bookmark, BookmarkX, Search, MapPin, Building2, Clock, Home, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { DEPARTMENT_LABELS, JOB_TYPE_LABELS } from '@/lib/utils'

interface SavedJob {
  id: string
  createdAt: string
  job: {
    id: string
    title: string
    slug: string
    department: string
    type: string
    city: string
    salaryMin: number | null
    salaryMax: number | null
    salaryCurrency: string
    showSalary: boolean
    accommodationProvided: boolean
    workPermitAssistance: boolean
    createdAt: string
    hotel: { id: string; name: string; slug: string; city: string; logoUrl: string | null }
  }
}

export default function SavedJobsPage() {
  const locale = useLocale()
  const [saved, setSaved] = useState<SavedJob[]>([])
  const [loading, setLoading] = useState(true)
  const [unsaving, setUnsaving] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/jobs/saved')
      .then((r) => r.json())
      .then((d) => setSaved(d.data?.items ?? []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const unsave = async (savedId: string, jobId: string, jobTitle: string) => {
    setUnsaving(savedId)
    try {
      const res = await fetch(`/api/jobs/${jobId}/save`, { method: 'POST' })
      if (res.ok) {
        setSaved((prev) => prev.filter((s) => s.id !== savedId))
        toast.success(`"${jobTitle}" removed from saved jobs`)
      }
    } catch {
      toast.error('Failed to remove saved job')
    } finally {
      setUnsaving(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Saved Jobs</h1>
        <p className="text-sm text-muted-foreground mt-1">Jobs you bookmarked for later</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : saved.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-border">
          <Bookmark className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-foreground">No saved jobs yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Bookmark jobs while browsing to revisit them later.
          </p>
          <Link href={`/${locale}/candidate/jobs`} className="mt-4">
            <Button variant="gradient" leftIcon={<Search className="h-4 w-4" />}>
              Browse Jobs
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {saved.map((s) => (
            <div
              key={s.id}
              className="flex items-start gap-4 p-5 rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-gradient flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {s.job.hotel.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.job.hotel.logoUrl} alt="" className="w-full h-full rounded-xl object-cover" />
                ) : (
                  s.job.hotel.name.charAt(0)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <h3 className="font-semibold text-foreground">{s.job.title}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Building2 className="h-3.5 w-3.5" />
                      {s.job.hotel.name}
                      <span className="mx-1">·</span>
                      <MapPin className="h-3.5 w-3.5" />
                      {s.job.hotel.city}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                    <Badge variant="secondary" size="sm">
                      {DEPARTMENT_LABELS[s.job.department as keyof typeof DEPARTMENT_LABELS] ?? s.job.department}
                    </Badge>
                    <Badge variant="outline" size="sm">
                      {JOB_TYPE_LABELS[s.job.type as keyof typeof JOB_TYPE_LABELS] ?? s.job.type.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {s.job.accommodationProvided && (
                    <Badge variant="success" size="sm"><Home className="mr-1 h-2.5 w-2.5" />Housing</Badge>
                  )}
                  {s.job.workPermitAssistance && (
                    <Badge variant="info" size="sm"><Globe className="mr-1 h-2.5 w-2.5" />Work Permit</Badge>
                  )}
                  {s.job.showSalary && s.job.salaryMin && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      ${s.job.salaryMin.toLocaleString()}{s.job.salaryMax ? `–${s.job.salaryMax.toLocaleString()}` : '+'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-3">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Saved {new Date(s.createdAt).toLocaleDateString()}
                  </span>
                  <Link href={`/${locale}/jobs/${s.job.slug}`}>
                    <Button size="sm" variant="outline">View Job</Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    loading={unsaving === s.id}
                    leftIcon={<BookmarkX className="h-3.5 w-3.5" />}
                    onClick={() => unsave(s.id, s.job.id, s.job.title)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
