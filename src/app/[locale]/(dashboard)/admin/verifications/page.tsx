'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Clock, CheckCircle, XCircle, Building2,
  User, FileText, Loader2, ChevronDown, ChevronUp, ExternalLink, Eye,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatRelativeDate } from '@/lib/utils'
import { toast } from 'sonner'

interface Verification {
  id: string
  type: string
  status: string
  entityId: string
  entityType: string
  notes: string | null
  submittedAt: string
  reviewedAt: string | null
  documents: string[]
  hotel: { name: string; city: string; email: string | null } | null
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'warning' | 'info' | 'success' | 'destructive' }> = {
  PENDING: { label: 'Pending', variant: 'warning' },
  IN_REVIEW: { label: 'In Review', variant: 'info' },
  APPROVED: { label: 'Approved', variant: 'success' },
  REJECTED: { label: 'Rejected', variant: 'destructive' },
}

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
  HOTEL: { label: 'Hotel', icon: <Building2 className="h-4 w-4" /> },
  CANDIDATE: { label: 'Candidate', icon: <User className="h-4 w-4" /> },
  AGENCY: { label: 'Agency', icon: <FileText className="h-4 w-4" /> },
}

export default function AdminVerificationsPage() {
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('PENDING')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [processing, setProcessing] = useState<string | null>(null)

  // Reject dialog state
  const [rejectTarget, setRejectTarget] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejecting, setRejecting] = useState(false)

  const fetchVerifications = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/admin/verifications?${params.toString()}`)
      const data = await res.json()
      if (data.status === 'success') {
        setVerifications(data.data.items)
        setTotal(data.data.total)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVerifications()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  const handleMarkInReview = async (verificationId: string) => {
    setProcessing(verificationId)
    try {
      const res = await fetch(`/api/admin/verifications/${verificationId}/review`, { method: 'POST' })
      if (res.ok) {
        toast.success('Marked as in review')
        fetchVerifications()
      } else {
        toast.error('Failed to update status')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setProcessing(null)
    }
  }

  const handleApprove = async (verificationId: string) => {
    setProcessing(verificationId)
    try {
      const res = await fetch(`/api/admin/verifications/${verificationId}/approve`, { method: 'POST' })
      if (res.ok) {
        toast.success('Verification approved — hotel is now live')
        fetchVerifications()
      } else {
        toast.error('Failed to approve verification')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setProcessing(null)
    }
  }

  const openRejectDialog = (verificationId: string) => {
    setRejectTarget(verificationId)
    setRejectReason('')
  }

  const closeRejectDialog = () => {
    setRejectTarget(null)
    setRejectReason('')
  }

  const submitReject = async () => {
    if (!rejectTarget || !rejectReason.trim()) return
    setRejecting(true)
    try {
      const res = await fetch(`/api/admin/verifications/${rejectTarget}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason.trim() }),
      })
      if (res.ok) {
        toast.success('Verification rejected — hotel employer has been notified')
        closeRejectDialog()
        fetchVerifications()
      } else {
        toast.error('Failed to reject verification')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setRejecting(false)
    }
  }

  const pendingCount = verifications.filter(v => v.status === 'PENDING').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Verifications</h1>
          <p className="text-sm text-muted-foreground mt-1">{total} items in queue</p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="warning" className="text-sm px-3 py-1.5">
            <Clock className="mr-1.5 h-4 w-4" />
            {pendingCount} pending review
          </Badge>
        )}
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(STATUS_CONFIG).map(([value, config]) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === value ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {config.label}
          </button>
        ))}
        <button
          onClick={() => setStatusFilter('')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            statusFilter === '' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          All
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : verifications.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <Shield className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold text-foreground">No verifications</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {statusFilter === 'PENDING' ? 'All caught up! No pending verifications.' : 'No verifications match the selected filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {verifications.map((v, i) => {
              const statusConfig = STATUS_CONFIG[v.status] ?? { label: v.status, variant: 'warning' as const }
              const typeConfig = TYPE_CONFIG[v.type] ?? { label: v.type, icon: <FileText className="h-4 w-4" /> }
              const isExpanded = expanded === v.id
              const canAct = v.status === 'PENDING' || v.status === 'IN_REVIEW'

              return (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-2xl border border-border bg-card overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary flex-shrink-0">
                          {typeConfig.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground">
                              {typeConfig.label} Verification
                            </p>
                            <Badge variant={statusConfig.variant} size="sm">{statusConfig.label}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {v.hotel ? (
                              <span className="font-medium text-foreground">{v.hotel.name}</span>
                            ) : (
                              <span>ID: {v.entityId.slice(0, 8)}...</span>
                            )}
                            {v.hotel?.city && <span> · {v.hotel.city}</span>}
                            {' · '}
                            Submitted {formatRelativeDate(new Date(v.submittedAt))}
                          </p>
                          {v.notes && v.status === 'REJECTED' && (
                            <p className="text-xs text-destructive mt-1">Rejection reason: {v.notes}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                        {v.status === 'PENDING' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950/30"
                            loading={processing === v.id}
                            onClick={() => handleMarkInReview(v.id)}
                            leftIcon={<Eye className="h-4 w-4" />}
                          >
                            Review
                          </Button>
                        )}
                        {canAct && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950/30"
                              loading={processing === v.id}
                              onClick={() => handleApprove(v.id)}
                              leftIcon={<CheckCircle className="h-4 w-4" />}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive border-destructive/30 hover:bg-destructive/10"
                              disabled={processing === v.id}
                              onClick={() => openRejectDialog(v.id)}
                              leftIcon={<XCircle className="h-4 w-4" />}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        <button
                          onClick={() => setExpanded(isExpanded ? null : v.id)}
                          className="rounded-lg p-1.5 hover:bg-muted transition-colors"
                        >
                          {isExpanded
                            ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          }
                        </button>
                      </div>
                    </div>

                    {/* Expanded details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 overflow-hidden"
                        >
                          <div className="rounded-xl bg-muted/50 p-4 space-y-3">
                            {v.hotel && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Hotel Details</p>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div><span className="text-muted-foreground">Name: </span><span className="font-medium">{v.hotel.name}</span></div>
                                  <div><span className="text-muted-foreground">City: </span><span className="font-medium">{v.hotel.city}</span></div>
                                  {v.hotel.email && <div className="col-span-2"><span className="text-muted-foreground">Email: </span><span className="font-medium">{v.hotel.email}</span></div>}
                                </div>
                              </div>
                            )}

                            {v.documents.length > 0 ? (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                                  Submitted Documents ({v.documents.length})
                                </p>
                                <ul className="space-y-1.5">
                                  {v.documents.map((url, idx) => (
                                    <li key={idx}>
                                      <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-primary hover:underline break-all"
                                      >
                                        <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                                        Document {idx + 1}
                                        <span className="text-xs text-muted-foreground truncate max-w-xs">{url}</span>
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground italic">No documents submitted.</p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Reject dialog */}
      <AnimatePresence>
        {rejectTarget && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={closeRejectDialog}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive flex-shrink-0">
                  <XCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Reject Verification</h3>
                  <p className="text-xs text-muted-foreground">The hotel employer will be notified with this reason.</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Rejection Reason <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g. Trade registry certificate is expired. Please provide a valid document issued within the last 6 months."
                    rows={4}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-destructive focus:outline-none resize-none"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground mt-1">{rejectReason.length} characters</p>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={closeRejectDialog}
                    disabled={rejecting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    loading={rejecting}
                    disabled={!rejectReason.trim()}
                    onClick={submitReject}
                    leftIcon={<XCircle className="h-4 w-4" />}
                  >
                    Reject & Notify
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
