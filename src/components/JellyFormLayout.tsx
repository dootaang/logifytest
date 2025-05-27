import React, { useState, useEffect } from 'react';
import {
  ModernButton,
  ModernInput,
  ModernTextarea,
  ModernCheckbox,
  ModernColorPicker,
  ModernSlider,
  ModernFormGroup,
  ModernFormRow,
  ModernSection,
  ModernHint
} from './ModernComponents'
import JellyGenerator from '@/generators/JellyGenerator'

interface WordReplacement {
  from: string;
  to: string;
}

interface JellyConfig {
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
  content: string;
  wordReplacements: WordReplacement[];
  selectedTheme: string;
}

interface JellyFormLayoutProps {
  config: JellyConfig;
  onConfigChange: (newConfig: Partial<JellyConfig>) => void;
  generatedHTML: string;
  onGenerateHTML: () => void;
  onCopyHTML: () => void;
  onReset: () => void;
}

const JellyFormLayout: React.FC<JellyFormLayoutProps> = ({
  config,
  onConfigChange,
  generatedHTML,
  onGenerateHTML,
  onCopyHTML,
  onReset
}) => {
  const [extractedFromHtml, setExtractedFromHtml] = useState(false);

  // 기본 이미지 옵션
  const defaultImages = [
    {
      id: 'yuzu',
      name: '유즈',
      url: '//ac-p1.namu.la/20250523sac/7edfca5162ef4fb4da4e8d6dc8dbf976ea4aa7072ac3dd1cb6024116e83b280d.png?expires=1748047045&key=zLtjw_UPp0o0vUTtngyjvQ'
    },
    {
      id: 'lemon',
      name: '레몬',
      url: '//ac-p1.namu.la/20250523sac/dfeef29920a64f42b531c81fcc6e242211bff08492f533f081fd77ad943b356a.png?expires=1748047065&key=Rjz_e0fyxdA0c4674Wh3gQ'
    },
    {
      id: 'modern_night',
      name: '현대밤',
      url: '//ac-p1.namu.la/20250523sac/4f72665e2ae795ada3c1bd0fb77ffd38d32718eb3ef5b32fe6ffd567df3ed726.png?expires=1748046935&key=Z5CmE5DGij8JhcneI0hfsQ'
    },
    {
      id: 'modern_day',
      name: '현대낮',
      url: '//ac-p1.namu.la/20250523sac/cc2fed3a3bc7c841946bbb929b6c27050a1f02a72177293ce07f6f7737863b61.png?expires=1748046982&key=AAPN1YeBm29AMxygW-RfTw'
    },
    {
      id: 'rural_day',
      name: '시골낮',
      url: '//ac-p1.namu.la/20250523sac/fd5cddf54957cb39e80d36c68e442a1a976b8c26aacc6295083254007ecb434a.png?expires=1748047016&key=h64giwTquU1vHt-x2Is6mQ'
    },
    {
      id: 'rural_night',
      name: '시골밤',
      url: '//ac-p1.namu.la/20250523sac/1aca5ff6f15f46ae00412a5ac00c6c2f8c49b50c7a5fbbf8c9fa8d6aa673a6c3.png?expires=1748048366&key=mqJ-yHiT7X_fDG5hiVk2gA'
    }
  ];

  // 이미지 HTML에서 URL 추출하는 함수
  const extractImageUrlFromHtml = (htmlString: string) => {
    const imgTagRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/i;
    const match = htmlString.match(imgTagRegex);
    
    if (match && match[1]) {
      return match[1];
    }
    
    return htmlString;
  };

  // 입력값이 HTML인지 확인하는 함수
  const isHtmlImageTag = (input: string) => {
    return input.includes('<img') && input.includes('src=');
  };

  // URL에 프로토콜이 없으면 https를 추가하는 함수
  const normalizeImageUrl = (url: string) => {
    if (!url) return '';
    // 데이터 URL (base64)은 그대로 사용
    if (url.startsWith('data:')) {
      return url;
    }
    // 절대 URL (//로 시작)은 https 프로토콜 추가
    if (url.startsWith('//')) {
      return 'https:' + url;
    }
    // 상대 경로 (/uploads/...)는 현재 호스트 기준으로 변환
    if (url.startsWith('/uploads/')) {
      // 개발환경에서는 localhost 사용
      if (typeof window !== 'undefined') {
        return window.location.protocol + '//' + window.location.host + url;
      }
      return 'http://localhost:3000' + url;
    }
    // http/https가 없으면 https 추가
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url;
    }
    return url;
  };

  // 이미지 프록시 URL 생성 함수
  const getProxyImageUrl = (url: string) => {
    const normalizedUrl = normalizeImageUrl(url);
    
    // 로컬 업로드 이미지는 직접 사용 (CORS 문제 없음)
    if (normalizedUrl.includes('/uploads/')) {
      return normalizedUrl;
    }
    
    // 외부 이미지는 프록시를 통해 로드 (CORS 우회)
    return `https://images.weserv.nl/?url=${encodeURIComponent(normalizedUrl)}`;
  };

  // 미리보기용 이미지 URL 생성 함수
  const getPreviewImageUrl = (url: string) => {
    return getProxyImageUrl(url);
  };

  // 클립보드에서 이미지 HTML 붙여넣기 처리
  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text');
    if (isHtmlImageTag(pastedText)) {
      e.preventDefault();
      const extractedUrl = extractImageUrlFromHtml(pastedText);
      handleInputChange('backgroundImage', extractedUrl);
      setExtractedFromHtml(true);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    let finalValue = value;
    let isFromHtml = false;

    // 배경 이미지 필드이고 HTML 형태인 경우 URL 추출
    if (field === 'backgroundImage' && isHtmlImageTag(value)) {
      finalValue = extractImageUrlFromHtml(value);
      isFromHtml = true;
    }

    onConfigChange({ [field]: finalValue });
    
    // 배경 이미지가 변경될 때 에러 상태 초기화
    if (field === 'backgroundImage') {
      setExtractedFromHtml(isFromHtml);
    }
  };

  // 단어 교환 기능
  const handleWordReplacementChange = (index: number, field: string, value: string) => {
    const newReplacements = [...config.wordReplacements];
    newReplacements[index][field as keyof typeof newReplacements[0]] = value;
    onConfigChange({ wordReplacements: newReplacements });
  };

  // 로컬 이미지 파일 업로드 처리
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 파일 크기 제한 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('이미지 파일 크기는 5MB 이하여야 합니다.');
        return;
      }

      // 이미지 파일 타입 확인
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (result.success && result.url) {
          handleInputChange('backgroundImage', result.url);
          setExtractedFromHtml(false);
          if (result.isDataUrl) {
            alert('✅ 이미지가 성공적으로 업로드되었습니다!\n\n이미지가 base64 형태로 변환되어 복사 기능에서도 정상 작동합니다.');
          } else {
            alert('✅ 이미지가 성공적으로 업로드되었습니다!');
          }
        } else {
          alert('❌ 이미지 업로드에 실패했습니다. 다시 시도해주세요.');
        }
      } catch (error) {
        console.error('업로드 오류:', error);
        alert('❌ 네트워크 오류가 발생했습니다. 다시 시도해주세요.');
      }
    }
  };

  // 기본 이미지 선택 핸들러
  const handleDefaultImageSelect = (imageUrl: string) => {
    handleInputChange('backgroundImage', imageUrl);
    setExtractedFromHtml(false);
  };

  // 미리보기용 HTML 생성
  const generatePreviewHTML = () => {
    const generator = JellyGenerator({ config });
    return generator.generatePreviewHTML ? generator.generatePreviewHTML() : generator.generateHTML();
  };

  return (
    <div className="container">
      <div className="main-layout">
        <div className="settings-panel">
          {/* 헤더 */}
          <div className="header">
            <h1>🐭 제리형 로그 제조기</h1>
            <p>Design made by zzery</p>
          </div>

          {/* 본문 내용을 최상단으로 이동 */}
          <ModernSection title="📄 본문 내용">
          <ModernFormGroup>
            <ModernTextarea
              value={config.content}
              onChange={(value) => handleInputChange('content', value)}
              placeholder="본문 내용을 입력하세요. 대화 부분은 따옴표로 감싸주세요."
              rows={12}
            />
          </ModernFormGroup>
          
          {/* 액션 버튼도 함께 최상단에 배치 */}
          <div className="button-group">
            <ModernButton onClick={onCopyHTML}>
              ✨ 스타일 복사 (고급)
            </ModernButton>
            <ModernButton danger onClick={onReset}>
              🔄 초기화
            </ModernButton>
          </div>
          <ModernHint>
            💡 <strong>스타일 복사 (고급)</strong>: 디자인과 이미지가 함께 클립보드에 복사됩니다. 글쓰기 에디터에 붙여넣기하면 HTML 에디터를 열지 않고도 자동으로 스타일이 적용됩니다!
          </ModernHint>
        </ModernSection>

        {/* 이미지 설정 */}
        <ModernSection title="🖼️ 이미지 설정">
          {/* 로컬 이미지 업로드 */}
          <ModernFormGroup label="📁 로컬 이미지 업로드">
            <input
              className="form-input"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{
                padding: '12px',
                border: '2px dashed var(--border-color)',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-tertiary)',
                cursor: 'pointer'
              }}
            />
            <ModernHint>
              💡 <strong>간편한 업로드:</strong> 이미지를 선택하면 base64로 변환되어 복사 기능에서도 정상 작동합니다!
            </ModernHint>
            <ModernHint>
              📋 지원 형식: JPG, PNG, GIF, WebP (최대 5MB)
            </ModernHint>
          </ModernFormGroup>

          <ModernFormGroup>
            <div className="divider-text">또는 외부 URL 사용</div>
          </ModernFormGroup>

          <ModernFormGroup label="🔗 외부 이미지 URL">
            <ModernInput
              value={config.backgroundImage.startsWith('/uploads/') ? '' : config.backgroundImage}
              onChange={(value) => handleInputChange('backgroundImage', value)}
              onPaste={handlePaste}
              placeholder="외부 이미지 URL을 입력하세요"
            />
            <ModernHint>
              💡 아카라이브, 이미지 호스팅 사이트 등의 이미지 URL을 사용할 수 있습니다.
            </ModernHint>
            {extractedFromHtml && (
              <ModernHint type="success">
                ✅ 이미지 HTML에서 URL을 자동으로 추출했습니다!
              </ModernHint>
            )}
          </ModernFormGroup>
          
          {/* 기본 이미지 선택 */}
          <ModernFormGroup label="🖼️ 기본 이미지">
            <div className="default-images-grid">
              {defaultImages.map((image) => (
                <button
                  key={image.id}
                  type="button"
                  className={`default-image-button ${config.backgroundImage === image.url ? 'active' : ''}`}
                  onClick={() => handleDefaultImageSelect(image.url)}
                  title={`${image.name} 배경 이미지 적용`}
                >
                  <img 
                    src={getPreviewImageUrl(image.url)} 
                    alt={image.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                  <span className="image-name">{image.name}</span>
                </button>
              ))}
            </div>
            <ModernHint>
              💡 클릭하여 미리 준비된 배경 이미지를 선택하세요
            </ModernHint>
          </ModernFormGroup>
        </ModernSection>

        {/* 텍스트 설정 */}
        <ModernSection title="📝 텍스트 설정">
          <ModernFormRow>
            <ModernFormGroup label="왼쪽 텍스트">
              <ModernInput
                value={config.leftText}
                onChange={(value) => handleInputChange('leftText', value)}
                placeholder="왼쪽 텍스트"
              />
            </ModernFormGroup>
            <ModernFormGroup label="오른쪽 텍스트">
              <ModernInput
                value={config.rightText}
                onChange={(value) => handleInputChange('rightText', value)}
                placeholder="오른쪽 텍스트"
              />
            </ModernFormGroup>
          </ModernFormRow>
        </ModernSection>

        {/* 본문 색상 설정 추가 */}
        <ModernSection title="🎨 본문 색상 설정">
          <ModernFormRow>
            <ModernFormGroup label="본문 배경색">
              <ModernColorPicker
                value={config.contentBackgroundColor && config.contentBackgroundColor.includes('rgba') ? '#fafafa' : config.contentBackgroundColor || '#fafafa'}
                onChange={(value) => handleInputChange('contentBackgroundColor', value)}
              />
            </ModernFormGroup>
            <ModernFormGroup label="본문 글자색">
              <ModernColorPicker
                value={config.contentTextColor}
                onChange={(value) => handleInputChange('contentTextColor', value)}
              />
            </ModernFormGroup>
          </ModernFormRow>
        </ModernSection>

        {/* 색상 설정 */}
        <ModernSection title="🎨 색상 설정">
          <ModernFormRow>
            <ModernFormGroup label="왼쪽 박스 색상 1">
              <ModernColorPicker
                value={config.leftTextColor1}
                onChange={(value) => handleInputChange('leftTextColor1', value)}
              />
            </ModernFormGroup>
            <ModernFormGroup label="왼쪽 박스 색상 2">
              <ModernColorPicker
                value={config.leftTextColor2}
                onChange={(value) => handleInputChange('leftTextColor2', value)}
              />
            </ModernFormGroup>
          </ModernFormRow>
          <ModernFormRow>
            <ModernFormGroup label="큰따옴표 색상 1">
              <ModernColorPicker
                value={config.quoteColor1}
                onChange={(value) => handleInputChange('quoteColor1', value)}
              />
            </ModernFormGroup>
            <ModernFormGroup label="큰따옴표 색상 2">
              <ModernColorPicker
                value={config.quoteColor2}
                onChange={(value) => handleInputChange('quoteColor2', value)}
              />
            </ModernFormGroup>
          </ModernFormRow>
          <ModernFormRow>
            <ModernFormGroup label="작은따옴표 색상">
              <ModernColorPicker
                value={config.singleQuoteColor}
                onChange={(value) => handleInputChange('singleQuoteColor', value)}
              />
            </ModernFormGroup>
          </ModernFormRow>
        </ModernSection>

        {/* 스타일 옵션 */}
        <ModernSection title="✨ 스타일 옵션">
          <ModernCheckbox
            checked={config.quoteColorEnabled}
            onChange={(checked) => handleInputChange('quoteColorEnabled', checked)}
            label="큰따옴표 색상 활성화"
          />
          <ModernCheckbox
            checked={config.quoteGradientEnabled}
            onChange={(checked) => handleInputChange('quoteGradientEnabled', checked)}
            label="큰따옴표 그라데이션 효과"
          />
          <ModernCheckbox
            checked={config.boldEnabled}
            onChange={(checked) => handleInputChange('boldEnabled', checked)}
            label="큰따옴표 볼드체"
          />
          <ModernCheckbox
            checked={config.singleQuoteItalic}
            onChange={(checked) => handleInputChange('singleQuoteItalic', checked)}
            label="작은따옴표 기울기"
          />
          <ModernCheckbox
            checked={config.paragraphIndent}
            onChange={(checked) => handleInputChange('paragraphIndent', checked)}
            label="문단 들여쓰기"
          />
        </ModernSection>

        {/* 본문 텍스트 조절 */}
        <ModernSection title="📏 본문 텍스트 조절">
          <ModernSlider
            value={config.fontSize}
            onChange={(value) => handleInputChange('fontSize', value)}
            min={10}
            max={24}
            step={1}
            label="폰트 크기"
          />
          <ModernSlider
            value={config.lineHeight}
            onChange={(value) => handleInputChange('lineHeight', value)}
            min={1.2}
            max={2.5}
            step={0.1}
            label="줄 간격"
          />
        </ModernSection>

        {/* 단어 교환 - 3줄로 확장 */}
        <ModernSection title="🔄 단어 교환">
          {config.wordReplacements.map((replacement, index) => (
            <div key={index} className="word-replacement">
              <ModernInput
                value={replacement.from}
                onChange={(value) => handleWordReplacementChange(index, 'from', value)}
                placeholder="변경할 단어"
              />
              <span className="arrow">→</span>
              <ModernInput
                value={replacement.to}
                onChange={(value) => handleWordReplacementChange(index, 'to', value)}
                placeholder="대체할 단어"
              />
            </div>
          ))}
        </ModernSection>
      </div>

      <div className="preview-panel">
        <div className="preview-header">
          <h3 className="preview-title">👀 미리보기</h3>
        </div>
        
        <div className="preview-container">
          <div dangerouslySetInnerHTML={{ __html: generatePreviewHTML() }} />
        </div>
      </div>
    </div>
    </div>
  );
};

export default JellyFormLayout; 