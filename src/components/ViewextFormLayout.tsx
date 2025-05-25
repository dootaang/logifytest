import React, { useState, useEffect } from 'react';
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
  ModernToggle
} from './ModernComponents'
import ViewextGenerator, { COLOR_THEMES, FONT_OPTIONS } from './ViewextGenerator'

interface ViewextConfig {
  content: string;
  characterName: string;
  userName: string;
  colorTheme: string;
  layoutType: 'vertical' | 'horizontal';
  showImages: boolean;
  fontFamily: string;
  letterSpacing: number;
  lineHeight: number;
  enableScroll: boolean;
  enableFoldToggle: boolean;
  characterImageUrl: string;
  userImageUrl: string;
}

interface ViewextFormLayoutProps {
  config: ViewextConfig;
  onConfigChange: (newConfig: Partial<ViewextConfig>) => void;
  generatedHTML: string;
  onGenerateHTML: () => void;
  onCopyHTML: () => void;
  onReset: () => void;
}

const ViewextFormLayout: React.FC<ViewextFormLayoutProps> = ({
  config,
  onConfigChange,
  generatedHTML,
  onGenerateHTML,
  onCopyHTML,
  onReset
}) => {
  const [activeTab, setActiveTab] = useState('basic');

  const handleInputChange = (field: string, value: any) => {
    onConfigChange({ [field]: value });
  };

  const colorThemeOptions = Object.entries(COLOR_THEMES).map(([key, theme]) => ({
    value: key,
    label: theme.name
  }));

  const fontOptions = FONT_OPTIONS.map(font => ({
    value: font.value,
    label: font.name
  }));

  const downloadHTML = () => {
    const blob = new Blob([generatedHTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `뷰익형-${config.colorTheme}-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="form-layout">
      <div className="form-container">
        {/* 설정 패널 */}
        <div className="settings-panel">
          <div className="panel-header">
            <h2>설정</h2>
          </div>

          {/* 탭 네비게이션 */}
          <div className="tab-navigation">
            {[
              { id: 'basic', label: '기본 설정' },
              { id: 'style', label: '스타일' },
              { id: 'advanced', label: '고급 설정' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 탭 컨텐츠 */}
          <div className="tab-content">
            {activeTab === 'basic' && (
              <div className="tab-panel">
                <ModernSection title="기본 정보">
                  <ModernFormRow>
                    <ModernFormGroup label="캐릭터 이름">
                      <ModernInput
                        value={config.characterName}
                        onChange={(value) => handleInputChange('characterName', value)}
                        placeholder="Character"
                      />
                    </ModernFormGroup>
                    <ModernFormGroup label="유저 이름">
                      <ModernInput
                        value={config.userName}
                        onChange={(value) => handleInputChange('userName', value)}
                        placeholder="User"
                      />
                    </ModernFormGroup>
                  </ModernFormRow>
                </ModernSection>

                <ModernSection title="대화 내용">
                  <ModernFormGroup>
                    <ModernTextarea
                      value={config.content}
                      onChange={(value) => handleInputChange('content', value)}
                      placeholder="Character: 안녕하세요!&#10;&#10;User: 안녕하세요!"
                      rows={12}
                    />
                    <ModernHint>
                      캐릭터명: 또는 유저명: 으로 시작하는 줄로 화자를 구분합니다.
                    </ModernHint>
                  </ModernFormGroup>
                </ModernSection>

                <ModernSection title="이미지 설정">
                  <ModernFormRow>
                    <ModernFormGroup label="이미지 표시">
                      <ModernToggle
                        checked={config.showImages}
                        onChange={(checked) => handleInputChange('showImages', checked)}
                      />
                      <ModernHint>
                        좌측에 이미지 표시 여부
                      </ModernHint>
                    </ModernFormGroup>
                  </ModernFormRow>
                  
                  {config.showImages && (
                    <ModernFormRow>
                      <ModernFormGroup label="캐릭터 이미지 URL">
                        <ModernInput
                          value={config.characterImageUrl}
                          onChange={(value) => handleInputChange('characterImageUrl', value)}
                          placeholder="https://example.com/character.jpg"
                        />
                      </ModernFormGroup>
                      <ModernFormGroup label="유저 이미지 URL">
                        <ModernInput
                          value={config.userImageUrl}
                          onChange={(value) => handleInputChange('userImageUrl', value)}
                          placeholder="https://example.com/user.jpg"
                        />
                      </ModernFormGroup>
                    </ModernFormRow>
                  )}
                </ModernSection>
              </div>
            )}

            {activeTab === 'style' && (
              <div className="tab-panel">
                <ModernSection title="테마 설정">
                  <ModernFormGroup label="컬러 테마">
                    <ModernSelect
                      value={config.colorTheme}
                      onChange={(value) => handleInputChange('colorTheme', value)}
                      options={colorThemeOptions}
                    />
                    <ModernHint>
                      원본 뷰익.css에서 추출한 정확한 컬러 테마
                    </ModernHint>
                  </ModernFormGroup>

                  <ModernFormGroup label="폰트">
                    <ModernSelect
                      value={config.fontFamily}
                      onChange={(value) => handleInputChange('fontFamily', value)}
                      options={fontOptions}
                    />
                    <ModernHint>
                      한글 웹폰트 최적화
                    </ModernHint>
                  </ModernFormGroup>
                </ModernSection>

                <ModernSection title="레이아웃 설정">
                  <ModernFormRow>
                    <ModernFormGroup label="레이아웃 타입">
                      <div className="radio-group">
                        <label className="radio-option">
                          <input
                            type="radio"
                            name="layoutType"
                            value="vertical"
                            checked={config.layoutType === 'vertical'}
                            onChange={(e) => handleInputChange('layoutType', e.target.value)}
                          />
                          <span>세로형</span>
                        </label>
                        <label className="radio-option">
                          <input
                            type="radio"
                            name="layoutType"
                            value="horizontal"
                            checked={config.layoutType === 'horizontal'}
                            onChange={(e) => handleInputChange('layoutType', e.target.value)}
                          />
                          <span>가로형 (이미지 포함)</span>
                        </label>
                      </div>
                      <ModernHint>
                        가로형은 좌측에 이미지, 우측에 텍스트가 배치됩니다
                      </ModernHint>
                    </ModernFormGroup>
                  </ModernFormRow>
                </ModernSection>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="tab-panel">
                <ModernSection title="텍스트 설정">
                  <ModernFormGroup label={`자간 (Letter Spacing): ${config.letterSpacing}rem`}>
                    <ModernSlider
                      value={config.letterSpacing}
                      onChange={(value) => handleInputChange('letterSpacing', value)}
                      min={-0.1}
                      max={0.2}
                      step={0.01}
                    />
                  </ModernFormGroup>

                  <ModernFormGroup label={`행간 (Line Height): ${config.lineHeight}%`}>
                    <ModernSlider
                      value={config.lineHeight}
                      onChange={(value) => handleInputChange('lineHeight', value)}
                      min={100}
                      max={200}
                      step={10}
                    />
                  </ModernFormGroup>
                </ModernSection>

                <ModernSection title="기능 설정">
                  <ModernFormRow>
                    <ModernFormGroup label="스크롤 활성화">
                      <ModernToggle
                        checked={config.enableScroll}
                        onChange={(checked) => handleInputChange('enableScroll', checked)}
                      />
                      <ModernHint>
                        긴 텍스트에 스크롤 적용
                      </ModernHint>
                    </ModernFormGroup>
                    <ModernFormGroup label="접기/펼치기 버튼">
                      <ModernToggle
                        checked={config.enableFoldToggle}
                        onChange={(checked) => handleInputChange('enableFoldToggle', checked)}
                      />
                      <ModernHint>
                        메시지 접기/펼치기 기능
                      </ModernHint>
                    </ModernFormGroup>
                  </ModernFormRow>
                </ModernSection>
              </div>
            )}
          </div>

          {/* 액션 버튼 */}
          <div className="action-buttons">
            <ModernButton onClick={onGenerateHTML} primary>
              HTML 생성
            </ModernButton>
            <ModernButton onClick={onCopyHTML}>
              복사
            </ModernButton>
            <ModernButton onClick={onReset}>
              초기화
            </ModernButton>
          </div>
        </div>

        {/* 미리보기 패널 */}
        <div className="preview-panel">
          <div className="panel-header">
            <h2>실시간 미리보기</h2>
            <div className="theme-indicator">
              {COLOR_THEMES[config.colorTheme as keyof typeof COLOR_THEMES]?.name || '올드머니 - 일반'}
            </div>
          </div>
          
          <div className="preview-container">
            <iframe
              srcDoc={generatedHTML}
              className="preview-iframe"
              title="뷰익형 미리보기"
            />
          </div>
          
          <div className="preview-hint">
            💡 실제 결과물은 다운로드한 HTML 파일을 브라우저에서 열어 확인하세요.
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* 기본 폼 스타일 */
        .button {
          padding: 0.5rem 1rem;
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 6px;
          background: var(--bg-secondary, #ffffff);
          color: var(--text-primary, #1a202c);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .button:hover {
          background: var(--bg-tertiary, #f7fafc);
        }

        .button.primary {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .button.primary:hover {
          background: #2563eb;
        }

        .form-input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 6px;
          background: var(--bg-secondary, #ffffff);
          color: var(--text-primary, #1a202c);
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 100px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-primary, #1a202c);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .settings-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .section-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary, #1a202c);
          margin: 0;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border-color, #e2e8f0);
        }

        .hint {
          font-size: 0.75rem;
          color: var(--text-secondary, #6b7280);
          margin-top: 0.25rem;
        }

        .toggle-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .toggle-wrapper {
          position: relative;
        }

        .toggle-input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-label {
          display: block;
          width: 44px;
          height: 24px;
          background: #e2e8f0;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .toggle-input:checked + .toggle-label {
          background: #3b82f6;
        }

        .toggle-switch {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          transition: transform 0.2s ease;
        }

        .toggle-input:checked + .toggle-label .toggle-switch {
          transform: translateX(20px);
        }

        .toggle-text {
          font-size: 0.875rem;
          color: var(--text-primary, #1a202c);
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <style jsx>{`
        .form-layout {
          width: 100%;
        }

        .form-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .settings-panel,
        .preview-panel {
          background: var(--bg-secondary);
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        .panel-header h2 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .theme-indicator {
          font-size: 0.875rem;
          color: var(--text-secondary);
          background: var(--bg-tertiary);
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
        }

        .tab-navigation {
          display: flex;
          background: var(--bg-tertiary);
          border-radius: 8px;
          padding: 0.25rem;
          margin-bottom: 1.5rem;
        }

        .tab-button {
          flex: 1;
          padding: 0.5rem 1rem;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tab-button:hover {
          color: var(--text-primary);
        }

        .tab-button.active {
          background: var(--bg-secondary);
          color: var(--text-primary);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .tab-content {
          margin-bottom: 2rem;
        }

        .tab-panel {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .radio-group {
          display: flex;
          gap: 1rem;
        }

        .radio-option {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .radio-option input[type="radio"] {
          margin: 0;
        }

        .radio-option span {
          font-size: 0.875rem;
          color: var(--text-primary);
        }

        .action-buttons {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .preview-container {
          border: 1px solid var(--border-color);
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .preview-iframe {
          width: 100%;
          height: 600px;
          border: none;
          display: block;
        }

        .preview-hint {
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-align: center;
        }

        @media (max-width: 1024px) {
          .form-container {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }

        @media (max-width: 768px) {
          .action-buttons {
            flex-direction: column;
          }

          .tab-navigation {
            flex-direction: column;
          }

          .tab-button {
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
};

export default ViewextFormLayout; 