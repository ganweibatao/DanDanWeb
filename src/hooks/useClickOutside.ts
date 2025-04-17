import { useEffect } from 'react';

// 用于点击 ref 指向元素外部时触发回调
export function useClickOutside(
  ref: React.RefObject<HTMLElement>,
  handler: (event: MouseEvent) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      // 如果点击在元素内部，忽略
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
    };
  }, [ref, handler]);
} 