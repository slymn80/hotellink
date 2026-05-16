'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu,
  X,
  ChevronDown,
  Building2,
  Users,
  Briefcase,
  BarChart3,
  ShieldCheck,
  BookOpen,
} from 'lucide-react'
import { Logo } from '@/components/shared/Logo'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const solutionsLinks = [
  {
    icon: Building2,
    label: 'For Hotels',
    desc: 'Hire international staff',
    href: '/hotels',
    color: 'text-blue-500',
  },
  {
    icon: Users,
    label: 'For Candidates',
    desc: 'Find hospitality jobs',
    href: '/jobs',
    color: 'text-emerald-500',
  },
  {
    icon: Briefcase,
    label: 'For HR Agencies',
    desc: 'Manage placements',
    href: '/agencies',
    color: 'text-purple-500',
  },
]

const resourceLinks = [
  {
    icon: BookOpen,
    label: 'Work Permit Guide',
    desc: 'Step-by-step process',
    href: '/guide',
    color: 'text-orange-500',
  },
  {
    icon: BarChart3,
    label: 'Market Insights',
    desc: 'Turkey hospitality data',
    href: '/insights',
    color: 'text-blue-500',
  },
  {
    icon: ShieldCheck,
    label: 'Verified Hotels',
    desc: 'How we verify',
    href: '/verification',
    color: 'text-emerald-500',
  },
]

export function Navbar() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const navLinks = [
    { label: t('jobs'), href: `/${locale}/jobs` },
    { label: t('hotels'), href: `/${locale}/hotels` },
    { label: 'Solutions', href: '#', hasDropdown: 'solutions' },
    { label: t('pricing'), href: `/${locale}/pricing` },
  ]

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-background/95 backdrop-blur-md shadow-soft border-b border-border/50'
            : 'bg-transparent'
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <Logo
              variant={scrolled ? 'default' : 'white'}
              href={`/${locale}`}
            />

            {/* Desktop Nav */}
            <div ref={dropdownRef} className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <div key={link.label} className="relative">
                  {link.hasDropdown ? (
                    <button
                      onClick={() =>
                        setActiveDropdown(
                          activeDropdown === link.hasDropdown
                            ? null
                            : link.hasDropdown ?? null
                        )
                      }
                      className={cn(
                        'flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                        scrolled
                          ? 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      )}
                    >
                      {link.label}
                      <ChevronDown
                        className={cn(
                          'w-3.5 h-3.5 transition-transform duration-200',
                          activeDropdown === link.hasDropdown && 'rotate-180'
                        )}
                      />
                    </button>
                  ) : (
                    <Link
                      href={link.href}
                      className={cn(
                        'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                        scrolled
                          ? 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      )}
                    >
                      {link.label}
                    </Link>
                  )}

                  {/* Dropdown */}
                  <AnimatePresence>
                    {link.hasDropdown && activeDropdown === link.hasDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 rounded-2xl bg-popover border border-border/50 shadow-premium overflow-hidden"
                      >
                        <div className="p-2 space-y-1">
                          {(link.hasDropdown === 'solutions'
                            ? solutionsLinks
                            : resourceLinks
                          ).map((item) => (
                            <Link
                              key={item.label}
                              href={item.href}
                              onClick={() => setActiveDropdown(null)}
                              className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/60 transition-colors duration-150 group"
                            >
                              <div className={cn('p-2 rounded-lg bg-muted', item.color)}>
                                <item.icon className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                  {item.label}
                                </div>
                                <div className="text-xs text-muted-foreground">{item.desc}</div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Right actions */}
            <div className="hidden lg:flex items-center gap-2">
              <LanguageSwitcher variant={scrolled ? 'default' : 'dark'} />
              <ThemeToggle
                className={scrolled ? '' : 'text-white/80 hover:text-white hover:bg-white/10'}
              />
              <Link href={`/${locale}/login`}>
                <Button
                  variant={scrolled ? 'outline' : 'glass'}
                  size="sm"
                  className={!scrolled ? 'border-white/30 text-white' : ''}
                >
                  {t('login')}
                </Button>
              </Link>
              <Link href={`/${locale}/register`}>
                <Button size="sm" variant="gradient">
                  {t('register')}
                </Button>
              </Link>
            </div>

            {/* Mobile hamburger */}
            <div className="flex items-center gap-2 lg:hidden">
              <LanguageSwitcher variant={scrolled ? 'default' : 'dark'} />
              <button
                onClick={() => setMobileOpen((prev) => !prev)}
                className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center transition-all',
                  scrolled
                    ? 'text-foreground hover:bg-muted'
                    : 'text-white hover:bg-white/10'
                )}
                aria-label="Toggle mobile menu"
                aria-expanded={mobileOpen}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {mobileOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <X className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Menu className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-40 bg-background lg:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 h-16 border-b border-border/50">
              <Logo href={`/${locale}`} />
              <button
                onClick={() => setMobileOpen(false)}
                className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto h-[calc(100vh-4rem)] p-4 space-y-2">
              {navLinks.map((link) => (
                <div key={link.label}>
                  <Link
                    href={link.hasDropdown ? '#' : link.href}
                    onClick={() => !link.hasDropdown && setMobileOpen(false)}
                    className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-foreground font-medium hover:bg-muted/60 transition-colors"
                  >
                    {link.label}
                    {link.hasDropdown && (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Link>

                  {link.hasDropdown === 'solutions' && (
                    <div className="ml-4 mt-1 space-y-1">
                      {solutionsLinks.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-muted/60 transition-colors"
                        >
                          <item.icon className={cn('w-4 h-4', item.color)} />
                          <div>
                            <div className="text-sm font-medium">{item.label}</div>
                            <div className="text-xs text-muted-foreground">{item.desc}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="pt-4 border-t border-border/50 space-y-3">
                <ThemeToggle variant="full" className="w-full justify-center" />
                <Link
                  href={`/${locale}/login`}
                  onClick={() => setMobileOpen(false)}
                >
                  <Button variant="outline" className="w-full" size="lg">
                    {t('login')}
                  </Button>
                </Link>
                <Link
                  href={`/${locale}/register`}
                  onClick={() => setMobileOpen(false)}
                >
                  <Button variant="gradient" className="w-full" size="lg">
                    {t('register')}
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
