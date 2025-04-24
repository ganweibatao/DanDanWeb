import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import type { Student } from './TeacherPage';
import { GRADE_CHOICES } from '../../lib/constants';

// --- Helper Functions ---

// Simple hash function for generating somewhat unique colors/gradients
const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// Generate a gradient style based on username hash
const getGradientStyle = (username: string): React.CSSProperties => {
  const hash = simpleHash(username);
  // Generate hue values based on hash, ensuring some spread
  const hue1 = hash % 360;
  const hue2 = (hash * 17) % 360; // Use a different multiplier for variety
  // Use fixed saturation and lightness for consistency, adjust as needed
  const saturation = 70;
  const lightness1 = 60;
  const lightness2 = 50; // Slightly darker second color

  return {
    backgroundImage: `linear-gradient(135deg, hsl(${hue1}, ${saturation}%, ${lightness1}%), hsl(${hue2}, ${saturation}%, ${lightness2}%))`,
    color: 'white', // Ensure text is visible on gradient
  };
};

// Format learning hours (decimal hours) into "Xh Ym" or "Ym"
const formatLearningHours = (hoursDecimal: number | string | undefined | null): string => {
  let hoursNum = 0;
  if (typeof hoursDecimal === 'number') {
    hoursNum = hoursDecimal;
  } else if (typeof hoursDecimal === 'string') {
    hoursNum = parseFloat(hoursDecimal);
    if (isNaN(hoursNum)) return '–'; // Use em dash for invalid string input
  } else {
    return '–'; // Use em dash for undefined or null
  }

  if (hoursNum < 0) hoursNum = 0; // Handle potential negative values

  const totalMinutes = Math.round(hoursNum * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    // If totalMinutes is 0 after rounding
    return '0m'; 
  }
};

// --- Component ---

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
    <div className="h-full overflow-y-auto">
      <Table>
        <TableHeader className="sticky top-0 bg-gray-100 dark:bg-gray-700/60 z-10">
          <TableRow className="border-b border-gray-200 dark:border-gray-700">
            <TableHead className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider py-3 px-4">名称</TableHead>
            <TableHead className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider py-3 px-4">年级</TableHead>
            <TableHead className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider py-3 px-4">年龄</TableHead>
            <TableHead className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider py-3 px-4">性别</TableHead>
            <TableHead className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider py-3 px-4">学习时长(h)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
          {students.map((student) => (
            <TableRow
              key={student.id}
              onClick={() => onSelectStudent(student)}
              className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 ${selectedStudent?.id === student.id ? 'bg-blue-50 dark:bg-gray-700/80' : ''}`}
            >
              <TableCell className="font-medium flex items-center space-x-3 py-5 px-4">
                <Avatar className="w-8 h-8">
                  {student.avatar ? (
                    <AvatarImage src={student.avatar} alt={student.username} />
                  ) : null}
                  <AvatarFallback 
                    className="text-white text-xs font-semibold"
                    style={getGradientStyle(student.username)}
                  >
                    {student.avatarFallback}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-800 dark:text-gray-200">{student.name || student.username}</span>
              </TableCell>
              <TableCell className="text-sm text-gray-700 dark:text-gray-300 py-5 px-4">{GRADE_CHOICES.find((g: { value: string; label: string }) => g.value === student.grade)?.label || student.grade || <span className="text-gray-400 dark:text-gray-500">–</span>}</TableCell>
              <TableCell className="text-sm text-gray-700 dark:text-gray-300 py-5 px-4">{student.age ?? <span className="text-gray-400 dark:text-gray-500">–</span>}</TableCell>
              <TableCell className="text-sm text-gray-700 dark:text-gray-300 py-5 px-4">{student.gender === 'male' ? '男' : student.gender === 'female' ? '女' : student.gender === 'other' ? '其他' : <span className="text-gray-400 dark:text-gray-500">–</span>}</TableCell>
              <TableCell className="text-sm text-gray-700 dark:text-gray-300 py-5 px-4">
                {formatLearningHours(student.learning_hours)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}; 