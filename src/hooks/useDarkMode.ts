import { useEffect } from 'react';

// 用于根据 darkMode 状态给 document 添加对应的类
export function useDarkMode(darkMode: boolean) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(darkMode ? 'light' : 'dark');
    root.classList.add(darkMode ? 'dark' : 'light');
  }, [darkMode]);
} 