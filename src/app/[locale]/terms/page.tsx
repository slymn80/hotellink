import type { Metadata } from 'next'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'

export const metadata: Metadata = {
  title: 'Terms of Service — HotelLink',
  description: 'HotelLink Terms of Service — the rules that govern your use of the platform.',
}

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: 'By creating an account or using HotelLink ("the platform"), you agree to these Terms of Service. If you do not agree, do not use the platform.',
  },
  {
    title: '2. Eligibility',
    content: 'You must be at least 18 years old to use HotelLink. By using the platform, you represent that you meet this requirement.',
  },
  {
    title: '3. Account Responsibilities',
    content: `You are responsible for:

• Maintaining the confidentiality of your login credentials
• All activity that occurs under your account
• Providing accurate, truthful information in your profile and job postings
• Notifying us immediately of any unauthorized account access`,
  },
  {
    title: '4. Hotels',
    content: `Hotels using HotelLink agree to:

• Submit only accurate business information for verification
• Post only genuine, currently available job positions
• Not engage in discriminatory hiring practices
• Comply with all applicable Turkish labor laws regarding foreign worker employment
• Not contact candidates outside the platform to circumvent subscription limits`,
  },
  {
    title: '5. Candidates',
    content: `Candidates using HotelLink agree to:

• Provide accurate information about qualifications, experience, and documents
• Not misrepresent certifications or work history
• Only apply to positions for which they are genuinely interested
• Not share login credentials with others`,
  },
  {
    title: '6. HR Agencies',
    content: 'Agencies must be legally registered businesses. Agencies may only add candidates to their pools with the candidates\' explicit consent. Agencies may not resell access to HotelLink data.',
  },
  {
    title: '7. Prohibited Uses',
    content: `You may not use HotelLink to:

• Post fraudulent job listings or candidate profiles
• Harvest contact information for spam
• Attempt to reverse-engineer or scrape the platform
• Transmit malware or attempt unauthorized system access
• Violate any applicable law or regulation`,
  },
  {
    title: '8. Intellectual Property',
    content: 'HotelLink and its content (logo, design, software) are our property. You retain ownership of content you create (profile information, job listings). By submitting content, you grant us a license to display it on the platform.',
  },
  {
    title: '9. Subscriptions and Payments',
    content: 'Hotel subscriptions are billed in advance. Refunds are provided at our discretion for unused periods cancelled within 7 days of renewal. Candidate use is free. We reserve the right to change pricing with 30 days notice.',
  },
  {
    title: '10. Limitation of Liability',
    content: 'HotelLink is a platform connecting parties — we are not the employer or employment agency. We are not liable for the outcome of hiring decisions, employment disputes, or work permit outcomes. Our liability is limited to the amount you paid us in the preceding 3 months.',
  },
  {
    title: '11. Termination',
    content: 'We may suspend or terminate accounts that violate these terms, engage in fraud, or are otherwise harmful to the platform or other users. You may delete your account at any time.',
  },
  {
    title: '12. Governing Law',
    content: 'These terms are governed by the laws of the Republic of Türkiye. Disputes shall be resolved in Istanbul courts.',
  },
  {
    title: '13. Contact',
    content: 'For questions about these terms: hello@hotellink.com',
  },
]

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="mb-10">
            <p className="text-sm text-muted-foreground mb-2">Legal</p>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">Terms of Service</h1>
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
