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

  // RisuAI 클립보드 데이터에서 번역된 텍스트 추출 함수
  const extractTranslatedTextFromRisuAI = (htmlContent: string): string | null => {
    try {
      console.log('🔍 RisuAI HTML 감지 시도:', htmlContent.substring(0, 200) + '...');
      
      // 1. 먼저 "From RisuAI" 텍스트가 있는지 확인
      if (!htmlContent.includes('From RisuAI')) {
        console.log('❌ "From RisuAI" 텍스트를 찾을 수 없음');
        return null;
      }
      
      console.log('✅ "From RisuAI" 텍스트 발견');
      
      // 2. HTML 파싱
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      
      // 3. 생각의 사슬 부분 제거 (details 태그 내용 제거)
      const thoughtsElements = doc.querySelectorAll('details');
      thoughtsElements.forEach(element => {
        const summary = element.querySelector('summary');
        if (summary && summary.textContent?.includes('생각의 사슬')) {
          console.log('🧠 생각의 사슬 부분 발견 및 제거');
          element.remove();
        }
      });
      
      // 4. 불필요한 요소들 제거
      const elementsToRemove = [
        'button', // 버튼들 (🪺🔮📋🗑️)
        'img[alt="from RisuAI"]', // RisuAI 이미지들
        'span[style*="font-size: 0.75rem"]' // "From RisuAI" 텍스트
      ];
      
      elementsToRemove.forEach(selector => {
        const elements = doc.querySelectorAll(selector);
        elements.forEach(el => el.remove());
      });
      
      // 5. 메인 컨텐츠 영역 찾기 (번역된 텍스트가 있는 부분)
      const contentDiv = doc.querySelector('div[style*="padding-left: 1rem"]') || doc.body;
      
      if (!contentDiv) {
        console.log('❌ 컨텐츠 영역을 찾을 수 없음');
        return null;
      }
      
      // 6. HTML 엔티티 디코딩 함수
      const decodeHtmlEntities = (text: string): string => {
        return text
          .replace(/&ldquo;/g, '"').replace(/&rdquo;/g, '"')
          .replace(/&lsquo;/g, "'").replace(/&rsquo;/g, "'")
          .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
          .replace(/&hellip;/g, '…')
          .replace(/&ndash;/g, '–').replace(/&mdash;/g, '—')
          .replace(/&amp;/g, '&'); // &는 마지막에 처리
      };
      
      // 7. 색상별 div 요소들을 먼저 수집
      const orangeQuotes: string[] = [];
      const blueQuotes: string[] = [];
      
      // 주황색 div들 (큰따옴표 대사)
      const orangeDivs = contentDiv.querySelectorAll('div[style*="color: #FFB86C"]');
      orangeDivs.forEach(div => {
        let text = div.textContent?.trim() || '';
        if (text) {
          // HTML 엔티티 디코딩
          text = decodeHtmlEntities(text);
          // 기존 따옴표 제거
          text = text.replace(/^[""]/, '').replace(/[""]$/, '');
          text = text.replace(/^"/, '').replace(/"$/, '');
          // 새로운 따옴표 추가
          orangeQuotes.push('"' + text + '"');
        }
      });
      
      // 파란색 div들 (작은따옴표 대사)
      const blueDivs = contentDiv.querySelectorAll('div[style*="color: #8BE9FD"]');
      blueDivs.forEach(div => {
        let text = div.textContent?.trim() || '';
        if (text) {
          // HTML 엔티티 디코딩
          text = decodeHtmlEntities(text);
          // 기존 따옴표 제거
          text = text.replace(/^['']/, '').replace(/['']$/, '');
          text = text.replace(/^'/, '').replace(/'$/, '');
          // 새로운 따옴표 추가
          blueQuotes.push("'" + text + "'");
        }
      });
      
      console.log('🟠 주황색 대사들:', orangeQuotes);
      console.log('🔵 파란색 대사들:', blueQuotes);
      
      // 8. 색상 div들을 제거한 후 나머지 텍스트 추출
      orangeDivs.forEach(div => div.remove());
      blueDivs.forEach(div => div.remove());
      
      // 9. 나머지 텍스트 추출 (일반 텍스트, 제목, 이탤릭 등)
      let mainText = '';
      
      const extractPlainText = (element: Element): string => {
        let result = '';
        
        for (const node of Array.from(element.childNodes)) {
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent?.trim();
            if (text) {
              result += ' ' + text;
            }
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as Element;
            const tagName = el.tagName.toLowerCase();
            const style = el.getAttribute('style') || '';
            
            // 제목 태그들
            if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
              const text = el.textContent?.trim();
              if (text) {
                result += '\n\n## ' + text;
              }
            }
            // 문단 태그들
            else if (tagName === 'p' || tagName === 'div') {
              const text = extractPlainText(el);
              if (text.trim()) {
                result += '\n\n' + text.trim();
              }
            }
            // 줄바꿈
            else if (tagName === 'br') {
              result += '\n';
            }
            // 이탤릭
            else if (tagName === 'em' || style.includes('font-style: italic')) {
              const text = el.textContent?.trim();
              if (text) {
                result += '<span style="color: rgb(241, 250, 140); font-style: italic;">' + text + '</span>';
              }
            }
            // 볼드
            else if (tagName === 'strong' || style.includes('font-weight: bold')) {
              const text = el.textContent?.trim();
              if (text) {
                result += '**' + text + '**';
              }
            }
            // 기타 인라인 요소들
            else {
              const text = extractPlainText(el);
              if (text.trim()) {
                result += text;
              }
            }
          }
        }
        
        return result;
      };
      
      mainText = extractPlainText(contentDiv);
      
      // 10. HTML 엔티티 디코딩
      mainText = decodeHtmlEntities(mainText);
      
      // 11. 텍스트 정리
      mainText = mainText
        // 메타데이터 제거
        .replace(/\[\s*🥂[^\]]*\]/g, '') // 상태 텍스트
        .replace(/From RisuAI/g, '') // "From RisuAI" 텍스트
        .replace(/🪺|🔮|📋|🗑️/g, '') // 버튼 이모지들
        .replace(/Trendy Image Box/g, '') // 이미지 박스 텍스트
        
        // 생각의 사슬 관련 내용 제거
        .replace(/생각의 사슬[\s\S]*?(?=반응|제\d+장|##|$)/gi, '')
        .replace(/The user wants[\s\S]*?(?=반응|제\d+장|##|$)/gi, '')
        .replace(/Analysis of Source Text:[\s\S]*?(?=반응|제\d+장|##|$)/gi, '')
        .replace(/Translation Strategy:[\s\S]*?(?=반응|제\d+장|##|$)/gi, '')
        .replace(/Pre-computation[\s\S]*?(?=반응|제\d+장|##|$)/gi, '')
        .replace(/Drafting Translation[\s\S]*?(?=반응|제\d+장|##|$)/gi, '')
        .replace(/Refining the Translation[\s\S]*?(?=반응|제\d+장|##|$)/gi, '')
        .replace(/Confidence Score[\s\S]*?(?=반응|제\d+장|##|$)/gi, '')
        
        // 영어 분석 섹션들 제거
        .replace(/Characters:[\s\S]*?(?=반응|제\d+장|##|$)/gi, '')
        .replace(/Setting:[\s\S]*?(?=반응|제\d+장|##|$)/gi, '')
        .replace(/Plot:[\s\S]*?(?=반응|제\d+장|##|$)/gi, '')
        .replace(/Tone:[\s\S]*?(?=반응|제\d+장|##|$)/gi, '')
        .replace(/Key Phrases[\s\S]*?(?=반응|제\d+장|##|$)/gi, '')
        .replace(/Mature Content[\s\S]*?(?=반응|제\d+장|##|$)/gi, '')
        .replace(/Formatting:[\s\S]*?(?=반응|제\d+장|##|$)/gi, '')
        
        // 줄바꿈 정리
        .replace(/\n{3,}/g, '\n\n') // 3개 이상의 연속 줄바꿈을 2개로
        .replace(/^\s*\n+/, '') // 시작 부분의 빈 줄 제거
        .replace(/\n+\s*$/, '') // 끝 부분의 빈 줄 제거
        .trim();
      
      // 12. 최종 텍스트 조합 (순서대로 배치)
      const textParts: string[] = [];
      const lines = mainText.split('\n');
      let quoteIndex = 0;
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) {
          textParts.push(''); // 빈 줄 유지
          continue;
        }
        
        // 한글이 포함된 라인만 유지
        const hasKorean = /[가-힣]/.test(trimmedLine);
        const isStructural = trimmedLine.startsWith('##') || trimmedLine.startsWith('#'); // 제목
        const isEmphasis = trimmedLine.includes('<span') || trimmedLine.includes('**'); // 강조
        
        if (hasKorean || isStructural || isEmphasis) {
          textParts.push(trimmedLine);
          
          // 문단 끝에서 대사 삽입 (순서대로)
          if (quoteIndex < orangeQuotes.length) {
            textParts.push('');
            textParts.push(orangeQuotes[quoteIndex]);
            quoteIndex++;
          }
        }
      }
      
      // 남은 대사들 추가
      while (quoteIndex < orangeQuotes.length) {
        textParts.push('');
        textParts.push(orangeQuotes[quoteIndex]);
        quoteIndex++;
      }
      
      // 파란색 대사들도 추가
      blueQuotes.forEach(quote => {
        textParts.push('');
        textParts.push(quote);
      });
      
      let finalText = textParts.join('\n');
      
      // 13. 마지막 정리
      finalText = finalText
        .replace(/\n{3,}/g, '\n\n') // 연속 줄바꿈 정리
        .trim();
      
      console.log('✨ 최종 포맷팅된 텍스트:', finalText.substring(0, 300) + '...');
      console.log('📏 최종 텍스트 길이:', finalText.length);
      
      // 빈 텍스트가 아니면 반환
      return finalText.length > 10 ? finalText : null;
    } catch (error) {
      console.error('❌ RisuAI 텍스트 추출 중 오류:', error);
      return null;
    }
  };

  // 클립보드 paste 이벤트 핸들러
  const handlePaste = useCallback(async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    try {
      // 클립보드에서 모든 데이터 타입 확인
      const clipboardData = e.clipboardData;
      const htmlData = clipboardData.getData('text/html');
      const plainData = clipboardData.getData('text/plain');
      
      console.log('📋 클립보드 데이터 확인:');
      console.log('- HTML 데이터 길이:', htmlData?.length || 0);
      console.log('- Plain 데이터 길이:', plainData?.length || 0);
      console.log('- HTML 데이터 미리보기:', htmlData?.substring(0, 300) + '...');
      
      if (htmlData && htmlData.length > 0) {
        console.log('🔍 HTML 데이터 발견, RisuAI 텍스트 추출 시도...');
        
        // RisuAI에서 복사된 번역 텍스트 추출 시도
        const translatedText = extractTranslatedTextFromRisuAI(htmlData);
        
        if (translatedText) {
          console.log('✅ 번역 텍스트 추출 성공!');
          
          // 기본 paste 동작 방지
          e.preventDefault();
          
          // 번역된 텍스트를 텍스트 영역에 삽입
          const textarea = e.target as HTMLTextAreaElement;
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const currentValue = textarea.value;
          
          const newValue = currentValue.substring(0, start) + translatedText + currentValue.substring(end);
          
          // 상태 업데이트
          onConfigChange({ content: newValue });
          addToHistory(newValue);
          
          // 커서 위치 조정
          setTimeout(() => {
            const newCursorPos = start + translatedText.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
            textarea.focus();
          }, 0);
          
          return;
        } else {
          console.log('❌ RisuAI 텍스트 추출 실패, 기본 paste 동작 허용');
        }
      } else {
        console.log('❌ HTML 데이터 없음, 기본 paste 동작 허용');
      }
      
      // RisuAI 데이터가 아니면 기본 paste 동작 허용
      console.log('📝 기본 paste 동작 실행');
    } catch (error) {
      console.error('❌ 클립보드 처리 중 오류:', error);
      // 오류 발생 시 기본 paste 동작 허용
    }
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
                onPaste={handlePaste}
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
              <ModernHint>
                <p>💡 <strong>RisuAI 번역 지원:</strong> RisuAI에서 번역 버튼(🌐)을 누른 후 복사 버튼(📋)을 클릭하여 복사한 내용을 여기에 붙여넣으면 번역된 한국어 텍스트만 자동으로 추출됩니다!</p>
                <p>🔧 <strong>자동 정리:</strong> CSS 코드, 영어 원문, 메타데이터 등은 자동으로 제거되고 순수한 번역 텍스트만 남습니다.</p>
              </ModernHint>
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