'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export function ResubmitForm({ hotelId }: { hotelId: string }) {
  const [open, setOpen] = useState(false)
  const [docs, setDocs] = useState(['', ''])
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const addDoc = () => setDocs(prev => [...prev, ''])
  const removeDoc = (i: number) => setDocs(prev => prev.filter((_, idx) => idx !== i))
  const setDoc = (i: number, val: string) => setDocs(prev => prev.map((d, idx) => idx === i ? val : d))

  const handleSubmit = async () => {
    const validDocs = docs.filter(d => d.trim().length > 0)
    if (validDocs.length === 0) {
      toast.error('Please provide at least one document URL')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/hotels/${hotelId}/resubmit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents: validDocs, notes: notes.trim() || undefined }),
      })
      if (res.ok) {
        toast.success('Resubmission sent! The admin will review your documents shortly.')
        window.location.reload()
      } else {
        const data = await res.json()
        toast.error(data.error ?? 'Failed to resubmit')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) {
    return (
      <Button
        variant="gradient"
        className="w-full"
        leftIcon={<RefreshCw className="h-4 w-4" />}
        onClick={() => setOpen(true)}
      >
        Resubmit for Verification
      </Button>
    )
  }

  return (
    <div className="rounded-2xl border border-primary/30 bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-primary" />
          Resubmit Documents
        </h3>
        <button onClick={() => setOpen(false)} className="text-xs text-muted-foreground hover:text-foreground">
          Cancel
        </button>
      </div>

      <p className="text-sm text-muted-foreground">
        Provide updated document URLs (Google Drive, Dropbox, etc.) that address the rejection reason.
      </p>

      <div className="space-y-2">
        {docs.map((doc, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="url"
              value={doc}
              onChange={(e) => setDoc(i, e.target.value)}
              placeholder={`https://drive.google.com/file/... (Document ${i + 1})`}
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
            {docs.length > 1 && (
              <button
                onClick={() => removeDoc(i)}
                className="rounded-xl border border-border p-2.5 text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addDoc}
          className="flex items-center gap-1.5 text-xs text-primary hover:underline"
        >
          <Plus className="h-3.5 w-3.5" />
          Add another document
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Note to Admin (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Explain what you've corrected..."
          rows={2}
          maxLength={500}
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none resize-none"
        />
      </div>

      <Button
        variant="gradient"
        className="w-full"
        loading={submitting}
        onClick={handleSubmit}
        leftIcon={<RefreshCw className="h-4 w-4" />}
      >
        Submit for Re-review
      </Button>
    </div>
  )
}
