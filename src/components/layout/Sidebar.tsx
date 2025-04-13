import React from 'react';
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
  { text: "更多", name: "More", icon: MoreHorizontalIcon }, // No path for MORE trigger
  // Add Settings route definition for highlighting logic if needed
  { text: "", name: "Settings", icon: SettingsIcon, path: "/settings", hidden: true }, // 设置项，用于路径匹配
];

// Define MORE dropdown items with explicit types
const moreDropdownItems: MoreDropdownItem[] = [
    { text: "学校", icon: SchoolIcon, path: "/schools" }, // Example path
    { text: "设置", icon: SettingsIcon, path: "/settings/preferences" },
    { text: "帮助", icon: HelpCircleIcon, path: "/help" }, // Example path
    { text: "退出登录", icon: LogOutIcon, path: "/logout" }, // Example path
];

// Update component to accept props
export const Sidebar: React.FC<SidebarProps> = ({ studentId }) => {
  const navigate = useNavigate();
  const location = useLocation(); // Get current location

  // Function to check if an item should be active
  const isActive = (itemPath?: string) => {
    if (!itemPath) return false;
    // Special handling for students path to be active for /students/:id
    if (itemPath === '/students' && location.pathname.startsWith('/students/')) {
      return true;
    }
    // Use exact match for other paths
    return location.pathname === itemPath;
  };

  // Determine if the MORE button itself should appear active because a sub-route is active
  const isMoreActive = moreDropdownItems.some(item => isActive(item.path));
  // Or, if we want to highlight MORE when Settings is active:
  // const isMoreActive = isActive('/settings'); 

  return (
    <aside className="w-60 bg-white dark:bg-gray-800 p-4 flex flex-col space-y-1 border-r border-gray-200 dark:border-gray-700 shadow-sm flex-shrink-0">
      <div className="mb-6 pl-2">
        <div className="text-2xl font-bold text-green-500 dark:text-green-400 font-playful-font">DanZai</div>
      </div>
      {sidebarNavItems.filter(item => !item.hidden).map((item) => { // Filter out hidden items
        const active = item.path ? isActive(item.path) : false;
        const displayActive = item.name === 'More' ? isMoreActive : active;
        
        // Assign to uppercase variable - this should work with explicit types now
        const Icon = item.icon; 

        if (item.name === "More") {
          return (
            <DropdownMenu key={item.text}>
              <DropdownMenuTrigger asChild>
                <button
                  className={`flex items-center w-full px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${ 
                    displayActive // Use displayActive for styling MORE button
                      ? "text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-gray-700" 
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
                >
                  {/* Render icon directly using uppercase variable */}
                  <Icon className={`w-5 h-5 mr-3 ${displayActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`} />
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
                    return (
                        <React.Fragment key={dropdownItem.text}>
                            {index > 0 && <div className="border-t border-gray-200 dark:border-gray-600"></div>}
                            <DropdownMenuItem asChild className={`${index === 0 ? 'rounded-t-lg' : ''} ${index === moreDropdownItems.length - 1 ? 'rounded-b-lg' : ''} focus:bg-gray-100 dark:focus:bg-gray-600 focus:text-gray-900 dark:focus:text-white px-0`}>
                                <a 
                                href={dropdownItem.path} 
                                onClick={(e) => {
                                    e.preventDefault(); 
                                    navigate(dropdownItem.path);
                                }}
                                className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white w-full transition-colors"
                                >
                                    {/* Render icon directly */}
                                    <DropdownIcon className="w-5 h-5 mr-3 text-gray-600 dark:text-gray-400" />
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
          // Render regular button for other items
          const Icon = item.icon; // Assign here too
          
          // --- MODIFIED: Dynamic path for Learn item ---
          let targetPath = item.path;
          if (item.name === "Learn" && studentId) {
            targetPath = `/students/${studentId}`;
          }
          // --- END MODIFICATION ---

          return (
            <button
              key={item.text}
              className={`flex items-center w-full px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${ 
                active // Use calculated active state
                  ? "text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-gray-700" 
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
              onClick={() => {
                if(targetPath) { // Use targetPath here
                  // Check if the item is '学习情况' or '发音'
                  if (item.name === 'Quests' || item.name === 'Pronunciation') {
                    alert('敬请期待！');
                  } else {
                    console.log(`导航到: ${targetPath}`); // Use targetPath here
                    // Use navigate instead of window.location for SPA navigation
                    navigate(targetPath); // Use targetPath here
                  }
                }
              }}
            >
              {/* Render icon directly */}
              <Icon className={`w-5 h-5 mr-3 ${active ? 'text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}/>
              {item.text}
            </button>
          );
        }
      })}
    </aside>
  );
}; 