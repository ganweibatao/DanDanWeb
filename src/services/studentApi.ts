import { apiClient } from './api';
import type { StudentProfile } from '../types/models';

// 获取单个学生信息
export async function fetchStudentProfile(studentId: string | number): Promise<StudentProfile> {
  const res = await apiClient.get<StudentProfile>(`accounts/students/${studentId}/`);
  return res.data;
}

// 更新学生信息（支持部分字段）
export async function updateStudentProfile(studentId: string | number, data: Partial<StudentProfile>): Promise<StudentProfile> {
  let headers = {};
  let payload: any = data;
  const endpoint = studentId === 'me' ? 'accounts/users/me/' : `accounts/students/${studentId}/`;

  if (data.avatar && typeof data.avatar === 'object' && (data.avatar as any) instanceof File) {
    // 构建 FormData
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value as any);
      }
    });
    payload = formData;
    headers = { 'Content-Type': 'multipart/form-data' };
  } else {
    headers = { 'Content-Type': 'application/json' };
  }
  const res = await apiClient.patch<StudentProfile>(endpoint, payload, { headers });
  return res.data;
} 