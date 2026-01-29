/** @type {import('next').NextConfig} */

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''; // fallback ke string kosong

const nextConfig = {
  async rewrites() {
    // jika API_URL tidak ada, jangan buat rewrite
    if (!API_URL) return [];
    return [
      {
        source: '/public/:path*',
        destination: `${API_URL}/public/:path*`,
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
