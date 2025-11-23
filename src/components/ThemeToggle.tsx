import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { themeManager, ThemeMode } from '../utils/themeManager';

const ThemeToggle: React.FC = () => {
  const [mode, setMode] = useState<ThemeMode>(themeManager.getMode());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // 订阅主题变化
    const unsubscribe = themeManager.subscribe(() => {
      setMode(themeManager.getMode());
    });

    return unsubscribe;
  }, []);

  const handleModeChange = (newMode: ThemeMode) => {
    themeManager.setTheme(newMode);
    setMode(newMode);
    setIsOpen(false);
  };

  const getModeIcon = (themeMode: ThemeMode) => {
    switch (themeMode) {
      case 'light':
        return <Sun size={18} />;
      case 'dark':
        return <Moon size={18} />;
      case 'auto':
        return <Monitor size={18} />;
    }
  };

  const getModeLabel = (themeMode: ThemeMode) => {
    switch (themeMode) {
      case 'light':
        return '亮色';
      case 'dark':
        return '暗色';
      case 'auto':
        return '自动';
    }
  };

  return (
    <div className="relative">
      {/* 主题切换按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        title="切换主题"
      >
        {getModeIcon(mode)}
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {getModeLabel(mode)}
        </span>
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <>
          {/* 遮罩层 */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* 菜单 */}
          <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 overflow-hidden">
            <div className="py-1">
              {(['light', 'dark', 'auto'] as ThemeMode[]).map((themeMode) => (
                <button
                  key={themeMode}
                  onClick={() => handleModeChange(themeMode)}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                    mode === themeMode
                      ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {getModeIcon(themeMode)}
                  <span>{getModeLabel(themeMode)}</span>
                  {mode === themeMode && (
                    <span className="ml-auto text-purple-600 dark:text-purple-400">✓</span>
                  )}
                </button>
              ))}
            </div>

            {/* 说明 */}
            <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
              {mode === 'auto' ? '跟随系统主题' : `当前为${getModeLabel(mode)}模式`}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ThemeToggle;
