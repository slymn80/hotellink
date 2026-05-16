'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import {
  Sparkles, Users, MapPin, Briefcase, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, Lightbulb, ArrowRight,
  AlertCircle, ChevronRight, Globe2, Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { MatchRecommendation } from '@/lib/ai-matching'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ActiveJob {
  id: string
  title: string
  department: string
  type: string
  openings: number
  applicationCount: number
}

interface RankedCandidate {
  candidateId: string
  score: number
  recommendation: MatchRecommendation
  summary: string
  strengths: string[]
  gaps: string[]
  tips: string[]
  candidate: {
    id: string
    firstName: string
    lastName: string
    headline: string | null
    nationality: string | null
    yearsOfExperience: number | null
    profilePhoto: string | null
    availabilityStatus: string
  } | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const REC_CONFIG: Record<MatchRecommendation, { color: string; bg: string; ring: string; label: string }> = {
  'Strong Match':  { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30', ring: 'stroke-emerald-500', label: 'Strong Match' },
  'Good Match':    { color: 'text-blue-600 dark:text-blue-400',       bg: 'bg-blue-50 dark:bg-blue-950/30',       ring: 'stroke-blue-500',   label: 'Good Match' },
  'Partial Match': { color: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-50 dark:bg-amber-950/30',     ring: 'stroke-amber-500',  label: 'Partial Match' },
  'Weak Match':    { color: 'text-red-500 dark:text-red-400',         bg: 'bg-red-50 dark:bg-red-950/30',         ring: 'stroke-red-500',    label: 'Weak Match' },
}

const AVAIL_CONFIG: Record<string, { label: string; color: string }> = {
  IMMEDIATELY_AVAILABLE: { label: 'Immediately Available', color: 'text-emerald-600' },
  AVAILABLE_IN_2_WEEKS:  { label: 'Available in 2 Weeks',  color: 'text-emerald-500' },
  AVAILABLE_IN_1_MONTH:  { label: 'Available in 1 Month',  color: 'text-blue-600' },
  AVAILABLE_IN_3_MONTHS: { label: 'Available in 3 Months', color: 'text-amber-600' },
  NOT_LOOKING:           { label: 'Not Looking',           color: 'text-muted-foreground' },
}

function ScoreRing({ score, recommendation }: { score: number; recommendation: MatchRecommendation }) {
  const cfg = REC_CONFIG[recommendation]
  const r = 34
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - score / 100)

  return (
    <div className="relative flex-shrink-0 w-22 h-22" style={{ width: 88, height: 88 }}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} fill="none" strokeWidth={6} className="stroke-muted" />
        <circle
          cx="44" cy="44" r={r} fill="none" strokeWidth={6}
          className={cfg.ring} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('font-bold text-2xl leading-none', cfg.color)}>{score}</span>
        <span className="text-xs text-muted-foreground leading-none mt-0.5">/100</span>
      </div>
    </div>
  )
}

// ── Loading animation ─────────────────────────────────────────────────────────

const STEPS = [
  'Loading available candidates…',
  'Analyzing job requirements…',
  'Comparing candidate profiles…',
  'Evaluating experience & skills…',
  'Calculating match scores…',
  'Ranking candidates…',
]

function LoadingState() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 1800)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center py-24 space-y-6">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
        <div className="relative w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center">
          <Sparkles className="w-9 h-9 text-primary" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <p className="font-semibold text-foreground">AI is ranking candidates</p>
        <p className="text-sm text-muted-foreground transition-all duration-500">{STEPS[step]}</p>
      </div>
      <div className="flex gap-1.5">
        {STEPS.map((_, i) => (
          <div key={i} className={cn('h-1.5 rounded-full transition-all duration-500', i <= step ? 'w-6 bg-primary' : 'w-1.5 bg-muted')} />
        ))}
      </div>
    </div>
  )
}

// ── Candidate card ────────────────────────────────────────────────────────────

