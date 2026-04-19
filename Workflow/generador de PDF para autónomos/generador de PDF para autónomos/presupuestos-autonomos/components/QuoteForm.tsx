'use client'
import { useState } from 'react'
import { PROFILES, COMMON_FIELDS, ProfileType, FormField } from '@/lib/profiles'
import { IconBrush, IconBriefcase, IconBarbell, IconCamera, IconSpinner } from './Icons'

const PROFILE_ICON: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  designer:     IconBrush,
  freelancer:   IconBriefcase,
  trainer:      IconBarbell,
  photographer: IconCamera,
}

const PROFILE_GRADIENT: Record<string, string> = {
  designer:     'from-violet-500 to-purple-600',
  freelancer:   'from-blue-500 to-indigo-600',
  trainer:      'from-emerald-500 to-green-600',
  photographer: 'from-amber-500 to-orange-600',
}

const PROFILE_FOCUS: Record<string, string> = {
  designer:     'rgba(124,58,237,0.5)',
  freelancer:   'rgba(59,130,246,0.5)',
  trainer:      'rgba(16,185,129,0.5)',
  photographer: 'rgba(245,158,11,0.5)',
}

interface QuoteFormProps {
  profileType: ProfileType
  onSubmit: (data: Record<string, unknown>) => void
  isLoading: boolean
}

export function QuoteForm({ profileType, onSubmit, isLoading }: QuoteFormProps) {
  const profile     = PROFILES[profileType]
  const allFields   = [...COMMON_FIELDS, ...profile.fields]
  const gradient    = PROFILE_GRADIENT[profileType] ?? 'from-indigo-500 to-violet-600'
  const focusColor  = PROFILE_FOCUS[profileType] ?? 'rgba(99,102,241,0.5)'
  const ProfileIcon = PROFILE_ICON[profileType]

  const [formData, setFormData] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    allFields.forEach(f => { init[f.id] = '' })
    return init
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    allFields.forEach(f => { if (f.required && !formData[f.id]?.trim()) e[f.id] = 'Campo obligatorio' })
    setErrors(e)
    return !Object.keys(e).length
  }

  function handleChange(id: string, value: string) {
    setFormData(p => ({ ...p, [id]: value }))
    if (errors[id]) setErrors(p => ({ ...p, [id]: '' }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (validate()) onSubmit({ ...formData, profile_type: profileType })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">

      {/* Profile header */}
      <div className={`flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r ${gradient}`}
        style={{ boxShadow: `0 4px 24px ${focusColor.replace('0.5', '0.2')}` }}
      >
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          {ProfileIcon && <ProfileIcon className="w-5 h-5 text-white" />}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-[14px] leading-snug text-white">{profile.name}</p>
          <p className="text-white/60 text-[12px] mt-0.5 leading-snug">{profile.tagline}</p>
        </div>
      </div>

      {/* Campos comunes */}
      <FieldGroup label="Datos del cliente">
        {COMMON_FIELDS.map(f => (
          <FieldInput
            key={f.id} field={f}
            value={formData[f.id] ?? ''} error={errors[f.id]}
            focusColor={focusColor}
            onChange={v => handleChange(f.id, v)}
          />
        ))}
      </FieldGroup>

      {/* Campos específicos */}
      {profile.fields.length > 0 && (
        <FieldGroup label="Detalles del servicio">
          {profile.fields.map(f => (
            <FieldInput
              key={f.id} field={f}
              value={formData[f.id] ?? ''} error={errors[f.id]}
              focusColor={focusColor}
              onChange={v => handleChange(f.id, v)}
            />
          ))}
        </FieldGroup>
      )}

      {/* Submit */}
      <button type="submit" disabled={isLoading} className="btn-primary w-full py-3.5 text-[14px]">
        {isLoading
          ? <><IconSpinner className="w-4 h-4 animate-spin" />Generando presupuesto...</>
          : <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Generar presupuesto gratis
            </>
        }
      </button>

      <p className="text-center text-[11px]" style={{ color: 'var(--text-muted)' }}>
        Preview gratis · Paga 1€ sólo si quieres descargar
      </p>
    </form>
  )
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.09em] whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
          {label}
        </span>
        <span className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
      </div>
      {children}
    </div>
  )
}

function FieldInput({
  field, value, error, focusColor, onChange,
}: {
  field: FormField; value: string; error?: string; focusColor: string; onChange: (v: string) => void
}) {
  const [focused, setFocused] = useState(false)

  const inputStyle: React.CSSProperties = {
    background: error ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.05)',
    border: `1px solid ${error ? 'rgba(239,68,68,0.4)' : focused ? focusColor : 'rgba(255,255,255,0.10)'}`,
    boxShadow: focused && !error
      ? `inset 0 1px 2px rgba(0,0,0,0.3), 0 0 0 3px ${focusColor.replace('0.5', '0.12')}`
      : 'inset 0 1px 2px rgba(0,0,0,0.25)',
    color: 'var(--text-primary)',
    width: '100%',
    borderRadius: '12px',
    padding: '10px 14px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.15s ease',
  }

  const sharedProps = {
    value,
    onFocus: () => setFocused(true),
    onBlur:  () => setFocused(false),
    style: inputStyle,
  }

  return (
    <div>
      <label className="form-label">
        {field.label}
        {field.required && <span className="ml-1 font-semibold" style={{ color: '#f87171' }}>*</span>}
        {field.hint && <span className="text-[11px] font-normal ml-1.5" style={{ color: 'var(--text-muted)' }}>· {field.hint}</span>}
      </label>

      {field.type === 'textarea' ? (
        <textarea
          {...sharedProps}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className="resize-none"
          style={{ ...inputStyle, resize: 'none' } as React.CSSProperties}
        />
      ) : field.type === 'select' ? (
        <select
          {...sharedProps}
          onChange={e => onChange(e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer' } as React.CSSProperties}
        >
          <option value="" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>Seleccionar...</option>
          {field.options?.map(o => (
            <option key={o} value={o} style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}>{o}</option>
          ))}
        </select>
      ) : (
        <input
          {...sharedProps}
          type={field.type === 'number' ? 'number' : 'text'}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder}
          min={field.type === 'number' ? 0 : undefined}
        />
      )}

      {error && (
        <p className="mt-1.5 text-[11px] flex items-center gap-1.5" style={{ color: '#f87171' }}>
          <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}
