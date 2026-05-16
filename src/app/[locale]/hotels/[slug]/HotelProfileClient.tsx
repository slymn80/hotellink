'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  MapPin, Globe, Mail, Phone, Star, BadgeCheck, Users,
  Building2, ChevronRight, Heart, ExternalLink,
  Briefcase, Clock, Home, UtensilsCrossed, Car,
  Heart as HeartIcon, Shirt, X, ChevronLeft, ChevronRight as ChevronRightIcon,
  Linkedin, Instagram, CalendarDays,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DEPARTMENT_LABELS, JOB_TYPE_LABELS } from '@/lib/utils'
import { toast } from 'sonner'

const STAR_MAP: Record<string, number> = {
  ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5,
}

const AMENITY_LABELS: Record<string, string> = {
  spa: 'Spa & Wellness', pool: 'Swimming Pool', gym: 'Fitness Center',
  restaurant: 'Restaurant', bar: 'Bar & Lounge', conference: 'Conference Center',
  valet: 'Valet Parking', concierge: 'Concierge Service', kids_club: 'Kids Club',
  private_beach: 'Private Beach', golf: 'Golf Course', marina: 'Marina',
  tennis: 'Tennis Courts', casino: 'Casino', water_sports: 'Water Sports',
  animation: 'Entertainment', sailing_school: 'Sailing School',
}

interface Review {
  id: string
  rating: number
  title: string | null
  content: string | null
  isAnonymous: boolean
  createdAt: string
  candidate: {
    firstName: string
    lastName: string
    profilePhoto: string | null
    currentPosition: string | null
  }
}

interface HotelProfileClientProps {
  hotel: {
    id: string
    name: string
    slug: string
    description: string | null
    shortDescription: string | null
    type: string
    starRating: string
    city: string
    country: string
    address: string | null
    website: string | null
    email: string | null
    phone: string | null
    logoUrl: string | null
    coverImageUrl: string | null
    isVerified: boolean
    isFeatured: boolean
    amenities: string[]
    galleryUrls: string[]
    accommodationPhotoUrls: string[]
    averageRating: number | null
    reviewCount: number
    viewCount: number
    roomCount: number | null
    employeeCount: number | null
    foundedYear: number | null
    languages: string[]
    linkedinUrl: string | null
    instagramUrl: string | null
    // Working conditions
    accommodationProvided: boolean
    accommodationDescription: string | null
    mealProvided: boolean
    transportProvided: boolean
    healthInsurance: boolean
    uniformProvided: boolean
    daysOffPerWeek: number | null
    workingHoursInfo: string | null
    workingConditionsNotes: string | null
    _count: { jobs: number; favorites: number }
    jobs: Array<{
      id: string
      title: string
      slug: string
      department: string
      type: string
      salaryMin: number | null
      salaryMax: number | null
      salaryCurrency: string
      showSalary: boolean
      accommodationProvided: boolean
      workPermitAssistance: boolean
      isFeatured: boolean
      openings: number
    }>
    reviews: Review[]
  }
  locale: string
}

