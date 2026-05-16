'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { Heart, HeartOff, Star, MapPin, Building2, ExternalLink, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

const STAR_MAP: Record<string, string> = {
  ONE: '★', TWO: '★★', THREE: '★★★', FOUR: '★★★★', FIVE: '★★★★★',
}

interface FavoriteHotel {
  id: string
  createdAt: string
  hotel: {
    id: string
    name: string
    slug: string
    city: string
    country: string
    type: string
    starRating: string | null
    logoUrl: string | null
    coverImageUrl: string | null
    isVerified: boolean
    averageRating: number | null
    _count: { jobs: number }
  }
}

export default function FavoriteHotelsPage() {
  const locale = useLocale()
  const [favorites, setFavorites] = useState<FavoriteHotel[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/hotels/favorites')
      .then((r) => r.json())
      .then((d) => setFavorites(d.data?.items ?? []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const unfavorite = async (favId: string, hotelId: string, hotelName: string) => {
    setRemoving(favId)
    try {
      const res = await fetch(`/api/hotels/${hotelId}/favorite`, { method: 'POST' })
      if (res.ok) {
        setFavorites((prev) => prev.filter((f) => f.id !== favId))
        toast.success(`"${hotelName}" removed from favorites`)
      }
    } catch {
      toast.error('Failed to remove favorite')
    } finally {
      setRemoving(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Favorite Hotels</h1>
        <p className="text-sm text-muted-foreground mt-1">Hotels you follow to stay updated on new openings</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-border">
          <Heart className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-foreground">No favorite hotels yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Follow hotels to get notified when they post new job openings.
          </p>
          <Link href={`/${locale}/hotels`} className="mt-4">
            <Button variant="gradient" leftIcon={<Building2 className="h-4 w-4" />}>
              Browse Hotels
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {favorites.map((f) => (
            <div
              key={f.id}
              className="p-5 rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-brand-gradient flex items-center justify-center text-white font-bold text-lg flex-shrink-0 overflow-hidden">
                  {f.hotel.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={f.hotel.logoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    f.hotel.name.charAt(0)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-foreground truncate">{f.hotel.name}</h3>
                    {f.hotel.isVerified && <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />}
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" />
                    {f.hotel.city}, {f.hotel.country}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {f.hotel.starRating && (
                    <span className="text-amber-500 text-sm">{STAR_MAP[f.hotel.starRating]}</span>
                  )}
                  {f.hotel.averageRating && (
                    <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {f.hotel.averageRating.toFixed(1)}
                    </span>
                  )}
                </div>
                <Badge variant="secondary" size="sm">
                  {f.hotel._count.jobs} open {f.hotel._count.jobs === 1 ? 'job' : 'jobs'}
                </Badge>
              </div>

              <div className="mt-3 flex gap-2">
                <Link href={`/${locale}/hotels/${f.hotel.slug}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full" rightIcon={<ExternalLink className="h-3.5 w-3.5" />}>
                    View Hotel
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="ghost"
                  loading={removing === f.id}
                  onClick={() => unfavorite(f.id, f.hotel.id, f.hotel.name)}
                  leftIcon={<HeartOff className="h-3.5 w-3.5" />}
                  className="text-muted-foreground hover:text-destructive"
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
