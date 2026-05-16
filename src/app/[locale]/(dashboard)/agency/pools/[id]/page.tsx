'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import {
  Users, ArrowLeft, Search, MapPin, Globe, Briefcase,
  Loader2, Save, Pencil, Check, X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDebounce } from '@/hooks'
import { toast } from 'sonner'

const DEPARTMENTS = ['FRONT_OFFICE', 'FOOD_BEVERAGE', 'HOUSEKEEPING', 'SPA_WELLNESS', 'MANAGEMENT', 'SALES_MARKETING', 'ENTERTAINMENT']
const DEPARTMENT_LABELS: Record<string, string> = {
  FRONT_OFFICE: 'Front Office', FOOD_BEVERAGE: 'Food & Beverage', HOUSEKEEPING: 'Housekeeping',
  SPA_WELLNESS: 'Spa & Wellness', MANAGEMENT: 'Management', SALES_MARKETING: 'Sales & Marketing',
  ENTERTAINMENT: 'Entertainment',
}
const AVAILABILITY_LABELS: Record<string, { label: string; color: string }> = {
  AVAILABLE: { label: 'Available Now', color: 'text-emerald-600' },
  AVAILABLE_SOON: { label: 'Available Soon', color: 'text-amber-600' },
  OPEN_TO_OFFERS: { label: 'Open to Offers', color: 'text-blue-600' },
  NOT_AVAILABLE: { label: 'Not Available', color: 'text-muted-foreground' },
}

interface Pool {
  id: string
  name: string
  description: string | null
  isPublic: boolean
  filters: Record<string, string> | null
}

interface Candidate {
  id: string
  firstName: string
  lastName: string
  headline: string | null
  cityOfResidence: string | null
  nationality: string | null
  yearsOfExperience: number | null
  availabilityStatus: string
  profileCompleteness: number
  languages: Array<{ language: string; level: string }>
  skills: Array<{ skill: string }>
  user: { id: string }
}

