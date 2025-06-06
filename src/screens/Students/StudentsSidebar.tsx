import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  SchoolIcon, 
  UsersIcon, 
  BarChartIcon, 
  BookIcon, 
  ShoppingCartIcon, 
  MoreHorizontalIcon,
  SettingsIcon,
  HelpCircleIcon,
  LogOutIcon,
  LucideProps,
  MessageSquareIcon
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"; // Adjust path based on actual location
import { authService } from '../../services/auth';

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
  { text: "开始教学", name: "Learn", icon: SchoolIcon, path: "/students" },
  { text: "词库选择", name: "Quests", icon: BookIcon, path: "/quests" },
  { text: "学习数据", name: "Profile", icon: BarChartIcon, path: "/profile" },
  { text: "学生信息", name: "Teacher", icon: UsersIcon, path: "/teacher" },
  { text: "设置", name: "Settings", icon: SettingsIcon, path: "/settings/preferences" },
  { text: "更多", name: "More", icon: MoreHorizontalIcon }, // No path for MORE trigger
];

// Define MORE dropdown items with explicit types
const moreDropdownItems: MoreDropdownItem[] = [
    { text: "商店", icon: ShoppingCartIcon, path: "/danzai-store" },
    { text: "反馈", icon: MessageSquareIcon, path: "/feedback" },
    { text: "帮助", icon: HelpCircleIcon, path: "/help" },
    { text: "退出登录", icon: LogOutIcon, path: "/logout" },
];

// 多邻国风格颜色映射
const iconColorClassMap: Record<string, { active: string; inactive: string }> = {
  Learn: { active: 'text-duo-green', inactive: 'text-duo-grayDark' },
  Quests: { active: 'text-duo-blue', inactive: 'text-duo-grayDark' },
  Profile: { active: 'text-duo-orange', inactive: 'text-duo-grayDark' },
  Settings: { active: 'text-duo-blue', inactive: 'text-duo-grayDark' },
  More: { active: 'text-duo-grayDark', inactive: 'text-duo-grayMedium' },
};

function getIconColor(name: string, active: boolean) {
  if (name === 'Leaderboards' || name === 'Pronunciation') {
    return active ? 'text-duo-grayDark' : 'text-duo-grayMedium';
  }
  return iconColorClassMap[name]
    ? (active ? iconColorClassMap[name].active : iconColorClassMap[name].inactive)
    : (active ? 'text-duo-green' : 'text-duo-grayDark');
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
  handleMenuClick: (path: string) => void;
}

