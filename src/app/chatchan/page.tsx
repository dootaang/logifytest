'use client'

import React, { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import ChatchanFormLayout from '@/components/ChatchanFormLayout'
import { useChatchanGeneratorV2 } from '@/generators/ChatchanGeneratorV2'
import { DarkModeUtils } from '@/utils/styles'
import { copyToAdvancedClipboard, copyToSimpleClipboard } from '@/utils/advancedClipboard'

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
    { from: 'AI', to: '봇' },
    { from: '', to: '' },
    { from: '', to: '' }
  ] as WordReplacement[]
}

export default function ChatchanPage() {
  const [config, setConfig] = useState(defaultChatchanConfig)
  const [generatedHTML, setGeneratedHTML] = useState('')
  const [previewHTML, setPreviewHTML] = useState('')

  // 챗챈 생성기 훅
  const { generateHTML: generateChatchanHTML, generatePreviewHTML: generateChatchanPreviewHTML } = useChatchanGeneratorV2(config)

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

  // localStorage에 설정 저장하기 (용량 제한 및 이미지 데이터 제외)
  const saveConfig = (newConfig: any) => {
    try {
      if (typeof window !== 'undefined') {
        // 저장할 설정에서 이미지 데이터 제외 (base64 이미지는 용량이 매우 큼)
        const configToSave = { ...newConfig };
        
        // 이미지 URL이 base64 데이터인 경우 저장에서 제외
        if (configToSave.characterImageUrl && configToSave.characterImageUrl.startsWith('data:')) {
          delete configToSave.characterImageUrl;
          console.log('💾 base64 이미지는 용량 절약을 위해 설정 저장에서 제외됩니다.');
        }
        
        // 저장할 데이터를 JSON으로 변환
        const dataToSave = JSON.stringify(configToSave);
        
        // 데이터 크기 체크 (2MB 제한)
        const dataSizeKB = new Blob([dataToSave]).size / 1024;
        const maxSizeKB = 2048; // 2MB
        
        if (dataSizeKB > maxSizeKB) {
          console.warn(`⚠️ 설정 데이터가 너무 큽니다: ${dataSizeKB.toFixed(1)}KB > ${maxSizeKB}KB`);
          console.warn('💡 base64 이미지나 긴 텍스트가 포함되어 있는지 확인해주세요.');
          return; // 저장하지 않음
        }
        
        // localStorage에 저장 시도
        localStorage.setItem('chatchanConfig', dataToSave);
        console.log(`💾 챗챈 설정 저장 완료 (${dataSizeKB.toFixed(1)}KB)`);
      }
    } catch (error) {
      console.error('챗챈 설정을 저장하는 중 오류 발생:', error);
      
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
          delete cleanConfig.characterImageUrl; // 이미지 URL 완전 제외
          
          const cleanData = JSON.stringify(cleanConfig);
          localStorage.setItem('chatchanConfig', cleanData);
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
    const html = generateChatchanHTML()
    const preview = generateChatchanPreviewHTML()
    setGeneratedHTML(html)
    setPreviewHTML(preview)
  }, [config, generateChatchanHTML, generateChatchanPreviewHTML])

  // 핸들러 함수들
  const handleConfigChange = (newConfig: Partial<typeof defaultChatchanConfig>) => {
    setConfig(prev => ({
      ...prev,
      ...newConfig
    }))
  }

  const handleGenerateHTML = () => {
    const html = generateChatchanHTML()
    const preview = generateChatchanPreviewHTML()
    setGeneratedHTML(html)
    setPreviewHTML(preview)
  }

  const handleCopyHTML = async () => {
    try {
      // 고급 클립보드 복사 시도 (HTML + 이미지)
      const success = await copyToAdvancedClipboard({
        htmlContent: generatedHTML,
        plainTextContent: generatedHTML,
        title: '챗챈형 로그',
        author: '챗챈형 생성기'
      });

      if (success) {
        alert('🎉 챗챈형 로그가 스타일과 이미지와 함께 클립보드에 복사되었습니다!\n\n이제 글쓰기 에디터에 붙여넣기하면 디자인이 그대로 적용됩니다.');
      } else {
        alert('📋 챗챈형 HTML 코드가 클립보드에 복사되었습니다!\n\n(고급 복사 기능을 지원하지 않는 브라우저입니다)');
      }
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
      alert('❌ 클립보드 복사에 실패했습니다. 다시 시도해주세요.');
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
            챗챈 로그 제조기 1.3
          </h1>
          <p className="page-description">
            채팅 형태의 대화형 로그를 생성합니다.
          </p>
        </div>

        <ChatchanFormLayout
          config={config}
          onConfigChange={handleConfigChange}
          generatedHTML={generatedHTML}
          previewHTML={previewHTML}
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