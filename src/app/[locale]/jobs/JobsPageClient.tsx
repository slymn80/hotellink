'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, MapPin, Filter, SlidersHorizontal, Building2,
  Clock, DollarSign, Globe, Home, ChevronRight, ChevronLeft,
  Star, BadgeCheck, Loader2, X, BriefcaseIcon, Bookmark, BookmarkCheck,
} from 'lucide-react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useDebounce } from '@/hooks'
import { formatRelativeDate, DEPARTMENT_LABELS, JOB_TYPE_LABELS } from '@/lib/utils'
import { toast } from 'sonner'

interface Job {
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
  mealProvided: boolean
  visaSponsorship: boolean
  workPermitAssistance: boolean
  isFeatured: boolean
  publishedAt: string | null
  applicationDeadline: string | null
  openings: number
  requiredLanguages: string[]
  hotel: {
    id: string
    name: string
    slug: string
    logoUrl: string | null
    city: string
    starRating: string
    isVerified: boolean
    type: string
  }
  _count: { applications: number; savedBy: number }
}

const DEPARTMENTS = [
  'ALL', 'FRONT_OFFICE', 'FOOD_BEVERAGE', 'HOUSEKEEPING', 'SPA_WELLNESS',
  'MANAGEMENT', 'SALES_MARKETING', 'ENTERTAINMENT', 'RECREATION', 'MAINTENANCE',
]

const CITIES = ['Istanbul', 'Antalya', 'Bodrum', 'Marmaris', 'Nevşehir', 'Fethiye', 'Alanya', 'Izmir']

const STAR_MAP: Record<string, string> = {
  ONE: '★', TWO: '★★', THREE: '★★★', FOUR: '★★★★', FIVE: '★★★★★',
}

