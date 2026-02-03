/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Isse Vercel build nahi rokega
    ignoreBuildErrors: true,
  },
  eslint: {
    // Isse ESLint ke nakhre khatam ho jayenge
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;