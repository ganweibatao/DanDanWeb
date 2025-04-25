import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { teacherService, StudentPayload } from '../../services/teacherApi';
import {
  PlusIcon,
  CheckCircleIcon,
  XIcon, // For Dialog close button
  CopyIcon, // For copy buttons
  ChevronDownIcon, // For dropdowns
  UploadIcon, // For export activity
  InfinityIcon, // For Unlimited Hearts
  EyeIcon, // For show password
  EyeOffIcon, // For hide password
  UsersIcon, // Re-added UsersIcon
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog"; // Import Dialog components
import { Input } from '../../components/ui/input'; // Input for link/code display
import { Textarea } from "../../components/ui/textarea"; // Import Textarea
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"; // Import DropdownMenu components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"; // Import Table components
import { useToast } from "../../hooks/use-toast"; // Import useToast - FIX: Use relative path
import { Toaster } from "../../components/ui/toaster"; // Import Toaster
// 引入新 hook
import { StudentDetailDrawer } from './StudentDetailDrawer';
import { TeacherSidebar } from './TeacherSidebar'; // Removed TeacherSidebarItem import
import { GRADE_CHOICES } from '../../lib/constants'; // Import GRADE_CHOICES
// Import Recharts components for Reports tab
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StudentTable } from './StudentTable'; // 添加 StudentTable 导入
// Import Select components from shadcn/ui
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { AppFooter } from '../../components/layout/SchoolFooter'; // Import the footer
import { ReportsTab } from './ReportsTab'; // Import the new component

// 类型定义
type SchoolViewId = 'students' | 'reports' | 'privacy' | 'new_class' | 'training' | 'forum' | 'feedback' | 'DanZai';

// Updated Student interface to match backend serializer + Frontend needs
export interface Student {
  id: number; // Backend uses integer ID
  user: number; // Backend user ID
  username: string;
  name?: string; // Use username if name not provided by backend initially
  email: string;
  avatar?: string | null; // Match backend model (ImageField can be null)
  avatarFallback: string; // Keep for frontend display logic
  // xp: number; // Remove XP if not directly in StudentSerializer
  level?: string; // Add level from StudentSerializer
  interests?: string; // Add interests
  learning_goal?: string; // Add learning_goal
  teacher?: number | null; // Teacher ID, can be null
  teacher_name?: string; // Add teacher_name
  gender?: 'male' | 'female' | 'other' | ''; // Allow empty string for form
  age?: number | null; // Allow null
  province?: string; // Add province
  city?: string; // Add city
  grade?: string | null; // Allow null from backend, but required in form? Adjust based on logic.
  phone_number?: string | null; // Allow null
  personality_traits?: string; // Match backend field name 'personality_traits'
  learning_hours?: number | undefined; // Allow undefined
  created_at?: string; // Add created_at
  updated_at?: string; // Add updated_at
}

// Add Type for Class Session Record (Moved from TeacherProfilePage)
// Moved to ReportsTab.tsx
// interface ClassSessionRecord { ... }

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

