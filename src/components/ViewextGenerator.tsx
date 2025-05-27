'use client'

import React from 'react'

interface WordReplacement {
  from: string;
  to: string;
}

// 새로운 뷰익형 설정 인터페이스 (제공된 HTML 구조 기반)
export interface ViewextConfig {
  // 기본 콘텐츠
  content: string
  title: string
  
  // 이미지 설정
  mainImageUrl: string
  showMainImage: boolean
  imageMaxWidth: number
  
  // 색상 및 스타일 설정
  backgroundColor: string
  backgroundGradient: string
  titleColor: string
  textColor: string
  borderColor: string
  
  // 하이라이트 박스 설정
  highlightBoxColor: string
  highlightBoxBorderColor: string
  highlightBoxTextColor: string
  
  // 대화 박스 설정
  dialogueBoxColor: string
  dialogueBoxBorderColor: string
  dialogueBoxTextColor: string
  
  // 폰트 설정
  fontFamily: string
  fontSize: number
  lineHeight: number
  letterSpacing: number
  
  // 레이아웃 설정
  maxWidth: number
  paddingTop: number
  paddingRight: number
  paddingBottom: number
  paddingLeft: number
  borderRadius: number
  shadowBlur: number
  shadowSpread: number
  
  // 고급 설정
  enableCustomCSS: boolean
  customCSS: string
  
  // 단어 변환 기능
  wordReplacements: WordReplacement[]
}

interface ViewextGeneratorProps {
  config: ViewextConfig
}

// 프리셋 테마 정의
export const PRESET_THEMES = {
  'alternate-hunters': {
    name: 'Alternate Hunters (기본)',
    backgroundColor: 'radial-gradient(circle at 10% 20%, rgb(20, 30, 35) 20%, #0f1a20 70%)',
    titleColor: '#b8a576',
    textColor: '#b5a382',
    borderColor: '#1c352d',
    highlightBoxColor: 'rgba(107, 182, 255, 0.1)',
    highlightBoxBorderColor: '#6bb6ff',
    highlightBoxTextColor: '#6bb6ff',
    dialogueBoxColor: 'rgba(138, 121, 93, 0.1)',
    dialogueBoxBorderColor: '#8a795d',
    dialogueBoxTextColor: '#f1c40f'
  },
  'light-theme': {
    name: '라이트 테마',
    backgroundColor: 'radial-gradient(circle at 20% 30%, rgb(246, 242, 233) 20%, #f0e9d9 50%)',
    titleColor: '#6b4c35',
    textColor: '#61583f',
    borderColor: '#2a3c2d',
    highlightBoxColor: 'rgba(107, 182, 255, 0.1)',
    highlightBoxBorderColor: '#6bb6ff',
    highlightBoxTextColor: '#6bb6ff',
    dialogueBoxColor: 'rgba(138, 121, 93, 0.1)',
    dialogueBoxBorderColor: '#8a795d',
    dialogueBoxTextColor: '#8b1a1a'
  },
  'cyberpunk': {
    name: '사이버펑크',
    backgroundColor: 'radial-gradient(circle at 10% 20%, #080C25 20%, #151425 70%)',
    titleColor: '#FFFF00',
    textColor: '#80E0FF',
    borderColor: '#00D6FF',
    highlightBoxColor: 'rgba(255, 0, 255, 0.1)',
    highlightBoxBorderColor: '#FF00FF',
    highlightBoxTextColor: '#FF00FF',
    dialogueBoxColor: 'rgba(255, 255, 0, 0.1)',
    dialogueBoxBorderColor: '#FFFF00',
    dialogueBoxTextColor: '#FFFF00'
  },
  'vintage': {
    name: '빈티지',
    backgroundColor: '#ddd6ce',
    titleColor: '#3c676e',
    textColor: '#948d85',
    borderColor: '#948d85',
    highlightBoxColor: 'rgba(60, 103, 110, 0.1)',
    highlightBoxBorderColor: '#3c676e',
    highlightBoxTextColor: '#3c676e',
    dialogueBoxColor: 'rgba(197, 123, 100, 0.1)',
    dialogueBoxBorderColor: '#c57b64',
    dialogueBoxTextColor: '#c57b64'
  }
}

