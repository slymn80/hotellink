'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Building2, Users, Briefcase } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    role: z.enum(['CANDIDATE', 'HOTEL_EMPLOYER', 'HR_AGENCY']),
    agreeTerms: z.boolean().refine((val) => val === true, 'You must agree to the terms'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

const roles = [
  {
    id: 'CANDIDATE' as const,
    icon: Users,
    labelKey: 'candidate',
    descKey: 'candidateDesc',
    color: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30',
    activeColor: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 ring-emerald-500/30',
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  {
    id: 'HOTEL_EMPLOYER' as const,
    icon: Building2,
    labelKey: 'hotel',
    descKey: 'hotelDesc',
    color: 'border-brand-200 bg-brand-50 dark:border-brand-800 dark:bg-brand-950/30',
    activeColor: 'border-primary bg-primary/5 dark:bg-primary/10 ring-primary/30',
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
  },
  {
    id: 'HR_AGENCY' as const,
    icon: Briefcase,
    labelKey: 'agency',
    descKey: 'agencyDesc',
    color: 'border-violet-200 bg-violet-50 dark:border-violet-800 dark:bg-violet-950/30',
    activeColor: 'border-violet-500 bg-violet-50 dark:bg-violet-950/40 ring-violet-500/30',
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-100 dark:bg-violet-900/30',
  },
]

export default function RegisterPage() {
  const t = useTranslations('auth.register')
  const locale = useLocale()
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = (searchParams.get('role')?.toUpperCase() ?? 'CANDIDATE') as RegisterFormData['role']

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: defaultRole, agreeTerms: false },
  })

  const selectedRole = watch('role')

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok) {
        toast.error(json.error ?? 'Registration failed')
        return
      }

      setSuccess(true)
    } catch {
      toast.error('Something went wrong. Please try again.')
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4 py-8"
      >
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-3xl">
          ✉️
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground">{t('verifyEmail')}</h2>
        <p className="text-muted-foreground">{t('verifyEmailDesc')}</p>
        <Link href={`/${locale}/login`}>
          <Button variant="outline" size="lg" className="mt-4">
            Back to login
          </Button>
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-7"
    >
      {/* Header */}
      <div className="space-y-1.5">
        <h1 className="font-display text-3xl font-bold text-foreground">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Role selector */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">{t('selectRole')}</label>
          <div className="grid grid-cols-3 gap-2">
            {roles.map((role) => {
              const Icon = role.icon
              const isSelected = selectedRole === role.id

              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setValue('role', role.id, { shouldValidate: true })}
                  className={cn(
                    'flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200 text-center',
                    isSelected
                      ? `${role.activeColor} ring-2`
                      : `${role.color} hover:border-opacity-80`
                  )}
                >
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', role.iconBg)}>
                    <Icon className={cn('w-4.5 h-4.5', role.iconColor)} />
                  </div>
                  <div>
                    <div className={cn('text-xs font-semibold', isSelected ? role.iconColor : 'text-foreground')}>
                      {t(role.labelKey as 'candidate' | 'hotel' | 'agency')}
                    </div>
                    <div className="text-2xs text-muted-foreground leading-tight mt-0.5 hidden sm:block">
                      {t(role.descKey as 'candidateDesc' | 'hotelDesc' | 'agencyDesc')}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <Input
          type="text"
          label={t('name')}
          placeholder="John Smith"
          leftIcon={<User className="w-4 h-4" />}
          error={errors.name?.message}
          autoComplete="name"
          required
          {...register('name')}
        />

        <Input
          type="email"
          label={t('email')}
          placeholder="you@example.com"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          autoComplete="email"
          required
          {...register('email')}
        />

        <Input
          type={showPassword ? 'text' : 'password'}
          label={t('password')}
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          error={errors.password?.message}
          hint="Minimum 8 characters"
          autoComplete="new-password"
          required
          {...register('password')}
        />

        <Input
          type={showConfirm ? 'text' : 'password'}
          label={t('confirmPassword')}
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirm((p) => !p)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
          required
          {...register('confirmPassword')}
        />

        {/* Terms */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="agreeTerms"
            className="mt-0.5 w-4 h-4 rounded border-input accent-primary cursor-pointer"
            {...register('agreeTerms')}
          />
          <label htmlFor="agreeTerms" className="text-sm text-muted-foreground cursor-pointer">
            {t('agreeTerms')}{' '}
            <Link href={`/${locale}/terms`} className="text-primary hover:underline">
              Terms
            </Link>{' '}
            &{' '}
            <Link href={`/${locale}/privacy`} className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </label>
        </div>
        {errors.agreeTerms && (
          <p className="text-xs text-destructive">{errors.agreeTerms.message}</p>
        )}

        <Button
          type="submit"
          variant="gradient"
          size="lg"
          className="w-full"
          loading={isSubmitting}
          rightIcon={<ArrowRight className="w-5 h-5" />}
        >
          {t('createAccount')}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {t('haveAccount')}{' '}
        <Link href={`/${locale}/login`} className="text-primary font-medium hover:underline">
          {t('signIn')}
        </Link>
      </p>
    </motion.div>
  )
}
