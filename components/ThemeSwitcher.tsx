'use client'
import { useEffect, useState, useRef } from 'react'

export type ThemeName = 'indigo' | 'rose' | 'blue' | 'emerald' | 'amber' | 'cyan' | 'pink'

const THEMES: { id: ThemeName; label: string; swatch: string }[] = [
  { id: 'indigo',  label: 'Indigo',    swatch: '#6366f1' },
  { id: 'blue',    label: 'Azul',      swatch: '#3b82f6' },
  { id: 'emerald', label: 'Verde',     swatch: '#10b981' },
  { id: 'rose',    label: 'Rojo',      swatch: '#f43f5e' },
  { id: 'amber',   label: 'Ambar',     swatch: '#f59e0b' },
  { id: 'cyan',    label: 'Cian',      swatch: '#06b6d4' },
  { id: 'pink',    label: 'Rosa',      swatch: '#ec4899' },
]

const STORAGE_KEY = 'moe-theme'

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<ThemeName>('indigo')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as ThemeName | null) ?? 'indigo'
    setTheme(stored)
    document.documentElement.setAttribute('data-theme', stored)
  }, [])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function pick(t: ThemeName) {
    setTheme(t)
    document.documentElement.setAttribute('data-theme', t)
    localStorage.setItem(STORAGE_KEY, t)
    setOpen(false)
  }

  const current = THEMES.find(t => t.id === theme) ?? THEMES[0]

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        title="Cambiar color"
        aria-label="Cambiar color de la web"
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg transition-all hover:scale-105"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.10)',
        }}
      >
        <span
          className="w-4 h-4 rounded-full"
          style={{
            background: `linear-gradient(135deg, ${current.swatch}, rgb(var(--brand-2-rgb)))`,
            boxShadow: `0 0 0 2px rgba(255,255,255,0.08), 0 0 12px ${current.swatch}66`,
          }}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 p-2 rounded-xl z-50 animate-scale-in"
          style={{
            background: 'rgba(13,15,34,0.97)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(var(--brand-rgb),0.18)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.55)',
            minWidth: 180,
          }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] px-2 py-1.5" style={{ color: 'var(--text-muted)' }}>
            Color del tema
          </p>
          <div className="grid grid-cols-1 gap-0.5">
            {THEMES.map(t => {
              const active = t.id === theme
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => pick(t.id)}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-[12px] font-medium transition-colors text-left"
                  style={{
                    background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                    color: active ? '#e2e2f0' : 'var(--text-secondary)',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = active ? 'rgba(255,255,255,0.06)' : 'transparent' }}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                    style={{ background: t.swatch, boxShadow: `0 0 0 1px rgba(255,255,255,0.12)` }}
                  />
                  <span className="flex-1">{t.label}</span>
                  {active && (
                    <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} style={{ color: t.swatch }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
