'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import {
  ArrowLeft, Globe2, Briefcase, GraduationCap, Award,
  MapPin, Clock, FileText, ExternalLink, Loader2, AlertCircle,
  CheckCircle2, Languages,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

interface CandidateProfile {
  id: string
  firstName: string
  lastName: string
  headline: string | null
  bio: string | null
  profilePhoto: string | null
  nationality: string | null
  cityOfResidence: string | null
  countryOfResidence: string | null
  yearsOfExperience: number | null
  availabilityStatus: string
  workPermitStatus: string | null
  languages: Array<{ language: string; level: string }>
  skills: Array<{ skill: string; category?: string | null }>
  experience: Array<{
    id: string
    position: string
    department: string | null
    companyName: string
    startDate: string
    endDate: string | null
    isCurrent: boolean
    description: string | null
  }>
  education: Array<{
    id: string
    degree: string
    fieldOfStudy: string
    institution: string
    startDate: string
    endDate: string | null
    isCurrent: boolean
  }>
  certifications: Array<{
    id: string
    name: string
    issuer: string | null
    issueDate: string | null
  }>
  documents: Array<{
    id: string
    type: string
    fileUrl: string
    name: string
  }>
  user: { id: string; name: string | null; createdAt: string }
}

const AVAIL_CONFIG: Record<string, { label: string; variant: 'success' | 'info' | 'secondary' }> = {
  IMMEDIATELY_AVAILABLE: { label: 'Immediately Available', variant: 'success' },
  AVAILABLE_IN_2_WEEKS:  { label: 'Available in 2 Weeks',  variant: 'success' },
  AVAILABLE_IN_1_MONTH:  { label: 'Available in 1 Month',  variant: 'info' },
  AVAILABLE_IN_3_MONTHS: { label: 'Available in 3 Months', variant: 'info' },
  NOT_LOOKING:           { label: 'Not Looking',           variant: 'secondary' },
}

const LANG_LEVEL_LABELS: Record<string, string> = {
  NATIVE: 'Native',
  FLUENT: 'Fluent',
  ADVANCED: 'Advanced',
  INTERMEDIATE: 'Intermediate',
  BASIC: 'Basic',
}

function calcYears(start: string, end: string | null): string {
  const s = new Date(start)
  const e = end ? new Date(end) : new Date()
  const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24 * 365))
  return diff <= 1 ? '1 yr' : `${diff} yrs`
}

