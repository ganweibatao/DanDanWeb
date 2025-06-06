import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Button } from "../../components/ui/button";
import { Card} from "../../components/ui/card";
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { saveWordCustomization, fetchWordsCustomizationCached, VocabularyWord, fetchKnownWords, markKnownWord, unmarkKnownWord, fetchKnownWordsCached } from "../../services/api";
import {getAdditionalNewWords,LearningUnit,} from "../../services/learningApi";
import { toast } from 'sonner';
import { WordDetailModal } from './components/WordDetailModal';
import { AnnotationPanel } from "./components/AnnotationPanel";
import { SettingsPanel } from "./components/MemorizeSettings";
import { useWordPagination } from './hooks/useWordPagination';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useSettings } from '../../context/SettingsContext';
import { CompletionScreen } from "./components/CompletionScreen";
import { WordList } from "./components/WordListAndCard";
import { useWordCover } from './hooks/useWordCover';
import { useFullscreen } from '../../hooks/useFullscreen';
import { useShuffle } from './hooks/useShuffle';
import { useScrollMode } from './hooks/useScrollMode';
import { AddWordsDialog } from './components/AddWordsDialog';
import { useKnownWords } from './hooks/useKnownWords';
import { useCompletion } from './hooks/useCompletion';
import { useReviewUnits } from './hooks/useReviewUnits';
import { WordCover } from "./components/WordCover";
import { WalkingClock } from '../../components/WalkingClock';
import { dictionaryService, parseSynAntoDerivativesFromDictApi, DictionaryEntry } from '../../services/dictionaryService';
import { DisplayVocabularyWord } from "./types";
import { WordCardView } from './components/WordCardView';
import { CompletionSummary } from './components/CompletionSummary';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { useQueryClient } from '@tanstack/react-query';
import { useTodaysLearning } from '../../hooks/useTodaysLearning';
import { useDurationLogger } from '../../hooks/useDurationLogger';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import { reportDurationLog } from '../../services/trackingApi';

