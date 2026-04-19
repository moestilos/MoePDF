import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { AnimatedGrid } from '@/components/AnimatedGrid'

export const metadata: Metadata = {
  title: 'MoePDF — Presupuestos PDF profesionales',
  description: 'Genera presupuestos PDF profesionales en segundos. Personalizado para diseñadores, freelancers, entrenadores y fotógrafos.',
  keywords: 'presupuesto pdf, autónomo, freelance, plantilla presupuesto profesional',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'MoePDF',
    description: 'Presupuestos PDF profesionales en segundos',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="es">
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){try{var t=localStorage.getItem('moe-theme')||'indigo';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
            }}
          />
        </head>
        <body>
          {/* Fondo animado: grid de cuadros + orbs flotantes */}
          <div className="animated-bg" aria-hidden="true">
            {/* Cuadros animados */}
            <AnimatedGrid />
            {/* Orbs de color difuso */}
            <div className="orb orb-1" />
            <div className="orb orb-2" />
            <div className="orb orb-3" />
            <div className="orb orb-4" />
          </div>

          {/* Contenido */}
          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}
