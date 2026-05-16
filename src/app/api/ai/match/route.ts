import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { matchCandidateToJob, rankCandidatesForJob, scoreJobsForCandidate } from '@/lib/ai-matching'

if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
  console.warn('[AI Match] OPENAI_API_KEY is not configured.')
}

function noApiKey() {
  return NextResponse.json({ error: 'AI matching is not configured. Please set OPENAI_API_KEY.' }, { status: 503 })
}

function buildCandidateData(profile: NonNullable<Awaited<ReturnType<typeof fetchCandidateProfile>>>) {
  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    headline: profile.headline,
    bio: profile.bio,
    nationality: profile.nationality,
    yearsOfExperience: profile.yearsOfExperience,
    availabilityStatus: profile.availabilityStatus,
    languages: profile.languages,
    skills: profile.skills,
    workHistory: profile.experience?.map((w) => ({
      title: w.position,
      department: w.department ?? 'OTHER',
      years: w.endDate
        ? Math.round((w.endDate.getTime() - w.startDate.getTime()) / (1000 * 60 * 60 * 24 * 365))
        : Math.round((Date.now() - w.startDate.getTime()) / (1000 * 60 * 60 * 24 * 365)),
    })) ?? [],
    documents: profile.documents?.map((d) => ({ type: d.type, status: d.status })) ?? [],
  }
}

async function fetchCandidateProfile(userId: string) {
  return db.candidateProfile.findUnique({
    where: { userId },
    include: {
      languages: true,
      skills: true,
      experience: true,
      education: true,
      documents: { where: { status: 'VERIFIED' } },
    },
  })
}

/**
 * POST /api/ai/match
 *
 * { mode: 'score_jobs_for_candidate' }
 *   → Auto-ranks all active jobs for the logged-in candidate
 *
 * { mode: 'candidate_to_job', jobId }
 *   → Full MatchResult (strengths/gaps/tips) for one job
 *
 * { mode: 'job_to_candidates', jobId, candidateIds? }
 *   → Ranked candidate list for a job (hotel/admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      return noApiKey()
    }

    const body = await req.json()
    const { mode } = body as { mode: string }

    // ── Auto-rank all jobs for the candidate ──────────────────────────────
    if (mode === 'score_jobs_for_candidate') {
      if (session.user.role !== 'CANDIDATE') {
        return NextResponse.json({ error: 'Candidates only' }, { status: 403 })
      }

      const profile = await fetchCandidateProfile(session.user.id)
      if (!profile) {
        return NextResponse.json({ error: 'Complete your profile before running AI match' }, { status: 400 })
      }

      const jobs = await db.job.findMany({
        where: { status: 'ACTIVE', deletedAt: null },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        take: 20,
        include: { hotel: { select: { name: true, city: true, country: true } } },
      })

      if (jobs.length === 0) {
        return NextResponse.json({ status: 'success', data: [] })
      }

      const jobsForAI = jobs.map((j) => ({
        id: j.id,
        title: j.title,
        department: j.department as string,
        description: j.description,
        requirements: j.requirements,
        employmentType: j.type as string,
        experienceLevel: j.experienceMin ? `${j.experienceMin}+ years` : null,
        location: `${j.hotel.city}, ${j.hotel.country}`,
        languages: j.requiredLanguages ?? [],
        skills: [],
      }))

      const scored = await scoreJobsForCandidate(jobsForAI, buildCandidateData(profile))

      const jobMap = new Map(jobs.map((j) => [j.id, j]))
      const result = scored
        .map((s) => {
          const j = jobMap.get(s.jobId)
          if (!j) return null
          return {
            ...s,
            job: {
              id: j.id,
              title: j.title,
              slug: j.slug,
              department: j.department as string,
              type: j.type as string,
              accommodationProvided: j.accommodationProvided,
              visaSponsorship: j.visaSponsorship,
              salaryMin: j.salaryMin,
              salaryMax: j.salaryMax,
              salaryCurrency: j.salaryCurrency,
              hotel: { name: j.hotel.name, city: j.hotel.city },
            },
          }
        })
        .filter(Boolean)

      return NextResponse.json({ status: 'success', data: result })
    }

    // ── Fetch job for the remaining modes ─────────────────────────────────
    const { jobId } = body as { jobId?: string }
    if (!jobId) return NextResponse.json({ error: 'jobId required' }, { status: 400 })

    const job = await db.job.findUnique({
      where: { id: jobId },
      include: { hotel: { select: { city: true, country: true } } },
    })
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

    const jobData = {
      title: job.title,
      department: job.department as string,
      description: job.description,
      requirements: job.requirements,
      employmentType: job.type as string,
      experienceLevel: job.experienceMin ? `${job.experienceMin}+ years` : null,
      location: `${job.hotel.city}, ${job.hotel.country}`,
      languages: job.requiredLanguages ?? [],
      skills: [],
    }

    // ── Full match for one candidate ↔ job ───────────────────────────────
    if (mode === 'candidate_to_job') {
      if (session.user.role !== 'CANDIDATE') {
        return NextResponse.json({ error: 'Candidates only' }, { status: 403 })
      }

      const profile = await fetchCandidateProfile(session.user.id)
      if (!profile) {
        return NextResponse.json({ error: 'Complete your profile before running AI match' }, { status: 400 })
      }

      const result = await matchCandidateToJob(buildCandidateData(profile), jobData)
      return NextResponse.json({ status: 'success', data: result })
    }

    // ── Rank candidates for a job (hotel/admin) ───────────────────────────
    if (mode === 'job_to_candidates') {
      if (!['HOTEL_EMPLOYER', 'ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }

      const candidateIds: string[] | undefined = body.candidateIds

      const profiles = await db.candidateProfile.findMany({
        where: candidateIds ? { id: { in: candidateIds } } : { availabilityStatus: { not: 'NOT_LOOKING' } },
        include: { languages: true, skills: true, experience: true, education: true, documents: { where: { status: 'VERIFIED' } } },
        take: 20,
      })

      const candidates = profiles.map((p) => ({
        id: p.id,
        ...buildCandidateData(p),
      }))

      const ranked = await rankCandidatesForJob(candidates, jobData)

      // Join back profile details
      const profileMap = new Map(profiles.map((p) => [p.id, p]))
      const result = ranked.map((r) => {
        const p = profileMap.get(r.candidateId)
        return {
          ...r,
          candidate: p
            ? {
                id: p.id,
                firstName: p.firstName,
                lastName: p.lastName,
                headline: p.headline,
                nationality: p.nationality,
                yearsOfExperience: p.yearsOfExperience,
                profilePhoto: p.profilePhoto,
                availabilityStatus: p.availabilityStatus,
              }
            : null,
        }
      })

      return NextResponse.json({ status: 'success', data: { ranked: result, total: result.length } })
    }

    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
  } catch (error) {
    console.error('[POST /api/ai/match]', error)
    const message = error instanceof Error ? error.message : 'AI matching failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
