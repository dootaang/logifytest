import React from 'react'

interface Config {
  backgroundImage: string
  leftText: string
  rightText: string
  leftTextColor1: string
  leftTextColor2: string
  quoteColor1: string
  quoteColor2: string
  quoteColorEnabled: boolean
  quoteGradientEnabled: boolean
  boldEnabled: boolean
  singleQuoteItalic: boolean
  singleQuoteColor: string
  contentBackgroundColor: string
  contentTextColor: string
  fontSize: number
  lineHeight: number
  paragraphIndent: boolean
  content: string
  wordReplacements: Array<{ from: string; to: string }>
}

interface JellyGeneratorProps {
  config: Config
}

const JellyGenerator = ({ config }: JellyGeneratorProps) => {
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result 
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, 1`
      : '0, 0, 0, 1'
  }

  const normalizeImageUrl = (url: string): string => {
    if (!url) return '';
    // 데이터 URL (base64)은 그대로 사용
    if (url.startsWith('data:')) {
      return url;
    }
    // 아카라이브 이미지 URL (//ac-p1.namu.la 또는 //ac.namu.la)은 원본 형태 유지
    if (url.startsWith('//') && (url.includes('ac-p1.namu.la') || url.includes('ac.namu.la'))) {
      return url;  // 아카라이브 URL은 원본 형태 그대로 사용
    }
    // 기타 절대 URL (//로 시작)은 https 프로토콜 추가
    if (url.startsWith('//')) {
      return 'https:' + url;
    }
    // 레거시 로컬 업로드 경로는 현재 호스트 기준으로 변환 (Vercel 환경에서는 사용되지 않음)
    if (url.startsWith('/uploads/')) {
      if (typeof window !== 'undefined') {
        return window.location.protocol + '//' + window.location.host + url;
      }
      // Vercel 환경에서는 이 경로가 사용되지 않지만 폴백 제공
      return url;
    }
    // http/https가 없으면 https 추가
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url;
    }
    return url;
  };

  // 미리보기용 이미지 URL 생성 (프록시를 통해 CORS 우회)
  const getPreviewImageUrl = (url: string): string => {
    const normalizedUrl = normalizeImageUrl(url);
    
    // 데이터 URL (base64)은 그대로 사용
    if (normalizedUrl.startsWith('data:')) {
      return normalizedUrl;
    }
    
    // 레거시 로컬 업로드 이미지는 직접 사용 (CORS 문제 없음)
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

  const applyWordReplacements = (text: string) => {
    let processedText = text
    config.wordReplacements.forEach(replacement => {
      if (replacement.from && replacement.to) {
        processedText = processedText.replace(new RegExp(replacement.from, 'g'), replacement.to)
      }
    })
    return processedText
  }

  // 참고 코드 스타일로 문단 처리
  const processContent = (content: string) => {
    const processedContent = applyWordReplacements(content)
    const paragraphs = processedContent.split('\n\n').filter(p => p.trim())
    
    return paragraphs.map((paragraph, index) => {
      const trimmedParagraph = paragraph.trim()
      
      // 큰따옴표 스타일 정의
      let quoteStyle = `font-weight:${config.boldEnabled ? 'bold' : '500'};`
      
      if (config.quoteColorEnabled) {
        if (config.quoteGradientEnabled) {
          // 그라데이션 활성화 - 참고 코드 스타일
          quoteStyle += `background:linear-gradient(to right,${config.quoteColor1},${config.quoteColor2});background-clip:text;color:transparent;box-decoration-break:clone;`
        } else {
          // 단색 활성화
          quoteStyle += `color: ${config.quoteColor1};`
        }
      } else {
        // 기본 색상
        quoteStyle += `color: ${config.contentTextColor};`
      }
      
      // 작은따옴표 스타일 정의
      let singleQuoteStyle = `color: ${config.singleQuoteColor};`
      if (config.singleQuoteItalic) {
        singleQuoteStyle += ' font-style: italic;'
      }
      
      // 일반 텍스트 스타일 - 폰트 크기 적용
      const normalTextStyle = `color: ${config.contentTextColor}; font-size: ${config.fontSize}px;`
      
      // 문단 스타일 정의 - 폰트 크기, 줄 간격, 들여쓰기 적용
      let paragraphStyle = `font-size: ${config.fontSize}px; line-height: ${config.lineHeight};`
      if (config.paragraphIndent) {
        paragraphStyle += ' text-indent: 1.5em;'
      }
      
      // 문단을 토큰으로 분할하여 처리 (참고 코드 방식)
      let processedParagraph = trimmedParagraph
      
      // 큰따옴표 처리 - 폰트 크기 추가
      const updatedQuoteStyle = quoteStyle + ` font-size: ${config.fontSize}px;`
      processedParagraph = processedParagraph.replace(/"([^"]*?)"/g, `<span style="${updatedQuoteStyle}">"$1"</span>`)
      
      // 작은따옴표 처리 - 폰트 크기 추가
      const updatedSingleQuoteStyle = singleQuoteStyle + ` font-size: ${config.fontSize}px;`
      processedParagraph = processedParagraph.replace(/'([^']*?)'/g, `<span style="${updatedSingleQuoteStyle}">'$1'</span>`)
      
      // 일반 텍스트 부분을 span으로 감싸기 (참고 코드 스타일)
      // 이미 span으로 감싸지지 않은 텍스트를 찾아서 감싸기
      const parts = processedParagraph.split(/(<span[^>]*>.*?<\/span>)/g)
      const wrappedParts = parts.map(part => {
        if (part.startsWith('<span')) {
          return part // 이미 span으로 감싸진 부분은 그대로
        } else if (part.trim()) {
          return `<span style="${normalTextStyle}">${part}</span>` // 일반 텍스트는 span으로 감싸기
        }
        return part
      })
      
      const finalParagraph = wrappedParts.join('')
      
      // 마지막 문단이 아닌 경우에만 빈 줄 추가 (참고 코드 스타일)
      const spacing = index < paragraphs.length - 1 ? '\n\n<p><br></p>' : ''
      return `<p style="${paragraphStyle}">${finalParagraph}</p>${spacing}`
    }).join('')
  }

  const generateHTML = () => {
    const contentHTML = processContent(config.content)
    
    // 실제 HTML 생성용 - 원본 URL 직접 사용 (게시판 호환성)
    const finalImageUrl = normalizeImageUrl(config.backgroundImage)

    return `<p>
	<br>
</p>
<div style="border:solid 0px #e3e3e3;background-color:${config.contentBackgroundColor};border-radius:20px;width:100%;max-width:700px;margin:0px auto;">
	<div style="height: 85px;margin:-1px -1px 0px -1px;">
		<img src="${finalImageUrl}" alt="배경 이미지" style="width:100%;height:170px;object-fit:cover;object-position:50% 40%;border-radius:19px 19px 0px 0px;display:block;" />
		<div style="height:130px;width:100%;border-radius:19px 19px 0px 0px;margin-top:-170px;">
			<br>
		</div></div>
	<div style="background:linear-gradient(135deg,rgba(${hexToRgb(config.leftTextColor1)}),rgba(${hexToRgb(config.leftTextColor2)}));background-size:110%;background-position:center;border-radius:10px;padding:10px;line-height:10px;text-transform:uppercase;letter-spacing:0.1em;box-shadow: 0px 0px 0px 3px rgba(233,233,233,0.9), inset 0px 40px 0px rgba(30,30,30,.1);display:flex;width:fit-content;max-width:300px;float:left;margin-left:6.5%;margin-top:70px;"><span style="text-decoration:none;color:#ededed;font-weight:600;text-shadow:0px 0px 5px rgba(30,30,30,.1);">${config.leftText}</span></div>
	<div style="margin-top: 70px;float: right;width: fit-content; max-width: 100%; background-color:#494949;border-radius:5px 0px 0px 5px;padding:10px;line-height:10px;letter-spacing:0.25em;text-transform:uppercase;color:#d5d5d5;font-size:0.7em;">${config.rightText}</div>
	<div style="padding:20px 7%;line-height:${config.lineHeight};letter-spacing:.35px;margin-top: 90px;">

		<p style="line-height:2;margin:2rem 0;font-size:13.8px;letter-spacing:-0.8px;">
			<br>
		</p>
${contentHTML}
	</div></div>

<p>
	<br>
</p>`
  }

  // 미리보기 전용 HTML 생성 (프록시 사용)
  const generatePreviewHTML = () => {
    const contentHTML = processContent(config.content)
    
    // 미리보기용 - 프록시 사용 (CORS 우회)
    const finalImageUrl = getPreviewImageUrl(config.backgroundImage)

    return `<p>
	<br>
</p>
<div style="border:solid 0px #e3e3e3;background-color:${config.contentBackgroundColor};border-radius:20px;width:100%;max-width:700px;margin:0px auto;">
	<div style="height: 85px;margin:-1px -1px 0px -1px;">
		<img src="${finalImageUrl}" alt="배경 이미지" style="width:100%;height:170px;object-fit:cover;object-position:50% 40%;border-radius:19px 19px 0px 0px;display:block;" />
		<div style="height:130px;width:100%;border-radius:19px 19px 0px 0px;margin-top:-170px;">
			<br>
		</div></div>
	<div style="background:linear-gradient(135deg,rgba(${hexToRgb(config.leftTextColor1)}),rgba(${hexToRgb(config.leftTextColor2)}));background-size:110%;background-position:center;border-radius:10px;padding:10px;line-height:10px;text-transform:uppercase;letter-spacing:0.1em;box-shadow: 0px 0px 0px 3px rgba(233,233,233,0.9), inset 0px 40px 0px rgba(30,30,30,.1);display:flex;width:fit-content;max-width:300px;float:left;margin-left:6.5%;margin-top:70px;"><span style="text-decoration:none;color:#ededed;font-weight:600;text-shadow:0px 0px 5px rgba(30,30,30,.1);">${config.leftText}</span></div>
	<div style="margin-top: 70px;float: right;width: fit-content; max-width: 100%; background-color:#494949;border-radius:5px 0px 0px 5px;padding:10px;line-height:10px;letter-spacing:0.25em;text-transform:uppercase;color:#d5d5d5;font-size:0.7em;">${config.rightText}</div>
	<div style="padding:20px 7%;line-height:${config.lineHeight};letter-spacing:.35px;margin-top: 90px;">

		<p style="line-height:2;margin:2rem 0;font-size:13.8px;letter-spacing:-0.8px;">
			<br>
		</p>
${contentHTML}
	</div></div>

<p>
	<br>
</p>`
  }

  return {
    generateHTML,
    generatePreviewHTML
  }
}

export default JellyGenerator 