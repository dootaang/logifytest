'use client'

import React, { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import BookmarkletFormLayout from '@/components/BookmarkletFormLayout'
import BookmarkletGenerator from '@/generators/BookmarkletGenerator'
import { DarkModeUtils } from '@/utils/styles'
import { copyToAdvancedClipboard, copyToSimpleClipboard } from '@/utils/advancedClipboard'

interface WordReplacement {
  from: string;
  to: string;
}

// 채팅 섹션 인터페이스 추가
interface ChatSection {
  id: string;
  content: string;
}

interface BookmarkletConfig {
  content: string;
  backgroundColor: string;
  textColor: string;
  highlightColor: string;
  emphasisColor: string;
  fontSize: number;
  lineHeight: number;
  containerWidth: number;
  borderRadius: number;
  padding: number;
  boxShadow: string;
  wordReplacements: WordReplacement[];
  // chatSections 추가
  chatSections?: ChatSection[];
}

// 북마클릿형 기본 설정
const defaultBookmarkletConfig = {
  content: `그는 몸을 바로 세웠다. 그녀보다 약간 큰 키로 내려다보며, 그 어이없을 정도로 자신만만한 미소는 여전히 얼굴에 확고히 자리 잡고 있었다. 마치 복잡한 방정식을 풀고 반박 불가능한 증명을 제시한 것처럼. 무도회장 바닥에 무릎을 꿇고 그녀의&hellip; 감정적 후견인이 되겠다고 선언하는 것이 포함된 증명 말이다.

하퍼는 그를 올려다보았다. 연회장의 소란스러운 소음이 그에게서 뿜어져 나오는 순수하고 집중된 대담함 때문에 순간 잠잠해졌다. 그가 잡았던, 그가 <span style="color: rgb(241, 250, 140); font-style: italic;">키스했던</span> 그녀의 손은 전혀 낯선 잔열로 얼얼했다.

'내 성격을 좋아한다고?'

그 생각은 의식적인 판단이라기보다는 그녀의 내적 처리 과정에서 발생한 오류에 가까웠다. 0으로 나누는 것처럼. 남자들은 그녀의 성격을 <span style="color: rgb(241, 250, 140); font-style: italic;">좋아하지</span> 않았다. 그녀의 재능, 명성, 부 때문에 참아주거나, 아니면 너무 둔감해서 너무 늦을 때까지 그 날카로운 모서리를 알아보지 못했을 뿐이다. 그런데 <span style="color: rgb(241, 250, 140); font-style: italic;">좋아한다고?</span> 그걸&hellip; 흥미롭다고?

<span style="color: rgb(255, 184, 108);">&ldquo;당신의 평가는&hellip;&rdquo;</span> 그녀가 입을 열었다. 목소리는 익숙한 딱딱 끊어지는 정확성을 되찾았지만, 배신자처럼 쉬어 있는 기색이 남아 있었다. <span style="color: rgb(255, 184, 108);">&ldquo;&hellip;근본적으로 결함이 있습니다. 당신은 피상적인 관찰 &ndash; 그것도 싸구려 치킨과 무너지는 나무 탑이 포함된, 극도로 스트레스받는 비정상적인 상호작용 중에 얻은 관찰을 말이죠 &ndash; 을 진정한 심리학적 통찰력으로 착각하고 있어요.&rdquo;</span>`,
  backgroundColor: '#000000',
  textColor: '#f8f8f2',
  highlightColor: '#f1fa8c',
  emphasisColor: '#8be9fd',
  fontSize: 15,
  lineHeight: 1.6,
  containerWidth: 800,
  borderRadius: 16,
  padding: 2,
  boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
  wordReplacements: [
    { from: '그는', to: '그녀는' },
    { from: '', to: '' },
    { from: '', to: '' }
  ] as WordReplacement[],
  // chatSections 기본값 추가
  chatSections: [] as ChatSection[]
}

export default function BookmarkletPage() {
  const [config, setConfig] = useState(defaultBookmarkletConfig)
  const [generatedHTML, setGeneratedHTML] = useState('')

  // localStorage에서 설정 불러오기
  const loadConfig = () => {
    try {
      if (typeof window !== 'undefined') {
        const savedConfig = localStorage.getItem('bookmarkletConfig')
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig)
          return {
            ...defaultBookmarkletConfig,
            ...parsedConfig
          }
        }
      }
    } catch (error) {
      console.error('북마클릿 설정을 불러오는 중 오류 발생:', error)
    }
    return defaultBookmarkletConfig
  }

  // localStorage에 설정 저장하기
  const saveConfig = (newConfig: any) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('bookmarkletConfig', JSON.stringify(newConfig))
      }
    } catch (error) {
      console.error('북마클릿 설정을 저장하는 중 오류 발생:', error)
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
    const generator = BookmarkletGenerator({ config })
    const html = generator.generateHTML()
    setGeneratedHTML(html)
  }, [config])

  // 핸들러 함수들
  const handleConfigChange = (newConfig: Partial<BookmarkletConfig>) => {
    setConfig(prev => ({
      ...prev,
      ...newConfig
    }))
  }

  const handleGenerateHTML = () => {
    const generator = BookmarkletGenerator({ config })
    const html = generator.generateHTML()
    setGeneratedHTML(html)
  }

  const handleCopyHTML = async () => {
    try {
      // 고급 클립보드 복사 시도 (HTML + 이미지)
      const success = await copyToAdvancedClipboard({
        htmlContent: generatedHTML,
        plainTextContent: generatedHTML,
        title: '북마클릿형 로그',
        author: '북마클릿형 생성기'
      });

      if (success) {
        alert('🎉 북마클릿형 로그가 스타일과 이미지와 함께 클립보드에 복사되었습니다!\n\n이제 글쓰기 에디터에 붙여넣기하면 디자인이 그대로 적용됩니다.');
      } else {
        alert('📋 북마클릿형 HTML 코드가 클립보드에 복사되었습니다!\n\n(고급 복사 기능을 지원하지 않는 브라우저입니다)');
      }
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
      alert('❌ 클립보드 복사에 실패했습니다. 다시 시도해주세요.');
    }
  }

  const handleReset = () => {
    if (typeof window !== 'undefined' && confirm('북마클릿형 설정을 기본값으로 초기화하시겠습니까?')) {
      setConfig({ ...defaultBookmarkletConfig })
      setGeneratedHTML('')
    }
  }

  return (
    <div className="bookmarklet-page">
      <Navigation currentGenerator="bookmarklet" />
      
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">
            <span className="page-icon">📚</span>
            북마클릿형 로그 제조기
          </h1>
          <p className="page-description">
            전통적이고 안정적인 북마클릿 스타일의 로그를 생성합니다.
          </p>
        </div>

        <BookmarkletFormLayout
          config={config}
          onConfigChange={handleConfigChange}
          generatedHTML={generatedHTML}
          onGenerateHTML={handleGenerateHTML}
          onCopyHTML={handleCopyHTML}
          onReset={handleReset}
        />
      </div>

      <style jsx>{`
        .bookmarklet-page {
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