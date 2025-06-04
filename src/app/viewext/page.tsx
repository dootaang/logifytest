'use client'

import React, { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import ViewextFormLayout from '@/components/ViewextFormLayout'
import ViewextGenerator from '@/components/ViewextGenerator'
import { DarkModeUtils } from '@/utils/styles'
import { copyToAdvancedClipboard, copyToSimpleClipboard } from '@/utils/advancedClipboard'

// 뷰익형 기본 설정 (새로운 구조)
const defaultViewextConfig = {
  // 기본 콘텐츠
  content: `아스가르드 오딘궁의 신들이 내려와 우리를 보호해주신다고 믿어왔지만, 그들은 어디에도 없었다.

'우리를 버렸구나, 아니면 애초부터 없었던 건가?'

"괜찮아, 우리 스스로 해내면 돼."

라그나로크가 시작된 지 100년이 지났다. 북유럽의 세계수 이그드라실은 말라가고 있고, 아홉 세계는 하나씩 어둠에 잠기고 있다.

그래도 우리는 살아남았다.`,
  title: 'ALTERNATE HUNTERS',
  
  // 이미지 설정
  mainImageUrl: '//ac.namu.la/20250526sac/b21b640b25a435f4416eb5f768020e1299922b5b279fde6704fd41a88db25299.png?expires=1748352815&key=XzMdaj1QDkKe670tMMMsIg',
  showMainImage: true,
  imageMaxWidth: 320,
  
  // 색상 및 스타일 설정 (Alternate Hunters 테마)
  backgroundColor: 'radial-gradient(circle at 10% 20%, rgb(20, 30, 35) 20%, #0f1a20 70%)',
  backgroundGradient: '',
  titleColor: '#b8a576',
  textColor: '#b5a382',
  borderColor: '#1c352d',
  
  // 하이라이트 박스 설정
  highlightBoxColor: 'rgba(107, 182, 255, 0.1)',
  highlightBoxBorderColor: '#6bb6ff',
  highlightBoxTextColor: '#6bb6ff',
  
  // 대화 박스 설정
  dialogueBoxColor: 'rgba(138, 121, 93, 0.1)',
  dialogueBoxBorderColor: '#8a795d',
  dialogueBoxTextColor: '#f1c40f',
  
  // 폰트 설정
  fontFamily: 'Pretendard Variable',
  fontSize: 16,
  lineHeight: 1.5,
  letterSpacing: 0,
  
  // 텍스트 커스터마이징 설정
  boldEnabled: true,
  italicEnabled: true,
  highlightBoldEnabled: true,
  highlightItalicEnabled: false,
  dialogueBoldEnabled: true,
  dialogueItalicEnabled: false,
  
  // 레이아웃 설정
  maxWidth: 55,
  paddingTop: 1,
  paddingRight: 2,
  paddingBottom: 0.1,
  paddingLeft: 2,
  borderRadius: 1,
  shadowBlur: 2,
  shadowSpread: 0,
  
  // 고급 설정
  enableCustomCSS: false,
  customCSS: '',
  
  // 단어 변환 기능
  wordReplacements: [
    { from: '헌터', to: '모험가' },
    { from: '', to: '' },
    { from: '', to: '' }
  ]
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

  // localStorage에 설정 저장하기 (용량 제한 및 이미지 데이터 제외)
  const saveConfig = (newConfig: any) => {
    try {
      if (typeof window !== 'undefined') {
        // 저장할 설정에서 이미지 데이터 제외 (base64 이미지는 용량이 매우 큼)
        const configToSave = { ...newConfig };
        
        // 이미지 URL이 base64 데이터인 경우 저장에서 제외
        if (configToSave.mainImageUrl && configToSave.mainImageUrl.startsWith('data:')) {
          delete configToSave.mainImageUrl;
          console.log('💾 base64 이미지는 용량 절약을 위해 설정 저장에서 제외됩니다.');
        }
        
        // 저장할 데이터를 JSON으로 변환
        const dataToSave = JSON.stringify(configToSave);
        
        // 데이터 크기 체크 (2MB 제한)
        const dataSizeKB = new Blob([dataToSave]).size / 1024;
        const maxSizeKB = 2048; // 2MB
        
        if (dataSizeKB > maxSizeKB) {
          console.warn(`⚠️ 설정 데이터가 너무 큽니다: ${dataSizeKB.toFixed(1)}KB > ${maxSizeKB}KB`);
          return; // 저장하지 않음
        }
        
        // localStorage에 저장 시도
        localStorage.setItem('viewextConfig', dataToSave);
        console.log(`💾 뷰익 설정 저장 완료 (${dataSizeKB.toFixed(1)}KB)`);
      }
    } catch (error) {
      console.error('뷰익형 설정을 저장하는 중 오류 발생:', error);
      
      // QuotaExceededError 처리
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('📦 localStorage 용량이 부족합니다.');
        
        // 기존 저장된 설정들을 정리하여 공간 확보 시도
        try {
          const keysToClean = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('auto') || key.includes('History') || key.includes('Temp'))) {
              keysToClean.push(key);
            }
          }
          
          // 임시 데이터들 삭제
          keysToClean.forEach(key => {
            try {
              localStorage.removeItem(key);
              console.log(`🧹 임시 데이터 정리: ${key}`);
            } catch (cleanError) {
              console.warn(`정리 실패: ${key}`, cleanError);
            }
          });
          
          // 다시 저장 시도 (이미지 데이터 완전 제외)
          const cleanConfig = { ...newConfig };
          delete cleanConfig.mainImageUrl; // 이미지 URL 완전 제외
          
          const cleanData = JSON.stringify(cleanConfig);
          localStorage.setItem('viewextConfig', cleanData);
          console.log('✅ 정리 후 저장 성공');
          
        } catch (retryError) {
          console.error('정리 후에도 저장 실패:', retryError);
          alert('💾 설정 저장에 실패했습니다.\n\n브라우저 저장 공간이 부족할 수 있습니다.\n(이미지는 임시로만 사용되며 자동 저장되지 않습니다)');
        }
      }
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

  const handleCopyHTML = async () => {
    try {
      // 고급 클립보드 복사 시도 (HTML + 이미지)
      const success = await copyToAdvancedClipboard({
        htmlContent: generatedHTML,
        plainTextContent: generatedHTML,
        title: '뷰익형 로그',
        author: '뷰익형 생성기'
      });

      if (success) {
        alert('🎉 뷰익형 로그가 스타일과 이미지와 함께 클립보드에 복사되었습니다!\n\n이제 글쓰기 에디터에 붙여넣기하면 디자인이 그대로 적용됩니다.');
      } else {
        alert('📋 뷰익형 HTML 코드가 클립보드에 복사되었습니다!\n\n(고급 복사 기능을 지원하지 않는 브라우저입니다)');
      }
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
      alert('❌ 클립보드 복사에 실패했습니다. 다시 시도해주세요.');
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
            <span className="page-icon">🔖</span>
            뷰익형 로그 제조기
          </h1>
          <p className="page-description">
            뷰어 익스텐션 디자인 기반
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