import Header from '../../components/designTool/Header';
import LeftSidebar from '../../components/designTool/LeftSidebar';
import BottomToolbar from '../../components/designTool/BottomToolbar';
import { ExportPdfDialog, ExportType } from '../../components/ui/ExportPdfDialog';
import { generateWordListPDF } from '../../utils/pdfExport/generateWordListPDF';

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
  const queryClient = useQueryClient();

  // 从 location.state 读取所需的参数
  const { 
    planId, 
    unitId, 
    reviewUnitIds, 
    mode,
    unitNumber: stateUnitNumber, 
    startWordOrder: stateStartWordOrder, 
    endWordOrder: stateEndWordOrder, 
    isReviewingToday: stateIsReviewingToday,
    words: stateWords, // 从 Students.tsx 传递过来的特定单元单词
    // snakeCameFromPage no longer read from location.state directly for this purpose
  } = location.state || {};

  const [pageFromSnakeGame, setPageFromSnakeGame] = useState<number | undefined>(undefined);

  useEffect(() => {
    const storedPageValue = sessionStorage.getItem('snakeCameFromPage'); 
    if (storedPageValue) {
      const pageNumber = parseInt(storedPageValue, 10);
      if (!isNaN(pageNumber)) {
        setPageFromSnakeGame(pageNumber);
      }
      sessionStorage.removeItem('snakeCameFromPage'); 
    } else {
      setPageFromSnakeGame(undefined); 
    }
  }, []); 


  // 保持兼容的变量别名
  const statePlanId = planId;
  const stateUnitId = unitId;
  const stateReviewUnitIds = reviewUnitIds;
  const stateMode = mode;

  // 通过 React Query 获取今日学习数据
  const { todaysLearningData, isLoadingTodaysLearning, todaysLearningError } = useTodaysLearning(planId);

  const [originalWords, setOriginalWords] = useState<DisplayVocabularyWord[]>([]);
  const [learningMode, setLearningMode] = useState<'new' | 'review' | null>(null);
  const [animationDirection, setAnimationDirection] = useState<'next' | 'prev' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  // Correctly destructure setShowNotesPanel from useSettings
  const { settings, setTheme, setShowNotesPanel } = useSettings(); 
  const { theme, isSoundEnabled, fontSizes, showClock, showNotesPanel, isScrollSoundEnabled } = settings;
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [revealedWordId, setRevealedWordId] = useState<number | null>(null);
  const [hoveredWordId, setHoveredWordId] = useState<number | null>(null);
  const [unitNumber, setUnitNumber] = useState<number | undefined | null>(undefined); // 单元序号，用于显示
  const [startWordOrder, setStartWordOrder] = useState<number | undefined>(undefined);
  const [endWordOrder, setEndWordOrder] = useState<number | undefined>(undefined);
  const [reviewUnits, setReviewUnits] = useState<LearningUnit[] | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedWordForDetail, setSelectedWordForDetail] = useState<DisplayVocabularyWord | null>(null);
  const [isFirstModalOpen, setIsFirstModalOpen] = useState(true);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [isBottomButtonsDisabled] = useState(false);
  const [showAddWordsDialog, setShowAddWordsDialog] = useState(false);
  const [additionalWordsCount, setAdditionalWordsCount] = useState(5);
  const [isLoadingAdditionalWords, setIsLoadingAdditionalWords] = useState(false);
  const [originalWordsLength, setOriginalWordsLength] = useState(0);
  const [isReviewingToday, setIsReviewingToday] = useState<boolean>(false);
  const [allReviewWords, setAllReviewWords] = useState<DisplayVocabularyWord[]>([]);
  const [wordExtraInfoMap, setWordExtraInfoMap] = useState<Map<string, { dictDetails: DictionaryEntry[]; synonyms: string[]; antonyms: string[]; derivatives: string[]; phonetics?: any[] }>>(new Map());
  const [isExtraInfoLoading, setIsExtraInfoLoading] = useState(false);
  const [detailModalPageDirection, setDetailModalPageDirection] = useState<'prev' | 'next' | null>(null);

  // 新增：单词卡片视图状态
  const [showWordCardView, setShowWordCardView] = useState(false);
  const [currentWordCardIndex, setCurrentWordCardIndex] = useState(0);
  const [wordsForCardMode, setWordsForCardMode] = useState<DisplayVocabularyWord[]>([]); // 单词卡模式的单词列表
  const [cardFaceSetting, setCardFaceSetting] = useState<'english' | 'chinese' | 'both'>('english'); // 新增：卡片显示设置
  // 新增：完成状态管理
  const [showCompletionSummary, setShowCompletionSummary] = useState(false);
  const [processedIndices, setProcessedIndices] = useState<Set<number>>(new Set());
  const [sessionKnownCount, setSessionKnownCount] = useState(0);
  const [sessionUnknownCount, setSessionUnknownCount] = useState(0);
  // 新增：会话历史状态
  type CardHistoryEntry = {
    index: number;
    wordId: number | undefined;
    previousKnownCount: number;
    previousUnknownCount: number;
    previousProcessedIndices: Set<number>;
  };
  const [cardSessionHistory, setCardSessionHistory] = useState<CardHistoryEntry[]>([]);
  const [isWordCardFullscreen, setIsWordCardFullscreen] = useState(false);
  // --- Add states for card mode shuffle toggle ---
  const [isCardModeShuffled, setIsCardModeShuffled] = useState(false);
  const [originalWordsForCardMode, setOriginalWordsForCardMode] = useState<DisplayVocabularyWord[]>([]);
  // Ref to track if dictionary fetch has been initiated for the current words
  const dictionaryFetchInitiatedRef = useRef(false);

  // 先解构 useScrollMode
  const {
    isScrollMode,
    setIsScrollMode,
    scrollProgress,
    wordListRef,
    handleWordListScroll: originalHandleScroll,
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
    toggleShuffle: internalToggleShuffle,
    shuffle,
    restore: internalRestore,
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
  const { isFullscreen, toggleFullscreen, exitFullscreen } = useFullscreen();

  // 用 useKnownWords 管理已知单词和滑动
  const {
    knownWordIds,
    swipeState,
    handleSwipeStart,
    handleSwipeMove,
    handleSwipeEnd: hookHandleSwipeEnd,
    setKnownWordIds,
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

  // Get sound functions including chain sound controls
  const { 
    playOpenCoverSound, 
    playCloseCoverSound, 
    playShuffleSound, 
    playRestoreOrderSound, 
    playSwitchToPaginationSound,
    playSwitchToScrollSound,
    playCompleteLearningSound,
    startChainSound,
    stopChainSound,
    updateChainPlaybackRate,
  } = useSoundEffects();

  // Refs for scroll speed calculation and stop detection
  const lastScrollTopRef = useRef(0);
  const lastScrollTimeRef = useRef(0);
  const scrollStopTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpeedRef = useRef(0); // 新增：用于平滑速度计算的ref

  const memoizedTodaysLearningData = useMemo(() => todaysLearningData, [todaysLearningData]);

  // 在原始状态定义区域，新增一个 ref 来存储已请求的 wordBasicIds 键
  const fetchedWordIdsRef = useRef<string>('');
  
  const isLoadingKnownWordsRef = useRef(false);
  
  // 优化：将映射逻辑封装成单独函数
  const mapBackendToFrontendIds = useCallback((backendIds: number[]) => {
    const frontendIds = new Set<number>();
    originalWords.forEach(word => {
      if (word.word_basic_id && backendIds.includes(word.word_basic_id)) {
        frontendIds.add(word.id);
      }
    });
    return frontendIds;
  }, [originalWords]);
  
  // 定义一个专门处理API调用的函数
  const syncWithBackend = useCallback((wordId: number, shouldBeKnown: boolean) => {
    if (!studentId) return Promise.reject(new Error("缺少学生ID"));
    
    const word = originalWords.find(w => w.id === wordId);
    if (!word) return Promise.reject(new Error(`找不到ID为${wordId}的单词`));
    
    const wordBasicId = word.word_basic_id || wordId;
    
    if (shouldBeKnown) {
      return markKnownWord(Number(studentId), wordBasicId)
        .catch(error => {
          // 处理唯一性约束错误
          const errorData = error?.response?.data;
          const isUniqueConstraintError = 
            errorData?.non_field_errors?.some((msg: string) => 
              msg.includes("must make a unique set"));
          
          if (isUniqueConstraintError) {
            toast.info('单词已被标记为已认识');
            return Promise.resolve(); // 视为成功
          }
          return Promise.reject(error); // 其他错误重新抛出
        });
    } else {
      return unmarkKnownWord(Number(studentId), wordBasicId);
    }
  }, [studentId, originalWords]);
  
  // 合并两个useEffect：从后端加载学生已认识单词并更新状态
  useEffect(() => {
    // 如果没有学生ID或单词列表为空，则不处理
    if (!studentId || originalWords.length === 0) return;
    
    // 防止并发请求
    if (isLoadingKnownWordsRef.current) return;
    isLoadingKnownWordsRef.current = true;
    
    
    fetchKnownWordsCached(Number(studentId))
      .then(data => {
        const backendIds = data.map(item => item.word);
        setKnownWordIds(mapBackendToFrontendIds(backendIds));
      })
      .catch(err => {
        console.error('加载已认识单词失败:', err);
        toast.error('获取已认识单词失败');
      })
      .finally(() => {
        isLoadingKnownWordsRef.current = false;
      });
  }, [studentId, originalWords, setKnownWordIds, mapBackendToFrontendIds]);

  // 处理滑动结束并同步到后端
  const onSwipeEnd = useCallback((wordId: number, wordObj?: DisplayVocabularyWord): boolean => {
    const wasKnown = knownWordIds.has(wordId); // 滑动前的状态

    const markedBySwipe = hookHandleSwipeEnd(wordId); // 触发本地状态切换

    if (!markedBySwipe) {
      return false;
    }
    
    if (!studentId) {
      return markedBySwipe;
    }

    // 根据滑动前的状态确定意图
    const intendToMarkAsKnown = !wasKnown; // 之前不是已知，现在要标记为已知
    
    // 调用后端同步函数
    syncWithBackend(wordId, intendToMarkAsKnown)
      .then(() => {
        toast.success(intendToMarkAsKnown ? '标记为已认识' : '恢复为不认识');
      })
      .catch(error => {
        
        // 失败时回滚本地状态
        setKnownWordIds(prev => {
          const newSet = new Set(prev);
          if (intendToMarkAsKnown) {
            newSet.delete(wordId); // 标记失败，从已知集合中移除
          } else {
            newSet.add(wordId);    // 取消标记失败，重新添加到已知集合
          }
          return newSet;
        });
        
        toast.error(error.message || `${intendToMarkAsKnown ? '标记' : '恢复'}操作失败，请重试`);
      });
    
    return markedBySwipe;
  }, [knownWordIds, hookHandleSwipeEnd, studentId, setKnownWordIds, syncWithBackend]);

  // Main useEffect for setting words and general initialization
  useEffect(() => {
    // Now use the extracted/memoized variables inside the effect
    
    // 检查必要数据
    if (!statePlanId || !stateMode) {
      console.warn("MemorizeWords: Missing planId or mode in location state.");
      return;
    }
    // 设置初始状态 (可以在 effect 外部进行，但放在这里也ok)
    setUnitNumber(stateUnitNumber);
    setStartWordOrder(stateStartWordOrder);
    setEndWordOrder(stateEndWordOrder);
    setIsReviewingToday(stateIsReviewingToday || false);

    // 如果 React Query 还在加载今日数据，则等待
    if (isLoadingTodaysLearning) {
      console.log("MemorizeWords: Waiting for todaysLearningData...");
      return;
    }

    // 如果 React Query 加载出错，显示错误
    if (todaysLearningError) {
      toast.error(`加载学习数据失败: ${todaysLearningError.message}`);
      console.error("MemorizeWords: Error fetching todaysLearningData:", todaysLearningError);
      return;
    }

    // 使用 memoizedTodaysLearningData 进行后续检查
    if (!memoizedTodaysLearningData) {
      toast.info("未能获取到今日学习数据。");
      console.warn("MemorizeWords: memoizedTodaysLearningData is null or undefined after loading.");
      return;
    }

    // --- 根据 mode 设置单词列表 ---
    let wordsToSet: DisplayVocabularyWord[] = [];
    let modeToSet: 'new' | 'review' | null = null;

    // 优先使用从导航传入的特定单元单词 (stateWords)
    if (stateWords && stateWords.length > 0) {
      // 根据 mode 设置 learned 状态，并明确参数w的类型
      wordsToSet = stateWords.map((w: VocabularyWord) => ({ 
        ...w, 
        learned: stateMode === 'review' || stateIsReviewingToday
      }));
      modeToSet = stateMode as 'new' | 'review' | null;
    }
    // 如果没有传入单词，则从 todaysLearningData 中获取
    else if (stateMode === 'new') {
      modeToSet = 'new';
      const newUnit = memoizedTodaysLearningData.newUnit;
      if (newUnit && newUnit.words) {
        wordsToSet = newUnit.words.map(w => ({ ...w, learned: false }));
        if (stateUnitId !== newUnit.id || stateUnitNumber !== newUnit.unit_number) {
          console.warn("MemorizeWords (New Mode): Discrepancy...", { stateUnitId, stateUnitNumber, apiUnitId: newUnit.id, apiUnitNumber: newUnit.unit_number });
          setUnitNumber(newUnit.unit_number);
          setStartWordOrder(newUnit.start_word_order);
          setEndWordOrder(newUnit.end_word_order);
        }
      } else {
        console.warn("MemorizeWords (New Mode): New unit or words missing.");
      }
    } else if (stateMode === 'review') {
      modeToSet = 'review';
      const reviewUnitsData = memoizedTodaysLearningData.reviewUnits || [];
      setReviewUnits(reviewUnitsData);
      const targetReviewUnits = stateReviewUnitIds
        ? reviewUnitsData.filter(unit => stateReviewUnitIds.includes(unit.id))
        : reviewUnitsData;
      // 先缓存所有待复习单词，用于后续在不同 List 之间切换
      const allWordsFromReviewUnits = reviewUnitsData.flatMap(unit => 
        unit.words?.map(w => ({ ...w, learned: true })) || []
      );
      setAllReviewWords(allWordsFromReviewUnits);
      // 默认只展示第一个选中单元的单词
      if (targetReviewUnits.length > 0) {
        const firstUnit = targetReviewUnits[0];
        wordsToSet = firstUnit.words?.map(w => ({ ...w, learned: true })) || [];
        setSelectedReviewUnitId(firstUnit.id);
      } else {
        wordsToSet = [];
        setSelectedReviewUnitId(null);
      }
      if (wordsToSet.length === 0) {
        console.warn("MemorizeWords (Review Mode): No words found for the selected unit.");
      }
    } else if (stateMode === 'reviewToday' && stateUnitId) {
       modeToSet = 'new'; 
       const newUnit = memoizedTodaysLearningData.newUnit;
       if (newUnit && newUnit.id === stateUnitId && newUnit.words) {
         wordsToSet = newUnit.words.map(w => ({ ...w, learned: false }));
         setIsReviewingToday(true);
         if (stateUnitNumber !== newUnit.unit_number) {
           console.warn("MemorizeWords (ReviewToday Mode): Discrepancy in unit number.");
           setUnitNumber(newUnit.unit_number);
         }
         setStartWordOrder(newUnit.start_word_order);
         setEndWordOrder(newUnit.end_word_order);
       } else {
         console.error("MemorizeWords (ReviewToday Mode): Could not find matching new unit.");
       }
    } else {
      console.error("MemorizeWords: Invalid or unhandled mode received:", stateMode);
    }

    // 设置学习模式和单词列表
    setLearningMode(modeToSet);
    setOriginalWords(wordsToSet);
    setOriginalWordsLength(wordsToSet.length);

    // 重置相关状态 (这些 setters 在 effect 内部调用是安全的)
    //goToPage(1); // REMOVED
    setSearchQuery('');
    setSwipeState(new Map());
    setLearningComplete(false);
    setIsCompleting(false);
    setRemainingTaskType(null);
    // Don't fetch customizations here, let the dedicated effect handle it

    // 如果从贪吃蛇游戏返回，并且带回了页码，则跳转到该页 -- REMOVED
    // if (typeof snakeCameFromPage === 'number' && snakeCameFromPage > 0) {
    //   goToPage(snakeCameFromPage);
    // }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    statePlanId,
    stateUnitId,
    stateReviewUnitIds,
    stateMode,
    stateUnitNumber,
    stateStartWordOrder,
    stateEndWordOrder,
    stateIsReviewingToday,
    memoizedTodaysLearningData,
    isLoadingTodaysLearning,
    todaysLearningError,
    // goToPage, // REMOVED
    setSearchQuery, 
    setSwipeState, 
    stateWords
    // snakeCameFromPage // REMOVED
  ]);

  // New, dedicated useEffect for setting the page
  useEffect(() => {
    if (originalWords.length === 0 && !(typeof pageFromSnakeGame === 'number' && pageFromSnakeGame > 0) && totalPages === 0) {
      return;
    }
    
    if (totalPages === 0 && originalWords.length > 0 && !(typeof pageFromSnakeGame === 'number' && pageFromSnakeGame > 0)) {
        return;
    }

    const cameFromSnakeThisInstance = typeof pageFromSnakeGame === 'number' && pageFromSnakeGame > 0;
    let targetPageToGo = 1;

    if (cameFromSnakeThisInstance) {
      targetPageToGo = pageFromSnakeGame;
    } else {
      targetPageToGo = 1;
    }
    goToPage(targetPageToGo);
  }, [
      pageFromSnakeGame, 
      totalPages,        
      goToPage,          
      unitId, 
      mode,   
      originalWords.length 
  ]);

  // 监听 selectedReviewUnitId 变化，切换单词
  useEffect(() => {
    if (learningMode === 'review' && reviewUnits && selectedReviewUnitId) {
      const unit = reviewUnits.find(u => u.id === selectedReviewUnitId);
      setOriginalWords(unit?.words || []);
      setOriginalWordsLength((unit?.words || []).length);
      dictionaryFetchInitiatedRef.current = false; // Reset fetch flag when review unit changes
    }
  }, [learningMode, reviewUnits, selectedReviewUnitId]);

  // 用 useMemo 包裹 wordsToShow、filteredWords、displayWords，避免每次渲染都重新计算
  const memoizedWordsToShow = useMemo(() => wordsToShow, [wordsToShow]);
  const memoizedFilteredWords = useMemo(() => filteredWords, [filteredWords]);
  const memoizedShuffledArray = useMemo(() => shuffledArray, [shuffledArray]);
  const memoizedOriginalWords = useMemo(() => originalWords, [originalWords]);

  const displayWords = useMemo(() => {
    return isScrollMode
      ? (isShuffled ? memoizedShuffledArray : memoizedFilteredWords)
      : memoizedWordsToShow;
  }, [isScrollMode, isShuffled, memoizedShuffledArray, memoizedFilteredWords, memoizedWordsToShow]);

  // 基于当前展示的单词 displayWords 拉取自定义信息，避免重复请求
  useEffect(() => {
    if (!studentId || displayWords.length === 0) return;
    // 提取基础 ID 列表并排序
    const wordBasicIds = displayWords
      .map(w => w.word_basic_id)
      .filter((id): id is number => typeof id === 'number');
    if (wordBasicIds.length === 0) return;
    const sortedIds = [...wordBasicIds].sort((a, b) => a - b);
    const key = JSON.stringify(sortedIds);
    // 如果已拉取过相同的 ID 列表，则跳过
    if (fetchedWordIdsRef.current === key) return;
    fetchedWordIdsRef.current = key;

    fetchWordsCustomizationCached(Number(studentId), sortedIds)
      .then(customizations => {
        if (!customizations || !Array.isArray(customizations)) return;
        const customMap = new Map(customizations.map((c: any) => [c.word_basic_id, c]));
        setOriginalWords(prevWords =>
          prevWords.map(word => {
            if (!sortedIds.includes(word.word_basic_id!)) return word;
            const custom = customMap.get(word.word_basic_id!);
            return custom
              ? { ...word, notes: custom.notes ?? word.notes, example_sentence: custom.example_sentence ?? word.example_sentence }
              : word;
          })
        );
      })
      .catch(err => {
        console.error("Failed to fetch or merge customizations:", err);
      });
  }, [studentId, displayWords]);

  // 新增：渲染前打印 originalWords、wordsToShow、searchQuery
  useEffect(() => {
  }, [originalWords, wordsToShow, searchQuery]);

  const handlePageTransition = (direction: 'next' | 'prev') => {
    if (isAnimating || isCompleting || isScrollMode) return;
    
    // Play sound based on direction *before* starting animation/page change
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
    // Play sound based on the *current* state before toggling
    if (isShuffled) {
      playRestoreOrderSound();
    } else {
      playShuffleSound();
    }

    // Call the original hook logic or implement custom logic
    if (isScrollMode) {
      internalToggleShuffle(); // Use renamed internal function
      return;
    }
    if (!isShuffled) {
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
      internalRestore(); // Use renamed internal function
    }
  };

  // --- Modified Shuffle function for Card Mode with Toggle --- 
  const handleShuffleCardModeWords = () => {
    // Play sound based on the *current* state before toggling
    if (isCardModeShuffled) {
      playRestoreOrderSound();
    } else {
      playShuffleSound();
    }

    if (isCardModeShuffled) {
      // Restore original order
      console.log("Restoring original order for card mode...");
      setWordsForCardMode(originalWordsForCardMode);
      setIsCardModeShuffled(false);
      setCurrentWordCardIndex(0);
      toast.info("单词卡顺序已恢复");
    } else {
      // Shuffle the words
      console.log("Shuffling words for card mode...");
      setWordsForCardMode(prevWords => { // Note: this was incorrectly using prevWords before
        const array = [...originalWordsForCardMode]; // Shuffle from the original list
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
      });
      setIsCardModeShuffled(true);
      setCurrentWordCardIndex(0);
      toast.info("单词卡顺序已打乱");
    }
  };

  const handleGoHome = () => {
    // 先退出全屏，确保返回学生页面时不处于全屏状态
    exitFullscreen();

    if (studentId) {
      // console.log(`Navigating back to student page with ID: ${studentId}`);
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
    // Play sound *before* changing the state
    if (showCover) {
      playCloseCoverSound(); // Play close sound if cover is currently shown
    } else {
      playOpenCoverSound(); // Play open sound if cover is currently hidden
    }

    // Toggle the cover state
    setShowCover(!showCover);

    // Reset related states
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
        if (isShuffled) internalToggleShuffle();
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
    // Reset fetch flag only when words actually clear
    if (originalWords.length === 0) {
      dictionaryFetchInitiatedRef.current = false;
      setWordExtraInfoMap(new Map());
      setIsExtraInfoLoading(false);
      return;
    }

    // Only fetch if not already initiated
    if (dictionaryFetchInitiatedRef.current) {
        console.log("[Dictionary Fetch] Skipping fetch, already initiated for this word set.");
        return;
    }

    let isCancelled = false;
    const fetchAll = async () => {
      // Double check cancellation and initiation flag inside async function
      if (isCancelled || !dictionaryFetchInitiatedRef.current) return;

      console.log("[Dictionary Fetch] Starting prefetch...");
      setIsExtraInfoLoading(true);
      // No need to set ref flag here again, it was set before calling fetchAll

      const map = new Map();
      const preloadWords = originalWords.slice(0, 10);
      let requestCount = 0;

      for (let i = 0; i < preloadWords.length; i++) {
        if (isCancelled) break; // Allow breaking loop if component unmounts/effect re-runs
        const w = preloadWords[i];
        if (wordExtraInfoMap.has(w.word)) {
          map.set(w.word, wordExtraInfoMap.get(w.word));
          continue;
        }
        try {
          requestCount++;
          console.log(`[Dictionary Fetch #${requestCount}] Fetching: ${w.word}`);
          const dict = await dictionaryService.getWordDetails(w.word);
          const { synonyms, antonyms, derivatives } = parseSynAntoDerivativesFromDictApi(dict);
          if (dict && dict.length > 0) {
            map.set(w.word, { dictDetails: dict, synonyms, antonyms, derivatives, phonetics: dict[0].phonetics });
          }
        } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 404) {
            console.log(`[Dictionary Fetch #${requestCount}] Not found: "${w.word}".`);
          } else {
            console.error(`[Dictionary Fetch #${requestCount}] Failed for "${w.word}":`, error);
          }
          map.set(w.word, { error: true });
        }
        if (i < preloadWords.length - 1) {
          try {
            console.log(`[Dictionary Fetch] Waiting 1000ms...`);
            await new Promise(res => setTimeout(res, 1000));
          } catch (e) { /* ignore timer errors */ }
        }
      }

      if (!isCancelled) {
        console.log("[Dictionary Fetch] Prefetch loop finished. Updating map.");
        setWordExtraInfoMap(prevMap => new Map([...prevMap, ...map]));
        setIsExtraInfoLoading(false);
        // Mark as initiated *after successful completion*? - No, mark before loop
        // dictionaryFetchInitiatedRef.current = true;
      } else {
        console.log("[Dictionary Fetch] Prefetch cancelled.");
      }
    };

    // Use setTimeout to slightly delay the fetch start
    const timerId = setTimeout(fetchAll, 100);

    // Cleanup function
    return () => {
      isCancelled = true; // Signal cancellation to the async loop
      clearTimeout(timerId);
      // Do NOT reset the ref flag here, it should persist for the current word set
      // dictionaryFetchInitiatedRef.current = false; 
    };

  }, [originalWords]); // Keep dependency only on originalWords

  // 修改：单词卡片视图相关函数
  const handleOpenWordCardView = () => {
    let listToShowInCard: DisplayVocabularyWord[] = [];
    let startIndex = 0;

    if (isScrollMode) {
      listToShowInCard = isShuffled ? shuffledArray : filteredWords;
      const listElement = wordListRef.current;
      if (listElement) {
        const wordElements = listElement.querySelectorAll('[data-word-id]');
        let minTop = Infinity;
        wordElements.forEach((el) => {
          const rect = el.getBoundingClientRect();
          const listRect = listElement.getBoundingClientRect();
          if (rect.top <= listRect.top + 10 && rect.top < minTop) {
             minTop = rect.top;
             const wordId = el.getAttribute('data-word-id');
             const foundIndex = listToShowInCard.findIndex(w => w.id === Number(wordId));
             if (foundIndex !== -1) {
               startIndex = foundIndex;
             }
          }
        });
      }
    } else {
      listToShowInCard = wordsToShow;
      startIndex = 0;
    }

    if (listToShowInCard.length === 0) {
        toast.error("没有可供学习的单词");
        return;
    }

    setProcessedIndices(new Set());
    setSessionKnownCount(0);
    setSessionUnknownCount(0);
    setShowCompletionSummary(false);
    setCardSessionHistory([]);
    setOriginalWordsForCardMode(listToShowInCard); 
    setWordsForCardMode(listToShowInCard);
    setIsCardModeShuffled(false); 
    setCurrentWordCardIndex(startIndex);
    setShowWordCardView(true);
  };

  const handleCloseWordCardView = () => {
    setShowWordCardView(false);
    setWordsForCardMode([]);
    setOriginalWordsForCardMode([]); // Clear original list
    setIsCardModeShuffled(false); // Reset shuffle state
    setIsWordCardFullscreen(false); // Ensure fullscreen is exited
    if (showCompletionSummary) {
        setShowCompletionSummary(false); // Also hide summary if it was shown
    }
  };

  //定义一个新的状态来作为WordCardView的key
  const [cardKey, setCardKey] = useState(0);

  const handleWordCardNext = () => {
    // 基于 wordsForCardMode 判断
    if (currentWordCardIndex < wordsForCardMode.length - 1) {
      // 通过改变key使WordCardView组件重新挂载，重置内部状态
      setCardKey(prev => prev + 1);
      setCurrentWordCardIndex(prev => prev + 1);
    }
  };

  const handleWordCardPrev = () => {
    // 基于 wordsForCardMode 判断
    if (currentWordCardIndex > 0) {
      // 通过改变key使WordCardView组件重新挂载，重置内部状态
      setCardKey(prev => prev + 1);
      setCurrentWordCardIndex(prev => prev - 1);
    }
  };

   // 修改 MarkKnown 和 MarkUnknown 逻辑以包含完成检查
   const handleMarkUnknown = () => {
    const word = wordsForCardMode[currentWordCardIndex];
    console.log("Marking word as unknown:", word?.word);

    // 记录当前状态到历史记录
    const currentState: CardHistoryEntry = {
        index: currentWordCardIndex,
        wordId: word?.id, 
        previousKnownCount: sessionKnownCount,
        previousUnknownCount: sessionUnknownCount,
        previousProcessedIndices: new Set(processedIndices) // 复制 Set
    };
    setCardSessionHistory(prevHistory => [...prevHistory, currentState]);

    // TODO: Implement actual logic (e.g., API call, update knownWordIds state if needed)

    const newProcessedIndices = new Set(processedIndices).add(currentWordCardIndex);
    setProcessedIndices(newProcessedIndices);
    const newUnknownCount = sessionUnknownCount + 1;
    setSessionUnknownCount(newUnknownCount);

    // 检查是否完成
    if (newProcessedIndices.size === wordsForCardMode.length) {
        setShowWordCardView(false); 
        setShowCompletionSummary(true); 
    } else {
        handleWordCardNext(); // 移动到下一个
    }
   };

   const handleMarkKnown = () => {
    const word = wordsForCardMode[currentWordCardIndex];
    console.log("Marking word as known:", word?.word);

    // 记录当前状态到历史记录
    const currentState: CardHistoryEntry = {
        index: currentWordCardIndex,
        wordId: word?.id,
        previousKnownCount: sessionKnownCount,
        previousUnknownCount: sessionUnknownCount,
        previousProcessedIndices: new Set(processedIndices) // 复制 Set
    };
    setCardSessionHistory(prevHistory => [...prevHistory, currentState]);

    // TODO: Implement actual logic (e.g., API call, update knownWordIds state)
    
    const newProcessedIndices = new Set(processedIndices).add(currentWordCardIndex);
    setProcessedIndices(newProcessedIndices);
    const newKnownCount = sessionKnownCount + 1;
    setSessionKnownCount(newKnownCount);

    // 检查是否完成
    if (newProcessedIndices.size === wordsForCardMode.length) {
        console.log("Card session complete!");
        setShowWordCardView(false);
        setShowCompletionSummary(true);
    } else {
        handleWordCardNext(); // 移动到下一个
    }
   };

   // 新增：处理卡片设置更改
   const handleCardSettingChange = (newSetting: 'english' | 'chinese' | 'both') => {
     setCardFaceSetting(newSetting);
   };

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
    // 滚动模式初始化逻辑: 只在组件首次加载时尝试从 sessionStorage恢复
    // 或者当 setIsScrollMode 函数本身发生变化时 (理论上不应发生)
    const persistedScrollMode = sessionStorage.getItem('memorizeWordsUserScrollMode');
    if (persistedScrollMode !== null) {
      const currentPersistedValue = persistedScrollMode === 'true';
      // 直接设置，不再检查 isScrollMode，因为这个effect应只在初始设置时起主要作用
      setIsScrollMode(currentPersistedValue);
    } else {
      // 如果 session storage 中没有记录（首次访问），则默认为滚动模式
      setIsScrollMode(true);
    }

    // 新增：自动全屏逻辑，优先读取sessionStorage
    let shouldFullscreen = false;
    const stored = sessionStorage.getItem('memorizeAutoFullscreen');
    if (stored === 'true') shouldFullscreen = true;
    if (stored === 'false') shouldFullscreen = false;
    if (stored !== null) sessionStorage.removeItem('memorizeAutoFullscreen');
    else if (location.state && location.state.autoFullscreen) {
      shouldFullscreen = true;
    }
    // 只在状态不一致时才切换
    if (shouldFullscreen !== isFullscreen) {
      toggleFullscreen();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setIsScrollMode, isFullscreen]);

  // 新增：当 isScrollMode 变化时，将其持久化到 sessionStorage
  useEffect(() => {
    sessionStorage.setItem('memorizeWordsUserScrollMode', String(isScrollMode));
  }, [isScrollMode]);

  // --- 新增：完成屏幕的处理器 ---
  const handleRestartCardMode = () => {
      console.log("Restarting card mode with same words");
      setShowCompletionSummary(false);
      // 使用当前的 wordsForCardMode 重新打开，需要重置内部状态
      setProcessedIndices(new Set());
      setSessionKnownCount(0);
      setSessionUnknownCount(0);
      setCurrentWordCardIndex(0); // 从第一个开始
      setIsWordCardFullscreen(true); // 设置为全屏启动
      setShowWordCardView(true);
  };
  
  // Rename handlePractice to handleExitSummary and change its logic
  const handleExitSummary = () => {
      console.log("Exiting summary screen.");
      // toast.info("问题练习功能待实现"); // Remove toast
      setShowCompletionSummary(false); // Only close the summary screen
      // handleGoHome(); // Remove navigation
  };
  
  const handleSummaryGoBack = () => {
      console.log("Go back from summary");
      setShowCompletionSummary(false);
      // handleGoHome(); // Remove navigation, just close the summary
  };

  // --- 实现撤销功能 ---
  const handleUndoAction = () => {
    if (cardSessionHistory.length === 0) {
      toast.info("没有可撤销的操作");
      return;
    }

    // 从历史记录中弹出上一个状态
    const lastState = cardSessionHistory[cardSessionHistory.length - 1];
    const newHistory = cardSessionHistory.slice(0, -1); // 创建新的历史记录数组

    console.log("Undoing action for word index:", lastState.index);

    // 恢复状态
    setCurrentWordCardIndex(lastState.index);
    setSessionKnownCount(lastState.previousKnownCount);
    setSessionUnknownCount(lastState.previousUnknownCount);
    setProcessedIndices(lastState.previousProcessedIndices);
    setCardSessionHistory(newHistory); // 更新历史记录

    // 如果总结屏幕是显示的，隐藏它
    if (showCompletionSummary) {
        setShowCompletionSummary(false);
    }

    // TODO: If backend calls were made during mark, call reverse API here

    toast.success("操作已撤销");
  };

  // 新增：切换单词卡全屏状态的函数
  const toggleWordCardFullscreen = () => {
       setIsWordCardFullscreen(prev => !prev);
   };

  // 创建包含音效和缓存失效的完成处理函数
  const handleCompletionWithSound = () => {
    playCompleteLearningSound();
    handleCompletion();

    // 只在新词学习/温习新词时上报
    if (learningMode === 'new' || (stateMode === 'reviewToday')) {
      const start = Number(sessionStorage.getItem("learningSessionStart"));
      sessionStorage.removeItem("learningSessionStart");
      const durationSec = (!isNaN(start) && start > 0) ? Math.floor((Date.now() - start) / 1000) : 0;

      const wordCount = typeof originalWordsLength === 'number' && originalWordsLength > 0
        ? originalWordsLength
        : (originalWords ? originalWords.length : 0);

      reportDurationLog({
        type: "learning",
        duration: durationSec,
        client_start_time: start > 0 ? new Date(start).toISOString() : undefined,
        client_end_time: new Date().toISOString(),
        student: Number(studentId),
        word_count: wordCount,
        wrong_word_count: Number(sessionUnknownCount) || 0,
        // mode: learningMode, // 可选
      }).catch(() => {});
    }

    // 复习模式不主动上报
    // 使与当前 planId 相关的 matrixData 查询失效
    if (planId) {
      queryClient.invalidateQueries({ queryKey: ['matrixData', planId] });
    }
  };

  // 创建新的处理函数，包含音效逻辑
  const handleToggleScrollModeWithSound = () => {
    // Play sound based on the *current* state before toggling
    if (isScrollMode) {
      playSwitchToPaginationSound(); // 即将切换到分页
    } else {
      playSwitchToScrollSound(); // 即将切换到滚动
    }
    // Toggle the mode using the setter from the hook
    setIsScrollMode(prev => !prev); 
    // Reset progress (optional, but good practice)
    // setScrollProgress(0); // setScrollProgress 也需要从 hook 中解构出来
  };

  // Enhanced scroll handler with sound logic
  const handleScrollWithSound = useCallback(() => {
    originalHandleScroll();

    // Only apply sound logic if global sound, scroll sound, and scroll mode are enabled
    if (!isScrollMode || !isSoundEnabled || !isScrollSoundEnabled || !wordListRef.current) {
       stopChainSound();
       return;
    }

    const now = performance.now();
    const currentScrollTop = wordListRef.current.scrollTop;
    const elementHeight = wordListRef.current.clientHeight;
    const scrollHeight = wordListRef.current.scrollHeight;

    // Avoid calculations if not actually scrollable or at boundaries
    if (scrollHeight <= elementHeight) {
       stopChainSound();
       return;
    }

    const deltaTime = now - lastScrollTimeRef.current;
    const deltaScroll = currentScrollTop - lastScrollTopRef.current;

    // Update refs for next event *before* potential early exit
    lastScrollTopRef.current = currentScrollTop;
    lastScrollTimeRef.current = now;

    // If deltaTime is too small or 0, avoid division by zero and skip calculation
    // Also ignore tiny scrolls that might just be jitter
    // 增大忽略阈值，避免微小变化引起声音波动
    if (deltaTime < 20 || Math.abs(deltaScroll) < 3) { 
        // Still reset the stop timer if movement is detected
        if (Math.abs(deltaScroll) >= 3) {
             if (scrollStopTimerRef.current) {
                clearTimeout(scrollStopTimerRef.current);
             }
             scrollStopTimerRef.current = setTimeout(stopChainSound, 150); // Reset stop timer
             startChainSound(); // Ensure sound is playing if minor scroll happens
        }
        return; 
    }

    // 原始速度计算
    const rawSpeed = Math.abs(deltaScroll) / deltaTime; // Pixels per millisecond
    
    // 限制最大原始速度，避免突然的高速值
    const cappedSpeed = Math.min(2.0, rawSpeed);
    
    // 速度平滑处理：当前速度占60%，上次速度占40%
    const smoothedSpeed = (cappedSpeed * 0.6) + (lastSpeedRef.current * 0.4);
    lastSpeedRef.current = smoothedSpeed;

    // --- 优化播放速率计算 ---
    // 将速度映射到播放速率 (0.5x 到 1.8x)：
    // 1. 增大除数到12.0以减缓声音响应
    // 2. 降低最大速率上限到1.8
    const rate = Math.max(0.5, Math.min(0.3, 0.5 + smoothedSpeed / 100.0)); 

    // 更新声音时额外缩放，使变化更平缓
    updateChainPlaybackRate(rate * 0.8);
    startChainSound(); // 开始播放声音（如果尚未播放）

    // 防抖动停止声音
    if (scrollStopTimerRef.current) {
      clearTimeout(scrollStopTimerRef.current);
    }
    scrollStopTimerRef.current = setTimeout(stopChainSound, 150); // 如果150ms内没有滚动，停止声音

  }, [isScrollMode, isSoundEnabled, isScrollSoundEnabled, originalHandleScroll, startChainSound, stopChainSound, updateChainPlaybackRate, wordListRef]);

   // Effect to stop sound when switching out of scroll mode or unmounting
   useEffect(() => {
     return () => {
       if (scrollStopTimerRef.current) {
         clearTimeout(scrollStopTimerRef.current);
       }
       stopChainSound(); // Ensure sound stops on cleanup
     };
   }, [stopChainSound]); // Only depends on stopChainSound

   // Effect to stop sound specifically when isScrollMode becomes false
   useEffect(() => {
     if (!isScrollMode) {
        if (scrollStopTimerRef.current) {
          clearTimeout(scrollStopTimerRef.current);
        }
        stopChainSound();
     }
   }, [isScrollMode, stopChainSound]);

  // 在渲染"完成"按钮处，判断当前单元是否已全部完成
  // 找到当前单元
  const currentReviewUnit = useMemo(() => {
    if (learningMode === 'review' && reviewUnits && selectedReviewUnitId) {
      return reviewUnits.find(u => u.id === selectedReviewUnitId);
    }
    return null;
  }, [learningMode, reviewUnits, selectedReviewUnitId]);
  const isCurrentUnitCompleted = currentReviewUnit?.reviews?.every(r => r.is_completed);

  // 计算完成按钮的 style
  const completeButtonStyle: any = isScrollMode ? ({ 
    opacity: Math.max(0.3, scrollProgress),
    pointerEvents: scrollProgress > 0.8 ? 'auto' : 'none'
  }) : undefined;

  // 自动时长统计和上报
  const { user, userRole } = useAuth();
  // Determine duration type based on role
  const durationType = useMemo(() => {
    if (userRole === 'teacher') {
      return 'teaching';
    } else if (userRole === 'student') {
      return 'learning';
    } else {
      return undefined; // Or 'other' if applicable
    }
  }, [userRole]);
  
  // Pass studentId to the hook if the type is 'teaching'
  useDurationLogger(
    undefined, // userId is no longer needed here
    durationType, 
    durationType === 'teaching' ? studentId : null // Pass studentId only for teaching
  );

  // 日志已移除，不再输出数据加载状态

  // Placeholder handlers for LeftSidebar props - replace with actual logic
  const handleToggleNightMode = () => {
    // Logic to toggle night mode - likely involves settings context
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLeftSidebarSearch = () => {
    // Logic for search initiated from LeftSidebar
    // Potentially focus the existing search bar or open a search modal
    handleSearchClick(); 
  };

  const handleToggleNotesPanel = () => {
    // Logic to toggle a notes panel
    // Assuming there's a state like showNotesPanel in settings
    // This might conflict or integrate with the existing AnnotationPanel
    // For now, let's assume it toggles the existing AnnotationPanel via settings
    setShowNotesPanel(!showNotesPanel); // Corrected line using the function from context
  };
  
  const handleLeftSidebarSettings = () => {
    // Logic to open settings - likely toggles SettingsPanel
    setShowSettingsPanel(true);
  };

  // 添加处理导出PDF的函数
  const handleExportPdf = async (exportType: ExportType) => {
    try {
      // 根据当前模式选择要导出的单词
      const wordsToExport = learningMode === 'new' ? originalWords : allReviewWords;
      
      // 调用导出函数
      generateWordListPDF(wordsToExport, exportType, learningMode === 'new');
    } catch (error) {
      console.error('导出PDF失败:', error);
      toast.error('导出PDF失败，请稍后再试');
    }
  };

  return (
    <div className="h-screen w-full flex flex-col relative overflow-hidden dark:bg-gray-900 transition-colors duration-300">
      {/* 添加Header组件并传递导出PDF的回调函数 */}
      <Header 
        onOpenWordCardView={handleOpenWordCardView} 
        onExport={handleExportPdf}
        theme={theme}
        currentPageWords={wordsToShow}
        newTodayWords={learningMode === 'new' ? originalWords : []}
        reviewTodayWords={learningMode === 'review' ? originalWords : []}
        currentPage={currentPage}
        isFullscreen={isFullscreen} // 新增
      />

      {/* ViewportContentRow - ADDED relative */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Wrapper for LeftSidebar to apply absolute positioning and width */}
        <div className="absolute top-0 left-0 h-full z-30"> {/* Example width w-64. Adjust if necessary. */}
          <LeftSidebar
            onToggleFullscreen={toggleFullscreen}
            onToggleNightMode={handleToggleNightMode}
            onSearch={handleLeftSidebarSearch}
            onSettings={handleLeftSidebarSettings}
            isFullscreen={isFullscreen}
            currentTheme={settings.theme}
          />
        </div>
        
        <div className="w-full flex flex-col overflow-hidden"> 
          {showClock && !showCompletionSummary && <WalkingClock darkMode={theme === 'dark'} />}

          {/* This 'main' element is a child of a now full-width container.
              Its 'justify-center' will center its direct child (CardContainer) globally across the screen width.
          */}
          <main className="flex-1 flex items-center justify-center p-4 md:p-8 overflow-y-auto">
            {/* CardContainer - This div will be globally centered.
                On narrower screens, it might visually overlap the LeftSidebar due to absolute centering.
            */}
            <div className="w-full max-w-lg mx-auto">
              <Card className="rounded-[2rem] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 transition-all duration-300">
                {isCompleting ? null : (
                   <div className="w-full max-w-lg h-[calc(100vh-2rem-56px-48px)] flex flex-col max-sm:max-w-full max-sm:h-[calc(100vh-5rem-56px-48px)]">
                     <Card className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-gray-800 flex-1 flex flex-col transition-colors duration-300">
                        <div className="relative h-14 min-h-[56px] border-b border-gray-200 dark:border-gray-700">
                           {/* 居中标题 */}
                           <div className="absolute left-0 right-0 top-0 bottom-0 flex items-center justify-center pointer-events-none">
                             {/* 修改条件渲染标题的逻辑，优先显示特定list */}
                             {stateWords && stateWords.length > 0 && stateUnitNumber ? (
                               <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 pointer-events-auto">
                                 List {stateUnitNumber}
                               </h2>
                             ) : learningMode === 'new' && (
                               <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 pointer-events-auto">
                                 {isReviewingToday ? `List ${unitNumber || ''}` : `List ${unitNumber || ''}`}
                               </h2>
                             )}
                             {/* 修改review模式的显示逻辑 */}
                             {!stateWords && learningMode === 'review' && reviewUnits && reviewUnits.length > 1 && (
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
                             {!stateWords && learningMode === 'review' && (!reviewUnits || reviewUnits.length <= 1) && (
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
                                 if (isAnimating || isCompleting) return;
                                 if (isScrollMode && scrollProgress > 0.8 && !learningComplete) {
                                   handleCompletionWithSound();
                                 } else if (!isScrollMode) {
                                   if (currentPage === totalPages && totalPages > 0 && !learningComplete) {
                                     handleCompletionWithSound();
                                   }
                                 }
                               }}
                               disabled={isAnimating || isCompleting || (totalPages === 0) || 
                                 (!isScrollMode && currentPage === totalPages && learningComplete) || 
                                 (isScrollMode && (scrollProgress <= 0.8 || learningComplete)) || isCurrentUnitCompleted}
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
                               style={completeButtonStyle}
                             >
                               {isCurrentUnitCompleted ? '已完成' : (((!isScrollMode && currentPage === totalPages) || (isScrollMode && scrollProgress > 0.8)) && totalPages > 0 && !learningComplete ? '完成' : null)}
                             </Button>
                           </div>
                         </div>

                        {/* Word List Area - Attach the new scroll handler */}
                        <div
                          ref={wordListRef}
                          className={`flex-1 p-4 relative overflow-y-auto scrollbar-hide`}
                          style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            overflowX: 'hidden'
                          }}
                          onScroll={handleScrollWithSound} // Use the enhanced handler
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
                                    /* opacity: 0; */
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
                                    opacity: 0.3;
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
                                hover:border-green-400 transition-all duration-200
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
                                  onSwipeEnd={onSwipeEnd}
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

                        <div className="border-t border-gray-200 dark:border-gray-700 p-2">
                          <div className="flex justify-between items-center">
                            {!isScrollMode && (
                              <div className="flex justify-between items-center w-full">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => !isAnimating && currentPage > 1 && handlePageTransition('prev')} 
                                  disabled={currentPage === 1 || isAnimating || isCompleting}
                                  className="border-gray-200 dark:border-gray-700 h-8 px-3 flex items-center gap-1"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
                                    <path d="M18.5 12.5 C 17 12.3, 7 12.1, 6.5 12" />
                                    <path d="M11.5 5.5 C 10 7, 7 11, 6.5 12" />
                                    <path d="M11.5 18.5 C 10 17, 7 13, 6.5 12" />
                                  </svg>
                                </Button>
                                
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                  {Array.isArray(originalWords) && originalWords.length > 0 ? `${currentPage} / ${totalPages}` : '0 / 0'}
                                </span>
                                
                                {currentPage < totalPages ? (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => !isAnimating && currentPage < totalPages && handlePageTransition('next')} 
                                    disabled={currentPage >= totalPages || isAnimating || isCompleting}
                                    className="border-gray-200 dark:border-gray-700 h-8 px-3 flex items-center gap-1"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
                                      <path d="M5.5 12.5 C 7 12.3, 17 12.1, 17.5 12" />
                                      <path d="M12.5 5.5 C 14 7, 17 11, 17.5 12" />
                                      <path d="M12.5 18.5 C 14 17, 17 13, 17.5 12" />
                                    </svg>
                                  </Button>
                                ) : (
                                  <div className="w-[80px]"></div>
                                )}
                              </div>
                            )}
                          </div>
                          {/* The button grid previously here was moved to BottomToolbar */}
                        </div>
                     </Card>
                   </div>
                )}
              </Card>
            </div>
          </main>
          
          <BottomToolbar 
            onToggleScrollMode={handleToggleScrollModeWithSound}
            onToggleCover={handleTestButtonClick}
            onToggleShuffle={handleToggleShuffle}
            onOpenAddWordsDialog={handleOpenAddWordsDialog}
            onGoBack={handleGoHome} // 新增此行
            isScrollModeActive={isScrollMode}
            isCoverActive={showCover}
            isShuffleActive={isShuffled}
            theme={settings.theme}
          />
        </div>
      </div>

      {/* Completion Screen Overlay (Rendered conditionally on top) */}
      {learningComplete && !isCompleting && (
        <CompletionScreen
          learningMode={learningMode}
          remainingTaskType={remainingTaskType}
          handleGoHome={handleGoHome}
          navigate={navigate}
          onClose={() => setLearningComplete(false)}
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

      {/* 修改：条件渲染单词卡片视图，添加key属性 */}
      {showWordCardView && wordsForCardMode.length > 0 && (
        <WordCardView
          key={cardKey}
          word={wordsForCardMode[currentWordCardIndex]}
          onClose={handleCloseWordCardView}
          onNext={handleWordCardNext}
          onPrev={handleWordCardPrev}
          darkMode={theme === 'dark'}
          hasNext={currentWordCardIndex < wordsForCardMode.length - 1}
          hasPrev={currentWordCardIndex > 0}
          onMarkUnknown={handleMarkUnknown}
          onMarkKnown={handleMarkKnown}
          onUndoAction={handleUndoAction}
          onShuffleAction={handleShuffleCardModeWords}
          currentIndex={currentWordCardIndex}
          totalCount={wordsForCardMode.length}
          cardFaceSetting={cardFaceSetting}
          onSettingChange={handleCardSettingChange}
          isFullScreen={isWordCardFullscreen}
          onToggleFullScreen={toggleWordCardFullscreen}
        />
      )}

      {/* 新增：条件渲染完成统计屏幕 */}
      {showCompletionSummary && (
        <CompletionSummary 
          knownCount={sessionKnownCount}
          unknownCount={sessionUnknownCount}
          totalCount={wordsForCardMode.length} // Total in the session
          onRestart={handleRestartCardMode}
          onExit={handleExitSummary}
          onGoBack={handleSummaryGoBack}
          darkMode={theme === 'dark'}
        />
      )}

      {/* 添加批注面板 - 根据状态条件渲染 */}
      {showNotesPanel && !showCompletionSummary && <AnnotationPanel
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