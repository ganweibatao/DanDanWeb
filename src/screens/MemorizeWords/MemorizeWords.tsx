import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from "../../components/ui/button";
import { Card} from "../../components/ui/card";
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { saveWordCustomization, fetchWordsCustomization } from "../../services/api";
import {getAdditionalNewWords,LearningUnit,} from "../../services/learningApi";
import { toast } from 'sonner';
import { WordDetailModal } from './components/WordDetailModal';
import { AnnotationPanel } from "./components/AnnotationPanel";
import { SettingsPanel, FontSizeSettings } from "./components/SettingsPanel";
import { useWordPagination } from './hooks/useWordPagination';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useTheme } from '../../context/ThemeContext';
import { Sidebar } from "./components/Sidebar";
import { CompletionScreen } from "./components/CompletionScreen";
import { WordList } from "./components/WordListAndCard";
import { useWordCover } from './hooks/useWordCover';
import { useFullscreen } from '../../hooks/useFullscreen';
import { useShuffle } from './hooks/useShuffle';
import { useScrollMode } from './hooks/useScrollMode';
import { AddWordsDialog } from '../../components/AddWordsDialog';
import { useKnownWords } from './hooks/useKnownWords';
import { useCompletion } from './hooks/useCompletion';
import { useReviewUnits } from './hooks/useReviewUnits';
import { WordCover } from "./components/WordCover";
import { WalkingClock } from '../../components/WalkingClock';
import { dictionaryService, parseSynAntoDerivativesFromDictApi, DictionaryEntry } from '../../services/dictionaryService';
import { DisplayVocabularyWord } from "./types";

const WORDS_PER_PAGE = 5;

interface WordEditUpdatesFromModal {
  translation: string;
  example?: string | null;       // Field from modal (potentially null)
  examples?: string | null;      // Another possible field from modal (handle ambiguity)
  derivatives?: string;    // Field from modal (ignored by backend)
  notes?: string | null;       // Field from modal (potentially null)
}

