/**
 * TEMPLATE PDF: Diseñador Web
 * Estilo: moderno, creativo, con color morado como acento
 */
import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

const colors = {
  primary: '#7c3aed',   // Morado brand
  dark: '#1e1b4b',
  gray: '#6b7280',
  lightGray: '#f3f4f6',
  border: '#e5e7eb',
  white: '#ffffff',
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.white,
    padding: 50,
    fontFamily: 'Helvetica',
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 3,
    borderBottomColor: colors.primary,
  },
  headerLeft: {
    flex: 1,
  },
  badge: {
    backgroundColor: colors.primary,
    color: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: colors.dark,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 11,
    color: colors.gray,
    marginTop: 4,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  quoteNumber: {
    fontSize: 11,
    color: colors.gray,
  },
  quoteDate: {
    fontSize: 11,
    color: colors.gray,
    marginTop: 2,
  },
  // Info section
  infoRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  infoBox: {
    flex: 1,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    padding: 14,
  },
  infoBoxTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 11,
    color: colors.dark,
    lineHeight: 1.5,
  },
  infoTextLight: {
    fontSize: 10,
    color: colors.gray,
  },
  // Section
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: colors.dark,
    marginBottom: 10,
    marginTop: 18,
    paddingLeft: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  // Services table
  table: {
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  tableHeaderText: {
    color: colors.white,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableRowAlt: {
    backgroundColor: '#faf5ff',
  },
  col1: { flex: 3 },
  col2: { flex: 1, textAlign: 'right' as const },
  tableCell: {
    fontSize: 10,
    color: colors.dark,
    lineHeight: 1.5,
  },
  // Totals
  totalsContainer: {
    marginTop: 16,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 240,
    paddingVertical: 5,
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
    width: 240,
    paddingVertical: 8,
    marginTop: 4,
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 12,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: colors.white,
  },
  grandTotalValue: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: colors.white,
  },
  // Terms
  termsBox: {
    backgroundColor: '#faf5ff',
    borderRadius: 6,
    padding: 14,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#ddd6fe',
  },
  termsTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.primary,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  termsText: {
    fontSize: 9,
    color: colors.gray,
    lineHeight: 1.6,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  footerText: {
    fontSize: 8,
    color: colors.gray,
  },
  footerBrand: {
    fontSize: 8,
    color: colors.primary,
    fontFamily: 'Helvetica-Bold',
  },
})

interface DesignerPDFProps {
  data: {
    client_name: string
    client_email?: string
    service_description: string
    price: number
    vat_percent?: number
    project_type?: string
    num_pages?: number
    includes?: string
    delivery_days?: number
    quote_number?: string
    date?: string
  }
}

export function DesignerPDF({ data }: DesignerPDFProps) {
  const vatPercent = data.vat_percent ?? 21
  const basePrice = data.price
  const vatAmount = (basePrice * vatPercent) / 100
  const totalPrice = basePrice + vatAmount
  const quoteNumber = data.quote_number ?? `DW-${Date.now().toString().slice(-6)}`
  const date = data.date ?? new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.badge}>Diseño Web</Text>
            <Text style={styles.title}>Presupuesto</Text>
            <Text style={styles.subtitle}>Propuesta de proyecto digital</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.quoteNumber}>Nº {quoteNumber}</Text>
            <Text style={styles.quoteDate}>{date}</Text>
          </View>
        </View>

        {/* INFO CLIENTE / PROFESIONAL */}
        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxTitle}>Para</Text>
            <Text style={styles.infoText}>{data.client_name}</Text>
            {data.client_email && (
              <Text style={styles.infoTextLight}>{data.client_email}</Text>
            )}
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxTitle}>Tipo de proyecto</Text>
            <Text style={styles.infoText}>{data.project_type ?? 'Proyecto web'}</Text>
            {data.num_pages && (
              <Text style={styles.infoTextLight}>{data.num_pages} páginas / pantallas</Text>
            )}
          </View>
          {data.delivery_days && (
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxTitle}>Plazo de entrega</Text>
              <Text style={styles.infoText}>{data.delivery_days} días laborables</Text>
            </View>
          )}
        </View>

        {/* DESCRIPCIÓN DEL PROYECTO */}
        <Text style={styles.sectionTitle}>Descripción del proyecto</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.col1]}>Servicio</Text>
            <Text style={[styles.tableHeaderText, styles.col2]}>Importe</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.col1]}>{data.service_description}</Text>
            <Text style={[styles.tableCell, styles.col2]}>{basePrice.toFixed(2)} €</Text>
          </View>
          {data.includes && (
            <View style={[styles.tableRow, styles.tableRowAlt]}>
              <Text style={[styles.tableCell, styles.col1, { color: colors.gray, fontSize: 9 }]}>
                Incluye: {data.includes}
              </Text>
              <Text style={[styles.tableCell, styles.col2]}> </Text>
            </View>
          )}
        </View>

        {/* TOTALES */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal (sin IVA)</Text>
            <Text style={styles.totalValue}>{basePrice.toFixed(2)} €</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>IVA ({vatPercent}%)</Text>
            <Text style={styles.totalValue}>{vatAmount.toFixed(2)} €</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>TOTAL</Text>
            <Text style={styles.grandTotalValue}>{totalPrice.toFixed(2)} €</Text>
          </View>
        </View>

        {/* CONDICIONES */}
        <View style={styles.termsBox}>
          <Text style={styles.termsTitle}>Condiciones y forma de pago</Text>
          <Text style={styles.termsText}>
            • Pago: 50% al inicio del proyecto y 50% a la entrega final.{'\n'}
            • Presupuesto válido por 30 días desde la fecha de emisión.{'\n'}
            • Las revisiones adicionales fuera del alcance acordado se presupuestarán por separado.{'\n'}
            • El cliente facilitará todos los materiales (textos, imágenes) necesarios antes del inicio.{'\n'}
            • La propiedad intelectual del diseño se transfiere al cliente una vez realizado el pago total.
          </Text>
        </View>

        {/* FOOTER */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Presupuesto Nº {quoteNumber} · {date}</Text>
          <Text style={styles.footerBrand}>Generado con PresupuestoPro</Text>
        </View>
      </Page>
    </Document>
  )
}
