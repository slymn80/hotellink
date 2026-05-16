'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Search, Users, Filter, MoreVertical, UserCheck, UserX,
  Shield, Building2, Briefcase, Loader2, ChevronLeft, ChevronRight,
  Download,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks'

interface User {
  id: string
  name: string | null
  email: string
  role: string
  status: string
  createdAt: string
  lastLoginAt: string | null
  image: string | null
}

const ROLE_CONFIG: Record<string, { label: string; variant: 'default' | 'info' | 'success' | 'warning' | 'gold' | 'premium' }> = {
  CANDIDATE: { label: 'Candidate', variant: 'default' },
  HOTEL_EMPLOYER: { label: 'Hotel', variant: 'info' },
  HR_AGENCY: { label: 'Agency', variant: 'warning' },
  ADMIN: { label: 'Admin', variant: 'gold' },
  SUPER_ADMIN: { label: 'Super Admin', variant: 'premium' },
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'success' | 'warning' | 'destructive' | 'secondary' }> = {
  ACTIVE: { label: 'Active', variant: 'success' },
  INACTIVE: { label: 'Inactive', variant: 'secondary' },
  SUSPENDED: { label: 'Suspended', variant: 'destructive' },
  PENDING_VERIFICATION: { label: 'Pending', variant: 'warning' },
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [actionMenu, setActionMenu] = useState<string | null>(null)

  const debouncedQuery = useDebounce(query, 400)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (debouncedQuery) params.set('q', debouncedQuery)
      if (roleFilter) params.set('role', roleFilter)
      if (statusFilter) params.set('status', statusFilter)
      params.set('page', String(page))
      params.set('pageSize', '20')

      const res = await fetch(`/api/admin/users?${params.toString()}`)
      const data = await res.json()
      if (data.status === 'success') {
        setUsers(data.data.items)
        setTotal(data.data.total)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, roleFilter, statusFilter, page])

  const handleSuspend = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'SUSPENDED' }),
      })
      if (res.ok) {
        toast.success('User suspended')
        fetchUsers()
      }
    } catch {
      toast.error('Failed to suspend user')
    }
    setActionMenu(null)
  }

  const handleActivate = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACTIVE' }),
      })
      if (res.ok) {
        toast.success('User activated')
        fetchUsers()
      }
    } catch {
      toast.error('Failed to activate user')
    }
    setActionMenu(null)
  }

  const totalPages = Math.ceil(total / 20)

  const exportCSV = async () => {
    try {
      const params = new URLSearchParams()
      if (debouncedQuery) params.set('q', debouncedQuery)
      if (roleFilter) params.set('role', roleFilter)
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/admin/users/export?${params.toString()}`)
      if (!res.ok) { toast.error('Export failed'); return }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `users-${new Date().toISOString().slice(0, 10)}.csv`
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
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">{total.toLocaleString()} total users</p>
        </div>
        <Button variant="outline" leftIcon={<Download className="h-4 w-4" />} onClick={exportCSV}>
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1) }}
            className="w-full rounded-xl border border-border bg-card pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
          className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
        >
          <option value="">All Roles</option>
          <option value="CANDIDATE">Candidate</option>
          <option value="HOTEL_EMPLOYER">Hotel Employer</option>
          <option value="HR_AGENCY">HR Agency</option>
          <option value="ADMIN">Admin</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="PENDING_VERIFICATION">Pending Verification</option>
        </select>
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Joined</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Login</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((user, i) => {
                    const roleConfig = ROLE_CONFIG[user.role]
                    const statusConfig = STATUS_CONFIG[user.status]
                    return (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-ocean-600 text-white text-xs font-bold flex-shrink-0">
                              {user.name?.charAt(0) ?? user.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{user.name ?? '—'}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={roleConfig?.variant ?? 'default'} size="sm">
                            {roleConfig?.label ?? user.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusConfig?.variant ?? 'secondary'} size="sm" dot>
                            {statusConfig?.label ?? user.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {formatDate(new Date(user.createdAt))}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {user.lastLoginAt ? formatDate(new Date(user.lastLoginAt)) : '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="relative inline-block">
                            <button
                              onClick={() => setActionMenu(actionMenu === user.id ? null : user.id)}
                              className="rounded-lg p-1.5 hover:bg-muted transition-colors"
                            >
                              <MoreVertical className="h-4 w-4 text-muted-foreground" />
                            </button>
                            {actionMenu === user.id && (
                              <div className="absolute right-0 top-8 z-10 w-40 rounded-xl border border-border bg-card shadow-lg">
                                <div className="p-1">
                                  {user.status !== 'ACTIVE' && (
                                    <button
                                      onClick={() => handleActivate(user.id)}
                                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                                    >
                                      <UserCheck className="h-4 w-4 text-emerald-500" />
                                      Activate
                                    </button>
                                  )}
                                  {user.status !== 'SUSPENDED' && (
                                    <button
                                      onClick={() => handleSuspend(user.id)}
                                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                                    >
                                      <UserX className="h-4 w-4 text-destructive" />
                                      Suspend
                                    </button>
                                  )}
                                  <button
                                    onClick={() => setActionMenu(null)}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                                  >
                                    <Shield className="h-4 w-4" />
                                    View Details
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    leftIcon={<ChevronLeft className="h-4 w-4" />}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    rightIcon={<ChevronRight className="h-4 w-4" />}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
