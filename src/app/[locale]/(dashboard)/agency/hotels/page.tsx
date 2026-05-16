'use client'

import { useState, useEffect } from 'react'
import { Building2, MapPin, Search, ShieldCheck, Loader2, Handshake } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Hotel {
  id: string
  name: string
  slug: string
  city: string
  country: string
  type: string
  starRating: string | null
  isVerified: boolean
  logoUrl: string | null
  _count: { jobs: number }
}

const STAR_MAP: Record<string, string> = {
  ONE: '★', TWO: '★★', THREE: '★★★', FOUR: '★★★★', FIVE: '★★★★★',
}

export default function AgencyHotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [partners, setPartners] = useState<Set<string>>(new Set())
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    // Load partner hotel IDs on mount
    fetch('/api/agency/partnerships')
      .then(r => r.json())
      .then(d => {
        if (d.status === 'success') setPartners(new Set(d.data.partnerIds))
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (search) params.set('q', search)
        params.set('pageSize', '20')
        const res = await fetch(`/api/hotels?${params}`)
        const data = await res.json()
        if (data.status === 'success') {
          setHotels(data.data.items)
          setTotal(data.data.total)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [search])

  const togglePartner = async (hotelId: string) => {
    setTogglingId(hotelId)
    try {
      const res = await fetch('/api/agency/partnerships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotelId }),
      })
      const data = await res.json()
      if (res.ok) {
        const isPartner: boolean = data.data.isPartner
        setPartners(prev => {
          const next = new Set(prev)
          if (isPartner) next.add(hotelId)
          else next.delete(hotelId)
          return next
        })
        toast.success(isPartner ? 'Partnership established' : 'Partnership removed')
      } else {
        toast.error(data.error ?? 'Failed to update partnership')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          Partner Hotels
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {partners.size} active partnerships · {total} hotels on platform
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search hotels by name or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2.5 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : hotels.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-sm text-muted-foreground">No hotels found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {hotels.map((hotel) => {
            const isPartner = partners.has(hotel.id)
            return (
              <div key={hotel.id} className={cn(
                'rounded-2xl border bg-card p-4 hover:shadow-card transition-shadow',
                isPartner ? 'border-primary/30' : 'border-border'
              )}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-gradient flex items-center justify-center text-white font-bold flex-shrink-0">
                    {hotel.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={hotel.logoUrl} alt="" className="w-full h-full rounded-xl object-cover" />
                    ) : (
                      hotel.name.charAt(0)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground truncate">{hotel.name}</h3>
                      {hotel.isVerified && <ShieldCheck className="h-4 w-4 text-emerald-500 flex-shrink-0" />}
                      {isPartner && <Badge variant="success" size="sm">Partner</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {hotel.city}, {hotel.country}
                      {hotel.starRating && (
                        <>
                          <span className="mx-1 text-border">·</span>
                          <span className="text-amber-500">{STAR_MAP[hotel.starRating]}</span>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant={isPartner ? 'outline' : 'gradient'}
                      leftIcon={<Handshake className="h-3.5 w-3.5" />}
                      loading={togglingId === hotel.id}
                      onClick={() => togglePartner(hotel.id)}
                    >
                      {isPartner ? 'Remove' : 'Partner'}
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
