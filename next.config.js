/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Los errores de tipos no bloquean el deploy
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLint tampoco bloquea el deploy
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Necesario para @react-pdf/renderer en el servidor
    serverComponentsExternalPackages: ['@react-pdf/renderer'],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
