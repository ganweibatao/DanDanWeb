import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import type { Student } from './TeacherPage';
import { GRADE_CHOICES } from '../../lib/constants';

interface StudentTableProps {
  students: Student[];
  selectedStudent: Student | null;
  onSelectStudent: (student: Student) => void;
  isLoading: boolean;
  fetchError: string | null;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  selectedStudent,
  onSelectStudent,
  isLoading,
  fetchError,
}) => {
  if (isLoading) {
    return <div className="p-6 text-center text-gray-500 dark:text-gray-400">加载学生中...</div>;
  }
  if (fetchError) {
    return <div className="p-6 text-center text-red-600 dark:text-red-400">{fetchError}</div>;
  }
  if (students.length === 0) {
    return <div className="p-6 text-center text-gray-500 dark:text-gray-400">您还没有添加任何学生。</div>;
  }
  return (
    <Table>
      <TableHeader className="sticky top-0 bg-white dark:bg-gray-800">
        <TableRow className="border-b border-gray-200 dark:border-gray-700">
          <TableHead className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">名称</TableHead>
          <TableHead className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">年级</TableHead>
          <TableHead className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">年龄</TableHead>
          <TableHead className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">性别</TableHead>
          <TableHead className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">学习时长(h)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
        {students.map((student) => (
          <TableRow
            key={student.id}
            onClick={() => onSelectStudent(student)}
            className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 ${selectedStudent?.id === student.id ? 'bg-blue-50 dark:bg-gray-700/80' : ''}`}
          >
            <TableCell className="font-medium flex items-center space-x-3 py-3">
              <Avatar className="w-8 h-8">
                {student.avatar ? (
                  <AvatarImage src={student.avatar} alt={student.username} />
                ) : null}
                <AvatarFallback className="bg-green-500 dark:bg-green-600 text-white text-xs">{student.avatarFallback}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-800 dark:text-gray-200">{student.name || student.username}</span>
            </TableCell>
            <TableCell className="text-sm text-gray-700 dark:text-gray-300">{GRADE_CHOICES.find((g: { value: string; label: string }) => g.value === student.grade)?.label || student.grade || '-'}</TableCell>
            <TableCell className="text-sm text-gray-700 dark:text-gray-300">{student.age ?? '-'}</TableCell>
            <TableCell className="text-sm text-gray-700 dark:text-gray-300">{student.gender === 'male' ? '男' : student.gender === 'female' ? '女' : student.gender === 'other' ? '其他' : '-'}</TableCell>
            <TableCell className="text-sm text-gray-700 dark:text-gray-300">{
              typeof student.learning_hours === 'number'
                ? student.learning_hours.toFixed(2)
                : typeof student.learning_hours === 'string' && !isNaN(parseFloat(student.learning_hours))
                  ? parseFloat(student.learning_hours).toFixed(2)
                  : '-'
            }</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}; 