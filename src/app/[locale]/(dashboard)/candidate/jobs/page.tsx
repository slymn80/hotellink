'use client'

import { useLocale } from 'next-intl'
import { JobsPageClient } from '@/app/[locale]/jobs/JobsPageClient'
import { Briefcase } from 'lucide-react'

export default function CandidateJobSearchPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Briefcase className="h-5 w-5 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Browse Jobs</h1>
          <p className="text-sm text-muted-foreground">Find your next hospitality role in Türkiye</p>
        </div>
      </div>

      {/* Reuse the public jobs page client — it's fully self-contained */}
      <div className="-mx-4 sm:-mx-6 lg:-mx-8">
        <JobsPageClient embedded />
      </div>
    </div>
  )
}
