import React, { useState, useEffect, useRef } from 'react';
import { VocabularyWord } from '../services/api';
import { Card } from './ui/card';
import { Info, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from './ui/button';

interface AnnotationPanelProps {
  words: VocabularyWord[];
  darkMode: boolean;
}

interface ExtendedVocabularyWord extends VocabularyWord {
  notes?: string;
}

interface ConnectionLine {
  wordId: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export const AnnotationPanel: React.FC<AnnotationPanelProps> = ({ words, darkMode }) => {
  const [wordsWithNotes, setWordsWithNotes] = useState<ExtendedVocabularyWord[]>([]);
  const [connectionLines, setConnectionLines] = useState<ConnectionLine[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const linesContainerRef = useRef<HTMLDivElement>(null);

  // 检测设备类型和屏幕尺寸
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // 小于 768px 的视为移动设备
      setCollapsed(window.innerWidth < 768); // 移动设备上默认折叠
    };

    // 初始检测
    checkScreenSize();

    // 监听窗口变化
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    // 过滤出有笔记的单词
    const filtered = words.filter(word => {
      const extendedWord = word as ExtendedVocabularyWord;
      return extendedWord.notes && extendedWord.notes.trim() !== '';
    }) as ExtendedVocabularyWord[];
    
    setWordsWithNotes(filtered);
  }, [words]);

  // 当笔记面板渲染后，添加连线效果
  useEffect(() => {
    if (wordsWithNotes.length === 0) return;
    if (collapsed) {
      setConnectionLines([]); // 如果面板折叠了，不显示连线
      return;
    }

    // 计算连线位置的函数
    const calculateConnections = () => {
      const newLines: ConnectionLine[] = [];
      
      wordsWithNotes.forEach(word => {
        // 在主界面找到单词元素
        const wordElem = document.querySelector(`[data-word-id="${word.id}"]`);
        const noteElem = document.querySelector(`.note-item[data-word-id="${word.id}"]`);
        
        if (wordElem && noteElem && panelRef.current) {
          // 添加可见标记
          wordElem.classList.add('has-annotation');
          
          // 获取元素位置信息
          const wordRect = wordElem.getBoundingClientRect();
          const noteRect = noteElem.getBoundingClientRect();
          
          // 根据屏幕尺寸调整连线
          if (isMobile) {
            // 移动设备上的连线计算 (从下到上)
            const x1 = wordRect.left + wordRect.width / 2; // 单词中点
            const y1 = wordRect.bottom; // 单词底部
            const x2 = noteRect.left + noteRect.width / 2; // 笔记中点
            const y2 = noteRect.top; // 笔记顶部
            
            newLines.push({ wordId: word.id, x1, y1, x2, y2 });
          } else {
            // 桌面设备上的连线计算 (从左到右)
            const x1 = wordRect.right; // 单词右边缘
            const y1 = wordRect.top + wordRect.height / 2; // 单词中点
            const x2 = noteRect.left - 5; // 笔记左边缘稍微偏左
            const y2 = noteRect.top + noteRect.height / 2; // 笔记中点
            
            newLines.push({ wordId: word.id, x1, y1, x2, y2 });
          }
        }
      });
      
      setConnectionLines(newLines);
    };

    // 初始计算 - 稍微延迟确保DOM已经完全渲染
    const timer = setTimeout(() => {
      calculateConnections();
      
      // 第一次计算后再次检查，有时第一次计算可能不准确
      setTimeout(calculateConnections, 500);
    }, 300);

    // 添加各种事件监听
    window.addEventListener('resize', calculateConnections);
    window.addEventListener('scroll', calculateConnections, true); // 捕获阶段，监听任何滚动
    
    // 找到所有可能触发滚动的元素并添加监听
    const scrollContainers = [
      document.querySelector('.flex-1.p-4.relative'), // 单词列表容器
      document.querySelector('.overflow-y-auto'),     // 可能的滚动容器
      document.documentElement                       // 整个文档
    ].filter(Boolean);
    
    scrollContainers.forEach(container => {
      container?.addEventListener('scroll', calculateConnections);
    });
    
    // 定期重新计算，以应对任何可能的布局变化
    const intervalTimer = setInterval(calculateConnections, 2000);

    // 清理事件监听器
    return () => {
      clearTimeout(timer);
      clearInterval(intervalTimer);
      window.removeEventListener('resize', calculateConnections);
      window.removeEventListener('scroll', calculateConnections, true);
      
      scrollContainers.forEach(container => {
        container?.removeEventListener('scroll', calculateConnections);
      });
    };
  }, [wordsWithNotes, collapsed, isMobile]);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  if (wordsWithNotes.length === 0) {
    return null; // 如果没有带笔记的单词，不显示面板
  }

  // 针对不同设备的样式
  const panelPositionClass = isMobile
    ? "fixed bottom-4 right-4 left-4 max-h-[40vh] z-40" // 移动设备底部
    : "fixed right-6 top-1/2 transform -translate-y-1/2 w-64 max-h-[80vh] z-40"; // 桌面设备右侧
    
  // 切换按钮位置
  const toggleButtonClass = isMobile
    ? "absolute -top-10 right-0"
    : "absolute -left-10 top-0";
    
  // 面板内容样式
  const contentClass = collapsed
    ? "hidden" // 折叠时隐藏内容
    : "space-y-3"; // 展开时显示内容

  // 动态计算贝塞尔曲线控制点
  const getPathD = (line: ConnectionLine) => {
    if (isMobile) {
      // 移动设备上的垂直曲线
      return `M ${line.x1} ${line.y1} 
              C ${line.x1} ${line.y1 + 50}, 
                ${line.x2} ${line.y2 - 50}, 
                ${line.x2} ${line.y2}`;
    } else {
      // 桌面设备上的水平曲线
      return `M ${line.x1} ${line.y1} 
              C ${line.x1 + 100} ${line.y1}, 
                ${line.x2 - 100} ${line.y2}, 
                ${line.x2} ${line.y2}`;
    }
  };

  return (
    <>
      {/* 连线容器 - 覆盖整个视口 */}
      <div 
        ref={linesContainerRef}
        className="fixed inset-0 pointer-events-none z-30"
      >
        <svg width="100%" height="100%" className="absolute top-0 left-0">
          {!collapsed && connectionLines.map((line, index) => (
            <path 
              key={`line-${line.wordId}-${index}`}
              d={getPathD(line)}
              stroke="#3b82f6"
              strokeWidth="1.8"
              strokeDasharray="5,4"
              fill="none"
              style={{ filter: "drop-shadow(0 1px 1px rgba(59, 130, 246, 0.2))" }}
            />
          ))}
        </svg>
      </div>

      {/* 笔记面板 */}
      <div 
        ref={panelRef}
        className={`annotation-panel ${panelPositionClass} overflow-y-auto scrollbar-hide`}
      >
        <style>
          {`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}
        </style>
        {/* 切换按钮 */}
        <Button 
          size="sm" 
          variant="outline" 
          className={`${toggleButtonClass} p-1 h-8 w-8 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700`}
          onClick={toggleCollapse}
          aria-label={collapsed ? "展开笔记" : "折叠笔记"}
        >
          {collapsed 
            ? (isMobile ? <Info className="w-4 h-4 text-blue-500" /> : <ChevronLeft className="w-4 h-4" />) 
            : (isMobile ? <ChevronRight className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)
          }
        </Button>
        
        <Card className={`p-3 border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${darkMode ? 'dark' : ''}`}>
          <div className="flex items-center justify-between gap-1 mb-3">
            <div className="flex items-center gap-1">
              <Info className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">单词笔记</h3>
            </div>
            
            {/* 计数显示 */}
            <span className="text-xs text-gray-500 dark:text-gray-400">{wordsWithNotes.length} 条笔记</span>
          </div>
          
          <div className={contentClass}>
            {wordsWithNotes.map((word) => (
              <div 
                key={word.id} 
                className="relative note-item p-2 border border-gray-200 dark:border-gray-700 rounded-md"
                data-word-id={word.id} // 用于连线定位
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">{word.word}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{word.notes}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}; 