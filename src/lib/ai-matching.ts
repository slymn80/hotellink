import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// ─── Types ────────────────────────────────────────────────────────────────────

export interface JobForMatching {
  title: string
  department: string
  description?: string | null
  requirements?: string | null
  employmentType: string
  experienceLevel?: string | null
  languages?: string[]
  skills?: string[]
  location: string
}

export interface CandidateForMatching {
  firstName: string
  lastName: string
  headline?: string | null
  bio?: string | null
  nationality?: string | null
  yearsOfExperience?: number | null
  availabilityStatus?: string | null
  languages?: { language: string; level: string }[]
  skills?: { skill: string }[]
  workHistory?: { title: string; department: string; years: number }[]
  education?: { degree: string; field: string }[]
  documents?: { type: string; status: string }[]
}

export type MatchRecommendation = 'Strong Match' | 'Good Match' | 'Partial Match' | 'Weak Match'

export interface MatchResult {
  score: number                    // 0–100
  recommendation: MatchRecommendation
  summary: string                  // 2–3 sentences
  strengths: string[]              // top matching points
  gaps: string[]                   // missing requirements
  tips: string[]                   // suggestions for candidate to improve fit
}

// ─── Core matching function ───────────────────────────────────────────────────

export async function matchCandidateToJob(
  candidate: CandidateForMatching,
  job: JobForMatching
): Promise<MatchResult> {
  const systemPrompt = `You are an expert hospitality HR consultant specializing in Turkish hotel recruitment.
Your task is to evaluate how well a candidate matches a specific hotel job posting.
Return ONLY valid JSON with no markdown or explanation outside the JSON.`

  const userPrompt = `Evaluate this candidate–job match for Turkish hospitality recruitment.

## JOB POSTING
Title: ${job.title}
Department: ${job.department}
Location: ${job.location}
Employment Type: ${job.employmentType}
Experience Level: ${job.experienceLevel ?? 'Not specified'}
Required Languages: ${job.languages?.join(', ') || 'Not specified'}
Required Skills: ${job.skills?.join(', ') || 'Not specified'}
Description: ${job.description ?? 'Not provided'}
Requirements: ${job.requirements ?? 'Not provided'}

## CANDIDATE PROFILE
Name: ${candidate.firstName} ${candidate.lastName}
Headline: ${candidate.headline ?? 'Not provided'}
Nationality: ${candidate.nationality ?? 'Not provided'}
Years of Experience: ${candidate.yearsOfExperience ?? 'Not specified'}
Availability: ${candidate.availabilityStatus ?? 'Unknown'}
Languages: ${candidate.languages?.map((l) => `${l.language} (${l.level})`).join(', ') || 'Not specified'}
Skills: ${candidate.skills?.map((s) => s.skill).join(', ') || 'Not specified'}
Bio: ${candidate.bio ?? 'Not provided'}
Work History: ${candidate.workHistory?.map((w) => `${w.title} in ${w.department} (${w.years} yrs)`).join('; ') || 'Not provided'}
Education: ${candidate.education?.map((e) => `${e.degree} in ${e.field}`).join('; ') || 'Not provided'}
Documents: ${candidate.documents?.map((d) => `${d.type}: ${d.status}`).join(', ') || 'None uploaded'}

Return this exact JSON structure:
{
  "score": <integer 0-100>,
  "recommendation": <"Strong Match" | "Good Match" | "Partial Match" | "Weak Match">,
  "summary": "<2-3 sentence overview of the match>",
  "strengths": ["<point 1>", "<point 2>", "<point 3>"],
  "gaps": ["<gap 1>", "<gap 2>"],
  "tips": ["<tip 1>", "<tip 2>"]
}

Scoring guide:
- 80–100: Strong Match (meets all key requirements, likely excellent fit)
- 60–79: Good Match (meets most requirements, minor gaps)
- 40–59: Partial Match (meets some requirements, notable gaps)
- 0–39: Weak Match (significant misalignment)

Focus on: relevant experience, language skills (Turkish hospitality often requires English + Russian/other), work permit status, availability, and role-specific skills.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
    max_tokens: 600,
  })

  const raw = response.choices[0].message.content ?? '{}'
  const result = JSON.parse(raw) as MatchResult

  // Clamp score to 0–100
  result.score = Math.min(100, Math.max(0, Math.round(result.score)))

  return result
}

// ─── Bulk: rank candidates for a job ─────────────────────────────────────────

export interface RankedCandidate {
  candidateId: string
  score: number
  recommendation: MatchRecommendation
  summary: string
  strengths: string[]
  gaps: string[]
  tips: string[]
}

export async function rankCandidatesForJob(
  candidates: (CandidateForMatching & { id: string })[],
  job: JobForMatching
): Promise<RankedCandidate[]> {
  // Run matches in parallel (max 5 at a time to avoid rate limits)
  const chunkSize = 5
  const results: RankedCandidate[] = []

  for (let i = 0; i < candidates.length; i += chunkSize) {
    const chunk = candidates.slice(i, i + chunkSize)
    const settled = await Promise.allSettled(
      chunk.map(async (c) => {
        const match = await matchCandidateToJob(c, job)
        return {
          candidateId: c.id,
          score: match.score,
          recommendation: match.recommendation,
          summary: match.summary,
          strengths: match.strengths,
          gaps: match.gaps,
          tips: match.tips,
        }
      })
    )
    for (const r of settled) {
      if (r.status === 'fulfilled') results.push(r.value)
    }
  }

  return results.sort((a, b) => b.score - a.score)
}

// ─── Bulk: score jobs for a candidate ────────────────────────────────────────

export interface ScoredJob {
  jobId: string
  score: number
  recommendation: MatchRecommendation
  summary: string
}

export async function scoreJobsForCandidate(
  jobs: (JobForMatching & { id: string })[],
  candidate: CandidateForMatching
): Promise<ScoredJob[]> {
  const chunkSize = 5
  const results: ScoredJob[] = []

  for (let i = 0; i < jobs.length; i += chunkSize) {
    const chunk = jobs.slice(i, i + chunkSize)
    const settled = await Promise.allSettled(
      chunk.map(async (j) => {
        const match = await matchCandidateToJob(candidate, j)
        return { jobId: j.id, score: match.score, recommendation: match.recommendation, summary: match.summary }
      })
    )
    for (const r of settled) {
      if (r.status === 'fulfilled') results.push(r.value)
    }
  }

  return results.sort((a, b) => b.score - a.score)
}
