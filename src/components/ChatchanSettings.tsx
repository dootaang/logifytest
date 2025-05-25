import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  ModernDarkModeToggle
} from './ModernComponents'
import { STYLES, DarkModeUtils } from '@/utils/styles'
import { useChatchanGeneratorV2 } from '../generators/ChatchanGeneratorV2';

interface WordReplacement {
  from: string;
  to: string;
}

interface ChatchanConfig {
  characterName: string;
  modelName: string;
  promptName: string;
  assistModelName: string;
  userName: string;
  chatNumber: string;
  characterImageUrl: string;
  useCharacterImage: boolean;
  backgroundColor: string;
  textColor: string;
  highlightColor: string;
  promptColor: string;
  emphasisColor: string;
  baseFontSize: number;
  titleFontSize: number;
  containerWidth: number;
  logSectionRadius: number;
  lineHeight: number;
  letterSpacing: number;
  italicizeNarration: boolean;
  simpleOutputMode: boolean;
  disableChatLogCollapse: boolean;
  isAutoInputMode: boolean;
  dialogueUseBubble: boolean;
  narrationUseLine: boolean;
  showBriefHeaderInfo: boolean;
  content: string;
  selectedTheme: string;
  outputTheme: string;
  wordReplacements: WordReplacement[];
}

interface TextHistory {
  content: string;
  timestamp: number;
}

interface ChatchanSettingsProps {
  config: ChatchanConfig;
  onConfigChange: (newConfig: Partial<ChatchanConfig>) => void;
  onCopyHTML: () => void;
  onReset: () => void;
  generatedHTML: string;
}

