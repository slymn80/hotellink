'use client'

import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import {
  LayoutDashboard,
  User,
  Search,
  Sparkles,
  FileText,
  Bookmark,
  MessageSquare,
  Bell,
  Settings,
  Building2,
  Briefcase,
  Users,
  BarChart3,
  CreditCard,
  ShieldCheck,
  ChevronLeft,
  LogOut,
  HelpCircle,
  Star,
  Globe2,
  Ticket,
} from 'lucide-react'
import { Logo } from '@/components/shared/Logo'
import { cn } from '@/lib/utils'
import { useSession, signOut } from 'next-auth/react'

interface SidebarProps {
  collapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
}

interface NavSection {
  title?: string
  items: NavItem[]
}

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  exact?: boolean
}

function useNavItems(locale: string, role?: string, hotelId?: string, pendingVerifications = 0): NavSection[] {
  if (!role) return []

  if (role === 'HOTEL_EMPLOYER') {
    // No hotel selected yet — show only the selector
    if (!hotelId) {
      return [
        {
          items: [
            { label: 'My Hotels', href: `/${locale}/hotel`, icon: Building2, exact: true },
            { label: 'Add Hotel', href: `/${locale}/hotel/onboarding`, icon: LayoutDashboard },
          ],
        },
      ]
    }

    const h = `/${locale}/hotel/${hotelId}`
    return [
      {
        items: [
          { label: 'Dashboard', href: h, icon: LayoutDashboard, exact: true },
          { label: 'Job Postings', href: `${h}/jobs`, icon: Briefcase },
          { label: 'AI Match', href: `${h}/ai-match`, icon: Sparkles, badge: 'AI' },
          { label: 'Candidates', href: `${h}/candidates`, icon: Users },
          { label: 'Applications', href: `${h}/applications`, icon: FileText, badge: 'new' },
        ],
      },
      {
        title: 'Hotel',
        items: [
          { label: 'Hotel Profile', href: `${h}/profile`, icon: Building2 },
          { label: 'Analytics', href: `${h}/analytics`, icon: BarChart3 },
          { label: 'Messages', href: `/${locale}/messages`, icon: MessageSquare },
        ],
      },
      {
        title: 'Account',
        items: [
          { label: 'Switch Hotel', href: `/${locale}/hotel`, icon: Building2 },
          { label: 'Subscription', href: `${h}/billing`, icon: CreditCard },
          { label: 'Notifications', href: `${h}/notifications`, icon: Bell },
          { label: 'Settings', href: `${h}/settings`, icon: Settings },
        ],
      },
    ]
  }

  if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
    return [
      {
        items: [
          { label: 'Overview', href: `/${locale}/admin`, icon: LayoutDashboard, exact: true },
          { label: 'Users', href: `/${locale}/admin/users`, icon: Users },
          { label: 'Hotels', href: `/${locale}/admin/hotels`, icon: Building2 },
          { label: 'Jobs', href: `/${locale}/admin/jobs`, icon: Briefcase },
        ],
      },
      {
        title: 'Moderation',
        items: [
          { label: 'Verifications', href: `/${locale}/admin/verifications`, icon: ShieldCheck, badge: pendingVerifications > 0 ? pendingVerifications : undefined },
          { label: 'Support Tickets', href: `/${locale}/admin/tickets`, icon: Ticket },
          { label: 'Translations', href: `/${locale}/admin/content`, icon: Globe2 },
        ],
      },
      {
        title: 'Finance',
        items: [
          { label: 'Revenue', href: `/${locale}/admin/payments`, icon: CreditCard },
          { label: 'Analytics', href: `/${locale}/admin/analytics`, icon: BarChart3 },
          { label: 'Settings', href: `/${locale}/admin/settings`, icon: Settings },
        ],
      },
    ]
  }

  if (role === 'HR_AGENCY') {
    return [
      {
        items: [
          { label: 'Dashboard', href: `/${locale}/agency`, icon: LayoutDashboard, exact: true },
          { label: 'Candidate Pools', href: `/${locale}/agency/pools`, icon: Users },
          { label: 'Applications', href: `/${locale}/agency/applications`, icon: FileText },
          { label: 'Hotels', href: `/${locale}/agency/hotels`, icon: Building2 },
        ],
      },
      {
        title: 'Account',
        items: [
          { label: 'Profile', href: `/${locale}/agency/profile`, icon: User },
          { label: 'Analytics', href: `/${locale}/agency/analytics`, icon: BarChart3 },
          { label: 'Messages', href: `/${locale}/agency/messages`, icon: MessageSquare },
          { label: 'Settings', href: `/${locale}/agency/settings`, icon: Settings },
        ],
      },
    ]
  }

  // Default: CANDIDATE
  return [
    {
      items: [
        { label: 'Dashboard', href: `/${locale}/candidate`, icon: LayoutDashboard, exact: true },
        { label: 'Find Jobs', href: `/${locale}/candidate/jobs`, icon: Search },
        { label: 'AI Match', href: `/${locale}/candidate/ai-match`, icon: Sparkles, badge: 'AI' },
        { label: 'Applications', href: `/${locale}/candidate/applications`, icon: FileText },
        { label: 'Saved Jobs', href: `/${locale}/candidate/saved`, icon: Bookmark },
      ],
    },
    {
      title: 'Profile',
      items: [
        { label: 'My Profile', href: `/${locale}/candidate/profile`, icon: User },
        { label: 'Documents', href: `/${locale}/candidate/documents`, icon: ShieldCheck },
        { label: 'Work Permit', href: `/${locale}/candidate/work-permit`, icon: Globe2 },
        { label: 'Favorite Hotels', href: `/${locale}/candidate/favorites`, icon: Star },
      ],
    },
    {
      title: 'Communication',
      items: [
        { label: 'Messages', href: `/${locale}/messages`, icon: MessageSquare, badge: 'msg' },
        { label: 'Notifications', href: `/${locale}/candidate/notifications`, icon: Bell },
        { label: 'Settings', href: `/${locale}/candidate/settings`, icon: Settings },
      ],
    },
  ]
}

