/**
 * TEMPLATE PDF: Entrenador Personal
 * Estilo: energético, verde, enfocado en el programa y resultados
 */
import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const colors = {
  primary: '#16a34a',
  dark: '#14532d',
  gray: '#6b7280',
  lightGray: '#f0fdf4',
  border: '#bbf7d0',
  white: '#ffffff',
  accent: '#dcfce7',
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.white,
    padding: 50,
    fontFamily: 'Helvetica',
  },
  // Header con fondo verde
  header: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 24,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {},
  badgeText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#bbf7d0',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Helvetica-Bold',
    color: colors.white,
  },
  subtitle: {
    fontSize: 11,
    color: '#bbf7d0',
    marginTop: 3,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  quoteInfo: {
    fontSize: 10,
    color: '#bbf7d0',
    marginBottom: 2,
  },
  // Highlight box
  highlightRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  highlightBox: {
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  highlightValue: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: colors.primary,
  },
  highlightLabel: {
    fontSize: 8,
    color: colors.gray,
    textTransform: 'uppercase',
    marginTop: 3,
    textAlign: 'center' as const,
  },
  // Client card
  clientCard: {
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  clientCardTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.primary,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  clientName: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: colors.dark,
  },
  clientEmail: {
    fontSize: 10,
    color: colors.gray,
    marginTop: 2,
  },
  // Section
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: colors.dark,
    marginBottom: 8,
    marginTop: 16,
    paddingBottom: 4,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  // Program details
  programRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  programLabel: {
    flex: 1,
    fontSize: 10,
    color: colors.gray,
  },
  programValue: {
    flex: 2,
    fontSize: 10,
    color: colors.dark,
    fontFamily: 'Helvetica-Bold',
  },
  // Includes
  includeItem: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  bullet: {
    fontSize: 10,
    color: colors.primary,
    marginRight: 6,
    fontFamily: 'Helvetica-Bold',
  },
  includeText: {
    fontSize: 10,
    color: colors.dark,
    flex: 1,
    lineHeight: 1.4,
  },
  // Investment box
  investmentBox: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  investmentLabel: {
    fontSize: 10,
    color: '#bbf7d0',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  investmentAmount: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    color: colors.white,
  },
  investmentSub: {
    fontSize: 9,
    color: '#bbf7d0',
    marginTop: 4,
  },
  // Terms
  termsBox: {
    backgroundColor: colors.lightGray,
    borderRadius: 6,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  termsTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.primary,
    marginBottom: 5,
  },
  termsText: {
    fontSize: 8.5,
    color: colors.gray,
    lineHeight: 1.6,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  footerText: { fontSize: 8, color: colors.gray },
  footerBrand: { fontSize: 8, color: colors.primary, fontFamily: 'Helvetica-Bold' },
})

interface TrainerPDFProps {
  data: {
    client_name: string
    client_email?: string
    service_description: string
    price: number
    vat_percent?: number
    program_type?: string
    modality?: string
    sessions_per_week?: number
    duration_weeks?: number
    includes?: string
    quote_number?: string
    date?: string
  }
}

