import type { Metadata } from 'next'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { BarChart3, TrendingUp, Globe2, Briefcase, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Market Insights — HotelLink',
  description: 'Hospitality recruitment trends and labor market data for Türkiye. Key stats on international staffing in Turkish hotels.',
}

const stats = [
  { value: '1.2M+', label: 'Hotel employees in Türkiye', note: 'Ministry of Tourism, 2024' },
  { value: '~18%', label: 'International staff in 5-star hotels', note: 'Hospitality HR Survey, 2024' },
  { value: '6–10 wks', label: 'Average work permit processing', note: 'HotelLink data, 2024' },
  { value: '3 languages', label: 'Most sought: EN, RU, TR', note: 'HotelLink job analysis, 2025' },
]

const departments = [
  { name: 'Food & Beverage', demand: 32, note: 'Highest international demand' },
  { name: 'Front Office', demand: 28, note: 'Multi-language critical' },
  { name: 'Spa & Wellness', demand: 18, note: 'CIDESCO preferred' },
  { name: 'Housekeeping', demand: 12, note: 'Steady year-round need' },
  { name: 'Entertainment', demand: 10, note: 'Seasonal peaks' },
]

const regions = [
  { name: 'Antalya', share: '41%', trend: 'up', note: 'Riviera hotels, seasonal' },
  { name: 'Istanbul', share: '27%', trend: 'up', note: 'City hotels, year-round' },
  { name: 'Bodrum / Marmaris', share: '18%', trend: 'stable', note: 'Aegean resorts' },
  { name: 'Cappadocia', share: '8%', trend: 'up', note: 'Boutique & cave hotels' },
  { name: 'Other regions', share: '6%', trend: 'stable', note: 'Emerging areas' },
]

export default function InsightsPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="pt-28 pb-16 bg-gradient-to-b from-blue-950 via-blue-900 to-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-medium mb-6">
              <BarChart3 className="w-4 h-4" />
              Market Insights
            </div>
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-6">
              Türkiye Hospitality Labor Market
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Key data on international staffing trends, regional demand, and in-demand skills across Turkish hotels and resorts.
            </p>
          </div>
        </section>

        {/* Key stats */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
              {stats.map((s) => (
                <div key={s.label} className="rounded-2xl border border-border bg-card p-6 text-center">
                  <p className="text-4xl font-display font-bold text-primary mb-2">{s.value}</p>
                  <p className="text-sm font-medium text-foreground mb-1">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Department demand */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            <div className="flex items-center gap-2 mb-8">
              <Briefcase className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-display font-bold text-foreground">International Hiring by Department</h2>
            </div>
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              {departments.map((dept, i) => (
                <div key={dept.name} className={`flex items-center gap-4 px-5 py-4 ${i < departments.length - 1 ? 'border-b border-border' : ''}`}>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-foreground">{dept.name}</span>
                      <span className="text-sm font-bold text-primary">{dept.demand}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${dept.demand}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{dept.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Regional breakdown */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            <div className="flex items-center gap-2 mb-8">
              <Globe2 className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-display font-bold text-foreground">Hiring Demand by Region</h2>
            </div>
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              {regions.map((region, i) => (
                <div key={region.name} className={`flex items-center justify-between px-5 py-4 ${i < regions.length - 1 ? 'border-b border-border' : ''}`}>
                  <div>
                    <p className="text-sm font-medium text-foreground">{region.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{region.note}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-foreground">{region.share}</span>
                    <TrendingUp className={`w-4 h-4 ${region.trend === 'up' ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Source note */}
        <section className="pb-16 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            <p className="text-center text-xs text-muted-foreground">
              Data sources: Turkish Ministry of Tourism, Turkish Hoteliers Federation (TÜROB), HotelLink platform data. Last updated: 2025.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
