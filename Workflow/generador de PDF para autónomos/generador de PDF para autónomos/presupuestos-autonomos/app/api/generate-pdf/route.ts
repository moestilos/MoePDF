/**
 * API ROUTE: /api/generate-pdf
 * =============================
 * Genera y sirve PDFs. Usa Neon para la BD y Clerk para la auth.
 *
 * PUT  → Crea la generación en BD (preview o free_admin si es admin)
 * POST → Genera el PDF y lo devuelve como fichero descargable
 */
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { sql, isUserAdmin } from '@/lib/db'
import { generatePDF } from '@/lib/pdf/generator'

// ============================================
// POST: Genera y descarga el PDF
// ============================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { generation_id, download_token } = body

    if (!generation_id) {
      return NextResponse.json({ error: 'generation_id requerido' }, { status: 400 })
    }

    // Obtener la generación de la BD
    const rows = await sql`
      SELECT * FROM pdf_generations WHERE id = ${generation_id} LIMIT 1
    `
    const generation = rows[0] as {
      id: string; profile_type: string; client_name: string;
      service_desc: string; price: number; status: string;
      download_token: string; quote_data: Record<string, unknown>
    } | undefined

    if (!generation) {
      return NextResponse.json({ error: 'Generación no encontrada' }, { status: 404 })
    }

    // Verificar si el usuario actual es admin
    const { userId } = await auth()
    const adminCheck = await isUserAdmin(userId)

    // Verificar autorización
    if (!adminCheck) {
      if (generation.status === 'preview') {
        return NextResponse.json({ error: 'Pago requerido para descargar el PDF' }, { status: 403 })
      }
      if (generation.download_token !== download_token) {
        return NextResponse.json({ error: 'Token de descarga inválido' }, { status: 403 })
      }
    }

    // Construir datos del PDF
    const quoteData = {
      profile_type: generation.profile_type,
      ...generation.quote_data,
      client_name: generation.client_name,
      service_description: generation.service_desc,
      price: Number(generation.price),
    }

    const pdfBuffer = await generatePDF(quoteData as Parameters<typeof generatePDF>[0])

    const filename = `presupuesto-${generation.profile_type}-${generation_id.slice(0, 8)}.pdf`

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('[generate-pdf POST]', error)
    return NextResponse.json({ error: 'Error generando el PDF' }, { status: 500 })
  }
}

// ============================================
// PUT: Crea la generación en BD
// ============================================
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { profile_type, client_name, service_description, price, vat_percent, ...extraFields } = body

    if (!profile_type || !client_name || !service_description || !price) {
      return NextResponse.json(
        { error: 'Faltan campos: profile_type, client_name, service_description, price' },
        { status: 400 }
      )
    }

    // Obtener usuario de Clerk (puede ser null si no está autenticado)
    const { userId } = await auth()
    const adminCheck = await isUserAdmin(userId)

    // Insertar en Neon
    const rows = await sql`
      INSERT INTO pdf_generations (
        clerk_user_id, profile_type, client_name, service_desc,
        price, status, quote_data
      )
      VALUES (
        ${userId ?? null},
        ${profile_type},
        ${client_name},
        ${service_description},
        ${Number(price)},
        ${adminCheck ? 'free_admin' : 'preview'},
        ${JSON.stringify({ vat_percent: vat_percent ?? 21, ...extraFields, service_description })}
      )
      RETURNING id, download_token, status
    `

    const generation = rows[0] as { id: string; download_token: string; status: string }

    return NextResponse.json({
      generation_id: generation.id,
      download_token: generation.download_token,
      status: generation.status,
      is_admin: adminCheck,
    })
  } catch (error) {
    console.error('[generate-pdf PUT]', error)
    return NextResponse.json({ error: 'Error guardando la generación' }, { status: 500 })
  }
}
