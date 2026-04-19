/**
 * GENERADOR DE PDF
 * ================
 * Orquesta la generación del PDF correcto según el tipo de perfil.
 * Usa @react-pdf/renderer que funciona en serverless (sin Chrome).
 *
 * Para añadir un nuevo perfil:
 * 1. Crea templates/<nuevo-perfil>.tsx
 * 2. Exporta la función desde aquí
 */
import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { ProfileType } from '@/lib/profiles'

// Importar templates
import { DesignerPDF } from './templates/designer'
import { FreelancerPDF } from './templates/freelancer'
import { TrainerPDF } from './templates/trainer'
import { PhotographerPDF } from './templates/photographer'

export interface QuoteData {
  profile_type: ProfileType
  client_name: string
  client_email?: string
  service_description: string
  price: number
  vat_percent?: number
  quote_number?: string
  date?: string
  // Campos específicos de cada perfil (se pasan todos, cada template usa los suyos)
  [key: string]: unknown
}

/**
 * Genera el PDF y devuelve un Buffer listo para enviar como response
 */
export async function generatePDF(data: QuoteData): Promise<Buffer> {
  // Número de presupuesto y fecha por defecto
  const quoteData = {
    ...data,
    quote_number: data.quote_number ?? generateQuoteNumber(data.profile_type),
    date: data.date ?? new Date().toLocaleDateString('es-ES', {
      day: '2-digit', month: 'long', year: 'numeric'
    }),
    price: Number(data.price),
    vat_percent: data.vat_percent ? Number(data.vat_percent) : 21,
  }

  let element: React.ReactElement

  switch (data.profile_type) {
    case 'designer':
      element = React.createElement(DesignerPDF, { data: quoteData as Parameters<typeof DesignerPDF>[0]['data'] })
      break
    case 'trainer':
      element = React.createElement(TrainerPDF, { data: quoteData as Parameters<typeof TrainerPDF>[0]['data'] })
      break
    case 'photographer':
      element = React.createElement(PhotographerPDF, { data: quoteData as Parameters<typeof PhotographerPDF>[0]['data'] })
      break
    case 'freelancer':
    default:
      element = React.createElement(FreelancerPDF, { data: quoteData as Parameters<typeof FreelancerPDF>[0]['data'] })
      break
  }

  const buffer = await renderToBuffer(element)
  return buffer as Buffer
}

/**
 * Genera un número de presupuesto único con prefijo por perfil
 */
function generateQuoteNumber(profileType: ProfileType): string {
  const prefixes: Record<ProfileType, string> = {
    designer: 'DW',
    freelancer: 'FL',
    trainer: 'PT',
    photographer: 'FT',
  }
  const prefix = prefixes[profileType] ?? 'PR'
  const timestamp = Date.now().toString().slice(-6)
  return `${prefix}-${timestamp}`
}
