/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['qloytvrhkjviqyzuimio.supabase.co'],
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  compiler: {
    styledComponents: true,
  },
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/badges/claim/:badgeId',
        destination: '/badges/claim/:badgeId',
      },
    ];
  },
}

module.exports = nextConfig 