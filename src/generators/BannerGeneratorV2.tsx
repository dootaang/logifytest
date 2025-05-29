import React from 'react'

interface TagStyle {
  text: string
  color: string
  text_color: string
  transparent_background: boolean
  border_color: string
}

interface WordReplacement {
  from: string
  to: string
}

interface ChatSection {
  id: string
  content: string
}

interface BannerConfig {
  // 프로필 설정
  showProfile: boolean
  showBotName: boolean
  botName: string
  botNameColor: string
  botNameSize: number
  showProfileImage: boolean
  imageUrl: string
  showProfileBorder: boolean
  profileBorderColor: string
  showProfileShadow: boolean
  showDivider: boolean
  dividerColor: string
  
  // 태그 설정
  showTags: boolean
  tags: TagStyle[]
  
  // 디자인 설정 (새로 추가)
  selectedTemplate: string
  outerBoxColor: string
  innerBoxColor: string
  showInnerBox: boolean
  useBoxBorder: boolean
  boxBorderColor: string
  boxBorderThickness: number
  shadowIntensity: number
  gradientStartColor: string
  gradientEndColor: string
  useGradientBackground: boolean
  
  // 텍스트 설정
  useTextSize: boolean
  textSize: number
  useTextIndent: boolean
  textIndent: number
  dialogColor: string
  dialogBold: boolean
  dialogNewline: boolean
  narrationColor: string
  innerThoughtsColor: string
  innerThoughtsBold: boolean
  removeAsterisk: boolean
  convertEllipsis: boolean
  
  // 단어 변경
  wordReplacements: WordReplacement[]
  
  // 기본 설정
  content: string
  contentBackgroundColor: string
  contentTextColor: string
  fontSize: number
  lineHeight: number
  chatSections?: ChatSection[]
}

interface BannerGeneratorV2Props {
  config: BannerConfig
}

