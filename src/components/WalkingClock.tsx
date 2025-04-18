import React, { useState, useEffect, useRef, useCallback } from 'react';

interface WalkingClockProps {
  // 可以添加一些 props 来自定义时钟，例如时区、颜色等
  darkMode?: boolean;
  initialPosition?: { x: number; y: number }; // 新增：初始位置 prop
}

// 定义拖动起始信息的类型
interface DragStartInfo {
  startX: number;
  startY: number;
  initialX: number;
  initialY: number;
}

export const WalkingClock: React.FC<WalkingClockProps> = ({ 
  darkMode = false, 
  initialPosition = { x: 64, y: window.innerHeight / 4 }
}) => {
  const [time, setTime] = useState(new Date());
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<DragStartInfo | null>(null);
  const clockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateClock = () => {
      setTime(new Date());
    };
    // Update immediately on mount
    updateClock(); 
    // Then update every minute
    const timerId = setInterval(updateClock, 60000); // 更新间隔改为 60 秒
    return () => clearInterval(timerId);
  }, []);

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    // 不再需要秒
    // const seconds = date.getSeconds().toString().padStart(2, '0'); 
    return `${hours}:${minutes}`; // 只返回时和分
  };

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!clockRef.current) return;
    setIsDragging(true);
    // 记录鼠标相对于视口的初始位置
    dragStartRef.current = { 
      startX: e.clientX, 
      startY: e.clientY, 
      initialX: position.x, 
      initialY: position.y 
    };
    // 防止拖动时选中文本
    e.preventDefault();
  }, [position.x, position.y]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragStartRef.current) return;
    
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;

    setPosition({
      x: dragStartRef.current.initialX + dx,
      y: dragStartRef.current.initialY + dy
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      dragStartRef.current = null;
    }
  }, [isDragging]);

  // Add and remove global listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    // Cleanup listeners when component unmounts or isDragging changes
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // TODO: 添加行走的动画效果
  // 这里可以使用 CSS animation 或者 SVG animation
  // const clockStyle: React.CSSProperties = { ... };

  return (
    <div 
      ref={clockRef} 
      className={`
        absolute p-2 rounded-lg border transition-colors duration-300 // Reduced padding
        shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 
        bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 
        border-gray-200 dark:border-gray-700 
        text-gray-800 dark:text-gray-200 
        font-mono text-xl font-semibold tracking-wider // Reduced font size
        ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
        select-none 
        z-50 
      `}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        // backdropFilter: 'blur(2px)', // Add subtle blur effect (might need browser prefix or check support)
        // Removed shadow-inner as it might conflict visually with the gradient and outer shadow
      }}
      onMouseDown={handleMouseDown}
    >
      <span>{formatTime(time)}</span>
      {/* Remove the small icon div */}
      {/* 
      <div className="text-sm text-center mt-1">
         ⏰
      </div> 
      */}
    </div>
  );
}; 