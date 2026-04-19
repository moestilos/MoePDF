import { SignUp } from '@clerk/nextjs'
import Link from 'next/link'

export default function SignUpPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-8 group">
        <div
          className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#4338ca,#7c3aed)' }}
        >
          <span
            style={{
              fontFamily: "'Inter','SF Pro Display',system-ui,sans-serif",
              fontSize: 14, fontWeight: 900, color: 'white', letterSpacing: '-0.5px',
            }}
          >Mo.</span>
        </div>
        <div className="leading-none">
          <span className="font-black text-[16px] tracking-tight text-white">
            Moe<span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">PDF</span>
          </span>
        </div>
      </Link>

      {/* Clerk component */}
      <SignUp
        appearance={{
          variables: {
            colorPrimary:          '#6366f1',
            colorBackground:       '#10122a',
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

      {/* Nota de privacidad */}
      <p className="mt-6 text-[11px] text-center max-w-xs" style={{ color: 'var(--text-muted)' }}>
        Al registrarte aceptas los términos de uso. Tus datos están protegidos y nunca se comparten.
      </p>
    </div>
  )
}
