'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Star, Briefcase, CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface HotelCard {
  id: string | number
  name: string
  city: string
  country?: string
  type: string
  starRating?: string | null
  isVerified?: boolean
  isFeatured?: boolean
  logoUrl?: string | null
  coverImageUrl?: string | null
  openPositions: number
  departments: string[]
  // fallback-only fields
  coverGradient?: string
  emoji?: string
}

interface HotelShowcaseProps {
  hotels?: HotelCard[] | null
}

const fallbackHotels: HotelCard[] = [
  {
    id: 1,
    name: 'Rixos Premium Göcek',
    city: 'Göcek, Fethiye',
    type: 'Luxury Resort',
    starRating: '5',
    openPositions: 12,
    departments: ['Reception', 'Kitchen', 'Animation'],
    coverGradient: 'from-blue-900 via-blue-700 to-cyan-600',
    emoji: '🏖️',
    isVerified: true,
    isFeatured: true,
  },
  {
    id: 2,
    name: 'Kempinski Hotel The Dome',
    city: 'Belek, Antalya',
    type: 'Golf Resort',
    starRating: '5',
    openPositions: 8,
    departments: ['F&B', 'Spa', 'Housekeeping'],
    coverGradient: 'from-emerald-900 via-emerald-700 to-teal-600',
    emoji: '⛳',
    isVerified: true,
    isFeatured: false,
  },
  {
    id: 3,
    name: 'Hilton Bodrum Türkbükü',
    city: 'Bodrum, Muğla',
    type: 'Beach Resort',
    starRating: '5',
    openPositions: 15,
    departments: ['Reception', 'Management', 'F&B'],
    coverGradient: 'from-violet-900 via-purple-700 to-pink-600',
    emoji: '⛵',
    isVerified: true,
    isFeatured: true,
  },
  {
    id: 4,
    name: 'Grand Yazıcı Club Turban',
    city: 'Marmaris, Muğla',
    type: 'All-Inclusive Resort',
    starRating: '4',
    openPositions: 20,
    departments: ['Animation', 'Kitchen', 'Security'],
    coverGradient: 'from-orange-900 via-amber-700 to-yellow-600',
    emoji: '🎭',
    isVerified: true,
    isFeatured: false,
  },
  {
    id: 5,
    name: 'Les Ottomans Istanbul',
    city: 'Beşiktaş, İstanbul',
    type: 'Boutique Hotel',
    starRating: '5',
    openPositions: 5,
    departments: ['Reception', 'Guest Relations', 'F&B'],
    coverGradient: 'from-red-900 via-rose-700 to-pink-600',
    emoji: '🕌',
    isVerified: true,
    isFeatured: true,
  },
  {
    id: 6,
    name: 'Argos in Cappadocia',
    city: 'Ürgüp, Nevşehir',
    type: 'Cave Hotel',
    starRating: '5',
    openPositions: 7,
    departments: ['Reception', 'Kitchen', 'Spa'],
    coverGradient: 'from-stone-800 via-amber-800 to-orange-700',
    emoji: '🏺',
    isVerified: true,
    isFeatured: false,
  },
]

const gradientPool = [
  'from-blue-900 via-blue-700 to-cyan-600',
  'from-emerald-900 via-emerald-700 to-teal-600',
  'from-violet-900 via-purple-700 to-pink-600',
  'from-orange-900 via-amber-700 to-yellow-600',
  'from-red-900 via-rose-700 to-pink-600',
  'from-stone-800 via-amber-800 to-orange-700',
]

function parseStars(starRating: string | null | undefined): number {
  if (!starRating) return 0
  const n = parseInt(starRating, 10)
  if (!isNaN(n)) return Math.min(n, 5)
  const map: Record<string, number> = {
    ONE_STAR: 1, TWO_STAR: 2, THREE_STAR: 3, FOUR_STAR: 4, FIVE_STAR: 5,
  }
  return map[starRating] ?? 0
}

function formatType(type: string): string {
  return type
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ')
}

export function HotelShowcase({ hotels }: HotelShowcaseProps) {
  const t = useTranslations('hotelShowcase')
  const locale = useLocale()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  const displayHotels = hotels && hotels.length > 0 ? hotels : fallbackHotels

  return (
    <section className="py-20 lg:py-28 bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10"
        >
          <div>
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">
              Partner Hotels
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
              {t('title')}
            </h2>
            <p className="text-muted-foreground mt-2 max-w-xl">{t('subtitle')}</p>
          </div>
          <Link href={`/${locale}/hotels`}>
            <Button
              variant="outline"
              className="flex-shrink-0"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {t('viewAll')}
            </Button>
          </Link>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {displayHotels.map((hotel, i) => {
            const stars = parseStars(hotel.starRating)
            const gradient = hotel.coverGradient ?? gradientPool[i % gradientPool.length]
            const displayType = hotel.type.includes('_') ? formatType(hotel.type) : hotel.type
            const location = hotel.country && !hotel.city.includes(',')
              ? `${hotel.city}, ${hotel.country}`
              : hotel.city

            return (
              <motion.article
                key={hotel.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.08 }}
              >
                <Link href={`/${locale}/hotels/${hotel.id}`} className="block group">
                  <div className="rounded-3xl overflow-hidden border border-border/50 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 bg-card">
                    {/* Cover */}
                    <div className={cn('relative h-44 bg-gradient-to-br', gradient, 'flex items-end p-5')}>
                      {hotel.coverImageUrl ? (
                        <Image
                          src={hotel.coverImageUrl}
                          alt={hotel.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : hotel.emoji ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-6xl opacity-20 select-none">{hotel.emoji}</span>
                        </div>
                      ) : null}

                      {/* Badges */}
                      <div className="relative z-10 flex items-center gap-2 flex-wrap">
                        {hotel.isFeatured && (
                          <span className="px-2.5 py-1 rounded-full bg-gold-500 text-white text-xs font-semibold">
                            ⭐ Featured
                          </span>
                        )}
                        {hotel.isVerified && (
                          <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium border border-white/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {t('verified')}
                          </span>
                        )}
                      </div>

                      {/* Stars */}
                      {stars > 0 && (
                        <div className="absolute top-4 right-4 flex">
                          {Array.from({ length: stars }).map((_, si) => (
                            <Star key={si} className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-display text-base font-bold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
                        {hotel.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{location}</span>
                        <span className="text-border">·</span>
                        <span>{displayType}</span>
                      </div>

                      {/* Departments */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {hotel.departments.map((dept) => (
                          <Badge key={dept} variant="secondary" size="sm">
                            {dept}
                          </Badge>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-border/50">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Briefcase className="w-4 h-4 text-primary" />
                          <span className="font-semibold text-primary">{hotel.openPositions}</span>
                          <span className="text-muted-foreground">{t('openPositions')}</span>
                        </div>
                        <span className="text-xs text-primary font-medium group-hover:underline flex items-center gap-1">
                          {t('viewProfile')}
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
