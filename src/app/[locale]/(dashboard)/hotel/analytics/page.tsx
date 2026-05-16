'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, Eye, Users, Briefcase, Star, Loader2,
} from 'lucide-react'
import { StatsCard } from '@/components/dashboard/StatsCard'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

const DEPT_LABEL: Record<string, string> = {
  FRONT_OFFICE: 'Front Office', FOOD_BEVERAGE: 'F&B', HOUSEKEEPING: 'Housekeeping',
  SPA_WELLNESS: 'Spa', MANAGEMENT: 'Management', SALES_MARKETING: 'Sales', ENTERTAINMENT: 'Entertainment',
}

const COLORS = ['#6172F3', '#0BA5E9', '#F59E0B', '#10B981', '#8B5CF6', '#6B7280', '#EC4899']

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

interface AnalyticsData {
  profileViews: number
  totalApplications: number
  shortlisted: number
  hired: number
  activeJobs: number
  averageRating: number | null
  reviewCount: number
  departmentBreakdown: Array<{ department: string; applications: number; hires: number }>
  nationalityBreakdown: Array<{ name: string; value: number }>
  applicationTrend: Array<{ week: string; applications: number }>
}

export default function HotelAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics/hotel')
      .then(r => r.json())
      .then(d => { if (d.status === 'success') setData(d.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!data) return null

  const deptData = data.departmentBreakdown.map(d => ({
    department: DEPT_LABEL[d.department] ?? d.department,
    applications: d.applications,
    hires: d.hires,
  }))

  const totalNat = data.nationalityBreakdown.reduce((s, n) => s + n.value, 0)
  const natData = data.nationalityBreakdown.map((n, i) => ({
    ...n,
    color: COLORS[i % COLORS.length],
    pct: totalNat > 0 ? Math.round((n.value / totalNat) * 100) : 0,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Performance insights for your hotel</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Profile Views" value={data.profileViews.toLocaleString()} icon={Eye} color="primary" index={0} />
        <StatsCard label="Total Applications" value={data.totalApplications} icon={Users} color="success" index={1} />
        <StatsCard label="Shortlisted" value={data.shortlisted} icon={TrendingUp} color="warning" index={2} />
        <StatsCard label="Hires Made" value={data.hired} icon={Briefcase} color="purple" index={3} />
      </div>

      {/* Secondary stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground mb-1">Active Job Listings</p>
          <p className="text-2xl font-bold text-foreground">{data.activeJobs}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground mb-1">Staff Rating</p>
          <div className="flex items-center gap-2 mt-1">
            {data.averageRating ? (
              <>
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                <span className="text-2xl font-bold text-foreground">{data.averageRating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">({data.reviewCount} reviews)</span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">No reviews yet</span>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground mb-1">Conversion Rate</p>
          <p className="text-2xl font-bold text-foreground">
            {data.totalApplications > 0 ? ((data.hired / data.totalApplications) * 100).toFixed(1) : '0'}%
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">applications → hires</p>
        </div>
      </div>

      {/* Application Trend */}
      {data.applicationTrend.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border bg-card p-6"
        >
          <h2 className="mb-4 font-semibold text-foreground">Applications Over Time</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.applicationTrend}>
              <defs>
                <linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6172F3" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6172F3" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} allowDecimals={false} />
              <Tooltip content={<CUSTOM_TOOLTIP />} />
              <Area type="monotone" dataKey="applications" name="Applications" stroke="#6172F3" strokeWidth={2} fill="url(#appGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {deptData.length > 0 || natData.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Department breakdown */}
          {deptData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="lg:col-span-2 rounded-2xl border border-border bg-card p-6"
            >
              <h2 className="mb-4 font-semibold text-foreground">Applications by Department</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={deptData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="department" width={90} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <Tooltip content={<CUSTOM_TOOLTIP />} />
                  <Bar dataKey="applications" name="Applications" fill="#6172F3" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="hires" name="Hires" fill="#10B981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Nationality breakdown */}
          {natData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <h2 className="mb-4 font-semibold text-foreground">Applicant Nationalities</h2>
              <div className="flex justify-center mb-4">
                <PieChart width={160} height={130}>
                  <Pie data={natData} cx={80} cy={65} innerRadius={38} outerRadius={55}
                    dataKey="value" strokeWidth={2} stroke="hsl(var(--card))">
                    {natData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </div>
              <div className="space-y-2">
                {natData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-foreground">{item.pct}%</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No application data yet. Post jobs to see analytics.</p>
        </div>
      )}
    </div>
  )
}
