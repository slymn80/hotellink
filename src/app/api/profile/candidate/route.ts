import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import type { LanguageLevel } from '@prisma/client'

// GET /api/profile/candidate — Get own candidate profile
export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const profile = await db.candidateProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        languages: true,
        skills: true,
        experience: { orderBy: { startDate: 'desc' } },
        education: { orderBy: { startDate: 'desc' } },
        certifications: true,
        documents: {
          select: { id: true, type: true, fileUrl: true, name: true, status: true },
        },
      },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({ status: 'success', data: profile })
  } catch (error) {
    console.error('[GET /api/profile/candidate]', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

const updateSchema = z.object({
  firstName: z.string().min(1).max(60).optional(),
  lastName: z.string().min(1).max(60).optional(),
  headline: z.string().max(120).optional(),
  bio: z.string().max(2000).optional(),
  cityOfResidence: z.string().max(100).optional(),
  countryOfResidence: z.string().max(100).optional(),
  nationality: z.string().max(100).optional(),
  currentPosition: z.string().max(120).optional(),
  currentCompany: z.string().max(120).optional(),
  yearsOfExperience: z.number().min(0).max(50).optional(),
  availabilityStatus: z.string().optional(),
  isOpenToRelocation: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
  videoIntroUrl: z.string().url().optional().or(z.literal('')),
  skills: z.array(z.string()).optional(),
  languages: z.array(z.object({
    language: z.string(),
    level: z.string(),
  })).optional(),
})

const VALID_LANGUAGE_LEVELS: LanguageLevel[] = [
  'BASIC', 'ELEMENTARY', 'INTERMEDIATE', 'UPPER_INTERMEDIATE', 'ADVANCED', 'NATIVE',
]

// PATCH /api/profile/candidate — Update own candidate profile
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = updateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
    }

    const { skills, languages, availabilityStatus, ...profileData } = parsed.data

    const profile = await db.$transaction(async (tx) => {
      const updated = await tx.candidateProfile.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          firstName: profileData.firstName ?? '',
          lastName: profileData.lastName ?? '',
          nationality: profileData.nationality ?? '',
          profileScore: 10,
          ...profileData,
          ...(availabilityStatus && {
            availabilityStatus: availabilityStatus as import('@prisma/client').AvailabilityStatus,
          }),
        },
        update: {
          ...profileData,
          ...(availabilityStatus && {
            availabilityStatus: availabilityStatus as import('@prisma/client').AvailabilityStatus,
          }),
        },
      })

      if (skills !== undefined) {
        await tx.candidateSkill.deleteMany({ where: { candidateId: updated.id } })
        if (skills.length > 0) {
          await tx.candidateSkill.createMany({
            data: skills.map((skill) => ({ candidateId: updated.id, skill })),
          })
        }
      }

      if (languages !== undefined) {
        await tx.candidateLanguage.deleteMany({ where: { candidateId: updated.id } })
        if (languages.length > 0) {
          await tx.candidateLanguage.createMany({
            data: languages
              .filter((l) => VALID_LANGUAGE_LEVELS.includes(l.level as LanguageLevel))
              .map((l) => ({
                candidateId: updated.id,
                language: l.language,
                level: l.level as LanguageLevel,
              })),
          })
        }
      }

      return updated
    })

    return NextResponse.json({ status: 'success', data: profile })
  } catch (error) {
    console.error('[PATCH /api/profile/candidate]', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
