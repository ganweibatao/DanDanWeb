import { apiClient, handleApiError } from './api';

export interface DurationLogPayload {
  type: 'learning' | 'teaching' | 'other';
  duration: number;
  client_start_time?: string;
  client_end_time?: string;
  student?: string | number | null;
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
export const fetchAllUserLogs = async (filters?: { studentId?: number | string | null; date?: string | null }): Promise<UserDurationLog[]> => {
  // Construct query parameters based on filters
  const params = new URLSearchParams();
  params.append('type', 'teaching'); // Always fetch teaching logs for this context

  if (filters?.studentId) {
    params.append('student', String(filters.studentId)); // Backend expects 'student' param for student ID
  }
  if (filters?.date) {
    params.append('date', filters.date);
  }

  const queryString = params.toString();
  const url = `/tracking/logs/?${queryString}`;
  console.log("Fetching logs from URL:", url); // Log the final URL for debugging

  try {
    const response = await apiClient.get<UserDurationLog[] | { results: UserDurationLog[] }>(url); // Use the constructed URL
    
    // Check if the response data is an array directly or nested under 'results'
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && Array.isArray(response.data.results)) {
      return response.data.results;
    } else {
      console.error('Unexpected API response format for duration logs:', response.data);
      return []; 
    }

  } catch (error: any) {
    // Basic error handling, consider more specific error messages
    console.error('Error fetching user duration logs:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch duration logs');
  }
};

// Add functions for summary, force_report if needed later 