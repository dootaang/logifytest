'use client'

import React, { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import ChatchanFormLayout from '@/components/ChatchanFormLayout'
import { useChatchanGeneratorV2 } from '@/generators/ChatchanGeneratorV2'
import { DarkModeUtils } from '@/utils/styles'

interface WordReplacement {
  from: string;
  to: string;
}

// 챗챈형 기본 설정
const defaultChatchanConfig = {
  characterName: '',
  modelName: '',
  promptName: '',
  assistModelName: '',
  userName: 'USER',
  chatNumber: '',
  characterImageUrl: '',
  useCharacterImage: true,
  backgroundColor: '#ffffff',
  textColor: '#1d2129',
  highlightColor: '#3498db',
  promptColor: '#6c757d',
  emphasisColor: '#1f618d',
  baseFontSize: 15,
  titleFontSize: 38,
  containerWidth: 650,
  logSectionRadius: 12,
  lineHeight: 1.6,
  letterSpacing: -0.05,
  italicizeNarration: true,
  simpleOutputMode: false,
  disableChatLogCollapse: false,
  isAutoInputMode: false,
  dialogueUseBubble: true,
  narrationUseLine: true,
  showBriefHeaderInfo: false,
  content: `- 화창한 봄날, 공원에서 우연히 만난 두 사람은 *짧게* 대화를 나누기 시작했다.
USER: 안녕하세요? 오늘 ^날씨^가 어때요?
- AI는 잠시 생각에 잠기더니 환하게 웃으며 대답했다.
AI: 안녕하세요! 오늘 날씨는 맑고 화창합니다. 최고 기온은 $23도$로 예상됩니다. ***야외 활동하기 좋은 날씨네요!***`,
  selectedTheme: 'light',
  wordReplacements: [
    { from: '', to: '' },
    { from: '', to: '' },
    { from: '', to: '' }
  ] as WordReplacement[]
}

export default function ChatchanPage() {
  const [config, setConfig] = useState(defaultChatchanConfig)
  const [generatedHTML, setGeneratedHTML] = useState('')

  // 챗챈 생성기 훅
  const { generateHTML: generateChatchanHTML } = useChatchanGeneratorV2(config)

  // localStorage에서 설정 불러오기
  const loadConfig = () => {
    try {
      if (typeof window !== 'undefined') {
        const savedConfig = localStorage.getItem('chatchanConfig')
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig)
          return {
            ...defaultChatchanConfig,
            ...parsedConfig,
            selectedTheme: DarkModeUtils.getSystemDarkMode() ? 'dark' : 'light'
          }
        }
      }
      return { ...defaultChatchanConfig, selectedTheme: DarkModeUtils.getSystemDarkMode() ? 'dark' : 'light' }
    } catch (error) {
      console.error('챗챈 설정을 불러오는 중 오류 발생:', error)
      return { ...defaultChatchanConfig, selectedTheme: DarkModeUtils.getSystemDarkMode() ? 'dark' : 'light' }
    }
  }

  // localStorage에 설정 저장하기
  const saveConfig = (newConfig: any) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('chatchanConfig', JSON.stringify(newConfig))
      }
    } catch (error) {
      console.error('챗챈 설정을 저장하는 중 오류 발생:', error)
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
    const html = generateChatchanHTML()
    setGeneratedHTML(html)
  }, [config, generateChatchanHTML])

  // 핸들러 함수들
  const handleConfigChange = (newConfig: Partial<typeof defaultChatchanConfig>) => {
    setConfig(prev => ({
      ...prev,
      ...newConfig
    }))
  }

  const handleGenerateHTML = () => {
    const html = generateChatchanHTML()
    setGeneratedHTML(html)
  }

  const handleCopyHTML = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(generatedHTML).then(() => {
        alert('챗챈형 HTML 코드가 클립보드에 복사되었습니다!')
      })
    }
  }

  const handleReset = () => {
    if (typeof window !== 'undefined' && confirm('챗챈형 설정을 기본값으로 초기화하시겠습니까?')) {
      const resetConfig = { 
        ...defaultChatchanConfig, 
        selectedTheme: DarkModeUtils.getSystemDarkMode() ? 'dark' : 'light' 
      }
      setConfig(resetConfig)
      setGeneratedHTML('')
    }
  }

  return (
    <div className="chatchan-page">
      <Navigation currentGenerator="chatchan" />
      
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">
            <span className="page-icon">💬</span>
            챗챈형 로그 생성기
          </h1>
          <p className="page-description">
            채팅 형태의 대화형 로그를 생성합니다.
          </p>
        </div>

        <ChatchanFormLayout
          config={config}
          onConfigChange={handleConfigChange}
          generatedHTML={generatedHTML}
          onGenerateHTML={handleGenerateHTML}
          onCopyHTML={handleCopyHTML}
          onReset={handleReset}
        />
      </div>

      <style jsx>{`
        .chatchan-page {
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