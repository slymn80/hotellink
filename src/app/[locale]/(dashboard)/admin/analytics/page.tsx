'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Building2, Briefcase, DollarSign, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatsCard } from '@/components/dashboard/StatsCard'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const CUSTOM_TOOLTIP = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-lg">
      <p className="text-xs font-medium text-foreground mb-2">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: <span className="font-semibold">{entry.value}</span>
        </p>
      ))}
    </div>
  )
}

interface AdminStats {
  users: {
    total: number
    newThisMonth: number
    growthRate: number
    roleChartData: Array<{ name: string; value: number; count: number; color: string }>
  }
  hotels: { total: number; verified: number }
  jobs: { total: number; active: number }
  applications: { total: number; thisMonth: number }
  revenue: { thisMonth: number; lastMonth: number; growthRate: number }
  verifications: { pending: number }
  growth: Array<{ month: string; users: number; applications: number }>
}

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((d) => { if (d.status === 'success') setStats(d.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Platform Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Overview of HotelLink platform performance</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Users"
          value={stats?.users.total ?? '—'}
          change={stats?.users.growthRate ?? undefined}
          changeLabel="vs last month"
          icon={Users}
          color="primary"
          index={0}
        />
        <StatsCard
          label="Hotels"
          value={stats?.hotels.total ?? '—'}
          icon={Building2}
          color="success"
          index={1}
        />
        <StatsCard
          label="Active Jobs"
          value={stats?.jobs.active ?? '—'}
          icon={Briefcase}
          color="warning"
          index={2}
        />
        <StatsCard
          label="Monthly Revenue"
          value={stats ? `$${stats.revenue.thisMonth.toLocaleString()}` : '—'}
          change={stats?.revenue.growthRate ?? undefined}
          changeLabel="vs last month"
          icon={DollarSign}
          color="purple"
          index={3}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Growth trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <h2 className="font-semibold text-foreground mb-4">Platform Growth (Last 6 Months)</h2>
            {stats?.growth && stats.growth.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={stats.growth}>
                  <defs>
                    <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6172F3" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6172F3" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="appGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<CUSTOM_TOOLTIP />} />
                  <Legend />
                  <Area type="monotone" dataKey="users" name="New Users" stroke="#6172F3" strokeWidth={2} fill="url(#userGrad)" />
                  <Area type="monotone" dataKey="applications" name="Applications" stroke="#10B981" strokeWidth={2} fill="url(#appGrad2)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[240px] text-sm text-muted-foreground">No data yet</div>
            )}
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* User roles */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <h2 className="mb-4 font-semibold text-foreground">User Roles</h2>
              {stats?.users.roleChartData && stats.users.roleChartData.length > 0 ? (
                <>
                  <div className="flex justify-center mb-4">
                    <PieChart width={180} height={140}>
                      <Pie
                        data={stats.users.roleChartData}
                        cx={90} cy={70}
                        innerRadius={45} outerRadius={65}
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
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{item.count}</span>
                          <span className="text-xs font-semibold text-foreground">{item.value}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-[180px] text-sm text-muted-foreground">No users yet</div>
              )}
            </motion.div>

            {/* Key metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 rounded-2xl border border-border bg-card p-6"
            >
              <h2 className="mb-4 font-semibold text-foreground">Platform Summary</h2>
              {stats ? (
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Total Users', value: stats.users.total, sub: `${stats.users.newThisMonth} new this month` },
                    { label: 'Verified Hotels', value: stats.hotels.verified, sub: `of ${stats.hotels.total} total` },
                    { label: 'Total Applications', value: stats.applications.total, sub: `${stats.applications.thisMonth} this month` },
                    { label: 'Pending Verifications', value: stats.verifications.pending, highlight: stats.verifications.pending > 0 },
                    { label: 'Total Jobs', value: stats.jobs.total, sub: `${stats.jobs.active} active` },
                    { label: 'Monthly Revenue', value: `$${stats.revenue.thisMonth.toLocaleString()}`, sub: `$${stats.revenue.lastMonth.toLocaleString()} last month` },
                  ].map((m) => (
                    <div key={m.label} className="rounded-xl bg-muted/30 p-4">
                      <p className="text-xs text-muted-foreground">{m.label}</p>
                      <p className={`text-2xl font-bold mt-1 ${(m as any).highlight ? 'text-amber-600' : 'text-foreground'}`}>
                        {m.value}
                      </p>
                      {m.sub && <p className="text-xs text-muted-foreground mt-0.5">{m.sub}</p>}
                    </div>
                  ))}
                </div>
              ) : null}
            </motion.div>
          </div>
        </>
      )}
    </div>
  )
}
