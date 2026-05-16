'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { Users, Plus, Search, ChevronRight, Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Pool {
  id: string
  name: string
  description: string | null
  isPublic: boolean
  createdAt: string
}

export default function AgencyPoolsPage() {
  const router = useRouter()
  const locale = useLocale()
  const [pools, setPools] = useState<Pool[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [newPool, setNewPool] = useState({ name: '', description: '', isPublic: false })
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchPools = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/agency/pools')
      const data = await res.json()
      if (data.status === 'success') setPools(data.data.items)
    } catch {
      toast.error('Failed to load pools')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPools() }, [])

  const filtered = pools.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const createPool = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPool.name.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/agency/pools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPool),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Candidate pool created')
        setNewPool({ name: '', description: '', isPublic: false })
        setShowNew(false)
        fetchPools()
      } else {
        toast.error(data.error ?? 'Failed to create pool')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  const deletePool = async (id: string) => {
    if (!confirm('Delete this pool?')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/agency/pools/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setPools(prev => prev.filter(p => p.id !== id))
        toast.success('Pool deleted')
      } else {
        toast.error('Failed to delete pool')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Candidate Pools
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {pools.length} pool{pools.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="gradient" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowNew(!showNew)}>
          New Pool
        </Button>
      </div>

      {/* New pool form */}
      {showNew && (
        <form onSubmit={createPool} className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-3">
          <h3 className="font-semibold text-foreground">Create Candidate Pool</h3>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Pool name</label>
            <input
              type="text" value={newPool.name}
              onChange={(e) => setNewPool((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Russian-Speaking Receptionist Pool"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea
              value={newPool.description}
              onChange={(e) => setNewPool((p) => ({ ...p, description: e.target.value }))}
              placeholder="Describe the type of candidates in this pool..."
              rows={2}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none resize-none"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={newPool.isPublic}
              onChange={(e) => setNewPool((p) => ({ ...p, isPublic: e.target.checked }))} className="rounded" />
            <span className="text-sm text-foreground">Make pool public (visible to partner hotels)</span>
          </label>
          <div className="flex gap-2">
            <Button type="submit" size="sm" loading={saving}>Create Pool</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowNew(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text" placeholder="Search pools..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2.5 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold text-foreground">No pools yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Create your first candidate pool to organize talent for hotels</p>
          <Button variant="gradient" className="mt-4" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowNew(true)}>
            Create Pool
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((pool) => (
            <div key={pool.id} className="rounded-2xl border border-border bg-card p-5 hover:shadow-card transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground">{pool.name}</h3>
                    <Badge variant={pool.isPublic ? 'success' : 'secondary'} size="sm">
                      {pool.isPublic ? 'Public' : 'Private'}
                    </Badge>
                  </div>
                  {pool.description && (
                    <p className="text-sm text-muted-foreground mt-1">{pool.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Created {new Date(pool.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button variant="ghost" size="icon-sm" loading={deletingId === pool.id}
                    onClick={() => deletePool(pool.id)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button variant="outline" size="sm" rightIcon={<ChevronRight className="h-3.5 w-3.5" />}
                    onClick={() => router.push(`/${locale}/agency/pools/${pool.id}`)}>
                    View
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