export default function PoolDetailPage() {
  const locale = useLocale()
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  const [pool, setPool] = useState<Pool | null>(null)
  const [loadingPool, setLoadingPool] = useState(true)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [total, setTotal] = useState(0)
  const [loadingCandidates, setLoadingCandidates] = useState(true)

  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [savingName, setSavingName] = useState(false)

  const [query, setQuery] = useState('')
  const [department, setDepartment] = useState('')
  const [availability, setAvailability] = useState('')
  const [page, setPage] = useState(1)

  const debouncedQuery = useDebounce(query, 400)

  useEffect(() => {
    fetch(`/api/agency/pools/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.status === 'success') {
          setPool(d.data)
          setNameInput(d.data.name)
          if (d.data.filters) {
            if (d.data.filters.department) setDepartment(d.data.filters.department)
            if (d.data.filters.availability) setAvailability(d.data.filters.availability)
          }
        }
      })
      .catch(() => toast.error('Failed to load pool'))
      .finally(() => setLoadingPool(false))
  }, [id])

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoadingCandidates(true)
      try {
        const params = new URLSearchParams()
        if (debouncedQuery) params.set('q', debouncedQuery)
        if (department) params.set('department', department)
        if (availability) params.set('availability', availability)
        params.set('page', String(page))
        const res = await fetch(`/api/candidates?${params.toString()}`)
        const data = await res.json()
        if (data.status === 'success') { setCandidates(data.data.items); setTotal(data.data.total) }
      } catch { /* silent */ }
      finally { setLoadingCandidates(false) }
    }
    fetchCandidates()
  }, [debouncedQuery, department, availability, page])

  const saveFilters = async () => {
    if (!pool) return
    try {
      const filters = {
        ...(department && { department }),
        ...(availability && { availability }),
      }
      const res = await fetch(`/api/agency/pools/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters: Object.keys(filters).length ? filters : null }),
      })
      if (res.ok) toast.success('Pool filters saved')
      else toast.error('Failed to save filters')
    } catch {
      toast.error('Network error')
    }
  }

  const saveName = async () => {
    if (!nameInput.trim()) return
    setSavingName(true)
    try {
      const res = await fetch(`/api/agency/pools/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameInput }),
      })
      const data = await res.json()
      if (res.ok) { setPool((p) => p ? { ...p, name: data.data.name } : p); setEditingName(false) }
      else toast.error(data.error ?? 'Failed to save')
    } catch {
      toast.error('Network error')
    } finally {
      setSavingName(false)
    }
  }

  if (loadingPool) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  if (!pool) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground">Pool not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push(`/${locale}/agency/pools`)}>Back to Pools</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => router.push(`/${locale}/agency/pools`)}
          className="mt-1 rounded-lg p-1.5 hover:bg-muted transition-colors">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="text-2xl font-bold text-foreground bg-transparent border-b-2 border-primary focus:outline-none flex-1"
                autoFocus
              />
              <button onClick={saveName} disabled={savingName} className="rounded-lg p-1.5 hover:bg-muted text-emerald-600">
                {savingName ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              </button>
              <button onClick={() => { setEditingName(false); setNameInput(pool.name) }} className="rounded-lg p-1.5 hover:bg-muted text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{pool.name}</h1>
              <button onClick={() => setEditingName(true)} className="rounded-lg p-1 hover:bg-muted text-muted-foreground">
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-muted-foreground">{total} candidates matching filters</p>
            <Badge variant={pool.isPublic ? 'success' : 'secondary'} size="sm">{pool.isPublic ? 'Public' : 'Private'}</Badge>
          </div>
          {pool.description && <p className="text-sm text-muted-foreground mt-1">{pool.description}</p>}
        </div>
      </div>

      {/* Filters panel */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground text-sm">Pool Filters</h2>
          <Button variant="outline" size="sm" leftIcon={<Save className="h-3.5 w-3.5" />} onClick={saveFilters}>
            Save Filters
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" placeholder="Search candidates..." value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1) }}
              className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </div>
          <select value={department} onChange={(e) => { setDepartment(e.target.value); setPage(1) }}
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none">
            <option value="">All Departments</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{DEPARTMENT_LABELS[d]}</option>)}
          </select>
          <select value={availability} onChange={(e) => { setAvailability(e.target.value); setPage(1) }}
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none">
            <option value="">Any Availability</option>
            <option value="AVAILABLE">Available Now</option>
            <option value="AVAILABLE_SOON">Available Soon</option>
            <option value="OPEN_TO_OFFERS">Open to Offers</option>
          </select>
        </div>
      </motion.div>

      {/* Candidates list */}
      {loadingCandidates ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : candidates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-sm text-muted-foreground">No candidates match the current filters</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {candidates.map((candidate, i) => {
            const availConfig = AVAILABILITY_LABELS[candidate.availabilityStatus]
            return (
              <motion.div key={candidate.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="rounded-2xl border border-border bg-card p-4 hover:shadow-card transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-ocean-600 text-white font-bold">
                    {candidate.firstName.charAt(0)}{candidate.lastName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-foreground text-sm">{candidate.firstName} {candidate.lastName.charAt(0)}.</h3>
                      <span className={`text-xs font-medium flex-shrink-0 ${availConfig?.color}`}>{availConfig?.label}</span>
                    </div>
                    {candidate.headline && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{candidate.headline}</p>}
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {candidate.cityOfResidence && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{candidate.cityOfResidence}</span>}
                      {candidate.yearsOfExperience !== null && <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{candidate.yearsOfExperience}y exp</span>}
                      {candidate.nationality && <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{candidate.nationality}</span>}
                    </div>
                  </div>
                </div>
                {candidate.languages.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {candidate.languages.slice(0, 3).map((lang) => <Badge key={lang.language} variant="secondary" size="sm">{lang.language}</Badge>)}
                  </div>
                )}
                {candidate.skills.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {candidate.skills.slice(0, 3).map((skill) => <Badge key={skill.skill} variant="outline" size="sm">{skill.skill}</Badge>)}
                    {candidate.skills.length > 3 && <Badge variant="ghost" size="sm">+{candidate.skills.length - 3}</Badge>}
                  </div>
                )}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Profile strength</span><span>{candidate.profileCompleteness}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted">
                    <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-ocean-500" style={{ width: `${candidate.profileCompleteness}%` }} />
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
