import type { Metadata } from 'next'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { Pricing } from '@/components/landing/Pricing'
import { CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pricing — HotelLink',
  description: 'Simple, transparent pricing for hotels. Start free, upgrade when you need to.',
}

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <div className="py-12 bg-gradient-to-b from-background to-muted/10 text-center">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Pricing</p>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Start for free. Upgrade when your team grows. Candidates always free.
          </p>
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">
            {['14-day free trial', 'No credit card required', 'Cancel anytime'].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                {item}
              </span>
            ))}
          </div>
        </div>
        <Pricing />
      </main>
      <Footer />
    </>
  )
}
