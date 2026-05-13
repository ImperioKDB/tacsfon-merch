/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Increase API body size limit globally (Phase 6 proof upload needs this)
  experimental: {
    serverComponentsExternalPackages: [],
  },

  // Cache headers for product routes
  async headers() {
    return [
      {
        source: '/api/products',
        headers: [{ key: 'Cache-Control', value: 's-maxage=60, stale-while-revalidate=30' }],
      },
      {
        source: '/api/products/:id',
        headers: [{ key: 'Cache-Control', value: 's-maxage=30, stale-while-revalidate=15' }],
      },
      {
        source: '/api/categories',
        headers: [{ key: 'Cache-Control', value: 's-maxage=300, stale-while-revalidate=60' }],
      },
    ]
  },
}

module.exports = nextConfig
