import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';

// 1. 定义所有设置项的接口
export interface FontSizeSettings {
  english: number;
  pronunciation: number;
  chinese: number;
}

export type ThemeSetting = 'light' | 'dark' | 'system';

export interface UserSettings {
  fontSizes: FontSizeSettings;
  showClock: boolean; // 控制是否显示时钟
  showNotesPanel: boolean; // 控制是否启用笔记面板
  isSoundEnabled: boolean; // 全局音效开关
  isScrollSoundEnabled: boolean; // 滚动音效开关
  volume: number; // 音量 (0 to 1)
  wordItemBgColor: string; // 单词项背景色 (亮色模式)
  theme: ThemeSetting; // 外观主题
  baseFontSize: number; // 新增：全局基础字体大小百分比
  // SettingsPage中的设置
  animationsEnabled: boolean; // 动画开关 (来自 SettingsPage)
  // 其他未来可能添加的设置...
}

// 2. 定义默认设置
const defaultSettings: UserSettings = {
  fontSizes: {
    english: 17,
    pronunciation: 14,
    chinese: 16,
  },
  showClock: true,
  showNotesPanel: true,
  isSoundEnabled: true,
  isScrollSoundEnabled: true,
  volume: 0.5,
  wordItemBgColor: '#fafffa', // 默认为极淡绿
  theme: 'system', // 默认跟随系统
  animationsEnabled: true,
  baseFontSize: 100, // 新增：默认全局基础字体大小为100%
};

// 3. 定义 Context 的类型
interface SettingsContextType {
  settings: UserSettings;
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
  updateFontSize: (setting: keyof FontSizeSettings, value: number) => void;
  resetSettings: () => void;
  setTheme: (theme: ThemeSetting) => void; // 单独提供 setTheme 以兼容 ThemeContext 的用法
  setShowNotesPanel: (show: boolean) => void; // 添加 setShowNotesPanel
}

// 4. 创建 Context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// 5. 创建 Provider 组件
interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(() => {
    // 尝试从 localStorage 加载初始设置
    try {
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        // 合并保存的设置和默认设置，以防后续添加了新的默认设置项
        return { ...defaultSettings, ...JSON.parse(savedSettings) };
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage:", error);
    }
    return defaultSettings; // 返回默认设置
  });

  // 当设置变化时，保存到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem('userSettings', JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save settings to localStorage:", error);
    }
  }, [settings]);

  // 通用更新设置的方法
  const updateSetting = useCallback(<K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [key]: value,
    }));
  }, []);

  // 更新字体大小的特定方法
  const updateFontSize = useCallback((setting: keyof FontSizeSettings, value: number) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      fontSizes: {
        ...prevSettings.fontSizes,
        [setting]: value,
      },
    }));
  }, []);

  // 恢复默认设置的方法
  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    // 同时清除 localStorage
    try {
      localStorage.removeItem('userSettings');
    } catch (error) {
      console.error("Failed to remove settings from localStorage:", error);
    }
  }, []);

  // 单独提供 setTheme 以方便使用
  const setTheme = useCallback((theme: ThemeSetting) => {
    updateSetting('theme', theme);
  }, [updateSetting]);

  // 添加 setShowNotesPanel 的具体实现
  const setShowNotesPanel = useCallback((show: boolean) => {
    updateSetting('showNotesPanel', show);
  }, [updateSetting]);

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, updateFontSize, resetSettings, setTheme, setShowNotesPanel }}>
      {children}
    </SettingsContext.Provider>
  );
};

// 6. 创建自定义 Hook
export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}; 