/** @type {import('next').NextConfig} */
const nextConfig = {
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
