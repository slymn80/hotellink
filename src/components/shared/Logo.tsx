import { cn } from '@/lib/utils'
import Link from 'next/link'

interface LogoProps {
  className?: string
  variant?: 'default' | 'white' | 'dark'
  showTagline?: boolean
  href?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({
  className,
  variant = 'default',
  showTagline = false,
  href = '/',
  size = 'md',
}: LogoProps) {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
  }

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  }

  const logoContent = (
    <div className={cn('flex items-center gap-2.5', className)}>
      {/* Logo Mark */}
      <div
        className={cn(
          'relative flex items-center justify-center rounded-xl flex-shrink-0',
          sizeClasses[size],
          'aspect-square',
          variant === 'white'
            ? 'bg-white/20 backdrop-blur-sm'
            : 'bg-brand-gradient'
        )}
      >
        {/* H letter with link chain */}
        <svg
          viewBox="0 0 32 32"
          fill="none"
          className="w-full h-full p-1.5"
          aria-hidden="true"
        >
          {/* Hotel H */}
          <path
            d="M6 6v20M6 16h12M18 6v20"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Link chain */}
          <circle cx="24" cy="12" r="4" stroke="white" strokeWidth="2" fill="none" />
          <circle cx="24" cy="22" r="4" stroke="white" strokeWidth="2" fill="none" />
          <line x1="24" y1="16" x2="24" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      {/* Word mark */}
      <div className="flex flex-col leading-none">
        <span
          className={cn(
            'font-display font-bold tracking-tight leading-none',
            textSizes[size],
            variant === 'white'
              ? 'text-white'
              : 'text-foreground'
          )}
        >
          Hotel
          <span
            className={cn(
              variant === 'white'
                ? 'text-white/80'
                : 'text-primary'
            )}
          >
            Link
          </span>
        </span>
        {showTagline && (
          <span
            className={cn(
              'text-2xs font-medium tracking-wide mt-0.5',
              variant === 'white'
                ? 'text-white/50'
                : 'text-muted-foreground'
            )}
          >
            HOSPITALITY JOBS IN TÜRKİYE
          </span>
        )}
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-xl">
        {logoContent}
      </Link>
    )
  }

  return logoContent
}
