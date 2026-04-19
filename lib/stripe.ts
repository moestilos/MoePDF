/**
 * Instancia de Stripe para uso en el servidor
 * Solo importar desde API Routes
 */
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
})

// Precio del PDF en céntimos de euro (1.00€ = 100)
export const PDF_PRICE_CENTS = 100
export const PDF_PRICE_DISPLAY = '1,00 €'
export const CURRENCY = 'eur'
