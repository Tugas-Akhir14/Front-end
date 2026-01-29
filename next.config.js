/** @type {import('next').NextConfig} */

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''; // fallback ke string kosong

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Hanya buat rewrites jika API_URL ada
  async rewrites() {
    if (!API_URL) return [];
    return [
      {
        source: '/public/:path*',          // route yang diakses di frontend
        destination: `${API_URL}/public/:path*`, // route di backend
      },
    ];
  },
  
  eslint: {
    ignoreDuringBuilds: true, // supaya build tidak gagal karena lint error
  },

  images: {
    unoptimized: true, // matikan optimisasi Next.js, karena image diambil dari API
  },
};

module.exports = nextConfig;
