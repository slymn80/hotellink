'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface StatsCardProps {
  label: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: React.ComponentType<{ className?: string }>
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'purple' | 'gold'
  href?: string
  description?: string
  index?: number
}

const colorConfig = {
  primary: {
    icon: 'text-brand-500',
    bg: 'bg-brand-50 dark:bg-brand-950/30',
    value: 'text-brand-600 dark:text-brand-400',
  },
  success: {
    icon: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    value: 'text-emerald-600 dark:text-emerald-400',
  },
  warning: {
    icon: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    value: 'text-amber-600 dark:text-amber-400',
  },
  danger: {
    icon: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-950/30',
    value: 'text-red-600 dark:text-red-400',
  },
  purple: {
    icon: 'text-violet-500',
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    value: 'text-violet-600 dark:text-violet-400',
  },
  gold: {
    icon: 'text-gold-500',
    bg: 'bg-gold-50 dark:bg-gold-950/30',
    value: 'text-gold-600 dark:text-gold-400',
  },
}

export function StatsCard({
  label,
  value,
  change,
  changeLabel,
  icon: Icon,
  color = 'primary',
  href,
  description,
  index = 0,
}: StatsCardProps) {
  const colors = colorConfig[color]

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className={cn(
        'bg-card rounded-2xl p-5 border border-border/50 shadow-soft',
        'hover:shadow-card hover:border-border transition-all duration-300',
        href && 'cursor-pointer hover:-translate-y-0.5'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground font-medium mb-1 truncate">{label}</p>
          <p className={cn('text-3xl font-display font-bold leading-none', colors.value)}>
            {value}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1.5">{description}</p>
          )}
        </div>
        <div className={cn('w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0', colors.bg)}>
          <Icon className={cn('w-5.5 h-5.5', colors.icon)} />
        </div>
      </div>

      {change !== undefined && (
        <div className="mt-3 pt-3 border-t border-border/40 flex items-center gap-1.5">
          {change > 0 ? (
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          ) : change < 0 ? (
            <TrendingDown className="w-3.5 h-3.5 text-red-500" />
          ) : (
            <Minus className="w-3.5 h-3.5 text-muted-foreground" />
          )}
          <span
            className={cn(
              'text-xs font-medium',
              change > 0 ? 'text-emerald-500' : change < 0 ? 'text-red-500' : 'text-muted-foreground'
            )}
          >
            {change > 0 ? '+' : ''}{change}%
          </span>
          {changeLabel && (
            <span className="text-xs text-muted-foreground">{changeLabel}</span>
          )}
        </div>
      )}
    </motion.div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}
