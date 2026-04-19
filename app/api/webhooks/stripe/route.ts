/**
 * WEBHOOK DE STRIPE: /api/webhooks/stripe
 * =========================================
 * Actualiza el estado en Neon tras eventos de pago.
 * No usa Clerk aquí — opera con service-level access.
 */
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { sql } from '@/lib/db'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Firma de Stripe faltante' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('[stripe-webhook] Firma inválida:', err)
    return NextResponse.json({ error: 'Webhook signature inválida' }, { status: 400 })
  }

  // =============================================
  // Pago completado
  // =============================================
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const generationId = session.metadata?.generation_id

    if (!generationId) {
      console.error('[stripe-webhook] generation_id no encontrado en metadata')
      return NextResponse.json({ received: true })
    }

    // Actualizar estado del PDF a 'paid'
    await sql`
      UPDATE pdf_generations SET status = 'paid' WHERE id = ${generationId}
    `

    // Actualizar estado del pago
    await sql`
      UPDATE payments
      SET
        status = 'completed',
        stripe_payment_intent = ${session.payment_intent as string},
        completed_at = now()
      WHERE stripe_session_id = ${session.id}
    `

    console.log(`[stripe-webhook] Pago completado para generación ${generationId}`)
  }

  // =============================================
  // Pago fallido
  // =============================================
  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent

    await sql`
      UPDATE payments SET status = 'failed' WHERE stripe_payment_intent = ${paymentIntent.id}
    `

    console.log(`[stripe-webhook] Pago fallido: ${paymentIntent.id}`)
  }

  return NextResponse.json({ received: true })
}
