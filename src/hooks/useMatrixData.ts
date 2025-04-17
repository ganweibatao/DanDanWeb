import { useState, useEffect, useCallback } from "react";
import { getEbinghausMatrixData, EbinghausMatrixData } from "../services/learningApi";

export interface ExtendedEbinghausMatrixData extends EbinghausMatrixData {
  has_unused_lists: boolean;
  max_actual_unit_number: number;
  estimated_unit_count: number;
}

export function useMatrixData(planId?: number | null) {
  const [matrixData, setMatrixData] = useState<ExtendedEbinghausMatrixData | null>(null);
  const [isLoadingMatrix, setIsLoadingMatrix] = useState(false);
  const [matrixError, setMatrixError] = useState<string | null>(null);

  const fetchMatrixData = useCallback(async (id?: number | null) => {
    if (!id) return;
    setIsLoadingMatrix(true);
    setMatrixError(null);
    try {
      const data = await getEbinghausMatrixData(id) as ExtendedEbinghausMatrixData;
      setMatrixData(data);
    } catch (error: any) {
      setMatrixError(error.message || "获取矩阵数据失败");
    } finally {
      setIsLoadingMatrix(false);
    }
  }, []);

  useEffect(() => {
    if (planId) {
      fetchMatrixData(planId);
    } else {
      setMatrixData(null);
    }
  }, [planId, fetchMatrixData]);

  return {
    matrixData,
    isLoadingMatrix,
    matrixError,
    fetchMatrixData,
    setMatrixData,
  };
} 