import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
    ArrowLeft, ArrowRight, Shuffle, Search, Sun, Moon, Home, Settings, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from "../../components/ui/input";

// 单词数据结构
interface Word {
  id: number;
  word: string;
  translation: string;
  pronunciation?: string;
}

// 模拟数据 - 实际项目中应从API获取
const mockWords: Word[] = [
  { id: 1, word: 'apple', translation: '苹果', pronunciation: '/ˈæpl/' },
  { id: 2, word: 'banana', translation: '香蕉', pronunciation: '/bəˈnɑːnə/' },
  { id: 3, word: 'cherry', translation: '樱桃', pronunciation: '/ˈtʃeri/' },
  { id: 4, word: 'date', translation: '枣子', pronunciation: '/deɪt/' },
  { id: 5, word: 'elderberry', translation: '接骨木莓', pronunciation: '/ˈeldərberi/' },
  { id: 6, word: 'fig', translation: '无花果', pronunciation: '/fɪɡ/' },
  { id: 7, word: 'grape', translation: '葡萄', pronunciation: '/ɡreɪp/' },
  { id: 8, word: 'honeydew', translation: '哈密瓜', pronunciation: '/ˈhʌniduː/' },
  { id: 9, word: 'kiwi', translation: '猕猴桃', pronunciation: '/ˈkiːwiː/' },
  { id: 10, word: 'lemon', translation: '柠檬', pronunciation: '/ˈlemən/' },
  { id: 11, word: 'mango', translation: '芒果', pronunciation: '/ˈmæŋɡoʊ/' },
  { id: 12, word: 'nectarine', translation: '油桃', pronunciation: '/ˈnektəriːn/' },
  { id: 13, word: 'orange', translation: '橙子', pronunciation: '/ˈɔːrɪndʒ/' },
  { id: 14, word: 'papaya', translation: '木瓜', pronunciation: '/pəˈpaɪə/' },
  { id: 15, word: 'quince', translation: '榅桲', pronunciation: '/kwɪns/' },
];

const WORDS_PER_PAGE = 5;

// Fisher-Yates (aka Knuth) Shuffle 算法
const shuffleArray = <T,>(array: T[]): T[] => {
  let currentIndex = array.length, randomIndex;
  const newArray = [...array]; // 创建副本以避免修改原数组

  // 当还存在可以洗牌的元素时
  while (currentIndex !== 0) {
    // 挑选一个剩余元素
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // 并与当前元素交换
    [newArray[currentIndex], newArray[randomIndex]] = [
      newArray[randomIndex], newArray[currentIndex]];
  }

  return newArray;
};


