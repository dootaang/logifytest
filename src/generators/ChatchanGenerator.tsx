import React from 'react';

interface WordReplacement {
  from: string;
  to: string;
}

interface Config {
  backgroundImage: string;
  leftText: string;
  rightText: string;
  leftTextColor1: string;
  leftTextColor2: string;
  quoteColor1: string;
  quoteColor2: string;
  quoteColorEnabled: boolean;
  quoteGradientEnabled: boolean;
  boldEnabled: boolean;
  singleQuoteItalic: boolean;
  singleQuoteColor: string;
  contentBackgroundColor: string;
  contentTextColor: string;
  fontSize: number;
  lineHeight: number;
  paragraphIndent: boolean;
  selectedTheme: string;
  selectedGenerator: string;
  wordReplacements: WordReplacement[];
  content: string;
}

interface ChatchanGeneratorProps {
  config: Config;
}

const ChatchanGenerator = ({ config }: ChatchanGeneratorProps) => {
  const normalizeImageUrl = (url: string): string => {
    if (!url) return '';
    if (url.startsWith('//')) {
      return 'https:' + url;
    }
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:')) {
      return 'https://' + url;
    }
    return url;
  };

  const applyWordReplacements = (text: string): string => {
    let processedText = text;
    config.wordReplacements.forEach(replacement => {
      if (replacement.from && replacement.to) {
        processedText = processedText.replace(new RegExp(replacement.from, 'g'), replacement.to);
      }
    });
    return processedText;
  };

  const generateHTML = (): string => {
    const processedContent = applyWordReplacements(config.content);
    const paragraphs = processedContent.split('\n\n').filter(p => p.trim());
    
    const contentHTML = paragraphs.map((paragraph, index) => {
      const trimmedParagraph = paragraph.trim();
      
      // 챗챈형은 메시지 박스 스타일
      if (trimmedParagraph.includes('"') && trimmedParagraph.includes('"')) {
        const beforeQuote = trimmedParagraph.split('"')[0];
        const quote = trimmedParagraph.split('"')[1];
        const afterQuote = trimmedParagraph.split('"')[2] || '';
        
        return `
        ${beforeQuote ? `<div style="margin: 15px 0; padding: 12px; background: #f8f9fa; border-radius: 8px; color: ${config.contentTextColor}; font-size: ${config.fontSize}px; line-height: ${config.lineHeight};">${beforeQuote}</div>` : ''}
        
        <div style="margin: 15px 0; padding: 15px 20px; background: linear-gradient(135deg, ${config.quoteColor1}, ${config.quoteColor2}); border-radius: 18px 18px 18px 6px; color: white; font-size: ${config.fontSize}px; line-height: ${config.lineHeight}; box-shadow: 0 2px 8px rgba(0,0,0,0.1); position: relative; max-width: 80%; margin-left: 20px;">
          <div style="position: absolute; left: -8px; bottom: 6px; width: 0; height: 0; border: 8px solid transparent; border-right-color: ${config.quoteColor1};"></div>
          <div style="font-weight: ${config.boldEnabled ? 'bold' : '500'};">"${quote}"</div>
        </div>
        
        ${afterQuote ? `<div style="margin: 15px 0; padding: 12px; background: #f8f9fa; border-radius: 8px; color: ${config.contentTextColor}; font-size: ${config.fontSize}px; line-height: ${config.lineHeight};">${afterQuote}</div>` : ''}`;
      } else if (trimmedParagraph.includes("'") && trimmedParagraph.includes("'")) {
        const beforeQuote = trimmedParagraph.split("'")[0];
        const quote = trimmedParagraph.split("'")[1];
        const afterQuote = trimmedParagraph.split("'")[2] || '';
        
        return `
        ${beforeQuote ? `<div style="margin: 15px 0; padding: 12px; background: #f8f9fa; border-radius: 8px; color: ${config.contentTextColor}; font-size: ${config.fontSize}px; line-height: ${config.lineHeight};">${beforeQuote}</div>` : ''}
        
        <div style="margin: 15px 0; padding: 12px 16px; background: ${config.singleQuoteColor}; border-radius: 18px 18px 6px 18px; color: white; font-size: ${config.fontSize}px; line-height: ${config.lineHeight}; box-shadow: 0 2px 8px rgba(0,0,0,0.1); position: relative; max-width: 75%; margin-right: 20px; margin-left: auto; font-style: ${config.singleQuoteItalic ? 'italic' : 'normal'};">
          <div style="position: absolute; right: -8px; bottom: 6px; width: 0; height: 0; border: 8px solid transparent; border-left-color: ${config.singleQuoteColor};"></div>
          '${quote}'
        </div>
        
        ${afterQuote ? `<div style="margin: 15px 0; padding: 12px; background: #f8f9fa; border-radius: 8px; color: ${config.contentTextColor}; font-size: ${config.fontSize}px; line-height: ${config.lineHeight};">${afterQuote}</div>` : ''}`;
      } else {
        return `<div style="margin: 15px 0; padding: 12px; background: #f8f9fa; border-radius: 8px; color: ${config.contentTextColor}; font-size: ${config.fontSize}px; line-height: ${config.lineHeight}; ${config.paragraphIndent ? 'text-indent: 1.5em;' : ''}">${trimmedParagraph}</div>`;
      }
    }).join('');

    const finalImageUrl = normalizeImageUrl(config.backgroundImage);

    return `<div style="background: ${config.contentBackgroundColor}; border: 1px solid #e1e5e9; border-radius: 12px; overflow: hidden; max-width: 600px; margin: 0 auto; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
  <!-- 챗 헤더 -->
  <div style="background: linear-gradient(135deg, ${config.leftTextColor1}, ${config.leftTextColor2}); padding: 16px 20px; display: flex; align-items: center; gap: 12px;">
    <div style="width: 40px; height: 40px; border-radius: 50%; background-image: url('${finalImageUrl}'); background-size: cover; background-position: center; border: 2px solid rgba(255,255,255,0.3);"></div>
    <div>
      <div style="color: white; font-weight: bold; font-size: 16px;">${config.leftText}</div>
      <div style="color: rgba(255,255,255,0.8); font-size: 12px;">${config.rightText}</div>
    </div>
    <div style="margin-left: auto; color: rgba(255,255,255,0.8); font-size: 12px;">●</div>
  </div>
  
  <!-- 채팅 내용 -->
  <div style="padding: 20px; background: #ffffff;">
    ${contentHTML}
  </div>
</div>`;
  };

  return {
    generateHTML
  };
};

export default ChatchanGenerator; 