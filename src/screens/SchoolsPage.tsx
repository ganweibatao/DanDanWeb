import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon, 
  LockIcon, 
  LightbulbIcon, 
  HelpCircleIcon, 
  UsersIcon, 
  CheckCircleIcon, 
  ChevronLeftIcon,
  FlagIcon, // Placeholder for flag
  LayoutGridIcon, // Placeholder for DanZai icon
  XIcon, // For Dialog close button
  CopyIcon, // For copy buttons
  ChevronDownIcon, // For dropdowns
  UploadIcon, // For export activity
  Settings2Icon, // For manage students and student detail settings
  PencilIcon, // For create assignment
  MessageSquareIcon, // For leaderboard ranking bubble
  ZapIcon, // For XP
  ClockIcon, // For time
  HeartIcon, // For Hearts section
  InfinityIcon, // For Unlimited Hearts
  SparklesIcon, // For Super banner (alternative)
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger, // Keep DialogTrigger if needed, or use controlled open state
} from "../components/ui/dialog"; // Import Dialog components
import { Input } from '../components/ui/input'; // Input for link/code display
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"; // Import DropdownMenu components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"; // Import Table components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card"; // Import Card components
// Import Select components from shadcn/ui
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { AppFooter } from '../components/layout/SchoolFooter'; // Import the footer

// 类型定义
type SchoolViewId = 'students' | 'reports' | 'settings' | 'privacy' | 'new_class' | 'training' | 'forum' | 'feedback' | 'DanZai';

// 学校页面特定侧边栏项
const schoolSidebarItems: { text: string; icon: React.ElementType; viewId: SchoolViewId }[] = [
  { text: "英语1", icon: FlagIcon, viewId: 'students' },
  { text: "新班级", icon: PlusIcon, viewId: 'new_class' },
  { text: "隐私设置", icon: LockIcon, viewId: 'privacy' },
  { text: "教师培训", icon: LightbulbIcon, viewId: 'training' },
  { text: "教师论坛", icon: UsersIcon, viewId: 'forum' },
  { text: "反馈", icon: MessageSquareIcon, viewId: 'feedback' },
  { text: "DanZai", icon: LayoutGridIcon, viewId: 'DanZai' },
];

// 步骤数据
const steps = [
  { id: 1, title: "创建教室", completed: true },
  { id: 2, title: "添加学生", description: "邀请学生加入您的课堂，开始他们的学习之旅。", buttonText: "添加学生", current: true },
  { id: 3, title: "创建作业", description: "探索教授特定技能和帮助学生养成日常习惯的内容！", buttonText: "创建作业", current: false },
];

// 模拟学生数据 - 添加 email
interface Student {
  id: string;
  name: string;
  email: string; // Added email
  avatarFallback: string;
  xp: number;
  timeSpent: string;
  latestAssignment: string;
}
const studentsData: Student[] = [
  {
    id: "1",
    name: "Duo_acf37534",
    email: "7510041637@qq.com", // Example email
    avatarFallback: "D",
    xp: 0,
    timeSpent: "0秒",
    latestAssignment: "-",
  }
];

// 简单的切换开关组件
const ToggleSwitch = ({ id, label, checked, onChange, description }: { id: string; label: string; checked: boolean; onChange: (checked: boolean) => void; description: string; }) => {
  return (
    <div className="flex items-start space-x-4 py-4">
      <div className="relative mt-1 flex-shrink-0">
        <input 
          id={id} 
          type="checkbox" 
          className="sr-only peer" 
          checked={checked} 
          onChange={(e) => onChange(e.target.checked)} 
        />
        <div className="w-10 h-5 bg-gray-200 dark:bg-gray-600 rounded-full shadow-inner peer-checked:bg-blue-500 dark:peer-checked:bg-blue-600 transition-colors"></div>
        <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white dark:bg-gray-300 rounded-full border border-gray-300 dark:border-gray-500 shadow transition-transform peer-checked:translate-x-5 peer-checked:border-blue-500 dark:peer-checked:border-blue-600"></div>
      </div>
      <div className="flex-1">
        <label htmlFor={id} className="block text-sm font-medium text-gray-800 dark:text-gray-200 cursor-pointer">{label}</label>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
      </div>
    </div>
  );
};

// --- Mock Icons/Components for DanZai View ---
const OwlIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Simplified Owl representation */}
    <circle cx="50" cy="50" r="40" fill="#4c1d95"/> {/* Body */}
    <circle cx="35" cy="40" r="10" fill="white"/> {/* Left Eye */}
    <circle cx="65" cy="40" r="10" fill="white"/> {/* Right Eye */}
    <circle cx="35" cy="40" r="5" fill="black"/> {/* Left Pupil */}
    <circle cx="65" cy="40" r="5" fill="black"/> {/* Right Pupil */}
    <polygon points="45,60 55,60 50,70" fill="orange"/> {/* Beak */}
    <path d="M20,30 Q30,15 40,30" stroke="#4c1d95" strokeWidth="5" fill="none"/> {/* Left Ear */}
    <path d="M60,30 Q70,15 80,30" stroke="#4c1d95" strokeWidth="5" fill="none"/> {/* Right Ear */}
  </svg>
);

const FilledHeartIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

const InfinityHeartIcon = ({ className }: { className?: string }) => (
  // Combine Infinity and Heart - simplified representation
  <div className={`relative flex items-center justify-center ${className}`}>
     <InfinityIcon className="w-10 h-10 text-teal-400" />
     {/* <HeartIcon className="absolute w-5 h-5 text-teal-600 opacity-80" /> */}
   </div>
);

