// 主题管理器 - 支持暗黑模式和自定义主题

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface Theme {
  mode: ThemeMode;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    accent: string;
  };
}

const lightTheme: Theme = {
  mode: 'light',
  colors: {
    primary: '#8b5cf6',
    secondary: '#ec4899',
    background: '#f5f3ff',
    surface: '#ffffff',
    text: '#1f2937',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    accent: '#f59e0b'
  }
};

const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    primary: '#a78bfa',
    secondary: '#f472b6',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    border: '#334155',
    accent: '#fbbf24'
  }
};

class ThemeManager {
  private currentMode: ThemeMode = 'light';
  private listeners: Set<(theme: Theme) => void> = new Set();

  constructor() {
    this.loadTheme();
    this.setupMediaQuery();
  }

  // 加载主题
  private loadTheme(): void {
    const saved = localStorage.getItem('theme-mode');
    if (saved) {
      this.currentMode = saved as ThemeMode;
    } else {
      this.currentMode = 'auto';
    }
    this.applyTheme();
  }

  // 设置主题
  setTheme(mode: ThemeMode): void {
    this.currentMode = mode;
    localStorage.setItem('theme-mode', mode);
    this.applyTheme();
  }

  // 获取当前主题
  getCurrentTheme(): Theme {
    if (this.currentMode === 'auto') {
      return this.getSystemTheme();
    }
    return this.currentMode === 'dark' ? darkTheme : lightTheme;
  }

  // 获取系统主题
  private getSystemTheme(): Theme {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return isDark ? darkTheme : lightTheme;
  }

  // 应用主题
  private applyTheme(): void {
    const theme = this.getCurrentTheme();
    const root = document.documentElement;

    // 设置 CSS 变量
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-background', theme.colors.background);
    root.style.setProperty('--color-surface', theme.colors.surface);
    root.style.setProperty('--color-text', theme.colors.text);
    root.style.setProperty('--color-text-secondary', theme.colors.textSecondary);
    root.style.setProperty('--color-border', theme.colors.border);
    root.style.setProperty('--color-accent', theme.colors.accent);

    // 设置 data 属性用于 Tailwind
    root.setAttribute('data-theme', theme.mode);
    
    // 添加/移除 dark class
    if (theme.mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // 通知监听器
    this.notifyListeners(theme);
  }

  // 监听系统主题变化
  private setupMediaQuery(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      if (this.currentMode === 'auto') {
        this.applyTheme();
      }
    });
  }

  // 订阅主题变化
  subscribe(listener: (theme: Theme) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // 通知监听器
  private notifyListeners(theme: Theme): void {
    this.listeners.forEach(listener => listener(theme));
  }

  // 切换主题
  toggleTheme(): void {
    const current = this.getCurrentTheme();
    const newMode = current.mode === 'dark' ? 'light' : 'dark';
    this.setTheme(newMode);
  }

  // 获取当前模式
  getMode(): ThemeMode {
    return this.currentMode;
  }
}

export const themeManager = new ThemeManager();
