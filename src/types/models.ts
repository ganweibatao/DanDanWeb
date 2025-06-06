export interface StudentProfile {
  id: number;
  user: number;
  username: string;
  email: string;
  avatar?: string | null;
  bio?: string;
  level?: string;
  personality_traits?: string;
  learning_goal?: string;
  gender?: string;
  created_at?: string;
  updated_at?: string;
  age?: number;
  province?: string;
  city?: string;
  grade?: string;
  phone_number?: string;
  learning_hours?: number;
  real_name?: string;
}

export interface TeacherProfile {
  id: number; // Teacher Profile ID (Teacher.id)
  user: number; // User ID (User.id)
  username: string; // From related User model
  email: string;    // From related User model
  avatar?: string | null;
  bio?: string;
  created_at?: string;
  updated_at?: string;

  title?: string;  // 职称
  specialties?: string;  // 专长领域
  university?: string;  // 毕业院校
  phone_number?: string;  // 电话号码
  // id_number?: string;  // 身份证号 -  Consider if this should be on frontend
  teaching_years?: number;  // 教学年限
  teaching_certificate?: string;  // 教师资格证编号
  education_level?: string;  // 最高学历
  major?: string;  // 专业方向
  work_status?: string;  // 工作状态
  available_time?: string;  // 可授课时间段
  // emergency_contact?: string; // 紧急联系人 - Consider privacy
  // emergency_contact_phone?: string; // 紧急联系人电话 - Consider privacy
  english_level?: string;  // 英语水平
  age?: number;  // 年龄
  province?: string;  // 省份
  city?: string;  // 城市
  gender?: string;  // 性别
  real_name?: string; // 真实姓名
} 