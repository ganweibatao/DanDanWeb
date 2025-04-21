import { useState } from "react";
import { toast } from "sonner";
import { markUnitAsLearned, markReviewAsCompleted, getTodaysLearning, LearningUnit } from "../../../services/learningApi";
import { DisplayVocabularyWord } from "../types";

interface UseCompletionProps {
  learningMode: 'new' | 'review' | null;
  planId: number | null;
  unitId: number | undefined | null;
  unitNumber: number | undefined | null;
  reviewUnits: LearningUnit[] | null;
  selectedReviewUnitId: number | null;
  startWordOrder: number | undefined;
  endWordOrder: number | undefined;
  originalWords: DisplayVocabularyWord[];
  originalWordsLength: number;
  setOriginalWords: (words: DisplayVocabularyWord[]) => void;
  setOriginalWordsLength: (len: number) => void;
  setReviewUnits: (units: LearningUnit[] | null) => void;
  setSelectedReviewUnitId: (id: number | null) => void;
  goToPage: (page: number) => void;
  setSearchQuery: (q: string) => void;
  setSwipeState: (s: any) => void;
  setAllReviewWords: (words: DisplayVocabularyWord[]) => void;
  allReviewWords: DisplayVocabularyWord[];
  handleReviewUnitSelect: (unit: LearningUnit) => void;
}

export function useCompletion({
  learningMode,
  planId,
  unitId,
  unitNumber,
  reviewUnits,
  selectedReviewUnitId,
  startWordOrder,
  endWordOrder,
  originalWords,
  originalWordsLength,
  setOriginalWords,
  setOriginalWordsLength,
  setReviewUnits,
  setSelectedReviewUnitId,
  goToPage,
  setSearchQuery,
  setSwipeState,
  setAllReviewWords,
  allReviewWords,
  handleReviewUnitSelect,
}: UseCompletionProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [learningComplete, setLearningComplete] = useState(false);
  const [remainingTaskType, setRemainingTaskType] = useState<'new' | 'review' | 'none' | null>(null);

  const handleCompletion = async () => {
    console.log('handleCompletion called', {
      learningMode,
      selectedReviewUnitId,
      reviewUnits,
      currentUnit: reviewUnits?.find(u => u.id === selectedReviewUnitId)
    });
    // --- 复习模式逻辑 --- 
    if (learningMode === 'review' && selectedReviewUnitId && reviewUnits) {
      setIsCompleting(true);
      let allUnitsNowCompleted = false;
      try {
        const currentUnit = reviewUnits.find(u => u.id === selectedReviewUnitId);
        if (currentUnit && currentUnit.reviews && currentUnit.reviews.length > 0) {
          const reviewToMark = currentUnit.reviews.find(r => !r.is_completed) || currentUnit.reviews[0];
          console.log('准备调用 markReviewAsCompleted', reviewToMark?.id, reviewToMark);
          await markReviewAsCompleted(reviewToMark.id);
          toast.success(`List ${currentUnit.unit_number} 复习完成！`);
          const updatedReviewUnits = reviewUnits.map(unit => {
            if (unit.id === currentUnit.id) {
              return {
                ...unit,
                reviews: unit.reviews.map(review =>
                  review.id === reviewToMark.id ? { ...review, is_completed: true, completed_at: new Date().toISOString() } : review
                )
              };
            }
            return unit;
          });
          setReviewUnits(updatedReviewUnits);
          const stillUncompletedUnits = updatedReviewUnits.filter(unit => 
              unit.reviews.some(r => !r.is_completed)
          );
          if (stillUncompletedUnits.length > 0) {
            let nextUnit = stillUncompletedUnits[0];
            const currentUnitIndexInUpdated = updatedReviewUnits.findIndex(u => u.id === selectedReviewUnitId);
            for (let i = 1; i < updatedReviewUnits.length; i++) {
              const checkIndex = (currentUnitIndexInUpdated + i) % updatedReviewUnits.length;
              const potentialNextUnit = updatedReviewUnits[checkIndex];
              if (potentialNextUnit.reviews.some(r => !r.is_completed)) {
                  nextUnit = potentialNextUnit;
                  break;
              }
            }
            setSelectedReviewUnitId(nextUnit.id);
            handleReviewUnitSelect(nextUnit);
            setLearningComplete(false);
          } else {
            allUnitsNowCompleted = true;
            setLearningComplete(true);
            setOriginalWords([]);
            setSelectedReviewUnitId(null);
          }
        } else {
           toast.error('无法找到当前复习单元信息');
        }
      } catch (e: any) {
        toast.error(`完成 List 复习失败: ${e.message || '请重试'}`);
      } finally {
        setIsCompleting(false);
      }
      if (allUnitsNowCompleted) return;
    }
    // --- 新词模式逻辑 ---
    if (!planId || !learningMode) {
         if (learningMode === 'review') {
             return;
         }
        toast.error("无法完成学习：缺少必要信息。", { description: `PlanID: ${planId}, Mode: ${learningMode}`});
        return;
    }
    if (learningMode === 'new') {
        setIsCompleting(true);
        setRemainingTaskType(null);
        let markSuccess = false;
        const oppositeMode = 'review';
        try {
            if (typeof unitId === 'number') {
                const options: { start_word_order?: number; end_word_order?: number } = {};
                if (startWordOrder !== undefined) {
                    options.start_word_order = startWordOrder;
                }
                if (endWordOrder !== undefined) {
                    options.end_word_order = endWordOrder;
                }
                if (options.start_word_order === undefined && options.end_word_order === undefined && originalWordsLength > 0) {
                    options.start_word_order = 1;
                    options.end_word_order = originalWordsLength;
                }
                await markUnitAsLearned(unitId);
                markSuccess = true;
                toast.success("新学单元已完成！");
                const wordsToCache = originalWords.slice(0, originalWordsLength);
                if (typeof unitId === 'number') {
                    const lastLearnedNewUnitData = {
                        unitId: unitId,
                        unitNumber: unitNumber,
                        words: wordsToCache,
                        timestamp: Date.now()
                    };
                    try {
                        localStorage.setItem(`lastLearnedNewUnit_${planId}`, JSON.stringify(lastLearnedNewUnitData));
                    } catch (storageError) {
                        toast.warning("无法保存本次新学记录以供稍后温习。", { description: "浏览器存储可能已满。" });
                    }
                }
            } else {
               toast.error("无法标记完成：缺少新学单元 ID。", { description: `Received unitId: ${unitId}` });
            }
            if (markSuccess) {
                const remainingData = await getTodaysLearning(planId, oppositeMode);
                if (remainingData.review_units?.some(unit => unit.reviews.some(r => !r.is_completed))) {
                     setRemainingTaskType('review');
                } else {
                     setRemainingTaskType('none');
                }
                setLearningComplete(true);
            }
        } catch (error: any) {
            toast.error(`完成学习时出错: ${error.message || '请稍后重试'}`);
        } finally { 
            setIsCompleting(false); 
        }
    }
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