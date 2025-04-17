import { useState, useEffect, useCallback } from 'react';
import { schoolService } from '../services/schoolApi';

interface UseStudentInfoResult {
  studentInfo: { name?: string | null; email?: string | null };
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useStudentInfo(studentId?: string | number): UseStudentInfoResult {
  const [studentInfo, setStudentInfo] = useState<{ name?: string | null; email?: string | null }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudentInfo = useCallback(async () => {
    if (!studentId) return;
    const studentIdNum = typeof studentId === 'string' ? parseInt(studentId, 10) : studentId;
    if (isNaN(Number(studentIdNum))) {
      setError('无效的学生ID');
      setStudentInfo({});
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const student = await schoolService.getStudentById(studentIdNum);
      setStudentInfo({
        name: student.name || null,
        email: student.email || null,
      });
    } catch (err: any) {
      setError('获取学生详情失败');
      setStudentInfo({});
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchStudentInfo();
  }, [fetchStudentInfo]);

  return { studentInfo, isLoading, error, refetch: fetchStudentInfo };
} 