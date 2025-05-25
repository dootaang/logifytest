// 전역 스타일 상수 정의
export const STYLES = {
  // 색상
  primary: '#b0b2c6',
  secondary: '#5856D6',
  success: '#34C759',
  background: '#FFFFFF',
  surface: '#F2F2F7',
  text: '#000000',
  text_secondary: '#6C6C70',
  border: '#C6C6C8',
  
  // 기본값
  outer_box_color: '#ffffff',
  inner_box_color: '#f8f9fa',
  shadow_intensity: 8,
  bot_name_color: '#4a4a4a',
  tag_colors: ['#E3E3E8', '#E3E3E8', '#E3E3E8'], 
  divider_outer_color: '#b8bacf',
  divider_inner_color: '#ffffff',
  dialog_color: '#4a4a4a',
  narration_color: '#4a4a4a',
  profile_border_color: '#ffffff',
  text_indent: 20,
  
  // 폰트
  font_family: "'Segoe UI', Roboto, Arial, sans-serif",
  font_size_large: 16,
  font_size_normal: 14,
  font_size_small: 12,
  font_weight_normal: 500,
  font_weight_bold: 600,
  
  // 간격
  spacing_large: 24,
  spacing_normal: 16,
  spacing_small: 8,
  
  // 둥근 모서리
  radius_large: 16,
  radius_normal: 8,
  radius_small: 4,
  
  // 그림자
  shadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  shadow_lg: '0 4px 16px rgba(0, 0, 0, 0.15)'
} as const;

// 모던 버튼 스타일 생성 함수
export const getModernButtonStyle = (primary = false) => `
  background-color: ${primary ? STYLES.primary : STYLES.surface};
  color: ${primary ? 'white' : STYLES.text};
  border: none;
  border-radius: ${STYLES.radius_normal}px;
  padding: 8px 16px;
  font-size: ${STYLES.font_size_normal}px;
  font-weight: ${STYLES.font_weight_normal};
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: ${STYLES.font_family};

  &:hover {
    background-color: ${primary ? '#9597a8' : '#E5E5EA'};
  }

  &:active {
    background-color: ${primary ? '#7a7c8a' : '#D1D1D6'};
  }
`;

// 모던 입력 필드 스타일 생성 함수
export const getModernInputStyle = () => `
  background-color: ${STYLES.surface};
  border: none;
  border-radius: ${STYLES.radius_normal}px;
  padding: 8px 12px;
  font-size: ${STYLES.font_size_normal}px;
  color: ${STYLES.text};
  font-weight: ${STYLES.font_weight_normal};
  font-family: ${STYLES.font_family};
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${STYLES.primary}40;
  }
`;

// 모던 체크박스 스타일 생성 함수
export const getModernCheckboxStyle = () => `
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 2px solid ${STYLES.border};
  background-color: rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;

  &:checked {
    background-color: #32D74B;
    border-color: #32D74B;
    background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='m13.854 3.646-7.5 7.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6 10.293l7.146-7.147a.5.5 0 0 1 .708.708z'/%3e%3c/svg%3e");
  }
`;

// 스크롤바 스타일 생성 함수
export const getScrollbarStyle = () => `
  /* 웹킷 기반 브라우저 스크롤바 */
  &::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  &::-webkit-scrollbar-track {
    background: ${STYLES.background};
  }

  &::-webkit-scrollbar-thumb {
    background-color: #A0A0A0;
    border-radius: 5px;
    min-height: 30px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: #808080;
  }

  &::-webkit-scrollbar-corner {
    background: ${STYLES.background};
  }
`;

// 다크모드 관리 유틸리티
export const DarkModeUtils = {
  // 시스템 다크모드 감지
  getSystemDarkMode: (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  },

  // 저장된 테마 가져오기
  getSavedTheme: (): 'light' | 'dark' | 'system' => {
    if (typeof window === 'undefined') return 'system';
    return (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system';
  },

  // 테마 저장하기
  saveTheme: (theme: 'light' | 'dark' | 'system'): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('theme', theme);
  },

  // 실제 다크모드 상태 계산
  getEffectiveDarkMode: (theme: 'light' | 'dark' | 'system'): boolean => {
    if (theme === 'system') {
      return DarkModeUtils.getSystemDarkMode();
    }
    return theme === 'dark';
  },

  // HTML에 테마 적용
  applyTheme: (isDark: boolean): void => {
    if (typeof window === 'undefined') return;
    
    const html = document.documentElement;
    if (isDark) {
      html.setAttribute('data-theme', 'dark');
    } else {
      html.setAttribute('data-theme', 'light');
    }
  },

  // 시스템 다크모드 변화 감지
  watchSystemDarkMode: (callback: (isDark: boolean) => void): (() => void) => {
    if (typeof window === 'undefined') return () => {};
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => callback(e.matches);
    
    mediaQuery.addEventListener('change', handler);
    
    return () => mediaQuery.removeEventListener('change', handler);
  }
}; 