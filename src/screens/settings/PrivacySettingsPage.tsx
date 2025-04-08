import React, { useState } from 'react';
import { SettingsSidebar } from '../../components/layout/SettingsRightSidebar';
import { Sidebar } from '../../components/layout/Sidebar';
import { Button } from '../../components/ui/button';

// Reusing the ToggleSwitch component structure from SettingsPage
const ToggleSwitch = ({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (checked: boolean) => void }) => {
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
      {/* Label is not used directly next to switch in the image, so we'll handle labels outside */}
      {/* <span className="ml-3 text-gray-700 dark:text-gray-300">{label}</span> */}
    </label>
  );
};

export const PrivacySettingsPage = (): JSX.Element => {
  // State for the toggles
  const [profilePublic, setProfilePublic] = useState(true);
  const [personalizedAds, setPersonalizedAds] = useState(true);

  // Placeholder function for saving changes
  const handleSaveChanges = () => {
    console.log('Saving privacy settings:', { profilePublic, personalizedAds });
    // Add actual save logic here (e.g., API call)
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-100 text-gray-900 dark:text-gray-900 font-sans">
       <Sidebar /> {/* Use the shared Sidebar component */}

      {/* Main Content Area */}
      <main className="flex-1 p-10 overflow-y-auto bg-white dark:bg-gray-900">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-200">隐私设置</h1>

        {/* Settings Sections */}
        <section className="mb-10 space-y-6">
          {/* 公开我的个人档案 */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">公开我的个人档案</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                其他人可以看到你的个人档案并关注你，你也可以查看并关注其他人，还可以参加公共排行榜上的排名。
              </p>
            </div>
            <ToggleSwitch id="profilePublic" label="" checked={profilePublic} onChange={setProfilePublic} />
          </div>

          {/* 个性化广告 */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">个性化广告</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                广告跟踪及个性化
              </p>
            </div>
            <ToggleSwitch id="personalizedAds" label="" checked={personalizedAds} onChange={setPersonalizedAds} />
          </div>
        </section>

        {/* 保存更改 Button */}
        <section>
          <Button 
            onClick={handleSaveChanges}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200 font-semibold py-2 px-4 rounded-md"
          >
            保存更改
          </Button>
        </section>
      </main>

      {/* Settings Sidebar */}
      <SettingsSidebar />
    </div>
  );
}; 