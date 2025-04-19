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
  // 添加详细的调试日志，以追踪API响应的结构
  console.log('[useTodayLearningStatus] apiResult:', apiResult);
  console.log('[useTodayLearningStatus] new_unit:', apiResult?.new_unit);
  console.log('[useTodayLearningStatus] review_units:', apiResult?.review_units);
  console.log('[useTodayLearningStatus] loading:', loading);
  console.log('[useTodayLearningStatus] error:', error);
  
  const result = {
    newUnit: apiResult?.new_unit ?? null,
    reviewUnits: apiResult?.review_units ?? null,
    isLoading: loading,
    error: error,
  };
  
  console.log('[useTodayLearningStatus] 返回结果:', result);
  return result;
} 