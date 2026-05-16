import type { Metadata } from 'next'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { FileText, Clock, CheckCircle2, AlertCircle, ChevronRight, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Work Permit Guide for Türkiye — HotelLink',
  description: 'Step-by-step guide to obtaining a work permit in Türkiye for hospitality professionals. Documents, timelines, and tips.',
}

const steps = [
  {
    number: '01',
    title: 'Receive a Job Offer',
    duration: 'Day 1',
    description:
      'Your work permit process begins once a Turkish hotel extends a formal job offer. The employer initiates the work permit application on your behalf through the Turkish Ministry of Labor.',
    items: [
      'Written employment contract (signed by both parties)',
      'Job offer letter on company letterhead',
      'Copy of your valid passport',
    ],
  },
  {
    number: '02',
    title: 'Employer Submits Application',
    duration: 'Week 1–2',
    description:
      'The hotel HR department submits your application to the Turkish Ministry of Labor and Social Security (Çalışma ve Sosyal Güvenlik Bakanlığı) online portal.',
    items: [
      'Employment contract registered with notary',
      'Diploma/certificate translation (notarized)',
      'Passport photos (biometric)',
      'Hotel\'s business registration documents',
    ],
  },
  {
    number: '03',
    title: 'Ministry Review',
    duration: 'Week 2–6',
    description:
      'The Ministry evaluates the application. Standard processing takes 2–6 weeks. Certain nationalities or positions may qualify for expedited processing.',
    items: [
      'Background check clearance',
      'Hotel quota verification (5:1 Turkish/foreign staff ratio)',
      'Position qualification review',
    ],
  },
  {
    number: '04',
    title: 'Visa Application',
    duration: 'Week 4–7',
    description:
      'Once the work permit is approved, you apply for a work visa at the nearest Turkish consulate in your home country. This is separate from the work permit.',
    items: [
      'Approved work permit document',
      'Consular fee payment',
      'Visa application form',
      'Proof of accommodation in Türkiye',
    ],
  },
  {
    number: '05',
    title: 'Arrival & Registration',
    duration: 'Week 7–8',
    description:
      'After arriving in Türkiye, you must register your address with the local civil registry (Nüfus Müdürlüğü) and obtain your residence permit if staying longer than 6 months.',
    items: [
      'Register address within 20 working days of arrival',
      'Obtain Turkish tax number (vergi numarası)',
      'Open a Turkish bank account',
      'Register with Social Security (SGK)',
    ],
  },
]

const faqs = [
  {
    q: 'How long does the total process take?',
    a: 'Typically 6–10 weeks from job offer to starting work. This depends on your nationality, the hotel\'s quota status, and consulate processing times.',
  },
  {
    q: 'Who pays for the work permit?',
    a: 'The employer (hotel) pays the work permit application fee. You pay the visa fee at the consulate. HotelLink-verified hotels that offer work permit assistance cover both costs.',
  },
  {
    q: 'Can I change employers after getting a permit?',
    a: 'Your work permit is tied to a specific employer. To change employers, the new hotel must apply for a new work permit on your behalf.',
  },
  {
    q: 'What is the 5:1 ratio rule?',
    a: 'Turkish law requires hotels to employ at least 5 Turkish citizens for every 1 foreign worker. Hotels must have available quota before applying for your permit.',
  },
  {
    q: 'Can my family come with me?',
    a: 'Yes. Family members can apply for family residence permits once you are employed in Türkiye. They do not automatically get work rights; a separate process is needed.',
  },
]

export default function GuidePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="pt-28 pb-16 bg-gradient-to-b from-orange-950 via-orange-900 to-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-medium mb-6">
              <FileText className="w-4 h-4" />
              Work Permit Guide
            </div>
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-6">
              Working in Türkiye: The Complete Guide
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Everything international hospitality professionals need to know about obtaining a work permit in Türkiye — step by step.
            </p>
          </div>
        </section>

        {/* Timeline callout */}
        <section className="py-10 bg-background border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto text-center">
              {[
                { icon: Clock, label: 'Average Timeline', value: '6–10 weeks' },
                { icon: FileText, label: 'Key Documents', value: '8–10 items' },
                { icon: CheckCircle2, label: 'Success Rate', value: 'High with employer' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <Icon className="w-6 h-6 text-primary" />
                  <p className="text-lg font-bold text-foreground">{value}</p>
                  <p className="text-sm text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            <h2 className="text-2xl font-display font-bold text-foreground mb-10 text-center">Step-by-Step Process</h2>
            <div className="space-y-8">
              {steps.map((step, i) => (
                <div key={step.number} className="relative flex gap-6">
                  {i < steps.length - 1 && (
                    <div className="absolute left-5 top-12 bottom-0 w-px bg-border" />
                  )}
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm z-10">
                    {step.number}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-foreground">{step.title}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{step.duration}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{step.description}</p>
                    <ul className="space-y-1.5">
                      {step.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-foreground/80">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Important notice */}
        <section className="pb-10 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 dark:bg-amber-900/20 dark:border-amber-800 p-5 flex gap-4">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-foreground/80">
                <p className="font-semibold mb-1">Important</p>
                <p>Work permit regulations change periodically. Always verify current requirements with your employer or a licensed immigration consultant. Information on this page reflects general procedures as of 2025.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-20 bg-muted/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            <h2 className="text-2xl font-display font-bold text-foreground mb-10 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.q} className="rounded-2xl border border-border bg-card p-5">
                  <p className="font-semibold text-foreground mb-2">{faq.q}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-2xl">
            <Building2 className="w-12 h-12 text-primary/50 mx-auto mb-4" />
            <h2 className="text-2xl font-display font-bold text-foreground mb-3">
              Find a Hotel That Sponsors Work Permits
            </h2>
            <p className="text-muted-foreground mb-8">
              All hotels on HotelLink that offer work permit assistance are clearly marked. Filter jobs by visa sponsorship to find the right match.
            </p>
            <Link href="/jobs?visaSponsorship=true">
              <Button variant="gradient" size="lg" rightIcon={<ChevronRight className="h-4 w-4" />}>
                Browse Jobs with Visa Support
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
