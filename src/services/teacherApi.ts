import { apiClient, handleApiError } from './api';
// 导入 Student 接口 - 如果需要，调整路径，或稍后将其移至 types 文件
import type { Student } from '../screens/Teachers/TeacherPage';
import axios from 'axios'; // 需要导入 axios 来使用 isAxiosError

// 定义教师资料接口
export interface TeacherProfile {
  id: string;
  username: string;
  email: string; // 或者其他标识符
  avatar?: string | null;
  gender?: 'male' | 'female' | 'other';
  age?: number;
  province?: string;
  city?: string;
  // teaching_hours?: number; // Remove this if relying on the new endpoint
  university?: string | null;       // 学校
  phone_number?: string | null;     // 电话
  teaching_years?: number | null;    // 教育年限
  education_level?: string | null; // 教育水平
  english_level?: string | null;   // 英语水平
  bio?: string | null;              // 个性签名
  // 可以添加其他教师特有字段
}

// 定义创建学生时的 payload 结构
// 排除后端生成的字段 (id, user, created_at, updated_at)
// 使可选字段真正可选
// 重命名为 CreateStudentPayload 以提高清晰度
export type CreateStudentPayload = Omit<Student, 'id' | 'user' | 'avatar' | 'avatarFallback' | 'teacher' | 'teacher_name' | 'created_at' | 'updated_at' | 'level' | 'interests' | 'learning_goal' | 'name'> & {
    username: string; // 显式声明必填字段
    email: string;
    grade: string; // 确保 grade 在这里也是必填的
    password?: string; // 密码对于创建是必需的，但未在基础 Student 模型中显示
    age?: number | null;
    gender?: 'male' | 'female' | 'other' | '';
    phone_number?: string | null;
    personality_traits?: string; // 前端使用 personality_traits
};

// 允许更新大多数 Student 字段，密码是可选的
export type StudentPayload = Partial<Omit<Student, 'id' | 'user' | 'avatar' | 'avatarFallback' | 'teacher' | 'teacher_name' | 'created_at' | 'updated_at' | 'learning_hours'>> & {
  password?: string; // 允许更新密码
  personality_traits?: string; // 允许更新性格特点（保持前端命名）
  // 确保类型与 Student 接口一致，但都是可选的
  username?: string;
  email?: string;
  grade?: string;
  age?: number | null;
  gender?: 'male' | 'female' | 'other' | '';
  phone_number?: string | null;
};


// 定义分页学生列表接口的预期结构
interface PaginatedStudentResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: any[]; // 暂时使用 'any'，如果知道后端结构，则进行优化
}

// 辅助函数：处理单个学生数据，确保类型正确
const processStudentData = (student: any): Student => {
    const learningHoursString = student.learning_hours;
    let learningHoursNumber: number | undefined = undefined;
    if (learningHoursString) {
        const parsed = parseFloat(learningHoursString);
        if (!isNaN(parsed)) {
            learningHoursNumber = parsed;
        }
    }

    const id = parseInt(student.id, 10);
    const user = parseInt(student.user, 10);

    return {
        ...student,
        id: isNaN(id) ? -1 : id,
        user: isNaN(user) ? -1 : user,
        learning_hours: learningHoursNumber,
        avatarFallback: student.username?.[0]?.toUpperCase() || 'S',
        name: student.name || student.username,
        age: student.age ? parseInt(student.age, 10) : null,
        teacher: student.teacher ? parseInt(student.teacher, 10) : null,
        // 确保 grade 和 gender 等字段类型正确，或提供默认值/null
        grade: student.grade || null,
        gender: student.gender || '',
    };
};

// 定义获取总教学时长的响应接口
interface TotalTeachingHoursResponse {
    total_teaching_hours: number;
}

