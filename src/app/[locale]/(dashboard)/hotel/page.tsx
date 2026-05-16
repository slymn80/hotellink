'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Building2, Plus, CheckCircle2, Clock, MapPin, Briefcase,
  ChevronRight, Star, AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Hotel {
  id: string
  name: string
  city: string
  country: string
  type: string
  starRating: string | null
  status: string
  isVerified: boolean
  isOwner: boolean
  logoUrl: string | null
  _count: { jobs: number }
}

const STAR_MAP: Record<string, string> = {
  ONE: '★', TWO: '★★', THREE: '★★★', FOUR: '★★★★', FIVE: '★★★★★',
}

const TYPE_LABELS: Record<string, string> = {
  RESORT: 'Resort', CITY_HOTEL: 'City Hotel', BOUTIQUE: 'Boutique',
  APART_HOTEL: 'Apart Hotel', THERMAL_HOTEL: 'Thermal Hotel', VILLA: 'Villa',
  ECO_HOTEL: 'Eco Hotel', HOSTEL: 'Hostel', MOTEL: 'Motel',
  CASINO_HOTEL: 'Casino Hotel',
}

export default function HotelSelectorPage() {
  const locale = useLocale()
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/profile/hotels')
      .then((r) => r.json())
      .then((d) => { if (d.status === 'success') setHotels(d.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Your Hotels</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Select a hotel to manage, or add a new one.
          </p>
        </div>
        <Link href={`/${locale}/hotel/onboarding`}>
          <Button variant="gradient" leftIcon={<Plus className="h-4 w-4" />}>
            Add Hotel
          </Button>
        </Link>
      </div>

      {hotels.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-4">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">No hotels yet</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
            Create your first hotel profile to start posting jobs and receiving applications.
          </p>
          <Link href={`/${locale}/hotel/onboarding`}>
            <Button variant="gradient" leftIcon={<Plus className="h-4 w-4" />}>
              Create Hotel Profile
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {hotels.map((hotel, i) => (
            <motion.div
              key={hotel.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Link href={`/${locale}/hotel/${hotel.id}`}>
                <div className="group rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200 p-5 flex items-center gap-4 cursor-pointer">
                  {/* Logo */}
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-ocean-600 text-white shadow-sm">
                    {hotel.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={hotel.logoUrl} alt="" className="h-full w-full rounded-xl object-cover" />
                    ) : (
                      <Building2 className="h-6 w-6" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground">{hotel.name}</span>
                      {hotel.starRating && (
                        <span className="text-amber-500 text-xs">{STAR_MAP[hotel.starRating]}</span>
                      )}
                      {hotel.isOwner && (
                        <Badge variant="default" size="sm">Owner</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />{hotel.city}, {hotel.country}
                      </span>
                      <span>{TYPE_LABELS[hotel.type] ?? hotel.type}</span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />{hotel._count.jobs} jobs
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {hotel.status === 'VERIFIED' ? (
                      <Badge variant="success" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Verified
                      </Badge>
                    ) : hotel.status === 'PENDING_VERIFICATION' ? (
                      <Badge variant="warning" className="gap-1">
                        <Clock className="h-3 w-3" /> Pending
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1">
                        <AlertCircle className="h-3 w-3" /> Rejected
                      </Badge>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
