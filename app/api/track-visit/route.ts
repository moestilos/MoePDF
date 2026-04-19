/**
 * API ROUTE: /api/track-visit
 * Registra visitas anónimas. Fire & forget desde el cliente.
 */
import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    await sql`
      INSERT INTO page_visits (page, visitor_id)
      VALUES ('/', ${req.headers.get('x-forwarded-for') ?? null})
    `
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false })
  }
}
