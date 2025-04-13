import { useState, useEffect } from 'react';

/**
 * 自定义 hook，用于处理本地存储的读写操作
 * @param key 存储键名
 * @param initialValue 初始值
 * @returns [存储的值, 设置值的函数]
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // 获取初始值
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // 从 localStorage 获取值
      const item = localStorage.getItem(key);
      // 如果存在则解析，否则返回初始值
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`从 localStorage 读取 ${key} 失败:`, error);
      return initialValue;
    }
  });

  // 设置值的函数
  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      // 允许值是一个函数，类似于 useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // 保存状态
      setStoredValue(valueToStore);
      // 保存到 localStorage
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`保存 ${key} 到 localStorage 失败:`, error);
    }
  };

  return [storedValue, setValue];
} 