const SidebarContent = ({
  sidebarNavItems,
  moreDropdownItems,
  effectiveStudentId,
  isActive,
  isMoreActive,
  navigate,
  handleMenuClick
}: SidebarContentProps) => {
  if (!Array.isArray(sidebarNavItems) || sidebarNavItems.length === 0) return null;
  return (
    <>
      <div className="mb-6 pl-2">
        <div className="flex flex-col">
          <div className="text-3xl font-bold text-duo-green font-playful-font">DanZai</div>
          {/* <span className="text-xm text-green-700 dark:text-green-300 font-playful-font tracking-wider leading-tight pl-8 mt-3 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full shadow-sm w-fit">
            蛋崽，你的朋友！
          </span> */}
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
                      ? "text-duo-white bg-duo-blue" 
                      : "text-duo-textPrimary hover:bg-duo-grayLight hover:text-duo-textPrimary"
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 transition-transform duration-150 ${displayActive ? 'text-duo-white' : 'text-duo-grayMedium'} group-hover:scale-110 group-hover:drop-shadow`} />
                  {item.text}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                side="right" 
                align="start" 
                className="w-60 bg-duo-white border border-duo-grayLight text-duo-textPrimary p-0 shadow-lg rounded-lg ml-2"
              >
                {moreDropdownItems.map((dropdownItem: any, index: number) => {
                    const DropdownIcon = dropdownItem.icon;
                    const dropdownColorMap: Record<string, string> = {
                      商店: 'text-duo-green',
                      帮助: 'text-duo-blue',
                      退出登录: 'text-duo-grayDark',
                      反馈: 'text-duo-orange',
                    };
                    return (
                        <React.Fragment key={dropdownItem.text}>
                            {index > 0 && <div className="border-t border-duo-grayLight"></div>}
                            <DropdownMenuItem asChild className={`${index === 0 ? 'rounded-t-lg' : ''} ${index === moreDropdownItems.length - 1 ? 'rounded-b-lg' : ''} focus:bg-duo-grayLight focus:text-duo-textPrimary px-0`}>
                                <a
                                  href={dropdownItem.path}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    if (dropdownItem.text === "退出登录") {
                                      handleMenuClick('/logout');
                                    } else {
                                      let targetPath = dropdownItem.path;
                                      if (["商店", "帮助", "反馈"].includes(dropdownItem.text)) {
                                        targetPath = dropdownItem.path;
                                      } else if (effectiveStudentId && dropdownItem.text !== "帮助") {
                                        targetPath = `${dropdownItem.path}/${effectiveStudentId}`;
                                      }
                                      if (!targetPath || targetPath === '/') {
                                        targetPath = effectiveStudentId ? `/students/${effectiveStudentId}` : '/students';
                                      }
                                      navigate(targetPath);
                                    }
                                  }}
                                  className="flex items-center px-4 py-3 text-duo-textPrimary hover:bg-duo-grayLight hover:text-duo-textPrimary w-full transition-colors"
                                >
                                                                          <DropdownIcon className={`w-5 h-5 mr-3 transition-transform duration-150 ${dropdownColorMap[dropdownItem.text] || 'text-duo-grayMedium'} group-hover:scale-110 group-hover:drop-shadow`} />
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
          if (effectiveStudentId && item.name !== "Help" && item.name !== "Teacher" && item.name !== "Feedback") {
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
                  ? "bg-duo-green text-white"
                  : "text-duo-textPrimary hover:bg-duo-grayLight hover:text-duo-textPrimary"
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
              <Icon className={`w-5 h-5 mr-3 transition-transform duration-150 ${active ? 'text-white' : 'text-duo-green group-hover:text-duo-green'} group-hover:scale-110 group-hover:drop-shadow`} />
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
    // Check for exact match or if the current path starts with the item's path followed by a '/' or end of string
    // This handles cases like /profile and /profile/settings correctly
    const currentPath = location.pathname;
    if (itemPath === "/students" && effectiveStudentId) {
        // Special handling for Learn /students/:studentId
        return currentPath === `/students/${effectiveStudentId}` || currentPath.startsWith(`/students/${effectiveStudentId}/`);
    }
    return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
  }, [location.pathname, effectiveStudentId]);

  // Determine if the MORE button itself should appear active because a sub-route is active
  const isMoreActive = useMemo(() => {
    return moreDropdownItems.some(item => isActive(item.path));
  }, [moreDropdownItems, isActive]);

  const handleMenuClick = (path: string) => {
    if (path === '/logout') {
      authService.logout().finally(() => {
        navigate('/');
      });
    } else {
      navigate(path);
    }
  };

  // --- 渲染 ---
  return (
    <>
      {/* Hamburger Button for Mobile - always rendered, visibility controlled by md:hidden on自身 */}
      <button
        className="md:hidden fixed top-4 left-4 z-40 bg-duo-white border border-duo-grayLight rounded-full p-2 shadow-lg focus:outline-none focus:ring-2 focus:ring-duo-blue"
        onClick={() => setDrawerOpen(true)}
        aria-label="打开菜单"
        type="button"
      >
        <svg className="w-7 h-7 text-duo-green" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Drawer - Conditionally rendered, uses fixed positioning */}
      {drawerOpen && (
        <div className={`fixed inset-0 z-50 flex md:hidden`}>
          <div
            className="fixed inset-0 bg-black bg-opacity-40 transition-opacity duration-300"
            onClick={() => setDrawerOpen(false)}
            aria-label="关闭菜单"
          />
          <aside
            className={`relative w-64 max-w-[80vw] h-full bg-duo-white p-4 flex flex-col border-r border-duo-grayLight shadow-lg transform transition-transform duration-300 ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
          >
            <button
              className="absolute top-3 right-3 p-2 rounded-full text-duo-grayMedium hover:bg-duo-grayLight focus:outline-none focus:ring-2 focus:ring-duo-blue"
              onClick={() => setDrawerOpen(false)}
              aria-label="关闭菜单"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="mt-8 space-y-3">
              <SidebarContent
                sidebarNavItems={sidebarNavItems}
                moreDropdownItems={moreDropdownItems}
                effectiveStudentId={effectiveStudentId}
                isActive={isActive}
                isMoreActive={isMoreActive}
                getIconColor={getIconColor}
                navigate={navigate}
                handleMenuClick={handleMenuClick}
              />
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar Content - 只在md及以上显示，移动端完全不占位 */}
      <div className="hidden md:w-64 md:flex flex-col bg-gray-50 dark:bg-gray-800 p-5 border-r border-gray-200 dark:border-gray-700 h-screen sticky top-0 overflow-y-auto">
        <div className="flex flex-col flex-grow space-y-3">
          <SidebarContent
              sidebarNavItems={sidebarNavItems}
              moreDropdownItems={moreDropdownItems}
              effectiveStudentId={effectiveStudentId}
              isActive={isActive}
              isMoreActive={isMoreActive}
              getIconColor={getIconColor}
              navigate={navigate}
              handleMenuClick={handleMenuClick}
          />
        </div>
      </div>
    </>
  );
}; 