import { LearningUnit } from "../services/learningApi";

export interface TodayLearningStatus {
  newUnit: LearningUnit | null;
  reviewUnits: LearningUnit[] | null;
  isLoading: boolean;
  error: string | null;
}

interface ApiResult {
  new_unit?: LearningUnit | null;
  review_units?: LearningUnit[] | null;
}

/**
 * 统一处理后端接口返回的今日学习状态
 * @param apiResult 后端接口返回的对象，包含 new_unit, review_units
 * @param loading 是否加载中
 * @param error 错误信息
 */
export function useTodayLearningStatus(
  apiResult: ApiResult | null,
  loading: boolean,
  error: string | null
): TodayLearningStatus {
  
  const result = {
    newUnit: apiResult?.new_unit ?? null,
    reviewUnits: apiResult?.review_units ?? null,
    isLoading: loading,
    error: error,
  };
  
  return result;
} 