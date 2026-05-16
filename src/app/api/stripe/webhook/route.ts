import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/prisma'
import Stripe from 'stripe'
import type { SubscriptionStatus, SubscriptionPlan } from '@prisma/client'
import { sendPaymentConfirmationEmail, sendPaymentFailedEmail } from '@/lib/email'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

const PLAN_LIMITS: Record<string, { jobPostingLimit: number; featuredJobLimit: number; candidateViewLimit: number }> = {
  STARTER: { jobPostingLimit: 5, featuredJobLimit: 1, candidateViewLimit: 50 },
  PROFESSIONAL: { jobPostingLimit: 20, featuredJobLimit: 5, candidateViewLimit: 999 },
  ENTERPRISE: { jobPostingLimit: 999, featuredJobLimit: 20, candidateViewLimit: 999 },
}

async function upsertSubscription(
  hotelId: string,
  data: {
    plan?: SubscriptionPlan
    status: SubscriptionStatus
    stripeSubscriptionId?: string
    currentPeriodStart?: Date
    currentPeriodEnd?: Date
    cancelledAt?: Date
  } & Partial<{ jobPostingLimit: number; featuredJobLimit: number; candidateViewLimit: number }>
) {
  const existing = await db.subscription.findFirst({ where: { hotelId } })
  if (existing) {
    return db.subscription.update({ where: { id: existing.id }, data })
  }
  return db.subscription.create({
    data: {
      hotelId,
      plan: data.plan ?? 'FREE',
      status: data.status,
      stripeSubscriptionId: data.stripeSubscriptionId,
      currentPeriodStart: data.currentPeriodStart ?? new Date(),
      currentPeriodEnd: data.currentPeriodEnd ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      jobPostingLimit: data.jobPostingLimit ?? 1,
      featuredJobLimit: data.featuredJobLimit ?? 0,
      candidateViewLimit: data.candidateViewLimit ?? 10,
    },
  })
}

// POST /api/stripe/webhook — Handle Stripe webhooks
export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const { hotelId, plan, billingPeriod } = session.metadata ?? {}

        if (!hotelId || !plan) break

        const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.STARTER
        const isAnnual = billingPeriod === 'ANNUAL'
        const periodEnd = new Date()
        periodEnd.setMonth(periodEnd.getMonth() + (isAnnual ? 12 : 1))

        await upsertSubscription(hotelId, {
          plan: plan as SubscriptionPlan,
          status: 'ACTIVE',
          stripeSubscriptionId: session.subscription as string,
          currentPeriodStart: new Date(),
          currentPeriodEnd: periodEnd,
          ...limits,
        })

        if (session.amount_total) {
          await db.payment.create({
            data: {
              hotelId,
              stripePaymentId: session.payment_intent as string,
              amount: session.amount_total / 100,
              currency: session.currency?.toUpperCase() ?? 'USD',
              status: 'COMPLETED',
              paidAt: new Date(),
              description: `${plan} plan subscription (${billingPeriod})`,
            },
          })
        }

        // Send payment confirmation email to hotel owner
        const hotel = await db.hotel.findUnique({
          where: { id: hotelId },
          include: { employers: { include: { user: { select: { email: true, name: true } } }, take: 1 } },
        })
        if (hotel?.employers[0]?.user && session.amount_total) {
          await sendPaymentConfirmationEmail({
            email: hotel.employers[0].user.email,
            name: hotel.employers[0].user.name,
            planName: `${plan} (${billingPeriod})`,
            amount: session.amount_total,
            currency: session.currency ?? 'usd',
            invoiceDate: new Date(),
          })
        }

        console.log(`[Webhook] Subscription activated for hotel ${hotelId}, plan: ${plan}`)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const hotelId = subscription.metadata?.hotelId
        if (!hotelId) break

        const status: SubscriptionStatus = subscription.status === 'active' ? 'ACTIVE'
          : subscription.status === 'past_due' ? 'PAST_DUE'
          : subscription.status === 'canceled' ? 'CANCELLED'
          : 'INACTIVE'

        await upsertSubscription(hotelId, {
          status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        })
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const hotelId = subscription.metadata?.hotelId
        if (!hotelId) break

        await upsertSubscription(hotelId, {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        })
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const hotelId = (invoice.subscription_details?.metadata ?? {}).hotelId
        if (!hotelId) break

        await upsertSubscription(hotelId, { status: 'PAST_DUE' })

        // Send payment failed email
        const failedHotel = await db.hotel.findUnique({
          where: { id: hotelId },
          include: { employers: { include: { user: { select: { email: true, name: true } } }, take: 1 } },
        })
        if (failedHotel?.employers[0]?.user) {
          const sub = await db.subscription.findFirst({ where: { hotelId } })
          await sendPaymentFailedEmail({
            email: failedHotel.employers[0].user.email,
            name: failedHotel.employers[0].user.name,
            planName: sub?.plan ?? 'Your subscription',
          })
        }
        break
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Stripe Webhook] Processing error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
