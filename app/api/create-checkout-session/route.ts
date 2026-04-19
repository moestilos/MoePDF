/**
 * API ROUTE: /api/create-checkout-session
 * =========================================
 * Crea una sesión de pago de Stripe.
 * Usa Neon para BD y Clerk para la identidad del usuario.
 */
import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { stripe, PDF_PRICE_CENTS, CURRENCY } from '@/lib/stripe'
import { sql } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { generation_id } = body

    if (!generation_id) {
      return NextResponse.json({ error: 'generation_id requerido' }, { status: 400 })
    }

    // Obtener la generación de Neon
    const rows = await sql`
      SELECT * FROM pdf_generations WHERE id = ${generation_id} LIMIT 1
    `
    const generation = rows[0] as {
      id: string; profile_type: string; client_name: string;
      status: string; download_token: string
    } | undefined

    if (!generation) {
      return NextResponse.json({ error: 'Generación no encontrada' }, { status: 404 })
    }

    // Si ya está pagado, devolver el token directamente
    if (generation.status === 'paid' || generation.status === 'free_admin') {
      return NextResponse.json({
        already_paid: true,
        download_token: generation.download_token,
      })
    }

    // Obtener datos del usuario de Clerk (opcional)
    const { userId } = await auth()
    const user = userId ? await currentUser() : null
    const userEmail = user?.emailAddresses?.[0]?.emailAddress

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    // Crear sesión de Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: CURRENCY,
            product_data: {
              name: 'Presupuesto PDF profesional',
              description: `Presupuesto para ${generation.client_name} · ${generation.profile_type}`,
            },
            unit_amount: PDF_PRICE_CENTS,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}&generation_id=${generation_id}`,
      cancel_url: `${appUrl}/?cancelled=true`,
      metadata: {
        generation_id,
        clerk_user_id: userId ?? '',
        profile_type: generation.profile_type,
      },
      ...(userEmail ? { customer_email: userEmail } : {}),
    })

    // Registrar pago en Neon (estado pending)
    await sql`
      INSERT INTO payments (clerk_user_id, pdf_generation_id, stripe_session_id, amount, currency, status)
      VALUES (${userId ?? null}, ${generation_id}, ${session.id}, ${PDF_PRICE_CENTS / 100}, ${CURRENCY}, 'pending')
    `

    return NextResponse.json({ checkout_url: session.url })
  } catch (error) {
    console.error('[create-checkout-session]', error)
    return NextResponse.json({ error: 'Error creando la sesión de pago' }, { status: 500 })
  }
}
