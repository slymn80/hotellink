import type { Metadata } from 'next'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { Globe2, Heart, ShieldCheck, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About HotelLink',
  description: 'HotelLink connects international hospitality professionals with verified hotels across Türkiye.',
}

const values = [
  {
    icon: Globe2,
    title: 'Global Reach, Local Expertise',
    description: 'We understand both the international candidate\'s journey and the realities of Turkish hotel operations. Our platform is built on that dual perspective.',
  },
  {
    icon: ShieldCheck,
    title: 'Trust Through Verification',
    description: 'Every hotel is manually verified. Candidates can trust that the employers on HotelLink are legitimate, compliant businesses.',
  },
  {
    icon: Heart,
    title: 'Candidate-First',
    description: 'We believe international workers deserve transparent, fair employment. Work permit support, clear salary information, and honest job descriptions are non-negotiable on our platform.',
  },
  {
    icon: Zap,
    title: 'Built for Speed',
    description: 'Hospitality hiring moves fast. Peak season hiring means decisions in days, not weeks. HotelLink is optimized for exactly that.',
  },
]

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="pt-28 pb-20 bg-gradient-to-b from-brand-950 via-brand-900 to-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-6">
              Connecting Hospitality Talent with Türkiye&apos;s Hotels
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              HotelLink was built to solve a real problem: Turkish hotels struggled to find qualified international staff, and experienced hospitality professionals from Russia, Ukraine, Kazakhstan, and beyond couldn&apos;t navigate the complex hiring process alone.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            <div className="rounded-2xl border border-border bg-card p-8 lg:p-10 text-center">
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-4">Our Mission</p>
              <blockquote className="text-2xl sm:text-3xl font-display font-bold text-foreground leading-snug">
                &ldquo;Make international hospitality employment in Türkiye accessible, transparent, and fair for everyone involved.&rdquo;
              </blockquote>
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            <h2 className="text-2xl font-display font-bold text-foreground mb-6">The Problem We Solve</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Türkiye&apos;s hotel sector employs hundreds of thousands of people, and a significant portion — particularly in 4- and 5-star properties — are international workers from CIS countries and Eastern Europe.
              </p>
              <p>
                But the hiring process was fragmented. Hotels relied on informal networks or expensive recruitment agencies. Candidates had no reliable way to find legitimate job offers, understand work permit requirements, or compare employers.
              </p>
              <p>
                HotelLink brings structure to this market: verified hotels, transparent job listings, built-in work permit guidance, and a direct communication channel between employers and candidates.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-display font-bold text-foreground">What We Stand For</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
              {values.map((v) => (
                <div key={v.title} className="rounded-2xl border border-border bg-card p-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <v.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl text-center">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Where We Are</p>
            <h2 className="text-2xl font-display font-bold text-foreground mb-4">Based in Türkiye, Built for the World</h2>
            <p className="text-muted-foreground">
              HotelLink operates from Istanbul and Antalya — the two centers of Turkish hospitality. Our team includes hospitality veterans, technology professionals, and HR specialists who understand this industry from the inside.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
