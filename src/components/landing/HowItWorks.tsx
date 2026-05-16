'use client'

import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useTranslations } from 'next-intl'
import {
  Building2,
  Users,
  FileText,
  Search,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const hotelIcons = [Building2, FileText, ShieldCheck]
const candidateIcons = [Users, Search, MessageSquare]

export function HowItWorks() {
  const t = useTranslations('howItWorks')
  const [activeTab, setActiveTab] = useState<'hotels' | 'candidates'>('hotels')
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  const hotelSteps = t.raw('hotelsSteps') as { step: string; title: string; description: string }[]
  const candidateSteps = t.raw('candidatesSteps') as { step: string; title: string; description: string }[]

  const steps = activeTab === 'hotels' ? hotelSteps : candidateSteps
  const icons = activeTab === 'hotels' ? hotelIcons : candidateIcons

  return (
    <section className="py-20 lg:py-28 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
            Simple Process
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t('title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>

          {/* Tab switcher */}
          <div className="flex items-center justify-center mt-8">
            <div className="inline-flex p-1 rounded-2xl bg-muted border border-border/50">
              {(
                [
                  { key: 'hotels', label: t('tabHotels'), icon: Building2 },
                  { key: 'candidates', label: t('tabCandidates'), icon: Users },
                ] as const
              ).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={cn(
                    'flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300',
                    activeTab === key
                      ? 'bg-background text-foreground shadow-soft'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Steps */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid md:grid-cols-3 gap-6 lg:gap-8 relative"
        >
          {/* Connector line */}
          <div
            className="absolute top-12 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-0.5 bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30 hidden md:block"
            aria-hidden="true"
          />

          {steps.map((step, i) => {
            const Icon = icons[i]
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="relative flex flex-col items-center text-center group"
              >
                {/* Step circle */}
                <div className="relative z-10 w-24 h-24 rounded-3xl bg-card border border-border/50 shadow-card flex flex-col items-center justify-center mb-6 group-hover:border-primary/40 group-hover:shadow-glow-brand transition-all duration-300">
                  <Icon className="w-8 h-8 text-primary mb-1" />
                  <span className="text-2xs font-bold text-primary/60 uppercase tracking-widest">
                    {step.step}
                  </span>
                </div>

                {/* Content */}
                <h3 className="font-display text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-200">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {step.description}
                </p>

                {/* Arrow connector (mobile) */}
                {i < steps.length - 1 && (
                  <div className="flex items-center justify-center mt-6 md:hidden">
                    <ArrowRight className="w-5 h-5 text-primary/40 rotate-90" />
                  </div>
                )}
              </motion.div>
            )
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground text-sm">
            Ready to get started?{' '}
            <a
              href="#pricing"
              className="text-primary font-medium hover:underline inline-flex items-center gap-1"
            >
              View our plans
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
