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

const ChatchanFormLayout: React.FC<ChatchanFormLayoutProps> = ({
  config,
  onConfigChange,
  generatedHTML,
  onGenerateHTML,
  onCopyHTML,
  onReset
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [chatSections, setChatSections] = useState([{ id: 'default', content: config.content || '' }]);
  const [presets, setPresets] = useState<{ [key: string]: ChatchanConfig }>({});
  const [presetName, setPresetName] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');

  // 마크다운 툴바 적용 함수
  const applyMarkdown = (textareaRef: React.RefObject<HTMLTextAreaElement>, type: string) => {
    const textarea = textareaRef.current;
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
    const newValue = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    const cursorPos = start + prefix.length;
    
    textarea.value = newValue;
    if (!selectedText) {
      textarea.setSelectionRange(cursorPos, cursorPos);
    }
    textarea.focus();
    
    // 내용 업데이트
    updateChatSection(0, newValue);
  };

  // 접두사 적용 함수
  const applyPrefix = (textareaRef: React.RefObject<HTMLTextAreaElement>, prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    
    let lineStart = value.lastIndexOf('\n', start - 1) + 1;
    let lineEnd = value.indexOf('\n', end);
    if (lineEnd === -1) lineEnd = value.length;
    
    const selectedLines = value.substring(lineStart, lineEnd).split('\n');
    const newLines = selectedLines.map((line, i) => {
      const existingMatch = line.match(/^([\*\-]\s*|USER:\s*|AI:\s*)/i);
      const lineContent = existingMatch ? line.substring(existingMatch[0].length) : line;
      return prefix + lineContent;
    });
    
    const replacement = newLines.join('\n');
    textarea.setRangeText(replacement, lineStart, lineEnd, 'preserve');
    const newCursorPos = lineStart + prefix.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    textarea.focus();
    
    // 내용 업데이트
    updateChatSection(0, textarea.value);
  };

  // 채팅 섹션 업데이트
  const updateChatSection = (index: number, content: string) => {
    const newSections = [...chatSections];
    newSections[index].content = content;
    setChatSections(newSections);
    
    // 전체 내용을 하나로 합쳐서 config 업데이트
    const combinedContent = newSections.map(section => section.content).join('\n\n');
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
  };

  // 프리셋 저장
  const savePreset = () => {
    if (!presetName.trim()) {
      alert('프리셋 이름을 입력해주세요.');
      return;
    }
    
    const newPresets = { ...presets, [presetName]: config };
    setPresets(newPresets);
    localStorage.setItem('chatchan_presets', JSON.stringify(newPresets));
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
    setChatSections([{ id: 'default', content: preset.content || '' }]);
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
    localStorage.setItem('chatchan_presets', JSON.stringify(newPresets));
    setSelectedPreset('');
    alert(`프리셋 '${selectedPreset}'이 삭제되었습니다.`);
  };

  // 예제 로드
  const loadExample = () => {
    const prefixExample = `- 화창한 봄날, 공원에서 우연히 만난 두 사람은 *짧게* 대화를 나누기 시작했다.\nUSER: 안녕하세요? 오늘 ^날씨^가 어때요?\n- AI는 잠시 생각에 잠기더니 환하게 웃으며 대답했다.\nAI: 안녕하세요! 오늘 날씨는 맑고 화창합니다. 최고 기온은 $23도$로 예상됩니다. ***야외 활동하기 좋은 날씨네요!***`;
    
    const autoExample = `화창한 봄날, 공원에서 우연히 만난 두 사람은 *짧게* 대화를 나누기 시작했다.\n"안녕하세요? 오늘 ^날씨^가 어때요?"\nAI는 잠시 생각에 잠기더니 환하게 웃으며 대답했다.\n"안녕하세요! 오늘 날씨는 맑고 화창합니다. 최고 기온은 $23도$로 예상됩니다. ***야외 활동하기 좋은 날씨네요!***"`;
    
    const example = config.isAutoInputMode ? autoExample : prefixExample;
    const modeText = config.isAutoInputMode ? '(사칭방지용 예제)' : '(풀사칭용 예제)';
    
    if (config.content && !confirm(`기존 내용이 있습니다. 예제로 덮어쓰시겠습니까?\n${modeText}`)) {
      return;
    }
    
    onConfigChange({ content: example });
    setChatSections([{ id: 'default', content: example }]);
    alert(`예제가 로드되었습니다. ${modeText}`);
  };

  // 컴포넌트 마운트 시 프리셋 로드
  useEffect(() => {
    try {
      const savedPresets = localStorage.getItem('chatchan_presets');
      if (savedPresets) {
        setPresets(JSON.parse(savedPresets));
      }
    } catch (error) {
      console.error('프리셋 로드 오류:', error);
    }
  }, []);

  // 텍스트에어리어 참조
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="container">
      <div className="main-layout">
        <div className="settings-panel">
          {/* 헤더 */}
          <div className="header">
            <h1>챗챈 로그 제조기 (V1.3)</h1>
            <p>모던한 챗챈 스타일 로그 생성기</p>
          </div>

          {/* 테마 토글 섹션 */}
          <ModernSection title="🎨 테마 설정">
            <ModernFormRow>
              <ModernFormGroup>
                <ModernCheckbox
                  checked={isDarkMode}
                  onChange={setIsDarkMode}
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
                <ModernInput
                  value={config.modelName}
                  onChange={(value) => onConfigChange({ modelName: value })}
                  placeholder="모델명 선택 또는 직접 입력"
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
                <ModernInput
                  value={config.assistModelName}
                  onChange={(value) => onConfigChange({ assistModelName: value })}
                  placeholder="보조 모델명"
                />
              </ModernFormGroup>
            </ModernFormRow>
            <ModernFormRow>
              <ModernFormGroup label="사용자 이름">
                <ModernInput
                  value={config.userName}
                  onChange={(value) => onConfigChange({ userName: value })}
                  placeholder="사용자 이름"
                />
              </ModernFormGroup>
              <ModernFormGroup label="채팅 번호">
                <ModernInput
                  value={config.chatNumber}
                  onChange={(value) => onConfigChange({ chatNumber: value })}
                  placeholder="채팅 번호"
                />
              </ModernFormGroup>
            </ModernFormRow>
            <ModernFormGroup label="캐릭터 이미지 URL">
              <ModernInput
                value={config.characterImageUrl}
                onChange={(value) => onConfigChange({ characterImageUrl: value })}
                placeholder="캐릭터 이미지 URL"
              />
              <ModernCheckbox
                checked={config.useCharacterImage}
                onChange={(checked) => onConfigChange({ useCharacterImage: checked })}
                label="캐릭터 이미지 사용"
              />
            </ModernFormGroup>
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

            {/* 마크다운 툴바 */}
            <ModernFormGroup label="마크다운 툴바">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px', backgroundColor: 'var(--surface)', borderRadius: '8px' }}>
                <ModernButton onClick={() => applyPrefix(textareaRef, '- ')}>
                  나레이션 <kbd>Ctrl+Alt+1</kbd>
                </ModernButton>
                <ModernButton onClick={() => applyPrefix(textareaRef, 'AI: ')}>
                  AI <kbd>Ctrl+Alt+2</kbd>
                </ModernButton>
                <ModernButton onClick={() => applyPrefix(textareaRef, 'USER: ')}>
                  USER <kbd>Ctrl+Alt+3</kbd>
                </ModernButton>
                <div style={{ borderLeft: '1px solid var(--border)', margin: '0 8px' }}></div>
                <ModernButton onClick={() => applyMarkdown(textareaRef, 'bold')}>
                  <b>B</b> <kbd>Ctrl+B</kbd>
                </ModernButton>
                <ModernButton onClick={() => applyMarkdown(textareaRef, 'italic')}>
                  <i>I</i> <kbd>Ctrl+I</kbd>
                </ModernButton>
                <ModernButton onClick={() => applyMarkdown(textareaRef, 'boldItalic')}>
                  <b><i>BI</i></b>
                </ModernButton>
                <ModernButton onClick={() => applyMarkdown(textareaRef, 'highlight')}>
                  하이라이트 <kbd>Ctrl+H</kbd>
                </ModernButton>
                <ModernButton onClick={() => applyMarkdown(textareaRef, 'emphasis')}>
                  강조 <kbd>Ctrl+E</kbd>
                </ModernButton>
              </div>
            </ModernFormGroup>

            {/* 텍스트에어리어 */}
            <ModernFormGroup label="채팅 내용">
              <ModernTextarea
                value={config.content}
                onChange={(value) => {
                  onConfigChange({ content: value });
                  updateChatSection(0, value);
                }}
                placeholder="- 화창한 봄날, 공원에서 우연히 만난 두 사람은..."
                rows={8}
              />
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
                  HTML 복사하기
                </ModernButton>
              </ModernFormGroup>
            </ModernFormRow>
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
              <div dangerouslySetInnerHTML={{ __html: generatedHTML }} />
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