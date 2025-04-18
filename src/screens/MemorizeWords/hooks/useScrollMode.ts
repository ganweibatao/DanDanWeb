import { useState, useCallback, useRef } from "react";

export function useScrollMode() {
  const [isScrollMode, setIsScrollMode] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const wordListRef = useRef<HTMLDivElement>(null);

  // 切换滚动/分页模式
  const toggleScrollMode = useCallback(() => {
    setIsScrollMode((prev) => {
      if (!prev) {
        wordListRef.current?.scrollTo({ top: 0, behavior: 'auto' });
        setScrollProgress(0);
      } else {
        setScrollProgress(0);
      }
      return !prev;
    });
  }, []);

  // 滚动时计算进度
  const handleWordListScroll = useCallback(() => {
    if (!wordListRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = wordListRef.current;
    const progress = scrollHeight > clientHeight
      ? scrollTop / (scrollHeight - clientHeight)
      : 1;
    setScrollProgress(progress);
  }, []);

  return {
    isScrollMode,
    setIsScrollMode,
    scrollProgress,
    setScrollProgress,
    wordListRef,
    toggleScrollMode,
    handleWordListScroll,
  };
} 