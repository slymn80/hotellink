'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare, Send, Search, Loader2,
  ChevronLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatRelativeDate } from '@/lib/utils'
import { toast } from 'sonner'

interface Conversation {
  partnerId: string
  partnerName: string | null
  partnerImage: string | null
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
}

interface Message {
  id: string
  content: string
  senderId: string
  createdAt: string
  sender: { id: string; name: string | null; image: string | null }
}

export default function MessagesPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [activePartner, setActivePartner] = useState<string | null>(null)
  const [activePartnerName, setActivePartnerName] = useState<string>('')
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [isMobileConvList, setIsMobileConvList] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchConversations()
    const interval = setInterval(fetchConversations, 30000)
    return () => clearInterval(interval)
  }, [])

  // Auto-open conversation from ?with=userId&name=X query params
  useEffect(() => {
    const withId = searchParams.get('with')
    const name = searchParams.get('name')
    if (withId) {
      setActivePartner(withId)
      setActivePartnerName(name ?? 'Unknown')
      setIsMobileConvList(false)
    }
  }, [searchParams])

  useEffect(() => {
    if (!activePartner) return
    fetchMessages(activePartner)
    const interval = setInterval(() => fetchMessages(activePartner), 30000)
    return () => clearInterval(interval)
  }, [activePartner])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConversations = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/messages')
      const data = await res.json()
      if (data.status === 'success') {
        setConversations(data.data.conversations ?? [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (partnerId: string) => {
    try {
      const res = await fetch(`/api/messages?with=${partnerId}`)
      const data = await res.json()
      if (data.status === 'success') {
        setMessages(data.data.items)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleSend = async () => {
    if (!newMessage.trim() || !activePartner || sending) return

    setSending(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: activePartner, content: newMessage.trim() }),
      })

      if (res.ok) {
        setNewMessage('')
        fetchMessages(activePartner)
        fetchConversations()
      } else {
        toast.error('Failed to send message')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSending(false)
    }
  }

  const openConversation = (conv: Conversation) => {
    setActivePartner(conv.partnerId)
    setActivePartnerName(conv.partnerName ?? 'Unknown')
    setIsMobileConvList(false)
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border border-border bg-card">
      {/* Conversations list */}
      <div className={`flex-shrink-0 w-full sm:w-80 border-r border-border flex flex-col ${!isMobileConvList ? 'hidden sm:flex' : 'flex'}`}>
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-foreground mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <MessageSquare className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-foreground">No messages yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Start a conversation with a hotel or candidate
              </p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.partnerId}
                onClick={() => openConversation(conv)}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                  activePartner === conv.partnerId ? 'bg-primary/5 border-r-2 border-primary' : ''
                }`}
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-ocean-600 text-white text-sm font-bold">
                  {conv.partnerName?.charAt(0) ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground truncate">{conv.partnerName ?? 'Unknown'}</p>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {formatRelativeDate(new Date(conv.lastMessageAt))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                    {conv.unreadCount > 0 && (
                      <span className="ml-2 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Message thread */}
      <div className={`flex-1 flex flex-col ${isMobileConvList ? 'hidden sm:flex' : 'flex'}`}>
        {activePartner ? (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <button
                className="sm:hidden text-muted-foreground hover:text-foreground"
                onClick={() => setIsMobileConvList(true)}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-ocean-600 text-white text-sm font-bold">
                {activePartnerName.charAt(0)}
              </div>
              <p className="font-semibold text-foreground">{activePartnerName}</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <AnimatePresence initial={false}>
                {messages.map((msg) => {
                  const isMine = msg.senderId === session?.user?.id
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                        isMine
                          ? 'bg-primary text-white rounded-tr-sm'
                          : 'bg-muted text-foreground rounded-tl-sm'
                      }`}>
                        <p>{msg.content}</p>
                        <p className={`text-xs mt-1 ${isMine ? 'text-white/70' : 'text-muted-foreground'}`}>
                          {formatRelativeDate(new Date(msg.createdAt))}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex items-center gap-3 p-4 border-t border-border">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder="Type a message..."
                className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
              <Button
                variant="gradient"
                size="sm"
                loading={sending}
                onClick={handleSend}
                disabled={!newMessage.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <MessageSquare className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-foreground">Select a conversation</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Choose a conversation from the list to start messaging
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
