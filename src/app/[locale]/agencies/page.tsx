import type { Metadata } from 'next'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { Building2, Users, BarChart3, ShieldCheck, ChevronRight, CheckCircle2, Globe2, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'For HR Agencies — HotelLink',
  description: 'Manage hospitality placements across Türkiye. Access verified hotels, build candidate pools, and streamline your recruitment workflow.',
}

const features = [
  {
    icon: Users,
    title: 'Candidate Pool Management',
    description: 'Build and manage private candidate pools. Filter by skills, language, availability, and experience to match the right candidate instantly.',
  },
  {
    icon: Building2,
    title: 'Hotel Partnerships',
    description: 'Get direct access to verified hotels across Türkiye. Manage active partnerships and track placement history in one dashboard.',
  },
  {
    icon: BarChart3,
    title: 'Placement Analytics',
    description: 'Track placement success rates, revenue per placement, and agency-wide performance metrics with real-time reporting.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified Platform',
    description: 'All hotels and candidates are verified. Focus on placements, not on vetting — HotelLink handles the trust layer.',
  },
  {
    icon: Globe2,
    title: 'Multi-Language Support',
    description: 'Platform available in English, Turkish, and Russian — essential for placing international candidates in Turkish hotels.',
  },
  {
    icon: Briefcase,
    title: 'Application Tracking',
    description: 'Monitor every application your agency manages. Get notified on status changes and keep your clients updated in real time.',
  },
]

const steps = [
  { step: '01', title: 'Create Agency Account', desc: 'Register your agency and complete the verification process. Typically approved within 48 hours.' },
  { step: '02', title: 'Build Candidate Pools', desc: 'Add candidates to your pools or search HotelLink\'s verified candidate database.' },
  { step: '03', title: 'Partner with Hotels', desc: 'Connect with verified hotels looking for international staff. Send proposals directly.' },
  { step: '04', title: 'Track & Grow', desc: 'Monitor every placement, track performance, and grow your agency\'s hotel network.' },
]

export default function AgenciesPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="pt-28 pb-20 bg-gradient-to-b from-violet-950 via-violet-900 to-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-medium mb-6">
              <Briefcase className="w-4 h-4" />
              For HR Agencies
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white mb-6 leading-tight">
              The Platform Built for Hospitality Recruiters
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10">
              Manage candidate pools, partner with verified hotels, and track every placement — all in one dashboard purpose-built for hospitality HR agencies.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/register?role=HR_AGENCY">
                <Button variant="gradient" size="lg" rightIcon={<ChevronRight className="h-4 w-4" />}>
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="glass" size="lg" className="border-white/30 text-white">
                  Talk to Sales
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Features</p>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
                Everything Your Agency Needs
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f) => (
                <div key={f.title} className="rounded-2xl border border-border bg-card p-6">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 bg-muted/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="text-center mb-14">
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Process</p>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
                Get Started in 4 Steps
              </h2>
            </div>
            <div className="space-y-6">
              {steps.map((s) => (
                <div key={s.step} className="flex items-start gap-6 rounded-2xl border border-border bg-card p-6">
                  <div className="text-3xl font-display font-bold text-primary/30 flex-shrink-0 w-12">{s.step}</div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{s.title}</h3>
                    <p className="text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
              Ready to Grow Your Agency?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join HR agencies already placing candidates in top Turkish hotels. Free to start, no credit card required.
            </p>
            <Link href="/register?role=HR_AGENCY">
              <Button variant="gradient" size="lg" rightIcon={<ChevronRight className="h-4 w-4" />}>
                Create Agency Account
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
