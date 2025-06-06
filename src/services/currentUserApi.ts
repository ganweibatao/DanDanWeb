import { apiClient } from './api';
import type { StudentProfile, TeacherProfile } from '../types/models';
import { authService } from './auth';

interface CurrentUserResponse {
  id: number; // This is the User ID (user.id)
  username: string;
  email: string;
  user_type: 'student' | 'teacher' | 'admin' | null;
  student_profile_id?: number; // This is the StudentProfile ID (Student.id)
  teacher_profile_id?: number; // This is the TeacherProfile ID (Teacher.id)
}

// 获取当前登录用户信息
export async function fetchCurrentStudentProfile(): Promise<StudentProfile> {
  // Step 1: Get basic user info and student_profile_id
  const currentUserResponse = await apiClient.get<CurrentUserResponse>('accounts/users/current/');
  const userData = currentUserResponse.data;

  if (userData.user_type === 'student' && userData.student_profile_id) {
    // Step 2: Fetch the full student profile using the student_profile_id
    const studentProfileResponse = await apiClient.get<StudentProfile>(`accounts/students/${userData.student_profile_id}/`);
    // The StudentSerializer on the backend should ensure that fields like username and email
    // (which are on the User model) are correctly included in the StudentProfile data.
    // If not, the StudentSerializer might need adjustment (e.g. using source='user.username').
    return studentProfileResponse.data;
  } else {
    // Handle cases where the user is not a student or data is missing
    // You might want to throw an error or return a specific object/null
    console.error('Current user is not a student or student_profile_id is missing.', userData);
    throw new Error('当前用户不是学生或学生档案信息不完整。');
  }
}

// 获取当前登录教师信息
export async function fetchCurrentTeacherProfile(): Promise<TeacherProfile> {
  // Step 1: Get basic user info and teacher_profile_id
  const currentUserResponse = await apiClient.get<CurrentUserResponse>('accounts/users/current/');
  const userData = currentUserResponse.data;

  if (userData.user_type === 'teacher' && userData.teacher_profile_id) {
    // Step 2: Fetch the full teacher profile using the teacher_profile_id
    const teacherProfileResponse = await apiClient.get<TeacherProfile>(`accounts/teachers/${userData.teacher_profile_id}/`);
    return teacherProfileResponse.data;
  } else {
    console.error('Current user is not a teacher or teacher_profile_id is missing.', userData);
    throw new Error('当前用户不是教师或教师档案信息不完整。');
  }
}