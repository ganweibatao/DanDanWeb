import React from 'react';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { XIcon, ZapIcon, ClockIcon, UserIcon, PhoneIcon, HashIcon, SmileIcon } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import type { Student } from './TeacherPage';
import { GRADE_CHOICES } from '../../lib/constants';

// --- Helper Functions from StudentTable (reuse or move to utils) ---
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
  const hue1 = hash % 360;
  const hue2 = (hash * 17) % 360;
  const saturation = 70;
  const lightness1 = 60;
  const lightness2 = 50;
  return {
    backgroundImage: `linear-gradient(135deg, hsl(${hue1}, ${saturation}%, ${lightness1}%), hsl(${hue2}, ${saturation}%, ${lightness2}%))`,
    color: 'white',
  };
};

// Format learning hours (decimal hours) into "Xh Ym" or "Ym"
const formatLearningHours = (hoursDecimal: number | string | undefined | null): string => {
  let hoursNum = 0;
  if (typeof hoursDecimal === 'number') {
    hoursNum = hoursDecimal;
  } else if (typeof hoursDecimal === 'string') {
    hoursNum = parseFloat(hoursDecimal);
    if (isNaN(hoursNum)) return '–';
  } else {
    return '–';
  }
  if (hoursNum < 0) hoursNum = 0;
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
    return '0m';
  }
};
// --- End Helper Functions ---

interface StudentDetailDrawerProps {
  selectedStudent: Student;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStartTeaching?: () => void;
}

export const StudentDetailDrawer: React.FC<StudentDetailDrawerProps> = ({
  selectedStudent,
  onClose,
  onEdit,
  onDelete,
  onStartTeaching,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
          <XIcon className="h-5 w-5" />
        </Button>
      </div>
      {/* Content - Added overflow-y-auto */}
      <div className="flex-grow flex flex-col overflow-y-auto">
        {/* Top Section: Avatar, Name, Email, Progress Cards */}
        <div className="p-4 md:p-6 space-y-5 flex-shrink-0">
          {/* Avatar and Basic Info */}
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16 flex-shrink-0">
              {/* Use gradient fallback */}
              <AvatarFallback 
                className="text-white text-2xl font-semibold" 
                style={getGradientStyle(selectedStudent.username || ' ')}
              >
                {selectedStudent.avatarFallback}
              </AvatarFallback>
            </Avatar>
            <div className="text-left overflow-hidden">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white truncate">{selectedStudent.name || selectedStudent.username}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{selectedStudent.email || '无邮箱'}</p>
            </div>
          </div>
          {/* === 教学按钮 === */}
          <div className="flex flex-col items-center space-y-1 pt-4"> 
            <Button
              size="sm"
              variant="outline"
              className="w-full border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 font-bold"
              onClick={() => {
                // Only call onStartTeaching, no more teachingSession logic
                if (onStartTeaching) onStartTeaching();
              }}
              disabled={!selectedStudent} // Keep disabled check based on selected student
            >
              开始教学
            </Button>
          </div>
          {/* Progress Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2 tracking-normal">学习进度</h3>
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-gray-50 dark:bg-gray-700/50 p-3">
                <CardContent className="flex items-center space-x-2 p-0">
                  <ZapIcon className="w-5 h-5 text-yellow-500 dark:text-yellow-400 flex-shrink-0" />
                  <div className="overflow-hidden">
                    <div className="text-sm font-bold text-gray-800 dark:text-white truncate" title={String(selectedStudent.learning_hours || 0)}>
                      {formatLearningHours(selectedStudent.learning_hours)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">学习时长</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gray-50 dark:bg-gray-700/50 p-3">
                <CardContent className="flex items-center space-x-2 p-0">
                  <ClockIcon className="w-5 h-5 text-purple-500 dark:text-purple-400 flex-shrink-0" />
                  <div className="overflow-hidden">
                    <div className="text-sm font-bold text-gray-800 dark:text-white truncate">{selectedStudent.grade ? (GRADE_CHOICES.find((g: { value: string; label: string }) => g.value === selectedStudent.grade)?.label || selectedStudent.grade) : <span className="text-gray-400 dark:text-gray-500">–</span>}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">目标年级</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-600 mx-4 md:mx-6 flex-shrink-0"></div>

        {/* Detailed Info Section - Added this new section */}
        <div className="p-4 md:p-6 space-y-4 flex-grow">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3 tracking-normal">详细信息</h3>
          <div className="space-y-3">
            {/* Gender - Use UserIcon */}
            <div className="flex items-center text-sm">
              <UserIcon className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" /> 
              <span className="text-gray-600 dark:text-gray-400 mr-2 w-12">性别:</span>
              <span className="text-gray-800 dark:text-gray-200 font-medium">
                {selectedStudent.gender === 'male' ? '男' : 
                 selectedStudent.gender === 'female' ? '女' : 
                 selectedStudent.gender === 'other' ? '其他' : 
                 <span className="text-gray-400 dark:text-gray-500">未设置</span>}
              </span>
            </div>
            {/* Age */}
            <div className="flex items-center text-sm">
              <HashIcon className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
              <span className="text-gray-600 dark:text-gray-400 mr-2 w-12">年龄:</span>
              <span className="text-gray-800 dark:text-gray-200 font-medium">
                {selectedStudent.age ? `${selectedStudent.age} 岁` : <span className="text-gray-400 dark:text-gray-500">未设置</span>}
              </span>
            </div>
            {/* Phone */}
            <div className="flex items-center text-sm">
              <PhoneIcon className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
              <span className="text-gray-600 dark:text-gray-400 mr-2 w-12">电话:</span>
              <span className="text-gray-800 dark:text-gray-200 font-medium">
                {selectedStudent.phone_number || <span className="text-gray-400 dark:text-gray-500">未提供</span>}
              </span>
            </div>
            {/* Personality */}
            <div className="flex items-start text-sm">
              <SmileIcon className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-600 dark:text-gray-400 mr-2 w-12 flex-shrink-0">性格:</span>
              <span className="text-gray-800 dark:text-gray-200 font-medium break-words">
                {selectedStudent.personality_traits || <span className="text-gray-400 dark:text-gray-500">未描述</span>}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 