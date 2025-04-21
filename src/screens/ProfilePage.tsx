import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CopyIcon         // For copy link button
} from 'lucide-react';
import { Sidebar } from '../components/layout/StudentsSidebar'; // Import Sidebar
import { SidebarFooterLinks } from '../components/layout/SidebarFooterLinks'; // Import SidebarFooterLinks

// Placeholder user data
const userData = {
  username: "Duo_acf37534",
  handle: "wBVua40q",
  joinDate: "2025年4月加入",
  streak: 1,
  xp: 15,
  gems: 505,
  wordsLearned: 0,
  lives: 4,
  gender: "男",
  age: 25,
  grade: "五年级",
  location: "北京, 中国"
};

// 定义可编辑字段的类型
type EditableUserData = Pick<typeof userData, 'username' | 'handle' | 'gender' | 'age' | 'grade' | 'location'>;

export const ProfilePage = (): JSX.Element => {
  const navigate = useNavigate();
  // const { theme } = useTheme(); // Removed unused hook call
  const [inviteLink] = useState('https://invite.DanZai.com/BDHTZT B5CW...');
  
  // 编辑状态
  const [isEditing, setIsEditing] = useState(false);
  // 用于编辑的临时数据状态
  const [editedData, setEditedData] = useState<EditableUserData>({
    username: userData.username,
    handle: userData.handle,
    gender: userData.gender,
    age: userData.age,
    grade: userData.grade,
    location: userData.location
  });

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedData(prev => ({ ...prev, [name]: value }));
  };

  // 处理年龄输入变化 (确保是数字)
  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 只允许数字，或者为空字符串（允许用户清空输入框）
    if (/^\d*$/.test(value)) { 
        setEditedData(prev => ({ ...prev, age: value === '' ? 0 : parseInt(value, 10) }));
    }
  };

  // 开始编辑
  const handleEdit = () => {
    setEditedData({
      username: userData.username,
      handle: userData.handle,
      gender: userData.gender,
      age: userData.age,
      grade: userData.grade,
      location: userData.location
    });
    setIsEditing(true);
  };

  // 保存编辑
  const handleSave = () => {
    // 在实际应用中，这里会调用 API 更新后端数据
    // 这里我们只更新模拟的 userData (注意：这不会持久化)
    userData.username = editedData.username;
    userData.handle = editedData.handle;
    userData.gender = editedData.gender;
    userData.age = editedData.age;
    userData.grade = editedData.grade;
    userData.location = editedData.location;
    console.log("Updated userData (mock):", userData);
    setIsEditing(false);
  };

  // 取消编辑
  const handleCancel = () => {
    setIsEditing(false);
    // 无需重置 editedData，因为下次编辑时会重新从 userData 初始化
  };

  // Function to copy the link
  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink)
      .then(() => {
        // Optional: Show a success message or change button text
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
          <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-indigo-500 dark:from-purple-600 dark:to-indigo-700 rounded-lg flex items-center justify-center text-white text-4xl font-bold shadow-lg">
            {/* Placeholder for actual avatar component/image */} 
             <UserCircleIcon className="w-20 h-20 opacity-80"/>
          </div>
          
          {/* User Info */} 
          <div className="text-center">
            {isEditing ? (
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
                      placeholder="昵称 (例如 Duo_acf37534)"
                      className="text-xl font-bold uppercase text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 w-full" // Added uppercase
                    />
                  </div>
                  {/* Real Name Input Second */}
                  <div>
                    <label htmlFor="handleInput" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 text-left">真实姓名</label>
                    <Input 
                      id="handleInput"
                      name="handle" // Corresponds to real name
                      value={editedData.handle}
                      onChange={handleInputChange}
                      placeholder="真实姓名 (例如 wBVua40q)" 
                      className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 w-full"
                    />
                  </div>
                </div>

                <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">{userData.joinDate}</p>
                {/* Gender, Age, Grade, Location in Edit Mode */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4 max-w-xs mx-auto text-sm">
                   {/* Gender Select */}
                   <select 
                     name="gender"
                     value={editedData.gender}
                     onChange={handleInputChange}
                     className="p-1 border rounded bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-800 dark:text-gray-100"
                   >
                     <option value="男">男</option>
                     <option value="女">女</option>
                     <option value="其他">其他</option>
                   </select>
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
                   <Input 
                     name="grade"
                     value={editedData.grade}
                     onChange={handleInputChange}
                     placeholder="年级"
                     className="p-1 border rounded bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-800 dark:text-gray-100"
                   />
                   {/* Location Input */}
                   <Input 
                     name="location"
                     value={editedData.location}
                     onChange={handleInputChange}
                     placeholder="省市"
                     className="p-1 border rounded bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-800 dark:text-gray-100"
                   />
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
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{userData.handle}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">{userData.joinDate}</p>
                {/* Display Gender, Age, Grade, Location */}
                <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                  <div className="flex justify-center items-center space-x-2">
                    <span>{userData.gender}</span>
                    <span>·</span>
                    <span>{userData.age} 岁</span>
                  </div>
                  <div className="flex justify-center items-center space-x-2">
                    <span>{userData.grade}</span>
                    <span>·</span>
                    <span>{userData.location}</span>
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
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{userData.streak}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">连续登录天数</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-700 shadow rounded-lg">
            <CardContent className="flex items-center p-4 space-x-3">
              <ZapIcon className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{userData.xp}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">总经验值</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-700 shadow rounded-lg">
            <CardContent className="flex items-center p-4 space-x-3">
              <GemIcon className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{userData.gems}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">魔石</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-700 shadow rounded-lg">
            <CardContent className="flex items-center p-4 space-x-3">
              <BookOpenIcon className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{userData.wordsLearned}</p>
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
             <span className="font-bold text-sm">{userData.streak}</span>
           </div>
           <div className="flex items-center space-x-1 text-blue-500">
             <GemIcon className="w-5 h-5" />
             <span className="font-bold text-sm">{userData.gems}</span>
           </div>
           <div className="flex items-center space-x-1 text-red-500">
             <HeartIcon className="w-5 h-5" />
             <span className="font-bold text-sm">{userData.lives}</span>
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