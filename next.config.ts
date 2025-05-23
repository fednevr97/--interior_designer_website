/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizeFonts: true,
    optimizeCss: true,
  },
  compress: true,
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig