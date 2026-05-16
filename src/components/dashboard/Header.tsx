'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  User,
  Settings,
  LogOut,
  CreditCard,
  Building2,
} from 'lucide-react'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'

interface DashboardHeaderProps {
  onMenuClick?: () => void
  title?: string
  breadcrumb?: { label: string; href?: string }[]
}

export function DashboardHeader({
  onMenuClick,
  title,
  breadcrumb,
}: DashboardHeaderProps) {
  const { data: session } = useSession()
  const locale = useLocale()
  const pathname = usePathname()
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const role = session?.user?.role

  interface Notification {
    id: string
    title: string
    body: string
    isRead: boolean
    createdAt: string
    actionUrl?: string | null
  }

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!session) return
    fetch('/api/notifications?pageSize=8')
      .then((r) => r.json())
      .then((d) => {
        if (d.status === 'success') {
          setNotifications(d.data.items)
          setUnreadCount(d.data.unreadCount)
        }
      })
      .catch(() => {})
  }, [session])

  const openNotifPanel = () => {
    setNotifOpen((p) => !p)
    setProfileOpen(false)
    if (!notifOpen && unreadCount > 0) {
      fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ markAll: true }) })
        .then(() => {
          setUnreadCount(0)
          setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
        })
        .catch(() => {})
    }
  }

  const formatNotifTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'just now'
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  }

  // Extract hotelId from /hotel/[id]/... paths
  const hotelIdMatch = pathname.match(/\/hotel\/([^/]+)(?:\/|$)/)
  const hotelId =
    hotelIdMatch?.[1] &&
    !['onboarding', 'billing', 'analytics', 'jobs', 'candidates', 'applications', 'profile', 'settings', 'messages', 'notifications'].includes(hotelIdMatch[1])
      ? hotelIdMatch[1]
      : undefined

  // Role-based profile dropdown links
  const profileLinks: { icon: typeof User; label: string; href: string }[] =
    role === 'HOTEL_EMPLOYER'
      ? [
          { icon: Building2, label: 'My Hotels', href: `/${locale}/hotel` },
          { icon: Settings, label: 'Settings', href: hotelId ? `/${locale}/hotel/${hotelId}/settings` : `/${locale}/hotel` },
          ...(hotelId ? [{ icon: CreditCard, label: 'Billing', href: `/${locale}/hotel/${hotelId}/billing` }] : []),
        ]
      : role === 'HR_AGENCY'
      ? [
          { icon: User, label: 'Profile', href: `/${locale}/agency/profile` },
          { icon: Settings, label: 'Settings', href: `/${locale}/agency/settings` },
        ]
      : role === 'ADMIN' || role === 'SUPER_ADMIN'
      ? [
          { icon: Settings, label: 'Settings', href: `/${locale}/admin/settings` },
        ]
      : [
          { icon: User, label: 'Profile', href: `/${locale}/candidate/profile` },
          { icon: Settings, label: 'Settings', href: `/${locale}/candidate/settings` },
        ]

  // Role-based notifications link
  const notifHref =
    role === 'HOTEL_EMPLOYER' && hotelId
      ? `/${locale}/hotel/${hotelId}/notifications`
      : role === 'HR_AGENCY'
      ? `/${locale}/agency/messages`
      : role === 'ADMIN' || role === 'SUPER_ADMIN'
      ? `/${locale}/admin`
      : `/${locale}/candidate/notifications`

  return (
    <header className="h-16 bg-background/95 backdrop-blur-sm border-b border-border/50 flex items-center px-4 sm:px-6 gap-4 sticky top-0 z-30">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Breadcrumb / Title */}
      <div className="flex-1 min-w-0">
        {breadcrumb && breadcrumb.length > 0 ? (
          <nav className="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
            {breadcrumb.map((item, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-muted-foreground/40">/</span>}
                {item.href ? (
                  <Link href={item.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-foreground font-medium">{item.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : title ? (
          <h1 className="font-display text-lg font-semibold text-foreground truncate">{title}</h1>
        ) : null}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Search */}
        <button className="hidden sm:flex w-9 h-9 rounded-xl items-center justify-center hover:bg-muted transition-colors text-muted-foreground">
          <Search className="w-4.5 h-4.5" />
        </button>

        <ThemeToggle />
        <LanguageSwitcher />

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={openNotifPanel}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
            aria-expanded={notifOpen}
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
            )}
          </button>

          {notifOpen && (
            <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
          )}
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-popover border border-border/50 shadow-premium z-50 overflow-hidden"
                >
                  <div className="p-3 border-b border-border/50 flex items-center justify-between">
                    <span className="font-semibold text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-xs text-primary font-medium">{unreadCount} unread</span>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto scrollbar-thin">
                    {notifications.length === 0 ? (
                      <p className="text-center text-sm text-muted-foreground py-8">No notifications</p>
                    ) : notifications.map((n) => {
                      const inner = (
                        <div className={cn('flex items-start gap-2.5')}>
                          {!n.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          )}
                          <div className={cn(!n.isRead ? '' : 'ml-4')}>
                            <p className={cn('text-sm', !n.isRead ? 'font-medium' : 'text-muted-foreground')}>
                              {n.title}
                            </p>
                            {n.body && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                            )}
                            <p className="text-xs text-muted-foreground/70 mt-0.5">{formatNotifTime(n.createdAt)}</p>
                          </div>
                        </div>
                      )
                      const itemClass = cn('p-3 hover:bg-muted/50 transition-colors', !n.isRead && 'bg-primary/[0.03]')
                      return n.actionUrl ? (
                        <Link key={n.id} href={n.actionUrl} className={itemClass} onClick={() => setNotifOpen(false)}>{inner}</Link>
                      ) : (
                        <div key={n.id} className={itemClass}>{inner}</div>
                      )
                    })}
                  </div>
                  <div className="p-2 border-t border-border/50">
                    <Link
                      href={notifHref}
                      className="block text-center text-xs text-primary font-medium py-1.5 hover:underline"
                      onClick={() => setNotifOpen(false)}
                    >
                      View all notifications
                    </Link>
                  </div>
                </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen((p) => !p)
              setNotifOpen(false)
            }}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-muted transition-colors"
            aria-expanded={profileOpen}
          >
            <div className="w-7 h-7 rounded-full bg-brand-gradient flex items-center justify-center text-white text-xs font-bold">
              {session?.user?.name ? getInitials(session.user.name) : 'U'}
            </div>
            <span className="text-sm font-medium text-foreground hidden sm:block max-w-24 truncate">
              {session?.user?.name?.split(' ')[0]}
            </span>
            <ChevronDown className={cn('w-3.5 h-3.5 text-muted-foreground transition-transform', profileOpen && 'rotate-180')} />
          </button>

          {profileOpen && (
            <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
          )}
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-popover border border-border/50 shadow-premium z-50 overflow-hidden"
                >
                  {/* User info */}
                  <div className="p-3 border-b border-border/50">
                    <p className="font-medium text-sm text-foreground truncate">{session?.user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
                  </div>

                  <div className="p-1.5 space-y-0.5">
                    {profileLinks.map(({ icon: Icon, label, href }) => (
                      <Link
                        key={label}
                        href={href}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-foreground hover:bg-muted/60 transition-colors"
                      >
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        {label}
                      </Link>
                    ))}
                    <div className="border-t border-border/50 mt-1 pt-1">
                      <button
                        onClick={() => signOut({ callbackUrl: `/${locale}` })}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
