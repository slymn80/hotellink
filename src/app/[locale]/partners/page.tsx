import type { Metadata } from 'next'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { Handshake, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Partners — HotelLink',
  description: 'Partner with HotelLink to expand your reach in Turkish hospitality recruitment.',
}

export default function PartnersPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-[60vh] flex items-center justify-center pt-16">
        <div className="text-center max-w-md mx-auto px-4 py-20">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Handshake className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-3">Partner with HotelLink</h1>
          <p className="text-muted-foreground leading-relaxed mb-6">
            We work with hospitality schools, language institutes, culinary academies, and professional associations to expand access for international candidates. If you have a partnership idea, we&apos;d love to hear it.
          </p>
          <a
            href="mailto:partners@hotellink.com"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
          >
            <Mail className="w-4 h-4" />
            partners@hotellink.com
          </a>
        </div>
      </main>
      <Footer />
    </>
  )
}
