'use client'

import { useState, useEffect } from 'react'
import { Bell, CheckCheck, FileText, MessageSquare, ShieldCheck, Users, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn, formatRelativeDate } from '@/lib/utils'
import { toast } from 'sonner'

interface Notification {
  id: string
  type: string
  title: string
  body: string
  isRead: boolean
  createdAt: string
}

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  APPLICATION_RECEIVED: FileText,
  APPLICATION_STATUS_UPDATED: FileText,
  MESSAGE_RECEIVED: MessageSquare,
  DOCUMENT_VERIFIED: ShieldCheck,
  HOTEL_VERIFIED: ShieldCheck,
  SUBSCRIPTION_EXPIRING: Briefcase,
  PROFILE_VIEWED: Users,
}

export default function HotelNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      const data = await res.json()
      if (data.status === 'success') {
        setNotifications(data.data.items)
        setUnreadCount(data.data.unreadCount)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
      toast.success('All notifications marked as read')
    } catch {
      toast.error('Failed to update notifications')
    }
  }

  const markRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] }),
      })
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
      setUnreadCount((c) => Math.max(0, c - 1))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} leftIcon={<CheckCheck className="h-4 w-4" />}>
            Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-border">
          <Bell className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-foreground">No notifications yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            We&apos;ll notify you about new applications, messages, and hotel updates.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {notifications.map((notif, i) => {
            const Icon = typeIcons[notif.type] ?? Bell
            return (
              <div
                key={notif.id}
                onClick={() => !notif.isRead && markRead(notif.id)}
                className={cn(
                  'flex items-start gap-4 px-5 py-4 transition-colors',
                  i < notifications.length - 1 && 'border-b border-border',
                  !notif.isRead ? 'bg-primary/3 cursor-pointer hover:bg-primary/5' : 'hover:bg-muted/30'
                )}
              >
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                  notif.isRead ? 'bg-muted' : 'bg-primary/10'
                )}>
                  <Icon className={cn('h-5 w-5', notif.isRead ? 'text-muted-foreground' : 'text-primary')} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn('text-sm', !notif.isRead && 'font-semibold text-foreground')}>
                      {notif.title}
                    </p>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                  {notif.body && (
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{notif.body}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatRelativeDate(new Date(notif.createdAt))}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
