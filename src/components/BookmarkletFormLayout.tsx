import React, { useState, useRef, useCallback, useEffect } from 'react';
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

interface WordReplacement {
  from: string;
  to: string;
}

interface BookmarkletConfig {
  content: string;
  backgroundColor: string;
  textColor: string;
  highlightColor: string;
  emphasisColor: string;
  fontSize: number;
  lineHeight: number;
  containerWidth: number;
  borderRadius: number;
  padding: number;
  boxShadow: string;
  wordReplacements: WordReplacement[];
}

interface BookmarkletFormLayoutProps {
  config: BookmarkletConfig;
  onConfigChange: (newConfig: Partial<BookmarkletConfig>) => void;
  generatedHTML: string;
  onGenerateHTML: () => void;
  onCopyHTML: () => void;
  onReset: () => void;
}

const BookmarkletFormLayout: React.FC<BookmarkletFormLayoutProps> = ({
  config,
  onConfigChange,
  generatedHTML,
  onGenerateHTML,
  onCopyHTML,
  onReset
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // 히스토리 관리 - 초기값도 안전하게 처리
  const [history, setHistory] = useState<string[]>([config.content || '']);
  const [historyIndex, setHistoryIndex] = useState(0);

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

  // 히스토리 추가 함수
  const addToHistory = useCallback((content: string) => {
    // content가 undefined나 null인 경우 빈 문자열로 처리
    const safeContent = content || '';
    
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(safeContent);
      // 히스토리 길이 제한 (100개)
      if (newHistory.length > 100) {
        newHistory.shift();
        return newHistory;
      }
      return newHistory;
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  // 실행취소
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const content = history[newIndex] || '';
      onConfigChange({ content });
      if (textareaRef.current) {
        textareaRef.current.value = content;
      }
    }
  }, [historyIndex, history, onConfigChange]);

  // 다시실행
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const content = history[newIndex] || '';
      onConfigChange({ content });
      if (textareaRef.current) {
        textareaRef.current.value = content;
      }
    }
  }, [historyIndex, history, onConfigChange]);

  // 키보드 단축키 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (e.ctrlKey && ((e.shiftKey && e.key === 'Z') || e.key === 'y')) {
        e.preventDefault();
        redo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // 텍스트가 이미 특정 스타일로 감싸져 있는지 확인하는 함수
  const isTextWrapped = (text: string, prefix: string, suffix: string) => {
    return text.startsWith(prefix) && text.endsWith(suffix);
  };

  // 텍스트 편집 도구 함수들
  const applyMarkdown = (type: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let prefix = '', suffix = '';
    
    switch (type) {
      case 'bold':
        prefix = '<strong>'; suffix = '</strong>';
        break;
      case 'italic':
        prefix = '<em>'; suffix = '</em>';
        break;
      case 'highlight':
        prefix = '<span style="color: rgb(241, 250, 140); font-style: italic;">'; 
        suffix = '</span>';
        break;
      case 'emphasis':
        prefix = '<span style="color: rgb(139, 233, 253);">'; 
        suffix = '</span>';
        break;
      case 'orange':
        prefix = '<span style="color: rgb(255, 184, 108);">'; 
        suffix = '</span>';
        break;
      default:
        return;
    }
    
    let replacement;
    
    // 이미 해당 스타일이 적용되어 있으면 제거 (토글 기능)
    if (selectedText && isTextWrapped(selectedText, prefix, suffix)) {
      replacement = selectedText.slice(prefix.length, -suffix.length);
    } else {
      replacement = selectedText ? `${prefix}${selectedText}${suffix}` : `${prefix}${suffix}`;
    }
    
    const newValue = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    const cursorPos = selectedText && isTextWrapped(selectedText, prefix, suffix) 
      ? start + replacement.length 
      : start + prefix.length;
    
    textarea.value = newValue;
    if (!selectedText || isTextWrapped(selectedText, prefix, suffix)) {
      textarea.setSelectionRange(cursorPos, cursorPos);
    }
    textarea.focus();
    
    // 히스토리에 추가
    addToHistory(newValue || '');
    
    // 내용 업데이트
    onConfigChange({ content: newValue || '' });
  };

  // 텍스트 변경 핸들러
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value || ''; // undefined 방어
    onConfigChange({ content: newContent });
    
    // 이전 타이머 클리어
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // 히스토리에 추가 (디바운스 효과)
    timeoutRef.current = setTimeout(() => {
      addToHistory(newContent);
    }, 500);
  }, [onConfigChange, addToHistory]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // 모던 스타일 버튼 컴포넌트
  const StyleButton = ({ type, label, color, onClick }: {
    type: string
    label: string
    color: string
    onClick: () => void
  }) => (
    <ModernButton
      onClick={onClick}
      style={{
        backgroundColor: color,
        color: '#000000',
        border: `1px solid ${STYLES.border}`,
        borderRadius: `${STYLES.radius_small}px`,
        padding: '6px 12px',
        fontSize: `${STYLES.font_size_small}px`,
        fontWeight: STYLES.font_weight_normal,
        margin: '2px'
      }}
    >
      {label}
    </ModernButton>
  )

  return (
    <div className="container">
      <div className="main-layout">
        <div className="settings-panel">
          {/* 헤더 */}
          <div className="header">
            <h1>📚 북마클릿형 생성기</h1>
            <p>심플하고 깔끔한 북마클릿 스타일 로그를 생성합니다</p>
          </div>

          {/* 기본 설정 */}
          <ModernSection title="⚙️ 기본 설정">
            <ModernFormRow>
              <ModernFormGroup label="배경색">
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
              <ModernFormGroup label="본문색">
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

            <ModernFormRow>
              <ModernFormGroup>
                <ModernSlider
                  value={config.fontSize}
                  onChange={(value) => onConfigChange({ fontSize: value })}
                  min={12}
                  max={24}
                  step={1}
                  label="폰트 크기 (px)"
                />
              </ModernFormGroup>
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
            </ModernFormRow>

            <ModernFormRow>
              <ModernFormGroup>
                <ModernSlider
                  value={config.containerWidth}
                  onChange={(value) => onConfigChange({ containerWidth: value })}
                  min={600}
                  max={1000}
                  step={10}
                  label="컨테이너 너비 (px)"
                />
              </ModernFormGroup>
              <ModernFormGroup>
                <ModernSlider
                  value={config.borderRadius}
                  onChange={(value) => onConfigChange({ borderRadius: value })}
                  min={0}
                  max={30}
                  step={1}
                  label="테두리 둥글기 (px)"
                />
              </ModernFormGroup>
            </ModernFormRow>

            <ModernFormGroup>
              <ModernSlider
                value={config.padding}
                onChange={(value) => onConfigChange({ padding: value })}
                min={1}
                max={4}
                step={0.1}
                label="내부 여백 (rem)"
              />
            </ModernFormGroup>
          </ModernSection>

          {/* 텍스트 편집 도구 */}
          <ModernSection title="✏️ 텍스트 편집 도구">
            <ModernFormGroup label="실행취소/다시실행">
              <ModernFormRow>
                <ModernFormGroup>
                  <ModernButton 
                    onClick={undo}
                    disabled={historyIndex <= 0}
                  >
                    ↶ 실행취소 (Ctrl+Z)
                  </ModernButton>
                </ModernFormGroup>
                <ModernFormGroup>
                  <ModernButton 
                    onClick={redo}
                    disabled={historyIndex >= history.length - 1}
                  >
                    ↷ 다시실행 (Ctrl+Y)
                  </ModernButton>
                </ModernFormGroup>
              </ModernFormRow>
            </ModernFormGroup>

            <ModernFormGroup label="텍스트 스타일">
              <ModernHint>
                <p>텍스트를 선택한 후 버튼을 클릭하세요</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
                  <StyleButton
                    type="bold"
                    label="굵게"
                    color="#f0f0f0"
                    onClick={() => applyMarkdown('bold')}
                  />
                  <StyleButton
                    type="italic"
                    label="기울임"
                    color="#f0f0f0"
                    onClick={() => applyMarkdown('italic')}
                  />
                  <StyleButton
                    type="highlight"
                    label="하이라이트"
                    color="rgb(241, 250, 140)"
                    onClick={() => applyMarkdown('highlight')}
                  />
                  <StyleButton
                    type="emphasis"
                    label="파란강조"
                    color="rgb(139, 233, 253)"
                    onClick={() => applyMarkdown('emphasis')}
                  />
                  <StyleButton
                    type="orange"
                    label="주황강조"
                    color="rgb(255, 184, 108)"
                    onClick={() => applyMarkdown('orange')}
                  />
                </div>
              </ModernHint>
            </ModernFormGroup>

            <ModernFormGroup label="본문 내용">
              <textarea
                ref={textareaRef}
                value={config.content}
                onChange={handleTextChange}
                placeholder="본문 내용을 입력하세요..."
                style={{
                  width: '100%',
                  height: '300px',
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
          </ModernSection>

          {/* 액션 버튼 */}
          <ModernSection title="🎯 액션">
            <ModernFormRow>
              <ModernFormGroup>
                <ModernButton primary onClick={onGenerateHTML}>
                  🎨 HTML 생성
                </ModernButton>
              </ModernFormGroup>
              <ModernFormGroup>
                <ModernButton onClick={onCopyHTML}>
                  📋 복사
                </ModernButton>
              </ModernFormGroup>
              <ModernFormGroup>
                <ModernButton danger onClick={onReset}>
                  🔄 초기화
                </ModernButton>
              </ModernFormGroup>
            </ModernFormRow>
          </ModernSection>
        </div>

        <div className="preview-panel">
          <div className="preview-header">
            <h3 className="preview-title">👀 미리보기</h3>
            <p>생성된 HTML 코드의 실시간 미리보기</p>
          </div>
          
          <div className="preview-container">
            {generatedHTML ? (
              <div dangerouslySetInnerHTML={{ __html: generatedHTML }} />
            ) : (
              <div style={{
                textAlign: 'center',
                color: isDarkMode ? '#65676b' : '#8a8d91',
                fontSize: `${STYLES.font_size_normal}px`,
                padding: '40px 0'
              }}>
                "HTML 생성" 버튼을 클릭하면 미리보기가 표시됩니다
              </div>
            )}
          </div>

          {/* HTML 코드 */}
          {generatedHTML && (
            <ModernSection title="📝 생성된 HTML 코드">
              <ModernFormGroup>
                <textarea
                  value={generatedHTML}
                  readOnly
                  style={{
                    width: '100%',
                    height: '200px',
                    padding: '12px',
                    border: `1px solid ${STYLES.border}`,
                    borderRadius: `${STYLES.radius_normal}px`,
                    backgroundColor: isDarkMode ? '#3a3b3c' : '#f8f9fa',
                    color: isDarkMode ? '#e4e6eb' : STYLES.text,
                    fontSize: `${STYLES.font_size_small}px`,
                    fontFamily: 'Monaco, Consolas, monospace',
                    resize: 'vertical',
                    outline: 'none'
                  }}
                />
              </ModernFormGroup>
            </ModernSection>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookmarkletFormLayout; 