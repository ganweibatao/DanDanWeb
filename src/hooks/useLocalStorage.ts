import { useState, useEffect, useCallback } from 'react';

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

/**
 * 通用的本地存储 hook，支持类型安全的读写和自动同步。
 * @param key localStorage 的 key
 * @param initialValue 初始值
 */
export function useLocalStorageCache<T>(key: string, initialValue: T | (() => T)) {
  // 初始化时从 localStorage 读取
  const [cache, setCache] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : (typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue);
    } catch (error) {
      return typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
    }
  });

  // 写入 localStorage
  const setLocalStorageCache = useCallback((value: T) => {
    setCache(value);
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key]);

  // 清除 localStorage
  const clearLocalStorageCache = useCallback(() => {
    setCache(typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue);
    try {
      window.localStorage.removeItem(key);
    } catch {}
  }, [key, initialValue]);

  return [cache, setLocalStorageCache, clearLocalStorageCache] as const;
} 