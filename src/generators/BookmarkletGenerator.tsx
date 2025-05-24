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

interface BookmarkletGeneratorProps {
  config: Config
}

const BookmarkletGenerator = ({ config }: BookmarkletGeneratorProps) => {
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
      
      // 북마클릿형은 심플한 스타일
      let paragraphStyle = `color: ${config.contentTextColor}; font-size: ${config.fontSize}px; line-height: ${config.lineHeight}; margin-bottom: 15px;`
      if (config.paragraphIndent) {
        paragraphStyle += ' text-indent: 1.5em;'
      }
      
      // 큰따옴표 처리 (북마클릿형은 단순하게)
      if (trimmedParagraph.includes('"') && trimmedParagraph.includes('"')) {
        const beforeQuote = trimmedParagraph.split('"')[0]
        const quote = trimmedParagraph.split('"')[1]
        const afterQuote = trimmedParagraph.split('"')[2] || ''
        
        let quoteStyle = `font-size: ${config.fontSize}px; display: inline-block; font-style: italic; color: ${config.quoteColor1}; font-weight: ${config.boldEnabled ? 'bold' : '500'};`
        
        return `<p style="${paragraphStyle}">${beforeQuote}<span style="${quoteStyle}">"${quote}"</span>${afterQuote}</p>`
      } else if (trimmedParagraph.includes("'") && trimmedParagraph.includes("'")) {
        const beforeQuote = trimmedParagraph.split("'")[0]
        const quote = trimmedParagraph.split("'")[1]
        const afterQuote = trimmedParagraph.split("'")[2] || ''
        
        let singleQuoteStyle = `color: ${config.singleQuoteColor}; font-size: ${config.fontSize}px; font-style: ${config.singleQuoteItalic ? 'italic' : 'normal'};`
        
        return `<p style="${paragraphStyle}">${beforeQuote}<span style="${singleQuoteStyle}">'${quote}'</span>${afterQuote}</p>`
      } else {
        return `<p style="${paragraphStyle}">${trimmedParagraph}</p>`
      }
    }).join('')

    const finalImageUrl = normalizeImageUrl(config.backgroundImage)

    return `<div style="border: 1px solid #ddd; background-color: ${config.contentBackgroundColor}; padding: 20px; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
  <div style="text-align: center; margin-bottom: 20px;">
    <img src="${finalImageUrl}" alt="Header Image" style="max-width: 100%; height: auto; border-radius: 8px;" />
  </div>
  
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 10px; background: linear-gradient(135deg, ${config.leftTextColor1}, ${config.leftTextColor2}); border-radius: 5px;">
    <span style="color: white; font-weight: bold; font-size: 14px;">${config.leftText}</span>
    <span style="color: white; font-size: 12px; opacity: 0.9;">${config.rightText}</span>
  </div>
  
  <div style="padding: 10px 0;">
    ${contentHTML}
  </div>
</div>`
  }

  return {
    generateHTML
  }
}

export default BookmarkletGenerator 