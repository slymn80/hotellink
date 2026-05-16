'use client'

import { motion } from 'framer-motion'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import {
  FileText,
  Bookmark,
  Eye,
  Bell,
  ArrowRight,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Upload,
  User,
  Briefcase,
  Globe2,
  Sparkles,
} from 'lucide-react'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn, formatRelativeDate, calculateProfileScore } from '@/lib/utils'
import type { Session } from 'next-auth'

interface CandidateDashboardClientProps {
  candidate: {
    id: string
    firstName: string
    lastName: string
    profilePhoto?: string | null
    nationality: string
    profileScore: number
    availabilityStatus: string
    workPermitStatus: string
    bio?: string | null
    applications: {
      id: string
      status: string
      createdAt: Date
      job: {
        title: string
        department: string
        hotel: { name: string; logoUrl?: string | null; city: string }
      }
    }[]
    documents: { id: string; type: string; status: string; name: string }[]
    languages: { language: string; level: string }[]
    skills: { skill: string }[]
    _count: { experience: number; applications: number; savedJobs: number; documents: number }
  } | null
  session: Session
  stats: {
    applications: number
    savedJobs: number
    profileViews: number
    unreadNotifications: number
  }
}

const applicationStatusConfig: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  SUBMITTED: { label: 'Applied', icon: Clock, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30' },
  REVIEWING: { label: 'Under Review', icon: AlertCircle, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30' },
  SHORTLISTED: { label: 'Shortlisted', icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' },
  INTERVIEW_SCHEDULED: { label: 'Interview', icon: Briefcase, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30' },
  OFFER_EXTENDED: { label: 'Offer!', icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' },
  REJECTED: { label: 'Rejected', icon: XCircle, color: 'text-red-500 bg-red-50 dark:bg-red-950/30' },
  WITHDRAWN: { label: 'Withdrawn', icon: XCircle, color: 'text-muted-foreground bg-muted/50' },
}

const profileItems = [
  { label: 'Add profile photo', key: 'profilePhoto', icon: User, points: 10 },
  { label: 'Write your bio', key: 'bio', icon: FileText, points: 10 },
  { label: 'Add languages', key: 'languages', icon: Globe2, points: 10 },
  { label: 'Add work experience', key: 'experience', icon: Briefcase, points: 20 },
  { label: 'Upload your CV', key: 'cv', icon: Upload, points: 15 },
]

export function CandidateDashboardClient({
  candidate,
  session,
  stats,
}: CandidateDashboardClientProps) {
  const locale = useLocale()
  const firstName = session.user.name?.split(' ')[0] ?? 'there'

  const profileScore = candidate
    ? calculateProfileScore({
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        bio: candidate.bio,
        profilePhoto: candidate.profilePhoto,
        nationality: candidate.nationality,
        languages: candidate.languages,
        experience: [],
        education: [],
      })
    : 0

  const statsCards = [
    {
      label: 'Total Applications',
      value: stats.applications,
      icon: FileText,
      color: 'primary' as const,
      href: `/${locale}/candidate/applications`,
    },
    {
      label: 'Saved Jobs',
      value: stats.savedJobs,
      icon: Bookmark,
      color: 'gold' as const,
      href: `/${locale}/candidate/saved`,
    },
    {
      label: 'Profile Views',
      value: stats.profileViews,
      icon: Eye,
      color: 'success' as const,
    },
    {
      label: 'Notifications',
      value: stats.unreadNotifications,
      icon: Bell,
      color: 'warning' as const,
      href: `/${locale}/candidate/notifications`,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4 flex-wrap"
      >
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Welcome, {firstName}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            {candidate
              ? 'Here\'s what\'s happening with your job search today.'
              : 'Complete your profile to start applying for hospitality jobs in Türkiye.'}
          </p>
        </div>
        <Link href={`/${locale}/candidate/jobs`}>
          <Button variant="gradient" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Browse Jobs
          </Button>
        </Link>
      </motion.div>

      {/* AI Match banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 via-primary to-ocean-500 p-5 text-white pointer-events-auto"
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 0%, transparent 60%)' }}
        />
        <div className="relative flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-base">AI Job Matching</p>
              <p className="text-sm text-white/80">See how well you match open hotel positions</p>
            </div>
          </div>
          <Link href={`/${locale}/candidate/ai-match`}>
            <Button
              size="sm"
              className="bg-white text-primary hover:bg-white/90 font-semibold flex-shrink-0"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Analyze My Match
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statsCards.map((card, i) => (
          <StatsCard key={card.label} {...card} index={i} />
        ))}
      </div>

      {/* Profile completion & work permit */}
      {!candidate || profileScore < 80 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="gradient" className="overflow-hidden relative">
            <div className="absolute inset-0 bg-brand-gradient opacity-5 pointer-events-none" aria-hidden="true" />
            <CardHeader>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <CardTitle>Complete Your Profile</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Hotels are {100 - profileScore}% more likely to contact candidates with complete profiles.
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {/* Circular progress */}
                  <div className="relative w-16 h-16">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
                      <circle cx="28" cy="28" r="24" fill="none" strokeWidth="4" className="stroke-muted" />
                      <circle
                        cx="28"
                        cy="28"
                        r="24"
                        fill="none"
                        strokeWidth="4"
                        className="stroke-primary"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 24}`}
                        strokeDashoffset={`${2 * Math.PI * 24 * (1 - profileScore / 100)}`}
                        style={{ transition: 'stroke-dashoffset 1s ease' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{profileScore}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {profileItems.map((item) => {
                  const Icon = item.icon
                  const hasCv = candidate?.documents.some((d) => d.type === 'CV_RESUME')
                  const completed =
                    item.key === 'profilePhoto' ? !!candidate?.profilePhoto :
                    item.key === 'bio' ? !!candidate?.bio :
                    item.key === 'languages' ? (candidate?.languages?.length ?? 0) > 0 :
                    item.key === 'experience' ? (candidate?._count?.experience ?? 0) > 0 :
                    item.key === 'cv' ? !!hasCv :
                    false
                  return (
                    <div
                      key={item.key}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-xl border transition-colors',
                        completed
                          ? 'border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20'
                          : 'border-border/50 bg-background/50 hover:border-primary/30'
                      )}
                    >
                      <div
                        className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                          completed ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-muted'
                        )}
                      >
                        {completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Icon className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-xs font-medium truncate', completed ? 'text-emerald-600 dark:text-emerald-400 line-through' : 'text-foreground')}>
                          {item.label}
                        </p>
                        <p className="text-2xs text-muted-foreground">+{item.points} points</p>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4">
                <Link href={`/${locale}/candidate/profile`}>
                  <Button size="sm" variant="gradient">
                    Complete Profile
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : null}

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Recent Applications */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Applications</CardTitle>
                <Link href={`/${locale}/candidate/applications`}>
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    View all
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {candidate?.applications && candidate.applications.length > 0 ? (
                <div className="space-y-3">
                  {candidate.applications.map((app) => {
                    const statusConfig = applicationStatusConfig[app.status] ?? applicationStatusConfig.SUBMITTED
                    const StatusIcon = statusConfig.icon

                    return (
                      <div
                        key={app.id}
                        className="flex items-center gap-4 p-3.5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        {/* Hotel logo placeholder */}
                        <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {app.job.hotel.name.charAt(0)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{app.job.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {app.job.hotel.name} · {app.job.hotel.city}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <div className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', statusConfig.color)}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.label}
                          </div>
                          <span className="text-2xs text-muted-foreground">
                            {formatRelativeDate(app.createdAt)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Briefcase className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No applications yet</p>
                  <Link href={`/${locale}/candidate/jobs`} className="mt-3 inline-block">
                    <Button variant="gradient" size="sm">
                      Browse Jobs
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Documents & Work Permit */}
        <div className="space-y-4">
          {/* Documents status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {candidate?.documents && candidate.documents.length > 0 ? (
                <div className="space-y-2">
                  {candidate.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-2.5">
                      <div className={cn(
                        'w-2 h-2 rounded-full flex-shrink-0',
                        doc.status === 'VERIFIED' ? 'bg-emerald-500' :
                        doc.status === 'PENDING' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'
                      )} />
                      <span className="text-xs text-foreground truncate flex-1">{doc.name}</span>
                      <Badge
                        variant={doc.status === 'VERIFIED' ? 'success' : doc.status === 'PENDING' ? 'warning' : 'destructive'}
                        size="sm"
                      >
                        {doc.status.toLowerCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
              )}
              <Link href={`/${locale}/candidate/documents`} className="block mt-3">
                <Button variant="outline" size="sm" className="w-full">
                  <Upload className="w-3.5 h-3.5" />
                  Manage Documents
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Work permit status */}
          <Card className="bg-gradient-to-br from-brand-50 to-ocean-50 dark:from-brand-950/20 dark:to-ocean-950/20 border-brand-100 dark:border-brand-900">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe2 className="w-4.5 h-4.5 text-primary" />
                <CardTitle className="text-base">Work Permit</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={candidate?.workPermitStatus === 'APPROVED' ? 'success' : 'warning'}>
                    {candidate?.workPermitStatus?.replace('_', ' ') ?? 'Not Started'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {candidate?.workPermitStatus === 'NOT_STARTED'
                    ? 'Start your work permit application process today.'
                    : 'Your work permit application is in progress.'}
                </p>
              </div>
              <Link href={`/${locale}/candidate/work-permit`} className="block mt-3">
                <Button variant="default" size="sm" className="w-full">
                  <ArrowRight className="w-3.5 h-3.5" />
                  Work Permit Guide
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