export const MemorizeWords = () => {
  const navigate = useNavigate();
  const [originalWords] = useState<Word[]>(mockWords);
  const [shuffledWords, setShuffledWords] = useState<Word[]>([]); // 单独存储打乱后的单词列表
  const [displayedWords, setDisplayedWords] = useState<Word[]>(mockWords);
  const [currentPage, setCurrentPage] = useState(1);
  const [isShuffled, setIsShuffled] = useState(false);
  // 添加动画状态
  const [animationDirection, setAnimationDirection] = useState<'next' | 'prev' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  // 添加搜索状态
  const [searchQuery, setSearchQuery] = useState("");
  // 添加 darkMode 状态
  const [darkMode, setDarkMode] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false); // State for sidebar expansion
  
  // 遮板状态变量
  const [showCover, setShowCover] = useState(false); // 是否显示遮板
  const [coverPosition, setCoverPosition] = useState(50); // 遮板位置百分比，默认50%
  const [isDragging, setIsDragging] = useState(false); // 是否正在拖动遮板
  
  // Ref for the search input
  const searchInputRef = useRef<HTMLInputElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null); // Ref for sidebar to detect clicks outside
  const wordListRef = useRef<HTMLDivElement>(null); // Ref for word list container to calculate positions

  // 修改状态，从Set改为临时显示单词的id
  const [revealedWordId, setRevealedWordId] = useState<number | null>(null);

  // 处理单词点击
  const handleWordClick = (wordId: number) => {
    setRevealedWordId(wordId);
  };

  // 计算总页数
  const totalPages = Math.ceil(displayedWords.length / WORDS_PER_PAGE);

  // 获取当前页要显示的单词
  const currentWords = useMemo(() => {
    const startIndex = (currentPage - 1) * WORDS_PER_PAGE;
    const endIndex = startIndex + WORDS_PER_PAGE;
    return displayedWords.slice(startIndex, endIndex);
  }, [currentPage, displayedWords]);

  // 优化翻页动画逻辑
  const handlePageTransition = (direction: 'next' | 'prev') => {
    if (isAnimating) return;
    
    setAnimationDirection(direction);
    setIsAnimating(true);
    
    // 执行翻页
    if (direction === 'next') {
      handleNextPage();
    } else {
      handlePrevPage();
    }
    
    // 动画结束后清除状态
    setTimeout(() => {
      setIsAnimating(false);
      setAnimationDirection(null);
    }, 300); // 减少动画时间
  };

  // 处理翻页
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // 优化打乱/恢复顺序功能
  const toggleShuffle = () => {
    // 先停止任何可能正在进行的动画
    if (isAnimating) return;
    
    // 设置翻转动画状态
    setIsAnimating(true);
    setAnimationDirection(null);
    
    // 切换状态
    if (isShuffled) {
      // 恢复原始顺序
      setDisplayedWords(searchQuery.trim() === "" ? originalWords : 
        originalWords.filter(word => 
          word.word.toLowerCase().includes(searchQuery.toLowerCase()) || 
          word.translation.includes(searchQuery)
        ));
      setIsShuffled(false);
    } else {
      // 只在第一次打乱或重新打乱时重新生成打乱序列
      if (shuffledWords.length === 0) {
        const newShuffledWords = shuffleArray(originalWords);
        setShuffledWords(newShuffledWords);
        
        // 根据当前搜索过滤显示的单词
        setDisplayedWords(searchQuery.trim() === "" ? newShuffledWords : 
          newShuffledWords.filter(word => 
            word.word.toLowerCase().includes(searchQuery.toLowerCase()) || 
            word.translation.includes(searchQuery)
          ));
      } else {
        // 使用已存在的打乱序列
        setDisplayedWords(searchQuery.trim() === "" ? shuffledWords : 
          shuffledWords.filter(word => 
            word.word.toLowerCase().includes(searchQuery.toLowerCase()) || 
            word.translation.includes(searchQuery)
          ));
      }
      setIsShuffled(true);
    }
    
    // 检查当前页是否超出范围
    const newTotalPages = Math.ceil(displayedWords.length / WORDS_PER_PAGE);
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages || 1);
    }
    
    // 设置足够长的动画时间，考虑最后一张卡片的延迟（400ms）加上动画本身时间（600ms）
    setTimeout(() => {
      setIsAnimating(false);
    }, 1000);
  };

  // 朗读单词功能 
  // TODO: 未来需要集成实际的文本转语音API
  const handleReadWord = (word: string) => {
    // 这里将来应集成实际的文本到语音API
    console.log(`朗读单词: ${word}`);
    
    // 可以添加一个临时的视觉反馈
    alert(`朗读单词: ${word} (文本转语音API尚未集成)`);
  };


  // 添加单词集合标题
  const currentWordSet = "Unit 1";

  // 获取动画类名
  const getAnimationClass = () => {
    if (!isAnimating) return '';
    
    // 为打乱或恢复顺序设置翻转动画
    if (animationDirection === null) {
      return 'animate-card-flip';
    }
    
    switch(animationDirection) {
      case 'next': return 'animate-slide-left-smooth';
      case 'prev': return 'animate-slide-right-smooth';
      default: return 'animate-fade-smooth'; 
    }
  };

  // 根据搜索关键词过滤单词，同时保持当前打乱状态
  useEffect(() => {
    if (searchQuery.trim() === "") {
      // 如果搜索框为空，根据当前是否打乱状态显示适当的列表
      setDisplayedWords(isShuffled ? shuffledWords : originalWords);
    } else {
      // 搜索过滤时，从打乱或原始列表中筛选
      const sourceList = isShuffled ? shuffledWords : originalWords;
      const filteredWords = sourceList.filter(word => 
        word.word.toLowerCase().includes(searchQuery.toLowerCase()) || 
        word.translation.includes(searchQuery)
      );
      setDisplayedWords(filteredWords);
    }
    
    // 检查当前页是否超出范围
    const newTotalPages = Math.ceil(displayedWords.length / WORDS_PER_PAGE);
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages || 1);
    }
  }, [searchQuery, isShuffled, originalWords, shuffledWords]);

  // 处理搜索输入变化
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // 添加 useEffect 来处理 darkMode 类切换
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(darkMode ? 'light' : 'dark');
    root.classList.add(darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // 切换模式的函数
  const toggleDarkMode = () => setDarkMode(!darkMode);

  // 修改 handleGoHome 函数
  const handleGoHome = () => {
    console.log("Navigate to Student Center");
    navigate('/students');
  };

  const handleGoToSettings = () => console.log("Navigate to Settings");
  const handleSearchClick = () => {
    setIsSearchFocused(true);
    // 直接聚焦输入框
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50); // 减少延迟时间
  };

  // 优化搜索关闭
  const handleCloseSearch = () => {
    setIsSearchFocused(false);
    setSearchQuery(""); // 清空搜索内容
    // 聚焦回主内容
    wordListRef.current?.focus();
  };

  // Effect to handle clicking outside the sidebar to close search
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        // Clicked outside the sidebar
        if (isSearchFocused) {
           handleCloseSearch();
        }
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarRef, isSearchFocused]); // Re-run if ref or state changes

  // 处理遮板拖动
  const handleCoverDragStart = () => {
    setIsDragging(true);
  };
  
  const handleCoverDrag = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !wordListRef.current) return;
    
    // 获取触摸/鼠标位置
    let clientX: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }
    
    // 计算位置并限制范围
    const rect = wordListRef.current.getBoundingClientRect();
    const newPosition = Math.min(Math.max(((clientX - rect.left) / rect.width) * 100, 0), 50);
    setCoverPosition(newPosition);
  };
  
  const handleCoverDragEnd = () => {
    setIsDragging(false);
  };
  
  // 添加鼠标/触摸按下事件处理函数
  const handleWordMouseDown = (wordId: number) => {
    if (showCover) {
      setRevealedWordId(wordId);
    }
  };

  // 添加鼠标/触摸释放事件处理函数
  const handleWordMouseUp = () => {
    setRevealedWordId(null);
  };

  // 添加鼠标/触摸离开事件处理函数，防止用户移出单词区域时没有释放
  const handleWordMouseLeave = () => {
    setRevealedWordId(null);
  };

  // 添加触摸事件结束处理函数
  const handleWordTouchEnd = () => {
    setRevealedWordId(null);
  };

  // 修改handleTestButtonClick，无需清空任何状态
  const handleTestButtonClick = () => {
    setShowCover(!showCover);
    if (!showCover) {
      // 设置遮板初始位置，不超过50%
      setCoverPosition(Math.min(50, 50));
    }
    // 确保关闭任何可能显示的单词
    setRevealedWordId(null);
  };
  
  // 全局触摸事件处理优化  
  useEffect(() => {
    // 全局鼠标移动处理
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging && wordListRef.current) {
        const clientX = e.clientX;
        const rect = wordListRef.current.getBoundingClientRect();
        const newPosition = Math.min(Math.max(((clientX - rect.left) / rect.width) * 100, 0), 50);
        setCoverPosition(newPosition);
      }
    };
    
    // 全局触摸移动处理
    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length > 0 && wordListRef.current) {
        const clientX = e.touches[0].clientX;
        const rect = wordListRef.current.getBoundingClientRect();
        const newPosition = Math.min(Math.max(((clientX - rect.left) / rect.width) * 100, 0), 50);
        setCoverPosition(newPosition);
      }
    };
    
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };
    
    // 添加事件监听
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('touchmove', handleGlobalTouchMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('touchend', handleGlobalMouseUp);
    
    return () => {
      // 移除事件监听
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, [isDragging]);

  return (
    // 主容器: 背景色适应暗黑模式，添加 relative 定位以便绝对/固定定位子元素
    <div className="relative h-screen bg-gray-100 dark:bg-black transition-colors duration-300 overflow-hidden">

      {/* 更新后的侧边栏: Fixed positioning, centered vertically, defined height */}
      <div
        ref={sidebarRef}
        className={`fixed top-1/2 left-4 transform -translate-y-1/2 ${
          isSearchFocused ? 'w-72' : 'w-24'
        } bg-white dark:bg-gray-900 p-3 flex flex-col items-center shadow-lg z-20 rounded-3xl transition-all duration-300 ease-in-out
        max-sm:top-4 max-sm:left-1/2 max-sm:-translate-x-1/2 max-sm:translate-y-0 max-sm:flex-row max-sm:w-auto max-sm:gap-2`}
      >
         {/* 搜索关闭按钮 */}
         {isSearchFocused && (
             <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseSearch}
                className="absolute top-3 right-3 w-8 h-8 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                aria-label="关闭搜索"
             >
                <X className="w-5 h-5" />
             </Button>
         )}

        {/* Map through icons */}
        {[
          { icon: Home, label: "主页", onClick: handleGoHome, active: false },
          { icon: Search, label: "搜索", onClick: handleSearchClick, active: isSearchFocused }, // Highlight search icon when active
        ].map(({ icon: Icon, label, onClick, active }) => (
          <Button
            key={label}
            variant="ghost"
            size="icon"
            onClick={onClick}
            disabled={isSearchFocused && label !== '搜索'} // Disable other buttons when search is open
            className={`w-16 h-16 rounded-full flex-shrink-0 mb-4 transition-all duration-200 ease-in-out ${
              active
                ? 'bg-white dark:bg-gray-200 text-black dark:text-black scale-110 shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:hover:bg-gray-100 dark:disabled:hover:bg-gray-800' // Add disabled styles
            }`}
            aria-label={label}
          >
            <Icon className="w-7 h-7" />
          </Button>
        ))}

        {/* Render Settings and Dark Mode Toggle immediately after */}
         <Button
            variant="ghost"
            size="icon"
            onClick={handleGoToSettings}
            disabled={isSearchFocused}
            className="w-16 h-16 rounded-full flex-shrink-0 mb-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-all duration-200 ease-in-out disabled:opacity-50 disabled:hover:bg-gray-100 dark:disabled:hover:bg-gray-800"
            aria-label="设置"
          >
          <Settings className="w-7 h-7" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          disabled={isSearchFocused}
          className="w-16 h-16 rounded-full flex-shrink-0 mb-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-all duration-200 ease-in-out disabled:opacity-50 disabled:hover:bg-gray-100 dark:disabled:hover:bg-gray-800"
          aria-label={darkMode ? "切换到白天模式" : "切换到夜晚模式"}
        >
          {darkMode ? <Sun className="w-7 h-7 text-yellow-400" /> : <Moon className="w-7 h-7 text-blue-500" />}
        </Button>

        {/* Conditional Search Input Area */}
        <div className={`w-full px-1 overflow-hidden transition-all duration-300 ease-in-out ${isSearchFocused ? 'max-h-40 opacity-100 mt-0' : 'max-h-0 opacity-0 mt-0'}`}> {/* Adjusted mt */}
             <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 px-2">搜索单词</p>
             <div className="relative">
               {/* <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 peer-focus:text-white" /> */}
               <Input
                 ref={searchInputRef}
                 type="text"
                 placeholder="Serach..."
                 value={searchQuery}
                 onChange={handleSearchChange}
                 onBlur={() => { /* Consider closing on blur, but click outside is often better UX */}}
                 // Updated Input styling for expanded view
                 className="peer w-full pl-4 pr-4 py-2 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:bg-white dark:focus:bg-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
               />
             </div>
             {/* Maybe add search results preview here later */}
        </div>

      </div>

      {/* 主内容区域 - Needs padding/margin to avoid overlapping with fixed sidebar */}
      {/* Adjust padding-left based on sidebar width */}
      <div className={`flex-1 flex items-center justify-center p-4 overflow-hidden transition-all duration-300 ease-in-out ${
        isSearchFocused ? 'pl-80' : 'pl-32'
      } max-sm:pl-0 max-sm:pt-24`}>
         {/* 卡片容器 */}
         <div className="w-full max-w-lg h-full flex flex-col max-sm:max-w-full">
            {/* Card (Ensure styles are appropriate) */}
            <Card className="border border-yellow-200 dark:border-gray-700 rounded-3xl overflow-hidden bg-white dark:bg-gray-800 shadow-lg flex-1 flex flex-col transition-colors duration-300">
              {/* Card Header */}
              <div className="flex items-center justify-between p-6 border-b border-yellow-100 dark:border-gray-600">
                 {/* ArrowLeft Button */}
                <Button variant="ghost" onClick={() => !isAnimating && currentPage > 1 && handlePageTransition('prev')} disabled={currentPage === 1 || isAnimating} size="icon" className="text-gray-700 hover:text-gray-900 disabled:text-gray-400 dark:text-gray-300 dark:hover:text-white dark:disabled:text-gray-500">
                  <ArrowLeft className="w-6 h-6" />
                </Button>
                 {/* Unit Title */}
                <div className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xl font-medium text-gray-800 dark:text-gray-200">{currentWordSet}</span>
                  <span className="text-gray-500 dark:text-gray-400">▼</span>
                </div>
                {/* ArrowRight Button */}
                <Button variant="ghost" onClick={() => !isAnimating && currentPage < totalPages && handlePageTransition('next')} disabled={currentPage === totalPages || isAnimating} size="icon" className="text-gray-700 hover:text-gray-900 disabled:text-gray-400 dark:text-gray-300 dark:hover:text-white dark:disabled:text-gray-500">
                  <ArrowRight className="w-6 h-6" />
                </Button>
              </div>


              {/* Word List Area */}
              <div 
                ref={wordListRef}
                className="overflow-auto flex-1 px-4 py-2 space-y-2 relative"
                style={{
                  scrollbarWidth: 'none', /* Firefox */
                  msOverflowStyle: 'none', /* IE and Edge */
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {/* 添加全局样式到组件内 */}
                <style>
                  {`
                    /* 隐藏webkit浏览器的滚动条 */
                    div::-webkit-scrollbar {
                      display: none;
                    }
                  `}
                </style>
                
                {/* 遮板组件 */}
                {showCover && (
                  <>
                    {/* 使用额外的样式使遮板不覆盖被点击的单词 */}
                    <style>
                      {`
                        .word-revealed {
                          position: relative;
                          z-index: 20; /* 确保在遮板之上 */
                        }
                      `}
                    </style>
                    <div 
                      className={`absolute top-0 bottom-0 bg-yellow-200/60 dark:bg-gray-700/60 backdrop-blur-sm z-10 ${isDragging ? '' : 'transition-all ease-in-out duration-300'}`}
                      style={{ 
                        left: `${coverPosition}%`, 
                        width: '50%',
                        cursor: 'col-resize',
                        borderLeft: '3px dashed rgba(234, 179, 8, 0.8)',
                        boxShadow: '-4px 0 12px rgba(0, 0, 0, 0.15)'
                      }}
                      onMouseDown={handleCoverDragStart}
                      onTouchStart={handleCoverDragStart}
                      onMouseUp={handleCoverDragEnd}
                      onTouchEnd={handleCoverDragEnd}
                    >
                    </div>
                  </>
                )}
                
                {currentWords.length > 0 ? (
                  currentWords.map((word, index) => {
                    // 构建动态className
                    const wordClassName = `flex items-center p-3 transition-all duration-300 ease-in-out rounded-xl border border-yellow-100 dark:border-gray-600 bg-white dark:bg-gray-700 ${getAnimationClass()} ${isAnimating && animationDirection === null ? `animate-card-flip-${Math.min(index, 4)}` : ''} hover:shadow-lg hover:scale-[1.02] hover:border-yellow-300 dark:hover:border-yellow-500 cursor-pointer ${revealedWordId === word.id ? 'word-revealed' : ''}`;
                    
                    return (
                      <div 
                        key={word.id} 
                        className={wordClassName}
                        onMouseDown={() => handleWordMouseDown(word.id)}
                        onMouseUp={handleWordMouseUp}
                        onMouseLeave={handleWordMouseLeave}
                        onTouchStart={() => handleWordMouseDown(word.id)}
                        onTouchEnd={handleWordTouchEnd}
                      >
                        <div className="w-8 h-8 flex-shrink-0 rounded-full bg-yellow-100 dark:bg-gray-600 flex items-center justify-center mr-3 text-yellow-600 dark:text-yellow-300 font-semibold text-sm">{(currentPage - 1) * WORDS_PER_PAGE + index + 1}</div>
                        <div className="flex-1">
                          <p className="text-base font-semibold text-gray-800 dark:text-gray-100">{word.word}</p>
                          {word.pronunciation && (<p className="text-xs text-yellow-600 dark:text-yellow-400">[{word.pronunciation.replace(/\//g, '')}]</p>)}
                        </div>
                        {/* 翻译始终显示 */}
                        <div className="text-right ml-3"><p className="text-sm text-gray-600 dark:text-gray-400">{word.translation}</p></div>
                      </div>
                    );
                  })
                 ) : (
                  <div className="flex items-center justify-center h-full"><p className="text-gray-500 dark:text-gray-400">未找到匹配的单词</p></div>
                 )}
              </div>


              {/* Bottom Action Buttons */}
              <div className="border-t border-yellow-100 dark:border-gray-600 p-6">
                <div className="grid grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    className="text-yellow-700 border-yellow-300 hover:bg-yellow-50 dark:text-yellow-400 dark:border-yellow-600 dark:hover:bg-gray-700 dark:hover:text-yellow-300 h-12 rounded-full transition-colors duration-300"
                    onClick={() => {
                      // 朗读当前页面所有单词
                      currentWords.forEach(word => {
                        setTimeout(() => handleReadWord(word.word), 800 * currentWords.indexOf(word));
                      });
                    }}
                  >
                    带读
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleTestButtonClick}
                    className={`text-yellow-700 border-yellow-300 hover:bg-yellow-50 dark:text-yellow-400 dark:border-yellow-600 dark:hover:bg-gray-700 dark:hover:text-yellow-300 h-12 rounded-full transition-colors duration-300 ${
                      showCover ? 'bg-yellow-50 dark:bg-gray-700 text-yellow-800 dark:text-yellow-300' : ''
                    }`}
                  >
                    {showCover ? "关闭书签" : "打开书签"}
                  </Button>
                  <Button 
                    variant="outline" 
                    className={`h-12 rounded-full transition-all duration-300 ${
                      isShuffled 
                        ? 'text-amber-700 border-amber-400 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-300 dark:border-amber-700 dark:hover:bg-amber-800' 
                        : 'text-yellow-700 border-yellow-300 hover:bg-yellow-50 dark:text-yellow-400 dark:border-yellow-600 dark:hover:bg-gray-700 dark:hover:text-yellow-300'
                    }`} 
                    onClick={toggleShuffle} 
                    disabled={isAnimating}
                  >
                    {isShuffled ? "恢复顺序" : "打乱顺序"}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
      </div>
    </div>
  );
}; 