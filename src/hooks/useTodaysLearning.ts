import { useQuery, QueryFunctionContext, keepPreviousData } from '@tanstack/react-query';
import { getWordsWithStages, WordStage } from '../services/learningApi';

const TODAYS_LEARNING_QUERY_KEY = 'todaysLearning';

export interface TodaysWordsData {
    words: WordStage[];
}

// Define the type for the query key
type TodaysWordsQueryKey = [string, number | undefined];

// The query function now only fetches words with their stages.
const fetchTodaysWords = async ({ queryKey }: QueryFunctionContext<TodaysWordsQueryKey>): Promise<TodaysWordsData> => {
  const [, planId] = queryKey;
  if (!planId) {
    return { words: [] };
  }

  try {
    const words = await getWordsWithStages(planId);
    return { words };
  } catch (error) {
    console.error('Failed to fetch words with stages:', error);
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
  } = useQuery<TodaysWordsData, Error, TodaysWordsData, TodaysWordsQueryKey>({
    queryKey: [TODAYS_LEARNING_QUERY_KEY, id],
    queryFn: fetchTodaysWords,
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