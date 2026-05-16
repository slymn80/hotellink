'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Building2, Users, Briefcase,
  FileText, ArrowUpRight,
  UserCheck, BarChart3, Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatsCard } from '@/components/dashboard/StatsCard'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { formatRelativeDate } from '@/lib/utils'

interface DashboardStats {
  partnerCount: number
  totalPlaced: number
  candidatePool: number
  openPositions: number
}

interface PartnerHotel {
  id: string
  name: string
  city: string
  logoUrl: string | null
  openPositions: number
  placedThisYear: number
}

interface RecentPlacement {
  id: string
  candidateName: string
  role: string
  hotel: string
  status: string
  updatedAt: string
}

interface DashboardData {
  stats: DashboardStats
  partners: PartnerHotel[]
  recentPlacements: RecentPlacement[]
}

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'info' | 'secondary'> = {
  OFFER_ACCEPTED: 'success',
  OFFER_EXTENDED: 'warning',
  INTERVIEW_SCHEDULED: 'info',
  SHORTLISTED: 'secondary',
}

const STATUS_LABELS: Record<string, string> = {
  OFFER_ACCEPTED: 'Hired',
  OFFER_EXTENDED: 'Offer Extended',
  INTERVIEW_SCHEDULED: 'Interview',
  INTERVIEW_COMPLETED: 'Interviewed',
  SHORTLISTED: 'Shortlisted',
  REVIEWING: 'Reviewing',
  SUBMITTED: 'Applied',
}

export default function AgencyDashboardPage() {
  const locale = useLocale()
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (session?.user?.role !== 'HR_AGENCY') {
      router.replace(`/${locale}/dashboard`)
      return
    }
    fetch('/api/agency/dashboard')
      .then((r) => r.json())
      .then((d) => { if (d.status === 'success') setData(d.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [session, status, locale, router])

  const statsCards = [
    {
      label: 'Active Hotel Partners',
      value: data?.stats.partnerCount ?? '—',
      icon: Building2,
      color: 'primary' as const,
    },
    {
      label: 'Placed Candidates',
      value: data?.stats.totalPlaced ?? '—',
      icon: UserCheck,
      color: 'success' as const,
    },
    {
      label: 'Candidate Pools',
      value: data?.stats.candidatePool ?? '—',
      icon: Users,
      color: 'purple' as const,
    },
    {
      label: 'Open Positions',
      value: data?.stats.openPositions ?? '—',
      icon: Briefcase,
      color: 'warning' as const,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agency Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your hotel partnerships and candidate placements
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={`/${locale}/agency/pools`}>
            <Button variant="outline" leftIcon={<Users className="h-4 w-4" />}>
              Browse Candidates
            </Button>
          </Link>
          <Link href={`/${locale}/agency/hotels`}>
            <Button variant="gradient" leftIcon={<Building2 className="h-4 w-4" />}>
              Find Hotels
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, i) => (
          <StatsCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            index={i}
          />
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Hotel Partners */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-foreground">Hotel Partners</h2>
                <Link href={`/${locale}/agency/hotels`}>
                  <Button variant="ghost" size="sm" rightIcon={<ArrowUpRight className="h-4 w-4" />}>
                    View All
                  </Button>
                </Link>
              </div>

              {data?.partners.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Building2 className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">No hotel partners yet</p>
                  <Link href={`/${locale}/agency/hotels`} className="mt-3">
                    <Button variant="outline" size="sm">Find Hotels</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {data?.partners.map((partner) => (
                    <div
                      key={partner.id}
                      className="flex items-center justify-between rounded-xl border border-border bg-background p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-ocean-600 text-white text-sm font-bold overflow-hidden">
                          {partner.logoUrl
                            ? <img src={partner.logoUrl} alt="" className="h-full w-full object-cover" />
                            : partner.name.charAt(0)
                          }
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{partner.name}</p>
                          <p className="text-xs text-muted-foreground">{partner.city}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="font-semibold text-foreground">{partner.openPositions}</p>
                          <p className="text-xs text-muted-foreground">Open</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-foreground">{partner.placedThisYear}</p>
                          <p className="text-xs text-muted-foreground">Placed YTD</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Recent placements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <h2 className="font-semibold text-foreground mb-4">Recent Activity</h2>
            {data?.recentPlacements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <UserCheck className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">No activity yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data?.recentPlacements.map((placement) => (
                  <div key={placement.id} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-ocean-500 text-white text-xs font-bold">
                      {placement.candidateName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{placement.candidateName}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {placement.role} · {placement.hotel}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={STATUS_VARIANT[placement.status] ?? 'secondary'} size="sm">
                          {STATUS_LABELS[placement.status] ?? placement.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeDate(new Date(placement.updatedAt))}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Link href={`/${locale}/agency/applications`} className="block mt-4">
              <Button variant="outline" size="sm" className="w-full">
                View All Placements
              </Button>
            </Link>
          </motion.div>
        </div>
      )}

      {/* Quick actions */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {[
            { icon: Users, label: 'Manage Candidates', description: 'Add and track your talent pool', color: 'from-brand-500 to-brand-600', href: `/${locale}/agency/pools` },
            { icon: Building2, label: 'Hotel Partnerships', description: 'Manage hotel relationships', color: 'from-ocean-500 to-ocean-600', href: `/${locale}/agency/hotels` },
            { icon: BarChart3, label: 'Analytics', description: 'Placement rates and trends', color: 'from-violet-500 to-violet-600', href: `/${locale}/agency/analytics` },
            { icon: FileText, label: 'Applications', description: 'Review candidate applications', color: 'from-amber-500 to-orange-500', href: `/${locale}/agency/applications` },
          ].map((action) => (
            <Link key={action.label} href={action.href}>
              <div className="group rounded-2xl border border-border bg-card p-5 text-left transition-all hover:shadow-card hover:-translate-y-0.5 cursor-pointer">
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${action.color} text-white shadow-sm`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <p className="font-medium text-foreground text-sm">{action.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
              </div>
            </Link>
          ))}
        </motion.div>
      )}
    </div>
  )
}
