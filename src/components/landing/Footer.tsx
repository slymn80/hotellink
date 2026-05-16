'use client'

import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { Logo } from '@/components/shared/Logo'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import {
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Mail,
  MapPin,
} from 'lucide-react'

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com/hotellink', label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com/company/hotellink', label: 'LinkedIn' },
  { icon: Instagram, href: 'https://instagram.com/hotellink', label: 'Instagram' },
  { icon: Youtube, href: 'https://youtube.com/@hotellink', label: 'YouTube' },
]

export function Footer() {
  const t = useTranslations('footer')
  const locale = useLocale()
  const year = new Date().getFullYear()

  const navSections = [
    {
      title: t('platform'),
      links: [
        { label: t('forHotels'), href: `/${locale}/hotels` },
        { label: t('forCandidates'), href: `/${locale}/jobs` },
        { label: t('forAgencies'), href: `/${locale}/agencies` },
        { label: t('pricing'), href: `/${locale}/pricing` },
        { label: t('jobs'), href: `/${locale}/jobs` },
      ],
    },
    {
      title: t('company'),
      links: [
        { label: t('about'), href: `/${locale}/about` },
        { label: t('blog'), href: `/${locale}/blog` },
        { label: t('careers'), href: `/${locale}/careers` },
        { label: t('press'), href: `/${locale}/press` },
        { label: t('partners'), href: `/${locale}/partners` },
      ],
    },
    {
      title: t('support'),
      links: [
        { label: t('helpCenter'), href: `/${locale}/help` },
        { label: t('contact'), href: `/${locale}/contact` },
        { label: t('workPermitGuide'), href: `/${locale}/work-permit-guide` },
        { label: t('status'), href: 'https://status.hotellink.com' },
      ],
    },
    {
      title: t('legal'),
      links: [
        { label: t('privacy'), href: `/${locale}/privacy` },
        { label: t('terms'), href: `/${locale}/terms` },
        { label: t('gdpr'), href: `/${locale}/gdpr` },
        { label: t('cookies'), href: `/${locale}/cookies` },
      ],
    },
  ]

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top section */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 py-14 border-b border-background/10">
          {/* Brand column */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <Logo variant="white" showTagline href={`/${locale}`} />
            <p className="text-sm text-background/50 mt-4 leading-relaxed max-w-xs">
              {t('tagline')}
            </p>

            {/* Contact info */}
            <div className="mt-6 space-y-2">
              {[
                { icon: MapPin, text: 'Istanbul & Antalya, Türkiye' },
                { icon: Mail, text: 'hello@hotellink.com' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5 text-sm text-background/50">
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>

            {/* Social links */}
            <div className="flex items-center gap-2 mt-6">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-background/10 hover:bg-background/20 flex items-center justify-center text-background/60 hover:text-background transition-all duration-200"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Nav sections */}
          {navSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold text-background/40 uppercase tracking-widest mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-background/60 hover:text-background transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
          <div className="flex items-center gap-4 text-sm text-background/40">
            <span>
              © {year} HotelLink. {t('rights')}
            </span>
            <span className="hidden sm:block text-background/20">·</span>
            <span className="hidden sm:block">{t('madeIn')} 🇹🇷</span>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher variant="dark" />
            <ThemeToggle className="text-background/40 hover:text-background hover:bg-background/10" />
          </div>
        </div>
      </div>
    </footer>
  )
}
