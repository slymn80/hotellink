'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { signOut } from 'next-auth/react'
import { Bell, Shield, Lock, Trash2, Globe2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

function ToggleRow({ label, description, checked, onChange }: {
  label: string; description: string; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <button type="button" onClick={() => onChange(!checked)}
        className={cn('relative rounded-full transition-colors flex-shrink-0', checked ? 'bg-primary' : 'bg-muted')}
        style={{ width: 40, height: 22 }}>
        <span className={cn('absolute top-0.5 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-5' : 'translate-x-0.5')}
          style={{ width: 18, height: 18 }} />
      </button>
    </div>
  )
}

const NOTIF_DEFAULTS = { emailNewCandidates: true, emailApplicationUpdates: true, emailMessages: true, weeklyReport: true }
const PRIVACY_DEFAULTS = { agencyPublicListing: true, showCandidateCount: false }

export default function AgencySettingsPage() {
  const locale = useLocale()
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState(NOTIF_DEFAULTS)
  const [privacy, setPrivacy] = useState(PRIVACY_DEFAULTS)
  const [savingNotif, setSavingNotif] = useState(false)
  const [savingPrivacy, setSavingPrivacy] = useState(false)
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const [savingPw, setSavingPw] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)

  useEffect(() => {
    fetch('/api/user/preferences')
      .then(r => r.json())
      .then(d => {
        if (d.status === 'success') {
          setNotifications(prev => ({ ...prev, ...d.data.notifications }))
          setPrivacy(prev => ({ ...prev, ...d.data.privacy }))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const savePrefs = async (
    group: 'notifications' | 'privacy',
    data: typeof notifications | typeof privacy,
    setSaving: (v: boolean) => void
  ) => {
    setSaving(true)
    try {
      const res = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [group]: data }),
      })
      if (res.ok) toast.success('Preferences saved')
      else toast.error('Failed to save preferences')
    } catch { toast.error('Network error') }
    finally { setSaving(false) }
  }

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.next !== passwords.confirm) { toast.error('New passwords do not match'); return }
    if (passwords.next.length < 8) { toast.error('Password must be at least 8 characters'); return }
    if (!/[A-Z]/.test(passwords.next)) { toast.error('Password must contain at least one uppercase letter'); return }
    if (!/[0-9]/.test(passwords.next)) { toast.error('Password must contain at least one number'); return }
    if (!/[^A-Za-z0-9]/.test(passwords.next)) { toast.error('Password must contain at least one special character (!@#$...)'); return }
    setSavingPw(true)
    try {
      const res = await fetch('/api/user/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.next }),
      })
      const data = await res.json()
      if (!res.ok) toast.error(data.error ?? 'Failed to update password')
      else { toast.success('Password updated'); setPasswords({ current: '', next: '', confirm: '' }) }
    } catch { toast.error('Network error') }
    finally { setSavingPw(false) }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Permanently delete your agency account? All candidate pools and partnerships will be removed. This cannot be undone.')) return
    setDeletingAccount(true)
    try {
      const res = await fetch('/api/user/delete', { method: 'POST' })
      if (res.ok) {
        toast.success('Account deleted')
        await signOut({ callbackUrl: `/${locale}` })
      } else {
        const data = await res.json()
        toast.error(data.error ?? 'Failed to delete account')
      }
    } catch { toast.error('Network error') }
    finally { setDeletingAccount(false) }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your agency account preferences</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold text-foreground flex items-center gap-2 mb-1">
          <Bell className="h-4.5 w-4.5 text-primary" />
          Notifications
        </h2>
        <p className="text-xs text-muted-foreground mb-4">Choose when to receive notifications</p>
        <div className="divide-y divide-border">
          <ToggleRow label="New candidates in pools" description="When new candidates match your pool criteria"
            checked={notifications.emailNewCandidates} onChange={v => setNotifications(p => ({ ...p, emailNewCandidates: v }))} />
          <ToggleRow label="Application status updates" description="When an application you manage changes status"
            checked={notifications.emailApplicationUpdates} onChange={v => setNotifications(p => ({ ...p, emailApplicationUpdates: v }))} />
          <ToggleRow label="New messages" description="When hotels or candidates message you"
            checked={notifications.emailMessages} onChange={v => setNotifications(p => ({ ...p, emailMessages: v }))} />
          <ToggleRow label="Weekly activity report" description="Summary of placements and agency activity"
            checked={notifications.weeklyReport} onChange={v => setNotifications(p => ({ ...p, weeklyReport: v }))} />
        </div>
        <Button size="sm" className="mt-4" loading={savingNotif}
          onClick={() => savePrefs('notifications', notifications, setSavingNotif)}>
          Save preferences
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold text-foreground flex items-center gap-2 mb-1">
          <Globe2 className="h-4.5 w-4.5 text-primary" />
          Agency Visibility
        </h2>
        <p className="text-xs text-muted-foreground mb-4">Control how your agency appears on the platform</p>
        <div className="divide-y divide-border">
          <ToggleRow label="Public agency listing" description="Show your agency on the public directory for hotels to find you"
            checked={privacy.agencyPublicListing} onChange={v => setPrivacy(p => ({ ...p, agencyPublicListing: v }))} />
          <ToggleRow label="Show candidate pool count" description="Display how many candidates you manage on your public profile"
            checked={privacy.showCandidateCount} onChange={v => setPrivacy(p => ({ ...p, showCandidateCount: v }))} />
        </div>
        <Button size="sm" className="mt-4" loading={savingPrivacy}
          onClick={() => savePrefs('privacy', privacy, setSavingPrivacy)}>
          Save settings
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
          <Lock className="h-4.5 w-4.5 text-primary" />
          Change Password
        </h2>
        <form onSubmit={changePassword} className="space-y-3">
          {[
            { label: 'Current password', key: 'current' as const },
            { label: 'New password', key: 'next' as const },
            { label: 'Confirm new password', key: 'confirm' as const },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-foreground mb-1.5">{field.label}</label>
              <input type="password" value={passwords[field.key]}
                onChange={(e) => setPasswords((p) => ({ ...p, [field.key]: e.target.value }))}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none" required />
            </div>
          ))}
          <Button type="submit" size="sm" loading={savingPw} className="mt-2">Update password</Button>
        </form>
      </div>

      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
        <h2 className="font-semibold text-destructive flex items-center gap-2 mb-1">
          <Trash2 className="h-4.5 w-4.5" />
          Danger Zone
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Permanently delete your agency account. All candidate pools and partnerships will be removed.
        </p>
        <Button variant="destructive" size="sm" loading={deletingAccount} onClick={handleDeleteAccount}>
          Delete Agency Account
        </Button>
      </div>
    </div>
  )
}
