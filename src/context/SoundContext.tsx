import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';

// 定义 Context 的类型
interface SoundContextType {
  isSoundEnabled: boolean;
  toggleSound: () => void;
  volume: number; // 新增音量状态
  setVolume: (volume: number) => void; // 新增设置音量函数
}

// 创建 Context
const SoundContext = createContext<SoundContextType | undefined>(undefined);

// 定义 Provider Props 的类型
interface SoundProviderProps {
  children: ReactNode;
}

// 创建 Provider 组件
export const SoundProvider: React.FC<SoundProviderProps> = ({ children }) => {
  // 音效开关状态
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(() => {
    try {
      const storedValue = localStorage.getItem('soundEnabled');
      return storedValue !== null ? JSON.parse(storedValue) : true;
    } catch (error) {
      console.error("Error reading soundEnabled from localStorage", error);
      return true;
    }
  });

  // 音量状态
  const [volume, setVolumeState] = useState<number>(() => {
    try {
      const storedVolume = localStorage.getItem('soundVolume');
      const parsedVolume = storedVolume !== null ? JSON.parse(storedVolume) : 0.4; // Default to 0.4 (40%)
      return Math.max(0, Math.min(1, parsedVolume));
    } catch (error) {
      console.error("Error reading soundVolume from localStorage", error);
      return 0.4; // Default to 0.4 (40%) on error
    }
  });

  // 持久化音效开关设置
  useEffect(() => {
    try {
      localStorage.setItem('soundEnabled', JSON.stringify(isSoundEnabled));
    } catch (error) {
      console.error("Error writing soundEnabled to localStorage", error);
    }
  }, [isSoundEnabled]);

  // 持久化音量设置
  useEffect(() => {
    try {
      localStorage.setItem('soundVolume', JSON.stringify(volume));
    } catch (error) {
      console.error("Error writing soundVolume to localStorage", error);
    }
  }, [volume]);

  // 切换音效开关的函数
  const toggleSound = useCallback(() => {
    setIsSoundEnabled(prev => !prev);
  }, []);

  // 设置音量的函数（确保值在0-1之间）
  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(Math.max(0, Math.min(1, newVolume)));
  }, []);

  // 提供给子组件的值
  const value = {
    isSoundEnabled,
    toggleSound,
    volume,
    setVolume,
  };

  return (
    <SoundContext.Provider value={value}>
      {children}
    </SoundContext.Provider>
  );
};

// 自定义 Hook
export const useSound = (): SoundContextType => {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
}; 