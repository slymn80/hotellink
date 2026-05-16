'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import {
  Sparkles, Building2, MapPin, Briefcase, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, Lightbulb, Loader2, ArrowRight,
  Home, Zap, AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { MatchResult, MatchRecommendation } from '@/lib/ai-matching'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ScoredJobResult {
  jobId: string
  score: number
  recommendation: MatchRecommendation
  summary: string
  job: {
    id: string
    title: string
    slug: string
    department: string
    type: string
    accommodationProvided: boolean
    visaSponsorship: boolean
    salaryMin: number | null
    salaryMax: number | null
    salaryCurrency: string
    hotel: { name: string; city: string }
  }
  detail?: MatchResult
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const REC_CONFIG: Record<MatchRecommendation, { color: string; bg: string; ring: string; label: string }> = {
  'Strong Match':  { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30', ring: 'stroke-emerald-500', label: 'Strong Match' },
  'Good Match':    { color: 'text-blue-600 dark:text-blue-400',       bg: 'bg-blue-50 dark:bg-blue-950/30',       ring: 'stroke-blue-500',   label: 'Good Match' },
  'Partial Match': { color: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-50 dark:bg-amber-950/30',     ring: 'stroke-amber-500',  label: 'Partial Match' },
  'Weak Match':    { color: 'text-red-500 dark:text-red-400',         bg: 'bg-red-50 dark:bg-red-950/30',         ring: 'stroke-red-500',    label: 'Weak Match' },
}

function ScoreRing({ score, recommendation, size = 'md' }: { score: number; recommendation: MatchRecommendation; size?: 'sm' | 'md' }) {
  const cfg = REC_CONFIG[recommendation]
  const dim = size === 'sm' ? 64 : 88
  const r = size === 'sm' ? 24 : 34
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - score / 100)

  return (
    <div className={cn('relative flex-shrink-0', size === 'sm' ? 'w-16 h-16' : 'w-22 h-22')} style={{ width: dim, height: dim }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${dim} ${dim}`}>
        <circle cx={dim / 2} cy={dim / 2} r={r} fill="none" strokeWidth={size === 'sm' ? 5 : 6} className="stroke-muted" />
        <circle
          cx={dim / 2} cy={dim / 2} r={r} fill="none" strokeWidth={size === 'sm' ? 5 : 6}
          className={cfg.ring} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('font-bold leading-none', cfg.color, size === 'sm' ? 'text-lg' : 'text-2xl')}>{score}</span>
        <span className="text-xs text-muted-foreground leading-none mt-0.5">/100</span>
      </div>
    </div>
  )
}

// ── Loading animation ─────────────────────────────────────────────────────────

const STEPS = [
  'Reading your profile…',
  'Analyzing active job postings…',
  'Comparing experience & skills…',
  'Evaluating language requirements…',
  'Calculating match scores…',
  'Ranking results…',
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
        <p className="font-semibold text-foreground">AI is analyzing your matches</p>
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

// ── Job card ──────────────────────────────────────────────────────────────────

function JobMatchCard({ item, onFetchDetail }: { item: ScoredJobResult; onFetchDetail: (jobId: string) => Promise<void> }) {
  const locale = useLocale()
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const cfg = REC_CONFIG[item.recommendation]

  const handleExpand = async () => {
    if (!expanded && !item.detail) {
      setLoading(true)
      await onFetchDetail(item.jobId)
      setLoading(false)
    }
    setExpanded((p) => !p)
  }

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
              <h3 className="font-semibold text-foreground truncate">{item.job.title}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                {item.job.hotel.name}
                <span className="mx-1 text-border">·</span>
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                {item.job.hotel.city}
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-2">{item.summary}</p>

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Badge variant="secondary" size="sm">{item.job.department.replace(/_/g, ' ')}</Badge>
            <Badge variant="outline" size="sm">{item.job.type.replace(/_/g, ' ')}</Badge>
            {item.job.accommodationProvided && <Badge variant="success" size="sm"><Home className="w-2.5 h-2.5 mr-1" />Housing</Badge>}
            {item.job.visaSponsorship && <Badge variant="info" size="sm"><Zap className="w-2.5 h-2.5 mr-1" />Visa</Badge>}
          </div>
        </div>

        <button
          onClick={handleExpand}
          className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors mt-1"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {expanded ? 'Hide' : 'Details'}
        </button>
      </div>

      {/* Detail panel */}
      {expanded && item.detail && (
        <div className="border-t border-border px-5 pb-5 pt-4 space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Strengths
              </p>
              {item.detail.strengths.map((s, i) => (
                <p key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 mt-1" />{s}
                </p>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-red-400" /> Gaps
              </p>
              {item.detail.gaps.length > 0 ? item.detail.gaps.map((g, i) => (
                <p key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0 mt-1" />{g}
                </p>
              )) : <p className="text-xs text-muted-foreground">No significant gaps.</p>}
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Tips
              </p>
              {item.detail.tips.map((t, i) => (
                <p key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 mt-1" />{t}
                </p>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1 border-t border-border/50">
            <Link href={`/${locale}/jobs/${item.job.slug}`}>
              <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                View Job
              </Button>
            </Link>
            {item.score >= 60 && (
              <Link href={`/${locale}/jobs/${item.job.slug}`}>
                <Button size="sm" variant="gradient" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Apply Now
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AiMatchPage() {
  const locale = useLocale()
  const [status, setStatus] = useState<'loading' | 'done' | 'no_profile' | 'no_jobs' | 'error'>('loading')
  const [jobs, setJobs] = useState<ScoredJobResult[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function run() {
      try {
        const res = await fetch('/api/ai/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'score_jobs_for_candidate' }),
        })
        const data = await res.json()
        if (!res.ok) {
          if (res.status === 400 && data.error?.includes('profile')) {
            setStatus('no_profile')
          } else {
            setError(data.error ?? 'Something went wrong')
            setStatus('error')
          }
          return
        }
        if (data.data.length === 0) {
          setStatus('no_jobs')
          return
        }
        setJobs(data.data)
        setStatus('done')
      } catch {
        setError('Network error')
        setStatus('error')
      }
    }
    run()
  }, [])

  const fetchDetail = async (jobId: string) => {
    try {
      const res = await fetch('/api/ai/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'candidate_to_job', jobId }),
      })
      const data = await res.json()
      if (res.ok) {
        setJobs((prev) => prev.map((j) => j.jobId === jobId ? { ...j, detail: data.data } : j))
      }
    } catch { /* silent */ }
  }

  const strongCount = jobs.filter((j) => j.score >= 80).length
  const goodCount = jobs.filter((j) => j.score >= 60 && j.score < 80).length

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            AI Job Matching
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Automatically ranked against your profile using GPT-4o mini
          </p>
        </div>
        <Link href={`/${locale}/candidate/profile`}>
          <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            Update Profile
          </Button>
        </Link>
      </div>

      {status === 'loading' && <LoadingState />}

      {status === 'error' && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-destructive/60 mx-auto" />
          <p className="font-semibold text-foreground">Could not run AI matching</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      )}

      {status === 'no_profile' && (
        <div className="rounded-2xl border border-border bg-card p-10 text-center space-y-4">
          <Sparkles className="w-12 h-12 text-muted-foreground/30 mx-auto" />
          <div>
            <p className="font-semibold text-foreground">Complete your profile first</p>
            <p className="text-sm text-muted-foreground mt-1">AI matching needs your work history, languages, and skills.</p>
          </div>
          <Link href={`/${locale}/candidate/profile`}>
            <Button variant="gradient" leftIcon={<ArrowRight className="w-4 h-4" />}>
              Set Up Profile
            </Button>
          </Link>
        </div>
      )}

      {status === 'no_jobs' && (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center space-y-3">
          <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto" />
          <p className="font-semibold text-foreground">No active jobs found</p>
          <p className="text-sm text-muted-foreground">Check back soon for new openings.</p>
        </div>
      )}

      {status === 'done' && (
        <>
          {/* Summary strip */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10 flex-wrap">
            <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-sm text-muted-foreground flex-1">
              Analyzed <strong className="text-foreground">{jobs.length} jobs</strong> against your profile —
              {strongCount > 0 && <> <span className="text-emerald-600 font-semibold">{strongCount} strong</span></>}
              {goodCount > 0 && <> <span className="text-blue-600 font-semibold">{strongCount > 0 ? ', ' : ' '}{goodCount} good</span></>} match{strongCount + goodCount !== 1 ? 'es' : ''}.
            </span>
            <span className="text-xs text-muted-foreground">Click "Details" for strengths, gaps & tips</span>
          </div>

          {/* Ranked job list */}
          <div className="space-y-4">
            {jobs.map((item) => (
              <JobMatchCard key={item.jobId} item={item} onFetchDetail={fetchDetail} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
