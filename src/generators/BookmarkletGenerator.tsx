import React from 'react'

interface WordReplacement {
  from: string;
  to: string;
}

// 채팅 섹션 인터페이스 추가
interface ChatSection {
  id: string;
  content: string;
}

interface BookmarkletConfig {
  content: string;
  backgroundColor: string;
  textColor: string;
  highlightColor: string;
  emphasisColor: string;
  fontSize: number;
  lineHeight: number;
  containerWidth: number;
  borderRadius: number;
  padding: number;
  boxShadow: string;
  wordReplacements: WordReplacement[];
  // chatSections 추가
  chatSections?: ChatSection[];
}

interface BookmarkletGeneratorProps {
  config: BookmarkletConfig;
}

const BookmarkletGenerator = ({ config }: BookmarkletGeneratorProps) => {
  const applyWordReplacements = (text: string) => {
    if (!text || typeof text !== 'string') {
      return ''
    }
    
    let processedText = text
    config.wordReplacements.forEach(replacement => {
      if (replacement.from && replacement.to) {
        processedText = processedText.replace(new RegExp(replacement.from, 'g'), replacement.to)
      }
    })
    return processedText
  }

  // 자동 강조 기능 - 큰따옴표는 주황강조, 작은따옴표는 파란강조
  const applyAutoHighlight = (text: string) => {
    if (!text || typeof text !== 'string') {
      return ''
    }
    
    // 이미 span 태그로 감싸진 부분은 건드리지 않도록 보호
    const protectedParts: string[] = [];
    let protectedText = text;
    
    // 기존 span 태그들을 임시로 보호
    protectedText = protectedText.replace(/<span[^>]*>.*?<\/span>/g, (match) => {
      const index = protectedParts.length;
      protectedParts.push(match);
      return `__PROTECTED_${index}__`;
    });

    // 큰따옴표 처리 (대사문) - 주황강조
    protectedText = protectedText.replace(/"([^"]*)"/g, '<span style="color: rgb(255, 184, 108);">"$1"</span>');
    
    // 작은따옴표 처리 (생각문) - 파란강조 (작은따옴표 그대로 유지)
    protectedText = protectedText.replace(/'([^']*)'/g, '<span style="color: rgb(139, 233, 253);">\'$1\'</span>');

    // 보호된 부분들을 복원
    protectedParts.forEach((part, index) => {
      protectedText = protectedText.replace(`__PROTECTED_${index}__`, part);
    });

    return protectedText;
  }

  const processContent = (content: string) => {
    if (!content || typeof content !== 'string') {
      return '<p>내용을 입력해주세요.</p>';
    }

    const processedContent = applyWordReplacements(content);
    
    // 줄바꿈을 기준으로 분할 (연속된 줄바꿈은 문단 구분으로 처리)
    const lines = processedContent.split('\n');
    const paragraphs: string[] = [];
    let currentParagraph: string[] = [];

    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      if (trimmedLine === '') {
        // 빈 줄을 만나면 현재 문단을 마무리
        if (currentParagraph.length > 0) {
          paragraphs.push(currentParagraph.join('\n'));
          currentParagraph = [];
        }
        // 빈 줄도 하나의 "문단"으로 추가 (줄바꿈 효과)
        paragraphs.push('');
      } else {
        currentParagraph.push(line);
      }
    });

    // 마지막 문단 처리
    if (currentParagraph.length > 0) {
      paragraphs.push(currentParagraph.join('\n'));
    }

    return paragraphs.map(paragraph => {
      // 빈 문단은 줄바꿈으로 처리
      if (paragraph.trim() === '') {
        return '<p>&nbsp;</p>';
      }
      
      // 자동 강조 적용
      const highlightedParagraph = applyAutoHighlight(paragraph.trim());
      
      // 문단 내 줄바꿈은 <br> 태그로 변환
      const paragraphWithBreaks = highlightedParagraph.replace(/\n/g, '<br>');
      
      return `<p>${paragraphWithBreaks}</p>`;
    }).join('\n\n\t');
  }

  const generateHTML = () => {
    // chatSections이 있으면 사용, 없으면 기존 content 사용
    const sections = config.chatSections && config.chatSections.length > 0 
      ? config.chatSections 
      : [{ id: 'default', content: config.content }];

    let allHTML = '';

    sections.forEach((section, index) => {
      if (!section.content.trim()) return;

      const contentHTML = processContent(section.content);

      if (index === 0) {
        // 첫 번째 섹션: 전체 컨테이너 스타일 적용
        allHTML += `<div style="max-width: ${config.containerWidth}px; border-radius: ${config.borderRadius}px; margin: 0 auto; padding: ${config.padding}rem; box-shadow: ${config.boxShadow}; background-color: ${config.backgroundColor}; color: ${config.textColor}; font-size: ${config.fontSize}px; line-height: ${config.lineHeight};">

\t${contentHTML}

</div>`;
      } else {
        // 추가 섹션: 간단한 스타일로 추가 (섹션 사이에 여백 추가)
        allHTML += `<p><br></p><div style="max-width: ${config.containerWidth}px; border-radius: ${config.borderRadius}px; margin: 0 auto; padding: ${config.padding}rem; box-shadow: ${config.boxShadow}; background-color: ${config.backgroundColor}; color: ${config.textColor}; font-size: ${config.fontSize}px; line-height: ${config.lineHeight};">

\t${contentHTML}

</div>`;
      }
    });

    return allHTML || `<div style="max-width: ${config.containerWidth}px; border-radius: ${config.borderRadius}px; margin: 0 auto; padding: ${config.padding}rem; box-shadow: ${config.boxShadow}; background-color: ${config.backgroundColor}; color: ${config.textColor}; font-size: ${config.fontSize}px; line-height: ${config.lineHeight};">

\t<p>내용을 입력해주세요.</p>

</div>`;
  }

  return {
    generateHTML
  }
}

export default BookmarkletGenerator 