export const SchoolsPage = (): JSX.Element => {
  const navigate = useNavigate();
  // 模拟用户数据
  const schoolUser = { username: "wBVua40q", avatarFallback: "W" };
  // 弹窗状态
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  // 模拟是否有学生的状态 (用于切换显示步骤还是列表)
  const [hasStudents, setHasStudents] = useState(true); // Set to true to show the student list view
  // 模拟邀请链接和代码
  const inviteLink = "www.DanZai.com/classroom/wgdgcx";
  const inviteCode = "wgdgcx";
  // 抽屉状态
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  // 新增：当前活动的视图状态
  const [activeView, setActiveView] = useState<SchoolViewId>('students');
  
  // 新增：创建的班级列表
  const [createdClasses, setCreatedClasses] = useState<{ text: string; icon: React.ElementType; viewId: SchoolViewId }[]>([]);

  // 新增：创建新班级所需的状态
  const [newClassName, setNewClassName] = useState('');
  const [newClassTeachingLang, setNewClassTeachingLang] = useState('en-us'); // Default to English (US)
  const [newClassStudentLang, setNewClassStudentLang] = useState('zh-cn'); // Default to Chinese (CN)

  // 新增：隐私设置开关状态
  const [enableForum, setEnableForum] = useState(false);
  const [enableEvents, setEnableEvents] = useState(false);
  const [enableSocial, setEnableSocial] = useState(false);

  // 新增：反馈相关状态
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState('general');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // 复制文本到剪贴板的函数
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Optional: Add feedback like a toast message
      console.log("Copied to clipboard:", text);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  // 打开学生详情抽屉的处理函数
  const handleStudentRowClick = (student: Student) => {
    setSelectedStudent(student);
  };

  // 关闭学生详情视图的处理函数
  const handleCloseStudentDetail = () => {
    setSelectedStudent(null);
  };

  // 提交反馈的函数
  const handleSubmitFeedback = () => {
    if (!feedbackText.trim()) return;
    
    setFeedbackSubmitting(true);
    
    // 模拟API调用
    setTimeout(() => {
      console.log('Feedback submitted:', { category: feedbackCategory, text: feedbackText });
      setFeedbackSubmitting(false);
      setFeedbackSubmitted(true);
      
      // 重置表单 - 3秒后
      setTimeout(() => {
        setFeedbackSubmitted(false);
        setFeedbackText('');
        setFeedbackCategory('general');
      }, 3000);
    }, 1000);
  };

  // --- Compute conditional view flags before return ---
  const showStudentsReportsSettings = (['students', 'reports', 'settings'] as SchoolViewId[]).includes(activeView);
  const showPrivacy = activeView === 'privacy';
  const showNewClass = activeView === 'new_class';
  const showFeedback = activeView === 'feedback';
  const showDanbao = activeView === 'DanZai';
  const showTrainingForumPlaceholder = (['training', 'forum'] as SchoolViewId[]).includes(activeView);

  // 合并默认侧边栏项和创建的班级
  const allSidebarItems = [
    ...createdClasses,
    ...schoolSidebarItems.filter(item => item.viewId !== 'students')
  ];

  return (
    <div className="flex bg-gray-100 dark:bg-gray-900 font-sans h-screen overflow-hidden">
      {/* 学校特定侧边栏 - Apply styles from Sidebar.tsx */}
      <aside className="w-60 bg-white dark:bg-gray-800 p-4 flex flex-col space-y-1 border-r border-gray-200 dark:border-gray-700 shadow-sm flex-shrink-0">
        {/* Header - Ensure text size/weight matches Sidebar.tsx */}
        <div className="mb-6 pl-2">
          {/* Use specific logo text for schools page */}
          <div className="text-xl font-semibold text-blue-600 dark:text-blue-400">DanZai</div>
        </div>
        
        {/* Navigation Items - Apply styles from Sidebar.tsx */}
        <nav className="flex-grow space-y-1">
          {allSidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.viewId || 
                            (item.viewId === 'students' && ['reports', 'settings'].includes(activeView)); // Highlight '英语1' if students/reports/settings active
            return (
              <button
                key={item.text}
                className={`flex items-center w-full px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${ 
                  isActive
                    ? "text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-gray-700"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
                onClick={() => {
                  // Fix: Ensure clicking '英语1' always sets view to 'students' if not already in student/report/settings
                  const targetView = item.viewId === 'students' && !['students', 'reports', 'settings'].includes(activeView) ? 'students' : item.viewId;
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
                 {/* <AvatarImage src={schoolUser.avatarUrl} alt="User Avatar" /> */}
                 <AvatarFallback className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold">{schoolUser.avatarFallback}</AvatarFallback>
             </Avatar>
             <div>
                 <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{schoolUser.username}</div>
                 <Button 
                   variant="link"
                   className="text-xs text-blue-600 dark:text-blue-400 hover:underline p-0 h-auto" 
                   onClick={() => navigate('/settings')}
                 >
                   编辑
                 </Button>
             </div>
           </div>
        </div>
      </aside>

      {/* 主内容区域 - Use pre-computed flags */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-gray-50 dark:bg-gray-900">
         {/* === Render based on activeView === */}

         {/* --- Students / Reports / Settings View --- */}
         { showStudentsReportsSettings && (
           <div className="flex flex-col h-full">
             {/* Header for Students/Reports/Settings */}
             <header className="flex items-center justify-between px-10 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center">
                   {/* No back button needed here */}
                   <FlagIcon className="w-6 h-6 mr-2 text-red-500" /> 
               <span className="text-xl font-semibold text-gray-800 dark:text-white">英语1</span>
            </div>
         </header>

             {/* Tabs Content Area */}
             <div className="p-10 flex-grow overflow-y-auto"> 
                <Tabs 
                  value={activeView} 
                  onValueChange={(value) => setActiveView(value as SchoolViewId)} // Fix: Cast value to SchoolViewId
                  className="w-full h-full flex flex-col"
                >
                  <TabsList className="mb-6 flex-shrink-0 w-fit">
                    {/* Corrected value props */}
                    <TabsTrigger value="students">学生</TabsTrigger>
                    <TabsTrigger value="reports">报告</TabsTrigger>
                    <TabsTrigger value="settings">设置</TabsTrigger>
               </TabsList>

                  {/* Tab Content Panes */}
                  <TabsContent value="students" className="flex-grow mt-0"> { /* Added mt-0 */}
                 {hasStudents ? (
                        // === 学生列表视图 - Adjusted layout ===
                        <div className="flex gap-6 h-full">
                          {/* Left side - Student table */}
                          <div className="flex-1 flex flex-col">
                            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                           {studentsData.length} 名学生
                         </h2>
                              <div className="flex items-center space-x-2">
                           <DropdownMenu>
                             <DropdownMenuTrigger asChild>
                               <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400">
                                      这周 <ChevronDownIcon className="w-4 h-4 ml-1 text-gray-400 dark:text-gray-500" />
                               </Button>
                             </DropdownMenuTrigger>
                                  <DropdownMenuContent className="w-48 bg-gray-50 dark:bg-gray-700 p-0 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
                                    <DropdownMenuItem className="py-3 px-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer focus:bg-gray-100 dark:focus:bg-gray-600 justify-center text-sm">
                                      今天
                                    </DropdownMenuItem>
                                    <div className="border-t border-gray-200 dark:border-gray-600"></div>
                                    <DropdownMenuItem className="py-3 px-4 text-blue-600 bg-blue-50 dark:text-blue-300 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 cursor-pointer focus:bg-blue-100 dark:focus:bg-blue-900/50 justify-center text-sm font-medium">
                                      这周
                                    </DropdownMenuItem>
                                    <div className="border-t border-gray-200 dark:border-gray-600"></div>
                                    <DropdownMenuItem className="py-3 px-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer focus:bg-gray-100 dark:focus:bg-gray-600 justify-center text-sm">
                                      自从加入班级以来
                                    </DropdownMenuItem>
                                    <div className="border-t border-gray-200 dark:border-gray-600"></div>
                                    <DropdownMenuItem className="py-3 px-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer focus:bg-gray-100 dark:focus:bg-gray-600 justify-center text-sm">
                                      自定义日期
                                    </DropdownMenuItem>
                             </DropdownMenuContent>
                           </DropdownMenu>
                           <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400">
                             <UploadIcon className="w-4 h-4 mr-1" /> 导出活动
                           </Button>
                           <DropdownMenu>
                             <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400">
                                        <UsersIcon className="w-4 h-4 mr-1" /> 管理学生 <ChevronDownIcon className="w-4 h-4 ml-1" />
                                </Button>
                             </DropdownMenuTrigger>
                                  <DropdownMenuContent className="w-48 bg-gray-50 dark:bg-gray-700 p-0 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
                                    <DropdownMenuItem className="py-3 px-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer focus:bg-gray-100 dark:focus:bg-gray-600 justify-center text-sm">
                                       查看课程进度
                                    </DropdownMenuItem>
                                    <div className="border-t border-gray-200 dark:border-gray-600"></div>
                                    <DropdownMenuItem
                                      className="py-3 px-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer focus:bg-gray-100 dark:focus:bg-gray-600 justify-center text-sm"
                                      onClick={() => setIsInviteModalOpen(true)}
                                    >
                                       添加学生
                                    </DropdownMenuItem>
                                    <div className="border-t border-gray-200 dark:border-gray-600"></div>
                                    <DropdownMenuItem className="py-3 px-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer focus:bg-gray-100 dark:focus:bg-gray-600 justify-center text-sm">
                                       删除学生
                                    </DropdownMenuItem>
                             </DropdownMenuContent>
                           </DropdownMenu>
                         </div>
                       </div>

                            <div className="flex-grow overflow-y-auto rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                       <Table>
                                <TableHeader className="sticky top-0 bg-white dark:bg-gray-800">
                                  <TableRow className="border-b border-gray-200 dark:border-gray-700">
                                    <TableHead className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">名称</TableHead>
                                    <TableHead className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">年级</TableHead>
                                    <TableHead className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">学习时长</TableHead>
                                    <TableHead className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">最新作业</TableHead>
                           </TableRow>
                         </TableHeader>
                                <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                           {studentsData.map((student) => (
                             <TableRow 
                                key={student.id} 
                                onClick={() => handleStudentRowClick(student)} // Make row clickable
                                className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 ${selectedStudent?.id === student.id ? 'bg-blue-50 dark:bg-gray-700/80' : ''}`}
                             >
                                      <TableCell className="font-medium flex items-center space-x-3 py-3">
                                 <Avatar className="w-8 h-8">
                                   <AvatarFallback className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs">{student.avatarFallback}</AvatarFallback>
                                 </Avatar>
                                 <span>{student.name}</span>
                               </TableCell>
                               <TableCell>{student.xp} XP</TableCell>
                               <TableCell>{student.timeSpent}</TableCell>
                               <TableCell>{student.latestAssignment}</TableCell>
                             </TableRow>
                           ))}
                         </TableBody>
                       </Table>
                            </div>
                     </div>

                          {/* Right side - Student Detail */}
                          <aside className="w-80 flex-shrink-0"> { /* Adjusted width */}
                       {selectedStudent ? (
                         <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm flex flex-col h-full">
                                {/* Detail Header */}
                                <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
                               <Button variant="ghost" size="icon" onClick={handleCloseStudentDetail} className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                                  <XIcon className="h-5 w-5" />
                               </Button>
                               {/* Settings Dropdown */}
                               <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                     <Button variant="ghost" size="icon" className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <Settings2Icon className="h-5 w-5" />
                                     </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                     <DropdownMenuItem>编辑电子邮件</DropdownMenuItem>
                                     <DropdownMenuItem>移动学生</DropdownMenuItem>
                                     <DropdownMenuItem>重置密码</DropdownMenuItem>
                                     <DropdownMenuItem className="text-red-600 dark:text-red-500 focus:text-red-600 dark:focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-900/20">
                                        删除学生
                                     </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                                {/* Detail Content */} 
                                <div className="flex-grow flex flex-col"> 
                                  {/* Fixed Content */} 
                                  <div className="p-6 space-y-6 flex-shrink-0">
                                    {/* User Information */}
                               <div className="flex flex-col items-center text-center">
                                   <Avatar className="w-16 h-16 mb-3">
                                      <AvatarFallback className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-2xl">{selectedStudent.avatarFallback}</AvatarFallback>
                                   </Avatar>
                                   <h2 className="text-lg font-bold text-gray-800 dark:text-white">{selectedStudent.name}</h2>
                                   <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{selectedStudent.email}</p>
                                        <Button 
                                          size="sm" 
                                          variant="outline" 
                                          className="border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700"
                                          onClick={() => navigate('/students')}
                                        >
                                          开始教学
                                        </Button>
                               </div>

                                    {/* Progress */}
                               <div>
                                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">加入班级以来的进度</h3>
                                  <div className="grid grid-cols-2 gap-3">
                                     <Card className="bg-gray-50 dark:bg-gray-700 p-3 flex items-center space-x-2">
                                        <ZapIcon className="w-5 h-5 text-yellow-500 dark:text-yellow-400 flex-shrink-0" />
                                        <div>
                                           <div className="text-base font-bold text-gray-800 dark:text-white">{selectedStudent.xp}</div>
                                           <div className="text-xxs text-gray-500 dark:text-gray-400">经验值</div>
                                        </div>
                                     </Card>
                                     <Card className="bg-gray-50 dark:bg-gray-700 p-3 flex items-center space-x-2">
                                        <ClockIcon className="w-5 h-5 text-purple-500 dark:text-purple-400 flex-shrink-0" />
                                        <div>
                                           <div className="text-base font-bold text-gray-800 dark:text-white">{selectedStudent.timeSpent}</div>
                                           <div className="text-xxs text-gray-500 dark:text-gray-400">时间</div>
                                        </div>
                                     </Card>
                                  </div>
                               </div>
                                  </div>
                                  {/* Scrollable Content */} 
                                  <div className="flex-grow overflow-y-auto p-6 pt-0 space-y-6 border-t border-gray-200 dark:border-gray-600"> 
                                    {/* Past Assignments */}
                               <div>
                                       <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 tracking-wider">过去作业</h3>
                                       {/* Card containing all assignment statuses */}
                                       <div className="bg-gray-50 dark:bg-gray-700/60 rounded-lg border border-gray-200 dark:border-gray-600 divide-y divide-gray-200 dark:divide-gray-700">
                                           {/* Completed */}
                                           <div className="p-3 flex items-center space-x-2">
                                       <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                                       <div>
                                          <div className="text-sm font-semibold text-gray-800 dark:text-white">0/0</div>
                                                 <div className="text-xs text-gray-500 dark:text-gray-400">0 完成</div>
                                              </div>
                                           </div>
                                           {/* Late */}
                                           <div className="p-3 flex items-center space-x-2">
                                              {/* Using ClockIcon with yellow color for Late */}
                                              <ClockIcon className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                                              <div>
                                                 <div className="text-sm font-semibold text-gray-800 dark:text-white">0/0</div>
                                                 <div className="text-xs text-gray-500 dark:text-gray-400">0 晚了</div>
                                              </div>
                                           </div>
                                           {/* Missed */}
                                           <div className="p-3 flex items-center space-x-2">
                                              {/* Using ClockIcon with red color for Missed */}
                                              <ClockIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                                             <div>
                                                <div className="text-sm font-semibold text-gray-800 dark:text-white">0/0</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">0 错过</div>
                                             </div>
                                           </div>
                                       </div>
                                   </div>
                               </div>
                            </div>
                         </div>
                       ) : (
                              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm p-6 h-full flex flex-col justify-center items-center text-center">
                                <p className="text-gray-500 dark:text-gray-400">点击一个学生查看详情。</p>
                               </div>
                       )}
                     </aside>
                   </div>
                 ) : (
                   <div className="max-w-2xl mx-auto">
                          {/* Step indicator code */}
                        </div>
                     )}
                  </TabsContent>

                  <TabsContent value="reports" className="mt-0"> 
                      <p className="text-center text-gray-500 dark:text-gray-400">报告内容将在此显示。</p>
                  </TabsContent>
                  
                  <TabsContent value="settings" className="max-w-3xl mx-auto mt-0">
                    <div className="space-y-8">
                      {/* Classroom Information Section */}
                      <section>
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">教室信息</h3>
                          <Button variant="secondary" className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300">保存</Button>
                        </div>
                        <div className="space-y-6">
                          {/* Classroom Code */}
                          <div className="grid grid-cols-3 items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">班级代码</label>
                            <div className="col-span-2 flex items-center space-x-2">
                              <span className="font-mono text-gray-800 dark:text-gray-200">{inviteCode}</span>
                              <Button variant="link" size="sm" className="text-blue-600 dark:text-blue-400 p-0 h-auto" onClick={() => copyToClipboard(inviteCode)}>
                                <CopyIcon className="w-3.5 h-3.5 mr-1"/> 复制
                              </Button>
                            </div>
                          </div>
                          {/* Classroom Link */}
                          <div className="grid grid-cols-3 items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">课堂链接</label>
                            <div className="col-span-2 flex items-center space-x-2">
                              <span className="text-gray-800 dark:text-gray-200">{inviteLink}</span>
                              <Button variant="link" size="sm" className="text-blue-600 dark:text-blue-400 p-0 h-auto" onClick={() => copyToClipboard(inviteLink)}>
                                <CopyIcon className="w-3.5 h-3.5 mr-1"/> 复制
                              </Button>
                            </div>
                          </div>
                          {/* Classroom Name */}
                          <div className="grid grid-cols-3 items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <label htmlFor="classroomName" className="text-sm font-medium text-gray-600 dark:text-gray-400">班级名称</label>
                            <Input 
                              id="classroomName" 
                              defaultValue="英语1" 
                              className="col-span-2 max-w-xs bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                            />
                          </div>
                          {/* Teaching Language */}
                          <div className="grid grid-cols-3 items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <label htmlFor="teachingLanguage" className="text-sm font-medium text-gray-600 dark:text-gray-400">教授的语言（们）</label>
                            <Select defaultValue="en-us">
                              <SelectTrigger id="teachingLanguage" className="col-span-2 max-w-xs bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                                <SelectValue placeholder="选择语言">
                                  <div className="flex items-center">
                                    {/* US Flag Placeholder */} 
                                    <svg className="w-5 h-5 mr-2 rounded-sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7410 3900"><path fill="#b22234" d="M0 0h7410v3900H0z"/><path d="M0 450h7410M0 1170h7410M0 1890h7410M0 2610h7410M0 3330h7410M2964 0v2340H0z" stroke="#fff" stroke-width="300"/><path fill="#3c3b6e" d="M0 0h2964v2340H0z"/><g fill="#fff">{[...Array(50)].map((_, i) => <g key={i} transform={`translate(${247 + (i % 10) * 494} ${195 + Math.floor(i / 10) * 390}) scale(13)`}><g transform="translate(0 -10)"><polygon points="0,0 2.939,9.09 9.511,9.09 4.755,14.708 5.878,23.806 0,18.1 0,18.1 -5.878,23.806 -4.755,14.708 -9.511,9.09 -2.939,9.09"/></g></g>)}</g></svg>
                                    <span>英语</span>
                                  </div>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="en-us">
                                  <div className="flex items-center">
                                     {/* US Flag Placeholder */} 
                                    <svg className="w-5 h-5 mr-2 rounded-sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7410 3900"><path fill="#b22234" d="M0 0h7410v3900H0z"/><path d="M0 450h7410M0 1170h7410M0 1890h7410M0 2610h7410M0 3330h7410M2964 0v2340H0z" stroke="#fff" stroke-width="300"/><path fill="#3c3b6e" d="M0 0h2964v2340H0z"/><g fill="#fff">{[...Array(50)].map((_, i) => <g key={i} transform={`translate(${247 + (i % 10) * 494} ${195 + Math.floor(i / 10) * 390}) scale(13)`}><g transform="translate(0 -10)"><polygon points="0,0 2.939,9.09 9.511,9.09 4.755,14.708 5.878,23.806 0,18.1 0,18.1 -5.878,23.806 -4.755,14.708 -9.511,9.09 -2.939,9.09"/></g></g>)}</g></svg>
                                    <span>英语</span>
                                  </div>
                                </SelectItem>
                                {/* Add other languages here */}
                              </SelectContent>
                            </Select>
                          </div>
                          {/* Student Language */}
                          <div className="grid grid-cols-3 items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <label htmlFor="studentLanguage" className="text-sm font-medium text-gray-600 dark:text-gray-400">学生使用的语言</label>
                            <Select defaultValue="zh-cn">
                              <SelectTrigger id="studentLanguage" className="col-span-2 max-w-xs bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                                <SelectValue placeholder="选择语言">
                                   <div className="flex items-center">
                                    {/* China Flag Placeholder */} 
                                    <svg className="w-5 h-5 mr-2 rounded-sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400"><path fill="#de2910" d="M0 0h600v400H0z"/><path fill="#ffde00" d="M120 80l23.51 72.36L71.95 97.89h96.1L120 80zm77.06 100.71L156.4 153.1l-42.11-1.64 30.44-32.1-11.07-43.45 38.8 20.4zm-3.86 77.06l-18.27-38.7-39.56 17.2 14.19-41.28-33-29.7 43.9-.34 17.79-39.3 4.4 43.7 43.8.92-32.5 30.2 14.8 41zm77.06-3.86l-38.8-20.4 11.07 43.45-30.44 32.1 42.11 1.64-23.51 27.61 18.27-38.7 39.56-17.2-14.19 41.28 33 29.7-43.9.34-17.79 39.3-4.4-43.7-43.8-.92 32.5-30.2-14.8-41zm38.8-77.06l-43.9-.34 33-29.7-14.19-41.28 39.56 17.2 18.27 38.7-23.51-27.61 42.11-1.64-30.44-32.1 11.07 43.45-38.8 20.4 4.4 43.7 17.79 39.3-43.8.92 14.8 41 32.5 30.2z"/></svg>
                                    <span>中文</span>
                                  </div>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="zh-cn">
                                  <div className="flex items-center">
                                     {/* China Flag Placeholder */} 
                                    <svg className="w-5 h-5 mr-2 rounded-sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400"><path fill="#de2910" d="M0 0h600v400H0z"/><path fill="#ffde00" d="M120 80l23.51 72.36L71.95 97.89h96.1L120 80zm77.06 100.71L156.4 153.1l-42.11-1.64 30.44-32.1-11.07-43.45 38.8 20.4zm-3.86 77.06l-18.27-38.7-39.56 17.2 14.19-41.28-33-29.7 43.9-.34 17.79-39.3 4.4 43.7 43.8.92-32.5 30.2 14.8 41zm77.06-3.86l-38.8-20.4 11.07 43.45-30.44 32.1 42.11 1.64-23.51 27.61 18.27-38.7 39.56-17.2-14.19 41.28 33 29.7-43.9.34-17.79 39.3-4.4-43.7-43.8-.92 32.5-30.2-14.8-41zm38.8-77.06l-43.9-.34 33-29.7-14.19-41.28 39.56 17.2 18.27 38.7-23.51-27.61 42.11-1.64-30.44-32.1 11.07 43.45-38.8 20.4 4.4 43.7 17.79 39.3-43.8.92 14.8 41 32.5 30.2z"/></svg>
                                    <span>中文</span>
                                  </div>
                                </SelectItem>
                                {/* Add other languages here */}
                              </SelectContent>
                            </Select>
                          </div>
                          {/* Settings Instructions */}
                          <div className="grid grid-cols-3 items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">设置说明</label>
                            <div className="col-span-2">
                              <Button variant="outline" className="text-blue-600 border-blue-500 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-gray-700">
                                DOWNLOAD PDF
                              </Button>
                            </div>
                           </div>
                          {/* Delete Classroom */}
                          <div className="grid grid-cols-3 items-center gap-4">
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">删除教室</label>
                            <div className="col-span-2">
                               {/* Added specific red styling for delete button */}
                               <Button variant="outline" className="text-red-600 border-red-500 hover:bg-red-50 dark:text-red-400 dark:border-red-400 dark:hover:bg-red-900/20">
                                删除教室
                               </Button>
                            </div>
                          </div>
                        </div>
                      </section>
                    </div>
                  </TabsContent>
                </Tabs>
             </div>
           </div>
         )}

         {/* --- Privacy Settings View --- */}
         { showPrivacy && (
           <div className="flex flex-col h-full">
             {/* Header for Privacy Settings */}
             <header className="flex items-center justify-between px-10 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
               <div className="flex items-center">
                 {/* Adjusted: Using text instead of back button to match image */}
                 {/* <Button variant=\"ghost\" size=\"icon\" className=\"mr-4 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700\" onClick={() => setActiveView('students')}> 
                     <ChevronLeftIcon className=\"w-5 h-5\" />
                 </Button> */}
                 <h1 className="text-xl font-semibold text-gray-800 dark:text-white">学生隐私设置</h1>
               </div>
               {/* Adjusted Save button style */}
               <Button variant="secondary" className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold px-5 py-2 rounded-lg">保存</Button>
             </header>

             {/* Content Area for Privacy Settings */}
             <div className="flex-grow p-10 overflow-y-auto">
                <p className="text-gray-600 dark:text-gray-400 mb-10 max-w-2xl text-sm"> {/* Added mb-10, text-sm */}
                  您可以自定义学生如何使用 Duolingo。这些设置将适用于所有教室中的所有学生。
                </p>

                <section className="max-w-2xl"> {/* Increased max-w */}
                  <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">社交设置</h2> {/* Adjusted size/weight/margin */}
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    <ToggleSwitch 
                      id="enableForum"
                      label="启用讨论论坛"
                      description="学生可以与其他不在教室中的 DanZai 用户参与讨论。"
                      checked={enableForum}
                      onChange={setEnableForum}
                    />
                    <ToggleSwitch 
                      id="enableEvents"
                      label="启用事件页面"
                      description="学生可以参加 DanZai 社区组织的事件。请注意，所有未成年人必须由成人陪同。"
                      checked={enableEvents}
                      onChange={setEnableEvents}
                    />
                    <ToggleSwitch 
                      id="enableSocial"
                      label="启用社交资料和联赛"
                      description="学生可以在课堂内外关注或被其他 DanZai 用户关注。学生可以关注朋友的进度并评论他们的活动。学生可以与其他 DanZai 用户在每周联赛中竞争。拥有私人账户的用户将无法参与。"
                      checked={enableSocial}
                      onChange={setEnableSocial}
                    />
                  </div>
                </section>
             </div>
             
             {/* Add Footer */}
             <AppFooter />
           </div>
         )}

         {/* --- New Class View --- */}
         { showNewClass && (
           <div className="flex flex-col h-full">
             {/* Header for New Class */} 
             <header className="flex items-center justify-between px-10 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0\">
               <div className="flex items-center\">
                 {/* Optional Back Button */}
                 {/* <Button variant=\"ghost\" size=\"icon\" className=\"mr-4 text-gray-600 dark:text-gray-400\" onClick={() => setActiveView('students')}>
                   <ChevronLeftIcon className=\"w-5 h-5\" />
                 </Button> */}
                 <h1 className="text-xl font-semibold text-gray-800 dark:text-white">创建新班级</h1>
               </div>
               {/* Actions */}
               <div className="flex items-center space-x-3\">
                 <Button variant="outline" onClick={() => setActiveView('students')}>取消</Button>
                 {/* TODO: Implement actual class creation logic */}
                 <Button 
                   className="bg-blue-500 hover:bg-blue-600"
                   onClick={() => { 
                      console.log('Creating new class:', { name: newClassName, teachingLang: newClassTeachingLang, studentLang: newClassStudentLang }); 
                      // 创建新班级到侧边栏
                      if (newClassName.trim()) {
                        // 创建随机的viewId，以students-开头表示这是学生班级视图
                        const newClassId = `students-${Date.now()}` as SchoolViewId;
                        // 创建新班级对象
                        const newClass = {
                          text: newClassName,
                          icon: FlagIcon,
                          viewId: 'students' as SchoolViewId
                        };
                        // 添加到班级列表中
                        setCreatedClasses(prev => [newClass, ...prev]);
                        // 返回学生视图
                        setActiveView('students');
                        // 重置表单
                        setNewClassName('');
                      }
                    }}
                    disabled={!newClassName.trim()} // Disable if name is empty
                 >
                   创建班级
                 </Button>
               </div>
             </header>

             {/* Content Area for New Class Form */}
             <div className="flex-grow p-10 overflow-y-auto">
               <div className="max-w-xl mx-auto space-y-6">
                 {/* Classroom Name Input */}
                 <div>
                   <label htmlFor="newClassName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">班级名称</label>
                   <Input 
                     id="newClassName" 
                     value={newClassName}
                     onChange={(e) => setNewClassName(e.target.value)}
                     placeholder="例如：西班牙语101、上午班"
                     className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                   />
                 </div>

                 {/* Teaching Language Select */}
                 <div>
                   <label htmlFor="newClassTeachingLanguage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">教授的语言（们）</label>
                   <Select value={newClassTeachingLang} onValueChange={setNewClassTeachingLang}>
                     <SelectTrigger id="newClassTeachingLanguage" className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                       <SelectValue placeholder="选择语言">
                         {/* Display selected language with flag */} 
                         {newClassTeachingLang === 'en-us' && (
                           <div className="flex items-center">
                             <svg className="w-5 h-5 mr-2 rounded-sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7410 3900"><path fill="#b22234" d="M0 0h7410v3900H0z"/><path d="M0 450h7410M0 1170h7410M0 1890h7410M0 2610h7410M0 3330h7410M2964 0v2340H0z" stroke="#fff" stroke-width="300"/><path fill="#3c3b6e" d="M0 0h2964v2340H0z"/><g fill="#fff">{[...Array(50)].map((_, i) => <g key={i} transform={`translate(${247 + (i % 10) * 494} ${195 + Math.floor(i / 10) * 390}) scale(13)`}><g transform="translate(0 -10)"><polygon points="0,0 2.939,9.09 9.511,9.09 4.755,14.708 5.878,23.806 0,18.1 0,18.1 -5.878,23.806 -4.755,14.708 -9.511,9.09 -2.939,9.09"/></g></g>)}</g></svg> {/* US Flag */} 
                             <span>英语</span>
                           </div>
                         )}
                         {/* Add other languages display logic here if needed */}
                       </SelectValue>
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="en-us">
                         <div className="flex items-center">
                           <svg className="w-5 h-5 mr-2 rounded-sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7410 3900"><path fill="#b22234" d="M0 0h7410v3900H0z"/><path d="M0 450h7410M0 1170h7410M0 1890h7410M0 2610h7410M0 3330h7410M2964 0v2340H0z" stroke="#fff" stroke-width="300"/><path fill="#3c3b6e" d="M0 0h2964v2340H0z"/><g fill="#fff">{[...Array(50)].map((_, i) => <g key={i} transform={`translate(${247 + (i % 10) * 494} ${195 + Math.floor(i / 10) * 390}) scale(13)`}><g transform="translate(0 -10)"><polygon points="0,0 2.939,9.09 9.511,9.09 4.755,14.708 5.878,23.806 0,18.1 0,18.1 -5.878,23.806 -4.755,14.708 -9.511,9.09 -2.939,9.09"/></g></g>)}</g></svg> {/* US Flag */} 
                           <span>英语</span>
                         </div>
                       </SelectItem>
                       {/* Add more language options here */}
                     </SelectContent>
                   </Select>
                 </div>

                 {/* Student Language Select */}
                 <div>
                   <label htmlFor="newClassStudentLanguage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">学生使用的语言</label>
                   <Select value={newClassStudentLang} onValueChange={setNewClassStudentLang}>
                     <SelectTrigger id="newClassStudentLanguage" className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                       <SelectValue placeholder="选择语言">
                         {/* Display selected language with flag */} 
                         {newClassStudentLang === 'zh-cn' && (
                           <div className="flex items-center">
                             <svg className="w-5 h-5 mr-2 rounded-sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400"><path fill="#de2910" d="M0 0h600v400H0z"/><path fill="#ffde00" d="M120 80l23.51 72.36L71.95 97.89h96.1L120 80zm77.06 100.71L156.4 153.1l-42.11-1.64 30.44-32.1-11.07-43.45 38.8 20.4zm-3.86 77.06l-18.27-38.7-39.56 17.2 14.19-41.28-33-29.7 43.9-.34 17.79-39.3 4.4 43.7 43.8.92-32.5 30.2 14.8 41zm77.06-3.86l-38.8-20.4 11.07 43.45-30.44 32.1 42.11 1.64-23.51 27.61 18.27-38.7 39.56-17.2-14.19 41.28 33 29.7-43.9.34-17.79 39.3-4.4-43.7-43.8-.92 32.5-30.2-14.8-41zm38.8-77.06l-43.9-.34 33-29.7-14.19-41.28 39.56 17.2 18.27 38.7-23.51-27.61 42.11-1.64-30.44-32.1 11.07 43.45-38.8 20.4 4.4 43.7 17.79 39.3-43.8.92 14.8 41 32.5 30.2z"/></svg> {/* China Flag */} 
                             <span>中文</span>
                           </div>
                         )}
                         {/* Add other languages display logic here if needed */}
                       </SelectValue>
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="zh-cn">
                         <div className="flex items-center">
                           <svg className="w-5 h-5 mr-2 rounded-sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400"><path fill="#de2910" d="M0 0h600v400H0z"/><path fill="#ffde00" d="M120 80l23.51 72.36L71.95 97.89h96.1L120 80zm77.06 100.71L156.4 153.1l-42.11-1.64 30.44-32.1-11.07-43.45 38.8 20.4zm-3.86 77.06l-18.27-38.7-39.56 17.2 14.19-41.28-33-29.7 43.9-.34 17.79-39.3 4.4 43.7 43.8.92-32.5 30.2 14.8 41zm77.06-3.86l-38.8-20.4 11.07 43.45-30.44 32.1 42.11 1.64-23.51 27.61 18.27-38.7 39.56-17.2-14.19 41.28 33 29.7-43.9.34-17.79 39.3-4.4-43.7-43.8-.92 32.5-30.2-14.8-41zm38.8-77.06l-43.9-.34 33-29.7-14.19-41.28 39.56 17.2 18.27 38.7-23.51-27.61 42.11-1.64-30.44-32.1 11.07 43.45-38.8 20.4 4.4 43.7 17.79 39.3-43.8.92 14.8 41 32.5 30.2z"/></svg> {/* China Flag */} 
                             <span>中文</span>
                           </div>
                       </SelectItem>
                       {/* Add more language options here */}
                     </SelectContent>
                   </Select>
                 </div>
               </div>
                     </div>
                   </div>
                 )}

         {/* --- 反馈视图 --- */}
         { showFeedback && (
           <div className="flex flex-col h-full">
             {/* 反馈页面头部 */}
             <header className="flex items-center justify-between px-10 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
               <div className="flex items-center">
                 <h1 className="text-xl font-semibold text-gray-800 dark:text-white">向DanBao团队发送反馈</h1>
               </div>
             </header>

             {/* 反馈内容区域 */}
             <div className="flex-grow p-10 overflow-y-auto">
               <div className="max-w-2xl mx-auto">
                 {!feedbackSubmitted ? (
                   <div className="space-y-6">
                     <p className="text-gray-600 dark:text-gray-400">
                       我们非常重视您的意见！请告诉我们您的想法，以帮助我们改进DanBao学校版平台。
                     </p>
                     
                     {/* 反馈类别选择 */}
                     <div>
                       <label htmlFor="feedbackCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                         反馈类别
                       </label>
                       <Select value={feedbackCategory} onValueChange={setFeedbackCategory}>
                         <SelectTrigger id="feedbackCategory" className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                           <SelectValue placeholder="选择反馈类别" />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="general">一般反馈</SelectItem>
                           <SelectItem value="bug">错误报告</SelectItem>
                           <SelectItem value="feature">功能请求</SelectItem>
                           <SelectItem value="content">内容相关</SelectItem>
                           <SelectItem value="other">其他</SelectItem>
                         </SelectContent>
                       </Select>
                     </div>
                     
                     {/* 反馈内容 */}
                     <div>
                       <label htmlFor="feedbackContent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                         反馈内容
                       </label>
                       <textarea
                         id="feedbackContent"
                         rows={6}
                         value={feedbackText}
                         onChange={(e) => setFeedbackText(e.target.value)}
                         placeholder="请详细描述您的反馈..."
                         className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100"
                       />
                     </div>
                     
                     {/* 提交按钮 */}
                     <div className="flex justify-end">
                       <Button 
                         onClick={handleSubmitFeedback} 
                         disabled={!feedbackText.trim() || feedbackSubmitting}
                         className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                         {feedbackSubmitting ? '提交中...' : '提交反馈'}
                       </Button>
                     </div>
                   </div>
                 ) : (
                   <div className="text-center py-10 space-y-4">
                     <CheckCircleIcon className="w-16 h-16 mx-auto text-green-500" />
                     <h3 className="text-xl font-semibold text-gray-800 dark:text-white">感谢您的反馈！</h3>
                     <p className="text-gray-600 dark:text-gray-400">
                       我们已收到您的反馈，并将认真考虑您的建议。
                     </p>
                   </div>
                 )}
               </div>
             </div>
             
             {/* Add Footer */}
             <AppFooter />
           </div>
         )}

         {/* --- DanZai View --- */}
         { showDanbao && (
           <div className="flex flex-col h-full"> {/* Changed to flex-col */} 
              <div className="flex-grow p-6 md:p-10 space-y-10 overflow-y-auto"> {/* Added overflow-y-auto */} 
                {/* Super Banner */}
               <div className="rounded-xl bg-gradient-to-br from-indigo-600 via-purple-700 to-blue-800 p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8 relative overflow-hidden">
                 <OwlIcon className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 text-purple-300" /> {/* Use OwlIcon */}
                 <div className="flex-grow text-center md:text-left">
                   <span className="absolute top-2 right-2 bg-yellow-400 text-purple-800 text-xs font-bold px-2 py-0.5 rounded-full transform rotate-[-10deg]">SUPER</span>
                   <h2 className="text-xl md:text-2xl font-bold mb-2">
                     马上开启 2 天免费会员，享受 Super 精彩福利
                   </h2>
                   {/* <p className="text-sm opacity-90 mb-4">Some details about Super benefits...</p> */}
                   <Button 
                     variant="secondary" 
                     className="bg-white text-indigo-700 font-bold hover:bg-gray-100 px-6 py-2.5 rounded-lg shadow w-full md:w-auto"
                     onClick={() => console.log('Start 14-day trial')}
                   >
                     开始 14 天免费体验
                   </Button>
                 </div>
               </div>

               {/* 红心 Section */}
               <section>
                 <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">红心</h2>
                 <div className="space-y-4">
                   {/* 补心 */}
                   <div className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between border border-gray-200 dark:border-gray-700">
                     <div className="flex items-center space-x-4">
                       <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                         <FilledHeartIcon className="w-8 h-8 text-red-500" />
                       </div>
                       <div>
                         <h3 className="font-semibold text-gray-800 dark:text-gray-100">补心</h3>
                         <p className="text-sm text-gray-600 dark:text-gray-400">用宝石重新获取满心，就能继续学习！犯错也不用担心咯！</p>
                       </div>
                     </div>
                     <Button variant="outline" disabled className="bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600 cursor-not-allowed">
                       已满
                     </Button>
                   </div>

                   {/* 无限红心 */}
                   <div className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between border border-gray-200 dark:border-gray-700">
                     <div className="flex items-center space-x-4">
                       <div className="bg-teal-100 dark:bg-teal-900/30 p-2 rounded-full">
                         <InfinityHeartIcon className="w-8 h-8 text-teal-500" />
                       </div>
                       <div>
                         <h3 className="font-semibold text-gray-800 dark:text-gray-100">无限红心</h3>
                         <p className="text-sm text-gray-600 dark:text-gray-400">用 Super，答错也不丢心！</p>
                       </div>
                     </div>
                     <Button 
                       variant="outline" 
                       className="border-purple-400 text-purple-600 dark:border-purple-500 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-gray-700 font-semibold"
                       onClick={() => console.log('Unlimited hearts free trial')}
                     >
                       免费体验
                     </Button>
                   </div>
                 </div>
               </section>

               {/* 道具 Section */}
               <section>
                 <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">道具</h2>
                 <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                   <p className="text-center text-gray-500 dark:text-gray-400">道具内容待实现。</p>
                 </div>
               </section>

               </div>
               
               {/* Add Footer */}
               <AppFooter />
             </div>
           )}

         {/* --- Placeholder for other views --- */}
         { showTrainingForumPlaceholder && (
           <div className="p-10 text-center">
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                {schoolSidebarItems.find(item => item.viewId === activeView)?.text}
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                {activeView === 'forum'
                  ? '教师论坛内容待实现，敬请期待！'
                  : `${schoolSidebarItems.find(item => item.viewId === activeView)?.text} 视图内容待实现。`}
              </p>
           </div>
         )}

      </main>

      {/* 添加学生邀请弹窗 */}
      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        {/* <DialogTrigger>不需要，因为我们手动控制 open 状态</DialogTrigger> */}
        <DialogContent className="sm:max-w-[650px] bg-white dark:bg-gray-800 p-0">
          <DialogHeader className="p-6 pb-0">
             {/* 自定义关闭按钮 */}
             <button
               type="button"
               onClick={() => setIsInviteModalOpen(false)}
               className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
             >
               <XIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
               <span className="sr-only">Close</span>
             </button>
             {/* 弹窗内标签页 */}
             <Tabs defaultValue="invite" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-12 p-0 border-b border-gray-200 dark:border-gray-700">
                  <TabsTrigger value="invite" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-none focus-visible:ring-0 font-semibold text-gray-500 dark:text-gray-400">发送邀请</TabsTrigger>
                  <TabsTrigger value="direct" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-none focus-visible:ring-0 font-semibold text-gray-500 dark:text-gray-400">直接添加</TabsTrigger>
                </TabsList>

                {/* 发送邀请标签内容 */}
                <TabsContent value="invite" className="pt-6 px-6">
                   <DialogTitle className="text-xl font-bold text-gray-800 dark:text-white mb-2">通过链接邀请您的学生</DialogTitle>
                   <DialogDescription className="text-gray-600 dark:text-gray-400 mb-6">
                     他们将创建或连接 DanZai 账户，并直接加入您的课堂。
                   </DialogDescription>
                   
                   {/* 邀请链接 */}
                   <div className="flex items-center space-x-2 mb-4 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                     <Input 
                       readOnly 
                       value={inviteLink} 
                       className="flex-1 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-700 dark:text-gray-300"
                     />
                     <Button variant="secondary" size="sm" onClick={() => copyToClipboard(inviteLink)}>
                       <CopyIcon className="w-4 h-4 mr-1"/> 复制链接
                     </Button>
                   </div>

                   {/* 分隔符 */}
                   <div className="flex items-center my-6">
                     <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                     <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400 text-sm">或者</span>
                     <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                   </div>

                   {/* 教室代码 */}
                   <p className="text-gray-600 dark:text-gray-400 mb-2 text-sm">让学生访问 DanZai.com/classroom 并输入教室代码</p>
                   <div className="flex items-center space-x-2 mb-6 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                     <Input 
                       readOnly 
                       value={inviteCode} 
                       className="w-24 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-700 dark:text-gray-300 font-mono tracking-widest"
                      />
                     <Button variant="secondary" size="sm" onClick={() => copyToClipboard(inviteCode)}>
                       <CopyIcon className="w-4 h-4 mr-1"/> 复制代码
                     </Button>
                   </div>
                </TabsContent>

                {/* 直接添加标签内容 - 暂空 */}
                <TabsContent value="direct" className="pt-6 px-6">
                    <p className="text-center text-gray-500 dark:text-gray-400 py-10">直接添加学生的功能将在此处实现。</p>
                </TabsContent>
             </Tabs>
          </DialogHeader>
          
          <DialogFooter className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600 flex justify-between items-center">
             <a href="#" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">需要帮助？下载详细说明。</a>
             <Button type="button" onClick={() => setIsInviteModalOpen(false)} className="bg-blue-500 hover:bg-blue-600">完成</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 