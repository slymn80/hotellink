import type { Metadata } from 'next'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { Mail, MapPin, MessageSquare, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact — HotelLink',
  description: 'Get in touch with the HotelLink team. Support for hotels, candidates, and HR agencies.',
}

const contacts = [
  {
    icon: Mail,
    title: 'General Inquiries',
    detail: 'hello@hotellink.com',
    note: 'For platform questions, partnerships, and press',
  },
  {
    icon: MessageSquare,
    title: 'Candidate Support',
    detail: 'candidates@hotellink.com',
    note: 'Help with your profile, applications, and work permits',
  },
  {
    icon: MapPin,
    title: 'Office Locations',
    detail: 'Istanbul & Antalya, Türkiye',
    note: 'Not accepting walk-ins — email preferred',
  },
  {
    icon: Clock,
    title: 'Response Times',
    detail: 'Within 24–48 hours',
    note: 'Monday–Friday, 09:00–18:00 (Turkey Time, GMT+3)',
  },
]

const topics = [
  { label: 'Hotel Registration & Verification', email: 'hotels@hotellink.com' },
  { label: 'HR Agency Partnerships', email: 'agencies@hotellink.com' },
  { label: 'Work Permit Assistance', email: 'permits@hotellink.com' },
  { label: 'Billing & Subscriptions', email: 'billing@hotellink.com' },
  { label: 'Press & Media', email: 'press@hotellink.com' },
  { label: 'Bug Reports & Technical', email: 'tech@hotellink.com' },
]

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="pt-28 pb-16 bg-gradient-to-b from-slate-900 to-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl text-center">
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-4">
              Get in Touch
            </h1>
            <p className="text-lg text-white/70">
              We&apos;re here to help hotels, candidates, and agencies get the most out of HotelLink.
            </p>
          </div>
        </section>

        {/* Contact cards */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            <div className="grid sm:grid-cols-2 gap-5">
              {contacts.map((c) => (
                <div key={c.title} className="rounded-2xl border border-border bg-card p-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <c.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{c.title}</h3>
                  <p className="text-sm font-medium text-primary mb-1">{c.detail}</p>
                  <p className="text-xs text-muted-foreground">{c.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact by topic */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
            <h2 className="text-xl font-display font-bold text-foreground mb-8 text-center">Contact by Topic</h2>
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              {topics.map((t, i) => (
                <div key={t.label} className={`flex items-center justify-between px-5 py-4 ${i < topics.length - 1 ? 'border-b border-border' : ''}`}>
                  <span className="text-sm text-foreground">{t.label}</span>
                  <a href={`mailto:${t.email}`} className="text-sm text-primary hover:underline font-medium">
                    {t.email}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
