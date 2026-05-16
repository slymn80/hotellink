import type { Metadata } from 'next'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { Users, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Careers — HotelLink',
  description: 'Join the HotelLink team. We\'re building the leading hospitality recruitment platform in Türkiye.',
}

export default function CareersPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-[60vh] flex items-center justify-center pt-16">
        <div className="text-center max-w-md mx-auto px-4 py-20">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-3">We&apos;re Hiring</h1>
          <p className="text-muted-foreground leading-relaxed">
            We&apos;re a small, focused team building the go-to recruitment platform for Türkiye&apos;s hospitality industry. No open roles posted yet, but we&apos;re always interested in talented people who love hospitality tech.
          </p>
          <div className="mt-8">
            <a
              href="mailto:careers@hotellink.com"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
            >
              <Mail className="w-4 h-4" />
              careers@hotellink.com
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
