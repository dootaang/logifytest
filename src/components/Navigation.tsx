'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ModernDarkModeToggle } from './ModernComponents'

const generators = [
  { id: 'bookmarklet', name: '북마클릿형', icon: '📚', path: '/bookmarklet', desc: '근-본 북마클릿' },
  { id: 'banner', name: '배너형', icon: '🏞️', path: '/banner', desc: '크고 아름다워' },
  { id: 'jelly', name: '제리형', icon: '🐭', path: '/jelly', desc: '센스있는 이쁜 것' },
  { id: 'chatchan', name: '챗챈형', icon: '💬', path: '/chatchan', desc: '챗챈1.3 긴-빠이' },
  { id: 'card', name: '카드형', icon: '🃊', path: '/card', desc: '배경과 프사' },
  { id: 'viewext', name: '뷰익형', icon: '🔖', path: '/viewext', desc: '뷰어 익스텐션' }
]

interface NavigationProps {
  currentGenerator?: string
}

export default function Navigation({ currentGenerator }: NavigationProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [navigationError, setNavigationError] = useState<string | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  // currentGenerator prop이 있으면 우선 사용, 없으면 pathname으로 찾기
  const currentGen = currentGenerator 
    ? generators.find(gen => gen.id === currentGenerator) || generators.find(gen => gen.path === pathname) || generators[0]
    : generators.find(gen => gen.path === pathname) || generators[0]

  // 안전한 네비게이션 핸들러
  const handleNavigation = useCallback(async (path: string) => {
    try {
      setIsNavigating(true)
      setNavigationError(null)
      setIsDropdownOpen(false)
      
      if (pathname === path) {
        setIsNavigating(false)
        return
      }

      // RSC prefetching 최적화 - 에러 무시하고 진행
      try {
        await router.prefetch(path)
      } catch (prefetchError) {
        // prefetch 에러는 무시하고 계속 진행
        console.debug('Prefetch skipped:', prefetchError)
      }
      
      // 네비게이션 실행
      router.push(path)
      
    } catch (error) {
      console.error('Navigation error:', error)
      setNavigationError('페이지 로딩 중 오류가 발생했습니다. 페이지를 새로고침해주세요.')
      
      // 폴백으로 직접 이동
      if (typeof window !== 'undefined') {
        window.location.href = path
      }
    } finally {
      // 네비게이션 상태 리셋
      setTimeout(() => {
        setIsNavigating(false)
      }, 500)
    }
  }, [pathname, router])

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.modern-nav-selector')) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isDropdownOpen])

  // 페이지 변경 감지하여 네비게이션 상태 리셋
  useEffect(() => {
    setIsNavigating(false)
    setNavigationError(null)
  }, [pathname])

  // 에러 메시지 자동 제거
  useEffect(() => {
    if (navigationError) {
      const timer = setTimeout(() => {
        setNavigationError(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [navigationError])

  return (
    <nav className="modern-navigation">
      <div className="modern-nav-container">
        {/* 왼쪽 영역 */}
        <div className="modern-nav-left">
          {/* 메인 로고 버튼 */}
          <Link href="/" className="modern-nav-home" prefetch={false}>
            <span className="modern-nav-home-icon">🛠️</span>
            <span className="modern-nav-home-text">메인화면</span>
          </Link>
          
          {/* 생성기 선택 콤보박스 */}
          <div className="modern-nav-selector">
            <button 
              className={`modern-nav-combo ${isNavigating ? 'loading' : ''}`}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={isNavigating}
            >
              <span className="modern-nav-combo-icon">{currentGen.icon}</span>
              <span className="modern-nav-combo-text">{currentGen.name}</span>
              <span className={`modern-nav-combo-arrow ${isDropdownOpen ? 'open' : ''}`}>
                {isNavigating ? '⏳' : '▼'}
              </span>
            </button>
            
            {isDropdownOpen && !isNavigating && (
              <div className="modern-nav-dropdown">
                {generators.map(gen => (
                  <button
                    key={gen.id}
                    className={`modern-nav-item ${pathname === gen.path ? 'active' : ''}`}
                    onClick={() => handleNavigation(gen.path)}
                  >
                    <span className="modern-nav-item-icon">{gen.icon}</span>
                    <div className="modern-nav-item-content">
                      <span className="modern-nav-item-name">{gen.name}</span>
                      <span className="modern-nav-item-desc">{gen.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* 오른쪽 영역 */}
        <div className="modern-nav-right">
          <ModernDarkModeToggle />
        </div>
      </div>

      {/* 에러 메시지 */}
      {navigationError && (
        <div className="modern-nav-error">
          <span className="modern-nav-error-icon">⚠️</span>
          <span className="modern-nav-error-text">{navigationError}</span>
          <button 
            className="modern-nav-error-close"
            onClick={() => setNavigationError(null)}
          >
            ✕
          </button>
        </div>
      )}
      
      <style jsx>{`
        /* 전역 CSS 변수 - 항상 다크 테마 */
        .modern-navigation {
          --primary: #b0b2c6;
          --secondary: #5856D6;
          --success: #34C759;
          --background: #1C1C1E;
          --surface: #2C2C2E;
          --text: #FFFFFF;
          --text-secondary: #8E8E93;
          --border: #38383A;
          --font-family: 'Segoe UI', Roboto, Arial, sans-serif;
          --radius-normal: 8px;
          --radius-large: 16px;
          --spacing-small: 8px;
          --spacing-normal: 16px;
          --spacing-large: 24px;
          --font-size-normal: 14px;
          --font-weight-normal: 500;
          --font-weight-bold: 600;
        }

        /* 라이트모드에서도 네비게이션은 다크 유지 */
        [data-theme="light"] .modern-navigation {
          --background: #1C1C1E;
          --surface: #2C2C2E;
          --text: #FFFFFF;
          --text-secondary: #8E8E93;
          --border: #38383A;
        }

        /* 메인 네비게이션 */
        .modern-navigation {
          background-color: var(--background);
          border-bottom: 1px solid var(--border);
          padding: var(--spacing-normal) 0;
          position: sticky;
          top: 0;
          z-index: 100;
          font-family: var(--font-family);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        }
        
        .modern-nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 var(--spacing-large);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .modern-nav-left {
          display: flex;
          align-items: center;
          gap: var(--spacing-large);
        }
        
        /* 메인 홈 버튼 */
        .modern-nav-home {
          display: flex;
          align-items: center;
          gap: var(--spacing-small);
          text-decoration: none;
          background-color: var(--surface);
          color: var(--text);
          padding: var(--spacing-small) var(--spacing-normal);
          border-radius: var(--radius-normal);
          font-size: var(--font-size-normal);
          font-weight: var(--font-weight-bold);
          transition: all 0.2s ease;
          border: none;
        }

        .modern-nav-home:hover {
          background-color: var(--primary);
          color: white;
          transform: translateY(-1px);
        }
        
        .modern-nav-home-icon {
          font-size: 18px;
        }
        
        /* 콤보박스 스타일 */
        .modern-nav-selector {
          position: relative;
        }
        
        .modern-nav-combo {
          display: flex;
          align-items: center;
          gap: var(--spacing-small);
          background-color: var(--surface);
          color: var(--text);
          border: none;
          border-radius: var(--radius-normal);
          padding: var(--spacing-small) var(--spacing-normal);
          font-size: var(--font-size-normal);
          font-weight: var(--font-weight-normal);
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 160px;
          font-family: var(--font-family);
        }

        .modern-nav-combo:hover:not(:disabled) {
          background-color: #3A3A3C;
        }

        .modern-nav-combo:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .modern-nav-combo.loading {
          background-color: var(--primary);
          color: white;
        }
        
        .modern-nav-combo-icon {
          font-size: 16px;
        }

        .modern-nav-combo-text {
          flex: 1;
          text-align: left;
        }
        
        .modern-nav-combo-arrow {
          font-size: 12px;
          transition: transform 0.2s ease;
          opacity: 0.7;
        }
        
        .modern-nav-combo-arrow.open {
          transform: rotate(180deg);
        }
        
        /* 드롭다운 메뉴 */
        .modern-nav-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          background-color: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-normal);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
          overflow: hidden;
          z-index: 1000;
          min-width: 240px;
          animation: dropdownFadeIn 0.2s ease;
        }

        @keyframes dropdownFadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .modern-nav-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-normal);
          padding: var(--spacing-normal);
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          color: var(--text);
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: var(--font-family);
        }

        .modern-nav-item:hover {
          background-color: #48484A;
        }

        .modern-nav-item.active {
          background-color: var(--primary);
          color: white;
          font-weight: var(--font-weight-bold);
        }

        .modern-nav-item.active:hover {
          background-color: #9597a8;
        }
        
        .modern-nav-item-icon {
          font-size: 16px;
          flex-shrink: 0;
        }
        
        .modern-nav-item-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
        }
        
        .modern-nav-item-name {
          font-weight: var(--font-weight-bold);
          font-size: var(--font-size-normal);
          line-height: 1.2;
        }
        
        .modern-nav-item-desc {
          font-size: 12px;
          opacity: 0.7;
          line-height: 1.3;
          font-weight: var(--font-weight-normal);
        }

        .modern-nav-item.active .modern-nav-item-desc {
          opacity: 0.9;
        }
        
        /* 오른쪽 영역 */
        .modern-nav-right {
          display: flex;
          align-items: center;
        }

        /* 에러 메시지 */
        .modern-nav-error {
          background-color: #2C1B1B;
          border-bottom: 1px solid #4A2C2C;
          color: #FF6B6B;
          padding: var(--spacing-normal) var(--spacing-large);
          display: flex;
          align-items: center;
          gap: var(--spacing-normal);
          font-size: var(--font-size-normal);
          font-weight: var(--font-weight-normal);
        }

        .modern-nav-error-icon {
          flex-shrink: 0;
          font-size: 16px;
        }

        .modern-nav-error-text {
          flex: 1;
        }

        .modern-nav-error-close {
          background-color: transparent;
          border: 1px solid currentColor;
          color: inherit;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: all 0.2s ease;
          font-size: 12px;
          font-weight: var(--font-weight-bold);
        }

        .modern-nav-error-close:hover {
          background-color: currentColor;
          color: white;
        }

        /* 반응형 디자인 */
        @media (max-width: 768px) {
          .modern-nav-container {
            padding: 0 var(--spacing-normal);
          }
          
          .modern-nav-left {
            gap: var(--spacing-normal);
          }

          .modern-nav-home {
            padding: 6px 12px;
            font-size: 13px;
          }

          .modern-nav-combo {
            min-width: 140px;
            padding: 6px 12px;
            font-size: 13px;
          }
          
          .modern-nav-dropdown {
            left: -20px;
            right: -20px;
            min-width: auto;
          }
        }

        @media (max-width: 480px) {
          .modern-nav-left {
            gap: 12px;
          }

          .modern-nav-combo {
            min-width: 120px;
            padding: 6px 10px;
          }

          .modern-nav-dropdown {
            left: -40px;
            right: -40px;
          }
        }
      `}</style>
    </nav>
  )
} 