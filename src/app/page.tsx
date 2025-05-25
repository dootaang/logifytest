'use client'

import React, { useState, useEffect } from 'react'
import JellyGenerator from '@/generators/JellyGenerator'
import BookmarkletGenerator from '@/generators/BookmarkletGenerator'
import BannerGenerator from '@/generators/BannerGenerator'
import BannerGeneratorV2 from '@/generators/BannerGeneratorV2'
import ChatchanGenerator from '@/generators/ChatchanGenerator'
import BingdunGenerator from '@/generators/BingdunGenerator'
import { useChatchanGeneratorV2 } from '@/generators/ChatchanGeneratorV2'
import ChatchanFormLayout from '@/components/ChatchanFormLayout'
import BingdunFormLayout from '@/components/BingdunFormLayout'
import BookmarkletFormLayout from '@/components/BookmarkletFormLayout'
import BannerFormLayout from '@/components/BannerFormLayout'
import JellyFormLayout from '@/components/JellyFormLayout'
import {
  ModernButton,
  ModernInput,
  ModernTextarea,
  ModernCheckbox,
  ModernColorPicker,
  ModernSlider,
  ModernFormGroup,
  ModernFormRow,
  ModernSection,
  ModernHint,
  ModernDarkModeToggle
} from '@/components/ModernComponents'
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

