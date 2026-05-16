'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import {
  Search, Building2, BadgeCheck, Star, MapPin,
  CheckCircle, XCircle, Clock, Eye, MoreVertical, Loader2,
  ChevronLeft, ChevronRight, Download, Plus, X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks'

const HOTEL_TYPES = [
  'RESORT', 'CITY_HOTEL', 'BOUTIQUE', 'APART_HOTEL',
  'THERMAL_HOTEL', 'VILLA', 'ECO_HOTEL', 'HOSTEL', 'MOTEL',
]
const STAR_RATINGS = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE']

interface Hotel {
  id: string
  name: string
  slug: string
  type: string
  starRating: string
  city: string
  country: string
  status: string
  isVerified: boolean
  isFeatured: boolean
  viewCount: number
  createdAt: string
  logoUrl: string | null
  _count: { jobs: number; reviews: number }
}

const STAR_MAP: Record<string, string> = {
  ONE: '★', TWO: '★★', THREE: '★★★', FOUR: '★★★★', FIVE: '★★★★★',
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'success' | 'warning' | 'destructive' | 'secondary' | 'info' }> = {
  VERIFIED: { label: 'Verified', variant: 'success' },
  PENDING: { label: 'Pending Review', variant: 'warning' },
  IN_REVIEW: { label: 'In Review', variant: 'info' },
  REJECTED: { label: 'Rejected', variant: 'destructive' },
  SUSPENDED: { label: 'Suspended', variant: 'destructive' },
  DRAFT: { label: 'Draft', variant: 'secondary' },
}

interface CreateForm {
  name: string; type: string; starRating: string; city: string; country: string
  email: string; phone: string; website: string; address: string
  shortDescription: string; employerEmail: string; verifyImmediately: boolean
}

const EMPTY_FORM: CreateForm = {
  name: '', type: 'CITY_HOTEL', starRating: 'FOUR', city: '', country: 'TR',
  email: '', phone: '', website: '', address: '',
  shortDescription: '', employerEmail: '', verifyImmediately: false,
}

