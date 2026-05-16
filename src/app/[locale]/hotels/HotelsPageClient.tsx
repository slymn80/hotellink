'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, MapPin, Star, BadgeCheck, Briefcase,
  Filter, Loader2, Building2, ChevronRight, ChevronLeft, Heart,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDebounce } from '@/hooks'
import { toast } from 'sonner'

interface Hotel {
  id: string
  name: string
  slug: string
  shortDescription: string | null
  type: string
  starRating: string
  city: string
  country: string
  logoUrl: string | null
  coverImageUrl: string | null
  isVerified: boolean
  isFeatured: boolean
  amenities: string[]
  viewCount: number
  averageRating: number | null
  _count: { jobs: number; favorites: number }
}

const STAR_MAP: Record<string, string> = {
  ONE: '★', TWO: '★★', THREE: '★★★', FOUR: '★★★★', FIVE: '★★★★★',
}

const CITIES = ['Istanbul', 'Antalya', 'Bodrum', 'Marmaris', 'Nevşehir', 'Fethiye', 'Izmir', 'Alanya']
const HOTEL_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'HOTEL', label: 'Hotel' },
  { value: 'RESORT', label: 'Resort' },
  { value: 'BOUTIQUE', label: 'Boutique' },
  { value: 'VILLA', label: 'Villa & Apart' },
]

export function HotelsPageClient() {
  const locale = useLocale()
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [city, setCity] = useState('')
  const [type, setType] = useState('')
  const [stars, setStars] = useState('')
  const [page, setPage] = useState(1)
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set())
  const [favoritingId, setFavoritingId] = useState<string | null>(null)

  const debouncedQuery = useDebounce(query, 400)

  const fetchHotels = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (debouncedQuery) params.set('q', debouncedQuery)
      if (city) params.set('city', city)
      if (type) params.set('type', type)
      if (stars) params.set('stars', stars)
      params.set('page', String(page))
      params.set('pageSize', '12')

      const res = await fetch(`/api/hotels?${params.toString()}`)
      const data = await res.json()

      if (data.status === 'success') {
        setHotels(data.data.items)
        setTotal(data.data.total)
        setTotalPages(data.data.totalPages)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [debouncedQuery, city, type, stars, page])

  useEffect(() => {
    fetchHotels()
  }, [fetchHotels])

  const toggleFavorite = async (e: React.MouseEvent, hotelId: string, hotelName: string) => {
    e.preventDefault()
    e.stopPropagation()
    setFavoritingId(hotelId)
    try {
      const res = await fetch(`/api/hotels/${hotelId}/favorite`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setFavoritedIds((prev) => {
          const next = new Set(prev)
          if (data.favorited) { next.add(hotelId); toast.success(`"${hotelName}" saved to favorites`) }
          else { next.delete(hotelId); toast.success(`"${hotelName}" removed from favorites`) }
          return next
        })
      } else if (res.status === 401) {
        toast.error('Sign in to save hotels')
      }
    } catch {
      toast.error('Failed to update favorites')
    } finally {
      setFavoritingId(null)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-brand-50 to-background dark:from-brand-950/20 pt-24 pb-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-foreground mb-2">Hotels & Resorts in Türkiye</h1>
          <p className="text-muted-foreground mb-6">
            {total > 0 ? `${total} verified hotels` : 'Browse hotels'} actively hiring international staff
          </p>

          {/* Search */}
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Hotel name or location..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1) }}
                className="w-full rounded-xl border border-border bg-card pl-9 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <select
              value={city}
              onChange={(e) => { setCity(e.target.value); setPage(1) }}
              className="rounded-xl border border-border bg-card px-3 py-3 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="">All Cities</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(1) }}
              className="rounded-xl border border-border bg-card px-3 py-3 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              {HOTEL_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>

            <select
              value={stars}
              onChange={(e) => { setStars(e.target.value); setPage(1) }}
              className="rounded-xl border border-border bg-card px-3 py-3 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="">Any Stars</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
            </select>
          </div>
        </div>
      </section>

      {/* Hotels grid */}
      <section className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : hotels.length === 0 ? (
          <div className="py-20 text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold text-foreground">No hotels found</h3>
            <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {hotels.map((hotel, i) => (
                  <motion.div
                    key={hotel.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Link href={`/${locale}/hotels/${hotel.slug}`}>
                      <article className="group h-full rounded-2xl border border-border bg-card overflow-hidden transition-all duration-200 hover:shadow-card hover:-translate-y-1">
                        {/* Cover */}
                        <div className="relative h-40 bg-gradient-to-r from-brand-500 to-ocean-600 overflow-hidden">
                          {hotel.coverImageUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={hotel.coverImageUrl}
                              alt={hotel.name}
                              className="h-full w-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                            />
                          )}
                          {hotel.isFeatured && (
                            <div className="absolute left-3 top-3">
                              <Badge variant="featured" size="sm">Featured</Badge>
                            </div>
                          )}
                          <div className="absolute bottom-3 right-3">
                            <Badge variant="secondary" size="sm" className="bg-black/40 text-white border-0 backdrop-blur-sm">
                              {STAR_MAP[hotel.starRating]}
                            </Badge>
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="flex items-start gap-3 mb-2">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-ocean-600 text-white text-sm font-bold shadow-sm -mt-6 border-2 border-card">
                              {hotel.logoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={hotel.logoUrl} alt="" className="h-full w-full rounded-xl object-cover" />
                              ) : (
                                hotel.name.charAt(0)
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate text-sm">
                                  {hotel.name}
                                </h3>
                                {hotel.isVerified && (
                                  <BadgeCheck className="h-4 w-4 flex-shrink-0 text-primary" />
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" /> {hotel.city}
                                {hotel.averageRating && (
                                  <>
                                    <Star className="h-3 w-3 ml-1 fill-amber-400 text-amber-400" />
                                    {hotel.averageRating.toFixed(1)}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {hotel.shortDescription && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                              {hotel.shortDescription}
                            </p>
                          )}

                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1 font-medium text-primary">
                              <Briefcase className="h-3.5 w-3.5" />
                              {hotel._count.jobs} open positions
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => toggleFavorite(e, hotel.id, hotel.name)}
                                disabled={favoritingId === hotel.id}
                                className={`p-1 rounded-lg transition-colors ${
                                  favoritedIds.has(hotel.id)
                                    ? 'text-rose-500'
                                    : 'text-muted-foreground hover:text-rose-500'
                                }`}
                                title={favoritedIds.has(hotel.id) ? 'Remove from favorites' : 'Add to favorites'}
                              >
                                <Heart className={`h-4 w-4 ${favoritedIds.has(hotel.id) ? 'fill-current' : ''}`} />
                              </button>
                              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                          </div>
                        </div>
                      </article>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline" size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  leftIcon={<ChevronLeft className="h-4 w-4" />}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline" size="sm"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  rightIcon={<ChevronRight className="h-4 w-4" />}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  )
}
