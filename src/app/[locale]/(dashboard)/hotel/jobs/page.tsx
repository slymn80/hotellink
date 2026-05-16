'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Briefcase, Plus, Users, Eye, Trash2, CheckCircle,
  PauseCircle, AlertCircle, Edit, Loader2, X, Save,
  Home, UtensilsCrossed, Car, Globe, ShieldCheck, ChevronDown,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatRelativeDate, DEPARTMENT_LABELS } from '@/lib/utils'
import { toast } from 'sonner'

const DEPARTMENTS = [
  'FRONT_OFFICE', 'FOOD_BEVERAGE', 'HOUSEKEEPING', 'SPA_WELLNESS',
  'MANAGEMENT', 'SALES_MARKETING', 'ENTERTAINMENT', 'SECURITY',
  'MAINTENANCE', 'FINANCE', 'HR', 'IT', 'OTHER',
]
const JOB_TYPES = ['FULL_TIME', 'PART_TIME', 'SEASONAL', 'CONTRACT', 'INTERNSHIP']
const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: 'Full Time', PART_TIME: 'Part Time', SEASONAL: 'Seasonal',
  CONTRACT: 'Contract', INTERNSHIP: 'Internship',
}
const CURRENCIES = ['USD', 'EUR', 'TRY', 'GBP', 'AED', 'RUB']

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

interface JobForm {
  title: string
  department: string
  type: string
  status: string
  openings: number
  applicationDeadline: string
  description: string
  requirements: string
  responsibilities: string
  benefits: string
  experienceMin: number
  experienceMax: number
  salaryMin: string
  salaryMax: string
  salaryCurrency: string
  showSalary: boolean
  requiredLanguages: string
  accommodationProvided: boolean
  mealProvided: boolean
  transportProvided: boolean
  visaSponsorship: boolean
  workPermitAssistance: boolean
}

const EMPTY_FORM: JobForm = {
  title: '', department: 'FRONT_OFFICE', type: 'FULL_TIME', status: 'DRAFT',
  openings: 1, applicationDeadline: '', description: '', requirements: '',
  responsibilities: '', benefits: '', experienceMin: 0, experienceMax: 0,
  salaryMin: '', salaryMax: '', salaryCurrency: 'USD', showSalary: true,
  requiredLanguages: '', accommodationProvided: false, mealProvided: false,
  transportProvided: false, visaSponsorship: false, workPermitAssistance: false,
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'success' | 'info' | 'warning' | 'secondary' | 'destructive' }> = {
  ACTIVE: { label: 'Active', variant: 'success' },
  DRAFT: { label: 'Draft', variant: 'secondary' },
  PAUSED: { label: 'Paused', variant: 'warning' },
  CLOSED: { label: 'Closed', variant: 'destructive' },
  FILLED: { label: 'Filled', variant: 'info' },
}

