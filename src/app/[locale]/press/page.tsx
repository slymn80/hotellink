import type { Metadata } from 'next'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { Newspaper, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Press — HotelLink',
  description: 'Press resources and media contact for HotelLink.',
}

export default function PressPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-[60vh] flex items-center justify-center pt-16">
        <div className="text-center max-w-md mx-auto px-4 py-20">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Newspaper className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-3">Press & Media</h1>
          <p className="text-muted-foreground leading-relaxed mb-6">
            For press inquiries, interview requests, or media kit access, reach out directly. We&apos;re happy to speak about hospitality recruitment trends in Türkiye.
          </p>
          <a
            href="mailto:press@hotellink.com"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
          >
            <Mail className="w-4 h-4" />
            press@hotellink.com
          </a>
        </div>
      </main>
      <Footer />
    </>
  )
}
