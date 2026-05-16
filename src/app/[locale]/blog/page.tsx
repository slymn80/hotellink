import type { Metadata } from 'next'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { BookOpen, Bell } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog — HotelLink',
  description: 'Hospitality recruitment insights, work permit guides, and industry news from HotelLink.',
}

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-[60vh] flex items-center justify-center pt-16">
        <div className="text-center max-w-md mx-auto px-4 py-20">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-3">Blog Coming Soon</h1>
          <p className="text-muted-foreground leading-relaxed">
            We&apos;re working on articles about hospitality recruitment, work permit processes, industry trends in Türkiye, and tips for international hotel staff.
          </p>
          <div className="mt-8 flex items-center gap-2 justify-center text-sm text-muted-foreground">
            <Bell className="w-4 h-4" />
            <span>In the meantime, check out our <a href="../guide" className="text-primary hover:underline font-medium">Work Permit Guide</a></span>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