const BannerGeneratorV2 = ({ config }: BannerGeneratorV2Props) => {
  const DEFAULT_PROFILE_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4wYJBhYRN2n7qQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAEiUlEQVR42u2dW2hcVRSGv3XOxEmTmTRp2kziJU0UqUVriy+CLxZfi1gUX3wTfPBJ8EkQwQteMFIfLFoQxQteMCJeULQoquKDgheCbdHWam0vMW3TJm0ymUzmnJk5e/kwt7SSOSdNOpN91v+0YQ557T3/f9bea6+99hgTExMTExMTE5NbE2lNRapr+xUwD8gFEWB4dJQrAyfo6+1JXGsAD4vgSQgbj0EkLgcKqAocxeWkOJwgrr+1JR1CJovpKDxbgUfFY4vApgJJACIgHkioIghYgDCwLlCjsV4mE3YyELBDQRYEHVKOEhKQEYFMURaLsAhYPr5wYkBEGFOXIZcEtjE2DWgmWYagSEwGXWVxWvGKpcQR+qIW5wYsCm5K7DQXn4xSEu/Hw0J9LyeOg0e2RTgrmALZYEfIlDCHew6xvKjEpuXsKHiJcqNUqWAsEzFPt8QRxK+A/lCIU/lFtM8PsXdVmBdiZXyiNluIc6hrPxt6HYpkmGTa5CWbQ48cUBIFxMJjXuEALyaWcPp4DesWb2N/SnycGPPxqABfimIMSUBJpAYRDwXm5vXxQayaV2QZO4kTlJAvn7xgwqe3bkEAevKEJUWCiUQNIuCJ0lR3lb3HDpC32SZzk6QaE0EBRBhVDxEhLh4RD0Q9clQoFEhcwPd6BcwXGRIYU6VPhJj6FOARBo6ny9kYGuRo1zeMxEcoWxtlUEEFJKSAqjKkMKxCSISwQDEQUsETxRXBQ7BE8EQQVVxbKVCbEYHjwEsiZxAsgWVWnPq2GNUt7URo5GTNaZbVDnKnZdN0vJY3B7JZIw4t6pPGElx1cUUZE2FYlYgqloArQlCUAlXyVclWiKsyKoIliqseYVEUYVSVfhFCAlFVRgSiojjq4agQUyVPhDCAqBAVxRMlR4SQKq7CkAhRUVwRPIGwKo5ATABPsVWIq4cnEBTBUSWkEFElLEKBKDnq4QKOQESEYVXiqgQFwqpEFWSszTiqOCLY6hEX8LQ8hwc74OIcIVB9nJbmTr7rPMzg0EUcN0aWVo5n6AW27XB5YjfHA6V8r1kuEXFwhZAqriioKo4IUYGoCIUKeaqERMhWIU+VHFGGBIZViaq/fPl/OHIcXBRbBFshLkqOQESUiEJIBFuUQYVRVWz1CAmoCrZ6xFSxEQLqkSsQFigQxVXBFsUVGFPwRHBViSsEBBRBRQmJkqNg64R4iHi4ohQi2KLYAiEVXFVy1CMoSgQIihATxRXFq0mQHspmLmA8BRFQhJgqYVFsAVdASYiHCGFV8kSwx1NX4fV5ZrE9nMfF+BD5JQrFDsUWBEUIixBTxRbBBkSUMYGQKA5gixJXJSxQKEKY8fM4FWwEVyAmQlyEkCpxEYIK+QIB9chRGD/pE2KixFUJq2IrBEQJiRBRZUQgJEJQwRMQEYbVI6Yg6hFQwEU8EWyBoHrkC4RFGQMiAgHAdYW5IgSBEQHiEMWlQqBIICJCXAVHYNAVBgUyRYgJxBDiOHQrZIsy6qZRzxsmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJtPI3wlK8GXlSW/WAAAAAElFTkSuQmCC"

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

  const formatConversation = (text: string) => {
    const indent = config.useTextIndent && config.textIndent ? config.textIndent : 0
    const dialogColor = config.dialogColor
    const innerThoughtsColor = config.innerThoughtsColor
    const narrationColor = config.narrationColor
    
    const dialogBold = config.dialogBold ? "font-weight:bold;" : ""
    const innerThoughtsBold = config.innerThoughtsBold ? "font-weight:bold;" : ""
    const textSize = config.useTextSize ? `font-size:${config.textSize}px;` : ""
    
    if (config.convertEllipsis) {
      text = text.replace(/\.\.\./g, '…')
    }
    
    // 대화문 패턴 (따옴표)
    const dialogPattern = /(["""″"""]\s*.+?\s*["""″"""]|".*?")/g
    // 속마음 패턴 (작은따옴표)
    const innerThoughtsPattern = /([\'\'\']\s*.+?\s*[\'\'\'])/g
    
    const lines = text.split('\n')
    const formattedLines: string[] = []
    
    for (const line of lines) {
      if (!line.trim()) {
        formattedLines.push('<p><br></p>')
        continue
      }
      
      const partsToProcess: string[] = []
      
      // 대화문 처리
      let lastEnd = 0
      let match
      const dialogMatches = []
      
      while ((match = dialogPattern.exec(line)) !== null) {
        dialogMatches.push(match)
      }
      
      for (const dialogMatch of dialogMatches) {
        // 대화문 이전의 나레이션 처리
        if (dialogMatch.index !== undefined && dialogMatch.index > lastEnd) {
          let narration = line.slice(lastEnd, dialogMatch.index)
          if (narration.trim()) {
            // 나레이션 내의 속마음 처리
            const innerMatches = []
            let innerMatch
            while ((innerMatch = innerThoughtsPattern.exec(narration)) !== null) {
              innerMatches.push(innerMatch)
            }
            
            for (const inner of innerMatches) {
              if (inner.index !== undefined) {
                // 속마음 이전 텍스트
                const prevText = narration.slice(0, inner.index)
                if (prevText.trim()) {
                  const style = `color:${narrationColor}; ${textSize}`
                  partsToProcess.push(`<span style="${style}">${prevText}</span>`)
                }
                
                // 속마음 텍스트
                const innerThought = inner[0]
                const style = `color:${innerThoughtsColor}; ${innerThoughtsBold} ${textSize}`
                partsToProcess.push(`<span style="${style}">${innerThought}</span>`)
                
                narration = narration.slice(inner.index + inner[0].length)
              }
            }
            
            // 남은 나레이션 처리
            if (narration.trim()) {
              const style = `color:${narrationColor}; ${textSize}`
              partsToProcess.push(`<span style="${style}">${narration}</span>`)
            }
          }
        }
        
        // 대화문 처리
        const dialog = dialogMatch[0]
        const style = `color:${dialogColor}; ${dialogBold} ${textSize}`
        if (config.dialogNewline) {
          const content = `<span style="${style}">${dialog}</span>`
          partsToProcess.push(`<div style="margin-top:1em; margin-bottom:1em;">${content}</div>`)
        } else {
          partsToProcess.push(`<span style="${style}">${dialog}</span>`)
        }
        
        lastEnd = (dialogMatch.index || 0) + dialogMatch[0].length
      }
      
      // 마지막 대화문 이후의 나레이션 처리
      if (lastEnd < line.length) {
        const remaining = line.slice(lastEnd)
        if (remaining.trim()) {
          const style = `color:${narrationColor}; ${textSize}`
          partsToProcess.push(`<span style="${style}">${remaining}</span>`)
        }
      }
      
      // 들여쓰기 처리
      if (config.useTextIndent && indent > 0) {
        formattedLines.push(
          `<div style="margin-bottom:1rem; text-indent:${indent}px">${partsToProcess.join('')}</div>`
        )
      } else {
        formattedLines.push(
          `<div style="margin-bottom:1rem;">${partsToProcess.join('')}</div>`
        )
      }
    }
    
    return formattedLines.join('\n')
  }

  const createBannerProfileHTML = () => {
    if (!config.showProfile) {
      return ''
    }
    
    const profileParts: string[] = []
    
    // 프로필 이미지 (배너형)
    if (config.showProfileImage && config.imageUrl) {
      const imageUrl = normalizeImageUrl(config.imageUrl)
      
      // 배너형 이미지 스타일
      const imageStyle = `
        max-width:100%;
        border-radius:12px;
        ${config.showProfileShadow ? 'box-shadow:rgba(0,0,0,0.12) 0px 4px 16px;' : ''}
        ${config.showProfileBorder ? `border:3px solid ${config.profileBorderColor};` : ''}
      `
      
      const profileHTML = `
      <div style="margin-bottom:1rem; text-align:center; width:100%;">
        <img style="${imageStyle}" 
            src="${imageUrl}" 
            alt="profile" 
            class="fr-fic fr-dii">
      </div>
      `
      profileParts.push(profileHTML)
    }
    
    // 봇 이름
    if (config.showBotName) {
      const botName = config.botName || "봇 이름"
      const botNameColor = config.botNameColor
      const botNameSize = config.botNameSize || 18
      const botNameHTML = `
        <h3 style="color:${botNameColor};font-weight:600;font-size:${botNameSize}px;margin-bottom:1rem;">${botName}</h3>
      `
      profileParts.push(botNameHTML)
    }

    // 태그 처리
    if (config.showTags && config.tags.length > 0) {
      const tagsHTML: string[] = []
      config.tags.forEach((tag, i) => {
        const tagText = tag.text || `태그 ${i + 1}`
        
        // 투명 배경 처리
        let tagStyle = `display:inline-block;
                      border-radius:20px;
                      font-size:0.85rem;
                      padding:0.2rem 0.8rem;
                      margin:0.15rem 0.2rem;
                      white-space:nowrap;`
        
        if (tag.transparent_background) {
          // 투명 배경 + 테두리
          tagStyle += `background:transparent;
                      color:${tag.text_color};
                      border:1px solid ${tag.border_color};`
        } else {
          // 일반 배경
          tagStyle += `background:${tag.color};
                      color:${tag.text_color};`
        }
        
        const tagHTML = `
          <span style="${tagStyle}">${tagText}</span>
        `
        tagsHTML.push(tagHTML)
      })
      
      if (tagsHTML.length > 0) {
        const tagsContainer = `
          <div style="text-align:center;margin:0 auto;max-width:fit-content;">
            ${tagsHTML.join('')}
          </div>
        `
        profileParts.push(tagsContainer)
      }
    }
    
    // 구분선
    if (config.showDivider) {
      const dividerColor = config.dividerColor
      const dividerHTML = `
        <div style="height:1px;
                  background:${dividerColor};
                  margin:1rem 0;
                  border-radius:0.5px;">
          <br>
        </div>
      `
      profileParts.push(dividerHTML)
    }
    
    // 전체 프로필 섹션 조합
    if (profileParts.length > 0) {
      return `
        <div style="display:flex;flex-direction:column;text-align:center;margin-bottom:1.25rem;">
          ${profileParts.join('')}
        </div>
      `
    }
    
    return ''
  }

  const createTemplate = (content: string) => {
    const profileHTML = createBannerProfileHTML()
    
    // 배경 스타일 결정
    let backgroundStyle = ''
    if (config.useGradientBackground) {
      backgroundStyle = `background: linear-gradient(135deg, ${config.gradientStartColor}, ${config.gradientEndColor});`
    } else {
      backgroundStyle = `background: ${config.innerBoxColor};`
    }
    
    // 테두리 스타일
    const borderStyle = config.useBoxBorder 
      ? `border: ${config.boxBorderThickness}px solid ${config.boxBorderColor};`
      : ''
    
    // 그림자 스타일
    const shadowStyle = config.shadowIntensity > 0 
      ? `box-shadow: 0px ${config.shadowIntensity}px ${config.shadowIntensity * 2}px rgba(0,0,0,0.2);`
      : ''
    
    // 외부 박스 스타일 (showInnerBox가 true일 때만 표시)
    const outerBoxStyle = config.showInnerBox 
      ? `background: ${config.outerBoxColor}; padding: 16px; border-radius: 20px;`
      : ''
    
    const innerBoxContent = `
      <div style="font-family:Segoe UI, Roboto, Arial, sans-serif;
                  color:${config.contentTextColor};
                  line-height:1.8;
                  width:100%;
                  max-width:600px;
                  margin:1rem auto;
                  ${backgroundStyle}
                  border-radius:16px;
                  ${borderStyle}
                  ${shadowStyle}">
        <div style="padding:24px;">
          <div style="font-size:${config.fontSize}px;padding:0;">
            ${profileHTML}
            ${content}
          </div>
        </div>
      </div>
    `
    
    if (config.showInnerBox) {
      return `<div style="${outerBoxStyle}">
          ${innerBoxContent}
        </div>`
    } else {
      return innerBoxContent
    }
  }

  const generateHTML = () => {
    try {
      // chatSections이 있으면 사용, 없으면 기존 content 사용
      const sections = config.chatSections && config.chatSections.length > 0 
        ? config.chatSections 
        : [{ id: 'default', content: config.content }];

      let allHTML = '<p><br></p>';

      sections.forEach((section, index) => {
        if (!section.content.trim()) return;

        let content = section.content;

        // 단어 변경 처리
        content = applyWordReplacements(content)

        // 에스터리스크 제거
        if (config.removeAsterisk) {
          content = content.replace(/\*+/g, '')
        }

        // 문단별 처리
        const paragraphs: string[] = []
        const paragraphList = content.split('\n\n')
        
        for (const paragraph of paragraphList) {
          if (paragraph.trim()) {
            const formattedText = formatConversation(paragraph)
            paragraphs.push(`<div style="margin-bottom:1.5rem;">${formattedText}</div>`)
          }
        }
        
        const processedContent = paragraphs.join('\n')

        if (index === 0) {
          // 첫 번째 박스: 모든 요소 포함
          allHTML += createTemplate(processedContent);
        } else {
          // 두 번째 박스부터: 텍스트만 포함 (박스 사이에 <p><br></p> 추가)
          allHTML += '<p><br></p>' + createSimpleTemplate(processedContent);
        }
      });

      allHTML += '<p><br></p>';

      return allHTML;
    } catch (error) {
      console.error('HTML 생성 중 오류:', error)
      return '<p>HTML 생성 중 오류가 발생했습니다.</p>'
    }
  }

  // 텍스트만 포함하는 단순한 템플릿 (프로필 없음)
  const createSimpleTemplate = (content: string) => {
    // 배경 스타일 결정
    let backgroundStyle = ''
    if (config.useGradientBackground) {
      backgroundStyle = `background: linear-gradient(135deg, ${config.gradientStartColor}, ${config.gradientEndColor});`
    } else {
      backgroundStyle = `background: ${config.innerBoxColor};`
    }
    
    // 테두리 스타일
    const borderStyle = config.useBoxBorder 
      ? `border: ${config.boxBorderThickness}px solid ${config.boxBorderColor};`
      : ''
    
    // 그림자 스타일
    const shadowStyle = config.shadowIntensity > 0 
      ? `box-shadow: 0px ${config.shadowIntensity}px ${config.shadowIntensity * 2}px rgba(0,0,0,0.2);`
      : ''
    
    // 외부 박스 스타일 (showInnerBox가 true일 때만 표시)
    const outerBoxStyle = config.showInnerBox 
      ? `background: ${config.outerBoxColor}; padding: 16px; border-radius: 20px;`
      : ''
    
    const innerBoxContent = `
      <div style="font-family:Segoe UI, Roboto, Arial, sans-serif;
                  color:${config.contentTextColor};
                  line-height:1.8;
                  width:100%;
                  max-width:600px;
                  margin:1rem auto;
                  ${backgroundStyle}
                  border-radius:16px;
                  ${borderStyle}
                  ${shadowStyle}">
        <div style="padding:24px;">
          <div style="font-size:${config.fontSize}px;padding:0;">
            ${content}
          </div>
        </div>
      </div>
    `
    
    if (config.showInnerBox) {
      return `<div style="${outerBoxStyle}">
          ${innerBoxContent}
        </div>`
    } else {
      return innerBoxContent
    }
  }

  // 미리보기용 HTML 생성 (프록시 사용)
  const generatePreviewHTML = () => {
    try {
      // chatSections이 있으면 사용, 없으면 기존 content 사용
      const sections = config.chatSections && config.chatSections.length > 0 
        ? config.chatSections 
        : [{ id: 'default', content: config.content }];

      let allHTML = '<p><br></p>';

      sections.forEach((section, index) => {
        if (!section.content.trim()) return;

        let content = section.content;

        // 단어 변경 처리
        content = applyWordReplacements(content)

        // 에스터리스크 제거
        if (config.removeAsterisk) {
          content = content.replace(/\*+/g, '')
        }

        // 문단별 처리
        const paragraphs: string[] = []
        const paragraphList = content.split('\n\n')
        
        for (const paragraph of paragraphList) {
          if (paragraph.trim()) {
            const formattedText = formatConversation(paragraph)
            paragraphs.push(`<div style="margin-bottom:1.5rem;">${formattedText}</div>`)
          }
        }
        
        const processedContent = paragraphs.join('\n')

        if (index === 0) {
          // 첫 번째 박스: 모든 요소 포함
          allHTML += createPreviewTemplate(processedContent);
        } else {
          // 두 번째 박스부터: 텍스트만 포함 (박스 사이에 <p><br></p> 추가)
          allHTML += '<p><br></p>' + createSimplePreviewTemplate(processedContent);
        }
      });

      allHTML += '<p><br></p>';

      return allHTML;
    } catch (error) {
      console.error('미리보기 HTML 생성 중 오류:', error)
      return '<p>미리보기 HTML 생성 중 오류가 발생했습니다.</p>'
    }
  }

  // 텍스트만 포함하는 단순한 미리보기 템플릿 (프로필 없음)
  const createSimplePreviewTemplate = (content: string) => {
    // 배경 스타일 결정
    let backgroundStyle = ''
    if (config.useGradientBackground) {
      backgroundStyle = `background: linear-gradient(135deg, ${config.gradientStartColor}, ${config.gradientEndColor});`
    } else {
      backgroundStyle = `background: ${config.innerBoxColor};`
    }
    
    // 테두리 스타일
    const borderStyle = config.useBoxBorder 
      ? `border: ${config.boxBorderThickness}px solid ${config.boxBorderColor};`
      : ''
    
    // 그림자 스타일
    const shadowStyle = config.shadowIntensity > 0 
      ? `box-shadow: 0px ${config.shadowIntensity}px ${config.shadowIntensity * 2}px rgba(0,0,0,0.2);`
      : ''
    
    // 외부 박스 스타일 (showInnerBox가 true일 때만 표시)
    const outerBoxStyle = config.showInnerBox 
      ? `background: ${config.outerBoxColor}; padding: 16px; border-radius: 20px;`
      : ''
    
    const innerBoxContent = `
      <div style="font-family:Segoe UI, Roboto, Arial, sans-serif;
                  color:${config.contentTextColor};
                  line-height:1.8;
                  width:100%;
                  max-width:600px;
                  margin:1rem auto;
                  ${backgroundStyle}
                  border-radius:16px;
                  ${borderStyle}
                  ${shadowStyle}">
        <div style="padding:24px;">
          <div style="font-size:${config.fontSize}px;padding:0;">
            ${content}
          </div>
        </div>
      </div>
    `
    
    if (config.showInnerBox) {
      return `<div style="${outerBoxStyle}">
          ${innerBoxContent}
        </div>`
    } else {
      return innerBoxContent
    }
  }

  // 미리보기용 템플릿 생성 (프록시 이미지 사용)
  const createPreviewTemplate = (content: string) => {
    const profileHTML = createPreviewProfileHTML()
    
    // 배경 스타일 결정
    let backgroundStyle = ''
    if (config.useGradientBackground) {
      backgroundStyle = `background: linear-gradient(135deg, ${config.gradientStartColor}, ${config.gradientEndColor});`
    } else {
      backgroundStyle = `background: ${config.innerBoxColor};`
    }
    
    // 테두리 스타일
    const borderStyle = config.useBoxBorder 
      ? `border: ${config.boxBorderThickness}px solid ${config.boxBorderColor};`
      : ''
    
    // 그림자 스타일
    const shadowStyle = config.shadowIntensity > 0 
      ? `box-shadow: 0px ${config.shadowIntensity}px ${config.shadowIntensity * 2}px rgba(0,0,0,0.2);`
      : ''
    
    // 외부 박스 스타일 (showInnerBox가 true일 때만 표시)
    const outerBoxStyle = config.showInnerBox 
      ? `background: ${config.outerBoxColor}; padding: 16px; border-radius: 20px;`
      : ''
    
    const innerBoxContent = `
      <div style="font-family:Segoe UI, Roboto, Arial, sans-serif;
                  color:${config.contentTextColor};
                  line-height:1.8;
                  width:100%;
                  max-width:600px;
                  margin:1rem auto;
                  ${backgroundStyle}
                  border-radius:16px;
                  ${borderStyle}
                  ${shadowStyle}">
        <div style="padding:24px;">
          <div style="font-size:${config.fontSize}px;padding:0;">
            ${profileHTML}
            ${content}
          </div>
        </div>
      </div>
    `
    
    if (config.showInnerBox) {
      return `<div style="${outerBoxStyle}">
          ${innerBoxContent}
        </div>`
    } else {
      return innerBoxContent
    }
  }

  // 미리보기용 프로필 HTML 생성 (프록시 이미지 사용)
  const createPreviewProfileHTML = () => {
    if (!config.showProfile) {
      return ''
    }
    
    const profileParts: string[] = []
    
    // 프로필 이미지 (배너형) - 미리보기용
    if (config.showProfileImage && config.imageUrl) {
      const imageUrl = getPreviewImageUrl(config.imageUrl)
      
      // 배너형 이미지 스타일
      const imageStyle = `
        max-width:100%;
        border-radius:12px;
        ${config.showProfileShadow ? 'box-shadow:rgba(0,0,0,0.12) 0px 4px 16px;' : ''}
        ${config.showProfileBorder ? `border:3px solid ${config.profileBorderColor};` : ''}
      `
      
      const profileHTML = `
      <div style="margin-bottom:1rem; text-align:center; width:100%;">
        <img style="${imageStyle}" 
            src="${imageUrl}" 
            alt="profile" 
            class="fr-fic fr-dii">
      </div>
      `
      profileParts.push(profileHTML)
    }
    
    // 봇 이름
    if (config.showBotName) {
      const botName = config.botName || "봇 이름"
      const botNameColor = config.botNameColor
      const botNameSize = config.botNameSize || 18
      const botNameHTML = `
        <h3 style="color:${botNameColor};font-weight:600;font-size:${botNameSize}px;margin-bottom:1rem;">${botName}</h3>
      `
      profileParts.push(botNameHTML)
    }

    // 태그 처리 (미리보기용)
    if (config.showTags && config.tags.length > 0) {
      const tagsHTML: string[] = []
      config.tags.forEach((tag, i) => {
        const tagText = tag.text || `태그 ${i + 1}`
        
        // 투명 배경 처리
        let tagStyle = `display:inline-block;
                      border-radius:20px;
                      font-size:0.85rem;
                      padding:0.2rem 0.8rem;
                      margin:0.15rem 0.2rem;
                      white-space:nowrap;`
        
        if (tag.transparent_background) {
          // 투명 배경 + 테두리
          tagStyle += `background:transparent;
                      color:${tag.text_color};
                      border:1px solid ${tag.border_color};`
        } else {
          // 일반 배경
          tagStyle += `background:${tag.color};
                      color:${tag.text_color};`
        }
        
        const tagHTML = `
          <span style="${tagStyle}">${tagText}</span>
        `
        tagsHTML.push(tagHTML)
      })
      
      if (tagsHTML.length > 0) {
        const tagsContainer = `
          <div style="text-align:center;margin:0 auto;max-width:fit-content;">
            ${tagsHTML.join('')}
          </div>
        `
        profileParts.push(tagsContainer)
      }
    }
    
    // 구분선
    if (config.showDivider) {
      const dividerColor = config.dividerColor
      const dividerHTML = `
        <div style="height:1px;
                  background:${dividerColor};
                  margin:1rem 0;
                  border-radius:0.5px;">
          <br>
        </div>
      `
      profileParts.push(dividerHTML)
    }
    
    // 전체 프로필 섹션 조합
    if (profileParts.length > 0) {
      return `
        <div style="display:flex;flex-direction:column;text-align:center;margin-bottom:1.25rem;">
          ${profileParts.join('')}
        </div>
      `
    }
    
    return ''
  }

  return {
    generateHTML,
    generatePreviewHTML
  }
}

export default BannerGeneratorV2 