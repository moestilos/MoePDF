/**
 * API ROUTE: /api/admin/stats
 * ============================
 * Métricas del dashboard admin. Solo accesible por admins.
 * Usa Neon para BD y Clerk para verificar el rol.
 */
import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { sql, isUserAdmin } from '@/lib/db'

const ADMIN_EMAILS = ['gmateosoficial@gmail.com']

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Comprobar email directo desde Clerk (no depende de la BD)
    const clerkUser = await currentUser()
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? ''
    const isAdmin = ADMIN_EMAILS.includes(email) || (await isUserAdmin(userId))

    if (!isAdmin) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    // ============================================
    // Obtener métricas en paralelo con Neon
    // ============================================
    const [
      usersResult,
      generationsResult,
      paymentsResult,
      visitsResult,
      recentGenerations,
    ] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM user_profiles`,
      sql`SELECT id, profile_type, status, created_at FROM pdf_generations`,
      sql`SELECT id, amount, created_at, status FROM payments WHERE status = 'completed'`,
      sql`SELECT COUNT(*) as count FROM page_visits WHERE created_at > now() - interval '30 days'`,
      sql`
        SELECT id, profile_type, client_name, status, price, created_at
        FROM pdf_generations
        ORDER BY created_at DESC
        LIMIT 10
      `,
    ])

    const totalUsers = Number((usersResult[0] as { count: string }).count)
    const totalGenerations = generationsResult.length
    const completedPayments = paymentsResult as { id: string; amount: number; created_at: string }[]
    const totalSales = completedPayments.length
    const totalRevenue = completedPayments.reduce((sum, p) => sum + Number(p.amount), 0)
    const totalVisits = Number((visitsResult[0] as { count: string }).count)

    // Agrupar por perfil
    const generationsByProfile = (generationsResult as { profile_type: string }[]).reduce(
      (acc: Record<string, number>, g) => {
        acc[g.profile_type] = (acc[g.profile_type] ?? 0) + 1
        return acc
      },
      {}
    )

    // Gráfica últimos 7 días
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      return d.toISOString().split('T')[0]
    })

    const salesByDay = last7Days.map(day => {
      const daySales = completedPayments.filter(p => p.created_at?.startsWith(day))
      return {
        date: day,
        sales: daySales.length,
        revenue: daySales.reduce((sum, p) => sum + Number(p.amount), 0),
      }
    })

    return NextResponse.json({
      stats: {
        total_users: totalUsers,
        total_generations: totalGenerations,
        total_sales: totalSales,
        total_revenue: totalRevenue,
        total_visits: totalVisits,
      },
      generations_by_profile: generationsByProfile,
      sales_chart: salesByDay,
      recent_generations: recentGenerations,
    })
  } catch (error) {
    console.error('[admin/stats]', error)
    return NextResponse.json({ error: 'Error obteniendo estadísticas' }, { status: 500 })
  }
}
