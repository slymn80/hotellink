import Link from 'next/link'
import { getLocale } from 'next-intl/server'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft, Search } from 'lucide-react'

export default async function NotFound() {
  const locale = await getLocale()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        {/* 404 Visual */}
        <div className="mb-8 relative">
          <div className="text-[8rem] font-bold leading-none text-gradient opacity-20 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-brand-500 to-ocean-600 flex items-center justify-center shadow-glow-brand">
              <Search className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">Page Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={`/${locale}`}>
            <Button variant="gradient" leftIcon={<Home className="h-4 w-4" />}>
              Go Home
            </Button>
          </Link>
          <Link href={`/${locale}/jobs`}>
            <Button variant="outline" leftIcon={<Search className="h-4 w-4" />}>
              Browse Jobs
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
