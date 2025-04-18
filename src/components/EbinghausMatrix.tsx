import React, { useRef, useEffect } from 'react';
import { CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { getDisplayUnitNumber } from '../services/learningApi';

// 定义从后端获取的单元和复习数据的类型
interface UnitReview {
  id: number;
  review_date: string; // 或者 Date 类型，取决于API返回
  review_order: number;
  is_completed: boolean;
  completed_at?: string | null; // ISO string or null
}

interface LearningUnit {
  id: number;
  unit_number: number;
  is_learned: boolean;
  learned_at?: string | null; // ISO string or null
  reviews: UnitReview[];
  // 可能还有其他字段，根据需要添加
}

interface EbinghausMatrixProps {
  days: number; // 计划总天数 (可能需要根据实际单元数调整或确认其含义)
  totalWords?: number; // 总词数，可选，用于计算列表总数
  wordsPerDay?: number; // 每日词数，可选，用于计算列表总数
  onSelectUnit?: (unit: LearningUnit) => void; // 回调参数类型改为 LearningUnit
  ebinghausIntervals?: number[]; // 复习间隔
  learningUnits: LearningUnit[]; // <--- 新增：接收后端传来的学习单元数据
  planId?: number; // 添加planId参数用于导航
  studentId?: string; // 添加studentId参数用于导航
  max_actual_unit_number?: number;
  estimated_unit_count?: number;
  has_unused_lists?: boolean; // <-- Add has_unused_lists prop type
}

// 辅助函数：根据 review_order 获取对应的艾宾浩斯天数间隔
// 注意：这需要与后端 EBBINGHAUS_INTERVALS_MAP 保持一致或进行调整
const getIntervalFromOrder = (order: number, intervals: number[]): number | null => {
  if (order >= 1 && order <= intervals.length) {
    return intervals[order - 1]; // 假设 intervals 数组顺序与 order 对应
  }
  return null; // 如果 order 超出范围
};

export const EbinghausMatrix: React.FC<EbinghausMatrixProps> = ({ 
  days, // 这个 'days' prop 现在可能更多的是指显示多少行，而不是计划总天数
  totalWords,
  wordsPerDay,
  onSelectUnit,
  ebinghausIntervals = [1, 2, 4, 7, 15], // 默认复习间隔
  learningUnits = [], // 默认空数组
  max_actual_unit_number = 0, // Default to 0 if not provided
  estimated_unit_count = 0, // Default to 0 if not provided
  has_unused_lists = false // Default to false if not provided
}) => {
  const tableRef = useRef<HTMLDivElement>(null);
  
  // --- Add logging for learningUnits ---
  useEffect(() => {
  }, [learningUnits]);
  // --- End logging ---
  
  // 滑动功能
  const scrollTable = (direction: 'left' | 'right') => {
    if (tableRef.current) {
      const scrollAmount = direction === 'left' ? -150 : 150; // 减小滚动量以获得更平滑体验
      tableRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  
  // --- MODIFIED: Prioritize estimated count for matrix structure ---
  // Use the prop from backend if available, otherwise calculate locally (though backend is preferred)
  const unitsCountForMatrixStructure = estimated_unit_count > 0 ? estimated_unit_count :
      (totalWords && wordsPerDay && wordsPerDay > 0) 
          ? Math.ceil(totalWords / wordsPerDay) 
          : learningUnits.length; 
  // --- END MODIFICATION ---

  // 构建日程矩阵数据
  const reviewIntervals = ebinghausIntervals; 
  const scheduleMatrix: Array<{
    day: number;
    units: Array<{ unitNumber: number; interval: number | null }>
  }> = [];

  // 使用 unitsCountForMatrixStructure 来计算所需的显示天数
  const lastUnitNumber = unitsCountForMatrixStructure; // 使用计算出的单元数
  const lastReviewInterval = reviewIntervals.length > 0 ? reviewIntervals[reviewIntervals.length - 1] : 0;
  const requiredDays = lastUnitNumber + lastReviewInterval; 
  // displayDays 可以基于传入的 days Prop，或计算出的 requiredDays，或两者的最大值
  // 这里我们确保至少显示所有潜在的任务行
  const displayDays = Math.max(days, requiredDays);

  for (let day = 1; day <= displayDays; day++) {
    const dayUnits: Array<{ unitNumber: number; interval: number | null }> = [];

    // 检查当天是否学习新单元 (基于用于构建矩阵的单元数)
    if (day <= unitsCountForMatrixStructure) {
      dayUnits.push({ unitNumber: day, interval: null });
    }

    // 检查当天需要复习哪些单元 (基于用于构建矩阵的单元数)
    for (const interval of reviewIntervals) {
      const originalLearnDay = day - interval; 
      if (originalLearnDay > 0 && originalLearnDay <= unitsCountForMatrixStructure) {
        dayUnits.push({ unitNumber: originalLearnDay, interval });
      }
    }

    if (dayUnits.length > 0) {
      scheduleMatrix.push({ day, units: dayUnits });
    }
  }

  // 找到特定日期和单元对应的列单元格
  const getColumnIndex = (interval: number | null) => {
    if (interval === null) return 0; // 新学列
    return reviewIntervals.indexOf(interval) + 1;
  };

  // 表头：新学、1天后、2天后等（简化表头文本)
  const headers = ['0d', ...reviewIntervals.map(interval => `${interval}d`)];

  // 更加紧凑的宽度设置，但适配宽屏
  const fixedTableWidth = "w-full"; // 移除最大宽度限制
  const cellWidth = "w-18"; // 增加单元格宽度
  const firstColWidth = "w-16"; // 增加第一列宽度

  return (
    <div className="relative">
      {/* 滑动控制按钮 - 样式更新 */}
      <div className="flex justify-between absolute -top-1 left-1/4 right-1/4 z-10 sm:hidden">
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-0.5 h-5 w-5 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200"
          onClick={() => scrollTable('left')}
        >
          <ChevronLeft className="h-2.5 w-2.5 text-gray-600" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          className="p-0.5 h-5 w-5 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200"
          onClick={() => scrollTable('right')}
        >
          <ChevronRight className="h-2.5 w-2.5 text-gray-600" />
        </Button>
      </div>
      
      {/* 表格滚动容器 - 样式更新 */}
      <div 
        ref={tableRef}
        className={`overflow-x-auto mt-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-700 ${fixedTableWidth} relative`}
        style={{ scrollbarWidth: 'thin' }}
      >
        {/* 横向滚动阴影提示 */}
        <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white dark:from-gray-800 to-transparent z-20 pointer-events-none sm:hidden"></div>
        
        <div className="max-h-[calc(80vh-90px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-700 relative">
          {/* 纵向滚动阴影提示 - 已删除 */}
          
          <table className="w-full table-fixed border-collapse">
            <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10">
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className={`py-2 px-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-gray-800 z-10 ${firstColWidth}`}>
                  <span>日期</span>
                </th>
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className={`py-2 px-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300 ${cellWidth}`}
                  >
                    <div className="flex flex-col">
                      <span>{header}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{index === 0 ? '新单词' : '复习'}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scheduleMatrix.map((daySchedule) => (
                <tr key={daySchedule.day} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
                  <td className={`py-1 px-1 border-b border-gray-100 dark:border-gray-700 sticky left-0 bg-white dark:bg-gray-800 z-10 text-center ${firstColWidth}`}>
                    <span className="text-gray-600 dark:text-gray-400 font-medium text-xs">
                      D{daySchedule.day}
                    </span>
                  </td>
                  
                  {/* 为每个可能的复习间隔创建单元格 */}
                  {Array.from({ length: headers.length }).map((_, colIndex) => {
                    const task = daySchedule.units.find(
                      t => getColumnIndex(t.interval) === colIndex
                    );
                    
                    // Check if this cell belongs to an unused list based on both flags
                    const isUnused = has_unused_lists && task && max_actual_unit_number > 0 && task.unitNumber > max_actual_unit_number;
                    
                    if (!task) {
                      return <td key={colIndex} className={`py-1 px-1 border-b border-gray-100 dark:border-gray-700 ${cellWidth}`}></td>;
                    }
                    
                    // --- 修改：查找 LearningUnit，即使 learningUnits 为空也继续 --- 
                    // 尝试找到对应的 LearningUnit 数据 (即使矩阵是基于估算构建的，我们仍然用这个数据来确定状态)
                    const learningUnit = learningUnits.find(lu => lu.unit_number === task.unitNumber);
                    
                    // --- 确定单元格样式 (逻辑保持不变，基于找到的 learningUnit 或默认值) --- 
                    const isNewLearn = task.interval === null;
                    let cellStyle = '';
                    let isCompleted = false;
                    
                    if (learningUnit) {
                      if (isNewLearn) {
                        isCompleted = learningUnit.is_learned;
                        cellStyle = isCompleted
                          ? 'bg-green-50 dark:bg-green-800/30 border border-green-200 dark:border-green-700/50 text-green-800 dark:text-green-300'
                          : 'bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600/50 text-gray-700 dark:text-gray-300';
                      } else {
                        // 直接进入复习判断逻辑，不再判断 is_learned 是否为 false
                        const currentInterval = task.interval;
                        if (currentInterval !== null) {
                           const reviewOrder = reviewIntervals.indexOf(currentInterval) + 1;
                           if (reviewOrder > 0) { 
                             const reviews = Array.isArray(learningUnit.reviews) ? learningUnit.reviews : [];
                             const unfinishedOrders = reviews.length > 0 ? reviews.map(r => r.review_order) : [];
                             const minUnfinishedOrder = unfinishedOrders.length > 0 ? Math.min(...unfinishedOrders) : null;
                             const review = reviews.find(r => r.review_order === reviewOrder);
                             if (review) {
                               isCompleted = review.is_completed;
                               if (isCompleted) {
                                 cellStyle = 'bg-green-50 dark:bg-green-800/30 border border-green-200 dark:border-green-700/50 text-green-800 dark:text-green-300'; // 已完成复习
                               } else {
                                 cellStyle = 'bg-purple-100 dark:bg-purple-800/30 border border-purple-300 dark:border-purple-700/50 text-purple-900 dark:text-purple-200'; // 待复习
                               }
                             } else if (reviews.length === 0) {
                               isCompleted = false;
                               cellStyle = 'bg-purple-100 dark:bg-purple-800/30 border border-purple-300 dark:border-purple-700/50 text-purple-900 dark:text-purple-200';
                             } else if (minUnfinishedOrder === null || reviewOrder < minUnfinishedOrder) {
                               isCompleted = true;
                               cellStyle = 'bg-green-50 dark:bg-green-800/30 border border-green-200 dark:border-green-700/50 text-green-800 dark:text-green-300';
                             } else {
                               cellStyle = 'bg-purple-100 dark:bg-purple-800/30 border border-purple-300 dark:border-purple-700/50 text-purple-900 dark:text-purple-200'; 
                             }
                           } else { // Interval 不在定义的列表中
                             console.warn(`Review interval ${currentInterval} not found in defined intervals.`);
                             cellStyle = 'bg-red-100 dark:bg-red-800/30 border border-red-300 dark:border-red-700/50 text-red-900 dark:text-red-200'; 
                           }
                        } else { // task.interval 为 null (逻辑错误)
                           console.error("Error: task.interval was null inside the review block.");
                           cellStyle = 'bg-red-100 dark:bg-red-800/30 border border-red-300 dark:border-red-700/50 text-red-900 dark:text-red-200';
                        }
                      }
                    } else {
                      // --- 如果没有找到 LearningUnit 数据 (例如后端只返回了部分单元，但矩阵是完整的) --- 
                      // 将这些在估算计划中存在、但后端未返回数据的单元格视为未开始状态
                      isCompleted = false; // 明确设为 false
                      if (isNewLearn) {
                        // 新学单元格默认样式 (未开始)
                        cellStyle = 'bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600/50 text-gray-700 dark:text-gray-300';
                      } else {
                        // 复习单元格默认样式 (待复习 - 因为计划中它应该存在)
                        cellStyle = 'bg-purple-100 dark:bg-purple-800/30 border border-purple-300 dark:border-purple-700/50 text-purple-900 dark:text-purple-200';
                      }
                    }
                                        
                    // If it's an unused list, override style and behavior
                    if (isUnused) {
                      return (
                        <td key={colIndex} className={`py-1 px-1 border-b border-gray-100 dark:border-gray-700 ${cellWidth}`}>
                          <div
                            className="flex items-center justify-center text-xs font-medium rounded-md px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700/30 text-gray-400 line-through cursor-not-allowed relative opacity-70"
                            title="该单元未分配单词"
                            style={{
                              background: "repeating-linear-gradient(135deg, rgba(229, 231, 235, 0.5) 0 1px, transparent 1px 3px)", // Lighter diagonal lines
                            }}
                          >
                            list{getDisplayUnitNumber(task.unitNumber)}
                          </div>
                        </td>
                      );
                    }
                                        
                    return (
                      <td 
                        key={colIndex} 
                        className={`py-1 px-1 border-b border-gray-100 dark:border-gray-700 ${cellWidth}`}
                      >
                        <div 
                          // --- MODIFIED: Click behavior depends on if the unit *should* exist based on structure ---
                          className={`flex items-center justify-center text-xs font-medium rounded-md px-1.5 py-0.5 ${cellStyle} ${unitsCountForMatrixStructure >= task.unitNumber ? 'cursor-pointer hover:opacity-80' : 'cursor-default'} transition-opacity`}
                          // onClick={() => learningUnit && onSelectUnit?.(learningUnit)} // 旧逻辑：只在找到 learningUnit 时可点击
                          onClick={() => {
                              // 允许点击任何在估算计划内的单元格
                              // 如果有 learningUnit 数据，则传递它；否则，创建一个临时的、表示未开始状态的单元对象传递
                              if (unitsCountForMatrixStructure >= task.unitNumber) {
                                  const unitToPass = learningUnit || { 
                                      id: -task.unitNumber, // Use negative number to indicate placeholder
                                      unit_number: task.unitNumber, 
                                      is_learned: false, 
                                      reviews: [] 
                                  };
                                  onSelectUnit?.(unitToPass as LearningUnit); // Assert type for now
                              }
                          }}
                        >
                          <span>list{getDisplayUnitNumber(task.unitNumber)}</span> 
                          {/* 仅当 learningUnit 存在且已完成时才显示勾 */}
                          {learningUnit && isCompleted && <CheckCircle className="w-2.5 h-2.5 ml-0.5 flex-shrink-0" />} 
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* --- MODIFIED: 底部总数显示使用 estimated_unit_count --- */}
      {estimated_unit_count > 0 && totalWords && (
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
          共 {estimated_unit_count} 个单元, {totalWords} 个单词
        </div>
      )}
      {/* --- END MODIFICATION --- */}
    </div>
  );
}; 