function CandidateMatchCard({ item, hotelId, locale }: { item: RankedCandidate; hotelId: string; locale: string }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = REC_CONFIG[item.recommendation]
  const c = item.candidate
  const availCfg = c ? (AVAIL_CONFIG[c.availabilityStatus] ?? { label: c.availabilityStatus, color: 'text-muted-foreground' }) : null

  return (
    <div className={cn(
      'rounded-2xl border bg-card transition-all duration-200',
      item.score >= 80 ? 'border-emerald-200/60 dark:border-emerald-800/40' :
      item.score >= 60 ? 'border-blue-200/60 dark:border-blue-800/40' :
      'border-border'
    )}>
      <div className="p-5 flex items-start gap-4">
        <ScoreRing score={item.score} recommendation={item.recommendation} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="min-w-0">
              <span className={cn('inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-1.5', cfg.bg, cfg.color)}>
                {cfg.label}
              </span>
              {c ? (
                <>
                  <h3 className="font-semibold text-foreground">
                    {c.firstName} {c.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{c.headline ?? 'Hospitality Professional'}</p>
                </>
              ) : (
                <h3 className="font-semibold text-foreground text-muted-foreground">Candidate</h3>
              )}
            </div>
          </div>

          {c && (
            <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-muted-foreground">
              {c.nationality && (
                <span className="flex items-center gap-1">
                  <Globe2 className="w-3 h-3" />{c.nationality}
                </span>
              )}
              {c.yearsOfExperience != null && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />{c.yearsOfExperience} yrs exp.
                </span>
              )}
              {availCfg && (
                <span className={cn('font-medium', availCfg.color)}>{availCfg.label}</span>
              )}
            </div>
          )}

          <p className="text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-2">{item.summary}</p>
        </div>

        <button
          onClick={() => setExpanded((p) => !p)}
          className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors mt-1"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {expanded ? 'Hide' : 'Details'}
        </button>
      </div>

      {/* Detail panel */}
      {expanded && (
        <div className="border-t border-border px-5 pb-5 pt-4 space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Strengths
              </p>
              {item.strengths.map((s, i) => (
                <p key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 mt-1" />{s}
                </p>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-red-400" /> Gaps
              </p>
              {item.gaps.length > 0 ? item.gaps.map((g, i) => (
                <p key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0 mt-1" />{g}
                </p>
              )) : <p className="text-xs text-muted-foreground">No significant gaps.</p>}
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Notes
              </p>
              {item.tips.map((t, i) => (
                <p key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 mt-1" />{t}
                </p>
              ))}
            </div>
          </div>

          {c && (
            <div className="flex items-center gap-3 pt-1 border-t border-border/50">
              <Link href={`/${locale}/hotel/${hotelId}/candidates/${c.id}`}>
                <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  View Profile
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function HotelAiMatchPage() {
  const locale = useLocale()
  const params = useParams<{ hotelId: string }>()
  const hotelId = params.hotelId

  const [jobs, setJobs] = useState<ActiveJob[]>([])
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [jobsLoading, setJobsLoading] = useState(true)

  const [matchStatus, setMatchStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [candidates, setCandidates] = useState<RankedCandidate[]>([])
  const [matchError, setMatchError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  // Fetch hotel's active jobs
  useEffect(() => {
    async function loadJobs() {
      try {
        const res = await fetch(`/api/jobs?role=employer&hotelId=${hotelId}&status=ACTIVE`)
        const data = await res.json()
        if (res.ok && data.status === 'success') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const items: ActiveJob[] = (data.data?.items ?? []).map((j: any) => ({
            id: j.id,
            title: j.title,
            department: j.department,
            type: j.type,
            openings: j.openings ?? 1,
            applicationCount: j.applicationCount ?? j._count?.applications ?? 0,
          }))
          setJobs(items)
          if (items.length > 0) setSelectedJobId(items[0].id)
        }
      } catch { /* silent */ } finally {
        setJobsLoading(false)
      }
    }
    loadJobs()
  }, [hotelId])

  const runMatch = useCallback(async (jobId: string) => {
    setMatchStatus('loading')
    setCandidates([])
    setMatchError(null)
    try {
      const res = await fetch('/api/ai/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'job_to_candidates', jobId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMatchError(data.error ?? 'AI matching failed')
        setMatchStatus('error')
        return
      }
      setCandidates(data.data?.ranked ?? [])
      setTotal(data.data?.total ?? 0)
      setMatchStatus('done')
    } catch {
      setMatchError('Network error')
      setMatchStatus('error')
    }
  }, [])

  // Auto-run when a job is selected
  useEffect(() => {
    if (selectedJobId) runMatch(selectedJobId)
  }, [selectedJobId, runMatch])

  const selectedJob = jobs.find((j) => j.id === selectedJobId)
  const strongCount = candidates.filter((c) => c.score >= 80).length
  const goodCount = candidates.filter((c) => c.score >= 60 && c.score < 80).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            AI Candidate Matching
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Automatically ranked candidates for your job postings using GPT-4o mini
          </p>
        </div>
        <Link href={`/${locale}/hotel/${hotelId}/jobs`}>
          <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            Manage Jobs
          </Button>
        </Link>
      </div>

      {/* Job selector */}
      {jobsLoading ? (
        <div className="h-14 rounded-xl bg-muted animate-pulse" />
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center space-y-4">
          <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto" />
          <div>
            <p className="font-semibold text-foreground">No active job postings</p>
            <p className="text-sm text-muted-foreground mt-1">Publish a job to start matching candidates with AI.</p>
          </div>
          <Link href={`/${locale}/hotel/${hotelId}/jobs`}>
            <Button variant="gradient" leftIcon={<Briefcase className="w-4 h-4" />}>
              Post a Job
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Job Posting</p>
          <div className="flex gap-2 flex-wrap">
            {jobs.map((job) => (
              <button
                key={job.id}
                onClick={() => setSelectedJobId(job.id)}
                className={cn(
                  'flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-150',
                  selectedJobId === job.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/5'
                )}
              >
                <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate max-w-[180px]">{job.title}</span>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {job.department.replace(/_/g, ' ')}
                </span>
                {selectedJobId === job.id && <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />}
              </button>
            ))}
          </div>

          {selectedJob && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground px-1">
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{selectedJob.applicationCount} applications</span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{selectedJob.openings} opening{selectedJob.openings !== 1 ? 's' : ''}</span>
              <Badge variant="secondary" size="sm">{selectedJob.type.replace(/_/g, ' ')}</Badge>
            </div>
          )}
        </div>
      )}

      {/* Match results */}
      {matchStatus === 'loading' && <LoadingState />}

      {matchStatus === 'error' && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-destructive/60 mx-auto" />
          <p className="font-semibold text-foreground">Could not run AI matching</p>
          <p className="text-sm text-muted-foreground">{matchError}</p>
          {selectedJobId && (
            <Button variant="outline" size="sm" onClick={() => runMatch(selectedJobId)}>
              Try Again
            </Button>
          )}
        </div>
      )}

      {matchStatus === 'done' && candidates.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center space-y-3">
          <Users className="w-12 h-12 text-muted-foreground/30 mx-auto" />
          <p className="font-semibold text-foreground">No available candidates found</p>
          <p className="text-sm text-muted-foreground">No candidates are currently marked as actively looking or open to offers.</p>
        </div>
      )}

      {matchStatus === 'done' && candidates.length > 0 && (
        <>
          {/* Summary strip */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10 flex-wrap">
            <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-sm text-muted-foreground flex-1">
              Ranked <strong className="text-foreground">{total} candidates</strong> for <strong className="text-foreground">{selectedJob?.title}</strong> —
              {strongCount > 0 && <> <span className="text-emerald-600 font-semibold">{strongCount} strong</span></>}
              {goodCount > 0 && <> <span className="text-blue-600 font-semibold">{strongCount > 0 ? ', ' : ' '}{goodCount} good</span></>} match{strongCount + goodCount !== 1 ? 'es' : ''}.
            </span>
            <span className="text-xs text-muted-foreground">Click "Details" for strengths, gaps & notes</span>
          </div>

          {/* Ranked candidate list */}
          <div className="space-y-4">
            {candidates.map((item) => (
              <CandidateMatchCard
                key={item.candidateId}
                item={item}
                hotelId={hotelId}
                locale={locale}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
