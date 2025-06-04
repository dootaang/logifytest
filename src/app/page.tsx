'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { ModernDarkModeToggle } from '@/components/ModernComponents'
import { DarkModeUtils, STYLES } from '@/utils/styles'
import { ChunkErrorHandler, PagePreloader } from '@/utils/chunkErrorHandler'

const generators = [
  {
    id: 'bookmarklet',
    name: '북마클릿형',
    icon: '📚',
    path: '/bookmarklet',
    description: '근-본',
    color: STYLES.primary
  },
  {
    id: 'banner',
    name: '배너형',
    icon: '🏞️',
    path: '/banner',
    description: '크고 아름다워',
    color: STYLES.secondary
  },
  {
    id: 'jelly',
    name: '제리형',
    icon: '🐭',
    path: '/jelly',
    description: '센스있는 이쁜 것',
    color: STYLES.success
  },
  {
    id: 'chatchan',
    name: '챗챈형',
    icon: '💬',
    path: '/chatchan',
    description: '챗챈1.3 스타일',
    color: STYLES.primary
  },
  {
    id: 'card',
    name: '카드형',
    icon: '🃊',
    path: '/card',
    description: '배경과 프사',
    color: STYLES.secondary
  },
  {
    id: 'viewext',
    name: '뷰익형',
    icon: '🔖',
    path: '/viewext',
    description: '뷰어 익스텐션 스타일',
    color: STYLES.success
  }
]

