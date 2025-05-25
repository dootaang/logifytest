'use client'

import React from 'react'

// 뷰익형 설정 인터페이스
export interface ViewextConfig {
  content: string
  characterName: string
  userName: string
  colorTheme: string
  layoutType: 'vertical' | 'horizontal'
  showImages: boolean
  fontFamily: string
  letterSpacing: number
  lineHeight: number
  enableScroll: boolean
  enableFoldToggle: boolean
  characterImageUrl?: string
  userImageUrl?: string
}

interface ViewextGeneratorProps {
  config: ViewextConfig
}

// 뷰익.html에서 추출한 정확한 컬러 테마 정의
export const COLOR_THEMES = {
  'oldmoney-normal': {
    name: '올드머니 - 일반',
    className: 'oldmoney-normal-char'
  },
  'oldmoney-dark': {
    name: '올드머니 - 다크',
    className: 'oldmoney-dark-char'
  },
  'vintage-vanilla-light': {
    name: '빈티지 바닐라 - 라이트',
    className: 'vintage-vanilla-light'
  },
  'vintage-vanilla-dark': {
    name: '빈티지 바닐라 - 다크',
    className: 'vintage-vanilla-dark'
  },
  'carbonic-pure-light': {
    name: '카보닉 퓨어 - 라이트',
    className: 'carbonic-pure-light'
  },
  'carbonic-pure-dark': {
    name: '카보닉 퓨어 - 다크',
    className: 'carbonic-pure-dark'
  },
  'b5-white-navy-light': {
    name: 'B5 화이트 & 네이비 - 라이트',
    className: 'b5-white-navy-light'
  },
  'b5-white-navy-dark': {
    name: 'B5 화이트 & 네이비 - 다크',
    className: 'b5-white-navy-dark'
  },
  'spring-memory': {
    name: '봄의 추억',
    className: 'spring-memory'
  },
  'cyberpunk-theme': {
    name: '사이버펑크',
    className: 'cyberpunk-theme'
  },
  'classic-ivory': {
    name: '클래식 아이보리',
    className: 'classic-ivory'
  },
  'metallic-gray': {
    name: '메탈릭 그레이',
    className: 'metallic-gray'
  },
  'baby-pink-light': {
    name: '베이비 핑크 라이트',
    className: 'baby-pink-light'
  },
  'luxury-gold': {
    name: '럭셔리 골드',
    className: 'luxury-gold'
  },
  'sports-blue': {
    name: '스포츠 블루',
    className: 'sports-blue'
  }
}

// 폰트 옵션
export const FONT_OPTIONS = [
  { value: 'Pretendard Variable', name: '프리텐다드' },
  { value: 'NanumSquare', name: '나눔스퀘어' },
  { value: '나눔스퀘어네오', name: '나눔스퀘어네오' },
  { value: '에스코어드림', name: '에스코어드림' },
  { value: '레페리포인트', name: '레페리포인트' },
  { value: '플렉스', name: 'IBM 플렉스' },
  { value: '스위트', name: '스위트' },
  { value: '오르빗', name: '오르빗' },
  { value: '스쿨오르빗', name: '학교안심 우주' },
  { value: '프리티나잇', name: '카페24 원나잇' },
  { value: '서라운드에어', name: '카페24 서라운드' },
  { value: '고운돋움', name: '고운돋움' },
  { value: '고운바탕', name: '고운바탕' },
  { value: '리디바탕', name: '리디바탕' },
  { value: '마루부리', name: '마루부리' },
  { value: '도스고딕', name: 'DOS고딕' },
  { value: '스타더스트', name: '스타더스트' },
  { value: '픽시드시스', name: '둥근모' },
  { value: '네오둥근모', name: '네오둥근모' }
]

