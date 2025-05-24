import { useMemo } from 'react';

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
}

export const useChatchanGeneratorV2 = (config: ChatchanConfig) => {
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
          const outerSpanStyle = `font-size: 11px; font-weight: 400; color:#fff; line-height:1; letter-spacing:0em`;
          headerInfoSpanContent = `<span style="${outerSpanStyle}">${joinedStyledNames}</span>`;
        }
      } else {
        headerInfoSpanContent = `#${chatNum}`;
      }

      html += `<div style="background-color: ${elementBgColor}; padding: 32px 40px; border-bottom: 1px solid ${borderColor};"> <div style="display: block; margin-bottom: 8px; text-align: left;"> <span style="font-size: 14px; color: ${narrationColor}; font-weight: 500;">${headerInfoSpanContent || '&nbsp;'}</span> </div> <h1 style="font-size: ${titleFontSize}px; margin: 0; font-weight: 700; color: ${textColor}; line-height: 1.2;">CHAT LOG</h1> </div>`;
      
      // 캐릭터 정보 섹션
      html += `<div class="log-section character-info" style="background-color: ${elementBgColor}; margin: 16px 20px; border-radius: ${logSectionRadius}px; overflow: hidden; border: 1px solid ${borderColor}; padding: 32px;"> <div style="width: 100%; display: block; text-align: center;">`;
      
      // 캐릭터 이미지 출력
      if (useCharacterImage) {
        if (characterImageUrl) {
          html += `<img src="${characterImageUrl.replace(/"/g, '&quot;')}" alt="${characterName.replace(/"/g, '&quot;')}" style="max-width: 150px; max-height: 150px; border-radius: 50%; margin: 0 auto 15px auto; display: block; border: 3px solid ${borderColor}; object-fit: cover;">`;
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
    chatTexts.forEach((chatText, index) => {
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
    const chatTexts = config.content ? [config.content] : [''];
    return formatChatToHTML(chatTexts, config);
  }, [config]);

  return {
    generateHTML: () => generateHTML
  };
}; 