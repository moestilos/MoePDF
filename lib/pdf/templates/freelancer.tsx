/**
 * TEMPLATE PDF: Freelancer General
 * Estilo: limpio, profesional, azul corporativo
 */
import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const colors = {
  primary: '#2563eb',
  dark: '#1e3a5f',
  gray: '#64748b',
  lightGray: '#f8fafc',
  border: '#e2e8f0',
  white: '#ffffff',
  accent: '#eff6ff',
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.white,
    padding: 50,
    fontFamily: 'Helvetica',
  },
  // Sidebar azul izquierdo
  header: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  headerAccent: {
    width: 5,
    backgroundColor: colors.primary,
    borderRadius: 3,
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: colors.dark,
  },
  subtitle: {
    fontSize: 11,
    color: colors.gray,
    marginTop: 4,
  },
  headerMeta: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  metaText: {
    fontSize: 10,
    color: colors.gray,
    marginBottom: 2,
  },
  // Cards info
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  card: {
    flex: 1,
    backgroundColor: colors.lightGray,
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardLabel: {
    fontSize: 8,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 11,
    color: colors.dark,
    fontFamily: 'Helvetica-Bold',
  },
  cardSub: {
    fontSize: 9,
    color: colors.gray,
    marginTop: 2,
  },
  // Section
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  sectionDot: {
    width: 8,
    height: 8,
    backgroundColor: colors.primary,
    borderRadius: 4,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: colors.dark,
  },
  // Description block
  descriptionBlock: {
    backgroundColor: colors.accent,
    borderRadius: 6,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 10,
    color: colors.dark,
    lineHeight: 1.6,
  },
  // Details list
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    flex: 1,
    fontSize: 9,
    color: colors.gray,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
  },
  detailValue: {
    flex: 2,
    fontSize: 10,
    color: colors.dark,
  },
  // Totals
  totalsWrapper: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  totalLabel: {
    fontSize: 10,
    color: colors.gray,
  },
  totalValue: {
    fontSize: 10,
    color: colors.dark,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.primary,
  },
  grandLabel: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: colors.white,
  },
  grandValue: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: colors.white,
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
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.primary,
    textTransform: 'uppercase',
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

interface FreelancerPDFProps {
  data: {
    client_name: string
    client_email?: string
    service_description: string
    price: number
    vat_percent?: number
    service_type?: string
    scope?: string
    duration?: string
    revisions?: number
    quote_number?: string
    date?: string
  }
}

export function FreelancerPDF({ data }: FreelancerPDFProps) {
  const vatPercent = data.vat_percent ?? 21
  const basePrice = data.price
  const vatAmount = (basePrice * vatPercent) / 100
  const totalPrice = basePrice + vatAmount
  const quoteNumber = data.quote_number ?? `FL-${Date.now().toString().slice(-6)}`
  const date = data.date ?? new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerAccent} />
          <View style={styles.headerContent}>
            <Text style={styles.eyebrow}>Servicio Freelance</Text>
            <Text style={styles.title}>Presupuesto</Text>
            <Text style={styles.subtitle}>{data.service_type ?? 'Propuesta de servicios profesionales'}</Text>
          </View>
          <View style={styles.headerMeta}>
            <Text style={styles.metaText}>Nº {quoteNumber}</Text>
            <Text style={styles.metaText}>{date}</Text>
          </View>
        </View>

        {/* CARDS */}
        <View style={styles.cardsRow}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Cliente</Text>
            <Text style={styles.cardValue}>{data.client_name}</Text>
            {data.client_email && <Text style={styles.cardSub}>{data.client_email}</Text>}
          </View>
          {data.duration && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Duración</Text>
              <Text style={styles.cardValue}>{data.duration}</Text>
            </View>
          )}
          {data.revisions && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Revisiones</Text>
              <Text style={styles.cardValue}>{data.revisions} incluidas</Text>
            </View>
          )}
        </View>

        {/* DESCRIPCIÓN */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionDot} />
          <Text style={styles.sectionTitle}>Descripción del servicio</Text>
        </View>
        <View style={styles.descriptionBlock}>
          <Text style={styles.descriptionText}>{data.service_description}</Text>
        </View>

        {/* ALCANCE */}
        {data.scope && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionDot} />
              <Text style={styles.sectionTitle}>Alcance del trabajo</Text>
            </View>
            <View style={styles.descriptionBlock}>
              <Text style={styles.descriptionText}>{data.scope}</Text>
            </View>
          </>
        )}

        {/* DETALLES */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionDot} />
          <Text style={styles.sectionTitle}>Resumen del encargo</Text>
        </View>
        {data.service_type && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tipo</Text>
            <Text style={styles.detailValue}>{data.service_type}</Text>
          </View>
        )}
        {data.duration && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Duración</Text>
            <Text style={styles.detailValue}>{data.duration}</Text>
          </View>
        )}

        {/* TOTALES */}
        <View style={styles.totalsWrapper}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Base imponible</Text>
            <Text style={styles.totalValue}>{basePrice.toFixed(2)} €</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>IVA ({vatPercent}%)</Text>
            <Text style={styles.totalValue}>{vatAmount.toFixed(2)} €</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandLabel}>TOTAL A PAGAR</Text>
            <Text style={styles.grandValue}>{totalPrice.toFixed(2)} €</Text>
          </View>
        </View>

        {/* CONDICIONES */}
        <View style={styles.termsBox}>
          <Text style={styles.termsTitle}>Condiciones generales</Text>
          <Text style={styles.termsText}>
            • Pago: 50% al inicio + 50% a la entrega. Posibilidad de acordar otro esquema.{'\n'}
            • Validez del presupuesto: 30 días desde la fecha de emisión.{'\n'}
            • Cualquier modificación fuera del alcance definido requiere presupuesto adicional.{'\n'}
            • El cliente acepta las condiciones al confirmar el encargo por escrito (email válido).
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
