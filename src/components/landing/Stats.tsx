'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Building2, Users, CheckCircle2, Globe2 } from 'lucide-react'

interface StatItemProps {
  value: number
  suffix?: string
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  delay: number
}

function useCountUp(target: number, duration = 2000, startCounting = false) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!startCounting) return
    let startTime: number | null = null
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, startCounting])

  return count
}

function StatItem({ value, suffix = '', label, description, icon: Icon, delay }: StatItemProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const count = useCountUp(value, 2000, isInView)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className="group relative flex flex-col items-center text-center p-8 rounded-3xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-card transition-all duration-300"
    >
      {/* Icon */}
      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors duration-300">
        <Icon className="w-7 h-7 text-primary" />
      </div>

      {/* Number */}
      <div className="text-5xl xl:text-6xl font-display font-bold text-foreground leading-none mb-2">
        {count.toLocaleString()}
        <span className="text-primary">{suffix}</span>
      </div>

      {/* Label */}
      <div className="text-base font-semibold text-foreground mt-2 mb-1">{label}</div>

      {/* Description */}
      <div className="text-sm text-muted-foreground leading-relaxed">{description}</div>

      {/* Decorative gradient blob */}
      <div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 0%, hsl(var(--primary) / 0.06) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />
    </motion.div>
  )
}

interface StatsProps {
  stats?: { hotelCount: number; candidateCount: number; placementCount: number; countryCount: number } | null
}

export function Stats({ stats: data }: StatsProps) {
  const t = useTranslations('stats')

  const stats = [
    {
      value: data?.hotelCount ?? 500,
      suffix: '+',
      label: t('hotels'),
      description: t('hotelsDesc'),
      icon: Building2,
      delay: 0,
    },
    {
      value: data?.candidateCount ?? 50000,
      suffix: '+',
      label: t('candidates'),
      description: t('candidatesDesc'),
      icon: Users,
      delay: 0.1,
    },
    {
      value: data?.placementCount ?? 12000,
      suffix: '+',
      label: t('placements'),
      description: t('placementsDesc'),
      icon: CheckCircle2,
      delay: 0.2,
    },
    {
      value: data?.countryCount ?? 25,
      suffix: '',
      label: t('countries'),
      description: t('countriesDesc'),
      icon: Globe2,
      delay: 0.3,
    },
  ]

  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
            By the numbers
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground max-w-2xl mx-auto">
            {t('title')}
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat) => (
            <StatItem key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  )
}
