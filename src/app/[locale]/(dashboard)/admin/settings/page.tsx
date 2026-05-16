'use client'

import { useState, useEffect } from 'react'
import { Settings, Shield, Bell, Database, Mail, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

function Section({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-semibold text-foreground flex items-center gap-2 mb-5">
        <Icon className="h-4.5 w-4.5 text-primary" />
        {title}
      </h2>
      {children}
    </div>
  )
}

function ToggleRow({ label, description, checked, onChange }: {
  label: string; description: string; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn('relative rounded-full transition-colors flex-shrink-0', checked ? 'bg-primary' : 'bg-muted')}
        style={{ width: 40, height: 22 }}
      >
        <span
          className={cn('absolute top-0.5 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-5' : 'translate-x-0.5')}
          style={{ width: 18, height: 18 }}
        />
      </button>
    </div>
  )
}

const DEFAULTS = {
  maintenanceMode: 'false',
  registrationOpen: 'true',
  emailVerificationRequired: 'true',
  aiMatchingEnabled: 'true',
  welcomeEmail: 'true',
  applicationNotifications: 'true',
  weeklyDigest: 'false',
  securityAlerts: 'true',
  freeJobLimit: '1',
  candidateViewLimit: '10',
  aiMatchLimit: '5',
}

export default function AdminSettingsPage() {
  const [raw, setRaw] = useState<Record<string, string>>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [savingPlatform, setSavingPlatform] = useState(false)
  const [savingEmail, setSavingEmail] = useState(false)
  const [savingLimits, setSavingLimits] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(d => {
        if (d.status === 'success') setRaw(prev => ({ ...prev, ...d.data }))
      })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false))
  }, [])

  const bool = (key: string) => raw[key] === 'true'
  const num = (key: string) => raw[key] ?? ''
  const set = (key: string, value: boolean | string) => setRaw(r => ({ ...r, [key]: String(value) }))

  const save = async (keys: string[], setSaving: (v: boolean) => void) => {
    setSaving(true)
    try {
      const body: Record<string, string> = {}
      keys.forEach(k => { body[k] = raw[k] ?? '' })
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) toast.success('Settings saved')
      else toast.error('Failed to save settings')
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            Platform Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Global configuration for the HotelLink platform</p>
        </div>
        <Badge variant="warning" size="sm">Super Admin only</Badge>
      </div>

      <Section title="Platform Controls" icon={Shield}>
        <div className="divide-y divide-border">
          <ToggleRow label="Maintenance Mode" description="Take the platform offline for maintenance. All users will see a maintenance page."
            checked={bool('maintenanceMode')} onChange={v => set('maintenanceMode', v)} />
          <ToggleRow label="Open Registration" description="Allow new users to register. Disable to freeze signups."
            checked={bool('registrationOpen')} onChange={v => set('registrationOpen', v)} />
          <ToggleRow label="Email Verification Required" description="Require candidates and hotel employers to verify their email before accessing the platform."
            checked={bool('emailVerificationRequired')} onChange={v => set('emailVerificationRequired', v)} />
          <ToggleRow label="AI Matching Enabled" description="Enable the AI job matching feature for all candidates."
            checked={bool('aiMatchingEnabled')} onChange={v => set('aiMatchingEnabled', v)} />
        </div>
        <Button size="sm" className="mt-4" loading={savingPlatform}
          onClick={() => save(['maintenanceMode', 'registrationOpen', 'emailVerificationRequired', 'aiMatchingEnabled'], setSavingPlatform)}>
          Save settings
        </Button>
      </Section>

      <Section title="Email Notifications" icon={Mail}>
        <div className="divide-y divide-border">
          <ToggleRow label="Welcome emails" description="Send welcome emails to new registrations"
            checked={bool('welcomeEmail')} onChange={v => set('welcomeEmail', v)} />
          <ToggleRow label="Application notifications" description="Notify hotels of new applications and candidates of status changes"
            checked={bool('applicationNotifications')} onChange={v => set('applicationNotifications', v)} />
          <ToggleRow label="Weekly digest" description="Send platform-wide activity summaries to admins"
            checked={bool('weeklyDigest')} onChange={v => set('weeklyDigest', v)} />
          <ToggleRow label="Security alerts" description="Send email alerts for suspicious login attempts"
            checked={bool('securityAlerts')} onChange={v => set('securityAlerts', v)} />
        </div>
        <Button size="sm" className="mt-4" loading={savingEmail}
          onClick={() => save(['welcomeEmail', 'applicationNotifications', 'weeklyDigest', 'securityAlerts'], setSavingEmail)}>
          Save settings
        </Button>
      </Section>

      <Section title="Usage Limits (Free Plan)" icon={Database}>
        <div className="space-y-4">
          {[
            { label: 'Job posting limit', key: 'freeJobLimit', description: 'Max active job postings for free hotels' },
            { label: 'Candidate view limit', key: 'candidateViewLimit', description: 'Max candidate profile views/month' },
            { label: 'AI match limit', key: 'aiMatchLimit', description: 'Max AI matches per month for free accounts' },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-foreground mb-1">{field.label}</label>
              <p className="text-xs text-muted-foreground mb-1.5">{field.description}</p>
              <input
                type="number" min={0}
                value={num(field.key)}
                onChange={(e) => set(field.key, e.target.value)}
                className="w-32 rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          ))}
          <Button size="sm" loading={savingLimits}
            onClick={() => save(['freeJobLimit', 'candidateViewLimit', 'aiMatchLimit'], setSavingLimits)}>
            Save limits
          </Button>
        </div>
      </Section>

      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
        <h2 className="font-semibold text-destructive flex items-center gap-2 mb-3">
          <AlertTriangle className="h-4.5 w-4.5" />
          Danger Zone
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Clear AI match cache</p>
              <p className="text-xs text-muted-foreground">Force re-generation of all cached AI match results</p>
            </div>
            <Button variant="outline" size="sm" onClick={async () => {
              await save(['aiCacheVersion'], (v) => v)
              set('aiCacheVersion', String(Date.now()))
              toast.info('Cache invalidated')
            }}>Clear cache</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Export all data</p>
              <p className="text-xs text-muted-foreground">Generate a full platform data export (GDPR compliance)</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => toast.info('Export feature requires server-side generation — contact engineering')}>
              Export
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
