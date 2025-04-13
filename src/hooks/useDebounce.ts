import { useState, useEffect } from 'react';

/**
 * 自定义 hook，用于处理输入防抖(在用户输入（例如搜索框）时，延迟一段时间再触发实际操作（如 API 请求），避免过于频繁的请求，提高性能。)
 * @param value 需要防抖的值
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的值
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 设置一个定时器，在延迟时间后更新值
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 清理函数，在组件卸载或值变化时清除定时器
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
} 