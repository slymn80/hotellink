'use client'

import { useState, useEffect } from 'react'
import { Ticket, Clock, CheckCircle2, MessageSquare, User, Loader2, ChevronDown, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface SupportTicket {
  id: string
  subject: string
  category: string | null
  priority: string
  status: string
  createdAt: string
  resolvedAt: string | null
  user: { id: string; name: string | null; email: string | null }
  _count: { replies: number }
}

interface TicketReply {
  id: string
  content: string
  isStaff: boolean
  createdAt: string
  authorId: string
}

const STATUS_CONFIG = {
  OPEN: { label: 'Open', variant: 'destructive' as const },
  IN_PROGRESS: { label: 'In Progress', variant: 'warning' as const },
  RESOLVED: { label: 'Resolved', variant: 'success' as const },
}

const PRIORITY_CONFIG = {
  HIGH: { label: 'High', color: 'text-red-600' },
  MEDIUM: { label: 'Medium', color: 'text-amber-600' },
  LOW: { label: 'Low', color: 'text-muted-foreground' },
}

const FILTERS = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED']

export default function AdminTicketsPage() {
  const [filter, setFilter] = useState('ALL')
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)
  const [replies, setReplies] = useState<Record<string, TicketReply[]>>({})
  const [loadingReplies, setLoadingReplies] = useState<string | null>(null)
  const [replyText, setReplyText] = useState<Record<string, string>>({})
  const [sendingReply, setSendingReply] = useState<string | null>(null)
  const [resolvingId, setResolvingId] = useState<string | null>(null)

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'ALL') params.set('status', filter)
      const res = await fetch(`/api/admin/tickets?${params.toString()}`)
      const data = await res.json()
      if (data.status === 'success') {
        setTickets(data.data.items)
        setTotal(data.data.total)
      }
    } catch {
      toast.error('Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTickets() }, [filter]) // eslint-disable-line react-hooks/exhaustive-deps

  const openCount = tickets.filter(t => t.status === 'OPEN').length

  const handleSelect = async (ticketId: string) => {
    if (selected === ticketId) { setSelected(null); return }
    setSelected(ticketId)
    if (!replies[ticketId]) {
      setLoadingReplies(ticketId)
      try {
        const res = await fetch(`/api/admin/tickets/${ticketId}`)
        const data = await res.json()
        if (data.status === 'success') {
          setReplies(r => ({ ...r, [ticketId]: data.data.replies }))
        }
      } finally {
        setLoadingReplies(null)
      }
    }
  }

  const handleReply = async (ticketId: string) => {
    const content = replyText[ticketId]?.trim()
    if (!content) return
    setSendingReply(ticketId)
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Reply sent')
        setReplies(r => ({ ...r, [ticketId]: [...(r[ticketId] ?? []), data.data] }))
        setReplyText(t => ({ ...t, [ticketId]: '' }))
        fetchTickets()
      } else {
        toast.error(data.error ?? 'Failed to send reply')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSendingReply(null)
    }
  }

  const handleResolve = async (ticketId: string) => {
    setResolvingId(ticketId)
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'RESOLVED' }),
      })
      if (res.ok) {
        toast.success('Ticket marked as resolved')
        fetchTickets()
      } else {
        toast.error('Failed to update ticket')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setResolvingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Ticket className="h-6 w-6 text-primary" />
            Support Tickets
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? 'Loading...' : `${openCount} open ticket${openCount !== 1 ? 's' : ''} require attention`}
          </p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-full px-4 py-1.5 text-xs font-medium transition-colors',
              filter === f ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {f === 'ALL' ? 'All' : STATUS_CONFIG[f as keyof typeof STATUS_CONFIG]?.label}
            {f === 'OPEN' && openCount > 0 && (
              <span className="ml-1.5 bg-white/20 px-1.5 rounded-full">{openCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500/40 mb-4" />
            <p className="text-sm text-muted-foreground">No tickets in this category</p>
          </div>
        ) : (
          tickets.map((ticket, i) => {
            const statusCfg = STATUS_CONFIG[ticket.status as keyof typeof STATUS_CONFIG]
            const priorityCfg = PRIORITY_CONFIG[ticket.priority as keyof typeof PRIORITY_CONFIG]
            const isOpen = selected === ticket.id
            return (
              <div key={ticket.id} className={cn(i < tickets.length - 1 && 'border-b border-border')}>
                <div
                  className={cn(
                    'flex items-start gap-4 px-5 py-4 hover:bg-muted/30 transition-colors cursor-pointer',
                    isOpen && 'bg-muted/30'
                  )}
                  onClick={() => handleSelect(ticket.id)}
                >
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground">{ticket.id.slice(-6).toUpperCase()}</span>
                          <span className={cn('text-xs font-semibold', priorityCfg?.color)}>{priorityCfg?.label}</span>
                          {ticket.category && <span className="text-xs text-muted-foreground">{ticket.category}</span>}
                        </div>
                        <p className="font-medium text-foreground mt-0.5">{ticket.subject}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {ticket.user.name ?? 'Unknown'} · {ticket.user.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {statusCfg && <Badge variant={statusCfg.variant} size="sm">{statusCfg.label}</Badge>}
                        <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', isOpen && 'rotate-180')} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground flex-shrink-0">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Expanded: replies + reply form */}
                {isOpen && (
                  <div className="px-5 pb-5 space-y-4 border-t border-border bg-muted/10">
                    {loadingReplies === ticket.id ? (
                      <div className="flex justify-center py-6">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    ) : (
                      <>
                        {(replies[ticket.id] ?? []).length > 0 && (
                          <div className="space-y-3 pt-4">
                            {replies[ticket.id].map(reply => (
                              <div key={reply.id} className={cn('rounded-xl p-3 text-sm', reply.isStaff ? 'bg-primary/10 border border-primary/20' : 'bg-background border border-border')}>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={cn('text-xs font-semibold', reply.isStaff ? 'text-primary' : 'text-foreground')}>
                                    {reply.isStaff ? 'Support Staff' : ticket.user.name ?? 'User'}
                                  </span>
                                  <span className="text-xs text-muted-foreground">{new Date(reply.createdAt).toLocaleString()}</span>
                                </div>
                                <p className="text-foreground">{reply.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        {(replies[ticket.id] ?? []).length === 0 && (
                          <p className="pt-4 text-xs text-muted-foreground italic">No replies yet.</p>
                        )}

                        {/* Reply form */}
                        <div className="flex gap-2 pt-2">
                          <textarea
                            rows={2}
                            value={replyText[ticket.id] ?? ''}
                            onChange={e => setReplyText(t => ({ ...t, [ticket.id]: e.target.value }))}
                            onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleReply(ticket.id) }}
                            placeholder="Type a reply... (Ctrl+Enter to send)"
                            className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none"
                          />
                          <div className="flex flex-col gap-2">
                            <Button size="sm" variant="gradient"
                              loading={sendingReply === ticket.id}
                              onClick={(e) => { e.stopPropagation(); handleReply(ticket.id) }}
                              leftIcon={<Send className="h-3.5 w-3.5" />}>
                              Reply
                            </Button>
                            {ticket.status !== 'RESOLVED' && (
                              <Button size="sm" variant="outline"
                                loading={resolvingId === ticket.id}
                                onClick={(e) => { e.stopPropagation(); handleResolve(ticket.id) }}>
                                <MessageSquare className="h-3.5 w-3.5 mr-1" />
                                Resolve
                              </Button>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {total > 0 && (
        <p className="text-center text-xs text-muted-foreground">{total} total tickets</p>
      )}
    </div>
  )
}
