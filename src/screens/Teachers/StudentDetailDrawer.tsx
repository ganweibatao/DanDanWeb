import React from 'react';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../../components/ui/dropdown-menu';
import { Settings2Icon, XIcon, ZapIcon, ClockIcon, CheckCircleIcon } from 'lucide-react';
import { Card } from '../../components/ui/card';
import type { Student } from './TeacherPage';
import { useTeachingSession } from './useTeachingSession';
import { GRADE_CHOICES } from '../../lib/constants';

interface StudentDetailDrawerProps {
  selectedStudent: Student;
  teachingSession: ReturnType<typeof useTeachingSession>;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStartTeaching?: () => void;
}

export const StudentDetailDrawer: React.FC<StudentDetailDrawerProps> = ({
  selectedStudent,
  teachingSession,
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
        {/* 教学会话按钮区块 */}
        <div className="flex flex-col items-center space-y-1">
          {teachingSession.teachingStartTime === null ? (
            <Button
              size="sm"
              variant="outline"
              className="border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 font-bold"
              onClick={() => {
                teachingSession.startTeaching();
                if (onStartTeaching) onStartTeaching();
              }}
              disabled={!selectedStudent}
            >
              开始教学
            </Button>
          ) : (
            <>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  已教学：{Math.floor(teachingSession.teachingDuration / 60)} 分 {teachingSession.teachingDuration % 60} 秒
                </span>
                <Button
                  size="sm"
                  variant="destructive"
                  className="bg-red-500 hover:bg-red-600 text-white font-bold px-3 py-1"
                  onClick={teachingSession.endTeaching}
                  disabled={teachingSession.isEndingTeaching}
                >
                  {teachingSession.isEndingTeaching ? '上报中...' : '结束教学'}
                </Button>
              </div>
            </>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
              <Settings2Icon className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit} disabled={!selectedStudent}>
              编辑学生信息
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 dark:text-red-500 focus:text-red-600 dark:focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-900/20 cursor-pointer"
              onClick={onDelete}
              disabled={!selectedStudent}
            >
              删除学生
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* Content */}
      <div className="flex-grow flex flex-col">
        <div className="p-6 space-y-6 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16 flex-shrink-0">
              <AvatarFallback className="bg-green-500 dark:bg-green-600 text-white text-2xl">{selectedStudent.avatarFallback}</AvatarFallback>
            </Avatar>
            <div className="text-left">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">{selectedStudent.name || selectedStudent.username}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">{selectedStudent.email}</p>
            </div>
          </div>
          {/* Progress */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">加入班级以来的进度</h3>
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-gray-50 dark:bg-gray-700 p-3 flex items-center space-x-2">
                <ZapIcon className="w-5 h-5 text-yellow-500 dark:text-yellow-400 flex-shrink-0" />
                <div>
                  <div className="text-base font-bold text-gray-800 dark:text-white">{
                    typeof selectedStudent.learning_hours === 'number'
                      ? selectedStudent.learning_hours.toFixed(1)
                      : typeof selectedStudent.learning_hours === 'string' && !isNaN(parseFloat(selectedStudent.learning_hours))
                        ? parseFloat(selectedStudent.learning_hours).toFixed(1)
                        : '-'
                  } 小时</div>
                  <div className="text-xxs text-gray-500 dark:text-gray-400">学习时长</div>
                </div>
              </Card>
              <Card className="bg-gray-50 dark:bg-gray-700 p-3 flex items-center space-x-2">
                <ClockIcon className="w-5 h-5 text-purple-500 dark:text-purple-400 flex-shrink-0" />
                <div>
                  <div className="text-base font-bold text-gray-800 dark:text-white">{selectedStudent.grade ? (GRADE_CHOICES.find((g: { value: string; label: string }) => g.value === selectedStudent.grade)?.label || selectedStudent.grade) : '-'}</div>
                  <div className="text-xxs text-gray-500 dark:text-gray-400">目标</div>
                </div>
              </Card>
            </div>
          </div>
        </div>
        {/* 其它内容可继续补充 */}
      </div>
    </div>
  );
}; 