export default function AdminHotelsPage() {
  const router = useRouter()
  const locale = useLocale()
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [actionMenu, setActionMenu] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState<CreateForm>(EMPTY_FORM)
  const [creating, setCreating] = useState(false)

  const debouncedQuery = useDebounce(query, 400)

  const fetchHotels = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (debouncedQuery) params.set('q', debouncedQuery)
      if (statusFilter) params.set('status', statusFilter)
      params.set('page', String(page))
      params.set('pageSize', '20')
      params.set('all', 'true') // Admin sees all hotels

      const res = await fetch(`/api/admin/hotels?${params.toString()}`)
      const data = await res.json()
      if (data.status === 'success') {
        setHotels(data.data.items)
        setTotal(data.data.total)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHotels()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, statusFilter, page])

  const handleVerify = async (hotelId: string) => {
    try {
      const res = await fetch(`/api/admin/hotels/${hotelId}/verify`, { method: 'POST' })
      if (res.ok) {
        toast.success('Hotel verified successfully')
        fetchHotels()
      } else {
        toast.error('Failed to verify hotel')
      }
    } catch {
      toast.error('Network error')
    }
    setActionMenu(null)
  }

  const handleReject = async (hotelId: string) => {
    const reason = prompt('Enter rejection reason:')
    if (!reason) return

    try {
      const res = await fetch(`/api/admin/hotels/${hotelId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      if (res.ok) {
        toast.success('Hotel rejected')
        fetchHotels()
      }
    } catch {
      toast.error('Failed to reject hotel')
    }
    setActionMenu(null)
  }

  const setF = (key: keyof CreateForm, val: string | boolean) =>
    setCreateForm((p) => ({ ...p, [key]: val }))

  const handleCreate = async () => {
    if (!createForm.name || !createForm.type || !createForm.city || !createForm.email) {
      toast.error('Please fill in required fields')
      return
    }
    setCreating(true)
    try {
      const res = await fetch('/api/admin/hotels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...createForm,
          employerEmail: createForm.employerEmail || undefined,
          website: createForm.website || undefined,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(`Hotel "${createForm.name}" created`)
        setShowCreate(false)
        setCreateForm(EMPTY_FORM)
        fetchHotels()
      } else {
        toast.error(data.error ?? 'Failed to create hotel')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setCreating(false)
    }
  }

  const handleToggleFeatured = async (hotel: Hotel) => {
    try {
      const res = await fetch(`/api/admin/hotels/${hotel.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !hotel.isFeatured }),
      })
      if (res.ok) {
        toast.success(`Hotel ${!hotel.isFeatured ? 'featured' : 'unfeatured'}`)
        fetchHotels()
      }
    } catch {
      toast.error('Failed to update hotel')
    }
    setActionMenu(null)
  }

  const totalPages = Math.ceil(total / 20)

  const exportCSV = async () => {
    try {
      const params = new URLSearchParams()
      if (debouncedQuery) params.set('q', debouncedQuery)
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/admin/hotels/export?${params.toString()}`)
      if (!res.ok) { toast.error('Export failed'); return }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `hotels-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Export failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hotels</h1>
          <p className="text-sm text-muted-foreground mt-1">{total.toLocaleString()} registered hotels</p>
        </div>
        <div className="flex gap-2">
          <Button variant="gradient" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowCreate(true)}>
            Create Hotel
          </Button>
          <Button variant="outline" leftIcon={<Download className="h-4 w-4" />} onClick={exportCSV}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search hotels..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1) }}
            className="w-full rounded-xl border border-border bg-card pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>

        {Object.entries(STATUS_CONFIG).map(([value, config]) => (
          <button
            key={value}
            onClick={() => { setStatusFilter(statusFilter === value ? '' : value); setPage(1) }}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === value ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {config.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Hotel</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Jobs</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Views</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Registered</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {hotels.map((hotel, i) => {
                    const statusConfig = STATUS_CONFIG[hotel.status]
                    return (
                      <motion.tr
                        key={hotel.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-ocean-600 text-white text-sm font-bold flex-shrink-0">
                              {hotel.name.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-foreground">{hotel.name}</p>
                                {hotel.isVerified && <BadgeCheck className="h-3.5 w-3.5 text-primary" />}
                                {hotel.isFeatured && <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {hotel.city}
                                <span className="ml-1 text-amber-500">
                                  {STAR_MAP[hotel.starRating]}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusConfig?.variant ?? 'secondary'} size="sm">
                            {statusConfig?.label ?? hotel.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          {hotel._count.jobs}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {hotel.viewCount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {formatDate(new Date(hotel.createdAt))}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="relative inline-block">
                            <button
                              onClick={() => setActionMenu(actionMenu === hotel.id ? null : hotel.id)}
                              className="rounded-lg p-1.5 hover:bg-muted transition-colors"
                            >
                              <MoreVertical className="h-4 w-4 text-muted-foreground" />
                            </button>
                            {actionMenu === hotel.id && (
                              <div className="absolute right-0 top-8 z-10 w-44 rounded-xl border border-border bg-card shadow-lg">
                                <div className="p-1">
                                  {hotel.status !== 'VERIFIED' && (
                                    <button
                                      onClick={() => handleVerify(hotel.id)}
                                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                                    >
                                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                                      Verify Hotel
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleReject(hotel.id)}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                                  >
                                    <XCircle className="h-4 w-4 text-destructive" />
                                    Reject
                                  </button>
                                  <button
                                    onClick={() => handleToggleFeatured(hotel)}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                                  >
                                    <Star className="h-4 w-4 text-amber-500" />
                                    {hotel.isFeatured ? 'Remove Featured' : 'Mark Featured'}
                                  </button>
                                  <button
                                    onClick={() => { router.push(`/${locale}/hotels/${hotel.slug}`); setActionMenu(null) }}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                                  >
                                    <Eye className="h-4 w-4" />
                                    View Profile
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} leftIcon={<ChevronLeft className="h-4 w-4" />}>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} rightIcon={<ChevronRight className="h-4 w-4" />}>
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {/* Create Hotel Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl"
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card p-5">
              <div>
                <h2 className="font-semibold text-foreground">Create Hotel</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Add a new hotel to the platform</p>
              </div>
              <button onClick={() => setShowCreate(false)} className="rounded-lg p-1.5 hover:bg-muted transition-colors">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Name + Type */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Hotel Name *</label>
                <input value={createForm.name} onChange={(e) => setF('name', e.target.value)}
                  placeholder="Grand Resort Antalya"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Type *</label>
                  <select value={createForm.type} onChange={(e) => setF('type', e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none">
                    {HOTEL_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Star Rating</label>
                  <select value={createForm.starRating} onChange={(e) => setF('starRating', e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none">
                    <option value="">None</option>
                    {STAR_RATINGS.map((s, i) => <option key={s} value={s}>{i + 1} Star{i > 0 ? 's' : ''}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">City *</label>
                  <input value={createForm.city} onChange={(e) => setF('city', e.target.value)}
                    placeholder="Antalya"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Country</label>
                  <input value={createForm.country} onChange={(e) => setF('country', e.target.value)}
                    placeholder="TR"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Business Email *</label>
                  <input type="email" value={createForm.email} onChange={(e) => setF('email', e.target.value)}
                    placeholder="hr@hotel.com"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Phone</label>
                  <input value={createForm.phone} onChange={(e) => setF('phone', e.target.value)}
                    placeholder="+90 xxx xxx xxxx"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Website</label>
                <input value={createForm.website} onChange={(e) => setF('website', e.target.value)}
                  placeholder="https://hotel.com"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Short Description</label>
                <textarea value={createForm.shortDescription} onChange={(e) => setF('shortDescription', e.target.value)}
                  rows={2} maxLength={300}
                  placeholder="One-liner shown in search results..."
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none" />
              </div>

              <div className="rounded-xl border border-dashed border-border p-4 space-y-3">
                <p className="text-xs font-medium text-foreground">Employer Linking (optional)</p>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Hotel Employer Email</label>
                  <input value={createForm.employerEmail} onChange={(e) => setF('employerEmail', e.target.value)}
                    type="email" placeholder="employer@example.com"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                  <p className="text-xs text-muted-foreground mt-1">User must already be registered as HOTEL_EMPLOYER</p>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={createForm.verifyImmediately}
                  onChange={(e) => setF('verifyImmediately', e.target.checked)}
                  className="rounded accent-primary" />
                <span className="text-sm text-foreground">Verify immediately (skip pending review)</span>
              </label>
            </div>

            <div className="sticky bottom-0 flex justify-end gap-2 border-t border-border bg-card p-4">
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button variant="gradient" loading={creating} onClick={handleCreate} leftIcon={<Plus className="h-4 w-4" />}>
                Create Hotel
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
