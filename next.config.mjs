/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['qloytvrhkjviqyzuimio.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'qloytvrhkjviqyzuimio.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
