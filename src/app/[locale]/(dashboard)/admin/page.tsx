'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import {
  Users, Building2, Briefcase, FileText, DollarSign,
  ShieldCheck, AlertTriangle, CheckCircle2, Globe2,
  ArrowRight, Activity, Loader2,
} from 'lucide-react'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn, formatRelativeDate } from '@/lib/utils'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'

interface AdminStats {
  users: { total: number; newThisMonth: number; growthRate: number; roleChartData: Array<{ name: string; value: number; count: number; color: string }> }
  hotels: { total: number; verified: number; pendingVerification: number }
  jobs: { total: number; active: number }
  applications: { total: number; thisMonth: number }
  revenue: { thisMonth: number; lastMonth: number; growthRate: number; currency: string }
  verifications: { pending: number }
  growth: Array<{ month: string; users: number; applications: number }>
}

interface PendingVerification {
  id: string
  type: string
  status: string
  submittedAt: string
  documents: string[]
  hotel: { name: string; city: string; email: string | null } | null
}

export default function AdminDashboardPage() {
  const locale = useLocale()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [verifications, setVerifications] = useState<PendingVerification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/stats').then((r) => r.json()),
      fetch('/api/admin/verifications?status=PENDING&pageSize=3').then((r) => r.json()),
    ])
      .then(([statsRes, verifRes]) => {
        if (statsRes.status === 'success') setStats(statsRes.data)
        if (verifRes.status === 'success') setVerifications(verifRes.data.items)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const pendingCount = stats?.verifications.pending ?? 0

  const statsCards = [
    {
      label: 'Total Users',
      value: stats?.users.total ?? '—',
      icon: Users,
      color: 'primary' as const,
      change: stats?.users.growthRate,
      changeLabel: 'vs last month',
    },
    {
      label: 'Verified Hotels',
      value: stats?.hotels.verified ?? '—',
      icon: Building2,
      color: 'success' as const,
    },
    {
      label: 'Active Jobs',
      value: stats?.jobs.active ?? '—',
      icon: Briefcase,
      color: 'purple' as const,
    },
    {
      label: 'Monthly Revenue',
      value: stats ? `$${stats.revenue.thisMonth.toLocaleString()}` : '—',
      icon: DollarSign,
      color: 'gold' as const,
      change: stats?.revenue.growthRate,
      changeLabel: 'vs last month',
    },
    {
      label: 'Applications',
      value: stats?.applications.thisMonth ?? '—',
      icon: FileText,
      color: 'warning' as const,
      changeLabel: 'this month',
    },
    {
      label: 'Pending Verifications',
      value: pendingCount,
      icon: ShieldCheck,
      color: 'danger' as const,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            Platform overview
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" leftIcon={<Globe2 className="w-4 h-4" />} asChild>
            <Link href={`/${locale}/admin/analytics`}>Analytics</Link>
          </Button>
          <Link href={`/${locale}/admin/verifications`}>
            <Button variant="gradient" leftIcon={<ShieldCheck className="w-4 h-4" />}>
              Review Queue {pendingCount > 0 && `(${pendingCount})`}
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
          {/* Charts */}
          <div className="grid lg:grid-cols-3 gap-5">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Platform Growth</CardTitle>
                    <p className="text-sm text-muted-foreground">New users & applications over 6 months</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      <span className="text-muted-foreground">Users</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-muted-foreground">Applications</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {stats?.growth && stats.growth.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={stats.growth}>
                      <defs>
                        <linearGradient id="candGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
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
                      <Area type="monotone" dataKey="users" name="Users" stroke="hsl(var(--primary))" fill="url(#candGrad)" strokeWidth={2.5} />
                      <Area type="monotone" dataKey="applications" name="Applications" stroke="#10b981" fill="url(#appGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">No data yet</div>
                )}
              </CardContent>
            </Card>

            {/* Role breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>User Roles</CardTitle>
                <p className="text-sm text-muted-foreground">Distribution by role</p>
              </CardHeader>
              <CardContent>
                {stats?.users.roleChartData && stats.users.roleChartData.length > 0 ? (
                  <>
                    <div className="flex justify-center mb-3">
                      <PieChart width={160} height={130}>
                        <Pie
                          data={stats.users.roleChartData}
                          cx={80} cy={65}
                          innerRadius={38} outerRadius={55}
                          dataKey="value"
                          strokeWidth={2}
                          stroke="hsl(var(--card))"
                        >
                          {stats.users.roleChartData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </div>
                    <div className="space-y-2">
                      {stats.users.roleChartData.map((item) => (
                        <div key={item.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-xs text-muted-foreground">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-muted-foreground">{item.count}</span>
                            <span className="text-xs font-semibold text-foreground">{item.value}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-[160px] text-sm text-muted-foreground">No users yet</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Pending verifications & summary */}
          <div className="grid lg:grid-cols-2 gap-5">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Pending Verifications</CardTitle>
                    <p className="text-sm text-muted-foreground">Requires your review</p>
                  </div>
                  <Link href={`/${locale}/admin/verifications`}>
                    <Button variant="outline" size="sm">
                      View all {pendingCount > 0 && `(${pendingCount})`}
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {verifications.length > 0 ? (
                  <div className="space-y-3">
                    {verifications.map((v) => (
                      <div key={v.id} className="flex items-center gap-3.5 p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {v.hotel?.name ?? `${v.type} Verification`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {v.hotel?.city ?? v.type} · {formatRelativeDate(new Date(v.submittedAt))}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {v.documents.length > 0 && (
                            <Badge variant="warning" size="sm">{v.documents.length} docs</Badge>
                          )}
                          <Link href={`/${locale}/admin/verifications`}>
                            <Button variant="outline" size="icon-sm" className="border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500/40 mb-2" />
                    <p className="text-sm text-muted-foreground">All clear — no pending verifications</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Platform summary */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Summary</CardTitle>
                <p className="text-sm text-muted-foreground">Key metrics at a glance</p>
              </CardHeader>
              <CardContent>
                {stats ? (
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Total Hotels', value: stats.hotels.total, sub: `${stats.hotels.verified} verified` },
                      { label: 'Total Jobs', value: stats.jobs.total, sub: `${stats.jobs.active} active` },
                      { label: 'Total Applications', value: stats.applications.total, sub: `${stats.applications.thisMonth} this month` },
                      { label: 'New Users', value: stats.users.newThisMonth, sub: 'this month' },
                    ].map((m) => (
                      <motion.div
                        key={m.label}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-xl bg-muted/30 p-4"
                      >
                        <p className="text-xs text-muted-foreground">{m.label}</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{m.value.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{m.sub}</p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[160px]">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick actions */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 text-sm">Quick Actions</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Manage Users', href: `/${locale}/admin/users`, icon: Users, color: 'text-brand-500 bg-brand-50 dark:bg-brand-950/30' },
                { label: 'Verify Hotels', href: `/${locale}/admin/verifications`, icon: Building2, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' },
                { label: 'Revenue Report', href: `/${locale}/admin/payments`, icon: DollarSign, color: 'text-gold-500 bg-gold-50 dark:bg-gold-950/30' },
                { label: 'Support Tickets', href: `/${locale}/admin/tickets`, icon: AlertTriangle, color: 'text-red-500 bg-red-50 dark:bg-red-950/30' },
              ].map((action) => {
                const Icon = action.icon
                return (
                  <Link key={action.label} href={action.href}>
                    <div className="flex items-center gap-3 p-4 rounded-2xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-soft transition-all duration-200 cursor-pointer group">
                      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', action.color)}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {action.label}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
