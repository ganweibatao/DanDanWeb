import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchStudentProfile } from '../services/studentApi';
import { fetchDailyLearningSummary } from '../services/trackingApi';
import type { StudentProfile } from '../types/models';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Sidebar } from './Students/StudentsSidebar'; // Import Sidebar
import { ProfileSidebar } from '../components/layout/ProfileSidebar'; // Import the new ProfileSidebar
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, LabelList
} from 'recharts'; // Updated Recharts imports for ComposedChart and Line

export const LearningReportPage = (): JSX.Element => {
  const { studentId } = useParams();
  
  // 获取学生信息
  const { data: userData, isLoading, isError } = useQuery<StudentProfile>({
    queryKey: ['studentProfile', studentId],
    queryFn: () => fetchStudentProfile(studentId!),
    enabled: !!studentId,
  });
  
  // === 调用后端汇总接口 ===
  const { data: dailySummary = [], isLoading: isLoadingSummary, isError: isErrorSummary } = useQuery({
    queryKey: ['dailyLearningSummary', studentId],
    queryFn: () => fetchDailyLearningSummary(studentId!),
    enabled: !!studentId,
  });

  if (isLoading) return <div>加载中...</div>;
  if (isError || !userData) return <div>未找到学生信息</div>;

  // Chart data format
  const chartData = dailySummary.map(d => ({
    name: d.date.slice(5), // MM-DD
    listName: '',
    学习时长: +(d.duration / 60).toFixed(1), // 分钟
    单词数: d.word_count,
    每词时长: d.avg_per_word ?? 0,
    单次学习正确率: d.accuracy ?? 0,
  })).reverse();

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
        {/*
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
        */}

      </main>

      {/* Right Sidebar - Now uses the ProfileSidebar component */}
      <ProfileSidebar />
    </div>
  );
}; 