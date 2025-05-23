/** @type {import('next').NextConfig} */
const nextConfig = {
  // Базовые настройки из next.config.ts
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  productionBrowserSourceMaps: false,

  // Оптимизации из вашего next.config.js
  experimental: {
    optimizePackageImports: ['react-icons', 'lodash-es', 'date-fns'],
    isrMemoryCacheSize: 50,
    optimizeFonts: true, // из next.config.ts
    optimizeCss: true, // из next.config.ts
    legacyBrowsers: false, // отключаем полифиллы
    disableOptimizedLoading: true,
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    reactRemoveProperties: true,
  },

  // Оптимизация изображений (новое)
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },

  // Улучшенная оптимизация чанков
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      maxSize: 244 * 1024, // Оптимально для HTTP/2
      minSize: 20 * 1024,
    };
    return config;
  },
};

module.exports = nextConfig;
