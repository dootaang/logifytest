'use client'

import React, { useState, useEffect } from 'react'
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

interface BannerConfig {
  // 프로필 설정
  showProfile: boolean
  showBotName: boolean
  botName: string
  botNameColor: string
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

  const handleConfigChange = (field: string, value: any) => {
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
          {/* 헤더 */}
          <div className="header">
            <h1>배너 생성기 (V2)</h1>
            <p>모던한 배너 스타일 생성기</p>
          </div>

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
              <ModernFormGroup label="본문 내용">
                <ModernTextarea
                  value={config.content}
                  onChange={(value) => handleConfigChange('content', value)}
                  placeholder="본문 내용을 입력하세요..."
                  rows={15}
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
                    📋 HTML 복사
                  </ModernButton>
                </ModernFormGroup>
                <ModernFormGroup>
                  <ModernButton danger onClick={onReset}>
                    🔄 초기화
                  </ModernButton>
                </ModernFormGroup>
              </ModernFormRow>
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
                      <ModernFormGroup label="이미지 URL">
                        <ModernInput
                          value={config.imageUrl}
                          onChange={(value) => handleConfigChange('imageUrl', value)}
                          placeholder="프로필 이미지 URL"
                        />
                        <ModernHint>
                          <p><strong>📌 이미지 업로드 방법 (가장 확실한 방법):</strong></p>
                          <p>1️⃣ <a href="https://arca.live/b/characterai/write" target="_blank" rel="noopener noreferrer" style={{color: '#3498db', textDecoration: 'underline'}}>아카라이브 게시글 작성 화면</a>으로 이동</p>
                          <p>2️⃣ 이미지를 드래그&드롭 또는 클릭하여 업로드</p>
                          <p>3️⃣ 에디터에 삽입된 이미지의 HTML 코드를 복사</p>
                          <p>4️⃣ 여기 "이미지 URL" 필드에 붙여넣기</p>
                          <p>5️⃣ URL이 자동으로 추출되어 적용됩니다</p>
                        </ModernHint>
                      </ModernFormGroup>

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
                                    style={{ backgroundColor: '#ffffff', color: '#000000', border: '1px solid #ccc' }}
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