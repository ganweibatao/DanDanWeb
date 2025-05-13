import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchStudentProfile, StudentProfile, updateStudentProfile } from '../services/studentApi';
import { provinces } from '../lib/chinaRegions';
// import { useTheme } from '../context/ThemeContext'; // Removed unused import
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input'; // Import Input
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog"; // Use relative path for Dialog components
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'; // 引入Select组件
import {
  HomeIcon, 
  UsersIcon, 
  StarIcon, 
  ZapIcon, 
  ShoppingCartIcon, 
  UserCircleIcon, 
  MoreHorizontalIcon,
  Edit3Icon,       // For edit button
  FlameIcon,       // For streak
  GemIcon,         // For gems/lingots (alternative: Diamond)
  BookOpenIcon,    // For words learned
  HeartIcon,       // For lives
  GiftIcon,        // For invite friends
  ChevronRightIcon, // For invite friends link
  CopyIcon,        // For copy link button
  Settings,        // For settings icon
  User            // For user icon
} from 'lucide-react';
import { Sidebar } from './Students/StudentsSidebar'; // Import Sidebar
import { SidebarFooterLinks } from '../components/layout/SidebarFooterLinks'; // Import SidebarFooterLinks
import { ProfileSidebar } from '../components/layout/ProfileSidebar'; // Import the new ProfileSidebar
import { gradeMap } from '../lib/constants'; // Import gradeMap
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, LabelList
} from 'recharts'; // Updated Recharts imports for ComposedChart and Line

type EditableUserData = {
  username: string;
  handle: string;
  gender: string;
  age: number;
  grade: string;
  province: string;
  city: string;
  avatar?: File | null;
};

// 性别和年级映射
const genderMap: Record<string, string> = { male: '男', female: '女', other: '其他' };

