import { useState, useCallback, useEffect } from 'react';
import { getAllPlansForStudent, LearningPlan } from '../services/learningApi';
import { useStudentPlanContext } from '../context/StudentPlanContext';

interface UseStudentPlansResult {
  allStudentPlans: LearningPlan[];
  currentlySelectedPlanId: number | null;
  isLoadingPlan: boolean;
  planError: string | null;
  handleSelectPlan: (plan: LearningPlan) => void;
  fetchStudentPlans: () => Promise<void>;
  inputWordsPerDay: string;
  setInputWordsPerDay: React.Dispatch<React.SetStateAction<string>>;
}

export function useStudentPlans(studentId?: string | number | null): UseStudentPlansResult {
  const [allStudentPlans, setAllStudentPlans] = useState<LearningPlan[]>([]);
  const [currentlySelectedPlanId, setCurrentlySelectedPlanId] = useState<number | null>(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState<boolean>(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [inputWordsPerDay, setInputWordsPerDay] = useState<string>("20");

  const {
    setCurrentLearningBook,
    setWordsPerDay,
  } = useStudentPlanContext();

  const fetchStudentPlans = useCallback(async () => {
    if (!studentId) return;
    setIsLoadingPlan(true);
    setPlanError(null);
    try {
      const plans = await getAllPlansForStudent(studentId);
      setAllStudentPlans(plans);
      const activePlan = plans.find(p => p.is_active) || plans[0] || null;
      setCurrentlySelectedPlanId(activePlan ? activePlan.id : null);
      if (activePlan) {
        setInputWordsPerDay(String(activePlan.words_per_day));
      } else {
        setInputWordsPerDay("20");
      }
      if (activePlan && activePlan.vocabulary_book) {
        const bookDetails = {
          id: activePlan.vocabulary_book.id,
          name: activePlan.vocabulary_book.name,
          word_count: activePlan.vocabulary_book.word_count,
        };
        setCurrentLearningBook(bookDetails);
        setWordsPerDay(activePlan.words_per_day);
      } else {
        console.warn('[useStudentPlans] 计划数据不完整', activePlan);
        setCurrentLearningBook(null);
        setWordsPerDay(20);
      }
    } catch (error: any) {
      console.error('[useStudentPlans] 获取学生计划列表失败:', error);
      setPlanError(error.message || "获取学习计划失败");
      setAllStudentPlans([]);
      setCurrentlySelectedPlanId(null);
      setInputWordsPerDay("20");
    } finally {
      setIsLoadingPlan(false);
    }
  }, [studentId, setCurrentLearningBook, setWordsPerDay]);

  useEffect(() => {
    fetchStudentPlans();
  }, [fetchStudentPlans]);

  useEffect(() => {
    if (currentlySelectedPlanId && allStudentPlans.length > 0) {
      const plan = allStudentPlans.find(p => p.id === currentlySelectedPlanId);
      if (plan) {
        setInputWordsPerDay(String(plan.words_per_day));
      }
    }
  }, [currentlySelectedPlanId, allStudentPlans]);

  const handleSelectPlan = (plan: LearningPlan) => {
    setCurrentlySelectedPlanId(plan.id);
    setInputWordsPerDay(String(plan.words_per_day));
  };

  return {
    allStudentPlans,
    currentlySelectedPlanId,
    isLoadingPlan,
    planError,
    handleSelectPlan,
    fetchStudentPlans,
    inputWordsPerDay,
    setInputWordsPerDay,
  };
} 