import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 移除 useParams
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { teacherService, TeacherProfile } from '../../services/teacherApi'; // 修改：导入 teacherService
import { useAuth } from '../../hooks/useAuth'; // 导入 useAuth
import { provinces } from '../../lib/chinaRegions';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea'; // 导入 Textarea
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  UserCircleIcon,
  Edit3Icon,
  BriefcaseIcon, // 用于教育年限
  PhoneIcon,      // 用于电话
  BuildingIcon,   // 用于学校
  LanguagesIcon,  // 用于英语水平
  InfoIcon,       // 用于个性签名
} from 'lucide-react';
import { TeacherSidebar } from './TeacherSidebar'; // 修改：导入教师侧边栏
import { SidebarFooterLinks } from '../../components/layout/SidebarFooterLinks';

// 编辑数据类型，增加新字段
type EditableTeacherData = {
  username: string;
  email: string;
  gender: string;
  age: number;
  province: string;
  city: string;
  avatar?: File | null;
  // 新增字段
  university: string;
  phone_number: string;
  teaching_years: number | null; // 可能为 null 或 number
  education_level: string;
  english_level: string;
  bio: string;
};

// 性别映射
const genderMap: Record<string, string> = { male: '男', female: '女', other: '其他' };

export const TeacherProfilePage = (): JSX.Element => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, userRole, isLoading: isAuthLoading, isAuthenticated, error: authError } = useAuth();

  // 从认证状态获取 teacherId - 使用 teacher_profile_id
  const teacherId = userRole === 'teacher' && user?.teacher_profile_id
    ? String(user.teacher_profile_id) // 使用 teacher_profile_id
    : null;

  const [inviteLink] = useState('https://invite.DanZai.com/TEACHER_INVITE...'); // 教师邀请链接

  // 为 Sidebar 准备 props
  const sidebarUser = {
    username: user?.username || '教师',
    avatarFallback: user?.username ? user.username[0].toUpperCase() : 'T',
  };

  const handleSidebarNavigation = (viewId: string) => {
    navigate('/teacher', { state: { initialView: viewId } });
  };

  // 获取教师信息
  const { data: teacherData, isLoading: isProfileLoading, isError: isProfileError } = useQuery<TeacherProfile>({
    queryKey: ['teacherProfile', teacherId],
    queryFn: () => teacherService.fetchTeacherProfile(teacherId!), // 修改：通过 teacherService 调用
    enabled: !isAuthLoading && isAuthenticated && userRole === 'teacher' && !!teacherId,
  });

  // 编辑状态
  const [isEditing, setIsEditing] = useState(false);
  // 用于编辑的临时数据状态
  const [editedData, setEditedData] = useState<EditableTeacherData | null>(null);

  // 头像预览
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  // 选中的省份和城市
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');

  // 头像选择
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditedData(prev => prev ? { ...prev, avatar: file } : prev);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // 当 teacherData 变化时，初始化编辑数据
  useEffect(() => {
    if (teacherData) {
      let genderLabel = teacherData.gender || '';
      if (genderLabel === 'male') genderLabel = '男';
      else if (genderLabel === 'female') genderLabel = '女';
      else if (genderLabel === 'other') genderLabel = '其他';

      setEditedData({
        username: teacherData.username || '',
        email: teacherData.email || '',
        gender: genderLabel,
        age: teacherData.age || 0,
        province: teacherData.province || '',
        city: teacherData.city || '',
        // 初始化新字段
        university: teacherData.university || '',
        phone_number: teacherData.phone_number || '',
        teaching_years: teacherData.teaching_years === undefined || teacherData.teaching_years === null ? null : Number(teacherData.teaching_years), // 确保是 number 或 null
        education_level: teacherData.education_level || '',
        english_level: teacherData.english_level || '',
        bio: teacherData.bio || '',
        // avatar 在 handleEdit 或 teacherData.avatar effect 中处理
      });
      setSelectedProvince(teacherData.province || '');
      setSelectedCity(teacherData.city || '');
      if (teacherData.avatar) {
         setAvatarPreview(teacherData.avatar);
      }
    }
  }, [teacherData]);

  // 处理输入变化 (Textarea 需要单独处理或类型断言)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedData(prev => prev ? { ...prev, [name]: value } : prev);
  };

 // 处理数字输入变化 (确保是数字, 允许空)
 const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof EditableTeacherData) => {
    const value = e.target.value;
    // 允许空字符串或纯数字
    if (value === '' || /^\d+$/.test(value)) {
        setEditedData(prev => prev ? { ...prev, [fieldName]: value === '' ? null : parseInt(value, 10) } : prev); // 空字符串设为 null
    } else if (/^\d+\.$/.test(value)) {
        // 允许输入小数点，但最终值会被 parseInt
    }
  };


  // 开始编辑
  const handleEdit = () => {
    if (teacherData) {
      let genderLabel = teacherData.gender || '';
      if (genderLabel === 'male') genderLabel = '男';
      else if (genderLabel === 'female') genderLabel = '女';
      else if (genderLabel === 'other') genderLabel = '其他';

      setEditedData({
        username: teacherData.username || '',
        email: teacherData.email || '',
        gender: genderLabel,
        age: teacherData.age || 0,
        province: teacherData.province || '',
        city: teacherData.city || '',
        // 初始化新字段
        university: teacherData.university || '',
        phone_number: teacherData.phone_number || '',
        teaching_years: teacherData.teaching_years === undefined || teacherData.teaching_years === null ? null : Number(teacherData.teaching_years),
        education_level: teacherData.education_level || '',
        english_level: teacherData.english_level || '',
        bio: teacherData.bio || '',
        avatar: null, // 编辑时不直接修改 avatar File 对象
      });
      setSelectedProvince(teacherData.province || '');
      setSelectedCity(teacherData.city || '');
      setAvatarPreview(teacherData.avatar || null);
      setIsEditing(true);
    }
  };

  // 保存编辑
  const handleSave = async () => {
    if (!editedData || !teacherId) return;

    let gender = editedData.gender;
    if (gender === '男') gender = 'male';
    else if (gender === '女') gender = 'female';
    else if (gender === '其他') gender = 'other';

    // 构建包含新字段的 payload
    const payload: any = {
      username: editedData.username,
      email: editedData.email,
      gender,
      age: editedData.age,
      province: selectedProvince,
      city: selectedCity,
      // 添加新字段到 payload
      university: editedData.university,
      phone_number: editedData.phone_number,
      teaching_years: editedData.teaching_years, // teaching_years 已经是 number 或 null
      education_level: editedData.education_level,
      english_level: editedData.english_level,
      bio: editedData.bio,
    };
    if (editedData.avatar instanceof File) {
        payload.avatar = editedData.avatar;
    }

    console.log('[handleSave] 提交 payload:', payload);

    try {
      const res = await teacherService.updateTeacherProfile(teacherId, payload);
      console.log('[handleSave] 接口返回:', res);
      setIsEditing(false);
      if (res) {
        queryClient.setQueryData(['teacherProfile', teacherId], res);
      }
      queryClient.invalidateQueries({ queryKey: ['teacherProfile', teacherId] });
    } catch (e) {
      console.error("保存失败:", e);
      alert('保存失败');
    }
  };

  // 取消编辑
  const handleCancel = () => {
    setIsEditing(false);
    setAvatarPreview(teacherData?.avatar || null);
    setEditedData(null); // 重置编辑数据
  };

  // 复制邀请链接
  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink)
      .then(() => {
        console.log('Link copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy link: ', err);
      });
  };

  // 1. 头像美化相关状态
  const [copied, setCopied] = useState(false); // 邀请链接复制反馈

  // --- 更新加载和错误状态判断逻辑 ---
  if (isAuthLoading) {
    return <div className="flex justify-center items-center h-screen">验证用户身份中...</div>;
  }

  if (!isAuthenticated || userRole !== 'teacher') {
    return <div className="flex justify-center items-center h-screen">请以教师身份登录查看此页面</div>;
  }

  if (authError) {
     return <div className="flex justify-center items-center h-screen">验证身份时出错: {authError}</div>;
  }

  if (isProfileLoading) {
      return <div className="flex justify-center items-center h-screen">加载教师信息中...</div>;
  }

  if (isProfileError || (!isProfileLoading && !teacherData)) {
      return <div className="flex justify-center items-center h-screen">加载教师信息失败或未找到 (ID: {teacherId || '未知'})</div>;
  }

  const currentTeacherData = teacherData!;

  const finalAvatarSrc = avatarPreview || currentTeacherData.avatar;
  const userNameInitial = currentTeacherData.username ? currentTeacherData.username[0].toUpperCase() : '?';

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-gray-50 font-sans">
      <TeacherSidebar
        user={sidebarUser}
        activeView={''}
        setActiveView={handleSidebarNavigation}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto bg-white">
        <div className="relative p-4 sm:p-8 mb-6 sm:mb-8 border border-gray-200 rounded-lg">
          {!isEditing && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-gray-500 hover:text-blue-500 hover:bg-gray-100 rounded-full"
              onClick={handleEdit}
            >
              <Edit3Icon className="h-5 w-5" />
            </Button>
          )}
          <div className="flex flex-col items-center sm:flex-row sm:items-start">
            <div className="relative mb-4 sm:mb-0 sm:mr-6 flex-shrink-0 group">
              <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-purple-400 via-blue-400 to-pink-400 shadow-lg group-hover:scale-105 transition-transform duration-200">
              {finalAvatarSrc ? (
                <img
                  src={finalAvatarSrc}
                  alt="Avatar"
                    className="w-full h-full rounded-full object-cover border-4 border-white"
                />
              ) : (
                  <div className="w-full h-full rounded-full flex items-center justify-center bg-gray-300">
                  <span className="text-4xl font-semibold text-white">{userNameInitial}</span>
                </div>
              )}
              </div>
              {isEditing && (
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 p-1 bg-blue-500 rounded-full cursor-pointer text-white hover:bg-blue-600 transition-colors"
                >
                  <Edit3Icon size={16} />
                  <input
                    id="avatar-upload"
                    name="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              {/* 用户名和邮箱 */}
              <div className="mb-4">
                <div className="mb-1">
                  {isEditing && editedData ? (
                    <Input
                      name="username"
                      value={editedData.username}
                      onChange={handleInputChange}
                      placeholder="用户名"
                      className="text-xl sm:text-2xl font-semibold text-gray-900 bg-gray-100 focus:ring-2 focus:ring-blue-400 border-gray-300 rounded"
                    />
                  ) : (
                    <span className="text-xl sm:text-2xl font-semibold text-gray-900">
                      {currentTeacherData.username || '未知用户名'}
                    </span>
                  )}
                </div>
                <div>
                  {isEditing && editedData ? (
                    <Input
                      name="email"
                      type="email"
                      value={editedData.email}
                      onChange={handleInputChange}
                      placeholder="邮箱"
                      className="text-gray-500 bg-gray-100 focus:ring-2 focus:ring-blue-400 px-3 py-1 rounded border border-gray-300 min-w-[180px]"
                    />
                  ) : (
                    <span className="text-gray-500">
                      {currentTeacherData.email || '未提供邮箱'}
                    </span>
                  )}
                </div>
              </div>

              {/* 个性签名 - 显示在信息网格上方 */}
              <div className="mb-4 text-sm text-gray-700">
                {isEditing && editedData ? (
                  <Textarea
                    name="bio"
                    value={editedData.bio}
                    onChange={handleInputChange}
                    placeholder="添加您的个性签名..."
                    className="w-full bg-gray-100 focus:ring-2 focus:ring-blue-400 border-gray-300 rounded"
                    rows={2}
                  />
                ) : (
                  <p className="text-gray-800">
                    {currentTeacherData.bio || ''}
                  </p>
                )}
              </div>


              {/* 详细信息网格 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2 text-sm mb-4 text-gray-700">
                {/* 性别 */}
                <div className="flex items-center">
                  <span className="mr-2 min-w-[3.5em] font-medium text-gray-600">性别:</span>
                  {isEditing && editedData ? (
                    <Select
                      name="gender"
                      value={editedData.gender}
                      onValueChange={(value) => setEditedData(prev => prev ? { ...prev, gender: value } : prev)}
                    >
                      <SelectTrigger className="w-full sm:w-[100px] bg-gray-100 border-gray-300"><SelectValue placeholder="选择" /></SelectTrigger>
                      <SelectContent><SelectItem value="男">男</SelectItem><SelectItem value="女">女</SelectItem><SelectItem value="其他">其他</SelectItem></SelectContent>
                    </Select>
                  ) : (
                    <span>
                      {genderMap[currentTeacherData.gender || ''] || '未设置'}
                    </span>
                  )}
                </div>
                {/* 年龄 */}
                <div className="flex items-center">
                  <span className="mr-2 min-w-[3.5em] font-medium text-gray-600">年龄:</span>
                  {isEditing && editedData ? (
                    <Input
                      type="number"
                      name="age"
                      value={editedData.age}
                      onChange={(e) => handleNumericChange(e, 'age')}
                      placeholder="年龄"
                      className="w-full sm:w-20 bg-gray-100 px-2 py-1 border-gray-300 rounded"
                    />
                  ) : (
                    <span>
                      {currentTeacherData.age ? `${currentTeacherData.age}岁` : '未设置'}
                    </span>
                  )}
                </div>
                {/* 省份 */}
                <div className="flex items-center">
                  <span className="mr-2 min-w-[3.5em] font-medium text-gray-600">省份:</span>
                  {isEditing && editedData ? (
                    <Select
                      value={selectedProvince}
                      onValueChange={(value) => {
                        setSelectedProvince(value);
                        setSelectedCity('');
                        setEditedData(prev => prev ? { ...prev, province: value, city: '' } : prev);
                      }}
                    >
                      <SelectTrigger className="w-full sm:w-[120px] bg-gray-100 border-gray-300"><SelectValue placeholder="选择" /></SelectTrigger>
                      <SelectContent>{provinces.map(p => <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
                    </Select>
                  ) : (
                    <span>
                      {currentTeacherData.province || '未设置'}
                    </span>
                  )}
                </div>
                {/* 城市 */}
                <div className="flex items-center">
                 <span className="mr-2 min-w-[3.5em] font-medium text-gray-600">城市:</span>
                  {isEditing && editedData ? (
                    <Select
                      value={selectedCity}
                      onValueChange={(value) => {
                        setSelectedCity(value);
                        setEditedData(prev => prev ? { ...prev, city: value } : prev);
                      }}
                      disabled={!selectedProvince}
                    >
                      <SelectTrigger className="w-full sm:w-[120px] bg-gray-100 border-gray-300"><SelectValue placeholder="选择" /></SelectTrigger>
                      <SelectContent>{provinces.find(p => p.name === selectedProvince)?.cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  ) : (
                    <span>
                      {currentTeacherData.city || '未设置'}
                    </span>
                  )}
                </div>

                {/* 新增字段 */}
                {/* 学校 */}
                 <div className="flex items-center">
                   <span className="mr-2 min-w-[3.5em] font-medium text-gray-600">学校:</span>
                   {isEditing && editedData ? (
                     <Input
                       name="university"
                       value={editedData.university}
                       onChange={handleInputChange}
                       placeholder="毕业院校或现任学校"
                       className="w-full bg-gray-100 px-2 py-1 border-gray-300 rounded"
                     />
                   ) : (
                     <span>{currentTeacherData.university || '未设置'}</span>
                   )}
                 </div>
                 {/* 电话 */}
                 <div className="flex items-center">
                   <span className="mr-2 min-w-[3.5em] font-medium text-gray-600">电话:</span>
                   {isEditing && editedData ? (
                     <Input
                       type="tel"
                       name="phone_number"
                       value={editedData.phone_number}
                       onChange={handleInputChange}
                       placeholder="联系电话"
                       className="w-full bg-gray-100 px-2 py-1 border-gray-300 rounded"
                     />
                   ) : (
                     <span>{currentTeacherData.phone_number || '未设置'}</span>
                   )}
                 </div>
                 {/* 教育年限 */}
                 <div className="flex items-center">
                   <span className="mr-2 min-w-[3.5em] font-medium text-gray-600">教龄:</span>
                   {isEditing && editedData ? (
                     <Input
                       type="number"
                       name="teaching_years"
                       value={editedData.teaching_years === null ? '' : String(editedData.teaching_years)} // 处理 null
                       onChange={(e) => handleNumericChange(e, 'teaching_years')}
                       placeholder="年"
                       className="w-full sm:w-20 bg-gray-100 px-2 py-1 border-gray-300 rounded mr-1"
                     />
                   ) : (
                     <span>
                       {currentTeacherData.teaching_years !== null && currentTeacherData.teaching_years !== undefined
                         ? `${currentTeacherData.teaching_years}年`
                         : '未设置'}
                     </span>
                   )}
                 </div>
                 {/* 教育水平 */}
                 <div className="flex items-center">
                   <span className="mr-2 min-w-[3.5em] font-medium text-gray-600">学历:</span>
                   {isEditing && editedData ? (
                     <Input
                       name="education_level"
                       value={editedData.education_level}
                       onChange={handleInputChange}
                       placeholder="如：本科, 硕士"
                       className="w-full bg-gray-100 px-2 py-1 border-gray-300 rounded"
                     />
                   ) : (
                     <span>{currentTeacherData.education_level || '未设置'}</span>
                   )}
                 </div>
                 {/* 英语水平 */}
                 <div className="flex items-center col-span-1 sm:col-span-2">
                   <span className="mr-2 min-w-[3.5em] font-medium text-gray-600">英语:</span>
                   {isEditing && editedData ? (
                     <Input
                       name="english_level"
                       value={editedData.english_level}
                       onChange={handleInputChange}
                       placeholder="如：CET-4, 专业八级"
                       className="w-full bg-gray-100 px-2 py-1 border-gray-300 rounded"
                     />
                   ) : (
                     <span>{currentTeacherData.english_level || '未设置'}</span>
                   )}
                 </div>
              </div>
              {isEditing ? (
                <div className="flex justify-center sm:justify-start space-x-3 mt-6">
                  <Button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-1.5 rounded-md">保存更改</Button>
                  <Button variant="ghost" onClick={handleCancel} className="text-gray-600 hover:bg-gray-100 px-5 py-1.5 rounded-md">取消</Button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
        {/* --- Removed Stats Section (Chart) --- */}
        {/* 
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">教学统计</h2>
        <div className="grid grid-cols-1 gap-4 md:gap-6 mb-6 sm:mb-8">
          <div className="md:col-span-1 border border-gray-200 rounded-lg p-4">
             ... chart content ... 
          </div>
        </div>
        */}

        {/* --- Removed Class Session Records Table --- */}
        {/* 
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">上课记录</h2>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
           <Table>
             ... table content ... 
           </Table>
         </div>
        */}

      </main>
      <aside className="w-full lg:w-72 bg-gray-50 p-4 lg:p-6 flex-shrink-0 border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col space-y-6 overflow-y-auto">
           <Card className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-2">邀请学生链接</h3>
            <div>
              <div className="flex items-center space-x-2">
                <Input
                  readOnly
                  value={inviteLink}
                  className="flex-1 text-xs bg-gray-100 border-gray-300 text-gray-700 truncate rounded"
                  title={inviteLink}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className={`border-gray-300 text-gray-600 hover:bg-gray-100 ${copied ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-100' : ''}`}
                >
                  {copied ? '已复制' : '复制'}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">分享此链接邀请学生加入。</p>
            </div>
          </Card>
          <div className="flex-grow"></div>
          <SidebarFooterLinks />
      </aside>
    </div>
  );
};
