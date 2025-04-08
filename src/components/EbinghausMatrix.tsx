import React, { useRef } from 'react';
import { CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

interface ListUnit {
  id: string;
  name: string;
  isCompleted: boolean;
}

interface EbinghausMatrixProps {
  days: number;
  totalWords?: number;
  wordsPerDay?: number;
  onSelectUnit?: (unit: ListUnit) => void;
  ebinghausIntervals?: number[];
}

export const EbinghausMatrix: React.FC<EbinghausMatrixProps> = ({ 
  days = 15,
  totalWords = 0,
  wordsPerDay = 20,
  onSelectUnit,
  ebinghausIntervals
}) => {
  const tableRef = useRef<HTMLDivElement>(null);
  
  // 滑动功能
  const scrollTable = (direction: 'left' | 'right') => {
    if (tableRef.current) {
      const scrollAmount = direction === 'left' ? -150 : 150; // 减小滚动量以获得更平滑体验
      tableRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  
  // 计算所需的List数量 - 每个List对应每天的学习量
  const calculateListsCount = () => {
    if (!totalWords || !wordsPerDay) return 8; // 默认值
    
    // 每个List就是每日学习量
    return Math.ceil(totalWords / wordsPerDay);
  };
  
  const listsCount = calculateListsCount();
  
  // 模拟生成单元列表数据
  const generateListUnits = (count: number): ListUnit[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `list-${i + 1}`,
      name: `list${i + 1}`, // 修改为 list1 格式
      isCompleted: Math.random() > 0.7 // 随机一些已完成状态用于演示
    }));
  };

  // 初始化需要学习的单元列表
  const lists = generateListUnits(listsCount);

  // 构建艾宾浩斯矩阵数据
  // 按照经典的艾宾浩斯遗忘曲线，在第1、2、4、7、15天后复习
  const reviewIntervals = ebinghausIntervals || [1, 2, 4, 7, 15];
  
  // 构建日程矩阵
  const scheduleMatrix: Array<{
    day: number;
    units: Array<{ listId: string; interval: number | null }>
  }> = [];

  // 确保计算的天数足够展示所有list的所有复习周期
  // 最后一个list的学习日是第listsCount天，加上最长复习周期才能确保所有复习都完成
  const requiredDays = listsCount + reviewIntervals[reviewIntervals.length - 1];
  const calculatedDays = Math.max(days, requiredDays);
  
  for (let day = 1; day <= calculatedDays; day++) {
    const dayUnits: Array<{ listId: string; interval: number | null }> = [];

    // 每天学习一个新单元，但不超过总单元数
    if (day <= lists.length) {
      dayUnits.push({ listId: `list-${day}`, interval: null });
    }

    // 添加需要复习的单元
    for (const interval of reviewIntervals) {
      const reviewDay = day - interval;
      if (reviewDay > 0 && reviewDay <= lists.length) {
        dayUnits.push({ listId: `list-${reviewDay}`, interval });
      }
    }

    // 只有当天有学习任务时才添加该天
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
  const cellWidth = "w-16"; // 增加单元格宽度
  const firstColWidth = "w-14"; // 增加第一列宽度

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
        
        <div className="max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-700 relative">
          {/* 纵向滚动阴影提示 */}
          <div className="absolute left-0 right-0 bottom-0 h-4 bg-gradient-to-t from-white dark:from-gray-800 to-transparent z-20 pointer-events-none"></div>
          
          <table className="w-full table-fixed border-collapse">
            <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10">
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className={`py-1 px-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-gray-800 z-10 ${firstColWidth}`}>
                  <div className="flex flex-col">
                    <span>日期</span>
                  </div>
                </th>
                {headers.map((header, index) => (
                  <th 
                    key={index} 
                    className={`py-1 px-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300 ${cellWidth}`}
                  >
                    <div className="flex flex-col">
                      <span>{header}</span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">{index === 0 ? '新单词' : '复习'}</span>
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
                    // 找到当前单元格对应的学习单元（如果有）
                    const unit = daySchedule.units.find(
                      u => getColumnIndex(u.interval) === colIndex
                    );
                    
                    if (!unit) {
                      return <td key={colIndex} className={`py-1 px-1 border-b border-gray-100 dark:border-gray-700 ${cellWidth}`}></td>;
                    }
                    
                    // 找到对应的List
                    const listIndex = parseInt(unit.listId.split('-')[1]) - 1;
                    const list = lists[listIndex];
                    
                    // Determine cell style based on completion and interval
                    const isNewLearn = unit.interval === null;
                    let cellStyle = '';
                    if (list.isCompleted) {
                      cellStyle = 'bg-green-50 dark:bg-green-800/30 border border-green-200 dark:border-green-700/50 text-green-800 dark:text-green-300';
                    } else if (isNewLearn) {
                      cellStyle = 'bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600/50 text-gray-700 dark:text-gray-300';
                    } else {
                      cellStyle = 'bg-purple-100 dark:bg-purple-800/30 border border-purple-300 dark:border-purple-700/50 text-purple-900 dark:text-purple-200'; // Review Style (Purple)
                    }
                    
                    return (
                      <td key={colIndex} className={`py-1 px-1 border-b border-gray-100 dark:border-gray-700 ${cellWidth}`}>
                        <div 
                          className={`relative flex items-center justify-center rounded py-1 px-1 ${cellStyle} cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors w-full text-center`}
                          onClick={() => onSelectUnit && onSelectUnit(list)}
                        >
                          <span className="font-medium text-xs inline-flex items-center">
                            {list.name}
                            {list.isCompleted && (
                              <CheckCircle className="w-2.5 h-2.5 ml-0.5 text-green-800 dark:text-green-300" />
                            )}
                          </span>
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
      
      {totalWords && wordsPerDay ? (
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-center">
          共 {listsCount} 个单元，{totalWords} 个单词
        </div>
      ) : null}
    </div>
  );
}; 