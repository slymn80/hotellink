import { Globe2, CheckCircle2, Clock, FileText, Phone, ExternalLink, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const steps = [
  {
    number: 1,
    title: 'Job Offer',
    description: 'Receive a written job offer from a Turkish employer (hotel). The offer must include salary, role, and duration.',
    status: 'required',
  },
  {
    number: 2,
    title: 'Work Permit Application',
    description: 'Your employer applies to the Ministry of Labor and Social Security (ÇSGB) online through the e-Government portal.',
    status: 'employer',
  },
  {
    number: 3,
    title: 'Ministry Approval',
    description: 'The ministry reviews the application within 30 days. They check quota availability and employer eligibility.',
    status: 'government',
  },
  {
    number: 4,
    title: 'Visa Application',
    description: 'Once approved, apply for a work visa at the nearest Turkish consulate in your home country.',
    status: 'candidate',
  },
  {
    number: 5,
    title: 'Residence Registration',
    description: 'After arriving in Turkey, register with the Provincial Directorate of Migration Management within 30 days.',
    status: 'candidate',
  },
]

const documents = [
  'Valid passport (min. 6 months validity beyond permit duration)',
  'Passport-sized photos (biometric)',
  'Signed employment contract',
  'Diploma / professional certificate (notarized + apostille)',
  'Criminal background check (translated + apostille)',
  'Medical health report',
]

const statusColors: Record<string, string> = {
  required: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400',
  employer: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400',
  government: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400',
  candidate: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400',
}

const statusLabels: Record<string, string> = {
  required: 'You & Employer',
  employer: 'Employer Action',
  government: 'Government',
  candidate: 'Your Action',
}

export default function WorkPermitPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Work Permit Guide</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Step-by-step guide for obtaining a Turkish work permit for hospitality jobs
        </p>
      </div>

      {/* Notice */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Important</p>
          <p className="text-sm text-amber-700 dark:text-amber-400 mt-0.5">
            Work permit processing typically takes 30–45 days. Start the process as soon as you receive a job offer.
            This guide is for informational purposes — always consult official Turkish government sources.
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2">
          <Globe2 className="h-5 w-5 text-primary" />
          Application Process
        </h2>
        <div className="space-y-4">
          {steps.map((step) => (
            <div key={step.number} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center flex-shrink-0">
                  {step.number}
                </div>
                {step.number < steps.length && (
                  <div className="w-px flex-1 bg-border mt-2" />
                )}
              </div>
              <div className="pb-4 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium text-foreground">{step.title}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusColors[step.status]}`}>
                    {statusLabels[step.status]}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Documents */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Required Documents
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {documents.map((doc) => (
            <div key={doc} className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">{doc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Typical Timeline
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: 'Ministry Review', duration: '~30 days', color: 'text-blue-500' },
            { label: 'Visa Processing', duration: '7–14 days', color: 'text-purple-500' },
            { label: 'Total Process', duration: '45–60 days', color: 'text-primary' },
          ].map((item) => (
            <div key={item.label} className="text-center p-4 rounded-xl bg-muted/40">
              <p className={`text-2xl font-bold ${item.color}`}>{item.duration}</p>
              <p className="text-sm text-muted-foreground mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Phone className="h-5 w-5 text-primary" />
          Official Resources
        </h2>
        <div className="space-y-2">
          {[
            { label: 'Ministry of Labor — Work Permit System', url: 'https://www.csgb.gov.tr' },
            { label: 'Migration Management — Residence Permit', url: 'https://e-ikamet.goc.gov.tr' },
            { label: 'Turkish Embassy / Consulate Finder', url: 'https://www.mfa.gov.tr' },
          ].map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
