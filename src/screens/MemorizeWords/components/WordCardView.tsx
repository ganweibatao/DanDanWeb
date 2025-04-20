import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardFooter } from "../../../components/ui/card";
import { Popover, PopoverTrigger, PopoverContent } from "../../../components/ui/popover";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import { Label } from "../../../components/ui/label";
import { DisplayVocabularyWord } from "../types";
import { useSoundEffects } from "../../../hooks/useSoundEffects";

// Define settings type
type CardFaceSetting = 'english' | 'chinese' | 'both';

interface WordCardViewProps {
  word: DisplayVocabularyWord | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  darkMode: boolean;
  hasNext: boolean;
  hasPrev: boolean;
  onMarkUnknown?: () => void;
  onMarkKnown?: () => void;
  onUndoAction?: () => void;
  onShuffleAction?: () => void;
  currentIndex?: number;
  totalCount?: number;
  cardFaceSetting: CardFaceSetting;
  onSettingChange: (newSetting: CardFaceSetting) => void;
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
}

export const WordCardView: React.FC<WordCardViewProps> = ({
  word,
  onClose,
  onNext,
  onPrev,
  darkMode,
  hasNext,
  hasPrev,
  onMarkUnknown,
  onMarkKnown,
  onUndoAction,
  onShuffleAction,
  currentIndex,
  totalCount,
  cardFaceSetting,
  onSettingChange,
  isFullScreen,
  onToggleFullScreen,
}) => {
  const { playCorrectSound, playIncorrectSound } = useSoundEffects();

  const [isRevealed, setIsRevealed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const discardTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Determine if flipping is allowed based on setting
  const allowFlip = cardFaceSetting !== 'both';

  // Reset reveal state when word changes or flip becomes disallowed
  useEffect(() => {
    if (!allowFlip) {
      setIsRevealed(false);
    }
    // Reset discard state when word changes or fullscreen toggles
    setIsDiscarding(false);
    if (discardTimeoutRef.current) {
      clearTimeout(discardTimeoutRef.current);
    }
  }, [word, allowFlip, isFullScreen]);

  // Listener for Esc key - now calls onClose
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isFullScreen) {
          onClose(); // Let parent handle closing and resetting fullscreen
        } else {
          onClose(); // Also close if not fullscreen
        }
      }
    };
    // Only add listener if the component is potentially visible (word exists)
    if(word) { 
      window.addEventListener('keydown', handleKeyDown);
    }    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullScreen, onClose, word]);

  // Card click handler - disable flip if not allowed
  const handleCardClick = useCallback(() => {
    if (!allowFlip) return;
    setIsRevealed(prev => !prev);
  }, [allowFlip]);

  // Listener for arrow keys and space bar - disable space flip if not allowed
  useEffect(() => {
    const handleKeys = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement).tagName === 'INPUT' || (event.target as HTMLElement).tagName === 'TEXTAREA') {
          return;
      }
      if (event.key === 'ArrowLeft') {
        if (hasPrev && onPrev) { 
          onPrev();
        }
      } else if (event.key === 'ArrowRight') {
        if (hasNext && onNext) { 
          onNext();
        }
      } else if (allowFlip && (event.key === ' ' || event.code === 'Space')) { // Only flip if allowed
        event.preventDefault(); 
        handleCardClick(); 
      }
    };
    window.addEventListener('keydown', handleKeys);
    return () => {
      window.removeEventListener('keydown', handleKeys);
    };
  }, [onPrev, onNext, hasPrev, hasNext, handleCardClick, allowFlip]); 

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (discardTimeoutRef.current) {
        clearTimeout(discardTimeoutRef.current);
      }
    };
  }, []);

  // --- Wrap onMarkKnown to handle animation and sound ---
  const handleAnimatedMarkKnown = useCallback(() => {
    if (!onMarkKnown || isDiscarding) return;

    playCorrectSound();
    setIsDiscarding(true);

    // Clear any existing timeout
    if (discardTimeoutRef.current) {
      clearTimeout(discardTimeoutRef.current);
    }

    // Set new timeout
    discardTimeoutRef.current = setTimeout(() => {
      onMarkKnown(); // Call the original handler after animation
      // Resetting discard state might happen automatically on re-render, 
      // but explicit reset is safer if component doesn't unmount/re-render immediately.
      // We might reset it when the word prop changes instead.
      // setIsDiscarding(false); 
    }, 300); // Match animation duration (e.g., duration-300)

  }, [onMarkKnown, isDiscarding, playCorrectSound]);

  // --- Wrap onMarkUnknown to handle sound ---
   const handleMarkUnknownWithSound = useCallback(() => {
     if (onMarkUnknown) {
       playIncorrectSound();
       onMarkUnknown();
     }
   }, [onMarkUnknown, playIncorrectSound]);

  // Reset discard state when word changes
  useEffect(() => {
     setIsDiscarding(false);
      // Also clear timeout if word changes mid-animation (e.g., user uses arrow keys)
     if (discardTimeoutRef.current) {
       clearTimeout(discardTimeoutRef.current);
     }
  }, [word]);

  if (!word) {
    return null; 
  }

  // Helper components for front/back content to avoid repetition
  const EnglishFace = (
    <h1 className={`font-extrabold drop-shadow-lg tracking-wide text-center select-none transition-colors duration-300 \
      ${isFullScreen 
        ? `${darkMode ? 'text-gray-100' : 'text-gray-900'} text-8xl md:text-9xl`
        : 'text-gray-800 dark:text-gray-100 text-5xl' }
    `}>
      {word.word}
    </h1>
  );

  const ChineseFace = (
    <div className={`text-center select-none flex flex-row items-baseline justify-center \
      ${isFullScreen ? '' : ''}
    `}>
       {word.part_of_speech && (
         <p className={`text-gray-400 dark:text-gray-500 mr-3 italic \
           ${isFullScreen ? 'text-2xl' : 'text-base'}
         `}>
           {word.part_of_speech}
         </p>
       )}
       <p className={`font-semibold text-blue-600 dark:text-blue-400 \
         ${isFullScreen ? 'text-5xl md:text-6xl' : 'text-2xl'}
       `}>
         {word.translation || '暂无释义'} 
       </p>
    </div>
  );

  const BothFaces = (
    <div className={`flex flex-col items-center justify-center text-center select-none space-y-6 \
      ${isFullScreen ? 'scale-100' : 'scale-95'}
    `}>
      {EnglishFace}
      {ChineseFace}
    </div>
  );

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 \
      ${isFullScreen
        ? (darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-white') /* Fullscreen: bg depends on dark mode */
        : 'bg-white/60 dark:bg-black/50 backdrop-blur-lg p-4' /* Non-fullscreen: More transparent frosted glass overlay */ 
      } \
      `}>
      <style>{`
        .perspective { perspective: 1000px; }
        .transform-style-preserve-3d { transform-style: preserve-3d; }
        .rotate-x-180 { transform: rotateX(180deg); }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
      `}</style>
      <div className={`relative overflow-hidden transition-all duration-300 flex flex-col \
        ${isFullScreen 
          ? 'w-full h-full bg-transparent' 
          : 'w-full max-w-lg bg-white dark:bg-gray-800 rounded-3xl shadow-xl' }
      `}>
        {/* Top Left Page Number (Fullscreen Only) */}
        {isFullScreen && typeof currentIndex === 'number' && typeof totalCount === 'number' && totalCount > 0 && (
           <div className="absolute top-4 left-4 right-4 z-10 space-y-2">
             <span className={`text-lg font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
               {currentIndex + 1} / {totalCount}
             </span>
             {/* Progress Bar */}             
             <div className="w-full h-1.5 bg-gray-200/30 dark:bg-gray-700/50 rounded-full overflow-hidden">
                <div
                  className="h-1.5 bg-green-500 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${((currentIndex + 1) / totalCount) * 100}%` }}
                />
              </div>
           </div>
        )}
        {/* Top Right Control Buttons */}
        <div className="absolute top-4 right-4 z-20 flex gap-2">
           {/* Settings Button & Popover */}          
           <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-transform duration-150 hover:scale-105 active:scale-95">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4">              
              <RadioGroup 
                value={cardFaceSetting} 
                onValueChange={(value: string) => {
                   onSettingChange(value as CardFaceSetting);
                   setIsSettingsOpen(false); // Close popover on select
                }}
                className="grid gap-4"
              >
                <Label className="font-normal flex items-center space-x-2">
                  <RadioGroupItem value="english" />
                  <span>正面显示英文</span>
                </Label>
                <Label className="font-normal flex items-center space-x-2">
                  <RadioGroupItem value="chinese" />
                  <span>正面显示中文</span>
                </Label>
                <Label className="font-normal flex items-center space-x-2">
                  <RadioGroupItem value="both" />
                  <span>同时显示</span>
                </Label>
              </RadioGroup>
            </PopoverContent>
          </Popover>
          {/* Fullscreen Toggle Button uses the passed handler */}          
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-transform duration-150 hover:scale-105 active:scale-95" onClick={onToggleFullScreen}>
             {isFullScreen ? (
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
             ) : (
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
             )}
          </Button>
          {/* Close Button */}          
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-transform duration-150 hover:scale-105 active:scale-95"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </Button>
        </div>

        {/* Main Flipping Content Area */}
        <div 
          className={`flex-1 flex flex-col items-center justify-center relative perspective \
            ${allowFlip ? 'cursor-pointer' : 'cursor-default'} \
            ${isFullScreen ? 'p-12' : 'min-h-[250px] p-8'}
          `}
          onClick={handleCardClick}
        >
          {/* Animation Wrapper - Combined flip and discard */}
          <div className={`relative w-full h-full transform-style-preserve-3d \
            transition-all ease-out \
            ${allowFlip && isRevealed ? 'rotate-x-180' : ''} \
            ${isDiscarding ? 'duration-300 scale-50 opacity-0 -translate-y-full' : 'duration-700'}
          `}>
            {/* Front Face */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center backface-hidden">
              {cardFaceSetting === 'english' && EnglishFace}
              {cardFaceSetting === 'chinese' && ChineseFace}
              {cardFaceSetting === 'both' && BothFaces}
            </div>

            {/* Back Face */}
            {allowFlip && (
              <div className="absolute inset-0 w-full h-full flex items-center justify-center backface-hidden rotate-x-180">
                {cardFaceSetting === 'english' && ChineseFace}
                {cardFaceSetting === 'chinese' && EnglishFace}
                {/* 'both' setting doesn't have a distinct back face */}                
              </div>
            )}
          </div>
        </div>

        {isFullScreen ? (
           <div className="w-full p-4 bg-black/10 dark:bg-white/5 backdrop-blur-md rounded-t-lg flex flex-col items-center"> 
             {/* Hint Text */}            
             <div className="flex items-center text-sm text-gray-400 dark:text-gray-500 mb-4 space-x-2">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="7" y1="8" x2="7.01" y2="8"></line><line x1="7" y1="12" x2="7.01" y2="12"></line><line x1="7" y1="16" x2="7.01" y2="16"></line><line x1="12" y1="8" x2="17" y2="8"></line><line x1="12" y1="12" x2="17" y2="12"></line><line x1="12" y1="16" x2="17" y2="16"></line></svg>
               <span>快捷键:</span>
               <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">←</kbd>
               <span>上一个</span>
               <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">→</kbd>
               <span>下一个，</span>
               <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">空格键</kbd>
               <span>或单击卡片以翻页</span>
             </div>
             {/* Main Action Buttons (X, Check) */}
             <div className="flex justify-center items-center w-full gap-8 mb-4">
               <Button 
                 variant="outline" 
                 size="icon" 
                 className="w-20 h-20 rounded-full border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-600 dark:border-red-500/40 dark:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-transform duration-150 hover:scale-105 active:scale-95"
                 onClick={handleMarkUnknownWithSound}
               >
                 <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
               </Button>
               <Button 
                 variant="outline" 
                 size="icon" 
                 className="w-20 h-20 rounded-full border-green-500/50 text-green-500 hover:bg-green-500/10 hover:text-green-600 dark:border-green-500/40 dark:text-green-500 dark:hover:bg-green-500/10 dark:hover:text-green-400 transition-transform duration-150 hover:scale-105 active:scale-95"
                 onClick={handleAnimatedMarkKnown}
               >
                 <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
               </Button>
             </div>
             <div className="flex justify-center items-center w-full gap-6">
               <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-transform duration-150 hover:scale-105 active:scale-95" onClick={onUndoAction}>
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6 M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
               </Button>
               <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-transform duration-150 hover:scale-105 active:scale-95" onClick={onShuffleAction}>
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
               </Button>
             </div>
           </div>
        ) : (
          <CardFooter className={`flex justify-between transition-opacity duration-300 p-4 bg-gray-50 dark:bg-gray-700`}>
            <Button variant="outline" onClick={onPrev} disabled={!hasPrev} className="w-28 h-12 text-lg transition-transform duration-150 hover:scale-105 active:scale-95">
              上一个
            </Button>
            <Button variant="outline" onClick={onNext} disabled={!hasNext} className="w-28 h-12 text-lg transition-transform duration-150 hover:scale-105 active:scale-95">
              下一个
            </Button>
          </CardFooter>
        )}
      </div>
    </div>
  );
}; 