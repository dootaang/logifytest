import React, { useState, useEffect, useRef } from 'react';
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
  ModernSelect,
  ModernToggle
} from './ModernComponents'
import { PRESET_THEMES, FONT_OPTIONS } from './ViewextGenerator'
import ViewextGenerator from './ViewextGenerator'

interface WordReplacement {
  from: string;
  to: string;
}

// 채팅 섹션 인터페이스 추가
interface ChatSection {
  id: string;
  content: string;
}

interface ViewextConfig {
  // 기본 콘텐츠
  content: string;
  title: string;
  
  // 이미지 설정
  mainImageUrl: string;
  showMainImage: boolean;
  imageMaxWidth: number;
  
  // 색상 및 스타일 설정
  backgroundColor: string;
  backgroundGradient: string;
  titleColor: string;
  textColor: string;
  borderColor: string;
  
  // 하이라이트 박스 설정
  highlightBoxColor: string;
  highlightBoxBorderColor: string;
  highlightBoxTextColor: string;
  
  // 대화 박스 설정
  dialogueBoxColor: string;
  dialogueBoxBorderColor: string;
  dialogueBoxTextColor: string;
  
  // 폰트 설정
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  
  // 텍스트 커스터마이징 설정
  boldEnabled: boolean;
  italicEnabled: boolean;
  highlightBoldEnabled: boolean;
  highlightItalicEnabled: boolean;
  dialogueBoldEnabled: boolean;
  dialogueItalicEnabled: boolean;
  
  // 레이아웃 설정
  maxWidth: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  borderRadius: number;
  shadowBlur: number;
  shadowSpread: number;
  
  // 고급 설정
  enableCustomCSS: boolean;
  customCSS: string;
  
  // 단어 변환 기능
  wordReplacements: WordReplacement[];
  
  // chatSections 추가
  chatSections?: ChatSection[];
}

interface ViewextFormLayoutProps {
  config: ViewextConfig;
  onConfigChange: (newConfig: Partial<ViewextConfig>) => void;
  generatedHTML: string;
  onGenerateHTML: () => void;
  onCopyHTML: () => void;
  onReset: () => void;
}

