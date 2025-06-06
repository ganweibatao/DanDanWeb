import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Sidebar } from '../Students/StudentsSidebar';
import { SettingsSidebar } from '../../components/layout/SettingsRightSidebar';
import { PencilIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { updateStudentProfile } from '../../services/studentApi';
import { apiClient } from '../../services/api';
import type { StudentProfile, TeacherProfile } from '../../types/models';
import { teacherService } from '../../services/teacherApi';


// 在组件顶部加邮箱格式校验函数
function isEmailFormat(str: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

// 新增：学历选项映射
const EDUCATION_LEVEL_OPTIONS = [
  { value: 'bachelor', label: '本科' },
  { value: 'master', label: '硕士' },
  { value: 'phd', label: '博士' },
  { value: 'other', label: '其他' },
];

// 新增：工作状态选项
const WORK_STATUS_OPTIONS = [
  { value: 'full_time', label: '全职' },
  { value: 'part_time', label: '兼职' },
  { value: 'freelance', label: '自由职业' },
];

// 新增：教师英语水平选项
const TEACHER_ENGLISH_LEVEL_OPTIONS = [
  { value: 'cet4', label: 'CET-4' },
  { value: 'cet6', label: 'CET-6' },
  { value: 'ielts', label: 'IELTS' },
  { value: 'toefl', label: 'TOEFL' },
  { value: 'professional', label: '专业英语' },
  { value: 'native', label: '母语' },
  { value: 'other', label: '其他' },
];

// 新增：学生英语水平选项
const STUDENT_ENGLISH_LEVEL_OPTIONS = [
  { value: 'beginner', label: '初级' },
  { value: 'intermediate', label: '中级' },
  { value: 'advanced', label: '高级' },
  { value: 'proficient', label: '精通' },
];

// 新增：性别选项
const GENDER_OPTIONS = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
  { value: 'other', label: '其他' },
];

// 新增：年级选项
const GRADE_OPTIONS = [
  { value: 'primary_1', label: '小学一年级' },
  { value: 'primary_2', label: '小学二年级' },
  { value: 'primary_3', label: '小学三年级' },
  { value: 'primary_4', label: '小学四年级' },
  { value: 'primary_5', label: '小学五年级' },
  { value: 'primary_6', label: '小学六年级' },
  { value: 'junior_1', label: '初中一年级' },
  { value: 'junior_2', label: '初中二年级' },
  { value: 'junior_3', label: '初中三年级' },
  { value: 'senior_1', label: '高中一年级' },
  { value: 'senior_2', label: '高中二年级' },
  { value: 'senior_3', label: '高中三年级' },
  { value: 'college_1', label: '大学一年级' },
  { value: 'college_2', label: '大学二年级' },
  { value: 'college_3', label: '大学三年级' },
  { value: 'college_4', label: '大学四年级' },
  { value: 'graduate', label: '研究生' },
  { value: 'other', label: '其他' },
];

interface CurrentUserBasicInfo {
  id: number;
  username: string;
  email: string;
  user_type: 'student' | 'teacher' | 'admin' | null;
  student_profile_id?: number;
  teacher_profile_id?: number;
}

export const ProfileSettingsPage = (): JSX.Element => {
  const queryClient = useQueryClient();

  const [userType, setUserType] = useState<'student' | 'teacher' | 'admin' | null>(null);
  // Profile data can be StudentProfile or TeacherProfile
  const [profileData, setProfileData] = useState<StudentProfile | TeacherProfile | null>(null);

  // Step 1: Fetch basic current user info to determine type and profile ID
  const {
    data: currentUserBasicInfo,
    isLoading: isLoadingBasicInfo,
    isError: isErrorBasicInfo
  } = useQuery<CurrentUserBasicInfo>({
    queryKey: ['currentUserBasicInfo'],
    queryFn: async () => {
      const res = await apiClient.get<CurrentUserBasicInfo>('accounts/users/current/');
      return res.data;
    }
  });

  // 监听 currentUserBasicInfo 变化设置 userType
  useEffect(() => {
    if (currentUserBasicInfo) {
      setUserType(currentUserBasicInfo.user_type);
    }
  }, [currentUserBasicInfo]);

  // 计算 profileId
  const profileId = userType === 'student' ? currentUserBasicInfo?.student_profile_id : userType === 'teacher' ? currentUserBasicInfo?.teacher_profile_id : undefined;

  // Step 2: Fetch detailed profile based on userType
  const {
    data: detailedProfile,
    isLoading: isLoadingDetailedProfile,
    isError: isErrorDetailedProfile
  } = useQuery<StudentProfile | TeacherProfile | null>({
    queryKey: ['detailedProfile', userType, profileId],
    queryFn: async () => {
      if (userType === 'student' && profileId) {
        return apiClient.get<StudentProfile>(`accounts/students/${profileId}/`).then(res => res.data);
      } else if (userType === 'teacher' && profileId) {
        return apiClient.get<TeacherProfile>(`accounts/teachers/${profileId}/`).then(res => res.data);
      }
      return null;
    },
    enabled: !!userType && !!profileId
  });

  // 监听 detailedProfile 变化设置 profileData
  useEffect(() => {
    if (detailedProfile) {
      setProfileData(detailedProfile);
    }
  }, [detailedProfile]);

  // Combined loading and error states
  const isLoading = isLoadingBasicInfo || isLoadingDetailedProfile;
  const isError = isErrorBasicInfo || isErrorDetailedProfile;

  // State for form fields - make them generic or conditional later
  const [realName, setRealName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  // Teacher specific state - TODO
  const [title, setTitle] = useState(''); // Example for teacher
  const [university, setUniversity] = useState('');
  const [teachingYears, setTeachingYears] = useState<number | ''>('');
  const [bio, setBio] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [englishLevel, setEnglishLevel] = useState('');
  const [major, setMajor] = useState('');
  const [workStatus, setWorkStatus] = useState('');
  const [availableTime, setAvailableTime] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [age, setAge] = useState<number | ''>('');
  // 新增教师资格证编号
  const [teachingCertificate, setTeachingCertificate] = useState('');

  // 新增：学生年级和英语水平
  const [level, setLevel] = useState('');
  const [grade, setGrade] = useState('');

  // State for email change verification
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // 删除账户相关状态
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // 密码相关状态变量
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // 新增全局编辑模式状态
  const [isEditing, setIsEditing] = useState(false);
  // 保存原始数据用于取消恢复
  const [originalProfile, setOriginalProfile] = useState<any>(null);

  useEffect(() => {
    if (profileData) {
      console.log("Profile Data Received in Settings:", profileData, "User Type:", userType);
      setRealName((profileData as any).real_name || ''); // real_name 字段现已支持教师和学生
      setUsername(profileData.username || '');
      let initialEmail = '';
      if (profileData.email) {
        initialEmail = profileData.email;
      } else if (profileData.username && isEmailFormat(profileData.username)) {
        initialEmail = profileData.username;
      }
      setEmail(initialEmail);
      setNewEmail(initialEmail);
      setPhoneNumber((profileData as any).phone_number || ''); // Use 'as any' or type guard
      setAvatarPreview(profileData.avatar || null);

      if (userType === 'teacher' as typeof userType) {
        const teacherData = profileData as TeacherProfile;
        setTitle(teacherData.title || '');
        setUniversity(teacherData.university || '');
        setTeachingYears(teacherData.teaching_years ?? '');
        setBio(teacherData.bio || '');
        setEducationLevel(teacherData.education_level || '');
        setEnglishLevel(teacherData.english_level || '');
        setMajor(teacherData.major || '');
        setWorkStatus(teacherData.work_status || '');
        setAvailableTime(teacherData.available_time || '');
        setSpecialties(teacherData.specialties || '');
        setGender((teacherData.gender as 'male' | 'female' | 'other' | '') || '');
        setProvince(teacherData.province || '');
        setCity(teacherData.city || '');
        setAge(teacherData.age ?? '');
        setTeachingCertificate(teacherData.teaching_certificate || '');
      } else if (userType === 'student') {
        // Set student-specific fields if any (most are common or handled by realName, phoneNumber)
      }
      // 记录原始数据用于取消
      setOriginalProfile({
        realName: (profileData as any).real_name || '',
        username: profileData.username || '',
        email: email,
        newEmail: email,
        phoneNumber: (profileData as any).phone_number || '',
        avatarPreview: profileData.avatar || null,
        title: userType === 'teacher' ? (profileData as any).title || '' : '',
        university: userType === 'teacher' ? (profileData as any).university || '' : '',
        teachingYears: userType === 'teacher' ? (profileData as any).teaching_years ?? '' : '',
        bio: userType === 'teacher' ? (profileData as any).bio || '' : '',
        educationLevel: userType === 'teacher' ? (profileData as any).education_level || '' : '',
        englishLevel: userType === 'teacher' ? (profileData as any).english_level || '' : '',
        major: userType === 'teacher' ? (profileData as any).major || '' : '',
        workStatus: userType === 'teacher' ? (profileData as any).work_status || '' : '',
        availableTime: userType === 'teacher' ? (profileData as any).available_time || '' : '',
        specialties: userType === 'teacher' ? (profileData as any).specialties || '' : '',
        gender: userType === 'teacher' ? (profileData as any).gender || '' : '',
        province: userType === 'teacher' ? (profileData as any).province || '' : '',
        city: userType === 'teacher' ? (profileData as any).city || '' : '',
        age: userType === 'teacher' ? (profileData as any).age ?? '' : '',
        teachingCertificate: userType === 'teacher' ? (profileData as any).teaching_certificate || '' : '',
      });
    }
  }, [profileData, userType]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // 检查是否有更改
  const hasChanges = (() => {
    if (!profileData) return false;
    if (realName !== (profileData as any).real_name) return true;
    if (username !== profileData.username) return true;
    if (phoneNumber !== (profileData as any).phone_number) return true;
    if (avatarFile) return true;
    if (userType === 'teacher' as typeof userType) {
      const t = profileData as TeacherProfile;
      if (title !== (t.title || '')) return true;
      if (university !== (t.university || '')) return true;
      if (teachingYears !== (t.teaching_years ?? '')) return true;
      if (bio !== (t.bio || '')) return true;
      if (educationLevel !== (t.education_level || '')) return true;
      if (englishLevel !== (t.english_level || '')) return true;
      if (major !== (t.major || '')) return true;
      if (gender !== (t.gender || '')) return true;
      if (province !== (t.province || '')) return true;
      if (city !== (t.city || '')) return true;
      if (age !== (t.age ?? '')) return true;
      if (specialties !== (t.specialties || '')) return true;
      if (workStatus !== (t.work_status || '')) return true;
      if (availableTime !== (t.available_time || '')) return true;
    }
    return false;
  })();

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (originalProfile) {
      setRealName(originalProfile.realName);
      setUsername(originalProfile.username);
      setEmail(originalProfile.email);
      setNewEmail(originalProfile.newEmail);
      setPhoneNumber(originalProfile.phoneNumber);
      setAvatarPreview(originalProfile.avatarPreview);
      setTitle(originalProfile.title);
      setUniversity(originalProfile.university);
      setTeachingYears(originalProfile.teachingYears);
      setBio(originalProfile.bio);
      setEducationLevel(originalProfile.educationLevel);
      setEnglishLevel(originalProfile.englishLevel);
      setMajor(originalProfile.major);
      setWorkStatus(originalProfile.workStatus);
      setAvailableTime(originalProfile.availableTime);
      setSpecialties(originalProfile.specialties);
      setGender(originalProfile.gender);
      setProvince(originalProfile.province);
      setCity(originalProfile.city);
      setAge(originalProfile.age);
      setTeachingCertificate(originalProfile.teachingCertificate);
      setAvatarFile(null);
    }
    setIsEditing(false);
  };

  const handleSaveChanges = async () => {
    if (!currentUserBasicInfo || !profileData) return;
    const commonPayload: Partial<StudentProfile | TeacherProfile> & { real_name?: string } = {};
    if (realName !== (profileData as any).real_name) commonPayload.real_name = realName;
    if (username !== profileData.username) commonPayload.username = username;
    if (phoneNumber !== (profileData as any).phone_number) commonPayload.phone_number = phoneNumber;
    if (avatarFile) commonPayload.avatar = avatarFile as any;
    if (userType === 'teacher' as typeof userType) {
      const teacherData = profileData as TeacherProfile;
      const originalTeacherData = originalProfile as TeacherProfile | null;

      const teacherPayload: Partial<TeacherProfile> & { avatar?: File | null } = {};
      if (title !== (originalTeacherData?.title || teacherData.title || '')) teacherPayload.title = title;
      if (university !== (originalTeacherData?.university || teacherData.university || '')) teacherPayload.university = university;
      if (teachingYears !== (originalTeacherData?.teaching_years ?? teacherData.teaching_years ?? '')) teacherPayload.teaching_years = teachingYears === '' ? undefined : Number(teachingYears);
      if (bio !== (originalTeacherData?.bio || teacherData.bio || '')) teacherPayload.bio = bio;
      if (educationLevel !== (originalTeacherData?.education_level || teacherData.education_level || '')) teacherPayload.education_level = educationLevel;
      if (englishLevel !== (originalTeacherData?.english_level || teacherData.english_level || '')) teacherPayload.english_level = englishLevel;
      if (major !== (originalTeacherData?.major || teacherData.major || '')) teacherPayload.major = major;
      if (gender !== ((originalTeacherData?.gender as TeacherProfile['gender']) || teacherData.gender || '')) teacherPayload.gender = (gender === '' ? undefined : gender);
      if (province !== (originalTeacherData?.province || teacherData.province || '')) teacherPayload.province = province;
      if (city !== (originalTeacherData?.city || teacherData.city || '')) teacherPayload.city = city;
      if (age !== (originalTeacherData?.age ?? teacherData.age ?? '')) teacherPayload.age = age === '' ? undefined : Number(age);
      if (teachingCertificate !== (originalTeacherData?.teaching_certificate || teacherData.teaching_certificate || '')) teacherPayload.teaching_certificate = teachingCertificate;
      
      let updatePayload: any = { ...commonPayload, ...teacherPayload };

      if ('id' in updatePayload) {
        delete (updatePayload as any).id;
      }

      if (Object.keys(updatePayload).length === 0 && !avatarFile) {
        console.log('No changes to save.');
        setIsEditing(false);
        return;
      }

      console.log('avatarFile:', avatarFile);

      try {
        await teacherService.updateTeacherProfile(String(profileId), updatePayload);
        queryClient.invalidateQueries({ queryKey: ['currentUserBasicInfo'] });
        queryClient.invalidateQueries({ queryKey: ['detailedProfile', userType, profileId] });
        setAvatarFile(null);
        setIsEditing(false);
        console.log('Teacher profile updated successfully!');
      } catch (error: any) {
        console.error('Failed to update teacher profile:', error);
        alert(`保存失败: ${error.message}`);
      }
      return;
    }
    const finalPayload = { ...commonPayload /*, ...specificPayload */ };

    if (Object.keys(finalPayload).length === 0) {
      console.log("No changes to save.");
      return;
    }

    try {
      if (
        userType === 'student' &&
        profileId
      ) {
        await updateStudentProfile(profileId, finalPayload as Partial<StudentProfile>);
      } else if (
        userType === 'teacher' &&
        profileId
      ) {
        // 教师档案更新功能待实现
        console.log('TODO: Call updateTeacherProfile with payload:', finalPayload);
        alert('教师档案更新功能待实现');
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['currentUserBasicInfo'] });
      queryClient.invalidateQueries({ queryKey: ['detailedProfile', userType, profileId] });
      setAvatarFile(null);
      setIsEditing(false);
      console.log('Profile updated successfully!');
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      if (error.response) {
        console.error('Error data:', error.response.data);
        console.error('Error status:', error.response.status);
        alert(`保存失败: ${error.response.data?.detail || error.response.statusText || '服务器错误'}`);
      } else if (error.request) {
        console.error('Error request:', error.request);
        alert('保存失败: 未收到服务器响应');
      } else {
        console.error('Error message:', error.message);
        alert(`保存失败: ${error.message}`);
      }
    }
  };

  // Handle email verification (placeholder)
  const handleVerifyEmail = () => {
    console.log("Triggering email verification for:", email);
  };

  // Initiate email change (mock)
  const handleInitiateEmailChange = async () => {
    if (!newEmail || newEmail === email) return;
    if (!currentUserBasicInfo) return; // Need user info for API call if it uses user ID
    setIsVerifying(true);
    setVerificationError(null);
    try {
      await apiClient.post('accounts/users/initiate-email-change/', { new_email: newEmail });
      setIsVerificationSent(true);
    } catch (error: any) {
      console.error("Failed to initiate email change:", error);
      setVerificationError(error.response?.data?.error || '发送验证码失败，请稍后重试。');
    } finally {
      setIsVerifying(false);
    }
  };

  // Confirm email change (mock)
  const handleConfirmEmailChange = async () => {
    if (!verificationCode || !newEmail) return;
    if (!currentUserBasicInfo) return;
    setIsVerifying(true);
    setVerificationError(null);
    try {
      await apiClient.post('accounts/users/confirm-email-change/', { code: verificationCode, new_email: newEmail });
      setEmail(newEmail);
      setIsVerificationSent(false);
      setVerificationCode('');
      queryClient.invalidateQueries({ queryKey: ['currentUserBasicInfo'] });
      queryClient.invalidateQueries({ queryKey: ['detailedProfile', userType, profileId] });
      console.log('Email change confirmed successfully!');
    } catch (error: any) {
      console.error("Failed to confirm email change:", error);
      setVerificationError(error.response?.data?.error || '验证码错误或已过期。');
    } finally {
      setIsVerifying(false);
    }
  };

  // 删除账户处理函数
  const handleDeleteAccount = async () => {
    setDeleteError('');
    try {
      await apiClient.post('accounts/users/delete-account/', { password: deletePassword });
      // 如果没有 refresh token 或者清除失败，则重定向到注册/登录页面
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      localStorage.removeItem('user');
      queryClient.invalidateQueries(); // 使所有查询失效
      queryClient.clear(); // 清除所有缓存数据
      window.location.href = '/register'; // 跳转到注册/登录页面
    } catch (error: any) {
      setDeleteError(error.response?.data?.error || '删除失败');
    }
  };

  // 用于字段行的样式
  const fieldRowClass = "flex items-center mb-4";
  const labelClass = "block text-sm font-bold text-gray-700 dark:text-gray-300 w-28 mr-4";
  const valueClass = "flex-1";

  if (isLoading) return <div>加载中...</div>; // Loading state
  if (isError || !profileData) {
      // Check specific errors
      if (isErrorBasicInfo) return <div>无法加载基础用户信息</div>;
      if (isErrorDetailedProfile) return <div>无法加载详细档案信息</div>;
      if (!profileData && !isLoadingBasicInfo && currentUserBasicInfo && !isLoadingDetailedProfile) {
        // This case means basic info loaded, type determined, but detailed profile fetch might have returned null or had an issue not caught by isErrorDetailedProfile
        if (userType === 'student') return <div>当前用户是学生，但无法加载学生档案。检查ID和API。</div>;
        if (userType === 'teacher') return <div>当前用户是教师，但无法加载教师档案。检查ID和API。</div>;
        return <div>用户信息不完整或用户类型未知。</div>;
      }
      return <div>无法加载用户信息</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      <Sidebar />
      <main className="flex-1 p-10 overflow-y-auto h-screen bg-white dark:bg-gray-900">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-200">个人档案</h1>
        <div className="max-w-3xl mx-auto">
          {/* 全局编辑/保存/取消按钮 */}
          <div className="flex justify-end mb-4">
            {isEditing ? (
              <>
                <Button onClick={handleSaveChanges} disabled={isLoading || !hasChanges} className="mr-2">保存</Button>
                <Button variant="outline" onClick={handleCancelEdit}>取消</Button>
              </>
            ) : (
              <Button onClick={handleEdit}>编辑</Button>
            )}
          </div>
          {/* 基础信息 */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 border-l-4 border-blue-500 pl-2 text-gray-800 dark:text-gray-200">基础信息</h2>
            <div className="flex items-center space-x-6 mb-6">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-white dark:border-gray-700 shadow-md">
                  {(avatarPreview) && <AvatarImage src={avatarPreview} alt="User Avatar" />}
                  <AvatarFallback className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-4xl font-semibold">
                    {profileData?.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-full w-8 h-8 border-2 border-white dark:border-gray-900 cursor-pointer flex items-center justify-center">
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    <PencilIcon className="w-4 h-4" />
                  </label>
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-500 dark:text-gray-400">头像</h2>
              </div>
            </div>
            {/* 两列字段对齐 */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              {/* 简介独占一行 */}
              <div className="flex col-span-2">
                <label htmlFor="bio" className="font-bold w-16 mr-4 text-gray-700 dark:text-gray-300">简介</label>
                <div className="flex-1">
                  {isEditing ? (
                    <Input id="bio" type="text" value={bio} onChange={e => setBio(e.target.value)} className="w-full" />
                  ) : (
                    <span className="text-gray-700 dark:text-gray-300">{bio || '未填写'}</span>
                  )}
                </div>
              </div>
              {/* 姓名/性别 */}
              <div className="flex">
                <label htmlFor="real_name" className="font-bold w-16 mr-4 text-gray-700 dark:text-gray-300">姓名</label>
                <div className="flex-1">
                  {isEditing ? (
                    <Input id="real_name" type="text" value={realName} onChange={(e) => setRealName(e.target.value)} className="w-full" />
                  ) : (
                    <span className="text-gray-700 dark:text-gray-300">{realName || '未填写'}</span>
                  )}
                </div>
              </div>
              <div className="flex">
                <label htmlFor="gender" className="font-bold w-16 mr-4 text-gray-700 dark:text-gray-300">性别</label>
                <div className="flex-1">
                  {isEditing ? (
                    <select id="gender" value={gender} onChange={e => setGender(e.target.value as 'male' | 'female' | 'other' | '')} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 text-gray-900 dark:text-gray-100">
                      <option value="">请选择</option>
                      {GENDER_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-gray-700 dark:text-gray-300">{GENDER_OPTIONS.find(opt => opt.value === gender)?.label || '未填写'}</span>
                  )}
                </div>
              </div>
              {/* 年龄/省份 */}
              <div className="flex">
                <label htmlFor="age" className="font-bold w-16 mr-4 text-gray-700 dark:text-gray-300">年龄</label>
                <div className="flex-1">
                  {isEditing ? (
                    <Input id="age" type="number" value={age === '' ? '' : age.toString()} onChange={e => setAge(e.target.value === '' ? '' : Number(e.target.value) as number | '')} className="w-full" />
                  ) : (
                    <span className="text-gray-700 dark:text-gray-300">{age || '未填写'}</span>
                  )}
                </div>
              </div>
              <div className="flex">
                <label htmlFor="province" className="font-bold w-16 mr-4 text-gray-700 dark:text-gray-300">省份</label>
                <div className="flex-1">
                  {isEditing ? (
                    <Input id="province" type="text" value={province} onChange={e => setProvince(e.target.value)} className="w-full" />
                  ) : (
                    <span className="text-gray-700 dark:text-gray-300">{province || '未填写'}</span>
                  )}
                </div>
              </div>
              {/* 城市独占一行 */}
              <div className="flex col-span-2">
                <label htmlFor="city" className="font-bold w-16 mr-4 text-gray-700 dark:text-gray-300">城市</label>
                <div className="flex-1">
                  {isEditing ? (
                    <Input id="city" type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full" />
                  ) : (
                    <span className="text-gray-700 dark:text-gray-300">{city || '未填写'}</span>
                  )}
                </div>
              </div>
            </div>
          </section>
          {/* 职业信息 */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 border-l-4 border-blue-500 pl-2 text-gray-800 dark:text-gray-200">职业信息</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div className="flex">
                <label htmlFor="title" className="font-bold w-24 mr-4 text-gray-700 dark:text-gray-300">职称</label>
                <div className="flex-1">
                  {isEditing ? (
                    <Input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full" />
                  ) : (
                    <span className="text-gray-700 dark:text-gray-300">{title || '未填写'}</span>
                  )}
                </div>
              </div>
              <div className="flex">
                <label htmlFor="specialties" className="font-bold w-24 mr-4 text-gray-700 dark:text-gray-300">专长领域</label>
                <div className="flex-1">
                  {isEditing ? (
                    <Input id="specialties" type="text" value={specialties} onChange={e => setSpecialties(e.target.value)} className="w-full" />
                  ) : (
                    <span className="text-gray-700 dark:text-gray-300">{specialties || '未填写'}</span>
                  )}
                </div>
              </div>
              <div className="flex">
                <label htmlFor="teaching_years" className="font-bold w-24 mr-4 text-gray-700 dark:text-gray-300">教龄</label>
                <div className="flex-1">
                  {isEditing ? (
                    <Input id="teaching_years" type="number" value={teachingYears === '' ? '' : teachingYears.toString()} onChange={e => setTeachingYears(e.target.value === '' ? '' : Number(e.target.value) as number | '')} className="w-full" />
                  ) : (
                    <span className="text-gray-700 dark:text-gray-300">{teachingYears || '未填写'}</span>
                  )}
                </div>
              </div>
              <div className="flex">
                <label htmlFor="work_status" className="font-bold w-24 mr-4 text-gray-700 dark:text-gray-300">工作状态</label>
                <div className="flex-1">
                  {isEditing ? (
                    <select id="work_status" value={workStatus} onChange={e => setWorkStatus(e.target.value)} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 text-gray-900 dark:text-gray-100">
                      <option value="">请选择</option>
                      {WORK_STATUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-gray-700 dark:text-gray-300">{WORK_STATUS_OPTIONS.find(opt => opt.value === workStatus)?.label || '未填写'}</span>
                  )}
                </div>
              </div>
              <div className="flex col-span-2">
                <label htmlFor="available_time" className="font-bold w-24 mr-4 text-gray-700 dark:text-gray-300">可授课时间段</label>
                <div className="flex-1">
                  {isEditing ? (
                    <Input id="available_time" type="text" value={availableTime} onChange={e => setAvailableTime(e.target.value)} className="w-full" placeholder="如：周一至周五 18:00-21:00，周末全天" />
                  ) : (
                    <span className="text-gray-700 dark:text-gray-300">{availableTime || '未填写'}</span>
                  )}
                </div>
              </div>
            </div>
          </section>
          {/* 教育背景 */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 border-l-4 border-blue-500 pl-2 text-gray-800 dark:text-gray-200">教育背景</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div className="flex">
                <label htmlFor="university" className="font-bold w-24 mr-4 text-gray-700 dark:text-gray-300">毕业院校</label>
                <div className="flex-1">
                  {isEditing ? (
                    <Input id="university" type="text" value={university} onChange={e => setUniversity(e.target.value)} className="w-full" />
                  ) : (
                    <span className="text-gray-700 dark:text-gray-300">{university || '未填写'}</span>
                  )}
                </div>
              </div>
              <div className="flex">
                <label htmlFor="education_level" className="font-bold w-24 mr-4 text-gray-700 dark:text-gray-300">最高学历</label>
                <div className="flex-1">
                  {isEditing ? (
                    <select
                      id="education_level"
                      value={educationLevel}
                      onChange={e => setEducationLevel(e.target.value)}
                      className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">请选择</option>
                      {EDUCATION_LEVEL_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-gray-700 dark:text-gray-300">{EDUCATION_LEVEL_OPTIONS.find(opt => opt.value === educationLevel)?.label || '未填写'}</span>
                  )}
                </div>
              </div>
              <div className="flex">
                <label htmlFor="major" className="font-bold w-24 mr-4 text-gray-700 dark:text-gray-300">专业方向</label>
                <div className="flex-1">
                  {isEditing ? (
                    <Input id="major" type="text" value={major} onChange={e => setMajor(e.target.value)} className="w-full" />
                  ) : (
                    <span className="text-gray-700 dark:text-gray-300">{major || '未填写'}</span>
                  )}
                </div>
              </div>
              <div className="flex">
                <label htmlFor="english_level" className="font-bold w-24 mr-4 text-gray-700 dark:text-gray-300">英语水平</label>
                <div className="flex-1">
                  {isEditing ? (
                    <select id="english_level" value={englishLevel} onChange={e => setEnglishLevel(e.target.value)} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 text-gray-900 dark:text-gray-100">
                      <option value="">请选择</option>
                      {TEACHER_ENGLISH_LEVEL_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-gray-700 dark:text-gray-300">{TEACHER_ENGLISH_LEVEL_OPTIONS.find(opt => opt.value === englishLevel)?.label || '未填写'}</span>
                  )}
                </div>
              </div>
              <div className="flex col-span-2">
                <label htmlFor="teaching_certificate" className="font-bold w-24 mr-4 text-gray-700 dark:text-gray-300">教师资格证编号</label>
                <div className="flex-1">
                  {isEditing ? (
                    <Input id="teaching_certificate" type="text" value={teachingCertificate} onChange={e => setTeachingCertificate(e.target.value)} className="w-full" />
                  ) : (
                    <span className="text-gray-700 dark:text-gray-300">{teachingCertificate || '未填写'}</span>
                  )}
                </div>
              </div>
              {/* 仅学生显示年级和英语水平 */}
              {userType === 'student' && (
                <>
                  <div className="flex col-span-2">
                    <label htmlFor="grade" className="font-bold w-24 mr-4 text-gray-700 dark:text-gray-300">年级</label>
                    <div className="flex-1">
                      {isEditing ? (
                        <select id="grade" value={grade} onChange={e => setGrade(e.target.value)} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 text-gray-900 dark:text-gray-100">
                          <option value="">请选择</option>
                          {GRADE_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-gray-700 dark:text-gray-300">{GRADE_OPTIONS.find(opt => opt.value === grade)?.label || '未填写'}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex">
                    <label htmlFor="level" className="font-bold w-24 mr-4 text-gray-700 dark:text-gray-300">英语水平</label>
                    <div className="flex-1">
                      {isEditing ? (
                        <select id="level" value={level} onChange={e => setLevel(e.target.value)} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 text-gray-900 dark:text-gray-100">
                          <option value="">请选择</option>
                          {STUDENT_ENGLISH_LEVEL_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-gray-700 dark:text-gray-300">{STUDENT_ENGLISH_LEVEL_OPTIONS.find(opt => opt.value === level)?.label || '未填写'}</span>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
          {/* 联系方式 */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 border-l-4 border-blue-500 pl-2 text-gray-800 dark:text-gray-200">联系方式</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div className="flex">
                <label htmlFor="phone_number" className="font-bold w-24 mr-4 text-gray-700 dark:text-gray-300">手机号</label>
                <div className="flex-1">
                  {isEditing ? (
                    <Input id="phone_number" type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="w-full" />
                  ) : (
                    <span className="text-gray-700 dark:text-gray-300">{phoneNumber || '未填写'}</span>
                  )}
                </div>
              </div>
              <div className="flex">
                <label htmlFor="email" className="font-bold w-24 mr-4 text-gray-700 dark:text-gray-300">邮箱</label>
                <div className="flex-1">
                  {isEditing ? (
                    <Input id="email" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full" />
                  ) : (
                    <span className="text-gray-700 dark:text-gray-300">{newEmail || '未填写'}</span>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <SettingsSidebar />
    </div>
  );
};