export default function CandidateDetailPage() {
  const locale = useLocale()
  const { hotelId, candidateId } = useParams<{ hotelId: string; candidateId: string }>()

  const [candidate, setCandidate] = useState<CandidateProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/candidates/${candidateId}`)
        const data = await res.json()
        if (res.ok) {
          setCandidate(data.data)
        } else {
          setError(data.error ?? 'Could not load profile')
        }
      } catch {
        setError('Network error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [candidateId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !candidate) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-10 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-destructive/60 mx-auto" />
        <p className="font-semibold text-foreground">Profile not available</p>
        <p className="text-sm text-muted-foreground">{error ?? 'This candidate profile could not be found.'}</p>
        <Link href={`/${locale}/hotel/${hotelId}/applications`}>
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to Applications
          </Button>
        </Link>
      </div>
    )
  }

  const availCfg = AVAIL_CONFIG[candidate.availabilityStatus] ?? { label: candidate.availabilityStatus, variant: 'secondary' as const }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back nav */}
      <Link href={`/${locale}/hotel/${hotelId}/applications`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Applications
      </Link>

      {/* Profile header */}
      <div className="rounded-2xl border border-border bg-card p-6 flex items-start gap-5">
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-ocean-600 text-white text-2xl font-bold">
          {candidate.profilePhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={candidate.profilePhoto} alt="" className="h-16 w-16 rounded-2xl object-cover" />
          ) : (
            candidate.firstName.charAt(0)
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {candidate.firstName} {candidate.lastName}
              </h1>
              {candidate.headline && (
                <p className="text-sm text-muted-foreground mt-0.5">{candidate.headline}</p>
              )}
            </div>
            <Badge variant={availCfg.variant}>{availCfg.label}</Badge>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
            {(candidate.cityOfResidence || candidate.countryOfResidence) && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {[candidate.cityOfResidence, candidate.countryOfResidence].filter(Boolean).join(', ')}
              </span>
            )}
            {candidate.nationality && (
              <span className="flex items-center gap-1.5">
                <Globe2 className="h-4 w-4" />
                {candidate.nationality}
              </span>
            )}
            {candidate.yearsOfExperience != null && (
              <span className="flex items-center gap-1.5">
                <Briefcase className="h-4 w-4" />
                {candidate.yearsOfExperience} years experience
              </span>
            )}
            {candidate.workPermitStatus && candidate.workPermitStatus !== 'NONE' && (
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Work permit: {candidate.workPermitStatus.replace(/_/g, ' ')}
              </span>
            )}
          </div>

          {candidate.bio && (
            <p className="mt-3 text-sm text-foreground/80 leading-relaxed">{candidate.bio}</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Languages */}
        {candidate.languages.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
              <Languages className="h-4 w-4 text-primary" /> Languages
            </h2>
            <div className="space-y-2">
              {candidate.languages.map((l) => (
                <div key={l.language} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{l.language}</span>
                  <span className="text-muted-foreground">{LANG_LEVEL_LABELS[l.level] ?? l.level}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {candidate.skills.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
              <Award className="h-4 w-4 text-primary" /> Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((s) => (
                <Badge key={s.skill} variant="secondary" size="sm">{s.skill}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Work Experience */}
      {candidate.experience.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
            <Briefcase className="h-4 w-4 text-primary" /> Work Experience
          </h2>
          <div className="space-y-4">
            {candidate.experience.map((exp) => (
              <div key={exp.id} className="flex gap-4">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary/60 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">{exp.position}</p>
                  <p className="text-sm text-muted-foreground">{exp.companyName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(new Date(exp.startDate))} — {exp.isCurrent ? 'Present' : formatDate(new Date(exp.endDate!))}
                    {' · '}{calcYears(exp.startDate, exp.endDate)}
                  </p>
                  {exp.description && (
                    <p className="text-xs text-foreground/70 mt-1 leading-relaxed">{exp.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {candidate.education.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
            <GraduationCap className="h-4 w-4 text-primary" /> Education
          </h2>
          <div className="space-y-3">
            {candidate.education.map((edu) => (
              <div key={edu.id} className="flex gap-4">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary/60 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">{edu.degree}</p>
                  <p className="text-sm text-muted-foreground">{edu.institution}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(new Date(edu.startDate))} — {edu.isCurrent ? 'Present' : formatDate(new Date(edu.endDate!))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {candidate.certifications.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
            <Award className="h-4 w-4 text-primary" /> Certifications
          </h2>
          <div className="space-y-2">
            {candidate.certifications.map((cert) => (
              <div key={cert.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-foreground">{cert.name}</p>
                  {cert.issuer && <p className="text-xs text-muted-foreground">{cert.issuer}</p>}
                </div>
                {cert.issueDate && (
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatDate(new Date(cert.issueDate))}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CV / Documents */}
      {candidate.documents.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
            <FileText className="h-4 w-4 text-primary" /> Documents
          </h2>
          <div className="space-y-2">
            {candidate.documents.map((doc) => (
              <a
                key={doc.id}
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                {doc.name || 'CV / Resume'}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Footer actions */}
      <div className="flex items-center gap-3 pb-6">
        <Link href={`/${locale}/hotel/${hotelId}/applications`}>
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to Applications
          </Button>
        </Link>
        <Link href={`/${locale}/messages?with=${candidate.user.id}&name=${encodeURIComponent(candidate.firstName + ' ' + candidate.lastName)}`}>
          <Button variant="gradient">
            Send Message
          </Button>
        </Link>
      </div>
    </div>
  )
}
