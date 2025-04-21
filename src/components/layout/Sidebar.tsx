import React, { useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeIcon, 
  UsersIcon, 
  StarIcon, 
  ZapIcon, 
  ShoppingCartIcon, 
  UserCircleIcon, 
  MoreHorizontalIcon,
  SchoolIcon,      // For MORE dropdown
  SettingsIcon,    // For MORE dropdown
  HelpCircleIcon,  // For MORE dropdown
  LogOutIcon,      // For MORE dropdown
  LucideProps,     // Import LucideProps for type safety
  Volume2Icon      // <-- Added Volume2Icon for 发音
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"; // Adjust path based on actual location
import { defaultAccountNavGroups } from "./SettingsRightSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { SidebarFooterLinks } from "./SidebarFooterLinks";

// Define prop types for Sidebar
interface SidebarProps {
  studentId?: string; // Make studentId optional
}

// Add explicit type for icon property
interface NavItem {
    text: string;
    name: string;
    icon: React.ComponentType<LucideProps>; // Use ComponentType
    path?: string;
    hidden?: boolean;
}

interface MoreDropdownItem {
    text: string;
    icon: React.ComponentType<LucideProps>; // Use ComponentType
    path: string;
}

// Define navigation items with explicit types
const sidebarNavItems: NavItem[] = [
  { text: "学习", name: "Learn", icon: HomeIcon, path: "/students" },
  { text: "发音", name: "Pronunciation", icon: Volume2Icon, path: "/pronunciation" },
  { text: "排行榜", name: "Leaderboards", icon: StarIcon, path: "/leaderboards" },
  { text: "学习情况", name: "Quests", icon: ZapIcon, path: "/quests" },
  { text: "个人资料", name: "Profile", icon: UserCircleIcon, path: "/profile" },
  { text: "设置", name: "Settings", icon: SettingsIcon, path: "/settings/preferences" }, // 作为一级菜单
  { text: "更多", name: "More", icon: MoreHorizontalIcon }, // No path for MORE trigger
];

// Define MORE dropdown items with explicit types
const moreDropdownItems: MoreDropdownItem[] = [
    { text: "学校", icon: SchoolIcon, path: "/schools" }, // Example path
    { text: "帮助", icon: HelpCircleIcon, path: "/help" }, // Example path
    { text: "退出登录", icon: LogOutIcon, path: "/logout" }, // Example path
];

// 静态颜色class映射，避免Tailwind丢失
const iconColorClassMap: Record<string, { active: string; inactive: string }> = {
  Learn: { active: 'text-green-500 dark:text-green-400', inactive: 'text-green-400 dark:text-green-300' },
  Quests: { active: 'text-purple-500 dark:text-purple-400', inactive: 'text-purple-400 dark:text-purple-300' },
  Profile: { active: 'text-pink-500 dark:text-pink-400', inactive: 'text-pink-400 dark:text-pink-300' },
  Settings: { active: 'text-blue-500 dark:text-blue-400', inactive: 'text-blue-400 dark:text-blue-300' },
  More: { active: 'text-gray-500 dark:text-gray-400', inactive: 'text-gray-400 dark:text-gray-500' },
};

function getIconColor(name: string, active: boolean) {
  if (name === 'Leaderboards' || name === 'Pronunciation') {
    return active ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500';
  }
  return iconColorClassMap[name]
    ? (active ? iconColorClassMap[name].active : iconColorClassMap[name].inactive)
    : (active ? 'text-green-500 dark:text-green-400' : 'text-green-400 dark:text-green-300');
}

// Update component to accept props
export const Sidebar: React.FC<SidebarProps> = ({ studentId }) => {
  const navigate = useNavigate();
  const location = useLocation(); // Get current location
  
  // 使用 useCallback 包装函数避免重复创建
  const getEffectiveStudentId = useCallback((): string | undefined => {
    // 1. 首先使用props传入的studentId
    if (studentId) {
      // 不要在这里打印，移到 useEffect 中
      return studentId;
    }
    
    // 2. 尝试从URL中提取，查找 /students/数字 这种格式
    const studentIdMatch = location.pathname.match(/\/students\/(\d+)/);
    if (studentIdMatch && studentIdMatch[1]) {
      const idFromUrl = studentIdMatch[1];
      return idFromUrl;
    }
    
    // 3. 最后从localStorage获取
    const savedId = localStorage.getItem('lastStudentId');
    return savedId || undefined;
  }, [studentId, location.pathname]);
  
  // 使用 useMemo 缓存计算结果
  const effectiveStudentId = useMemo(() => {
    return getEffectiveStudentId();
  }, [getEffectiveStudentId]);

  // 使用 useEffect 处理副作用（仅在 studentId 改变时）
  useEffect(() => {
    if (studentId) {
      localStorage.setItem('lastStudentId', studentId);
    }
  }, [studentId]);

  // 使用 useEffect 处理 URL 或 localStorage 中的 studentId（仅在相关依赖改变时）
  useEffect(() => {
    if (!studentId && effectiveStudentId) {
      if (location.pathname.match(/\/students\/(\d+)/)) {
      }
      
      if (effectiveStudentId) {
        localStorage.setItem('lastStudentId', effectiveStudentId);
      }
    }
    
  }, [studentId, effectiveStudentId, location.pathname]);

  // Function to check if an item should be active
  const isActive = useCallback((itemPath?: string) => {
    if (!itemPath) return false;
    // Special handling for students path to be active for /students/:id
    if (itemPath === '/students' && location.pathname.startsWith('/students/')) {
      return true;
    }
    // Use exact match for other paths
    return location.pathname === itemPath;
  }, [location.pathname]);

  // Determine if the MORE button itself should appear active because a sub-route is active
  const isMoreActive = useMemo(() => {
    return moreDropdownItems.some(item => isActive(item.path));
  }, [isActive]);

  return (
    <aside className="w-60 bg-white dark:bg-gray-800 p-4 flex flex-col space-y-1 border-r border-gray-200 dark:border-gray-700 shadow-sm flex-shrink-0">
      <div className="mb-6 pl-2">
        <div className="flex flex-col">
          <div className="text-3xl font-bold text-green-500 dark:text-green-400 font-playful-font">DanZai</div>
          <span className="flex items-center text-xs font-semibold italic text-green-700 dark:text-green-300 mt-3 tracking-wide bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full shadow-sm w-fit">
            "蛋崽，你的朋友！"
          </span>
        </div>
      </div>
      {sidebarNavItems.filter(item => !item.hidden).map((item) => { // Filter out hidden items
        const active = item.path ? isActive(item.path) : false;
        const displayActive = item.name === 'More' ? isMoreActive : active;
        const Icon = item.icon;

        if (item.name === "More") {
          return (
            <DropdownMenu key={item.text}>
              <DropdownMenuTrigger asChild>
                <button
                  className={`group flex items-center w-full px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${ 
                    displayActive
                      ? "text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-gray-700" 
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
                >
                  {/* 图标加颜色和动画 */}
                  <Icon className={`w-5 h-5 mr-3 transition-transform duration-150 ${getIconColor(item.name, displayActive)} group-hover:scale-110 group-hover:drop-shadow`} />
                  {item.text}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                side="right" 
                align="start" 
                className="w-60 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white p-0 shadow-lg rounded-lg ml-2"
              >
                {moreDropdownItems.map((dropdownItem, index) => {
                    const DropdownIcon = dropdownItem.icon;
                    // 下拉菜单图标颜色映射
                    const dropdownColorMap: Record<string, string> = {
                      学校: 'text-green-500 dark:text-green-400',
                      帮助: 'text-blue-400 dark:text-blue-300',
                      退出登录: 'text-gray-400 dark:text-gray-300',
                    };
                    return (
                        <React.Fragment key={dropdownItem.text}>
                            {index > 0 && <div className="border-t border-gray-200 dark:border-gray-600"></div>}
                            <DropdownMenuItem asChild className={`${index === 0 ? 'rounded-t-lg' : ''} ${index === moreDropdownItems.length - 1 ? 'rounded-b-lg' : ''} focus:bg-gray-100 dark:focus:bg-gray-600 focus:text-gray-900 dark:focus:text-white px-0`}>
                                <a 
                                href={dropdownItem.path} 
                                onClick={(e) => {
                                    e.preventDefault();
                                    // 根据是否为"帮助"项和是否有学生ID决定路径
                                    let targetPath = dropdownItem.path;
                                    if (effectiveStudentId && dropdownItem.text !== "帮助") {
                                        targetPath = `${dropdownItem.path}/${effectiveStudentId}`;
                                    }
                                    
                                    // 确保路径有效
                                    if (!targetPath || targetPath === '/') {
                                        console.warn(`警告: 无效的下拉菜单项路径 "${targetPath}"，更改为默认路径`);
                                        targetPath = effectiveStudentId ? `/students/${effectiveStudentId}` : '/students';
                                    }
                                    
                                    console.log(`下拉菜单项最终导航到: ${targetPath}`);
                                    navigate(targetPath);
                                }}
                                className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white w-full transition-colors"
                                >
                                    {/* 下拉菜单图标加颜色和动画 */}
                                    <DropdownIcon className={`w-5 h-5 mr-3 transition-transform duration-150 ${dropdownColorMap[dropdownItem.text] || 'text-gray-400'} group-hover:scale-110 group-hover:drop-shadow`} />
                                    <span className="font-semibold">{dropdownItem.text}</span>
                                </a>
                            </DropdownMenuItem>
                        </React.Fragment>
                    );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        } else {
          // 普通菜单项
          const targetPath = useMemo(() => {
            let path = item.path;
            if (effectiveStudentId && item.name !== "Help") {
              if (item.name === "Learn") {
                path = `/students/${effectiveStudentId}`;
              } else if (item.name !== "More") {
                path = `${item.path}/${effectiveStudentId}`;
              }
            }
            if (!path || path === '/') {
              console.warn(`警告: 无效的目标路径 "${path}"，更改为默认路径`);
              return effectiveStudentId ? `/students/${effectiveStudentId}` : '/students';
            }
            return path;
          }, [item.path, item.name, effectiveStudentId]);

          return (
            <button
              key={item.text}
              className={`group flex items-center w-full px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${ 
                active
                  ? "text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-gray-700" 
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
              onClick={() => {
                if(targetPath) {
                  if (item.name === 'Pronunciation') {
                    alert('敬请期待！');
                  } else {
                    navigate(targetPath);
                  }
                }
              }}
            >
              {/* 图标加颜色和动画 */}
              <Icon className={`w-5 h-5 mr-3 transition-transform duration-150 ${getIconColor(item.name, active)} group-hover:scale-110 group-hover:drop-shadow`} />
              {item.text}
            </button>
          );
        }
      })}
    </aside>
  );
}; 