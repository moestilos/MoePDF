'use client'
import Link from 'next/link'

function FalconMini() {
  return (
    <svg width="26" height="26" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ffg-bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4338ca"/>
          <stop offset="1" stopColor="#7c3aed"/>
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="15" fill="url(#ffg-bg)"/>
      <text
        x="50%" y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fontFamily="'Inter','SF Pro Display',system-ui,sans-serif"
        fontSize="28" fontWeight="900"
        fill="white"
        letterSpacing="-1"
      >Mo.</text>
    </svg>
  )
}

function IconGitHub({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

const YEAR = new Date().getFullYear()

export function Footer() {
  return (
    <footer
      className="relative z-10 mt-20"
      style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.015)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {/* Glow line */}
      <div
        className="h-px w-full"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.35), rgba(124,58,237,0.2), transparent)' }}
      />

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-9">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-7">

          {/* ── Brand ── */}
          <div className="flex flex-col items-center sm:items-start gap-2.5">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="transition-transform duration-200 group-hover:scale-105">
                <FalconMini />
              </div>
              <span className="font-black text-[14px] tracking-[-0.03em] text-white">
                Moe<span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">PDF</span>
              </span>
            </Link>
            <p className="text-[12px] text-center sm:text-left leading-relaxed max-w-[200px]" style={{ color: 'var(--text-muted)' }}>
              Genera presupuestos PDF profesionales en segundos.
            </p>
          </div>

          {/* ── Social + Meta ── */}
          <div className="flex flex-col items-center sm:items-end gap-3.5">

            {/* Social */}
            <div className="flex items-center gap-1.5">
              <SocialLink href="https://github.com/moestilos" label="GitHub">
                <IconGitHub className="w-4 h-4" />
                <span>moestilos</span>
              </SocialLink>
            </div>

            {/* Stack badges */}
            <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-end">
              {['Next.js', 'Stripe', 'Neon', 'Clerk'].map(tech => (
                <span
                  key={tech}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-md"
                  style={{
                    color: 'var(--text-muted)',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* Copyright */}
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              © {YEAR} MoePDF · Todos los derechos reservados
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="footer-social-link"
    >
      {children}
    </a>
  )
}
