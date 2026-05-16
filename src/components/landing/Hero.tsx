'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import {
  ArrowRight,
  Play,
  Star,
  CheckCircle2,
  MapPin,
  Users,
  Building2,
  Globe2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const floatingCards = [
  {
    id: 1,
    type: 'match',
    content: 'New Match!',
    sub: 'Chef de Partie — Grand Resort Antalya',
    icon: '🎯',
    style: 'top-[15%] left-[4%]',
    delay: 0,
  },
  {
    id: 2,
    type: 'hire',
    content: '3 New Applications',
    sub: 'For Receptionist Position',
    icon: '📋',
    style: 'top-[20%] right-[3%]',
    delay: 1.5,
  },
  {
    id: 3,
    type: 'placed',
    content: 'Successfully Placed!',
    sub: '🇷🇺 → Kempinski Bodrum',
    icon: '✅',
    style: 'bottom-[25%] left-[3%]',
    delay: 0.8,
  },
  {
    id: 4,
    type: 'permit',
    content: 'Work Permit Approved',
    sub: 'Starting March 2025',
    icon: '📄',
    style: 'bottom-[20%] right-[4%]',
    delay: 2,
  },
]

const trustLogos = [
  'Rixos Hotels',
  'Kempinski',
  'Hilton',
  'Marriott',
  'Hyatt',
  'Four Seasons',
]

interface HeroProps {
  stats?: { hotelCount: number; candidateCount: number; placementCount: number; countryCount: number } | null
}

function formatStat(n: number): string {
  if (n >= 1000) return `${Math.floor(n / 1000)}K+`
  return `${n}+`
}

