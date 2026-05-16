import type { Metadata } from 'next'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'

export const metadata: Metadata = {
  title: 'GDPR & KVKK Compliance — HotelLink',
  description: 'HotelLink GDPR and KVKK compliance information for EU and Turkish data subjects.',
}

const sections = [
  {
    title: 'Overview',
    content: 'HotelLink processes personal data in accordance with the EU General Data Protection Regulation (GDPR) and the Turkish Personal Data Protection Law (KVKK - Kişisel Verilerin Korunması Kanunu, Law No. 6698).',
  },
  {
    title: 'Legal Basis for Processing',
    content: `We process your data under the following legal bases:

• Contract performance: To provide the services you have requested (creating a profile, posting jobs, processing applications)
• Legitimate interests: Platform security, fraud prevention, service improvement
• Consent: For optional features such as marketing communications
• Legal obligation: Tax records and employment-related documentation required by Turkish law`,
  },
  {
    title: 'International Data Transfers',
    content: 'Some of our service providers (Stripe, Supabase, OpenAI) may process data outside Türkiye and the EU. Where applicable, we ensure appropriate safeguards are in place (Standard Contractual Clauses, adequacy decisions).',
  },
  {
    title: 'Your Rights Under GDPR / KVKK',
    content: `As a data subject, you have the right to:

• Access: Request a copy of your personal data
• Rectification: Correct inaccurate or incomplete data
• Erasure: Request deletion ("right to be forgotten") — subject to legal retention requirements
• Restriction: Request we limit processing in certain circumstances
• Portability: Receive your data in a machine-readable format
• Objection: Object to processing based on legitimate interests
• Withdraw consent: Where processing is based on consent, you may withdraw at any time

To exercise any right, email: hello@hotellink.com. We will respond within 30 days (KVKK) or one month (GDPR).`,
  },
  {
    title: 'Data Protection Officer',
    content: 'HotelLink does not currently have a designated DPO, as we do not engage in large-scale systematic processing of sensitive data. Privacy inquiries are handled by our core team. Contact: hello@hotellink.com',
  },
  {
    title: 'Supervisory Authority',
    content: 'If you believe your data protection rights have been violated, you may lodge a complaint with:\n\n• In Türkiye: Kişisel Verileri Koruma Kurumu (KVKK) — kvkk.gov.tr\n• In the EU: Your national data protection authority',
  },
  {
    title: 'Sensitive Data',
    content: 'We do not intentionally collect special categories of personal data (health, biometric, political, religious data). Do not upload documents containing such data unless required for work permit purposes, in which case it is processed solely for that purpose.',
  },
]

export default function GdprPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="mb-10">
            <p className="text-sm text-muted-foreground mb-2">Legal</p>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">GDPR & KVKK Compliance</h1>
            <p className="text-sm text-muted-foreground">Last updated: May 2025</p>
          </div>
          <div className="space-y-8">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="text-lg font-semibold text-foreground mb-3">{section.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{section.content}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
