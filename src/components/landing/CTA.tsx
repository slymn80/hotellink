'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import { ArrowRight, Building2, Users, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CTAProps {
  stats?: { hotelCount: number; candidateCount: number; placementCount: number; countryCount: number } | null
}

function fmtStat(n: number): string {
  if (n >= 1000) return `${Math.floor(n / 1000)}K+`
  return `${n}+`
}

export function CTA({ stats }: CTAProps) {
  const t = useTranslations('cta')
  const locale = useLocale()

  const statsPill = stats
    ? `${stats.hotelCount}+ hotels · ${fmtStat(stats.candidateCount)} candidates · ${stats.countryCount} countries`
    : '500+ hotels · 50K+ candidates · 25 countries'
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="py-20 lg:py-28 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="relative rounded-[2rem] overflow-hidden bg-hero-gradient p-8 sm:p-12 lg:p-16 text-white"
        >
          {/* Background effects */}
          <div className="absolute inset-0 hero-grid opacity-20" aria-hidden="true" />
          <div
            className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(97,114,243,0.6), transparent)' }}
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full opacity-15 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.5), transparent)' }}
            aria-hidden="true"
          />

          <div className="relative z-10 text-center max-w-3xl mx-auto">
            {/* Stats pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-medium mb-8">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {statsPill}
              </span>
            </div>

            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mb-5 leading-tight">
              {t('title')}
            </h2>
            <p className="text-xl text-white/70 mb-10 leading-relaxed">
              {t('subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/${locale}/register?role=hotel`}>
                <Button
                  size="xl"
                  className="w-full sm:w-auto group bg-white text-gray-900 hover:bg-white/90 shadow-premium font-semibold"
                  leftIcon={<Building2 className="w-5 h-5" />}
                  rightIcon={
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  }
                >
                  {t('forHotels')}
                </Button>
              </Link>
              <Link href={`/${locale}/register?role=candidate`}>
                <Button
                  size="xl"
                  variant="glass"
                  className="w-full sm:w-auto group border-white/30 text-white hover:bg-white/15"
                  leftIcon={<Users className="w-5 h-5" />}
                  rightIcon={
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  }
                >
                  {t('forCandidates')}
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-white/50">
              {[t('noCreditCard'), '14-day free trial', 'Cancel anytime'].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
