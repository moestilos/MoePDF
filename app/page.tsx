'use client'
import { useState } from 'react'
import { ProfileSelector } from '@/components/ProfileSelector'
import { QuoteForm } from '@/components/QuoteForm'
import { QuotePreview } from '@/components/QuotePreview'
import { ProfileType } from '@/lib/profiles'
import { IconArrowLeft, IconLightning, IconTarget, IconShield, IconCheck } from '@/components/Icons'

type Step = 'select-profile' | 'fill-form' | 'preview'

interface GenerationResult {
  generation_id: string
  download_token?: string
  is_admin: boolean
  status: string
}

export default function HomePage() {
  const [step, setStep]                       = useState<Step>('select-profile')
  const [selectedProfile, setSelectedProfile] = useState<ProfileType | null>(null)
  const [formData, setFormData]               = useState<Record<string, unknown>>({})
  const [generation, setGeneration]           = useState<GenerationResult | null>(null)
  const [isLoading, setIsLoading]             = useState(false)
  const [isPaying, setIsPaying]               = useState(false)
  const [error, setError]                     = useState('')

  function handleProfileSelect(type: ProfileType) {
    setSelectedProfile(type); setStep('fill-form')
  }

  async function handleFormSubmit(data: Record<string, unknown>) {
    setIsLoading(true); setError('')
    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const e = await res.json()
        throw new Error(e.detail ? `${e.error}: ${e.detail}` : (e.error ?? `HTTP ${res.status}`))
      }
      const result: GenerationResult = await res.json()
      setFormData(data); setGeneration(result); setStep('preview')
      fetch('/api/track-visit', { method: 'POST' }).catch(() => {})
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally { setIsLoading(false) }
  }

  async function handlePayClick() {
    if (!generation) return
    setIsPaying(true); setError('')
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generation_id: generation.generation_id }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      const { checkout_url, already_paid, download_token } = await res.json()
      if (already_paid) { setGeneration(p => p ? { ...p, download_token, status: 'paid' } : p); return }
      window.location.href = checkout_url
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error en el pago'); setIsPaying(false)
    }
  }

  function handleBack() {
    if (step === 'fill-form') setStep('select-profile')
    else if (step === 'preview') { setStep('fill-form'); setGeneration(null) }
  }

  const isLanding = step === 'select-profile'

  return (
    <div className="min-h-screen">

      {/* ──────────── HERO ──────────── */}
      {isLanding && (
        <section className="pt-16 sm:pt-24 pb-0 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

              {/* Texto */}
              <div className="flex-1 text-center lg:text-left">

                {/* Badge pill */}
                <div
                  className="animate-fade-in inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12px] font-medium mb-7"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                  Disponible ahora · Sin suscripción
                </div>

                {/* Headline */}
                <h1 className="animate-slide-up text-[46px] sm:text-[60px] lg:text-[68px] font-black leading-[1.03] tracking-[-0.03em] mb-5 text-white">
                  Presupuestos PDF<br />
                  <span className="text-gradient">que cierran ventas</span>
                </h1>

                <p
                  className="animate-slide-up delay-100 text-[15px] sm:text-[17px] max-w-lg mx-auto lg:mx-0 leading-relaxed mb-8"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Para diseñadores, freelancers, entrenadores y fotógrafos.
                  Genera un presupuesto en menos de un minuto.{' '}
                  <span style={{ color: 'var(--text-primary)' }}>
                    Preview gratis — descarga por 1&nbsp;€.
                  </span>
                </p>

                {/* Stats strip */}
                <div className="animate-slide-up delay-200 flex justify-center lg:justify-start">
                  <div
                    className="inline-flex items-center divide-x overflow-hidden rounded-2xl"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    {[
                      { value: '4', label: 'Perfiles pro' },
                      { value: '1 €', label: 'Por PDF' },
                      { value: '< 1 min', label: 'Generación' },
                    ].map((s, i) => (
                      <div
                        key={s.label}
                        className="px-5 sm:px-6 py-3 text-center"
                        style={{ borderRight: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
                      >
                        <div className="text-[17px] font-bold tabular-nums leading-none text-white">{s.value}</div>
                        <div className="text-[11px] font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* PDF Mockup — desktop only */}
              <div className="hidden lg:block flex-shrink-0 animate-fade-in delay-300">
                <PDFMockup />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ──────────── CÓMO FUNCIONA ──────────── */}
      {isLanding && (
        <section className="pt-16 pb-0 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <p className="section-label mb-2">Proceso</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Tres pasos, un presupuesto</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { n: '1', title: 'Elige tu perfil', desc: 'Selecciona tu tipo de actividad. El formulario y el PDF se adaptan a ti.', glow: 'rgba(var(--brand-rgb),0.12)' },
                { n: '2', title: 'Rellena los datos', desc: 'Nombre del cliente, servicio, precio e IVA. Listo en menos de un minuto.', glow: 'rgba(var(--brand-2-rgb),0.10)' },
                { n: '3', title: 'Descarga tu PDF', desc: 'Preview gratis. Paga 1€ con Stripe para descargar el documento final.', glow: 'rgba(var(--brand-rgb),0.10)' },
              ].map((s, i) => (
                <div
                  key={s.n}
                  className={`animate-slide-up delay-${(i + 1) * 100} relative card-elevated p-6 overflow-hidden`}
                >
                  {/* Watermark */}
                  <span className="absolute -right-1 -top-5 text-[80px] font-black leading-none select-none pointer-events-none" style={{ color: 'rgba(255,255,255,0.04)' }}>
                    {s.n}
                  </span>
                  {/* Glow blob */}
                  <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ background: `radial-gradient(circle at 0% 0%, ${s.glow} 0%, transparent 60%)` }} />
                  <div className="step-number mb-4">{s.n}</div>
                  <h3 className="font-bold text-[15px] mb-1.5 text-white">{s.title}</h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ──────────── CONTENEDOR PRINCIPAL ──────────── */}
      <div className={`max-w-2xl mx-auto px-4 sm:px-6 ${isLanding ? 'pt-14 pb-24' : 'py-8'}`}>

        {/* Back + Steps */}
        {!isLanding && (
          <div className="flex items-center justify-between mb-7">
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 text-sm font-medium transition-colors group"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-primary)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')}
            >
              <IconArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              Atrás
            </button>
            <StepIndicator currentStep={step} />
            <div className="w-14" />
          </div>
        )}

        {isLanding && (
          <div className="flex flex-col items-center gap-3 mb-7">
            <StepIndicator currentStep={step} />
            <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
              Empieza eligiendo tu perfil profesional
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="mb-5 flex items-start gap-3 p-4 rounded-xl text-sm animate-slide-down"
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#fca5a5',
            }}
          >
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: '#f87171' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        )}

        {/* Steps */}
        {step === 'select-profile' && (
          <div className="animate-scale-in card-elevated p-6 sm:p-8">
            <ProfileSelector selected={selectedProfile} onSelect={handleProfileSelect} />
          </div>
        )}
        {step === 'fill-form' && selectedProfile && (
          <div className="animate-scale-in card-elevated p-6 sm:p-8">
            <QuoteForm profileType={selectedProfile} onSubmit={handleFormSubmit} isLoading={isLoading} />
          </div>
        )}
        {step === 'preview' && generation && selectedProfile && (
          <div className="animate-scale-in card-elevated p-6 sm:p-8">
            <QuotePreview
              data={formData} profileType={selectedProfile}
              generationId={generation.generation_id}
              downloadToken={generation.download_token}
              isAdmin={generation.is_admin}
              onPayClick={handlePayClick} isPaying={isPaying}
            />
          </div>
        )}

        {/* Features */}
        {isLanding && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            {[
              { Icon: IconTarget,    title: 'Adaptado a tu profesión', desc: 'Formulario y PDF personalizados. Nada genérico.',              color: 'rgba(var(--brand-rgb),0.12)',  iconColor: 'rgb(var(--brand-light-rgb))' },
              { Icon: IconLightning, title: 'Listo en segundos',        desc: 'Sin registro previo. Rellena y genera al instante.',         color: 'rgba(245,158,11,0.10)',  iconColor: '#fbbf24' },
              { Icon: IconShield,    title: 'Pago seguro',               desc: 'Checkout con Stripe. Descarga inmediata. Sin suscripción.', color: 'rgba(16,185,129,0.10)',  iconColor: '#34d399' },
            ].map(({ Icon, title, desc, color, iconColor }, i) => (
              <div
                key={title}
                className={`animate-slide-up delay-${(i + 2) * 100} card p-5 flex gap-4`}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: color }}
                >
                  <Icon className="w-5 h-5" style={{ color: iconColor } as React.CSSProperties} />
                </div>
                <div>
                  <h3 className="font-semibold text-[13px] mb-1 leading-snug text-white">{title}</h3>
                  <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Trust badges */}
        {isLanding && (
          <div className="mt-6 flex items-center justify-center gap-4 flex-wrap">
            {['4 plantillas profesionales', 'Pago único · sin suscripción', 'Generación inmediata'].map(t => (
              <span key={t} className="inline-flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                <IconCheck className="w-3 h-3 flex-shrink-0" style={{ color: '#34d399' } as React.CSSProperties} />
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── PDF Mockup ── */
function PDFMockup() {
  return (
    <div className="relative w-[296px]">
      {/* Shadow card */}
      <div
        className="absolute inset-0 translate-x-3 translate-y-3 rounded-2xl"
        style={{ background: 'rgba(var(--brand-rgb),0.15)', filter: 'blur(16px)' }}
      />

      {/* Main card */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* Header gradient */}
        <div className="bg-gradient-to-br from-violet-600 to-purple-700 px-6 py-5">
          <span className="block text-[9px] font-bold uppercase tracking-[0.12em] text-white/60 mb-2">
            Diseñador Web
          </span>
          <div className="text-2xl font-black text-white leading-none mb-1">Presupuesto</div>
          <div className="text-white/50 text-[11px]">Propuesta profesional</div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Simulated lines */}
          <div className="space-y-2.5">
            {[0.75, 0.5, 0.65].map((w, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: i === 0 ? 'rgb(var(--brand-light-rgb))' : 'rgba(255,255,255,0.12)' }} />
                <div className="h-[6px] rounded-full" style={{ width: `${w * 100}%`, background: 'rgba(255,255,255,0.07)' }} />
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="pt-4 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex justify-between items-center">
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Subtotal</span>
              <span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>1.500 €</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>IVA (21%)</span>
              <span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>315 €</span>
            </div>
            <div className="flex justify-between items-center pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <span className="text-[13px] font-bold text-white">Total</span>
              <span className="text-[14px] font-black" style={{ color: 'rgb(var(--brand-2-rgb))' }}>1.815 €</span>
            </div>
          </div>

          {/* Button */}
          <div className="pt-1">
            <div
              className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, rgb(var(--brand-rgb)), rgb(var(--brand-2-rgb)))', boxShadow: '0 0 20px rgba(var(--brand-rgb),0.3)' }}
            >
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              <span className="text-[11px] font-bold text-white">Descargar PDF</span>
            </div>
          </div>
        </div>
      </div>

      {/* Badge: listo */}
      <div
        className="absolute -top-3 -right-4 flex items-center gap-1.5 px-3 py-2 rounded-xl"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        }}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
        <span className="text-[11px] font-semibold text-white">Listo en &lt;1 min</span>
      </div>

      {/* Badge: pago seguro */}
      <div
        className="absolute -bottom-3 -left-4 flex items-center gap-2 px-3 py-2 rounded-xl"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'rgb(var(--brand-light-rgb))' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
        <span className="text-[11px] font-semibold text-white">Pago seguro</span>
      </div>
    </div>
  )
}

/* ── Step Indicator ── */
function StepIndicator({ currentStep }: { currentStep: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: 'select-profile', label: 'Perfil' },
    { id: 'fill-form',      label: 'Datos' },
    { id: 'preview',        label: 'Vista previa' },
  ]
  const currentIndex = steps.findIndex(s => s.id === currentStep)

  return (
    <div className="flex items-center gap-1">
      {steps.map((s, i) => {
        const done    = i < currentIndex
        const current = i === currentIndex
        return (
          <div key={s.id} className="flex items-center">
            <div className="flex items-center gap-1.5">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300"
                style={{
                  background: done || current
                    ? 'linear-gradient(135deg, rgb(var(--brand-rgb)), rgb(var(--brand-2-rgb)))'
                    : 'rgba(255,255,255,0.08)',
                  color: done || current ? 'white' : 'var(--text-muted)',
                  boxShadow: current ? '0 0 0 3px rgba(var(--brand-rgb),0.2)' : 'none',
                }}
              >
                {done
                  ? <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  : <span>{i + 1}</span>
                }
              </div>
              <span
                className="text-[11px] font-medium hidden sm:block transition-colors"
                style={{ color: current ? 'rgb(var(--brand-light-rgb))' : done ? 'var(--text-secondary)' : 'var(--text-muted)' }}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="w-5 sm:w-8 h-px mx-2 transition-all duration-300"
                style={{ background: i < currentIndex ? 'rgba(var(--brand-rgb),0.5)' : 'rgba(255,255,255,0.08)' }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
