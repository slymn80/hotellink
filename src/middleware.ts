import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

const protectedPaths = [
  '/dashboard',
  '/candidate',
  '/hotel',
  '/agency',
  '/admin',
]

const adminPaths = ['/admin']

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // Strip locale prefix for path matching
  const pathnameWithoutLocale = pathname.replace(/^\/(en|tr|ru)/, '')

  const isProtected = protectedPaths.some(
    (p) => pathnameWithoutLocale === p || pathnameWithoutLocale.startsWith(`${p}/`)
  )

  if (isProtected) {
    // Check for session token (Auth.js sets this cookie)
    const sessionToken =
      req.cookies.get('authjs.session-token')?.value ||
      req.cookies.get('__Secure-authjs.session-token')?.value

    if (!sessionToken) {
      const locale = pathname.split('/')[1] || 'en'
      const loginUrl = new URL(`/${locale}/login`, req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return intlMiddleware(req)
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons|images|robots.txt|sitemap.xml).*)',
  ],
}
