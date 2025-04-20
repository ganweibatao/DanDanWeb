import React, { useEffect, useState, useRef } from 'react';
import { Button } from '../../../components/ui/button';
import ReactConfetti from 'react-confetti';
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

  // Simplified Key listener - Only Esc to go back (if provided)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onGoBack) {
          onGoBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onGoBack]);

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
        if (rect.width > 0 && rect.height > 0) { // Ensure element has dimensions
          setConfettiOrigin({
            x: rect.left,
            y: rect.top,
            w: rect.width,
            h: rect.height
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
    <div className={`fixed inset-0 z-40 flex flex-col items-center justify-center p-4 font-sans ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}> 
      {/* Top Section: Congrats Message & Graphic */}      
      <div className="w-full max-w-3xl flex justify-between items-start px-8 pt-8 relative">
        <div className="max-w-md">
          <h1 className="text-3xl font-bold leading-tight">
            哇，您很棒！<br/>您已学过所有单词卡。
          </h1>
        </div>
        {/* Container for the SVG Popper and the origin ref */}        
        <div 
          ref={confettiOriginRef} 
          className={`absolute top-8 right-8 w-16 h-16 z-10 ${darkMode ? 'bg-gray-700/10' : 'bg-gray-300/10'}`} // Positioned SVG container + TEMP BG
        >
          {/* Draw the popper using SVG with theme colors */}          
          <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Cone Body (Theme-dependent Yellow) */}
            <polygon points="5,15 55,5 50,55" fill={darkMode ? '#FFDA61' : '#FBBF24'} /> 
            {/* Opening Rim (Theme-dependent Orange) */}
            <ellipse cx="30" cy="10" rx="25" ry="7" fill={darkMode ? '#FFA040' : '#F97316'} transform="rotate(5 30 10)"/>
          </svg>
        </div>
        {/* Configure ReactConfetti to use the origin */}        
        {runConfetti && confettiOrigin && ( 
          <ReactConfetti 
            numberOfPieces={300} 
            recycle={false} 
            gravity={0.2} 
            initialVelocityX={{ min: -10, max: 10 }}
            initialVelocityY={{ min: -15, max: 5 }} 
            confettiSource={confettiOrigin} 
            width={window.innerWidth} 
            height={window.innerHeight}
          />
        )}       
        {/* <div className="text-6xl">🎉</div> */} 
      </div>

      {/* Main Content Area - Apply theme classes */}      
      <div className={`w-full max-w-3xl p-8 rounded-2xl mt-4`}> 
        {/* Modified: Main container is now a row */}        
        <div className="flex flex-col md:flex-row items-center justify-around gap-12 md:gap-16">
          {/* Left Side: Progress Chart & Title */}          
          <div className="flex flex-col items-center space-y-4 flex-shrink-0">
            <h2 className={`text-xl font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>您的进展</h2>
            <div className="relative w-40 h-40"> 
              {/* SVG Progress Ring with theme colors */}
              <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="42" stroke={darkMode ? '#374151' : '#E5E7EB'} strokeWidth="10" />
                <circle 
                  cx="50" cy="50" r="42" stroke={darkMode ? '#10B981' : '#10B981'} strokeWidth="10" strokeLinecap="round" // Emerald color works in both modes
                  transform="rotate(-90 50 50)" 
                  strokeDasharray={`${2 * Math.PI * 42}`} 
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - (totalCount > 0 ? knownCount / totalCount : 0))}`} 
                  style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                />
              </svg>
              {/* Percentage Text with theme color */}              
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-3xl font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  {totalCount > 0 ? `${Math.round((knownCount / totalCount) * 100)}%` : '0%'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Side: Stat Bars & Actions */}          
          {/* Modified: Removed max-w-xs to allow it to take space, aligned items to center/start */}          
          <div className="flex flex-col items-center md:items-start space-y-6 w-full md:w-auto flex-1">
             {/* Stat Bars with theme colors */}             
             <div className="w-full max-w-xs">
               <div className={`flex items-center justify-between p-4 rounded-full mb-3 ${darkMode ? 'bg-teal-800/70' : 'bg-teal-100'}`}>
                 <span className={`font-medium ${darkMode ? 'text-teal-100' : 'text-teal-800'}`}>已了解</span>
                 <span className={`font-bold text-xl ${darkMode ? 'text-teal-100' : 'text-teal-900'}`}>{knownCount}</span>
               </div>
               <div className={`flex items-center justify-between p-4 rounded-full mb-3 ${darkMode ? 'bg-red-900/70' : 'bg-red-100'}`}>
                 <span className={`font-medium ${darkMode ? 'text-red-100' : 'text-red-800'}`}>仍在学</span>
                 <span className={`font-bold text-xl ${darkMode ? 'text-red-100' : 'text-red-900'}`}>{unknownCount}</span>
               </div>
               <div className={`flex items-center justify-between p-4 rounded-full ${darkMode ? 'bg-slate-700/70' : 'bg-slate-200'}`}>
                 <span className={`font-medium ${darkMode ? 'text-slate-100' : 'text-slate-700'}`}>剩余单词数量</span>
                 <span className={`font-bold text-xl ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>{remainingCount}</span>
               </div>
             </div>

            {/* Divider */}            
            {/* <hr className="border-gray-700 my-6" /> */} 
            {/* Added spacing via parent instead */}            

            {/* Subsequent Steps Section */}            
            <div className="pt-4 space-y-4 w-full max-w-xs">
              <h3 className={`text-xl font-semibold text-center md:text-left ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>后续步骤</h3>
              {onExit && (
                  <Button 
                    size="lg" 
                    // Basic blue button works okay in both modes, could refine further if needed
                    className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-full flex items-center justify-center gap-2 shadow-lg transition-transform duration-150 hover:scale-[1.02] active:scale-95"
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
                    className={`w-full h-14 text-lg font-semibold rounded-full shadow-md transition-transform duration-150 hover:scale-[1.02] active:scale-95 
                      ${darkMode 
                        ? 'border-gray-600/50 hover:border-gray-500 bg-gray-800/30 hover:bg-gray-700/50 text-gray-300 hover:text-white' 
                        : 'border-gray-300 hover:border-gray-400 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900'
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