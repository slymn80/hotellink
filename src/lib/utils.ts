import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format, type Locale } from 'date-fns'
import { enUS, tr, ru } from 'date-fns/locale'

// ============================================================
// TAILWIND CLASS UTILITY
// ============================================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================================
// DATE FORMATTING
// ============================================================

const dateLocales: Record<string, Locale> = {
  en: enUS,
  tr: tr,
  ru: ru,
}

export function formatRelativeDate(date: Date | string, locale = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(d, {
    addSuffix: true,
    locale: dateLocales[locale] ?? enUS,
  })
}

export function formatDate(
  date: Date | string,
  formatStr = 'MMM dd, yyyy',
  locale = 'en'
): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, formatStr, {
    locale: dateLocales[locale] ?? enUS,
  })
}

// ============================================================
// NUMBER & CURRENCY FORMATTING
// ============================================================

export function formatCurrency(
  amount: number,
  currency = 'USD',
  locale = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(num: number, locale = 'en-US'): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`
  }
  return new Intl.NumberFormat(locale).format(num)
}

export function formatSalaryRange(
  min?: number | null,
  max?: number | null,
  currency = 'USD'
): string {
  if (!min && !max) return 'Negotiable'
  if (!max) return `${formatCurrency(min!, currency)}+`
  if (!min) return `Up to ${formatCurrency(max, currency)}`
  return `${formatCurrency(min, currency)} – ${formatCurrency(max, currency)}`
}

// ============================================================
// STRING UTILITIES
// ============================================================

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return `${str.slice(0, maxLength)}...`
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

// ============================================================
// URL UTILITIES
// ============================================================

export function buildUrl(
  base: string,
  params: Record<string, string | number | boolean | undefined | null>
): string {
  const url = new URL(base, 'http://placeholder')
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  })
  return url.pathname + url.search
}

// ============================================================
// PROFILE SCORE CALCULATION
// ============================================================

export function calculateProfileScore(candidate: {
  firstName?: string | null
  lastName?: string | null
  bio?: string | null
  profilePhoto?: string | null
  nationality?: string | null
  languages?: unknown[]
  experience?: unknown[]
  education?: unknown[]
  certifications?: unknown[]
  documents?: unknown[]
  linkedinUrl?: string | null
  headline?: string | null
}): number {
  let score = 0

  if (candidate.firstName && candidate.lastName) score += 15
  if (candidate.bio && candidate.bio.length > 50) score += 10
  if (candidate.profilePhoto) score += 10
  if (candidate.headline) score += 5
  if (candidate.nationality) score += 5
  if (candidate.languages && candidate.languages.length > 0) score += 10
  if (candidate.experience && candidate.experience.length > 0) score += 20
  if (candidate.education && candidate.education.length > 0) score += 10
  if (candidate.certifications && candidate.certifications.length > 0) score += 5
  if (candidate.documents && candidate.documents.length >= 2) score += 5
  if (candidate.linkedinUrl) score += 5

  return Math.min(score, 100)
}

// ============================================================
// VALIDATION HELPERS
// ============================================================

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function isValidPhone(phone: string): boolean {
  return /^\+?[\d\s\-()]{8,15}$/.test(phone)
}

// ============================================================
// FILE UTILITIES
// ============================================================

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() ?? ''
}

export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024 // 10MB
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

// ============================================================
// ARRAY UTILITIES
// ============================================================

export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array))
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (groups, item) => {
      const groupKey = String(item[key])
      return {
        ...groups,
        [groupKey]: [...(groups[groupKey] || []), item],
      }
    },
    {} as Record<string, T[]>
  )
}

// ============================================================
// ASYNC UTILITIES
// ============================================================

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ============================================================
// DEPARTMENT LABELS
// ============================================================

export const DEPARTMENT_LABELS: Record<string, string> = {
  RECEPTION: 'Reception',
  GUEST_RELATIONS: 'Guest Relations',
  HOUSEKEEPING: 'Housekeeping',
  KITCHEN: 'Kitchen & Chef',
  FOOD_BEVERAGE: 'Food & Beverage',
  SPA_WELLNESS: 'Spa & Wellness',
  ANIMATION_ENTERTAINMENT: 'Animation & Entertainment',
  TECHNICAL_MAINTENANCE: 'Technical & Maintenance',
  SECURITY: 'Security',
  MANAGEMENT: 'Management',
  IT: 'IT',
  ACCOUNTING: 'Accounting',
  SALES_MARKETING: 'Sales & Marketing',
  HUMAN_RESOURCES: 'Human Resources',
  OTHER: 'Other',
}

export const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  SEASONAL: 'Seasonal',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
}

export const LANGUAGE_LEVEL_LABELS: Record<string, string> = {
  BASIC: 'Basic',
  ELEMENTARY: 'Elementary',
  INTERMEDIATE: 'Intermediate',
  UPPER_INTERMEDIATE: 'Upper Intermediate',
  ADVANCED: 'Advanced',
  NATIVE: 'Native',
}

export const AVAILABILITY_LABELS: Record<string, string> = {
  IMMEDIATELY_AVAILABLE: 'Immediately Available',
  AVAILABLE_IN_2_WEEKS: 'Available in 2 Weeks',
  AVAILABLE_IN_1_MONTH: 'Available in 1 Month',
  AVAILABLE_IN_3_MONTHS: 'Available in 3 Months',
  NOT_LOOKING: 'Not Looking',
}

// ============================================================
// COUNTRY FLAGS HELPER (emoji flags)
// ============================================================

export function getCountryFlag(countryCode: string): string {
  const code = countryCode.toUpperCase()
  if (code.length !== 2) return '🌍'
  return String.fromCodePoint(
    0x1f1e6 - 65 + code.charCodeAt(0),
    0x1f1e6 - 65 + code.charCodeAt(1)
  )
}

// ============================================================
// STAR RATING
// ============================================================

export function starRatingToNumber(rating: string): number {
  const map: Record<string, number> = {
    ONE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    FIVE: 5,
  }
  return map[rating] ?? 0
}
