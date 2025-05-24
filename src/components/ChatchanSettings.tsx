import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  
  const [textHistory, setTextHistory] = useState<TextHistory[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [localGeneratedHTML, setLocalGeneratedHTML] = useState<string>('');

  // ChatchanGeneratorV2 훅 사용
  const { generateHTML } = useChatchanGeneratorV2(config);

  // HTML 생성 함수
  const handleGenerateHTML = () => {
    if (!config.content.trim()) {
      alert('먼저 채팅 내용을 입력해주세요.');
      return;
    }
    
    const html = generateHTML();
    setLocalGeneratedHTML(html);
  };

  // 시스템 테마 감지 및 UI 테마 자동 설정
  useEffect(() => {
    const handleChange = (e: MediaQueryListEvent) => {
      // UI는 시스템 테마를 따라가고, HTML 출력 테마는 별도로 관리
    };

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

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

  // 테마별 색상 적용
  const applyColorTheme = (theme: string) => {
    const themes = {
      'light': {
        backgroundColor: '#f8f9fa',
        textColor: '#4a4a4a',
        highlightColor: '#fff5f5',
        promptColor: '#e2e8f0',
        emphasisColor: '#feb2b2'
      },
      'dark': {
        backgroundColor: '#2d3748',
        textColor: '#e2e8f0',
        highlightColor: '#4a5568',
        promptColor: '#5a5a5a',
        emphasisColor: '#fc8181'
      },
      'blue': {
        backgroundColor: '#bee3f8',
        textColor: '#2c5282',
        highlightColor: '#ebf8ff',
        promptColor: '#90cdf4',
        emphasisColor: '#3182ce'
      }
    };
    
    const themeColors = themes[theme as keyof typeof themes] || themes.light;
    onConfigChange({ outputTheme: theme, ...themeColors });
  };

  // 예제 불러오기
  const loadExample = () => {
    const exampleContent = `[해설] 천재 개발자가 프로젝트를 완성시키고 있었다.

"이제 거의 다 끝났어!" **정말 완벽해!**

[AI] 사용자님의 요구사항을 ===모두 반영=== 했습니다.

~~드디어 완성이군요~~ *후후후...*

[USER] 와우, 정말 멋지네요! 이거 진짜 ***완벽합니다***!`;
    
    onConfigChange({ content: exampleContent });
  };

  // 단어 교환 기능
  const addWordReplacement = () => {
    const newReplacements = [...config.wordReplacements, { from: '', to: '' }];
    onConfigChange({ wordReplacements: newReplacements });
  };

  const updateWordReplacement = (index: number, field: 'from' | 'to', value: string) => {
    const newReplacements = [...config.wordReplacements];
    newReplacements[index][field] = value;
    onConfigChange({ wordReplacements: newReplacements });
  };

  const removeWordReplacement = (index: number) => {
    const newReplacements = config.wordReplacements.filter((_, i) => i !== index);
    onConfigChange({ wordReplacements: newReplacements });
  };

  return (
    <div className="chatchan-container">
      <style jsx>{`
        .chatchan-container {
          display: flex;
          min-height: 100vh;
          background: #f0f2f5;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }

        .chatchan-layout {
          display: flex;
          width: 100%;
        }

        .chatchan-settings {
          flex: 0 0 800px;
          background: white;
          border-right: 1px solid #e0e0e0;
          padding: 24px;
          overflow-y: auto;
          max-height: 100vh;
        }

        .chatchan-preview {
          flex: 1;
          background: white;
          padding: 24px;
          overflow-y: auto;
          max-height: 100vh;
        }

        .settings-header {
          text-align: center;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 2px solid #f0f2f5;
        }

        .settings-header h1 {
          color: #1a1a1a;
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 8px 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .settings-header p {
          color: #666;
          font-size: 14px;
          margin: 0;
        }

        .settings-group {
          background: #fafbfc;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          border: 1px solid #e8eaed;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .group-title {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin: 0 0 20px 0;
          padding-bottom: 12px;
          border-bottom: 2px solid #f0f2f5;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .form-grid {
          display: grid;
          gap: 16px;
        }

        .form-row {
          display: flex;
          gap: 16px;
          align-items: end;
        }

        .form-row label {
          display: block;
          font-weight: 500;
          color: #444;
          margin-bottom: 6px;
          font-size: 14px;
        }

        .modern-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e8eaed;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
          background: white;
        }

        .modern-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .modern-select {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e8eaed;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          background: white;
          transition: all 0.2s ease;
        }

        .modern-select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .modern-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          padding: 8px;
          border-radius: 6px;
          transition: background-color 0.2s ease;
        }

        .modern-checkbox:hover {
          background-color: rgba(102, 126, 234, 0.05);
        }

        .modern-checkbox input[type="checkbox"] {
          width: 18px;
          height: 18px;
          accent-color: #667eea;
        }

        .modern-checkbox label {
          font-size: 14px;
          font-weight: 500;
          color: #444;
          margin: 0;
          cursor: pointer;
        }

        .modern-color-input {
          width: 50px;
          height: 50px;
          border: 2px solid #e8eaed;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .modern-color-input:hover {
          border-color: #667eea;
          transform: scale(1.05);
        }

        .color-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 16px;
        }

        .color-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .color-item label {
          font-size: 12px;
          font-weight: 500;
          color: #666;
          text-align: center;
        }

        .theme-presets {
          display: flex;
          gap: 8px;
          margin-top: 16px;
          flex-wrap: wrap;
        }

        .theme-preset {
          padding: 8px 16px;
          border: 2px solid #e8eaed;
          border-radius: 6px;
          background: white;
          color: #444;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .theme-preset:hover {
          border-color: #667eea;
          background: #667eea;
          color: white;
        }

        .theme-preset.light {
          background: #f8f9fa;
          border-color: #dee2e6;
        }

        .theme-preset.dark {
          background: #343a40;
          color: white;
          border-color: #495057;
        }

        .theme-preset.blue {
          background: #e3f2fd;
          border-color: #90caf9;
          color: #1565c0;
        }

        .word-replacements {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .word-replacement-item {
          display: flex;
          gap: 12px;
          align-items: center;
          padding: 12px;
          background: white;
          border: 1px solid #e8eaed;
          border-radius: 8px;
        }

        .word-replacement-item input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #e8eaed;
          border-radius: 6px;
          font-size: 14px;
        }

        .word-replacement-item .arrow {
          color: #666;
          font-weight: bold;
        }

        .add-word-btn {
          padding: 8px 16px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .add-word-btn:hover {
          background: #5a6fd8;
        }

        .remove-btn {
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .remove-btn:hover {
          background: #c82333;
        }

        .checkbox-grid {
          display: grid;
          gap: 12px;
        }

        .markdown-toolbar {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 16px;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e8eaed;
        }

        .toolbar-section {
          display: flex;
          gap: 4px;
          padding-right: 12px;
          border-right: 1px solid #dee2e6;
        }

        .toolbar-section:last-child {
          border-right: none;
          padding-right: 0;
        }

        .toolbar-btn {
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          padding: 6px 10px;
          font-size: 12px;
          font-weight: 600;
          color: #495057;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .toolbar-btn:hover {
          background: #e9ecef;
          border-color: #adb5bd;
        }

        .toolbar-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .toolbar-btn.highlight {
          background: #fff3cd;
          border-color: #ffeaa7;
          color: #856404;
        }

        .toolbar-btn.emphasis {
          background: #f8d7da;
          border-color: #f5c6cb;
          color: #721c24;
        }

        .toolbar-btn.prefix {
          font-size: 14px;
        }

        .modern-textarea {
          width: 100%;
          min-height: 200px;
          padding: 16px;
          border: 2px solid #e8eaed;
          border-radius: 8px;
          font-size: 14px;
          line-height: 1.6;
          font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
          resize: vertical;
          transition: all 0.2s ease;
        }

        .modern-textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .modern-range {
          width: 100%;
          margin: 8px 0;
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          border-radius: 3px;
          background: #e8eaed;
          outline: none;
        }

        .modern-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #667eea;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }

        .modern-range::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #667eea;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }

        .section-actions {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }

        .add-section-btn {
          padding: 8px 16px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .add-section-btn:hover {
          background: #218838;
        }

        .example-btn {
          padding: 8px 16px;
          background: #17a2b8;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .example-btn:hover {
          background: #138496;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 2px solid #f0f2f5;
          justify-content: center;
        }

        .primary-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 14px 24px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .primary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
        }

        .secondary-btn {
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 14px 24px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .secondary-btn:hover {
          background: #5a6268;
          transform: translateY(-1px);
        }

        .danger-btn {
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 14px 24px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .danger-btn:hover {
          background: #c82333;
          transform: translateY(-1px);
        }

        .preview-header {
          text-align: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #f0f2f5;
        }

        .preview-header h3 {
          color: #1a1a1a;
          font-size: 22px;
          font-weight: 600;
          margin: 0;
        }

        .preview-content {
          background: #fafbfc;
          border-radius: 12px;
          padding: 24px;
          min-height: 400px;
          border: 1px solid #e8eaed;
        }

        .preview-frame {
          background: white;
          border-radius: 8px;
          padding: 16px;
          min-height: 300px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 1200px) {
          .chatchan-layout {
            flex-direction: column;
          }
          
          .chatchan-settings {
            flex: none;
            border-right: none;
            border-bottom: 1px solid #e0e0e0;
            max-height: none;
          }
          
          .chatchan-preview {
            flex: none;
            max-height: none;
          }
        }
      `}</style>

      <div className="chatchan-layout">
        {/* 좌측 설정 패널 */}
        <div className="chatchan-settings">
          <div className="settings-header">
            <h1>🎨 챗챤 로그 제조기</h1>
            <p>아름다운 채팅 로그를 만들어보세요</p>
          </div>

          {/* 캐릭터 정보 섹션 */}
          <div className="settings-group">
            <h3 className="group-title">📝 캐릭터 정보</h3>
            <div className="form-grid">
              <div className="form-row">
                <label>캐릭터 이름</label>
                <input
                  type="text"
                  value={config.characterName}
                  onChange={(e) => onConfigChange({ characterName: e.target.value })}
                  className="modern-input"
                  placeholder="캐릭터 이름을 입력하세요"
                />
              </div>
              
              <div className="form-row">
                <label>사용자 이름</label>
                <input
                  type="text"
                  value={config.userName}
                  onChange={(e) => onConfigChange({ userName: e.target.value })}
                  className="modern-input"
                  placeholder="사용자 이름을 입력하세요"
                />
              </div>
              
              <div className="form-row">
                <label>챗챤 번호</label>
                <input
                  type="text"
                  value={config.chatNumber}
                  onChange={(e) => onConfigChange({ chatNumber: e.target.value })}
                  className="modern-input"
                  placeholder="챗챤 번호를 입력하세요"
                />
              </div>

              <div className="form-row">
                <label>캐릭터 이미지 URL</label>
                <div className="image-url-container">
                  <input
                    type="text"
                    value={config.characterImageUrl}
                    onChange={(e) => onConfigChange({ characterImageUrl: e.target.value })}
                    className="modern-input"
                    placeholder="https://... 또는 HTML img 태그"
                  />
                  <label className="modern-checkbox-inline">
                    <input
                      type="checkbox"
                      checked={config.useCharacterImage}
                      onChange={(e) => onConfigChange({ useCharacterImage: e.target.checked })}
                    />
                    <span>이미지 사용</span>
                  </label>
                </div>
              </div>

              <div className="form-row">
                <label>모델 이름</label>
                <input
                  type="text"
                  value={config.modelName}
                  onChange={(e) => onConfigChange({ modelName: e.target.value })}
                  className="modern-input"
                  placeholder="AI 모델명"
                />
              </div>
              
              <div className="form-row">
                <label>프롬프트 이름</label>
                <input
                  type="text"
                  value={config.promptName}
                  onChange={(e) => onConfigChange({ promptName: e.target.value })}
                  className="modern-input"
                  placeholder="프롬프트명"
                />
              </div>

              <div className="form-row">
                <label>번역 모델</label>
                <input
                  type="text"
                  value={config.assistModelName}
                  onChange={(e) => onConfigChange({ assistModelName: e.target.value })}
                  className="modern-input"
                  placeholder="번역 모델명"
                />
              </div>
            </div>
          </div>

          {/* 테마 및 출력 설정 */}
          <div className="settings-group">
            <h3 className="group-title">🎨 테마 및 출력 설정</h3>
            <div className="form-grid">
              <div className="form-row">
                <label>HTML 출력 테마</label>
                <select
                  value={config.outputTheme}
                  onChange={(e) => onConfigChange({ outputTheme: e.target.value })}
                  className="modern-select"
                >
                  <option value="light">라이트 테마</option>
                  <option value="dark">다크 테마</option>
                  <option value="blue">블루 테마</option>
                  <option value="custom">커스텀</option>
                </select>
              </div>

              <div className="theme-presets">
                <button onClick={() => applyColorTheme('light')} className="theme-preset light">라이트</button>
                <button onClick={() => applyColorTheme('dark')} className="theme-preset dark">다크</button>
                <button onClick={() => applyColorTheme('blue')} className="theme-preset blue">블루</button>
              </div>
            </div>
          </div>

          {/* 색상 설정 */}
          <div className="settings-group">
            <h3 className="group-title">🌈 색상 설정</h3>
            <div className="color-grid">
              <div className="color-item">
                <label>배경색</label>
                <input
                  type="color"
                  value={config.backgroundColor}
                  onChange={(e) => onConfigChange({ backgroundColor: e.target.value })}
                  className="modern-color-input"
                />
              </div>
              
              <div className="color-item">
                <label>텍스트색</label>
                <input
                  type="color"
                  value={config.textColor}
                  onChange={(e) => onConfigChange({ textColor: e.target.value })}
                  className="modern-color-input"
                />
              </div>
              
              <div className="color-item">
                <label>하이라이트색</label>
                <input
                  type="color"
                  value={config.highlightColor}
                  onChange={(e) => onConfigChange({ highlightColor: e.target.value })}
                  className="modern-color-input"
                />
              </div>
              
              <div className="color-item">
                <label>프롬프트색</label>
                <input
                  type="color"
                  value={config.promptColor}
                  onChange={(e) => onConfigChange({ promptColor: e.target.value })}
                  className="modern-color-input"
                />
              </div>
              
              <div className="color-item">
                <label>강조색</label>
                <input
                  type="color"
                  value={config.emphasisColor}
                  onChange={(e) => onConfigChange({ emphasisColor: e.target.value })}
                  className="modern-color-input"
                />
              </div>
            </div>
          </div>

          {/* 스타일 설정 */}
          <div className="settings-group">
            <h3 className="group-title">📏 스타일 설정</h3>
            <div className="form-grid">
              <div className="form-row">
                <div style={{ flex: 1 }}>
                  <label>기본 폰트</label>
                  <input
                    type="range"
                    min="10"
                    max="24"
                    value={config.baseFontSize}
                    onChange={(e) => onConfigChange({ baseFontSize: parseInt(e.target.value) })}
                    className="modern-range"
                  />
                  <span>{config.baseFontSize}px</span>
                </div>
                
                <div style={{ flex: 1 }}>
                  <label>제목 폰트</label>
                  <input
                    type="range"
                    min="12"
                    max="28"
                    value={config.titleFontSize}
                    onChange={(e) => onConfigChange({ titleFontSize: parseInt(e.target.value) })}
                    className="modern-range"
                  />
                  <span>{config.titleFontSize}px</span>
                </div>
              </div>
              
              <div className="form-row">
                <div style={{ flex: 1 }}>
                  <label>컨테이너 폭</label>
                  <input
                    type="range"
                    min="400"
                    max="1200"
                    value={config.containerWidth}
                    onChange={(e) => onConfigChange({ containerWidth: parseInt(e.target.value) })}
                    className="modern-range"
                  />
                  <span>{config.containerWidth}px</span>
                </div>
                
                <div style={{ flex: 1 }}>
                  <label>모서리 둥글기</label>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={config.logSectionRadius}
                    onChange={(e) => onConfigChange({ logSectionRadius: parseInt(e.target.value) })}
                    className="modern-range"
                  />
                  <span>{config.logSectionRadius}px</span>
                </div>
              </div>
              
              <div className="form-row">
                <div style={{ flex: 1 }}>
                  <label>줄 간격</label>
                  <input
                    type="range"
                    min="1.0"
                    max="3.0"
                    step="0.1"
                    value={config.lineHeight}
                    onChange={(e) => onConfigChange({ lineHeight: parseFloat(e.target.value) })}
                    className="modern-range"
                  />
                  <span>{config.lineHeight}</span>
                </div>
                
                <div style={{ flex: 1 }}>
                  <label>글자 간격</label>
                  <input
                    type="range"
                    min="-2"
                    max="5"
                    step="0.1"
                    value={config.letterSpacing}
                    onChange={(e) => onConfigChange({ letterSpacing: parseFloat(e.target.value) })}
                    className="modern-range"
                  />
                  <span>{config.letterSpacing}px</span>
                </div>
              </div>
            </div>
          </div>

          {/* 단어 교환 설정 */}
          <div className="settings-group">
            <h3 className="group-title">🔄 단어 교환</h3>
            <div className="word-replacements">
              {config.wordReplacements.map((replacement, index) => (
                <div key={index} className="word-replacement-item">
                  <input
                    type="text"
                    value={replacement.from}
                    onChange={(e) => updateWordReplacement(index, 'from', e.target.value)}
                    placeholder="변환할 단어"
                    className="modern-input small"
                  />
                  <span className="arrow">→</span>
                  <input
                    type="text"
                    value={replacement.to}
                    onChange={(e) => updateWordReplacement(index, 'to', e.target.value)}
                    placeholder="변환될 단어"
                    className="modern-input small"
                  />
                  <button
                    onClick={() => removeWordReplacement(index)}
                    className="remove-btn"
                    title="삭제"
                  >
                    ✕
                  </button>
                </div>
              ))}
              
              <button onClick={addWordReplacement} className="add-word-btn">
                + 단어 교환 추가
              </button>
            </div>
          </div>

          {/* 고급 옵션 */}
          <div className="settings-group">
            <h3 className="group-title">⚙️ 고급 옵션</h3>
            <div className="checkbox-grid">
              <label className="modern-checkbox">
                <input
                  type="checkbox"
                  checked={config.isAutoInputMode}
                  onChange={(e) => onConfigChange({ isAutoInputMode: e.target.checked })}
                />
                <span>딸깍모드 (자동 텍스트 효과)</span>
              </label>
              
              <label className="modern-checkbox">
                <input
                  type="checkbox"
                  checked={config.italicizeNarration}
                  onChange={(e) => onConfigChange({ italicizeNarration: e.target.checked })}
                />
                <span>해설 이탤릭체</span>
              </label>
              
              <label className="modern-checkbox">
                <input
                  type="checkbox"
                  checked={config.simpleOutputMode}
                  onChange={(e) => onConfigChange({ simpleOutputMode: e.target.checked })}
                />
                <span>간단 출력 모드</span>
              </label>
              
              <label className="modern-checkbox">
                <input
                  type="checkbox"
                  checked={config.dialogueUseBubble}
                  onChange={(e) => onConfigChange({ dialogueUseBubble: e.target.checked })}
                />
                <span>대화 말풍선 사용</span>
              </label>
            
              <label className="modern-checkbox">
                <input
                  type="checkbox"
                  checked={config.narrationUseLine}
                  onChange={(e) => onConfigChange({ narrationUseLine: e.target.checked })}
                />
                <span>해설 라인 사용</span>
              </label>
              
              <label className="modern-checkbox">
                <input
                  type="checkbox"
                  checked={config.showBriefHeaderInfo}
                  onChange={(e) => onConfigChange({ showBriefHeaderInfo: e.target.checked })}
                />
                <span>간략 헤더 정보</span>
              </label>
            </div>
          </div>

          {/* 채팅 입력 섹션 */}
          <div className="settings-group">
            <h3 className="group-title">💬 채팅 입력</h3>
            
            {/* 마크다운 툴바 */}
            <div className="markdown-toolbar">
              <div className="toolbar-section">
                <button
                  onClick={() => textareaRef.current && applyMarkdown(textareaRef.current, 'bold')}
                  className="toolbar-btn"
                  title="굵게"
                >
                  <strong>B</strong>
                </button>
                
                <button
                  onClick={() => textareaRef.current && applyMarkdown(textareaRef.current, 'italic')}
                  className="toolbar-btn"
                  title="기울임"
                >
                  <em>I</em>
                </button>
                
                <button
                  onClick={() => textareaRef.current && applyMarkdown(textareaRef.current, 'bolditalic')}
                  className="toolbar-btn"
                  title="굵은 기울임"
                >
                  <strong><em>BI</em></strong>
                </button>
                
                <button
                  onClick={() => textareaRef.current && applyMarkdown(textareaRef.current, 'highlight')}
                  className="toolbar-btn highlight"
                  title="하이라이트"
                >
                  H
                </button>
                
                <button
                  onClick={() => textareaRef.current && applyMarkdown(textareaRef.current, 'emphasis')}
                  className="toolbar-btn emphasis"
                  title="강조"
                >
                  E
                </button>
              </div>
              
              <div className="toolbar-section">
                <button onClick={undoHistory} className="toolbar-btn" title="실행취소" disabled={historyIndex <= 0}>
                  ←
                </button>
                
                <button onClick={redoHistory} className="toolbar-btn" title="다시실행" disabled={historyIndex >= textHistory.length - 1}>
                  →
                </button>
              </div>
              
              <div className="toolbar-section">
                <button
                  onClick={() => textareaRef.current && applyPrefix(textareaRef.current, '해설')}
                  className="toolbar-btn prefix"
                  title="해설"
                >
                  📖
                </button>
                
                <button
                  onClick={() => textareaRef.current && applyPrefix(textareaRef.current, 'AI')}
                  className="toolbar-btn prefix"
                  title="AI"
                >
                  🤖
                </button>
                
                <button
                  onClick={() => textareaRef.current && applyPrefix(textareaRef.current, 'USER')}
                  className="toolbar-btn prefix"
                  title="사용자"
                >
                  👤
                </button>
              </div>
            </div>
            
            <textarea
              ref={textareaRef}
              value={config.content}
              onChange={(e) => onConfigChange({ content: e.target.value })}
              className="modern-textarea"
              placeholder="채팅 내용을 입력하세요..."
              rows={8}
            />
            
            <div className="section-actions">
              <button onClick={loadExample} className="example-btn">
                📄 예제 불러오기
              </button>
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className="action-buttons">
            <button className="primary-btn" onClick={handleGenerateHTML}>
              🚀 HTML 생성하기
            </button>
            
            <button onClick={onCopyHTML} className="secondary-btn">
              📋 HTML 복사하기
            </button>
            
            <button onClick={onReset} className="danger-btn">
              🔄 전체 초기화
            </button>
          </div>
        </div>

        {/* 우측 미리보기 패널 */}
        <div className="chatchan-preview">
          <div className="preview-header">
            <h3>👀 실시간 미리보기</h3>
          </div>
          
          <div className="preview-content">
            <div 
              className="preview-frame"
              dangerouslySetInnerHTML={{ __html: localGeneratedHTML || '<p>HTML을 생성하면 여기에 미리보기가 표시됩니다.</p>' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatchanSettings; 