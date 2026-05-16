'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Briefcase, Plus, Users, Eye, Edit, Trash2, CheckCircle,
  PauseCircle, AlertCircle, Loader2, X, ChevronDown,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatRelativeDate, DEPARTMENT_LABELS, JOB_TYPE_LABELS } from '@/lib/utils'
import { toast } from 'sonner'

interface Job {
  id: string
  title: string
  slug: string
  department: string
  type: string
  status: string
  city: string
  isFeatured: boolean
  applicationCount: number
  viewCount: number
  createdAt: string
  publishedAt: string | null
  applicationDeadline: string | null
  openings: number
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'success' | 'info' | 'warning' | 'secondary' | 'destructive'; icon: React.ReactNode }> = {
  ACTIVE: { label: 'Active', variant: 'success', icon: <CheckCircle className="h-3 w-3" /> },
  DRAFT: { label: 'Draft', variant: 'secondary', icon: <Edit className="h-3 w-3" /> },
  PAUSED: { label: 'Paused', variant: 'warning', icon: <PauseCircle className="h-3 w-3" /> },
  CLOSED: { label: 'Closed', variant: 'destructive', icon: <AlertCircle className="h-3 w-3" /> },
  FILLED: { label: 'Filled', variant: 'info', icon: <CheckCircle className="h-3 w-3" /> },
}

const EMPTY_FORM = {
  title: '',
  department: '',
  type: 'FULL_TIME',
  description: '',
  requirements: '',
  responsibilities: '',
  benefits: '',
  experienceMin: 0,
  experienceMax: '',
  salaryMin: '',
  salaryMax: '',
  salaryCurrency: 'USD',
  salaryPeriod: 'MONTHLY',
  showSalary: true,
  openings: 1,
  city: '',
  applicationDeadline: '',
  requiredLanguages: [] as string[],
  accommodationProvided: false,
  mealProvided: false,
  transportProvided: false,
  visaSponsorship: false,
  workPermitAssistance: false,
  status: 'DRAFT',
}

const CURRENCIES = ['USD', 'EUR', 'TRY', 'GBP']
const SALARY_PERIODS = [{ value: 'MONTHLY', label: 'Per Month' }, { value: 'ANNUAL', label: 'Per Year' }, { value: 'DAILY', label: 'Per Day' }, { value: 'HOURLY', label: 'Per Hour' }]
const COMMON_LANGUAGES = ['English', 'Turkish', 'German', 'Russian', 'Arabic', 'French', 'Spanish', 'Italian', 'Dutch', 'Chinese']

function JobForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [langInput, setLangInput] = useState('')

  const set = (field: string, value: unknown) => setForm(f => ({ ...f, [field]: value }))

  const toggleLanguage = (lang: string) => {
    set('requiredLanguages', form.requiredLanguages.includes(lang)
      ? form.requiredLanguages.filter(l => l !== lang)
      : [...form.requiredLanguages, lang])
  }

  const handleSubmit = async (publishNow: boolean) => {
    if (!form.title.trim()) { toast.error('Job title is required'); return }
    if (!form.department) { toast.error('Please select a department'); return }
    if (!form.description.trim()) { toast.error('Job description is required'); return }

    setSaving(true)
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          status: publishNow ? 'ACTIVE' : 'DRAFT',
          experienceMax: form.experienceMax ? Number(form.experienceMax) : undefined,
          salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
          salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
          applicationDeadline: form.applicationDeadline || undefined,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(publishNow ? 'Job posted and published!' : 'Job saved as draft')
        onSaved()
        onClose()
      } else {
        toast.error(data.error ?? 'Failed to create job')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative ml-auto w-full max-w-2xl bg-background shadow-2xl flex flex-col h-full overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-foreground">Post New Job</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Fill in the details to attract the right candidates</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted transition-colors text-muted-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Basic Info */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide text-muted-foreground">Basic Information</h3>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Job Title <span className="text-destructive">*</span></label>
              <input
                type="text" value={form.title} onChange={e => set('title', e.target.value)}
                placeholder="e.g. Front Desk Receptionist"
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Department <span className="text-destructive">*</span></label>
                <div className="relative">
                  <select
                    value={form.department} onChange={e => set('department', e.target.value)}
                    className="w-full appearance-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none pr-8"
                  >
                    <option value="">Select department</option>
                    {Object.entries(DEPARTMENT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Employment Type</label>
                <div className="relative">
                  <select
                    value={form.type} onChange={e => set('type', e.target.value)}
                    className="w-full appearance-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none pr-8"
                  >
                    {Object.entries(JOB_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">City</label>
                <input
                  type="text" value={form.city} onChange={e => set('city', e.target.value)}
                  placeholder="e.g. Istanbul"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Number of Openings</label>
                <input
                  type="number" min={1} max={99} value={form.openings} onChange={e => set('openings', Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Job Details</h3>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Description <span className="text-destructive">*</span></label>
              <textarea
                rows={4} value={form.description} onChange={e => set('description', e.target.value)}
                placeholder="Describe the role, team, and what makes this opportunity exciting..."
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Requirements</label>
              <textarea
                rows={3} value={form.requirements} onChange={e => set('requirements', e.target.value)}
                placeholder="Qualifications, education, certifications..."
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Responsibilities</label>
              <textarea
                rows={3} value={form.responsibilities} onChange={e => set('responsibilities', e.target.value)}
                placeholder="Day-to-day duties and key responsibilities..."
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Benefits</label>
              <textarea
                rows={2} value={form.benefits} onChange={e => set('benefits', e.target.value)}
                placeholder="Health insurance, bonus, professional development..."
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none resize-none"
              />
            </div>
          </section>

          {/* Experience */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Experience</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Min. Years</label>
                <input
                  type="number" min={0} max={30} value={form.experienceMin} onChange={e => set('experienceMin', Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Max. Years (optional)</label>
                <input
                  type="number" min={0} max={30} value={form.experienceMax} onChange={e => set('experienceMax', e.target.value)}
                  placeholder="No limit"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </section>

          {/* Salary */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Salary</h3>
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                <input type="checkbox" checked={form.showSalary} onChange={e => set('showSalary', e.target.checked)} className="rounded" />
                Show salary to candidates
              </label>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Currency</label>
                <div className="relative">
                  <select value={form.salaryCurrency} onChange={e => set('salaryCurrency', e.target.value)}
                    className="w-full appearance-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none pr-7">
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Min Salary</label>
                <input type="number" min={0} value={form.salaryMin} onChange={e => set('salaryMin', e.target.value)}
                  placeholder="0" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Max Salary</label>
                <input type="number" min={0} value={form.salaryMax} onChange={e => set('salaryMax', e.target.value)}
                  placeholder="0" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Pay Period</label>
              <div className="flex gap-2 flex-wrap">
                {SALARY_PERIODS.map(p => (
                  <button key={p.value} type="button" onClick={() => set('salaryPeriod', p.value)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${form.salaryPeriod === p.value ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Languages */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Required Languages</h3>
            <div className="flex flex-wrap gap-2">
              {COMMON_LANGUAGES.map(lang => (
                <button key={lang} type="button" onClick={() => toggleLanguage(lang)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${form.requiredLanguages.includes(lang) ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                  {lang}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={langInput} onChange={e => setLangInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && langInput.trim()) { toggleLanguage(langInput.trim()); setLangInput('') } }}
                placeholder="Other language..."
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              <Button type="button" variant="outline" size="sm" onClick={() => { if (langInput.trim()) { toggleLanguage(langInput.trim()); setLangInput('') } }}>Add</Button>
            </div>
          </section>

          {/* Perks */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Perks & Support</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'accommodationProvided', label: 'Accommodation Provided' },
                { key: 'mealProvided', label: 'Meals Provided' },
                { key: 'transportProvided', label: 'Transport Provided' },
                { key: 'visaSponsorship', label: 'Visa Sponsorship' },
                { key: 'workPermitAssistance', label: 'Work Permit Assistance' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 text-sm text-foreground cursor-pointer rounded-xl border border-border p-3 hover:bg-muted/50 transition-colors">
                  <input type="checkbox" checked={form[key as keyof typeof form] as boolean}
                    onChange={e => set(key, e.target.checked)} className="rounded" />
                  {label}
                </label>
              ))}
            </div>
          </section>

          {/* Deadline */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Application Deadline</h3>
            <input
              type="date" value={form.applicationDeadline} onChange={e => set('applicationDeadline', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border bg-background flex-shrink-0">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <div className="flex gap-2">
            <Button variant="outline" loading={saving} onClick={() => handleSubmit(false)}>
              Save as Draft
            </Button>
            <Button variant="gradient" loading={saving} onClick={() => handleSubmit(true)}
              leftIcon={<CheckCircle className="h-4 w-4" />}>
              Publish Now
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function HotelJobsPage() {
  const locale = useLocale()
  const { hotelId } = useParams<{ hotelId: string }>()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      params.set('role', 'employer')
      params.set('hotelId', hotelId)
      const res = await fetch(`/api/jobs?${params.toString()}`)
      const data = await res.json()
      if (data.status === 'success') setJobs(data.data.items)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, hotelId])

  const handleDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to close this job posting?')) return
    setDeleting(jobId)
    try {
      const res = await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Job closed successfully'); fetchJobs() }
      else toast.error('Failed to close job')
    } catch { toast.error('Network error') }
    finally { setDeleting(null) }
  }

  const handleStatusToggle = async (job: Job) => {
    const newStatus = job.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) { toast.success(`Job ${newStatus === 'ACTIVE' ? 'activated' : 'paused'}`); fetchJobs() }
    } catch { toast.error('Failed to update job') }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Job Postings</h1>
          <p className="text-sm text-muted-foreground mt-1">{jobs.length} positions</p>
        </div>
        <Button variant="gradient" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(true)}>
          Post New Job
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {['', 'ACTIVE', 'DRAFT', 'PAUSED', 'CLOSED', 'FILLED'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${statusFilter === s ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            {s ? STATUS_CONFIG[s]?.label ?? s : 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold text-foreground">No job postings yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Post your first job to start receiving applications from qualified candidates</p>
          <Button variant="gradient" className="mt-4" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(true)}>
            Post Your First Job
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {jobs.map((job, i) => {
              const config = STATUS_CONFIG[job.status]
              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-2xl border border-border bg-card p-5 hover:shadow-card transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">{job.title}</h3>
                        {job.isFeatured && <Badge variant="featured" size="sm">Featured</Badge>}
                        <Badge variant={config?.variant ?? 'secondary'} size="sm" dot>{config?.label ?? job.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {DEPARTMENT_LABELS[job.department as keyof typeof DEPARTMENT_LABELS] ?? job.department}
                        {' · '}{job.city}{' · '}{job.openings} opening{job.openings !== 1 ? 's' : ''}
                      </p>
                      <div className="mt-3 flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">{job.applicationCount}</span>
                          <span className="text-muted-foreground">applicants</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">{job.viewCount.toLocaleString()}</span>
                          <span className="text-muted-foreground">views</span>
                        </div>
                        {job.publishedAt && (
                          <span className="text-xs text-muted-foreground">Posted {formatRelativeDate(new Date(job.publishedAt))}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {(job.status === 'ACTIVE' || job.status === 'PAUSED') && (
                        <Button variant="outline" size="sm" onClick={() => handleStatusToggle(job)}>
                          {job.status === 'ACTIVE' ? <><PauseCircle className="h-4 w-4" /> Pause</> : <><CheckCircle className="h-4 w-4" /> Activate</>}
                        </Button>
                      )}
                      <Link href={`/${locale}/hotel/${hotelId}/applications?jobId=${job.id}`}>
                        <Button variant="outline" size="sm" leftIcon={<Users className="h-4 w-4" />}>Applicants</Button>
                      </Link>
                      <Button variant="ghost" size="sm" loading={deleting === job.id} onClick={() => handleDelete(job.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {showForm && <JobForm onClose={() => setShowForm(false)} onSaved={fetchJobs} />}
      </AnimatePresence>
    </div>
  )
}