const ViewextFormLayout: React.FC<ViewextFormLayoutProps> = ({
  config,
  onConfigChange,
  generatedHTML,
  onGenerateHTML,
  onCopyHTML,
  onReset
}) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedPreset, setSelectedPreset] = useState('alternate-hunters');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  
  // 채팅 섹션 관리 추가
  const [chatSections, setChatSections] = useState<ChatSection[]>([
    { id: 'default', content: config.content || '' }
  ]);
  const textareaRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({});

  // 자동 저장 키 상수
  const AUTOSAVE_PREFIX = 'autoSavedViewext_v1_';

  // 자동 저장 설정
  const setupAutoSave = (sectionId: string, content: string) => {
    try {
      localStorage.setItem(`${AUTOSAVE_PREFIX}${sectionId}`, content);
    } catch (error) {
      console.error('자동 저장 오류:', error);
    }
  };

  // 자동 저장된 내용 불러오기
  const loadAutoSaved = (sectionId: string): string => {
    try {
      return localStorage.getItem(`${AUTOSAVE_PREFIX}${sectionId}`) || '';
    } catch (error) {
      console.error('자동 저장 불러오기 오류:', error);
      return '';
    }
  };

  // 채팅 섹션 업데이트
  const updateChatSection = (sectionId: string, content: string) => {
    const newSections = chatSections.map(section => 
      section.id === sectionId ? { ...section, content } : section
    );
    setChatSections(newSections);
    
    // 자동 저장
    setupAutoSave(sectionId, content);
    
    // 섹션 배열을 config에 전달
    const combinedContent = newSections.map(section => section.content).filter(c => c.trim()).join('\n\n');
    onConfigChange({ 
      content: combinedContent,
      chatSections: newSections 
    });
  };

  // 채팅 섹션 추가
  const addChatSection = () => {
    const newId = `viewext_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newSection: ChatSection = { id: newId, content: '' };
    setChatSections(prev => [...prev, newSection]);
  };

  // 채팅 섹션 삭제
  const removeChatSection = (sectionId: string) => {
    if (chatSections.length <= 1) {
      alert('최소 하나의 본문 섹션은 필요합니다.');
      return;
    }
    
    if (!confirm('이 본문 섹션을 삭제하시겠습니까?')) {
      return;
    }
    
    // 자동 저장된 내용 삭제
    try {
      localStorage.removeItem(`${AUTOSAVE_PREFIX}${sectionId}`);
    } catch (error) {
      console.error('자동 저장 삭제 오류:', error);
    }
    
    const newSections = chatSections.filter(section => section.id !== sectionId);
    setChatSections(newSections);
    
    // 섹션 배열을 config에 전달
    const combinedContent = newSections.map(section => section.content).filter(c => c.trim()).join('\n\n');
    onConfigChange({ 
      content: combinedContent,
      chatSections: newSections 
    });
  };

  // 채팅 섹션 이동
  const moveChatSection = (sectionId: string, direction: 'up' | 'down') => {
    const currentIndex = chatSections.findIndex(section => section.id === sectionId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= chatSections.length) return;
    
    const newSections = [...chatSections];
    [newSections[currentIndex], newSections[newIndex]] = [newSections[newIndex], newSections[currentIndex]];
    setChatSections(newSections);
    
    // 섹션 배열을 config에 전달
    const combinedContent = newSections.map(section => section.content).filter(c => c.trim()).join('\n\n');
    onConfigChange({ 
      content: combinedContent,
      chatSections: newSections 
    });
  };

  // 다크모드 감지
  useEffect(() => {
    const checkDarkMode = () => {
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setIsDarkMode(darkModeQuery.matches);
    };

    checkDarkMode();
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeQuery.addEventListener('change', checkDarkMode);

    return () => darkModeQuery.removeEventListener('change', checkDarkMode);
  }, []);

  const handleInputChange = (field: string, value: any) => {
    onConfigChange({ [field]: value });
  };

  // 이미지 업로드 핸들러 (배너형 생성기에서 이식)
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
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
        handleInputChange('mainImageUrl', data.url);
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

  // HTML에서 이미지 URL 추출하는 함수 (배너형 생성기에서 이식)
  const extractImageUrlFromHtml = (htmlString: string) => {
    const imgTagRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/i;
    const match = htmlString.match(imgTagRegex);
    
    if (match && match[1]) {
      return match[1];
    }
    
    return htmlString;
  };

  // 입력값이 HTML인지 확인하는 함수 (배너형 생성기에서 이식)
  const isHtmlImageTag = (input: string) => {
    return input.includes('<img') && input.includes('src=');
  };

  // 이미지 URL 변경 핸들러 (HTML 자동 추출 포함)
  const handleImageUrlChange = (value: string) => {
    if (isHtmlImageTag(value)) {
      const extractedUrl = extractImageUrlFromHtml(value);
      handleInputChange('mainImageUrl', extractedUrl);
    } else {
      handleInputChange('mainImageUrl', value);
    }
  };

  // 이미지 삭제 함수 추가
  const handleImageDelete = () => {
    handleInputChange('mainImageUrl', '');
  };

  // 단어 변환 기능 (제리형에서 이식)
  const handleWordReplacementChange = (index: number, field: string, value: string) => {
    const newReplacements = [...config.wordReplacements];
    newReplacements[index][field as keyof typeof newReplacements[0]] = value;
    onConfigChange({ wordReplacements: newReplacements });
  };

  const addWordReplacement = () => {
    const newReplacements = [...config.wordReplacements, { from: '', to: '' }];
    onConfigChange({ wordReplacements: newReplacements });
  };

  const removeWordReplacement = (index: number) => {
    const newReplacements = config.wordReplacements.filter((_, i) => i !== index);
    onConfigChange({ wordReplacements: newReplacements });
  };

  // 프리셋 테마 적용
  const applyPresetTheme = (presetKey: string) => {
    const preset = PRESET_THEMES[presetKey as keyof typeof PRESET_THEMES];
    if (preset) {
      onConfigChange({
        backgroundColor: preset.backgroundColor,
        titleColor: preset.titleColor,
        textColor: preset.textColor,
        borderColor: preset.borderColor,
        highlightBoxColor: preset.highlightBoxColor,
        highlightBoxBorderColor: preset.highlightBoxBorderColor,
        highlightBoxTextColor: preset.highlightBoxTextColor,
        dialogueBoxColor: preset.dialogueBoxColor,
        dialogueBoxBorderColor: preset.dialogueBoxBorderColor,
        dialogueBoxTextColor: preset.dialogueBoxTextColor
      });
      setSelectedPreset(presetKey);
    }
  };

  const presetOptions = Object.entries(PRESET_THEMES).map(([key, theme]) => ({
    value: key,
    label: theme.name
  }));

  const fontOptions = FONT_OPTIONS.map(font => ({
    value: font.value,
    label: font.name
  }));

  const downloadHTML = () => {
    const blob = new Blob([generatedHTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `뷰익형-${config.title.replace(/\s+/g, '-')}-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 미리보기용 HTML 생성 함수 (배너형 생성기 방식 모방)
  const generatePreviewHTML = () => {
    if (config.content) {
      const generator = ViewextGenerator({ config });
      return generator.generatePreviewHTML ? generator.generatePreviewHTML() : generator.generateHTML();
    }
    return '';
  };

  return (
    <div className="form-layout">
      <div className="form-container">
        {/* 설정 패널 */}
        <div className="settings-panel">
          <div className="panel-header">
            <div className="header-content">
              <div className="header-text">
                <h2>커스텀 설정</h2>
                <p className="panel-description">제공된 HTML 구조에 맞춘 새로운 뷰익형 생성기</p>
              </div>
              <div className="header-actions">
                <ModernButton onClick={onCopyHTML} primary>
                  📋 클립보드에 복사
                </ModernButton>
              </div>
            </div>
          </div>

          {/* 탭 네비게이션 */}
          <div className="tab-navigation">
            {[
              { id: 'basic', label: '기본 설정', icon: '📝' },
              { id: 'style', label: '스타일', icon: '🎨' },
              { id: 'colors', label: '텍스트', icon: '✏️' },
              { id: 'advanced', label: '고급', icon: '⚙️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              >
                <span className="tab-icon">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* 탭 컨텐츠 */}
          <div className="tab-content">
            {activeTab === 'basic' && (
              <div className="tab-panel">
                <ModernSection title="기본 정보">
                  <ModernFormGroup label="제목">
                    <ModernInput
                      value={config.title}
                      onChange={(value) => handleInputChange('title', value)}
                      placeholder="ALTERNATE HUNTERS"
                    />
                    <ModernHint>
                      상단에 표시될 제목 (대문자로 변환됨)
                    </ModernHint>
                  </ModernFormGroup>
                </ModernSection>

                <ModernSection title="콘텐츠">
                  <ModernHint>
                    <strong>본문 작성 안내</strong>
                    <div style={{ marginTop: '8px', fontSize: '13px', lineHeight: 1.7 }}>
                      - 문단 구분: 빈 줄로 구분<br/>
                      - 파란색 강조: '작은따옴표' 사용<br/>
                      - 노란색 대화: "큰따옴표" 사용<br/>
                      - 볼드: **텍스트**, 이탤릭: *텍스트*<br/>
                      - 여러 개의 본문 섹션을 추가해서 구분하여 작성할 수 있습니다
                    </div>
                  </ModernHint>

                  {/* 본문 섹션들 */}
                  {chatSections.map((section, index) => (
                    <div key={section.id} style={{ marginBottom: '20px', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
                      {/* 섹션 헤더 */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <label style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          본문 내용 {chatSections.length > 1 ? `${index + 1}` : ''}
                        </label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <ModernButton
                            onClick={() => moveChatSection(section.id, 'up')}
                            disabled={index === 0}
                            style={{ padding: '4px 8px', fontSize: '12px' }}
                          >
                            ▲
                          </ModernButton>
                          <ModernButton
                            onClick={() => moveChatSection(section.id, 'down')}
                            disabled={index === chatSections.length - 1}
                            style={{ padding: '4px 8px', fontSize: '12px' }}
                          >
                            ▼
                          </ModernButton>
                          <ModernButton
                            danger
                            onClick={() => removeChatSection(section.id)}
                            disabled={chatSections.length <= 1}
                            style={{ padding: '4px 8px', fontSize: '12px' }}
                          >
                            X
                          </ModernButton>
                        </div>
                      </div>

                      {/* 텍스트에어리어 */}
                      <textarea
                        ref={(el) => {
                          if (el) {
                            textareaRefs.current[section.id] = el;
                          }
                        }}
                        value={section.content}
                        onChange={(e) => updateChatSection(section.id, e.target.value)}
                        placeholder="본문 내용을 입력하세요..."
                        rows={15}
                        className="form-input form-textarea"
                        style={{ width: '100%', minHeight: '200px' }}
                      />
                    </div>
                  ))}

                  {/* 본문 섹션 추가 버튼 */}
                  <ModernFormGroup>
                    <ModernButton onClick={addChatSection}>
                      본문 섹션 추가
                    </ModernButton>
                  </ModernFormGroup>
                </ModernSection>

                {/* 단어 변환 기능 (제리형에서 이식) */}
                <ModernSection title="🔄 단어 변환">
                  <ModernHint>
                    <p><strong>💡 사용법:</strong></p>
                    <p>• 변경할 단어와 대체할 단어를 입력하세요</p>
                    <p>• 예: "종원" → "유저", "AI" → "봇" 등</p>
                    <p>• 정규표현식이 지원되므로 패턴 매칭도 가능합니다</p>
                  </ModernHint>
                  {config.wordReplacements.map((replacement, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      gap: '12px', 
                      alignItems: 'center', 
                      marginBottom: '12px',
                      padding: '12px',
                      backgroundColor: 'var(--surface)',
                      borderRadius: '8px',
                      border: '1px solid var(--border)'
                    }}>
                      <ModernInput
                        value={replacement.from}
                        onChange={(value) => handleWordReplacementChange(index, 'from', value)}
                        placeholder="변경할 단어"
                      />
                      <span style={{ 
                        fontSize: '18px', 
                        color: 'var(--text-secondary)',
                        fontWeight: 'bold'
                      }}>→</span>
                      <ModernInput
                        value={replacement.to}
                        onChange={(value) => handleWordReplacementChange(index, 'to', value)}
                        placeholder="대체할 단어"
                      />
                      <ModernButton
                        danger
                        onClick={() => removeWordReplacement(index)}
                        style={{ padding: '8px 12px', fontSize: '12px' }}
                      >
                        삭제
                      </ModernButton>
                    </div>
                  ))}
                  <ModernFormGroup>
                    <ModernButton onClick={addWordReplacement}>
                      + 단어 변환 추가
                    </ModernButton>
                  </ModernFormGroup>
                </ModernSection>

                <ModernSection title="이미지 설정">
                  <ModernFormRow>
                    <ModernFormGroup label="메인 이미지 표시">
                      <ModernToggle
                        checked={config.showMainImage}
                        onChange={(checked) => handleInputChange('showMainImage', checked)}
                      />
                    </ModernFormGroup>
                  </ModernFormRow>
                  
                  {config.showMainImage && (
                    <>
                      {/* 로컬 이미지 업로드 섹션 (배너형 생성기에서 이식) */}
                      <ModernFormGroup label="🖼️ 로컬 이미지 업로드">
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
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                            id="viewext-image-upload"
                          />
                          
                          <label
                            htmlFor="viewext-image-upload"
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
                              📁
                            </div>
                            <p style={{
                              margin: '0 0 5px 0',
                              fontWeight: 'bold',
                              color: isDarkMode ? '#e2e8f0' : '#2d3748'
                            }}>
                              클릭하여 이미지 선택
                            </p>
                            <p style={{
                              margin: 0,
                              fontSize: '14px',
                              color: isDarkMode ? '#a0aec0' : '#718096'
                            }}>
                              JPG, PNG, GIF 파일 지원 (최대 5MB)
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

                      {/* 외부 URL 섹션 (배너형 생성기에서 이식) */}
                      <ModernFormGroup label="🌐 외부 이미지 URL">
                        <ModernInput
                          value={config.mainImageUrl}
                          onChange={handleImageUrlChange}
                          placeholder="이미지 URL 또는 HTML 코드"
                        />
                        <ModernHint>
                          <p><strong>💡 사용 방법:</strong></p>
                          <p>• 이미지 URL을 직접 입력하거나</p>
                          <p>• 아카라이브 등에서 복사한 HTML 코드를 붙여넣으면 자동으로 URL이 추출됩니다</p>
                        </ModernHint>
                      </ModernFormGroup>
                      
                      {/* 현재 이미지 표시 및 삭제 기능 */}
                      {config.mainImageUrl && (
                        <ModernFormGroup label="🖼️ 현재 메인 이미지">
                          <div style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '10px',
                            backgroundColor: isDarkMode ? '#2d3748' : '#f7fafc'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                              <img 
                                src={config.mainImageUrl} 
                                alt="메인 이미지 미리보기"
                                style={{
                                  width: '60px',
                                  height: '40px',
                                  objectFit: 'cover',
                                  borderRadius: '4px',
                                  border: '1px solid #cbd5e0'
                                }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                              <span style={{
                                flex: 1,
                                fontSize: '14px',
                                color: isDarkMode ? '#a0aec0' : '#718096',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {config.mainImageUrl.length > 50 
                                  ? config.mainImageUrl.substring(0, 50) + '...' 
                                  : config.mainImageUrl}
                              </span>
                            </div>
                            <ModernButton 
                              danger 
                              onClick={handleImageDelete}
                              style={{ fontSize: '12px', padding: '4px 8px' }}
                            >
                              🗑️ 삭제
                            </ModernButton>
                          </div>
                        </ModernFormGroup>
                      )}

                      <ModernFormGroup label="이미지 최대 너비 (px)">
                        <ModernSlider
                          value={config.imageMaxWidth}
                          onChange={(value) => handleInputChange('imageMaxWidth', value)}
                          min={200}
                          max={600}
                          step={20}
                        />
                        <ModernHint>
                          현재: {config.imageMaxWidth}px
                        </ModernHint>
                      </ModernFormGroup>
                    </>
                  )}
                </ModernSection>
              </div>
            )}

            {activeTab === 'style' && (
              <div className="tab-panel">
                <ModernSection title="프리셋 테마">
                  <ModernFormGroup label="테마 선택">
                    <ModernSelect
                      value={selectedPreset}
                      onChange={(value) => {
                        setSelectedPreset(value);
                        applyPresetTheme(value);
                      }}
                      options={presetOptions}
                    />
                    <ModernHint>
                      미리 정의된 테마를 선택하면 모든 색상이 자동 적용됩니다
                    </ModernHint>
                  </ModernFormGroup>
                </ModernSection>

                <ModernSection title="폰트 설정">
                  <ModernFormRow>
                    <ModernFormGroup label="폰트 패밀리">
                      <ModernSelect
                        value={config.fontFamily}
                        onChange={(value) => handleInputChange('fontFamily', value)}
                        options={fontOptions}
                      />
                    </ModernFormGroup>
                    
                    <ModernFormGroup label="폰트 크기 (px)">
                      <ModernSlider
                        value={config.fontSize}
                        onChange={(value) => handleInputChange('fontSize', value)}
                        min={12}
                        max={24}
                        step={1}
                      />
                      <ModernHint>{config.fontSize}px</ModernHint>
                    </ModernFormGroup>
                  </ModernFormRow>

                  <ModernFormRow>
                    <ModernFormGroup label="줄 간격">
                      <ModernSlider
                        value={config.lineHeight}
                        onChange={(value) => handleInputChange('lineHeight', value)}
                        min={1.0}
                        max={2.5}
                        step={0.1}
                      />
                      <ModernHint>{config.lineHeight}</ModernHint>
                    </ModernFormGroup>
                    
                    <ModernFormGroup label="자간 (rem)">
                      <ModernSlider
                        value={config.letterSpacing}
                        onChange={(value) => handleInputChange('letterSpacing', value)}
                        min={-0.1}
                        max={0.3}
                        step={0.01}
                      />
                      <ModernHint>{config.letterSpacing}rem</ModernHint>
                    </ModernFormGroup>
                  </ModernFormRow>
                </ModernSection>

                <ModernSection title="레이아웃 설정">
                  <ModernFormRow>
                    <ModernFormGroup label="최대 너비 (rem)">
                      <ModernSlider
                        value={config.maxWidth}
                        onChange={(value) => handleInputChange('maxWidth', value)}
                        min={30}
                        max={80}
                        step={1}
                      />
                      <ModernHint>{config.maxWidth}rem</ModernHint>
                    </ModernFormGroup>
                    
                    <ModernFormGroup label="모서리 둥글기 (rem)">
                      <ModernSlider
                        value={config.borderRadius}
                        onChange={(value) => handleInputChange('borderRadius', value)}
                        min={0}
                        max={3}
                        step={0.1}
                      />
                      <ModernHint>{config.borderRadius}rem</ModernHint>
                    </ModernFormGroup>
                  </ModernFormRow>

                  <ModernFormGroup label="패딩 설정">
                    <ModernFormRow>
                      <ModernFormGroup label="상단 (rem)">
                        <ModernSlider
                          value={config.paddingTop}
                          onChange={(value) => handleInputChange('paddingTop', value)}
                          min={0}
                          max={5}
                          step={0.1}
                        />
                        <ModernHint>{config.paddingTop}rem</ModernHint>
                      </ModernFormGroup>
                      
                      <ModernFormGroup label="하단 (rem)">
                        <ModernSlider
                          value={config.paddingBottom}
                          onChange={(value) => handleInputChange('paddingBottom', value)}
                          min={0}
                          max={5}
                          step={0.1}
                        />
                        <ModernHint>{config.paddingBottom}rem</ModernHint>
                      </ModernFormGroup>
                    </ModernFormRow>

                    <ModernFormRow>
                      <ModernFormGroup label="좌측 (rem)">
                        <ModernSlider
                          value={config.paddingLeft}
                          onChange={(value) => handleInputChange('paddingLeft', value)}
                          min={0}
                          max={5}
                          step={0.1}
                        />
                        <ModernHint>{config.paddingLeft}rem</ModernHint>
                      </ModernFormGroup>
                      
                      <ModernFormGroup label="우측 (rem)">
                        <ModernSlider
                          value={config.paddingRight}
                          onChange={(value) => handleInputChange('paddingRight', value)}
                          min={0}
                          max={5}
                          step={0.1}
                        />
                        <ModernHint>{config.paddingRight}rem</ModernHint>
                      </ModernFormGroup>
                    </ModernFormRow>
                  </ModernFormGroup>

                  <ModernFormGroup label="그림자 설정">
                    <ModernFormRow>
                      <ModernFormGroup label="블러 (rem)">
                        <ModernSlider
                          value={config.shadowBlur}
                          onChange={(value) => handleInputChange('shadowBlur', value)}
                          min={0}
                          max={5}
                          step={0.1}
                        />
                        <ModernHint>{config.shadowBlur}rem</ModernHint>
                      </ModernFormGroup>
                      
                      <ModernFormGroup label="확산 (rem)">
                        <ModernSlider
                          value={config.shadowSpread}
                          onChange={(value) => handleInputChange('shadowSpread', value)}
                          min={0}
                          max={3}
                          step={0.1}
                        />
                        <ModernHint>{config.shadowSpread}rem</ModernHint>
                      </ModernFormGroup>
                    </ModernFormRow>
                  </ModernFormGroup>
                </ModernSection>
              </div>
            )}

            {activeTab === 'colors' && (
              <div className="tab-panel">
                {/* 텍스트 커스터마이징 섹션 */}
                <ModernSection title="🎯 텍스트 커스터마이징">
                  <ModernHint>
                    <strong>텍스트 스타일 설정</strong>
                    <div style={{ marginTop: '8px', fontSize: '13px', lineHeight: 1.7 }}>
                      - 일반 텍스트: **볼드**, *기울기* 마크다운 문법<br/>
                      - 작은따옴표 '강조': 파란색 하이라이트 박스<br/>
                      - 큰따옴표 "대화": 노란색 대화 박스
                    </div>
                  </ModernHint>
                  
                  <ModernFormRow>
                    <ModernFormGroup label="일반 텍스트">
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <ModernCheckbox
                          checked={config.boldEnabled}
                          onChange={(checked) => handleInputChange('boldEnabled', checked)}
                          label="볼드체 활성화 (**텍스트**)"
                        />
                        <ModernCheckbox
                          checked={config.italicEnabled}
                          onChange={(checked) => handleInputChange('italicEnabled', checked)}
                          label="기울기 활성화 (*텍스트*)"
                        />
                      </div>
                    </ModernFormGroup>
                  </ModernFormRow>
                </ModernSection>

                <ModernSection title="파란색 강조 ('작은따옴표')">
                  <ModernFormRow>
                    <ModernFormGroup label="배경색">
                      <ModernInput
                        value={config.highlightBoxColor}
                        onChange={(value) => handleInputChange('highlightBoxColor', value)}
                        placeholder="rgba(107, 182, 255, 0.1)"
                      />
                    </ModernFormGroup>
                    
                    <ModernFormGroup label="테두리 색상">
                      <ModernColorPicker
                        value={config.highlightBoxBorderColor}
                        onChange={(value) => handleInputChange('highlightBoxBorderColor', value)}
                      />
                    </ModernFormGroup>
                  </ModernFormRow>

                  <ModernFormRow>
                    <ModernFormGroup label="텍스트 색상">
                      <ModernColorPicker
                        value={config.highlightBoxTextColor}
                        onChange={(value) => handleInputChange('highlightBoxTextColor', value)}
                      />
                    </ModernFormGroup>
                    
                    <ModernFormGroup label="텍스트 스타일">
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <ModernCheckbox
                          checked={config.highlightBoldEnabled}
                          onChange={(checked) => handleInputChange('highlightBoldEnabled', checked)}
                          label="볼드체"
                        />
                        <ModernCheckbox
                          checked={config.highlightItalicEnabled}
                          onChange={(checked) => handleInputChange('highlightItalicEnabled', checked)}
                          label="기울기"
                        />
                      </div>
                    </ModernFormGroup>
                  </ModernFormRow>
                </ModernSection>

                <ModernSection title="노란색 대화 (&quot;큰따옴표&quot;)">
                  <ModernFormRow>
                    <ModernFormGroup label="배경색">
                      <ModernInput
                        value={config.dialogueBoxColor}
                        onChange={(value) => handleInputChange('dialogueBoxColor', value)}
                        placeholder="rgba(138, 121, 93, 0.1)"
                      />
                    </ModernFormGroup>
                    
                    <ModernFormGroup label="테두리 색상">
                      <ModernColorPicker
                        value={config.dialogueBoxBorderColor}
                        onChange={(value) => handleInputChange('dialogueBoxBorderColor', value)}
                      />
                    </ModernFormGroup>
                  </ModernFormRow>

                  <ModernFormRow>
                    <ModernFormGroup label="텍스트 색상">
                      <ModernColorPicker
                        value={config.dialogueBoxTextColor}
                        onChange={(value) => handleInputChange('dialogueBoxTextColor', value)}
                      />
                    </ModernFormGroup>
                    
                    <ModernFormGroup label="텍스트 스타일">
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <ModernCheckbox
                          checked={config.dialogueBoldEnabled}
                          onChange={(checked) => handleInputChange('dialogueBoldEnabled', checked)}
                          label="볼드체"
                        />
                        <ModernCheckbox
                          checked={config.dialogueItalicEnabled}
                          onChange={(checked) => handleInputChange('dialogueItalicEnabled', checked)}
                          label="기울기"
                        />
                      </div>
                    </ModernFormGroup>
                  </ModernFormRow>
                </ModernSection>

                <ModernSection title="기본 색상">
                  <ModernFormRow>
                    <ModernFormGroup label="배경색">
                      <ModernInput
                        value={config.backgroundColor}
                        onChange={(value) => handleInputChange('backgroundColor', value)}
                        placeholder="radial-gradient(...)"
                      />
                      <ModernHint>
                        CSS 배경 속성 (그라데이션 포함)
                      </ModernHint>
                    </ModernFormGroup>
                  </ModernFormRow>

                  <ModernFormRow>
                    <ModernFormGroup label="제목 색상">
                      <ModernColorPicker
                        value={config.titleColor}
                        onChange={(value) => handleInputChange('titleColor', value)}
                      />
                    </ModernFormGroup>
                    
                    <ModernFormGroup label="텍스트 색상">
                      <ModernColorPicker
                        value={config.textColor}
                        onChange={(value) => handleInputChange('textColor', value)}
                      />
                    </ModernFormGroup>
                  </ModernFormRow>

                  <ModernFormGroup label="테두리 색상">
                    <ModernColorPicker
                      value={config.borderColor}
                      onChange={(value) => handleInputChange('borderColor', value)}
                    />
                  </ModernFormGroup>
                </ModernSection>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="tab-panel">
                <ModernSection title="커스텀 CSS">
                  <ModernFormGroup label="커스텀 CSS 활성화">
                    <ModernToggle
                      checked={config.enableCustomCSS}
                      onChange={(checked) => handleInputChange('enableCustomCSS', checked)}
                    />
                    <ModernHint>
                      추가 CSS 스타일을 적용할 수 있습니다
                    </ModernHint>
                  </ModernFormGroup>

                  {config.enableCustomCSS && (
                    <ModernFormGroup label="CSS 코드">
                      <ModernTextarea
                        value={config.customCSS}
                        onChange={(value) => handleInputChange('customCSS', value)}
                        placeholder=".custom-class {
  color: #ff0000;
  font-weight: bold;
}

/* 추가 스타일 */
p {
  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
}"
                        rows={10}
                      />
                      <ModernHint>
                        HTML에 &lt;style&gt; 태그로 추가됩니다
                      </ModernHint>
                    </ModernFormGroup>
                  )}
                </ModernSection>

                <ModernSection title="내보내기 옵션">
                  <div className="export-buttons">
                    <ModernButton onClick={onGenerateHTML}>
                      🔄 HTML 재생성
                    </ModernButton>
                    
                    <ModernButton onClick={downloadHTML}>
                      💾 HTML 다운로드
                    </ModernButton>
                    
                    <ModernButton onClick={onReset} danger>
                      🔄 설정 초기화
                    </ModernButton>
                  </div>
                </ModernSection>
              </div>
            )}
          </div>
        </div>

        {/* 미리보기 패널 */}
        <div className="preview-panel">
          <div className="panel-header">
            <h2>미리보기</h2>
            <p className="panel-description">실시간 미리보기 - 설정 변경 시 자동 업데이트</p>
          </div>

          <div className="preview-container">
            <div dangerouslySetInnerHTML={{ __html: generatePreviewHTML() }} />
          </div>

          {/* HTML 코드 보기 */}
          <div className="code-section">
            <div className="code-header">
              <h3>생성된 HTML 코드</h3>
              <ModernButton 
                onClick={() => navigator.clipboard.writeText(generatedHTML)}
              >
                📋 코드 복사
              </ModernButton>
            </div>
            <div className="code-container">
              <pre className="code-content">
                <code>{generatedHTML}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .form-layout {
          display: flex;
          gap: 2rem;
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .form-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          width: 100%;
        }

        .settings-panel,
        .preview-panel {
          background: var(--bg-secondary);
          border-radius: 12px;
          border: 1px solid var(--border-color);
          overflow: hidden;
        }

        .panel-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-color);
          background: var(--bg-secondary);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }

        .header-text {
          flex: 1;
        }

        .header-actions {
          flex-shrink: 0;
        }

        .panel-header h2 {
          margin: 0 0 0.5rem 0;
          color: var(--text-primary);
          font-size: 1.25rem;
          font-weight: 600;
        }

        .panel-description {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .tab-navigation {
          display: flex;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
        }

        .tab-button {
          flex: 1;
          padding: 1rem;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .tab-button:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .tab-button.active {
          background: var(--bg-primary);
          color: var(--accent-color);
          border-bottom: 2px solid var(--accent-color);
        }

        .tab-icon {
          font-size: 1rem;
        }

        .tab-content {
          padding: 1.5rem;
        }

        .tab-panel {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .export-buttons {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .preview-container {
          background: var(--bg-primary);
          padding: 20px;
          margin: 0;
          min-height: 600px;
        }

        .code-section {
          border-top: 1px solid var(--border-color);
        }

        .code-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
        }

        .code-header h3 {
          margin: 0;
          color: var(--text-primary);
          font-size: 1rem;
          font-weight: 600;
        }

        .code-container {
          max-height: 300px;
          overflow: auto;
          background: var(--bg-primary);
          scrollbar-width: thin;
          scrollbar-color: var(--border-color) var(--bg-primary);
        }

        .code-container::-webkit-scrollbar {
          width: 8px;
        }

        .code-container::-webkit-scrollbar-track {
          background: var(--bg-primary);
        }

        .code-container::-webkit-scrollbar-thumb {
          background-color: var(--border-color);
          border-radius: 4px;
        }

        .code-container::-webkit-scrollbar-thumb:hover {
          background-color: var(--text-secondary);
        }

        .code-content {
          margin: 0;
          padding: 1rem;
          color: var(--text-primary);
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.75rem;
          line-height: 1.4;
          white-space: pre-wrap;
          word-break: break-all;
          background: var(--bg-primary);
        }

        @media (max-width: 1200px) {
          .form-container {
            grid-template-columns: 1fr;
          }
          
          .form-layout {
            padding: 1rem;
          }
        }

        @media (max-width: 768px) {
          .tab-navigation {
            flex-wrap: wrap;
          }
          
          .tab-button {
            flex: 1 1 50%;
            min-width: 120px;
          }
          
          .export-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default ViewextFormLayout; 