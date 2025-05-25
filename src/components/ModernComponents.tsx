import React, { useId, useState, useEffect } from 'react';
import { STYLES, DarkModeUtils } from '@/utils/styles';

// 모던 버튼 컴포넌트
interface ModernButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  primary?: boolean;
  danger?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  style?: React.CSSProperties;
}

export const ModernButton: React.FC<ModernButtonProps> = ({
  children,
  onClick,
  primary = false,
  danger = false,
  disabled = false,
  type = 'button',
  className = '',
  style = {}
}) => {
  const getButtonClass = () => {
    let baseClass = 'button';
    if (primary) baseClass += ' primary';
    if (danger) baseClass += ' danger';
    return `${baseClass} ${className}`.trim();
  };

  return (
    <button
      type={type}
      className={getButtonClass()}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  );
};

// 모던 입력 필드 컴포넌트
interface ModernInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'number' | 'email' | 'password';
  disabled?: boolean;
  className?: string;
  onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void;
}

export const ModernInput: React.FC<ModernInputProps> = ({
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  className = '',
  onPaste
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onPaste={onPaste}
      placeholder={placeholder}
      disabled={disabled}
      className={`form-input ${className}`.trim()}
    />
  );
};

// 모던 텍스트 영역 컴포넌트
interface ModernTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  className?: string;
}

export const ModernTextarea: React.FC<ModernTextareaProps> = ({
  value,
  onChange,
  placeholder,
  rows = 4,
  disabled = false,
  className = ''
}) => {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className={`form-input form-textarea ${className}`.trim()}
    />
  );
};

// 모던 체크박스 컴포넌트
interface ModernCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  className?: string;
}

export const ModernCheckbox: React.FC<ModernCheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  className = ''
}) => {
  const id = useId();

  return (
    <div className={`checkbox-group ${className}`.trim()}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="checkbox"
      />
      <label htmlFor={id} className="checkbox-label">
        {label}
      </label>
    </div>
  );
};

// 모던 색상 선택기 컴포넌트
interface ModernColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
  className?: string;
}

export const ModernColorPicker: React.FC<ModernColorPickerProps> = ({
  value,
  onChange,
  disabled = false,
  className = ''
}) => {
  return (
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`color-input ${className}`.trim()}
    />
  );
};

// 모던 슬라이더 컴포넌트
interface ModernSliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  label: string;
  disabled?: boolean;
  className?: string;
}

export const ModernSlider: React.FC<ModernSliderProps> = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`slider-group ${className}`.trim()}>
      <label className="form-label">
        {label}: <span className="slider-value">{value}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        className="slider"
      />
    </div>
  );
};

// 모던 콤보박스 컴포넌트
interface ModernSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  className?: string;
}

export const ModernSelect: React.FC<ModernSelectProps> = ({
  value,
  onChange,
  options,
  disabled = false,
  className = ''
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`form-input ${className}`.trim()}
      style={{
        backgroundColor: STYLES.surface,
        border: 'none',
        borderRadius: `${STYLES.radius_normal}px`,
        padding: '8px 12px',
        fontSize: `${STYLES.font_size_normal}px`,
        color: STYLES.text,
        fontWeight: STYLES.font_weight_normal,
        fontFamily: STYLES.font_family,
        cursor: 'pointer'
      }}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

// 모던 폼 그룹 컴포넌트
interface ModernFormGroupProps {
  label?: string;
  children: React.ReactNode;
  className?: string;
}

export const ModernFormGroup: React.FC<ModernFormGroupProps> = ({
  label,
  children,
  className = ''
}) => {
  return (
    <div className={`form-group ${className}`.trim()}>
      {label && <label className="form-label">{label}</label>}
      {children}
    </div>
  );
};

// 모던 폼 로우 컴포넌트
interface ModernFormRowProps {
  children: React.ReactNode;
  className?: string;
}

export const ModernFormRow: React.FC<ModernFormRowProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`form-row ${className}`.trim()}>
      {children}
    </div>
  );
};

// 모던 섹션 컴포넌트
interface ModernSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const ModernSection: React.FC<ModernSectionProps> = ({
  title,
  children,
  className = ''
}) => {
  return (
    <div className={`settings-section ${className}`.trim()}>
      <h3 className="section-title">{title}</h3>
      {children}
    </div>
  );
};

// 모던 힌트 컴포넌트
interface ModernHintProps {
  children: React.ReactNode;
  type?: 'default' | 'success' | 'error';
  className?: string;
}

export const ModernHint: React.FC<ModernHintProps> = ({
  children,
  type = 'default',
  className = ''
}) => {
  const getHintClass = () => {
    let baseClass = 'hint';
    if (type === 'success') baseClass += ' success';
    if (type === 'error') baseClass += ' error';
    return `${baseClass} ${className}`.trim();
  };

  return (
    <div className={getHintClass()}>
      {children}
    </div>
  );
};

// 다크모드 토글 컴포넌트
interface ModernDarkModeToggleProps {
  className?: string;
}

export const ModernDarkModeToggle: React.FC<ModernDarkModeToggleProps> = ({
  className = ''
}) => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // 초기 테마 로드
    const savedTheme = DarkModeUtils.getSavedTheme();
    setTheme(savedTheme);
    
    const effectiveDark = DarkModeUtils.getEffectiveDarkMode(savedTheme);
    setIsDark(effectiveDark);
    DarkModeUtils.applyTheme(effectiveDark);

    // 시스템 다크모드 변화 감지
    const unwatch = DarkModeUtils.watchSystemDarkMode((systemIsDark) => {
      if (theme === 'system') {
        setIsDark(systemIsDark);
        DarkModeUtils.applyTheme(systemIsDark);
      }
    });

    return unwatch;
  }, [theme]);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    DarkModeUtils.saveTheme(newTheme);
    
    const effectiveDark = DarkModeUtils.getEffectiveDarkMode(newTheme);
    setIsDark(effectiveDark);
    DarkModeUtils.applyTheme(effectiveDark);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return '☀️';
      case 'dark': return '🌙';
      case 'system': return '🖥️';
      default: return '🖥️';
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light': return '라이트';
      case 'dark': return '다크';
      case 'system': return '시스템';
      default: return '시스템';
    }
  };

  const cycleTheme = () => {
    const themes: ('light' | 'dark' | 'system')[] = ['system', 'light', 'dark'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    handleThemeChange(themes[nextIndex]);
  };

  return (
    <button
      onClick={cycleTheme}
      className={`button ${className}`.trim()}
      title={`현재: ${getThemeLabel()} 테마 (클릭하여 변경)`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        fontSize: `${STYLES.font_size_small}px`,
        minWidth: 'auto'
      }}
    >
      <span style={{ fontSize: '16px' }}>{getThemeIcon()}</span>
      <span>{getThemeLabel()}</span>
    </button>
  );
}; 