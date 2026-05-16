'use client'

import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import { Check, Zap, Building2, Globe2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const planIcons = [Zap, Building2, Globe2, Sparkles]
const planColors = [
  { border: 'border-border', header: 'bg-muted/40', btn: 'outline' as const },
  { border: 'border-primary/30', header: 'bg-primary/5', btn: 'gradient' as const },
  { border: 'border-gold-300/60 dark:border-gold-700/40', header: 'bg-gold-50/60 dark:bg-gold-900/20', btn: 'gold' as const },
  { border: 'border-ocean-300/60 dark:border-ocean-700/40', header: 'bg-ocean-50/60 dark:bg-ocean-900/20', btn: 'ocean' as const },
]

export function Pricing() {
  const t = useTranslations('pricing')
  const locale = useLocale()
  const [isAnnual, setIsAnnual] = useState(false)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  const plans = [
    { key: 'free', data: t.raw('plans.free') as { name: string; description: string; features: string[] }, monthlyPrice: 0, annualPrice: 0 },
    { key: 'starter', data: t.raw('plans.starter') as { name: string; description: string; features: string[]; price: number }, monthlyPrice: 49, annualPrice: 39 },
    { key: 'professional', data: t.raw('plans.professional') as { name: string; description: string; features: string[]; price: number }, monthlyPrice: 149, annualPrice: 119, popular: true },
    { key: 'enterprise', data: t.raw('plans.enterprise') as { name: string; description: string; features: string[] }, monthlyPrice: -1, annualPrice: -1 },
  ]

  return (
    <section id="pricing" className="py-20 lg:py-28 bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
            Pricing Plans
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t('title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            {t('subtitle')}
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 p-1 rounded-2xl bg-muted border border-border/50">
            <button
              onClick={() => setIsAnnual(false)}
              className={cn(
                'px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                !isAnnual
                  ? 'bg-background text-foreground shadow-soft'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t('monthly')}
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isAnnual
                  ? 'bg-background text-foreground shadow-soft'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t('annual')}
              <Badge variant="success" size="sm">
                {t('savePercent')}
              </Badge>
            </button>
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-4 items-start">
          {plans.map((plan, i) => {
            const colors = planColors[i]
            const Icon = planIcons[i]
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice
            const isPaid = price > 0
            const isEnterprise = price === -1

            return (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={cn(
                  'relative rounded-3xl border overflow-hidden',
                  colors.border,
                  plan.popular && 'ring-2 ring-primary shadow-glow-brand'
                )}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-brand-gradient" />
                )}

                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="default" className="shadow-soft">
                      <Sparkles className="w-3 h-3" />
                      {t('mostPopular')}
                    </Badge>
                  </div>
                )}

                {/* Header */}
                <div className={cn('p-6', colors.header)}>
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center',
                      plan.popular ? 'bg-primary text-white' : 'bg-card text-primary border border-border'
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-display font-bold text-foreground">{plan.data.name}</div>
                    </div>
                  </div>

                  <div className="mb-2">
                    {isEnterprise ? (
                      <div className="font-display text-3xl font-bold text-foreground">
                        Custom
                      </div>
                    ) : (
                      <div className="flex items-end gap-1">
                        <span className="font-display text-4xl font-bold text-foreground">
                          ${isPaid ? price : 0}
                        </span>
                        {isPaid && (
                          <span className="text-muted-foreground text-sm mb-1">
                            {isAnnual ? t('perMonth') : t('perMonth')}
                          </span>
                        )}
                        {!isPaid && (
                          <span className="text-muted-foreground text-sm mb-1">forever</span>
                        )}
                      </div>
                    )}
                    {isAnnual && isPaid && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Billed ${price * 12} annually
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground">{plan.data.description}</p>
                </div>

                {/* Features */}
                <div className="p-6 space-y-3 bg-card">
                  {plan.data.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2.5 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-foreground/80">{feature}</span>
                    </div>
                  ))}

                  <div className="pt-4">
                    <Link href={isEnterprise ? `/${locale}/contact` : `/${locale}/register`}>
                      <Button
                        variant={colors.btn}
                        className="w-full"
                        size="lg"
                      >
                        {isEnterprise ? t('contactSales') : !isPaid ? t('startFree') : t('getStarted')}
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          All plans include a 14-day free trial. No credit card required. Cancel anytime.
          <br />
          <span className="font-medium text-foreground">Candidates are always free.</span>
        </motion.p>
      </div>
    </section>
  )
}
