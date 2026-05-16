'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { Users, Building2, Briefcase, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type Role = 'CANDIDATE' | 'HOTEL_EMPLOYER' | 'HR_AGENCY'

const roles = [
  {
    id: 'CANDIDATE' as Role,
    icon: Users,
    label: 'Job Seeker',
    description: 'Find hospitality jobs in Türkiye with work permit support',
    color: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30',
    activeColor: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/30',
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  {
    id: 'HOTEL_EMPLOYER' as Role,
    icon: Building2,
    label: 'Hotel',
    description: 'Post jobs and find qualified international hospitality staff',
    color: 'border-brand-200 bg-brand-50 dark:border-brand-800 dark:bg-brand-950/30',
    activeColor: 'border-primary bg-primary/5 dark:bg-primary/10 ring-2 ring-primary/30',
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
  },
  {
    id: 'HR_AGENCY' as Role,
    icon: Briefcase,
    label: 'HR Agency',
    description: 'Place candidates at partner hotels and manage your talent pool',
    color: 'border-violet-200 bg-violet-50 dark:border-violet-800 dark:bg-violet-950/30',
    activeColor: 'border-violet-500 bg-violet-50 dark:bg-violet-950/40 ring-2 ring-violet-500/30',
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-100 dark:bg-violet-900/30',
  },
]

const ROLE_REDIRECT: Record<Role, string> = {
  CANDIDATE: '/candidate/profile?setup=true',
  HOTEL_EMPLOYER: '/hotel/onboarding',
  HR_AGENCY: '/agency/profile?setup=true',
}

export default function OnboardingRolePage() {
  const locale = useLocale()
  const router = useRouter()
  const [selected, setSelected] = useState<Role | null>(null)
  const [saving, setSaving] = useState(false)

  const handleContinue = async () => {
    if (!selected) return
    setSaving(true)
    try {
      const res = await fetch('/api/auth/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selected }),
      })
      if (!res.ok) {
        toast.error('Something went wrong. Please try again.')
        return
      }
      router.push(`/${locale}${ROLE_REDIRECT[selected]}`)
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
            <CheckCircle2 className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">One last step</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            How will you be using HotelLink? Choose the option that best describes you.
          </p>
        </div>

        {/* Role cards */}
        <div className="space-y-3 mb-6">
          {roles.map((role) => {
            const Icon = role.icon
            const isSelected = selected === role.id
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelected(role.id)}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200',
                  isSelected ? role.activeColor : role.color
                )}
              >
                <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', role.iconBg)}>
                  <Icon className={cn('w-5 h-5', role.iconColor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('font-semibold text-sm', isSelected ? role.iconColor : 'text-foreground')}>
                    {role.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {role.description}
                  </p>
                </div>
                {isSelected && (
                  <CheckCircle2 className={cn('w-5 h-5 flex-shrink-0', role.iconColor)} />
                )}
              </button>
            )
          })}
        </div>

        <Button
          variant="gradient"
          size="lg"
          className="w-full"
          disabled={!selected}
          loading={saving}
          rightIcon={<ArrowRight className="w-5 h-5" />}
          onClick={handleContinue}
        >
          Continue
        </Button>
      </motion.div>
    </div>
  )
}
