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

  const normalizeImageUrl = (url: string) => {
    if (!url) return ''
    // 데이터 URL (base64)은 그대로 사용
    if (url.startsWith('data:')) {
      return url
    }
    // 절대 URL (//로 시작)은 https 프로토콜 추가
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

  // 미리보기용 이미지 URL 생성 (프록시를 통해 CORS 우회)
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
      return `https://images.weserv.nl/?url=${encodeURIComponent(normalizedUrl)}`;
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

  const generateHTML = () => {
    const processedContent = applyWordReplacements(config.content)
    const paragraphs = processedContent.split('\n\n').filter(p => p.trim())
    
    const contentHTML = paragraphs.map(paragraph => {
      const trimmedParagraph = paragraph.trim()
      
      // 기본 스타일 정의 - 본문 색상 적용
      let paragraphStyle = `color: ${config.contentTextColor}; font-size: ${config.fontSize}px; line-height: ${config.lineHeight};`
      if (config.paragraphIndent) {
        paragraphStyle += ' text-indent: 1.5em;'
      }
      
      // 큰따옴표와 작은따옴표 모두 처리
      if (trimmedParagraph.includes('"') && trimmedParagraph.includes('"')) {
        // 큰따옴표 처리
        const beforeQuote = trimmedParagraph.split('"')[0]
        const quote = trimmedParagraph.split('"')[1]
        const afterQuote = trimmedParagraph.split('"')[2] || ''
        
        // 큰따옴표 스타일 - 그라데이션 지원
        let quoteStyle = `font-size: ${config.fontSize}px; display: inline-block;`
        
        if (config.quoteColorEnabled) {
          if (config.quoteGradientEnabled) {
            // 그라데이션 활성화
            quoteStyle += `background: linear-gradient(135deg, ${config.quoteColor1}, ${config.quoteColor2}); -webkit-background-clip: text; background-clip: text; color: transparent; font-weight: ${config.boldEnabled ? 'bold' : '500'};`
          } else {
            // 단색 활성화
            quoteStyle += `color: ${config.quoteColor1}; font-weight: ${config.boldEnabled ? 'bold' : '500'};`
          }
        } else {
          // 기본 색상
          quoteStyle += `color: ${config.contentTextColor}; font-weight: ${config.boldEnabled ? 'bold' : 'normal'};`
        }
        
        return `
    <p style="${paragraphStyle}"><span style="color: ${config.contentTextColor};">${beforeQuote}</span><span style="${quoteStyle}">"${quote}"</span><span style="color: ${config.contentTextColor};">${afterQuote}</span></p>

    <p>
      <br>
    </p>`
      } else if (trimmedParagraph.includes("'") && trimmedParagraph.includes("'")) {
        // 작은따옴표 처리
        const beforeQuote = trimmedParagraph.split("'")[0]
        const quote = trimmedParagraph.split("'")[1]
        const afterQuote = trimmedParagraph.split("'")[2] || ''
        
        let singleQuoteStyle = `color: ${config.singleQuoteColor}; font-size: ${config.fontSize}px; display: inline-block;`
        if (config.singleQuoteItalic) {
          singleQuoteStyle += ' font-style: italic;'
        }
        
        return `
    <p style="${paragraphStyle}"><span style="color: ${config.contentTextColor};">${beforeQuote}</span><span style="${singleQuoteStyle}">'${quote}'</span><span style="color: ${config.contentTextColor};">${afterQuote}</span></p>

    <p>
      <br>
    </p>`
      } else {
        return `
    <p style="${paragraphStyle}">${trimmedParagraph}</p>

    <p>
      <br>
    </p>`
      }
    }).join('')

    // 실제 HTML 생성용 - 원본 URL 직접 사용 (게시판 호환성)
    const finalImageUrl = normalizeImageUrl(config.backgroundImage)

    return `<p>
	<br>
</p>
<div style="border:solid 0px #e3e3e3;background-color:${config.contentBackgroundColor};border-radius:20px;position:relative;width:100%;max-width:700px;margin:0px auto;">
	<div style="height: 85px;margin:-1px -1px 0px -1px;">
		<div style="background-image:url('${finalImageUrl}');background-size:cover;height:170px;background-position:50% 40%;border-radius:19px 19px 0px 0px;background-color:#f0f0f0;">
			<div style="height:130px;width:100%;border-radius:19px 19px 0px 0px;">
				<br>
			</div></div></div>
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
    const processedContent = applyWordReplacements(config.content)
    const paragraphs = processedContent.split('\n\n').filter(p => p.trim())
    
    const contentHTML = paragraphs.map(paragraph => {
      const trimmedParagraph = paragraph.trim()
      
      // 기본 스타일 정의 - 본문 색상 적용
      let paragraphStyle = `color: ${config.contentTextColor}; font-size: ${config.fontSize}px; line-height: ${config.lineHeight};`
      if (config.paragraphIndent) {
        paragraphStyle += ' text-indent: 1.5em;'
      }
      
      // 큰따옴표와 작은따옴표 모두 처리
      if (trimmedParagraph.includes('"') && trimmedParagraph.includes('"')) {
        // 큰따옴표 처리
        const beforeQuote = trimmedParagraph.split('"')[0]
        const quote = trimmedParagraph.split('"')[1]
        const afterQuote = trimmedParagraph.split('"')[2] || ''
        
        // 큰따옴표 스타일 - 그라데이션 지원
        let quoteStyle = `font-size: ${config.fontSize}px; display: inline-block;`
        
        if (config.quoteColorEnabled) {
          if (config.quoteGradientEnabled) {
            // 그라데이션 활성화
            quoteStyle += `background: linear-gradient(135deg, ${config.quoteColor1}, ${config.quoteColor2}); -webkit-background-clip: text; background-clip: text; color: transparent; font-weight: ${config.boldEnabled ? 'bold' : '500'};`
          } else {
            // 단색 활성화
            quoteStyle += `color: ${config.quoteColor1}; font-weight: ${config.boldEnabled ? 'bold' : '500'};`
          }
        } else {
          // 기본 색상
          quoteStyle += `color: ${config.contentTextColor}; font-weight: ${config.boldEnabled ? 'bold' : 'normal'};`
        }
        
        return `
    <p style="${paragraphStyle}"><span style="color: ${config.contentTextColor};">${beforeQuote}</span><span style="${quoteStyle}">"${quote}"</span><span style="color: ${config.contentTextColor};">${afterQuote}</span></p>

    <p>
      <br>
    </p>`
      } else if (trimmedParagraph.includes("'") && trimmedParagraph.includes("'")) {
        // 작은따옴표 처리
        const beforeQuote = trimmedParagraph.split("'")[0]
        const quote = trimmedParagraph.split("'")[1]
        const afterQuote = trimmedParagraph.split("'")[2] || ''
        
        let singleQuoteStyle = `color: ${config.singleQuoteColor}; font-size: ${config.fontSize}px; display: inline-block;`
        if (config.singleQuoteItalic) {
          singleQuoteStyle += ' font-style: italic;'
        }
        
        return `
    <p style="${paragraphStyle}"><span style="color: ${config.contentTextColor};">${beforeQuote}</span><span style="${singleQuoteStyle}">'${quote}'</span><span style="color: ${config.contentTextColor};">${afterQuote}</span></p>

    <p>
      <br>
    </p>`
      } else {
        return `
    <p style="${paragraphStyle}">${trimmedParagraph}</p>

    <p>
      <br>
    </p>`
      }
    }).join('')

    // 미리보기용 - 프록시 사용 (CORS 우회)
    const finalImageUrl = getPreviewImageUrl(config.backgroundImage)

    return `<p>
	<br>
</p>
<div style="border:solid 0px #e3e3e3;background-color:${config.contentBackgroundColor};border-radius:20px;position:relative;width:100%;max-width:700px;margin:0px auto;">
	<div style="height: 85px;margin:-1px -1px 0px -1px;">
		<div style="background-image:url('${finalImageUrl}');background-size:cover;height:170px;background-position:50% 40%;border-radius:19px 19px 0px 0px;background-color:#f0f0f0;">
			<div style="height:130px;width:100%;border-radius:19px 19px 0px 0px;">
				<br>
			</div></div></div>
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