export function Sidebar({ collapsed = false, onCollapse }: SidebarProps) {
  const locale = useLocale()
  const pathname = usePathname()
  const { data: session } = useSession()
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [pendingVerifications, setPendingVerifications] = useState(0)

  useEffect(() => {
    fetch('/api/messages/unread')
      .then((r) => r.json())
      .then((d) => { if (typeof d.count === 'number') setUnreadMessages(d.count) })
      .catch(() => {})
  }, [pathname])

  const role = session?.user?.role

  useEffect(() => {
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') return
    fetch('/api/admin/verifications?status=PENDING&pageSize=1')
      .then((r) => r.json())
      .then((d) => { if (typeof d.data?.total === 'number') setPendingVerifications(d.data.total) })
      .catch(() => {})
  }, [role, pathname])

  // Extract hotelId from paths like /en/hotel/[hotelId]/...
  const hotelIdMatch = pathname.match(/\/hotel\/([^/]+)(?:\/|$)/)
  const hotelId = hotelIdMatch?.[1] && hotelIdMatch[1] !== 'onboarding' ? hotelIdMatch[1] : undefined
  const sections = useNavItems(locale, role, hotelId, pendingVerifications)

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-sidebar transition-all duration-300 border-r border-sidebar-border',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-3 h-16 border-b border-sidebar-border flex-shrink-0">
        {!collapsed && <Logo href={`/${locale}`} size="sm" />}
        {onCollapse && (
          <button
            onClick={() => onCollapse(!collapsed)}
            className={cn(
              'w-7 h-7 rounded-lg flex items-center justify-center hover:bg-sidebar-accent transition-colors text-muted-foreground flex-shrink-0',
              collapsed && 'mx-auto'
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft className={cn('w-4 h-4 transition-transform duration-200', collapsed && 'rotate-180')} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-6">
        {sections.map((section, si) => (
          <div key={si} className="space-y-1">
            {section.title && !collapsed && (
              <div className="px-3 text-2xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                {section.title}
              </div>
            )}
            {section.items.map((item) => {
              const active = isActive(item.href, item.exact)
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 group relative',
                    active
                      ? 'bg-sidebar-primary/10 text-sidebar-primary'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  {/* Active indicator */}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-sidebar-primary rounded-r-full" />
                  )}

                  <Icon
                    className={cn(
                      'flex-shrink-0 transition-colors',
                      collapsed ? 'w-5 h-5 mx-auto' : 'w-4.5 h-4.5',
                      active ? 'text-sidebar-primary' : 'text-muted-foreground group-hover:text-foreground'
                    )}
                  />

                  {!collapsed && (
                    <>
                      <span className="ml-3 flex-1 truncate">{item.label}</span>
                      {item.badge !== undefined && (() => {
                        const count = item.badge === 'msg' ? unreadMessages : item.badge
                        if (item.badge === 'msg' && unreadMessages === 0) return null
                        return (
                          <span
                            className={cn(
                              'ml-auto text-xs font-medium px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
                              typeof count === 'number'
                                ? 'bg-primary/15 text-primary'
                                : 'bg-gold-100 text-gold-700 dark:bg-gold-900/20 dark:text-gold-400'
                            )}
                          >
                            {count}
                          </span>
                        )
                      })()}
                    </>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-1 flex-shrink-0">
        <Link
          href={`/${locale}/help`}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-all duration-150"
        >
          <HelpCircle className={cn('flex-shrink-0', collapsed ? 'w-5 h-5 mx-auto' : 'w-4 h-4')} />
          {!collapsed && <span>Help Center</span>}
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: `/${locale}` })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-150"
        >
          <LogOut className={cn('flex-shrink-0', collapsed ? 'w-5 h-5 mx-auto' : 'w-4 h-4')} />
          {!collapsed && <span>Sign Out</span>}
        </button>

        {/* User info */}
        {!collapsed && session?.user && (
          <div className="flex items-center gap-3 px-3 pt-3 mt-1 border-t border-sidebar-border">
            <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {session.user.name?.charAt(0) ?? 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-foreground truncate">
                {session.user.name}
              </div>
              <div className="text-2xs text-muted-foreground truncate">{session.user.email}</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
