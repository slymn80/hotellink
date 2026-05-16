import type { Metadata } from 'next'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'

export const metadata: Metadata = {
  title: 'Cookie Policy — HotelLink',
  description: 'How HotelLink uses cookies and similar tracking technologies.',
}

const cookieTypes = [
  {
    name: 'Essential Cookies',
    required: true,
    examples: 'Session token, CSRF protection, authentication state',
    purpose: 'Required for the platform to function. Without these, you cannot log in or use core features.',
  },
  {
    name: 'Preference Cookies',
    required: false,
    examples: 'Language selection, theme (light/dark mode)',
    purpose: 'Remember your display preferences across sessions.',
  },
  {
    name: 'Analytics Cookies',
    required: false,
    examples: 'Page view counts, feature usage patterns',
    purpose: 'Help us understand how the platform is used so we can improve it. Data is anonymized and not shared with third parties.',
  },
]

export default function CookiesPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="mb-10">
            <p className="text-sm text-muted-foreground mb-2">Legal</p>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">Cookie Policy</h1>
            <p className="text-sm text-muted-foreground">Last updated: May 2025</p>
          </div>

          <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
            <p>
              HotelLink uses cookies and similar technologies to provide a secure, functional experience. This policy explains what cookies we use, why, and how you can control them.
            </p>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">What Are Cookies?</h2>
              <p>
                Cookies are small text files stored in your browser when you visit a website. They allow the site to recognize your browser on subsequent visits and remember certain information about your session or preferences.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Cookies We Use</h2>
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                {cookieTypes.map((cookie, i) => (
                  <div key={cookie.name} className={`p-5 ${i < cookieTypes.length - 1 ? 'border-b border-border' : ''}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-foreground">{cookie.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${cookie.required ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {cookie.required ? 'Required' : 'Optional'}
                      </span>
                    </div>
                    <p className="mb-1.5">{cookie.purpose}</p>
                    <p className="text-xs text-foreground/60"><strong>Examples:</strong> {cookie.examples}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">Managing Cookies</h2>
              <p>
                You can control non-essential cookies through your browser settings. Most browsers allow you to block or delete cookies. Note that blocking essential cookies will prevent you from logging in to HotelLink.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">Third-Party Cookies</h2>
              <p>
                We do not allow third-party advertising cookies on HotelLink. Our payment processor (Stripe) may set cookies necessary for secure payment processing.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">Questions</h2>
              <p>
                For questions about our use of cookies: <a href="mailto:hello@hotellink.com" className="text-primary hover:underline">hello@hotellink.com</a>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
