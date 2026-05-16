'use client'

import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const testimonials = [
  {
    id: 1,
    name: 'Mehmet Y.',
    role: 'HR Director',
    company: '5-Star Resort, Antalya',
    location: 'Antalya, Türkiye',
    flag: '🇹🇷',
    avatar: 'MY',
    rating: 5,
    text: "HotelLink transformed how we hire international staff. We filled 15 positions in our peak season with verified, qualified candidates from 8 different countries. The work permit support is invaluable — we no longer need to navigate the bureaucracy alone.",
    highlight: 'Filled 15 positions in one season',
    color: 'from-brand-500/10 to-ocean-500/10',
    border: 'border-brand-200 dark:border-brand-800',
  },
  {
    id: 2,
    name: 'Olena P.',
    role: 'Head Chef',
    company: 'Luxury Hotel, Belek',
    location: 'Kyiv, Ukraine → Antalya, Türkiye',
    flag: '🇺🇦',
    avatar: 'OP',
    rating: 5,
    text: "I found my dream job at a 5-star resort in Antalya through HotelLink. The platform is available in my language, and the work permit support team helped me through every step. I started working legally within 6 weeks of applying.",
    highlight: 'Legal employment in 6 weeks',
    color: 'from-emerald-500/10 to-teal-500/10',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  {
    id: 3,
    name: 'Dmitri S.',
    role: 'F&B Manager',
    company: 'Resort Hotel, Marmaris',
    location: 'Moscow, Russia → Marmaris, Türkiye',
    flag: '🇷🇺',
    avatar: 'DS',
    rating: 5,
    text: "Платформа на русском языке — это огромный плюс. Я нашёл отличную позицию менеджера в ресторане за 3 недели. Команда HotelLink помогла с документами для рабочей визы и всегда была на связи.",
    highlight: 'Found position in 3 weeks',
    color: 'from-violet-500/10 to-purple-500/10',
    border: 'border-violet-200 dark:border-violet-800',
  },
  {
    id: 4,
    name: 'Aizat B.',
    role: 'Spa Therapist',
    company: 'Beach Resort, Bodrum',
    location: 'Almaty, Kazakhstan → Bodrum, Türkiye',
    flag: '🇰🇿',
    avatar: 'AB',
    rating: 5,
    text: "As a Kazakh national, I was unsure about working in Turkey. HotelLink's team explained everything clearly. The hotel found me through my profile — I didn't even apply! The accommodation was included, making the transition so much easier.",
    highlight: 'Hotel approached me directly',
    color: 'from-gold-500/10 to-amber-500/10',
    border: 'border-gold-200 dark:border-gold-800',
  },
  {
    id: 5,
    name: 'Selin A.',
    role: 'General Manager',
    company: 'Boutique Hotel, Antalya',
    location: 'Antalya, Türkiye',
    flag: '🇹🇷',
    avatar: 'SA',
    rating: 5,
    text: "As a boutique hotel, we can't afford expensive recruitment agencies. HotelLink's Professional plan gives us everything we need at a fraction of the cost. The candidate quality is exceptional — we hired a multilingual receptionist who speaks 4 languages.",
    highlight: '4-language receptionist hired',
    color: 'from-pink-500/10 to-rose-500/10',
    border: 'border-pink-200 dark:border-pink-800',
  },
]

export function Testimonials() {
  const t = useTranslations('testimonials')
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const [activeIndex, setActiveIndex] = useState(0)

  const handlePrev = () =>
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  const handleNext = () =>
    setActiveIndex((prev) => (prev + 1) % testimonials.length)

  return (
    <section className="py-20 lg:py-28 bg-background overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
            Success Stories
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 max-w-3xl mx-auto">
            {t('title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t('subtitle')}</p>
        </motion.div>

        {/* Featured testimonial */}
        <div className="max-w-4xl mx-auto mb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4 }}
              className={cn(
                'relative rounded-3xl p-8 lg:p-10 border bg-gradient-to-br',
                testimonials[activeIndex].color,
                testimonials[activeIndex].border
              )}
            >
              <Quote className="absolute top-6 right-8 w-10 h-10 text-foreground/5 rotate-180" />

              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {Array.from({ length: testimonials[activeIndex].rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-gold-400 fill-gold-400" />
                ))}
              </div>

              {/* Highlight badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-5 border border-primary/20">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                {testimonials[activeIndex].highlight}
              </div>

              {/* Quote */}
              <blockquote className="text-lg lg:text-xl text-foreground leading-relaxed mb-8">
                "{testimonials[activeIndex].text}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-gradient flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {testimonials[activeIndex].avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      {testimonials[activeIndex].name}
                    </span>
                    <span>{testimonials[activeIndex].flag}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {testimonials[activeIndex].role} · {testimonials[activeIndex].company}
                  </div>
                  <div className="text-xs text-muted-foreground/70 mt-0.5">
                    📍 {testimonials[activeIndex].location}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={handlePrev}
              className="w-10 h-10 rounded-xl border border-border hover:border-primary/50 flex items-center justify-center text-muted-foreground hover:text-primary transition-all duration-200"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    'rounded-full transition-all duration-300',
                    i === activeIndex
                      ? 'w-6 h-2 bg-primary'
                      : 'w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/60'
                  )}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="w-10 h-10 rounded-xl border border-border hover:border-primary/50 flex items-center justify-center text-muted-foreground hover:text-primary transition-all duration-200"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Thumbnail row */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {testimonials.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setActiveIndex(i)}
              className={cn(
                'flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all duration-200 text-sm',
                i === activeIndex
                  ? 'border-primary/40 bg-primary/5 text-foreground'
                  : 'border-border text-muted-foreground hover:border-border/80 hover:text-foreground'
              )}
            >
              <span className="text-base">{t.flag}</span>
              <span className="font-medium">{t.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
