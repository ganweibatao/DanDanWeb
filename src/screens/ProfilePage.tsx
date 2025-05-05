import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchStudentProfile, StudentProfile, updateStudentProfile } from '../services/studentApi';
import { provinces } from '../lib/chinaRegions';
// import { useTheme } from '../context/ThemeContext'; // Removed unused import
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input'; // Import Input
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog"; // Use relative path for Dialog components
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'; // 引入Select组件
import {
  HomeIcon, 
  UsersIcon, 
  StarIcon, 
  ZapIcon, 
  ShoppingCartIcon, 
  UserCircleIcon, 
  MoreHorizontalIcon,
  Edit3Icon,       // For edit button
  FlameIcon,       // For streak
  GemIcon,         // For gems/lingots (alternative: Diamond)
  BookOpenIcon,    // For words learned
  HeartIcon,       // For lives
  GiftIcon,        // For invite friends
  ChevronRightIcon, // For invite friends link
  CopyIcon,        // For copy link button
  Settings,        // For settings icon
  User            // For user icon
} from 'lucide-react';
import { Sidebar } from './Students/StudentsSidebar'; // Import Sidebar
import { SidebarFooterLinks } from '../components/layout/SidebarFooterLinks'; // Import SidebarFooterLinks
import { gradeMap } from '../lib/constants'; // Import gradeMap

type EditableUserData = {
  username: string;
  handle: string;
  gender: string;
  age: number;
  grade: string;
  province: string;
  city: string;
  avatar?: File | null;
};

// 性别和年级映射
const genderMap: Record<string, string> = { male: '男', female: '女', other: '其他' };

