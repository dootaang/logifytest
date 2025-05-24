'use client'

import React, { useEffect } from 'react';
import BingdunGenerator from '@/generators/BingdunGenerator';

interface WordReplacement {
  from: string;
  to: string;
}

interface BingdunConfig {
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
}

interface BingdunFormLayoutProps {
  config: BingdunConfig;
  onConfigChange: (newConfig: Partial<BingdunConfig>) => void;
  generatedHTML: string;
  onGenerateHTML: () => void;
  onCopyHTML: () => void;
  onReset: () => void;
}

const BingdunFormLayout: React.FC<BingdunFormLayoutProps> = ({
  config,
  onConfigChange,
  generatedHTML,
  onGenerateHTML,
  onCopyHTML,
  onReset
}) => {
  const handleInputChange = (field: keyof BingdunConfig, value: any) => {
    let finalValue = value;

    // 이미지 필드이고 HTML 형태인 경우 URL 추출
    if ((field === 'backgroundImage' || field === 'profileImage') && isHtmlImageTag(value)) {
      finalValue = extractImageUrlFromHtml(value);
    }

    onConfigChange({ [field]: finalValue });
  };

  const handleWordReplacementChange = (index: number, field: 'from' | 'to', value: string) => {
    const newReplacements = [...config.wordReplacements];
    newReplacements[index] = { ...newReplacements[index], [field]: value };
    onConfigChange({ wordReplacements: newReplacements });
  };

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

  // 클립보드에서 이미지 HTML 붙여넣기 처리
  const handlePaste = (e: React.ClipboardEvent, field: 'backgroundImage' | 'profileImage') => {
    const pastedText = e.clipboardData.getData('text');
    if (isHtmlImageTag(pastedText)) {
      e.preventDefault();
      const extractedUrl = extractImageUrlFromHtml(pastedText);
      handleInputChange(field, extractedUrl);
    }
  };

  // 이미지 파일 업로드 처리
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'backgroundImage' | 'profileImage') => {
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
        // 업로드 중 상태 표시
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          handleInputChange(field, result.url);
          alert('이미지가 성공적으로 업로드되었습니다!');
        } else {
          alert(result.error || '업로드에 실패했습니다.');
        }
      } catch (error) {
        console.error('업로드 오류:', error);
        alert('업로드 중 오류가 발생했습니다.');
      }
    }
  };

  // 실시간 미리보기 업데이트
  useEffect(() => {
    onGenerateHTML();
  }, [config, onGenerateHTML]);

  // 미리보기용 HTML 생성
  const generatePreviewHTML = () => {
    const generator = BingdunGenerator({ config });
    return generator.generatePreviewHTML ? generator.generatePreviewHTML() : generator.generateHTML();
  };

  return (
    <div className="main-layout">
      <div className="settings-panel">
        {/* 본문 내용 섹션 */}
        <div className="settings-section">
          <h3 className="section-title">📄 본문 내용</h3>
          <div className="form-group">
            <textarea
              className="form-input form-textarea"
              value={config.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="본문 내용을 입력하세요. 대화 부분은 따옴표로 감싸주세요."
              rows={12}
            />
          </div>
          
          <div className="button-group">
            <button className="button" onClick={onGenerateHTML}>
              🎨 HTML 생성
            </button>
            <button className="button" onClick={onCopyHTML}>
              📋 HTML 복사
            </button>
            <button className="button danger" onClick={onReset}>
              🔄 초기화
            </button>
          </div>
        </div>

        {/* 디자인 테마 선택 섹션 */}
        <div className="settings-section">
          <h3 className="section-title">🎨 디자인 테마</h3>
          <div className="form-group">
            <label className="form-label">전체 디자인 테마</label>
            <select
              className="form-input"
              value={config.designTheme}
              onChange={(e) => handleInputChange('designTheme', e.target.value as 'white' | 'black' | 'blackwhite')}
            >
              <option value="black">블랙</option>
              <option value="blackwhite">블랙앤화이트</option>
              <option value="white">화이트</option>
            </select>
            <div className="hint">💡 테마 선택 시 텍스트와 태그 색상이 자동으로 적응됩니다.</div>
          </div>

          <div className="form-group">
            <label className="form-checkbox">
              <input
                type="checkbox"
                checked={config.hideProfileSection}
                onChange={(e) => handleInputChange('hideProfileSection', e.target.checked)}
              />
              프로필 영역 숨기기 (본문만 표시)
            </label>
            <div className="hint">💡 체크하면 배경이미지, 프로필이미지, 캐릭터 정보, 태그가 모두 숨겨집니다.</div>
          </div>
        </div>

        {/* 이미지 설정 섹션 - 통합됨 */}
        <div className="settings-section">
          <h3 className="section-title">🖼️ 이미지 설정</h3>
          
          <div className="form-group">
            <label className="form-label">📁 배경 이미지 파일 업로드</label>
            <input
              className="form-input"
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'backgroundImage')}
            />
            <div className="hint">💡 권장 사이즈: 1400px × 400px | 최대 5MB</div>
          </div>

          <div className="form-group">
            <div className="divider-text">또는</div>
          </div>
          
          <div className="form-group">
            <label className="form-label">🔗 배경 이미지 URL</label>
            <input
              className="form-input"
              type="text"
              value={config.backgroundImage}
              onChange={(e) => handleInputChange('backgroundImage', e.target.value)}
              onPaste={(e) => handlePaste(e, 'backgroundImage')}
              placeholder="배경 이미지 URL을 입력하세요"
            />
            <div className="hint">💡 아카라이브 이미지 HTML도 자동으로 URL 추출됩니다</div>
          </div>

          <div className="form-group">
            <label className="form-label">📁 프로필 이미지 파일 업로드</label>
            <input
              className="form-input"
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'profileImage')}
            />
            <div className="hint">💡 권장 사이즈: 200px × 200px (정사각형) | 최대 5MB</div>
          </div>

          <div className="form-group">
            <div className="divider-text">또는</div>
          </div>

          <div className="form-group">
            <label className="form-label">🔗 프로필 이미지 URL</label>
            <input
              className="form-input"
              type="text"
              value={config.profileImage}
              onChange={(e) => handleInputChange('profileImage', e.target.value)}
              onPaste={(e) => handlePaste(e, 'profileImage')}
              placeholder="프로필 이미지 URL을 입력하세요"
            />
            <div className="hint">💡 아카라이브 이미지 HTML도 자동으로 URL 추출됩니다</div>
          </div>
        </div>

        {/* 캐릭터 정보 섹션 */}
        <div className="settings-section">
          <h3 className="section-title">👤 캐릭터 정보</h3>
          <div className="form-group">
            <label className="form-label">캐릭터 이름</label>
            <input
              className="form-input"
              type="text"
              value={config.leftText}
              onChange={(e) => handleInputChange('leftText', e.target.value)}
              placeholder="캐릭터 이름을 입력하세요"
            />
          </div>

          <div className="form-group">
            <label className="form-label">이름 색상</label>
            <input
              className="form-input color-input"
              type="color"
              value={config.leftTextColor1}
              onChange={(e) => handleInputChange('leftTextColor1', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-checkbox">
              <input
                type="checkbox"
                checked={config.showCharacterDescription}
                onChange={(e) => handleInputChange('showCharacterDescription', e.target.checked)}
              />
              캐릭터 소개문 표시
            </label>
          </div>

          {config.showCharacterDescription && (
            <div className="form-group">
              <label className="form-label">캐릭터 소개문</label>
              <input
                className="form-input"
                type="text"
                value={config.characterDescription}
                onChange={(e) => handleInputChange('characterDescription', e.target.value)}
                placeholder="캐릭터 소개문을 입력하세요"
              />
            </div>
          )}
        </div>

        {/* 태그 설정 섹션 */}
        <div className="settings-section">
          <h3 className="section-title">🏷️ 태그 설정</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">태그 개수</label>
              <select
                className="form-input"
                value={config.tagCount}
                onChange={(e) => handleInputChange('tagCount', parseInt(e.target.value))}
              >
                <option value={0}>태그 없음</option>
                <option value={1}>1개</option>
                <option value={2}>2개</option>
                <option value={3}>3개</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">태그 스타일</label>
              <select
                className="form-input"
                value={config.tagStyle}
                onChange={(e) => handleInputChange('tagStyle', e.target.value as 'filled' | 'outline')}
              >
                <option value="filled">채움</option>
                <option value="outline">외곽선</option>
              </select>
            </div>
          </div>

          {config.tagCount >= 1 && (
            <div className="form-group">
              <label className="form-label">첫 번째 태그</label>
              <input
                className="form-input"
                type="text"
                value={config.tag1Text}
                onChange={(e) => handleInputChange('tag1Text', e.target.value)}
                placeholder="첫 번째 태그 텍스트"
              />
            </div>
          )}

          {config.tagCount >= 2 && (
            <div className="form-group">
              <label className="form-label">두 번째 태그</label>
              <input
                className="form-input"
                type="text"
                value={config.tag2Text}
                onChange={(e) => handleInputChange('tag2Text', e.target.value)}
                placeholder="두 번째 태그 텍스트"
              />
            </div>
          )}

          {config.tagCount >= 3 && (
            <div className="form-group">
              <label className="form-label">세 번째 태그</label>
              <input
                className="form-input"
                type="text"
                value={config.tag3Text}
                onChange={(e) => handleInputChange('tag3Text', e.target.value)}
                placeholder="세 번째 태그 텍스트"
              />
            </div>
          )}

          {config.tagCount > 0 && (
            <div className="form-row">
              {config.tagStyle === 'filled' ? (
                <div className="form-group">
                  <label className="form-label">태그 배경색</label>
                  <input
                    className="form-input color-input"
                    type="color"
                    value={config.tagBackgroundColor}
                    onChange={(e) => handleInputChange('tagBackgroundColor', e.target.value)}
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">태그 테두리 색상</label>
                  <input
                    className="form-input color-input"
                    type="color"
                    value={config.tagBorderColor}
                    onChange={(e) => handleInputChange('tagBorderColor', e.target.value)}
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">태그 텍스트 색상</label>
                <input
                  className="form-input color-input"
                  type="color"
                  value={config.tagTextColor}
                  onChange={(e) => handleInputChange('tagTextColor', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">태그 둥글기</label>
                <input
                  className="form-input"
                  type="range"
                  min="0"
                  max="25"
                  value={config.tagBorderRadius}
                  onChange={(e) => handleInputChange('tagBorderRadius', parseInt(e.target.value))}
                />
                <span className="range-value">{config.tagBorderRadius}px</span>
              </div>
            </div>
          )}
        </div>

        {/* 대화 스타일 섹션 */}
        <div className="settings-section">
          <h3 className="section-title">💬 대화 스타일</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">대화 색상 1</label>
              <input
                className="form-input color-input"
                type="color"
                value={config.quoteColor1}
                onChange={(e) => handleInputChange('quoteColor1', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">대화 색상 2</label>
              <input
                className="form-input color-input"
                type="color"
                value={config.quoteColor2}
                onChange={(e) => handleInputChange('quoteColor2', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">독백 색상</label>
            <input
              className="form-input color-input"
              type="color"
              value={config.singleQuoteColor}
              onChange={(e) => handleInputChange('singleQuoteColor', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-checkbox">
              <input
                type="checkbox"
                checked={config.boldEnabled}
                onChange={(e) => handleInputChange('boldEnabled', e.target.checked)}
              />
              대화 텍스트 굵게
            </label>
          </div>

          <div className="form-group">
            <label className="form-checkbox">
              <input
                type="checkbox"
                checked={config.singleQuoteItalic}
                onChange={(e) => handleInputChange('singleQuoteItalic', e.target.checked)}
              />
              독백 텍스트 기울임
            </label>
          </div>
        </div>

        {/* 텍스트 설정 섹션 */}
        <div className="settings-section">
          <h3 className="section-title">📝 텍스트 설정</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">글자 크기</label>
              <input
                className="form-input"
                type="range"
                min="12"
                max="24"
                value={config.fontSize}
                onChange={(e) => handleInputChange('fontSize', parseInt(e.target.value))}
              />
              <span className="range-value">{config.fontSize}px</span>
            </div>

            <div className="form-group">
              <label className="form-label">줄 간격</label>
              <input
                className="form-input"
                type="range"
                min="1.2"
                max="3.0"
                step="0.1"
                value={config.lineHeight}
                onChange={(e) => handleInputChange('lineHeight', parseFloat(e.target.value))}
              />
              <span className="range-value">{config.lineHeight}</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">텍스트 색상</label>
            <input
              className="form-input color-input"
              type="color"
              value={config.contentTextColor}
              onChange={(e) => handleInputChange('contentTextColor', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-checkbox">
              <input
                type="checkbox"
                checked={config.paragraphIndent}
                onChange={(e) => handleInputChange('paragraphIndent', e.target.checked)}
              />
              문단 들여쓰기
            </label>
          </div>
        </div>

        {/* 단어 치환 섹션 */}
        <div className="settings-section">
          <h3 className="section-title">🔄 단어 치환</h3>
          {config.wordReplacements.map((replacement, index) => (
            <div key={index} className="form-row">
              <div className="form-group">
                <input
                  className="form-input"
                  type="text"
                  value={replacement.from}
                  onChange={(e) => handleWordReplacementChange(index, 'from', e.target.value)}
                  placeholder="원본 단어"
                />
              </div>
              <div className="form-group">
                <input
                  className="form-input"
                  type="text"
                  value={replacement.to}
                  onChange={(e) => handleWordReplacementChange(index, 'to', e.target.value)}
                  placeholder="변경할 단어"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 미리보기 패널 */}
      <div className="preview-panel">
        <div className="preview-header">
          <h3>🎭 빙둔형 미리보기</h3>
        </div>
        
        <div className="preview-content">
          {generatedHTML ? (
            <div dangerouslySetInnerHTML={{ __html: generatePreviewHTML() }} />
          ) : (
            <div className="preview-placeholder">
              <div className="placeholder-icon">🎭</div>
              <p>HTML 생성 버튼을 눌러 미리보기를 확인하세요</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BingdunFormLayout; 