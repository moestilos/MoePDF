'use client'
import { useState } from 'react'
import { PROFILES, ProfileType } from '@/lib/profiles'
import { PDF_PRICE_DISPLAY } from '@/lib/stripe'
import { IconDownload, IconCreditCard, IconSpinner, IconCrown, IconArrowLeft } from './Icons'

interface QuotePreviewProps {
  data: Record<string, unknown>
  profileType: ProfileType
  generationId: string
  downloadToken?: string
  isAdmin: boolean
  onPayClick: () => void
  isPaying: boolean
}

const PROFILE_GRADIENT: Record<string, string> = {
  designer:     'from-violet-600 to-purple-700',
  freelancer:   'from-blue-600 to-indigo-700',
  trainer:      'from-emerald-600 to-green-700',
  photographer: 'from-gray-700 to-gray-900',
}

const PROFILE_ACCENT: Record<string, string> = {
  designer:     '#c4b5fd',
  freelancer:   '#93c5fd',
  trainer:      '#6ee7b7',
  photographer: '#fcd34d',
}

const PROFILE_GLOW: Record<string, string> = {
  designer:     'rgba(124,58,237,0.2)',
  freelancer:   'rgba(59,130,246,0.18)',
  trainer:      'rgba(16,185,129,0.18)',
  photographer: 'rgba(245,158,11,0.18)',
}

