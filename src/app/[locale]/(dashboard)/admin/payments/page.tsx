'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign, TrendingUp, CreditCard,
  Download, Search, Loader2, CheckCircle,
  XCircle, Clock, RefreshCw, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { formatDate } from '@/lib/utils'
import { useDebounce } from '@/hooks'
import { toast } from 'sonner'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'

interface Payment {
  id: string
  amount: number
  currency: string
  status: string
  description: string | null
  paidAt: string | null
  createdAt: string
  subscription: { plan: string; hotelId: string } | null
}

interface PaymentStats {
  revenueThisMonth: number
  revenueLastMonth: number
  growthRate: number
  activeSubscriptions: number
  avgRevenuePerHotel: number
  failedPayments: number
  trend: Array<{ month: string; revenue: number }>
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'success' | 'warning' | 'destructive' | 'secondary' | 'info'; icon: React.ReactNode }> = {
  COMPLETED: { label: 'Completed', variant: 'success', icon: <CheckCircle className="h-3.5 w-3.5" /> },
  PENDING: { label: 'Pending', variant: 'warning', icon: <Clock className="h-3.5 w-3.5" /> },
  FAILED: { label: 'Failed', variant: 'destructive', icon: <XCircle className="h-3.5 w-3.5" /> },
  REFUNDED: { label: 'Refunded', variant: 'info', icon: <RefreshCw className="h-3.5 w-3.5" /> },
  PROCESSING: { label: 'Processing', variant: 'secondary', icon: <Clock className="h-3.5 w-3.5" /> },
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const debouncedQuery = useDebounce(query, 400)

  useEffect(() => {
    fetch('/api/admin/payments/stats')
      .then((r) => r.json())
      .then((d) => { if (d.status === 'success') setStats(d.data) })
      .catch(console.error)
  }, [])

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (debouncedQuery) params.set('q', debouncedQuery)
        if (statusFilter) params.set('status', statusFilter)
        params.set('page', String(page))
        params.set('pageSize', '20')

        const res = await fetch(`/api/admin/payments?${params.toString()}`)
        const data = await res.json()
        if (data.status === 'success') {
          setPayments(data.data.items)
          setTotal(data.data.total)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [debouncedQuery, statusFilter, page])

  const exportReport = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/admin/payments/export?${params.toString()}`)
      if (!res.ok) { toast.error('Export failed'); return }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `payments-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Export failed')
    }
  }

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Revenue & Payments</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor platform revenue and transactions</p>
        </div>
        <Button variant="outline" leftIcon={<Download className="h-4 w-4" />} onClick={exportReport}>
          Export Report
        </Button>
      </div>

      {/* Revenue stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Revenue This Month"
          value={stats ? `$${stats.revenueThisMonth.toLocaleString()}` : '—'}
          change={stats?.growthRate ?? undefined}
          changeLabel="vs last month"
          icon={DollarSign} color="success" index={0}
        />
        <StatsCard
          label="Active Subscriptions"
          value={stats?.activeSubscriptions ?? '—'}
          icon={CreditCard} color="primary" index={1}
        />
        <StatsCard
          label="Avg. Revenue/Hotel"
          value={stats ? `$${stats.avgRevenuePerHotel.toLocaleString()}` : '—'}
          icon={TrendingUp} color="purple" index={2}
        />
        <StatsCard
          label="Failed Payments"
          value={stats?.failedPayments ?? '—'}
          icon={XCircle} color="danger" index={3}
        />
      </div>

      {/* Revenue chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-border bg-card p-6"
      >
        <h2 className="mb-4 font-semibold text-foreground">Revenue Trend (7 months)</h2>
        {stats?.trend ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats.trend}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6172F3" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6172F3" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <YAxis
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(v) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
                formatter={(value) => [`$${(value as number).toLocaleString()}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#6172F3" strokeWidth={2} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[220px]">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </motion.div>

      {/* Payments table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1) }}
              className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
          >
            <option value="">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>{config.label}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Plan</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                        No payments found
                      </td>
                    </tr>
                  ) : (
                    payments.map((payment, i) => {
                      const statusConfig = STATUS_CONFIG[payment.status]
                      return (
                        <motion.tr
                          key={payment.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.02 }}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm font-medium text-foreground">
                            {payment.subscription?.plan ?? '—'}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {payment.description ?? '—'}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-foreground">
                              ${Number(payment.amount).toLocaleString()} {payment.currency}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={statusConfig?.variant ?? 'secondary'} size="sm">
                              {statusConfig?.label ?? payment.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {payment.paidAt ? formatDate(new Date(payment.paidAt)) : formatDate(new Date(payment.createdAt))}
                          </td>
                        </motion.tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} leftIcon={<ChevronLeft className="h-4 w-4" />}>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} rightIcon={<ChevronRight className="h-4 w-4" />}>
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
