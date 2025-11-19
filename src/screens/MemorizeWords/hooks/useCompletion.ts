import { useState } from "react";
import { toast } from "sonner";
import { DisplayVocabularyWord } from "../types";

// 临时的简化接口定义，用于过渡期
interface TemporaryUnit {
  id: number;
  unit_number: number;
  reviews: Array<{ id: number; is_completed: boolean; }>;
}

interface UseCompletionProps {
  learningMode: 'new' | 'review' | null;
  planId: number | null;
  unitId: number | undefined | null;
  unitNumber: number | undefined | null;
  reviewUnits: TemporaryUnit[] | null;
  selectedReviewUnitId: number | null;
  startWordOrder: number | undefined;
  endWordOrder: number | undefined;
  originalWords: DisplayVocabularyWord[];
  originalWordsLength: number;
  setOriginalWords: (words: DisplayVocabularyWord[]) => void;
  setOriginalWordsLength: (len: number) => void;
  setReviewUnits: (units: TemporaryUnit[] | null) => void;
  setSelectedReviewUnitId: (id: number | null) => void;
  goToPage: (page: number) => void;
  setSearchQuery: (q: string) => void;
  setSwipeState: (s: any) => void;
  setAllReviewWords: (words: DisplayVocabularyWord[]) => void;
  allReviewWords: DisplayVocabularyWord[];
  handleReviewUnitSelect: (unit: TemporaryUnit) => void;
}

export function useCompletion(props: UseCompletionProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [learningComplete, setLearningComplete] = useState(false);
  const [remainingTaskType, setRemainingTaskType] = useState<'new' | 'review' | 'none' | null>(null);

  const handleCompletion = async () => {
    console.log('handleCompletion called - 此功能正在重构中，因为已删除LearningUnit架构');
    
    // 临时处理 - 仅显示提示信息
    toast.info("完成功能正在重构中", { 
      description: "由于架构变更，此功能需要重新实现基于单词学习阶段的完成逻辑" 
    });
    
    // TODO: 重新实现基于 WordLearningStage 的完成逻辑
    // 这应该包括：
    // 1. 推进单词学习阶段
    // 2. 基于单词而非单元的完成状态管理
    // 3. 新的复习逻辑
    
    setIsCompleting(false);
    setLearningComplete(true);
    setRemainingTaskType('none');
  };

  return {
    isCompleting,
    learningComplete,
    remainingTaskType,
    handleCompletion,
    setLearningComplete,
    setIsCompleting,
    setRemainingTaskType,
  };
} 