const ChatchanSettings: React.FC<ChatchanSettingsProps> = ({
  config,
  onConfigChange,
  onCopyHTML,
  onReset,
  generatedHTML
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [textHistory, setTextHistory] = useState<TextHistory[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [localGeneratedHTML, setLocalGeneratedHTML] = useState<string>('');

  // ChatchanGeneratorV2 훅 사용
  const { generateHTML } = useChatchanGeneratorV2(config);

  // 다크모드 감지 (새로운 방식)
  useEffect(() => {
    // 초기 다크모드 상태 설정
    const savedTheme = DarkModeUtils.getSavedTheme();
    const effectiveDark = DarkModeUtils.getEffectiveDarkMode(savedTheme);
    setIsDarkMode(effectiveDark);
    DarkModeUtils.applyTheme(effectiveDark);

    // 시스템 다크모드 변화 감지
    const unwatch = DarkModeUtils.watchSystemDarkMode((systemIsDark) => {
      const currentTheme = DarkModeUtils.getSavedTheme();
      if (currentTheme === 'system') {
        setIsDarkMode(systemIsDark);
        DarkModeUtils.applyTheme(systemIsDark);
      }
    });

    // 테마 변경 감지 (localStorage 변화)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme') {
        const newTheme = (e.newValue as 'light' | 'dark' | 'system') || 'system';
        const effectiveDark = DarkModeUtils.getEffectiveDarkMode(newTheme);
        setIsDarkMode(effectiveDark);
        DarkModeUtils.applyTheme(effectiveDark);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      unwatch();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // HTML 생성 함수
  const handleGenerateHTML = () => {
    if (!config.content.trim()) {
      alert('먼저 채팅 내용을 입력해주세요.');
      return;
    }
    
    const html = generateHTML();
    setLocalGeneratedHTML(html);
  };

  // 텍스트 히스토리 관리
  const saveToHistory = useCallback((content: string) => {
    const newHistory = [...textHistory.slice(0, historyIndex + 1), {
      content,
      timestamp: Date.now()
    }];
    
    // 최대 50개 히스토리 유지
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    
    setTextHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [textHistory, historyIndex]);

  const undoHistory = useCallback(() => {
    if (historyIndex > 0) {
      const previousContent = textHistory[historyIndex - 1].content;
      setHistoryIndex(historyIndex - 1);
      onConfigChange({ content: previousContent });
    }
  }, [historyIndex, textHistory, onConfigChange]);

  const redoHistory = useCallback(() => {
    if (historyIndex < textHistory.length - 1) {
      const nextContent = textHistory[historyIndex + 1].content;
      setHistoryIndex(historyIndex + 1);
      onConfigChange({ content: nextContent });
    }
  }, [historyIndex, textHistory, onConfigChange]);

  const applyMarkdown = (textarea: HTMLTextAreaElement, type: string) => {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    if (selectedText.length === 0) return;
    
    // 현재 내용을 히스토리에 저장
    saveToHistory(textarea.value);
    
    let replacement = '';
    
    switch (type) {
      case 'bold':
        replacement = `**${selectedText}**`;
        break;
      case 'italic':
        replacement = `*${selectedText}*`;
        break;
      case 'highlight':
        replacement = `===${selectedText}===`;
        break;
      case 'emphasis':
        replacement = `~~${selectedText}~~`;
        break;
      case 'bolditalic':
        replacement = `***${selectedText}***`;
        break;
      default:
        replacement = selectedText;
    }
    
    const newValue = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    textarea.value = newValue;
    
    // 포커스 및 커서 위치 설정
    textarea.focus();
    textarea.setSelectionRange(start, start + replacement.length);
    
    // 변경사항 반영
    onConfigChange({ content: newValue });
  };

  const applyPrefix = (textarea: HTMLTextAreaElement, prefix: string) => {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    if (selectedText.length === 0) return;
    
    // 현재 내용을 히스토리에 저장
    saveToHistory(textarea.value);
    
    const lines = selectedText.split('\n');
    const prefixedLines = lines.map(line => {
      if (line.trim() === '') return line;
      
      // 이미 같은 prefix가 있는지 확인
      const existingPrefixMatch = line.match(/^\[([^\]]+)\]/);
      if (existingPrefixMatch) {
        // 기존 prefix 교체
        return line.replace(/^\[([^\]]+)\]/, `[${prefix}]`);
      } else {
        // 새 prefix 추가
        return `[${prefix}] ${line}`;
      }
    });
    
    const newText = prefixedLines.join('\n');
    const newValue = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
    
    textarea.value = newValue;
    textarea.focus();
    textarea.setSelectionRange(start, start + newText.length);
    
    // 변경사항 반영
    onConfigChange({ content: newValue });
  };

  const applyColorTheme = (theme: string) => {
    const themes = {
      light: {
        backgroundColor: '#ffffff',
        textColor: '#333333',
        highlightColor: '#ffeb3b',
        promptColor: '#2196f3',
        emphasisColor: '#ff5722'
      },
      dark: {
        backgroundColor: '#1a1a1a',
        textColor: '#ffffff',
        highlightColor: '#ffc107',
        promptColor: '#03dac6',
        emphasisColor: '#ff6b6b'
      },
      blue: {
        backgroundColor: '#e3f2fd',
        textColor: '#0d47a1',
        highlightColor: '#ffeb3b',
        promptColor: '#1976d2',
        emphasisColor: '#d32f2f'
      }
    };
    
    if (themes[theme as keyof typeof themes]) {
      onConfigChange(themes[theme as keyof typeof themes]);
    }
  };

  const loadExample = () => {
    const exampleContent = `[해설] 오늘은 평범한 하루였다.

[AI] 안녕하세요! 오늘 기분이 어떠신가요?

[USER] 안녕! 오늘은 좀 피곤하네요.

[AI] 그렇군요. 무엇 때문에 피곤하신지 말씀해 주실 수 있나요?

[해설] 사용자는 잠시 생각에 잠겼다.

[USER] 어제 늦게까지 일을 해서 그런 것 같아요.

[AI] 고생 많으셨네요. 충분한 휴식을 취하시는 것이 중요해요.`;
    
    onConfigChange({ content: exampleContent });
  };

  const addWordReplacement = () => {
    const newReplacements = [...config.wordReplacements, { from: '', to: '' }];
    onConfigChange({ wordReplacements: newReplacements });
  };

  const updateWordReplacement = (index: number, field: 'from' | 'to', value: string) => {
    const newReplacements = [...config.wordReplacements];
    newReplacements[index] = { ...newReplacements[index], [field]: value };
    onConfigChange({ wordReplacements: newReplacements });
  };

  const removeWordReplacement = (index: number) => {
    const newReplacements = config.wordReplacements.filter((_, i) => i !== index);
    onConfigChange({ wordReplacements: newReplacements });
  };

  // 모던 툴바 버튼 컴포넌트
  const ToolbarButton = ({ onClick, title, children, disabled = false, className = '' }: {
    onClick: () => void
    title: string
    children: React.ReactNode
    disabled?: boolean
    className?: string
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={className}
      style={{
        padding: '8px 12px',
        border: `1px solid ${STYLES.border}`,
        borderRadius: `${STYLES.radius_small}px`,
        backgroundColor: disabled 
          ? (isDarkMode ? '#2a2b2c' : '#f5f5f5')
          : (isDarkMode ? '#3a3b3c' : '#ffffff'),
        color: disabled 
          ? (isDarkMode ? '#65676b' : '#8a8d91')
          : (isDarkMode ? '#e4e6eb' : STYLES.text),
        fontSize: `${STYLES.font_size_small}px`,
        fontWeight: STYLES.font_weight_normal,
        cursor: disabled ? 'not-allowed' : 'pointer',
        margin: '2px',
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.5 : 1
      }}
    >
      {children}
    </button>
  )

  return (
    <div className="container">
      <div className="main-layout">
        <div className="settings-panel">
          {/* 헤더 */}
          <div className="header">
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <div>
                <h1>🎨 챗챈 로그 제조기</h1>
                <p>아름다운 채팅 로그를 만들어보세요</p>
              </div>
              <ModernDarkModeToggle />
            </div>
          </div>

          {/* 캐릭터 정보 섹션 */}
          <ModernSection title="📝 캐릭터 정보">
            <ModernFormRow>
              <ModernFormGroup label="캐릭터 이름">
                <ModernInput
                  value={config.characterName}
                  onChange={(value) => onConfigChange({ characterName: value })}
                  placeholder="캐릭터 이름을 입력하세요"
                />
              </ModernFormGroup>
              <ModernFormGroup label="사용자 이름">
                <ModernInput
                  value={config.userName}
                  onChange={(value) => onConfigChange({ userName: value })}
                  placeholder="사용자 이름을 입력하세요"
                />
              </ModernFormGroup>
            </ModernFormRow>

            <ModernFormRow>
              <ModernFormGroup label="챗챈 번호">
                <ModernInput
                  value={config.chatNumber}
                  onChange={(value) => onConfigChange({ chatNumber: value })}
                  placeholder="챗챈 번호를 입력하세요"
                />
              </ModernFormGroup>
              <ModernFormGroup>
                <ModernCheckbox
                  checked={config.useCharacterImage}
                  onChange={(checked) => onConfigChange({ useCharacterImage: checked })}
                  label="캐릭터 이미지 사용"
                />
              </ModernFormGroup>
            </ModernFormRow>

            <ModernFormGroup label="캐릭터 이미지 URL">
              <ModernInput
                value={config.characterImageUrl}
                onChange={(value) => onConfigChange({ characterImageUrl: value })}
                placeholder="https://... 또는 HTML img 태그"
              />
            </ModernFormGroup>

            <ModernFormRow>
              <ModernFormGroup label="모델 이름">
                <ModernInput
                  value={config.modelName}
                  onChange={(value) => onConfigChange({ modelName: value })}
                  placeholder="AI 모델명"
                />
              </ModernFormGroup>
              <ModernFormGroup label="프롬프트 이름">
                <ModernInput
                  value={config.promptName}
                  onChange={(value) => onConfigChange({ promptName: value })}
                  placeholder="프롬프트명"
                />
              </ModernFormGroup>
            </ModernFormRow>

            <ModernFormGroup label="번역 모델">
              <ModernInput
                value={config.assistModelName}
                onChange={(value) => onConfigChange({ assistModelName: value })}
                placeholder="번역 모델명"
              />
            </ModernFormGroup>
          </ModernSection>

          {/* 테마 및 출력 설정 */}
          <ModernSection title="🎨 테마 및 출력 설정">
            <ModernFormGroup label="HTML 출력 테마">
              <ModernSelect
                value={config.outputTheme}
                onChange={(value) => onConfigChange({ outputTheme: value })}
                options={[
                  { value: 'light', label: '라이트 테마' },
                  { value: 'dark', label: '다크 테마' },
                  { value: 'blue', label: '블루 테마' },
                  { value: 'custom', label: '커스텀' }
                ]}
              />
            </ModernFormGroup>

            <ModernFormGroup label="테마 프리셋">
              <ModernFormRow>
                <ModernFormGroup>
                  <ModernButton onClick={() => applyColorTheme('light')}>
                    ☀️ 라이트
                  </ModernButton>
                </ModernFormGroup>
                <ModernFormGroup>
                  <ModernButton onClick={() => applyColorTheme('dark')}>
                    🌙 다크
                  </ModernButton>
                </ModernFormGroup>
                <ModernFormGroup>
                  <ModernButton onClick={() => applyColorTheme('blue')}>
                    💙 블루
                  </ModernButton>
                </ModernFormGroup>
              </ModernFormRow>
            </ModernFormGroup>
          </ModernSection>

          {/* 색상 설정 */}
          <ModernSection title="🌈 색상 설정">
            <ModernFormRow>
              <ModernFormGroup label="배경색">
                <ModernColorPicker
                  value={config.backgroundColor}
                  onChange={(color) => onConfigChange({ backgroundColor: color })}
                />
              </ModernFormGroup>
              <ModernFormGroup label="텍스트색">
                <ModernColorPicker
                  value={config.textColor}
                  onChange={(color) => onConfigChange({ textColor: color })}
                />
              </ModernFormGroup>
              <ModernFormGroup label="하이라이트색">
                <ModernColorPicker
                  value={config.highlightColor}
                  onChange={(color) => onConfigChange({ highlightColor: color })}
                />
              </ModernFormGroup>
            </ModernFormRow>

            <ModernFormRow>
              <ModernFormGroup label="프롬프트색">
                <ModernColorPicker
                  value={config.promptColor}
                  onChange={(color) => onConfigChange({ promptColor: color })}
                />
              </ModernFormGroup>
              <ModernFormGroup label="강조색">
                <ModernColorPicker
                  value={config.emphasisColor}
                  onChange={(color) => onConfigChange({ emphasisColor: color })}
                />
              </ModernFormGroup>
            </ModernFormRow>
          </ModernSection>

          {/* 폰트 및 레이아웃 설정 */}
          <ModernSection title="📐 폰트 및 레이아웃 설정">
            <ModernFormRow>
              <ModernFormGroup>
                <ModernSlider
                  value={config.baseFontSize}
                  onChange={(value) => onConfigChange({ baseFontSize: value })}
                  min={12}
                  max={24}
                  step={1}
                  label="기본 폰트 크기 (px)"
                />
              </ModernFormGroup>
              <ModernFormGroup>
                <ModernSlider
                  value={config.titleFontSize}
                  onChange={(value) => onConfigChange({ titleFontSize: value })}
                  min={16}
                  max={32}
                  step={1}
                  label="제목 폰트 크기 (px)"
                />
              </ModernFormGroup>
            </ModernFormRow>

            <ModernFormRow>
              <ModernFormGroup>
                <ModernSlider
                  value={config.lineHeight}
                  onChange={(value) => onConfigChange({ lineHeight: value })}
                  min={1.2}
                  max={2.5}
                  step={0.1}
                  label="줄 간격"
                />
              </ModernFormGroup>
              <ModernFormGroup>
                <ModernSlider
                  value={config.letterSpacing}
                  onChange={(value) => onConfigChange({ letterSpacing: value })}
                  min={-1}
                  max={3}
                  step={0.1}
                  label="글자 간격 (px)"
                />
              </ModernFormGroup>
            </ModernFormRow>

            <ModernFormRow>
              <ModernFormGroup>
                <ModernSlider
                  value={config.containerWidth}
                  onChange={(value) => onConfigChange({ containerWidth: value })}
                  min={600}
                  max={1200}
                  step={10}
                  label="컨테이너 너비 (px)"
                />
              </ModernFormGroup>
              <ModernFormGroup>
                <ModernSlider
                  value={config.logSectionRadius}
                  onChange={(value) => onConfigChange({ logSectionRadius: value })}
                  min={0}
                  max={30}
                  step={1}
                  label="로그 섹션 둥글기 (px)"
                />
              </ModernFormGroup>
            </ModernFormRow>
          </ModernSection>

          {/* 단어 치환 설정 */}
          <ModernSection title="🔄 단어 치환 설정">
            {config.wordReplacements.map((replacement, index) => (
              <ModernFormGroup key={index} label={`치환 ${index + 1}`}>
                <ModernFormRow>
                  <ModernFormGroup label="원본 단어">
                    <ModernInput
                      value={replacement.from}
                      onChange={(value) => updateWordReplacement(index, 'from', value)}
                      placeholder="원본 단어"
                    />
                  </ModernFormGroup>
                  <ModernFormGroup label="변경할 단어">
                    <ModernInput
                      value={replacement.to}
                      onChange={(value) => updateWordReplacement(index, 'to', value)}
                      placeholder="변경할 단어"
                    />
                  </ModernFormGroup>
                  <ModernFormGroup>
                    <ModernButton danger onClick={() => removeWordReplacement(index)}>
                      ❌
                    </ModernButton>
                  </ModernFormGroup>
                </ModernFormRow>
              </ModernFormGroup>
            ))}
            
            <ModernFormGroup>
              <ModernButton onClick={addWordReplacement}>
                ➕ 단어 치환 추가
              </ModernButton>
            </ModernFormGroup>
          </ModernSection>

          {/* 고급 옵션 */}
          <ModernSection title="⚙️ 고급 옵션">
            <ModernFormRow>
              <ModernFormGroup>
                <ModernCheckbox
                  checked={config.isAutoInputMode}
                  onChange={(checked) => onConfigChange({ isAutoInputMode: checked })}
                  label="딸깍모드 (자동 텍스트 효과)"
                />
              </ModernFormGroup>
              <ModernFormGroup>
                <ModernCheckbox
                  checked={config.italicizeNarration}
                  onChange={(checked) => onConfigChange({ italicizeNarration: checked })}
                  label="해설 이탤릭체"
                />
              </ModernFormGroup>
            </ModernFormRow>

            <ModernFormRow>
              <ModernFormGroup>
                <ModernCheckbox
                  checked={config.simpleOutputMode}
                  onChange={(checked) => onConfigChange({ simpleOutputMode: checked })}
                  label="간단 출력 모드"
                />
              </ModernFormGroup>
              <ModernFormGroup>
                <ModernCheckbox
                  checked={config.dialogueUseBubble}
                  onChange={(checked) => onConfigChange({ dialogueUseBubble: checked })}
                  label="대화 말풍선 사용"
                />
              </ModernFormGroup>
            </ModernFormRow>

            <ModernFormRow>
              <ModernFormGroup>
                <ModernCheckbox
                  checked={config.narrationUseLine}
                  onChange={(checked) => onConfigChange({ narrationUseLine: checked })}
                  label="해설 라인 사용"
                />
              </ModernFormGroup>
              <ModernFormGroup>
                <ModernCheckbox
                  checked={config.showBriefHeaderInfo}
                  onChange={(checked) => onConfigChange({ showBriefHeaderInfo: checked })}
                  label="간략 헤더 정보"
                />
              </ModernFormGroup>
            </ModernFormRow>
          </ModernSection>

          {/* 채팅 입력 섹션 */}
          <ModernSection title="💬 채팅 입력">
            {/* 마크다운 툴바 */}
            <ModernFormGroup label="텍스트 편집 도구">
              <ModernHint>
                <p>텍스트를 선택한 후 버튼을 클릭하세요</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center', marginTop: '8px' }}>
                  <ToolbarButton
                    onClick={() => textareaRef.current && applyMarkdown(textareaRef.current, 'bold')}
                    title="굵게"
                  >
                    <strong>B</strong>
                  </ToolbarButton>
                  
                  <ToolbarButton
                    onClick={() => textareaRef.current && applyMarkdown(textareaRef.current, 'italic')}
                    title="기울임"
                  >
                    <em>I</em>
                  </ToolbarButton>
                  
                  <ToolbarButton
                    onClick={() => textareaRef.current && applyMarkdown(textareaRef.current, 'bolditalic')}
                    title="굵은 기울임"
                  >
                    <strong><em>BI</em></strong>
                  </ToolbarButton>
                  
                  <ToolbarButton
                    onClick={() => textareaRef.current && applyMarkdown(textareaRef.current, 'highlight')}
                    title="하이라이트"
                    className="highlight"
                  >
                    H
                  </ToolbarButton>
                  
                  <ToolbarButton
                    onClick={() => textareaRef.current && applyMarkdown(textareaRef.current, 'emphasis')}
                    title="강조"
                    className="emphasis"
                  >
                    E
                  </ToolbarButton>
                </div>
              </ModernHint>
            </ModernFormGroup>

            <ModernFormGroup label="히스토리 관리">
              <ModernFormRow>
                <ModernFormGroup>
                  <ToolbarButton 
                    onClick={undoHistory} 
                    title="실행취소" 
                    disabled={historyIndex <= 0}
                  >
                    ↶ 실행취소
                  </ToolbarButton>
                </ModernFormGroup>
                <ModernFormGroup>
                  <ToolbarButton 
                    onClick={redoHistory} 
                    title="다시실행" 
                    disabled={historyIndex >= textHistory.length - 1}
                  >
                    ↷ 다시실행
                  </ToolbarButton>
                </ModernFormGroup>
              </ModernFormRow>
            </ModernFormGroup>

            <ModernFormGroup label="프리픽스 도구">
              <ModernHint>
                <p>텍스트를 선택한 후 프리픽스를 추가하세요</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center', marginTop: '8px' }}>
                  <ToolbarButton
                    onClick={() => textareaRef.current && applyPrefix(textareaRef.current, '해설')}
                    title="해설"
                  >
                    📖 해설
                  </ToolbarButton>
                  
                  <ToolbarButton
                    onClick={() => textareaRef.current && applyPrefix(textareaRef.current, 'AI')}
                    title="AI"
                  >
                    🤖 AI
                  </ToolbarButton>
                  
                  <ToolbarButton
                    onClick={() => textareaRef.current && applyPrefix(textareaRef.current, 'USER')}
                    title="사용자"
                  >
                    👤 USER
                  </ToolbarButton>
                </div>
              </ModernHint>
            </ModernFormGroup>
            
            <ModernFormGroup label="채팅 내용">
              <textarea
                ref={textareaRef}
                value={config.content}
                onChange={(e) => onConfigChange({ content: e.target.value })}
                placeholder="채팅 내용을 입력하세요..."
                rows={8}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${STYLES.border}`,
                  borderRadius: `${STYLES.radius_normal}px`,
                  backgroundColor: isDarkMode ? '#3a3b3c' : '#ffffff',
                  color: isDarkMode ? '#e4e6eb' : STYLES.text,
                  fontSize: `${STYLES.font_size_normal}px`,
                  fontFamily: STYLES.font_family,
                  resize: 'vertical',
                  outline: 'none'
                }}
              />
            </ModernFormGroup>
            
            <ModernFormGroup>
              <ModernButton onClick={loadExample}>
                📄 예제 불러오기
              </ModernButton>
            </ModernFormGroup>
          </ModernSection>

          {/* 액션 버튼들 */}
          <ModernSection title="🎯 액션">
            <ModernFormRow>
              <ModernFormGroup>
                <ModernButton primary onClick={handleGenerateHTML}>
                  🚀 HTML 생성하기
                </ModernButton>
              </ModernFormGroup>
              <ModernFormGroup>
                <ModernButton onClick={onCopyHTML}>
                  📋 HTML 복사하기
                </ModernButton>
              </ModernFormGroup>
              <ModernFormGroup>
                <ModernButton danger onClick={onReset}>
                  🔄 전체 초기화
                </ModernButton>
              </ModernFormGroup>
            </ModernFormRow>
          </ModernSection>
        </div>

        {/* 우측 미리보기 패널 */}
        <div className="preview-panel">
          <div className="preview-header">
            <h3 className="preview-title">👀 실시간 미리보기</h3>
          </div>
          
          <div className="preview-container">
            {localGeneratedHTML ? (
              <div dangerouslySetInnerHTML={{ __html: localGeneratedHTML }} />
            ) : (
              <div style={{
                textAlign: 'center',
                color: isDarkMode ? '#65676b' : '#8a8d91',
                fontSize: `${STYLES.font_size_normal}px`,
                padding: '40px 0'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎨</div>
                <p>HTML을 생성하면 여기에 미리보기가 표시됩니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatchanSettings; 