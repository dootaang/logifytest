'use client'

import React, { useState, useEffect, useRef } from 'react'
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
import BannerGeneratorV2 from '@/generators/BannerGeneratorV2'

// 템플릿 프리셋 데이터
const TEMPLATE_PRESETS = {
  "커스텀": {
    name: "커스텀",
    colors: {
      outerBox: "#ffffff",
      innerBox: "#f8f9fa",
      background: "#f8f9fa",
      botName: "#4a4a4a",
      dialog: "#2d3748",
      narration: "#4a5568",
      innerThoughts: "#718096",
      profileBorder: "#e2e8f0",
      boxBorder: "#e2e8f0",
      divider: "#e2e8f0",
      gradientStart: "#f8f9fa",
      gradientEnd: "#ffffff"
    }
  },
  "다크 모드 블루": {
    name: "다크 모드 블루",
    colors: {
      outerBox: "#1a202c",
      innerBox: "#2d3748",
      background: "#2d3748",
      botName: "#90cdf4",
      dialog: "#f7fafc",
      narration: "#e2e8f0",
      innerThoughts: "#cbd5e0",
      profileBorder: "#4a5568",
      boxBorder: "#4a5568",
      divider: "#4a5568",
      gradientStart: "#1a202c",
      gradientEnd: "#2d3748"
    }
  },
  "다크 모드 베이직": {
    name: "다크 모드 베이직",
    colors: {
      outerBox: "#000000",
      innerBox: "#1a1a1a",
      background: "#1a1a1a",
      botName: "#ffffff",
      dialog: "#ffffff",
      narration: "#e0e0e0",
      innerThoughts: "#c0c0c0",
      profileBorder: "#333333",
      boxBorder: "#333333",
      divider: "#333333",
      gradientStart: "#000000",
      gradientEnd: "#1a1a1a"
    }
  },
  "로즈 골드": {
    name: "로즈 골드",
    colors: {
      outerBox: "#ffffff",
      innerBox: "#fff5f5",
      background: "#fff5f5",
      botName: "#c53030",
      dialog: "#2d3748",
      narration: "#4a5568",
      innerThoughts: "#718096",
      profileBorder: "#feb2b2",
      boxBorder: "#fc8181",
      divider: "#fc8181",
      gradientStart: "#fff5f5",
      gradientEnd: "#fed7d7"
    }
  },
  "민트 그린": {
    name: "민트 그린",
    colors: {
      outerBox: "#ffffff",
      innerBox: "#f0fff4",
      background: "#f0fff4",
      botName: "#2f855a",
      dialog: "#2d3748",
      narration: "#4a5568",
      innerThoughts: "#718096",
      profileBorder: "#9ae6b4",
      boxBorder: "#68d391",
      divider: "#68d391",
      gradientStart: "#f0fff4",
      gradientEnd: "#c6f6d5"
    }
  },
  "모던 퍼플": {
    name: "모던 퍼플",
    colors: {
      outerBox: "#ffffff",
      innerBox: "#f8f5ff",
      background: "#f8f5ff",
      botName: "#6b46c1",
      dialog: "#2d3748",
      narration: "#4a5568",
      innerThoughts: "#718096",
      profileBorder: "#d6bcfa",
      boxBorder: "#b794f4",
      divider: "#b794f4",
      gradientStart: "#f8f5ff",
      gradientEnd: "#e9d8fd"
    }
  },
  "오션 블루": {
    name: "오션 블루",
    colors: {
      outerBox: "#ffffff",
      innerBox: "#ebf8ff",
      background: "#ebf8ff",
      botName: "#2c5282",
      dialog: "#2d3748",
      narration: "#4a5568",
      innerThoughts: "#718096",
      profileBorder: "#90cdf4",
      boxBorder: "#63b3ed",
      divider: "#63b3ed",
      gradientStart: "#ebf8ff",
      gradientEnd: "#bee3f8"
    }
  }
}

