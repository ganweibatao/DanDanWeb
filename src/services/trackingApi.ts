import { apiClient, handleApiError } from './api';

export interface DurationLogPayload {
  type: 'learning' | 'teaching' | 'other';
  duration: number;
  client_start_time?: string;
  client_end_time?: string;
  // user 字段无需前端传递，由后端自动归属
}

export async function reportDurationLog(payload: DurationLogPayload) {
  try {
    // 移除 user 字段，仅传递必要参数
    const { type, duration, client_start_time, client_end_time } = payload;
    const res = await apiClient.post('/tracking/logs/', {
      type,
      duration,
      client_start_time,
      client_end_time,
    });
    return res.data;
  } catch (error) {
    return handleApiError(error, '上报时长失败');
  }
}

export async function forceReportStudentDuration(payload: {
  student_id: string;
  duration: number;
  client_start_time?: string;
  client_end_time?: string;
}) {
  try {
    const res = await apiClient.post('/tracking/logs/force_report/', payload);
    return res.data;
  } catch (error) {
    return handleApiError(error, '强制上报失败');
  }
} 