export function QuotePreview({ data, profileType, generationId, downloadToken, isAdmin, onPayClick, isPaying }: QuotePreviewProps) {
  const profile = PROFILES[profileType]
  const [isDownloading, setIsDownloading] = useState(false)
  const [dlError, setDlError] = useState('')

  const price       = Number(data.price ?? 0)
  const vat         = Number(data.vat_percent ?? 21)
  const vatAmt      = (price * vat) / 100
  const total       = price + vatAmt
  const canDownload = isAdmin || !!downloadToken
  const gradient    = PROFILE_GRADIENT[profileType] ?? 'from-indigo-600 to-violet-700'
  const accent      = PROFILE_ACCENT[profileType] ?? '#818cf8'
  const glow        = PROFILE_GLOW[profileType] ?? 'rgba(99,102,241,0.2)'

  async function handleDownload() {
    setIsDownloading(true); setDlError('')
    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generation_id: generationId, download_token: downloadToken }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url; a.download = `presupuesto-${profileType}.pdf`
      document.body.appendChild(a); a.click()
      URL.revokeObjectURL(url); document.body.removeChild(a)
    } catch (e: unknown) {
      setDlError(e instanceof Error ? e.message : 'Error descargando')
    } finally { setIsDownloading(false) }
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Tu presupuesto está listo</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {profile.name} · Vista previa gratuita
          </p>
        </div>
        {isAdmin && (
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg"
            style={{ background: 'rgba(124,58,237,0.15)', color: '#c4b5fd', border: '1px solid rgba(124,58,237,0.3)' }}
          >
            <IconCrown className="w-3.5 h-3.5" /> Admin
          </span>
        )}
      </div>

      {/* Documento preview */}
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{ border: '1px solid rgba(255,255,255,0.08)', boxShadow: `0 4px 32px rgba(0,0,0,0.5), 0 0 60px ${glow}` }}
      >
        {/* Header del documento */}
        <div className={`bg-gradient-to-r ${gradient} p-6`}>
          <div className="flex justify-between items-start">
            <div>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-white/20 text-white mb-2">
                {profile.name}
              </span>
              <h3 className="text-3xl font-black text-white tracking-tight">Presupuesto</h3>
              <p className="text-white/60 text-sm mt-1">Propuesta profesional</p>
            </div>
            <div className="text-right text-white/50 text-xs">
              <p>{new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5" style={{ background: 'var(--bg-surface)' }}>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            <InfoBlock label="Para" value={String(data.client_name ?? '')} />
            {Boolean(data.client_email) && <InfoBlock label="Email" value={String(data.client_email)} />}
          </div>

          {/* Descripción */}
          <div className="pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
              Descripción del servicio
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {String(data.service_description ?? '')}
            </p>
          </div>

          {/* Totales */}
          <div className="pt-4 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
              <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{price.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--text-muted)' }}>IVA ({vat}%)</span>
              <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{vatAmt.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="text-white">Total</span>
              <span style={{ color: accent }}>{total.toFixed(2)} €</span>
            </div>
          </div>

          {/* Condiciones — blur si no ha pagado */}
          <div
            className={`pt-4 transition-all ${!canDownload ? 'blur-sm select-none pointer-events-none' : ''}`}
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
              Condiciones
            </p>
            <div className="space-y-1.5">
              {getTerms(profileType).map((t, i) => (
                <p key={i} className="text-xs flex items-start gap-1.5" style={{ color: 'var(--text-muted)' }}>
                  <span className="mt-0.5" style={{ color: accent }}>•</span>{t}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Fade overlay */}
        {!canDownload && (
          <div
            className="absolute bottom-0 left-0 right-0 h-32"
            style={{ background: `linear-gradient(to top, var(--bg-surface), rgba(13,13,23,0.6), transparent)` }}
          />
        )}
      </div>

      {/* CTA */}
      {canDownload ? (
        <div
          className="rounded-2xl p-6 text-center"
          style={{
            background: 'rgba(16,185,129,0.06)',
            border: '1px solid rgba(16,185,129,0.2)',
          }}
        >
          <div
            className="mx-auto mb-3 w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(16,185,129,0.15)' }}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: '#34d399' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h3 className="font-bold mb-1" style={{ color: '#6ee7b7' }}>
            {isAdmin ? 'Descarga disponible (admin)' : '¡Pago completado!'}
          </h3>
          <p className="text-sm mb-5" style={{ color: 'rgba(110,231,183,0.7)' }}>
            Tu presupuesto profesional está listo
          </p>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #059669, #047857)',
              color: 'white',
              boxShadow: '0 4px 16px rgba(5,150,105,0.3)',
            }}
          >
            {isDownloading
              ? <><IconSpinner className="w-4 h-4 animate-spin" />Descargando...</>
              : <><IconDownload className="w-4 h-4" />Descargar PDF</>
            }
          </button>
          {dlError && <p className="mt-2 text-xs" style={{ color: '#f87171' }}>{dlError}</p>}
        </div>
      ) : (
        <div
          className="rounded-2xl p-6"
          style={{
            background: 'rgba(99,102,241,0.06)',
            border: '1px solid rgba(99,102,241,0.18)',
          }}
        >
          <div className="text-center mb-5">
            <h3 className="font-bold text-white mb-1">Descarga el PDF profesional</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Listo para enviar a tu cliente — look premium garantizado
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="text-4xl font-black text-gradient">{PDF_PRICE_DISPLAY}</span>
            <div className="text-left">
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>pago único</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>descarga inmediata</p>
            </div>
          </div>
          <button onClick={onPayClick} disabled={isPaying} className="btn-primary w-full py-3.5">
            {isPaying
              ? <><IconSpinner className="w-4 h-4 animate-spin" />Redirigiendo a Stripe...</>
              : <><IconCreditCard className="w-4 h-4" />Pagar y descargar PDF</>
            }
          </button>
          <p className="mt-3 text-center text-[11px]" style={{ color: 'var(--text-muted)' }}>
            Pago seguro con Stripe · Sin suscripción
          </p>
        </div>
      )}

      {/* Reset */}
      <button
        onClick={() => window.location.reload()}
        className="w-full flex items-center justify-center gap-1.5 text-sm py-1 transition-colors group"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')}
      >
        <IconArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        Crear otro presupuesto
      </button>
    </div>
  )
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-xl p-3"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-sm font-semibold truncate text-white">{value}</p>
    </div>
  )
}

function getTerms(type: ProfileType): string[] {
  const t: Record<ProfileType, string[]> = {
    designer:     ['Pago: 50% inicio + 50% entrega', 'Validez 30 días', 'Revisiones extra se presupuestan aparte'],
    freelancer:   ['Pago: 50% inicio + 50% entrega', 'Validez 30 días desde emisión', 'Cambios fuera de alcance requieren nuevo presupuesto'],
    trainer:      ['100% al inicio del programa', 'Sin devolución una vez iniciado', 'Cambios de horario con 24h de antelación'],
    photographer: ['50% de reserva para asegurar la fecha', 'Entrega en 7-14 días', 'Cancelaciones < 48h: 30% de penalización'],
  }
  return t[type] ?? []
}
