import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'; // Assuming Select is available
import { useNavigate } from 'react-router-dom';
// import { useTheme } from '../../context/ThemeContext'; // Removed: Use useSettings instead
import { useSettings } from '../../context/SettingsContext'; // Import useSettings
import { Sidebar } from '../Students/StudentsSidebar'; // Import Sidebar
import { SettingsSidebar } from '../../components/layout/SettingsRightSidebar'; // 导入设置侧边栏
import { Switch } from '../../components/ui/switch'; // 导入 Switch 组件

// Placeholder icons (assuming these exist or using Lucide if preferred)
import {
  HomeIcon, 
  UsersIcon, 
  StarIcon, 
  ZapIcon, 
  ShoppingCartIcon, 
  UserCircleIcon, 
  MoreHorizontalIcon
} from 'lucide-react';

// Placeholder Styled Checkbox Toggle - REMOVED
/*
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
      <span className="ml-3 text-gray-700 dark:text-gray-300">{label}</span>
    </label>
  );
};
*/

export const SettingsPage = (): JSX.Element | null => {
  const navigate = useNavigate();
  // Use the useSettings hook
  const { settings, updateSetting, setTheme } = useSettings();
  const { isSoundEnabled, animationsEnabled, theme } = settings;

  // Restore local state for toggles - REMOVED
  // const [soundEffects, setSoundEffects] = useState(true);
  // const [animations, setAnimations] = useState(true);
  // const [motivationalMessages, setMotivationalMessages] = useState(true); // Note: These were not used in the UI
  // const [listeningExercises, setListeningExercises] = useState(true); // Note: These were not used in the UI

  // Map context theme ('light', 'dark', 'system') to dropdown value ('关闭', '开启', '自动')
  const dropdownValue = theme === 'dark' ? '开启' : theme === 'light' ? '关闭' : '自动';

  // Handle dropdown change and update context theme using setTheme from useSettings
  const handleThemeChange = (value: string) => {
    if (value === '开启') {
      setTheme('dark');
    } else if (value === '关闭') {
      setTheme('light');
    } else {
      setTheme('system');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-100 text-gray-900 dark:text-gray-900 font-sans">
      <Sidebar /> {/* Use the shared Sidebar component */}

      {/* Main Content Area adapts via dark: prefixes */}
      <main className="flex-1 p-10 overflow-y-auto bg-white dark:bg-gray-900">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-200">偏好设置</h1>

        {/* Sections adapt via dark: prefixes */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">课程体验</h2>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300 font-medium">音效</span>
              {/* Use settings from context and updateSetting */}
              <Switch 
                id="soundEffects" 
                checked={isSoundEnabled} 
                onCheckedChange={(checked) => updateSetting('isSoundEnabled', checked)} 
              />
            </div>
             <div className="flex justify-between items-center">
               <span className="text-gray-700 dark:text-gray-300 font-medium">动画</span>
               {/* Use settings from context and updateSetting */}
               <Switch 
                 id="animations" 
                 checked={animationsEnabled} 
                 onCheckedChange={(checked) => updateSetting('animationsEnabled', checked)} 
               />
             </div>
            {/* Removed unused toggles for Motivational Messages and Listening Exercises */}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">外观</h2>
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-gray-300 font-medium">暗黑模式</span>
            {/* Use dropdownValue derived from context theme, and handleThemeChange which uses setTheme from context */}
            <Select value={dropdownValue} onValueChange={handleThemeChange}>
              <SelectTrigger className="w-[180px] bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50">
                <SelectValue placeholder="选择模式" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg text-gray-700 dark:text-gray-300">
                <SelectItem value="开启">开启</SelectItem>
                <SelectItem value="关闭">关闭</SelectItem>
                <SelectItem value="自动">自动</SelectItem> 
              </SelectContent>
            </Select>
          </div>
        </section>

         <section>
           <h2 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">语言</h2>
           <p className="text-gray-600 dark:text-gray-400">语言设置区域 (待实现)</p>
         </section>

      </main>

      {/* 使用共享的设置侧边栏组件 */}
      <SettingsSidebar />
    </div>
  );
}; 