export default function HomePage() {
  // 다크모드 감지 및 적용
  useEffect(() => {
    const getSystemTheme = () => {
      return DarkModeUtils.getSystemDarkMode() ? 'dark' : 'light'
    }

    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', getSystemTheme())
    }

    // 시스템 테마 변경 감지
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleThemeChange = (e: MediaQueryListEvent) => {
        const newTheme = e.matches ? 'dark' : 'light'
        document.documentElement.setAttribute('data-theme', newTheme)
      }

      mediaQuery.addEventListener('change', handleThemeChange)
      return () => {
        mediaQuery.removeEventListener('change', handleThemeChange)
      }
    }
  }, [])

  // 전역 에러 핸들러 및 페이지 프리로딩 설정
  useEffect(() => {
    // ChunkLoadError 전역 핸들러 설정
    ChunkErrorHandler.setupGlobalErrorHandler()

    // 모든 생성기 페이지 프리로드
    const generatorPaths = generators.map(gen => gen.path)
    PagePreloader.preloadPages(generatorPaths)

    // 페이지 로드 완료 시 재시도 카운터 리셋
    ChunkErrorHandler.resetRetryCount()
  }, [])

  return (
    <div className="homepage">
      {/* 헤더 */}
      <header className="homepage-header">
        <div className="header-container">
          <div className="header-content">
            <div className="header-text">
              <h1 className="header-title">
                <span className="header-icon">🛠️</span>
                로그제조기 올인원 beta 1.0
              </h1>
              <p className="header-subtitle">
                정식 버전 출시는 기말 끝나고 오랜 기간 뒤...
              </p>
            </div>
            <div className="header-actions">
              <ModernDarkModeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="homepage-main">
        <div className="main-container">
          <div className="intro-section">
            <h2 className="intro-title">로그를 마음껏 꾸며라 챗붕!</h2>
            <p className="intro-description">
              주의. 이미지 들어가는 경우 모바일 환경에서 복붙 안됨.
            </p>
          </div>

          <div className="generator-selector">
            <div className="generator-grid">
              {generators.map((generator) => (
                <Link
                  key={generator.id}
                  href={generator.path}
                  className="generator-option"
                  prefetch={false}
                >
                  <div className="generator-icon">{generator.icon}</div>
                  <div className="generator-name">{generator.name}</div>
                  <div className="generator-desc">{generator.description}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        /* CSS 변수 정의 - 사용자 요청 스타일 적용 */
        :root {
          /* 라이트 테마 색상 */
          --primary: ${STYLES.primary};
          --secondary: ${STYLES.secondary};
          --success: ${STYLES.success};
          --background: ${STYLES.background};
          --surface: ${STYLES.surface};
          --text: ${STYLES.text};
          --text-secondary: ${STYLES.text_secondary};
          --border: ${STYLES.border};
          
          /* 사용자 요청 색상 */
          --outer-box-color: ${STYLES.outer_box_color};
          --inner-box-color: ${STYLES.inner_box_color};
          --shadow-intensity: ${STYLES.shadow_intensity};
          --bot-name-color: ${STYLES.bot_name_color};
          --divider-outer-color: ${STYLES.divider_outer_color};
          --divider-inner-color: ${STYLES.divider_inner_color};
          --dialog-color: ${STYLES.dialog_color};
          --narration-color: ${STYLES.narration_color};
          --profile-border-color: ${STYLES.profile_border_color};
          --text-indent: ${STYLES.text_indent}px;
          
          /* 폰트 설정 */
          --font-family: ${STYLES.font_family};
          --font-size-large: ${STYLES.font_size_large}px;
          --font-size-normal: ${STYLES.font_size_normal}px;
          --font-size-small: ${STYLES.font_size_small}px;
          --font-weight-normal: ${STYLES.font_weight_normal};
          --font-weight-bold: ${STYLES.font_weight_bold};
          
          /* 간격 설정 */
          --spacing-large: ${STYLES.spacing_large}px;
          --spacing-normal: ${STYLES.spacing_normal}px;
          --spacing-small: ${STYLES.spacing_small}px;
          
          /* 둥근 모서리 설정 */
          --radius-large: ${STYLES.radius_large}px;
          --radius-normal: ${STYLES.radius_normal}px;
          --radius-small: ${STYLES.radius_small}px;
          
          /* 그림자 설정 */
          --shadow: ${STYLES.shadow};
          --shadow-lg: ${STYLES.shadow_lg};
        }

        /* 다크모드 색상 팔레트 */
        @media (prefers-color-scheme: dark) {
          :root {
            --background: #1C1C1E;
            --surface: #2C2C2E;
            --text: #FFFFFF;
            --text-secondary: #8E8E93;
            --border: #38383A;
            --outer-box-color: #2C2C2E;
            --inner-box-color: #1C1C1E;
            --shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            --shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.4);
          }
        }

        /* 수동 다크모드 클래스 */
        [data-theme="dark"] {
          --background: #1C1C1E;
          --surface: #2C2C2E;
          --text: #FFFFFF;
          --text-secondary: #8E8E93;
          --border: #38383A;
          --outer-box-color: #2C2C2E;
          --inner-box-color: #1C1C1E;
          --shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          --shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.4);
        }

        /* 수동 라이트모드 클래스 */
        [data-theme="light"] {
          --background: ${STYLES.background};
          --surface: ${STYLES.surface};
          --text: ${STYLES.text};
          --text-secondary: ${STYLES.text_secondary};
          --border: ${STYLES.border};
          --outer-box-color: ${STYLES.outer_box_color};
          --inner-box-color: ${STYLES.inner_box_color};
          --shadow: ${STYLES.shadow};
          --shadow-lg: ${STYLES.shadow_lg};
        }

        /* 전역 스타일 */
        .homepage {
          min-height: 100vh;
          background: var(--background);
          color: var(--text);
          font-family: var(--font-family);
          font-weight: var(--font-weight-normal);
          position: relative;
        }

        /* 헤더 스타일 */
        .homepage-header {
          background: linear-gradient(135deg, 
            var(--surface) 0%, 
            var(--outer-box-color) 100%
          );
          border-bottom: 1px solid var(--border);
          padding: var(--spacing-large) 0;
          box-shadow: var(--shadow);
        }

        .header-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 var(--spacing-normal);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--spacing-normal);
        }

        .header-text {
          flex: 1;
        }

        .header-title {
          font-size: 2.5rem;
          font-weight: var(--font-weight-bold);
          margin: 0 0 var(--spacing-small) 0;
          display: flex;
          align-items: center;
          gap: var(--spacing-normal);
          color: var(--text);
        }

        .header-icon {
          font-size: 3rem;
          filter: drop-shadow(var(--shadow));
        }

        .header-subtitle {
          font-size: var(--font-size-large);
          color: var(--text-secondary);
          margin: 0;
          font-weight: var(--font-weight-normal);
        }

        .header-actions {
          flex-shrink: 0;
          background: var(--surface);
          border-radius: var(--radius-normal);
          padding: var(--spacing-small);
          border: 1px solid var(--border);
          box-shadow: var(--shadow);
        }

        /* 메인 콘텐츠 스타일 */
        .homepage-main {
          padding: var(--spacing-large) 0;
        }

        .main-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 var(--spacing-normal);
        }

        .intro-section {
          text-align: center;
          margin-bottom: var(--spacing-large);
          padding: var(--spacing-large) 0;
        }

        .intro-title {
          font-size: 2.2rem;
          font-weight: var(--font-weight-bold);
          margin: 0 0 var(--spacing-normal) 0;
          color: var(--text);
        }

        .intro-description {
          font-size: var(--font-size-large);
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
          font-weight: var(--font-weight-normal);
        }

        /* 생성기 선택기 스타일 */
        .generator-selector {
          display: flex;
          justify-content: center;
          margin-bottom: var(--spacing-large);
        }

        .generator-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: var(--spacing-small);
          max-width: 1000px;
          width: 100%;
        }

        .generator-option {
          background: var(--surface);
          border: 2px solid var(--border);
          border-radius: var(--radius-normal);
          padding: var(--spacing-normal);
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
          min-height: 110px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-small);
          position: relative;
          overflow: hidden;
          text-decoration: none;
          color: inherit;
        }

        .generator-option:hover {
          border-color: var(--primary);
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
          text-decoration: none;
          color: inherit;
        }

        .generator-option:link,
        .generator-option:visited,
        .generator-option:hover,
        .generator-option:active {
          text-decoration: none !important;
          color: inherit !important;
        }

        .generator-option * {
          text-decoration: none !important;
        }

        .generator-icon {
          font-size: 1.8rem;
          margin-bottom: 4px;
          filter: grayscale(0.3);
          transition: all 0.2s ease;
        }

        .generator-option:hover .generator-icon {
          filter: grayscale(0);
          transform: scale(1.1);
        }

        .generator-name {
          font-size: var(--font-size-normal);
          font-weight: var(--font-weight-bold);
          color: var(--text);
          margin-bottom: 2px;
        }

        .generator-desc {
          font-size: var(--font-size-small);
          color: var(--text-secondary);
          line-height: 1.2;
          opacity: 0.8;
        }

        .generator-option:hover .generator-desc {
          opacity: 1;
        }

        /* 반응형 디자인 */
        @media (max-width: 1200px) {
          .generator-grid {
            grid-template-columns: repeat(3, 1fr);
            max-width: 600px;
          }
        }

        @media (max-width: 768px) {
          .header-title {
            font-size: 2rem;
          }

          .header-icon {
            font-size: 2.5rem;
          }

          .header-content {
            flex-direction: column;
            text-align: center;
          }

          .intro-title {
            font-size: 1.8rem;
          }

          .generator-grid {
            grid-template-columns: repeat(2, 1fr);
            max-width: 400px;
          }

          .generator-option {
            padding: var(--spacing-small);
            min-height: 90px;
          }

          .generator-icon {
            font-size: 1.5rem;
          }

          .generator-name {
            font-size: var(--font-size-small);
          }

          .generator-desc {
            font-size: 10px;
          }
        }

        @media (max-width: 480px) {
          .homepage-header {
            padding: var(--spacing-normal) 0;
          }

          .homepage-main {
            padding: var(--spacing-normal) 0;
          }

          .header-title {
            font-size: 1.6rem;
          }

          .intro-title {
            font-size: 1.5rem;
          }

          .generator-grid {
            grid-template-columns: 1fr;
            max-width: 200px;
          }
        }
      `}</style>
    </div>
  )
} 