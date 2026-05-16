import Link from 'next/link'
import { Logo } from '@/components/shared/Logo'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

interface AuthLayoutProps {
  children: React.ReactNode
  params: { locale: string }
}

export default function AuthLayout({
  children,
  params: { locale },
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left — Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 bg-hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-30" aria-hidden="true" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 30% 40%, rgba(97,114,243,0.3) 0%, transparent 60%)',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 text-white w-full">
          <Logo variant="white" href={`/${locale}`} size="md" />

          {/* Brand message */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="font-display text-4xl xl:text-5xl font-bold leading-tight">
                The Future of Hospitality Recruitment
              </h2>
              <p className="text-white/70 text-lg leading-relaxed max-w-md">
                Join 500+ hotels and 50,000+ candidates building their careers and
                teams in Türkiye's world-class hospitality industry.
              </p>
            </div>

            {/* Testimonial */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center text-white font-bold text-sm">
                  MK
                </div>
                <div>
                  <div className="font-semibold text-sm">Murat Kaya</div>
                  <div className="text-white/60 text-xs">HR Manager · Rixos Hotels</div>
                </div>
              </div>
              <p className="text-white/80 text-sm leading-relaxed italic">
                "We hired 8 international staff in 3 weeks. HotelLink completely transformed our recruitment process."
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: '500+', label: 'Hotels' },
                { value: '25', label: 'Countries' },
                { value: '6 wks', label: 'Avg. Hire' },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className="font-display text-2xl font-bold">{value}</div>
                  <div className="text-white/50 text-xs mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-white/30 text-xs">
            © {new Date().getFullYear()} HotelLink. Built in Türkiye 🇹🇷
          </div>
        </div>
      </div>

      {/* Right — Form panel */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 lg:hidden">
          <Logo href={`/${locale}`} size="sm" />
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>

        <div className="hidden lg:flex items-center justify-end gap-2 px-8 py-4 border-b border-border/30">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        <div className="flex-1 flex items-center justify-center p-6 lg:p-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  )
}
