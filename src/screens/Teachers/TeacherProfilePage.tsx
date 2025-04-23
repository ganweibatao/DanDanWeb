import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 移除 useParams
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { schoolService, TeacherProfile } from '../../services/teacherApi'; // 修改：导入 schoolService
import { useAuth } from '../../hooks/useAuth'; // 导入 useAuth
import { provinces } from '../../lib/chinaRegions';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
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
  // HomeIcon, // 根据需要保留或移除图标
  // UsersIcon,
  // StarIcon,
  ClockIcon, // 用于授课时长
  // ZapIcon,
  // ShoppingCartIcon,
  UserCircleIcon,
  // MoreHorizontalIcon,
  Edit3Icon,
  // FlameIcon,
  // GemIcon,
  // BookOpenIcon,
  // HeartIcon,
  // GiftIcon,
  // ChevronRightIcon,
  // CopyIcon
  StarIcon
} from 'lucide-react';
import { TeacherSidebar } from './TeacherSidebar'; // 修改：导入教师侧边栏
import { SidebarFooterLinks } from '../../components/layout/SidebarFooterLinks';

// 编辑数据类型，增加 teaching_hours
type EditableTeacherData = {
  username: string;
  email: string; // 假设用 email 作为标识
  gender: string;
  age: number;
  province: string;
  city: string;
  teaching_hours: number; // 增加授课时长
  avatar?: File | null;
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
    queryFn: () => schoolService.fetchTeacherProfile(teacherId!), // 修改：通过 schoolService 调用
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
    // 只有在 teacherData 成功加载后才初始化
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
        teaching_hours: teacherData.teaching_hours || 0,
      });
      setSelectedProvince(teacherData.province || '');
      setSelectedCity(teacherData.city || '');
      if (teacherData.avatar) {
         setAvatarPreview(teacherData.avatar);
      }
    }
  }, [teacherData]);

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedData(prev => prev ? { ...prev, [name]: value } : prev);
  };

 // 处理数字输入变化 (确保是数字)
  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof EditableTeacherData) => {
    const value = e.target.value;
    // 允许空字符串或纯数字
    if (value === '' || /^\d+$/.test(value)) {
        setEditedData(prev => prev ? { ...prev, [fieldName]: value === '' ? 0 : parseInt(value, 10) } : prev);
    } else if (/^\d+\.$/.test(value)) {
        // 可能需要特殊处理浮点数，这里假设是整数
    }
  };


  // 开始编辑
  const handleEdit = () => {
    // 只有在 teacherData 存在时才允许编辑
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
        teaching_hours: teacherData.teaching_hours || 0,
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

    const payload: any = {
      username: editedData.username,
      email: editedData.email,
      gender,
      age: editedData.age,
      province: selectedProvince,
      city: selectedCity,
      teaching_hours: editedData.teaching_hours,
    };
    if (editedData.avatar instanceof File) {
        payload.avatar = editedData.avatar;
    }

    try {
      // 保存后直接用返回的新数据刷新页面
      const res = await schoolService.updateTeacherProfile(teacherId, payload);
      setIsEditing(false);
      // 立即用新数据刷新页面
      if (res) {
        queryClient.setQueryData(['teacherProfile', teacherId], res);
      }
      // 保险起见，依然失效缓存，确保后端数据同步
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
    setEditedData(null);
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
    // 可以根据需要重定向到登录页或显示权限不足信息
    // navigate('/login');
    return <div className="flex justify-center items-center h-screen">请以教师身份登录查看此页面</div>;
  }

  if (authError) {
     return <div className="flex justify-center items-center h-screen">验证身份时出错: {authError}</div>;
  }
  
  // 此时 isAuthenticated 为 true, userRole 为 'teacher', teacherId 应该存在
  if (isProfileLoading) {
      return <div className="flex justify-center items-center h-screen">加载教师信息中...</div>;
  }

  if (isProfileError || (!isProfileLoading && !teacherData)) {
      // 现在如果 teacherId 存在，错误信息会显示正确的 ID
      return <div className="flex justify-center items-center h-screen">加载教师信息失败或未找到 (ID: {teacherId || '未知'})</div>;
  }
  
  // --- 结束更新加载和错误状态判断逻辑 ---
  
  // 此处 teacherData 保证已定义
  const currentTeacherData = teacherData!;

  // --- 教师统计数据处理 ---
  const teachingHours = currentTeacherData.teaching_hours || 0;
  const studentCount = 0; // 示例，需要后端数据

  // 根据授课时长确定鼓励文本和里程碑图标
  let encouragementText = "准备开始教学吧！";
  let milestoneIcon = null;
  const milestoneReached = teachingHours >= 10; // 假设 10 小时是第一个小里程碑

  if (teachingHours >= 1000) {
    encouragementText = "令人瞩目！已专注教学超 1000 小时！";
    milestoneIcon = <StarIcon className="h-3 w-3 text-yellow-400 inline ml-1" />;
  } else if (teachingHours >= 500) {
    encouragementText = "成就斐然！已投入教学超 500 小时！";
    milestoneIcon = <StarIcon className="h-3 w-3 text-yellow-400 inline ml-1" />;
  } else if (teachingHours >= 100) {
    encouragementText = "非常棒！教学已达 100 小时里程碑！";
    milestoneIcon = <StarIcon className="h-3 w-3 text-yellow-400 inline ml-1" />;
  } else if (teachingHours >= 50) {
    encouragementText = "持续进步！教学时长突破 50 小时！";
     milestoneIcon = <StarIcon className="h-3 w-3 text-yellow-400 inline ml-1" />;
  } else if (teachingHours >= 10) {
    encouragementText = "良好的开端！已完成 10 小时教学。";
     milestoneIcon = <StarIcon className="h-3 w-3 text-yellow-400 inline ml-1" />;
  } else if (teachingHours > 0) {
    encouragementText = "每一次教学都在创造价值！";
  }
  
  const stats = {
    teachingHours: teachingHours,
    studentCount: studentCount, 
  };
  // --- 结束统计数据处理 ---

  // Determine the final avatar source or default state
  const finalAvatarSrc = avatarPreview || currentTeacherData.avatar;
  const userNameInitial = currentTeacherData.username ? currentTeacherData.username[0].toUpperCase() : '?';

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 font-sans">
      <TeacherSidebar
        user={sidebarUser}
        activeView={''}
        setActiveView={handleSidebarNavigation}
      />
      <main className="flex-1 p-10 overflow-y-auto bg-gray-50 dark:bg-gray-800">
        <div className="relative bg-white dark:bg-gray-700 rounded-2xl shadow-lg p-8 mb-8 transition-shadow hover:shadow-2xl">
          {!isEditing && (
            <Button
              variant="outline"
              size="icon"
              className="absolute top-4 right-4 bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-600 dark:text-gray-300 hover:bg-blue-500 hover:text-white transition-colors rounded-full"
              onClick={handleEdit}
            >
              <Edit3Icon className="h-4 w-4" />
            </Button>
          )}
          <div className="flex flex-col items-center sm:flex-row sm:items-start">
            <div className="relative mb-4 sm:mb-0 sm:mr-6 flex-shrink-0 group">
              <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-purple-400 via-blue-400 to-pink-400 shadow-lg group-hover:scale-105 transition-transform duration-200">
              {finalAvatarSrc ? (
                <img
                  src={finalAvatarSrc}
                  alt="Avatar"
                    className="w-full h-full rounded-full object-cover border-4 border-white dark:border-gray-800"
                />
              ) : (
                  <div className="w-full h-full rounded-full flex items-center justify-center bg-purple-600">
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
              {isEditing && editedData ? (
                <>
                  <Input
                    name="username"
                    value={editedData.username}
                    onChange={handleInputChange}
                    placeholder="用户名"
                    className="text-2xl font-bold mb-2 dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-blue-400"
                  />
                  <Input
                    name="email"
                    type="email"
                    value={editedData.email}
                    onChange={handleInputChange}
                    placeholder="邮箱"
                    className="text-gray-500 dark:text-gray-400 mb-4 dark:bg-gray-600 focus:ring-2 focus:ring-blue-400"
                  />
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-bold mb-1 text-gray-800 dark:text-white">
                    {currentTeacherData.username || '未知用户名'}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {currentTeacherData.email || '未提供邮箱'}
                  </p>
                </>
              )}
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm mb-4">
                {isEditing && editedData ? (
                  <>
                    <div className="flex items-center">
                      <span className="text-gray-500 dark:text-gray-400 w-12 mr-2">性别:</span>
                      <Select
                        name="gender"
                        value={editedData.gender}
                        onValueChange={(value) => setEditedData(prev => prev ? { ...prev, gender: value } : prev)}
                      >
                        <SelectTrigger className="w-[100px] dark:bg-gray-600 dark:text-white">
                          <SelectValue placeholder="选择性别" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="男">男</SelectItem>
                          <SelectItem value="女">女</SelectItem>
                          <SelectItem value="其他">其他</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-500 dark:text-gray-400 w-12 mr-2">年龄:</span>
                      <Input
                        type="number"
                        name="age"
                        value={editedData.age}
                        onChange={(e) => handleNumericChange(e, 'age')}
                        placeholder="年龄"
                        className="w-20 dark:bg-gray-600 dark:text-white"
                      />
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-500 dark:text-gray-400 w-12 mr-2">省份:</span>
                      <Select
                        value={selectedProvince}
                        onValueChange={(value) => {
                          setSelectedProvince(value);
                          setSelectedCity(''); // Reset city when province changes
                          setEditedData(prev => prev ? { ...prev, province: value, city: '' } : prev);
                        }}
                      >
                        <SelectTrigger className="w-[120px] dark:bg-gray-600 dark:text-white">
                          <SelectValue placeholder="选择省份" />
                        </SelectTrigger>
                        <SelectContent>
                          {provinces.map(p => <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-500 dark:text-gray-400 w-12 mr-2">城市:</span>
                      <Select
                        value={selectedCity}
                        onValueChange={(value) => {
                           setSelectedCity(value);
                           setEditedData(prev => prev ? { ...prev, city: value } : prev);
                        }}
                        disabled={!selectedProvince}
                      >
                        <SelectTrigger className="w-[120px] dark:bg-gray-600 dark:text-white">
                          <SelectValue placeholder="选择城市" />
                        </SelectTrigger>
                        <SelectContent>
                          {provinces.find(p => p.name === selectedProvince)?.cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center col-span-2">
                      <ClockIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                      <span className="text-gray-500 dark:text-gray-400 mr-2">总授课:</span>
                      <Input
                        type="number"
                        name="teaching_hours"
                        value={editedData.teaching_hours}
                        onChange={(e) => handleNumericChange(e, 'teaching_hours')}
                        placeholder="小时"
                        className="w-20 dark:bg-gray-600 dark:text-white mr-1"
                      />
                      <span className="text-gray-500 dark:text-gray-400">小时</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">{genderMap[currentTeacherData.gender || ''] || '未设置性别'}</span>
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">{currentTeacherData.age ? `${currentTeacherData.age}岁` : '未设置年龄'}</span>
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                      <span className="text-gray-600 dark:text-gray-300">
                        总授课 {stats.teachingHours} 小时
                      </span>
                    </div>
                    <div className="flex items-center col-span-2">
                      <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs">
                        {currentTeacherData.province || '未设置省份'}{currentTeacherData.city ? ` - ${currentTeacherData.city}` : ''}
                        </span>
                    </div>
                  </>
                )}
              </div>
              {isEditing ? (
                <div className="flex justify-center sm:justify-start space-x-3 mt-4">
                  <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">保存更改</Button>
                  <Button variant="outline" onClick={handleCancel}>取消</Button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">教学统计</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card className="dark:bg-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-gray-300">总授课时长</CardTitle>
              <ClockIcon className={`h-4 w-4 text-muted-foreground dark:text-gray-400 ${milestoneReached ? 'text-indigo-400' : ''}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent dark:text-white">
                {stats.teachingHours}小时
              </div>
              <p className="text-xs mt-2">
                <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">{encouragementText}{milestoneIcon}</span>
              </p>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-700">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium dark:text-gray-300">管理学生数</CardTitle>
             </CardHeader>
             <CardContent>
              <div className="text-3xl font-extrabold text-gray-800 dark:text-white">{stats.studentCount}</div>
             </CardContent>
           </Card>
        </div>
      </main>
      <aside className="w-72 bg-gray-100 dark:bg-gray-900 p-6 flex-shrink-0 border-l border-gray-200 dark:border-gray-700 flex flex-col space-y-6">
           <Card className="dark:bg-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium dark:text-gray-300">邀请学生链接</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Input
                  readOnly
                  value={inviteLink}
                className="flex-1 text-xs dark:bg-gray-600 dark:text-gray-300 truncate"
                title={inviteLink}
                />
              <Button
                variant="outline"
                size="sm"
                onClick={() => { copyToClipboard(); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                className={`dark:text-gray-300 dark:border-gray-500 ${copied ? 'bg-green-100 text-green-700 border-green-400' : ''}`}
              >
                {copied ? '已复制' : '复制'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">分享此链接邀请学生加入您的班级。</p>
            </CardContent>
          </Card>
          <div className="flex-grow"></div> 
          <SidebarFooterLinks />
      </aside>
    </div>
  );
};
