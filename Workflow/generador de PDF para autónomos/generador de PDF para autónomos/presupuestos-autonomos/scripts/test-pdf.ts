import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { generatePDF } from '../lib/pdf/generator'

mkdirSync('test-output', { recursive: true })

const profiles = [
  {
    name: 'freelancer',
    data: {
      profile_type: 'freelancer' as const,
      client_name: 'ACME S.L.',
      client_email: 'cliente@acme.com',
      service_description: 'Desarrollo de landing page con animaciones y formulario de contacto.',
      price: 1500,
      vat_percent: 21,
      service_type: 'Desarrollo Web',
      scope: 'Diseño, maquetación, integración formulario.',
      duration: '2 semanas',
      revisions: 3,
    },
  },
  {
    name: 'designer',
    data: {
      profile_type: 'designer' as const,
      client_name: 'StartupX',
      client_email: 'hola@startupx.com',
      service_description: 'Diseño UI/UX completo para app SaaS.',
      price: 3000,
      vat_percent: 21,
    },
  },
  {
    name: 'trainer',
    data: {
      profile_type: 'trainer' as const,
      client_name: 'Juan Pérez',
      client_email: 'juan@mail.com',
      service_description: 'Plan personalizado de fuerza e hipertrofia.',
      price: 600,
      vat_percent: 21,
      sessions_per_week: 3,
      duration_weeks: 12,
      modality: 'Online',
      program_type: 'Hipertrofia',
      includes: 'Plan de entrenamiento, seguimiento semanal, ajustes de dieta',
    },
  },
  {
    name: 'photographer',
    data: {
      profile_type: 'photographer' as const,
      client_name: 'Boda Ana & Luis',
      client_email: 'ana@mail.com',
      service_description: 'Cobertura completa de boda 8h.',
      price: 1200,
      vat_percent: 21,
      shoot_type: 'Boda',
      shoot_duration: '8 horas',
      num_photos: '300 fotos editadas',
      delivery_format: 'Galería digital + USB',
      extra_services: 'Álbum impreso',
    },
  },
]

async function main() {
let passed = 0
let failed = 0
for (const p of profiles) {
  try {
    const buf = await generatePDF(p.data)
    const path = resolve('test-output', `${p.name}.pdf`)
    writeFileSync(path, buf)
    const head = buf.subarray(0, 4).toString('ascii')
    if (head !== '%PDF') throw new Error(`bad header: ${head}`)
    console.log(`OK ${p.name}: ${buf.length} bytes -> ${path}`)
    passed++
  } catch (err) {
    console.error(`FAIL ${p.name}:`, (err as Error).message)
    failed++
  }
}
console.log(`\n${passed}/${profiles.length} passed`)
process.exit(failed === 0 ? 0 : 1)
}
main()
