'use client'

import React, { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import JellyFormLayout from '@/components/JellyFormLayout'
import JellyGenerator from '@/generators/JellyGenerator'
import { DarkModeUtils } from '@/utils/styles'
import { copyToAdvancedClipboard, copyToSimpleClipboard } from '@/utils/advancedClipboard'

interface WordReplacement {
  from: string;
  to: string;
}

interface ChatSection {
  id: string;
  content: string;
}

// 제리형 기본 설정
const defaultJellyConfig = {
  backgroundImage: '//ac-p1.namu.la/20250523sac/4d095bebd72fd7bdc1d6a25b00a235aff5b90b2ddec6fd1b0fcf16ea0cdd3535.png?expires=1748038585&key=347AY1ahV3ud6g0abXibsg',
  leftText: '얼터네이트 헌터즈',
  rightText: '잼민이, 서리',
  leftTextColor1: '#4B69A0',
  leftTextColor2: '#89D9D8',
  quoteColor1: '#2A4569',
  quoteColor2: '#497AA6',
  quoteColorEnabled: true,
  quoteGradientEnabled: true,
  boldEnabled: false,
  singleQuoteItalic: false,
  singleQuoteColor: '#666666',
  contentBackgroundColor: 'rgba(250, 250, 250, 1)',
  contentTextColor: '#494949',
  fontSize: 15,
  lineHeight: 2.3,
  paragraphIndent: false,
  selectedTheme: 'light',
  wordReplacements: [
    { from: '종원', to: '유저' },
    { from: '', to: '' },
    { from: '', to: '' }
  ] as WordReplacement[],
  chatSections: [
    { id: 'default', content: '' }
  ],
  content: `서울 헌터 협회 중앙 로비는 낮고 끊임없는 활동 소음으로 웅성거렸다. 한쪽 벽에는 세련된 단말기들이 줄지어 있었고, 대부분의 행인들은 다른 곳에 집중하느라 무시하는, 변동하는 게이트 정보를 표시하고 있었다. 긴장과 기대가 뒤섞인 표정으로 알아볼 수 있는 신규 각성자들은 간단한 서류 양식을 꽉 쥐고, 때때로 보안 복도 아래로 보이는 위압적인 등급 평가실 쪽을 힐끗거렸다. 제복을 입은 협회 직원들은 숙련된 효율성으로 움직였고, 그들의 발걸음은 광택 나는 바닥에 부드럽게 울려 퍼졌다. 에어컨은 넓은 공간을 시원하게 유지했고, 이는 바깥의 습한 여름 공기와 대조를 이루었다.

당신은 등록 및 초기 측정라고 표시된 접수처 앞에 섰다. 그 뒤에는 최유진이 단정한 협회 유니폼을 입고 흠잡을 데 없는 자세로 앉아 있었다. 그녀의 검은 단발머리는 그녀가 지닌 권위에 비해 놀라울 정도로 젊으면서도 전문가적인 얼굴을 감싸고 있었다. 블레이저에 달린 코팅된 ID 배지는 그녀의 이름과 직책(등록 및 평가 팀장)을 확인시켜 주었다.

그녀가 단말기에서 고개를 들자, 그녀의 시선이 당신과 정면으로 마주쳤다. 거기에는 어떤 판단도 없이, 그저 차분하고 전문적인 평가만이 담겨 있었다. 그녀는 약간의 연습된 미소를 지어 보였다.

"헌터 협회에 오신 것을 환영합니다." 최유진이 배경 소음을 쉽게 뚫고 나가는 명료하고 또렷한 목소리로 말문을 열었다. "각성을 축하드립니다. 공식 등급 측정을 진행하기 전에, 헌터 프로필에 기록해야 할 몇 가지 필수 세부 정보가 있습니다. 이는 모든 신규 등록자에게 적용되는 표준 절차입니다."

그녀는 책상 표면에 통합된 세련된 태블릿을 가리켰다. "성함과 연령, 성별을 말씀해 주시겠습니까? 또한, 대략적인 각성 날짜와 시간을 기억하신다면 도움이 될 것입니다. 마지막으로, 현재 보유하고 계신 것으로 파악된 스킬이 있다면 모두 말씀해 주십시오."

최유진은 정보를 입력할 준비를 하며 태블릿 위를 펜으로 가볍게 두드렸다. 그녀는 전문가적인 태도를 잃지 않고 참을성 있게 기다리며, 당신이 생각을 정리하고 헌터로서의 새로운 삶의 첫 공식 단계에 응답할 시간을 주었다.`
}

export default function JellyPage() {
  const [config, setConfig] = useState(defaultJellyConfig)
  const [generatedHTML, setGeneratedHTML] = useState('')

  // localStorage에서 설정 불러오기
  const loadConfig = () => {
    try {
      if (typeof window !== 'undefined') {
        const savedConfig = localStorage.getItem('jellyConfig')
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig)
          return {
            ...defaultJellyConfig,
            ...parsedConfig,
            selectedTheme: DarkModeUtils.getSystemDarkMode() ? 'dark' : 'light'
          }
        }
      }
      return { ...defaultJellyConfig, selectedTheme: DarkModeUtils.getSystemDarkMode() ? 'dark' : 'light' }
    } catch (error) {
      console.error('제리형 설정을 불러오는 중 오류 발생:', error)
      return { ...defaultJellyConfig, selectedTheme: DarkModeUtils.getSystemDarkMode() ? 'dark' : 'light' }
    }
  }

  // localStorage에 설정 저장하기 (용량 제한 및 이미지 데이터 제외)
  const saveConfig = (newConfig: any) => {
    try {
      if (typeof window !== 'undefined') {
        // 저장할 설정에서 이미지 데이터 제외 (base64 이미지는 용량이 매우 큼)
        const configToSave = { ...newConfig };
        
        // 이미지 URL이 base64 데이터인 경우 저장에서 제외
        if (configToSave.backgroundImage && configToSave.backgroundImage.startsWith('data:')) {
          delete configToSave.backgroundImage;
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
        localStorage.setItem('jellyConfig', dataToSave);
        console.log(`💾 제리 설정 저장 완료 (${dataSizeKB.toFixed(1)}KB)`);
      }
    } catch (error) {
      console.error('제리형 설정을 저장하는 중 오류 발생:', error);
      
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
          delete cleanConfig.backgroundImage; // 이미지 URL 완전 제외
          
          const cleanData = JSON.stringify(cleanConfig);
          localStorage.setItem('jellyConfig', cleanData);
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
    const generator = JellyGenerator({ config })
    const html = generator.generateHTML()
    setGeneratedHTML(html)
  }, [config])

  // 핸들러 함수들
  const handleConfigChange = (newConfig: Partial<typeof defaultJellyConfig>) => {
    setConfig(prev => ({
      ...prev,
      ...newConfig
    }))
  }

  const handleGenerateHTML = () => {
    const generator = JellyGenerator({ config })
    const html = generator.generateHTML()
    setGeneratedHTML(html)
  }

  const handleCopyHTML = async () => {
    try {
      // 고급 클립보드 복사 시도 (HTML + 이미지)
      const success = await copyToAdvancedClipboard({
        htmlContent: generatedHTML,
        plainTextContent: generatedHTML,
        title: '제리형 로그',
        author: '제리형 생성기'
      });

      if (success) {
        alert('🎉 제리형 로그가 스타일과 이미지와 함께 클립보드에 복사되었습니다!\n\n이제 글쓰기 에디터에 붙여넣기하면 디자인이 그대로 적용됩니다.');
      } else {
        alert('📋 제리형 HTML 코드가 클립보드에 복사되었습니다!\n\n(고급 복사 기능을 지원하지 않는 브라우저입니다)');
      }
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
      alert('❌ 클립보드 복사에 실패했습니다. 다시 시도해주세요.');
    }
  }

  const handleReset = () => {
    if (typeof window !== 'undefined' && confirm('제리형 설정을 기본값으로 초기화하시겠습니까?')) {
      const resetConfig = { 
        ...defaultJellyConfig, 
        selectedTheme: DarkModeUtils.getSystemDarkMode() ? 'dark' : 'light' 
      }
      setConfig(resetConfig)
      setGeneratedHTML('')
    }
  }

  return (
    <div className="jelly-page">
      <Navigation currentGenerator="jelly" />
      
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">
            <span className="page-icon">🐭</span>
            제리형 로그 생성기
          </h1>
          <p className="page-description">
            세련되고 감각적인 디자인의 로그를 생성합니다.
          </p>
        </div>

        <JellyFormLayout
          config={config}
          onConfigChange={handleConfigChange}
          generatedHTML={generatedHTML}
          onGenerateHTML={handleGenerateHTML}
          onCopyHTML={handleCopyHTML}
          onReset={handleReset}
        />
      </div>

      <style jsx>{`
        .jelly-page {
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