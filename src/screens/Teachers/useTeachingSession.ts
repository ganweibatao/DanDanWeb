import { useState, useEffect } from 'react';
import { useToast } from '../../hooks/use-toast';
import { forceReportStudentDuration } from '../../services/trackingApi';
import type { Student } from './TeacherPage';

/**
 * 教学会话 Hook，封装教学计时与上报逻辑
 */
export function useTeachingSession(selectedStudent: Student | null) {
  const [teachingStartTime, setTeachingStartTime] = useState<number | null>(null);
  const [isEndingTeaching, setIsEndingTeaching] = useState(false);
  const [teachingDuration, setTeachingDuration] = useState(0); // 秒
  const { toast } = useToast();

  // 读取 localStorage，只有当前学生才恢复
  useEffect(() => {
    if (selectedStudent) {
      const key = `teachingStartTime_${selectedStudent.id}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        setTeachingStartTime(Number(saved));
      } else {
        setTeachingStartTime(null);
      }
    } else {
      setTeachingStartTime(null);
    }
    setTeachingDuration(0);
  }, [selectedStudent]);

  // 定时更新教学时长显示
  useEffect(() => {
    if (!teachingStartTime) return;
    const timer = setInterval(() => {
      setTeachingDuration(Math.floor((Date.now() - teachingStartTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [teachingStartTime]);

  // 开始教学时写入 localStorage
  const startTeaching = () => {
    if (!selectedStudent) return;
    const now = Date.now();
    setTeachingStartTime(now);
    localStorage.setItem(`teachingStartTime_${selectedStudent.id}`, String(now));
    setTeachingDuration(0);
  };

  // 结束教学时清除 localStorage
  const endTeaching = async () => {
    if (!selectedStudent || !teachingStartTime) return;
    setIsEndingTeaching(true);
    const now = Date.now();
    const duration = Math.floor((now - teachingStartTime) / 1000);
    try {
      await forceReportStudentDuration({
        student_id: String(selectedStudent.id),
        duration,
        client_start_time: new Date(teachingStartTime).toISOString(),
        client_end_time: new Date(now).toISOString(),
      });
      toast({ title: '教学结束', description: `已为学生 ${selectedStudent.username} 记录 ${Math.floor(duration/60)} 分钟学习时长` });
      localStorage.removeItem(`teachingStartTime_${selectedStudent.id}`);
      setTeachingStartTime(null);
      setTeachingDuration(0);
    } catch (e: any) {
      toast({ variant: 'destructive', title: '上报失败', description: e.message || '请稍后重试' });
    } finally {
      setIsEndingTeaching(false);
    }
  };

  return {
    teachingStartTime,
    teachingDuration,
    isEndingTeaching,
    endTeaching,
    startTeaching,
  };
} 