export default function Home() {
  // 다크모드 감지 함수 (새로운 방식)
  const getSystemTheme = () => {
    return DarkModeUtils.getSystemDarkMode() ? 'dark' : 'light'
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
    selectedTheme: 'light', // 초기값, 나중에 시스템 테마로 업데이트
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

  // 기본 설정값 (전체 앱 설정용)
  const defaultConfig = {
    selectedTheme: 'light', // 초기값, 나중에 시스템 테마로 업데이트
    selectedGenerator: 'jelly'
  }

  // 새로운 배너형 기본 설정
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
    ]
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
      { from: '', to: '' },
      { from: '', to: '' },
      { from: '', to: '' }
    ]
  }

  // 빙둔형 기본 설정
  const defaultBingdunConfig = {
    backgroundImage: '//ac.namu.la/20250524sac/e9f61a7d8296cebf91c7f24993a7dfbb60397526fc1bace99002290ec003210d.png?expires=1748181064&key=OlrYFmy3pBJGG6ALSRNqkQ',
    profileImage: '//ac.namu.la/20250524sac/a1dad3ef01eed80f878d3c3232020367f89ca1b3cce2b29235e3982fdbbf559d.png?expires=1748181064&key=zHAFS2P_g7w71aZW2j51fA',
    leftText: '얼터네이트 헌터즈',
    leftTextColor1: '#ffffff',
    leftTextColor2: '#89D9D8',
    quoteColor1: '#2A4569',
    quoteColor2: '#497AA6',
    quoteColorEnabled: true,
    quoteGradientEnabled: true,
    boldEnabled: false,
    singleQuoteItalic: false,
    singleQuoteColor: '#666666',
    contentBackgroundColor: 'rgba(250, 250, 250, 1)',
    contentTextColor: '#333',
    fontSize: 14,
    lineHeight: 1.75,
    paragraphIndent: false,
    selectedTheme: 'light',
    selectedGenerator: 'bingdun',
    wordReplacements: [
      { from: '', to: '' },
      { from: '', to: '' },
      { from: '', to: '' }
    ],
    content: `서울 헌터 협회 중앙 로비는 낮고 끊임없는 활동 소음으로 웅성거렸다. 한쪽 벽에는 세련된 단말기들이 줄지어 있었고, 대부분의 행인들은 다른 곳에 집중하느라 무시하는, 변동하는 게이트 정보를 표시하고 있었다. 긴장과 기대가 뒤섞인 표정으로 알아볼 수 있는 신규 각성자들은 간단한 서류 양식을 꽉 쥐고, 때때로 보안 복도 아래로 보이는 위압적인 등급 평가실 쪽을 힐끗거렸다. 제복을 입은 협회 직원들은 숙련된 효율성으로 움직였고, 그들의 발걸음은 광택 나는 바닥에 부드럽게 울려 퍼졌다. 에어컨은 넓은 공간을 시원하게 유지했고, 이는 바깥의 습한 여름 공기와 대조를 이루었다.

당신은 등록 및 초기 측정라고 표시된 접수처 앞에 섰다. 그 뒤에는 최유진이 단정한 협회 유니폼을 입고 흠잡을 데 없는 자세로 앉아 있었다. 그녀의 검은 단발머리는 그녀가 지닌 권위에 비해 놀라울 정도로 젊으면서도 전문가적인 얼굴을 감싸고 있었다. 블레이저에 달린 코팅된 ID 배지는 그녀의 이름과 직책(등록 및 평가 팀장)을 확인시켜 주었다.

그녀가 단말기에서 고개를 들자, 그녀의 시선이 당신과 정면으로 마주쳤다. 거기에는 어떤 판단도 없이, 그저 차분하고 전문적인 평가만이 담겨 있었다. 그녀는 약간의 연습된 미소를 지어 보였다.

"헌터 협회에 오신 것을 환영합니다." 최유진이 배경 소음을 쉽게 뚫고 나가는 명료하고 또렷한 목소리로 말문을 열었다. "각성을 축하드립니다. 공식 등급 측정을 진행하기 전에, 헌터 프로필에 기록해야 할 몇 가지 필수 세부 정보가 있습니다. 이는 모든 신규 등록자에게 적용되는 표준 절차입니다."

그녀는 책상 표면에 통합된 세련된 태블릿을 가리켰다. "성함과 연령, 성별을 말씀해 주시겠습니까? 또한, 대략적인 각성 날짜와 시간을 기억하신다면 도움이 될 것입니다. 마지막으로, 현재 보유하고 계신 것으로 파악된 스킬이 있다면 모두 말씀해 주십시오."

최유진은 정보를 입력할 준비를 하며 태블릿 위를 펜으로 가볍게 두드렸다. 그녀는 전문가적인 태도를 잃지 않고 참을성 있게 기다리며, 당신이 생각을 정리하고 헌터로서의 새로운 삶의 첫 공식 단계에 응답할 시간을 주었다.

'마라탕후루 먹고싶다.' 최유진은 마음속으로 생각했다.`,
    tag1Text: '프롬프트',
    tag2Text: '번역',
    tag3Text: '사용 모델',
    tagBackgroundColor: '#f0f0f0',
    tagTextColor: '#666666',
    tagBorderRadius: 20,
    characterDescription: '캐릭터 소개문',
    showCharacterDescription: false,
    designTheme: 'black' as const,
    tagCount: 3,
    tagBorderColor: '#ffffff',
    tagStyle: 'outline' as const,
    hideProfileSection: false
  }



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

  // 제리형 설정 불러오기
  const loadJellyConfig = () => {
    try {
      if (typeof window !== 'undefined') {
        const savedConfig = localStorage.getItem('jellyConfig')
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig)
          return {
            ...defaultJellyConfig,
            ...parsedConfig,
            selectedTheme: getSystemTheme()
          }
        }
      }
      return { ...defaultJellyConfig, selectedTheme: getSystemTheme() }
    } catch (error) {
      console.error('제리형 설정을 불러오는 중 오류 발생:', error)
      return { ...defaultJellyConfig, selectedTheme: getSystemTheme() }
    }
  }

  // 챗챈형 설정 불러오기
  const loadChatchanConfig = () => {
    try {
      if (typeof window !== 'undefined') {
        const savedConfig = localStorage.getItem('chatchanConfig')
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig)
          return {
            ...defaultChatchanConfig,
            ...parsedConfig,
            selectedTheme: getSystemTheme()
          }
        }
      }
      return { ...defaultChatchanConfig, selectedTheme: getSystemTheme() }
    } catch (error) {
      console.error('챗챈 설정을 불러오는 중 오류 발생:', error)
      return { ...defaultChatchanConfig, selectedTheme: getSystemTheme() }
    }
  }

  // 빙둔형 설정 불러오기
  const loadBingdunConfig = () => {
    try {
      if (typeof window !== 'undefined') {
        const savedConfig = localStorage.getItem('bingdunConfig')
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig)
          return {
            ...defaultBingdunConfig,
            ...parsedConfig,
            selectedTheme: getSystemTheme()
          }
        }
      }
      return { ...defaultBingdunConfig, selectedTheme: getSystemTheme() }
    } catch (error) {
      console.error('빙둔 설정을 불러오는 중 오류 발생:', error)
      return { ...defaultBingdunConfig, selectedTheme: getSystemTheme() }
    }
  }

  // 북마클릿형 설정 불러오기
  const loadBookmarkletConfig = () => {
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
        localStorage.setItem('weblogConfig', JSON.stringify(newConfig))
      }
    } catch (error) {
      console.error('설정을 저장하는 중 오류 발생:', error)
    }
  }

  // 제리형 설정 저장하기
  const saveJellyConfig = (newConfig: any) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('jellyConfig', JSON.stringify(newConfig))
      }
    } catch (error) {
      console.error('제리형 설정을 저장하는 중 오류 발생:', error)
    }
  }

  // 챗챈형 설정 저장하기
  const saveChatchanConfig = (newConfig: any) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('chatchanConfig', JSON.stringify(newConfig))
      }
    } catch (error) {
      console.error('챗챈 설정을 저장하는 중 오류 발생:', error)
    }
  }

  // 빙둔형 설정 저장하기
  const saveBingdunConfig = (newConfig: any) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('bingdunConfig', JSON.stringify(newConfig))
      }
    } catch (error) {
      console.error('빙둔 설정을 저장하는 중 오류 발생:', error)
    }
  }

  // 북마클릿형 설정 저장하기
  const saveBookmarkletConfig = (newConfig: any) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('bookmarkletConfig', JSON.stringify(newConfig))
      }
    } catch (error) {
      console.error('북마클릿 설정을 저장하는 중 오류 발생:', error)
    }
  }

  // 배너형 설정 불러오기
  const loadBannerConfig = () => {
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

  // 배너형 설정 저장하기
  const saveBannerConfig = (newConfig: any) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('bannerConfig', JSON.stringify(newConfig))
      }
    } catch (error) {
      console.error('배너 설정을 저장하는 중 오류 발생:', error)
    }
  }

  const [config, setConfig] = useState(defaultConfig)
  const [jellyConfig, setJellyConfig] = useState(defaultJellyConfig)
  const [chatchanConfig, setChatchanConfig] = useState(defaultChatchanConfig)
  const [bingdunConfig, setBingdunConfig] = useState(defaultBingdunConfig)
  const [bookmarkletConfig, setBookmarkletConfig] = useState(defaultBookmarkletConfig)
  const [bannerConfig, setBannerConfig] = useState(defaultBannerConfig)

  const [jellyGeneratedHTML, setJellyGeneratedHTML] = useState('')
  const [chatchanGeneratedHTML, setChatchanGeneratedHTML] = useState('')
  const [bingdunGeneratedHTML, setBingdunGeneratedHTML] = useState('')
  const [bookmarkletGeneratedHTML, setBookmarkletGeneratedHTML] = useState('')
  const [bannerGeneratedHTML, setBannerGeneratedHTML] = useState('')
  const [bannerPreviewHTML, setBannerPreviewHTML] = useState('')

  // 챗챈 생성기 훅
  const { generateHTML: generateChatchanHTML } = useChatchanGeneratorV2(chatchanConfig)

  // 컴포넌트 마운트 후 설정 로드
  useEffect(() => {
    setConfig(loadConfig())
    setJellyConfig(loadJellyConfig())
    setChatchanConfig(loadChatchanConfig())
    setBingdunConfig(loadBingdunConfig())
    setBookmarkletConfig(loadBookmarkletConfig())
    setBannerConfig(loadBannerConfig())
  }, [])

  // 빙둔형 초기 HTML 생성
  useEffect(() => {
    if (bingdunConfig.content) {
      const generator = BingdunGenerator({ config: bingdunConfig })
      const html = generator.generateHTML()
      setBingdunGeneratedHTML(html)
    }
  }, [bingdunConfig.content !== defaultBingdunConfig.content]) // 초기 로드 완료 후에만 실행

  // 북마클릿형 설정이 변경될 때마다 자동 HTML 생성
  useEffect(() => {
    if (config.selectedGenerator === 'bookmarklet') {
      const generator = BookmarkletGenerator({ config: bookmarkletConfig })
      const html = generator.generateHTML()
      setBookmarkletGeneratedHTML(html)
    }
  }, [bookmarkletConfig, config.selectedGenerator])

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

  // 제리형 설정이 변경될 때마다 localStorage에 저장
  useEffect(() => {
    saveJellyConfig(jellyConfig)
  }, [jellyConfig])

  // 챗챈 설정이 변경될 때마다 localStorage에 저장
  useEffect(() => {
    saveChatchanConfig(chatchanConfig)
  }, [chatchanConfig])

  // 빙둔형 설정이 변경될 때마다 localStorage에 저장
  useEffect(() => {
    saveBingdunConfig(bingdunConfig)
  }, [bingdunConfig])

  // 북마클릿형 설정이 변경될 때마다 localStorage에 저장
  useEffect(() => {
    saveBookmarkletConfig(bookmarkletConfig)
  }, [bookmarkletConfig])

  // 배너형 설정이 변경될 때마다 localStorage에 저장
  useEffect(() => {
    saveBannerConfig(bannerConfig)
  }, [bannerConfig])

  // 제리형 설정이 변경될 때마다 자동 HTML 생성
  useEffect(() => {
    if (config.selectedGenerator === 'jelly') {
      const generator = JellyGenerator({ config: jellyConfig })
      const html = generator.generateHTML()
      setJellyGeneratedHTML(html)
    }
  }, [jellyConfig, config.selectedGenerator])

  // 챗챈형 설정이 변경될 때마다 자동 HTML 생성
  useEffect(() => {
    if (config.selectedGenerator === 'chatchan') {
      const html = generateChatchanHTML()
      setChatchanGeneratedHTML(html)
    }
  }, [chatchanConfig, config.selectedGenerator, generateChatchanHTML])

  // 빙둔형 설정이 변경될 때마다 자동 HTML 생성
  useEffect(() => {
    if (config.selectedGenerator === 'bingdun') {
      const generator = BingdunGenerator({ config: bingdunConfig })
      const html = generator.generateHTML()
      setBingdunGeneratedHTML(html)
    }
  }, [bingdunConfig, config.selectedGenerator])

  // 배너형 설정이 변경될 때마다 자동 HTML 생성
  useEffect(() => {
    if (config.selectedGenerator === 'banner') {
      try {
        const generator = BannerGeneratorV2({ config: bannerConfig })
        const html = generator.generateHTML()
        setBannerGeneratedHTML(html)
      } catch (error) {
        console.error('배너형 HTML 생성 오류:', error)
        setBannerGeneratedHTML('<p>HTML 생성 중 오류가 발생했습니다.</p>')
      }
    }
  }, [bannerConfig, config.selectedGenerator])

  // 이미지 HTML에서 URL 추출하는 함수 (배너형에서만 사용)
  const extractImageUrlFromHtml = (htmlString: string) => {
    const imgTagRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/i
    const match = htmlString.match(imgTagRegex)
    
    if (match && match[1]) {
      return match[1]
    }
    
    return htmlString
  }

  // 입력값이 HTML인지 확인하는 함수 (배너형에서만 사용)
  const isHtmlImageTag = (input: string) => {
    return input.includes('<img') && input.includes('src=')
  }

  // 테마 변경 함수
  const handleThemeChange = (themeId: string) => {
    setConfig(prev => ({
      ...prev,
      selectedTheme: themeId
    }))
  }



  const handleGeneratorChange = (generatorType: string) => {
    setConfig(prev => ({
      ...prev,
      selectedGenerator: generatorType
    }))
  }

  // 제리형 핸들러 함수들
  const handleJellyConfigChange = (newConfig: Partial<typeof defaultJellyConfig>) => {
    setJellyConfig(prev => ({
      ...prev,
      ...newConfig
    }))
  }

  const handleJellyGenerateHTML = () => {
    const generator = JellyGenerator({ config: jellyConfig })
    const html = generator.generateHTML()
    setJellyGeneratedHTML(html)
  }

  const handleJellyCopyHTML = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(jellyGeneratedHTML).then(() => {
        alert('제리형 HTML 코드가 클립보드에 복사되었습니다!')
      })
    }
  }

  const handleJellyReset = () => {
    if (typeof window !== 'undefined' && confirm('제리형 설정을 기본값으로 초기화하시겠습니까?')) {
      setJellyConfig({ ...defaultJellyConfig, selectedTheme: getSystemTheme() })
      setJellyGeneratedHTML('')
    }
  }

  // 챗챈형 핸들러 함수들 추가
  const handleChatchanConfigChange = (newConfig: Partial<typeof defaultChatchanConfig>) => {
    setChatchanConfig(prev => ({
      ...prev,
      ...newConfig
    }))
  }

  const handleChatchanGenerateHTML = () => {
    const html = generateChatchanHTML()
    setChatchanGeneratedHTML(html)
  }

  const handleChatchanCopyHTML = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(chatchanGeneratedHTML).then(() => {
        alert('챗챈형 HTML 코드가 클립보드에 복사되었습니다!')
      })
    }
  }

  const handleChatchanReset = () => {
    if (typeof window !== 'undefined' && confirm('챗챈형 설정을 기본값으로 초기화하시겠습니까?')) {
      setChatchanConfig({ ...defaultChatchanConfig, selectedTheme: getSystemTheme() })
      setChatchanGeneratedHTML('')
    }
  }

  // 빙둔형 핸들러 함수들
  const handleBingdunConfigChange = (newConfig: any) => {
    setBingdunConfig(prev => ({
      ...prev,
      ...newConfig
    }))
  }

  const handleBingdunGenerateHTML = () => {
    const generator = BingdunGenerator({ config: bingdunConfig })
    const html = generator.generateHTML()
    setBingdunGeneratedHTML(html)
  }

  const handleBingdunCopyHTML = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(bingdunGeneratedHTML).then(() => {
        alert('빙둔형 HTML 코드가 클립보드에 복사되었습니다!')
      })
    }
  }

  const handleBingdunReset = () => {
    if (typeof window !== 'undefined' && confirm('빙둔형 설정을 기본값으로 초기화하시겠습니까?')) {
      setBingdunConfig({ ...defaultBingdunConfig, selectedTheme: getSystemTheme() })
      setBingdunGeneratedHTML('')
    }
  }

  // 북마클릿형 핸들러 함수들
  const handleBookmarkletConfigChange = (newConfig: Partial<typeof defaultBookmarkletConfig>) => {
    setBookmarkletConfig(prev => ({
      ...prev,
      ...newConfig
    }))
  }

  const handleBookmarkletGenerateHTML = () => {
    const generator = BookmarkletGenerator({ config: bookmarkletConfig })
    const html = generator.generateHTML()
    setBookmarkletGeneratedHTML(html)
  }

  const handleBookmarkletCopyHTML = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(bookmarkletGeneratedHTML).then(() => {
        alert('북마클릿형 HTML 코드가 클립보드에 복사되었습니다!')
      })
    }
  }

  const handleBookmarkletReset = () => {
    if (typeof window !== 'undefined' && confirm('북마클릿형 설정을 기본값으로 초기화하시겠습니까?')) {
      setBookmarkletConfig({ ...defaultBookmarkletConfig })
      setBookmarkletGeneratedHTML('')
    }
  }

  // 배너형 핸들러 함수들
  const handleBannerConfigChange = (newConfig: Partial<typeof defaultBannerConfig>) => {
    // 이미지 URL 필드에 대한 HTML 파싱 처리
    if (newConfig.imageUrl && typeof newConfig.imageUrl === 'string') {
      if (isHtmlImageTag(newConfig.imageUrl)) {
        newConfig.imageUrl = extractImageUrlFromHtml(newConfig.imageUrl)
      }
    }
    
    setBannerConfig(prev => ({
      ...prev,
      ...newConfig
    }))
  }

  const handleBannerGenerateHTML = () => {
    const generator = BannerGeneratorV2({ config: bannerConfig })
    const html = generator.generateHTML()
    setBannerGeneratedHTML(html)
  }

  const handleBannerCopyHTML = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(bannerGeneratedHTML).then(() => {
        alert('배너형 HTML 코드가 클립보드에 복사되었습니다!')
      })
    }
  }

  const handleBannerReset = () => {
    if (typeof window !== 'undefined' && confirm('배너형 설정을 기본값으로 초기화하시겠습니까?')) {
      setBannerConfig({ ...defaultBannerConfig })
      setBannerGeneratedHTML('')
    }
  }

  return (
    <div className="container">
      {/* 로그제조기 타입 선택기 - 모든 상황에서 표시 */}
      <div className="header">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div>
            <h1>로그제조기 올인원</h1>
            <p>모든 설정을 한 곳에서 관리하는 스마트 웹로그 생성기</p>
          </div>
          <ModernDarkModeToggle />
        </div>
        
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

      {/* 선택된 제너레이터에 따라 전용 레이아웃 렌더링 */}
      {config.selectedGenerator === 'jelly' ? (
        <JellyFormLayout
          config={jellyConfig}
          onConfigChange={handleJellyConfigChange}
          generatedHTML={jellyGeneratedHTML}
          onGenerateHTML={handleJellyGenerateHTML}
          onCopyHTML={handleJellyCopyHTML}
          onReset={handleJellyReset}
        />
      ) : config.selectedGenerator === 'chatchan' ? (
        <ChatchanFormLayout
          config={chatchanConfig}
          onConfigChange={handleChatchanConfigChange}
          generatedHTML={chatchanGeneratedHTML}
          onGenerateHTML={handleChatchanGenerateHTML}
          onCopyHTML={handleChatchanCopyHTML}
          onReset={handleChatchanReset}
        />
      ) : config.selectedGenerator === 'bingdun' ? (
        <BingdunFormLayout
          config={bingdunConfig}
          onConfigChange={handleBingdunConfigChange}
          generatedHTML={bingdunGeneratedHTML}
          onGenerateHTML={handleBingdunGenerateHTML}
          onCopyHTML={handleBingdunCopyHTML}
          onReset={handleBingdunReset}
        />
      ) : config.selectedGenerator === 'bookmarklet' ? (
        <BookmarkletFormLayout
          config={bookmarkletConfig}
          onConfigChange={handleBookmarkletConfigChange}
          generatedHTML={bookmarkletGeneratedHTML}
          onGenerateHTML={handleBookmarkletGenerateHTML}
          onCopyHTML={handleBookmarkletCopyHTML}
          onReset={handleBookmarkletReset}
        />
      ) : config.selectedGenerator === 'banner' ? (
        <BannerFormLayout
          config={bannerConfig}
          onConfigChange={handleBannerConfigChange}
          generatedHTML={bannerGeneratedHTML}
          onGenerateHTML={handleBannerGenerateHTML}
          onCopyHTML={handleBannerCopyHTML}
          onReset={handleBannerReset}
        />
      ) : (
        <div>
          <p>알 수 없는 생성기가 선택되었습니다.</p>
        </div>
      )}
    </div>
  )
} 