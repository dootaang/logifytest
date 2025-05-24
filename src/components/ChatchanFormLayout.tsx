import React, { useState, useEffect, useRef } from 'react';

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
    <div className="chatchan-container" style={{ 
      backgroundColor: isDarkMode ? '#18191a' : '#f0f2f5',
      color: isDarkMode ? '#e4e6eb' : '#1d2129',
      transition: 'background-color 0.2s, color 0.2s',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '20px auto',
        backgroundColor: isDarkMode ? '#242526' : '#ffffff',
        border: `1px solid ${isDarkMode ? '#3e4042' : '#e4e6eb'}`,
        borderRadius: '8px',
        padding: '25px',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
        
        {/* 헤더 */}
        <h1 style={{
          fontSize: '22px',
          marginTop: 0,
          marginBottom: '25px',
          color: isDarkMode ? '#e4e6eb' : '#1d2129',
          borderBottom: `1px solid ${isDarkMode ? '#3e4042' : '#e4e6eb'}`,
          paddingBottom: '15px',
          fontWeight: 600
        }}>
          챗챈 로그 제조기 (V1.3)
        </h1>

        {/* 테마 토글 섹션 */}
        <div style={{
          padding: '15px 20px',
          marginBottom: '20px',
          borderBottom: `1px solid ${isDarkMode ? '#3e4042' : '#e4e6eb'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <label style={{
            display: 'inline-flex',
            alignItems: 'center',
            cursor: 'pointer',
            marginBottom: 0,
            fontWeight: 'normal'
          }}>
            <input
              type="checkbox"
              checked={isDarkMode}
              onChange={(e) => setIsDarkMode(e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
            />
            <span style={{
              position: 'relative',
              display: 'inline-block',
              width: '50px',
              height: '26px',
              backgroundColor: isDarkMode ? '#2374e1' : '#ccc',
              borderRadius: '13px',
              transition: 'background-color 0.2s',
              marginRight: '10px'
            }}>
              <span style={{
                content: '""',
                position: 'absolute',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: 'white',
                top: '3px',
                left: '3px',
                transform: isDarkMode ? 'translateX(24px)' : 'translateX(0)',
                transition: 'transform 0.2s'
              }} />
            </span>
            <span style={{
              color: isDarkMode ? '#e4e6eb' : '#4b4f56',
              marginLeft: '8px',
              fontSize: '14px'
            }}>
              {isDarkMode ? '다크 모드' : '라이트 모드'}
            </span>
          </label>
          <button
            onClick={onReset}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              padding: '5px 10px',
              fontSize: '12px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            전체 초기화
          </button>
        </div>

        {/* 캐릭터 정보 설정 */}
        <details style={{
          border: `1px solid ${isDarkMode ? '#3e4042' : '#e4e6eb'}`,
          borderRadius: '8px',
          marginBottom: '20px',
          backgroundColor: isDarkMode ? '#242526' : '#ffffff',
          overflow: 'hidden'
        }} open>
          <summary style={{
            fontWeight: 600,
            cursor: 'pointer',
            padding: '15px 20px',
            color: isDarkMode ? '#e4e6eb' : '#1d2129',
            listStyle: 'none',
            borderBottom: `1px solid ${isDarkMode ? '#3e4042' : '#e4e6eb'}`
          }}>
            캐릭터 정보 설정
          </summary>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px', minWidth: '150px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: isDarkMode ? '#e4e6eb' : '#4b4f56' }}>
                  캐릭터 이름
                </label>
                <input
                  type="text"
                  value={config.characterName}
                  onChange={(e) => onConfigChange({ characterName: e.target.value })}
                  placeholder="캐릭터 이름"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}`,
                    borderRadius: '4px',
                    backgroundColor: isDarkMode ? '#3a3b3c' : '#ffffff',
                    color: isDarkMode ? '#e4e6eb' : '#1d2129',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ flex: '1 1 200px', minWidth: '150px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: isDarkMode ? '#e4e6eb' : '#4b4f56' }}>
                  AI 모델명
                </label>
                <input
                  type="text"
                  value={config.modelName}
                  onChange={(e) => onConfigChange({ modelName: e.target.value })}
                  placeholder="모델명 선택 또는 직접 입력"
                  list="modelNameList"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}`,
                    borderRadius: '4px',
                    backgroundColor: isDarkMode ? '#3a3b3c' : '#ffffff',
                    color: isDarkMode ? '#e4e6eb' : '#1d2129',
                    fontSize: '14px'
                  }}
                />
                <datalist id="modelNameList">
                  <option value="GPT-4o ChatGPT" />
                  <option value="GPT-4.5" />
                  <option value="Claude 3.7 Sonnet" />
                  <option value="Gemini pro 2.5" />
                  <option value="Gemini flash 2.0" />
                </datalist>
              </div>
            </div>
            {/* 나머지 입력 필드들도 동일한 패턴으로 구현 */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px', minWidth: '150px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: isDarkMode ? '#e4e6eb' : '#4b4f56' }}>
                  프롬프트명
                </label>
                <input
                  type="text"
                  value={config.promptName}
                  onChange={(e) => onConfigChange({ promptName: e.target.value })}
                  placeholder="프롬프트명"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}`,
                    borderRadius: '4px',
                    backgroundColor: isDarkMode ? '#3a3b3c' : '#ffffff',
                    color: isDarkMode ? '#e4e6eb' : '#1d2129',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ flex: '1 1 200px', minWidth: '150px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: isDarkMode ? '#e4e6eb' : '#4b4f56' }}>
                  보조 모델명
                </label>
                <input
                  type="text"
                  value={config.assistModelName}
                  onChange={(e) => onConfigChange({ assistModelName: e.target.value })}
                  placeholder="보조 모델명 선택 또는 직접 입력"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}`,
                    borderRadius: '4px',
                    backgroundColor: isDarkMode ? '#3a3b3c' : '#ffffff',
                    color: isDarkMode ? '#e4e6eb' : '#1d2129',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px', minWidth: '150px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: isDarkMode ? '#e4e6eb' : '#4b4f56' }}>
                  유저 이름
                </label>
                <input
                  type="text"
                  value={config.userName}
                  onChange={(e) => onConfigChange({ userName: e.target.value })}
                  placeholder="유저 이름 (기본값: USER)"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}`,
                    borderRadius: '4px',
                    backgroundColor: isDarkMode ? '#3a3b3c' : '#ffffff',
                    color: isDarkMode ? '#e4e6eb' : '#1d2129',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ flex: '1 1 200px', minWidth: '150px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: isDarkMode ? '#e4e6eb' : '#4b4f56' }}>
                  채팅 번호
                </label>
                <input
                  type="text"
                  value={config.chatNumber}
                  onChange={(e) => onConfigChange({ chatNumber: e.target.value })}
                  placeholder="채팅 번호 (기본값: 랜덤)"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}`,
                    borderRadius: '4px',
                    backgroundColor: isDarkMode ? '#3a3b3c' : '#ffffff',
                    color: isDarkMode ? '#e4e6eb' : '#1d2129',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: isDarkMode ? '#e4e6eb' : '#4b4f56' }}>
                캐릭터 이미지 URL (선택)
              </label>
              <input
                type="text"
                value={config.characterImageUrl}
                onChange={(e) => onConfigChange({ characterImageUrl: e.target.value })}
                placeholder="https://example.com/image.png"
                disabled={!config.useCharacterImage}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}`,
                  borderRadius: '4px',
                  backgroundColor: isDarkMode ? '#3a3b3c' : '#ffffff',
                  color: isDarkMode ? '#e4e6eb' : '#1d2129',
                  fontSize: '14px',
                  opacity: config.useCharacterImage ? 1 : 0.5
                }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 0 }}>
              <label style={{
                display: 'inline-flex',
                alignItems: 'center',
                cursor: 'pointer',
                marginBottom: 0,
                fontWeight: 'normal'
              }}>
                <input
                  type="checkbox"
                  checked={!config.useCharacterImage}
                  onChange={(e) => onConfigChange({ useCharacterImage: !e.target.checked })}
                  style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                />
                <span style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '40px',
                  height: '22px',
                  backgroundColor: !config.useCharacterImage ? '#2374e1' : '#ccc',
                  borderRadius: '11px',
                  transition: 'background-color 0.2s',
                  marginRight: '10px'
                }}>
                  <span style={{
                    content: '""',
                    position: 'absolute',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    top: '3px',
                    left: '3px',
                    transform: !config.useCharacterImage ? 'translateX(18px)' : 'translateX(0)',
                    transition: 'transform 0.2s'
                  }} />
                </span>
                <span style={{ color: isDarkMode ? '#e4e6eb' : '#4b4f56' }}>
                  캐릭터 이미지 사용 안 함
                </span>
              </label>
            </div>
          </div>
        </details>

        {/* 디자인 및 스타일 설정 */}
        <details style={{
          border: `1px solid ${isDarkMode ? '#3e4042' : '#e4e6eb'}`,
          borderRadius: '8px',
          marginBottom: '20px',
          backgroundColor: isDarkMode ? '#242526' : '#ffffff',
          overflow: 'hidden'
        }}>
          <summary style={{
            fontWeight: 600,
            cursor: 'pointer',
            padding: '15px 20px',
            color: isDarkMode ? '#e4e6eb' : '#1d2129',
            listStyle: 'none'
          }}>
            디자인 및 스타일 설정
          </summary>
          <div style={{ padding: '20px' }}>
            {/* 컬러 테마 버튼들 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: isDarkMode ? '#e4e6eb' : '#4b4f56' }}>
                컬러 테마
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {Object.entries(colorThemes).map(([key, theme]) => (
                  <button
                    key={key}
                    onClick={() => applyColorTheme(key)}
                    style={{
                      padding: '8px 12px',
                      border: 'none',
                      borderRadius: '4px',
                      backgroundColor: theme.h,
                      color: 'white',
                      fontWeight: 600,
                      minWidth: '70px',
                      textAlign: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    {key.split('_')[0]}
                  </button>
                ))}
              </div>
            </div>
            
            {/* 색상 설정 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: isDarkMode ? '#e4e6eb' : '#4b4f56' }}>
                스타일 상세 설정
              </label>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px', minWidth: '150px' }}>
                  <label style={{ fontSize: '13px', color: isDarkMode ? '#b0b3b8' : '#606770', marginBottom: '4px', fontWeight: 'normal', display: 'block' }}>
                    로그 배경 색상
                  </label>
                  <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={config.backgroundColor}
                      onChange={(e) => onConfigChange({ backgroundColor: e.target.value })}
                      style={{
                        width: '40px',
                        height: '38px',
                        padding: '2px',
                        cursor: 'pointer',
                        border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}`,
                        borderRadius: '4px',
                        backgroundColor: isDarkMode ? '#3a3b3c' : '#ffffff'
                      }}
                    />
                    <input
                      type="text"
                      value={config.backgroundColor}
                      onChange={(e) => onConfigChange({ backgroundColor: e.target.value })}
                      style={{
                        flex: 1,
                        padding: '9px 12px',
                        border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}`,
                        borderRadius: '4px',
                        backgroundColor: isDarkMode ? '#3a3b3c' : '#ffffff',
                        color: isDarkMode ? '#e4e6eb' : '#1d2129',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
                <div style={{ flex: '1 1 200px', minWidth: '150px' }}>
                  <label style={{ fontSize: '13px', color: isDarkMode ? '#b0b3b8' : '#606770', marginBottom: '4px', fontWeight: 'normal', display: 'block' }}>
                    로그 글자 색상
                  </label>
                  <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={config.textColor}
                      onChange={(e) => onConfigChange({ textColor: e.target.value })}
                      style={{
                        width: '40px',
                        height: '38px',
                        padding: '2px',
                        cursor: 'pointer',
                        border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}`,
                        borderRadius: '4px',
                        backgroundColor: isDarkMode ? '#3a3b3c' : '#ffffff'
                      }}
                    />
                    <input
                      type="text"
                      value={config.textColor}
                      onChange={(e) => onConfigChange({ textColor: e.target.value })}
                      style={{
                        flex: 1,
                        padding: '9px 12px',
                        border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}`,
                        borderRadius: '4px',
                        backgroundColor: isDarkMode ? '#3a3b3c' : '#ffffff',
                        color: isDarkMode ? '#e4e6eb' : '#1d2129',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
              </div>
              
              {/* 하이라이트 색상들 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '10px' }}>
                <div>
                  <label style={{ fontSize: '13px', color: isDarkMode ? '#b0b3b8' : '#606770', marginBottom: '4px', fontWeight: 'normal', display: 'block' }}>
                    하이라이트 색상 1
                  </label>
                  <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={config.highlightColor}
                      onChange={(e) => onConfigChange({ highlightColor: e.target.value })}
                      style={{
                        width: '40px',
                        height: '38px',
                        padding: '2px',
                        cursor: 'pointer',
                        border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}`,
                        borderRadius: '4px'
                      }}
                    />
                    <input
                      type="text"
                      value={config.highlightColor}
                      onChange={(e) => onConfigChange({ highlightColor: e.target.value })}
                      style={{
                        flex: 1,
                        padding: '9px 12px',
                        border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}`,
                        borderRadius: '4px',
                        backgroundColor: isDarkMode ? '#3a3b3c' : '#ffffff',
                        color: isDarkMode ? '#e4e6eb' : '#1d2129',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '13px', color: isDarkMode ? '#b0b3b8' : '#606770', marginBottom: '4px', fontWeight: 'normal', display: 'block' }}>
                    하이라이트 색상 2
                  </label>
                  <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={config.promptColor}
                      onChange={(e) => onConfigChange({ promptColor: e.target.value })}
                      style={{
                        width: '40px',
                        height: '38px',
                        padding: '2px',
                        cursor: 'pointer',
                        border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}`,
                        borderRadius: '4px'
                      }}
                    />
                    <input
                      type="text"
                      value={config.promptColor}
                      onChange={(e) => onConfigChange({ promptColor: e.target.value })}
                      style={{
                        flex: 1,
                        padding: '9px 12px',
                        border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}`,
                        borderRadius: '4px',
                        backgroundColor: isDarkMode ? '#3a3b3c' : '#ffffff',
                        color: isDarkMode ? '#e4e6eb' : '#1d2129',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '13px', color: isDarkMode ? '#b0b3b8' : '#606770', marginBottom: '4px', fontWeight: 'normal', display: 'block' }}>
                    하이라이트 색상 3
                  </label>
                  <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={config.emphasisColor}
                      onChange={(e) => onConfigChange({ emphasisColor: e.target.value })}
                      style={{
                        width: '40px',
                        height: '38px',
                        padding: '2px',
                        cursor: 'pointer',
                        border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}`,
                        borderRadius: '4px'
                      }}
                    />
                    <input
                      type="text"
                      value={config.emphasisColor}
                      onChange={(e) => onConfigChange({ emphasisColor: e.target.value })}
                      style={{
                        flex: 1,
                        padding: '9px 12px',
                        border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}`,
                        borderRadius: '4px',
                        backgroundColor: isDarkMode ? '#3a3b3c' : '#ffffff',
                        color: isDarkMode ? '#e4e6eb' : '#1d2129',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 크기 설정 */}
            <div style={{ display: 'flex', gap: '15px', marginTop: '15px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 150px', minWidth: '120px' }}>
                <label style={{ fontSize: '13px', color: isDarkMode ? '#b0b3b8' : '#606770', marginBottom: '4px', fontWeight: 'normal', display: 'block' }}>
                  글자 크기 (px)
                </label>
                <input
                  type="number"
                  value={config.baseFontSize}
                  onChange={(e) => onConfigChange({ baseFontSize: parseInt(e.target.value) || 15 })}
                  min="10"
                  max="30"
                  step="1"
                  style={{
                    width: '80px',
                    padding: '9px',
                    textAlign: 'right',
                    border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}`,
                    borderRadius: '4px',
                    backgroundColor: isDarkMode ? '#3a3b3c' : '#ffffff',
                    color: isDarkMode ? '#e4e6eb' : '#1d2129',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ flex: '1 1 150px', minWidth: '120px' }}>
                <label style={{ fontSize: '13px', color: isDarkMode ? '#b0b3b8' : '#606770', marginBottom: '4px', fontWeight: 'normal', display: 'block' }}>
                  제목 글자 크기 (px)
                </label>
                <input
                  type="number"
                  value={config.titleFontSize}
                  onChange={(e) => onConfigChange({ titleFontSize: parseInt(e.target.value) || 38 })}
                  min="20"
                  max="60"
                  step="1"
                  style={{
                    width: '80px',
                    padding: '9px',
                    textAlign: 'right',
                    border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}`,
                    borderRadius: '4px',
                    backgroundColor: isDarkMode ? '#3a3b3c' : '#ffffff',
                    color: isDarkMode ? '#e4e6eb' : '#1d2129',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ flex: '1 1 150px', minWidth: '120px' }}>
                <label style={{ fontSize: '13px', color: isDarkMode ? '#b0b3b8' : '#606770', marginBottom: '4px', fontWeight: 'normal', display: 'block' }}>
                  컨테이너 너비 (px)
                </label>
                <input
                  type="number"
                  value={config.containerWidth}
                  onChange={(e) => onConfigChange({ containerWidth: parseInt(e.target.value) || 650 })}
                  min="300"
                  max="1500"
                  step="10"
                  style={{
                    width: '80px',
                    padding: '9px',
                    textAlign: 'right',
                    border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}`,
                    borderRadius: '4px',
                    backgroundColor: isDarkMode ? '#3a3b3c' : '#ffffff',
                    color: isDarkMode ? '#e4e6eb' : '#1d2129',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            {/* 추가 옵션들 */}
            <div style={{
              border: `1px solid ${isDarkMode ? '#3e4042' : '#e4e6eb'}`,
              borderRadius: '4px',
              padding: '15px',
              marginTop: '15px',
              backgroundColor: isDarkMode ? '#3a3b3c' : '#f0f2f5'
            }}>
              <label style={{ fontWeight: 600, color: isDarkMode ? '#e4e6eb' : '#4b4f56', marginBottom: '10px', display: 'block' }}>
                추가 스타일 및 출력 옵션
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px 15px', marginTop: '10px' }}>
                {[
                  { key: 'italicizeNarration', label: '나레이션 기울임꼴', checked: config.italicizeNarration },
                  { key: 'simpleOutputMode', label: '채팅 로그만 출력', checked: config.simpleOutputMode },
                  { key: 'disableChatLogCollapse', label: '로그 접기 비활성화', checked: config.disableChatLogCollapse },
                  { key: 'isAutoInputMode', label: '딸깍 모드', checked: config.isAutoInputMode },
                  { key: 'dialogueUseBubble', label: '대사에 말풍선 사용', checked: config.dialogueUseBubble },
                  { key: 'narrationUseLine', label: '나레이션에 인용선 사용', checked: config.narrationUseLine },
                  { key: 'showBriefHeaderInfo', label: '모델 정보 헤더에 표시', checked: config.showBriefHeaderInfo }
                ].map((option) => (
                  <div key={option.key} style={{ display: 'flex', alignItems: 'center', marginBottom: 0 }}>
                    <label style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      marginBottom: 0,
                      fontWeight: 'normal'
                    }}>
                      <input
                        type="checkbox"
                        checked={option.checked}
                        onChange={(e) => onConfigChange({ [option.key]: e.target.checked })}
                        style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                      />
                      <span style={{
                        position: 'relative',
                        display: 'inline-block',
                        width: '40px',
                        height: '22px',
                        backgroundColor: option.checked ? '#2374e1' : '#ccc',
                        borderRadius: '11px',
                        transition: 'background-color 0.2s',
                        marginRight: '10px'
                      }}>
                        <span style={{
                          content: '""',
                          position: 'absolute',
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          backgroundColor: 'white',
                          top: '3px',
                          left: '3px',
                          transform: option.checked ? 'translateX(18px)' : 'translateX(0)',
                          transition: 'transform 0.2s'
                        }} />
                      </span>
                      <span style={{ color: isDarkMode ? '#e4e6eb' : '#4b4f56' }}>
                        {option.label}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* 프리셋 관리 */}
            <div style={{
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: `1px solid ${isDarkMode ? '#3e4042' : '#e4e6eb'}`
            }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: isDarkMode ? '#e4e6eb' : '#4b4f56' }}>
                설정 프리셋 관리
              </label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginTop: '10px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', color: isDarkMode ? '#b0b3b8' : '#606770', marginBottom: '4px', fontWeight: 'normal', display: 'block' }}>
                    프리셋 이름
                  </label>
                  <input
                    type="text"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder="저장할 프리셋 이름 입력"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}`,
                      borderRadius: '4px',
                      backgroundColor: isDarkMode ? '#3a3b3c' : '#ffffff',
                      color: isDarkMode ? '#e4e6eb' : '#1d2129',
                      fontSize: '14px',
                      minWidth: '150px'
                    }}
                  />
                </div>
                <button
                  onClick={savePreset}
                  style={{
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    padding: '10px 15px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '14px',
                    flexShrink: 0
                  }}
                >
                  프리셋 저장
                </button>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginTop: '10px', flexWrap: 'wrap' }}>
                <select
                  value={selectedPreset}
                  onChange={(e) => setSelectedPreset(e.target.value)}
                  style={{
                    flex: 2,
                    padding: '9px 12px',
                    border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}`,
                    borderRadius: '4px',
                    backgroundColor: isDarkMode ? '#3a3b3c' : '#ffffff',
                    color: isDarkMode ? '#e4e6eb' : '#1d2129',
                    fontSize: '14px'
                  }}
                >
                  <option value="">-- 프리셋 선택 --</option>
                  {Object.keys(presets).map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <button
                  onClick={loadPreset}
                  style={{
                    backgroundColor: isDarkMode ? '#4e4f50' : '#6c757d',
                    color: 'white',
                    padding: '10px 15px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '14px',
                    flexShrink: 0
                  }}
                >
                  불러오기
                </button>
                <button
                  onClick={deletePreset}
                  style={{
                    backgroundColor: '#dc3545',
                    color: 'white',
                    padding: '5px 10px',
                    fontSize: '12px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        </details>

        {/* 채팅 내용 입력 */}
        <details style={{
          border: `1px solid ${isDarkMode ? '#3e4042' : '#e4e6eb'}`,
          borderRadius: '8px',
          marginBottom: '20px',
          backgroundColor: isDarkMode ? '#242526' : '#ffffff',
          overflow: 'hidden'
        }} open>
          <summary style={{
            fontWeight: 600,
            cursor: 'pointer',
            padding: '15px 20px',
            color: isDarkMode ? '#e4e6eb' : '#1d2129',
            listStyle: 'none',
            borderBottom: `1px solid ${isDarkMode ? '#3e4042' : '#e4e6eb'}`
          }}>
            채팅 내용 입력
          </summary>
          <div style={{ padding: '20px' }}>
            {/* 입력 형식 안내 */}
            <div style={{
              marginBottom: '15px',
              padding: '15px',
              backgroundColor: isDarkMode ? '#3a3b3c' : '#f0f2f5',
              borderRadius: '8px',
              border: `1px solid ${isDarkMode ? '#3e4042' : '#e4e6eb'}`
            }}>
              <strong style={{ color: isDarkMode ? '#e4e6eb' : '#1d2129', fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                입력 형식 안내 ({config.isAutoInputMode ? '사칭방지용' : '풀사칭용'})
              </strong>
              {config.isAutoInputMode ? (
                <span style={{ fontSize: '13px', color: isDarkMode ? '#b0b3b8' : '#606770', lineHeight: 1.7, display: 'block' }}>
                  - 대사: <code style={{ backgroundColor: isDarkMode ? '#3a3b3c' : '#ffffff', padding: '2px 5px', borderRadius: '3px', fontFamily: 'monospace', fontSize: '12px', border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}` }}>"큰따옴표"</code> 또는 <code style={{ backgroundColor: isDarkMode ? '#3a3b3c' : '#ffffff', padding: '2px 5px', borderRadius: '3px', fontFamily: 'monospace', fontSize: '12px', border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}` }}>"둥근따옴표"</code> 로 감싸기<br />
                  - 나레이션: 따옴표 없이 입력<br />
                  - 예: <code style={{ backgroundColor: isDarkMode ? '#3a3b3c' : '#ffffff', padding: '2px 5px', borderRadius: '3px', fontFamily: 'monospace', fontSize: '12px', border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}` }}>"안녕?"</code><br />
                  - 예: <code style={{ backgroundColor: isDarkMode ? '#3a3b3c' : '#ffffff', padding: '2px 5px', borderRadius: '3px', fontFamily: 'monospace', fontSize: '12px', border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}` }}>USER가 인사했다.</code>
                </span>
              ) : (
                <span style={{ fontSize: '13px', color: isDarkMode ? '#b0b3b8' : '#606770', lineHeight: 1.7, display: 'block' }}>
                  - 나레이션: <code style={{ backgroundColor: isDarkMode ? '#3a3b3c' : '#ffffff', padding: '2px 5px', borderRadius: '3px', fontFamily: 'monospace', fontSize: '12px', border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}` }}>-</code> 또는 <code style={{ backgroundColor: isDarkMode ? '#3a3b3c' : '#ffffff', padding: '2px 5px', borderRadius: '3px', fontFamily: 'monospace', fontSize: '12px', border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}` }}>*</code> 로 시작<br />
                  - 대화: <code style={{ backgroundColor: isDarkMode ? '#3a3b3c' : '#ffffff', padding: '2px 5px', borderRadius: '3px', fontFamily: 'monospace', fontSize: '12px', border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}` }}>USER:</code> 또는 <code style={{ backgroundColor: isDarkMode ? '#3a3b3c' : '#ffffff', padding: '2px 5px', borderRadius: '3px', fontFamily: 'monospace', fontSize: '12px', border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}` }}>AI:</code> 로 시작<br />
                  - 예: <code style={{ backgroundColor: isDarkMode ? '#3a3b3c' : '#ffffff', padding: '2px 5px', borderRadius: '3px', fontFamily: 'monospace', fontSize: '12px', border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}` }}>- 조용한 밤.</code><br />
                  - 예: <code style={{ backgroundColor: isDarkMode ? '#3a3b3c' : '#ffffff', padding: '2px 5px', borderRadius: '3px', fontFamily: 'monospace', fontSize: '12px', border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}` }}>USER: 안녕?</code>
                </span>
              )}
              <span style={{ fontSize: '13px', color: isDarkMode ? '#b0b3b8' : '#606770', lineHeight: 1.7, display: 'block', marginTop: '8px' }}>
                - 빈 줄은 무시됩니다.<br />
                <strong>마크다운 강조:</strong> (툴바 또는 단축키 사용)<br />
                &nbsp;&nbsp;<code style={{ backgroundColor: isDarkMode ? '#3a3b3c' : '#ffffff', padding: '2px 5px', borderRadius: '3px', fontFamily: 'monospace', fontSize: '12px', border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}` }}>**굵게**</code> → <strong>굵은 글씨</strong><br />
                &nbsp;&nbsp;<code style={{ backgroundColor: isDarkMode ? '#3a3b3c' : '#ffffff', padding: '2px 5px', borderRadius: '3px', fontFamily: 'monospace', fontSize: '12px', border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}` }}>*기울임*</code> → <em style={{ fontStyle: 'italic' }}>이탤릭체</em><br />
                &nbsp;&nbsp;<code style={{ backgroundColor: isDarkMode ? '#3a3b3c' : '#ffffff', padding: '2px 5px', borderRadius: '3px', fontFamily: 'monospace', fontSize: '12px', border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}` }}>^하이라이트^</code> → <span style={{ backgroundColor: config.highlightColor, color: '#ffffff', padding: '0 2px', borderRadius: '3px' }}>하이라이트</span><br />
                &nbsp;&nbsp;<code style={{ backgroundColor: isDarkMode ? '#3a3b3c' : '#ffffff', padding: '2px 5px', borderRadius: '3px', fontFamily: 'monospace', fontSize: '12px', border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}` }}>$강조$</code> → <span style={{ backgroundColor: config.emphasisColor, color: '#ffffff', padding: '0 2px', borderRadius: '3px' }}>강조</span>
              </span>
            </div>

            {/* 마크다운 툴바 */}
            <div style={{
              marginBottom: '8px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '5px',
              padding: '8px',
              backgroundColor: isDarkMode ? '#3a3b3c' : '#f0f2f5',
              border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}`,
              borderRadius: '4px'
            }}>
              <button
                type="button"
                onClick={() => applyPrefix(textareaRef, '- ')}
                style={{
                  backgroundColor: isDarkMode ? '#3a3b3c' : '#ffffff',
                  border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}`,
                  padding: '4px 10px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontWeight: 'normal',
                  color: isDarkMode ? '#e4e6eb' : '#1d2129'
                }}
              >
                나레이션<kbd style={{ fontSize: '10px', backgroundColor: isDarkMode ? '#18191a' : '#f0f2f5', border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}`, padding: '1px 3px', borderRadius: '2px', marginLeft: '4px', verticalAlign: 'middle', color: isDarkMode ? '#b0b3b8' : '#606770' }}>Ctrl+Alt+1</kbd>
              </button>
              <button
                type="button"
                onClick={() => applyPrefix(textareaRef, 'AI: ')}
                style={{
                  backgroundColor: isDarkMode ? '#3a3b3c' : '#ffffff',
                  border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}`,
                  padding: '4px 10px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontWeight: 'normal',
                  color: isDarkMode ? '#e4e6eb' : '#1d2129'
                }}
              >
                AI<kbd style={{ fontSize: '10px', backgroundColor: isDarkMode ? '#18191a' : '#f0f2f5', border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}`, padding: '1px 3px', borderRadius: '2px', marginLeft: '4px', verticalAlign: 'middle', color: isDarkMode ? '#b0b3b8' : '#606770' }}>Ctrl+Alt+2</kbd>
              </button>
              <button
                type="button"
                onClick={() => applyPrefix(textareaRef, 'USER: ')}
                style={{
                  backgroundColor: isDarkMode ? '#3a3b3c' : '#ffffff',
                  border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}`,
                  padding: '4px 10px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontWeight: 'normal',
                  color: isDarkMode ? '#e4e6eb' : '#1d2129'
                }}
              >
                USER<kbd style={{ fontSize: '10px', backgroundColor: isDarkMode ? '#18191a' : '#f0f2f5', border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}`, padding: '1px 3px', borderRadius: '2px', marginLeft: '4px', verticalAlign: 'middle', color: isDarkMode ? '#b0b3b8' : '#606770' }}>Ctrl+Alt+3</kbd>
              </button>
              <span style={{ borderLeft: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}`, margin: '0 5px' }}></span>
              <button
                type="button"
                onClick={() => applyMarkdown(textareaRef, 'bold')}
                style={{
                  backgroundColor: isDarkMode ? '#3a3b3c' : '#ffffff',
                  border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}`,
                  padding: '4px 10px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontWeight: 'normal',
                  color: isDarkMode ? '#e4e6eb' : '#1d2129'
                }}
              >
                <b>B</b><kbd style={{ fontSize: '10px', backgroundColor: isDarkMode ? '#18191a' : '#f0f2f5', border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}`, padding: '1px 3px', borderRadius: '2px', marginLeft: '4px', verticalAlign: 'middle', color: isDarkMode ? '#b0b3b8' : '#606770' }}>Ctrl+B</kbd>
              </button>
              <button
                type="button"
                onClick={() => applyMarkdown(textareaRef, 'italic')}
                style={{
                  backgroundColor: isDarkMode ? '#3a3b3c' : '#ffffff',
                  border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}`,
                  padding: '4px 10px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontWeight: 'normal',
                  color: isDarkMode ? '#e4e6eb' : '#1d2129'
                }}
              >
                <i>I</i><kbd style={{ fontSize: '10px', backgroundColor: isDarkMode ? '#18191a' : '#f0f2f5', border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}`, padding: '1px 3px', borderRadius: '2px', marginLeft: '4px', verticalAlign: 'middle', color: isDarkMode ? '#b0b3b8' : '#606770' }}>Ctrl+I</kbd>
              </button>
              <button
                type="button"
                onClick={() => applyMarkdown(textareaRef, 'boldItalic')}
                style={{
                  backgroundColor: isDarkMode ? '#3a3b3c' : '#ffffff',
                  border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}`,
                  padding: '4px 10px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontWeight: 'normal',
                  color: isDarkMode ? '#e4e6eb' : '#1d2129'
                }}
              >
                <b><i>BI</i></b>
              </button>
              <button
                type="button"
                onClick={() => applyMarkdown(textareaRef, 'highlight')}
                style={{
                  backgroundColor: isDarkMode ? '#3a3b3c' : '#ffffff',
                  border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}`,
                  padding: '4px 10px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontWeight: 'normal',
                  color: isDarkMode ? '#e4e6eb' : '#1d2129'
                }}
              >
                하이라이트<kbd style={{ fontSize: '10px', backgroundColor: isDarkMode ? '#18191a' : '#f0f2f5', border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}`, padding: '1px 3px', borderRadius: '2px', marginLeft: '4px', verticalAlign: 'middle', color: isDarkMode ? '#b0b3b8' : '#606770' }}>Ctrl+H</kbd>
              </button>
              <button
                type="button"
                onClick={() => applyMarkdown(textareaRef, 'emphasis')}
                style={{
                  backgroundColor: isDarkMode ? '#3a3b3c' : '#ffffff',
                  border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}`,
                  padding: '4px 10px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontWeight: 'normal',
                  color: isDarkMode ? '#e4e6eb' : '#1d2129'
                }}
              >
                강조<kbd style={{ fontSize: '10px', backgroundColor: isDarkMode ? '#18191a' : '#f0f2f5', border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}`, padding: '1px 3px', borderRadius: '2px', marginLeft: '4px', verticalAlign: 'middle', color: isDarkMode ? '#b0b3b8' : '#606770' }}>Ctrl+E</kbd>
              </button>
            </div>

            {/* 텍스트에어리어 */}
            <textarea
              ref={textareaRef}
              value={config.content}
              onChange={(e) => {
                onConfigChange({ content: e.target.value });
                updateChatSection(0, e.target.value);
              }}
              placeholder="- 화창한 봄날, 공원에서 우연히 만난 두 사람은..."
              style={{
                width: '100%',
                minHeight: '150px',
                padding: '9px 12px',
                border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}`,
                borderRadius: '4px',
                backgroundColor: isDarkMode ? '#3a3b3c' : '#ffffff',
                color: isDarkMode ? '#e4e6eb' : '#1d2129',
                fontSize: '14px',
                fontFamily: 'monospace',
                resize: 'vertical',
                lineHeight: 1.5
              }}
            />
          </div>
        </details>

        {/* 액션 버튼들 */}
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'stretch' }}>
          <button
            onClick={onGenerateHTML}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '10px 18px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px'
            }}
          >
            HTML 생성하기
          </button>
          <button
            onClick={loadExample}
            style={{
              backgroundColor: '#17a2b8',
              color: 'white',
              padding: '10px 15px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px'
            }}
          >
            예제 불러오기
          </button>
          <button
            onClick={onCopyHTML}
            style={{
              backgroundColor: isDarkMode ? '#4e4f50' : '#6c757d',
              color: 'white',
              padding: '10px 15px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px'
            }}
          >
            HTML 복사하기
          </button>
        </div>

        {/* HTML 결과 */}
        <div style={{ marginTop: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: isDarkMode ? '#e4e6eb' : '#4b4f56' }}>
            HTML 결과
          </label>
          <textarea
            value={generatedHTML}
            readOnly
            style={{
              width: '100%',
              height: '250px',
              padding: '9px 12px',
              border: `1px solid ${isDarkMode ? '#4e4f50' : '#ccd0d5'}`,
              borderRadius: '4px',
              backgroundColor: isDarkMode ? '#3a3b3c' : '#ffffff',
              color: isDarkMode ? '#e4e6eb' : '#1d2129',
              fontSize: '13px',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              overflowX: 'auto',
              wordWrap: 'break-word'
            }}
          />
        </div>

        {/* 미리보기 */}
        <div style={{ marginTop: '20px' }}>
          <h2 style={{
            fontSize: '18px',
            marginBottom: '15px',
            marginTop: '30px',
            paddingBottom: '10px',
            borderBottom: `1px solid ${isDarkMode ? '#3e4042' : '#e4e6eb'}`,
            fontWeight: 600,
            color: isDarkMode ? '#e4e6eb' : '#1d2129'
          }}>
            미리보기
          </h2>
          <div style={{
            border: `1px solid ${isDarkMode ? '#3e4042' : '#e4e6eb'}`,
            padding: '20px',
            minHeight: '300px',
            borderRadius: '8px',
            backgroundColor: isDarkMode ? '#18191a' : '#f0f2f5',
            marginTop: '15px',
            overflowX: 'auto'
          }}>
            {generatedHTML ? (
              <div dangerouslySetInnerHTML={{ __html: generatedHTML }} />
            ) : (
              <div style={{ color: isDarkMode ? '#b0b3b8' : '#606770', textAlign: 'center', padding: '50px 20px' }}>
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