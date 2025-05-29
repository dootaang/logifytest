import React from 'react';

interface WordReplacement {
  from: string;
  to: string;
}

interface Config {
  backgroundImage: string;
  profileImage: string;
  leftText: string;
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
  tag1Text: string;
  tag2Text: string;
  tag3Text: string;
  tagBackgroundColor: string;
  tagTextColor: string;
  tagBorderRadius: number;
  characterDescription: string;
  showCharacterDescription: boolean;
  designTheme: 'white' | 'black' | 'blackwhite';
  tagCount: number;
  tagBorderColor: string;
  tagStyle: 'filled' | 'outline';
  hideProfileSection: boolean;
  hideBackgroundImage: boolean;
  hideProfileImage: boolean;
  chatSections?: ChatSection[];
}

interface ChatSection {
  id: string;
  content: string;
}

interface CardGeneratorProps {
  config: Config;
}

const CardGenerator = ({ config }: CardGeneratorProps) => {
  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, 1`
      : '0, 0, 0, 1';
  };

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

  // 미리보기용 이미지 URL 생성 (CORS 우회)
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
    
    // 미리보기에서는 원본 URL 사용 (CORS 오류 무시)
    // img 태그에서 crossorigin 없이 로드하면 CORS 오류가 콘솔에만 표시되고 이미지는 정상 표시됨
    return normalizedUrl;
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
    // chatSections이 있으면 사용, 없으면 기존 content 사용
    const sections = config.chatSections && config.chatSections.length > 0 
      ? config.chatSections 
      : [{ id: 'default', content: config.content }];

    // 실제 HTML 생성용 - 원본 URL 직접 사용 (게시판 호환성)
    const finalImageUrl = normalizeImageUrl(config.backgroundImage);
    const profileImageUrl = normalizeImageUrl(config.profileImage);

    // 디자인 테마에 따른 색상 설정
    let themeStyles = {
      cardBackground: '#ffffff',
      cardGradient: 'linear-gradient(to bottom, #ffffff 60%, #fbf9fa)',
      profileBorder: '#ffffff',
      textColor: '#333333',
      nameColor: '#000000',
      tagTextColor: config.tagTextColor,
      tagBackgroundColor: config.tagBackgroundColor,
      tagBorderColor: '#000000'
    };

    switch (config.designTheme) {
      case 'black':
        themeStyles = {
          cardBackground: '#1a1a1a',
          cardGradient: 'linear-gradient(to bottom, #1a1a1a 60%, #0f0f0f)',
          profileBorder: '#333333',
          textColor: '#ffffff',
          nameColor: '#ffffff',
          tagTextColor: '#ffffff',
          tagBackgroundColor: config.tagStyle === 'outline' ? 'transparent' : '#333333',
          tagBorderColor: '#ffffff'
        };
        break;
      case 'blackwhite':
        themeStyles = {
          cardBackground: '#000000',
          cardGradient: 'linear-gradient(to bottom, #000000 60%, #1a1a1a)',
          profileBorder: '#ffffff',
          textColor: '#ffffff',
          nameColor: '#ffffff',
          tagTextColor: '#ffffff',
          tagBackgroundColor: config.tagStyle === 'outline' ? 'transparent' : '#333333',
          tagBorderColor: '#ffffff'
        };
        break;
      case 'white':
      default:
        themeStyles = {
          cardBackground: '#ffffff',
          cardGradient: 'linear-gradient(to bottom, #ffffff 60%, #fbf9fa)',
          profileBorder: '#000000',
          textColor: '#333333',
          nameColor: '#000000',
          tagTextColor: config.tagStyle === 'outline' ? '#000000' : config.tagTextColor,
          tagBackgroundColor: config.tagStyle === 'outline' ? 'transparent' : config.tagBackgroundColor,
          tagBorderColor: '#000000'
        };
        break;
    }

    // 텍스트 처리 함수
    const processTextContent = (content: string) => {
      const processedContent = applyWordReplacements(content);
      const paragraphs = processedContent.split('\n\n').filter(p => p.trim());
      
      return paragraphs.map(paragraph => {
        const trimmedParagraph = paragraph.trim();
        
        let paragraphStyle = `color: ${themeStyles.textColor}; font-size: ${config.fontSize}px; line-height: ${config.lineHeight}; margin-bottom: 18px; padding: 8px 0;`;
        if (config.paragraphIndent) {
          paragraphStyle += ' text-indent: 1.5em;';
        }
        
        // 대화 부분 스타일링
        if (trimmedParagraph.includes('"') && trimmedParagraph.includes('"')) {
          const beforeQuote = trimmedParagraph.split('"')[0];
          const quote = trimmedParagraph.split('"')[1];
          const afterQuote = trimmedParagraph.split('"')[2] || '';
          
          return `${beforeQuote ? `<p style="${paragraphStyle}">${beforeQuote}</p>` : ''}
          <div style="margin: 15px 0; padding: 12px 18px; background: linear-gradient(135deg, ${config.quoteColor1}, ${config.quoteColor2}); color: white; border-radius: 20px; font-weight: ${config.boldEnabled ? 'bold' : '500'}; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            "${quote}"
          </div>
          ${afterQuote ? `<p style="${paragraphStyle}">${afterQuote}</p>` : ''}`;
        } else if (trimmedParagraph.includes("'") && trimmedParagraph.includes("'")) {
          const beforeQuote = trimmedParagraph.split("'")[0];
          const quote = trimmedParagraph.split("'")[1];
          const afterQuote = trimmedParagraph.split("'")[2] || '';
          
          return `${beforeQuote ? `<p style="${paragraphStyle}">${beforeQuote}</p>` : ''}
          <div style="margin: 15px 0; padding: 10px 15px; background: ${config.singleQuoteColor}; color: white; border-radius: 15px; font-style: ${config.singleQuoteItalic ? 'italic' : 'normal'}; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
            '${quote}'
          </div>
          ${afterQuote ? `<p style="${paragraphStyle}">${afterQuote}</p>` : ''}`;
        } else {
          return `<p style="${paragraphStyle}">${trimmedParagraph}</p>`;
        }
      }).join('');
    };

    // 태그 스타일 설정
    const getTagStyle = (tagText: string) => {
      if (!tagText.trim()) return '';
      
      if (config.tagStyle === 'outline') {
        return `background: ${themeStyles.tagBackgroundColor}; color: ${themeStyles.tagTextColor}; border: 1px solid ${themeStyles.tagBorderColor}; padding: 4px 12px; border-radius: ${config.tagBorderRadius}px; font-size: 12px; display: inline-block; margin: 4px;`;
      } else {
        return `background: ${themeStyles.tagBackgroundColor}; color: ${themeStyles.tagTextColor}; padding: 4px 12px; border-radius: ${config.tagBorderRadius}px; font-size: 12px; display: inline-block; margin: 4px;`;
      }
    };

    // 활성화된 태그들만 렌더링
    const tags = [config.tag1Text, config.tag2Text, config.tag3Text].slice(0, config.tagCount);
    const tagHTML = tags.map(tag => 
      tag.trim() ? `<span style="${getTagStyle(tag)}">${tag}</span>` : ''
    ).filter(Boolean).join('');

    // 프로필 섹션 HTML (조건부 렌더링)
    const profileSectionHTML = config.hideProfileSection ? '' : `
    ${!config.hideBackgroundImage ? `<div style="position:relative;width:100%;height:180px;border-top-left-radius:16px;border-top-right-radius:16px;overflow:hidden;">
        <img style="width:100%;height:100%;object-fit:cover;border-top-left-radius:16px;border-top-right-radius:16px;" src="${finalImageUrl}" class="fr-fic fr-dii">
    </div>` : ''}

    ${!config.hideProfileImage ? `<div style="margin-top:${!config.hideBackgroundImage ? '-48px' : '0'};text-align:center;position:relative;z-index:2;">
        <img style="width: 96px; height: 96px; border-radius: 50%; border: 3px solid ${themeStyles.profileBorder};" src="${profileImageUrl}" class="fr-fic fr-dii">
    </div>` : ''}

    <div style="padding:1.5rem;text-align:center;">
        <h2 style="margin-bottom:0.5rem;font-weight:600;">
            <em><span style="color: ${themeStyles.nameColor};">${config.leftText}</span></em>
        </h2>

        ${config.showCharacterDescription ? `<p style="font-size:13px;color:${themeStyles.textColor};line-height:1.6;">${config.characterDescription}</p>` : ''}

        ${tagHTML ? `<div style="margin-top:1rem;text-align:center;">${tagHTML}</div>` : ''}
    </div>

    <hr style="border-color: ${config.designTheme === 'white' ? '#eeeeee' : '#444444'};">`;

    // 여러 섹션 처리
    let allHTML = '<p><br></p>';

    sections.forEach((section, index) => {
      if (!section.content.trim()) return;

      const contentHTML = processTextContent(section.content);

      if (index === 0) {
        // 첫 번째 박스: 모든 요소 포함
        allHTML += `<div style="font-family:Segoe UI, Roboto, Arial, sans-serif;color:#000000;line-height:1.8;width:100%;max-width:480px;margin:2rem auto;border-radius:16px;background:${themeStyles.cardGradient};box-shadow:0 2px 10px rgba(0,0,0,0.05);">

    ${profileSectionHTML}

    <div style="padding:1.5rem;font-size:14px;line-height:1.75;color:${themeStyles.textColor};">
        ${contentHTML}
    </div>
</div>`;
      } else {
        // 두 번째 박스부터: 텍스트만 포함 (박스 사이에 <p><br></p> 추가)
        allHTML += `<p><br></p><div style="font-family:Segoe UI, Roboto, Arial, sans-serif;color:#000000;line-height:1.8;width:100%;max-width:480px;margin:2rem auto;border-radius:16px;background:${themeStyles.cardGradient};box-shadow:0 2px 10px rgba(0,0,0,0.05);">

    <div style="padding:1.5rem;font-size:14px;line-height:1.75;color:${themeStyles.textColor};">
        ${contentHTML}
    </div>
</div>`;
      }
    });

    allHTML += '<p><br></p>';

    return allHTML;
  };

  // 미리보기 전용 HTML 생성 (프록시 사용)
  const generatePreviewHTML = (): string => {
    // chatSections이 있으면 사용, 없으면 기존 content 사용
    const sections = config.chatSections && config.chatSections.length > 0 
      ? config.chatSections 
      : [{ id: 'default', content: config.content }];
    
    // 미리보기용 - 프록시 사용 (CORS 우회)
    const finalImageUrl = getPreviewImageUrl(config.backgroundImage);
    const profileImageUrl = getPreviewImageUrl(config.profileImage);

    // 디자인 테마에 따른 색상 설정
    let themeStyles = {
      cardBackground: '#ffffff',
      cardGradient: 'linear-gradient(to bottom, #ffffff 60%, #fbf9fa)',
      profileBorder: '#ffffff',
      textColor: '#333333',
      nameColor: '#000000',
      tagTextColor: config.tagTextColor,
      tagBackgroundColor: config.tagBackgroundColor,
      tagBorderColor: '#000000'
    };

    switch (config.designTheme) {
      case 'black':
        themeStyles = {
          cardBackground: '#1a1a1a',
          cardGradient: 'linear-gradient(to bottom, #1a1a1a 60%, #0f0f0f)',
          profileBorder: '#333333',
          textColor: '#ffffff',
          nameColor: '#ffffff',
          tagTextColor: '#ffffff',
          tagBackgroundColor: config.tagStyle === 'outline' ? 'transparent' : '#333333',
          tagBorderColor: '#ffffff'
        };
        break;
      case 'blackwhite':
        themeStyles = {
          cardBackground: '#000000',
          cardGradient: 'linear-gradient(to bottom, #000000 60%, #1a1a1a)',
          profileBorder: '#ffffff',
          textColor: '#ffffff',
          nameColor: '#ffffff',
          tagTextColor: '#ffffff',
          tagBackgroundColor: config.tagStyle === 'outline' ? 'transparent' : '#333333',
          tagBorderColor: '#ffffff'
        };
        break;
      case 'white':
      default:
        themeStyles = {
          cardBackground: '#ffffff',
          cardGradient: 'linear-gradient(to bottom, #ffffff 60%, #fbf9fa)',
          profileBorder: '#000000',
          textColor: '#333333',
          nameColor: '#000000',
          tagTextColor: config.tagStyle === 'outline' ? '#000000' : config.tagTextColor,
          tagBackgroundColor: config.tagStyle === 'outline' ? 'transparent' : config.tagBackgroundColor,
          tagBorderColor: '#000000'
        };
        break;
    }

    // 텍스트 처리 함수
    const processTextContent = (content: string) => {
      const processedContent = applyWordReplacements(content);
      const paragraphs = processedContent.split('\n\n').filter(p => p.trim());
      
      return paragraphs.map(paragraph => {
        const trimmedParagraph = paragraph.trim();
        
        let paragraphStyle = `color: ${themeStyles.textColor}; font-size: ${config.fontSize}px; line-height: ${config.lineHeight}; margin-bottom: 18px; padding: 8px 0;`;
        if (config.paragraphIndent) {
          paragraphStyle += ' text-indent: 1.5em;';
        }
        
        // 대화 부분 스타일링
        if (trimmedParagraph.includes('"') && trimmedParagraph.includes('"')) {
          const beforeQuote = trimmedParagraph.split('"')[0];
          const quote = trimmedParagraph.split('"')[1];
          const afterQuote = trimmedParagraph.split('"')[2] || '';
          
          return `${beforeQuote ? `<p style="${paragraphStyle}">${beforeQuote}</p>` : ''}
          <div style="margin: 15px 0; padding: 12px 18px; background: linear-gradient(135deg, ${config.quoteColor1}, ${config.quoteColor2}); color: white; border-radius: 20px; font-weight: ${config.boldEnabled ? 'bold' : '500'}; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            "${quote}"
          </div>
          ${afterQuote ? `<p style="${paragraphStyle}">${afterQuote}</p>` : ''}`;
        } else if (trimmedParagraph.includes("'") && trimmedParagraph.includes("'")) {
          const beforeQuote = trimmedParagraph.split("'")[0];
          const quote = trimmedParagraph.split("'")[1];
          const afterQuote = trimmedParagraph.split("'")[2] || '';
          
          return `${beforeQuote ? `<p style="${paragraphStyle}">${beforeQuote}</p>` : ''}
          <div style="margin: 15px 0; padding: 10px 15px; background: ${config.singleQuoteColor}; color: white; border-radius: 15px; font-style: ${config.singleQuoteItalic ? 'italic' : 'normal'}; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
            '${quote}'
          </div>
          ${afterQuote ? `<p style="${paragraphStyle}">${afterQuote}</p>` : ''}`;
        } else {
          return `<p style="${paragraphStyle}">${trimmedParagraph}</p>`;
        }
      }).join('');
    };

    // 태그 스타일 설정
    const getTagStyle = (tagText: string) => {
      if (!tagText.trim()) return '';
      
      if (config.tagStyle === 'outline') {
        return `background: ${themeStyles.tagBackgroundColor}; color: ${themeStyles.tagTextColor}; border: 1px solid ${themeStyles.tagBorderColor}; padding: 4px 12px; border-radius: ${config.tagBorderRadius}px; font-size: 12px; display: inline-block; margin: 4px;`;
      } else {
        return `background: ${themeStyles.tagBackgroundColor}; color: ${themeStyles.tagTextColor}; padding: 4px 12px; border-radius: ${config.tagBorderRadius}px; font-size: 12px; display: inline-block; margin: 4px;`;
      }
    };

    // 활성화된 태그들만 렌더링
    const tags = [config.tag1Text, config.tag2Text, config.tag3Text].slice(0, config.tagCount);
    const tagHTML = tags.map(tag => 
      tag.trim() ? `<span style="${getTagStyle(tag)}">${tag}</span>` : ''
    ).filter(Boolean).join('');

    // 프로필 섹션 HTML (조건부 렌더링) - 미리보기용 프록시 이미지 사용, img 태그로 변경
    const profileSectionHTML = config.hideProfileSection ? '' : `
    ${!config.hideBackgroundImage ? `<div style="position:relative;width:100%;height:180px;border-top-left-radius:16px;border-top-right-radius:16px;overflow:hidden;">
        <img style="width:100%;height:100%;object-fit:cover;border-top-left-radius:16px;border-top-right-radius:16px;" src="${finalImageUrl}" class="fr-fic fr-dii">
    </div>` : ''}

    ${!config.hideProfileImage ? `<div style="margin-top:${!config.hideBackgroundImage ? '-48px' : '0'};text-align:center;position:relative;z-index:2;">
        <img style="width: 96px; height: 96px; border-radius: 50%; border: 3px solid ${themeStyles.profileBorder};" src="${profileImageUrl}" class="fr-fic fr-dii">
    </div>` : ''}

    <div style="padding:1.5rem;text-align:center;">
        <h2 style="margin-bottom:0.5rem;font-weight:600;">
            <em><span style="color: ${themeStyles.nameColor};">${config.leftText}</span></em>
        </h2>

        ${config.showCharacterDescription ? `<p style="font-size:13px;color:${themeStyles.textColor};line-height:1.6;">${config.characterDescription}</p>` : ''}

        ${tagHTML ? `<div style="margin-top:1rem;text-align:center;">${tagHTML}</div>` : ''}
    </div>

    <hr style="border-color: ${config.designTheme === 'white' ? '#eeeeee' : '#444444'};">`;

    // 여러 섹션 처리
    let allHTML = '<p><br></p>';

    sections.forEach((section, index) => {
      if (!section.content.trim()) return;

      const contentHTML = processTextContent(section.content);

      if (index === 0) {
        // 첫 번째 박스: 모든 요소 포함
        allHTML += `<div style="font-family:Segoe UI, Roboto, Arial, sans-serif;color:#000000;line-height:1.8;width:100%;max-width:480px;margin:2rem auto;border-radius:16px;background:${themeStyles.cardGradient};box-shadow:0 2px 10px rgba(0,0,0,0.05);">

    ${profileSectionHTML}

    <div style="padding:1.5rem;font-size:14px;line-height:1.75;color:${themeStyles.textColor};">
        ${contentHTML}
    </div>
</div>`;
      } else {
        // 두 번째 박스부터: 텍스트만 포함 (박스 사이에 <p><br></p> 추가)
        allHTML += `<p><br></p><div style="font-family:Segoe UI, Roboto, Arial, sans-serif;color:#000000;line-height:1.8;width:100%;max-width:480px;margin:2rem auto;border-radius:16px;background:${themeStyles.cardGradient};box-shadow:0 2px 10px rgba(0,0,0,0.05);">

    <div style="padding:1.5rem;font-size:14px;line-height:1.75;color:${themeStyles.textColor};">
        ${contentHTML}
    </div>
</div>`;
      }
    });

    allHTML += '<p><br></p>';

    return allHTML;
  };

  return {
    generateHTML,
    generatePreviewHTML
  };
};

export default CardGenerator; 