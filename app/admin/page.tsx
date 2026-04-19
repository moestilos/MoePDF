/**
 * PANEL DE ADMIN
 * Solo accesible por usuarios con rol admin o email en la lista blanca.
 */
import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { isUserAdmin } from '@/lib/db'
import { AdminStats } from '@/components/AdminStats'
import Link from 'next/link'
import { IconCrown } from '@/components/Icons'

const ADMIN_EMAILS = ['gmateosoficial@gmail.com']

export default async function AdminPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const clerkUser = await currentUser()
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? ''
  const allowed = ADMIN_EMAILS.includes(email) || (await isUserAdmin(userId))
  if (!allowed) redirect('/')

  const displayName = clerkUser?.firstName
    ? `${clerkUser.firstName}${clerkUser.lastName ? ' ' + clerkUser.lastName : ''}`
    : email || 'Admin'

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>

      {/* ── Header ── */}
      <div
        className="sticky top-0 z-40"
        style={{
          background: 'rgba(12,14,31,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(99,102,241,0.14)',
        }}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.35)' }}
            >
              <IconCrown className="w-4 h-4" style={{ color: '#c4b5fd' }} />
            </div>
            <span className="font-bold text-[15px] text-white">Panel Admin</span>
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{ background: 'rgba(124,58,237,0.18)', color: '#c4b5fd', border: '1px solid rgba(124,58,237,0.3)' }}
            >
              Solo tú
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[12px] hidden sm:block" style={{ color: 'var(--text-muted)' }}>
              {displayName}
            </span>
            <Link
              href="/"
              className="text-[12px] px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              ← App
            </Link>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-[26px] font-bold tracking-tight text-white mb-1">
            Dashboard
          </h1>
          <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
            Métricas en tiempo real de MoePDF
          </p>
        </div>
        <AdminStats />
      </div>
    </div>
  )
}
