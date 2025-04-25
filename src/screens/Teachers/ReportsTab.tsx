import React, { useState, useEffect } from 'react';
import { teacherService } from '../../services/teacherApi'; // For total hours (if refetched here)
import { getTeacherDailyTeachingDuration, DailyDuration, fetchAllUserLogs, UserDurationLog } from '../../services/trackingApi'; // For daily duration chart
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- 类型定义 ---
interface ChartDataPoint {
  date: string; // Format: 'MM-DD'
  hours: number;
}

interface ClassSessionRecord {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  studentName: string | null;
}

// --- 组件 Props ---
interface ReportsTabProps {
  studentsData: { id: number; username: string; name?: string }[]; // Only need id, username, name for filter
}

export const ReportsTab: React.FC<ReportsTabProps> = ({ studentsData }) => {
  // --- 总授课时长状态 (Moved from TeacherPage) ---
  const [totalTeachingHours, setTotalTeachingHours] = useState<number | null>(null);
  const [isLoadingTotalHours, setIsLoadingTotalHours] = useState<boolean>(true);
  const [fetchTotalHoursError, setFetchTotalHoursError] = useState<string | null>(null);

  // --- 每日授课时长状态 (Moved from TeacherPage) ---
  const [dailyTeachingDuration, setDailyTeachingDuration] = useState<ChartDataPoint[]>([]);
  const [isLoadingDailyDuration, setIsLoadingDailyDuration] = useState<boolean>(true);
  const [fetchDailyDurationError, setFetchDailyDurationError] = useState<string | null>(null);

  // --- 上课记录筛选状态 (Moved from TeacherPage) ---
  const [filterDate, setFilterDate] = useState<string | null>(null);
  const [filterStudentId, setFilterStudentId] = useState<string | null>(null);

  // Add new states for fetching and displaying logs
  const [displayedRecords, setDisplayedRecords] = useState<ClassSessionRecord[]>([]); // Processed records for display
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(true);
  const [fetchLogsError, setFetchLogsError] = useState<string | null>(null);

  // --- 获取总授课时长 Hook (Moved from TeacherPage) ---
  useEffect(() => {
    const fetchHours = async () => {
      setIsLoadingTotalHours(true);
      setFetchTotalHoursError(null);
      try {
        // Assuming teacherService is accessible or passed as prop if needed elsewhere
        const hours = await teacherService.fetchTotalTeachingHours();
        setTotalTeachingHours(hours);
      } catch (error: any) {
        console.error("Failed to fetch total teaching hours:", error);
        setFetchTotalHoursError(error.message || "获取总教学时长失败，请稍后重试。");
        setTotalTeachingHours(null);
      } finally {
        setIsLoadingTotalHours(false);
      }
    };

    fetchHours();
  }, []); // Runs only once on mount

  // --- 获取每日授课时长 Hook (Moved from TeacherPage) ---
  useEffect(() => {
    const fetchDailyDuration = async () => {
      // Fetch daily duration logic... (Consider if initialView prop is strictly needed now)
      // Since this component likely only renders when the 'reports' tab is active,
      // we might not need the initialView check anymore. Fetch always when mounted.
      setIsLoadingDailyDuration(true);
      setFetchDailyDurationError(null);
      try {
        const rawData: DailyDuration[] = await getTeacherDailyTeachingDuration();
        const processedData: ChartDataPoint[] = rawData.map(item => ({
          date: item.date.substring(5),
          hours: parseFloat((item.duration / 3600).toFixed(1)),
        }));
        setDailyTeachingDuration(processedData);
      } catch (error: any) {
        console.error("Failed to fetch daily teaching duration:", error);
        setFetchDailyDurationError(error.message || "获取每日教学时长失败，请稍后重试。");
        setDailyTeachingDuration([]);
      } finally {
        setIsLoadingDailyDuration(false);
      }
    };

    fetchDailyDuration();
  // Removed dependency on activeView/initialView, assuming component mounts when tab is active
  }, []); 

  // --- Combined Hook to fetch and process logs based on filters --- 
  useEffect(() => {
    const fetchAndProcessLogs = async () => {
      setIsLoadingLogs(true);
      setFetchLogsError(null);
      try {
        // Prepare filters for the API call
        const apiFilters: { date?: string | null; studentId?: number | string | null } = {
          date: filterDate,
          studentId: filterStudentId === 'all' ? null : filterStudentId, // Pass null if 'all' is selected
        };

        // Fetch logs using filters
        const logs = await fetchAllUserLogs(apiFilters); 

        // Process logs into ClassSessionRecord format for display
        const processedRecords: ClassSessionRecord[] = logs.map(log => {
          const startTime = log.client_start_time 
                            ? new Date(log.client_start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
                            : 'N/A';
          const endTime = log.client_end_time
                          ? new Date(log.client_end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
                          : 'N/A';
          const recordDate = log.client_start_time 
                            ? new Date(log.client_start_time).toISOString().split('T')[0] 
                            : new Date(log.created_at).toISOString().split('T')[0];

          return {
            id: log.id,
            date: recordDate,
            startTime: startTime,
            endTime: endTime,
            durationMinutes: Math.round(log.duration / 60), 
            studentName: log.student_name || 'N/A', // Use student_name from API, provide fallback
          };
        });

        // Sort records (optional, backend might already sort)
        setDisplayedRecords(processedRecords.sort((a, b) => { 
            if (a.date !== b.date) return b.date.localeCompare(a.date);
            if (a.startTime !== 'N/A' && b.startTime !== 'N/A') return b.startTime.localeCompare(a.startTime);
            return 0;
        }));

      } catch (error: any) {
        console.error("Failed to fetch user logs:", error);
        setFetchLogsError(error.message || "获取上课记录失败，请稍后重试。");
        setDisplayedRecords([]); // Clear records on error
      } finally {
        setIsLoadingLogs(false);
      }
    };

    fetchAndProcessLogs();
  // Re-fetch when date or student filter changes
  }, [filterDate, filterStudentId]); 

  return (
    <div className="mt-0 flex-grow flex flex-col space-y-6 h-full"> {/* Use h-full to match TabsContent */}
      {/* --- Teaching Stats Chart --- */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 flex-shrink-0"> {/* Added flex-shrink-0 */}
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300">最近 30 日授课时长</h3>
          <div className="text-right">
            <span className="text-xs text-gray-500 dark:text-gray-400 block">总时长</span>
            {isLoadingTotalHours ? (
              <span className="text-lg font-bold text-gray-900 dark:text-white animate-pulse">加载中...</span>
            ) : fetchTotalHoursError ? (
              <span className="text-lg font-bold text-red-600 dark:text-red-500" title={fetchTotalHoursError}>错误</span>
            ) : totalTeachingHours !== null ? (
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {totalTeachingHours.toFixed(1)} 小时
              </span>
            ) : (
              <span className="text-lg font-bold text-gray-500 dark:text-gray-400">N/A</span>
            )}
          </div>
        </div>
        <div style={{ width: '100%', height: 200 }}>
          {isLoadingDailyDuration ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500 dark:text-gray-400">图表加载中...</p>
            </div>
          ) : fetchDailyDurationError ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-red-600 dark:text-red-500" title={fetchDailyDurationError}>加载图表失败</p>
            </div>
          ) : dailyTeachingDuration.length === 0 ? (
             <div className="flex justify-center items-center h-full">
               <p className="text-gray-500 dark:text-gray-400">最近 30 天暂无授课记录</p>
             </div>
          ) : (
            <ResponsiveContainer>
              <BarChart data={dailyTeachingDuration} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#6b7280" />
                <YAxis tick={{ fontSize: 10 }} stroke="#6b7280" unit="h" />
                <Tooltip
                  contentStyle={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #e5e7eb' }}
                  itemStyle={{ color: '#1f2937' }}
                  labelStyle={{ color: '#4b5563', fontWeight: 'bold' }}
                  formatter={(value: number) => [`${value} 小时`, '时长']}
                />
                <Bar dataKey="hours" fill="#3b82f6" name="每日时长" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* --- Class Session Records Table --- */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 flex-grow flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-4 flex-shrink-0"> {/* Added flex-shrink-0 */}
          <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mr-auto">上课记录</h3>
          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <label htmlFor="filterDate" className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">日期:</label>
            <Input
              id="filterDate"
              type="date"
              value={filterDate || ''}
              onChange={(e) => setFilterDate(e.target.value || null)}
              className="h-8 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            />
          </div>
          {/* Student Filter */}
          <div className="flex items-center gap-2">
            <label htmlFor="filterStudent" className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">学生:</label>
            <Select
              value={filterStudentId ?? 'all'}
              onValueChange={(value) => setFilterStudentId(value === 'all' ? null : value)}
            >
              <SelectTrigger id="filterStudent" className="h-8 w-[150px] text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                <SelectValue placeholder="选择学生" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有学生</SelectItem>
                {studentsData.map(student => (
                  <SelectItem key={student.id} value={String(student.id)}> 
                    {student.name || student.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex-grow overflow-y-auto">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-700/50 sticky top-0 z-10 border-b border-gray-200 dark:border-gray-600">
              <TableRow>
                <TableHead className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 tracking-wider w-[60px]">序号</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">日期</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">开始时间</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">结束时间</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">学生</TableHead>
                <TableHead className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">时长 (分钟)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoadingLogs && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">加载记录中...</TableCell>
                </TableRow>
              )}
              {!isLoadingLogs && fetchLogsError && (
                 <TableRow>
                   <TableCell colSpan={6} className="py-10 text-center text-sm text-red-600 dark:text-red-500">{fetchLogsError}</TableCell>
                 </TableRow>
              )}
              {!isLoadingLogs && !fetchLogsError && displayedRecords.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                       {filterDate || filterStudentId ? '没有匹配的教学记录' : '暂无教学记录'}
                     </TableCell>
                   </TableRow>
              )}
              {!isLoadingLogs && !fetchLogsError && displayedRecords.length > 0 && (
                displayedRecords.map((record, index) => (
                  <TableRow key={record.id} className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/50'} hover:bg-blue-50 dark:hover:bg-gray-700/60`}>
                    <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">{index + 1}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{record.date}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{record.startTime}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{record.endTime}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{record.studentName}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">{record.durationMinutes}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default ReportsTab; // Optional: export default if it's the main export 