export default function ViewextGenerator({ config }: ViewextGeneratorProps) {
  const generateHTML = (): string => {
    const theme = COLOR_THEMES[config.colorTheme as keyof typeof COLOR_THEMES] || COLOR_THEMES['oldmoney-normal']
    
    // 테마별 인라인 스타일 정의
    const getThemeStyles = (themeKey: string) => {
      const themes: { [key: string]: any } = {
        'oldmoney-normal-char': {
          background: 'radial-gradient(circle at 20% 30%, rgb(246, 242, 233) 20%, #f0e9d9 50%)',
          headerColor: '#6b4c35',
          textColor: '#61583f',
          emColor: '#8b1a1a',
          strongColor: '#2b3629',
          borderColor: '#2a3c2d'
        },
        'oldmoney-dark-char': {
          background: 'radial-gradient(circle at 10% 20%, rgb(20, 30, 35) 20%, #0f1a20 70%)',
          headerColor: '#8a795d',
          textColor: '#a08e6c',
          emColor: '#aa7b5c',
          strongColor: '#bf9f6f',
          borderColor: '#1c352d'
        },
        'vintage-vanilla-light': {
          background: '#ddd6ce',
          headerColor: '#3c676e',
          textColor: '#948d85',
          emColor: '#c57b64',
          strongColor: '#c57b64',
          borderColor: '#948d85'
        },
        'vintage-vanilla-dark': {
          background: '#49686d',
          headerColor: '#ffe8d1',
          textColor: '#b9af9e',
          emColor: '#ffce83',
          strongColor: '#ffce83',
          borderColor: '#ffffff40'
        },
        'carbonic-pure-light': {
          background: 'radial-gradient(#ececed, #cbc7c7)',
          headerColor: '#333437',
          textColor: '#707070',
          emColor: '#57975c',
          strongColor: '#57975c',
          borderColor: '#858585'
        },
        'carbonic-pure-dark': {
          background: 'radial-gradient(#252525, #202020)',
          headerColor: '#f3f3f3',
          textColor: '#959595',
          emColor: '#ffaa80',
          strongColor: '#ffaa80',
          borderColor: '#898989'
        },
        'b5-white-navy-light': {
          background: 'radial-gradient(circle at 20% 30%, rgb(251, 248, 239) 20%, #FFFFFF 50%)',
          headerColor: '#2C3E50',
          textColor: '#333333',
          emColor: '#0d5977',
          strongColor: '#34495E',
          borderColor: '#BDC3C7'
        },
        'b5-white-navy-dark': {
          background: 'radial-gradient(circle at 10% 20%, rgb(11, 25, 44) 20%, #1A1A1A 70%)',
          headerColor: '#a1a1a1',
          textColor: '#958b8b',
          emColor: '#98925e',
          strongColor: '#973131',
          borderColor: '#481E14'
        },
        'spring-memory': {
          background: 'linear-gradient(135deg, #FFF8F8 0%, #FFFFFF 100%)',
          headerColor: '#FF8BA8',
          textColor: '#333333',
          emColor: '#FFB5C4',
          strongColor: '#FF5F85',
          borderColor: '#FFB5C4'
        },
        'cyberpunk-theme': {
          background: 'radial-gradient(circle at 10% 20%, #080C25 20%, #151425 70%)',
          headerColor: '#FFFF00',
          textColor: '#80E0FF',
          emColor: '#FF00FF',
          strongColor: '#FFFF00',
          borderColor: '#00D6FF'
        },
        'classic-ivory': {
          background: 'linear-gradient(135deg, #b5b1a8 0%, #F8F6F0 10%, #F8F6F0 50%, #E5E1D4 80%, #b5b1a8 100%)',
          headerColor: '#5A5445',
          textColor: '#5A5649',
          emColor: '#5A5445',
          strongColor: '#5A5445',
          borderColor: '#5A5445'
        },
        'metallic-gray': {
          background: 'radial-gradient(circle at center, #222222 0%, #1A1A1A 70%, #161616 100%)',
          headerColor: '#DDDDDD',
          textColor: '#A0A0A0',
          emColor: '#DDDDDD',
          strongColor: '#DDDDDD',
          borderColor: '#898989'
        },
        'baby-pink-light': {
          background: 'linear-gradient(135deg, #f5ebff 0%, #ffecf5 25%, #fffbe8 80%, #fffbe8 100%)',
          headerColor: '#ffb6c1',
          textColor: '#86777b',
          emColor: '#ffb6c1',
          strongColor: '#ffb6c1',
          borderColor: '#ffb6c1'
        },
        'luxury-gold': {
          background: 'radial-gradient(circle at center, #272420 0%, #201d18 70%, #1a1814 100%)',
          headerColor: '#ffd700',
          textColor: '#b3a989',
          emColor: '#ffd700',
          strongColor: '#ffd700',
          borderColor: '#ffd700'
        },
        'sports-blue': {
          background: 'linear-gradient(135deg, #12285A 0%, #081224 100%)',
          headerColor: '#FFB829',
          textColor: '#DCD5BE',
          emColor: '#FFB829',
          strongColor: '#FFB829',
          borderColor: '#FFB829'
        }
      }
      
      return themes[themeKey] || themes['oldmoney-normal-char']
    }

    // 이미지 URL 정규화 (배너형 생성기에서 가져옴)
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

    // 메시지 박스 생성 함수
    const createMessageBox = (speakerName: string, message: string, themeStyle: any, imageUrl?: string) => {
      const processedMessage = processTextFormatting(message, themeStyle)
      const finalImageUrl = normalizeImageUrl(imageUrl || '')
      
      // 가로형 레이아웃 (이미지 포함)
      if (config.layoutType === 'horizontal' && config.showImages && finalImageUrl) {
        return `
<div style="margin: 1rem auto 0.5rem auto; padding: 1rem 2rem 0.1rem 2rem; max-width: 55rem; border-radius: 1rem; box-shadow: 0 0 2rem rgba(0, 0, 0, 0.25); background: ${themeStyle.background}; line-height: 1.5; font-family: '${config.fontFamily}', 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif; letter-spacing: ${config.letterSpacing}rem;">
  <div style="margin: 0 auto 0.7rem auto; text-align: center;">
    <div style="margin-bottom: 1rem;">
      <span style="background: ${themeStyle.background}; padding: 0 1.5rem; font-size: 1.2rem; font-weight: bold; color: ${themeStyle.headerColor}; text-transform: uppercase; letter-spacing: 5px;">${speakerName}</span>
    </div>
    <div style="border-top: 1px solid ${themeStyle.borderColor}; width: 100%; margin-top: -0.8rem;"></div>
  </div>
  
  <!-- 가로형 레이아웃: 이미지 + 텍스트 -->
  <div style="display: flex; gap: 1.5rem; align-items: flex-start; margin-bottom: 1rem;">
    <!-- 좌측 이미지 -->
    <div style="flex-shrink: 0;">
      <img src="${finalImageUrl}" style="width: 120px; height: 120px; border-radius: 8px; object-fit: cover; box-shadow: 0 2px 8px rgba(0,0,0,0.2);" alt="${speakerName}">
    </div>
    
    <!-- 구분선 -->
    <div style="width: 1px; background: ${themeStyle.borderColor}; flex-shrink: 0; align-self: stretch; margin: 0.5rem 0;"></div>
    
    <!-- 우측 텍스트 -->
    <div style="flex: 1; padding: 0 0.7rem;">
      <p style="color: ${themeStyle.textColor}; margin: 0.5rem 0;">${processedMessage}</p>
    </div>
  </div>
</div>`
      }
      
      // 세로형 레이아웃 (기본)
      return `
<div style="margin: 1rem auto 0.5rem auto; padding: 1rem 2rem 0.1rem 2rem; max-width: 55rem; border-radius: 1rem; box-shadow: 0 0 2rem rgba(0, 0, 0, 0.25); background: ${themeStyle.background}; line-height: 1.5; font-family: '${config.fontFamily}', 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif; letter-spacing: ${config.letterSpacing}rem;">
  <div style="margin: 0 auto 0.7rem auto; text-align: center;">
    <div style="margin-bottom: 1rem;">
      <span style="background: ${themeStyle.background}; padding: 0 1.5rem; font-size: 1.2rem; font-weight: bold; color: ${themeStyle.headerColor}; text-transform: uppercase; letter-spacing: 5px;">${speakerName}</span>
    </div>
    <div style="border-top: 1px solid ${themeStyle.borderColor}; width: 100%; margin-top: -0.8rem;"></div>
  </div>
  <div style="margin-bottom: 1rem; padding: 0 0.7rem;">
    <p style="color: ${themeStyle.textColor}; margin: 0.5rem 0;">${processedMessage}</p>
  </div>
</div>`
    }

    // 텍스트 파싱 및 HTML 생성 (인라인 스타일 적용)
    const parseContent = () => {
      const lines = config.content.split('\n').filter(line => line.trim())
      let html = ''
      const themeStyle = getThemeStyles(theme.className)
      
      for (const line of lines) {
        const trimmedLine = line.trim()
        
        // 캐릭터 메시지 감지
        if (trimmedLine.startsWith(`${config.characterName}:`)) {
          const message = trimmedLine.substring(config.characterName.length + 1).trim()
          html += createMessageBox(config.characterName, message, themeStyle, config.characterImageUrl)
        }
        // 사용자 메시지 감지
        else if (trimmedLine.startsWith(`${config.userName}:`)) {
          const message = trimmedLine.substring(config.userName.length + 1).trim()
          html += createMessageBox(config.userName, message, themeStyle, config.userImageUrl)
        }
        // 일반 텍스트 (이전 메시지에 추가)
        else if (trimmedLine) {
          const processedMessage = processTextFormatting(trimmedLine, themeStyle)
          html += `<p style="color: ${themeStyle.textColor}; margin: 0.5rem 0;">${processedMessage}</p>`
        }
      }
      
      return html
    }

    // 텍스트 포맷팅 처리 (볼드, 이탤릭 등) - 인라인 스타일 적용
    const processTextFormatting = (text: string, themeStyle: any): string => {
      return text
        .replace(/\*\*(.*?)\*\*/g, `<strong style="color: ${themeStyle.strongColor}; font-weight: bold;">$1</strong>`)  // **볼드**
        .replace(/\*(.*?)\*/g, `<em style="color: ${themeStyle.emColor}; font-weight: 500; font-style: italic;">$1</em>`)              // *이탤릭*
        .replace(/__(.*?)__/g, `<strong style="color: ${themeStyle.strongColor}; font-weight: bold;">$1</strong>`)      // __볼드__
        .replace(/_(.*?)_/g, `<em style="color: ${themeStyle.emColor}; font-weight: 500; font-style: italic;">$1</em>`)                // _이탤릭_
    }

    // 최종 HTML 생성 (인라인 스타일만 사용) - 외부 컨테이너 제거
    return parseContent()
  }

  return {
    generateHTML
  }
}

 