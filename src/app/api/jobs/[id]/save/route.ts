import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

// POST /api/jobs/[id]/save — Toggle save/unsave a job
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const candidate = await db.candidateProfile.findUnique({
      where: { userId: session.user.id },
    })
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate profile not found' }, { status: 404 })
    }

    const job = await db.job.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }], deletedAt: null },
    })
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const existing = await db.savedJob.findUnique({
      where: { candidateId_jobId: { candidateId: candidate.id, jobId: job.id } },
    })

    if (existing) {
      await db.savedJob.delete({ where: { id: existing.id } })
      return NextResponse.json({ status: 'success', saved: false })
    } else {
      await db.savedJob.create({ data: { candidateId: candidate.id, jobId: job.id } })
      return NextResponse.json({ status: 'success', saved: true })
    }
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
