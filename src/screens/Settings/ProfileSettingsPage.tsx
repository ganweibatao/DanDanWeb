import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Sidebar } from '../Students/StudentsSidebar';
import { SettingsSidebar } from '../../components/layout/SettingsRightSidebar';
import { PencilIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import { useSettings } from '../../context/SettingsContext';
import { fetchStudentProfile, updateStudentProfile, StudentProfile } from '../../services/studentApi'; // Import student APIs
import axios from 'axios';

// Remove mock data
// const mockUserData = { ... };

// 在组件顶部加邮箱格式校验函数
function isEmailFormat(str: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

export const ProfileSettingsPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { studentId } = useParams<{ studentId: string }>(); // Get studentId from URL
  const queryClient = useQueryClient();

  // Fetch student data using React Query
  const { data: userData, isLoading, isError } = useQuery<StudentProfile>({
    queryKey: ['studentProfile', studentId],
    queryFn: () => fetchStudentProfile(studentId!),
    enabled: !!studentId, // Only run query if studentId exists
  });

  // State for form fields
  const [realName, setRealName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(''); // Add state for phone number
  const [avatarFile, setAvatarFile] = useState<File | null>(null); // State for avatar file
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null); // State for avatar preview URL

  // State for email change verification
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // State for settings (unchanged)
  const { settings, updateSetting } = useSettings();
  const { isSoundEnabled } = settings;

  // 删除账户相关状态
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Initialize form fields when userData is loaded
  useEffect(() => {
    if (userData) {
      console.log("User Data Received in Settings:", userData);
      setRealName(userData.real_name || '');
      setUsername(userData.username || '');
      // 只在邮箱为空且用户名是邮箱格式时才用用户名
      let initialEmail = '';
      if (userData.email) {
        initialEmail = userData.email;
      } else if (userData.username && isEmailFormat(userData.username)) {
        initialEmail = userData.username;
      }
      setEmail(initialEmail);
      setNewEmail(initialEmail);
      setPhoneNumber(userData.phone_number || '');
      setAvatarPreview(userData.avatar || null);
    }
  }, [userData]);

  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    if (!studentId) return;
    const payload: Partial<StudentProfile> & { real_name?: string } = {};
    if (realName !== (userData?.real_name || '')) payload.real_name = realName;
    if (username !== (userData?.username || '')) payload.username = username;
    if (phoneNumber !== (userData?.phone_number || '')) payload.phone_number = phoneNumber; // Add phone number to payload if changed
    if (avatarFile) payload.avatar = avatarFile as any;
    
    // TODO: Implement password change logic separately if needed
    // This current save focuses on profile details (name, username, avatar)

    if (Object.keys(payload).length === 0) {
        console.log("No changes to save.");
        return; // Nothing to save
    }

    try {
      await updateStudentProfile(studentId, payload);
      queryClient.invalidateQueries({ queryKey: ['studentProfile', studentId] });
      setAvatarFile(null); // Reset avatar file state after saving
      // Maybe show a success toast here
      console.log("Profile updated successfully!");
    } catch (error: any) { // Add : any to explicitly type error
      console.error("Failed to update profile:", error);
      // Log more details if available
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error data:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
        alert(`保存失败: ${error.response.data?.detail || error.response.statusText || '服务器错误'}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
        alert('保存失败: 未收到服务器响应');
      } else {
        // Something happened in setting up the request that triggered an Error
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
    setIsVerifying(true);
    setVerificationError(null);
    console.log('Simulating API call: Initiate email change for:', newEmail);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Assume API call is successful
      setIsVerificationSent(true);
    } catch (error) {
      console.error("Failed to initiate email change:", error);
      setVerificationError('发送验证码失败，请稍后重试。');
    } finally {
      setIsVerifying(false);
    }
  };

  // Confirm email change (mock)
  const handleConfirmEmailChange = async () => {
    if (!verificationCode || !newEmail) return;
    setIsVerifying(true);
    setVerificationError(null);
    console.log('Simulating API call: Confirm email change for:', newEmail, 'with code:', verificationCode);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Assume verification is successful
      console.log('Email change confirmed successfully!');
      // Update the main email state (reflecting change)
      setEmail(newEmail);
      // Reset verification state
      setIsVerificationSent(false);
      setVerificationCode('');
      // Invalidate user query to fetch updated data
      queryClient.invalidateQueries({ queryKey: ['studentProfile', studentId] });
      // TODO: Show success toast
    } catch (error) {
      console.error("Failed to confirm email change:", error);
      setVerificationError('验证码错误或已过期。');
    } finally {
      setIsVerifying(false);
    }
  };

  // 删除账户处理函数
  const handleDeleteAccount = async () => {
    setDeleteError('');
    try {
      await axios.post('/api/v1/accounts/users/delete-account/', { password: deletePassword });
      // 注销本地登录状态，跳转到登录页
      window.location.href = '/login';
    } catch (error: any) {
      setDeleteError(error.response?.data?.error || '删除失败');
    }
  };

  if (isLoading) return <div>加载中...</div>; // Loading state
  if (isError || !userData) return <div>无法加载学生信息</div>; // Error state

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-100 text-gray-900 dark:text-gray-900 font-sans">
      <Sidebar />
      <main className="flex-1 p-10 overflow-y-auto h-screen bg-white dark:bg-gray-900">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-200">个人档案</h1>
        <div className="max-w-2xl space-y-8">
          {/* Avatar Section */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-white dark:border-gray-700 shadow-md">
                 {(avatarPreview) && <AvatarImage src={avatarPreview} alt="User Avatar" />}
                 <AvatarFallback className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-4xl font-semibold">
                     {userData?.username?.[0]?.toUpperCase() || 'S'} {/* Use fetched username for fallback */}
                 </AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full w-8 h-8 border-2 border-white dark:border-gray-900 cursor-pointer flex items-center justify-center">
                 <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                 <PencilIcon className="w-4 h-4" />
              </label>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-500 dark:text-gray-400">头像</h2>
            </div>
          </div>

          {/* Name (Real Name) */}
          <div>
            <label htmlFor="real_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">姓名</label>
            <Input
              id="real_name"
              type="text"
              value={realName}
              onChange={(e) => setRealName(e.target.value)}
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
              <div className="flex items-center space-x-2">
                <Input
                  id="email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isVerificationSent || isVerifying} // Disable input once verification starts
                />
                {!isVerificationSent ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleInitiateEmailChange}
                    disabled={newEmail === email || !newEmail || isVerifying} // Disable if email hasn't changed, empty, or verifying
                  >
                    {isVerifying ? '发送中...' : '更改'}
                  </Button>
                ) : (
                  <span className="text-sm text-green-600 whitespace-nowrap">验证码已发送</span>
                )}
              </div>
              {/* Verification Code Input and Confirm Button */} 
              {isVerificationSent && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Input
                      id="verificationCode"
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="请输入验证码"
                      className="flex-1 bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isVerifying}
                    />
                    <Button 
                      size="sm" 
                      onClick={handleConfirmEmailChange}
                      disabled={!verificationCode || isVerifying}
                    >
                      {isVerifying ? '验证中...' : '确认更改'}
                    </Button>
                  </div>
                  {/* Add Cancel button? */} 
                </div>
              )}
              {/* Verification Error Message */} 
              {verificationError && (
                <p className="mt-1 text-sm text-red-600">{verificationError}</p>
              )}
           </div>

           {/* Phone Number */}
           <div>
             <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">手机号</label>
             <Input
               id="phone_number"
               type="tel" // Use type tel for phone numbers
               value={phoneNumber}
               onChange={(e) => setPhoneNumber(e.target.value)}
               className="w-full bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500"
               placeholder="请输入手机号（可选）"
             />
           </div>

          {/* Password Section - Kept for UI, but save logic is separate/pending */}
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
            >
                保存更改
            </Button>
          </div>

          {/* Account Actions Section - Kept for UI */}
          <div className="pt-8 mt-8 border-t border-gray-200 dark:border-gray-700 space-y-4">
             <div>
               <button
                 className="text-sm text-red-600 dark:text-red-500 hover:underline font-medium"
                 onClick={() => setShowDeleteModal(true)}
               >
                 删除帐户
               </button>
             </div>
             {/* 删除账户弹窗 */}
             {showDeleteModal && (
               <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                 <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm">
                   <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">确认删除账户</h2>
                   <p className="mb-4 text-gray-600 dark:text-gray-300">此操作不可恢复，请输入密码以确认删除：</p>
                   <Input
                     type="password"
                     placeholder="请输入密码"
                     value={deletePassword}
                     onChange={e => setDeletePassword(e.target.value)}
                     className="mb-3"
                   />
                   {deleteError && <div className="mb-2 text-red-600 text-sm">{deleteError}</div>}
                   <div className="flex justify-end space-x-2">
                     <Button variant="outline" onClick={() => setShowDeleteModal(false)}>取消</Button>
                     <Button
                       className="bg-red-600 hover:bg-red-700 text-white"
                       onClick={handleDeleteAccount}
                       disabled={!deletePassword}
                     >
                       确认删除
                     </Button>
                   </div>
                 </div>
               </div>
             )}
          </div>
        </div>
      </main>
      <SettingsSidebar />
    </div>
  );
};