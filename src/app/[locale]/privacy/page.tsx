import type { Metadata } from 'next'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'

export const metadata: Metadata = {
  title: 'Privacy Policy — HotelLink',
  description: 'HotelLink Privacy Policy — how we collect, use, and protect your personal data.',
}

const sections = [
  {
    title: '1. Who We Are',
    content: 'HotelLink ("we", "our", "us") is a hospitality recruitment platform operated from Türkiye. We connect hotels, HR agencies, and candidates for employment in the Turkish hospitality sector. Our contact email: hello@hotellink.com.',
  },
  {
    title: '2. Data We Collect',
    content: `We collect the following categories of personal data:

• Account data: name, email address, password (hashed), role
• Profile data: professional history, skills, languages, certifications, documents (for candidates); hotel details, company registration (for hotels)
• Usage data: pages visited, features used, IP address, browser type
• Communication data: messages sent through our platform
• Payment data: billing details processed via Stripe (we do not store card numbers)`,
  },
  {
    title: '3. How We Use Your Data',
    content: `We use your data to:

• Provide and improve the HotelLink platform
• Match candidates with job opportunities
• Process hotel verification requests
• Send notifications about applications and messages
• Handle billing and subscriptions
• Comply with legal obligations under Turkish law`,
  },
  {
    title: '4. Data Sharing',
    content: `We share data only when necessary:

• Hotels can view candidate profiles (subject to candidate's visibility settings)
• HR agencies can access candidate data within their managed pools
• We use Stripe for payments, Supabase for file storage, and OpenAI for AI matching — each governed by their own privacy policies
• We do not sell personal data to third parties`,
  },
  {
    title: '5. Data Retention',
    content: 'We retain account data for as long as your account is active. Upon account deletion, personal data is removed within 30 days, except where we are required to retain it by law (e.g., financial records for 5 years under Turkish tax law).',
  },
  {
    title: '6. Your Rights',
    content: `Under applicable law (including KVKK — Turkish Personal Data Protection Law), you have the right to:

• Access the personal data we hold about you
• Request correction of inaccurate data
• Request deletion of your data
• Object to certain processing
• Data portability

To exercise these rights, contact: hello@hotellink.com`,
  },
  {
    title: '7. Security',
    content: 'We implement industry-standard security measures: HTTPS encryption, hashed passwords (bcrypt), role-based access controls, and regular security reviews. No system is 100% secure — if you discover a vulnerability, please contact tech@hotellink.com.',
  },
  {
    title: '8. Cookies',
    content: 'We use essential session cookies for authentication and optional analytics cookies. See our Cookie Policy for details.',
  },
  {
    title: '9. Children',
    content: 'HotelLink is not directed at individuals under 18 years of age. We do not knowingly collect data from minors.',
  },
  {
    title: '10. Changes to This Policy',
    content: 'We may update this policy periodically. We will notify registered users by email of material changes. The date at the bottom of this page reflects the last update.',
  },
  {
    title: '11. Contact',
    content: 'For privacy-related questions or to exercise your rights: hello@hotellink.com\n\nData controller: HotelLink\nLocation: Istanbul, Türkiye',
  },
]

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="mb-10">
            <p className="text-sm text-muted-foreground mb-2">Legal</p>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">Privacy Policy</h1>
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
