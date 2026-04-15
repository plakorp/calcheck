import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
    ],
  },
  async redirects() {
    return [
      { source: '/food/yogurt-plain', destination: '/food/plain-yogurt', permanent: true },
      { source: '/food/kimchi', destination: '/food/cabbage-kimchi-usda170392', permanent: true },
      { source: '/blog/guide', destination: '/blog', permanent: true },
    ];
  },
};

export default nextConfig;
