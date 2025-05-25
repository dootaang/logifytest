'use client'

import React, { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import BannerFormLayout from '@/components/BannerFormLayout'
import BannerGeneratorV2 from '@/generators/BannerGeneratorV2'
import { DarkModeUtils } from '@/utils/styles'

interface WordReplacement {
  from: string;
  to: string;
}

interface TagStyle {
  text: string
  color: string
  text_color: string
  transparent_background: boolean
  border_color: string
}

// 배너형 기본 설정
const defaultBannerConfig = {
  // 프로필 설정
  showProfile: true,
  showBotName: true,
  botName: '얼터네이트 헌터즈',
  botNameColor: '#ffffff',
  botNameSize: 20,
  showProfileImage: true,
  imageUrl: '//ac.namu.la/20250420sac/f92bfc5a0b19d1187f4707cb9461a8825e9be24987e484d1ed2ce5c369cd1e59.png?expires=1748181064&key=_2JVV7W5bB-720Zu92NKNw',
  showProfileBorder: false,
  profileBorderColor: '#ffffff',
  showProfileShadow: true,
  showDivider: true,
  dividerColor: '#b8bacf',
  
  // 태그 설정
  showTags: true,
  tags: [
    { text: '투명배경', color: '#ffffff', text_color: '#ffffff', transparent_background: true, border_color: '#ffffff' },
    { text: '텍스트-테두리', color: '#ffffff', text_color: '#ffffff', transparent_background: true, border_color: '#ffffff' },
    { text: '하얀색', color: '#ffffff', text_color: '#ffffff', transparent_background: true, border_color: '#ffffff' }
  ] as TagStyle[],
  
  // 디자인 설정 (다크모드 베이직으로 설정)
  selectedTemplate: '다크모드 베이직',
  outerBoxColor: '#2c2c2c',
  innerBoxColor: '#1a1a1a',
  showInnerBox: false,
  useBoxBorder: false,
  boxBorderColor: '#e2e8f0',
  boxBorderThickness: 1,
  shadowIntensity: 8,
  gradientStartColor: '#2c2c2c',
  gradientEndColor: '#1a1a1a',
  useGradientBackground: false,
  
  // 텍스트 설정
  useTextSize: true,
  textSize: 14,
  useTextIndent: true,
  textIndent: 20,
  dialogColor: '#ffffff',
  dialogBold: true,
  dialogNewline: true,
  narrationColor: '#e0e0e0',
  innerThoughtsColor: '#b0b0b0',
  innerThoughtsBold: false,
  removeAsterisk: true,
  convertEllipsis: true,
  
  // 단어 변경
  wordReplacements: [
    { from: '', to: '' },
    { from: '', to: '' },
    { from: '', to: '' }
  ] as WordReplacement[],
  
  // 기본 설정
  content: `서울 헌터 협회 중앙 로비는 낮고 끊임없는 활동 소음으로 웅성거렸다. 한쪽 벽에는 세련된 단말기들이 줄지어 있었고, 대부분의 행인들은 다른 곳에 집중하느라 무시하는, 변동하는 게이트 정보를 표시하고 있었다. 긴장과 기대가 뒤섞인 표정으로 알아볼 수 있는 신규 각성자들은 간단한 서류 양식을 꽉 쥐고, 때때로 보안 복도 아래로 보이는 위압적인 등급 평가실 쪽을 힐끗거렸다. 제복을 입은 협회 직원들은 숙련된 효율성으로 움직였고, 그들의 발걸음은 광택 나는 바닥에 부드럽게 울려 퍼졌다. 에어컨은 넓은 공간을 시원하게 유지했고, 이는 바깥의 습한 여름 공기와 대조를 이루었다.

당신은 등록 및 초기 측정라고 표시된 접수처 앞에 섰다. 그 뒤에는 최유진이 단정한 협회 유니폼을 입고 흠잡을 데 없는 자세로 앉아 있었다. 그녀의 검은 단발머리는 그녀가 지닌 권위에 비해 놀라울 정도로 젊으면서도 전문가적인 얼굴을 감싸고 있었다. 블레이저에 달린 코팅된 ID 배지는 그녀의 이름과 직책(등록 및 평가 팀장)을 확인시켜 주었다.

그녀가 단말기에서 고개를 들자, 그녀의 시선이 당신과 정면으로 마주쳤다. 거기에는 어떤 판단도 없이, 그저 차분하고 전문적인 평가만이 담겨 있었다. 그녀는 약간의 연습된 미소를 지어 보였다.

"헌터 협회에 오신 것을 환영합니다." 최유진이 배경 소음을 쉽게 뚫고 나가는 명료하고 또렷한 목소리로 말문을 열었다. "각성을 축하드립니다. 공식 등급 측정을 진행하기 전에, 헌터 프로필에 기록해야 할 몇 가지 필수 세부 정보가 있습니다. 이는 모든 신규 등록자에게 적용되는 표준 절차입니다."

그녀는 책상 표면에 통합된 세련된 태블릿을 가리켰다. "성함과 연령, 성별을 말씀해 주시겠습니까? 또한, 대략적인 각성 날짜와 시간을 기억하신다면 도움이 될 것입니다. 마지막으로, 현재 보유하고 계신 것으로 파악된 스킬이 있다면 모두 말씀해 주십시오."

최유진은 정보를 입력할 준비를 하며 태블릿 위를 펜으로 가볍게 두드렸다. 그녀는 전문가적인 태도를 잃지 않고 참을성 있게 기다리며, 당신이 생각을 정리하고 헌터로서의 새로운 삶의 첫 공식 단계에 응답할 시간을 주었다.`,
  contentBackgroundColor: '#1a1a1a',
  contentTextColor: '#e0e0e0',
  fontSize: 15,
  lineHeight: 1.8
}

export default function BannerPage() {
  const [config, setConfig] = useState(defaultBannerConfig)
  const [generatedHTML, setGeneratedHTML] = useState('')

  // localStorage에서 설정 불러오기
  const loadConfig = () => {
    try {
      if (typeof window !== 'undefined') {
        const savedConfig = localStorage.getItem('bannerConfig')
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig)
          return {
            ...defaultBannerConfig,
            ...parsedConfig,
            tags: parsedConfig.tags || defaultBannerConfig.tags,
            wordReplacements: parsedConfig.wordReplacements || defaultBannerConfig.wordReplacements
          }
        }
      }
    } catch (error) {
      console.error('배너 설정을 불러오는 중 오류 발생:', error)
    }
    return defaultBannerConfig
  }

  // localStorage에 설정 저장하기
  const saveConfig = (newConfig: any) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('bannerConfig', JSON.stringify(newConfig))
      }
    } catch (error) {
      console.error('배너 설정을 저장하는 중 오류 발생:', error)
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
      const generator = BannerGeneratorV2({ config })
      const html = generator.generateHTML()
      setGeneratedHTML(html)
    } catch (error) {
      console.error('배너형 HTML 생성 오류:', error)
      setGeneratedHTML('<p>HTML 생성 중 오류가 발생했습니다.</p>')
    }
  }, [config])

  // 이미지 HTML에서 URL 추출하는 함수
  const extractImageUrlFromHtml = (htmlString: string) => {
    const imgTagRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/i
    const match = htmlString.match(imgTagRegex)
    
    if (match && match[1]) {
      return match[1]
    }
    
    return htmlString
  }

  // 입력값이 HTML인지 확인하는 함수
  const isHtmlImageTag = (input: string) => {
    return input.includes('<img') && input.includes('src=')
  }

  // 핸들러 함수들
  const handleConfigChange = (newConfig: Partial<typeof defaultBannerConfig>) => {
    // 이미지 URL 필드에 대한 HTML 파싱 처리
    if (newConfig.imageUrl && typeof newConfig.imageUrl === 'string') {
      if (isHtmlImageTag(newConfig.imageUrl)) {
        newConfig.imageUrl = extractImageUrlFromHtml(newConfig.imageUrl)
      }
    }
    
    setConfig(prev => ({
      ...prev,
      ...newConfig
    }))
  }

  const handleGenerateHTML = () => {
    const generator = BannerGeneratorV2({ config })
    const html = generator.generateHTML()
    setGeneratedHTML(html)
  }

  const handleCopyHTML = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(generatedHTML).then(() => {
        alert('배너형 HTML 코드가 클립보드에 복사되었습니다!')
      })
    }
  }

  const handleReset = () => {
    if (typeof window !== 'undefined' && confirm('배너형 설정을 기본값으로 초기화하시겠습니까?')) {
      setConfig({ ...defaultBannerConfig })
      setGeneratedHTML('')
    }
  }

  return (
    <div className="banner-page">
      <Navigation currentGenerator="banner" />
      
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">
            <span className="page-icon">🏞️</span>
            배너형 로그 생성기
          </h1>
          <p className="page-description">
            시각적으로 임팩트 있는 배너 스타일의 로그를 생성합니다.
          </p>
        </div>

        <BannerFormLayout
          config={config}
          onConfigChange={handleConfigChange}
          generatedHTML={generatedHTML}
          onGenerateHTML={handleGenerateHTML}
          onCopyHTML={handleCopyHTML}
          onReset={handleReset}
        />
      </div>

      <style jsx>{`
        .banner-page {
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