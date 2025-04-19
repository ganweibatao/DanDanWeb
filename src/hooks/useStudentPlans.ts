import { useState, useCallback, useEffect } from 'react';
import { getAllPlansForStudent, LearningPlan } from '../services/learningApi';

interface UseStudentPlansResult {
  allStudentPlans: LearningPlan[];
  currentlySelectedPlanId: number | null;
  isLoadingPlan: boolean;
  planError: string | null;
  handleSelectPlan: (plan: LearningPlan) => void;
  fetchStudentPlans: () => Promise<void>;
}

export function useStudentPlans(studentId?: string | number | null): UseStudentPlansResult {
  const [allStudentPlans, setAllStudentPlans] = useState<LearningPlan[]>([]);
  const [currentlySelectedPlanId, setCurrentlySelectedPlanId] = useState<number | null>(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState<boolean>(false);
  const [planError, setPlanError] = useState<string | null>(null);

  const fetchStudentPlans = useCallback(async () => {
    if (!studentId) {
        console.log('[useStudentPlans] fetchStudentPlans skipped: no studentId');
        setAllStudentPlans([]); // Clear plans if no studentId
        setCurrentlySelectedPlanId(null);
        return;
    }
    console.log(`[useStudentPlans] Fetching plans for studentId: ${studentId}`);
    setIsLoadingPlan(true);
    setPlanError(null);
    try {
      const plans = await getAllPlansForStudent(studentId);
      console.log('[useStudentPlans] Plans fetched:', plans);
      setAllStudentPlans(plans);
      
      // Determine initial active plan ID
      const activePlan = plans.find(p => p.is_active) || plans[0] || null;
      const initialPlanId = activePlan ? activePlan.id : null;
      console.log(`[useStudentPlans] Setting initial currentlySelectedPlanId to: ${initialPlanId}`);
      setCurrentlySelectedPlanId(initialPlanId);

    } catch (error: any) {
      console.error('[useStudentPlans] 获取学生计划列表失败:', error);
      setPlanError(error.message || "获取学习计划失败");
      setAllStudentPlans([]);
      setCurrentlySelectedPlanId(null);
    } finally {
      console.log('[useStudentPlans] Fetch finished.');
      setIsLoadingPlan(false);
    }
  }, [studentId]);

  useEffect(() => {
    console.log('[useStudentPlans] useEffect triggered due to fetchStudentPlans change.');
    fetchStudentPlans();
  }, [fetchStudentPlans]);

  const handleSelectPlan = (plan: LearningPlan) => {
    console.log(`[useStudentPlans] handleSelectPlan called with planId: ${plan.id}`);
    setCurrentlySelectedPlanId(plan.id);
  };

  // Add log before returning to check if the reference changes unexpectedly
  console.log('[useStudentPlans] Returning value. allStudentPlans length:', allStudentPlans.length, 'Reference check:', allStudentPlans);

  return {
    allStudentPlans,
    currentlySelectedPlanId,
    isLoadingPlan,
    planError,
    handleSelectPlan,
    fetchStudentPlans,
  };
} 