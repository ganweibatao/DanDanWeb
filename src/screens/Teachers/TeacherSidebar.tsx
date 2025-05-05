import React from 'react';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
    ListIcon, // Changed from HomeIcon if needed
    LightbulbIcon,
    UsersIcon,
    LockIcon,
    LayoutGridIcon,
    MessageSquareIcon
} from 'lucide-react'; // Import necessary icons

// --- Define types and items ---
export type TeacherSidebarItem = {
  text: string;
  icon: React.ElementType;
  viewId: string;
};

// Define the specific sidebar items directly here
const teacherSidebarItems: TeacherSidebarItem[] = [
  { text: "学生", icon: ListIcon, viewId: 'students' },
  { text: "教师培训", icon: LightbulbIcon, viewId: 'training' },
  { text: "教师论坛", icon: UsersIcon, viewId: 'forum' },
  { text: "隐私设置", icon: LockIcon, viewId: 'privacy' },
  { text: "商店", icon: LayoutGridIcon, viewId: 'DanZai' },
  { text: "反馈", icon: MessageSquareIcon, viewId: 'feedback' },
];

// Removed TeacherViewId definition

interface TeacherSidebarProps {
  activeView: string;
  setActiveView: (viewId: string) => void;
  user: { username: string; avatarFallback: string };
  // Removed sidebarItems prop
}

export const TeacherSidebar: React.FC<TeacherSidebarProps> = ({
  activeView,
  setActiveView,
  user,
  // Removed sidebarItems from destructuring
}) => {
  const navigate = useNavigate();
  return (
    <aside className="w-60 bg-white dark:bg-gray-800 p-4 flex flex-col space-y-1 border-r border-gray-200 dark:border-gray-700 shadow-sm flex-shrink-0">
      {/* Header */}
      <div className="mb-6 pl-2">
        <div className="text-xl font-semibold text-blue-600 dark:text-blue-400 font-playful-font">DanZai</div>
      </div>
      {/* Navigation Items */}
      <nav className="flex-grow space-y-1">
        {/* Use internal teacherSidebarItems */}
        {teacherSidebarItems.map((item: TeacherSidebarItem) => {
          const Icon = item.icon;
          // Adopted active logic from SchoolSidebar for flexibility
          const isActive = (item.viewId === 'students' && ['students', 'reports', 'settings'].includes(activeView)) ||
            (item.viewId !== 'students' && activeView === item.viewId);
          return (
            <button
              key={item.text}
              className={`flex items-center w-full px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                isActive
                  ? "text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-gray-700"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
              onClick={() => {
                // Adopted onClick logic from SchoolSidebar
                const targetView = item.viewId === 'students' ? 'students' : item.viewId;
                setActiveView(targetView);
              }}
            >
              <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`} />
              {item.text}
            </button>
          );
        })}
      </nav>
      {/* User Profile Footer */}
      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center space-x-3 px-2">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-green-500 dark:bg-green-600 text-white font-semibold">{user.avatarFallback}</AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{user.username}</div>
            <Button
              variant="link"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline p-0 h-auto"
              onClick={() => navigate('/teacher/settings')}
            >
              编辑
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}; 