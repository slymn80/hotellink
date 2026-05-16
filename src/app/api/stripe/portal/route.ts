import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' })

// POST /api/stripe/portal — Create Stripe Customer Portal session
export async function POST() {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'HOTEL_EMPLOYER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const employer = await db.hotelEmployer.findFirst({
      where: { userId: session.user.id },
      include: {
        hotel: {
          include: {
            subscriptions: {
              where: { status: 'ACTIVE' },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    })

    const stripeCustomerId = employer?.hotel.subscriptions[0]?.stripeCustomerId
    if (!stripeCustomerId) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${baseUrl}/en/hotel/billing`,
    })

    return NextResponse.json({ status: 'success', data: { url: portalSession.url } })
  } catch (error) {
    console.error('[POST /api/stripe/portal]', error)
    return NextResponse.json({ error: 'Failed to open billing portal' }, { status: 500 })
  }
}
