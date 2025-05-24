'use client'

import React, { useState, useEffect } from 'react'
import JellyGenerator from '@/generators/JellyGenerator'
import BookmarkletGenerator from '@/generators/BookmarkletGenerator'
import BannerGenerator from '@/generators/BannerGenerator'
import ChatchanGenerator from '@/generators/ChatchanGenerator'
import BingdunGenerator from '@/generators/BingdunGenerator'

export default function Home() {
  // 다크모드 감지 함수
  const getSystemTheme = () => {
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  }

  // 기본 설정값
  const defaultConfig = {
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
    selectedTheme: 'light', // 초기값, 나중에 시스템 테마로 업데이트
    selectedGenerator: 'jelly',
    wordReplacements: [
      { from: '종원', to: '유저' },
      { from: '', to: '' },
      { from: '', to: '' }
    ],
    content: `서울 헌터 협회 중앙 로비는 낮고 끊임없는 활동 소음으로 웅성거렸다. 한쪽 벽에는 세련된 단말기들이 줄지어 있었고, 대부분의 행인들은 다른 곳에 집중하느라 무시하는, 변동하는 게이트 정보를 표시하고 있었다. 긴장과 기대가 뒤섞인 표정으로 알아볼 수 있는 신규 각성자들은 간단한 서류 양식을 꽉 쥐고, 때때로 보안 복도 아래로 보이는 위압적인 등급 평가실 쪽을 힐끗거렸다. 제복을 입은 협회 직원들은 숙련된 효율성으로 움직였고, 그들의 발걸음은 광택 나는 바닥에 부드럽게 울려 퍼졌다. 에어컨은 넓은 공간을 시원하게 유지했고, 이는 바깥의 습한 여름 공기와 대조를 이루었다.

당신은 등록 및 초기 측정라고 표시된 접수처 앞에 섰다. 그 뒤에는 최유진이 단정한 협회 유니폼을 입고 흠잡을 데 없는 자세로 앉아 있었다. 그녀의 검은 단발머리는 그녀가 지닌 권위에 비해 놀라울 정도로 젊으면서도 전문가적인 얼굴을 감싸고 있었다. 블레이저에 달린 코팅된 ID 배지는 그녀의 이름과 직책(등록 및 평가 팀장)을 확인시켜 주었다.

그녀가 단말기에서 고개를 들자, 그녀의 시선이 당신과 정면으로 마주쳤다. 거기에는 어떤 판단도 없이, 그저 차분하고 전문적인 평가만이 담겨 있었다. 그녀는 약간의 연습된 미소를 지어 보였다.

"헌터 협회에 오신 것을 환영합니다." 최유진이 배경 소음을 쉽게 뚫고 나가는 명료하고 또렷한 목소리로 말문을 열었다. "각성을 축하드립니다. 공식 등급 측정을 진행하기 전에, 헌터 프로필에 기록해야 할 몇 가지 필수 세부 정보가 있습니다. 이는 모든 신규 등록자에게 적용되는 표준 절차입니다."

그녀는 책상 표면에 통합된 세련된 태블릿을 가리켰다. "성함과 연령, 성별을 말씀해 주시겠습니까? 또한, 대략적인 각성 날짜와 시간을 기억하신다면 도움이 될 것입니다. 마지막으로, 현재 보유하고 계신 것으로 파악된 스킬이 있다면 모두 말씀해 주십시오."

최유진은 정보를 입력할 준비를 하며 태블릿 위를 펜으로 가볍게 두드렸다. 그녀는 전문가적인 태도를 잃지 않고 참을성 있게 기다리며, 당신이 생각을 정리하고 헌터로서의 새로운 삶의 첫 공식 단계에 응답할 시간을 주었다.`
  }

  // 기본 이미지 옵션
  const defaultImages = [
    {
      id: 'yuzu',
      name: '유즈',
      url: '//ac-p1.namu.la/20250523sac/7edfca5162ef4fb4da4e8d6dc8dbf976ea4aa7072ac3dd1cb6024116e83b280d.png?expires=1748047045&key=zLtjw_UPp0o0vUTtngyjvQ'
    },
    {
      id: 'lemon',
      name: '레몬',
      url: '//ac-p1.namu.la/20250523sac/dfeef29920a64f42b531c81fcc6e242211bff08492f533f081fd77ad943b356a.png?expires=1748047065&key=Rjz_e0fyxdA0c4674Wh3gQ'
    },
    {
      id: 'modern_night',
      name: '현대밤',
      url: '//ac-p1.namu.la/20250523sac/4f72665e2ae795ada3c1bd0fb77ffd38d32718eb3ef5b32fe6ffd567df3ed726.png?expires=1748046935&key=Z5CmE5DGij8JhcneI0hfsQ'
    },
    {
      id: 'modern_day',
      name: '현대낮',
      url: '//ac-p1.namu.la/20250523sac/cc2fed3a3bc7c841946bbb929b6c27050a1f02a72177293ce07f6f7737863b61.png?expires=1748046982&key=AAPN1YeBm29AMxygW-RfTw'
    },
    {
      id: 'rural_day',
      name: '시골낮',
      url: '//ac-p1.namu.la/20250523sac/fd5cddf54957cb39e80d36c68e442a1a976b8c26aacc6295083254007ecb434a.png?expires=1748047016&key=h64giwTquU1vHt-x2Is6mQ'
    },
    {
      id: 'rural_night',
      name: '시골밤',
      url: '//ac-p1.namu.la/20250523sac/1aca5ff6f15f46ae00412a5ac00c6c2f8c49b50c7a5fbbf8c9fa8d6aa673a6c3.png?expires=1748048366&key=mqJ-yHiT7X_fDG5hiVk2gA'
    }
  ]

  // localStorage에서 설정 불러오기
  const loadConfig = () => {
    try {
      if (typeof window !== 'undefined') {
        const savedConfig = localStorage.getItem('weblogConfig')
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig)
          return {
            ...defaultConfig,
            ...parsedConfig,
            selectedTheme: getSystemTheme() // 시스템 테마로 업데이트
          }
        }
      }
      return { ...defaultConfig, selectedTheme: getSystemTheme() }
    } catch (error) {
      console.error('설정을 불러오는 중 오류 발생:', error)
      return { ...defaultConfig, selectedTheme: getSystemTheme() }
    }
  }

  // localStorage에 설정 저장하기
  const saveConfig = (newConfig: any) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('weblogConfig', JSON.stringify(newConfig))
      }
    } catch (error) {
      console.error('설정을 저장하는 중 오류 발생:', error)
    }
  }

  const [config, setConfig] = useState(defaultConfig)
  const [extractedFromHtml, setExtractedFromHtml] = useState(false)

  // 컴포넌트 마운트 후 설정 로드
  useEffect(() => {
    setConfig(loadConfig())
  }, [])

  // 테마 적용
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', config.selectedTheme)
    }
  }, [config.selectedTheme])

  // 시스템 테마 변경 감지
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleThemeChange = (e: MediaQueryListEvent) => {
        const newTheme = e.matches ? 'dark' : 'light'
        setConfig(prev => ({
          ...prev,
          selectedTheme: newTheme
        }))
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

  // URL에 프로토콜이 없으면 https를 추가하는 함수
  const normalizeImageUrl = (url: string) => {
    if (!url) return ''
    if (url.startsWith('//')) {
      return 'https:' + url
    }
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:')) {
      return 'https://' + url
    }
    return url
  }

  // 이미지 프록시 URL 생성 함수
  const getProxyImageUrl = (url: string) => {
    const normalizedUrl = normalizeImageUrl(url)
    return `https://images.weserv.nl/?url=${encodeURIComponent(normalizedUrl)}`
  }

  // 미리보기용 이미지 URL 생성 함수
  const getPreviewImageUrl = (url: string) => {
    return getProxyImageUrl(url)
  }

  // 클립보드에서 이미지 HTML 붙여넣기 처리
  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text')
    if (isHtmlImageTag(pastedText)) {
      e.preventDefault()
      const extractedUrl = extractImageUrlFromHtml(pastedText)
      handleInputChange('backgroundImage', extractedUrl)
      setExtractedFromHtml(true)
    }
  }

  // 단어 교환 적용 함수
  const applyWordReplacements = (text: string) => {
    let processedText = text
    config.wordReplacements.forEach(replacement => {
      if (replacement.from && replacement.to) {
        processedText = processedText.replace(new RegExp(replacement.from, 'g'), replacement.to)
      }
    })
    return processedText
  }

  const handleInputChange = (field: string, value: any) => {
    let finalValue = value
    let isFromHtml = false

    // 배경 이미지 필드이고 HTML 형태인 경우 URL 추출
    if (field === 'backgroundImage' && isHtmlImageTag(value)) {
      finalValue = extractImageUrlFromHtml(value)
      isFromHtml = true
    }

    setConfig(prev => ({
      ...prev,
      [field]: finalValue
    }))
    
    // 배경 이미지가 변경될 때 에러 상태 초기화
    if (field === 'backgroundImage') {
      setExtractedFromHtml(isFromHtml)
    }
  }

  // 테마 변경 함수
  const handleThemeChange = (themeId: string) => {
    setConfig(prev => ({
      ...prev,
      selectedTheme: themeId
    }))
  }

  // 초기화 버튼 핸들러
  const resetToDefault = () => {
    if (typeof window !== 'undefined' && confirm('모든 설정을 기본값으로 초기화하시겠습니까?')) {
      setConfig({ ...defaultConfig, selectedTheme: getSystemTheme() })
      setExtractedFromHtml(false)
    }
  }

  // 단어 교환 기능
  const handleWordReplacementChange = (index: number, field: string, value: string) => {
    const newReplacements = [...config.wordReplacements]
    newReplacements[index][field as keyof typeof newReplacements[0]] = value
    setConfig(prev => ({
      ...prev,
      wordReplacements: newReplacements
    }))
  }

  // 기본 이미지 선택 핸들러
  const handleDefaultImageSelect = (imageUrl: string) => {
    handleInputChange('backgroundImage', imageUrl)
    setExtractedFromHtml(false)
  }

  const generateHTML = () => {
    let generator
    
    switch (config.selectedGenerator) {
      case 'bookmarklet':
        generator = BookmarkletGenerator({ config })
        break
      case 'banner':
        generator = BannerGenerator({ config })
        break
      case 'jelly':
        generator = JellyGenerator({ config })
        break
      case 'chatchan':
        generator = ChatchanGenerator({ config })
        break
      case 'bingdun':
        generator = BingdunGenerator({ config })
        break
      default:
        generator = JellyGenerator({ config })
        break
    }
    
    return generator.generateHTML()
  }

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result 
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, 1`
      : '0, 0, 0, 1'
  }

  const copyToClipboard = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(generateHTML()).then(() => {
        alert('HTML 코드가 클립보드에 복사되었습니다!')
      })
    }
  }

  const handleGeneratorChange = (generatorType: string) => {
    setConfig(prev => ({
      ...prev,
      selectedGenerator: generatorType
    }))
  }

  return (
    <div className="container">
      <div className="header">
        <h1>로그제조기 올인원</h1>
        <p>모든 설정을 한 곳에서 관리하는 스마트 웹로그 생성기</p>
        
        {/* 로그제조기 타입 선택기 */}
        <div className="generator-selector">
          <div className="generator-grid">
            <button
              className={`generator-option ${config.selectedGenerator === 'bookmarklet' ? 'active' : ''}`}
              onClick={() => handleGeneratorChange('bookmarklet')}
            >
              <div className="generator-icon">📚</div>
              <div className="generator-name">북마클릿형</div>
              <div className="generator-desc">근-본 북마클릿</div>
            </button>
            
            <button
              className={`generator-option ${config.selectedGenerator === 'banner' ? 'active' : ''}`}
              onClick={() => handleGeneratorChange('banner')}
            >
              <div className="generator-icon">🏞️</div>
              <div className="generator-name">배너형</div>
              <div className="generator-desc">크고 아름다워</div>
            </button>
            
            <button
              className={`generator-option ${config.selectedGenerator === 'jelly' ? 'active' : ''}`}
              onClick={() => handleGeneratorChange('jelly')}
            >
              <div className="generator-icon">🐭</div>
              <div className="generator-name">제리형</div>
              <div className="generator-desc">센스있는 이쁜 것</div>
            </button>
            
            <button
              className={`generator-option ${config.selectedGenerator === 'chatchan' ? 'active' : ''}`}
              onClick={() => handleGeneratorChange('chatchan')}
            >
              <div className="generator-icon">💬</div>
              <div className="generator-name">챗챈형</div>
              <div className="generator-desc">챗챈1.3 긴-빠이</div>
            </button>
            
            <button
              className={`generator-option ${config.selectedGenerator === 'bingdun' ? 'active' : ''}`}
              onClick={() => handleGeneratorChange('bingdun')}
            >
              <div className="generator-icon">🏂</div>
              <div className="generator-name">빙둔형</div>
              <div className="generator-desc">초기 로그제조기+α</div>
            </button>
          </div>
        </div>
      </div>
      
      <div className="main-layout">
        <div className="settings-panel">
          {/* 본문 내용을 최상단으로 이동 */}
          <div className="settings-section">
            <h3 className="section-title">📄 본문 내용</h3>
            <div className="form-group">
              <textarea
                className="form-input form-textarea"
                value={config.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="본문 내용을 입력하세요. 대화 부분은 따옴표로 감싸주세요."
                rows={12}
              />
            </div>
            
            {/* 액션 버튼도 함께 최상단에 배치 */}
            <div className="button-group">
              <button className="button" onClick={copyToClipboard}>
                📋 HTML 복사
              </button>
              <button className="button danger" onClick={resetToDefault}>
                🔄 초기화
              </button>
            </div>
          </div>

          {/* 이미지 설정 */}
          <div className="settings-section">
            <h3 className="section-title">🖼️ 이미지 설정</h3>
            <div className="form-group">
              <label className="form-label">배경 이미지</label>
              <input
                className="form-input"
                type="text"
                value={config.backgroundImage}
                onChange={(e) => handleInputChange('backgroundImage', e.target.value)}
                onPaste={handlePaste}
                placeholder="이미지 URL 또는 HTML을 입력하세요"
              />
              <div className="hint">
                💡 최적 권장 사이즈: 1400px × 400px (3.5:1 비율)
              </div>
              {extractedFromHtml && (
                <div className="hint success">
                  ✅ 이미지 HTML에서 URL을 자동으로 추출했습니다!
                </div>
              )}
            </div>
            
            {/* 기본 이미지 선택 */}
            <div className="form-group">
              <label className="form-label">🖼️ 기본 이미지</label>
              <div className="default-images-grid">
                {defaultImages.map((image) => (
                  <button
                    key={image.id}
                    type="button"
                    className={`default-image-button ${config.backgroundImage === image.url ? 'active' : ''}`}
                    onClick={() => handleDefaultImageSelect(image.url)}
                    title={`${image.name} 배경 이미지 적용`}
                  >
                    <img 
                      src={getPreviewImageUrl(image.url)} 
                      alt={image.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                    <span className="image-name">{image.name}</span>
                  </button>
                ))}
              </div>
              <div className="hint">
                💡 클릭하여 미리 준비된 배경 이미지를 선택하세요
              </div>
            </div>
          </div>

          {/* 텍스트 설정 */}
          <div className="settings-section">
            <h3 className="section-title">📝 텍스트 설정</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">왼쪽 텍스트</label>
                <input
                  className="form-input"
                  type="text"
                  value={config.leftText}
                  onChange={(e) => handleInputChange('leftText', e.target.value)}
                  placeholder="왼쪽 텍스트"
                />
              </div>
              <div className="form-group">
                <label className="form-label">오른쪽 텍스트</label>
                <input
                  className="form-input"
                  type="text"
                  value={config.rightText}
                  onChange={(e) => handleInputChange('rightText', e.target.value)}
                  placeholder="오른쪽 텍스트"
                />
              </div>
            </div>
          </div>

          {/* 본문 색상 설정 추가 */}
          <div className="settings-section">
            <h3 className="section-title">🎨 본문 색상 설정</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">본문 배경색</label>
                <input
                  className="color-input"
                  type="color"
                  value={config.contentBackgroundColor && config.contentBackgroundColor.includes('rgba') ? '#fafafa' : config.contentBackgroundColor || '#fafafa'}
                  onChange={(e) => handleInputChange('contentBackgroundColor', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">본문 글자색</label>
                <input
                  className="color-input"
                  type="color"
                  value={config.contentTextColor}
                  onChange={(e) => handleInputChange('contentTextColor', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* 색상 설정 */}
          <div className="settings-section">
            <h3 className="section-title">🎨 색상 설정</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">왼쪽 박스 색상 1</label>
                <input
                  className="color-input"
                  type="color"
                  value={config.leftTextColor1}
                  onChange={(e) => handleInputChange('leftTextColor1', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">왼쪽 박스 색상 2</label>
                <input
                  className="color-input"
                  type="color"
                  value={config.leftTextColor2}
                  onChange={(e) => handleInputChange('leftTextColor2', e.target.value)}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">큰따옴표 색상 1</label>
                <input
                  className="color-input"
                  type="color"
                  value={config.quoteColor1}
                  onChange={(e) => handleInputChange('quoteColor1', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">큰따옴표 색상 2</label>
                <input
                  className="color-input"
                  type="color"
                  value={config.quoteColor2}
                  onChange={(e) => handleInputChange('quoteColor2', e.target.value)}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">작은따옴표 색상</label>
                <input
                  className="color-input"
                  type="color"
                  value={config.singleQuoteColor}
                  onChange={(e) => handleInputChange('singleQuoteColor', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* 스타일 옵션 */}
          <div className="settings-section">
            <h3 className="section-title">✨ 스타일 옵션</h3>
            <div className="checkbox-group">
              <input
                className="checkbox"
                type="checkbox"
                id="quoteColor"
                checked={config.quoteColorEnabled}
                onChange={(e) => handleInputChange('quoteColorEnabled', e.target.checked)}
              />
              <label className="checkbox-label" htmlFor="quoteColor">
                큰따옴표 색상 활성화
              </label>
            </div>
            <div className="checkbox-group">
              <input
                className="checkbox"
                type="checkbox"
                id="quoteGradient"
                checked={config.quoteGradientEnabled}
                onChange={(e) => handleInputChange('quoteGradientEnabled', e.target.checked)}
              />
              <label className="checkbox-label" htmlFor="quoteGradient">
                큰따옴표 그라데이션 효과
              </label>
            </div>
            <div className="checkbox-group">
              <input
                className="checkbox"
                type="checkbox"
                id="boldText"
                checked={config.boldEnabled}
                onChange={(e) => handleInputChange('boldEnabled', e.target.checked)}
              />
              <label className="checkbox-label" htmlFor="boldText">
                큰따옴표 볼드체
              </label>
            </div>
            <div className="checkbox-group">
              <input
                className="checkbox"
                type="checkbox"
                id="singleQuoteItalic"
                checked={config.singleQuoteItalic}
                onChange={(e) => handleInputChange('singleQuoteItalic', e.target.checked)}
              />
              <label className="checkbox-label" htmlFor="singleQuoteItalic">
                작은따옴표 기울기
              </label>
            </div>
            <div className="checkbox-group">
              <input
                className="checkbox"
                type="checkbox"
                id="paragraphIndent"
                checked={config.paragraphIndent}
                onChange={(e) => handleInputChange('paragraphIndent', e.target.checked)}
              />
              <label className="checkbox-label" htmlFor="paragraphIndent">
                문단 들여쓰기
              </label>
            </div>
          </div>

          {/* 본문 텍스트 조절 */}
          <div className="settings-section">
            <h3 className="section-title">📏 본문 텍스트 조절</h3>
            <div className="slider-group">
              <label className="form-label">
                폰트 크기: <span className="slider-value">{config.fontSize}px</span>
              </label>
              <input
                className="slider"
                type="range"
                min="10"
                max="24"
                value={config.fontSize}
                onChange={(e) => handleInputChange('fontSize', parseInt(e.target.value))}
              />
            </div>
            <div className="slider-group">
              <label className="form-label">
                줄 간격: <span className="slider-value">{config.lineHeight}</span>
              </label>
              <input
                className="slider"
                type="range"
                min="1.2"
                max="2.5"
                step="0.1"
                value={config.lineHeight}
                onChange={(e) => handleInputChange('lineHeight', parseFloat(e.target.value))}
              />
            </div>
          </div>

          {/* 단어 교환 - 3줄로 확장 */}
          <div className="settings-section">
            <h3 className="section-title">🔄 단어 교환</h3>
            {config.wordReplacements.map((replacement, index) => (
              <div key={index} className="word-replacement">
                <input
                  className="form-input"
                  type="text"
                  placeholder="변경할 단어"
                  value={replacement.from}
                  onChange={(e) => handleWordReplacementChange(index, 'from', e.target.value)}
                />
                <span className="arrow">→</span>
                <input
                  className="form-input"
                  type="text"
                  placeholder="대체할 단어"
                  value={replacement.to}
                  onChange={(e) => handleWordReplacementChange(index, 'to', e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="preview-panel">
          <div className="preview-header">
            <h3 className="preview-title">👀 미리보기</h3>
          </div>
          
          <div className="preview-container">
            <div dangerouslySetInnerHTML={{ __html: generateHTML() }} />
          </div>
        </div>
      </div>
    </div>
  )
}