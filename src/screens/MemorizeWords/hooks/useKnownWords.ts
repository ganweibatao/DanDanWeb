import { useState } from "react";

export interface SwipeState {
  startX: number;
  currentX: number;
  isSwiping: boolean;
}

export function useKnownWords() {
  const [knownWordIds, setKnownWordIds] = useState<Set<number>>(new Set());
  const [swipeState, setSwipeState] = useState<Map<number, SwipeState>>(new Map());

  // 切换已知状态
  const toggleMarkAsKnown = (wordId: number) => {
    setKnownWordIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(wordId)) {
        newSet.delete(wordId);
      } else {
        newSet.add(wordId);
      }
      return newSet;
    });
  };

  // 滑动开始
  const handleSwipeStart = (wordId: number, clientX: number) => {
    setSwipeState((prev) => new Map(prev).set(wordId, { startX: clientX, currentX: clientX, isSwiping: true }));
  };

  // 滑动中
  const handleSwipeMove = (wordId: number, clientX: number) => {
    setSwipeState((prev) => {
      const state = prev.get(wordId);
      if (state?.isSwiping) {
        return new Map(prev).set(wordId, { ...state, currentX: clientX });
      }
      return prev;
    });
  };

  // 滑动结束
  const handleSwipeEnd = (wordId: number) => {
    let marked = false;
    const state = swipeState.get(wordId);
    if (state?.isSwiping) {
      const deltaX = state.startX - state.currentX;
      const SWIPE_THRESHOLD = 50;
      if (deltaX > SWIPE_THRESHOLD) {
        toggleMarkAsKnown(wordId);
        marked = true;
      }
    }
    setSwipeState((prev) => {
      const newState = new Map(prev);
      newState.delete(wordId);
      return newState;
    });
    return marked;
  };

  return {
    knownWordIds,
    toggleMarkAsKnown,
    swipeState,
    handleSwipeStart,
    handleSwipeMove,
    handleSwipeEnd,
    setKnownWordIds,
    setSwipeState,
  };
} 