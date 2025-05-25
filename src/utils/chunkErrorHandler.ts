// ChunkLoadError 처리를 위한 유틸리티

export class ChunkErrorHandler {
  private static retryCount = 0
  private static maxRetries = 3
  private static retryDelay = 1000

  /**
   * ChunkLoadError 감지 및 처리
   */
  static handleChunkError(error: Error): boolean {
    const isChunkError = error.name === 'ChunkLoadError' || 
                        error.message.includes('Loading chunk') ||
                        error.message.includes('Loading CSS chunk')

    if (isChunkError) {
      console.warn('ChunkLoadError detected:', error.message)
      this.attemptRecovery()
      return true
    }

    return false
  }

  /**
   * 청크 로딩 오류 복구 시도
   */
  private static attemptRecovery(): void {
    if (this.retryCount >= this.maxRetries) {
      console.log('Max retries reached, forcing page reload')
      this.forceReload()
      return
    }

    this.retryCount++
    console.log(`Attempting recovery (${this.retryCount}/${this.maxRetries})`)

    setTimeout(() => {
      if (typeof window !== 'undefined') {
        // 캐시된 모듈 정리
        this.clearModuleCache()
        
        // 페이지 새로고침
        window.location.reload()
      }
    }, this.retryDelay * this.retryCount)
  }

  /**
   * 강제 페이지 새로고침
   */
  private static forceReload(): void {
    if (typeof window !== 'undefined') {
      // 캐시 무시하고 새로고침
      window.location.href = window.location.href
    }
  }

  /**
   * 모듈 캐시 정리
   */
  private static clearModuleCache(): void {
    if (typeof window !== 'undefined' && 'caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('webpack') || name.includes('chunk')) {
            caches.delete(name)
          }
        })
      }).catch(err => {
        console.warn('Failed to clear cache:', err)
      })
    }
  }

  /**
   * 전역 에러 핸들러 설정
   */
  static setupGlobalErrorHandler(): void {
    if (typeof window === 'undefined') return

    // 전역 에러 이벤트 리스너
    window.addEventListener('error', (event) => {
      if (event.error) {
        this.handleChunkError(event.error)
      }
    })

    // Promise rejection 핸들러
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason instanceof Error) {
        this.handleChunkError(event.reason)
      }
    })

    // 리소스 로딩 실패 핸들러
    window.addEventListener('error', (event) => {
      const target = event.target as HTMLElement
      if (target && (target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
        console.warn('Resource loading failed:', target)
        
        // 스크립트 로딩 실패 시 재시도
        if (target.tagName === 'SCRIPT') {
          const script = target as HTMLScriptElement
          if (script.src && script.src.includes('chunk')) {
            console.log('Chunk script loading failed, attempting reload')
            setTimeout(() => window.location.reload(), 1000)
          }
        }
      }
    }, true)
  }

  /**
   * 재시도 카운터 리셋
   */
  static resetRetryCount(): void {
    this.retryCount = 0
  }
}

/**
 * 안전한 동적 import 래퍼
 */
export async function safeImport<T>(
  importFn: () => Promise<T>,
  fallback?: () => T,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error | null = null

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await importFn()
    } catch (error) {
      lastError = error as Error
      
      if (ChunkErrorHandler.handleChunkError(lastError)) {
        // ChunkLoadError인 경우 잠시 대기 후 재시도
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
        continue
      }
      
      // 다른 종류의 에러는 즉시 throw
      throw error
    }
  }

  // 모든 재시도 실패 시
  if (fallback) {
    console.warn('All import retries failed, using fallback')
    return fallback()
  }

  throw lastError || new Error('Import failed after all retries')
}

/**
 * 페이지 프리로드 유틸리티
 */
export class PagePreloader {
  private static preloadedPages = new Set<string>()

  /**
   * 페이지 프리로드
   */
  static async preloadPage(path: string): Promise<void> {
    if (this.preloadedPages.has(path)) {
      return
    }

    try {
      // Next.js 라우터를 통한 프리로드
      if (typeof window !== 'undefined' && window.next?.router) {
        await window.next.router.prefetch(path)
      }

      this.preloadedPages.add(path)
      console.log(`Page preloaded: ${path}`)
    } catch (error) {
      console.warn(`Failed to preload page ${path}:`, error)
    }
  }

  /**
   * 여러 페이지 일괄 프리로드
   */
  static async preloadPages(paths: string[]): Promise<void> {
    const promises = paths.map(path => this.preloadPage(path))
    await Promise.allSettled(promises)
  }
}

// 타입 확장
declare global {
  interface Window {
    next?: {
      router?: {
        prefetch: (path: string) => Promise<void>
      }
    }
  }
} 