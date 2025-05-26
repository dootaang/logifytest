'use client'

import { useEffect } from 'react'

export default function RSCErrorSuppressor() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // 색상 코드 정규화 함수
    const normalizeColorCode = (color: string): string => {
      if (color.startsWith('#') && color.length === 4) {
        // #333 -> #333333 변환
        const shortHex = color.slice(1)
        return '#' + shortHex.split('').map(char => char + char).join('')
      }
      return color
    }

    // 원본 console.error 저장
    const originalConsoleError = console.error

    // console.error 오버라이드
    console.error = (...args: any[]) => {
      const message = args.join(' ')
      
      // RSC 관련 404 에러 및 색상 형식 경고 필터링
      if (
        message.includes('Failed to load resource') ||
        message.includes('404') ||
        message.includes('.txt?_rsc=') ||
        message.includes('the server responded with a status of 404') ||
        message.includes('does not conform to the required format') ||
        message.includes('#rrggbb') ||
        message.includes('hexadecimal numbers')
      ) {
        // RSC 404 에러와 색상 형식 경고는 콘솔에 출력하지 않음
        return
      }
      
      // 다른 에러는 정상적으로 출력
      originalConsoleError.apply(console, args)
    }

    // 네트워크 에러 이벤트 리스너
    const handleError = (event: ErrorEvent) => {
      if (event.message && (
        event.message.includes('404') ||
        event.message.includes('.txt?_rsc=')
      )) {
        event.preventDefault()
        event.stopPropagation()
      }
    }

    // 리소스 로딩 에러 리스너
    const handleResourceError = (event: Event) => {
      const target = event.target as HTMLElement
      if (target && target.tagName === 'SCRIPT') {
        const script = target as HTMLScriptElement
        if (script.src && script.src.includes('.txt?_rsc=')) {
          event.preventDefault()
          event.stopPropagation()
        }
      }
    }

    window.addEventListener('error', handleError)
    window.addEventListener('error', handleResourceError, true)

    // 정리 함수
    return () => {
      console.error = originalConsoleError
      window.removeEventListener('error', handleError)
      window.removeEventListener('error', handleResourceError, true)
    }
  }, [])

  return null
} 