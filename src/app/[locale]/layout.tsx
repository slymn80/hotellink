import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { ThemeProvider } from '@/components/shared/ThemeProvider'
import { Toaster } from 'sonner'
import { auth } from '@/auth'
import { SessionProvider } from 'next-auth/react'

interface LocaleLayoutProps {
  children: React.ReactNode
  params: { locale: string }
}

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params: { locale },
}: LocaleLayoutProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'nav' })

  const localeMeta: Record<string, { title: string; description: string }> = {
    en: {
      title: 'HotelLink — Hospitality Recruitment Platform in Türkiye',
      description:
        'Connect with top hotels in Türkiye. Find international hospitality jobs with work permit support.',
    },
    tr: {
      title: 'HotelLink — Türkiye\'de Otelcilik İşe Alım Platformu',
      description:
        'Türkiye\'nin önde gelen otelleriyle bağlantı kurun. Çalışma izni desteğiyle uluslararası otelcilik işleri bulun.',
    },
    ru: {
      title: 'HotelLink — Платформа для найма в гостиничном секторе Турции',
      description:
        'Найдите работу в лучших отелях Турции с поддержкой в оформлении рабочего разрешения.',
    },
  }

  const meta = localeMeta[locale] ?? localeMeta.en

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: '/en',
        tr: '/tr',
        ru: '/ru',
      },
    },
  }
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: LocaleLayoutProps) {
  if (!routing.locales.includes(locale as 'en' | 'tr' | 'ru')) {
    notFound()
  }

  const messages = await getMessages()
  const session = await auth()

  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <SessionProvider session={session}>
          <NextIntlClientProvider messages={messages} locale={locale}>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange={false}
            >
              {children}
              <Toaster
                position="top-right"
                richColors
                closeButton
                duration={4000}
                toastOptions={{
                  classNames: {
                    toast: 'font-sans',
                  },
                }}
              />
            </ThemeProvider>
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
