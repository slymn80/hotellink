'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Briefcase, TrendingUp, CheckCircle2, Loader2, Building2 } from 'lucide-react'
import { StatsCard } from '@/components/dashboard/StatsCard'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { toast } from 'sonner'

const TIME_RANGES = ['30 days', '90 days', '6 months', 'All time']

interface Analytics {
  totalPools: number
  partnerCount: number
  totalPlaced: number
  activeApplications: number
  placementRate: number
  trend: Array<{ month: string; applications: number; placed: number }>
}

const CUSTOM_TOOLTIP = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-lg">
      <p className="text-xs font-medium text-foreground mb-2">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: <span className="font-semibold">{entry.value}</span>
        </p>
      ))}
    </div>
  )
}

export default function AgencyAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('6 months')
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/agency/analytics')
      .then(r => r.json())
      .then(d => { if (d.status === 'success') setAnalytics(d.data) })
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  const data = analytics!

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agency Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Track placements, pipeline, and performance</p>
        </div>
        <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
          {TIME_RANGES.map((range) => (
            <button key={range} onClick={() => setTimeRange(range)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${timeRange === range ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Candidate Pools" value={data.totalPools} icon={Users} color="primary" index={0} />
        <StatsCard label="Placements Made" value={data.totalPlaced} icon={CheckCircle2} color="success" index={1} />
        <StatsCard label="Active Applications" value={data.activeApplications} icon={Briefcase} color="warning" index={2} />
        <StatsCard label="Partner Hotels" value={data.partnerCount} icon={Building2} color="purple" index={3} />
      </div>

      {/* Pipeline trend */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold text-foreground mb-4">Placement Pipeline (Last 6 Months)</h2>
        {data.trend.every(t => t.applications === 0) ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            No placement data yet. Start managing applications through partner hotels.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data.trend}>
              <defs>
                <linearGradient id="placedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="appGrad3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6172F3" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6172F3" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <Tooltip content={<CUSTOM_TOOLTIP />} />
              <Legend />
              <Area type="monotone" dataKey="applications" name="Applications" stroke="#6172F3" strokeWidth={2} fill="url(#appGrad3)" />
              <Area type="monotone" dataKey="placed" name="Placed" stroke="#10B981" strokeWidth={2} fill="url(#placedGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Placement rate summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold text-foreground mb-4">Placement Rate</h2>
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold text-foreground">{data.placementRate}%</div>
          <div className="flex-1">
            <div className="h-3 rounded-full bg-muted">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-primary transition-all"
                style={{ width: `${data.placementRate}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.totalPlaced} placed out of {data.totalPlaced + data.activeApplications} total
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