export default function HotelJobsPage() {
  const locale = useLocale()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [form, setForm] = useState<JobForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      params.set('role', 'employer')
      const res = await fetch(`/api/jobs?${params.toString()}`)
      const data = await res.json()
      if (data.status === 'success') setJobs(data.data.items)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchJobs() }, [statusFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  const openCreate = () => {
    setEditingJob(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  const openEdit = (job: Job) => {
    setEditingJob(job)
    setForm({
      ...EMPTY_FORM,
      title: job.title,
      department: job.department,
      type: job.type,
      status: job.status,
      openings: job.openings,
      applicationDeadline: job.applicationDeadline ? job.applicationDeadline.slice(0, 10) : '',
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Job title is required'); return }
    setSaving(true)
    try {
      const payload = {
        ...form,
        openings: Number(form.openings),
        experienceMin: Number(form.experienceMin),
        experienceMax: form.experienceMax ? Number(form.experienceMax) : undefined,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
        requiredLanguages: form.requiredLanguages
          ? form.requiredLanguages.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        applicationDeadline: form.applicationDeadline || undefined,
      }

      const res = editingJob
        ? await fetch(`/api/jobs/${editingJob.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch('/api/jobs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })

      const data = await res.json()
      if (res.ok) {
        toast.success(editingJob ? 'Job updated' : 'Job created successfully')
        setShowForm(false)
        fetchJobs()
      } else {
        toast.error(data.error ?? 'Failed to save job')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (jobId: string) => {
    if (!confirm('Close this job posting?')) return
    setDeleting(jobId)
    try {
      const res = await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Job closed'); fetchJobs() }
      else toast.error('Failed to close job')
    } catch {
      toast.error('Network error')
    } finally {
      setDeleting(null) }
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

  const f = (field: keyof JobForm, value: string | number | boolean) =>
    setForm(p => ({ ...p, [field]: value }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Job Postings</h1>
          <p className="text-sm text-muted-foreground mt-1">{jobs.length} positions</p>
        </div>
        <Button variant="gradient" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Post New Job
        </Button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['', 'ACTIVE', 'DRAFT', 'PAUSED', 'CLOSED', 'FILLED'].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === s ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}>
            {s ? STATUS_CONFIG[s]?.label ?? s : 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold text-foreground">No job postings yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Post your first job to start receiving applications</p>
          <Button variant="gradient" className="mt-4" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Post Your First Job
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {jobs.map((job, i) => {
              const config = STATUS_CONFIG[job.status]
              return (
                <motion.div key={job.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.04 }}
                  className="rounded-2xl border border-border bg-card p-5 hover:shadow-card transition-shadow">
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
                        <span className="flex items-center gap-1.5 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">{job.applicationCount}</span>
                          <span className="text-muted-foreground">applicants</span>
                        </span>
                        <span className="flex items-center gap-1.5 text-sm">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">{job.viewCount.toLocaleString()}</span>
                          <span className="text-muted-foreground">views</span>
                        </span>
                        {job.publishedAt && (
                          <span className="text-xs text-muted-foreground">
                            Posted {formatRelativeDate(new Date(job.publishedAt))}
                          </span>
                        )}
                        {job.applicationDeadline && (
                          <span className="text-xs text-amber-600">
                            Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {(job.status === 'ACTIVE' || job.status === 'PAUSED') && (
                        <Button variant="outline" size="sm" onClick={() => handleStatusToggle(job)}>
                          {job.status === 'ACTIVE'
                            ? <><PauseCircle className="h-4 w-4 mr-1" />Pause</>
                            : <><CheckCircle className="h-4 w-4 mr-1" />Activate</>}
                        </Button>
                      )}
                      <Button variant="outline" size="sm" leftIcon={<Edit className="h-4 w-4" />} onClick={() => openEdit(job)}>
                        Edit
                      </Button>
                      <Link href={`/${locale}/hotel/applications?jobId=${job.id}`}>
                        <Button variant="outline" size="sm" leftIcon={<Users className="h-4 w-4" />}>
                          Applicants
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" loading={deleting === job.id}
                        onClick={() => handleDelete(job.id)} className="text-muted-foreground hover:text-destructive">
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

      {/* Slide-over form */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowForm(false)} />

            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed right-0 top-0 z-50 h-full w-full max-w-xl bg-card shadow-2xl flex flex-col">

              {/* Header */}
              <div className="flex items-center justify-between border-b border-border px-6 py-4 flex-shrink-0">
                <h2 className="text-lg font-semibold text-foreground">
                  {editingJob ? 'Edit Job Posting' : 'New Job Posting'}
                </h2>
                <button onClick={() => setShowForm(false)} className="rounded-lg p-1.5 hover:bg-muted transition-colors">
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

                {/* Basic info */}
                <section className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Basic Info</h3>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">Job Title *</label>
                    <input value={form.title} onChange={e => f('title', e.target.value)}
                      placeholder="e.g. Head Receptionist"
                      className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">Department</label>
                      <select value={form.department} onChange={e => f('department', e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none">
                        {DEPARTMENTS.map(d => <option key={d} value={d}>{DEPARTMENT_LABELS[d as keyof typeof DEPARTMENT_LABELS] ?? d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">Job Type</label>
                      <select value={form.type} onChange={e => f('type', e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none">
                        {JOB_TYPES.map(t => <option key={t} value={t}>{JOB_TYPE_LABELS[t]}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">Openings</label>
                      <input type="number" min={1} max={99} value={form.openings} onChange={e => f('openings', e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">Application Deadline</label>
                      <input type="date" value={form.applicationDeadline} onChange={e => f('applicationDeadline', e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">Required Languages</label>
                    <input value={form.requiredLanguages} onChange={e => f('requiredLanguages', e.target.value)}
                      placeholder="English, Russian, Turkish (comma separated)"
                      className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">Min. Experience (years)</label>
                      <input type="number" min={0} value={form.experienceMin} onChange={e => f('experienceMin', e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">Max. Experience (years)</label>
                      <input type="number" min={0} value={form.experienceMax} onChange={e => f('experienceMax', e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
                    </div>
                  </div>
                </section>

                {/* Description */}
                <section className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Description</h3>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">Job Description</label>
                    <textarea value={form.description} rows={4} onChange={e => f('description', e.target.value)}
                      placeholder="Describe the role, the team and the work environment..."
                      className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none resize-none" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">Requirements</label>
                    <textarea value={form.requirements} rows={3} onChange={e => f('requirements', e.target.value)}
                      placeholder="Experience, certifications, skills required..."
                      className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none resize-none" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">Responsibilities</label>
                    <textarea value={form.responsibilities} rows={3} onChange={e => f('responsibilities', e.target.value)}
                      placeholder="Key duties and day-to-day tasks..."
                      className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none resize-none" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">Additional Benefits</label>
                    <textarea value={form.benefits} rows={2} onChange={e => f('benefits', e.target.value)}
                      placeholder="Bonus, tips, career development..."
                      className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none resize-none" />
                  </div>
                </section>

                {/* Salary */}
                <section className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Salary</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">Min</label>
                      <input type="number" min={0} value={form.salaryMin} onChange={e => f('salaryMin', e.target.value)}
                        placeholder="e.g. 1500"
                        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">Max</label>
                      <input type="number" min={0} value={form.salaryMax} onChange={e => f('salaryMax', e.target.value)}
                        placeholder="e.g. 2500"
                        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">Currency</label>
                      <select value={form.salaryCurrency} onChange={e => f('salaryCurrency', e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none">
                        {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                    <input type="checkbox" checked={form.showSalary} onChange={e => f('showSalary', e.target.checked)} />
                    Show salary to candidates
                  </label>
                </section>

                {/* Benefits */}
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Provided Benefits</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'accommodationProvided', icon: Home, label: 'Accommodation' },
                      { key: 'mealProvided', icon: UtensilsCrossed, label: 'Meals' },
                      { key: 'transportProvided', icon: Car, label: 'Transport' },
                      { key: 'visaSponsorship', icon: Globe, label: 'Visa Sponsorship' },
                      { key: 'workPermitAssistance', icon: ShieldCheck, label: 'Work Permit Help' },
                    ].map(({ key, icon: Icon, label }) => (
                      <label key={key} className={`flex items-center gap-2 rounded-xl border p-3 cursor-pointer transition-colors ${
                        form[key as keyof JobForm]
                          ? 'border-primary/50 bg-primary/5 text-primary'
                          : 'border-border text-muted-foreground hover:border-border/80'
                      }`}>
                        <input type="checkbox" className="sr-only"
                          checked={!!form[key as keyof JobForm]}
                          onChange={e => f(key as keyof JobForm, e.target.checked)} />
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm font-medium">{label}</span>
                      </label>
                    ))}
                  </div>
                </section>

                {/* Publish status */}
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Publish</h3>
                  <div className="flex gap-2">
                    {['DRAFT', 'ACTIVE'].map(s => (
                      <button key={s} type="button" onClick={() => f('status', s)}
                        className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                          form.status === s
                            ? s === 'ACTIVE' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                              : 'border-primary bg-primary/5 text-primary'
                            : 'border-border text-muted-foreground hover:bg-muted/50'
                        }`}>
                        {s === 'ACTIVE' ? '✓ Publish Now' : '◎ Save as Draft'}
                      </button>
                    ))}
                  </div>
                </section>
              </div>

              {/* Footer */}
              <div className="border-t border-border px-6 py-4 flex gap-3 flex-shrink-0">
                <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button variant="gradient" className="flex-1" loading={saving}
                  leftIcon={<Save className="h-4 w-4" />} onClick={handleSave}>
                  {editingJob ? 'Save Changes' : form.status === 'ACTIVE' ? 'Publish Job' : 'Save Draft'}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