export function Hero({ stats }: HeroProps) {
  const t = useTranslations('hero')
  const locale = useLocale()

  const heroStats = [
    { value: stats ? formatStat(stats.hotelCount) : '500+', label: 'Hotels', icon: Building2 },
    { value: stats ? formatStat(stats.candidateCount) : '50K+', label: 'Candidates', icon: Users },
    { value: stats ? String(stats.countryCount) : '25', label: 'Countries', icon: Globe2 },
  ]

  return (
    <section className="relative min-h-[100svh] flex flex-col overflow-hidden hero-mesh">
      {/* Grid overlay */}
      <div className="absolute inset-0 hero-grid opacity-40" aria-hidden="true" />

      {/* Radial glow center */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-20"
        style={{
          background:
            'radial-gradient(circle, rgba(97,114,243,0.5) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Floating ambient orbs */}
      <motion.div
        animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #0EA5E9, transparent)' }}
        aria-hidden="true"
      />
      <motion.div
        animate={{ y: [0, 20, 0], x: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-1/3 left-1/4 w-48 h-48 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #F59E0B, transparent)' }}
        aria-hidden="true"
      />

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col justify-center pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Copy */}
          <div className="space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border-white/20 text-white text-sm backdrop-blur-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {t('badge')}
              </Badge>
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="space-y-3"
            >
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.05] tracking-tight">
                Connect Global Talent with{' '}
                <span className="relative inline-block">
                  <span
                    className="text-transparent bg-clip-text"
                    style={{
                      backgroundImage:
                        'linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #38BDF8 100%)',
                    }}
                  >
                    Turkish Hotels
                  </span>
                  {/* Underline decoration */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="absolute -bottom-1 left-0 right-0 h-0.5 origin-left rounded-full opacity-60"
                    style={{
                      background: 'linear-gradient(135deg, #FBBF24, #38BDF8)',
                    }}
                  />
                </span>
              </h1>
            </motion.div>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg sm:text-xl text-white/70 leading-relaxed max-w-xl"
            >
              {t('subheadline')}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Link href={`/${locale}/register?role=hotel`}>
                <Button
                  size="xl"
                  className="w-full sm:w-auto group bg-white text-gray-900 hover:bg-white/90 shadow-premium font-semibold"
                  rightIcon={
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  }
                >
                  <Building2 className="w-5 h-5" />
                  {t('ctaHotels')}
                </Button>
              </Link>
              <Link href={`/${locale}/register?role=candidate`}>
                <Button
                  size="xl"
                  variant="glass"
                  className="w-full sm:w-auto group border-white/30 text-white hover:bg-white/15"
                  rightIcon={
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  }
                >
                  <Users className="w-5 h-5" />
                  {t('ctaCandidates')}
                </Button>
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="flex items-center gap-3 pt-2"
            >
              <div className="flex -space-x-2">
                {['🇷🇺', '🇺🇦', '🇺🇿', '🇰🇿', '🇵🇭'].map((flag, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-sm backdrop-blur-sm"
                  >
                    {flag}
                  </div>
                ))}
              </div>
              <div className="text-white/70 text-sm">
                <span className="font-semibold text-white">{stats ? formatStat(stats.candidateCount) : '50,000+'}</span> candidates from {stats ? stats.countryCount : 25} countries
              </div>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="flex items-center gap-6 pt-4 border-t border-white/10"
            >
              {heroStats.map(({ value, label, icon: Icon }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-white/50" />
                  <div>
                    <div className="text-xl font-bold text-white leading-none">
                      {value}
                    </div>
                    <div className="text-xs text-white/50 mt-0.5">{label}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            {/* Main dashboard card */}
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_40px_120px_rgba(0,0,0,0.6)]">
              {/* Mockup header */}
              <div className="bg-background/95 backdrop-blur-xl px-5 py-4 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <div className="ml-4 flex-1 bg-muted/60 rounded-lg h-6 px-3 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-400/60" />
                    <span className="text-xs text-muted-foreground">app.hotellink.com/dashboard</span>
                  </div>
                </div>
              </div>

              {/* Mockup content */}
              <div className="bg-background/90 backdrop-blur-xl p-5 space-y-4">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Applications', value: '128', change: '+12%', color: 'text-brand-500' },
                    { label: 'Interviews', value: '34', change: '+5%', color: 'text-emerald-500' },
                    { label: 'Hired', value: '12', change: '+3', color: 'text-gold-500' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-muted/40 rounded-xl p-3">
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                      <div className={cn('text-2xl font-bold mt-1', stat.color)}>{stat.value}</div>
                      <div className="text-xs text-emerald-500 mt-0.5">{stat.change}</div>
                    </div>
                  ))}
                </div>

                {/* Candidate list */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Latest Candidates
                  </div>
                  {[
                    { name: 'Olena K.', nat: '🇺🇦', dept: 'Reception', exp: '4 yrs', score: 92 },
                    { name: 'Dmitri V.', nat: '🇷🇺', dept: 'Kitchen', exp: '7 yrs', score: 88 },
                    { name: 'Aizat B.', nat: '🇰🇿', dept: 'Housekeeping', exp: '3 yrs', score: 85 },
                  ].map((c) => (
                    <div
                      key={c.name}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-full bg-brand-gradient flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        {c.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground flex items-center gap-1.5">
                          {c.name} <span>{c.nat}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{c.dept} · {c.exp}</div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <div className="text-xs font-semibold text-emerald-500">{c.score}%</div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Map locations */}
                <div className="bg-muted/40 rounded-xl p-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="text-xs text-muted-foreground">
                    Active candidates in: <span className="text-foreground font-medium">Istanbul, Antalya, Bodrum, Marmaris</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating notification cards */}
            {floatingCards.map((card) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + card.delay * 0.3 }}
                className={cn('absolute z-10 float-card max-w-[200px]', card.style)}
                style={{ animationDelay: `${card.delay}s` }}
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-xl leading-none">{card.icon}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-foreground leading-tight">{card.content}</div>
                    <div className="text-2xs text-muted-foreground mt-0.5 leading-tight truncate">{card.sub}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Trust logos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="mt-16 pt-10 border-t border-white/10"
        >
          <p className="text-center text-white/40 text-xs font-medium uppercase tracking-widest mb-6">
            Trusted by leading hotels in Türkiye
          </p>
          <div className="flex items-center justify-center flex-wrap gap-8">
            {trustLogos.map((logo) => (
              <div
                key={logo}
                className="text-white/30 text-sm font-semibold tracking-wide hover:text-white/60 transition-colors cursor-default"
              >
                {logo}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, hsl(var(--background)), transparent)',
        }}
        aria-hidden="true"
      />
    </section>
  )
}