export function HotelProfileClient({ hotel, locale }: HotelProfileClientProps) {
  const starCount = STAR_MAP[hotel.starRating] ?? 0
  const [favorited, setFavorited] = useState(false)
  const [savingFav, setSavingFav] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [lightboxType, setLightboxType] = useState<'gallery' | 'accommodation'>('gallery')

  const allGallery = hotel.galleryUrls ?? []
  const allAccommodation = hotel.accommodationPhotoUrls ?? []
  const activeLightboxPhotos = lightboxType === 'gallery' ? allGallery : allAccommodation

  const hasWorkingConditions =
    hotel.accommodationProvided || hotel.mealProvided || hotel.transportProvided ||
    hotel.healthInsurance || hotel.uniformProvided || hotel.daysOffPerWeek != null ||
    hotel.workingHoursInfo || hotel.workingConditionsNotes

  const toggleFavorite = async () => {
    setSavingFav(true)
    try {
      const res = await fetch(`/api/hotels/${hotel.id}/favorite`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setFavorited(data.favorited)
        toast.success(data.favorited ? 'Hotel saved to favorites' : 'Hotel removed from favorites')
      } else if (res.status === 401) {
        toast.error('Sign in to save hotels')
      }
    } catch {
      toast.error('Failed to update favorites')
    } finally {
      setSavingFav(false)
    }
  }

  return (
    <main className="min-h-screen bg-background pt-20">
      {/* Cover */}
      <div className="relative h-56 w-full overflow-hidden bg-gradient-to-r from-brand-600 via-ocean-600 to-brand-800 lg:h-80">
        {hotel.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={hotel.coverImageUrl} alt={hotel.name} className="h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </div>

      <div className="container mx-auto max-w-5xl px-4">
        {/* Hotel header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="-mt-10 mb-6 flex flex-col sm:flex-row sm:items-end gap-4"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-background bg-gradient-to-br from-brand-500 to-ocean-600 text-white text-2xl font-bold shadow-lg flex-shrink-0">
            {hotel.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={hotel.logoUrl} alt="" className="h-full w-full rounded-xl object-cover" />
            ) : (
              hotel.name.charAt(0)
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-foreground">{hotel.name}</h1>
              {hotel.isVerified && (
                <Badge variant="verified" size="sm">
                  <BadgeCheck className="mr-1 h-3 w-3" /> Verified
                </Badge>
              )}
              {hotel.isFeatured && <Badge variant="featured" size="sm">Featured</Badge>}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {hotel.city}, {hotel.country}
              </span>
              <span className="text-amber-500 font-medium">
                {'★'.repeat(starCount)} <span className="text-muted-foreground">{hotel.type}</span>
              </span>
              {hotel.averageRating && hotel.reviewCount > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {hotel.averageRating.toFixed(1)}
                  <span className="text-xs">({hotel.reviewCount})</span>
                </span>
              )}
              <span className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" />
                {hotel._count.jobs} open positions
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant={favorited ? 'gradient' : 'outline'}
              size="sm"
              loading={savingFav}
              leftIcon={<Heart className={`h-4 w-4 ${favorited ? 'fill-current' : ''}`} />}
              onClick={toggleFavorite}
            >
              {favorited ? 'Saved' : 'Save'}
            </Button>
            {hotel.website && (
              <a href={hotel.website} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" leftIcon={<ExternalLink className="h-4 w-4" />}>
                  Website
                </Button>
              </a>
            )}
          </div>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            {hotel.description && (
              <motion.section
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <h2 className="mb-3 text-lg font-semibold text-foreground">About {hotel.name}</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{hotel.description}</p>
              </motion.section>
            )}

            {/* Gallery */}
            {allGallery.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <h2 className="mb-4 text-lg font-semibold text-foreground">Gallery</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {allGallery.slice(0, 8).map((url, i) => (
                    <button
                      key={url}
                      onClick={() => { setLightboxType('gallery'); setLightboxIndex(i) }}
                      className="relative aspect-square overflow-hidden rounded-xl focus:outline-none"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="h-full w-full object-cover hover:scale-105 transition-transform duration-200" />
                      {i === 7 && allGallery.length > 8 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-sm font-semibold">
                          +{allGallery.length - 8}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Amenities */}
            {hotel.amenities.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <h2 className="mb-4 text-lg font-semibold text-foreground">Hotel Facilities</h2>
                <div className="flex flex-wrap gap-2">
                  {hotel.amenities.map((amenity) => (
                    <Badge key={amenity} variant="secondary">{AMENITY_LABELS[amenity] ?? amenity}</Badge>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Working conditions */}
            {hasWorkingConditions && (
              <motion.section
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <h2 className="mb-4 text-lg font-semibold text-foreground">Working Conditions & Benefits</h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  {[
                    { active: hotel.accommodationProvided, icon: Home, label: 'Accommodation' },
                    { active: hotel.mealProvided, icon: UtensilsCrossed, label: 'Meals Provided' },
                    { active: hotel.transportProvided, icon: Car, label: 'Transport' },
                    { active: hotel.healthInsurance, icon: HeartIcon, label: 'Health Insurance' },
                    { active: hotel.uniformProvided, icon: Shirt, label: 'Uniform' },
                  ].map(({ active, icon: Icon, label }) => (
                    <div key={label} className={`flex items-center gap-2 rounded-xl p-3 text-sm font-medium ${
                      active
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                        : 'bg-muted/40 text-muted-foreground line-through'
                    }`}>
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {label}
                    </div>
                  ))}
                  {hotel.daysOffPerWeek != null && (
                    <div className="flex items-center gap-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 p-3 text-sm font-medium text-blue-700 dark:text-blue-400">
                      <CalendarDays className="h-4 w-4 flex-shrink-0" />
                      {hotel.daysOffPerWeek} days off/week
                    </div>
                  )}
                  {hotel.workingHoursInfo && (
                    <div className="flex items-center gap-2 rounded-xl bg-muted/40 p-3 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      {hotel.workingHoursInfo}
                    </div>
                  )}
                </div>

                {hotel.workingConditionsNotes && (
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{hotel.workingConditionsNotes}</p>
                )}

                {/* Accommodation section */}
                {hotel.accommodationProvided && (hotel.accommodationDescription || allAccommodation.length > 0) && (
                  <div className="border-t border-border pt-4 mt-4 space-y-3">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Home className="h-4 w-4 text-primary" /> Accommodation Details
                    </h3>
                    {hotel.accommodationDescription && (
                      <p className="text-sm text-muted-foreground leading-relaxed">{hotel.accommodationDescription}</p>
                    )}
                    {allAccommodation.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {allAccommodation.slice(0, 6).map((url, i) => (
                          <button
                            key={url}
                            onClick={() => { setLightboxType('accommodation'); setLightboxIndex(i) }}
                            className="relative aspect-square overflow-hidden rounded-xl"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt="" className="h-full w-full object-cover hover:scale-105 transition-transform duration-200" />
                            {i === 5 && allAccommodation.length > 6 && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-sm font-semibold">
                                +{allAccommodation.length - 6}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.section>
            )}

            {/* Open positions */}
            {hotel.jobs.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <h2 className="mb-4 text-lg font-semibold text-foreground">
                  Open Positions ({hotel.jobs.length})
                </h2>
                <div className="space-y-3">
                  {hotel.jobs.map((job) => (
                    <Link key={job.id} href={`/${locale}/jobs/${job.slug}`}>
                      <div className="group flex items-center justify-between rounded-xl border border-border bg-background p-4 transition-all hover:border-primary/40 hover:bg-primary/5">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                              {job.title}
                            </h3>
                            {job.isFeatured && <Badge variant="featured" size="sm">Featured</Badge>}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{DEPARTMENT_LABELS[job.department as keyof typeof DEPARTMENT_LABELS] ?? job.department}</span>
                            <span>{JOB_TYPE_LABELS[job.type as keyof typeof JOB_TYPE_LABELS] ?? job.type}</span>
                            {job.showSalary && job.salaryMin && (
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                ${job.salaryMin.toLocaleString()}+/{job.salaryCurrency}
                              </span>
                            )}
                          </div>
                          <div className="mt-1.5 flex gap-1.5">
                            {job.accommodationProvided && <Badge variant="success" size="sm">Housing</Badge>}
                            {job.workPermitAssistance && <Badge variant="info" size="sm">Work Permit</Badge>}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Staff reviews */}
            {hotel.reviews.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Staff Reviews</h2>
                  {hotel.averageRating && hotel.reviewCount > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`h-4 w-4 ${s <= Math.round(hotel.averageRating!) ? 'fill-amber-400 text-amber-400' : 'text-border'}`} />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-foreground">{hotel.averageRating.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">({hotel.reviewCount})</span>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {hotel.reviews.map((review) => {
                    const name = review.isAnonymous
                      ? 'Anonymous'
                      : `${review.candidate.firstName} ${review.candidate.lastName.charAt(0)}.`
                    const photo = review.isAnonymous ? null : review.candidate.profilePhoto
                    return (
                      <div key={review.id} className="flex gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-ocean-600 text-white text-sm font-bold overflow-hidden">
                          {photo
                            ? <img src={photo} alt="" className="h-full w-full object-cover" /> // eslint-disable-line @next/next/no-img-element
                            : name.charAt(0)
                          }
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div>
                              <span className="text-sm font-semibold text-foreground">{name}</span>
                              {!review.isAnonymous && review.candidate.currentPosition && (
                                <span className="text-xs text-muted-foreground ml-2">{review.candidate.currentPosition}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map(s => (
                                <Star key={s} className={`h-3 w-3 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-border'}`} />
                              ))}
                            </div>
                          </div>
                          {review.title && <p className="text-sm font-medium text-foreground mt-1">{review.title}</p>}
                          {review.content && <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{review.content}</p>}
                          <p className="text-xs text-muted-foreground mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Contact */}
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <h3 className="mb-3 font-semibold text-foreground text-sm">Contact & Info</h3>
              <div className="space-y-3 text-sm">
                {hotel.address && (
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{hotel.address}</span>
                  </div>
                )}
                {hotel.email && (
                  <a href={`mailto:${hotel.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{hotel.email}</span>
                  </a>
                )}
                {hotel.phone && (
                  <a href={`tel:${hotel.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span>{hotel.phone}</span>
                  </a>
                )}
                {hotel.roomCount && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4 flex-shrink-0" />
                    <span>{hotel.roomCount} rooms</span>
                  </div>
                )}
                {hotel.employeeCount && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4 flex-shrink-0" />
                    <span>{hotel.employeeCount} employees</span>
                  </div>
                )}
                {hotel.foundedYear && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="h-4 w-4 flex-shrink-0" />
                    <span>Est. {hotel.foundedYear}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4 flex-shrink-0" />
                  <span>{hotel._count.favorites} people saved this hotel</span>
                </div>
              </div>

              {/* Social links */}
              {(hotel.linkedinUrl || hotel.instagramUrl) && (
                <div className="mt-4 flex gap-2 border-t border-border pt-3">
                  {hotel.linkedinUrl && (
                    <a href={hotel.linkedinUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                      <Linkedin className="h-4 w-4" /> LinkedIn
                    </a>
                  )}
                  {hotel.instagramUrl && (
                    <a href={hotel.instagramUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                      <Instagram className="h-4 w-4" /> Instagram
                    </a>
                  )}
                </div>
              )}
            </motion.div>

            {/* Languages */}
            {hotel.languages && hotel.languages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <h3 className="mb-3 font-semibold text-foreground text-sm">Languages Spoken</h3>
                <div className="flex flex-wrap gap-1.5">
                  {hotel.languages.map((lang) => (
                    <Badge key={lang} variant="secondary" size="sm">{lang}</Badge>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Quick apply */}
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="rounded-2xl bg-gradient-to-br from-brand-500 to-ocean-600 p-5 text-white"
            >
              <h3 className="font-semibold mb-2">Interested in working here?</h3>
              <p className="text-sm text-white/80 mb-4">
                Browse all {hotel._count.jobs} open positions and apply today.
              </p>
              <Link href={`/${locale}/jobs?hotel=${hotel.id}`}>
                <Button variant="glass" size="sm" className="w-full">
                  View All Jobs
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && activeLightboxPhotos.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightboxIndex(null)}>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => i! > 0 ? i! - 1 : activeLightboxPhotos.length - 1) }}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeLightboxPhotos[lightboxIndex]}
            alt=""
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => i! < activeLightboxPhotos.length - 1 ? i! + 1 : 0) }}
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
          <button
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            onClick={() => setLightboxIndex(null)}
          >
            <X className="h-5 w-5" />
          </button>
          <div className="absolute bottom-4 text-white/60 text-sm">
            {lightboxIndex + 1} / {activeLightboxPhotos.length}
          </div>
        </div>
      )}
    </main>
  )
}
