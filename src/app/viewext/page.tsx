'use client'

import React, { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import ViewextFormLayout from '@/components/ViewextFormLayout'
import ViewextGenerator from '@/components/ViewextGenerator'
import { DarkModeUtils } from '@/utils/styles'

// 뷰익형 기본 설정
const defaultViewextConfig = {
  content: `Character: 안녕하세요! 오늘 날씨가 정말 좋네요.

User: 네, 맞아요. 산책하기 딱 좋은 날씨인 것 같아요.

Character: 그러게요. 이런 날에는 밖에 나가서 **신선한 공기**를 마시는 게 최고죠.

User: 혹시 추천해주실 만한 산책로가 있나요?

Character: 네! 근처에 있는 공원이 정말 예뻐요. 특히 이 시간대에는 *햇살이 나무 사이로* 들어와서 정말 아름다워요.`,
  characterName: 'Character',
  userName: 'User',
  colorTheme: 'oldmoney-normal',
  layoutType: 'vertical' as 'vertical' | 'horizontal',
  showImages: false,
  fontFamily: 'Pretendard Variable',
  letterSpacing: 0,
  lineHeight: 150,
  enableScroll: false,
  enableFoldToggle: false,
  characterImageUrl: '',
  userImageUrl: ''
}

export default function ViewextPage() {
  const [config, setConfig] = useState(defaultViewextConfig)
  const [generatedHTML, setGeneratedHTML] = useState('')

  // localStorage에서 설정 불러오기
  const loadConfig = () => {
    try {
      if (typeof window !== 'undefined') {
        const savedConfig = localStorage.getItem('viewextConfig')
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig)
          return {
            ...defaultViewextConfig,
            ...parsedConfig
          }
        }
      }
      return defaultViewextConfig
    } catch (error) {
      console.error('뷰익형 설정을 불러오는 중 오류 발생:', error)
      return defaultViewextConfig
    }
  }

  // localStorage에 설정 저장하기
  const saveConfig = (newConfig: any) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('viewextConfig', JSON.stringify(newConfig))
      }
    } catch (error) {
      console.error('뷰익형 설정을 저장하는 중 오류 발생:', error)
    }
  }

  // 컴포넌트 마운트 후 설정 로드
  useEffect(() => {
    setConfig(loadConfig())
  }, [])

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

  // 설정이 변경될 때마다 localStorage에 저장
  useEffect(() => {
    saveConfig(config)
  }, [config])

  // 설정이 변경될 때마다 자동 HTML 생성
  useEffect(() => {
    try {
      const generator = ViewextGenerator({ config })
      const html = generator.generateHTML()
      setGeneratedHTML(html)
    } catch (error) {
      console.error('뷰익형 HTML 생성 오류:', error)
      setGeneratedHTML('<p>HTML 생성 중 오류가 발생했습니다.</p>')
    }
  }, [config])

  // 핸들러 함수들
  const handleConfigChange = (newConfig: Partial<typeof defaultViewextConfig>) => {
    setConfig(prev => ({
      ...prev,
      ...newConfig
    }))
  }

  const handleGenerateHTML = () => {
    try {
      const generator = ViewextGenerator({ config })
      const html = generator.generateHTML()
      setGeneratedHTML(html)
    } catch (error) {
      console.error('뷰익형 HTML 생성 오류:', error)
      setGeneratedHTML('<p>HTML 생성 중 오류가 발생했습니다.</p>')
    }
  }

  const handleCopyHTML = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(generatedHTML).then(() => {
        alert('뷰익형 HTML 코드가 클립보드에 복사되었습니다!')
      })
    }
  }

  const handleReset = () => {
    if (typeof window !== 'undefined' && confirm('뷰익형 설정을 기본값으로 초기화하시겠습니까?')) {
      setConfig({ ...defaultViewextConfig })
      setGeneratedHTML('')
    }
  }

  return (
    <div className="viewext-page">
      <Navigation currentGenerator="viewext" />
      
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">
            <span className="page-icon">💬</span>
            뷰익형 로그 생성기
          </h1>
          <p className="page-description">
            원본 뷰익.css 스타일을 기반으로 한 정확한 뷰익형 HTML 생성기입니다.
          </p>
        </div>

        <ViewextFormLayout
          config={config}
          onConfigChange={handleConfigChange}
          generatedHTML={generatedHTML}
          onGenerateHTML={handleGenerateHTML}
          onCopyHTML={handleCopyHTML}
          onReset={handleReset}
        />
      </div>

      <style jsx>{`
        .viewext-page {
          min-height: 100vh;
          background: var(--bg-primary);
          color: var(--text-primary);
        }

        .page-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .page-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .page-title {
          font-size: 2.5rem;
          font-weight: 600;
          margin: 0 0 16px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          color: var(--text-primary);
        }

        .page-icon {
          font-size: 3rem;
        }

        .page-description {
          font-size: 1.125rem;
          color: var(--text-secondary);
          margin: 0;
          max-width: 600px;
          margin: 0 auto;
        }

        @media (max-width: 768px) {
          .page-title {
            font-size: 2rem;
            flex-direction: column;
            gap: 8px;
          }

          .page-icon {
            font-size: 2.5rem;
          }
        }
      `}</style>
    </div>
  )
} 