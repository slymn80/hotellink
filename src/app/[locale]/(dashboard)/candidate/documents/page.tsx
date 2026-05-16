'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Upload, Download, Trash2, CheckCircle, Clock,
  AlertCircle, XCircle, Eye, FileBadge, BookOpen, BadgeCheck, Loader2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'

interface Document {
  id: string
  type: string
  name: string
  fileUrl: string
  fileSize: number | null
  status: string
  expiresAt: string | null
  createdAt: string
}

const DOC_TYPE_CONFIG: Record<string, { label: string; description: string; icon: string; required: boolean }> = {
  CV_RESUME: { label: 'CV / Resume', description: 'Your professional resume or CV', icon: '📄', required: true },
  PASSPORT: { label: 'Passport', description: 'Valid passport (main page)', icon: '🛂', required: true },
  WORK_PERMIT: { label: 'Work Permit', description: 'Current work permit or visa', icon: '📋', required: false },
  DEGREE_CERTIFICATE: { label: 'Diploma / Degree', description: 'Educational qualifications', icon: '🎓', required: false },
  REFERENCE_LETTER: { label: 'Reference Letter', description: 'Professional references', icon: '✉️', required: false },
  PROFESSIONAL_CERTIFICATE: { label: 'Certification', description: 'Professional certifications (CIDESCO, WSET, etc.)', icon: '🏅', required: false },
  OTHER: { label: 'Other Document', description: 'Any other relevant documents', icon: '📁', required: false },
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'success' | 'warning' | 'destructive' | 'secondary' | 'info' }> = {
  APPROVED: { label: 'Approved', variant: 'success' },
  PENDING: { label: 'Under Review', variant: 'warning' },
  REJECTED: { label: 'Rejected', variant: 'destructive' },
  EXPIRED: { label: 'Expired', variant: 'destructive' },
  DRAFT: { label: 'Draft', variant: 'secondary' },
}

export default function CandidateDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/documents')
      const data = await res.json()
      if (data.status === 'success') {
        setDocuments(data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  const handleUpload = async (type: string, file: File) => {
    setUploading(true)
    try {
      // In production: upload to Supabase storage first, then create document record
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        toast.success(`${DOC_TYPE_CONFIG[type]?.label ?? type} uploaded successfully`)
        fetchDocuments()
      } else {
        const data = await res.json()
        toast.error(data.error ?? 'Failed to upload document')
      }
    } catch {
      toast.error('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (docId: string) => {
    if (!confirm('Delete this document?')) return
    setDeleting(docId)
    try {
      const res = await fetch(`/api/documents/${docId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Document deleted')
        setDocuments(documents.filter((d) => d.id !== docId))
      }
    } catch {
      toast.error('Failed to delete document')
    } finally {
      setDeleting(null)
    }
  }

  const getDocByType = (type: string) => documents.find((d) => d.type === type)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Documents</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload your documents to complete your profile and apply for positions
        </p>
      </div>

      {/* Progress indicator */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Required Documents</span>
          <span className="text-sm font-semibold text-primary">
            {Object.entries(DOC_TYPE_CONFIG).filter(([type, config]) => config.required && getDocByType(type)).length}
            /
            {Object.values(DOC_TYPE_CONFIG).filter((c) => c.required).length} uploaded
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-ocean-500 transition-all"
            style={{
              width: `${(Object.entries(DOC_TYPE_CONFIG).filter(([type, config]) => config.required && getDocByType(type)).length / Object.values(DOC_TYPE_CONFIG).filter((c) => c.required).length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Document cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(DOC_TYPE_CONFIG).map(([type, config]) => {
          const existing = getDocByType(type)
          const statusConfig = existing ? STATUS_CONFIG[existing.status] : null

          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border bg-card p-5 ${
                existing ? 'border-border' : config.required ? 'border-amber-200 dark:border-amber-800' : 'border-border border-dashed'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{config.icon}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{config.label}</h3>
                    {config.required && !existing && (
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Required</span>
                    )}
                  </div>
                </div>
                {existing && statusConfig && (
                  <Badge variant={statusConfig.variant} size="sm">{statusConfig.label}</Badge>
                )}
              </div>

              <p className="text-xs text-muted-foreground mb-4">{config.description}</p>

              {existing ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs text-foreground truncate flex-1">{existing.name}</span>
                  </div>

                  {existing.expiresAt && (
                    <p className="text-xs text-muted-foreground">
                      Expires: {formatDate(new Date(existing.expiresAt))}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <a href={existing.fileUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full" leftIcon={<Download className="h-3.5 w-3.5" />}>
                        Download
                      </Button>
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={deleting === existing.id}
                      onClick={() => handleDelete(existing.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <label className="block">
                  <input
                    type="file"
                    className="sr-only"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleUpload(type, file)
                    }}
                    disabled={uploading}
                  />
                  <div className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-4 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                    <Upload className="h-4 w-4" />
                    {uploading ? 'Uploading...' : 'Upload file'}
                  </div>
                </label>
              )}
            </motion.div>
          )
        })}
      </div>

      <div className="rounded-xl bg-muted/30 border border-border p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Document Guidelines</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Accepted formats: PDF, DOC, DOCX, JPG, PNG</li>
              <li>Maximum file size: 10 MB per document</li>
              <li>Documents are securely stored and only shared with hotels you apply to</li>
              <li>Admin team reviews and verifies uploaded documents within 24 hours</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
