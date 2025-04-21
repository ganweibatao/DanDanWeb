import { useQuery, QueryFunctionContext, keepPreviousData } from "@tanstack/react-query";
import { getEbinghausMatrixData, ExtendedEbinghausMatrixData } from "../services/learningApi";

const MATRIX_DATA_QUERY_KEY = 'matrixData';

// Define the type for the query key
type MatrixDataQueryKey = [string, number | undefined];

// Explicitly type the query function
const fetchMatrixQueryFn = async ({ queryKey }: QueryFunctionContext<MatrixDataQueryKey>): Promise<ExtendedEbinghausMatrixData | null> => {
  const [, id] = queryKey;
  if (!id) {
    return null; // Return null if no planId
  }
  try {
    // getEbinghausMatrixData already returns the correct type or throws
    return await getEbinghausMatrixData(id);
  } catch (error) {
    throw error; // Re-throw error
  }
};

export function useMatrixData(planId?: number | null) {
  const id = planId ? Number(planId) : undefined;

  // Use React Query to fetch matrix data
  const {
    data: matrixData, // data will be ExtendedEbinghausMatrixData | null
    isLoading: isLoadingMatrix,
    error: matrixError, // error will be Error | null
    // No need for setMatrixData, fetchMatrixData etc.
  } = useQuery<ExtendedEbinghausMatrixData | null, Error, ExtendedEbinghausMatrixData | null, MatrixDataQueryKey>({
    queryKey: [MATRIX_DATA_QUERY_KEY, id],
    queryFn: fetchMatrixQueryFn,
    enabled: !!id,
    staleTime: 60 * 60 * 1000, // 15 minutes staleTime
    placeholderData: keepPreviousData,
  });

  return {
    matrixData,
    isLoadingMatrix,
    matrixError,
    // fetchMatrixData and setMatrixData are removed
  };
} 