export const MemorizeWords = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { studentId } = useParams<{ studentId: string }>();

  const [originalWords, setOriginalWords] = useState<DisplayVocabularyWord[]>([]);
  const customizationFetchedRef = useRef(false);
  const [learningMode, setLearningMode] = useState<'new' | 'review' | null>(null);
  const [animationDirection, setAnimationDirection] = useState<'next' | 'prev' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [revealedWordId, setRevealedWordId] = useState<number | null>(null);
  const [hoveredWordId, setHoveredWordId] = useState<number | null>(null);
  const [planId, setPlanId] = useState<number | null>(null);
  const [unitId, setUnitId] = useState<number | undefined | null>(undefined); // 数据库ID，保持用于API调用
  const [unitNumber, setUnitNumber] = useState<number | undefined | null>(undefined); // 单元序号，用于显示
  const [startWordOrder, setStartWordOrder] = useState<number | undefined>(undefined);
  const [endWordOrder, setEndWordOrder] = useState<number | undefined>(undefined);
  const [reviewUnits, setReviewUnits] = useState<LearningUnit[] | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedWordForDetail, setSelectedWordForDetail] = useState<DisplayVocabularyWord | null>(null);
  const [isFirstModalOpen, setIsFirstModalOpen] = useState(true);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [fontSizes, setFontSizes] = useState<FontSizeSettings>({
    english: 16,
    pronunciation: 13,
    chinese: 14
  });
  const [isBottomButtonsDisabled] = useState(false);
  const [showAddWordsDialog, setShowAddWordsDialog] = useState(false);
  const [additionalWordsCount, setAdditionalWordsCount] = useState(5);
  const [isLoadingAdditionalWords, setIsLoadingAdditionalWords] = useState(false);
  const [originalWordsLength, setOriginalWordsLength] = useState(0);
  const [isReviewingToday, setIsReviewingToday] = useState<boolean>(false);
  const [allReviewWords, setAllReviewWords] = useState<DisplayVocabularyWord[]>([]);
  const [showClock, setShowClock] = useState(true);
  const [showNotesPanel, setShowNotesPanel] = useState(true);
  const [wordExtraInfoMap, setWordExtraInfoMap] = useState<Map<string, { dictDetails: DictionaryEntry[]; synonyms: string[]; antonyms: string[]; derivatives: string[]; phonetics?: any[] }>>(new Map());
  const [isExtraInfoLoading, setIsExtraInfoLoading] = useState(false);
  const [detailModalPageDirection, setDetailModalPageDirection] = useState<'prev' | 'next' | null>(null);

  // 先解构 useScrollMode
  const {
    isScrollMode,
    setIsScrollMode,
    scrollProgress,
    wordListRef,
    toggleScrollMode,
    handleWordListScroll,
  } = useScrollMode();

  // 再传给 useWordCover
  const {
    showCover,
    setShowCover,
    coverPosition,
    setCoverPosition,
    isDragging,
    handleCoverDragStart,
  } = useWordCover(wordListRef);

  // 打乱逻辑用 useShuffle hook
  const {
    isShuffled,
    shuffledArray,
    toggleShuffle,
    shuffle,
    restore,
    setShuffledArray,
    setIsShuffled,
  } = useShuffle<DisplayVocabularyWord & { translation: string | undefined }>(
    originalWords.map(w => ({ ...w, translation: w.translation ?? '' }))
  );

  // 用 useWordPagination 管理分页、搜索等逻辑（打乱由外部 hook 控制）
  const {
    wordsToShow,
    totalPages,
    currentPage,
    goToPage,
    searchQuery,
    setSearch,
    setSearchQuery,
    filteredWords,
  } = useWordPagination<DisplayVocabularyWord & { translation: string | undefined }>(
    originalWords.map(w => ({ ...w, translation: w.translation ?? '' })),
    WORDS_PER_PAGE,
    isShuffled,
    shuffledArray
  );

  // 全屏逻辑用 useFullscreen hook
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  // 用 useKnownWords 管理已知单词和滑动
  const {
    knownWordIds,
    swipeState,
    handleSwipeStart,
    handleSwipeMove,
    handleSwipeEnd,
    setSwipeState,
  } = useKnownWords();

  // 使用 useReviewUnits 管理复习单元切换与管理
  const {
    selectedReviewUnitId,
    setSelectedReviewUnitId,
    handleReviewUnitSelect,
  } = useReviewUnits({
    reviewUnits,
    allReviewWords,
    setOriginalWords,
    setOriginalWordsLength,
    goToPage,
    setSearchQuery,
    setSwipeState,
  });

  // 用 useCompletion 管理完成学习的逻辑和状态
  const {
    isCompleting,
    learningComplete,
    remainingTaskType,
    handleCompletion,
    setLearningComplete,
    setIsCompleting,
    setRemainingTaskType,
  } = useCompletion({
    learningMode,
    planId,
    unitId,
    unitNumber,
    reviewUnits,
    selectedReviewUnitId,
    startWordOrder,
    endWordOrder,
    originalWords,
    originalWordsLength,
    setOriginalWords,
    setOriginalWordsLength,
    setReviewUnits,
    setSelectedReviewUnitId,
    goToPage,
    setSearchQuery,
    setSwipeState,
    setAllReviewWords,
    allReviewWords,
    handleReviewUnitSelect,
  });

  // 1. 只负责解析 location.state 并初始化主状态
  useEffect(() => {
    if (!location.state?.words || !Array.isArray(location.state.words)) {
      toast.error("无法加载学习内容，请重试。", { description: "缺少必要的页面信息。" });
      navigate(`/students/${studentId || ''}`);
      setOriginalWords([]);
      setOriginalWordsLength(0);
      setAllReviewWords([]);
      return;
    }
    // 只负责解析 location.state，设置主状态
    const receivedWords: DisplayVocabularyWord[] = location.state.words;
    setLearningMode(location.state.mode);
    setPlanId(location.state.planId);
    setUnitId(location.state.unitId);
    setUnitNumber(location.state.unitNumber);
    setReviewUnits(location.state.reviewUnits);
    setStartWordOrder(location.state.start_word_order);
    setEndWordOrder(location.state.end_word_order);
    setIsReviewingToday(!!location.state.isReviewingToday);

    setOriginalWords(receivedWords);
    setOriginalWordsLength(receivedWords.length);

    if (location.state.mode === 'review' && location.state.reviewUnits?.length > 0) {
      setAllReviewWords(receivedWords);
      // 新增：自动选中第一个 review unit
      setSelectedReviewUnitId(location.state.reviewUnits[0].id);
      // 这里可以保留 maxUnit 逻辑（如有需要可后续进一步拆分）
    } else {
      setAllReviewWords([]);
      setSelectedReviewUnitId(null);
    }
    setLearningComplete(false);
    setIsCompleting(false);
    setRemainingTaskType(null);
    setIsScrollMode(false);
  }, [location.state, navigate, studentId]);

  // 2. 只负责拉取 customization 并合并
  useEffect(() => {
    if (!studentId || originalWords.length === 0 || customizationFetchedRef.current) return;
    // 标记已拉取过，防止重复请求
    customizationFetchedRef.current = true;
    const wordBasicIds = originalWords
      .map(w => w.word_basic_id)
      .filter((id): id is number => typeof id === 'number');
    if (wordBasicIds.length === 0) return;
    fetchWordsCustomization(Number(studentId), wordBasicIds).then(customizations => {
      const mergedWords = originalWords.map(word => {
        const custom = customizations.find((c: any) => c.word_basic_id === word.word_basic_id);
        return custom ? { ...word, ...custom } : word;
      });
      setOriginalWords(mergedWords);
      setOriginalWordsLength(mergedWords.length);
    });
  }, [studentId, originalWords.length]);

  // 用 useMemo 包裹 wordsToShow、filteredWords、displayWords，避免每次渲染都重新计算
  const memoizedWordsToShow = useMemo(() => wordsToShow, [wordsToShow]);
  const memoizedFilteredWords = useMemo(() => filteredWords, [filteredWords]);
  const memoizedShuffledArray = useMemo(() => shuffledArray, [shuffledArray]);

  const displayWords = useMemo(() => {
    return isScrollMode
      ? (isShuffled ? memoizedShuffledArray : memoizedFilteredWords)
      : memoizedWordsToShow;
  }, [isScrollMode, isShuffled, memoizedShuffledArray, memoizedFilteredWords, memoizedWordsToShow]);

  // 新增：渲染前打印 originalWords、wordsToShow、searchQuery
  useEffect(() => {
  }, [originalWords, wordsToShow, searchQuery]);

  const handlePageTransition = (direction: 'next' | 'prev') => {
    if (isAnimating || isCompleting || isScrollMode) return;
    
    setAnimationDirection(direction);
    setIsAnimating(true);
    
    if (direction === 'next') {
      handleNextPage();
    } else {
      handlePrevPage();
    }
    
    setTimeout(() => {
      setIsAnimating(false);
      setAnimationDirection(null);
      setRevealedWordId(null);
      setSwipeState(new Map());
    }, 300);
  };

  // 替换 handleNextPage/handlePrevPage
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };
  const handlePrevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  // 替换 handleSearchChange
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  // 替换 toggleShuffle
  const handleToggleShuffle = () => {
    if (isScrollMode) {
      // 滚动模式下，依然全局打乱
      toggleShuffle();
      return;
    }
    if (!isShuffled) {
      // 分页模式下，只打乱当前页
      const start = (currentPage - 1) * WORDS_PER_PAGE;
      const end = start + WORDS_PER_PAGE;
      const currentPageWords = filteredWords.slice(start, end);
      const shuffledCurrentPage = [...currentPageWords];
      for (let i = shuffledCurrentPage.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledCurrentPage[i], shuffledCurrentPage[j]] = [shuffledCurrentPage[j], shuffledCurrentPage[i]];
      }
      const newShuffled = [
        ...filteredWords.slice(0, start),
        ...shuffledCurrentPage,
        ...filteredWords.slice(end)
      ];
      setShuffledArray(newShuffled);
      setIsShuffled(true);
    } else {
      // 恢复
      restore();
    }
  };

  const handleGoHome = () => {
    if (studentId) {
      console.log(`Navigating back to student page with ID: ${studentId}`);
      navigate(`/students/${studentId}`);
    } else {
      console.warn("Student ID is missing, cannot navigate back to specific student page. Navigating to /students/.");
      toast.error("无法返回学生主页，缺少学生信息。");
      navigate('/students');
    }
  };
  const handleGoToSettings = () => setShowSettingsPanel(true);
  const handleSearchClick = () => {
    setIsSearchFocused(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };
  const handleCloseSearch = () => {
    setIsSearchFocused(false);
    setSearchQuery("");
    wordListRef.current?.focus();
  };

  // 点击侧边栏外部时关闭搜索
  useClickOutside(sidebarRef, () => {
    if (isSearchFocused) handleCloseSearch();
  });

  // 事件：遮板相关
  const handleWordMouseDown = (wordId: number) => showCover && setRevealedWordId(wordId);
  const handleWordMouseUp = () => showCover && setRevealedWordId(null);
  const handleWordMouseLeave = (event: React.MouseEvent<HTMLDivElement>) => {
    setHoveredWordId(null);
    if (showCover && event.buttons === 0) {
        setRevealedWordId(null);
    }
  };
  const handleWordTouchStart = (wordId: number) => showCover && setRevealedWordId(wordId);
  const handleWordTouchEnd = () => showCover && setRevealedWordId(null);

  // 遮板按钮
  const handleTestButtonClick = () => {
    setShowCover(!showCover);
    if (!showCover) setCoverPosition(50);
    setRevealedWordId(null);
  };

  const handleWordDoubleClick = (word: DisplayVocabularyWord) => {
    if (showCover || isCompleting || isAnimating) return;
    setSelectedWordForDetail(word);
    setShowDetailModal(true);
    setIsFirstModalOpen(true);
  };

  const handleSwipeWord = (direction: 'prev' | 'next') => {
    if (!selectedWordForDetail) return;

    // 获取当前单词在 displayedWords 中的索引
    const currentIndex = wordsToShow.findIndex(w => w.id === selectedWordForDetail.id);
    if (currentIndex === -1) return;

    let newIndex = -1;
    if (direction === 'prev' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (direction === 'next' && currentIndex < wordsToShow.length - 1) {
      newIndex = currentIndex + 1;
    }

    if (newIndex !== -1) {
      setSelectedWordForDetail(wordsToShow[newIndex]);
    }
  };

  const handleSaveEdit = async (
      wordToSave: DisplayVocabularyWord,
      updates: WordEditUpdatesFromModal // Use interface reflecting modal signature possibilities
  ) => {
    console.log(`Attempting to save edit for word ${wordToSave.word_basic_id} (word: ${wordToSave.word}) with updates from modal:`, updates);

    // Ensure studentId and word_basic_id are valid
    if (!studentId || typeof wordToSave.word_basic_id !== 'number') {
        toast.error('无法保存：缺少学生或单词信息');
        return;
    }

    // Build the payload for the backend, only including fields that are actually changing
    const payload: {
        student_id: number;
        meanings?: { meaning: string }[];
        example_sentence?: string;
        notes?: string;
    } = { student_id: Number(studentId) };

    let hasChanges = false;

    // 1. Map translation -> meanings if changed
    // Ensure wordToSave.translation is treated as string for comparison
    const currentTranslation = typeof wordToSave.translation === 'string' ? wordToSave.translation.trim() : "";
    if (typeof updates.translation === 'string' && updates.translation.trim() !== currentTranslation) {
        const trimmedTranslation = updates.translation.trim();
        if (trimmedTranslation) {
            payload.meanings = [{ meaning: trimmedTranslation }];
            hasChanges = true;
        } else {
            // Handle case where user clears translation - Send empty array
             payload.meanings = [];
             hasChanges = true;
        }
    }

    // 2. Map example/examples -> example_sentence if changed
    let sourceExample: string | null | undefined = undefined;
    if (updates.hasOwnProperty('example')) {
        sourceExample = updates.example;
    } else if (updates.hasOwnProperty('examples')) {
        sourceExample = updates.examples;
    }

    // Use example_sentence if available on wordToSave, otherwise fallback to examples
    const currentExampleSentence = wordToSave.example_sentence ?? wordToSave.examples ?? "";
    let newExampleSentence = "";
    if (typeof sourceExample === 'string') {
        newExampleSentence = sourceExample;
    } else if (sourceExample === null) {
        newExampleSentence = ""; // Treat null as empty string
    }

    if (newExampleSentence !== currentExampleSentence) {
        payload.example_sentence = newExampleSentence;
        hasChanges = true;
    }


    // 3. Map notes if changed
    const currentNotes = wordToSave.notes ?? "";
    let newNotes = "";
     if (typeof updates.notes === 'string') {
        newNotes = updates.notes;
    } else if (updates.notes === null) {
       newNotes = ""; // Treat null as empty string
    }

    if (newNotes !== currentNotes) {
        payload.notes = newNotes;
        hasChanges = true;
    }

    // 4. Ignore derivatives

    // Check if there are any actual changes to save
    if (!hasChanges) {
        console.log("No actual changes detected to save.");
        toast.info("内容未更改"); // Inform user
        setShowDetailModal(false); // Close modal as no save needed
        setSelectedWordForDetail(null);
        return; // Don't call API
    }

    console.log("Constructed payload for API:", payload);

    try {
        // Call the backend API with the potentially partial payload
        const data = await saveWordCustomization(wordToSave.word_basic_id, payload);
        console.log("API Save Response:", data);

        // Create the updated word object merging existing data, payload, and API response
        const updatedWordData = {
            ...wordToSave, // Start with existing word data
            // Update fields based on the payload sent
            ...(payload.hasOwnProperty('meanings') && { translation: payload.meanings && payload.meanings.length > 0 ? payload.meanings[0].meaning : "" }),
            ...(payload.hasOwnProperty('example_sentence') && { example_sentence: payload.example_sentence }),
            ...(payload.hasOwnProperty('notes') && { notes: payload.notes }),
            ...(data || {}),
        };


        // Update local state with the confirmed saved data
        const updateState = (prev: DisplayVocabularyWord[]) =>
            prev.map(w => w.id === wordToSave.id ? updatedWordData : w);

        setOriginalWords(updateState);
        if (isShuffled) toggleShuffle();
        setOriginalWordsLength(updateState.length);

        toast.success(`单词 "${wordToSave.word}" 的信息已更新`);
        setShowDetailModal(false);
        setSelectedWordForDetail(null);
    } catch (e: any) {
         console.error("Error saving word customization:", e);
        const errorMessage = e?.message || '保存失败，请重试';
        toast.error(errorMessage);
    }
  };

  const handleFontSizeChange = (setting: keyof FontSizeSettings, value: number) => {
    setFontSizes(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleResetFontSizes = () => {
    setFontSizes({
      english: 16,
      pronunciation: 12,
      chinese: 14
    });
  };

  const handleAddWords = async () => {
    if (!planId || !unitId || additionalWordsCount <= 0 || isLoadingAdditionalWords) {
      toast.error("无法加载额外单词", { description: "请确保输入正确的数量" });
      return;
    }

    // 检查是否是有效的操作模式
    // 只有在新词学习模式下才能添加单词
    if (learningMode !== 'new') {
      toast.error("只有在新词学习或复习今日新词的情况下才能添加单词", { description: "无法在复习旧词模式下添加单词" });
      setShowAddWordsDialog(false);
      return;
    }

    setIsLoadingAdditionalWords(true);

    try {
      // 使用getAdditionalNewWords函数从API获取新单词
      const response = await getAdditionalNewWords(planId, unitId, additionalWordsCount);
      
      // 获取单词列表
      const newWords = response.words;

      // 合并新单词
      // --- MODIFIED: Combine with current originalWords, not just initial ones ---
      const combinedWords = [...originalWords, ...newWords];
      // --- END MODIFICATION ---

      // 更新相关状态
      setOriginalWords(combinedWords);
      setOriginalWordsLength(originalWordsLength + newWords.length); // Update the count state

      // 成功提示
      toast.success(`成功添加${newWords.length}个单词`, {
        description: `当前共有${combinedWords.length}个单词`
      });

      // 关闭对话框
      setShowAddWordsDialog(false);

    } catch (error: any) {
      console.error('获取额外单词失败:', error);
      toast.error(`获取额外单词失败: ${error.message}`, {
        description: "请稍后重试或联系管理员"
      });
    } finally {
      setIsLoadingAdditionalWords(false);
    }
  };

  const handleOpenAddWordsDialog = () => setShowAddWordsDialog(true);
  const handleCloseAddWordsDialog = () => setShowAddWordsDialog(false);

  // 根据模式判断是否应该显示添加单词按钮
  const shouldShowAddWordsButton = useMemo(() => {
    // 在新词学习或复习今日新词模式下显示
    return learningMode === 'new'; // isReviewingToday已经是在mode='new'条件下的
  }, [learningMode]);

  const toggleDarkMode = () => {
    if (theme === 'dark') setTheme('light');
    else setTheme('dark');
  };

  // 页面跳转后预加载所有单词拓展信息
  useEffect(() => {
    if (!originalWords || originalWords.length === 0) return;
    setIsExtraInfoLoading(true);
    const fetchAll = async () => {
      const map = new Map();
      const preloadWords = originalWords.slice(0, 10); // 只预加载前10个
      for (let i = 0; i < preloadWords.length; i++) {
        const w = preloadWords[i];
        try {
          const dict = await dictionaryService.getWordDetails(w.word);
          const { synonyms, antonyms, derivatives } = parseSynAntoDerivativesFromDictApi(dict);
          if (dict && dict.length > 0) {
            map.set(w.word, { dictDetails: dict, synonyms, antonyms, derivatives, phonetics: dict[0].phonetics });
          }
        } catch {
          // 查不到的不缓存
        }
        // 每隔200ms请求一个，避免限流
        if (i < preloadWords.length - 1) {
          await new Promise(res => setTimeout(res, 200));
        }
      }
      setWordExtraInfoMap(map);
      setIsExtraInfoLoading(false);
    };
    fetchAll();
  }, [originalWords]);

  // 跨页切换弹窗单词
  const handleRequestPrevPage = () => {
    if (currentPage > 1) {
      setDetailModalPageDirection('prev');
      goToPage(currentPage - 1);
    }
  };
  const handleRequestNextPage = () => {
    if (currentPage < totalPages) {
      setDetailModalPageDirection('next');
      goToPage(currentPage + 1);
    }
  };

  useEffect(() => {
    if (!showDetailModal || !detailModalPageDirection) return;
    if (detailModalPageDirection === 'prev' && wordsToShow.length > 0) {
      setSelectedWordForDetail(wordsToShow[wordsToShow.length - 1]);
    } else if (detailModalPageDirection === 'next' && wordsToShow.length > 0) {
      setSelectedWordForDetail(wordsToShow[0]);
    }
    setDetailModalPageDirection(null);
  // eslint-disable-next-line
  }, [currentPage, showDetailModal, wordsToShow]);

  // 进入页面时自动滚动模式和全屏模式
  useEffect(() => {
    setIsScrollMode(true); // 默认滚动模式
    // 进入全屏
    setTimeout(() => {
      toggleFullscreen();
    }, 0);
  }, []);

  return (
    <div className="relative h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex">
      {/* 悬浮侧边栏 */}
      <Sidebar
        isSearchFocused={isSearchFocused}
        handleCloseSearch={handleCloseSearch}
        handleGoHome={handleGoHome}
        handleSearchClick={handleSearchClick}
        shouldShowAddWordsButton={shouldShowAddWordsButton}
        handleOpenAddWordsDialog={handleOpenAddWordsDialog}
        handleGoToSettings={handleGoToSettings}
        isFullscreen={isFullscreen}
        handleToggleFullscreen={toggleFullscreen}
        darkMode={theme === 'dark'}
        toggleDarkMode={toggleDarkMode}
        searchInputRef={searchInputRef}
        searchQuery={searchQuery}
        handleSearchChange={handleSearchChange}
      />

      {/* 行走的时钟 - 根据状态条件渲染 */} 
      {showClock && <WalkingClock darkMode={theme === 'dark'} />}

      {/* 主内容区 */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-xl mx-auto px-8">
          <Card className="rounded-[2rem] shadow-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 transition-all duration-300">
            {isCompleting ? null : (
                 <div className="w-full max-w-lg h-[calc(100vh-2rem)] flex flex-col max-sm:max-w-full max-sm:h-[calc(100vh-5rem)]">
                     <Card className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-md flex-1 flex flex-col transition-colors duration-300">
                        <div className="relative h-14 min-h-[56px] border-b border-gray-200 dark:border-gray-700">
                           {/* 居中标题 */}
                           <div className="absolute left-0 right-0 top-0 bottom-0 flex items-center justify-center pointer-events-none">
                             {/* 直接在此容器内条件渲染 */}
                             {learningMode === 'new' && (
                               <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 pointer-events-auto">
                                 {isReviewingToday ? `List ${unitNumber || ''}` : `List ${unitNumber || ''}`}
                               </h2>
                             )}
                             {learningMode === 'review' && reviewUnits && reviewUnits.length > 1 && (
                               <div className="flex flex-row gap-3 justify-center pointer-events-auto"> {/* 保持容器 */}
                                 {/* Sort review units by unit_number descending before mapping */}
                                 {[...reviewUnits] // Create a shallow copy to avoid mutating original state
                                   .sort((a, b) => (b.unit_number ?? 0) - (a.unit_number ?? 0)) // Sort descending, handle potential null/undefined
                                   .map(unit => (
                                   <div // <-- 使用 div 替换 Button
                                     key={unit.id}
                                     className={`rounded-full px-4 py-1 text-xl font-bold transition-colors duration-150 cursor-pointer ${ // <-- 修改字体大小和粗细
                                       selectedReviewUnitId === unit.id 
                                       ? 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-100' // <-- 选中样式
                                       : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700' // <-- 未选中样式
                                     }`}
                                     onClick={() => !isCompleting && handleReviewUnitSelect(unit)} // <-- 保留点击事件
                                     aria-disabled={isCompleting}
                                     role="button"
                                   >
                                     List {unit.unit_number}
                                   </div>
                                 ))}
                               </div>
                             )}
                             {/* 如果只有一个 review unit 或没有 review units 但在 review 模式，可以显示一个简单的标题 */}
                             {learningMode === 'review' && (!reviewUnits || reviewUnits.length <= 1) && (
                                 <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 pointer-events-auto">
                                    {/* Display the number of the currently selected (single) list */}
                                    {selectedReviewUnitId && reviewUnits?.find(u => u.id === selectedReviewUnitId)?.unit_number
                                        ? `List ${reviewUnits.find(u => u.id === selectedReviewUnitId)?.unit_number}`
                                        : (reviewUnits && reviewUnits.length === 1 ? `List ${reviewUnits[0].unit_number}` : '今日复习')}
                                 </h2>
                             )}
                           </div>

                           {/* 右侧完成按钮 */}
                           <div className="absolute right-4 top-1/2 -translate-y-1/2">
                             <Button
                               variant="ghost"
                               size={((!isScrollMode && currentPage === totalPages) || (isScrollMode && scrollProgress > 0.8)) && totalPages > 0 && !learningComplete ? "default" : "icon"}
                               onClick={() => {
                                 console.log('点击完成按钮', {
                                   isAnimating,
                                   isCompleting,
                                   learningComplete,
                                   isScrollMode,
                                   scrollProgress,
                                   currentPage,
                                   totalPages,
                                   selectedReviewUnitId,
                                   reviewUnits,
                                   learningMode
                                 });
                                 if (isAnimating || isCompleting) return;
                                 if (isScrollMode && scrollProgress > 0.8 && !learningComplete) {
                                   console.log('准备调用handleCompletion（滚动模式）');
                                   handleCompletion();
                                 } else if (!isScrollMode) {
                                   if (currentPage === totalPages && totalPages > 0 && !learningComplete) {
                                     console.log('准备调用handleCompletion（分页模式）');
                                     handleCompletion();
                                   }
                                 }
                               }}
                               disabled={isAnimating || isCompleting || (totalPages === 0) || 
                                 (!isScrollMode && currentPage === totalPages && learningComplete) || 
                                 (isScrollMode && (scrollProgress <= 0.8 || learningComplete))}
                               className={`
                                 transition-all duration-200 z-10
                                 disabled:opacity-50 disabled:cursor-not-allowed
                                 w-10 h-10 flex items-center justify-center
                                 ${((!isScrollMode && currentPage === totalPages) || (isScrollMode && scrollProgress > 0.8)) && totalPages > 0 && !learningComplete
                                   ? 'px-4 py-1 h-8 text-sm rounded-md font-medium bg-green-500 text-white hover:bg-green-600 disabled:bg-green-500/60 w-auto'
                                   : 'text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary disabled:text-gray-400/50 dark:disabled:text-gray-600/50'
                                 }
                                 ${isScrollMode ? `opacity-${Math.min(10, Math.max(0, Math.floor(scrollProgress * 10)))}` : ''}
                               `}
                               style={isScrollMode ? { 
                                 opacity: Math.max(0.3, scrollProgress),
                                 pointerEvents: scrollProgress > 0.8 ? 'auto' : 'none'
                               } : undefined}
                             >
                               {((!isScrollMode && currentPage === totalPages) || (isScrollMode && scrollProgress > 0.8)) && totalPages > 0 && !learningComplete ? '完成' : null}
                             </Button>
                           </div>
                         </div>

                        {/* Word List Area */}
                        <div
                          ref={wordListRef}
                          className={`flex-1 p-4 relative overflow-y-auto scrollbar-hide`}
                          style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            overflowX: 'hidden'
                          }}
                          onScroll={isScrollMode ? handleWordListScroll : undefined}
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
                          {/* New Wrapper Div for scrolling cover and content together */}
                          <div className="relative">
                              <style>
                                {`
                                  .scrollbar-hide::-webkit-scrollbar {
                                    display: none;
                                  }
                                  .scrollbar-hide {
                                    -ms-overflow-style: none;
                                    scrollbar-width: none;
                                  }
                                  
                                  /* 新增：有批注的单词样式 */
                                  [data-word-id].has-annotation .word-content {
                                    position: relative;
                                    border-right: 2px dashed #3b82f6 !important;
                                  }
                                  
                                  [data-word-id].has-annotation .word-content::after {
                                    content: "";
                                    position: absolute;
                                    top: 50%;
                                    right: -4px;
                                    width: 6px;
                                    height: 6px;
                                    background-color: #3b82f6;
                                    border-radius: 50%;
                                    transform: translateY(-50%);
                                  }
                                  
                                  /* 原有样式继续，但去掉滚动条样式 */
                                  /* 恢复：滑动相关样式 */
                                  .word-item-wrapper {
                                    position: relative;
                                    overflow: hidden; /* 隐藏滑动背景 */
                                    border-radius: 0.5rem; /* 匹配单词项圆角 */
                                  }
                                  .swipe-background {
                                    position: absolute;
                                    top: 0;
                                    bottom: 0;
                                    right: 0; /* 从右侧滑出 */
                                    width: 100%;
                                    /* 根据状态改变背景色 */
                                    /* background-color: #d1fae5; // Mark as known (Green) */
                                    /* background-color: #fee2e2; // Restore (Reddish) */
                                    display: flex;
                                    align-items: center;
                                    justify-content: flex-end; /* 图标靠右 */
                                    padding-right: 1rem;
                                    opacity: 0;
                                    transition: opacity 0.2s ease-in-out, background-color 0.2s ease-in-out;
                                    z-index: 0; /* 在单词内容下方 */
                                    /* 根据状态改变图标颜色 */
                                    /* color: #065f46; // Mark as known */
                                    /* color: #991b1b; // Restore */
                                  }
                                   .swipe-background.mark-known {
                                    background-color: #dcfce7; /* 更浅的绿色 */
                                    color: #166534;
                                   }
                                   .swipe-background.restore {
                                    background-color: #ffe4e6; /* 粉色 */
                                    color: #9f1239;
                                   }
                                  .word-content {
                                    position: relative;
                                    z-index: 1; /* 在滑动背景上方 */
                                    transition: transform 0.1s linear; /* 滑动动画 */
                                    background-color: inherit; /* 继承父级背景色 */
                                    /* 使内容区域捕获事件 */
                                    touch-action: pan-y; /* 允许垂直滚动，阻止浏览器默认水平滑动 */
                                  }
                                  .word-content.is-known {
                                    opacity: 0.5;
                                    /* background-color: #f3f4f6; dark:bg-gray-700/50 - 直接用opacity替代 */
                                  }
                                `}
                              </style>

                              {/* Cover - Now inside the wrapper */}
                              <WordCover
                                showCover={showCover}
                                coverPosition={coverPosition}
                                isDragging={isDragging}
                                handleCoverDragStart={handleCoverDragStart}
                                darkMode={theme === 'dark'}
                              />

                              {/* Word List - Now inside the wrapper */}
                              <div className="
                                border border-green-200 rounded-xl mb-3 px-4 py-3 bg-white dark:bg-gray-900
                                hover:border-green-400 hover:shadow-lg transition-all duration-200
                              ">
                                <WordList
                                  words={displayWords}
                                  knownWordIds={knownWordIds}
                                  fontSizes={fontSizes}
                                  darkMode={theme === 'dark'}
                                  showCover={showCover}
                                  coverPosition={coverPosition}
                                  revealedWordId={revealedWordId}
                                  swipeState={swipeState}
                                  onSwipeStart={handleSwipeStart}
                                  onSwipeMove={handleSwipeMove}
                                  onSwipeEnd={handleSwipeEnd}
                                  onMouseDown={handleWordMouseDown}
                                  onMouseUp={handleWordMouseUp}
                                  onMouseLeave={handleWordMouseLeave}
                                  onTouchStart={handleWordTouchStart}
                                  onTouchEnd={handleWordTouchEnd}
                                  onDoubleClick={handleWordDoubleClick}
                                />
                              </div>
                          </div>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                          <div className="flex justify-between items-center mb-3">
                            {!isScrollMode && (
                              <div className="flex justify-between items-center w-full">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => !isAnimating && currentPage > 1 && handlePageTransition('prev')} 
                                  disabled={currentPage === 1 || isAnimating || isCompleting}
                                  className="border-gray-200 dark:border-gray-700 h-10 px-4 flex items-center gap-1"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
                                    <path d="M18.5 12.5 C 17 12.3, 7 12.1, 6.5 12" />
                                    <path d="M11.5 5.5 C 10 7, 7 11, 6.5 12" />
                                    <path d="M11.5 18.5 C 10 17, 7 13, 6.5 12" />
                                  </svg>
                                </Button>
                                
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                  {Array.isArray(originalWords) && originalWords.length > 0 ? `${currentPage} / ${totalPages}` : '0 / 0'}
                                </span>
                                
                                {currentPage < totalPages ? (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => !isAnimating && currentPage < totalPages && handlePageTransition('next')} 
                                    disabled={currentPage >= totalPages || isAnimating || isCompleting}
                                    className="border-gray-200 dark:border-gray-700 h-10 px-4 flex items-center gap-1"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
                                      <path d="M5.5 12.5 C 7 12.3, 17 12.1, 17.5 12" />
                                      <path d="M12.5 5.5 C 14 7, 17 11, 17.5 12" />
                                      <path d="M12.5 18.5 C 14 17, 17 13, 17.5 12" />
                                    </svg>
                                  </Button>
                                ) : (
                                  <div className="w-[100px]"></div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <Button
                              variant="default"
                              className={`h-10 bg-green-600 hover:bg-green-700 text-white disabled:opacity-70 disabled:bg-green-600`}
                              onClick={toggleScrollMode}
                              disabled={isBottomButtonsDisabled || isCompleting}
                            >
                              {isScrollMode ? "分页" : "滚动"}
                            </Button>
                            <Button
                              variant="default"
                              className={`h-10 bg-green-600 hover:bg-green-700 text-white disabled:opacity-70 disabled:bg-green-600`}
                              onClick={handleTestButtonClick}
                              disabled={isBottomButtonsDisabled || isCompleting}
                            >
                              {showCover ? "关闭遮板" : "打开遮板"}
                            </Button>
                            <Button 
                              variant="default"
                              className={`h-10 bg-green-600 hover:bg-green-700 text-white disabled:opacity-70 disabled:bg-green-600`}
                              onClick={handleToggleShuffle} 
                              disabled={isBottomButtonsDisabled || isCompleting}
                            >
                              {isShuffled ? "恢复" : "打乱"}
                            </Button>
                          </div>
                        </div>
                     </Card>
                 </div>
            )}
          </Card>
        </div>
      </main>

      {/* Completion Screen Overlay (Rendered conditionally on top) */}
      {learningComplete && !isCompleting && (
        <CompletionScreen
          learningMode={learningMode}
          remainingTaskType={remainingTaskType}
          handleGoHome={handleGoHome}
          navigate={navigate}
        />
      )}

      {showDetailModal && selectedWordForDetail && (
        <WordDetailModal
          word={{
            ...selectedWordForDetail,
            book_id: selectedWordForDetail.book_id!,
            translation: selectedWordForDetail.translation ?? null,
            examples: selectedWordForDetail.examples ?? undefined,
            notes: selectedWordForDetail.notes ?? undefined,
            example_sentence: selectedWordForDetail.example_sentence ?? undefined,
          }}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedWordForDetail(null);
            setIsFirstModalOpen(false);
          }}
          onSave={handleSaveEdit}
          darkMode={theme === 'dark'}
          onSwipe={handleSwipeWord}
          canSwipePrev={wordsToShow.findIndex(w => w.id === selectedWordForDetail.id) > 0}
          canSwipeNext={wordsToShow.findIndex(w => w.id === selectedWordForDetail.id) < wordsToShow.length - 1}
          showInitialHint={isFirstModalOpen}
          wordExtraInfo={wordExtraInfoMap.get(selectedWordForDetail.word)}
          isExtraInfoLoading={isExtraInfoLoading}
          onRequestPrevPage={handleRequestPrevPage}
          onRequestNextPage={handleRequestNextPage}
        />
      )}

      {/* 添加批注面板 - 根据状态条件渲染 */}
      {showNotesPanel && <AnnotationPanel
        words={originalWords.map(w => ({
          ...w,
          book_id: w.book_id ?? 0,
          translation: w.translation ?? null,
          pronunciation: w.pronunciation ?? null,
          example: w.example ?? null,
          phonetic: w.phonetic ?? null,
          derivatives: w.derivatives ?? null,
          example_sentence: w.example_sentence ?? null,
        }))}
        darkMode={theme === 'dark'}
      />}

      {/* 添加设置面板 */}
      <SettingsPanel
        isOpen={showSettingsPanel}
        onClose={() => setShowSettingsPanel(false)}
        fontSizes={fontSizes}
        onFontSizeChange={handleFontSizeChange}
        onReset={handleResetFontSizes}
        showClock={showClock}
        onShowClockChange={setShowClock}
        showNotesPanel={showNotesPanel}
        onShowNotesPanelChange={setShowNotesPanel}
      />

      {/* 添加"添加单词"对话框 */}
      <AddWordsDialog
        open={showAddWordsDialog}
        onOpenChange={setShowAddWordsDialog}
        currentCount={originalWordsLength}
        value={additionalWordsCount}
        onValueChange={setAdditionalWordsCount}
        onCancel={handleCloseAddWordsDialog}
        onConfirm={handleAddWords}
        loading={isLoadingAdditionalWords}
      />

    </div>
  );
}; 