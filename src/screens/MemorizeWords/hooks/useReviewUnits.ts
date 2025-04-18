import { useState } from "react";
import { toast } from "sonner";
import { DisplayVocabularyWord } from "../types";
import { LearningUnit } from "../../../services/learningApi";

interface UseReviewUnitsProps {
  reviewUnits: LearningUnit[] | null;
  allReviewWords: DisplayVocabularyWord[];
  setOriginalWords: (words: DisplayVocabularyWord[]) => void;
  setOriginalWordsLength: (len: number) => void;
  goToPage: (page: number) => void;
  setSearchQuery: (q: string) => void;
  setSwipeState: (s: any) => void;
}

export function useReviewUnits({
  reviewUnits,
  allReviewWords,
  setOriginalWords,
  setOriginalWordsLength,
  goToPage,
  setSearchQuery,
  setSwipeState,
}: UseReviewUnitsProps) {
  const [selectedReviewUnitId, setSelectedReviewUnitId] = useState<number | null>(null);

  const handleReviewUnitSelect = (selectedUnit: LearningUnit) => {
    if (!selectedUnit || selectedUnit.id === selectedReviewUnitId) return;

    setSelectedReviewUnitId(selectedUnit.id);

    if (selectedUnit.words && Array.isArray(selectedUnit.words) && selectedUnit.words.length > 0) {
      const unitWordIds = new Set(selectedUnit.words.map(w => w.id));
      const filteredWords = allReviewWords.filter((word: DisplayVocabularyWord) => unitWordIds.has(word.id));
      if (filteredWords.length > 0) {
        setOriginalWords(filteredWords);
        setOriginalWordsLength(filteredWords.length);
        goToPage(1);
        setSearchQuery("");
        setSwipeState(new Map());
        toast.info(`显示 List ${selectedUnit.unit_number} 的复习单词 (${filteredWords.length}个)`);
      } else {
        setOriginalWords([]);
        setOriginalWordsLength(0);
        goToPage(1);
        setSearchQuery("");
        setSwipeState(new Map());
        toast.warning(`List ${selectedUnit.unit_number} 没有可显示的单词数据`);
      }
    } else {
      setOriginalWords([]);
      setOriginalWordsLength(0);
      goToPage(1);
      setSearchQuery("");
      setSwipeState(new Map());
      toast.warning(`List ${selectedUnit.unit_number} 没有关联的单词数据`);
    }
  };

  return {
    selectedReviewUnitId,
    setSelectedReviewUnitId,
    handleReviewUnitSelect,
  };
} 