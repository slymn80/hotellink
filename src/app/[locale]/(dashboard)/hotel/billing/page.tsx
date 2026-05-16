'use client'

import { useState, useEffect } from 'react'
import { CreditCard, Check, Zap, Building2, Crown, ArrowRight, AlertCircle, Loader2, Download, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const PLANS = [
  {
    id: 'STARTER',
    name: 'Starter',
    price: 49,
    icon: Zap,
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    features: ['3 active job postings', 'Up to 50 candidate views/month', 'Basic analytics', 'Email support'],
  },
  {
    id: 'PROFESSIONAL',
    name: 'Professional',
    price: 149,
    icon: Building2,
    color: 'text-primary',
    bg: 'bg-primary/5',
    popular: true,
    features: ['15 active job postings', 'Unlimited candidate views', 'AI candidate matching', 'Advanced analytics', 'Priority support', 'Featured hotel listing'],
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: 399,
    icon: Crown,
    color: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    features: ['Unlimited job postings', 'Unlimited candidate views', 'AI matching + bulk ranking', 'Custom analytics dashboard', 'Dedicated account manager', 'API access'],
  },
]

interface Subscription {
  id: string
  plan: string
  status: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  jobPostingLimit: number
}

interface Payment {
  id: string
  amount: number | string
  currency: string
  status: string
  description: string | null
  paidAt: string | null
  createdAt: string
  stripeInvoiceId: string | null
}

interface Usage {
  activeJobs: number
  jobLimit: number
  totalApplications: number
}

export default function HotelBillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [usage, setUsage] = useState<Usage | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const [openingPortal, setOpeningPortal] = useState(false)

  useEffect(() => {
    fetch('/api/hotel/billing')
      .then(r => r.json())
      .then(d => {
        if (d.status === 'success') {
          setSubscription(d.data.subscription)
          setPayments(d.data.payments)
          setUsage(d.data.usage)
        }
      })
      .catch(() => toast.error('Failed to load billing data'))
      .finally(() => setLoading(false))
  }, [])

  const handleUpgrade = async (planId: string) => {
    if (planId === subscription?.plan) return
    setUpgrading(planId)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId, billingPeriod: 'MONTHLY' }),
      })
      const data = await res.json()
      if (data.data?.url) window.location.href = data.data.url
      else toast.error('Failed to start checkout')
    } catch { toast.error('Failed to start checkout') }
    finally { setUpgrading(null) }
  }

  const handleManageBilling = async () => {
    setOpeningPortal(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.data?.url) window.location.href = data.data.url
      else toast.error(data.error ?? 'No active subscription found')
    } catch { toast.error('Failed to open billing portal') }
    finally { setOpeningPortal(false) }
  }

  const currentPlan = subscription?.plan ?? null

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-primary" />
          Subscription & Billing
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your plan, view invoices, and update payment details.</p>
      </div>

      {/* Current plan banner */}
      {subscription ? (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground capitalize">{subscription.plan.toLowerCase()} Plan</p>
              <p className="text-sm text-muted-foreground">
                {subscription.cancelAtPeriodEnd
                  ? `Cancels on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                  : `Renews on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={subscription.status === 'ACTIVE' ? 'success' : 'warning'}>
              {subscription.status}
            </Badge>
            <Button variant="outline" size="sm" loading={openingPortal}
              rightIcon={<ExternalLink className="h-3.5 w-3.5" />}
              onClick={handleManageBilling}>
              Manage billing
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-5 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-foreground">Free Plan</p>
            <p className="text-sm text-muted-foreground">1 active job posting · Limited features</p>
          </div>
          <Badge variant="secondary">No subscription</Badge>
        </div>
      )}

      {/* Usage */}
      {usage && (
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Active Jobs', used: usage.activeJobs, limit: usage.jobLimit },
            { label: 'Total Applications', used: usage.totalApplications, limit: null },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {item.used}
                {item.limit && <span className="text-base font-normal text-muted-foreground"> / {item.limit}</span>}
              </p>
              {item.limit && (
                <div className="mt-3 h-1.5 rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (item.used / item.limit) * 100)}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Plan cards */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Available Plans</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {PLANS.map((plan) => {
            const Icon = plan.icon
            const isCurrent = plan.id === currentPlan
            return (
              <div key={plan.id}
                className={cn('rounded-2xl border bg-card p-6 relative', isCurrent ? 'border-primary/40' : 'border-border', plan.popular && !isCurrent && 'ring-2 ring-primary/20')}>
                {plan.popular && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="default" size="sm">Most popular</Badge>
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="success" size="sm">Current plan</Badge>
                  </div>
                )}
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-4', plan.bg)}>
                  <Icon className={cn('h-5 w-5', plan.color)} />
                </div>
                <h3 className="font-semibold text-foreground">{plan.name}</h3>
                <p className="text-3xl font-bold text-foreground mt-2">
                  ${plan.price}<span className="text-base font-normal text-muted-foreground">/mo</span>
                </p>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-6" variant={isCurrent ? 'outline' : 'gradient'} size="sm"
                  disabled={isCurrent} loading={upgrading === plan.id}
                  onClick={() => handleUpgrade(plan.id)}
                  rightIcon={!isCurrent ? <ArrowRight className="h-3.5 w-3.5" /> : undefined}>
                  {isCurrent ? 'Current plan' : plan.id === 'ENTERPRISE' ? 'Contact sales' : 'Upgrade'}
                </Button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Invoice history */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Payment History</h2>
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {payments.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">No payments yet.</div>
          ) : (
            payments.map((pay, i) => (
              <div key={pay.id}
                className={cn('flex items-center justify-between px-5 py-4', i < payments.length - 1 && 'border-b border-border')}>
                <div>
                  <p className="text-sm font-medium text-foreground">{pay.description ?? `Payment #${pay.id.slice(-6).toUpperCase()}`}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {pay.paidAt ? new Date(pay.paidAt).toLocaleDateString() : new Date(pay.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={pay.status === 'COMPLETED' ? 'success' : 'warning'} size="sm">{pay.status}</Badge>
                  <span className="text-sm font-semibold text-foreground">
                    {Number(pay.amount).toLocaleString('en-US', { style: 'currency', currency: pay.currency })}
                  </span>
                  {pay.stripeInvoiceId && (
                    <Button variant="ghost" size="sm"
                      onClick={() => toast.info('Invoice download available via billing portal')}>
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
        <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-700 dark:text-amber-400">
          Payment processing is handled securely via Stripe. Your card details are never stored on our servers.
        </p>
      </div>
    </div>
  )
}
