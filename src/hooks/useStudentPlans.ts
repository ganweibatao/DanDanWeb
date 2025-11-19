import { useState, useCallback, useEffect } from 'react';
import { useQuery, QueryFunctionContext, keepPreviousData } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  
  // 修改初始化逻辑，优先从URL参数读取planId，然后从localStorage读取上次选择的planId
  const [currentlySelectedPlanId, setCurrentlySelectedPlanId] = useState<number | null>(() => {
    // 首先检查URL中的planId参数
    const urlPlanId = searchParams.get('planId');
    if (urlPlanId) {
      const parsedUrlPlanId = parseInt(urlPlanId, 10);
      if (!isNaN(parsedUrlPlanId)) {
        return parsedUrlPlanId;
      }
    }
    
    // 如果URL中没有planId，则从localStorage读取
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

  // 监听URL参数变化，当URL中的planId改变时更新当前选择的planId
  useEffect(() => {
    const urlPlanId = searchParams.get('planId');
    if (urlPlanId) {
      const parsedUrlPlanId = parseInt(urlPlanId, 10);
      if (!isNaN(parsedUrlPlanId) && parsedUrlPlanId !== currentlySelectedPlanId) {
        setCurrentlySelectedPlanId(parsedUrlPlanId);
      }
    }
  }, [searchParams, currentlySelectedPlanId]);

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
      const planIds = fetchedPlans.map(p => p.id);
      
      // 检查URL中是否有planId参数
      const urlPlanId = searchParams.get('planId');
      if (urlPlanId) {
        const parsedUrlPlanId = parseInt(urlPlanId, 10);
        if (!isNaN(parsedUrlPlanId) && planIds.includes(parsedUrlPlanId)) {
          // 如果URL中的planId存在于计划列表中，则使用它
          if (currentlySelectedPlanId !== parsedUrlPlanId) {
            setCurrentlySelectedPlanId(parsedUrlPlanId);
          }
          return; // 提前返回，不执行后续的默认选择逻辑
        }
      }
      
      // 如果当前选择的ID不在获取到的计划列表中，或者当前没有选择任何计划
      if ((currentlySelectedPlanId === null || !planIds.includes(currentlySelectedPlanId)) && fetchedPlans.length > 0) {
        // 优先选择激活的计划，否则选择第一个
        const planToSelect = fetchedPlans.find((p: LearningPlan) => p.is_active) || fetchedPlans[0];
        setCurrentlySelectedPlanId(planToSelect.id);
      } else if (fetchedPlans.length === 0) {
        // 如果没有计划，则清空ID
        setCurrentlySelectedPlanId(null);
      }
    } else if (isError) {
        setCurrentlySelectedPlanId(null);
    }
  }, [isSuccess, isError, fetchedPlans, currentlySelectedPlanId, searchParams]);

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