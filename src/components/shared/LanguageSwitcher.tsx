'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { ChevronDown, Globe } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧', nativeLabel: 'English' },
  { code: 'tr', label: 'Turkish', flag: '🇹🇷', nativeLabel: 'Türkçe' },
  { code: 'ru', label: 'Russian', flag: '🇷🇺', nativeLabel: 'Русский' },
] as const

interface LanguageSwitcherProps {
  variant?: 'default' | 'minimal' | 'dark'
  className?: string
}

export function LanguageSwitcher({
  variant = 'default',
  className,
}: LanguageSwitcherProps) {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const currentLang = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0]

  const handleLocaleChange = (newLocale: string) => {
    // Replace the locale segment in the pathname
    const segments = pathname.split('/')
    segments[1] = newLocale
    const newPath = segments.join('/')
    router.push(newPath)
    router.refresh()
    setIsOpen(false)
  }

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200',
          variant === 'dark'
            ? 'text-white/80 hover:text-white hover:bg-white/10'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
          'border border-transparent hover:border-border/50'
        )}
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5" />
        <span>{currentLang.flag}</span>
        <span className="hidden sm:block">{currentLang.nativeLabel}</span>
        <ChevronDown
          className={cn(
            'w-3 h-3 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className={cn(
                'absolute right-0 top-full mt-2 z-50',
                'w-48 rounded-2xl shadow-premium border border-border/50',
                'bg-popover overflow-hidden'
              )}
            >
              <div className="p-1.5 space-y-0.5">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLocaleChange(lang.code)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors duration-150',
                      lang.code === locale
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-foreground hover:bg-muted/60'
                    )}
                  >
                    <span className="text-base">{lang.flag}</span>
                    <div className="flex flex-col items-start">
                      <span className="font-medium leading-none">
                        {lang.nativeLabel}
                      </span>
                      <span className="text-xs text-muted-foreground mt-0.5">
                        {lang.label}
                      </span>
                    </div>
                    {lang.code === locale && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </button>
                ))}
              </div>

              {/* Coming soon */}
              <div className="px-3 py-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground">Coming soon:</p>
                <div className="flex items-center gap-2 mt-1 opacity-50">
                  <span>🇸🇦</span>
                  <span>🇰🇿</span>
                  <span>🇰🇬</span>
                  <span className="text-xs text-muted-foreground">+3 more</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
