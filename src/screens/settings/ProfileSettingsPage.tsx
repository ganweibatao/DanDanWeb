import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../../components/layout/Sidebar'; // Import Sidebar
import { SettingsSidebar } from '../../components/layout/SettingsRightSidebar'; // 导入设置侧边栏
import { PencilIcon, EyeIcon, EyeOffIcon } from 'lucide-react'; // For avatar edit button and password visibility

// Mock user data - replace with actual data fetching
const mockUserData = {
    avatarUrl: '', // Add URL if available
    avatarFallback: 'D', // Or derive from name/username
    name: 'Duo_acf37534',
    username: 'wBVua40q',
    email: '7510041637@qq.com',
    isEmailVerified: false,
};

export const ProfileSettingsPage = (): JSX.Element => {
  const navigate = useNavigate();
  // State for form fields, initialized with mock data
  const [name, setName] = useState(mockUserData.name);
  const [username, setUsername] = useState(mockUserData.username);
  const [email, setEmail] = useState(mockUserData.email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleSaveChanges = () => {
      // TODO: Implement logic to save changes (e.g., API call)
      console.log("Saving changes:", { name, username, email });
      // Potentially update password if fields are filled
  };

  const handleVerifyEmail = () => {
      // TODO: Implement logic to trigger email verification
      console.log("Triggering email verification for:", email);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-100 text-gray-900 dark:text-gray-900 font-sans">
      <Sidebar /> {/* Use the shared Sidebar component */}

      {/* Main Content Area adapts via dark: prefixes */}
      <main className="flex-1 p-10 overflow-y-auto h-screen bg-white dark:bg-gray-900">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-200">个人档案</h1>

        {/* Profile Form */}
        <div className="max-w-2xl space-y-8">
          {/* Avatar Section */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-white dark:border-gray-700 shadow-md">
                 {mockUserData.avatarUrl && <AvatarImage src={mockUserData.avatarUrl} alt="User Avatar" />}
                 <AvatarFallback className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-4xl font-semibold">
                     {mockUserData.avatarFallback}
                 </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="icon" className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full w-8 h-8 border-2 border-white dark:border-gray-900">
                 <PencilIcon className="w-4 h-4" />
              </Button>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-500 dark:text-gray-400">头像</h2>
              {/* Optionally add upload/change instructions here */}
            </div>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">姓名</label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Username */}
          <div>
             <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">用户名</label>
             <Input
               id="username"
               type="text"
               value={username}
               onChange={(e) => setUsername(e.target.value)}
               className="w-full bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500"
             />
          </div>

          {/* Email */}
           <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">邮箱</label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500"
              />
              {!mockUserData.isEmailVerified && (
                  <div className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
                      邮件未验证。
                      <button onClick={handleVerifyEmail} className="ml-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline">立即验证</button>
                  </div>
              )}
           </div>

          {/* Password Section */}
           <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
               <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-4">密码</h3>
               {/* Current Password */}
               <div>
                 <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">当前密码</label>
                 <div className="relative">
                   <Input
                     id="currentPassword"
                     type={showCurrentPassword ? "text" : "password"}
                     value={currentPassword}
                     onChange={(e) => setCurrentPassword(e.target.value)}
                     className="w-full bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500 pr-10" // Add padding for the icon
                   />
                   <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                   >
                      {showCurrentPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                   </button>
                 </div>
               </div>

               {/* New Password */}
               <div>
                 <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">输入新密码</label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500 pr-10" // Add padding for the icon
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      {showNewPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                 </div>
               </div>
           </div>

          {/* Save Button */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
                onClick={handleSaveChanges}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 disabled:bg-gray-300 dark:disabled:bg-gray-600"
                // Optionally disable the button if no changes or passwords are weak
                // disabled={!name && !username && !email && !(currentPassword && newPassword)}
            >
                保存更改
            </Button>
          </div>

          {/* Account Actions Section */}
          <div className="pt-8 mt-8 border-t border-gray-200 dark:border-gray-700 space-y-4">
             <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">
               导出数据
             </button>
             <div> {/* Wrap delete button for potential modal trigger */}
               <button className="text-sm text-red-600 dark:text-red-500 hover:underline font-medium">
                 删除帐户
               </button>
               {/* TODO: Add confirmation dialog/modal for delete action */}
             </div>
          </div>
        </div>
      </main>

      {/* 使用共享的设置侧边栏组件 */}
      <SettingsSidebar />
    </div>
  );
};