/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  images: {
    unoptimized: true
  },
  // 정적 파일 경로를 절대 경로로 설정
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  basePath: '',
  
  // RSC prefetching 최적화
  experimental: {
    optimizePackageImports: ['react', 'react-dom'],
    // RSC 관련 최적화
    typedRoutes: false,
  },
  
  // 서버 외부 패키지 설정
  serverExternalPackages: [],
  
  // 웹팩 설정으로 청크 문제 해결
  webpack: (config, { isServer, dev }) => {
    if (!isServer && !dev) {
      // 서버 기능을 위한 청크 처리 최적화
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
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
  },
  
  // 서버 기능을 위한 설정
  generateEtags: false,
  poweredByHeader: false,
  
  // 개발 환경에서의 설정
  ...(process.env.NODE_ENV === 'development' && {
    reactStrictMode: true,
  })
}

module.exports = nextConfig 