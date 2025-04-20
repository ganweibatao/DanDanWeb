import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';

// 定义颜色主题类型（可以扩展）
interface StyleSettings {
  wordItemBgColor: string; // 存储 CSS 颜色值，例如 '#e6fffa' 或 'rgba(230, 255, 250, 1)'
}

// 定义 Context 值类型
interface StyleContextProps extends StyleSettings {
  setWordItemBgColor: (color: string) => void;
  // 未来可以添加更多样式设置和更新函数
}

// 默认设置
const defaultStyleSettings: StyleSettings = {
  // wordItemBgColor: '#f0fdf4', // Tailwind green-50 的近似值，一个非常淡的绿色
  wordItemBgColor: '#fafffa', // 将"极淡绿"设为默认值
  // wordItemBgColor: '#fffef0', // 非常淡的黄色 (Ivory/Light Yellow tint)
  // wordItemBgColor: '#fffefa', // 极其淡的黄色，更接近白色
  // wordItemBgColor: '#ffffff', // 设置为纯白色
};

// 创建 Context
const StyleContext = createContext<StyleContextProps | undefined>(undefined);

// 定义 Provider Props
interface StyleProviderProps {
  children: ReactNode;
}

// 创建 Provider 组件
export const StyleProvider = ({ children }: StyleProviderProps) => {
  const [wordItemBgColor, setWordItemBgColor] = useState<string>(() => {
    // 尝试从 localStorage 加载，如果需要持久化的话
    // return localStorage.getItem('wordItemBgColor') || defaultStyleSettings.wordItemBgColor;
    return defaultStyleSettings.wordItemBgColor; // 暂时不持久化
  });

  // 更新函数（可以添加 localStorage 保存逻辑）
  const handleSetWordItemBgColor = (color: string) => {
    setWordItemBgColor(color);
    // localStorage.setItem('wordItemBgColor', color);
  };

  // 使用 useMemo 避免不必要的 Context 值重新创建
  const value = useMemo(() => ({
    wordItemBgColor,
    setWordItemBgColor: handleSetWordItemBgColor,
  }), [wordItemBgColor]);

  return (
    <StyleContext.Provider value={value}>
      {children}
    </StyleContext.Provider>
  );
};

// 自定义 Hook
export const useStyle = (): StyleContextProps => {
  const context = useContext(StyleContext);
  if (context === undefined) {
    throw new Error('useStyle must be used within a StyleProvider');
  }
  return context;
}; 