export const ProfilePage = (): JSX.Element => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { studentId } = useParams();
  
  // 获取学生信息
  const { data: userData, isLoading, isError } = useQuery<StudentProfile>({
    queryKey: ['studentProfile', studentId],
    queryFn: () => fetchStudentProfile(studentId!),
    enabled: !!studentId,
  });
  
  // 编辑状态
  const [isEditing, setIsEditing] = useState(false);
  // 用于编辑的临时数据状态
  const [editedData, setEditedData] = useState<EditableUserData | null>(null);

  // 头像预览
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  // 选中的省份和城市
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');

  // 头像选择
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditedData(prev => prev ? { ...prev, avatar: file } : prev);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // 当userData变化时，初始化编辑数据
  useEffect(() => {
    if (userData) {
      // gender/grade转为中文label
      let genderLabel = userData.gender;
      if (genderLabel === 'male') genderLabel = '男';
      else if (genderLabel === 'female') genderLabel = '女';
      else if (genderLabel === 'other') genderLabel = '其他';
      let gradeLabel = gradeMap[userData.grade || ''] || userData.grade || '';
      setEditedData({
        username: userData.username || '',
        handle: userData.email || '', // 暂用email做真实姓名
        gender: genderLabel || '',
        age: userData.age || 0,
        grade: gradeLabel,
        province: userData.province || '',
        city: userData.city || '',
      });
      setSelectedProvince(userData.province || '');
      setSelectedCity(userData.city || '');
    }
  }, [userData]);

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedData(prev => prev ? { ...prev, [name]: value } : prev);
  };

  // 处理年龄输入变化 (确保是数字)
  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) { 
      setEditedData(prev => prev ? { ...prev, age: value === '' ? 0 : parseInt(value, 10) } : prev);
    }
  };

  // 开始编辑
  const handleEdit = () => {
    if (userData) {
    setEditedData({
        username: userData.username || '',
        handle: userData.email || '',
        gender: userData.gender || '',
        age: userData.age || 0,
        grade: userData.grade || '',
        province: userData.province || '',
        city: userData.city || '',
      });
      setSelectedProvince(userData.province || '');
      setSelectedCity(userData.city || '');
    setIsEditing(true);
    }
  };

  // 保存编辑
  const handleSave = async () => {
    if (!editedData || !studentId) return;

    // gender、grade需转为后端值
    let gender = editedData.gender;
    if (gender === '男') gender = 'male';
    else if (gender === '女') gender = 'female';
    else if (gender === '其他') gender = 'other';

    let grade = Object.keys(gradeMap).find(key => gradeMap[key] === editedData.grade) || editedData.grade;

    // 构造payload
    const payload: any = {
      username: editedData.username,
      email: editedData.handle,
      gender,
      age: editedData.age,
      grade,
      province: selectedProvince,
      city: selectedCity,
    };
    if (editedData.avatar) payload.avatar = editedData.avatar;
    try {
      await updateStudentProfile(studentId, payload);
    setIsEditing(false);
      setAvatarPreview(null);
      // 刷新数据 (改用 invalidateQueries)
      queryClient.invalidateQueries({ queryKey: ['studentProfile', studentId] });
    } catch (e) {
      alert('保存失败');
    }
  };

  // 取消编辑
  const handleCancel = () => {
    setIsEditing(false);
  };

  // Placeholder flags (replace with actual flag components/images later)
  const FlagPlaceholder = ({ countryCode }: { countryCode: string }) => (
    <div className="w-8 h-5 rounded-sm bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
      {countryCode}
    </div>
  );

  if (isLoading) return <div>加载中...</div>;
  if (isError || !userData) return <div>未找到学生信息</div>;

  // 统计数据（后端暂未返回，先用0或userData.id等占位）
  const stats = {
    streak: 0,
    xp: 0,
    gems: 0,
    wordsLearned: 0,
    lives: 0,
  };

  // Mock data for learning activity (replace with actual data fetching) - Expanded to ~30 days
  const learningActivityLast30Days = [
    { listName: "核心词汇单元 20", date: "10-28", durationMinutes: 48, wordCount: 22, correctAnswers: 19, totalQuestionsInSession: 22 },
    { listName: "商务英语单元 B", date: "10-27", durationMinutes: 55, wordCount: 25, correctAnswers: 22, totalQuestionsInSession: 25 },
    // Skipped 10-26
    { listName: "旅行常用语 Part 2", date: "10-25", durationMinutes: 35, wordCount: 18, correctAnswers: 15, totalQuestionsInSession: 18 },
    { listName: "学术词汇复习", date: "10-24", durationMinutes: 70, wordCount: 30, correctAnswers: 27, totalQuestionsInSession: 30 },
    { listName: "日常生活对话 II", date: "10-23", durationMinutes: 42, wordCount: 20, correctAnswers: 16, totalQuestionsInSession: 20 },
    { listName: "核心词汇单元 19", date: "10-22", durationMinutes: 58, wordCount: 28, correctAnswers: 25, totalQuestionsInSession: 28 },
    { listName: "商务邮件", date: "10-21", durationMinutes: 65, wordCount: 26, correctAnswers: 21, totalQuestionsInSession: 26 },
    // Skipped 10-20
    { listName: "餐厅点餐", date: "10-19", durationMinutes: 28, wordCount: 15, correctAnswers: 14, totalQuestionsInSession: 15 },
    { listName: "科技词汇", date: "10-18", durationMinutes: 80, wordCount: 35, correctAnswers: 30, totalQuestionsInSession: 35 },
    { listName: "购物用语", date: "10-17", durationMinutes: 52, wordCount: 24, correctAnswers: 22, totalQuestionsInSession: 24 },
    { listName: "核心词汇单元 18", date: "10-16", durationMinutes: 45, wordCount: 21, correctAnswers: 18, totalQuestionsInSession: 21 },
    { listName: "面试英语", date: "10-15", durationMinutes: 75, wordCount: 32, correctAnswers: 28, totalQuestionsInSession: 32 },
    // Skipped 10-14
    { listName: "问路与交通", date: "10-13", durationMinutes: 33, wordCount: 17, correctAnswers: 15, totalQuestionsInSession: 17 },
    { listName: "环境科学词汇", date: "10-12", durationMinutes: 68, wordCount: 29, correctAnswers: 24, totalQuestionsInSession: 29 },
    { listName: "健康与医疗", date: "10-11", durationMinutes: 49, wordCount: 23, correctAnswers: 20, totalQuestionsInSession: 23 },
    { listName: "核心词汇单元 17", date: "10-10", durationMinutes: 53, wordCount: 26, correctAnswers: 23, totalQuestionsInSession: 26 },
    { listName: "项目管理术语", date: "10-09", durationMinutes: 62, wordCount: 27, correctAnswers: 25, totalQuestionsInSession: 27 },
    // Skipped 10-08
    { listName: "兴趣爱好讨论", date: "10-07", durationMinutes: 40, wordCount: 19, correctAnswers: 17, totalQuestionsInSession: 19 },
    { listName: "法律基础词汇", date: "10-06", durationMinutes: 85, wordCount: 38, correctAnswers: 32, totalQuestionsInSession: 38 },
    { listName: "社交媒体用语", date: "10-05", durationMinutes: 46, wordCount: 20, correctAnswers: 18, totalQuestionsInSession: 20 },
    { listName: "核心词汇单元 16", date: "10-04", durationMinutes: 50, wordCount: 24, correctAnswers: 21, totalQuestionsInSession: 24 },
    { listName: "财务报告词汇", date: "10-03", durationMinutes: 72, wordCount: 31, correctAnswers: 29, totalQuestionsInSession: 31 },
    // Skipped 10-02
    { listName: "预定酒店", date: "10-01", durationMinutes: 30, wordCount: 16, correctAnswers: 14, totalQuestionsInSession: 16 },
    { listName: "艺术与文化", date: "09-30", durationMinutes: 66, wordCount: 28, correctAnswers: 23, totalQuestionsInSession: 28 },
    { listName: "天气与季节", date: "09-29", durationMinutes: 44, wordCount: 22, correctAnswers: 20, totalQuestionsInSession: 22 },
    { listName: "核心词汇单元 15", date: "09-28", durationMinutes: 59, wordCount: 29, correctAnswers: 26, totalQuestionsInSession: 29 },
    { listName: "客户服务对话", date: "09-27", durationMinutes: 61, wordCount: 25, correctAnswers: 22, totalQuestionsInSession: 25 },
    // Skipped 09-26
    { listName: "紧急情况应对", date: "09-25", durationMinutes: 38, wordCount: 18, correctAnswers: 16, totalQuestionsInSession: 18 },
    { listName: "历史事件词汇", date: "09-24", durationMinutes: 77, wordCount: 33, correctAnswers: 28, totalQuestionsInSession: 33 },
    // Removed one extra entry to make it exactly 30
  ];

  // Calculate overall average accuracy
  const totalCorrectAnswers = learningActivityLast30Days.reduce((sum, item) => sum + item.correctAnswers, 0);
  const totalQuestionsAttempted = learningActivityLast30Days.reduce((sum, item) => sum + item.totalQuestionsInSession, 0);
  const overallAverageAccuracy = totalQuestionsAttempted > 0 ? (totalCorrectAnswers / totalQuestionsAttempted * 100).toFixed(1) : "0.0";

  // Calculate averages
  const totalDurationMinutes = learningActivityLast30Days.reduce((sum, item) => sum + item.durationMinutes, 0);
  const totalWordCount = learningActivityLast30Days.reduce((sum, item) => sum + item.wordCount, 0);
  const numberOfLists = learningActivityLast30Days.length;

  const avgDurationPerList = numberOfLists > 0 ? (totalDurationMinutes / numberOfLists).toFixed(1) : "0.0";
  const avgDurationPerWord = totalWordCount > 0 ? (totalDurationMinutes / totalWordCount).toFixed(1) : "0.0";

  // Chart data format
  const chartData = learningActivityLast30Days.slice().reverse().map(item => ({
    name: item.date, // X-axis will use the date
    listName: item.listName, // For tooltip
    学习时长: item.durationMinutes,
    单词数: item.wordCount, // Keep for tooltip
    每词时长: item.wordCount > 0 ? parseFloat((item.durationMinutes / item.wordCount).toFixed(2)) : 0,
    单次学习正确率: item.totalQuestionsInSession > 0 ? parseFloat((item.correctAnswers / item.totalQuestionsInSession * 100).toFixed(1)) : 0,
  }));

  // Define an interface for the structure of objects in chartData for Tooltip payload typing
  interface LearningChartData {
    name: string; // This is the date for the X-axis
    listName: string;
    学习时长: number;
    单词数: number;
    每词时长: number;
    单次学习正确率: number;
  }

  // Custom Tooltip Component with explicit types
  const CustomTooltip = ({
    active, payload, label
  }: {
    active?: boolean;
    payload?: Array<{
      name: string; // Series name e.g., "学习时长"
      value: number; // Value of the series at this point
      color: string; // Color of the series
      dataKey: keyof LearningChartData; // e.g., "学习时长"
      payload: LearningChartData; // The entire data object for this x-axis point
    }>;
    label?: string; // The x-axis label (date)
  }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload; // The full data object for this x-axis point

      return (
        <div className="bg-white dark:bg-gray-800 p-3 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 text-sm">
          <p className="text-gray-600 dark:text-gray-400 font-semibold">{`日期: ${label}`}</p>
          <p className="text-gray-800 dark:text-gray-100 mb-1">{`学习内容: ${dataPoint.listName}`}</p>
          <p style={{ color: payload.find(p => p.dataKey === '学习时长')?.color || '#8884d8' }}>{`学习时长: ${dataPoint.学习时长} 分`}</p>
          <p className="text-gray-700 dark:text-gray-300">{`单词数: ${dataPoint.单词数} 个`}</p>
          <p style={{ color: payload.find(p => p.dataKey === '每词时长')?.color || '#82ca9d' }}>{`平均每词用时: ${dataPoint.每词时长.toFixed(2)} 分钟/词`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 font-sans">
      <Sidebar /> {/* Use the shared Sidebar component */}

      {/* Main Content Area */}
      <main className="flex-1 p-10 overflow-y-auto bg-gray-50 dark:bg-gray-800 scrollbar-hide">
        {/* Profile Header */}
        {/* The entire div block for the profile header, starting with className="relative bg-white dark:bg-gray-700..." and its content will be removed. */}
        {/* Statistics Section */}
        <h2 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-200">学习统计</h2>

        {/* New Learning Activity Chart Section */}
        <Card className="bg-white dark:bg-gray-700 shadow rounded-lg mt-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              近30日学习时长与效率
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer>
                <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-90}
                    textAnchor="end" 
                    height={60}
                    interval={0}
                    tick={{ fontSize: 9 }}
                  />
                  <YAxis yAxisId="left" stroke="#8884d8" label={{ value: '时长 (分)', angle: -90, position: 'insideLeft', offset: 10, fill: '#8884d8' }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" label={{ value: '分/词', angle: -90, position: 'insideRight', offset: -5, fill: '#82ca9d' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar yAxisId="left" dataKey="学习时长" name="学习时长" fill="#8884d8" barSize={30}>
                    <LabelList dataKey="学习时长" position="top" style={{ fill: '#8884d8', fontSize: '10px' }} />
                  </Bar>
                  <Line yAxisId="right" type="monotone" dataKey="每词时长" name="每词时长" stroke="#82ca9d">
                    <LabelList dataKey="每词时长" position="top" style={{ fill: '#82ca9d', fontSize: '10px' }} formatter={(value: number, index: number) => index % 2 === 0 ? value.toFixed(2) : null} />
                  </Line>
                </ComposedChart>
              </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

        {/* Accuracy Trend Chart Card */}
        <Card className="bg-white dark:bg-gray-700 shadow rounded-lg mt-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-200">近30日正确率</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div style={{ width: '100%', height: 270 }}>
              <ResponsiveContainer>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-90}
                    textAnchor="end" 
                    height={60}
                    interval={0}
                    tick={{ fontSize: 9 }}
                  />
                  <YAxis domain={[0, 100]} allowDataOverflow={true} tickFormatter={(value) => `${value}%`} />
                  <Tooltip formatter={(value: number, name: string) => [`${value}%`, name.replace("单次学习正确率", "正确率")]} />
                  <Legend formatter={(value) => value.replace("单次学习正确率", "正确率")} />
                  <Line type="monotone" dataKey="单次学习正确率" stroke="#ffc658" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }}>
                    <LabelList dataKey="单次学习正确率" position="top" style={{ fill: '#ffc658', fontSize: '10px' }} formatter={(value: number, index: number) => index % 2 === 0 ? `${value}%` : null} />
                  </Line>
                </LineChart>
              </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

      </main>

      {/* Right Sidebar - Now uses the ProfileSidebar component */}
      <ProfileSidebar />
    </div>
  );
}; 