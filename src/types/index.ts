import type {
  User,
  CandidateProfile,
  Hotel,
  Job,
  Application,
  HotelEmployer,
  HRAgency,
} from '@prisma/client'

// ============================================================
// RE-EXPORTED PRISMA TYPES
// ============================================================
export type {
  User,
  CandidateProfile,
  Hotel,
  Job,
  Application,
  HotelEmployer,
  HRAgency,
  UserRole,
  UserStatus,
  JobStatus,
  JobDepartment,
  JobType,
  ApplicationStatus,
  HotelStatus,
  HotelType,
  HotelStarRating,
  DocumentType,
  DocumentStatus,
  LanguageLevel,
  AvailabilityStatus,
  WorkPermitStatus,
  SubscriptionPlan,
  SubscriptionStatus,
  NotificationType,
} from '@prisma/client'

// ============================================================
// EXTENDED / COMPUTED TYPES
// ============================================================

export type UserWithProfile = User & {
  candidate?: CandidateProfile | null
  hotelEmployer?: (HotelEmployer & { hotel: Hotel }) | null
  hrAgency?: HRAgency | null
}

export type JobWithHotel = Job & {
  hotel: Hotel & {
    _count?: { jobs: number }
  }
  _count?: {
    applications: number
    savedBy: number
  }
}

export type ApplicationWithDetails = Application & {
  job: JobWithHotel
  candidate: CandidateProfile & {
    user: Pick<User, 'id' | 'name' | 'image' | 'email'>
    languages: { language: string; level: string }[]
    skills: { skill: string }[]
  }
}

export type HotelWithDetails = Hotel & {
  jobs?: Job[]
  _count?: {
    jobs: number
    applications: number
    favorites: number
  }
  subscriptions?: { plan: string; status: string }[]
}

export type CandidateWithDetails = CandidateProfile & {
  user: Pick<User, 'id' | 'name' | 'image' | 'email' | 'createdAt'>
  languages: { language: string; level: string }[]
  skills: { skill: string }[]
  departments: { department: string }[]
  experience: {
    id: string
    company: string
    position: string
    startDate: Date
    endDate: Date | null
    isCurrent: boolean
  }[]
  _count?: {
    applications: number
    documents: number
  }
}

// ============================================================
// UI / COMPONENT TYPES
// ============================================================

export interface NavItem {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string | number
  children?: NavItem[]
}

export interface SidebarItem extends NavItem {
  description?: string
  active?: boolean
}

export interface StatsCard {
  label: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: React.ComponentType<{ className?: string }>
  color?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  href?: string
}

export interface FilterOption {
  label: string
  value: string
  count?: number
  icon?: React.ComponentType<{ className?: string }>
}

export interface SelectOption {
  label: string
  value: string
  disabled?: boolean
  description?: string
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
  status: 'success' | 'error'
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface ApiError {
  message: string
  code?: string
  field?: string
}

// ============================================================
// SEARCH / FILTER TYPES
// ============================================================

export interface JobSearchParams {
  query?: string
  city?: string
  country?: string
  department?: string
  type?: string
  salaryMin?: number
  salaryMax?: number
  requiredLanguage?: string
  accommodation?: boolean
  workPermit?: boolean
  nationality?: string[]
  isFeatured?: boolean
  page?: number
  pageSize?: number
  sortBy?: 'relevance' | 'newest' | 'salary_asc' | 'salary_desc'
}

export interface CandidateSearchParams {
  query?: string
  nationality?: string
  department?: string
  language?: string
  experienceMin?: number
  availability?: string
  workPermitStatus?: string
  accommodation?: boolean
  isFeatured?: boolean
  page?: number
  pageSize?: number
}

export interface HotelSearchParams {
  query?: string
  city?: string
  type?: string
  stars?: number
  isFeatured?: boolean
  page?: number
  pageSize?: number
}

// ============================================================
// FORM TYPES
// ============================================================

export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: 'CANDIDATE' | 'HOTEL_EMPLOYER' | 'HR_AGENCY'
  agreeTerms: boolean
}

export interface CandidateProfileFormData {
  firstName: string
  lastName: string
  dateOfBirth?: Date
  gender?: string
  nationality: string
  countryOfResidence?: string
  cityOfResidence?: string
  bio?: string
  headline?: string
  availabilityStatus: string
  expectedSalaryMin?: number
  expectedSalaryMax?: number
  salaryCurrency: string
  yearsOfExperience: number
  workPermitStatus: string
  isOpenToRelocation: boolean
  accommodationRequired: boolean
}

export interface JobPostFormData {
  title: string
  department: string
  type: string
  description: string
  requirements?: string
  responsibilities?: string
  benefits?: string
  experienceMin: number
  experienceMax?: number
  salaryMin?: number
  salaryMax?: number
  salaryCurrency: string
  showSalary: boolean
  requiredLanguages: string[]
  accommodationProvided: boolean
  mealProvided: boolean
  transportProvided: boolean
  visaSponsorship: boolean
  workPermitAssistance: boolean
  applicationDeadline?: Date
  openings: number
}

// ============================================================
// DASHBOARD ANALYTICS TYPES
// ============================================================

export interface AdminStats {
  totalUsers: number
  totalHotels: number
  totalJobs: number
  totalApplications: number
  monthlyRevenue: number
  pendingVerifications: number
  newUsersThisMonth: number
  userGrowthRate: number
}

export interface HotelStats {
  activeJobs: number
  totalApplications: number
  newApplicationsThisWeek: number
  shortlistedCandidates: number
  profileViews: number
  conversionRate: number
}

export interface CandidateStats {
  applicationsCount: number
  savedJobsCount: number
  profileViews: number
  messagesCount: number
  profileScore: number
}

export interface ChartDataPoint {
  name: string
  value: number
  [key: string]: string | number
}

// ============================================================
// NOTIFICATION TYPES
// ============================================================

export interface NotificationItem {
  id: string
  type: string
  title: string
  body: string
  actionUrl?: string
  isRead: boolean
  createdAt: Date
}

// ============================================================
// SUBSCRIPTION & BILLING TYPES
// ============================================================

export interface SubscriptionPlanDetails {
  id: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'
  name: string
  description: string
  monthlyPrice: number
  annualPrice: number
  features: string[]
  limits: {
    jobPostings: number | null
    featuredJobs: number
    candidateViews: number | null
    teamMembers: number | null
  }
  highlighted?: boolean
}

// ============================================================
// LOCALE TYPE
// ============================================================

export type SupportedLocale = 'en' | 'tr' | 'ru'
