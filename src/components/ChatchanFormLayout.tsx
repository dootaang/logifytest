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
  ModernSelect
} from './ModernComponents';
import { STYLES } from '@/utils/styles';

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
  wordReplacements: WordReplacement[];
}

interface ChatchanFormLayoutProps {
  config: ChatchanConfig;
  onConfigChange: (newConfig: Partial<ChatchanConfig>) => void;
  generatedHTML: string;
  previewHTML: string;
  onGenerateHTML: () => void;
  onCopyHTML: () => void;
  onReset: () => void;
}

// 색상 테마 정의
const colorThemes = {
  ocean_blue: { h: '#2980b9', p: '#5dade2', e: '#1a5276' },
  forest_green: { h: '#27ae60', p: '#58d68d', e: '#1e8449' },
  royal_purple: { h: '#8e44ad', p: '#bb8fce', e: '#6c3483' },
  sunset_orange: { h: '#e67e22', p: '#f5b041', e: '#a04000' },
  ruby_red: { h: '#c0392b', p: '#f1948a', e: '#922b21' },
  teal_green: { h: '#16a085', p: '#48c9b0', e: '#0e6655' },
  graphite: { h: '#566573', p: '#aeb6bf', e: '#34495e' },
  indigo_amber: { h: '#34495e', p: '#7f8c8d', e: '#d35400' },
  lavender_mint: { h: '#9b59b6', p: '#a569bd', e: '#1abc9c' },
  rose_plum: { h: '#d9534f', p: '#ec7063', e: '#8e44ad' }
};

// 미리 정의된 모델명 목록
const modelNameOptions = [
  'GPT-4o ChatGPT',
  'GPT-4.5',
  'Claude 3.7 Sonnet',
  'Gemini pro 2.5',
  'Gemini flash 2.0'
];

// 채팅 섹션 인터페이스
interface ChatSection {
  id: string;
  content: string;
}

