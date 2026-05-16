'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Briefcase, FileText, Users, Eye, Plus, ArrowRight,
  Star, Clock, Loader2,
} from 'lucide-react'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatRelativeDate } from '@/lib/utils'
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Area, AreaChart,
} from 'recharts'

const DEPT_LABELS: Record<string, string> = {
  FRONT_OFFICE: 'Front Office', FOOD_BEVERAGE: 'F&B', HOUSEKEEPING: 'Housekeeping',
  SPA_WELLNESS: 'Spa', MANAGEMENT: 'Management', SALES_MARKETING: 'Sales',
  ENTERTAINMENT: 'Entertainment', KITCHEN: 'Kitchen', SECURITY: 'Security',
  ENGINEERING: 'Engineering', FINANCE: 'Finance', HR: 'HR',
}

const statusBadge: Record<string, { label: string; variant: 'success' | 'warning' | 'default' | 'info' }> = {
  SUBMITTED: { label: 'New', variant: 'info' },
  REVIEWING: { label: 'Reviewing', variant: 'warning' },
  SHORTLISTED: { label: 'Shortlisted', variant: 'success' },
  INTERVIEW_SCHEDULED: { label: 'Interview', variant: 'default' },
  INTERVIEW_COMPLETED: { label: 'Interviewed', variant: 'default' },
  OFFER_EXTENDED: { label: 'Offered', variant: 'success' },
  HIRED: { label: 'Hired', variant: 'success' },
  REJECTED: { label: 'Rejected', variant: 'default' },
}

interface DashboardData {
  stats: {
    activeJobs: number
    totalApplications: number
    shortlisted: number
    profileViews: number
  }
  recentApplications: Array<{
    id: string
    status: string
    createdAt: string
    candidateName: string
    candidatePhoto: string | null
    nationality: string
    jobTitle: string
    yearsOfExperience: number
    currentPosition: string | null
  }>
  activeJobs: Array<{
    id: string
    title: string
    department: string
    applications: number
    deadline: string | null
    isFeatured: boolean
  }>
  applicationTrend: Array<{ month: string; applications: number; hired: number }>
  departmentBreakdown: Array<{ dept: string; count: number; pct: number }>
}

interface Props {
  hotelName: string
  locale: string
  hotelId: string
}

export function HotelDashboardClient({ hotelName, locale, hotelId }: Props) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/hotel')
      .then((r) => r.json())
      .then((d) => { if (d.status === 'success') setData(d.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const stats = data?.stats
  const statsCards = [
    { label: 'Active Job Postings', value: stats?.activeJobs ?? 0, icon: Briefcase, color: 'primary' as const },
    { label: 'Total Applications', value: stats?.totalApplications ?? 0, icon: FileText, color: 'success' as const },
    { label: 'Shortlisted', value: stats?.shortlisted ?? 0, icon: Users, color: 'purple' as const },
    { label: 'Profile Views', value: stats?.profileViews ?? 0, icon: Eye, color: 'gold' as const },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Hotel Dashboard</h1>
          <p className="text-muted-foreground mt-1">{hotelName} · Manage your recruitment pipeline</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/${locale}/hotel/${hotelId}/candidates`}>
            <Button variant="outline" leftIcon={<Users className="w-4 h-4" />}>Browse Candidates</Button>
          </Link>
          <Link href={`/${locale}/hotel/${hotelId}/jobs`}>
            <Button variant="gradient" leftIcon={<Plus className="w-4 h-4" />}>Post a Job</Button>
          </Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statsCards.map((card, i) => (
          <StatsCard key={card.label} {...card} index={i} />
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid lg:grid-cols-3 gap-5">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Application Pipeline</CardTitle>
                    <p className="text-sm text-muted-foreground mt-0.5">Applications & hires over the last 6 months</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      <span className="text-muted-foreground">Applications</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-muted-foreground">Hired</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {data?.applicationTrend && data.applicationTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={data.applicationTrend}>
                      <defs>
                        <linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="hireGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                      <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid hsl(var(--border))',
                          backgroundColor: 'hsl(var(--popover))',
                          color: 'hsl(var(--foreground))',
                          fontSize: '12px',
                        }}
                      />
                      <Area type="monotone" dataKey="applications" name="Applications" stroke="hsl(var(--primary))" fill="url(#appGrad)" strokeWidth={2} />
                      <Area type="monotone" dataKey="hired" name="Hired" stroke="#10b981" fill="url(#hireGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
                    No application data yet
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>By Department</CardTitle>
                <p className="text-sm text-muted-foreground">Applications breakdown</p>
              </CardHeader>
              <CardContent>
                {data?.departmentBreakdown && data.departmentBreakdown.length > 0 ? (
                  <div className="space-y-3">
                    {data.departmentBreakdown.map((item) => (
                      <div key={item.dept}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-foreground/80 text-xs">{DEPT_LABELS[item.dept] ?? item.dept}</span>
                          <span className="font-medium text-xs">{item.count}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.pct}%` }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="h-full rounded-full bg-brand-gradient"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No applications yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-5 gap-5">
            <Card className="lg:col-span-3">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Applications</CardTitle>
                  <Link href={`/${locale}/hotel/${hotelId}/applications`}>
                    <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      View all
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {data?.recentApplications && data.recentApplications.length > 0 ? (
                  <div className="space-y-3">
                    {data.recentApplications.map((app) => {
                      const status = statusBadge[app.status] ?? { label: app.status, variant: 'default' as const }
                      return (
                        <div
                          key={app.id}
                          className="flex items-center gap-3.5 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
                        >
                          <div className="w-10 h-10 rounded-full bg-brand-gradient flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden">
                            {app.candidatePhoto ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={app.candidatePhoto} alt="" className="w-full h-full object-cover" />
                            ) : (
                              app.candidateName.charAt(0)
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground truncate">{app.candidateName}</span>
                              <span className="text-xs text-muted-foreground">{app.nationality}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {app.jobTitle} · {app.yearsOfExperience} yrs exp
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <Badge variant={status.variant} size="sm">{status.label}</Badge>
                            <span className="text-2xs text-muted-foreground">{formatRelativeDate(new Date(app.createdAt))}</span>
                          </div>
                          <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No applications yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Active Jobs</CardTitle>
                  <Link href={`/${locale}/hotel/${hotelId}/jobs`}>
                    <Button variant="ghost" size="sm">
                      <Plus className="w-3.5 h-3.5" />
                      New
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {data?.activeJobs && data.activeJobs.length > 0 ? (
                  <div className="space-y-3">
                    {data.activeJobs.map((job) => (
                      <div key={job.id} className="p-3 rounded-xl border border-border/50 hover:border-primary/30 transition-colors">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{job.title}</p>
                            <p className="text-xs text-muted-foreground">{DEPT_LABELS[job.department] ?? job.department}</p>
                          </div>
                          {job.isFeatured && (
                            <Star className="w-3.5 h-3.5 text-gold-500 fill-gold-400 flex-shrink-0 mt-0.5" />
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {job.applications} applicants
                          </span>
                          {job.deadline && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(job.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-3">No active jobs</p>
                    <Link href={`/${locale}/hotel/${hotelId}/jobs`}>
                      <Button variant="gradient" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                        Post Job
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