export function JobsPageClient({ embedded = false }: { embedded?: boolean }) {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [jobs, setJobs] = useState<Job[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [savingId, setSavingId] = useState<string | null>(null)

  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [city, setCity] = useState(searchParams.get('city') ?? '')
  const [department, setDepartment] = useState(searchParams.get('department') ?? '')
  const [sortBy, setSortBy] = useState(searchParams.get('sort') ?? 'newest')
  const [accommodation, setAccommodation] = useState(searchParams.get('accommodation') === 'true')
  const [workPermit, setWorkPermit] = useState(searchParams.get('workPermit') === 'true')
  const [page, setPage] = useState(Number(searchParams.get('page') ?? '1'))

  const debouncedQuery = useDebounce(query, 400)

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (debouncedQuery) params.set('q', debouncedQuery)
      if (city) params.set('city', city)
      if (department && department !== 'ALL') params.set('department', department)
      if (accommodation) params.set('accommodation', 'true')
      if (workPermit) params.set('workPermit', 'true')
      params.set('sort', sortBy)
      params.set('page', String(page))
      params.set('pageSize', '12')

      const res = await fetch(`/api/jobs?${params.toString()}`)
      const data = await res.json()

      if (data.status === 'success') {
        setJobs(data.data.items)
        setTotal(data.data.total)
        setTotalPages(data.data.totalPages)
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
    } finally {
      setLoading(false)
    }
  }, [debouncedQuery, city, department, accommodation, workPermit, sortBy, page])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const toggleSave = async (e: React.MouseEvent, jobId: string, jobTitle: string) => {
    e.preventDefault()
    e.stopPropagation()
    setSavingId(jobId)
    try {
      const res = await fetch(`/api/jobs/${jobId}/save`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setSavedIds((prev) => {
          const next = new Set(prev)
          if (data.saved) { next.add(jobId); toast.success(`"${jobTitle}" saved`) }
          else { next.delete(jobId); toast.success(`"${jobTitle}" removed from saved`) }
          return next
        })
      } else if (res.status === 401) {
        toast.error('Sign in to save jobs')
      }
    } catch {
      toast.error('Failed to save job')
    } finally {
      setSavingId(null)
    }
  }

  const clearFilters = () => {
    setQuery('')
    setCity('')
    setDepartment('')
    setAccommodation(false)
    setWorkPermit(false)
    setSortBy('newest')
    setPage(1)
  }

  const hasActiveFilters = city || (department && department !== 'ALL') || accommodation || workPermit

  const Wrapper = embedded ? 'div' : 'main'

  return (
    <Wrapper className={embedded ? undefined : 'min-h-screen bg-background'}>
      {/* Hero search bar */}
      <section className={`border-b border-border bg-gradient-to-b from-brand-50 to-background dark:from-brand-950/20 dark:to-background pb-8 ${embedded ? 'pt-4' : 'pt-24'}`}>
        <div className={embedded ? 'px-4' : 'container mx-auto px-4'}>
          {!embedded && (
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground">
                Find Your Dream Hospitality Job
              </h1>
              <p className="mt-2 text-muted-foreground">
                {total > 0 ? `${total} positions available` : 'Browse positions'} at top hotels & resorts in Türkiye
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Job title, hotel name, or keyword..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1) }}
                className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button
              variant={showFilters ? 'gradient' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<SlidersHorizontal className="h-4 w-4" />}
            >
              Filters
              {hasActiveFilters && (
                <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  {[city, department && department !== 'ALL', accommodation, workPermit].filter(Boolean).length}
                </span>
              )}
            </Button>
          </div>

          {/* Filters panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 rounded-xl border border-border bg-card p-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {/* City */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      City
                    </label>
                    <select
                      value={city}
                      onChange={(e) => { setCity(e.target.value); setPage(1) }}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="">All cities</option>
                      {CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Department */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Department
                    </label>
                    <select
                      value={department}
                      onChange={(e) => { setDepartment(e.target.value); setPage(1) }}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="">All departments</option>
                      {DEPARTMENTS.filter(d => d !== 'ALL').map((d) => (
                        <option key={d} value={d}>{DEPARTMENT_LABELS[d as keyof typeof DEPARTMENT_LABELS] ?? d}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Sort by
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => { setSortBy(e.target.value); setPage(1) }}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="newest">Newest first</option>
                      <option value="featured">Featured first</option>
                      <option value="salary_desc">Highest salary</option>
                      <option value="salary_asc">Lowest salary</option>
                    </select>
                  </div>

                  {/* Benefits toggles */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Benefits
                    </label>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          checked={accommodation}
                          onChange={(e) => { setAccommodation(e.target.checked); setPage(1) }}
                          className="rounded border-border accent-primary"
                        />
                        <Home className="h-3.5 w-3.5 text-muted-foreground" />
                        Accommodation included
                      </label>
                      <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          checked={workPermit}
                          onChange={(e) => { setWorkPermit(e.target.checked); setPage(1) }}
                          className="rounded border-border accent-primary"
                        />
                        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                        Work permit assistance
                      </label>
                    </div>
                  </div>
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-3 w-3" /> Clear all filters
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Jobs list */}
      <section className={embedded ? 'px-4 py-6' : 'container mx-auto px-4 py-8'}>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="py-20 text-center">
            <BriefcaseIcon className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold text-foreground">No jobs found</h3>
            <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search filters</p>
            <Button onClick={clearFilters} variant="outline" className="mt-4">
              Clear filters
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 lg:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {jobs.map((job, i) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link href={`/${locale}/jobs/${job.slug}`}>
                      <article className={`group relative rounded-2xl border bg-card p-5 transition-all duration-200 hover:shadow-card hover:-translate-y-0.5 ${
                        job.isFeatured ? 'border-brand-200 dark:border-brand-800' : 'border-border'
                      }`}>
                        <div className="absolute right-4 top-4 flex items-center gap-1.5">
                          {job.isFeatured && <Badge variant="featured" size="sm">Featured</Badge>}
                          <button
                            onClick={(e) => toggleSave(e, job.id, job.title)}
                            disabled={savingId === job.id}
                            className={`p-1 rounded-lg transition-colors ${
                              savedIds.has(job.id) ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                            }`}
                            title={savedIds.has(job.id) ? 'Remove from saved' : 'Save job'}
                          >
                            {savedIds.has(job.id)
                              ? <BookmarkCheck className="h-4 w-4" />
                              : <Bookmark className="h-4 w-4" />
                            }
                          </button>
                        </div>

                        <div className="flex items-start gap-4">
                          {/* Hotel logo */}
                          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-ocean-600 text-white text-sm font-bold shadow-sm">
                            {job.hotel.logoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={job.hotel.logoUrl} alt={job.hotel.name} className="h-full w-full rounded-xl object-cover" />
                            ) : (
                              job.hotel.name.charAt(0)
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-medium text-muted-foreground truncate">
                                {job.hotel.name}
                              </span>
                              {job.hotel.isVerified && (
                                <BadgeCheck className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                              )}
                              <span className="text-xs text-amber-500">
                                {STAR_MAP[job.hotel.starRating] ?? ''}
                              </span>
                            </div>

                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                              {job.title}
                            </h3>

                            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {job.hotel.city}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {JOB_TYPE_LABELS[job.type as keyof typeof JOB_TYPE_LABELS] ?? job.type}
                              </span>
                              {job.showSalary && job.salaryMin && (
                                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                  <DollarSign className="h-3 w-3" />
                                  {job.salaryMin.toLocaleString()}
                                  {job.salaryMax ? `–${job.salaryMax.toLocaleString()}` : '+'}
                                  /{job.salaryCurrency}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-1.5">
                          <Badge variant="secondary" size="sm">
                            {DEPARTMENT_LABELS[job.department as keyof typeof DEPARTMENT_LABELS] ?? job.department}
                          </Badge>
                          {job.accommodationProvided && (
                            <Badge variant="success" size="sm">
                              <Home className="mr-1 h-2.5 w-2.5" />
                              Housing
                            </Badge>
                          )}
                          {job.workPermitAssistance && (
                            <Badge variant="info" size="sm">
                              <Globe className="mr-1 h-2.5 w-2.5" />
                              Work Permit
                            </Badge>
                          )}
                          {job.visaSponsorship && (
                            <Badge variant="gold" size="sm">Visa Sponsor</Badge>
                          )}
                        </div>

                        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                          <span>{job._count.applications} applicants</span>
                          {job.publishedAt && (
                            <span>{formatRelativeDate(new Date(job.publishedAt))}</span>
                          )}
                        </div>
                      </article>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  leftIcon={<ChevronLeft className="h-4 w-4" />}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = page <= 3 ? i + 1 : page + i - 2
                    if (pageNum < 1 || pageNum > totalPages) return null
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                          pageNum === page
                            ? 'bg-primary text-white'
                            : 'text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  rightIcon={<ChevronRight className="h-4 w-4" />}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </Wrapper>
  )
}
