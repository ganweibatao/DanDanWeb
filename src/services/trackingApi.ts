import { apiClient, handleApiError } from './api';

export interface DurationLogPayload {
  type: 'learning' | 'teaching' | 'other';
  duration: number;
  client_start_time?: string;
  client_end_time?: string;
  student?: string | number | null;
  word_count?: number;
  wrong_word_count?: number;
  // user 字段无需前端传递，由后端自动归属
}

export interface DailyDuration {
  date: string;
  duration: number; // 单位：秒
}

export async function reportDurationLog(payload: DurationLogPayload) {
  try {
    // Include 'student' in the data sent to the backend if it exists in the payload
    const dataToSend: Partial<DurationLogPayload> = {
      type: payload.type,
      duration: payload.duration,
      client_start_time: payload.client_start_time,
      client_end_time: payload.client_end_time,
    };
    // Conditionally add student if it exists in the payload
    if (payload.student !== undefined && payload.student !== null) {
      dataToSend.student = payload.student;
    }
    if (payload.word_count !== undefined) {
      dataToSend.word_count = payload.word_count;
    }
    if (payload.wrong_word_count !== undefined) {
      dataToSend.wrong_word_count = payload.wrong_word_count;
    }
    
    const res = await apiClient.post('/tracking/logs/', dataToSend);
    return res.data;
  } catch (error) {
    return handleApiError(error, '上报时长失败');
  }
}

// 获取教师每日授课时长
export const getTeacherDailyTeachingDuration = async (): Promise<DailyDuration[]> => {
  const response = await apiClient.get<DailyDuration[]>('/tracking/teacher/daily_teaching_duration/');
  return response.data;
};

// Interface matching the backend UserDurationLogSerializer (adjust as needed)
export interface UserDurationLog {
  id: number;
  user: string; // Username string from StringRelatedField
  student_name: string | null; // Add student_name field (StringRelatedField can be null if student is null)
  type: 'learning' | 'teaching' | 'other';
  duration: number; // seconds
  client_start_time: string | null; // ISO date string or null
  client_end_time: string | null; // ISO date string or null
  created_at: string; // ISO date string
}

/**
 * Fetches duration logs for the authenticated user, with optional filters.
 * Filtering is now primarily done on the backend.
 */
export const fetchAllUserLogs = async (filters?: { studentId?: number | string | null; date?: string | null; page?: number; pageSize?: number }): Promise<{ results: UserDurationLog[]; count: number; next: string | null; previous: string | null }> => {
  // Construct query parameters based on filters
  const params = new URLSearchParams();
  params.append('type', 'teaching'); // Always fetch teaching logs for this context

  if (filters?.studentId) {
    params.append('student', String(filters.studentId));
  }
  if (filters?.date) {
    params.append('date', filters.date);
  }
  if (filters?.page) {
    params.append('page', String(filters.page));
  }
  if (filters?.pageSize) {
    params.append('page_size', String(filters.pageSize));
  }

  const queryString = params.toString();
  const url = `/tracking/logs/?${queryString}`;
  console.log("Fetching logs from URL:", url);

  try {
    const response = await apiClient.get<{ count: number; next: string | null; previous: string | null; results: UserDurationLog[] }>(url);
    if (response.data && Array.isArray(response.data.results)) {
      return response.data;
    } else {
      // 兼容老格式
      return { results: Array.isArray(response.data) ? response.data : [], count: 0, next: null, previous: null };
    }
  } catch (error: any) {
    console.error('Error fetching user duration logs:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch duration logs');
  }
};

// Add functions for summary, force_report if needed later 
export interface DailyLearningSummary {
  date: string;            // yyyy-MM-dd
  duration: number;        // 秒
  word_count: number;
  wrong_word_count: number;
  avg_per_word: number | null; // 分钟/词
  accuracy: number | null;     // 百分比 0-100
}

/**
 * 获取指定学生近 N 日的学习时长与效率统计
 * @param studentId 学生 ID
 * @param days      天数，默认 30
 */
export const fetchDailyLearningSummary = async (
  studentId: number | string,
  days: number = 30,
): Promise<Array<{
  date: string;
  duration: number;
  word_count: number;
  wrong_word_count: number;
  avg_per_word: number | null;
  accuracy: number | null;
}>> => {
  const url = `/tracking/student/${studentId}/daily_learning_summary/?days=${days}`;
  const res = await apiClient.get(url);
  return res.data || [];
}; 