import { useState, useEffect, RefObject, useRef } from "react";

export function useWordCover(wordListRef: RefObject<HTMLDivElement>) {
  const [showCover, setShowCover] = useState(false);
  const [coverPosition, setCoverPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  // Refs to track initial drag start position and initial cover position
  const dragStartXRef = useRef<number>(0);
  const initialCoverRef = useRef<number>(coverPosition);
  // Ref for requestAnimationFrame handle and pending position
  const rafRef = useRef<number | null>(null);
  const scheduledCoverRef = useRef<number>(coverPosition);
  const coverRef = useRef<HTMLDivElement>(null);

  const handleCoverDrag = (clientX: number) => {
    if (!isDragging || !wordListRef.current) return;
    const rect = wordListRef.current.getBoundingClientRect();
    const deltaPercent = ((clientX - dragStartXRef.current) / rect.width) * 100;
    const newPosition = Math.min(Math.max(initialCoverRef.current + deltaPercent, 0), 50);
    scheduledCoverRef.current = newPosition;
    // Batch state updates to next animation frame
    if (rafRef.current === null) {
      rafRef.current = window.requestAnimationFrame(() => {
        setCoverPosition(scheduledCoverRef.current);
        rafRef.current = null;
      });
    }
  };

  // Start dragging: record initial positions
  const handleCoverDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    let clientX = 0;
    // Handle touch events
    // @ts-ignore
    if (e.touches && e.touches.length > 0) {
      // @ts-ignore
      clientX = e.touches[0].clientX;
    } else if ('clientX' in e) {
      // @ts-ignore
      clientX = e.clientX;
    }
    dragStartXRef.current = clientX;
    initialCoverRef.current = coverPosition;
    setIsDragging(true);
  };

  const handleCoverDragEnd = () => {
    // Flush pending frame
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    // Persist final position to state
    setCoverPosition(scheduledCoverRef.current);
    setIsDragging(false);
  };

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
    coverRef,
  };
} 