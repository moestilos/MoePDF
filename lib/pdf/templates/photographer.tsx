/**
 * TEMPLATE PDF: Fotógrafo
 * Estilo: premium, oscuro, elegante con acento ámbar
 */
import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const colors = {
  primary: '#d97706',
  dark: '#1c1917',
  mediumDark: '#292524',
  gray: '#78716c',
  lightGray: '#fafaf9',
  border: '#e7e5e4',
  white: '#ffffff',
  accent: '#fffbeb',
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.white,
    fontFamily: 'Helvetica',
  },
  // Barra superior decorativa
  topBar: {
    backgroundColor: colors.dark,
    height: 8,
  },
  content: {
    padding: 50,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  headerLeft: {},
  eyebrow: {
    fontSize: 8,
    color: colors.primary,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    fontSize: 30,
    fontFamily: 'Helvetica-Bold',
    color: colors.dark,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 11,
    color: colors.gray,
    marginTop: 4,
  },
  headerRight: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  quoteNumber: {
    fontSize: 10,
    color: colors.gray,
    marginBottom: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.dark,
    marginBottom: 24,
  },
  // Client / shoot info
  infoGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 28,
  },
  infoCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 14,
  },
  infoCardDark: {
    backgroundColor: colors.dark,
  },
  infoLabel: {
    fontSize: 8,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 5,
    fontFamily: 'Helvetica-Bold',
  },
  infoLabelLight: {
    color: colors.primary,
  },
  infoValue: {
    fontSize: 11,
    color: colors.dark,
    fontFamily: 'Helvetica-Bold',
  },
  infoValueLight: {
    color: colors.white,
  },
  infoSub: {
    fontSize: 9,
    color: colors.gray,
    marginTop: 2,
  },
  infoSubLight: {
    color: '#a8a29e',
  },
  // Section
  sectionTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 10,
    marginTop: 20,
  },
  // Service row
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  serviceLeft: { flex: 3 },
  serviceRight: { flex: 1, alignItems: 'flex-end' as const },
  serviceName: {
    fontSize: 11,
    color: colors.dark,
    fontFamily: 'Helvetica-Bold',
  },
  serviceDesc: {
    fontSize: 9,
    color: colors.gray,
    marginTop: 3,
    lineHeight: 1.4,
  },
  servicePrice: {
    fontSize: 11,
    color: colors.dark,
    fontFamily: 'Helvetica-Bold',
  },
  // Deliverables
  deliverableItem: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  deliverableIcon: {
    fontSize: 9,
    color: colors.primary,
    marginRight: 8,
    fontFamily: 'Helvetica-Bold',
  },
  deliverableText: {
    fontSize: 10,
    color: colors.dark,
    flex: 1,
  },
  // Total
  totalSection: {
    marginTop: 20,
    backgroundColor: colors.dark,
    borderRadius: 8,
    padding: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  totalLabelLight: {
    fontSize: 9,
    color: '#a8a29e',
  },
  totalValueLight: {
    fontSize: 9,
    color: '#a8a29e',
  },
  totalDivider: {
    height: 1,
    backgroundColor: '#44403c',
    marginVertical: 10,
  },
  grandTotalLabel: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: colors.white,
  },
  grandTotalValue: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: colors.primary,
  },
  // Terms
  termsBox: {
    backgroundColor: colors.accent,
    borderRadius: 6,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#fde68a',
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
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.dark,
    height: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 50,
  },
  footerText: { fontSize: 8, color: '#78716c' },
  footerBrand: { fontSize: 8, color: colors.primary, fontFamily: 'Helvetica-Bold' },
})

interface PhotographerPDFProps {
  data: {
    client_name: string
    client_email?: string
    service_description: string
    price: number
    vat_percent?: number
    shoot_type?: string
    shoot_duration?: string
    num_photos?: string
    delivery_format?: string
    extra_services?: string
    quote_number?: string
    date?: string
  }
}

