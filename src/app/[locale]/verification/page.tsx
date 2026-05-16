import type { Metadata } from 'next'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { ShieldCheck, Building2, FileText, Clock, CheckCircle2, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { db } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Verified Hotels — HotelLink',
  description: 'How HotelLink verifies hotels to ensure safe, legitimate employment for international candidates.',
}

async function getVerifiedCount() {
  try {
    return await db.hotel.count({ where: { status: 'VERIFIED', isVerified: true } })
  } catch {
    return null
  }
}

const steps = [
  {
    icon: FileText,
    title: 'Document Submission',
    description: 'Hotels submit their business registration certificate, tax ID, and tourism operating license for review.',
  },
  {
    icon: ShieldCheck,
    title: 'Manual Review',
    description: 'Our team cross-checks documents with official Turkish government databases and tourism authority records.',
  },
  {
    icon: Building2,
    title: 'On-Platform Audit',
    description: 'We verify the hotel\'s star rating, room count, and operational history against third-party sources.',
  },
  {
    icon: CheckCircle2,
    title: 'Verification Badge',
    description: 'Approved hotels receive the HotelLink Verified badge. This is reviewed annually and can be revoked for policy violations.',
  },
]

const checks = [
  'Valid Turkish business registration (ticaret sicil)',
  'Tourism operating license (turizm işletme belgesi)',
  'Current tax registration',
  'No labor law violations on record',
  'Active HR contact verified',
  'Correct star rating and room count confirmed',
]

export default async function VerificationPage() {
  const verifiedCount = await getVerifiedCount()

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="pt-28 pb-16 bg-gradient-to-b from-emerald-950 via-emerald-900 to-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-medium mb-6">
              <ShieldCheck className="w-4 h-4" />
              Hotel Verification
            </div>
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-6">
              How We Verify Hotels
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8">
              Every hotel on HotelLink goes through a multi-step verification process before they can post jobs or contact candidates.
            </p>
            {verifiedCount !== null && (
              <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 border border-white/20 text-white text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span><strong>{verifiedCount}</strong> hotels verified and active on the platform</span>
              </div>
            )}
          </div>
        </section>

        {/* Process steps */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            <h2 className="text-2xl font-display font-bold text-foreground mb-10 text-center">Verification Process</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {steps.map((s) => (
                <div key={s.title} className="rounded-2xl border border-border bg-card p-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <s.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What we check */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
            <h2 className="text-2xl font-display font-bold text-foreground mb-8 text-center">What We Check</h2>
            <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
              {checks.map((check) => (
                <div key={check} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground/80">{check}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl text-center">
            <Clock className="w-10 h-10 text-primary/50 mx-auto mb-4" />
            <h2 className="text-xl font-display font-bold text-foreground mb-3">Timeline</h2>
            <p className="text-muted-foreground mb-8">
              Standard hotel verification takes <strong>2–5 business days</strong> after all required documents are submitted. Hotels are notified by email when approved or if additional information is needed.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl text-center">
            <h2 className="text-2xl font-display font-bold text-foreground mb-3">Ready to Get Verified?</h2>
            <p className="text-muted-foreground mb-8">
              Register your hotel, submit documents, and start hiring international staff with work permit support.
            </p>
            <Link href="/register?role=HOTEL_EMPLOYER">
              <Button variant="gradient" size="lg" rightIcon={<ChevronRight className="h-4 w-4" />}>
                Register Your Hotel
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
