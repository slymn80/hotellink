'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useTranslations } from 'next-intl'
import {
  Sparkles,
  FileCheck2,
  Languages,
  Lock,
  MessageSquare,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const featureIcons = [Sparkles, FileCheck2, Languages, Lock, MessageSquare, BarChart3]
const featureColors = [
  { bg: 'bg-brand-50 dark:bg-brand-950/30', icon: 'text-brand-500', glow: 'group-hover:shadow-glow-brand' },
  { bg: 'bg-emerald-50 dark:bg-emerald-950/30', icon: 'text-emerald-500', glow: 'group-hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]' },
  { bg: 'bg-violet-50 dark:bg-violet-950/30', icon: 'text-violet-500', glow: 'group-hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]' },
  { bg: 'bg-gold-50 dark:bg-gold-950/30', icon: 'text-gold-500', glow: 'group-hover:shadow-glow-gold' },
  { bg: 'bg-ocean-50 dark:bg-ocean-950/30', icon: 'text-ocean-500', glow: 'group-hover:shadow-glow-ocean' },
  { bg: 'bg-pink-50 dark:bg-pink-950/30', icon: 'text-pink-500', glow: 'group-hover:shadow-[0_0_30px_rgba(236,72,153,0.3)]' },
]

export function Features() {
  const t = useTranslations('features')
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const items = t.raw('items') as { title: string; description: string }[]

  return (
    <section className="py-20 lg:py-28 bg-background overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
            Platform Features
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 max-w-3xl mx-auto">
            {t('title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {items.map((item, i) => {
            const Icon = featureIcons[i]
            const colors = featureColors[i]

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={cn(
                  'group relative p-6 lg:p-7 rounded-3xl',
                  'bg-card border border-border/50',
                  'hover:border-transparent hover:-translate-y-1',
                  'transition-all duration-300 cursor-default',
                  colors.glow
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    'w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110',
                    colors.bg
                  )}
                >
                  <Icon className={cn('w-6 h-6', colors.icon)} />
                </div>

                {/* Content */}
                <h3 className="font-display text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-200">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.description}
                </p>

                {/* Hover gradient */}
                <div
                  className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(circle at 30% 0%, hsl(var(--primary) / 0.04) 0%, transparent 60%)',
                  }}
                  aria-hidden="true"
                />
              </motion.div>
            )
          })}
        </div>

        {/* Bottom feature highlight - full width */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-6 rounded-3xl overflow-hidden border border-border/50 bg-hero-gradient p-8 lg:p-12 text-white"
        >
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-sm font-medium mb-4 border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                Work Permit Workflow
              </div>
              <h3 className="font-display text-2xl lg:text-3xl font-bold mb-3 leading-tight">
                Complete Work Permit Support for Turkish Employment
              </h3>
              <p className="text-white/70 leading-relaxed mb-6">
                Navigate the Turkish work permit process with confidence. Our step-by-step guidance,
                document templates, and expert support make legal employment in Türkiye straightforward
                for both hotels and foreign workers.
              </p>
              <div className="flex flex-wrap gap-3">
                {['Document Checklist', 'Status Tracking', 'Expert Guidance', 'Multilingual Support'].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Permit steps visual */}
            <div className="space-y-3">
              {[
                { step: 1, label: 'Hotel submits work permit application', status: 'complete' },
                { step: 2, label: 'Candidate prepares required documents', status: 'complete' },
                { step: 3, label: 'Ministry of Labor review (approx. 30 days)', status: 'active' },
                { step: 4, label: 'Residence permit registration', status: 'pending' },
                { step: 5, label: 'Employee starts work legally', status: 'pending' },
              ].map((item) => (
                <div
                  key={item.step}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200',
                    item.status === 'complete' && 'bg-emerald-500/10 border-emerald-500/30',
                    item.status === 'active' && 'bg-white/10 border-white/30',
                    item.status === 'pending' && 'bg-white/5 border-white/10 opacity-60'
                  )}
                >
                  <div
                    className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                      item.status === 'complete' && 'bg-emerald-500 text-white',
                      item.status === 'active' && 'bg-gold-500 text-white',
                      item.status === 'pending' && 'bg-white/20 text-white/60'
                    )}
                  >
                    {item.status === 'complete' ? '✓' : item.step}
                  </div>
                  <span
                    className={cn(
                      'text-sm',
                      item.status === 'pending' ? 'text-white/40' : 'text-white/90'
                    )}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
