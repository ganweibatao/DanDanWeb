import React, { useState, useEffect, useRef } from 'react';
import { Volume2, X, Check, ChevronDown } from 'lucide-react';

interface Word {
  id: number;
  text: string;
  phonetic?: string;
  meaning?: string;
  partOfSpeech?: string;
  examples?: string[];
}

interface FlashcardViewProps {
  words: Word[]; // The list of words for the flashcard session
  initialWordIndex?: number; // Optional: to start from a specific word
  onClose: () => void; // Function to call when closing the flashcard view
  onWordKnown?: (wordId: number) => void; // Optional: callback when a word is marked as known
  onWordUnknown?: (wordId: number) => void; // Optional: callback when a word is marked as unknown
}

const FlashcardView: React.FC<FlashcardViewProps> = ({
  words,
  initialWordIndex = 0,
  onClose,
  onWordKnown,
  onWordUnknown,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialWordIndex);
  const [isFlipped, setIsFlipped] = useState(false); // To show word or meaning
  const [displayMode, setDisplayMode] = useState<'chineseFront' | 'englishFront' | 'testMode'>('englishFront');
  const [showDropdown, setShowDropdown] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [testErrorCount, setTestErrorCount] = useState(0);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [showCorrectFeedback, setShowCorrectFeedback] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        if (displayMode === 'testMode') {
          setTestInput('');
        } else {
          setIsFlipped(prev => !prev);
        }
      } else if (event.key === 'Enter' && displayMode === 'testMode') {
        event.preventDefault();
        // 检查事件目标，如果是input元素，则跳过（已在input的onKeyDown中处理）
        if ((event.target as HTMLElement)?.tagName === 'INPUT') {
          return;
        }
        if (showCorrectAnswer) {
          // 显示答案状态下，回车进入下一个
          handleNextCard(false); // 标记为不认识
        } else {
          // 正常测试状态下，回车确认答案（但input已经处理过了，这里通常不会执行）
          handleTestSubmit();
        }
      } else if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'k') { // Next card / Known
        if (displayMode !== 'testMode') {
          handleNextCard(true);
        }
      } else if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'u') { // Previous card / Unknown (or just next if configured)
        if (displayMode !== 'testMode') {
          handleNextCard(false);
        }
      } else if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex, words, onClose, onWordKnown, onWordUnknown, displayMode, showCorrectAnswer, testInput, testErrorCount]);

  useEffect(() => {
    // Reset flip state and test input when word changes
    setIsFlipped(false);
    setTestInput('');
    setTestErrorCount(0);
    setShowCorrectAnswer(false);
    setShowCorrectFeedback(false);
    
    // 在测试模式下自动播放新单词的发音
    const word = words[currentIndex];
    if (displayMode === 'testMode' && word) {
      // 立即停止当前语音
      speechSynthesis.cancel();
      
      // 使用较短的延迟来播放新语音
      const timer = setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(word.text);
        utterance.lang = 'en-US';
        speechSynthesis.speak(utterance);
      }, 100);
      
      return () => {
        clearTimeout(timer);
        speechSynthesis.cancel(); // 清理时也停止语音
      };
    }
  }, [currentIndex, displayMode, words]);

  // 专门处理输入框自动聚焦
  useEffect(() => {
    if (displayMode === 'testMode' && !showCorrectAnswer && !showCorrectFeedback && inputRef.current) {
      // 使用短延迟确保DOM更新完成
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [currentIndex, displayMode, showCorrectAnswer, showCorrectFeedback]);

  const currentWord = words[currentIndex];

  if (!currentWord) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 text-white">
        <p>没有可供学习的卡片了。</p>
        <button
          onClick={onClose}
          className="ml-4 px-4 py-2 bg-duo-green text-white rounded-lg"
        >
          关闭
        </button>
      </div>
    );
  }

  const handleTestSubmit = () => {
    if (!testInput.trim()) return;
    
    // 更robust的比较逻辑，去除所有空格和特殊字符
    const normalizeText = (text: string) => {
      return text.toLowerCase().trim().replace(/\s+/g, '').replace(/[^\w]/g, '');
    };
    
    const userInput = normalizeText(testInput);
    const correctAnswer = normalizeText(currentWord.text);
    
    const isCorrect = userInput === correctAnswer;
    
    if (isCorrect) {
      // 正确答案，显示正确反馈然后进入下一个单词
      setShowCorrectFeedback(true);
      setTimeout(() => {
        if (onWordKnown) {
          onWordKnown(currentWord.id);
        }
        handleNextCard(true);
      }, 800); // 显示正确反馈 800ms 后进入下一个单词
    } else {
      // 错误答案，增加错误次数
      const newErrorCount = testErrorCount + 1;
      setTestErrorCount(newErrorCount);
      
      if (newErrorCount >= 2) {
        // 两次错误，显示正确答案
        setShowCorrectAnswer(true);
      } else {
        // 清空输入，让用户重新尝试
        setTestInput('');
      }
    }
  };

  const handleNextCard = (known: boolean) => {
    if (known && onWordKnown) {
      onWordKnown(currentWord.id);
    } else if (!known && onWordUnknown) {
      onWordUnknown(currentWord.id);
    }

    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Reached the end of the list
      // Optionally: show a completion message or loop back
      onClose(); // For now, just close
    }
  };

  const handlePlaySound = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`播放单词发音: ${currentWord.text}`);
    // Actual sound playing logic here
    const utterance = new SpeechSynthesisUtterance(currentWord.text);
    utterance.lang = 'en-US'; // Set the language for the speech
    speechSynthesis.speak(utterance);
  };

  return (
        <div className={`fixed inset-0 flex items-center justify-center z-[100] p-6 pointer-events-none`}>
      {/* Card Container */}
       <div className={`relative bg-white rounded-3xl shadow-md max-w-2xl w-full mx-auto pointer-events-auto overflow-hidden`}>
        
        {/* Close Button - Top Right */}
        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }} 
          className={`absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-colors text-gray-500 hover:bg-gray-100`}
          title="退出词卡"
        >
          <X size={24}/> 
        </button>

        {/* 下拉按钮 - 右上角第二个位置 */}
        <div className="absolute top-4 right-16 z-10">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowDropdown(!showDropdown); }} 
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors text-gray-500 hover:bg-gray-100"
            title="切换显示模式"
          >
            <ChevronDown size={20}/> 
          </button>
          
          {/* 下拉菜单 */}
          {showDropdown && (
            <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[120px]">
              <button
                onClick={(e) => { e.stopPropagation(); setDisplayMode('englishFront'); setShowDropdown(false); }}
                className={`w-full text-left px-4 py-2 hover:bg-gray-50 text-sm ${displayMode === 'englishFront' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
              >
                正面英文
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setDisplayMode('chineseFront'); setShowDropdown(false); }}
                className={`w-full text-left px-4 py-2 hover:bg-gray-50 text-sm ${displayMode === 'chineseFront' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
              >
                正面中文
              </button>
              <button
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setDisplayMode('testMode'); 
                  setShowDropdown(false); 
                  setTestInput(''); 
                  setTestErrorCount(0); 
                  setShowCorrectAnswer(false); 
                }}
                className={`w-full text-left px-4 py-2 hover:bg-gray-50 text-sm ${displayMode === 'testMode' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
              >
                测试模式
              </button>
            </div>
          )}
        </div>

        {/* 发音按钮 - 左上角 */}
        <button 
          onClick={handlePlaySound} 
          className="absolute top-4 left-4 z-10 w-12 h-12 rounded-full border-2 border-gray-300 text-gray-600 flex items-center justify-center hover:bg-gray-50 transition-colors"
          title="播放发音"
        >
          <Volume2 size={28} />
        </button>

        {/* Card Content */}
        <div className="flex flex-col h-full min-h-[500px]">
          
          {/* 顶部占位（保留高度以保持布局一致，可根据需要删除） */}
          <div className="h-16" />

          {/* Main Card Area */}
          <div
            className={`flex-grow flex items-center justify-center p-8 ${displayMode !== 'testMode' ? 'cursor-pointer' : ''}`}
            onClick={() => displayMode !== 'testMode' && setIsFlipped(prev => !prev)}
          >
            <div className={`text-center select-none transition-all duration-300 text-gray-800 w-full`}>
              {displayMode === 'testMode' ? (
                // 测试模式显示
                <div>
                  <div className="text-2xl md:text-3xl font-bold mb-6 text-gray-700">
                    {currentWord.meaning || '暂无释义'}
                  </div>
                  
                  <div>
                    {/* 输入框 - 始终显示 */}
                    <input
                      ref={inputRef}
                      type="text"
                      value={testInput}
                      onChange={(e) => setTestInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          e.stopPropagation(); // 阻止事件冒泡，避免被全局事件处理器重复处理
                          if (showCorrectAnswer) {
                            // 显示答案状态下，回车进入下一个
                            handleNextCard(false); // 标记为不认识
                          } else {
                            handleTestSubmit();
                          }
                        }
                      }}
                      placeholder="请输入英文单词"
                      className={`w-full max-w-md px-4 py-3 text-2xl text-center border-2 rounded-xl focus:outline-none transition-all ${
                        showCorrectFeedback 
                          ? 'border-duo-green bg-green-50 text-duo-green' 
                          : showCorrectAnswer 
                            ? 'border-red-300 bg-red-50' 
                            : 'border-gray-300 focus:border-blue-500'
                      }`}
                      disabled={showCorrectAnswer || showCorrectFeedback}
                    />
                    
                    {/* 错误次数提示 */}
                    {testErrorCount > 0 && !showCorrectAnswer && !showCorrectFeedback && (
                      <div className="mt-4 text-lg text-orange-600">
                        错误 {testErrorCount}/2 次
                      </div>
                    )}
                    
                    {/* 正确答案显示在输入框下方 */}
                    {showCorrectAnswer && (
                      <div className="mt-6 space-y-3">
                        <div className="text-lg text-red-500 font-semibold">
                          正确答案是：
                        </div>
                        <div className="text-3xl md:text-4xl font-bold text-blue-600 bg-blue-50 px-4 py-3 rounded-xl border-2 border-blue-200">
                          {currentWord.text}
                        </div>
                        {currentWord.phonetic && (
                          <div className="text-lg text-gray-600">
                            {currentWord.phonetic}
                          </div>
                        )}
                        <div className="text-sm text-gray-500 mt-4">
                          按回车键继续下一个单词
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // 正常模式显示
                <div>
                  <div className="text-4xl md:text-6xl font-bold mb-4">
                    {displayMode === 'englishFront' 
                      ? (isFlipped ? (currentWord.meaning || '暂无释义') : currentWord.text)
                      : (isFlipped ? currentWord.text : (currentWord.meaning || '暂无释义'))}
                  </div>
                  {/* 音标显示 - 只在英文正面且未翻转时显示 */}
                  {displayMode === 'englishFront' && !isFlipped && currentWord.phonetic && (
                    <div className="text-xl md:text-2xl opacity-70 text-gray-600">
                      {currentWord.phonetic}
                    </div>
                  )}
                  {/* 词性显示 - 翻转时显示 */}
                  {isFlipped && currentWord.partOfSpeech && (
                    <div className="text-base opacity-60 italic text-gray-500">
                      {currentWord.partOfSpeech}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="p-6 text-gray-700 border-t border-gray-100">
            
            {/* Hint Bar */}
            <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-center mb-6 text-sm">
              {displayMode === 'testMode' ? (
                showCorrectAnswer ? (
                  <>
                    <span className="opacity-70 mr-2">快捷键</span>
                    <kbd className="px-2 py-1 bg-white text-gray-800 rounded-md font-semibold shadow-sm">回车键</kbd>
                    <span className="opacity-70 mx-2">继续下一个</span>
                  </>
                ) : (
                  <>
                    <span className="opacity-70 mr-2">快捷键</span>
                    <kbd className="px-2 py-1 bg-white text-gray-800 rounded-md font-semibold shadow-sm">回车键</kbd>
                    <span className="opacity-70 mx-1">确认答案</span>
                    <span className="opacity-70 mx-1">|</span>
                    <kbd className="px-2 py-1 bg-white text-gray-800 rounded-md font-semibold shadow-sm">空格键</kbd>
                    <span className="opacity-70 mx-1">清空输入</span>
                  </>
                )
              ) : (
                <>
                  <span className="opacity-70 mr-2">快捷键</span>
                  <kbd className="px-2 py-1 bg-white text-gray-800 rounded-md font-semibold shadow-sm">空格键</kbd>
                  <span className="opacity-70 mx-2">翻转卡片</span>
                </>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center space-x-12">
              <button
                onClick={(e) => { e.stopPropagation(); handleNextCard(false); }}
                className="group flex flex-col items-center text-red-500 hover:text-red-600 transition-colors"
                title="不认识 (快捷键: U 或 ←)"
              >
                <div className="w-20 h-20 rounded-full border-4 border-red-500 group-hover:border-red-600 group-hover:bg-red-50 flex items-center justify-center mb-2 transition-all">
                  <X size={32} />
                </div>
                <span className="text-sm font-medium">不认识</span>
              </button>

              {/* Progress Indicator */}
              <div className="text-center text-gray-600">
                <div className="text-2xl font-bold mb-1">
                  {currentIndex + 1} / {words.length}
                </div>
                <div className="text-xs opacity-70">
                  进度
                </div>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); handleNextCard(true); }}
                className="group flex flex-col items-center text-green-500 hover:text-green-600 transition-colors"
                title="认识 (快捷键: K 或 →)"
              >
                <div className="w-20 h-20 rounded-full border-4 border-green-500 group-hover:border-green-600 group-hover:bg-green-50 flex items-center justify-center mb-2 transition-all">
                  <Check size={32} />
                </div>
                <span className="text-sm font-medium">认识</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardView;

// Add some basic Duolingo-esque Tailwind colors if not already in tailwind.config.js
// Placeholder for tailwind.config.js
/**
 * module.exports = {
 *   theme: {
 *     extend: {
 *       colors: {
 *         'duo-green': '#58cc02',
 *         'duo-green-light': '#79d73a', // Lighter green for highlights/hovers
 *         'duo-blue': '#1cb0f6',
 *         'duo-blue-dark': '#1899d6', // Darker blue for pressed states or accents
 *         'duo-modal-blue': '#2e3a54', // Dark blue often used for modals/overlays
 *         'duo-blue-darker': '#232b40', // Even darker for elements within modal
 *         'duo-red': '#ff4b4b',
 *         'duo-red-light': '#ff7272',
 *         'duo-orange': '#ff9600',
 *         'duo-gray-light': '#e5e5e5',
 *         'duo-gray-medium': '#afafaf',
 *         'duo-gray-dark': '#777777',
 *         'duo-white': '#ffffff',
 *         'duo-textPrimary': '#3c3c3c',
 *         'duo-textSecondary': '#777777',
 *       }
 *     }
 *   }
 * }
 */ 