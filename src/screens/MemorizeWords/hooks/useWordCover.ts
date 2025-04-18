import { useState, useEffect, RefObject } from "react";

export function useWordCover(wordListRef: RefObject<HTMLDivElement>) {
  const [showCover, setShowCover] = useState(false);
  const [coverPosition, setCoverPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleCoverDrag = (clientX: number) => {
    if (!isDragging || !wordListRef.current) return;
    const rect = wordListRef.current.getBoundingClientRect();
    const newPosition = Math.min(Math.max(((clientX - rect.left) / rect.width) * 100, 0), 50);
    setCoverPosition(newPosition);
  };

  const handleCoverDragStart = () => setIsDragging(true);
  const handleCoverDragEnd = () => setIsDragging(false);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => isDragging && handleCoverDrag(e.clientX);
    const handleGlobalTouchMove = (e: TouchEvent) => isDragging && e.touches.length > 0 && handleCoverDrag(e.touches[0].clientX);
    const handleGlobalMouseUp = () => isDragging && handleCoverDragEnd();
    const handleGlobalTouchEnd = () => isDragging && handleCoverDragEnd();

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('touchend', handleGlobalTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [isDragging]);

  return {
    showCover,
    setShowCover,
    coverPosition,
    setCoverPosition,
    isDragging,
    setIsDragging,
    handleCoverDrag,
    handleCoverDragStart,
    handleCoverDragEnd,
  };
} 