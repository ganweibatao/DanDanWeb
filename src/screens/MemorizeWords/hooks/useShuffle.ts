import { useState, useCallback } from "react";

// Fisher-Yates (aka Knuth) Shuffle 算法
function shuffleArray<T>(array: T[]): T[] {
  let currentIndex = array.length, randomIndex;
  const newArray = [...array];
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [newArray[currentIndex], newArray[randomIndex]] = [
      newArray[randomIndex], newArray[currentIndex]
    ];
  }
  return newArray;
}

export function useShuffle<T>(originalArray: T[]) {
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffledArray, setShuffledArray] = useState<T[]>(originalArray);

  const shuffle = useCallback(() => {
    setShuffledArray(shuffleArray(originalArray));
    setIsShuffled(true);
  }, [originalArray]);

  const restore = useCallback(() => {
    setShuffledArray(originalArray);
    setIsShuffled(false);
  }, [originalArray]);

  const toggleShuffle = useCallback(() => {
    if (isShuffled) {
      restore();
    } else {
      shuffle();
    }
  }, [isShuffled, shuffle, restore]);

  return {
    isShuffled,
    shuffledArray,
    shuffle,
    restore,
    toggleShuffle,
    setShuffledArray, // 若需要手动设置
  };
} 