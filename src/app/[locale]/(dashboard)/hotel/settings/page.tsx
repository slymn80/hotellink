'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { signOut } from 'next-auth/react'
import { Bell, Shield, Lock, Trash2, Loader2 } from 'lucide-react'
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

const NOTIF_DEFAULTS = { emailApplications: true, emailMessages: true, emailWeeklyReport: true }
const PRIVACY_DEFAULTS = { showOnDirectory: true, allowDirectContact: false }

export default function HotelSettingsPage() {
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
    if (!confirm('Permanently close this hotel account? All job listings will be removed. This cannot be undone.')) return
    setDeletingAccount(true)
    try {
      const res = await fetch('/api/user/delete', { method: 'POST' })
      if (res.ok) {
        toast.success('Account closed')
        await signOut({ callbackUrl: `/${locale}` })
      } else {
        const data = await res.json()
        toast.error(data.error ?? 'Failed to close account')
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
        <p className="text-sm text-muted-foreground mt-1">Manage your hotel account preferences</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold text-foreground flex items-center gap-2 mb-1">
          <Bell className="h-4.5 w-4.5 text-primary" />
          Notifications
        </h2>
        <p className="text-xs text-muted-foreground mb-4">Choose what you want to be notified about</p>
        <div className="divide-y divide-border">
          <ToggleRow label="New applications" description="When a candidate applies to one of your job postings"
            checked={notifications.emailApplications} onChange={v => setNotifications(p => ({ ...p, emailApplications: v }))} />
          <ToggleRow label="New messages" description="When a candidate sends you a message"
            checked={notifications.emailMessages} onChange={v => setNotifications(p => ({ ...p, emailMessages: v }))} />
          <ToggleRow label="Weekly report" description="Summary of applications, views, and hiring activity"
            checked={notifications.emailWeeklyReport} onChange={v => setNotifications(p => ({ ...p, emailWeeklyReport: v }))} />
        </div>
        <Button size="sm" className="mt-4" loading={savingNotif}
          onClick={() => savePrefs('notifications', notifications, setSavingNotif)}>
          Save preferences
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold text-foreground flex items-center gap-2 mb-1">
          <Shield className="h-4.5 w-4.5 text-primary" />
          Privacy
        </h2>
        <p className="text-xs text-muted-foreground mb-4">Control how your hotel appears to candidates</p>
        <div className="divide-y divide-border">
          <ToggleRow label="Show on hotel directory" description="Allow candidates to discover your hotel in the hotel listing"
            checked={privacy.showOnDirectory} onChange={v => setPrivacy(p => ({ ...p, showOnDirectory: v }))} />
          <ToggleRow label="Allow direct contact" description="Let candidates message your hotel without applying first"
            checked={privacy.allowDirectContact} onChange={v => setPrivacy(p => ({ ...p, allowDirectContact: v }))} />
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
          Permanently close this hotel account and remove all job listings. This action cannot be undone.
        </p>
        <Button variant="destructive" size="sm" loading={deletingAccount} onClick={handleDeleteAccount}>
          Close Account
        </Button>
      </div>
    </div>
  )
}
