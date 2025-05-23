/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  experimental: {
    optimizePackageImports: ['react-icons', 'lodash-es'],
    isrMemoryCacheSize: 50, // Уменьшите, если приложение большое
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    reactRemoveProperties: true,
  },
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      maxSize: 244 * 1024, // 244 KB
    };
    return config;
  },
};

module.exports = nextConfig;
