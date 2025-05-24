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

interface BingdunGeneratorProps {
  config: Config;
}

const BingdunGenerator = ({ config }: BingdunGeneratorProps) => {
  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, 1`
      : '0, 0, 0, 1';
  };

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
    
    const contentHTML = paragraphs.map(paragraph => {
      const trimmedParagraph = paragraph.trim();
      
      let paragraphStyle = `color: ${config.contentTextColor}; font-size: ${config.fontSize}px; line-height: ${config.lineHeight}; margin-bottom: 18px; padding: 8px 0;`;
      if (config.paragraphIndent) {
        paragraphStyle += ' text-indent: 1.5em;';
      }
      
      // 빙둔형은 동글동글한 말풍선 스타일
      if (trimmedParagraph.includes('"') && trimmedParagraph.includes('"')) {
        const beforeQuote = trimmedParagraph.split('"')[0];
        const quote = trimmedParagraph.split('"')[1];
        const afterQuote = trimmedParagraph.split('"')[2] || '';
        
        let quoteStyle = `font-size: ${config.fontSize}px; padding: 15px 20px; margin: 15px 0; background: linear-gradient(135deg, ${config.quoteColor1}, ${config.quoteColor2}); color: white; border-radius: 25px; display: inline-block; max-width: 85%; font-weight: ${config.boldEnabled ? 'bold' : '500'}; box-shadow: 0 4px 15px rgba(0,0,0,0.15); position: relative;`;
        quoteStyle += `&:before { content: ''; position: absolute; top: 50%; left: -10px; width: 0; height: 0; border: 10px solid transparent; border-right-color: ${config.quoteColor1}; transform: translateY(-50%); }`;
        
        return `${beforeQuote ? `<p style="${paragraphStyle}">${beforeQuote}</p>` : ''}
        <div style="text-align: center; margin: 20px 0;">
          <div style="${quoteStyle}">🗣️ "${quote}"</div>
        </div>
        ${afterQuote ? `<p style="${paragraphStyle}">${afterQuote}</p>` : ''}`;
      } else if (trimmedParagraph.includes("'") && trimmedParagraph.includes("'")) {
        const beforeQuote = trimmedParagraph.split("'")[0];
        const quote = trimmedParagraph.split("'")[1];
        const afterQuote = trimmedParagraph.split("'")[2] || '';
        
        let singleQuoteStyle = `color: white; background: ${config.singleQuoteColor}; font-size: ${config.fontSize}px; font-style: ${config.singleQuoteItalic ? 'italic' : 'normal'}; padding: 12px 18px; border-radius: 20px; display: inline-block; max-width: 80%; box-shadow: 0 3px 10px rgba(0,0,0,0.1);`;
        
        return `${beforeQuote ? `<p style="${paragraphStyle}">${beforeQuote}</p>` : ''}
        <div style="text-align: right; margin: 20px 0;">
          <div style="${singleQuoteStyle}">💭 '${quote}'</div>
        </div>
        ${afterQuote ? `<p style="${paragraphStyle}">${afterQuote}</p>` : ''}`;
      } else {
        return `<p style="${paragraphStyle}">📝 ${trimmedParagraph}</p>`;
      }
    }).join('');

    const finalImageUrl = normalizeImageUrl(config.backgroundImage);

    return `<div style="background: ${config.contentBackgroundColor}; border: 3px solid #f0f0f0; border-radius: 30px; overflow: hidden; max-width: 650px; margin: 0 auto; box-shadow: 0 8px 25px rgba(0,0,0,0.1); position: relative;">
  <!-- 귀여운 헤더 -->
  <div style="background: linear-gradient(135deg, rgba(${hexToRgb(config.leftTextColor1)}), rgba(${hexToRgb(config.leftTextColor2)})); padding: 25px 30px; text-align: center; position: relative; overflow: hidden;">
    <div style="position: absolute; top: -20px; right: -20px; width: 80px; height: 80px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
    <div style="position: absolute; bottom: -15px; left: -15px; width: 60px; height: 60px; background: rgba(255,255,255,0.08); border-radius: 50%;"></div>
    
    <div style="width: 80px; height: 80px; margin: 0 auto 15px; border-radius: 50%; background-image: url('${finalImageUrl}'); background-size: cover; background-position: center; border: 4px solid rgba(255,255,255,0.3); box-shadow: 0 4px 15px rgba(0,0,0,0.2);"></div>
    
    <div style="color: white; font-size: 20px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.3); margin-bottom: 5px;">🐼 ${config.leftText}</div>
    <div style="color: rgba(255,255,255,0.9); font-size: 14px; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">✨ ${config.rightText}</div>
  </div>
  
  <!-- 귀여운 컨텐츠 영역 -->
  <div style="padding: 30px; background: linear-gradient(145deg, #fafafa, #ffffff); position: relative;">
    <div style="position: absolute; top: 10px; right: 15px; font-size: 12px; opacity: 0.3;">🌟</div>
    <div style="position: absolute; bottom: 15px; left: 15px; font-size: 10px; opacity: 0.3;">💫</div>
    
    ${contentHTML}
    
    <div style="text-align: center; margin-top: 20px; opacity: 0.6; font-size: 12px;">
      🎀 빙둔빙둔 🎀
    </div>
  </div>
</div>`;
  };

  return {
    generateHTML
  };
};

export default BingdunGenerator; 