export const ProfilePage = (): JSX.Element => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { studentId } = useParams();
  const [inviteLink] = useState('https://invite.DanZai.com/BDHTZT B5CW...');
  
  // 获取学生信息
  const { data: userData, isLoading, isError } = useQuery<StudentProfile>({
    queryKey: ['studentProfile', studentId],
    queryFn: () => fetchStudentProfile(studentId!),
    enabled: !!studentId,
  });
  
  // 编辑状态
  const [isEditing, setIsEditing] = useState(false);
  // 用于编辑的临时数据状态
  const [editedData, setEditedData] = useState<EditableUserData | null>(null);

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

  // 当userData变化时，初始化编辑数据
  useEffect(() => {
    if (userData) {
      // gender/grade转为中文label
      let genderLabel = userData.gender;
      if (genderLabel === 'male') genderLabel = '男';
      else if (genderLabel === 'female') genderLabel = '女';
      else if (genderLabel === 'other') genderLabel = '其他';
      let gradeLabel = gradeMap[userData.grade || ''] || userData.grade || '';
      setEditedData({
        username: userData.username || '',
        handle: userData.email || '', // 暂用email做真实姓名
        gender: genderLabel || '',
        age: userData.age || 0,
        grade: gradeLabel,
        province: userData.province || '',
        city: userData.city || '',
      });
      setSelectedProvince(userData.province || '');
      setSelectedCity(userData.city || '');
    }
  }, [userData]);

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedData(prev => prev ? { ...prev, [name]: value } : prev);
  };

  // 处理年龄输入变化 (确保是数字)
  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) { 
      setEditedData(prev => prev ? { ...prev, age: value === '' ? 0 : parseInt(value, 10) } : prev);
    }
  };

  // 开始编辑
  const handleEdit = () => {
    if (userData) {
    setEditedData({
        username: userData.username || '',
        handle: userData.email || '',
        gender: userData.gender || '',
        age: userData.age || 0,
        grade: userData.grade || '',
        province: userData.province || '',
        city: userData.city || '',
      });
      setSelectedProvince(userData.province || '');
      setSelectedCity(userData.city || '');
    setIsEditing(true);
    }
  };

  // 保存编辑
  const handleSave = async () => {
    if (!editedData || !studentId) return;

    // gender、grade需转为后端值
    let gender = editedData.gender;
    if (gender === '男') gender = 'male';
    else if (gender === '女') gender = 'female';
    else if (gender === '其他') gender = 'other';

    let grade = Object.keys(gradeMap).find(key => gradeMap[key] === editedData.grade) || editedData.grade;

    // 构造payload
    const payload: any = {
      username: editedData.username,
      email: editedData.handle,
      gender,
      age: editedData.age,
      grade,
      province: selectedProvince,
      city: selectedCity,
    };
    if (editedData.avatar) payload.avatar = editedData.avatar;
    try {
      await updateStudentProfile(studentId, payload);
    setIsEditing(false);
      setAvatarPreview(null);
      // 刷新数据 (改用 invalidateQueries)
      queryClient.invalidateQueries({ queryKey: ['studentProfile', studentId] });
    } catch (e) {
      alert('保存失败');
    }
  };

  // 取消编辑
  const handleCancel = () => {
    setIsEditing(false);
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

  // Placeholder flags (replace with actual flag components/images later)
  const FlagPlaceholder = ({ countryCode }: { countryCode: string }) => (
    <div className="w-8 h-5 rounded-sm bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
      {countryCode}
    </div>
  );

  if (isLoading) return <div>加载中...</div>;
  if (isError || !userData) return <div>未找到学生信息</div>;

  // 统计数据（后端暂未返回，先用0或userData.id等占位）
  const stats = {
    streak: 0,
    xp: 0,
    gems: 0,
    wordsLearned: 0,
    lives: 0,
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 font-sans">
      <Sidebar /> {/* Use the shared Sidebar component */}

      {/* Main Content Area */}
      <main className="flex-1 p-10 overflow-y-auto bg-gray-50 dark:bg-gray-800">
        {/* Profile Header */}
        <div className="relative bg-white dark:bg-gray-700 rounded-xl shadow-md p-6 mb-8">
          {/* Edit Button */} 
          {!isEditing && (
            <Button 
              variant="outline" 
              size="icon" 
              className="absolute top-4 right-4 bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-full"
              onClick={handleEdit} // 点击触发编辑模式
            >
              <Edit3Icon className="w-5 h-5" />
            </Button>
          )}
          
          {/* Avatar Placeholder */} 
          <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-indigo-500 dark:from-purple-600 dark:to-indigo-700 rounded-lg flex items-center justify-center text-white text-4xl font-bold shadow-lg relative">
            {isEditing && avatarPreview ? (
              <img src={avatarPreview} alt="avatar" className="w-28 h-28 rounded-lg object-cover" />
            ) : userData.avatar ? (
              <img src={userData.avatar} alt="avatar" className="w-28 h-28 rounded-lg object-cover" />
            ) : (
             <UserCircleIcon className="w-20 h-20 opacity-80"/>
            )}
            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-white bg-opacity-80 rounded-full p-1 cursor-pointer border border-gray-300">
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                <Edit3Icon className="w-5 h-5 text-gray-600" />
              </label>
            )}
          </div>
          
          {/* User Info */} 
          <div className="text-center">
            {isEditing && editedData ? (
              <>
                {/* 编辑模式下的输入框 */}
                {/* Wrap inputs for better layout and add labels */}
                <div className="space-y-2 mb-4 max-w-sm mx-auto">
                  {/* Nickname Input First */}
                  <div>
                    <label htmlFor="usernameInput" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 text-left">昵称</label>
                    <Input 
                      id="usernameInput"
                      name="username" // Corresponds to nickname
                      value={editedData.username}
                      onChange={handleInputChange}
                      placeholder="昵称"
                      className="text-xl font-bold uppercase text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 w-full" // Added uppercase
                    />
                  </div>
                </div>

                {/* Gender, Age, Grade, Location in Edit Mode */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4 max-w-xs mx-auto text-sm">
                   {/* Gender Select */}
                   <Select
                     value={editedData.gender}
                     onValueChange={(value) => setEditedData(prev => prev ? { ...prev, gender: value } : prev)}
                   >
                     <SelectTrigger className="p-1 border rounded bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-800 dark:text-gray-100">
                       <SelectValue placeholder="性别" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="男">男</SelectItem>
                       <SelectItem value="女">女</SelectItem>
                       <SelectItem value="其他">其他</SelectItem>
                     </SelectContent>
                   </Select>
                   {/* Age Input */}
                   <Input 
                     name="age"
                     type="number" // Use type number for age
                     value={editedData.age}
                     onChange={handleAgeChange}
                     placeholder="年龄"
                     min="0"
                     className="p-1 border rounded bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-800 dark:text-gray-100"
                   />
                   {/* Grade Input */}
                   <Select
                     value={editedData.grade}
                     onValueChange={(value) => setEditedData(prev => prev ? { ...prev, grade: value } : prev)}
                   >
                     <SelectTrigger className="p-1 border rounded bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-800 dark:text-gray-100">
                       <SelectValue placeholder="年级" />
                     </SelectTrigger>
                     <SelectContent>
                       {Object.entries(gradeMap).map(([key, label]) => (
                         <SelectItem key={key} value={label}>{label}</SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                   {/* 省份选择 */}
                   <Select
                     value={selectedProvince}
                     onValueChange={(value) => {
                       setSelectedProvince(value);
                       setSelectedCity(''); // 重置城市
                       setEditedData(prev => prev ? { ...prev, province: value, city: '' } : prev);
                     }}
                   >
                     <SelectTrigger className="p-1 border rounded bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-800 dark:text-gray-100">
                       <SelectValue placeholder="省份" />
                     </SelectTrigger>
                     <SelectContent>
                       {provinces.map(p => (
                         <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                   {/* 城市选择 */}
                   <Select
                     value={selectedCity}
                     onValueChange={(value) => {
                       setSelectedCity(value);
                       setEditedData(prev => prev ? { ...prev, city: value } : prev);
                     }}
                     disabled={!selectedProvince}
                   >
                     <SelectTrigger className="p-1 border rounded bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-800 dark:text-gray-100">
                       <SelectValue placeholder="城市" />
                     </SelectTrigger>
                     <SelectContent>
                       {provinces.find(p => p.name === selectedProvince)?.cities.map(city => (
                         <SelectItem key={city} value={city}>{city}</SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>
                 {/* Save/Cancel Buttons */}
                 <div className="flex justify-center space-x-3 mt-4">
                   <Button onClick={handleSave} size="sm" className="bg-green-500 hover:bg-green-600 text-white">保存</Button>
                   <Button onClick={handleCancel} size="sm" variant="outline">取消</Button>
                 </div>
              </>
            ) : (
              <>
                {/* 显示模式 */}
                {/* Display Nickname (username) prominently, bold and uppercase */}
                <h1 className="text-2xl font-bold uppercase text-gray-800 dark:text-gray-100 mb-1">{userData.username}</h1>
                {/* Display Real Name (handle) below */}
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{userData.email}</p>
                {/* Display Gender, Age, Grade, Location */}
                <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                  <div className="flex justify-center items-center space-x-2">
                    <span>{genderMap[userData.gender || ''] || '无'}</span>
                    <span>·</span>
                    <span>{userData.age ? userData.age + ' 岁' : '无'}</span>
                  </div>
                  <div className="flex justify-center items-center space-x-2">
                    <span>{gradeMap[userData.grade || ''] || '无'}</span>
                    <span>·</span>
                    <span>
                      {userData.province || userData.city
                        ? `${userData.province || ''}${userData.city ? ' · ' + userData.city : ''}`
                        : '地区无'}
                    </span>
                  </div>
                 </div>
              </>
            )}
          </div>
        </div>

        {/* Statistics Section */}
        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">统计学</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="bg-white dark:bg-gray-700 shadow rounded-lg">
            <CardContent className="flex items-center p-4 space-x-3">
              <FlameIcon className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.streak}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">连续登录天数</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-700 shadow rounded-lg">
            <CardContent className="flex items-center p-4 space-x-3">
              <ZapIcon className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.xp}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">总经验值</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-700 shadow rounded-lg">
            <CardContent className="flex items-center p-4 space-x-3">
              <GemIcon className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.gems}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">魔石</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-700 shadow rounded-lg">
            <CardContent className="flex items-center p-4 space-x-3">
              <BookOpenIcon className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.wordsLearned}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">学到的单词</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Placeholder for Achievements or other sections */}

      </main>

      {/* Right Sidebar */}
      <aside className="w-72 bg-gray-100 dark:bg-gray-900 p-6 flex flex-col space-y-6 border-l border-gray-200 dark:border-gray-700">
         {/* Top Stats */} 
         <div className="flex justify-around items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow">
           <FlagPlaceholder countryCode="US" /> 
           <div className="flex items-center space-x-1 text-orange-500">
             <FlameIcon className="w-5 h-5" />
             <span className="font-bold text-sm">{stats.streak}</span>
           </div>
           <div className="flex items-center space-x-1 text-blue-500">
             <GemIcon className="w-5 h-5" />
             <span className="font-bold text-sm">{stats.gems}</span>
           </div>
           <div className="flex items-center space-x-1 text-red-500">
             <HeartIcon className="w-5 h-5" />
             <span className="font-bold text-sm">{stats.lives}</span>
           </div>
         </div>
         
         {/* Add Friends Card */} 
         <Card className="bg-white dark:bg-gray-800 shadow rounded-lg">
           <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-base font-semibold text-gray-700 dark:text-gray-200">添加好友</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
               <Dialog>
                 <DialogTrigger asChild>
                   <button className="flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                     <div className="flex items-center space-x-3">
                        <GiftIcon className="w-6 h-6 text-green-500"/>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">邀请朋友</span>
                     </div>
                     <ChevronRightIcon className="w-5 h-5 text-gray-400 dark:text-gray-500"/>
                   </button>
                 </DialogTrigger>
                 <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 rounded-lg p-6">
                   <DialogHeader className="text-center mb-4">
                     <div className="mx-auto mb-4 w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white text-3xl">
                       🦉
                     </div>
                     <DialogTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">邀请好友</DialogTitle>
                     <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                       分享就是快乐对不对？蛋仔好玩又免费，别藏着，大家一起玩才对！
                     </DialogDescription>
                   </DialogHeader>
                   <div className="grid gap-4 py-4">
                     <div className="flex items-center space-x-2">
                       <Input
                         id="invite-link"
                         value={inviteLink}
                         readOnly
                         className="flex-1 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 text-sm"
                       />
                       <Button type="button" size="sm" variant="outline" onClick={copyToClipboard} className="px-3 bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-blue-500 dark:text-blue-400 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md">
                         <CopyIcon className="w-4 h-4 mr-1" />
                         复制链接
                       </Button>
                     </div>
                     <p className="text-center text-xs text-gray-500 dark:text-gray-400 my-4">或分享至...</p>
                     <div className="flex justify-center space-x-4">
                       <Button variant="outline" className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg py-2">
                         FACEBOOK
                       </Button>
                       <Button variant="outline" className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg py-2">
                         推特
                       </Button>
                     </div>
                   </div>
                 </DialogContent>
               </Dialog>
            </CardContent>
         </Card>

         {/* Footer Links */}
         <SidebarFooterLinks />
      </aside>
    </div>
  );
}; 