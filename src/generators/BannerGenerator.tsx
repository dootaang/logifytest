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

interface BannerGeneratorProps {
  config: Config
}

const BannerGenerator = ({ config }: BannerGeneratorProps) => {
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result 
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, 1`
      : '0, 0, 0, 1'
  }

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
      
      let paragraphStyle = `color: ${config.contentTextColor}; font-size: ${config.fontSize}px; line-height: ${config.lineHeight}; margin-bottom: 20px;`
      if (config.paragraphIndent) {
        paragraphStyle += ' text-indent: 1.5em;'
      }
      
      // 배너형 스타일 대화 처리
      if (trimmedParagraph.includes('"') && trimmedParagraph.includes('"')) {
        const beforeQuote = trimmedParagraph.split('"')[0]
        const quote = trimmedParagraph.split('"')[1]
        const afterQuote = trimmedParagraph.split('"')[2] || ''
        
        let quoteStyle = `font-size: ${config.fontSize}px; padding: 8px 15px; margin: 10px 0; background: linear-gradient(135deg, ${config.quoteColor1}, ${config.quoteColor2}); color: white; border-left: 4px solid rgba(255,255,255,0.3); display: block; border-radius: 0 8px 8px 0; font-weight: ${config.boldEnabled ? 'bold' : '500'}; box-shadow: 0 2px 8px rgba(0,0,0,0.1);`
        
        return `<p style="${paragraphStyle}">${beforeQuote}</p><div style="${quoteStyle}">"${quote}"</div><p style="${paragraphStyle}">${afterQuote}</p>`
      } else if (trimmedParagraph.includes("'") && trimmedParagraph.includes("'")) {
        const beforeQuote = trimmedParagraph.split("'")[0]
        const quote = trimmedParagraph.split("'")[1]
        const afterQuote = trimmedParagraph.split("'")[2] || ''
        
        let singleQuoteStyle = `color: ${config.singleQuoteColor}; font-size: ${config.fontSize}px; font-style: ${config.singleQuoteItalic ? 'italic' : 'normal'}; padding: 5px 10px; border-left: 3px solid ${config.singleQuoteColor}; background: rgba(128,128,128,0.1); margin: 8px 0; display: block;`
        
        return `<p style="${paragraphStyle}">${beforeQuote}</p><div style="${singleQuoteStyle}">'${quote}'</div><p style="${paragraphStyle}">${afterQuote}</p>`
      } else {
        return `<p style="${paragraphStyle}">${trimmedParagraph}</p>`
      }
    }).join('')

    const finalImageUrl = normalizeImageUrl(config.backgroundImage)

    return `<div style="background: ${config.contentBackgroundColor}; border: 2px solid #e0e0e0; border-radius: 12px; overflow: hidden; max-width: 800px; margin: 0 auto; box-shadow: 0 4px 16px rgba(0,0,0,0.1);">
  <!-- 헤더 배너 -->
  <div style="position: relative; height: 150px; background: linear-gradient(135deg, rgba(${hexToRgb(config.leftTextColor1)}), rgba(${hexToRgb(config.leftTextColor2)})); overflow: hidden;">
    <div style="position: absolute; inset: 0; background-image: url('${finalImageUrl}'); background-size: cover; background-position: center; opacity: 0.6;"></div>
    
    <div style="position: relative; z-index: 2; display: flex; justify-content: space-between; align-items: center; height: 100%; padding: 0 30px;">
      <div style="color: white; font-size: 18px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${config.leftText}</div>
      <div style="color: white; font-size: 14px; opacity: 0.9; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">${config.rightText}</div>
    </div>
    
    <!-- 장식용 라인 -->
    <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, rgba(255,255,255,0.8), rgba(255,255,255,0.2), rgba(255,255,255,0.8));"></div>
  </div>
  
  <!-- 컨텐츠 영역 -->
  <div style="padding: 30px;">
    ${contentHTML}
  </div>
</div>`
  }

  return {
    generateHTML
  }
}

export default BannerGenerator 