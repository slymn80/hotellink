import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { HotelDashboardClient } from '../HotelDashboardClient'
import { Button } from '@/components/ui/button'
import {
  ShieldCheck, Clock, FileText, ExternalLink,
  Building2, ArrowRight, CheckCircle2, AlertTriangle,
} from 'lucide-react'
import { ResubmitForm } from './ResubmitForm'

export default async function HotelDashboardPage({
  params,
}: {
  params: { locale: string; hotelId: string }
}) {
  const session = await auth()
  if (!session) redirect(`/${params.locale}/login`)

  const hotel = await db.hotel.findUnique({
    where: { id: params.hotelId },
    include: {
      verifications: {
        where: { type: 'HOTEL' },
        orderBy: { submittedAt: 'desc' },
        take: 1,
      },
    },
  })

  if (!hotel) redirect(`/${params.locale}/hotel`)

  const verification = hotel.verifications[0] ?? null

  if (hotel.status === 'PENDING_VERIFICATION' || hotel.status === 'REJECTED') {
    return (
      <PendingVerificationScreen
        hotelName={hotel.name}
        hotelCity={hotel.city}
        hotelStatus={hotel.status}
        verificationStatus={verification?.status ?? 'PENDING'}
        rejectionNotes={verification?.status === 'REJECTED' ? (verification?.notes ?? null) : null}
        documents={verification?.documents ?? []}
        submittedAt={verification?.submittedAt ?? hotel.createdAt}
        locale={params.locale}
        hotelId={params.hotelId}
      />
    )
  }

  return <HotelDashboardClient hotelName={hotel.name} locale={params.locale} hotelId={params.hotelId} />
}

function PendingVerificationScreen({
  hotelName, hotelCity, hotelStatus, verificationStatus, rejectionNotes,
  documents, submittedAt, locale, hotelId,
}: {
  hotelName: string
  hotelCity: string
  hotelStatus: string
  verificationStatus: string
  rejectionNotes: string | null
  documents: string[]
  submittedAt: Date
  locale: string
  hotelId: string
}) {
  const isRejected = hotelStatus === 'REJECTED'
  const isInReview = verificationStatus === 'IN_REVIEW'

  const steps = [
    { label: 'Application Submitted', done: true },
    { label: 'Documents Under Review', done: isInReview || isRejected },
    { label: 'Profile Verified', done: false },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-8">
      {/* Status banner */}
      <div className={`rounded-2xl border p-6 flex items-start gap-4 ${
        isRejected
          ? 'border-destructive/30 bg-destructive/5'
          : 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20'
      }`}>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl flex-shrink-0 ${
          isRejected ? 'bg-destructive/10 text-destructive' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
        }`}>
          {isRejected ? <AlertTriangle className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-foreground">
            {isRejected ? 'Verification Rejected' : isInReview ? 'Documents Being Reviewed' : 'Awaiting Verification'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isRejected
              ? 'Your verification was rejected. Please review the reason below and resubmit with corrected documents.'
              : isInReview
              ? "An admin is reviewing your submitted documents. You'll be notified once complete."
              : 'Your hotel profile has been submitted and is awaiting admin review. This typically takes 1–2 business days.'}
          </p>
          {isRejected && rejectionNotes && (
            <div className="mt-3 rounded-xl bg-destructive/10 border border-destructive/20 px-3 py-2.5">
              <p className="text-xs font-semibold text-destructive uppercase tracking-wider mb-1">Reason</p>
              <p className="text-sm text-foreground">{rejectionNotes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Progress steps */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{hotelName}</p>
            <p className="text-xs text-muted-foreground">{hotelCity}</p>
          </div>
        </div>

        <div className="flex items-center gap-0 mt-2">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                  isRejected && i === steps.length - 1
                    ? 'bg-destructive text-white'
                    : step.done
                    ? 'bg-emerald-500 text-white'
                    : i === steps.findIndex(s => !s.done)
                    ? 'bg-amber-400 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {isRejected && i === steps.length - 1
                    ? <AlertTriangle className="h-3.5 w-3.5" />
                    : step.done
                    ? <CheckCircle2 className="h-4 w-4" />
                    : i + 1
                  }
                </div>
                <span className={`text-xs text-center whitespace-nowrap ${
                  isRejected && i === steps.length - 1 ? 'text-destructive font-medium'
                  : step.done ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                  : 'text-muted-foreground'
                }`}>
                  {isRejected && i === steps.length - 1 ? 'Rejected' : step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-px mx-2 mb-5 ${step.done ? 'bg-emerald-400' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Submitted on {new Date(submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Documents */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Submitted Documents
          </h3>
          {!isRejected && (
            <Link href={`/${locale}/hotel/${hotelId}/profile`}>
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                Edit Profile
              </Button>
            </Link>
          )}
        </div>
        {documents.length > 0 ? (
          <ul className="space-y-2">
            {documents.map((url, i) => (
              <li key={i} className="flex items-center gap-2 rounded-xl bg-muted/40 px-3 py-2.5">
                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-foreground flex-1 truncate">Document {i + 1}</span>
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 flex-shrink-0">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No documents submitted.</p>
        )}
      </div>

      {/* Rejected: resubmit form */}
      {isRejected && <ResubmitForm hotelId={hotelId} />}

      {/* Not rejected: while you wait */}
      {!isRejected && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <h3 className="font-semibold text-foreground mb-3">While you wait…</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Complete your <Link href={`/${locale}/hotel/${hotelId}/profile`} className="text-primary underline underline-offset-2">hotel profile</Link> — add a description, amenities, and photos.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Draft your first job posting — it will go live once your profile is verified.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Check back here within 1–2 business days for your verification result.</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
