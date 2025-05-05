import { useState, useCallback, useEffect } from 'react';
import { useQuery, QueryFunctionContext, keepPreviousData } from '@tanstack/react-query';
import { getAllPlansForStudent, LearningPlan } from '../services/learningApi';

interface UseStudentPlansResult {
  allStudentPlans: LearningPlan[] | undefined;
  currentlySelectedPlanId: number | null;
  isLoadingPlan: boolean;
  planError: Error | null;
  handleSelectPlan: (plan: LearningPlan) => void;
}

const STUDENT_PLANS_QUERY_KEY = 'studentPlans';

// Define the type for the query key
type StudentPlansQueryKey = [string, number | undefined];

// Explicitly type the query function
const fetchPlansQueryFn = async ({ queryKey }: QueryFunctionContext<StudentPlansQueryKey>): Promise<LearningPlan[]> => {
  const [, id] = queryKey;
  if (!id) {
      return []; // Return empty array if id is not available
  }
  try {
    return await getAllPlansForStudent(id);
  } catch (error) {
     throw error;
  }
};

export function useStudentPlans(studentId?: string | number | null): UseStudentPlansResult {
  // 修改初始化逻辑，尝试从localStorage读取上次选择的planId
  const [currentlySelectedPlanId, setCurrentlySelectedPlanId] = useState<number | null>(() => {
    if (studentId) {
      const localStorageKey = `lastSelectedPlanId_${studentId}`;
      const savedPlanId = localStorage.getItem(localStorageKey);
      if (savedPlanId) {
        const parsedId = parseInt(savedPlanId, 10);
        if (!isNaN(parsedId)) {
          return parsedId;
        }
      }
    }
    return null;
  });
  
  const id = studentId ? Number(studentId) : undefined;

  // 保存选择的planId到localStorage
  useEffect(() => {
    if (currentlySelectedPlanId !== null && studentId) {
      const localStorageKey = `lastSelectedPlanId_${studentId}`;
      localStorage.setItem(localStorageKey, currentlySelectedPlanId.toString());
    }
  }, [currentlySelectedPlanId, studentId]);

  const {
    data: fetchedPlans,
    isLoading: isLoadingPlan,
    error: queryError,
    isSuccess,
    isError,
  } = useQuery<LearningPlan[], Error, LearningPlan[], StudentPlansQueryKey>({
    queryKey: [STUDENT_PLANS_QUERY_KEY, id],
    queryFn: fetchPlansQueryFn,
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  useEffect(() => {
    if (isSuccess && fetchedPlans) {
      if (currentlySelectedPlanId === null && fetchedPlans.length > 0) {
        const activePlan = fetchedPlans.find((p: LearningPlan) => p.is_active) || fetchedPlans[0];
        if (activePlan) {
          setCurrentlySelectedPlanId(activePlan.id);
        }
      }
    } else if (isError) {
        setCurrentlySelectedPlanId(null);
    }
  }, [isSuccess, isError, fetchedPlans, queryError, currentlySelectedPlanId]);

  const handleSelectPlan = useCallback((plan: LearningPlan) => {
    setCurrentlySelectedPlanId(plan.id);
  }, []);

  return {
    allStudentPlans: fetchedPlans,
    currentlySelectedPlanId,
    isLoadingPlan,
    planError: queryError,
    handleSelectPlan,
  };
} 