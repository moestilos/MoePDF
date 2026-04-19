'use client'
/**
 * PÁGINA DE ÉXITO POST-PAGO
 * ==========================
 * Stripe redirige aquí tras un pago exitoso.
 * Verifica el estado del pago y ofrece la descarga del PDF.
 *
 * URL: /success?session_id=cs_xxx&generation_id=yyy
 */
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

type PageStatus = 'loading' | 'ready' | 'error'

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const generationId = searchParams.get('generation_id')
  const sessionId = searchParams.get('session_id')

  const [status, setStatus] = useState<PageStatus>('loading')
  const [downloadToken, setDownloadToken] = useState<string | null>(null)
  const [profileType, setProfileType] = useState<string>('')
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState('')

  useEffect(() => {
    if (!generationId || !sessionId) {
      setStatus('error')
      return
    }

    // Pequeña espera para asegurar que el webhook de Stripe procesó el pago
    const timer = setTimeout(() => checkPaymentStatus(), 2000)
    return () => clearTimeout(timer)
  }, [generationId, sessionId])

  async function checkPaymentStatus() {
    try {
      // Obtener el token de descarga via el endpoint de checkout
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generation_id: generationId }),
      })

      if (!res.ok) throw new Error('Error verificando el pago')

      const data = await res.json()

      if (data.already_paid && data.download_token) {
        setDownloadToken(data.download_token)
        setStatus('ready')
      } else {
        // Webhook aún no procesado — reintentar en 3 segundos
        setTimeout(checkPaymentStatus, 3000)
      }
    } catch {
      setStatus('error')
    }
  }

  async function handleDownload() {
    if (!downloadToken || !generationId) return

    setIsDownloading(true)
    setDownloadError('')

    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generation_id: generationId,
          download_token: downloadToken,
        }),
      })

      if (!res.ok) throw new Error('Error descargando el PDF')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `presupuesto-profesional.pdf`
      document.body.appendChild(a)
      a.click()
      URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: unknown) {
      setDownloadError(err instanceof Error ? err.message : 'Error descargando')
    } finally {
      setIsDownloading(false)
    }
  }

  // Loading
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-100 rounded-full mb-4">
            <svg className="animate-spin w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">Verificando tu pago...</h2>
          <p className="text-sm text-gray-500">Esto tardará solo un momento</p>
        </div>
      </div>
    )
  }

  // Error
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Algo salió mal</h2>
          <p className="text-sm text-gray-500 mb-6">
            No pudimos verificar tu pago. Si el cargo se realizó, contacta con soporte
            con el ID de sesión: <code className="bg-gray-100 px-1 rounded">{sessionId?.slice(0, 20)}...</code>
          </p>
          <Link href="/" className="text-brand-600 hover:text-brand-800 text-sm underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  // Listo para descargar
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
          {/* Checkmark animado */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Pago completado!</h1>
          <p className="text-gray-500 mb-8">
            Tu presupuesto PDF profesional está listo. Descárgalo ahora.
          </p>

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-60"
          >
            {isDownloading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Descargando...
              </span>
            ) : (
              '⬇️ Descargar mi PDF'
            )}
          </button>

          {downloadError && (
            <p className="mt-3 text-sm text-red-600">{downloadError}</p>
          )}

          <div className="mt-6 pt-6 border-t border-gray-100 flex justify-center gap-6 text-sm">
            <Link href="/" className="text-brand-600 hover:text-brand-800">
              ← Crear otro presupuesto
            </Link>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          Guarda este enlace — puedes volver a descargar el PDF mientras tengas esta URL.
        </p>
      </div>
    </div>
  )
}
