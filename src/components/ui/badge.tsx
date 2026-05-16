import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-all duration-200 select-none',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary border border-primary/20',
        secondary: 'bg-secondary text-secondary-foreground border border-secondary',
        destructive: 'bg-destructive/10 text-destructive border border-destructive/20',
        outline: 'border border-input text-foreground',
        success: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
        warning: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
        info: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
        gold: 'bg-gold-50 text-gold-700 border border-gold-200 dark:bg-gold-900/20 dark:text-gold-400 dark:border-gold-800',
        verified: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400',
        featured: 'bg-gradient-to-r from-gold-50 to-amber-50 text-gold-700 border border-gold-200 dark:from-gold-900/20 dark:to-amber-900/20 dark:text-gold-400',
        premium: 'bg-gradient-to-r from-brand-50 to-ocean-50 text-brand-700 border border-brand-200 dark:from-brand-900/20 dark:text-brand-400',
        ghost: 'bg-muted/50 text-muted-foreground',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-2xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
  dotColor?: string
}

function Badge({
  className,
  variant,
  size,
  dot,
  dotColor,
  children,
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full flex-shrink-0',
            dotColor ?? 'bg-current'
          )}
        />
      )}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