export const teacherService = {
    /**
     * 获取教师的学生列表。
     * 处理响应中可能存在的分页。
     */
    fetchStudents: async (): Promise<Student[]> => {
        try {
            // 确保端点正确
            const response = await apiClient.get<Student[] | PaginatedStudentResponse>('/accounts/students/');

            // 检查数据是否具有 'results' 属性（表示分页）
            const studentList = Array.isArray(response.data)
                ? response.data
                : response.data?.results;

            if (!Array.isArray(studentList)) {
                console.error("学生列表的 API 响应格式不符合预期:", response.data);
                throw new Error("从服务器收到的学生数据格式无效。");
            }

            // 使用辅助函数处理每个学生的数据
            const processedData: Student[] = studentList.map(processStudentData);
            return processedData;

        } catch (error) {
            // 使用 handleApiError 进行统一错误处理
            return handleApiError(error, '获取学生列表失败');
        }
    },

    /**
     * 创建与教师关联的新学生。
     */
    createStudent: async (payload: CreateStudentPayload): Promise<Student> => {
        try {
            // 处理 personality_traits 到 personality 的映射
            const { personality_traits, ...restPayload } = payload;
            const backendPayload = {
                ...restPayload,
                ...(personality_traits && { personality: personality_traits })
            };

            // 确保端点正确
            const response = await apiClient.post<any>('/accounts/teachers/create_student/', backendPayload); // 使用 any 接收原始数据
            // 使用辅助函数处理返回的学生数据
            return processStudentData(response.data);
        } catch (error) {
             // 针对学生创建的特定错误处理，否则重新抛出
            if (axios.isAxiosError(error) && error.response?.data) {
                 // 尝试从后端响应中提取特定的错误消息
                 const errorData = error.response.data as any; // 使用 'any' 或定义特定的错误类型
                 let errorMessage = '添加学生失败，请检查信息或稍后重试。';
                 // 示例：检查常见的字段错误（根据后端调整键）
                 if (errorData.username) errorMessage = `用户名错误: ${Array.isArray(errorData.username) ? errorData.username.join(', ') : errorData.username}`;
                 else if (errorData.email) errorMessage = `邮箱错误: ${Array.isArray(errorData.email) ? errorData.email.join(', ') : errorData.email}`;
                 else if (errorData.password) errorMessage = `密码错误: ${Array.isArray(errorData.password) ? errorData.password.join(', ') : errorData.password}`;
                 else if (errorData.grade) errorMessage = `年级错误: ${Array.isArray(errorData.grade) ? errorData.grade.join(', ') : errorData.grade}`;
                 else if (errorData.detail) errorMessage = errorData.detail; // 通用 detail 错误
                 else if (errorData.error) errorMessage = errorData.error; // 自定义 'error' 键
                 // 检查非字段错误
                 else if (errorData.non_field_errors) errorMessage = Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors.join(', ') : errorData.non_field_errors;


                 throw new Error(errorMessage);
            }
             // 使用统一错误处理
            return handleApiError(error, '添加学生失败');
        }
    },

    // --- 新增 updateStudent 方法 ---
    /**
     * 更新现有学生的信息。
     * @param studentId 要更新的学生的 ID。
     * @param payload 包含要更新的字段的 StudentPayload 对象。
     */
    updateStudent: async (studentId: number, payload: StudentPayload): Promise<Student> => {
        try {
            // 处理 personality_traits 到 personality 的映射
            const { personality_traits, ...restPayload } = payload;
            const backendPayload = {
                ...restPayload,
                ...(personality_traits && { personality: personality_traits }),
                // 如果密码为空字符串，则不发送密码字段，否则后端可能会尝试设置空密码
                ...(restPayload.password === '' && { password: undefined }),
            };

            // 过滤掉值为 undefined 的字段，因为 PATCH 通常只发送要更改的字段
             const filteredPayload = Object.entries(backendPayload).reduce((acc, [key, value]) => {
               if (value !== undefined) {
                 acc[key] = value;
               }
               return acc;
             }, {} as Record<string, any>);


            // 假设更新端点是 /accounts/students/{id}/ 并使用 PATCH 方法
            // 注意：请根据你的实际后端 API 调整端点和方法 (PATCH 或 PUT)
            const response = await apiClient.patch<any>(`/accounts/students/${studentId}/`, filteredPayload); // 使用 any 接收原始数据
            
            // 使用辅助函数处理返回的更新后的学生数据
            return processStudentData(response.data);
        } catch (error) {
            // 针对学生更新的特定错误处理
            if (axios.isAxiosError(error) && error.response?.data) {
                const errorData = error.response.data as any;
                let errorMessage = '更新学生失败，请检查信息或稍后重试。';
                // 类似 createStudent 的错误提取逻辑
                 if (errorData.username) errorMessage = `用户名错误: ${Array.isArray(errorData.username) ? errorData.username.join(', ') : errorData.username}`;
                 else if (errorData.email) errorMessage = `邮箱错误: ${Array.isArray(errorData.email) ? errorData.email.join(', ') : errorData.email}`;
                 else if (errorData.password) errorMessage = `密码错误: ${Array.isArray(errorData.password) ? errorData.password.join(', ') : errorData.password}`;
                 else if (errorData.grade) errorMessage = `年级错误: ${Array.isArray(errorData.grade) ? errorData.grade.join(', ') : errorData.grade}`;
                 else if (errorData.detail) errorMessage = errorData.detail; 
                 else if (errorData.error) errorMessage = errorData.error;
                 else if (errorData.non_field_errors) errorMessage = Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors.join(', ') : errorData.non_field_errors;
                throw new Error(errorMessage);
            }
            // 使用统一错误处理
            return handleApiError(error, '更新学生失败');
        }
    },
    // --- 结束新增 updateStudent 方法 ---

    /**
     * 获取单个学生的详细信息。
     * @param studentId 要获取详情的学生 ID。
     * @returns 一个解析为 Student 对象或在出错时抛出错误的 Promise。
     */
    getStudentById: async (studentId: number | string): Promise<Student> => {
        try {
            // 访问单个学生详情的端点
            const response = await apiClient.get<any>(`/accounts/students/${studentId}/`);
            
            // 使用辅助函数处理返回的学生数据
            return processStudentData(response.data);
        } catch (error) {
            // 使用统一错误处理
            return handleApiError(error, `获取学生 ${studentId} 详情失败`);
        }
    },

    /**
     * 从教师的教室中移除（解除关联）学生。
     */
    removeStudent: async (studentId: number): Promise<void> => {
        try {
            // 确保端点和 payload 正确
            await apiClient.post(`/accounts/teachers/remove-student/`, { student_id: studentId });
        } catch (error) {
             // 针对学生移除的特定错误处理
             if (axios.isAxiosError(error) && error.response?.data) {
                 const errorData = error.response.data as any;
                 // 优先使用后端返回的具体错误信息
                 throw new Error(errorData.error || errorData.detail || '移除学生失败');
             }
             // 使用统一错误处理
            return handleApiError(error, '移除学生失败');
        }
    },

    /**
     * 获取教师所有学生的学习时长。
     *
     */
    fetchStudentsLearningHours: async (): Promise<{ student_id: number; learning_hours: number }[]> => {
        try {
             // 确保端点正确
            const response = await apiClient.get<{ student_id: number; learning_hours: number }[]>(`/accounts/students/learning-hours/`);
            // 确保返回的是一个数组
            if (!Array.isArray(response.data)) {
                 console.error("学生学习时长的 API 响应格式不符合预期:", response.data);
                 throw new Error("从服务器收到的学生学习时长数据格式无效。");
             }
             // 可以添加对每个元素结构的进一步验证
             // 返回数据
             return response.data;
         } catch (error) {
             // 使用 handleApiError 进行统一错误处理
             return handleApiError(error, '获取学生学习时长失败');
         }
     },

    /**
     * 获取教师信息
     * @param teacherId 教师 ID
     */
    fetchTeacherProfile: async (teacherId: string): Promise<TeacherProfile> => {
      // 添加 /accounts/ 前缀
      // URL: /api/v1/accounts/teachers/{teacherId}/
      try {
        const response = await apiClient.get(`/accounts/teachers/${teacherId}/`);
        return response.data;
      } catch (error) {
        return handleApiError(error, '获取教师信息失败');
      }
    },

    /**
     * 更新教师信息
     * @param teacherId 教师 ID
     * @param data 包含要更新的字段的 TeacherProfile 对象 (部分) 以及 avatar 文件
     */
    updateTeacherProfile: async (teacherId: string, data: Partial<TeacherProfile> & { avatar?: File | null }): Promise<TeacherProfile> => {
      // 添加 /accounts/ 前缀
      // URL: /api/v1/accounts/teachers/{teacherId}/
      try {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]: [string, any]) => {
          if (value !== undefined && value !== null) {
              if (value instanceof File) {
                  formData.append(key, value);
              } else {
                  formData.append(key, String(value));
              }
          }
        });

        const response = await apiClient.put(`/accounts/teachers/${teacherId}/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      } catch (error) {
        return handleApiError(error, '更新教师信息失败');
      }
    },

    // --- 新增获取总教学时长方法 ---
    /**
     * 获取当前登录教师的总教学时长（小时）。
     */
    fetchTotalTeachingHours: async (): Promise<number> => {
        try {
            // 调用新的后端端点
            const response = await apiClient.get<TotalTeachingHoursResponse>('/accounts/teachers/total-teaching-duration/');
            
            // 验证响应数据结构
            if (typeof response.data?.total_teaching_hours !== 'number') {
                console.error('获取总教学时长的 API 响应格式不符合预期:', response.data);
                throw new Error('从服务器收到的总教学时长数据格式无效。');
            }

            return response.data.total_teaching_hours;
        } catch (error) {
            // 使用统一错误处理，提供特定的错误消息
            return handleApiError(error, '获取总教学时长失败');
        }
    },
    // --- 结束新增方法 ---
};

// 确保导出了 CreateStudentPayload 和 StudentPayload
export type { Student }; // Re-export Student if needed elsewhere from this module
