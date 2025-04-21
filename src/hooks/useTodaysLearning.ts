import { useQuery, QueryFunctionContext, keepPreviousData } from '@tanstack/react-query';
import { getTodaysLearning, TodayLearningResponse, LearningUnit } from '../services/learningApi';

const TODAYS_LEARNING_QUERY_KEY = 'todaysLearning';

export interface CombinedTodayLearning {
    newUnit: LearningUnit | null;
    reviewUnits: LearningUnit[] | null;
    dayNumber?: number;
}

// Define the type for the query key
type TodaysLearningQueryKey = [string, number | undefined];

// Explicitly type the query function
const fetchCombinedTodaysLearning = async ({ queryKey }: QueryFunctionContext<TodaysLearningQueryKey>): Promise<CombinedTodayLearning> => {
  const [, planId] = queryKey;
  if (!planId) {
    return { newUnit: null, reviewUnits: null, dayNumber: undefined };
  }

  try {
    const [newRes, reviewRes] = await Promise.all([
      getTodaysLearning(planId, 'new'),
      getTodaysLearning(planId, 'review')
    ]);


    return {
      newUnit: newRes.new_unit,
      reviewUnits: Array.isArray(reviewRes.review_units) ? reviewRes.review_units : null,
      dayNumber: newRes.day_number ?? reviewRes.day_number,
    };
  } catch (error) {
    throw error; // Re-throw
  }
};

export function useTodaysLearning(planId?: number | null) {
  const id = planId ? Number(planId) : undefined;

  const {
      data: todaysLearningData,
      isLoading: isLoadingTodaysLearning,
      error: todaysLearningError,
      refetch: refetchTodaysLearning,
  } = useQuery<CombinedTodayLearning, Error, CombinedTodayLearning, TodaysLearningQueryKey>({
    queryKey: [TODAYS_LEARNING_QUERY_KEY, id],
    queryFn: fetchCombinedTodaysLearning,
    enabled: !!id,
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: true,
    placeholderData: keepPreviousData,
  });

  return {
    todaysLearningData,
    isLoadingTodaysLearning,
    todaysLearningError,
    refetchTodaysLearning,
  };
} 