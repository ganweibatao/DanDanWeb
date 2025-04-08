import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

// 定义侧边栏导航组结构类型
export interface NavGroup {
  title: string;
  items: NavItem[];
}

// 定义导航项类型
export interface NavItem {
  text: string;
  path?: string;
}

// 默认设置导航组
export const defaultAccountNavGroups: NavGroup[] = [
  {
    title: "账户",
    items: [
      { text: "偏好设置", path: "/settings/preferences" },
      { text: "个人资料", path: "/settings/profile" },
      { text: "通知", path: "/settings/notifications" },
      { text: "课程", path: "/settings/course" },
      { text: "学校版Duolinguo", path: "/settings/schools" },
      { text: "社交账号", path: "/settings/social" },
      { text: "隐私设置", path: "/settings/privacy" },
    ],
  },
  {
    title: "订阅",
    items: [{ text: "选择计划", path: "/settings/subscription" }],
  },
  {
    title: "支持",
    items: [
      { text: "帮助中心", path: "/help" },
      { text: "反馈", path: "/feedback" }
    ],
  },
];

interface SettingsSidebarProps {
  navGroups?: NavGroup[];
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ 
  navGroups = defaultAccountNavGroups 
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 检查当前路径是否匹配
  const isCurrentPath = (path?: string) => {
    if (!path) return false;
    return location.pathname === path;
  };

  return (
    <aside className="w-72 bg-gray-50 dark:bg-gray-800 p-6 flex flex-col space-y-6 border-l border-gray-200 dark:border-gray-700 shadow-sm overflow-y-auto h-screen">
      {navGroups.map((group, index) => (
        <Card key={index} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm rounded-lg">
          <CardHeader className="pb-2 pt-4 px-4 border-b border-gray-100 dark:border-gray-600">
            <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-200">{group.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-0 px-4 pb-4">
            {group.items.map((item) => (
              <button
                key={item.text}
                className={`text-left py-2 transition-colors text-sm font-medium ${
                  isCurrentPath(item.path)
                    ? 'text-blue-600 dark:text-blue-400 font-bold' // 高亮当前页面
                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
                onClick={() => item.path && navigate(item.path)}
              >
                {item.text}
              </button>
            ))}
          </CardContent>
        </Card>
      ))}
    </aside>
  );
}; 