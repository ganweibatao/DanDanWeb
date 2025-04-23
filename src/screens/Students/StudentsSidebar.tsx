import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
} from "../../components/ui/dropdown-menu"; // Adjust path based on actual location

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
    { text: "学校", icon: SchoolIcon, path: "/teacher" }, // Example path
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

// Define NavItem type for SidebarContentProps
interface SidebarContentProps {
  sidebarNavItems: NavItem[];
  moreDropdownItems: MoreDropdownItem[];
  effectiveStudentId: string | undefined;
  isActive: (itemPath?: string) => boolean;
  isMoreActive: boolean;
  getIconColor: (name: string, active: boolean) => string;
  navigate: (path: string) => void;
}

const SidebarContent = ({
  sidebarNavItems,
  moreDropdownItems,
  effectiveStudentId,
  isActive,
  isMoreActive,
  getIconColor,
  navigate
}: SidebarContentProps) => {
  if (!Array.isArray(sidebarNavItems) || sidebarNavItems.length === 0) return null;
  return (
    <>
      <div className="mb-6 pl-2">
        <div className="flex flex-col">
          <div className="text-3xl font-bold text-green-500 dark:text-green-400 font-playful-font">DanZai</div>
          <span className="text-xm text-green-700 dark:text-green-300 font-playful-font tracking-wider leading-tight pl-8 mt-3 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full shadow-sm w-fit">
            蛋崽，你的朋友！
          </span>
        </div>
      </div>
      {sidebarNavItems.filter((item) => !item.hidden).map((item: NavItem) => {
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
                  <Icon className={`w-5 h-5 mr-3 transition-transform duration-150 ${getIconColor(item.name, displayActive)} group-hover:scale-110 group-hover:drop-shadow`} />
                  {item.text}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                side="right" 
                align="start" 
                className="w-60 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white p-0 shadow-lg rounded-lg ml-2"
              >
                {moreDropdownItems.map((dropdownItem: any, index: number) => {
                    const DropdownIcon = dropdownItem.icon;
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
                                    let targetPath = dropdownItem.path;
                                    if (dropdownItem.text === "学校") {
                                        // 学校按钮只跳转 /teacher，不拼接 studentId
                                        targetPath = dropdownItem.path;
                                    } else if (effectiveStudentId && dropdownItem.text !== "帮助") {
                                        targetPath = `${dropdownItem.path}/${effectiveStudentId}`;
                                    }
                                    if (!targetPath || targetPath === '/') {
                                        targetPath = effectiveStudentId ? `/students/${effectiveStudentId}` : '/students';
                                    }
                                    navigate(targetPath);
                                }}
                                className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white w-full transition-colors"
                                >
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
          let path = item.path;
          if (effectiveStudentId && item.name !== "Help") {
            if (item.name === "Learn") {
              path = `/students/${effectiveStudentId}`;
            } else if (item.name !== "More") {
              path = `${item.path}/${effectiveStudentId}`;
            }
          }
          if (!path || path === '/') {
            path = effectiveStudentId ? `/students/${effectiveStudentId}` : '/students';
          }
          return (
            <button
              key={item.text}
              className={`group flex items-center w-full px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${ 
                active
                  ? "text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-gray-700" 
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
              onClick={() => {
                if(path) {
                  if (item.name === 'Pronunciation') {
                    alert('敬请期待！');
                  } else {
                    navigate(path);
                  }
                }
              }}
            >
              <Icon className={`w-5 h-5 mr-3 transition-transform duration-150 ${getIconColor(item.name, active)} group-hover:scale-110 group-hover:drop-shadow`} />
              {item.text}
            </button>
          );
        }
      })}
    </>
  );
};

// Update component to accept props
export const Sidebar: React.FC<SidebarProps> = ({ studentId }) => {
  const navigate = useNavigate();
  const location = useLocation(); // Get current location
  // 新增：用于 Drawer 控制
  const [drawerOpen, setDrawerOpen] = useState(false);
  
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

  // 新增：小屏汉堡按钮
  const HamburgerButton = (
    <button
      className="md:hidden fixed top-4 left-4 z-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-2 shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400"
      onClick={() => setDrawerOpen(true)}
      aria-label="打开菜单"
      type="button"
    >
      <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );

  // 兜底：sidebarNavItems 类型和内容检查
  if (!Array.isArray(sidebarNavItems) || sidebarNavItems.length === 0) return null;

  // --- 渲染 ---
  return (
    <>
      {/* 小屏汉堡按钮 */}
      {HamburgerButton}
      {/* Drawer 抽屉 */}
      {drawerOpen && (
        <div className={`fixed inset-0 z-50 flex md:hidden`}>
          {/* 遮罩层 */}
          <div
            className="fixed inset-0 bg-black bg-opacity-40 transition-opacity duration-300"
            onClick={() => setDrawerOpen(false)}
            aria-label="关闭菜单"
          />
          {/* 侧边栏本体 */}
          <aside
            className={`relative w-64 max-w-[80vw] h-full bg-white dark:bg-gray-800 p-4 flex flex-col space-y-1 border-r border-gray-200 dark:border-gray-700 shadow-lg transform transition-transform duration-300 ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
          >
            {/* 关闭按钮 */}
            <button
              className="absolute top-3 right-3 p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
              onClick={() => setDrawerOpen(false)}
              aria-label="关闭菜单"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="mt-8">
              <SidebarContent
                sidebarNavItems={sidebarNavItems}
                moreDropdownItems={moreDropdownItems}
                effectiveStudentId={effectiveStudentId}
                isActive={isActive}
                isMoreActive={isMoreActive}
                getIconColor={getIconColor}
                navigate={navigate}
              />
            </div>
          </aside>
        </div>
      )}
      {/* PC端侧边栏 */}
      <aside className="w-60 bg-white dark:bg-gray-800 p-4 flex flex-col space-y-1 border-r border-gray-200 dark:border-gray-700 shadow-sm flex-shrink-0 hidden md:flex">
        <SidebarContent
          sidebarNavItems={sidebarNavItems}
          moreDropdownItems={moreDropdownItems}
          effectiveStudentId={effectiveStudentId}
          isActive={isActive}
          isMoreActive={isMoreActive}
          getIconColor={getIconColor}
          navigate={navigate}
        />
      </aside>
    </>
  );
}; 