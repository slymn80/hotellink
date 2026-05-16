import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

const PLAN_PRICE_IDS: Record<string, string> = {
  STARTER_MONTHLY: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID!,
  STARTER_ANNUAL: process.env.STRIPE_STARTER_ANNUAL_PRICE_ID!,
  PROFESSIONAL_MONTHLY: process.env.STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID!,
  PROFESSIONAL_ANNUAL: process.env.STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID!,
  ENTERPRISE_MONTHLY: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID!,
  ENTERPRISE_ANNUAL: process.env.STRIPE_ENTERPRISE_ANNUAL_PRICE_ID!,
}

const checkoutSchema = z.object({
  plan: z.enum(['STARTER', 'PROFESSIONAL', 'ENTERPRISE']),
  billingPeriod: z.enum(['MONTHLY', 'ANNUAL']).default('MONTHLY'),
})

// POST /api/stripe/checkout — Create Stripe checkout session
export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'HOTEL_EMPLOYER') {
      return NextResponse.json({ error: 'Only hotel employers can subscribe' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = checkoutSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { plan, billingPeriod } = parsed.data

    const employer = await db.hotelEmployer.findFirst({
      where: { userId: session.user.id },
      include: { hotel: true },
    })

    if (!employer) {
      return NextResponse.json({ error: 'Hotel not found' }, { status: 404 })
    }

    const priceKey = `${plan}_${billingPeriod}`
    const priceId = PLAN_PRICE_IDS[priceKey]

    if (!priceId) {
      return NextResponse.json({ error: 'Invalid plan configuration' }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/en/hotel/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/en/hotel/billing?canceled=true`,
      customer_email: session.user.email!,
      metadata: {
        userId: session.user.id,
        hotelId: employer.hotelId,
        plan,
        billingPeriod,
      },
      subscription_data: {
        metadata: {
          userId: session.user.id,
          hotelId: employer.hotelId,
          plan,
        },
      },
    })

    return NextResponse.json({
      status: 'success',
      data: { url: checkoutSession.url },
    })
  } catch (error) {
    console.error('[POST /api/stripe/checkout]', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
