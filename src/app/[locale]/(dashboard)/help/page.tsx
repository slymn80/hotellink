import { HelpCircle, MessageSquare, FileText, Globe2, CreditCard, ChevronRight, Mail } from 'lucide-react'
import Link from 'next/link'

const faqs = [
  {
    q: 'How do I apply for a job on HotelLink?',
    a: 'Browse jobs from the "Find Jobs" section, click on a listing you like, and hit "Apply Now". Your profile information is automatically attached to your application.',
  },
  {
    q: 'Do I need a work permit before applying?',
    a: 'No. You can apply for jobs without a work permit. If a hotel selects you, your employer will initiate the work permit process. Check the Work Permit Guide for details.',
  },
  {
    q: 'How long does the work permit process take?',
    a: 'The Turkish Ministry of Labor reviews applications within 30 days. Total process including visa is typically 45–60 days.',
  },
  {
    q: 'Can hotels contact me directly?',
    a: 'Yes, if your profile is set to public and "Allow direct contact" is enabled in Settings. Hotels can send you a message without you having to apply first.',
  },
  {
    q: 'How do I increase my profile visibility?',
    a: 'Complete all profile sections, upload a professional photo, and add your CV. Profiles with 80%+ completion score appear higher in hotel searches.',
  },
  {
    q: 'Is HotelLink free for candidates?',
    a: 'Yes. HotelLink is completely free for job seekers. Hotels pay a subscription to post jobs and access candidate profiles.',
  },
]

const categories = [
  { icon: FileText, label: 'Applications', description: 'Track and manage your job applications' },
  { icon: Globe2, label: 'Work Permit', description: 'Guide for Turkish work permit process', href: 'work-permit' },
  { icon: MessageSquare, label: 'Messaging', description: 'Communicate with hotel recruiters' },
  { icon: CreditCard, label: 'Billing', description: 'Payments and subscription info' },
]

export default function HelpPage() {
  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Help Center</h1>
        <p className="text-sm text-muted-foreground mt-1">Find answers and get support</p>
      </div>

      {/* Categories */}
      <div className="grid sm:grid-cols-2 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon
          return (
            <div
              key={cat.label}
              className="flex items-start gap-4 p-5 rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{cat.label}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{cat.description}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* FAQ */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Frequently Asked Questions
          </h2>
        </div>
        <div className="divide-y divide-border">
          {faqs.map((faq, i) => (
            <details key={i} className="group px-6 py-4">
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none">
                <p className="text-sm font-medium text-foreground">{faq.q}</p>
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform group-open:rotate-90" />
              </summary>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="rounded-2xl border border-border bg-card p-6 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Mail className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-foreground">Still need help?</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Can&apos;t find your answer? Our support team typically responds within 24 hours.
          </p>
          <a
            href="mailto:support@hotellink.com"
            className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
          >
            <Mail className="h-3.5 w-3.5" />
            support@hotellink.com
          </a>
        </div>
      </div>
    </div>
  )
}
