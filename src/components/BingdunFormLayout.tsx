'use client'

import React, { useEffect, useState } from 'react';
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
  ModernHint,
  ModernSelect
} from './ModernComponents'
import { STYLES } from '@/utils/styles'
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  // 다크모드 감지
  useEffect(() => {
    const checkDarkMode = () => {
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
      setIsDarkMode(darkModeQuery.matches)
    }

    checkDarkMode()
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    darkModeQuery.addEventListener('change', checkDarkMode)

    return () => darkModeQuery.removeEventListener('change', checkDarkMode)
  }, [])

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
    if (!file) return;

    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadStatus('❌ 파일 크기가 5MB를 초과합니다.');
      return;
    }

    // 파일 타입 체크
    if (!file.type.startsWith('image/')) {
      setUploadStatus('❌ 이미지 파일만 업로드 가능합니다.');
      return;
    }

    setUploadStatus('⏳ 업로드 중...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        handleInputChange(field, data.url);
        if (data.isDataUrl) {
          setUploadStatus('✅ 업로드 성공! (base64 변환됨)');
        } else {
          setUploadStatus('✅ 업로드 성공!');
        }
        
        // 3초 후 상태 메시지 제거
        setTimeout(() => setUploadStatus(''), 3000);
      } else {
        const errorData = await response.json();
        setUploadStatus(`❌ 업로드 실패: ${errorData.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('업로드 오류:', error);
      setUploadStatus('❌ 업로드 중 오류가 발생했습니다.');
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
    <div className="container">
      <div className="main-layout">
        <div className="settings-panel">
          {/* 헤더 */}
          <div className="header">
            <h1>🎭 빙둔형 생성기</h1>
            <p>캐릭터 중심의 아름다운 빙둔 스타일 로그를 생성합니다</p>
          </div>

          {/* 본문 내용 섹션 */}
          <ModernSection title="📄 본문 내용">
            <ModernFormGroup label="본문 내용">
              <ModernTextarea
                value={config.content}
                onChange={(value) => handleInputChange('content', value)}
                placeholder="본문 내용을 입력하세요. 대화 부분은 따옴표로 감싸주세요."
                rows={12}
              />
            </ModernFormGroup>
            
            <ModernFormRow>
              <ModernFormGroup>
                <ModernButton primary onClick={onGenerateHTML}>
                  🎨 HTML 생성
                </ModernButton>
              </ModernFormGroup>
              <ModernFormGroup>
                <ModernButton onClick={onCopyHTML}>
                  ✨ 스타일 복사 (고급)
                </ModernButton>
              </ModernFormGroup>
              <ModernFormGroup>
                <ModernButton danger onClick={onReset}>
                  🔄 초기화
                </ModernButton>
              </ModernFormGroup>
            </ModernFormRow>
            
            <ModernHint>
              💡 <strong>스타일 복사 (고급)</strong>: 디자인과 이미지가 함께 클립보드에 복사됩니다. 글쓰기 에디터에 붙여넣기하면 HTML 에디터를 열지 않고도 자동으로 스타일이 적용됩니다!
            </ModernHint>
          </ModernSection>

          {/* 디자인 테마 선택 섹션 */}
          <ModernSection title="🎨 디자인 테마">
            <ModernFormGroup label="전체 디자인 테마">
              <ModernSelect
                value={config.designTheme}
                onChange={(value) => handleInputChange('designTheme', value as 'white' | 'black' | 'blackwhite')}
                options={[
                  { value: 'black', label: '블랙' },
                  { value: 'blackwhite', label: '블랙앤화이트' },
                  { value: 'white', label: '화이트' }
                ]}
              />
              <ModernHint>
                <p>💡 테마 선택 시 텍스트와 태그 색상이 자동으로 적응됩니다.</p>
              </ModernHint>
            </ModernFormGroup>

            <ModernFormGroup>
              <ModernCheckbox
                checked={config.hideProfileSection}
                onChange={(checked) => handleInputChange('hideProfileSection', checked)}
                label="프로필 영역 숨기기 (본문만 표시)"
              />
              <ModernHint>
                <p>💡 체크하면 배경이미지, 프로필이미지, 캐릭터 정보, 태그가 모두 숨겨집니다.</p>
              </ModernHint>
            </ModernFormGroup>
          </ModernSection>

          {/* 이미지 설정 섹션 */}
          <ModernSection title="🖼️ 이미지 설정">
            {/* 배경 이미지 업로드 */}
            <ModernFormGroup label="🖼️ 배경 이미지 - 로컬 업로드">
              <div style={{
                border: '2px dashed #cbd5e0',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                backgroundColor: isDarkMode ? '#2d3748' : '#f7fafc',
                transition: 'all 0.2s ease'
              }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'backgroundImage')}
                  style={{ display: 'none' }}
                  id="background-image-upload"
                />
                <label 
                  htmlFor="background-image-upload"
                  style={{
                    cursor: 'pointer',
                    display: 'block'
                  }}
                >
                  <div style={{
                    fontSize: '48px',
                    marginBottom: '10px',
                    color: isDarkMode ? '#a0aec0' : '#718096'
                  }}>
                    🖼️
                  </div>
                  <p style={{
                    margin: '0 0 5px 0',
                    fontWeight: 'bold',
                    color: isDarkMode ? '#e2e8f0' : '#2d3748'
                  }}>
                    클릭하여 배경 이미지 선택
                  </p>
                  <p style={{
                    margin: 0,
                    fontSize: '14px',
                    color: isDarkMode ? '#a0aec0' : '#718096'
                  }}>
                    권장: 1400×400px | JPG, PNG, GIF 지원 (최대 5MB)
                  </p>
                </label>
              </div>
              {uploadStatus && (
                <div style={{
                  marginTop: '10px',
                  padding: '10px',
                  borderRadius: '6px',
                  backgroundColor: uploadStatus.includes('성공') ? '#c6f6d5' : '#fed7d7',
                  color: uploadStatus.includes('성공') ? '#2f855a' : '#c53030',
                  fontSize: '14px'
                }}>
                  {uploadStatus}
                </div>
              )}
            </ModernFormGroup>

            <ModernFormGroup label="🌐 배경 이미지 - 외부 URL">
              <ModernInput
                value={config.backgroundImage}
                onChange={(value) => handleInputChange('backgroundImage', value)}
                onPaste={(e) => handlePaste(e, 'backgroundImage')}
                placeholder="배경 이미지 URL 또는 HTML 코드"
              />
              <ModernHint>
                <p><strong>💡 사용 방법:</strong></p>
                <p>• 이미지 URL을 직접 입력하거나</p>
                <p>• 아카라이브 등에서 복사한 HTML 코드를 붙여넣으면 자동으로 URL이 추출됩니다</p>
              </ModernHint>
            </ModernFormGroup>

            {/* 프로필 이미지 업로드 */}
            <ModernFormGroup label="👤 프로필 이미지 - 로컬 업로드">
              <div style={{
                border: '2px dashed #cbd5e0',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                backgroundColor: isDarkMode ? '#2d3748' : '#f7fafc',
                transition: 'all 0.2s ease'
              }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'profileImage')}
                  style={{ display: 'none' }}
                  id="profile-image-upload"
                />
                <label 
                  htmlFor="profile-image-upload"
                  style={{
                    cursor: 'pointer',
                    display: 'block'
                  }}
                >
                  <div style={{
                    fontSize: '48px',
                    marginBottom: '10px',
                    color: isDarkMode ? '#a0aec0' : '#718096'
                  }}>
                    👤
                  </div>
                  <p style={{
                    margin: '0 0 5px 0',
                    fontWeight: 'bold',
                    color: isDarkMode ? '#e2e8f0' : '#2d3748'
                  }}>
                    클릭하여 프로필 이미지 선택
                  </p>
                  <p style={{
                    margin: 0,
                    fontSize: '14px',
                    color: isDarkMode ? '#a0aec0' : '#718096'
                  }}>
                    권장: 200×200px (정사각형) | JPG, PNG, GIF 지원 (최대 5MB)
                  </p>
                </label>
              </div>
            </ModernFormGroup>

            <ModernFormGroup label="🌐 프로필 이미지 - 외부 URL">
              <ModernInput
                value={config.profileImage}
                onChange={(value) => handleInputChange('profileImage', value)}
                onPaste={(e) => handlePaste(e, 'profileImage')}
                placeholder="프로필 이미지 URL 또는 HTML 코드"
              />
              <ModernHint>
                <p><strong>💡 사용 방법:</strong></p>
                <p>• 이미지 URL을 직접 입력하거나</p>
                <p>• 아카라이브 등에서 복사한 HTML 코드를 붙여넣으면 자동으로 URL이 추출됩니다</p>
              </ModernHint>
            </ModernFormGroup>
          </ModernSection>

          {/* 캐릭터 정보 섹션 */}
          <ModernSection title="👤 캐릭터 정보">
            <ModernFormRow>
              <ModernFormGroup label="캐릭터 이름">
                <ModernInput
                  value={config.leftText}
                  onChange={(value) => handleInputChange('leftText', value)}
                  placeholder="캐릭터 이름을 입력하세요"
                />
              </ModernFormGroup>
              <ModernFormGroup label="이름 색상">
                <ModernColorPicker
                  value={config.leftTextColor1}
                  onChange={(color) => handleInputChange('leftTextColor1', color)}
                />
              </ModernFormGroup>
            </ModernFormRow>

            <ModernFormGroup>
              <ModernCheckbox
                checked={config.showCharacterDescription}
                onChange={(checked) => handleInputChange('showCharacterDescription', checked)}
                label="캐릭터 소개문 표시"
              />
            </ModernFormGroup>

            {config.showCharacterDescription && (
              <ModernFormGroup label="캐릭터 소개문">
                <ModernInput
                  value={config.characterDescription}
                  onChange={(value) => handleInputChange('characterDescription', value)}
                  placeholder="캐릭터 소개문을 입력하세요"
                />
              </ModernFormGroup>
            )}
          </ModernSection>

          {/* 태그 설정 섹션 */}
          <ModernSection title="🏷️ 태그 설정">
            <ModernFormRow>
              <ModernFormGroup label="태그 개수">
                <ModernSelect
                  value={config.tagCount.toString()}
                  onChange={(value) => handleInputChange('tagCount', parseInt(value))}
                  options={[
                    { value: '0', label: '태그 없음' },
                    { value: '1', label: '1개' },
                    { value: '2', label: '2개' },
                    { value: '3', label: '3개' }
                  ]}
                />
              </ModernFormGroup>
              <ModernFormGroup label="태그 스타일">
                <ModernSelect
                  value={config.tagStyle}
                  onChange={(value) => handleInputChange('tagStyle', value as 'filled' | 'outline')}
                  options={[
                    { value: 'filled', label: '채움' },
                    { value: 'outline', label: '외곽선' }
                  ]}
                />
              </ModernFormGroup>
            </ModernFormRow>

            {config.tagCount >= 1 && (
              <ModernFormGroup label="첫 번째 태그">
                <ModernInput
                  value={config.tag1Text}
                  onChange={(value) => handleInputChange('tag1Text', value)}
                  placeholder="첫 번째 태그 텍스트"
                />
              </ModernFormGroup>
            )}

            {config.tagCount >= 2 && (
              <ModernFormGroup label="두 번째 태그">
                <ModernInput
                  value={config.tag2Text}
                  onChange={(value) => handleInputChange('tag2Text', value)}
                  placeholder="두 번째 태그 텍스트"
                />
              </ModernFormGroup>
            )}

            {config.tagCount >= 3 && (
              <ModernFormGroup label="세 번째 태그">
                <ModernInput
                  value={config.tag3Text}
                  onChange={(value) => handleInputChange('tag3Text', value)}
                  placeholder="세 번째 태그 텍스트"
                />
              </ModernFormGroup>
            )}

            {config.tagCount > 0 && (
              <>
                {config.tagStyle === 'filled' ? (
                  <ModernFormGroup label="태그 배경 색상">
                    <ModernColorPicker
                      value={config.tagBackgroundColor}
                      onChange={(color) => handleInputChange('tagBackgroundColor', color)}
                    />
                  </ModernFormGroup>
                ) : (
                  <ModernFormGroup label="태그 테두리 색상">
                    <ModernColorPicker
                      value={config.tagBorderColor}
                      onChange={(color) => handleInputChange('tagBorderColor', color)}
                    />
                  </ModernFormGroup>
                )}

                <ModernFormRow>
                  <ModernFormGroup label="태그 텍스트 색상">
                    <ModernColorPicker
                      value={config.tagTextColor}
                      onChange={(color) => handleInputChange('tagTextColor', color)}
                    />
                  </ModernFormGroup>
                  <ModernFormGroup>
                    <ModernSlider
                      value={config.tagBorderRadius}
                      onChange={(value) => handleInputChange('tagBorderRadius', value)}
                      min={0}
                      max={25}
                      step={1}
                      label="태그 둥글기 (px)"
                    />
                  </ModernFormGroup>
                </ModernFormRow>
              </>
            )}
          </ModernSection>

          {/* 대화 스타일 섹션 */}
          <ModernSection title="💬 대화 스타일">
            <ModernFormRow>
              <ModernFormGroup label="대화 색상 1">
                <ModernColorPicker
                  value={config.quoteColor1}
                  onChange={(color) => handleInputChange('quoteColor1', color)}
                />
              </ModernFormGroup>
              <ModernFormGroup label="대화 색상 2">
                <ModernColorPicker
                  value={config.quoteColor2}
                  onChange={(color) => handleInputChange('quoteColor2', color)}
                />
              </ModernFormGroup>
              <ModernFormGroup label="독백 색상">
                <ModernColorPicker
                  value={config.singleQuoteColor}
                  onChange={(color) => handleInputChange('singleQuoteColor', color)}
                />
              </ModernFormGroup>
            </ModernFormRow>

            <ModernFormRow>
              <ModernFormGroup>
                <ModernCheckbox
                  checked={config.boldEnabled}
                  onChange={(checked) => handleInputChange('boldEnabled', checked)}
                  label="대화 텍스트 굵게"
                />
              </ModernFormGroup>
              <ModernFormGroup>
                <ModernCheckbox
                  checked={config.singleQuoteItalic}
                  onChange={(checked) => handleInputChange('singleQuoteItalic', checked)}
                  label="독백 텍스트 기울임"
                />
              </ModernFormGroup>
            </ModernFormRow>
          </ModernSection>

          {/* 텍스트 설정 섹션 */}
          <ModernSection title="📝 텍스트 설정">
            <ModernFormRow>
              <ModernFormGroup>
                <ModernSlider
                  value={config.fontSize}
                  onChange={(value) => handleInputChange('fontSize', value)}
                  min={12}
                  max={24}
                  step={1}
                  label="글자 크기 (px)"
                />
              </ModernFormGroup>
              <ModernFormGroup>
                <ModernSlider
                  value={config.lineHeight}
                  onChange={(value) => handleInputChange('lineHeight', value)}
                  min={1.2}
                  max={3.0}
                  step={0.1}
                  label="줄 간격"
                />
              </ModernFormGroup>
            </ModernFormRow>

            <ModernFormRow>
              <ModernFormGroup label="텍스트 색상">
                <ModernColorPicker
                  value={config.contentTextColor}
                  onChange={(color) => handleInputChange('contentTextColor', color)}
                />
              </ModernFormGroup>
              <ModernFormGroup>
                <ModernCheckbox
                  checked={config.paragraphIndent}
                  onChange={(checked) => handleInputChange('paragraphIndent', checked)}
                  label="문단 들여쓰기"
                />
              </ModernFormGroup>
            </ModernFormRow>
          </ModernSection>

          {/* 단어 치환 섹션 */}
          <ModernSection title="🔄 단어 치환">
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

        {/* 미리보기 패널 */}
        <div className="preview-panel">
          <div className="preview-header">
            <h3 className="preview-title">🎭 빙둔형 미리보기</h3>
          </div>
          
          <div className="preview-container">
            {generatedHTML ? (
              <div dangerouslySetInnerHTML={{ __html: generatePreviewHTML() }} />
            ) : (
              <div style={{
                textAlign: 'center',
                color: isDarkMode ? '#65676b' : '#8a8d91',
                fontSize: `${STYLES.font_size_normal}px`,
                padding: '40px 0'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎭</div>
                <p>HTML 생성 버튼을 눌러 미리보기를 확인하세요</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BingdunFormLayout; 