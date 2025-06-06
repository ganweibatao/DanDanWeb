import React, { useState, useEffect } from 'react';
import { SettingsSidebar } from '../../components/layout/SettingsRightSidebar';
import { Sidebar } from '../Students/StudentsSidebar';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../hooks/useAuth';
import { apiClient } from '../../services/api';
import { toast } from 'sonner';

// Reusing the ToggleSwitch component structure from SettingsPage
const ToggleSwitch = ({ id, checked, onChange }: { id: string; label?: string; checked: boolean; onChange: (checked: boolean) => void }) => {
  return (
    <label htmlFor={id} className="flex items-center cursor-pointer">
      <div className="relative">
        <input 
          id={id} 
          type="checkbox" 
          className="sr-only peer" 
          checked={checked} 
          onChange={(e) => onChange(e.target.checked)} 
        />
        <div className="w-12 h-6 bg-gray-200 dark:bg-gray-600 rounded-full shadow-inner peer-checked:bg-blue-400 dark:peer-checked:bg-blue-500 transition-colors"></div>
        <div className="absolute left-0 top-0 w-6 h-6 bg-white dark:bg-gray-300 rounded-full border border-gray-300 dark:border-gray-500 shadow transition-transform peer-checked:translate-x-full peer-checked:border-blue-400 dark:peer-checked:border-blue-500"></div>
      </div>
    </label>
  );
};

interface PrivacySettingsPayload {
  is_profile_public?: boolean;
  allow_personalized_ads?: boolean;
  // Add other privacy settings fields as needed by your API
}

export const PrivacySettingsPage = (): JSX.Element => {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  
  // State for the toggles - initialize with fetched or default values if possible
  const [profilePublic, setProfilePublic] = useState(true); // Placeholder, should be fetched
  const [personalizedAds, setPersonalizedAds] = useState(true); // Placeholder, should be fetched
  const [isSaving, setIsSaving] = useState(false);


  const handleSaveChanges = async () => {
    if (!isAuthenticated || !user?.id) {
      toast.error('用户未登录，无法保存设置。');
      return;
    }

    setIsSaving(true);
    const payload: PrivacySettingsPayload = {
      is_profile_public: profilePublic, // Assuming your API uses snake_case
      allow_personalized_ads: personalizedAds, // Assuming your API uses snake_case
    };

    try {
      // Replace with your actual API endpoint and student/user ID logic
      // Assuming user.id is the student_id or relevant user identifier for the API
      await apiClient.put(`/api/students/${user.id}/privacy-settings/`, payload);
      toast.success('隐私设置已保存！');
    } catch (error: any) {
      console.error('Error saving privacy settings:', error);
      const errorMsg = error.response?.data?.detail || error.message || '保存失败，请稍后再试。';
      toast.error(`保存失败: ${errorMsg}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return <div className="flex justify-center items-center h-screen">加载中...</div>;
  }
  if (!isAuthenticated) {
    // Or redirect to login
    return <div className="flex justify-center items-center h-screen">请先登录以访问设置。</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-100 text-gray-900 dark:text-gray-900 font-sans">
       <Sidebar /> {/* Use the shared Sidebar component */}

      {/* Main Content Area */}
      <main className="flex-1 p-10 overflow-y-auto bg-white dark:bg-gray-900">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-200">隐私设置</h1>

        {/* Settings Sections */}
        <section className="mb-10 space-y-6">
          {/* 个性化广告 */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">个性化广告</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                允许我们根据您的兴趣为您提供更相关的广告。
              </p>
            </div>
            <ToggleSwitch id="personalizedAds" checked={personalizedAds} onChange={setPersonalizedAds} />
          </div>
        </section>

        {/* 保存更改 Button */}
        <section>
          <Button 
            onClick={handleSaveChanges}
            disabled={isSaving} // Disable button when saving
            className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700 font-semibold py-2 px-6 rounded-md transition-colors disabled:opacity-70"
          >
            {isSaving ? '保存中...' : '保存更改'}
          </Button>
        </section>
      </main>

      {/* Settings Sidebar */}
      <SettingsSidebar />
    </div>
  );
}; 