interface TagStyle {
  text: string
  color: string
  text_color: string
  transparent_background: boolean
  border_color: string
}

interface WordReplacement {
  from: string
  to: string
}

interface ChatSection {
  id: string;
  content: string;
}

interface BannerConfig {
  // 프로필 설정
  showProfile: boolean
  showBotName: boolean
  botName: string
  botNameColor: string
  botNameSize: number
  showProfileImage: boolean
  imageUrl: string
  showProfileBorder: boolean
  profileBorderColor: string
  showProfileShadow: boolean
  showDivider: boolean
  dividerColor: string
  
  // 태그 설정
  showTags: boolean
  tags: TagStyle[]
  
  // 디자인 설정 (새로 추가)
  selectedTemplate: string
  outerBoxColor: string
  innerBoxColor: string
  showInnerBox: boolean
  useBoxBorder: boolean
  boxBorderColor: string
  boxBorderThickness: number
  shadowIntensity: number
  gradientStartColor: string
  gradientEndColor: string
  useGradientBackground: boolean
  
  // 텍스트 설정
  useTextSize: boolean
  textSize: number
  useTextIndent: boolean
  textIndent: number
  dialogColor: string
  dialogBold: boolean
  dialogNewline: boolean
  narrationColor: string
  innerThoughtsColor: string
  innerThoughtsBold: boolean
  removeAsterisk: boolean
  convertEllipsis: boolean
  
  // 단어 변경
  wordReplacements: WordReplacement[]
  
  // 기본 설정
  content: string
  contentBackgroundColor: string
  contentTextColor: string
  fontSize: number
  lineHeight: number
  chatSections: ChatSection[]
}

interface BannerFormLayoutProps {
  config: BannerConfig
  onConfigChange: (newConfig: Partial<BannerConfig>) => void
  generatedHTML: string
  onGenerateHTML: () => void
  onCopyHTML: () => void
  onReset: () => void
}

