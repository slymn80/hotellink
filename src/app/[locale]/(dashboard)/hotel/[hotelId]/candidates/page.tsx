'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Search, Users, MapPin, Globe, Briefcase,
  MessageSquare, Eye, Loader2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDebounce } from '@/hooks'

const DEPARTMENTS = ['FRONT_OFFICE', 'FOOD_BEVERAGE', 'HOUSEKEEPING', 'SPA_WELLNESS', 'MANAGEMENT', 'SALES_MARKETING', 'ENTERTAINMENT']
const DEPARTMENT_LABELS: Record<string, string> = {
  FRONT_OFFICE: 'Front Office', FOOD_BEVERAGE: 'Food & Beverage', HOUSEKEEPING: 'Housekeeping',
  SPA_WELLNESS: 'Spa & Wellness', MANAGEMENT: 'Management', SALES_MARKETING: 'Sales & Marketing', ENTERTAINMENT: 'Entertainment',
}
const AVAILABILITY_LABELS: Record<string, { label: string; color: string }> = {
  AVAILABLE: { label: 'Available Now', color: 'text-emerald-600' },
  AVAILABLE_SOON: { label: 'Available Soon', color: 'text-amber-600' },
  OPEN_TO_OFFERS: { label: 'Open to Offers', color: 'text-blue-600' },
  NOT_AVAILABLE: { label: 'Not Available', color: 'text-muted-foreground' },
}

interface Candidate {
  id: string
  firstName: string
  lastName: string
  headline: string | null
  cityOfResidence: string | null
  countryOfResidence: string | null
  nationality: string | null
  yearsOfExperience: number | null
  availabilityStatus: string
  profileCompleteness: number
  languages: Array<{ language: string; level: string }>
  skills: Array<{ skill: string }>
  user: { id: string; name: string | null; image: string | null }
}

export default function HotelCandidatesPage() {
  const locale = useLocale()
  const { hotelId } = useParams<{ hotelId: string }>()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [department, setDepartment] = useState('')
  const [availability, setAvailability] = useState('')
  const [language, setLanguage] = useState('')
  const [page, setPage] = useState(1)

  const debouncedQuery = useDebounce(query, 400)

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (debouncedQuery) params.set('q', debouncedQuery)
        if (department) params.set('department', department)
        if (availability) params.set('availability', availability)
        if (language) params.set('language', language)
        params.set('page', String(page))
        const res = await fetch(`/api/candidates?${params.toString()}`)
        const data = await res.json()
        if (data.status === 'success') { setCandidates(data.data.items); setTotal(data.data.total) }
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    fetchCandidates()
  }, [debouncedQuery, department, availability, language, page, hotelId])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Candidate Search</h1>
        <p className="text-sm text-muted-foreground mt-1">{total} hospitality professionals available</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search by name, skills, or experience..." value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1) }}
            className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <select value={department} onChange={(e) => { setDepartment(e.target.value); setPage(1) }}
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none">
            <option value="">All Departments</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{DEPARTMENT_LABELS[d]}</option>)}
          </select>
          <select value={availability} onChange={(e) => { setAvailability(e.target.value); setPage(1) }}
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none">
            <option value="">Any Availability</option>
            <option value="AVAILABLE">Available Now</option>
            <option value="AVAILABLE_SOON">Available Soon</option>
            <option value="OPEN_TO_OFFERS">Open to Offers</option>
          </select>
          <input type="text" placeholder="Language (e.g. English)" value={language}
            onChange={(e) => { setLanguage(e.target.value); setPage(1) }}
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : candidates.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold text-foreground">No candidates found</h3>
          <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {candidates.map((candidate, i) => {
            const availConfig = AVAILABILITY_LABELS[candidate.availabilityStatus]
            return (
              <motion.div key={candidate.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-border bg-card p-5 hover:shadow-card transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-ocean-600 text-white text-lg font-bold">
                    {candidate.firstName.charAt(0)}{candidate.lastName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{candidate.firstName} {candidate.lastName.charAt(0)}.</h3>
                    {candidate.headline && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{candidate.headline}</p>}
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      {candidate.cityOfResidence && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{candidate.cityOfResidence}</span>}
                      {candidate.yearsOfExperience !== null && <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{candidate.yearsOfExperience}y exp</span>}
                      {candidate.nationality && <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{candidate.nationality}</span>}
                    </div>
                  </div>
                  <span className={`text-xs font-medium flex-shrink-0 ${availConfig?.color}`}>{availConfig?.label}</span>
                </div>
                {candidate.languages.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {candidate.languages.slice(0, 4).map((lang) => <Badge key={lang.language} variant="secondary" size="sm">{lang.language}</Badge>)}
                  </div>
                )}
                {candidate.skills.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {candidate.skills.slice(0, 3).map((skill) => <Badge key={skill.skill} variant="outline" size="sm">{skill.skill}</Badge>)}
                    {candidate.skills.length > 3 && <Badge variant="ghost" size="sm">+{candidate.skills.length - 3} more</Badge>}
                  </div>
                )}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Profile strength</span><span>{candidate.profileCompleteness}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted">
                    <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-ocean-500" style={{ width: `${candidate.profileCompleteness}%` }} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/${locale}/hotel/${hotelId}/applications?candidateId=${candidate.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full" leftIcon={<Eye className="h-4 w-4" />}>View Applications</Button>
                  </Link>
                  <Link href={`/${locale}/messages?with=${candidate.user.id}&name=${encodeURIComponent(candidate.firstName + ' ' + candidate.lastName)}`} className="flex-1">
                    <Button variant="gradient" size="sm" className="w-full" leftIcon={<MessageSquare className="h-4 w-4" />}>Message</Button>
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