// 폰트 옵션
export const FONT_OPTIONS = [
  { value: 'Pretendard Variable', name: '프리텐다드' },
  { value: 'NanumSquare', name: '나눔스퀘어' },
  { value: '나눔스퀘어네오', name: '나눔스퀘어네오' },
  { value: '에스코어드림', name: '에스코어드림' },
  { value: '레페리포인트', name: '레페리포인트' },
  { value: 'IBM Plex Sans KR', name: 'IBM 플렉스' },
  { value: 'Noto Sans KR', name: '노토 산스' },
  { value: 'Spoqa Han Sans Neo', name: '스포카 한 산스' }
]

export default function ViewextGenerator({ config }: ViewextGeneratorProps) {
  
  // 이미지 URL 정규화 (배너형 생성기에서 이식)
  const normalizeImageUrl = (url: string) => {
    if (!url) return ''
    // 데이터 URL (base64)은 그대로 사용
    if (url.startsWith('data:')) {
      return url
    }
    // 아카라이브 이미지 URL (//ac-p1.namu.la 또는 //ac.namu.la)은 원본 형태 유지
    if (url.startsWith('//') && (url.includes('ac-p1.namu.la') || url.includes('ac.namu.la'))) {
      return url  // 아카라이브 URL은 원본 형태 그대로 사용
    }
    // 기타 절대 URL (//로 시작)은 https 프로토콜 추가
    if (url.startsWith('//')) {
      return 'https:' + url
    }
    // 상대 경로 (/uploads/...)는 현재 호스트 기준으로 변환
    if (url.startsWith('/uploads/')) {
      // 개발환경에서는 localhost 사용
      if (typeof window !== 'undefined') {
        return window.location.protocol + '//' + window.location.host + url
      }
      return 'http://localhost:3000' + url
    }
    // http/https가 없으면 https 추가
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url
    }
    return url
  }

  // 미리보기용 이미지 URL 생성 (CORS 우회를 위한 프록시 사용)
  const getPreviewImageUrl = (url: string): string => {
    const normalizedUrl = normalizeImageUrl(url);
    
    // 데이터 URL (base64)은 그대로 사용
    if (normalizedUrl.startsWith('data:')) {
      return normalizedUrl;
    }
    
    // 로컬 업로드 이미지는 직접 사용 (CORS 문제 없음)
    if (normalizedUrl.includes('/uploads/')) {
      return normalizedUrl;
    }
    
    // 아카라이브 이미지인 경우 프록시를 통해 로드
    if (normalizedUrl.includes('ac-p1.namu.la') || normalizedUrl.includes('ac.namu.la')) {
      // //로 시작하는 아카라이브 URL은 https: 프로토콜을 추가해서 프록시에 전달
      const fullUrl = normalizedUrl.startsWith('//') ? 'https:' + normalizedUrl : normalizedUrl;
      return `https://images.weserv.nl/?url=${encodeURIComponent(fullUrl)}`;
    }
    
    // 기타 외부 이미지도 프록시를 통해 로드 (CORS 우회)
    return `https://images.weserv.nl/?url=${encodeURIComponent(normalizedUrl)}`;
  };

  // 단어 변환 기능 (제리형에서 이식)
  const applyWordReplacements = (text: string) => {
    let processedText = text
    config.wordReplacements.forEach(replacement => {
      if (replacement.from && replacement.to) {
        processedText = processedText.replace(new RegExp(replacement.from, 'g'), replacement.to)
      }
    })
    return processedText
  }

  // 텍스트 포맷팅 처리
  const processTextFormatting = (text: string): string => {
    let result = text;
    
    // 임시 플레이스홀더를 사용하여 충돌 방지
    const SINGLE_QUOTE_PLACEHOLDER = '___SINGLE_QUOTE_PLACEHOLDER___';
    const DOUBLE_QUOTE_PLACEHOLDER = '___DOUBLE_QUOTE_PLACEHOLDER___';
    
    // 1. 작은따옴표 처리: '텍스트' → 임시 플레이스홀더로 변환
    result = result.replace(/'([^']+)'/g, `${SINGLE_QUOTE_PLACEHOLDER}$1${SINGLE_QUOTE_PLACEHOLDER}`);
    
    // 2. 큰따옴표 처리: "텍스트" → 임시 플레이스홀더로 변환
    result = result.replace(/"([^"]+)"/g, `${DOUBLE_QUOTE_PLACEHOLDER}$1${DOUBLE_QUOTE_PLACEHOLDER}`);
    
    // 3. 임시 플레이스홀더를 실제 HTML로 변환 (큰따옴표 방식과 동일하게 따옴표 유지)
    result = result.replace(new RegExp(`${SINGLE_QUOTE_PLACEHOLDER}([^${SINGLE_QUOTE_PLACEHOLDER}]+)${SINGLE_QUOTE_PLACEHOLDER}`, 'g'), 
      `<span style="background:${config.highlightBoxColor};border-left:3px solid ${config.highlightBoxBorderColor};padding:0.3rem 0.8rem;border-radius:0 0.4rem 0.4rem 0;display:inline-block;color:${config.highlightBoxTextColor};font-weight:bold;">'$1'</span>`);
    
    result = result.replace(new RegExp(`${DOUBLE_QUOTE_PLACEHOLDER}([^${DOUBLE_QUOTE_PLACEHOLDER}]+)${DOUBLE_QUOTE_PLACEHOLDER}`, 'g'), 
      `<span style="background:${config.dialogueBoxColor};border-left:3px solid ${config.dialogueBoxBorderColor};padding:0.5rem 1rem;border-radius:0 0.5rem 0.5rem 0;display:inline-block;color:${config.dialogueBoxTextColor};font-weight:bold;">"$1"</span>`);
    
    // 4. 볼드 처리: **텍스트**
    result = result.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight:bold;">$1</strong>');
    
    // 5. 이탤릭 처리: *텍스트*
    result = result.replace(/\*(.*?)\*/g, '<em style="font-style:italic;">$1</em>');
    
    return result;
  }

  // HTML 생성 함수
  const generateHTML = (): string => {
    const finalImageUrl = normalizeImageUrl(config.mainImageUrl)
    
    // 단어 변환 적용
    const processedContent = applyWordReplacements(config.content)
    
    // 콘텐츠를 줄바꿈 기준으로 처리 (원문의 줄바꿈 유지)
    const lines = processedContent.split('\n')
    
    // 줄들을 HTML로 변환
    const contentHTML = lines.map(line => {
      if (line.trim() === '') {
        // 빈 줄은 빈 문자열로 처리 (join에서 <br>이 추가됨)
        return ''
      } else {
        // 텍스트가 있는 줄은 포맷팅 적용
        const processedText = processTextFormatting(line.trim())
        return `<span style="color:${config.textColor};font-size:${config.fontSize}px;line-height:${config.lineHeight};">${processedText}</span>`
      }
    }).join('<br>\n\t\t')

    // 패딩과 그림자 CSS 생성
    const paddingCSS = `${config.paddingTop}rem ${config.paddingRight}rem ${config.paddingBottom}rem ${config.paddingLeft}rem`
    const shadowCSS = `0 0 ${config.shadowBlur}rem ${config.shadowSpread}rem rgba(0, 0, 0, 0.25)`

    // 메인 HTML 구조 생성
    const html = `
<p><br></p>
<p><br></p>

<div style="margin:1rem auto 0.5rem auto;padding:${paddingCSS};max-width:${config.maxWidth}rem;border-radius:${config.borderRadius}rem;box-shadow:${shadowCSS};background:${config.backgroundColor};line-height:${config.lineHeight};font-family:'${config.fontFamily}', 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;letter-spacing:${config.letterSpacing}rem;">
\t<div style="margin:0 auto 0.7rem auto;text-align:center;">
\t\t<div style="margin-bottom:1rem;">
\t\t\t<span style="background:${config.backgroundColor};padding:0 1.5rem;font-size:1.2rem;font-weight:bold;color:${config.titleColor};text-transform:uppercase;letter-spacing:5px;">${config.title}</span>
\t\t</div>
\t\t<div style="border-top:1px solid ${config.borderColor};width:100%;margin-top:-0.8rem;">
\t\t\t<br>
\t\t</div>
\t</div>
\t
${config.showMainImage && finalImageUrl ? `\t<div style="margin-bottom:1rem;padding:0 0.7rem;text-align:center;">
\t\t<div style="max-width:${config.imageMaxWidth}px;margin:0 auto;">
\t\t\t<img style="max-width:100%;border-radius:12px;" src="${finalImageUrl}" alt="main-image" class="fr-fic fr-dii">
\t\t</div>
\t</div>
\t
` : ''}\t<div style="margin:1rem 0.7rem;display:flex;">
\t\t<div style="height:1px;background:linear-gradient(to right, transparent, #d4af37);">
\t\t\t<br>
\t\t</div>
\t\t<div style="width:20px;">
\t\t\t<br>
\t\t</div>
\t\t<div style="height:1px;background:linear-gradient(to left, transparent, #d4af37);">
\t\t\t<br>
\t\t</div>
\t</div>
\t
\t<div style="margin-bottom:1.5rem;padding:0 0.7rem;">
\t\t${contentHTML}
\t</div>
\t
\t<div style="margin:0.5rem 0.7rem 0.2rem 0.7rem;padding-top:0.8rem;border-top:1px solid ${config.borderColor};text-align:center;">
\t\t<br>
\t</div>
</div>

<p><br></p>
<p><br></p>`

    // 커스텀 CSS가 활성화된 경우 추가
    if (config.enableCustomCSS && config.customCSS) {
      return `<style>\n${config.customCSS}\n</style>\n\n${html}`
    }

    return html
  }

  // 미리보기용 HTML 생성 함수 (iframe 없이 직접 렌더링용)
  const generatePreviewHTML = (): string => {
    const finalImageUrl = getPreviewImageUrl(config.mainImageUrl)
    
    // 단어 변환 적용
    const processedContent = applyWordReplacements(config.content)
    
    // 콘텐츠를 줄바꿈 기준으로 처리 (원문의 줄바꿈 유지)
    const lines = processedContent.split('\n')
    
    // 줄들을 HTML로 변환
    const contentHTML = lines.map(line => {
      if (line.trim() === '') {
        // 빈 줄은 빈 문자열로 처리 (join에서 <br>이 추가됨)
        return ''
      } else {
        // 텍스트가 있는 줄은 포맷팅 적용
        const processedText = processTextFormatting(line.trim())
        return `<span style="color:${config.textColor};font-size:${config.fontSize}px;line-height:${config.lineHeight};">${processedText}</span>`
      }
    }).join('<br>\n\t\t')

    // 패딩과 그림자 CSS 생성
    const paddingCSS = `${config.paddingTop}rem ${config.paddingRight}rem ${config.paddingBottom}rem ${config.paddingLeft}rem`
    const shadowCSS = `0 0 ${config.shadowBlur}rem ${config.shadowSpread}rem rgba(0, 0, 0, 0.25)`

    // 미리보기용 HTML 구조 생성 (p 태그 제거하고 div만 사용)
    const html = `
<div style="margin:1rem auto 0.5rem auto;padding:${paddingCSS};max-width:${config.maxWidth}rem;border-radius:${config.borderRadius}rem;box-shadow:${shadowCSS};background:${config.backgroundColor};line-height:${config.lineHeight};font-family:'${config.fontFamily}', 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;letter-spacing:${config.letterSpacing}rem;">
\t<div style="margin:0 auto 0.7rem auto;text-align:center;">
\t\t<div style="margin-bottom:1rem;">
\t\t\t<span style="background:${config.backgroundColor};padding:0 1.5rem;font-size:1.2rem;font-weight:bold;color:${config.titleColor};text-transform:uppercase;letter-spacing:5px;">${config.title}</span>
\t\t</div>
\t\t<div style="border-top:1px solid ${config.borderColor};width:100%;margin-top:-0.8rem;">
\t\t\t<br>
\t\t</div>
\t</div>
\t
${config.showMainImage && finalImageUrl ? `\t<div style="margin-bottom:1rem;padding:0 0.7rem;text-align:center;">
\t\t<div style="max-width:${config.imageMaxWidth}px;margin:0 auto;">
\t\t\t<img style="max-width:100%;border-radius:12px;" src="${finalImageUrl}" alt="main-image">
\t\t</div>
\t</div>
\t
` : ''}\t<div style="margin:1rem 0.7rem;display:flex;">
\t\t<div style="height:1px;background:linear-gradient(to right, transparent, #d4af37);">
\t\t\t<br>
\t\t</div>
\t\t<div style="width:20px;">
\t\t\t<br>
\t\t</div>
\t\t<div style="height:1px;background:linear-gradient(to left, transparent, #d4af37);">
\t\t\t<br>
\t\t</div>
\t</div>
\t
\t<div style="margin-bottom:1.5rem;padding:0 0.7rem;">
\t\t${contentHTML}
\t</div>
\t
\t<div style="margin:0.5rem 0.7rem 0.2rem 0.7rem;padding-top:0.8rem;border-top:1px solid ${config.borderColor};text-align:center;">
\t\t<br>
\t</div>
</div>`

    // 커스텀 CSS가 활성화된 경우 추가
    if (config.enableCustomCSS && config.customCSS) {
      return `<style>\n${config.customCSS}\n</style>\n\n${html}`
    }

    return html
  }

  return {
    generateHTML,
    generatePreviewHTML
  }
}

 