const ChatchanFormLayout: React.FC<ChatchanFormLayoutProps> = ({
  config,
  onConfigChange,
  generatedHTML,
  previewHTML,
  onGenerateHTML,
  onCopyHTML,
  onReset
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [chatSections, setChatSections] = useState<ChatSection[]>([
    { id: 'default', content: config.content || '' }
  ]);
  const [presets, setPresets] = useState<{ [key: string]: ChatchanConfig }>({});
  const [presetName, setPresetName] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');

  // 자동 저장 키 상수
  const AUTOSAVE_PREFIX = 'autoSavedChat_v30_';
  const PRESET_STORAGE_KEY = 'chatLogPresets_v30';
  const USER_MODIFIED_COLOR_FLAG = 'userModifiedLogColors_v30';

  // 텍스트에어리어 참조들
  const textareaRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({});

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

  // 마크다운 툴바 적용 함수 (개선된 버전)
  const applyMarkdown = (sectionId: string, type: string) => {
    const textarea = textareaRefs.current[sectionId];
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let prefix = '', suffix = '';
    
    switch (type) {
      case 'bold':
        prefix = '**'; suffix = '**';
        break;
      case 'italic':
        prefix = '*'; suffix = '*';
        break;
      case 'boldItalic':
        prefix = '***'; suffix = '***';
        break;
      case 'highlight':
        prefix = '^'; suffix = '^';
        break;
      case 'emphasis':
        prefix = '$'; suffix = '$';
        break;
      default:
        return;
    }
    
    const replacement = selectedText ? `${prefix}${selectedText}${suffix}` : `${prefix}${suffix}`;
    const cursorPos = start + prefix.length;
    
    textarea.setRangeText(replacement, start, end, selectedText ? 'select' : 'end');
    if (!selectedText) {
      textarea.setSelectionRange(cursorPos, cursorPos);
    }
    textarea.focus();
    
    // 내용 업데이트 및 자동 저장
    const newValue = textarea.value;
    updateChatSection(sectionId, newValue);
  };

  // 접두사 적용 함수 (개선된 버전)
  const applyPrefix = (sectionId: string, prefix: string) => {
    const textarea = textareaRefs.current[sectionId];
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    
    let lineStart = value.lastIndexOf('\n', start - 1) + 1;
    let lineEnd = value.indexOf('\n', end);
    if (lineEnd === -1) lineEnd = value.length;
    
    const selectedLines = value.substring(lineStart, lineEnd).split('\n');
    const newLines = selectedLines.map((line) => {
      const existingMatch = line.match(/^([\*\-]\s*|USER:\s*|AI:\s*)/i);
      const lineContent = existingMatch ? line.substring(existingMatch[0].length) : line;
      return prefix + lineContent;
    });
    
    const replacement = newLines.join('\n');
    const newCursorPos = lineStart + prefix.length;
    
    textarea.setRangeText(replacement, lineStart, lineEnd, 'preserve');
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    textarea.focus();
    
    // 내용 업데이트 및 자동 저장
    updateChatSection(sectionId, textarea.value);
  };

  // 채팅 섹션 업데이트
  const updateChatSection = (sectionId: string, content: string) => {
    const newSections = chatSections.map(section => 
      section.id === sectionId ? { ...section, content } : section
    );
    setChatSections(newSections);
    
    // 자동 저장
    setupAutoSave(sectionId, content);
    
    // 전체 내용을 특별한 구분자로 합쳐서 config 업데이트
    // 일반 줄바꿈과 구별하기 위해 특별한 마커 사용
    const combinedContent = newSections.map(section => section.content).filter(c => c.trim()).join('\n\n==CHAT_SECTION_SEPARATOR==\n\n');
    onConfigChange({ content: combinedContent });
  };

  // 채팅 섹션 추가
  const addChatSection = () => {
    const newId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newSection: ChatSection = { id: newId, content: '' };
    setChatSections(prev => [...prev, newSection]);
  };

  // 채팅 섹션 삭제
  const removeChatSection = (sectionId: string) => {
    if (chatSections.length <= 1) {
      alert('최소 하나의 채팅 섹션은 필요합니다.');
      return;
    }
    
    if (!confirm('이 채팅 섹션을 삭제하시겠습니까?')) {
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
    
    // 전체 내용 업데이트
    const combinedContent = newSections.map(section => section.content).filter(c => c.trim()).join('\n\n==CHAT_SECTION_SEPARATOR==\n\n');
    onConfigChange({ content: combinedContent });
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
    
    // 전체 내용 업데이트
    const combinedContent = newSections.map(section => section.content).filter(c => c.trim()).join('\n\n==CHAT_SECTION_SEPARATOR==\n\n');
    onConfigChange({ content: combinedContent });
  };

  // 색상 테마 적용
  const applyColorTheme = (themeKey: string) => {
    const theme = colorThemes[themeKey as keyof typeof colorThemes];
    if (!theme) return;
    
    onConfigChange({
      highlightColor: theme.h,
      promptColor: theme.p,
      emphasisColor: theme.e
    });
    
    // 사용자가 색상을 수정했다고 표시
    localStorage.setItem(USER_MODIFIED_COLOR_FLAG, 'true');
  };

  // 다크모드 토글 시 색상 자동 조정
  const handleDarkModeToggle = (checked: boolean) => {
    setIsDarkMode(checked);
    
    // 사용자가 색상을 수정하지 않았다면 자동으로 조정
    const userModified = localStorage.getItem(USER_MODIFIED_COLOR_FLAG) === 'true';
    if (!userModified) {
      if (checked) {
        // 다크모드로 전환
        onConfigChange({
          backgroundColor: '#242526',
          textColor: '#e4e6eb'
        });
      } else {
        // 라이트모드로 전환
        onConfigChange({
          backgroundColor: '#ffffff',
          textColor: '#1d2129'
        });
      }
    }
  };

  // 프리셋 저장
  const savePreset = () => {
    if (!presetName.trim()) {
      alert('프리셋 이름을 입력해주세요.');
      return;
    }
    
    const newPresets = { ...presets, [presetName]: config };
    setPresets(newPresets);
    localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(newPresets));
    setPresetName('');
    alert(`프리셋 '${presetName}'이 저장되었습니다.`);
  };

  // 프리셋 로드
  const loadPreset = () => {
    if (!selectedPreset || !presets[selectedPreset]) {
      alert('프리셋을 선택해주세요.');
      return;
    }
    
    const preset = presets[selectedPreset];
    onConfigChange(preset);
    
    // 채팅 섹션도 프리셋 내용으로 업데이트
    if (preset.content) {
      setChatSections([{ id: 'default', content: preset.content }]);
    }
    
    alert(`프리셋 '${selectedPreset}'을 불러왔습니다.`);
  };

  // 프리셋 삭제
  const deletePreset = () => {
    if (!selectedPreset || !presets[selectedPreset]) {
      alert('삭제할 프리셋을 선택해주세요.');
      return;
    }
    
    if (!confirm(`프리셋 '${selectedPreset}'을 삭제하시겠습니까?`)) {
      return;
    }
    
    const newPresets = { ...presets };
    delete newPresets[selectedPreset];
    setPresets(newPresets);
    localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(newPresets));
    setSelectedPreset('');
    alert(`프리셋 '${selectedPreset}'이 삭제되었습니다.`);
  };

  // 예제 로드
  const loadExample = () => {
    const prefixExample = `- 화창한 봄날, 공원에서 우연히 만난 두 사람은 *짧게* 대화를 나누기 시작했다.\nUSER: 안녕하세요? 오늘 ^날씨^가 어때요?\n- AI는 잠시 생각에 잠기더니 환하게 웃으며 대답했다.\nAI: 안녕하세요! 오늘 날씨는 맑고 화창합니다. 최고 기온은 $23도$로 예상됩니다. ***야외 활동하기 좋은 날씨네요!***`;
    
    const autoExample = `화창한 봄날, 공원에서 우연히 만난 두 사람은 *짧게* 대화를 나누기 시작했다.\n"안녕하세요? 오늘 ^날씨^가 어때요?"\nAI는 잠시 생각에 잠기더니 환하게 웃으며 대답했다.\n"안녕하세요! 오늘 날씨는 맑고 화창합니다. 최고 기온은 $23도$로 예상됩니다. ***야외 활동하기 좋은 날씨네요!***"`;
    
    const example = config.isAutoInputMode ? autoExample : prefixExample;
    const modeText = config.isAutoInputMode ? '(사칭방지용 예제)' : '(풀사칭용 예제)';
    
    const hasContent = chatSections.some(section => section.content.trim());
    if (hasContent && !confirm(`기존 내용이 있습니다. 예제로 덮어쓰시겠습니까?\n${modeText}`)) {
      return;
    }
    
    // 첫 번째 섹션에 예제 로드
    const newSections = [{ id: chatSections[0]?.id || 'default', content: example }];
    setChatSections(newSections);
    onConfigChange({ content: example });
    
    // 자동 저장
    setupAutoSave(newSections[0].id, example);
    
    alert(`예제가 로드되었습니다. ${modeText}`);
  };

  // 키보드 단축키 처리
  const handleKeyDown = (event: KeyboardEvent) => {
    const activeElement = document.activeElement as HTMLElement;
    if (!activeElement || (activeElement.tagName !== 'TEXTAREA' && activeElement.tagName !== 'INPUT')) {
      return;
    }

    // 현재 포커스된 텍스트에어리어의 섹션 ID 찾기
    const sectionId = Object.keys(textareaRefs.current).find(id => 
      textareaRefs.current[id] === activeElement
    );
    
    if (!sectionId) return;

    let handled = false;

    if (event.ctrlKey && !event.shiftKey && event.altKey) {
      // Ctrl+Alt 조합
      switch (event.key) {
        case '1':
          applyPrefix(sectionId, '- ');
          handled = true;
          break;
        case '2':
          applyPrefix(sectionId, 'AI: ');
          handled = true;
          break;
        case '3':
          applyPrefix(sectionId, 'USER: ');
          handled = true;
          break;
      }
    } else if (event.ctrlKey && !event.shiftKey && !event.altKey) {
      // Ctrl 조합
      switch (event.key.toUpperCase()) {
        case 'B':
          applyMarkdown(sectionId, 'bold');
          handled = true;
          break;
        case 'I':
          applyMarkdown(sectionId, 'italic');
          handled = true;
          break;
        case 'H':
          applyMarkdown(sectionId, 'highlight');
          handled = true;
          break;
        case 'E':
          applyMarkdown(sectionId, 'emphasis');
          handled = true;
          break;
      }
    }

    if (handled) {
      event.preventDefault();
    }
  };

  // 컴포넌트 마운트 시 설정
  useEffect(() => {
    // 프리셋 로드
    try {
      const savedPresets = localStorage.getItem(PRESET_STORAGE_KEY);
      if (savedPresets) {
        setPresets(JSON.parse(savedPresets));
      }
    } catch (error) {
      console.error('프리셋 로드 오류:', error);
    }

    // 자동 저장된 채팅 섹션 로드
    const savedContent = loadAutoSaved('default');
    if (savedContent && !config.content) {
      setChatSections([{ id: 'default', content: savedContent }]);
      onConfigChange({ content: savedContent });
    }

    // 키보드 이벤트 리스너 추가
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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
        onConfigChange({ characterImageUrl: data.url })
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

  // 이미지 URL 변경 핸들러 (HTML 자동 추출 포함)
  const handleImageUrlChange = (value: string) => {
    let processedValue = value;
    
    // HTML 코드에서 이미지 URL 자동 추출
    if (isHtmlImageTag(value)) {
      processedValue = extractImageUrlFromHtml(value);
    }
    
    onConfigChange({ characterImageUrl: processedValue });
  };

  // 캐릭터 이미지 사용 토글 처리
  const handleImageToggle = (checked: boolean) => {
    onConfigChange({ useCharacterImage: checked });
    if (!checked) {
      onConfigChange({ characterImageUrl: '' });
    }
  };

  // 이미지 삭제 함수 추가
  const handleImageDelete = () => {
    onConfigChange({ characterImageUrl: '' });
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

  return (
    <div className="container">
      <div className="main-layout">
        <div className="settings-panel">
          {/* 테마 토글 섹션 */}
          <ModernSection title="🎨 테마 설정">
            <ModernFormRow>
              <ModernFormGroup>
                <ModernCheckbox
                  checked={isDarkMode}
                  onChange={handleDarkModeToggle}
                  label={isDarkMode ? '다크 모드' : '라이트 모드'}
                />
              </ModernFormGroup>
              <ModernFormGroup>
                <ModernButton danger onClick={onReset}>
                  전체 초기화
                </ModernButton>
              </ModernFormGroup>
            </ModernFormRow>
          </ModernSection>

          {/* 캐릭터 정보 설정 */}
          <ModernSection title="👤 캐릭터 정보 설정">
            <ModernFormRow>
              <ModernFormGroup label="캐릭터 이름">
                <ModernInput
                  value={config.characterName}
                  onChange={(value) => onConfigChange({ characterName: value })}
                  placeholder="캐릭터 이름"
                />
              </ModernFormGroup>
              <ModernFormGroup label="AI 모델명">
                <ModernSelect
                  value={config.modelName}
                  onChange={(value) => onConfigChange({ modelName: value })}
                  options={[
                    { value: '', label: '모델명 선택 또는 직접 입력' },
                    ...modelNameOptions.map(name => ({ value: name, label: name }))
                  ]}
                  allowCustom={true}
                />
              </ModernFormGroup>
            </ModernFormRow>
            <ModernFormRow>
              <ModernFormGroup label="프롬프트명">
                <ModernInput
                  value={config.promptName}
                  onChange={(value) => onConfigChange({ promptName: value })}
                  placeholder="프롬프트명"
                />
              </ModernFormGroup>
              <ModernFormGroup label="보조 모델명">
                <ModernSelect
                  value={config.assistModelName}
                  onChange={(value) => onConfigChange({ assistModelName: value })}
                  options={[
                    { value: '', label: '보조 모델명 선택 또는 직접 입력' },
                    ...modelNameOptions.map(name => ({ value: name, label: name }))
                  ]}
                  allowCustom={true}
                />
              </ModernFormGroup>
            </ModernFormRow>
            <ModernFormRow>
              <ModernFormGroup label="사용자 이름">
                <ModernInput
                  value={config.userName}
                  onChange={(value) => onConfigChange({ userName: value })}
                  placeholder="사용자 이름 (기본값: USER)"
                />
              </ModernFormGroup>
              <ModernFormGroup label="채팅 번호">
                <ModernInput
                  value={config.chatNumber}
                  onChange={(value) => onConfigChange({ chatNumber: value })}
                  placeholder="채팅 번호 (기본값: 랜덤)"
                />
              </ModernFormGroup>
            </ModernFormRow>
            <ModernFormGroup>
              <ModernCheckbox
                checked={config.useCharacterImage}
                onChange={handleImageToggle}
                label="캐릭터 이미지 사용"
              />
            </ModernFormGroup>

            {config.useCharacterImage && (
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
                      id="chatchan-image-upload"
                    />
                    <label 
                      htmlFor="chatchan-image-upload"
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
                    value={config.characterImageUrl}
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
                {config.characterImageUrl && (
                  <ModernFormGroup label="🖼️ 현재 캐릭터 이미지">
                    <div style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '10px',
                      backgroundColor: isDarkMode ? '#2d3748' : '#f7fafc'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <img 
                          src={config.characterImageUrl} 
                          alt="캐릭터 이미지 미리보기"
                          style={{
                            width: '40px',
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
                          {config.characterImageUrl.length > 50 
                            ? config.characterImageUrl.substring(0, 50) + '...' 
                            : config.characterImageUrl}
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
              </>
            )}
          </ModernSection>

          {/* 디자인 및 스타일 설정 */}
          <ModernSection title="🎨 디자인 및 스타일 설정">
            {/* 컬러 테마 버튼들 */}
            <ModernFormRow>
              <ModernFormGroup>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: isDarkMode ? '#e4e6eb' : '#4b4f56' }}>
                  컬러 테마
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {Object.entries(colorThemes).map(([key, theme]) => (
                    <ModernButton
                      key={key}
                      onClick={() => applyColorTheme(key)}
                      style={{
                        backgroundColor: theme.h,
                        color: 'white',
                        minWidth: '70px'
                      }}
                    >
                      {key.split('_')[0]}
                    </ModernButton>
                  ))}
                </div>
              </ModernFormGroup>
            </ModernFormRow>
            
            {/* 색상 설정 */}
            <ModernFormRow>
              <ModernFormGroup label="로그 배경 색상">
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <ModernColorPicker
                    value={config.backgroundColor}
                    onChange={(color) => onConfigChange({ backgroundColor: color })}
                  />
                  <ModernInput
                    value={config.backgroundColor}
                    onChange={(value) => onConfigChange({ backgroundColor: value })}
                    placeholder="#ffffff"
                  />
                </div>
              </ModernFormGroup>
              <ModernFormGroup label="로그 글자 색상">
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <ModernColorPicker
                    value={config.textColor}
                    onChange={(color) => onConfigChange({ textColor: color })}
                  />
                  <ModernInput
                    value={config.textColor}
                    onChange={(value) => onConfigChange({ textColor: value })}
                    placeholder="#000000"
                  />
                </div>
              </ModernFormGroup>
            </ModernFormRow>
            
            {/* 하이라이트 색상들 */}
            <ModernFormRow>
              <ModernFormGroup label="하이라이트 색상 1">
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <ModernColorPicker
                    value={config.highlightColor}
                    onChange={(color) => onConfigChange({ highlightColor: color })}
                  />
                  <ModernInput
                    value={config.highlightColor}
                    onChange={(value) => onConfigChange({ highlightColor: value })}
                    placeholder="#2980b9"
                  />
                </div>
              </ModernFormGroup>
              <ModernFormGroup label="하이라이트 색상 2">
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <ModernColorPicker
                    value={config.promptColor}
                    onChange={(color) => onConfigChange({ promptColor: color })}
                  />
                  <ModernInput
                    value={config.promptColor}
                    onChange={(value) => onConfigChange({ promptColor: value })}
                    placeholder="#5dade2"
                  />
                </div>
              </ModernFormGroup>
            </ModernFormRow>
            <ModernFormRow>
              <ModernFormGroup label="하이라이트 색상 3">
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <ModernColorPicker
                    value={config.emphasisColor}
                    onChange={(color) => onConfigChange({ emphasisColor: color })}
                  />
                  <ModernInput
                    value={config.emphasisColor}
                    onChange={(value) => onConfigChange({ emphasisColor: value })}
                    placeholder="#1a5276"
                  />
                </div>
              </ModernFormGroup>
            </ModernFormRow>

            {/* 크기 설정 */}
            <ModernFormRow>
              <ModernFormGroup>
                <ModernSlider
                  value={config.baseFontSize}
                  onChange={(value) => onConfigChange({ baseFontSize: value })}
                  min={10}
                  max={30}
                  step={1}
                  label="글자 크기 (px)"
                />
              </ModernFormGroup>
              <ModernFormGroup>
                <ModernSlider
                  value={config.titleFontSize}
                  onChange={(value) => onConfigChange({ titleFontSize: value })}
                  min={20}
                  max={60}
                  step={1}
                  label="제목 글자 크기 (px)"
                />
              </ModernFormGroup>
            </ModernFormRow>
            <ModernFormRow>
              <ModernFormGroup>
                <ModernSlider
                  value={config.containerWidth}
                  onChange={(value) => onConfigChange({ containerWidth: value })}
                  min={300}
                  max={1500}
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
                  label="로그 섹션 둥근 모서리 (px)"
                />
              </ModernFormGroup>
            </ModernFormRow>
            <ModernFormRow>
              <ModernFormGroup>
                <ModernSlider
                  value={config.lineHeight}
                  onChange={(value) => onConfigChange({ lineHeight: value })}
                  min={1.0}
                  max={3.0}
                  step={0.1}
                  label="줄 간격"
                />
              </ModernFormGroup>
              <ModernFormGroup>
                <ModernSlider
                  value={config.letterSpacing}
                  onChange={(value) => onConfigChange({ letterSpacing: value })}
                  min={-2}
                  max={5}
                  step={0.1}
                  label="글자 간격 (px)"
                />
              </ModernFormGroup>
            </ModernFormRow>

            {/* 추가 스타일 및 출력 옵션 */}
            <ModernFormGroup label="추가 스타일 및 출력 옵션">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <ModernCheckbox
                  checked={config.italicizeNarration}
                  onChange={(checked) => onConfigChange({ italicizeNarration: checked })}
                  label="나레이션 기울임꼴"
                />
                <ModernCheckbox
                  checked={config.simpleOutputMode}
                  onChange={(checked) => onConfigChange({ simpleOutputMode: checked })}
                  label="채팅 로그만 출력"
                />
                <ModernCheckbox
                  checked={config.disableChatLogCollapse}
                  onChange={(checked) => onConfigChange({ disableChatLogCollapse: checked })}
                  label="로그 접기 비활성화"
                />
                <ModernCheckbox
                  checked={config.isAutoInputMode}
                  onChange={(checked) => onConfigChange({ isAutoInputMode: checked })}
                  label="딸깍 모드"
                />
                <ModernCheckbox
                  checked={config.dialogueUseBubble}
                  onChange={(checked) => onConfigChange({ dialogueUseBubble: checked })}
                  label="대사에 말풍선 사용"
                />
                <ModernCheckbox
                  checked={config.narrationUseLine}
                  onChange={(checked) => onConfigChange({ narrationUseLine: checked })}
                  label="나레이션에 인용선 사용"
                />
                <ModernCheckbox
                  checked={config.showBriefHeaderInfo}
                  onChange={(checked) => onConfigChange({ showBriefHeaderInfo: checked })}
                  label="모델 정보 헤더에 표시"
                />
              </div>
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

          {/* 프리셋 관리 */}
          <ModernSection title="💾 설정 프리셋 관리">
            <ModernFormRow>
              <ModernFormGroup label="프리셋 이름">
                <ModernInput
                  value={presetName}
                  onChange={setPresetName}
                  placeholder="저장할 프리셋 이름 입력"
                />
              </ModernFormGroup>
              <ModernFormGroup>
                <ModernButton primary onClick={savePreset}>
                  프리셋 저장
                </ModernButton>
              </ModernFormGroup>
            </ModernFormRow>
            <ModernFormRow>
              <ModernFormGroup label="저장된 프리셋">
                <ModernSelect
                  value={selectedPreset}
                  onChange={setSelectedPreset}
                  options={[
                    { value: '', label: '-- 프리셋 선택 --' },
                    ...Object.keys(presets).map(name => ({ value: name, label: name }))
                  ]}
                />
              </ModernFormGroup>
              <ModernFormGroup>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <ModernButton onClick={loadPreset}>
                    불러오기
                  </ModernButton>
                  <ModernButton danger onClick={deletePreset}>
                    삭제
                  </ModernButton>
                </div>
              </ModernFormGroup>
            </ModernFormRow>
          </ModernSection>

          {/* 채팅 내용 입력 */}
          <ModernSection title="💬 채팅 내용 입력">
            {/* 입력 형식 안내 */}
            <ModernHint>
              <strong>입력 형식 안내 ({config.isAutoInputMode ? '사칭방지용' : '풀사칭용'})</strong>
              {config.isAutoInputMode ? (
                <div style={{ marginTop: '8px', fontSize: '13px', lineHeight: 1.7 }}>
                  - 대사: <code>"큰따옴표"</code> 또는 <code>"둥근따옴표"</code> 로 감싸기<br />
                  - 나레이션: 따옴표 없이 입력<br />
                  - 예: <code>"안녕?"</code><br />
                  - 예: <code>USER가 인사했다.</code>
                </div>
              ) : (
                <div style={{ marginTop: '8px', fontSize: '13px', lineHeight: 1.7 }}>
                  - 나레이션: <code>-</code> 또는 <code>*</code> 로 시작<br />
                  - 대화: <code>USER:</code> 또는 <code>AI:</code> 로 시작<br />
                  - 예: <code>- 조용한 밤.</code><br />
                  - 예: <code>USER: 안녕?</code>
                </div>
              )}
              <div style={{ marginTop: '8px', fontSize: '13px', lineHeight: 1.7 }}>
                - 빈 줄은 무시됩니다.<br />
                <strong>마크다운 강조:</strong> (툴바 또는 단축키 사용)<br />
                &nbsp;&nbsp;<code>**굵게**</code> → <strong>굵은 글씨</strong><br />
                &nbsp;&nbsp;<code>*기울임*</code> → <em style={{ fontStyle: 'italic' }}>이탤릭체</em><br />
                &nbsp;&nbsp;<code>^하이라이트^</code> → <span style={{ backgroundColor: config.highlightColor, color: '#ffffff', padding: '0 2px', borderRadius: '3px' }}>하이라이트</span><br />
                &nbsp;&nbsp;<code>$강조$</code> → <span style={{ backgroundColor: config.emphasisColor, color: '#ffffff', padding: '0 2px', borderRadius: '3px' }}>강조</span>
              </div>
            </ModernHint>

            {/* 채팅 섹션들 */}
            {chatSections.map((section, index) => (
              <div key={section.id} style={{ marginBottom: '20px', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
                {/* 섹션 헤더 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    채팅 입력 {chatSections.length > 1 ? `${index + 1}` : ''}
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

                {/* 마크다운 툴바 */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px', backgroundColor: 'var(--surface)', borderRadius: '8px', marginBottom: '12px' }}>
                  <ModernButton onClick={() => applyPrefix(section.id, '- ')}>
                    나레이션 <kbd>Ctrl+Alt+1</kbd>
                  </ModernButton>
                  <ModernButton onClick={() => applyPrefix(section.id, 'AI: ')}>
                    AI <kbd>Ctrl+Alt+2</kbd>
                  </ModernButton>
                  <ModernButton onClick={() => applyPrefix(section.id, 'USER: ')}>
                    USER <kbd>Ctrl+Alt+3</kbd>
                  </ModernButton>
                  <div style={{ borderLeft: '1px solid var(--border)', margin: '0 8px' }}></div>
                  <ModernButton onClick={() => applyMarkdown(section.id, 'bold')}>
                    <b>B</b> <kbd>Ctrl+B</kbd>
                  </ModernButton>
                  <ModernButton onClick={() => applyMarkdown(section.id, 'italic')}>
                    <i>I</i> <kbd>Ctrl+I</kbd>
                  </ModernButton>
                  <ModernButton onClick={() => applyMarkdown(section.id, 'boldItalic')}>
                    <b><i>BI</i></b>
                  </ModernButton>
                  <ModernButton onClick={() => applyMarkdown(section.id, 'highlight')}>
                    하이라이트 <kbd>Ctrl+H</kbd>
                  </ModernButton>
                  <ModernButton onClick={() => applyMarkdown(section.id, 'emphasis')}>
                    강조 <kbd>Ctrl+E</kbd>
                  </ModernButton>
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
                  placeholder="- 화창한 봄날, 공원에서 우연히 만난 두 사람은..."
                  rows={8}
                  className="form-input form-textarea"
                  style={{ width: '100%', minHeight: '200px' }}
                />
              </div>
            ))}

            {/* 채팅 섹션 추가 버튼 */}
            <ModernFormGroup>
              <ModernButton onClick={addChatSection}>
                채팅 섹션 추가
              </ModernButton>
            </ModernFormGroup>
          </ModernSection>

          {/* 액션 버튼들 */}
          <ModernSection title="🚀 액션">
            <ModernFormRow>
              <ModernFormGroup>
                <ModernButton primary onClick={onGenerateHTML}>
                  HTML 생성하기
                </ModernButton>
              </ModernFormGroup>
              <ModernFormGroup>
                <ModernButton onClick={loadExample}>
                  예제 불러오기
                </ModernButton>
              </ModernFormGroup>
              <ModernFormGroup>
                <ModernButton onClick={onCopyHTML}>
                  ✨ 스타일 복사 (고급)
                </ModernButton>
              </ModernFormGroup>
            </ModernFormRow>
            
            <ModernHint>
              💡 <strong>스타일 복사 (고급)</strong>: 디자인과 이미지가 함께 클립보드에 복사됩니다. 글쓰기 에디터에 붙여넣기하면 HTML 에디터를 열지 않고도 자동으로 스타일이 적용됩니다!
            </ModernHint>
          </ModernSection>

          {/* HTML 결과 */}
          <ModernSection title="📄 HTML 결과">
            <ModernFormGroup>
              <ModernTextarea
                value={generatedHTML}
                onChange={() => {}} // 읽기 전용
                placeholder="HTML 생성 버튼을 눌러주세요..."
                rows={12}
                disabled
              />
            </ModernFormGroup>
          </ModernSection>
        </div>

        {/* 미리보기 패널 */}
        <div className="preview-panel">
          <div className="preview-header">
            <h2 className="preview-title">미리보기</h2>
          </div>
          <div className="preview-container">
            {generatedHTML ? (
              <div dangerouslySetInnerHTML={{ __html: previewHTML }} />
            ) : (
              <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '50px 20px' }}>
                미리보기 영역입니다. 'HTML 생성하기' 버튼을 눌러주세요.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatchanFormLayout; 