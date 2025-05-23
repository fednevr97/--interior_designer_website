/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  productionBrowserSourceMaps: false,

  experimental: {
    optimizePackageImports: ['react-icons', 'lodash-es', 'date-fns'],
    disableOptimizedLoading: true, // Отключает автоматический preload CSS
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    reactRemoveProperties: true,
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },

  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      maxSize: 244 * 1024,
      minSize: 20 * 1024,
    };
    return config;
  },
};

module.exports = nextConfig;
