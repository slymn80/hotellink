'use client'

import { motion } from 'framer-motion'
import {
  MapPin, Globe, Star, Briefcase, Languages, ChevronRight,
  BadgeCheck, Users,
} from 'lucide-react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const FEATURED_CANDIDATES = [
  {
    id: '1',
    name: 'Elena K.',
    nationality: '🇷🇺',
    country: 'Russia',
    headline: 'Senior Front Office Manager',
    yearsOfExperience: 7,
    availability: 'AVAILABLE',
    languages: ['Russian', 'English', 'Turkish'],
    skills: ['Opera PMS', 'Revenue Management', 'VIP Service'],
    initials: 'EK',
    gradient: 'from-brand-500 to-ocean-600',
  },
  {
    id: '2',
    name: 'Dmitri V.',
    nationality: '🇷🇺',
    country: 'Russia',
    headline: 'Executive Chef — Mediterranean',
    yearsOfExperience: 10,
    availability: 'AVAILABLE_SOON',
    languages: ['Russian', 'English'],
    skills: ['Mediterranean Cuisine', 'HACCP', 'Team Leadership'],
    initials: 'DV',
    gradient: 'from-ocean-500 to-brand-600',
  },
  {
    id: '3',
    name: 'Aisha N.',
    nationality: '🇰🇿',
    country: 'Kazakhstan',
    headline: 'Spa Therapist & Wellness Specialist',
    yearsOfExperience: 5,
    availability: 'AVAILABLE',
    languages: ['Kazakh', 'Russian', 'English'],
    skills: ['CIDESCO', 'Aromatherapy', 'Hot Stone Massage'],
    initials: 'AN',
    gradient: 'from-violet-500 to-brand-500',
  },
  {
    id: '4',
    name: 'Ivan P.',
    nationality: '🇺🇦',
    country: 'Ukraine',
    headline: 'F&B Manager | Revenue Expert',
    yearsOfExperience: 8,
    availability: 'AVAILABLE',
    languages: ['Ukrainian', 'Russian', 'English'],
    skills: ['P&L Management', 'Menu Engineering', 'Wine Service'],
    initials: 'IP',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    id: '5',
    name: 'Sofia D.',
    nationality: '🇬🇷',
    country: 'Greece',
    headline: 'Guest Relations Specialist',
    yearsOfExperience: 4,
    availability: 'OPEN_TO_OFFERS',
    languages: ['Greek', 'English', 'Russian', 'Turkish'],
    skills: ['VIP Service', 'Multi-lingual', 'Concierge'],
    initials: 'SD',
    gradient: 'from-ocean-400 to-violet-600',
  },
  {
    id: '6',
    name: 'Marat S.',
    nationality: '🇰🇬',
    country: 'Kyrgyzstan',
    headline: 'Hotel Maintenance Supervisor',
    yearsOfExperience: 6,
    availability: 'AVAILABLE',
    languages: ['Kyrgyz', 'Russian', 'English'],
    skills: ['HVAC Systems', 'Preventive Maintenance', 'Team Management'],
    initials: 'MS',
    gradient: 'from-emerald-500 to-ocean-500',
  },
]

const AVAILABILITY_CONFIG = {
  AVAILABLE: { label: 'Available Now', color: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  AVAILABLE_SOON: { label: 'Available Soon', color: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
  OPEN_TO_OFFERS: { label: 'Open to Offers', color: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500' },
}

interface CandidateShowcaseProps {
  stats?: { candidateCount: number; countryCount: number } | null
}

export function CandidateShowcase({ stats }: CandidateShowcaseProps) {
  const locale = useLocale()

  const statItems = stats
    ? [
        { label: 'Active Candidates', value: stats.candidateCount.toLocaleString() + '+' },
        { label: 'Countries Represented', value: String(stats.countryCount) },
      ]
    : null

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="featured" className="mb-4">
              <Users className="mr-1.5 h-3.5 w-3.5" />
              Talent Pool
            </Badge>
            <h2 className="text-3xl font-bold text-foreground lg:text-4xl">
              International Hospitality{' '}
              <span className="text-gradient">Professionals</span>
            </h2>
            <p className="mt-4 text-muted-foreground lg:text-lg">
              Connect with experienced hospitality professionals from Russia, Ukraine,
              Kazakhstan, and across Eastern Europe — all ready for positions in Türkiye.
            </p>
          </motion.div>
        </div>

        {/* Stats bar — only shown when real data is available */}
        {statItems && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mb-10 grid grid-cols-2 gap-4 rounded-2xl border border-border bg-card p-6"
          >
            {statItems.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Candidate cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_CANDIDATES.map((candidate, i) => {
            const availConfig = AVAILABILITY_CONFIG[candidate.availability as keyof typeof AVAILABILITY_CONFIG]
            return (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-card"
              >
                {/* Header */}
                <div className="mb-4 flex items-start gap-3">
                  <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${candidate.gradient} text-white text-base font-bold shadow-sm`}>
                    {candidate.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-semibold text-foreground">{candidate.name}</h3>
                      <span className="text-base">{candidate.nationality}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{candidate.headline}</p>
                  </div>
                  {availConfig && (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className={`h-2 w-2 rounded-full ${availConfig.dot}`} />
                      <span className={`text-xs font-medium ${availConfig.color}`}>{availConfig.label}</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="mb-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {candidate.country}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" /> {candidate.yearsOfExperience}+ years
                  </span>
                </div>

                {/* Languages */}
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {candidate.languages.map((lang) => (
                    <Badge key={lang} variant="secondary" size="sm">
                      <Globe className="mr-1 h-2.5 w-2.5" /> {lang}
                    </Badge>
                  ))}
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5">
                  {candidate.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-muted-foreground mb-6">
            Access our full database of verified international hospitality professionals
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href={`/${locale}/register?role=HOTEL_EMPLOYER`}>
              <Button variant="gradient" size="lg" rightIcon={<ChevronRight className="h-4 w-4" />}>
                Access Talent Pool
              </Button>
            </Link>
            <Link href={`/${locale}/register?role=CANDIDATE`}>
              <Button variant="outline" size="lg">
                Create Candidate Profile
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
