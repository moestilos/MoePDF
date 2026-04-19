/**
 * API: /api/admin/check
 * Devuelve si el usuario actual es admin. Lo usa el Navbar.
 *
 * Comprueba en este orden:
 *  1. Si el email del usuario (Clerk) está en la lista blanca hardcoded → admin
 *  2. Si tiene role = 'admin' en la BD → admin
 *  3. En cualquier otro caso → no admin
 */
import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { isUserAdmin } from '@/lib/db'

const ADMIN_EMAILS = ['gmateosoficial@gmail.com']

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ is_admin: false })

  // Comprobar email directamente desde Clerk (no necesita fila en BD)
  const user = await currentUser()
  const email = user?.emailAddresses?.[0]?.emailAddress ?? ''

  if (ADMIN_EMAILS.includes(email)) {
    return NextResponse.json({ is_admin: true })
  }

  // Fallback: comprobar rol en BD
  const admin = await isUserAdmin(userId)
  return NextResponse.json({ is_admin: admin })
}
