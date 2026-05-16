'use client'

import { useState, useEffect } from 'react'
import { Globe2, Search, Edit2, Save, X, Plus, Loader2, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const LOCALES = ['en', 'tr', 'ru']

interface TranslationRow {
  key: string
  namespace: string
  en?: string
  tr?: string
  ru?: string
}

const EMPTY_NEW_KEY = { key: '', namespace: 'common', values: { en: '', tr: '', ru: '' } as Record<string, string> }

export default function AdminContentPage() {
  const [translations, setTranslations] = useState<TranslationRow[]>([])
  const [namespaces, setNamespaces] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [namespaceFilter, setNamespaceFilter] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newKey, setNewKey] = useState(EMPTY_NEW_KEY)
  const [creatingKey, setCreatingKey] = useState(false)

  const fetchTranslations = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (namespaceFilter) params.set('namespace', namespaceFilter)
      if (search) params.set('q', search)
      const res = await fetch(`/api/admin/content?${params.toString()}`)
      const data = await res.json()
      if (data.status === 'success') {
        setTranslations(data.data.items)
        setNamespaces(data.data.namespaces)
      }
    } catch {
      toast.error('Failed to load translations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTranslations() }, [namespaceFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  // Client-side search filter (avoids extra fetches while typing)
  const filtered = translations.filter(t => {
    if (!search) return true
    const q = search.toLowerCase()
    return t.key.includes(q) || t.namespace.includes(q) ||
      LOCALES.some(l => (t[l as keyof TranslationRow] as string ?? '').toLowerCase().includes(q))
  })

  const startEdit = (item: TranslationRow) => {
    setEditing(`${item.namespace}::${item.key}`)
    const vals: Record<string, string> = {}
    LOCALES.forEach(l => { vals[l] = (item[l as keyof TranslationRow] as string) ?? '' })
    setEditValues(vals)
  }

  const saveEdit = async (item: TranslationRow) => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: item.key, namespace: item.namespace, values: editValues }),
      })
      if (res.ok) {
        setTranslations(prev => prev.map(t =>
          t.key === item.key && t.namespace === item.namespace ? { ...t, ...editValues } : t
        ))
        setEditing(null)
        toast.success('Translation saved')
      } else {
        const data = await res.json()
        toast.error(data.error ?? 'Failed to save')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateKey = async () => {
    if (!newKey.key.trim()) { toast.error('Key is required'); return }
    setCreatingKey(true)
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: newKey.key.trim(), namespace: newKey.namespace, values: newKey.values }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Translation key created')
        setShowAddForm(false)
        setNewKey(EMPTY_NEW_KEY)
        fetchTranslations()
      } else {
        toast.error(data.error ?? 'Failed to create key')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setCreatingKey(false)
    }
  }

  const allNamespaces = ['', ...namespaces] as string[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Globe2 className="h-6 w-6 text-primary" />
            Content & Translations
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage platform copy in {LOCALES.join(', ').toUpperCase()}
          </p>
        </div>
        <Button variant="gradient" size="sm" leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setShowAddForm(v => !v)}>
          Add Key
        </Button>
      </div>

      {/* Add key form */}
      {showAddForm && (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <h3 className="font-semibold text-foreground text-sm">New Translation Key</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Key</label>
              <input type="text" value={newKey.key} onChange={e => setNewKey(k => ({ ...k, key: e.target.value }))}
                placeholder="e.g. nav.home" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Namespace</label>
              <div className="relative">
                <select value={newKey.namespace} onChange={e => setNewKey(k => ({ ...k, namespace: e.target.value }))}
                  className="w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none pr-7">
                  {(namespaces.length ? namespaces : ['common']).map(ns => <option key={ns} value={ns}>{ns}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {LOCALES.map(l => (
              <div key={l}>
                <label className="block text-xs font-medium text-muted-foreground mb-1">{l.toUpperCase()}</label>
                <input type="text" value={newKey.values[l]} onChange={e => setNewKey(k => ({ ...k, values: { ...k.values, [l]: e.target.value } }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>Cancel</Button>
            <Button variant="gradient" size="sm" loading={creatingKey} onClick={handleCreateKey}>Create Key</Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search keys or values..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {allNamespaces.map((ns) => (
            <button
              key={ns}
              onClick={() => setNamespaceFilter(ns)}
              className={cn(
                'rounded-full px-4 py-1.5 text-xs font-medium transition-colors capitalize',
                namespaceFilter === ns ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {ns || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-muted/30 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <span>Key</span>
          {LOCALES.map((l) => <span key={l}>{l.toUpperCase()}</span>)}
          <span />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            {search ? 'No translations match your search.' : 'No translations found. Add the first key above.'}
          </div>
        ) : (
          filtered.map((item, i) => {
            const compound = `${item.namespace}::${item.key}`
            return (
              <div
                key={compound}
                className={cn('px-5 py-3', i < filtered.length - 1 && 'border-b border-border')}
              >
                {editing === compound ? (
                  <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-4 items-center">
                    <div>
                      <p className="text-xs font-mono text-foreground">{item.key}</p>
                      <Badge variant="ghost" size="sm" className="mt-1">{item.namespace}</Badge>
                    </div>
                    {LOCALES.map((l) => (
                      <input
                        key={l}
                        type="text"
                        value={editValues[l] ?? ''}
                        onChange={(e) => setEditValues((p) => ({ ...p, [l]: e.target.value }))}
                        className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm focus:border-primary focus:outline-none w-full"
                      />
                    ))}
                    <div className="flex gap-1">
                      <Button size="icon-sm" onClick={() => saveEdit(item)} loading={saving}>
                        <Save className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon-sm" variant="ghost" onClick={() => setEditing(null)}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-4 items-center">
                    <div>
                      <p className="text-xs font-mono text-foreground">{item.key}</p>
                      <Badge variant="ghost" size="sm" className="mt-1">{item.namespace}</Badge>
                    </div>
                    {LOCALES.map((l) => {
                      const val = item[l as keyof TranslationRow] as string | undefined
                      return (
                        <p key={l} className="text-sm text-foreground truncate">
                          {val || <span className="text-muted-foreground/50 italic">—</span>}
                        </p>
                      )
                    })}
                    <Button size="icon-sm" variant="ghost" onClick={() => startEdit(item)}>
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {!loading && (
        <p className="text-center text-xs text-muted-foreground">{filtered.length} of {translations.length} keys</p>
      )}
    </div>
  )
}
