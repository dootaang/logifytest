import React, { useMemo } from 'react';

interface WordReplacement {
  from: string;
  to: string;
}

interface ChatchanConfig {
  characterName: string;
  modelName: string;
  promptName: string;
  assistModelName: string;
  userName: string;
  chatNumber: string;
  characterImageUrl: string;
  useCharacterImage: boolean;
  backgroundColor: string;
  textColor: string;
  highlightColor: string;
  promptColor: string;
  emphasisColor: string;
  baseFontSize: number;
  titleFontSize: number;
  containerWidth: number;
  logSectionRadius: number;
  lineHeight: number;
  letterSpacing: number;
  italicizeNarration: boolean;
  simpleOutputMode: boolean;
  disableChatLogCollapse: boolean;
  isAutoInputMode: boolean;
  dialogueUseBubble: boolean;
  narrationUseLine: boolean;
  showBriefHeaderInfo: boolean;
  content: string;
  selectedTheme: string;
  wordReplacements: WordReplacement[];
}

export const useChatchanGeneratorV2 = (config: ChatchanConfig) => {
  // 기본 프로필 이미지 (base64)
  const DEFAULT_PROFILE_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4wYJBhYRN2n7qQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAEiUlEQVR42u2dW2hcVRSGv3XOxEmTmTRp2kziJU0UqUVriy+CLxZfi1gUX3wTfPBJ8EkQwQteMFIfLFoQxQteMCJeULQoquKDgheCbdHWam0vMW3TJm0ymUzmnJk5e/kwt7SSOSdNOpN91v+0YQ557T3/f9bea6+99hgTExMTExMTE5NbE2lNRapr+xUwD8gFEWB4dJQrAyfo6+1JXGsAD4vgSQgbj0EkLgcKqAocxeWkOJwgrr+1JR1CJovpKDxbgUfFY4vApgJJACIgHkioIghYgDCwLlCjsV4mE3YyELBDQRYEHVKOEhKQEYFMURaLsAhYPr5wYkBEGFOXIZcEtjE2DWgmWYagSEwGXWVxWvGKpcQR+qIW5wYsCm5K7DQXn4xSEu/Hw0J9LyeOg0e2RTgrmALZYEfIlDCHew6xvKjEpuXsKHiJcqNUqWAsEzFPt8QRxK+A/lCIU/lFtM8PsXdVmBdiZXyiNluIc6hrPxt6HYpkmGTa5CWbQ48cUBIFxMJjXuEALyaWcPp4DesWb2N/SnycGPPxqABfimIMSUBJpAYRDwXm5vXxQayaV2QZO4kTlJAvn7xgwqe3bkEAevKEJUWCiUQNIuCJ0lR3lb3HDpC32SZzk6QaE0EBRBhVDxEhLh4RD0Q9clQoFEhcwPd6BcwXGRIYU6VPhJj6FOARBo6ny9kYGuRo1zeMxEcoWxtlUEEFJKSAqjKkMKxCSISwQDEQUsETxRXBQ7BE8EQQVVxbKVCbEYHjwEsiZxAsgWVWnPq2GNUt7URo5GTNaZbVDnKnZdN0vJY3B7JZIw4t6pPGElx1cUUZE2FYlYgqloArQlCUAlXyVclWiKsyKoIliqseYVEUYVSVfhFCAlFVRgSiojjq4agQUyVPhDCAqBAVxRMlR4SQKq7CkAhRUVwRPIGwKo5ATABPsVWIq4cnEBTBUSWkEFElLEKBKDnq4QKOQESEYVXiqgQFwqpEFWSszTiqOCLY6hEX8LQ8hwc74OIcIVB9nJbmTr7rPMzg0EUcN0aWVo5n6AW27XB5YjfHA6V8r1kuEXFwhZAqriioKo4IUYGoCIUKeaqERMhWIU+VHFGGBIZViaq/fPl/OHIcXBRbBFshLkqOQESUiEJIBFuUQYVRVWz1CAmoCrZ6xFSxEQLqkSsQFigQxVXBFsUVGFPwRHBViSsEBBRBRQmJkqNg64R4iHi4ohQi2KLYAiEVXFVy1CMoSgQIihATxRXFq0mQHspmLmA8BRFQhJgqYVFsAVdASYiHCGFV8kSwx1NX4fV5ZrE9nMfF+BD5JQrFDsUWBEUIixBTxRbBBkSUMYGQKA5gixJXJSxQKEKY8fM4FWwEVyAmQlyEkCpxEYIK+QIB9chRGD/pE2KixFUJq2IrBEQJiRBRZUQgJEJQwRMQEYbVI6Yg6hFQwEU8EWyBoHrkC4RFGQMiAgHAdYW5IgSBEQHiEMWlQqBIICJCXAVHYNAVBgUyRYgJxBDiOHQrZIsy6qZRzxsmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJtPI3wlK8GXlSW/WAAAAAElFTkSuQmCC"

  // 이미지 URL 정규화 함수
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

  // 색상 조정 함수
  const adjustColor = (color: string, amount: number): string => {
    let colorCode = color;
    if (color.startsWith('#')) {
      colorCode = color.slice(1);
    }
    const num = parseInt(colorCode, 16);
    if (isNaN(num)) return '#000000';
    
    let r = (num >> 16) + amount;
    r = Math.max(0, Math.min(255, r));
    let g = ((num >> 8) & 0x00ff) + amount;
    g = Math.max(0, Math.min(255, g));
    let b = (num & 0x0000ff) + amount;
    b = Math.max(0, Math.min(255, b));
    
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  };

  // 현재 날짜 가져오기
  const getCurrentDate = (): string => {
    const now = new Date();
    return `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
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

  // 강조 처리 함수
  const processEmphasis = (text: string): string => {
    if (!text) return '';
    
    // HTML 이스케이프
    let processedText = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // 마크다운 처리
    processedText = processedText.replace(
      /\*\*\*(.*?)\*\*\*/g,
      '<strong style="font-style: italic;">$1</strong>'
    );
    processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    processedText = processedText.replace(
      /(?<![a-zA-Z0-9*])\*(?![* ])(.*?)(?<![ *])\*(?![a-zA-Z0-9*])/g,
      '<em style="font-style: italic;">$1</em>'
    );
    
    // 커스텀 강조
    processedText = processedText.replace(
      /\$(.*?)\$/g,
      `<span style="background-color: ${config.emphasisColor}; color: #ffffff; padding: 0 2px; border-radius: 3px;">$1</span>`
    );
    processedText = processedText.replace(
      /\^(.*?)\^/g,
      `<span style="background-color: ${config.highlightColor}; color: #ffffff; padding: 0 2px; border-radius: 3px;">$1</span>`
    );
    
    // 줄바꿈 처리
    processedText = processedText.replace(/\n/g, '<br>');
    
    return processedText;
  };

  // 메인 HTML 생성 함수
  const formatChatToHTML = (chatTexts: string[], settings: ChatchanConfig): string => {
    // 단어 변환 적용
    const processedChatTexts = chatTexts.map(text => applyWordReplacements(text));
    const {
      characterName = '?',
      modelName = '?',
      promptName = '?',
      assistModelName = '?',
      userName = 'USER',
      chatNumber,
      characterImageUrl = '',
      useCharacterImage = true,
      backgroundColor = '#ffffff',
      textColor = '#1d2129',
      highlightColor = '#3498db',
      promptColor = '#6c757d',
      emphasisColor = '#1f618d',
      baseFontSize = 15,
      titleFontSize = 38,
      containerWidth = 650,
      logSectionRadius = 12,
      lineHeight = 1.6,
      letterSpacing = 0,
      italicizeNarration = true,
      simpleOutputMode = false,
      disableChatLogCollapse = false,
      isAutoInputMode = false,
      dialogueUseBubble = true,
      narrationUseLine = true,
      showBriefHeaderInfo = false
    } = settings;

    const chatNum = chatNumber || Math.floor(Math.random() * 900) + 100;
    const bgColorIsDark = parseInt(backgroundColor.slice(1), 16) < 0x888888;
    const elementBgColor = adjustColor(backgroundColor, bgColorIsDark ? +5 : -5);
    const darkElementBgColor = adjustColor(backgroundColor, bgColorIsDark ? +10 : -10);
    const narrationColor = adjustColor(textColor, bgColorIsDark ? -30 : +30);
    const messageTextColor = textColor;
    const borderColor = adjustColor(elementBgColor, bgColorIsDark ? +15 : -15);

    const currentDate = getCurrentDate();
    let html = `<div style="width: 100%; max-width: ${containerWidth}px; margin: 10px auto; background-color: ${backgroundColor}; border-radius: 0; overflow: hidden; font-family: 'Pretendard', Arial, sans-serif; letter-spacing: -0.03em; color: ${textColor}; border: 1px solid ${borderColor}; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">`;

    if (!simpleOutputMode) {
      // 헤더 생성
      let headerInfoSpanContent = '';
      if (showBriefHeaderInfo) {
        const styledNameParts = [];
        const getQuoteLineStyle = (color: string) => {
          const validColor = color || '#888888';
          return `display: inline-block; background-color: ${validColor}; padding:0.1em 0.3em; border: 1px solid ${adjustColor(validColor, -10)};`;
        };
        
        if (modelName) {
          const style = getQuoteLineStyle(highlightColor);
          styledNameParts.push(`<span style="${style}">${modelName}</span>`);
        }
        if (promptName) {
          const style = getQuoteLineStyle(promptColor);
          styledNameParts.push(`<span style="${style}">${promptName}</span>`);
        }
        if (assistModelName) {
          const style = getQuoteLineStyle(emphasisColor);
          styledNameParts.push(`<span style="${style}">${assistModelName}</span>`);
        }
        
        if (styledNameParts.length > 0) {
          const joinedStyledNames = styledNameParts.join('&ensp;');
          const outerSpanStyle = `font-size: 11px; font-weight: 400; color:#ffffff; line-height:1; letter-spacing:0em`;
          headerInfoSpanContent = `<span style="${outerSpanStyle}">${joinedStyledNames}</span>`;
        }
      } else {
        headerInfoSpanContent = `#${chatNum}`;
      }

      html += `<div style="background-color: ${elementBgColor}; padding: 32px 40px; border-bottom: 1px solid ${borderColor};"> <div style="display: block; margin-bottom: 8px; text-align: left;"> <span style="font-size: 14px; color: ${narrationColor}; font-weight: 500;">${headerInfoSpanContent || '&nbsp;'}</span> </div> <h1 style="font-size: ${titleFontSize}px; margin: 0; font-weight: 700; color: ${textColor}; line-height: 1.2;">CHAT LOG</h1> </div>`;
      
      // 캐릭터 정보 섹션
      html += `<div class="log-section character-info" style="background-color: ${elementBgColor}; margin: 16px 20px; border-radius: ${logSectionRadius}px; overflow: hidden; border: 1px solid ${borderColor}; padding: 32px;"> <div style="width: 100%; display: block; text-align: center;">`;
      
      // 캐릭터 이미지 출력 (배너형 스타일 적용)
      if (useCharacterImage) {
        if (characterImageUrl) {
          const imageUrl = normalizeImageUrl(characterImageUrl)
          html += `<div style="margin-bottom: 1rem; text-align: center; width: 100%;"><img src="${imageUrl.replace(/"/g, '&quot;')}" alt="${characterName.replace(/"/g, '&quot;')}" style="max-width: 100%; border-radius: 12px; box-shadow: rgba(0, 0, 0, 0.12) 0px 4px 16px; margin: 0 auto; display: block;"></div>`;
        } else {
          html += `<div style="font-size: 12px; color: ${narrationColor}; padding: 20px 10px; line-height: 1.4; margin: 15px auto; text-align: center;">이 문구를 지우고 이미지를 삽입해주세요</div>`;
        }
      }
      
      // 메시지 헤더
      html += `<h2 style="font-size: 28px; color: ${textColor}; margin: 0 0 6px 0; font-weight: 700; border: none; padding: 0;">${characterName}</h2> <div style="margin: 8px 0; font-size: ${baseFontSize}px; color: ${messageTextColor}; display: block; text-align: center;">`;
      
      if (!showBriefHeaderInfo) {
        html += `<div style="margin: 8px 0; font-size: ${baseFontSize}px; color: ${messageTextColor}; display: block; text-align: center;">`;
        if (modelName) {
          html += `<span style="display: inline-block; background-color: ${highlightColor}; padding: 6px 10px; border-radius: 6px; font-weight: 500; color: #ffffff; text-align: center; border: 1px solid ${adjustColor(highlightColor, -10)}; margin: 0 5px 10px;">${modelName}</span>`;
        }
        if (promptName) {
          html += `<span style="display: inline-block; background-color: ${promptColor}; padding: 6px 10px; border-radius: 6px; font-weight: 500; color: #ffffff; text-align: center; border: 1px solid ${adjustColor(promptColor, -10)}; margin: 0 5px 10px;">${promptName}</span>`;
        }
        if (assistModelName) {
          html += `<span style="display: inline-block; background-color: ${emphasisColor}; padding: 6px 10px; border-radius: 6px; font-weight: 500; color: #ffffff; text-align: center; border: 1px solid ${adjustColor(emphasisColor, -10)}; margin: 0 5px 10px;">${assistModelName}</span>`;
        }
        html += `</div>`;
      }
      html += `</div></div></div>`;
      html += `<div class="log-section conversation-header" style="background-color: ${elementBgColor}; margin: 0 20px 16px; border-radius: ${logSectionRadius}px; overflow: hidden; border: 1px solid ${borderColor}; padding: 20px 32px;"> <div style="font-size: 12px; font-weight: 600; color: ${narrationColor}; margin-bottom: 4px;">MONO</div> <div style="font-size: 20px; font-weight: 700; color: ${textColor};">CONVERSATION</div> </div>`;
    }

    // 채팅 내용 처리
    processedChatTexts.forEach((chatText, index) => {
      if (!chatText?.trim() && chatTexts.length > 1 && index > 0) {
        return;
      }
      const lines = chatText.trim().split('\n');
      const chatParts: { type: string; content: string }[] = [];

      if (isAutoInputMode) {
        // 자동 인식(사칭방지용)
        let currentPart: { type: string; content: string[] } | null = null;
        for (let i = 0; i < lines.length; i++) {
          let line = lines[i].trim();
          if (!line) {
            if (currentPart && currentPart.content.length > 0) {
              chatParts.push({
                type: currentPart.type,
                content: currentPart.content.join('\n')
              });
              currentPart = null;
            }
            continue;
          }
          
          let lineType = 'narration';
          let lineContent = line;
          
          // 다양한 따옴표 허용 및 내용 추출
          const dialogueMatch = line.match(/^[""](.*?)[""]$/);
          if (dialogueMatch) {
            lineType = 'dialogue';
            lineContent = dialogueMatch[1];
          }
          
          if (!currentPart || currentPart.type !== lineType) {
            if (currentPart && currentPart.content.length > 0) {
              chatParts.push({
                type: currentPart.type,
                content: currentPart.content.join('\n')
              });
            }
            currentPart = { type: lineType, content: [lineContent] };
          } else {
            currentPart.content.push(lineContent);
          }
        }
        if (currentPart && currentPart.content.length > 0) {
          chatParts.push({ type: currentPart.type, content: currentPart.content.join('\n') });
        }
      } else {
        // 접두사(풀사칭용)
        let currentSpeaker: string | null = null;
        let currentContent: string[] = [];
        
        for (let i = 0; i < lines.length; i++) {
          let line = lines[i].trim();
          if (!line) {
            if (currentSpeaker && currentContent.length > 0) {
              chatParts.push({ type: currentSpeaker, content: currentContent.join('\n') });
              currentContent = [];
            }
            currentSpeaker = null;
            continue;
          }
          
          const userMatch = line.match(/^USER:\s*(.*)/i);
          const aiMatch = line.match(/^AI:\s*(.*)/i);
          const narrationMatch = line.match(/^([\*\-])\s*(.*)/);
          
          let speakerType: string | null = null;
          let contentText: string | null = null;
          
          if (userMatch) {
            speakerType = 'user';
            contentText = userMatch[1];
          } else if (aiMatch) {
            speakerType = 'ai';
            contentText = aiMatch[1];
          } else if (narrationMatch && !line.startsWith('**') && !line.startsWith('***') && !line.startsWith('$') && !line.startsWith('^')) {
            speakerType = 'narration';
            contentText = narrationMatch[2] || '';
          }
          
          if (speakerType) {
            if (currentSpeaker && currentContent.length > 0) {
              chatParts.push({ type: currentSpeaker, content: currentContent.join('\n') });
            }
            currentSpeaker = speakerType;
            currentContent = contentText ? [contentText] : [];
          } else {
            if (currentSpeaker) {
              currentContent.push(line);
            } else if (chatParts.length > 0 && chatParts[chatParts.length - 1].type === 'narration') {
              chatParts[chatParts.length - 1].content += '\n' + line;
            } else {
              chatParts.push({ type: 'narration', content: line });
              currentSpeaker = 'narration';
              currentContent = [];
            }
          }
        }
        if (currentSpeaker && currentContent.length > 0) {
          chatParts.push({ type: currentSpeaker, content: currentContent.join('\n') });
        }
      }

      if (chatParts.length > 0) {
        // HTML 렌더링
        const firstMargin = simpleOutputMode && index === 0 ? '20px' : '0';
        const containerTag = disableChatLogCollapse ? 'div' : 'details';
        const summaryTag = disableChatLogCollapse ? 'div' : 'summary';
        const detailsOpenAttribute = disableChatLogCollapse ? '' : ' open';
        const summaryCursorStyle = disableChatLogCollapse ? 'cursor: default;' : 'cursor: pointer;';

        html += `<div class="log-section chat-entry" style="margin: ${firstMargin} 20px 16px; background-color: ${elementBgColor}; border-radius: ${logSectionRadius}px; overflow: hidden; border: 1px solid ${borderColor};">`;
        html += `<${containerTag}${detailsOpenAttribute} style="padding: 0;">`;

        // 제목 (div/summary) - 패딩 적용, disable 시 테두리 추가
        const titleStyle = `padding: 15px 25px; list-style:none; outline: none; font-size: 20px; font-weight: 700; color: ${textColor}; display: block; ${summaryCursorStyle}`;
        const titleBorder = disableChatLogCollapse ? `border-bottom: 1px solid ${borderColor};` : '';
        html += `<${summaryTag} style="${titleStyle} ${titleBorder}">CHAT LOG ${index + 1}</${summaryTag}>`;

        // 내용 컨테이너 (div) - 패딩 및 배경색 항상 적용, radius는 조건부
        const contentPadding = 'padding: 15px 25px;';
        const contentBackground = `background-color: ${backgroundColor};`;
        const contentRadius = disableChatLogCollapse ? '' : `border-radius: 0 0 ${logSectionRadius - 1}px ${logSectionRadius - 1}px;`;
        html += `<div style="${contentPadding} ${contentBackground} ${contentRadius}">`;

        chatParts.forEach((part) => {
          const processedContent = processEmphasis(part.content);
          
          if (part.type === 'narration') {
            const textStyle = `font-size: ${baseFontSize}px; color: ${narrationColor}; line-height: ${lineHeight}; letter-spacing: ${letterSpacing}em; ${italicizeNarration ? 'font-style: italic;' : ''}`;
            if (narrationUseLine) {
              html += `<div style="margin: 16px 0; display: block; border-left: 3px solid ${highlightColor}; padding-left: 16px;"> <div style="${textStyle}">${processedContent || '&nbsp;'}</div> </div>`;
            } else {
              html += `<div style="margin: 16px 0; display: block; padding-left: 0;"> <div style="${textStyle}">${processedContent || '&nbsp;'}</div> </div>`;
            }
          } else if (part.type === 'user') {
            const userNameDisplay = `<div style="font-weight: 600; color: ${textColor}; margin-bottom: 8px; font-size: 14px; text-align: right;">${userName}</div>`;
            const textStyle = `font-size: ${baseFontSize}px; color: ${narrationColor}; line-height: ${lineHeight}; letter-spacing: ${letterSpacing}em;`;
            if (dialogueUseBubble) {
              html += `<div style="margin: 32px 0; text-align: right;"> <div style="max-width: 75%; display: inline-block; text-align: left;"> ${userNameDisplay} <div style="background-color: ${darkElementBgColor}; border-radius: 12px; padding: 10px 20px; border: 1px solid ${borderColor}; ${textStyle};">${processedContent || '&nbsp;'}</div> </div> </div>`;
            } else {
              html += `<div style="margin: 32px 0; text-align: right;"> <div style="max-width: 75%; display: inline-block; text-align: right;"> ${userNameDisplay} <div style="display: inline-block; text-align: left; background-color: ${darkElementBgColor}; border-right: 3px solid ${emphasisColor}; padding: 10px 20px; ${textStyle};">${processedContent || '&nbsp;'}</div> </div> </div>`;
            }
          } else if (part.type === 'ai') {
            const characterNameDisplay = `<div style="font-weight: 600; color: ${textColor}; margin-bottom: 8px; font-size: 14px;">${characterName}</div>`;
            const textStyle = `font-size: ${baseFontSize}px; color: ${narrationColor}; line-height: ${lineHeight}; letter-spacing: ${letterSpacing}em;`;
            if (dialogueUseBubble) {
              html += `<div style="margin: 32px 0; text-align: left;"> <div style="max-width: 75%; display: inline-block;"> ${characterNameDisplay} <div style="background-color: ${backgroundColor}; border-radius: 12px; padding: 10px 20px; border: 1px solid ${highlightColor}; ${textStyle};">${processedContent || '&nbsp;'}</div> </div> </div>`;
            } else {
              html += `<div style="margin: 32px 0; text-align: left;"> <div style="max-width: 75%; display: inline-block;"> ${characterNameDisplay} <div style="display: inline-block; background-color: ${darkElementBgColor}; border-left: 3px solid ${emphasisColor}; padding: 10px 20px; ${textStyle};">${processedContent || '&nbsp;'}</div> </div> </div>`;
            }
          } else if (part.type === 'dialogue') {
            const textStyle = `font-size: ${baseFontSize}px; color: ${narrationColor}; line-height: ${lineHeight}; letter-spacing: ${letterSpacing}em;`;
            if (dialogueUseBubble) {
              html += `<div style="margin: 32px 0; text-align: left;"> <div style="display: inline-block; background-color: ${darkElementBgColor}; border-radius: 12px; padding: 10px 20px; ${textStyle};">${processedContent || '&nbsp;'}</div> </div>`;
            } else {
              html += `<div style="margin: 32px 0; text-align: left;"> <div style="display: inline-block; border-left: 3px solid ${emphasisColor}; background-color: ${darkElementBgColor}; padding: 5px 16px; ${textStyle};">${processedContent || '&nbsp;'}</div> </div>`;
            }
          }
        });
        html += `</div>`;
        html += `</${containerTag}>`;
        html += `</div>`;
      }
    });

    html += `<div style="background-color: ${elementBgColor}; padding: 24px 40px; text-align: right; font-size: 13px; color: ${narrationColor}; border-top: 1px solid ${borderColor};"> <div style="display: inline-block; margin-right: 20px;">CHAT LOG | ${characterName || 'Log'}</div> <div style="display: inline-block;">${currentDate}</div> </div>`;
    html += `</div>`;

    return html;
  };

  // 미리보기용 HTML 생성 함수 (프록시 이미지 사용)
  const formatChatToPreviewHTML = (chatTexts: string[], settings: ChatchanConfig): string => {
    // 단어 변환 적용
    const processedChatTexts = chatTexts.map(text => applyWordReplacements(text));
    const {
      characterName = '?',
      modelName = '?',
      promptName = '?',
      assistModelName = '?',
      userName = 'USER',
      chatNumber,
      characterImageUrl = '',
      useCharacterImage = true,
      backgroundColor = '#ffffff',
      textColor = '#1d2129',
      highlightColor = '#3498db',
      promptColor = '#6c757d',
      emphasisColor = '#1f618d',
      baseFontSize = 15,
      titleFontSize = 38,
      containerWidth = 650,
      logSectionRadius = 12,
      lineHeight = 1.6,
      letterSpacing = 0,
      italicizeNarration = true,
      simpleOutputMode = false,
      disableChatLogCollapse = false,
      isAutoInputMode = false,
      dialogueUseBubble = true,
      narrationUseLine = true,
      showBriefHeaderInfo = false
    } = settings;

    const chatNum = chatNumber || Math.floor(Math.random() * 900) + 100;
    const bgColorIsDark = parseInt(backgroundColor.slice(1), 16) < 0x888888;
    const elementBgColor = adjustColor(backgroundColor, bgColorIsDark ? +5 : -5);
    const darkElementBgColor = adjustColor(backgroundColor, bgColorIsDark ? +10 : -10);
    const narrationColor = adjustColor(textColor, bgColorIsDark ? -30 : +30);
    const messageTextColor = textColor;
    const borderColor = adjustColor(elementBgColor, bgColorIsDark ? +15 : -15);

    const currentDate = getCurrentDate();
    let html = `<div style="width: 100%; max-width: ${containerWidth}px; margin: 10px auto; background-color: ${backgroundColor}; border-radius: 0; overflow: hidden; font-family: 'Pretendard', Arial, sans-serif; letter-spacing: -0.03em; color: ${textColor}; border: 1px solid ${borderColor}; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">`;

    if (!simpleOutputMode) {
      // 헤더 생성
      let headerInfoSpanContent = '';
      if (showBriefHeaderInfo) {
        const styledNameParts = [];
        const getQuoteLineStyle = (color: string) => {
          const validColor = color || '#888888';
          return `display: inline-block; background-color: ${validColor}; padding:0.1em 0.3em; border: 1px solid ${adjustColor(validColor, -10)};`;
        };
        
        if (modelName) {
          const style = getQuoteLineStyle(highlightColor);
          styledNameParts.push(`<span style="${style}">${modelName}</span>`);
        }
        if (promptName) {
          const style = getQuoteLineStyle(promptColor);
          styledNameParts.push(`<span style="${style}">${promptName}</span>`);
        }
        if (assistModelName) {
          const style = getQuoteLineStyle(emphasisColor);
          styledNameParts.push(`<span style="${style}">${assistModelName}</span>`);
        }
        
        if (styledNameParts.length > 0) {
          const joinedStyledNames = styledNameParts.join('&ensp;');
          const outerSpanStyle = `font-size: 11px; font-weight: 400; color:#ffffff; line-height:1; letter-spacing:0em`;
          headerInfoSpanContent = `<span style="${outerSpanStyle}">${joinedStyledNames}</span>`;
        }
      } else {
        headerInfoSpanContent = `#${chatNum}`;
      }

      html += `<div style="background-color: ${elementBgColor}; padding: 32px 40px; border-bottom: 1px solid ${borderColor};"> <div style="display: block; margin-bottom: 8px; text-align: left;"> <span style="font-size: 14px; color: ${narrationColor}; font-weight: 500;">${headerInfoSpanContent || '&nbsp;'}</span> </div> <h1 style="font-size: ${titleFontSize}px; margin: 0; font-weight: 700; color: ${textColor}; line-height: 1.2;">CHAT LOG</h1> </div>`;
      
      // 캐릭터 정보 섹션
      html += `<div class="log-section character-info" style="background-color: ${elementBgColor}; margin: 16px 20px; border-radius: ${logSectionRadius}px; overflow: hidden; border: 1px solid ${borderColor}; padding: 32px;"> <div style="width: 100%; display: block; text-align: center;">`;
      
      // 캐릭터 이미지 출력 (미리보기용 - 프록시 이미지 사용, 배너형 스타일 적용)
      if (useCharacterImage) {
        if (characterImageUrl) {
          const imageUrl = getPreviewImageUrl(characterImageUrl)
          html += `<div style="margin-bottom: 1rem; text-align: center; width: 100%;"><img src="${imageUrl.replace(/"/g, '&quot;')}" alt="${characterName.replace(/"/g, '&quot;')}" style="max-width: 100%; border-radius: 12px; box-shadow: rgba(0, 0, 0, 0.12) 0px 4px 16px; margin: 0 auto; display: block;"></div>`;
        } else {
          html += `<div style="font-size: 12px; color: ${narrationColor}; padding: 20px 10px; line-height: 1.4; margin: 15px auto; text-align: center;">이 문구를 지우고 이미지를 삽입해주세요</div>`;
        }
      }
      
      // 메시지 헤더
      html += `<h2 style="font-size: 28px; color: ${textColor}; margin: 0 0 6px 0; font-weight: 700; border: none; padding: 0;">${characterName}</h2> <div style="margin: 8px 0; font-size: ${baseFontSize}px; color: ${messageTextColor}; display: block; text-align: center;">`;
      
      if (!showBriefHeaderInfo) {
        html += `<div style="margin: 8px 0; font-size: ${baseFontSize}px; color: ${messageTextColor}; display: block; text-align: center;">`;
        if (modelName) {
          html += `<span style="display: inline-block; background-color: ${highlightColor}; padding: 6px 10px; border-radius: 6px; font-weight: 500; color: #ffffff; text-align: center; border: 1px solid ${adjustColor(highlightColor, -10)}; margin: 0 5px 10px;">${modelName}</span>`;
        }
        if (promptName) {
          html += `<span style="display: inline-block; background-color: ${promptColor}; padding: 6px 10px; border-radius: 6px; font-weight: 500; color: #ffffff; text-align: center; border: 1px solid ${adjustColor(promptColor, -10)}; margin: 0 5px 10px;">${promptName}</span>`;
        }
        if (assistModelName) {
          html += `<span style="display: inline-block; background-color: ${emphasisColor}; padding: 6px 10px; border-radius: 6px; font-weight: 500; color: #ffffff; text-align: center; border: 1px solid ${adjustColor(emphasisColor, -10)}; margin: 0 5px 10px;">${assistModelName}</span>`;
        }
        html += `</div>`;
      }
      html += `</div></div></div>`;
      html += `<div class="log-section conversation-header" style="background-color: ${elementBgColor}; margin: 0 20px 16px; border-radius: ${logSectionRadius}px; overflow: hidden; border: 1px solid ${borderColor}; padding: 20px 32px;"> <div style="font-size: 12px; font-weight: 600; color: ${narrationColor}; margin-bottom: 4px;">MONO</div> <div style="font-size: 20px; font-weight: 700; color: ${textColor};">CONVERSATION</div> </div>`;
    }

    // 채팅 내용 처리 (기존과 동일)
    processedChatTexts.forEach((chatText, index) => {
      if (!chatText?.trim() && chatTexts.length > 1 && index > 0) {
        return;
      }
      const lines = chatText.trim().split('\n');
      const chatParts: { type: string; content: string }[] = [];

      if (isAutoInputMode) {
        // 자동 인식(사칭방지용)
        let currentPart: { type: string; content: string[] } | null = null;
        for (let i = 0; i < lines.length; i++) {
          let line = lines[i].trim();
          if (!line) {
            if (currentPart && currentPart.content.length > 0) {
              chatParts.push({
                type: currentPart.type,
                content: currentPart.content.join('\n')
              });
              currentPart = null;
            }
            continue;
          }
          
          let lineType = 'narration';
          let lineContent = line;
          
          // 다양한 따옴표 허용 및 내용 추출
          const dialogueMatch = line.match(/^[""](.*?)[""]$/);
          if (dialogueMatch) {
            lineType = 'dialogue';
            lineContent = dialogueMatch[1];
          }
          
          if (!currentPart || currentPart.type !== lineType) {
            if (currentPart && currentPart.content.length > 0) {
              chatParts.push({
                type: currentPart.type,
                content: currentPart.content.join('\n')
              });
            }
            currentPart = { type: lineType, content: [lineContent] };
          } else {
            currentPart.content.push(lineContent);
          }
        }
        if (currentPart && currentPart.content.length > 0) {
          chatParts.push({ type: currentPart.type, content: currentPart.content.join('\n') });
        }
      } else {
        // 접두사(풀사칭용)
        let currentSpeaker: string | null = null;
        let currentContent: string[] = [];
        
        for (let i = 0; i < lines.length; i++) {
          let line = lines[i].trim();
          if (!line) {
            if (currentSpeaker && currentContent.length > 0) {
              chatParts.push({ type: currentSpeaker, content: currentContent.join('\n') });
              currentContent = [];
            }
            currentSpeaker = null;
            continue;
          }
          
          const userMatch = line.match(/^USER:\s*(.*)/i);
          const aiMatch = line.match(/^AI:\s*(.*)/i);
          const narrationMatch = line.match(/^([\*\-])\s*(.*)/);
          
          let speakerType: string | null = null;
          let contentText: string | null = null;
          
          if (userMatch) {
            speakerType = 'user';
            contentText = userMatch[1];
          } else if (aiMatch) {
            speakerType = 'ai';
            contentText = aiMatch[1];
          } else if (narrationMatch && !line.startsWith('**') && !line.startsWith('***') && !line.startsWith('$') && !line.startsWith('^')) {
            speakerType = 'narration';
            contentText = narrationMatch[2] || '';
          }
          
          if (speakerType) {
            if (currentSpeaker && currentContent.length > 0) {
              chatParts.push({ type: currentSpeaker, content: currentContent.join('\n') });
            }
            currentSpeaker = speakerType;
            currentContent = contentText ? [contentText] : [];
          } else {
            if (currentSpeaker) {
              currentContent.push(line);
            } else if (chatParts.length > 0 && chatParts[chatParts.length - 1].type === 'narration') {
              chatParts[chatParts.length - 1].content += '\n' + line;
            } else {
              chatParts.push({ type: 'narration', content: line });
              currentSpeaker = 'narration';
              currentContent = [];
            }
          }
        }
        if (currentSpeaker && currentContent.length > 0) {
          chatParts.push({ type: currentSpeaker, content: currentContent.join('\n') });
        }
      }

      if (chatParts.length > 0) {
        // HTML 렌더링
        const firstMargin = simpleOutputMode && index === 0 ? '20px' : '0';
        const containerTag = disableChatLogCollapse ? 'div' : 'details';
        const summaryTag = disableChatLogCollapse ? 'div' : 'summary';
        const detailsOpenAttribute = disableChatLogCollapse ? '' : ' open';
        const summaryCursorStyle = disableChatLogCollapse ? 'cursor: default;' : 'cursor: pointer;';

        html += `<div class="log-section chat-entry" style="margin: ${firstMargin} 20px 16px; background-color: ${elementBgColor}; border-radius: ${logSectionRadius}px; overflow: hidden; border: 1px solid ${borderColor};">`;
        html += `<${containerTag}${detailsOpenAttribute} style="padding: 0;">`;

        // 제목 (div/summary) - 패딩 적용, disable 시 테두리 추가
        const titleStyle = `padding: 15px 25px; list-style:none; outline: none; font-size: 20px; font-weight: 700; color: ${textColor}; display: block; ${summaryCursorStyle}`;
        const titleBorder = disableChatLogCollapse ? `border-bottom: 1px solid ${borderColor};` : '';
        html += `<${summaryTag} style="${titleStyle} ${titleBorder}">CHAT LOG ${index + 1}</${summaryTag}>`;

        // 내용 컨테이너 (div) - 패딩 및 배경색 항상 적용, radius는 조건부
        const contentPadding = 'padding: 15px 25px;';
        const contentBackground = `background-color: ${backgroundColor};`;
        const contentRadius = disableChatLogCollapse ? '' : `border-radius: 0 0 ${logSectionRadius - 1}px ${logSectionRadius - 1}px;`;
        html += `<div style="${contentPadding} ${contentBackground} ${contentRadius}">`;

        chatParts.forEach((part) => {
          const processedContent = processEmphasis(part.content);
          
          if (part.type === 'narration') {
            const textStyle = `font-size: ${baseFontSize}px; color: ${narrationColor}; line-height: ${lineHeight}; letter-spacing: ${letterSpacing}em; ${italicizeNarration ? 'font-style: italic;' : ''}`;
            if (narrationUseLine) {
              html += `<div style="margin: 16px 0; display: block; border-left: 3px solid ${highlightColor}; padding-left: 16px;"> <div style="${textStyle}">${processedContent || '&nbsp;'}</div> </div>`;
            } else {
              html += `<div style="margin: 16px 0; display: block; padding-left: 0;"> <div style="${textStyle}">${processedContent || '&nbsp;'}</div> </div>`;
            }
          } else if (part.type === 'user') {
            const userNameDisplay = `<div style="font-weight: 600; color: ${textColor}; margin-bottom: 8px; font-size: 14px; text-align: right;">${userName}</div>`;
            const textStyle = `font-size: ${baseFontSize}px; color: ${narrationColor}; line-height: ${lineHeight}; letter-spacing: ${letterSpacing}em;`;
            if (dialogueUseBubble) {
              html += `<div style="margin: 32px 0; text-align: right;"> <div style="max-width: 75%; display: inline-block; text-align: left;"> ${userNameDisplay} <div style="background-color: ${darkElementBgColor}; border-radius: 12px; padding: 10px 20px; border: 1px solid ${borderColor}; ${textStyle};">${processedContent || '&nbsp;'}</div> </div> </div>`;
            } else {
              html += `<div style="margin: 32px 0; text-align: right;"> <div style="max-width: 75%; display: inline-block; text-align: right;"> ${userNameDisplay} <div style="display: inline-block; text-align: left; background-color: ${darkElementBgColor}; border-right: 3px solid ${emphasisColor}; padding: 10px 20px; ${textStyle};">${processedContent || '&nbsp;'}</div> </div> </div>`;
            }
          } else if (part.type === 'ai') {
            const characterNameDisplay = `<div style="font-weight: 600; color: ${textColor}; margin-bottom: 8px; font-size: 14px;">${characterName}</div>`;
            const textStyle = `font-size: ${baseFontSize}px; color: ${narrationColor}; line-height: ${lineHeight}; letter-spacing: ${letterSpacing}em;`;
            if (dialogueUseBubble) {
              html += `<div style="margin: 32px 0; text-align: left;"> <div style="max-width: 75%; display: inline-block;"> ${characterNameDisplay} <div style="background-color: ${backgroundColor}; border-radius: 12px; padding: 10px 20px; border: 1px solid ${highlightColor}; ${textStyle};">${processedContent || '&nbsp;'}</div> </div> </div>`;
            } else {
              html += `<div style="margin: 32px 0; text-align: left;"> <div style="max-width: 75%; display: inline-block;"> ${characterNameDisplay} <div style="display: inline-block; background-color: ${darkElementBgColor}; border-left: 3px solid ${emphasisColor}; padding: 10px 20px; ${textStyle};">${processedContent || '&nbsp;'}</div> </div> </div>`;
            }
          } else if (part.type === 'dialogue') {
            const textStyle = `font-size: ${baseFontSize}px; color: ${narrationColor}; line-height: ${lineHeight}; letter-spacing: ${letterSpacing}em;`;
            if (dialogueUseBubble) {
              html += `<div style="margin: 32px 0; text-align: left;"> <div style="display: inline-block; background-color: ${darkElementBgColor}; border-radius: 12px; padding: 10px 20px; ${textStyle};">${processedContent || '&nbsp;'}</div> </div>`;
            } else {
              html += `<div style="margin: 32px 0; text-align: left;"> <div style="display: inline-block; border-left: 3px solid ${emphasisColor}; background-color: ${darkElementBgColor}; padding: 5px 16px; ${textStyle};">${processedContent || '&nbsp;'}</div> </div>`;
            }
          }
        });
        html += `</div>`;
        html += `</${containerTag}>`;
        html += `</div>`;
      }
    });

    html += `<div style="background-color: ${elementBgColor}; padding: 24px 40px; text-align: right; font-size: 13px; color: ${narrationColor}; border-top: 1px solid ${borderColor};"> <div style="display: inline-block; margin-right: 20px;">CHAT LOG | ${characterName || 'Log'}</div> <div style="display: inline-block;">${currentDate}</div> </div>`;
    html += `</div>`;

    return html;
  };

  const generateHTML = useMemo(() => {
    // 특별한 구분자로 분할하여 채팅섹션 추가로 생성된 섹션만 분리
    // 일반 줄바꿈(1-2개)으로는 새로운 챗로그를 만들지 않음
    const chatTexts = config.content ? 
      config.content.split(/\n\n==CHAT_SECTION_SEPARATOR==\n\n/).filter(text => text.trim()) : 
      [''];
    return formatChatToHTML(chatTexts.length > 0 ? chatTexts : [''], config);
  }, [config]);

  const generatePreviewHTML = useMemo(() => {
    // 특별한 구분자로 분할하여 채팅섹션 추가로 생성된 섹션만 분리
    // 일반 줄바꿈(1-2개)으로는 새로운 챗로그를 만들지 않음
    const chatTexts = config.content ? 
      config.content.split(/\n\n==CHAT_SECTION_SEPARATOR==\n\n/).filter(text => text.trim()) : 
      [''];
    return formatChatToPreviewHTML(chatTexts.length > 0 ? chatTexts : [''], config);
  }, [config]);

  return {
    generateHTML: () => generateHTML,
    generatePreviewHTML: () => generatePreviewHTML
  };
}; 