export function PhotographerPDF({ data }: PhotographerPDFProps) {
  const vatPercent = data.vat_percent ?? 21
  const basePrice = data.price
  const vatAmount = (basePrice * vatPercent) / 100
  const totalPrice = basePrice + vatAmount
  const quoteNumber = data.quote_number ?? `FT-${Date.now().toString().slice(-6)}`
  const date = data.date ?? new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })

  const deliverables = [
    data.num_photos && `${data.num_photos}`,
    data.delivery_format && `Entrega: ${data.delivery_format}`,
    data.extra_services && `Extras: ${data.extra_services}`,
  ].filter(Boolean) as string[]

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.topBar} />
        <View style={styles.content}>
          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.eyebrow}>Fotografia Profesional</Text>
              <Text style={styles.title}>Presupuesto</Text>
              <Text style={styles.subtitle}>Propuesta fotográfica personalizada</Text>
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.quoteNumber}>Nº {quoteNumber}</Text>
              <Text style={styles.quoteNumber}>{date}</Text>
            </View>
          </View>
          <View style={styles.divider} />

          {/* INFO GRID */}
          <View style={styles.infoGrid}>
            <View style={[styles.infoCard, styles.infoCardDark]}>
              <Text style={[styles.infoLabel, styles.infoLabelLight]}>Cliente</Text>
              <Text style={[styles.infoValue, styles.infoValueLight]}>{data.client_name}</Text>
              {data.client_email && (
                <Text style={[styles.infoSub, styles.infoSubLight]}>{data.client_email}</Text>
              )}
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Tipo de sesión</Text>
              <Text style={styles.infoValue}>{data.shoot_type ?? 'Sesión fotográfica'}</Text>
              {data.shoot_duration && (
                <Text style={styles.infoSub}>Duración: {data.shoot_duration}</Text>
              )}
            </View>
          </View>

          {/* SERVICIO */}
          <Text style={styles.sectionTitle}>Descripción del servicio</Text>
          <View style={styles.serviceRow}>
            <View style={styles.serviceLeft}>
              <Text style={styles.serviceName}>{data.shoot_type ?? 'Sesión fotográfica'}</Text>
              <Text style={styles.serviceDesc}>{data.service_description}</Text>
            </View>
            <View style={styles.serviceRight}>
              <Text style={styles.servicePrice}>{basePrice.toFixed(2)} €</Text>
            </View>
          </View>

          {/* ENTREGABLES */}
          {deliverables.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Entregables incluidos</Text>
              {deliverables.map((item, i) => (
                <View key={i} style={styles.deliverableItem}>
                  <Text style={styles.deliverableIcon}>{'>'}</Text>
                  <Text style={styles.deliverableText}>{item}</Text>
                </View>
              ))}
            </>
          )}

          {/* TOTAL */}
          <View style={styles.totalSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabelLight}>Subtotal (sin IVA)</Text>
              <Text style={styles.totalValueLight}>{basePrice.toFixed(2)} €</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabelLight}>IVA ({vatPercent}%)</Text>
              <Text style={styles.totalValueLight}>{vatAmount.toFixed(2)} €</Text>
            </View>
            <View style={styles.totalDivider} />
            <View style={styles.totalRow}>
              <Text style={styles.grandTotalLabel}>TOTAL</Text>
              <Text style={styles.grandTotalValue}>{totalPrice.toFixed(2)} €</Text>
            </View>
          </View>

          {/* CONDICIONES */}
          <View style={styles.termsBox}>
            <Text style={styles.termsTitle}>Condiciones y derechos de imagen</Text>
            <Text style={styles.termsText}>
              • Pago: 50% reserva + 50% antes de la entrega de las fotos.{'\n'}
              • Las fotos se entregarán en un plazo de 7-14 días tras la sesión.{'\n'}
              • Derechos de uso personal. Uso comercial requiere acuerdo adicional.{'\n'}
              • Cancelaciones con menos de 48h: se aplica penalización del 30%.{'\n'}
              • Presupuesto válido 30 días desde la fecha de emisión.
            </Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Nº {quoteNumber} · {date}</Text>
          <Text style={styles.footerBrand}>Generado con PresupuestoPro</Text>
        </View>
      </Page>
    </Document>
  )
}
