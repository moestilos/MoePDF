/**
 * MIDDLEWARE — CLERK
 * ====================
 * Clerk gestiona automáticamente las sesiones en todas las rutas.
 *
 * Rutas protegidas:
 * - /admin/* → requiere autenticación (la comprobación de rol admin
 *   se hace en la propia página server-side)
 *
 * Rutas públicas (sin auth requerida):
 * - / , /sign-in, /sign-up, /api/webhooks/stripe, /api/track-visit, etc.
 */
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher(['/admin(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    // Compatible con Clerk v5 — auth() devuelve el objeto de sesión
    const { userId } = await auth()
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return NextResponse.redirect(signInUrl)
    }
  }
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    '/(api|trpc)(.*)',
  ],
}
