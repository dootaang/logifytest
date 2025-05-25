/** @type {import('next').NextConfig} */
const nextConfig = {
  // 개발 환경에서는 정적 export 비활성화
  ...(process.env.NODE_ENV === 'production' && {
    output: 'export',
    trailingSlash: true,
    assetPrefix: './',
  }),
  images: {
    unoptimized: true
  },
  basePath: '',
  // 청크 로딩 오류 방지를 위한 설정
  experimental: {
    optimizePackageImports: ['react', 'react-dom']
  },
  // 정적 내보내기에서 더 안정적인 청크 처리
  webpack: (config, { isServer, dev }) => {
    if (!isServer && !dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 1,
            priority: -20,
            reuseExistingChunk: true
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all'
          }
        }
      }
    }
    return config
  }
}

module.exports = nextConfig 