import React, { useEffect, useState, useRef } from 'react';
import { Button } from '../../../components/ui/button';
import ReactConfetti from 'react-confetti';
import { X } from 'lucide-react'; // Import X icon for the close button
import { useSoundEffects } from '../../../hooks/useSoundEffects'; // 导入 hook
// Removed Card import as it's no longer used as the main wrapper
// import { Card } from '../../../components/ui/card'; 

interface CompletionSummaryProps {
  knownCount: number;
  unknownCount: number;
  totalCount: number;
  onRestart?: () => void; 
  onExit?: () => void; // Renamed from onPractice
  // onReviewDifficult is removed as per new design
  // onReviewDifficult?: () => void; 
  onGoBack?: () => void; 
  darkMode: boolean; // Now we'll use this
}

export const CompletionSummary: React.FC<CompletionSummaryProps> = ({
  knownCount,
  unknownCount,
  totalCount,
  onRestart,
  onExit, // Renamed from onPractice
  // onReviewDifficult, // Removed prop
  onGoBack,
  darkMode,
}) => {
  const remainingCount = Math.max(0, totalCount - knownCount - unknownCount); 
  const modalRef = useRef<HTMLDivElement>(null); // Ref for the modal itself
  const { playSummaryAppearSound } = useSoundEffects(); // 获取播放函数

  // --- Play sound on mount ---
  useEffect(() => {
    playSummaryAppearSound();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 空依赖数组确保只在挂载时播放一次

  // Simplified Key listener - Only Esc to go back (if provided)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (onGoBack) onGoBack();
        else if (onExit) onExit(); // Fallback to onExit if onGoBack is not provided
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
       // Check if the click target is the overlay itself
       const overlay = event.currentTarget as HTMLElement;
       if (overlay === event.target && modalRef.current) {
          // Clicked on the overlay, not the modal content
          if (onGoBack) onGoBack();
          else if (onExit) onExit();
       }
    };

    // Add listener to the overlay when the component mounts
    const overlayElement = document.getElementById('completion-summary-overlay');
    if (overlayElement) {
       overlayElement.addEventListener('mousedown', handleClickOutside as EventListener);
    }
    window.addEventListener('keydown', handleKeyDown);

    return () => {
        // Remove listener when the component unmounts
        if (overlayElement) {
           overlayElement.removeEventListener('mousedown', handleClickOutside as EventListener);
        }
        window.removeEventListener('keydown', handleKeyDown);
    }
  }, [onGoBack, onExit]);

  // --- State for confetti --- 
  const [runConfetti, setRunConfetti] = useState(true);
  // --- Ref for confetti origin --- 
  const confettiOriginRef = useRef<HTMLDivElement>(null);
  // --- State for confetti origin coordinates (now includes w and h) --- 
  const [confettiOrigin, setConfettiOrigin] = useState<{ x: number; y: number; w: number; h: number; } | null>(null);

  // --- Effect to stop confetti & calculate origin (using rAF) ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setRunConfetti(false);
    }, 5000);

    // Calculate origin after mount using requestAnimationFrame
    let animationFrameId: number;
    const calculateOrigin = () => {
      if (confettiOriginRef.current) {
        const rect = confettiOriginRef.current.getBoundingClientRect();
        // No need for parentRect here as confetti covers the viewport
        if (rect.width > 0 && rect.height > 0) {
          setConfettiOrigin({
            x: rect.left,
            y: rect.top,
            w: rect.width,
            h: rect.height,
          });
        } else {
          // Retry if dimensions are 0 (element might not be ready)
          animationFrameId = requestAnimationFrame(calculateOrigin);
        }
      }
    };
    animationFrameId = requestAnimationFrame(calculateOrigin);

    return () => {
       clearTimeout(timer);
       cancelAnimationFrame(animationFrameId); // Cleanup rAF
    }
  }, []); // Empty dependency array means this runs once on mount


  return (
    // Re-added the background overlay div
    <div
       id="completion-summary-overlay" // Added ID for click outside listener
       className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      {/* 2. Modal Container */}
      <div
        ref={modalRef} // Add ref here
        className={`relative w-full max-w-3xl rounded-2xl shadow-2xl font-sans overflow-hidden ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
      >
        {/* Optional: Close Button */}
        {(onGoBack || onExit) && (
          <button
            onClick={onGoBack || onExit}
            className={`absolute top-4 right-4 p-1 rounded-full transition-colors z-20 ${darkMode ? 'text-gray-400 hover:bg-gray-700 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}
            aria-label="Close summary"
          >
            <X size={20} />
          </button>
        )}

        {/* Top Section: Congrats Message & Graphic */}      
        <div className="relative flex justify-between items-start px-8 pt-8 pb-4">
          {/* Left: Text */}
          <div className="max-w-md">
            <h1 className="text-3xl font-bold leading-tight mb-2">
              哇，您很棒！<br/>您已学过所有单词卡。
            </h1>
          </div>
          {/* Right: Popper Graphic Container (relative to this section) */}
          <div
            ref={confettiOriginRef}
            className={`absolute top-8 right-8 w-16 h-16 z-10`} // Removed temp background
          >
            {/* Draw the popper using SVG with theme colors */}          
            <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              {/* Cone Body (Theme-dependent Yellow) */}
              <polygon points="5,15 55,5 50,55" fill={darkMode ? '#FFDA61' : '#FBBF24'} /> 
              {/* Opening Rim (Theme-dependent Orange) */}
              <ellipse cx="30" cy="10" rx="25" ry="7" fill={darkMode ? '#FFA040' : '#F97316'} transform="rotate(5 30 10)"/>
            </svg>
          </div>
          {/* Confetti Source - Adjusted to use window dimensions, but source is the graphic */}
          {runConfetti && confettiOrigin && (
            <ReactConfetti
              numberOfPieces={250}
              recycle={false}
              gravity={0.15}
              initialVelocityX={{ min: -8, max: 8 }}
              initialVelocityY={{ min: -12, max: 4 }}
              confettiSource={confettiOrigin}
              // Use viewport dimensions for the confetti canvas
              width={window.innerWidth}
              height={window.innerHeight}
              // Style to position the canvas correctly
              style={{ position: 'fixed', top: 0, left: 0, zIndex: 55 }} // Ensure it's behind the modal but covers the screen
              className="pointer-events-none" // Don't block interactions
            />
          )}       
          {/* <div className="text-6xl">🎉</div> */} 
        </div>

        {/* Main Content Area - Adjusted padding */}      
        <div className={`w-full px-8 pb-8 pt-4 rounded-b-2xl flex flex-row items-center justify-center gap-16`}>
          {/* Modified: Main container is now a row */}        
          <div className="flex flex-col items-center space-y-3 flex-shrink-0">
            <h2 className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>您的进展</h2>
            <div className="relative w-40 h-40"> 
              {/* SVG Progress Ring with theme colors */}
              <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="45" stroke={darkMode ? '#4B5563' : '#E5E7EB'} strokeWidth="8" />
                <circle 
                  cx="50" cy="50" r="45" stroke={darkMode ? '#34D399' : '#10B981'} strokeWidth="8" strokeLinecap="round" // Emerald color works in both modes
                  transform="rotate(-90 50 50)" 
                  strokeDasharray={`${2 * Math.PI * 45}`} 
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - (totalCount > 0 ? knownCount / totalCount : 0))}`} 
                  style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
                />
              </svg>
              {/* Percentage Text with theme color */}              
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-3xl font-bold ${darkMode ? 'text-emerald-300' : 'text-emerald-600'}`}>
                  {totalCount > 0 ? `${Math.round((knownCount / totalCount) * 100)}%` : '0%'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Side: Stat Bars & Actions */}          
          {/* Modified: Removed max-w-xs to allow it to take space, aligned items to center/start */}          
          <div className="flex flex-col items-stretch space-y-4 w-full max-w-xs">
             {/* Stat Bars with theme colors */}             
             <div className="space-y-2.5">
               <div className={`flex items-center justify-between px-4 py-3 rounded-lg ${darkMode ? 'bg-cyan-800/60' : 'bg-cyan-100/70'}`}>
                 <span className={`font-medium text-sm ${darkMode ? 'text-cyan-100' : 'text-cyan-800'}`}>已了解</span>
                 <span className={`font-bold text-base ${darkMode ? 'text-cyan-100' : 'text-cyan-900'}`}>{knownCount}</span>
               </div>
               <div className={`flex items-center justify-between px-4 py-3 rounded-lg ${darkMode ? 'bg-rose-900/60' : 'bg-rose-100/70'}`}>
                 <span className={`font-medium text-sm ${darkMode ? 'text-rose-100' : 'text-rose-800'}`}>仍在学</span>
                 <span className={`font-bold text-base ${darkMode ? 'text-rose-100' : 'text-rose-900'}`}>{unknownCount}</span>
               </div>
               <div className={`flex items-center justify-between px-4 py-3 rounded-lg ${darkMode ? 'bg-slate-700/60' : 'bg-slate-200/70'}`}>
                 <span className={`font-medium text-sm ${darkMode ? 'text-slate-100' : 'text-slate-700'}`}>剩余单词数量</span>
                 <span className={`font-bold text-base ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>{remainingCount}</span>
               </div>
             </div>

            {/* Divider */}            
            {/* <hr className="border-gray-700 my-6" /> */} 
            {/* Added spacing via parent instead */}            

            {/* Subsequent Steps Section */}            
            <div className="pt-4 space-y-3">
              <h3 className={`text-base font-medium text-left mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>后续步骤</h3>
              {onExit && (
                  <Button 
                    size="lg" 
                    // Basic blue button works okay in both modes, could refine further if needed
                    className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold rounded-lg flex items-center justify-center shadow-md transition-transform duration-150 hover:scale-[1.02] active:scale-95"
                    onClick={onExit}
                  >
                     退出
                  </Button>
              )}
              {/* Removed Review Difficult Button */}              
              {onRestart && (
                  <Button 
                    variant="outline"
                    size="lg" 
                    className={`w-full h-10 text-base font-semibold rounded-lg shadow-sm transition-transform duration-150 hover:scale-[1.02] active:scale-95 
                      ${darkMode 
                        ? 'border-gray-600 hover:border-gray-500 bg-gray-700/50 hover:bg-gray-700/80 text-gray-300 hover:text-white' 
                        : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                      }`}
                    onClick={onRestart}
                  >
                     重新开始单词卡模式
                  </Button>
              )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 