export const TeacherPage = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast(); // Initialize toast hook
  // 模拟用户数据
  const schoolUser = { username: "wBVua40q", avatarFallback: "W" };
  // 新增：当前活动的视图状态，优先读取 location.state.initialView
  const initialView = location.state?.initialView as SchoolViewId | undefined;
  const [activeView, setActiveView] = useState<SchoolViewId>(initialView || 'students');
  // 学生数据状态
  const [studentsData, setStudentsData] = useState<Student[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true); // Loading state
  const [fetchError, setFetchError] = useState<string | null>(null); // Error state

  // 弹窗状态
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  // 模拟是否有学生的状态 (用于切换显示步骤还是列表)
  const [hasStudents, setHasStudents] = useState(true); // Set to true to show the student list view
  // 抽屉状态
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // 新增：隐私设置开关状态
  const [enableForum, setEnableForum] = useState(false);
  const [enableEvents, setEnableEvents] = useState(false);
  const [enableSocial, setEnableSocial] = useState(false);

  // 新增：反馈相关状态
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState('general');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // 新增：直接添加学生相关状态
  const [isDirectAdding, setIsDirectAdding] = useState(false);
  // New state for individual fields
  const [directAddUsername, setDirectAddUsername] = useState('');
  const [directAddEmail, setDirectAddEmail] = useState('');
  const [directAddPassword, setDirectAddPassword] = useState('12345678'); // Set default password

  // New state for optional fields
  const [directAddGender, setDirectAddGender] = useState<'male' | 'female' | 'other' | '' > ('');
  const [directAddPhoneNumber, setDirectAddPhoneNumber] = useState('');

  // New state for age
  const [directAddAge, setDirectAddAge] = useState<string>(''); // Store age as string temporarily

  // Add grade state
  const [directAddGrade, setDirectAddGrade] = useState<string>('');

  // Add personality state
  const [directAddPersonality, setDirectAddPersonality] = useState('');

  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);

  // --- 新增：编辑学生相关状态 ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null); // 要编辑的学生数据
  const [editFormData, setEditFormData] = useState<Partial<StudentPayload>>({}); // 编辑表单数据
  const [isUpdatingStudent, setIsUpdatingStudent] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);
  const [showEditPassword, setShowEditPassword] = useState(false); // 编辑弹窗密码可见性

  // --- 新增：删除确认相关状态 ---
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeletingStudent, setIsDeletingStudent] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // --- Fetch Students Hook ---
  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoadingStudents(true);
      setFetchError(null);
      try {
        // Use the teacherService to fetch students
        const fetchedStudents: Student[] = await teacherService.fetchStudents();
        // 并发获取学习时长
        const learningHoursList = await teacherService.fetchStudentsLearningHours();
        const idToHours = Object.fromEntries(learningHoursList.map(item => [item.student_id, item.learning_hours]));
        // 合并学习时长到学生对象
        const mergedStudents = fetchedStudents.map(s => ({
          ...s,
          learning_hours: typeof idToHours[s.id] === 'number' ? idToHours[s.id] : 0.00
        }));
        setStudentsData(mergedStudents);
        setHasStudents(mergedStudents.length > 0); 
        // 新增：如果有学生，默认选中第一个学生
        if (mergedStudents.length > 0) {
          setSelectedStudent(mergedStudents[0]);
        } else {
          setSelectedStudent(null);
        }
      } catch (error: any) {
        console.error("Failed to fetch students:", error);
        setFetchError(error.message || "获取学生列表失败，请稍后重试。"); 
        setHasStudents(false); 
        setSelectedStudent(null); // 出错时不选中学生
      } finally {
        setIsLoadingStudents(false);
      }
    };

    fetchStudents();
    return undefined;
  }, []); // Empty dependency array ensures this runs only once on mount

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
  
  // 新增：处理直接添加学生的函数
  const handleDirectAdd = async () => { 
    if (!directAddUsername.trim() || !directAddEmail.trim() || !directAddPassword.trim() || !directAddGrade) {
      // Use toast for error
      toast({
        variant: "destructive",
        title: "添加失败",
        description: "请填写所有必填项(用户名、邮箱地址、初始密码和年级)",
      });
      return;
    }
    
    setIsDirectAdding(true);

    // Prepare payload using the fields from the state
    const studentPayload = {
        username: directAddUsername.trim(),
        email: directAddEmail.trim(),
        password: directAddPassword, 
        grade: directAddGrade,
        // Use parseInt for age, handle potential NaN
        age: directAddAge ? parseInt(directAddAge, 10) : null, 
        gender: directAddGender || undefined, // Send undefined if empty string
        phone_number: directAddPhoneNumber.trim() || null, // Send null if empty
        personality_traits: directAddPersonality.trim() || undefined, 
    };
    
    try {
        // Use teacherService to create the student
        const newStudent = await teacherService.createStudent(studentPayload); 

        // Add the new student to the list (processing like avatarFallback is now in the service)
        setStudentsData(prev => [...prev, newStudent]);
        setHasStudents(true); 
        
        setIsDirectAdding(false);
        
        // Show success toast
        toast({
          title: "添加成功",
          description: `学生 ${newStudent.username} 已成功添加！`,
        });

        // Reset form fields
        setDirectAddUsername('');
        setDirectAddEmail('');
        setDirectAddPassword('12345678'); 
        setDirectAddGender('');
        setDirectAddPhoneNumber('');
        setDirectAddAge('');
        setDirectAddGrade('');
        setDirectAddPersonality(''); 

        // Close the modal after a short delay to let user see the toast
        setTimeout(() => {
             setIsInviteModalOpen(false); // Close modal after success
        }, 1500); // Adjust delay as needed
        
    } catch (error: any) {
        console.error("Failed to add student:", error);
        setIsDirectAdding(false);
        
        // Show error toast
        toast({
          variant: "destructive",
          title: "添加失败",
          description: error.message || "添加学生失败，请检查信息或稍后重试。",
        });
    }
  };

  // --- 新增：确认删除学生的函数 ---
  const confirmRemoveStudent = async () => {
    if (!studentToDelete) return;

    setIsDeletingStudent(true);
    setDeleteError(null);

    try {
      // Call the teacherService to remove the student relationship
      await teacherService.removeStudent(studentToDelete.id);

      // Remove the student from the local state
      setStudentsData(prev => prev.filter(student => student.id !== studentToDelete.id));
      
      // Close detail view if the deleted student was selected
      if (selectedStudent?.id === studentToDelete.id) {
          setSelectedStudent(null);
      }

      console.log(`Successfully removed student ${studentToDelete.username}`);
      // Optional: Show a success toast message
      
      // Close the confirmation dialog
      setIsDeleteConfirmOpen(false);
      setStudentToDelete(null);

    } catch (error: any) {
      console.error("Failed to remove student:", error);
      // Error message is now likely coming from handleApiError/specific handling in teacherService
      setDeleteError(error.message || "移除学生失败，请稍后重试。");
    } finally {
      setIsDeletingStudent(false);
    }
  };

  // --- Compute conditional view flags before return ---
  const showStudentsReports = (['students', 'reports'] as SchoolViewId[]).includes(activeView); // Renamed and updated logic
  const showPrivacy = activeView === 'privacy';
  const showFeedback = activeView === 'feedback';
  const showDanbao = activeView === 'DanZai';
  const showTrainingForumPlaceholder = (['training', 'forum'] as SchoolViewId[]).includes(activeView);

  // --- 打开编辑弹窗并填充数据 ---
  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    // 初始化编辑表单数据 (排除密码，密码通常不预填充，而是单独设置或留空)
    setEditFormData({
      username: student.username,
      email: student.email,
      // name: student.name || '', // 如果后端支持 name 字段
      grade: student.grade || '',
      age: student.age ?? undefined, // 使用 undefined 或 null
      gender: student.gender || '',
      phone_number: student.phone_number || '',
      personality_traits: student.personality_traits || '',
      // 注意: 不应直接填充密码
    });
    setEditError(null);
    setEditSuccess(null);
    setIsEditModalOpen(true);
  };
  
  // --- 处理编辑表单字段变化 ---
  const handleEditFormChange = (field: keyof StudentPayload, value: string | number | null | undefined) => {
    setEditFormData((prev: Partial<StudentPayload>) => ({ ...prev, [field]: value })); // FIX: Added type for prev
    if (editError) setEditError(null); // 清除错误信息
  };

  // --- 处理更新学生的函数 ---
  const handleUpdateStudent = async () => {
    if (!editingStudent) return;

    // 验证 (与添加类似，但不一定需要密码)
    if (!editFormData.username?.trim() || !editFormData.email?.trim() || !editFormData.grade) {
      setEditError("请填写所有必填项 (用户名、邮箱地址和年级)");
      return;
    }

    setIsUpdatingStudent(true);
    setEditError(null);
    setEditSuccess(null);

    // 准备更新的 payload
    // 过滤掉未更改或不需要发送的字段（例如密码，除非用户输入了新密码）
    const updatePayload: Partial<StudentPayload> = {
      username: editFormData.username.trim(),
      email: editFormData.email.trim(),
      grade: editFormData.grade,
      age: editFormData.age ? parseInt(String(editFormData.age), 10) : null, // 转换为数字或 null
      gender: editFormData.gender || undefined,
      phone_number: editFormData.phone_number?.trim() || null,
      personality_traits: editFormData.personality_traits?.trim() || undefined,
      // 如果有输入新密码，则包含密码字段
      ...(editFormData.password && { password: editFormData.password }),
      // 可能还需要包含 name 字段
      // ...(editFormData.name && { name: editFormData.name.trim() }),
    };

    try {
      // 调用 service 更新学生信息
      const updatedStudentData = await teacherService.updateStudent(editingStudent.id, updatePayload);

      // 更新本地学生列表
      setStudentsData(prev => 
        prev.map(student => 
          student.id === editingStudent.id ? updatedStudentData : student
        )
      );
      
      // 如果当前选中的学生就是正在编辑的学生，更新选中状态
      if (selectedStudent?.id === editingStudent.id) {
        setSelectedStudent(updatedStudentData);
      }

      setIsUpdatingStudent(false);
      setEditSuccess(`成功更新学生 ${updatedStudentData.username}！`);

      // 3秒后关闭弹窗并清除成功信息
      setTimeout(() => {
        setEditSuccess(null);
        setIsEditModalOpen(false);
        setEditingStudent(null); // 清除正在编辑的学生状态
      }, 3000);

    } catch (error: any) {
      console.error("Failed to update student:", error);
      setEditError(error.message || "更新学生失败，请检查信息或稍后重试。");
      setIsUpdatingStudent(false);
    }
  };

  return (
    <>
      <div className="flex bg-gray-100 dark:bg-gray-900 font-sans h-screen overflow-hidden">
        {/* 使用 TeacherSidebar - Apply styles from Sidebar.tsx */}
        <TeacherSidebar
          activeView={activeView}
          setActiveView={(viewId: string) => setActiveView(viewId as SchoolViewId)}
          user={schoolUser}
          // Removed sidebarItems prop
        />

        {/* 主内容区域 - Use pre-computed flags */}
        <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-gray-50 dark:bg-gray-900">

           { showStudentsReports && ( // Updated variable name
             <div className="flex flex-col h-full">
               {/* Header for Students/Reports */} {/* Updated comment */}
               <header className="flex items-center justify-between px-10 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 rounded-t-xl"> {/* Added rounded-t-xl */}
              <div className="flex items-center">
                 <span className="text-xl font-semibold text-gray-800 dark:text-white">我的学生</span>
              </div>
           </header>

               {/* Tabs Content Area - Increased padding */}
               <div className="p-8 md:p-12 flex-grow overflow-y-auto"> {/* Increased padding p-8 md:p-12 */}
                  <Tabs 
                    value={activeView} 
                    onValueChange={(value) => setActiveView(value as SchoolViewId)} // Fix: Cast value to SchoolViewId
                    className="w-full h-full flex flex-col"
                  >
                    <TabsList className="mb-6 flex-shrink-0 w-fit bg-gray-100 dark:bg-gray-700 rounded-lg p-1"> {/* Added bg, rounded-lg, p-1 */}
                      {/* Corrected value props - Apply rounded style to triggers */}
                      <TabsTrigger value="students" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm">学生</TabsTrigger> {/* Added rounded-md and active styles */}
                      <TabsTrigger value="reports" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm">报告</TabsTrigger> {/* Added rounded-md and active styles */}
                 </TabsList>

                    {/* Tab Content Panes - Add background and rounding */}
                    <TabsContent value="students" className="flex-grow mt-0 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"> { /* Added bg, rounded-xl, shadow, p-6 */}
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
                                    <DropdownMenuItem 
                                      className="py-3 px-4 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 focus:text-red-600 dark:focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-900/20 cursor-pointer justify-center text-sm"
                                      onClick={() => {
                                        if (selectedStudent) {
                                          setStudentToDelete(selectedStudent); // 设置要删除的学生
                                          setIsDeleteConfirmOpen(true); // 打开确认弹窗
                                          setDeleteError(null); // 清除之前的错误信息
                                        }
                                      }}
                                      disabled={!selectedStudent} // Disable if no student is selected (though menu won't show)
                                    >
                                       删除学生
                                     </DropdownMenuItem>
                             </DropdownMenuContent>
                           </DropdownMenu>
                         </div>
                       </div>

                            {/* Remove overflow-y-auto from this div, keep flex-grow */}
                            <div className="flex-grow rounded-lg bg-white dark:bg-gray-800 shadow-sm"> 
                              {/* Replace the direct table rendering with the StudentTable component */}
                               <StudentTable
                                 students={studentsData}
                                 selectedStudent={selectedStudent}
                                 onSelectStudent={handleStudentRowClick}
                                 isLoading={isLoadingStudents}
                                 fetchError={fetchError}
                               />
                            </div>
                       </div>

                          {/* Right side - Student Detail */}
                          <aside className="w-80 flex-shrink-0">
                            {selectedStudent ? (
                              <StudentDetailDrawer
                                selectedStudent={selectedStudent}
                                onClose={handleCloseStudentDetail}
                                onEdit={() => handleOpenEditModal(selectedStudent)}
                                onDelete={() => {
                                  setStudentToDelete(selectedStudent);
                                  setIsDeleteConfirmOpen(true);
                                  setDeleteError(null);
                                }}
                                onStartTeaching={() => {
                                  if (selectedStudent) {
                                    navigate(`/students/${selectedStudent.id}`);
                                  }
                                }}
                              />
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

                  {/* --- Reports Tab Content (Ensure only ReportsTab component is rendered) --- */}
                  <TabsContent value="reports" className="mt-0 flex-grow">
                    {/* Render the new component, pass necessary props */}
                    {/* Pass only studentsData as other state is managed internally */}
                    <ReportsTab studentsData={studentsData} />
                  </TabsContent>

                 </Tabs>
               </div> {/* Closing tag for the Tabs Content Area div */}
             </div> // Closing tag for the showStudentsReports div
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

             {/* --- 反馈视图 --- */}
             { showFeedback && (
               <div className="flex flex-col h-full">
                 {/* 反馈页面头部 */}
                 <header className="flex items-center justify-between px-10 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                   <div className="flex items-center">
                     <h1 className="text-xl font-semibold text-gray-800 dark:text-white">向DanZai团队发送反馈</h1>
                   </div>
                 </header>

                 {/* 反馈内容区域 */}
                 <div className="flex-grow p-10 overflow-y-auto">
                   <div className="max-w-2xl mx-auto">
                     {!feedbackSubmitted ? (
                       <div className="space-y-6">
                         <p className="text-gray-600 dark:text-gray-400">
                           我们非常重视您的意见！请告诉我们您的想法，以帮助我们改进DanZai教师版平台。
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
                    {/* Simplified title based on activeView */} 
                    {activeView.charAt(0).toUpperCase() + activeView.slice(1)} 
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400">
                    {activeView === 'forum'
                      ? '教师论坛内容待实现，敬请期待！'
                      : `${activeView.charAt(0).toUpperCase() + activeView.slice(1)} 视图内容待实现。` // Use capitalized activeView
                    }
                  </p>
               </div>
             )}

          </main> {/* Closing tag for main */}

          {/* Dialogs and Toaster should be siblings to main, inside the main div */}
          {/* 添加学生邀请弹窗 */}
          <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
            {/* <DialogTrigger>不需要，因为我们手动控制 open 状态</DialogTrigger> */}
            <DialogContent className="sm:max-w-[550px] bg-white dark:bg-gray-800 p-0"> {/* Adjusted width */}
              <DialogHeader className="p-6 pb-4 border-b border-gray-200 dark:border-gray-700"> {/* Added border */}
                 {/* 自定义关闭按钮 */}
                 <button
                   type="button"
                   onClick={() => setIsInviteModalOpen(false)}
                   className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                 >
                   <XIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                   <span className="sr-only">Close</span>
                 </button>
                 {/* 移除 TabsList */}
                 {/* <Tabs defaultValue="invite" className="w-full"> ... </Tabs> */}
                 <DialogTitle className="text-xl font-bold text-gray-800 dark:text-white">添加待拯救的学生</DialogTitle>
              </DialogHeader>
              
              {/* 直接添加内容区域 */}
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto"> {/* Add max-height and scroll */}
                {/* Username Input */}
                <div>
                  <label htmlFor="directAddUsername" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    用户名 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="directAddUsername"
                    value={directAddUsername}
                    onChange={(e) => {
                      setDirectAddUsername(e.target.value);
                    }}
                    placeholder="请输入用户名"
                    className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    disabled={isDirectAdding}
                  />
                </div>

                {/* Email Input */}
                <div>
                  <label htmlFor="directAddEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    邮箱地址 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="directAddEmail"
                    type="email"
                    value={directAddEmail}
                    onChange={(e) => {
                      setDirectAddEmail(e.target.value);
                    }}
                    placeholder="请输入邮箱地址"
                    className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    disabled={isDirectAdding}
                  />
                </div>

                {/* Password Input */}
                <div>
                  <label htmlFor="directAddPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    初始密码 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      id="directAddPassword"
                      type={showPassword ? 'text' : 'password'} // Toggle type based on state
                      value={directAddPassword}
                      onChange={(e) => {
                        setDirectAddPassword(e.target.value);
                      }}
                      placeholder="设置一个初始密码"
                      className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 pr-10" // Add padding for the icon
                      disabled={isDirectAdding}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute inset-y-0 right-0 h-full px-3 text-gray-500 dark:text-gray-400 hover:bg-transparent dark:hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "隐藏密码" : "显示密码"}
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Grade Select (Required) - Add before age select */}
                <div>
                  <label htmlFor="directAddGrade" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    年级 <span className="text-red-500">*</span>
                  </label>
                  <Select 
                    value={directAddGrade} 
                    onValueChange={setDirectAddGrade} 
                    disabled={isDirectAdding}
                  >
                    <SelectTrigger 
                      id="directAddGrade" 
                      className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    >
                      <SelectValue placeholder="选择年级" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      {GRADE_CHOICES.map(grade => (
                        <SelectItem key={grade.value} value={grade.value}>
                          {grade.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Age Select */}
                <div>
                  <label htmlFor="directAddAge" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">年龄 (可选)</label>
                  <Select value={directAddAge} onValueChange={setDirectAddAge} disabled={isDirectAdding}>
                    <SelectTrigger id="directAddAge" className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                      <SelectValue placeholder="选择年龄" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto"> {/* Add max-height and scroll */}
                      {/* Generate age options, e.g., 5 to 80 */}
                      {Array.from({ length: 76 }, (_, i) => i + 5).map(age => (
                        <SelectItem key={age} value={String(age)}>{age} 岁</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Gender Select */}
                <div>
                  <label htmlFor="directAddGender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">性别 (可选)</label>
                  <Select value={directAddGender} onValueChange={(value) => setDirectAddGender(value as 'male' | 'female' | 'other' | '')}>
                    <SelectTrigger id="directAddGender" className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                      <SelectValue placeholder="选择性别" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">男</SelectItem>
                      <SelectItem value="female">女</SelectItem>
                      <SelectItem value="other">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Phone Number Input */}
                <div>
                  <label htmlFor="directAddPhoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">电话号码 (可选)</label>
                  <Input
                    id="directAddPhoneNumber"
                    type="tel"
                    value={directAddPhoneNumber}
                    onChange={(e) => {
                      setDirectAddPhoneNumber(e.target.value);
                    }}
                    placeholder="例如: 123-456-7890"
                    className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    disabled={isDirectAdding}
                  />
                </div>

                {/* Personality Input */}
                <div>
                  <label htmlFor="directAddPersonality" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">性格特点 (可选)</label>
                  <Textarea
                    id="directAddPersonality"
                    value={directAddPersonality}
                    onChange={(e) => {
                      setDirectAddPersonality(e.target.value);
                    }}
                    placeholder="描述学生的性格特点，例如：开朗、认真、马虎、害羞等，进行针对教学"
                    className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 resize-none"
                    rows={3}
                    disabled={isDirectAdding}
                  />
                </div>
              </div>

              <DialogFooter className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600 flex justify-end"> {/* Adjusted footer */}
                 {/* <a href="#" className="text-sm text-blue-600 dark:text-blue-400 hover:underline mr-auto">需要帮助？</a> Removed help link */}
                 <Button 
                   type="button" 
                   onClick={() => {
                     setIsInviteModalOpen(false);
                     setDirectAddUsername('');
                     setDirectAddEmail('');
                     setDirectAddPassword('');
                     setDirectAddGender('');
                     setDirectAddPhoneNumber('');
                     setDirectAddAge(''); // Reset age on cancel
                   }} 
                   variant="outline" 
                   className="mr-2"
                   disabled={isDirectAdding}
                 >
                   取消
                 </Button>
                 <Button 
                   type="button" 
                   onClick={handleDirectAdd} 
                   className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50"
                   disabled={isDirectAdding || !directAddUsername.trim() || !directAddEmail.trim() || !directAddPassword.trim() || !directAddGrade} // Add grade validation
                 >
                   {isDirectAdding ? '添加中...' : '添加学生'}
                 </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* --- 新增：编辑学生弹窗 --- */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="sm:max-w-[550px] bg-white dark:bg-gray-800 p-0">
              <DialogHeader className="p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                 <button
                   type="button"
                   onClick={() => setIsEditModalOpen(false)}
                   className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                   disabled={isUpdatingStudent}
                 >
                   <XIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                   <span className="sr-only">Close</span>
                 </button>
                 <DialogTitle className="text-xl font-bold text-gray-800 dark:text-white">编辑学生信息</DialogTitle>
                 {editingStudent && <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">正在编辑 {editingStudent.username}</DialogDescription>}
              </DialogHeader>
              
              {/* 编辑表单内容区域 */}
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {/* Username Input */}
                <div>
                  <label htmlFor="editUsername" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    用户名 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="editUsername"
                    value={editFormData.username || ''}
                    onChange={(e) => handleEditFormChange('username', e.target.value)}
                    placeholder="请输入用户名"
                    className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    disabled={isUpdatingStudent}
                  />
                </div>

                {/* Email Input */}
                <div>
                  <label htmlFor="editEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    邮箱地址 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="editEmail"
                    type="email"
                    value={editFormData.email || ''}
                    onChange={(e) => handleEditFormChange('email', e.target.value)}
                    placeholder="请输入邮箱地址"
                    className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    disabled={isUpdatingStudent}
                  />
                </div>
                
                {/* Password Input (Optional) */}
                <div>
                  <label htmlFor="editPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    新密码 (可选, 留空则不修改)
                  </label>
                  <div className="relative">
                    <Input
                      id="editPassword"
                      type={showEditPassword ? 'text' : 'password'} 
                      value={editFormData.password || ''} // 使用 editFormData 中的 password
                      onChange={(e) => handleEditFormChange('password', e.target.value)}
                      placeholder="输入新密码以修改"
                      className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 pr-10" 
                      disabled={isUpdatingStudent}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute inset-y-0 right-0 h-full px-3 text-gray-500 dark:text-gray-400 hover:bg-transparent dark:hover:bg-transparent"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      aria-label={showEditPassword ? "隐藏密码" : "显示密码"}
                    >
                      {showEditPassword ? (
                        <EyeOffIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Grade Select (Required) */}
                <div>
                  <label htmlFor="editGrade" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    年级 <span className="text-red-500">*</span>
                  </label>
                  <Select 
                    value={editFormData.grade || ''} 
                    onValueChange={(value) => handleEditFormChange('grade', value)} 
                    disabled={isUpdatingStudent}
                  >
                    <SelectTrigger 
                      id="editGrade" 
                      className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    >
                      <SelectValue placeholder="选择年级" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      {GRADE_CHOICES.map(grade => (
                        <SelectItem key={grade.value} value={grade.value}>
                          {grade.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Age Select */}
                <div>
                  <label htmlFor="editAge" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">年龄 (可选)</label>
                  <Select 
                    value={editFormData.age ? String(editFormData.age) : ''} // 确保 value 是 string 或 undefined
                    onValueChange={(value) => handleEditFormChange('age', value ? parseInt(value, 10) : undefined)} // 转换回 number 或 undefined
                    disabled={isUpdatingStudent}
                  >
                    <SelectTrigger id="editAge" className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                      <SelectValue placeholder="选择年龄" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      {Array.from({ length: 76 }, (_, i) => i + 5).map(age => (
                        <SelectItem key={age} value={String(age)}>{age} 岁</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Gender Select */}
                <div>
                  <label htmlFor="editGender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">性别 (可选)</label>
                  <Select 
                     value={editFormData.gender || ''} 
                     onValueChange={(value) => handleEditFormChange('gender', value as 'male' | 'female' | 'other' | '')}
                     disabled={isUpdatingStudent}
                   >
                    <SelectTrigger id="editGender" className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                      <SelectValue placeholder="选择性别" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">男</SelectItem>
                      <SelectItem value="female">女</SelectItem>
                      <SelectItem value="other">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Phone Number Input */}
                <div>
                  <label htmlFor="editPhoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">电话号码 (可选)</label>
                  <Input
                    id="editPhoneNumber"
                    type="tel"
                    value={editFormData.phone_number || ''}
                    onChange={(e) => handleEditFormChange('phone_number', e.target.value)}
                    placeholder="例如: 123-456-7890"
                    className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    disabled={isUpdatingStudent}
                  />
                </div>

                {/* Personality Input */}
                <div>
                  <label htmlFor="editPersonality" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">性格特点 (可选)</label>
                  <Textarea
                    id="editPersonality"
                    value={editFormData.personality_traits || ''}
                    onChange={(e) => handleEditFormChange('personality_traits', e.target.value)}
                    placeholder="描述学生的性格特点..."
                    className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 resize-none"
                    rows={3}
                    disabled={isUpdatingStudent}
                  />
                </div>

                  {editError && <p className="text-sm text-red-600 dark:text-red-500">{editError}</p>}
                  {editSuccess && <p className="text-sm text-green-600 dark:text-green-500">{editSuccess}</p>}
              </div>
              
              <DialogFooter className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600 flex justify-end">
                 <Button 
                   type="button" 
                   onClick={() => setIsEditModalOpen(false)} 
                   variant="outline" 
                   className="mr-2"
                   disabled={isUpdatingStudent} // 禁用取消按钮当正在更新时
                 >
                   取消
                 </Button>
                 <Button 
                   type="button" 
                   onClick={handleUpdateStudent} 
                   className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50"
                   disabled={isUpdatingStudent || !editFormData.username?.trim() || !editFormData.email?.trim() || !editFormData.grade} // 验证必填项
                 >
                   {isUpdatingStudent ? '更新中...' : '保存更改'}
                 </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
 
           {/* --- 新增：确认删除学生弹窗 --- */}
           <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
            {/* ... dialog content: Removed for brevity, assume it's correct ... */}
            <DialogContent className="sm:max-w-[450px] bg-white dark:bg-gray-800 p-0">
               <DialogHeader className="p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                 <button
                   type="button"
                   onClick={() => setIsDeleteConfirmOpen(false)}
                   className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                   disabled={isDeletingStudent}
                 >
                   <XIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                   <span className="sr-only">Close</span>
                 </button>
                 <DialogTitle className="text-xl font-bold text-gray-800 dark:text-white">确认移除学生</DialogTitle>
               </DialogHeader>
               
               <div className="p-6 space-y-4">
                 {studentToDelete && (
                   <p className="text-sm text-gray-600 dark:text-gray-400">
                     您确定要从班级中移除学生 <strong className="font-semibold text-gray-800 dark:text-gray-200">{studentToDelete.username}</strong> 吗？
                     <br />
                     此操作仅解除师生关系，不会删除该学生的 DanZai 账户。
                   </p>
                 )}
                 {deleteError && <p className="text-sm text-red-600 dark:text-red-500">{deleteError}</p>}
               </div>
               
               <DialogFooter className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600 flex justify-end">
                 <Button 
                   type="button" 
                   onClick={() => setIsDeleteConfirmOpen(false)} 
                   variant="outline" 
                   className="mr-2"
                   disabled={isDeletingStudent}
                 >
                   取消
                 </Button>
                 <Button 
                   type="button" 
                   onClick={confirmRemoveStudent} 
                   variant="destructive" // 使用 destructive 变体以突出危险操作
                   className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 disabled:opacity-50"
                   disabled={isDeletingStudent}
                 >
                   {isDeletingStudent ? '移除中...' : '确认移除'}
                 </Button>
               </DialogFooter>
             </DialogContent>
           </Dialog>
 
         {/* Add the Toaster component here */}
         <Toaster /> 

      </div> {/* Closing tag for the outer flex div */}
    </> /* Closing tag for the main Fragment */
     );
   };