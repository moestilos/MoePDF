'use client'
import Link from 'next/link'
import { useUser, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { IconCrown } from './Icons'
import { ThemeSwitcher } from './ThemeSwitcher'

/** Logo MoePDF — monograma "Mo." en badge tematizado por CSS vars */
function FalconIcon({ size = 34 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 15,
        background: 'linear-gradient(135deg, rgb(var(--brand-rgb)) 0%, rgb(var(--brand-2-rgb)) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter','SF Pro Display',system-ui,sans-serif",
        fontSize: size * 0.44,
        fontWeight: 900,
        color: 'white',
        letterSpacing: '-1px',
        boxShadow: '0 4px 14px rgba(var(--brand-rgb),0.35)',
      }}
    >
      Mo.
    </div>
  )
}

export function Navbar() {
  const { isSignedIn, isLoaded } = useUser()
  const [isAdmin, setIsAdmin]   = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    if (!isSignedIn) return setIsAdmin(false)
    fetch('/api/admin/check')
      .then(r => r.json())
      .then(d => setIsAdmin(d.is_admin ?? false))
      .catch(() => {})
  }, [isSignedIn])

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? 'rgba(7,7,14,0.85)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
      }}
    >
      <nav className="max-w-6xl mx-auto px-5 sm:px-8 h-[60px] flex items-center justify-between gap-4">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="transition-transform duration-200 group-hover:scale-105">
            <FalconIcon size={36} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-black text-[15px] tracking-[-0.03em] text-white">
              Moe<span style={{ background: 'linear-gradient(to right, rgb(var(--brand-light-rgb)), rgb(var(--brand-2-rgb)))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>PDF</span>
            </span>
            <span className="text-[9.5px] font-medium tracking-wide hidden sm:block" style={{ color: 'var(--text-muted)' }}>
              by Moestilos
            </span>
          </div>
        </Link>

        {/* ── Nav links (desktop) ── */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
          <NavLink href="/">Cómo funciona</NavLink>
          <PriceBadge />
        </div>

        {/* ── Auth ── */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <ThemeSwitcher />
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              style={{
                background: 'rgba(var(--brand-2-rgb),0.15)',
                color: 'rgb(var(--brand-light-rgb))',
                border: '1px solid rgba(var(--brand-2-rgb),0.25)',
              }}
            >
              <IconCrown className="w-3.5 h-3.5" />
              Admin
            </Link>
          )}

          {isLoaded && (
            isSignedIn ? (
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  variables: {
                    colorPrimary:          '#6366f1',
                    colorBackground:       '#0d0f22',
                    colorInputBackground:  'rgba(255,255,255,0.05)',
                    colorInputText:        '#e2e2f0',
                    colorText:             '#e2e2f0',
                    colorTextSecondary:    '#8080a8',
                    colorDanger:           '#f87171',
                    colorNeutral:          '#8080a8',
                    borderRadius:          '10px',
                    fontFamily:            "'Inter', system-ui, sans-serif",
                  },
                }}
              />
            ) : (
              <>
                <SignInButton mode="redirect">
                  <button className="btn-ghost text-[13px] hidden sm:flex">Entrar</button>
                </SignInButton>
                <SignUpButton mode="redirect">
                  <button className="btn-primary text-[13px] px-4 py-2">
                    Empezar gratis
                  </button>
                </SignUpButton>
              </>
            )
          )}
        </div>
      </nav>
    </header>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="nav-link">
      {children}
    </a>
  )
}

function PriceBadge() {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold"
      style={{
        color: 'rgb(var(--brand-light-rgb))',
        background: 'rgba(var(--brand-rgb),0.12)',
        border: '1px solid rgba(var(--brand-rgb),0.22)',
      }}
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" />
      </svg>
      1 € por PDF
    </span>
  )
}