const BannerFormLayout = ({
  config,
  onConfigChange,
  generatedHTML,
  onGenerateHTML,
  onCopyHTML,
  onReset
}: BannerFormLayoutProps) => {
  const [activeTab, setActiveTab] = useState('content')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  
  // 채팅 섹션 상태 추가
  const [chatSections, setChatSections] = useState<ChatSection[]>([
    { id: 'default', content: config.content || '' }
  ]);
  
  // 텍스트에어리어 참조 추가
  const textareaRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({});
  
  // 자동 저장 키 상수 추가
  const AUTOSAVE_PREFIX = 'autoSavedBanner_v1_';

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

  // 이미지 업로드 핸들러
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadStatus('❌ 파일 크기가 5MB를 초과합니다.')
      return
    }

    // 파일 타입 체크
    if (!file.type.startsWith('image/')) {
      setUploadStatus('❌ 이미지 파일만 업로드 가능합니다.')
      return
    }

    setUploadStatus('⏳ 업로드 중...')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        handleConfigChange('imageUrl', data.url)
        if (data.isDataUrl) {
          setUploadStatus('✅ 업로드 성공! (base64 변환됨)')
        } else {
          setUploadStatus('✅ 업로드 성공!')
        }
        
        // 3초 후 상태 메시지 제거
        setTimeout(() => setUploadStatus(''), 3000)
      } else {
        const errorData = await response.json()
        setUploadStatus(`❌ 업로드 실패: ${errorData.error || '알 수 없는 오류'}`)
      }
    } catch (error) {
      console.error('업로드 오류:', error)
      setUploadStatus('❌ 업로드 중 오류가 발생했습니다.')
    }
  }

  // HTML에서 이미지 URL 추출하는 함수
  const extractImageUrlFromHtml = (htmlString: string) => {
    const imgTagRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/i
    const match = htmlString.match(imgTagRegex)
    
    if (match && match[1]) {
      return match[1]
    }
    
    return htmlString
  }

  // 입력값이 HTML인지 확인하는 함수
  const isHtmlImageTag = (input: string) => {
    return input.includes('<img') && input.includes('src=')
  }

  // 이미지 삭제 함수 추가
  const handleImageDelete = () => {
    handleConfigChange('imageUrl', '');
  };

  const handleConfigChange = (field: string, value: any) => {
    // 이미지 URL 필드에서 HTML 코드 자동 추출
    if (field === 'imageUrl' && typeof value === 'string') {
      if (isHtmlImageTag(value)) {
        value = extractImageUrlFromHtml(value)
      }
    }
    
    onConfigChange({ [field]: value })
  }

  const handleTagChange = (index: number, field: string, value: string | boolean) => {
    const newTags = [...config.tags]
    newTags[index] = { ...newTags[index], [field]: value }
    onConfigChange({ tags: newTags })
  }

  const addTag = () => {
    const newTag: TagStyle = {
      text: "새 태그",
      color: "#e2e8f0",
      text_color: "#4a5568",
      transparent_background: false,
      border_color: "#cbd5e0"
    }
    onConfigChange({ tags: [...config.tags, newTag] })
  }

  const removeTag = (index: number) => {
    const newTags = config.tags.filter((_, i) => i !== index)
    onConfigChange({ tags: newTags })
  }

  const handleWordReplacementChange = (index: number, field: string, value: string) => {
    const newReplacements = [...config.wordReplacements]
    newReplacements[index] = { ...newReplacements[index], [field]: value }
    onConfigChange({ wordReplacements: newReplacements })
  }

  const addWordReplacement = () => {
    const newReplacement: WordReplacement = { from: "", to: "" }
    onConfigChange({ wordReplacements: [...config.wordReplacements, newReplacement] })
  }

  const removeWordReplacement = (index: number) => {
    const newReplacements = config.wordReplacements.filter((_, i) => i !== index)
    onConfigChange({ wordReplacements: newReplacements })
  }

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
    const newId = `banner_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newSection: ChatSection = { id: newId, content: '' };
    setChatSections(prev => [...prev, newSection]);
  };

  // 채팅 섹션 삭제
  const removeChatSection = (sectionId: string) => {
    if (chatSections.length <= 1) {
      alert('최소 하나의 내용 섹션은 필요합니다.');
      return;
    }
    
    if (!confirm('이 내용 섹션을 삭제하시겠습니까?')) {
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

  const applyTemplate = (templateName: string) => {
    const template = TEMPLATE_PRESETS[templateName as keyof typeof TEMPLATE_PRESETS]
    if (template) {
      onConfigChange({
        selectedTemplate: templateName,
        outerBoxColor: template.colors.outerBox,
        innerBoxColor: template.colors.innerBox,
        contentBackgroundColor: template.colors.background,
        botNameColor: template.colors.botName,
        dialogColor: template.colors.dialog,
        narrationColor: template.colors.narration,
        innerThoughtsColor: template.colors.innerThoughts,
        profileBorderColor: template.colors.profileBorder,
        boxBorderColor: template.colors.boxBorder,
        dividerColor: template.colors.divider,
        gradientStartColor: template.colors.gradientStart,
        gradientEndColor: template.colors.gradientEnd
      })
    }
  }

  const generatePreviewHTML = () => {
    if (config.content) {
      const generator = BannerGeneratorV2({ config })
      return generator.generatePreviewHTML()
    }
    return ''
  }

  // 모던 탭 버튼 컴포넌트
  const TabButton = ({ id, label, icon, isActive, onClick }: {
    id: string
    label: string
    icon: string
    isActive: boolean
    onClick: () => void
  }) => (
    <ModernButton
      onClick={onClick}
      className={isActive ? 'tab-active' : ''}
      style={{
        backgroundColor: isActive ? STYLES.primary : 'transparent',
        color: isActive ? 'white' : (isDarkMode ? '#e4e6eb' : STYLES.text),
        border: `1px solid ${isActive ? STYLES.primary : STYLES.border}`,
        borderRadius: `${STYLES.radius_normal}px`,
        padding: '8px 16px',
        margin: '0 4px',
        fontSize: `${STYLES.font_size_small}px`,
        fontWeight: STYLES.font_weight_normal
      }}
    >
      {icon} {label}
    </ModernButton>
  )

  return (
    <div className="container">
      <div className="main-layout">
        <div className="settings-panel">

          {/* 탭 네비게이션 */}
          <ModernSection title="📋 메뉴">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              <TabButton
                id="content"
                label="내용"
                icon="📄"
                isActive={activeTab === 'content'}
                onClick={() => setActiveTab('content')}
              />
              <TabButton
                id="design"
                label="디자인"
                icon="🎨"
                isActive={activeTab === 'design'}
                onClick={() => setActiveTab('design')}
              />
              <TabButton
                id="profile"
                label="프로필"
                icon="👤"
                isActive={activeTab === 'profile'}
                onClick={() => setActiveTab('profile')}
              />
              <TabButton
                id="tags"
                label="태그"
                icon="🏷️"
                isActive={activeTab === 'tags'}
                onClick={() => setActiveTab('tags')}
              />
              <TabButton
                id="text"
                label="텍스트"
                icon="📝"
                isActive={activeTab === 'text'}
                onClick={() => setActiveTab('text')}
              />
              <TabButton
                id="replace"
                label="변경"
                icon="🔄"
                isActive={activeTab === 'replace'}
                onClick={() => setActiveTab('replace')}
              />
            </div>
          </ModernSection>

          {/* 내용 탭 */}
          {activeTab === 'content' && (
            <ModernSection title="📄 본문 내용">
              <ModernHint>
                <strong>본문 작성 안내</strong>
                <div style={{ marginTop: '8px', fontSize: '13px', lineHeight: 1.7 }}>
                  - 대화 부분은 큰따옴표 "텍스트" 또는 둥근따옴표 "텍스트"로 감싸주세요<br />
                  - 속마음 부분은 작은따옴표 '텍스트'로 감싸주세요<br />
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
          )}

          {/* 디자인 탭 */}
          {activeTab === 'design' && (
            <>
              <ModernSection title="🎨 템플릿 선택">
                <ModernFormGroup label="프리셋 템플릿">
                  <ModernSelect
                    value={config.selectedTemplate || "커스텀"}
                    onChange={(value) => applyTemplate(value)}
                    options={Object.keys(TEMPLATE_PRESETS).map(templateName => ({
                      value: templateName,
                      label: templateName
                    }))}
                  />
                </ModernFormGroup>
              </ModernSection>

              <ModernSection title="🎨 박스 디자인">
                <ModernFormGroup>
                  <ModernCheckbox
                    checked={config.showInnerBox}
                    onChange={(checked) => handleConfigChange('showInnerBox', checked)}
                    label="외부 박스 표시"
                  />
                </ModernFormGroup>

                <ModernFormRow>
                  <ModernFormGroup label="외부 박스 색상">
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <ModernColorPicker
                        value={config.outerBoxColor}
                        onChange={(color) => handleConfigChange('outerBoxColor', color)}
                      />
                      <ModernInput
                        value={config.outerBoxColor}
                        onChange={(value) => handleConfigChange('outerBoxColor', value)}
                        placeholder="#ffffff"
                      />
                    </div>
                  </ModernFormGroup>
                  <ModernFormGroup label="내부 박스 색상">
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <ModernColorPicker
                        value={config.innerBoxColor}
                        onChange={(color) => handleConfigChange('innerBoxColor', color)}
                      />
                      <ModernInput
                        value={config.innerBoxColor}
                        onChange={(value) => handleConfigChange('innerBoxColor', value)}
                        placeholder="#f8f9fa"
                      />
                    </div>
                  </ModernFormGroup>
                </ModernFormRow>

                <ModernFormGroup>
                  <ModernCheckbox
                    checked={config.useGradientBackground}
                    onChange={(checked) => handleConfigChange('useGradientBackground', checked)}
                    label="그라디언트 배경 사용"
                  />
                </ModernFormGroup>

                {config.useGradientBackground && (
                  <ModernFormRow>
                    <ModernFormGroup label="그라디언트 시작 색상">
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <ModernColorPicker
                          value={config.gradientStartColor}
                          onChange={(color) => handleConfigChange('gradientStartColor', color)}
                        />
                        <ModernInput
                          value={config.gradientStartColor}
                          onChange={(value) => handleConfigChange('gradientStartColor', value)}
                          placeholder="#f8f9fa"
                        />
                      </div>
                    </ModernFormGroup>
                    <ModernFormGroup label="그라디언트 끝 색상">
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <ModernColorPicker
                          value={config.gradientEndColor}
                          onChange={(color) => handleConfigChange('gradientEndColor', color)}
                        />
                        <ModernInput
                          value={config.gradientEndColor}
                          onChange={(value) => handleConfigChange('gradientEndColor', value)}
                          placeholder="#ffffff"
                        />
                      </div>
                    </ModernFormGroup>
                  </ModernFormRow>
                )}
              </ModernSection>

              <ModernSection title="🖼️ 테두리 설정">
                <ModernFormGroup>
                  <ModernCheckbox
                    checked={config.useBoxBorder}
                    onChange={(checked) => handleConfigChange('useBoxBorder', checked)}
                    label="테두리 사용"
                  />
                </ModernFormGroup>

                {config.useBoxBorder && (
                  <ModernFormRow>
                    <ModernFormGroup label="테두리 색상">
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <ModernColorPicker
                          value={config.boxBorderColor}
                          onChange={(color) => handleConfigChange('boxBorderColor', color)}
                        />
                        <ModernInput
                          value={config.boxBorderColor}
                          onChange={(value) => handleConfigChange('boxBorderColor', value)}
                          placeholder="#e2e8f0"
                        />
                      </div>
                    </ModernFormGroup>
                    <ModernFormGroup>
                      <ModernSlider
                        value={config.boxBorderThickness}
                        onChange={(value) => handleConfigChange('boxBorderThickness', value)}
                        min={1}
                        max={10}
                        step={1}
                        label="테두리 두께 (px)"
                      />
                    </ModernFormGroup>
                  </ModernFormRow>
                )}

                <ModernFormGroup>
                  <ModernSlider
                    value={config.shadowIntensity}
                    onChange={(value) => handleConfigChange('shadowIntensity', value)}
                    min={0}
                    max={20}
                    step={1}
                    label="그림자 강도"
                  />
                </ModernFormGroup>
              </ModernSection>
            </>
          )}

          {/* 프로필 탭 */}
          {activeTab === 'profile' && (
            <ModernSection title="👤 프로필 설정">
              <ModernFormGroup>
                <ModernCheckbox
                  checked={config.showProfile}
                  onChange={(checked) => handleConfigChange('showProfile', checked)}
                  label="프로필 표시"
                />
              </ModernFormGroup>

              {config.showProfile && (
                <>
                  <ModernFormGroup>
                    <ModernCheckbox
                      checked={config.showBotName}
                      onChange={(checked) => handleConfigChange('showBotName', checked)}
                      label="봇 이름 표시"
                    />
                  </ModernFormGroup>

                  {config.showBotName && (
                    <ModernFormRow>
                      <ModernFormGroup label="봇 이름">
                        <ModernInput
                          value={config.botName}
                          onChange={(value) => handleConfigChange('botName', value)}
                          placeholder="봇 이름"
                        />
                      </ModernFormGroup>
                      <ModernFormGroup label="봇 이름 색상">
                        <ModernColorPicker
                          value={config.botNameColor}
                          onChange={(color) => handleConfigChange('botNameColor', color)}
                        />
                      </ModernFormGroup>
                      <ModernFormGroup label="봇 이름 크기">
                        <ModernInput
                          type="number"
                          value={config.botNameSize?.toString() || '18'}
                          onChange={(value) => handleConfigChange('botNameSize', parseInt(value) || 18)}
                          placeholder="18"
                        />
                      </ModernFormGroup>
                    </ModernFormRow>
                  )}

                  <ModernFormGroup>
                    <ModernCheckbox
                      checked={config.showProfileImage}
                      onChange={(checked) => handleConfigChange('showProfileImage', checked)}
                      label="프로필 이미지 표시"
                    />
                  </ModernFormGroup>

                  {config.showProfileImage && (
                    <>
                      {/* 로컬 이미지 업로드 섹션 */}
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
                            id="banner-image-upload"
                          />
                          <label 
                            htmlFor="banner-image-upload"
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

                      {/* 외부 URL 섹션 */}
                      <ModernFormGroup label="🌐 외부 이미지 URL">
                        <ModernInput
                          value={config.imageUrl}
                          onChange={(value) => handleConfigChange('imageUrl', value)}
                          placeholder="프로필 이미지 URL 또는 HTML 코드"
                        />
                        <ModernHint>
                          <p><strong>💡 사용 방법:</strong></p>
                          <p>• 이미지 URL을 직접 입력하거나</p>
                          <p>• 아카라이브 등에서 복사한 HTML 코드를 붙여넣으면 자동으로 URL이 추출됩니다</p>
                        </ModernHint>
                      </ModernFormGroup>

                      {/* 현재 이미지 표시 및 삭제 기능 */}
                      {config.imageUrl && (
                        <ModernFormGroup label="🖼️ 현재 프로필 이미지">
                          <div style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '10px',
                            backgroundColor: isDarkMode ? '#2d3748' : '#f7fafc'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                              <img 
                                src={config.imageUrl} 
                                alt="프로필 이미지 미리보기"
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  objectFit: 'cover',
                                  borderRadius: '50%',
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
                                {config.imageUrl.length > 50 
                                  ? config.imageUrl.substring(0, 50) + '...' 
                                  : config.imageUrl}
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

                      <ModernFormGroup>
                        <ModernCheckbox
                          checked={config.showProfileBorder}
                          onChange={(checked) => handleConfigChange('showProfileBorder', checked)}
                          label="테두리 표시"
                        />
                      </ModernFormGroup>

                      {config.showProfileBorder && (
                        <ModernFormGroup label="테두리 색상">
                          <ModernColorPicker
                            value={config.profileBorderColor}
                            onChange={(color) => handleConfigChange('profileBorderColor', color)}
                          />
                        </ModernFormGroup>
                      )}

                      <ModernFormGroup>
                        <ModernCheckbox
                          checked={config.showProfileShadow}
                          onChange={(checked) => handleConfigChange('showProfileShadow', checked)}
                          label="그림자 효과"
                        />
                      </ModernFormGroup>
                    </>
                  )}

                  <ModernFormGroup>
                    <ModernCheckbox
                      checked={config.showDivider}
                      onChange={(checked) => handleConfigChange('showDivider', checked)}
                      label="구분선 표시"
                    />
                  </ModernFormGroup>

                  {config.showDivider && (
                    <ModernFormGroup label="구분선 색상">
                      <ModernColorPicker
                        value={config.dividerColor}
                        onChange={(color) => handleConfigChange('dividerColor', color)}
                      />
                    </ModernFormGroup>
                  )}
                </>
              )}
            </ModernSection>
          )}

          {/* 태그 탭 */}
          {activeTab === 'tags' && (
            <ModernSection title="🏷️ 태그 설정">
              <ModernFormGroup>
                <ModernCheckbox
                  checked={config.showTags}
                  onChange={(checked) => handleConfigChange('showTags', checked)}
                  label="태그 표시"
                />
              </ModernFormGroup>

              {config.showTags && (
                <>
                  {config.tags.map((tag, index) => (
                    <ModernFormGroup key={index} label={`태그 ${index + 1}`}>
                      <ModernFormRow>
                        <ModernFormGroup label="태그 텍스트">
                          <ModernInput
                            value={tag.text}
                            onChange={(value) => handleTagChange(index, 'text', value)}
                            placeholder="태그 텍스트"
                          />
                        </ModernFormGroup>
                        <ModernFormGroup label="배경색">
                          <ModernColorPicker
                            value={tag.color}
                            onChange={(color) => handleTagChange(index, 'color', color)}
                            disabled={tag.transparent_background}
                          />
                        </ModernFormGroup>
                        <ModernFormGroup label="텍스트 색상">
                          <ModernColorPicker
                            value={tag.text_color}
                            onChange={(color) => handleTagChange(index, 'text_color', color)}
                          />
                        </ModernFormGroup>
                        <ModernFormGroup>
                          <ModernButton
                            danger
                            onClick={() => removeTag(index)}
                          >
                            삭제
                          </ModernButton>
                        </ModernFormGroup>
                      </ModernFormRow>
                      
                      <ModernFormRow>
                        <ModernFormGroup>
                          <ModernCheckbox
                            checked={tag.transparent_background}
                            onChange={(checked) => handleTagChange(index, 'transparent_background', checked)}
                            label="투명 배경"
                          />
                        </ModernFormGroup>
                        
                        {tag.transparent_background && (
                          <>
                            <ModernFormGroup label="테두리 색상">
                              <ModernColorPicker
                                value={tag.border_color}
                                onChange={(color) => handleTagChange(index, 'border_color', color)}
                              />
                            </ModernFormGroup>
                            <ModernFormGroup>
                              <ModernHint>
                                <p>빠른 선택</p>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                  <ModernButton
                                    onClick={() => handleTagChange(index, 'border_color', '#000000')}
                                    style={{ backgroundColor: '#000000', color: '#ffffff' }}
                                  >
                                    블랙
                                  </ModernButton>
                                  <ModernButton
                                    onClick={() => handleTagChange(index, 'border_color', '#ffffff')}
                                    style={{ backgroundColor: '#ffffff', color: '#000000', border: '1px solid #cccccc' }}
                                  >
                                    화이트
                                  </ModernButton>
                                </div>
                              </ModernHint>
                            </ModernFormGroup>
                          </>
                        )}
                      </ModernFormRow>
                    </ModernFormGroup>
                  ))}

                  <ModernFormGroup>
                    <ModernButton onClick={addTag}>
                      + 태그 추가
                    </ModernButton>
                  </ModernFormGroup>
                </>
              )}
            </ModernSection>
          )}

          {/* 텍스트 탭 */}
          {activeTab === 'text' && (
            <ModernSection title="📝 텍스트 설정">
              <ModernFormGroup>
                <ModernCheckbox
                  checked={config.useTextSize}
                  onChange={(checked) => handleConfigChange('useTextSize', checked)}
                  label="텍스트 크기 조절"
                />
              </ModernFormGroup>

              {config.useTextSize && (
                <ModernFormRow>
                  <ModernFormGroup label="텍스트 크기">
                    <ModernSlider
                      value={config.textSize}
                      onChange={(value) => handleConfigChange('textSize', value)}
                      min={8}
                      max={24}
                      step={1}
                      label="텍스트 크기 (px)"
                    />
                  </ModernFormGroup>
                </ModernFormRow>
              )}

              <ModernFormGroup>
                <ModernCheckbox
                  checked={config.useTextIndent}
                  onChange={(checked) => handleConfigChange('useTextIndent', checked)}
                  label="들여쓰기 사용"
                />
              </ModernFormGroup>

              {config.useTextIndent && (
                <ModernFormRow>
                  <ModernFormGroup label="들여쓰기">
                    <ModernSlider
                      value={config.textIndent}
                      onChange={(value) => handleConfigChange('textIndent', value)}
                      min={0}
                      max={100}
                      label="들여쓰기 (px)"
                    />
                  </ModernFormGroup>
                </ModernFormRow>
              )}

              <ModernFormRow>
                <ModernFormGroup label="대화문 색상">
                  <ModernColorPicker
                    value={config.dialogColor}
                    onChange={(color) => handleConfigChange('dialogColor', color)}
                  />
                </ModernFormGroup>
                <ModernFormGroup label="나레이션 색상">
                  <ModernColorPicker
                    value={config.narrationColor}
                    onChange={(color) => handleConfigChange('narrationColor', color)}
                  />
                </ModernFormGroup>
                <ModernFormGroup label="속마음 색상">
                  <ModernColorPicker
                    value={config.innerThoughtsColor}
                    onChange={(color) => handleConfigChange('innerThoughtsColor', color)}
                  />
                </ModernFormGroup>
              </ModernFormRow>

              <ModernFormGroup>
                <ModernCheckbox
                  checked={config.dialogBold}
                  onChange={(checked) => handleConfigChange('dialogBold', checked)}
                  label="대화문 굵게"
                />
              </ModernFormGroup>

              <ModernFormGroup>
                <ModernCheckbox
                  checked={config.dialogNewline}
                  onChange={(checked) => handleConfigChange('dialogNewline', checked)}
                  label="대화문 줄바꿈"
                />
              </ModernFormGroup>

              <ModernFormGroup>
                <ModernCheckbox
                  checked={config.innerThoughtsBold}
                  onChange={(checked) => handleConfigChange('innerThoughtsBold', checked)}
                  label="속마음 굵게"
                />
              </ModernFormGroup>

              <ModernFormGroup>
                <ModernCheckbox
                  checked={config.removeAsterisk}
                  onChange={(checked) => handleConfigChange('removeAsterisk', checked)}
                  label="에스터리스크(*) 제거"
                />
              </ModernFormGroup>

              <ModernFormGroup>
                <ModernCheckbox
                  checked={config.convertEllipsis}
                  onChange={(checked) => handleConfigChange('convertEllipsis', checked)}
                  label="말줄임표 변환(...→…)"
                />
              </ModernFormGroup>
            </ModernSection>
          )}

          {/* 단어 변경 탭 */}
          {activeTab === 'replace' && (
            <ModernSection title="🔄 단어 변경">
              {config.wordReplacements.map((replacement, index) => (
                <ModernFormGroup key={index} label={`항목 ${index + 1}`}>
                  <ModernFormRow>
                    <ModernFormGroup label="변경할 단어">
                      <ModernInput
                        value={replacement.from}
                        onChange={(value) => handleWordReplacementChange(index, 'from', value)}
                        placeholder="변경할 단어"
                      />
                    </ModernFormGroup>
                    <ModernFormGroup label="대체할 단어">
                      <ModernInput
                        value={replacement.to}
                        onChange={(value) => handleWordReplacementChange(index, 'to', value)}
                        placeholder="대체할 단어"
                      />
                    </ModernFormGroup>
                    <ModernFormGroup>
                      <ModernButton
                        danger
                        onClick={() => removeWordReplacement(index)}
                      >
                        삭제
                      </ModernButton>
                    </ModernFormGroup>
                  </ModernFormRow>
                </ModernFormGroup>
              ))}

              <ModernFormGroup>
                <ModernButton onClick={addWordReplacement}>
                  + 항목 추가
                </ModernButton>
              </ModernFormGroup>
            </ModernSection>
          )}
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
  )
}

export default BannerFormLayout 