export function TrainerPDF({ data }: TrainerPDFProps) {
  const vatPercent = data.vat_percent ?? 21
  const basePrice = data.price
  const vatAmount = (basePrice * vatPercent) / 100
  const totalPrice = basePrice + vatAmount
  const quoteNumber = data.quote_number ?? `PT-${Date.now().toString().slice(-6)}`
  const date = data.date ?? new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })

  const totalSessions = (data.sessions_per_week ?? 0) * (data.duration_weeks ?? 0)

  const includesList = data.includes
    ? data.includes.split(',').map(s => s.trim()).filter(Boolean)
    : []

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.badgeText}>Entrenamiento Personal</Text>
            <Text style={styles.title}>Plan de Entrenamiento</Text>
            <Text style={styles.subtitle}>Propuesta personalizada</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.quoteInfo}>Nº {quoteNumber}</Text>
            <Text style={styles.quoteInfo}>{date}</Text>
          </View>
        </View>

        {/* MÉTRICAS CLAVE */}
        {(data.sessions_per_week || data.duration_weeks || totalSessions > 0) && (
          <View style={styles.highlightRow}>
            {data.sessions_per_week && (
              <View style={styles.highlightBox}>
                <Text style={styles.highlightValue}>{data.sessions_per_week}</Text>
                <Text style={styles.highlightLabel}>Sesiones/semana</Text>
              </View>
            )}
            {data.duration_weeks && (
              <View style={styles.highlightBox}>
                <Text style={styles.highlightValue}>{data.duration_weeks}</Text>
                <Text style={styles.highlightLabel}>Semanas</Text>
              </View>
            )}
            {totalSessions > 0 && (
              <View style={styles.highlightBox}>
                <Text style={styles.highlightValue}>{totalSessions}</Text>
                <Text style={styles.highlightLabel}>Sesiones totales</Text>
              </View>
            )}
            {data.modality && (
              <View style={styles.highlightBox}>
                <Text style={styles.highlightValue}>{data.modality?.charAt(0)}</Text>
                <Text style={styles.highlightLabel}>{data.modality}</Text>
              </View>
            )}
          </View>
        )}

        {/* CLIENTE */}
        <View style={styles.clientCard}>
          <Text style={styles.clientCardTitle}>Propuesta para</Text>
          <Text style={styles.clientName}>{data.client_name}</Text>
          {data.client_email && <Text style={styles.clientEmail}>{data.client_email}</Text>}
        </View>

        {/* DETALLES DEL PROGRAMA */}
        <Text style={styles.sectionTitle}>Detalles del programa</Text>
        {data.program_type && (
          <View style={styles.programRow}>
            <Text style={styles.programLabel}>Objetivo</Text>
            <Text style={styles.programValue}>{data.program_type}</Text>
          </View>
        )}
        {data.modality && (
          <View style={styles.programRow}>
            <Text style={styles.programLabel}>Modalidad</Text>
            <Text style={styles.programValue}>{data.modality}</Text>
          </View>
        )}
        <View style={styles.programRow}>
          <Text style={styles.programLabel}>Descripción</Text>
          <Text style={styles.programValue}>{data.service_description}</Text>
        </View>

        {/* LO QUE INCLUYE */}
        {includesList.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>¿Qué incluye tu programa?</Text>
            {includesList.map((item, i) => (
              <View key={i} style={styles.includeItem}>
                <Text style={styles.bullet}>+</Text>
                <Text style={styles.includeText}>{item}</Text>
              </View>
            ))}
          </>
        )}

        {/* INVERSIÓN */}
        <View style={styles.investmentBox}>
          <Text style={styles.investmentLabel}>Tu inversión</Text>
          <Text style={styles.investmentAmount}>{totalPrice.toFixed(2)} €</Text>
          <Text style={styles.investmentSub}>
            ({basePrice.toFixed(2)} € + {vatPercent}% IVA = {vatAmount.toFixed(2)} €)
          </Text>
        </View>

        {/* CONDICIONES */}
        <View style={styles.termsBox}>
          <Text style={styles.termsTitle}>Condiciones</Text>
          <Text style={styles.termsText}>
            • Pago: 100% al inicio del programa o fracciones acordadas.{'\n'}
            • Presupuesto válido 30 días. Sin devolución una vez iniciado el programa.{'\n'}
            • Cambios de horario con 24h de antelación. Cancelaciones tardías no se recuperan.{'\n'}
            • El cliente se compromete a seguir las pautas y comunicar cualquier condición médica.
          </Text>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Nº {quoteNumber} · {date}</Text>
          <Text style={styles.footerBrand}>Generado con PresupuestoPro</Text>
        </View>
      </Page>
    </Document>
  )
}
