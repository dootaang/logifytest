import React, { useState, useEffect } from 'react';

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
}

interface ChatchanSettingsProps {
  config: ChatchanConfig;
  onConfigChange: (newConfig: Partial<ChatchanConfig>) => void;
  onCopyHTML: () => void;
  onReset: () => void;
}

const ChatchanSettings: React.FC<ChatchanSettingsProps> = ({
  config,
  onConfigChange,
  onCopyHTML,
  onReset
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [chatSections, setChatSections] = useState([config.content || '']);

  // 다크모드 토글
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    onConfigChange({ selectedTheme: newTheme ? 'dark' : 'light' });
  };

  // 채팅 섹션 추가
  const addChatSection = () => {
    setChatSections([...chatSections, '']);
  };

  // 채팅 섹션 제거
  const removeChatSection = (index: number) => {
    if (chatSections.length > 1) {
      const newSections = chatSections.filter((_, i) => i !== index);
      setChatSections(newSections);
      onConfigChange({ content: newSections.join('\n\n') });
    }
  };

  // 채팅 섹션 이동
  const moveChatSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...chatSections];
    if (direction === 'up' && index > 0) {
      [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
    } else if (direction === 'down' && index < newSections.length - 1) {
      [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    }
    setChatSections(newSections);
    onConfigChange({ content: newSections.join('\n\n') });
  };

  // 채팅 섹션 내용 변경
  const updateChatSection = (index: number, value: string) => {
    const newSections = [...chatSections];
    newSections[index] = value;
    setChatSections(newSections);
    onConfigChange({ content: newSections.join('\n\n') });
  };

  // 컬러 테마 적용
  const applyColorTheme = (theme: string) => {
    const themes = {
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

    const selectedTheme = themes[theme as keyof typeof themes];
    if (selectedTheme) {
      onConfigChange({
        highlightColor: selectedTheme.h,
        promptColor: selectedTheme.p,
        emphasisColor: selectedTheme.e
      });
    }
  };

  // 예제 텍스트 로드
  const loadExample = () => {
    const prefixExample = `- 화창한 봄날, 공원에서 우연히 만난 두 사람은 *짧게* 대화를 나누기 시작했다.
USER: 안녕하세요? 오늘 ^날씨^가 어때요?
- AI는 잠시 생각에 잠기더니 환하게 웃으며 대답했다.
AI: 안녕하세요! 오늘 날씨는 맑고 화창합니다. 최고 기온은 $23도$로 예상됩니다. ***야외 활동하기 좋은 날씨네요!***`;

    const autoExample = `화창한 봄날, 공원에서 우연히 만난 두 사람은 *짧게* 대화를 나누기 시작했다.
"안녕하세요? 오늘 ^날씨^가 어때요?"
AI는 잠시 생각에 잠기더니 환하게 웃으며 대답했다.
"안녕하세요! 오늘 날씨는 맑고 화창합니다. 최고 기온은 $23도$로 예상됩니다. ***야외 활동하기 좋은 날씨네요!***"`;

    const example = config.isAutoInputMode ? autoExample : prefixExample;
    setChatSections([example]);
    onConfigChange({ content: example });
  };

  useEffect(() => {
    setIsDarkMode(config.selectedTheme === 'dark');
  }, [config.selectedTheme]);

  return (
    <div className={`chatchan-settings ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      {/* 테마 토글 섹션 */}
      <div className="theme-toggle-section">
        <label className="toggle-switch-label">
          <input 
            type="checkbox" 
            checked={isDarkMode}
            onChange={toggleTheme}
          />
          <span className="toggle-switch-slider"></span>
          <span className="toggle-switch-text">
            {isDarkMode ? '다크 모드' : '라이트 모드'}
          </span>
        </label>
        <button 
          className="danger-button reset-button"
          onClick={onReset}
        >
          전체 초기화
        </button>
      </div>

      {/* 캐릭터 정보 설정 */}
      <details className="section" open>
        <summary>캐릭터 정보 설정</summary>
        <div className="section-content">
          <div className="input-group">
            <div>
              <label>캐릭터 이름</label>
              <input
                type="text"
                value={config.characterName}
                onChange={(e) => onConfigChange({ characterName: e.target.value })}
                placeholder="캐릭터 이름"
              />
            </div>
            <div>
              <label>AI 모델명</label>
              <input
                type="text"
                value={config.modelName}
                onChange={(e) => onConfigChange({ modelName: e.target.value })}
                placeholder="모델명 선택 또는 직접 입력"
                list="modelNameList"
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
          
          <div className="input-group">
            <div>
              <label>프롬프트명</label>
              <input
                type="text"
                value={config.promptName}
                onChange={(e) => onConfigChange({ promptName: e.target.value })}
                placeholder="프롬프트명"
              />
            </div>
            <div>
              <label>보조 모델명</label>
              <input
                type="text"
                value={config.assistModelName}
                onChange={(e) => onConfigChange({ assistModelName: e.target.value })}
                placeholder="보조 모델명 선택 또는 직접 입력"
              />
            </div>
          </div>
          
          <div className="input-group">
            <div>
              <label>유저 이름</label>
              <input
                type="text"
                value={config.userName}
                onChange={(e) => onConfigChange({ userName: e.target.value })}
                placeholder="유저 이름 (기본값: USER)"
              />
            </div>
            <div>
              <label>채팅 번호</label>
              <input
                type="text"
                value={config.chatNumber}
                onChange={(e) => onConfigChange({ chatNumber: e.target.value })}
                placeholder="채팅 번호 (기본값: 랜덤)"
              />
            </div>
          </div>
          
          <div className="input-group">
            <label>캐릭터 이미지 URL (선택)</label>
            <input
              type="text"
              value={config.characterImageUrl}
              onChange={(e) => onConfigChange({ characterImageUrl: e.target.value })}
              placeholder="https://example.com/image.png"
              disabled={!config.useCharacterImage}
            />
          </div>
          
          <div className="input-group align-center">
            <label className="toggle-switch-label small-toggle">
              <input
                type="checkbox"
                checked={!config.useCharacterImage}
                onChange={(e) => onConfigChange({ useCharacterImage: !e.target.checked })}
              />
              <span className="toggle-switch-slider"></span>
              <span className="toggle-switch-text">캐릭터 이미지 사용 안 함</span>
            </label>
          </div>
        </div>
      </details>

      {/* 디자인 및 스타일 설정 */}
      <details className="section">
        <summary>디자인 및 스타일 설정</summary>
        <div className="section-content">
          <div>
            <label>컬러 테마</label>
            <div className="color-theme-buttons">
              <button
                className="theme-btn ocean-blue"
                onClick={() => applyColorTheme('ocean_blue')}
              >
                Ocean
              </button>
              <button
                className="theme-btn forest-green"
                onClick={() => applyColorTheme('forest_green')}
              >
                Forest
              </button>
              <button
                className="theme-btn royal-purple"
                onClick={() => applyColorTheme('royal_purple')}
              >
                Purple
              </button>
              <button
                className="theme-btn sunset-orange"
                onClick={() => applyColorTheme('sunset_orange')}
              >
                Sunset
              </button>
              <button
                className="theme-btn ruby-red"
                onClick={() => applyColorTheme('ruby_red')}
              >
                Ruby
              </button>
              <button
                className="theme-btn teal-green"
                onClick={() => applyColorTheme('teal_green')}
              >
                Teal
              </button>
              <button
                className="theme-btn graphite"
                onClick={() => applyColorTheme('graphite')}
              >
                Graphite
              </button>
              <button
                className="theme-btn indigo-amber"
                onClick={() => applyColorTheme('indigo_amber')}
              >
                Indigo
              </button>
              <button
                className="theme-btn lavender-mint"
                onClick={() => applyColorTheme('lavender_mint')}
              >
                Lavender
              </button>
              <button
                className="theme-btn rose-plum"
                onClick={() => applyColorTheme('rose_plum')}
              >
                Rose
              </button>
            </div>
          </div>

          <div>
            <label>스타일 상세 설정</label>
            <div className="input-group">
              <div>
                <label className="style-config-label">로그 배경 색상</label>
                <div className="color-input-group">
                  <input
                    type="color"
                    value={config.backgroundColor}
                    onChange={(e) => onConfigChange({ backgroundColor: e.target.value })}
                  />
                  <input
                    type="text"
                    value={config.backgroundColor}
                    onChange={(e) => onConfigChange({ backgroundColor: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="style-config-label">로그 글자 색상</label>
                <div className="color-input-group">
                  <input
                    type="color"
                    value={config.textColor}
                    onChange={(e) => onConfigChange({ textColor: e.target.value })}
                  />
                  <input
                    type="text"
                    value={config.textColor}
                    onChange={(e) => onConfigChange({ textColor: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="color-settings-grid">
              <div>
                <label className="style-config-label">하이라이트 색상 1</label>
                <div className="color-input-group">
                  <input
                    type="color"
                    value={config.highlightColor}
                    onChange={(e) => onConfigChange({ highlightColor: e.target.value })}
                  />
                  <input
                    type="text"
                    value={config.highlightColor}
                    onChange={(e) => onConfigChange({ highlightColor: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="style-config-label">하이라이트 색상 2</label>
                <div className="color-input-group">
                  <input
                    type="color"
                    value={config.promptColor}
                    onChange={(e) => onConfigChange({ promptColor: e.target.value })}
                  />
                  <input
                    type="text"
                    value={config.promptColor}
                    onChange={(e) => onConfigChange({ promptColor: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="style-config-label">하이라이트 색상 3</label>
                <div className="color-input-group">
                  <input
                    type="color"
                    value={config.emphasisColor}
                    onChange={(e) => onConfigChange({ emphasisColor: e.target.value })}
                  />
                  <input
                    type="text"
                    value={config.emphasisColor}
                    onChange={(e) => onConfigChange({ emphasisColor: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="input-group" style={{ marginTop: '15px' }}>
              <div>
                <label className="style-config-label">글자 크기 (px)</label>
                <input
                  type="number"
                  value={config.baseFontSize}
                  onChange={(e) => onConfigChange({ baseFontSize: parseInt(e.target.value) })}
                  min="10"
                  max="30"
                />
              </div>
              <div>
                <label className="style-config-label">제목 글자 크기 (px)</label>
                <input
                  type="number"
                  value={config.titleFontSize}
                  onChange={(e) => onConfigChange({ titleFontSize: parseInt(e.target.value) })}
                  min="20"
                  max="60"
                />
              </div>
              <div>
                <label className="style-config-label">컨테이너 너비 (px)</label>
                <input
                  type="number"
                  value={config.containerWidth}
                  onChange={(e) => onConfigChange({ containerWidth: parseInt(e.target.value) })}
                  min="300"
                  max="1500"
                />
              </div>
              <div>
                <label className="style-config-label">로그 섹션 모서리 (px)</label>
                <input
                  type="number"
                  value={config.logSectionRadius}
                  onChange={(e) => onConfigChange({ logSectionRadius: parseInt(e.target.value) })}
                  min="0"
                  max="50"
                />
              </div>
              <div>
                <label className="style-config-label">줄 간격 (배수)</label>
                <input
                  type="number"
                  value={config.lineHeight}
                  onChange={(e) => onConfigChange({ lineHeight: parseFloat(e.target.value) })}
                  min="1"
                  max="3"
                  step="0.1"
                />
              </div>
              <div>
                <label className="style-config-label">자간 (em)</label>
                <input
                  type="number"
                  value={config.letterSpacing}
                  onChange={(e) => onConfigChange({ letterSpacing: parseFloat(e.target.value) })}
                  min="-0.5"
                  max="1"
                  step="0.01"
                />
              </div>
            </div>

            {/* 추가 스타일 및 출력 옵션 */}
            <div className="additional-options-box">
              <label className="style-config-label" style={{ fontWeight: 600, marginBottom: '10px' }}>
                추가 스타일 및 출력 옵션
              </label>
              <div className="toggle-grid">
                <div className="input-group align-center">
                  <label className="toggle-switch-label small-toggle">
                    <input
                      type="checkbox"
                      checked={config.italicizeNarration}
                      onChange={(e) => onConfigChange({ italicizeNarration: e.target.checked })}
                    />
                    <span className="toggle-switch-slider"></span>
                    <span className="toggle-switch-text">나레이션 기울임꼴</span>
                  </label>
                </div>
                <div className="input-group align-center">
                  <label className="toggle-switch-label small-toggle">
                    <input
                      type="checkbox"
                      checked={config.simpleOutputMode}
                      onChange={(e) => onConfigChange({ simpleOutputMode: e.target.checked })}
                    />
                    <span className="toggle-switch-slider"></span>
                    <span className="toggle-switch-text">채팅 로그만 출력</span>
                  </label>
                </div>
                <div className="input-group align-center">
                  <label className="toggle-switch-label small-toggle">
                    <input
                      type="checkbox"
                      checked={config.disableChatLogCollapse}
                      onChange={(e) => onConfigChange({ disableChatLogCollapse: e.target.checked })}
                    />
                    <span className="toggle-switch-slider"></span>
                    <span className="toggle-switch-text">로그 접기 비활성화</span>
                  </label>
                </div>
                <div className="input-group align-center">
                  <label className="toggle-switch-label small-toggle">
                    <input
                      type="checkbox"
                      checked={config.isAutoInputMode}
                      onChange={(e) => onConfigChange({ isAutoInputMode: e.target.checked })}
                    />
                    <span className="toggle-switch-slider"></span>
                    <span className="toggle-switch-text">
                      딸깍 모드
                      <span className="toggle-text-off" style={{ fontWeight: 'bold' }}>
                        {config.isAutoInputMode ? '' : '풀사칭용'}
                      </span>
                      <span className="toggle-text-on" style={{ fontWeight: 'bold' }}>
                        {config.isAutoInputMode ? '사칭방지용' : ''}
                      </span>
                    </span>
                  </label>
                </div>
                <div className="input-group align-center">
                  <label className="toggle-switch-label small-toggle">
                    <input
                      type="checkbox"
                      checked={config.dialogueUseBubble}
                      onChange={(e) => onConfigChange({ dialogueUseBubble: e.target.checked })}
                    />
                    <span className="toggle-switch-slider"></span>
                    <span className="toggle-switch-text">대사에 말풍선 사용</span>
                  </label>
                </div>
                <div className="input-group align-center">
                  <label className="toggle-switch-label small-toggle">
                    <input
                      type="checkbox"
                      checked={config.narrationUseLine}
                      onChange={(e) => onConfigChange({ narrationUseLine: e.target.checked })}
                    />
                    <span className="toggle-switch-slider"></span>
                    <span className="toggle-switch-text">나레이션에 인용선 사용</span>
                  </label>
                </div>
                <div className="input-group align-center">
                  <label className="toggle-switch-label small-toggle">
                    <input
                      type="checkbox"
                      checked={config.showBriefHeaderInfo}
                      onChange={(e) => onConfigChange({ showBriefHeaderInfo: e.target.checked })}
                    />
                    <span className="toggle-switch-slider"></span>
                    <span className="toggle-switch-text">모델 정보 헤더에 표시</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </details>

      {/* 채팅 내용 입력 */}
      <details className="section" open>
        <summary>채팅 내용 입력</summary>
        <div className="section-content">
          <div className="format-guide-container">
            <strong>
              입력 형식 안내 (<span>{config.isAutoInputMode ? '사칭방지용' : '풀사칭용'}</span>)
            </strong>
            {!config.isAutoInputMode && (
              <span style={{ display: 'block' }}>
                - 나레이션: <code>-</code> 또는 <code>*</code> 로 시작<br />
                - 대화: <code>USER:</code> 또는 <code>AI:</code> 로 시작<br />
                - 예: <code>- 조용한 밤.</code><br />
                - 예: <code>USER: 안녕?</code><br />
              </span>
            )}
            {config.isAutoInputMode && (
              <span style={{ display: 'block' }}>
                - 대사: <code>"큰따옴표"</code> 또는 <code>"둥근따옴표"</code> 로 감싸기<br />
                - 나레이션: 따옴표 없이 입력<br />
                - 예: <code>"안녕?"</code><br />
                - 예: <code>USER가 인사했다.</code><br />
              </span>
            )}
            <span>
              - 빈 줄은 무시됩니다.<br />
              <strong>마크다운 강조:</strong><br />
              &nbsp;&nbsp;<code>**굵게**</code> → <strong>굵은 글씨</strong><br />
              &nbsp;&nbsp;<code>*기울임*</code> → <em>이탤릭체</em><br />
              &nbsp;&nbsp;<code>***굵은기울임***</code> → <strong><em>굵은 이탤릭체</em></strong><br />
              &nbsp;&nbsp;<code>^하이라이트^</code> → 
              <span style={{ backgroundColor: config.highlightColor, color: '#ffffff', padding: '0 2px', borderRadius: '3px' }}>
                하이라이트
              </span><br />
              &nbsp;&nbsp;<code>$강조$</code> → 
              <span style={{ backgroundColor: config.emphasisColor, color: '#ffffff', padding: '0 2px', borderRadius: '3px' }}>
                강조
              </span>
            </span>
          </div>

          <div className="chat-sections-container">
            {chatSections.map((section, index) => (
              <div key={index} className="section chat-section">
                <div className="section-header">
                  <label>채팅 입력</label>
                  <div className="section-controls">
                    <button
                      type="button"
                      className="move-btn move-up"
                      onClick={() => moveChatSection(index, 'up')}
                      disabled={index === 0}
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      className="move-btn move-down"
                      onClick={() => moveChatSection(index, 'down')}
                      disabled={index === chatSections.length - 1}
                    >
                      ▼
                    </button>
                    <button
                      type="button"
                      className="danger-button remove-section-btn"
                      onClick={() => removeChatSection(index)}
                      disabled={chatSections.length === 1}
                    >
                      X
                    </button>
                  </div>
                </div>
                
                <div className="markdown-toolbar">
                  <button type="button" className="format-btn">나레이션</button>
                  <button type="button" className="format-btn">AI</button>
                  <button type="button" className="format-btn">USER</button>
                  <span className="toolbar-divider"></span>
                  <button type="button" className="markdown-btn"><b>B</b></button>
                  <button type="button" className="markdown-btn"><i>I</i></button>
                  <button type="button" className="markdown-btn"><b><i>BI</i></b></button>
                  <button type="button" className="markdown-btn">하이라이트</button>
                  <button type="button" className="markdown-btn">강조</button>
                </div>
                
                <textarea
                  className="full-width chat-input-area"
                  value={section}
                  onChange={(e) => updateChatSection(index, e.target.value)}
                  placeholder={index === 0 ? "- 화창한 봄날, 공원에서 우연히 만난 두 사람은..." : "여기에 추가 채팅 내용을 입력하세요..."}
                  rows={8}
                />
              </div>
            ))}
          </div>
          
          <button
            className="secondary-button add-section-btn"
            onClick={addChatSection}
            style={{ marginTop: '10px' }}
          >
            채팅 섹션 추가
          </button>
        </div>
      </details>

      {/* 액션 버튼 */}
      <div className="action-buttons">
        <button className="primary-button" onClick={onCopyHTML}>
          📋 HTML 복사하기
        </button>
        <button className="info-button" onClick={loadExample}>
          예제 불러오기
        </button>
        <button className="secondary-button" onClick={onCopyHTML}>
          HTML 생성하기
        </button>
      </div>
    </div>
  );
};

export default ChatchanSettings; 