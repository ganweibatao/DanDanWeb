import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
    ArrowLeft, ArrowRight, Shuffle, Search, Sun, Moon, Home, Settings, X, CheckCircle, BookOpen, ListRestart, Columns, Maximize, Minimize, Check, RotateCcw, Pencil
} from 'lucide-react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Input } from "../../components/ui/input";
import { VocabularyWord } from "../../services/api";
import {
    markUnitAsLearned,
    markReviewAsCompleted,
    getTodaysLearning,
    LearningUnit,
    TodayLearningResponse,
    UnitReview,
} from "../../services/learningApi";
import { toast } from 'sonner';
import { WordDetailModal } from '../../components/WordDetailModal';
import { Textarea } from '../../components/ui/textarea';
import { AnnotationPanel } from "../../components/AnnotationPanel";
import { SettingsPanel, FontSizeSettings } from "../../components/SettingsPanel";

const WORDS_PER_PAGE = 5;

// Fisher-Yates (aka Knuth) Shuffle 算法
const shuffleArray = <T,>(array: T[]): T[] => {
  let currentIndex = array.length, randomIndex;
  const newArray = [...array];
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [newArray[currentIndex], newArray[randomIndex]] = [
      newArray[randomIndex], newArray[currentIndex]];
  }
  return newArray;
};

// Assume VocabularyWord might have these optional fields for local state
interface DisplayVocabularyWord extends VocabularyWord {
    examples?: string;
    derivatives?: string;
}

export const MemorizeWords = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { studentId } = useParams<{ studentId: string }>();

  const [originalWords, setOriginalWords] = useState<DisplayVocabularyWord[]>([]);
  const [shuffledWords, setShuffledWords] = useState<DisplayVocabularyWord[]>([]);
  const [displayedWords, setDisplayedWords] = useState<DisplayVocabularyWord[]>([]);
  const [learningMode, setLearningMode] = useState<'new' | 'review' | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isShuffled, setIsShuffled] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<'next' | 'prev' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showCover, setShowCover] = useState(false);
  const [coverPosition, setCoverPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const wordListRef = useRef<HTMLDivElement>(null);
  const [revealedWordId, setRevealedWordId] = useState<number | null>(null);
  const [hoveredWordId, setHoveredWordId] = useState<number | null>(null);
  const [planId, setPlanId] = useState<number | null>(null);
  const [unitId, setUnitId] = useState<number | undefined | null>(undefined);
  const [reviewUnits, setReviewUnits] = useState<LearningUnit[] | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [learningComplete, setLearningComplete] = useState(false);
  const [remainingTaskType, setRemainingTaskType] = useState<'new' | 'review' | 'none' | null>(null);
  const [isScrollMode, setIsScrollMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [knownWordIds, setKnownWordIds] = useState<Set<number>>(new Set());
  const [swipeState, setSwipeState] = useState<Map<number, { startX: number; currentX: number; isSwiping: boolean }>>(new Map());
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedWordForDetail, setSelectedWordForDetail] = useState<DisplayVocabularyWord | null>(null);
  const [isFirstModalOpen, setIsFirstModalOpen] = useState(true);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [fontSizes, setFontSizes] = useState<FontSizeSettings>({
    english: 17,
    pronunciation: 13,
    chinese: 15
  });
  const [isBottomButtonsDisabled, setIsBottomButtonsDisabled] = useState(false);

  useEffect(() => {
    console.log("[MemorizeWords useEffect] Received location.state:", location.state);
    if (location.state?.words && Array.isArray(location.state.words)) {
      const receivedWords: DisplayVocabularyWord[] = location.state.words;
      const receivedMode: 'new' | 'review' = location.state.mode;
      const receivedPlanId: number = location.state.planId;
      const receivedUnitId: number | undefined | null = location.state.unitId;
      const receivedReviewUnits: LearningUnit[] | null = location.state.reviewUnits;

      console.log("[MemorizeWords useEffect] Parsed State:", {
        wordCount: receivedWords.length,
        mode: receivedMode,
        planId: receivedPlanId,
        unitId: receivedUnitId,
        reviewUnitsCount: receivedReviewUnits?.length ?? 0,
        hasReviewUnits: !!receivedReviewUnits
      });

      setOriginalWords(receivedWords);
      setDisplayedWords(receivedWords);
      setShuffledWords(shuffleArray(receivedWords));
      setLearningMode(receivedMode);
      setPlanId(receivedPlanId);
      setUnitId(receivedUnitId);
      setReviewUnits(receivedReviewUnits);
      setCurrentPage(1);
      setIsShuffled(false);
      setLearningComplete(false);
      setIsCompleting(false);
      setRemainingTaskType(null);
      setIsScrollMode(false);
    } else {
      console.warn("MemorizeWords: Invalid or missing state. Redirecting.", location.state);
      toast.error("无法加载学习内容，请重试。", { description: "缺少必要的页面信息。" });
      navigate(`/students/${studentId || ''}`);
      setOriginalWords([]);
      setDisplayedWords([]);
      setShuffledWords([]);
    }
  }, [location.state, navigate, studentId]);

  const totalPages = useMemo(() => Math.ceil(displayedWords.length / WORDS_PER_PAGE), [displayedWords]);
  const wordsToShow = useMemo(() => {
      if (isScrollMode) {
          return displayedWords;
      }
      const startIndex = (currentPage - 1) * WORDS_PER_PAGE;
      const endIndex = startIndex + WORDS_PER_PAGE;
      if (totalPages > 0 && currentPage > totalPages) {
          setCurrentPage(totalPages);
          return [];
      }
      return displayedWords.slice(startIndex, endIndex);
  }, [currentPage, displayedWords, totalPages, isScrollMode]);

  const handleWordClick = (wordId: number) => {
    console.log("Word clicked (non-cover mode):", wordId);
  };

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

  const toggleShuffle = () => {
    if (isAnimating || isCompleting) return;

    setAnimationDirection(null);
    setIsAnimating(true);
    setIsBottomButtonsDisabled(true);
    
    let newDisplayedWords: DisplayVocabularyWord[];
    if (isShuffled) {
        newDisplayedWords = searchQuery.trim() === "" ? originalWords :
            originalWords.filter(word =>
                word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (word.translation && word.translation.includes(searchQuery))
            );
    } else {
        // 每次打乱时都重新随机排序，而不是使用已保存的结果
        const newShuffledWords = shuffleArray(originalWords);
        setShuffledWords(newShuffledWords);
        
        newDisplayedWords = searchQuery.trim() === "" ? newShuffledWords :
            newShuffledWords.filter(word =>
                word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (word.translation && word.translation.includes(searchQuery))
            );
    }

    setDisplayedWords(newDisplayedWords);
    setIsShuffled(!isShuffled);

    if (!isScrollMode) {
        const newTotalPages = Math.ceil(newDisplayedWords.length / WORDS_PER_PAGE);
        if (currentPage > newTotalPages) {
            setCurrentPage(newTotalPages || 1);
        }
    } else {
        wordListRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setSwipeState(new Map());

    setTimeout(() => {
        setIsAnimating(false);
        setIsBottomButtonsDisabled(false);
    }, 1000);
  };

  const currentWordSet = useMemo(() => {
      if (learningMode === 'new') return "今日新词";
      if (learningMode === 'review') return "今日复习";
      return "单词列表";
  }, [learningMode]);

  const getAnimationClass = () => {
    if (!isAnimating) return '';
    if (animationDirection === null && !isCompleting) return 'animate-fade-in';
    return animationDirection === 'next' ? 'animate-slide-left-smooth' : 'animate-slide-right-smooth';
  };

  useEffect(() => {
    const sourceList = isShuffled ? (shuffledWords.length > 0 ? shuffledWords : originalWords) : originalWords;
    let filtered: DisplayVocabularyWord[];

    if (searchQuery.trim() === "") {
      filtered = sourceList;
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = sourceList.filter(word =>
        word.word.toLowerCase().includes(lowerQuery) ||
        (word.translation && word.translation.includes(searchQuery))
      );
    }
    setDisplayedWords(filtered);

    const newTotalPages = Math.ceil(filtered.length / WORDS_PER_PAGE);
    if (!isScrollMode && currentPage > newTotalPages) {
      setCurrentPage(newTotalPages || 1);
    }
    setSwipeState(new Map());
  }, [searchQuery, isShuffled, originalWords, shuffledWords, isScrollMode]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(darkMode ? 'light' : 'dark');
    root.classList.add(darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        if (isSearchFocused) handleCloseSearch();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarRef, isSearchFocused]);

  const handleCoverDrag = (clientX: number) => {
      if (!isDragging || !wordListRef.current) return;

      const rect = wordListRef.current.getBoundingClientRect();
      const newPosition = Math.min(Math.max(((clientX - rect.left) / rect.width) * 100, 0), 50);
      setCoverPosition(newPosition);
  };

  const handleCoverDragStart = () => setIsDragging(true);
  const handleCoverDragEnd = () => setIsDragging(false);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => isDragging && handleCoverDrag(e.clientX);
    const handleGlobalTouchMove = (e: TouchEvent) => isDragging && e.touches.length > 0 && handleCoverDrag(e.touches[0].clientX);
    const handleGlobalMouseUp = () => isDragging && handleCoverDragEnd();
    const handleGlobalTouchEnd = () => isDragging && handleCoverDragEnd();

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('touchend', handleGlobalTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [isDragging]);

  const handleWordMouseDown = (wordId: number) => showCover && setRevealedWordId(wordId);
  const handleWordMouseUp = () => showCover && setRevealedWordId(null);
  const handleWordMouseEnter = (wordId: number) => setHoveredWordId(wordId);
  const handleWordMouseLeave = (event: React.MouseEvent<HTMLDivElement>) => {
    setHoveredWordId(null);
    if (showCover && event.buttons === 0) {
        setRevealedWordId(null);
    }
  };
  const handleWordTouchStart = (wordId: number) => showCover && setRevealedWordId(wordId);
  const handleWordTouchEnd = () => showCover && setRevealedWordId(null);

  const handleTestButtonClick = () => {
    setShowCover(!showCover);
    if (!showCover) setCoverPosition(50);
    setRevealedWordId(null);
  };

  const toggleMarkAsKnown = (wordId: number) => {
    setKnownWordIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(wordId)) {
        newSet.delete(wordId);
        console.log(`Word unmarked as known: ${wordId}`);
      } else {
        newSet.add(wordId);
        console.log(`Word marked as known: ${wordId}`);
      }
      return newSet;
    });
  };

  const handleSwipeStart = (wordId: number, clientX: number) => {
    if (showCover || isCompleting || isAnimating) return;
    setSwipeState((prev) => new Map(prev).set(wordId, { startX: clientX, currentX: clientX, isSwiping: true }));
  };

  const handleSwipeMove = (wordId: number, clientX: number) => {
    if (showCover || isCompleting || isAnimating) return;
    setSwipeState((prev) => {
      const state = prev.get(wordId);
      if (state?.isSwiping) {
          return new Map(prev).set(wordId, { ...state, currentX: clientX });
      }
      return prev;
    });
  };

  const handleSwipeEnd = (wordId: number) => {
    if (showCover || isCompleting || isAnimating) return;
    let marked = false;
    const state = swipeState.get(wordId);
    if (state?.isSwiping) {
      const deltaX = state.startX - state.currentX;
      const SWIPE_THRESHOLD = 50;

      if (deltaX > SWIPE_THRESHOLD) {
        toggleMarkAsKnown(wordId);
        marked = true;
      }
    }
    setSwipeState((prev) => {
        const newState = new Map(prev);
        newState.delete(wordId);
        return newState;
    });
    return marked;
  };

  const handleCompletion = async () => {
    console.log("[MemorizeWords handleCompletion] State values:", {
        planId: planId,
        learningMode: learningMode,
        unitId: unitId,
        reviewUnits: reviewUnits,
        reviewUnitsCount: reviewUnits?.length
    });

    if (!planId || !learningMode) {
        toast.error("无法完成学习：缺少必要信息。", { description: `PlanID: ${planId}, Mode: ${learningMode}`});
        return;
    }
    setIsCompleting(true);
    setRemainingTaskType(null);
    let markSuccess = false;
    const oppositeMode = learningMode === 'new' ? 'review' : 'new';

    try {
        if (learningMode === 'new' && typeof unitId === 'number') {
            await markUnitAsLearned(unitId);
            markSuccess = true;
            toast.success("新学单元已完成！");

            if (planId && originalWords.length > 0) {
                 if (typeof unitId === 'number') {
                    const lastLearnedNewUnitData = {
                        unitId: unitId,
                        words: originalWords,
                        timestamp: Date.now()
                    };
                    try {
                        localStorage.setItem(`lastLearnedNewUnit_${planId}`, JSON.stringify(lastLearnedNewUnitData));
                        console.log(`[MemorizeWords handleCompletion] Successfully stored last learned NEW unit data (Unit ID: ${unitId}) for plan ${planId}.`);
                    } catch (storageError) {
                        console.error("Failed to save last learned new unit data:", storageError);
                        toast.warning("无法保存本次新学记录以供稍后温习。", { description: "浏览器存储可能已满。" });
                    }
                 } else {
                    console.warn("Cannot save last learned new unit data: unitId is invalid.", unitId);
                 }
            }

        } else if (learningMode === 'review' && reviewUnits && reviewUnits.length > 0) {
            const reviewIdsToMark = reviewUnits.flatMap(unit => unit.reviews.map(review => review.id));
            const uniqueReviewIds = [...new Set(reviewIdsToMark)];
            let completedCount = 0;
            for (const reviewId of uniqueReviewIds) {
                try {
                    await markReviewAsCompleted(reviewId);
                    completedCount++;
                } catch (markError: any) {
                    console.error(`标记复习 ID ${reviewId} 完成失败:`, markError);
                    toast.warning(`部分复习任务标记失败: ${markError?.message || '请稍后检查'}`);
                }
            }
            if (completedCount === uniqueReviewIds.length) {
                 markSuccess = true;
                 toast.success("复习任务已完成！");
            } else if (completedCount > 0) {
                 markSuccess = true;
                 toast.warning("部分复习任务已标记完成。", { description: `${completedCount} / ${uniqueReviewIds.length} completed.`});
            } else {
                 toast.error("所有复习任务标记失败。", { description: `Attempted: ${uniqueReviewIds.length}` });
            }
        } else {
            console.warn("无法标记完成：模式或所需 ID 无效。", { learningMode, unitId, reviewUnits });
             if (learningMode === 'new' && (unitId === undefined || unitId === null)) {
                toast.error("无法标记完成：缺少新学单元 ID。", { description: `Received unitId: ${unitId}` });
            } else if (learningMode === 'review' && (!reviewUnits || reviewUnits.length === 0)) {
                 toast.error("无法标记完成：缺少复习单元信息。", { description: `Received reviewUnits: ${JSON.stringify(reviewUnits)}` });
            } else {
                 toast.error("无法标记完成：未知原因。", { description: `Mode: ${learningMode}, UnitID: ${unitId}, ReviewUnits: ${reviewUnits ? 'Exists' : 'Missing'}` });
            }
        }

        if (markSuccess) {
            console.log("[MemorizeWords handleCompletion] Mark successful, checking for remaining tasks.");
            const remainingData = await getTodaysLearning(planId, oppositeMode);
            console.log(`[MemorizeWords handleCompletion] Remaining tasks data (for mode '${oppositeMode}'):`, remainingData);
            
            if (oppositeMode === 'new' && 
                remainingData.new_unit && 
                !remainingData.new_unit.is_learned && 
                remainingData.new_unit.words && 
                remainingData.new_unit.words.length > 0) {
              console.log("[MemorizeWords handleCompletion] Remaining task found: New Unit");
              setRemainingTaskType('new');
            } 
            else if (oppositeMode === 'review' && 
                     remainingData.review_units?.some(unit => 
                         unit.words && unit.words.length > 0 && 
                         unit.reviews.some(r => !r.is_completed)
                     )) {
              console.log("[MemorizeWords handleCompletion] Remaining task found: Review Units");
              setRemainingTaskType('review');
            } 
            else {
              console.log("[MemorizeWords handleCompletion] No remaining tasks found.");
              setRemainingTaskType('none');
            }
            setLearningComplete(true);
        }
    } catch (error: any) {
        console.error(`完成 ${learningMode} 任务时出错:`, error);
        toast.error(`完成学习时出错: ${error.message || '请稍后重试'}`);
    } finally { 
        console.log("[MemorizeWords handleCompletion] Finished.");
        setIsCompleting(false); 
    }
  };

  const toggleFullscreen = () => {
    const element = document.documentElement; // Target the whole page
    const requestMethod = 
      element.requestFullscreen ||
      // @ts-ignore - Vendor prefixes
      element.webkitRequestFullscreen || 
      // @ts-ignore - Vendor prefixes
      element.mozRequestFullScreen || 
      // @ts-ignore - Vendor prefixes
      element.msRequestFullscreen;

    const exitMethod = 
      document.exitFullscreen || 
      // @ts-ignore - Vendor prefixes
      document.webkitExitFullscreen ||
      // @ts-ignore - Vendor prefixes
      document.mozCancelFullScreen || 
      // @ts-ignore - Vendor prefixes
      element.msExitFullscreen;

    const isCurrentlyFullscreen = 
      document.fullscreenElement || 
      // @ts-ignore - Vendor prefixes
      document.webkitFullscreenElement ||
      // @ts-ignore - Vendor prefixes
      document.mozFullScreenElement || 
      // @ts-ignore - Vendor prefixes
      document.msFullscreenElement;

    if (!isCurrentlyFullscreen) {
      if (requestMethod) {
        requestMethod.call(element).catch((err: any) => {
          toast.error(`无法进入全屏模式: ${err.message}`, { description: "浏览器可能不支持或已阻止此操作。" });
          console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
      } else {
        toast.error("您的浏览器不支持全屏功能。");
        console.warn("Fullscreen API is not supported by this browser.");
      }
    } else {
      if (exitMethod) {
        exitMethod.call(document);
      } else {
         toast.error("无法退出全屏模式。");
         console.warn("Exit Fullscreen API is not supported by this browser.");
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = !!(
        document.fullscreenElement ||
        // @ts-ignore - Vendor prefixes
        document.webkitFullscreenElement ||
        // @ts-ignore - Vendor prefixes
        document.mozFullScreenElement ||
        // @ts-ignore - Vendor prefixes
        document.msFullscreenElement
      );
      setIsFullscreen(isFs);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const renderCompletionScreen = () => (
      // Use fixed positioning and background overlay like AlertDialog
      <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          {/* Centered content card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md mx-auto animate-fade-in-scale">
              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-semibold mb-3 text-center text-gray-900 dark:text-gray-100">
                  {learningMode === 'new' ? '新单词学习完成！' : '复习完成！'}
              </h2>
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-4">
                  {/* Button to continue learning (if applicable) */}
                  {(remainingTaskType === 'new' || remainingTaskType === 'review') && (
                      <Button
                          onClick={() => navigate(0)} // Reload to fetch next batch
                          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white w-full sm:w-auto"
                          size="lg"
                      >
                          {remainingTaskType === 'new' ? '学习新词' : '继续复习'}
                      </Button>
                  )}
                  {/* Button to go home */}
                  <Button
                      onClick={handleGoHome}
                      variant="outline"
                      className="w-full sm:w-auto border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      size="lg"
                  >
                      返回主页
                  </Button>
              </div>
          </div>
      </div>
  );

  const toggleScrollMode = () => {
      setIsScrollMode(!isScrollMode);
      if (isScrollMode) {
          setCurrentPage(1);
      }
      wordListRef.current?.scrollTo({ top: 0, behavior: 'auto' });
      setRevealedWordId(null);
      setScrollProgress(0);
  };

  const handleScroll = () => {
      const scrollContainer = wordListRef.current;
      if (!scrollContainer || !isScrollMode) return;
      
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      if (scrollHeight <= clientHeight) {
          setScrollProgress(1);
          return;
      }
      
      const scrollPercentage = scrollTop / (scrollHeight - clientHeight);
      
      const progress = Math.max(0, Math.min(1, scrollPercentage));
      setScrollProgress(progress);
  };

  useEffect(() => {
      const scrollContainer = wordListRef.current;
      if (!scrollContainer) return;
      
      handleScroll();
      
      scrollContainer.addEventListener('scroll', handleScroll);
      
      return () => {
          scrollContainer.removeEventListener('scroll', handleScroll);
      };
  }, [isScrollMode, wordListRef.current]);

  const handleWordDoubleClick = (word: DisplayVocabularyWord) => {
    if (showCover || isCompleting || isAnimating) return;
    console.log("Double clicked word, opening detail modal:", word.id);
    setSelectedWordForDetail(word);
    setShowDetailModal(true);
    setIsFirstModalOpen(true);
  };

  const handleSwipeWord = (direction: 'prev' | 'next') => {
    if (!selectedWordForDetail) return;

    // 获取当前单词在 displayedWords 中的索引
    const currentIndex = displayedWords.findIndex(w => w.id === selectedWordForDetail.id);
    if (currentIndex === -1) return;

    let newIndex = -1;
    if (direction === 'prev' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (direction === 'next' && currentIndex < displayedWords.length - 1) {
      newIndex = currentIndex + 1;
    }

    if (newIndex !== -1) {
      setSelectedWordForDetail(displayedWords[newIndex]);
    }
  };

  const handleSaveEdit = async (
      wordToSave: DisplayVocabularyWord,
      updates: { translation: string; examples?: string; derivatives?: string }
  ) => {
    console.log(`Attempting to save edit for word ${wordToSave.id} with updates:`, updates);
    const wordId = wordToSave.id;
    const { translation, examples, derivatives } = updates;

    const updateWords = (words: DisplayVocabularyWord[]) =>
      words.map(w =>
        w.id === wordId ? {
            ...w,
            translation: translation,
            examples: examples !== undefined ? examples : w.examples,
            derivatives: derivatives !== undefined ? derivatives : w.derivatives
        } : w
      );

    setOriginalWords(prev => updateWords(prev));
    if (isShuffled) {
      setShuffledWords(prev => updateWords(prev));
    }
    setDisplayedWords(prev => updateWords(prev));

    toast.success(`单词 "${wordToSave.word}" 的信息已更新`);

    setShowDetailModal(false);
    setSelectedWordForDetail(null);
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

  return (
    <div className="relative h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300 overflow-hidden flex flex-col">
      <div
        ref={sidebarRef}
        className={`fixed top-1/2 left-4 transform -translate-y-1/2 ${
          isSearchFocused ? 'w-72' : 'w-20'
        } bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-3 flex flex-col items-center shadow-lg z-20 rounded-2xl transition-all duration-300 ease-in-out h-auto
        max-sm:top-4 max-sm:left-1/2 max-sm:-translate-x-1/2 max-sm:translate-y-0 max-sm:flex-row max-sm:w-auto max-sm:gap-2 max-sm:rounded-full max-sm:p-2`}
      >
         {isSearchFocused && (
             <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseSearch}
                className="absolute top-2 right-2 w-7 h-7 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full z-10
                           max-sm:relative max-sm:top-auto max-sm:right-auto max-sm:order-last"
                aria-label="关闭搜索"
             >
                <X className="w-4 h-4" />
             </Button>
         )}

        {[
          { icon: Home, label: "主页", onClick: handleGoHome, active: false },
          { icon: Search, label: "搜索", onClick: handleSearchClick, active: isSearchFocused },
          { icon: Settings, label: "设置", onClick: handleGoToSettings, active: false },
        ].map(({ icon: Icon, label, onClick, active }) => (
          <Button
            key={label}
            variant="ghost"
            size="icon"
            onClick={onClick}
            disabled={isSearchFocused && label !== '搜索'}
            className={`w-14 h-14 rounded-xl flex-shrink-0 mb-3 transition-all duration-200 ease-in-out flex items-center justify-center ${
              active
                ? 'bg-primary text-primary-foreground scale-105 shadow-md'
                : `bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:hover:bg-gray-100 dark:disabled:hover:bg-gray-700`
            }
             max-sm:w-10 max-sm:h-10 max-sm:mb-0 max-sm:rounded-full`}
            aria-label={label}
          >
            <Icon className={`w-6 h-6 ${darkMode ? 'opacity-90' : 'opacity-80'} max-sm:w-5 max-sm:h-5`} />
          </Button>
        ))}

         {/* Insert Fullscreen Toggle Button Here */}
         <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            disabled={isSearchFocused}
            className={`w-14 h-14 rounded-xl flex-shrink-0 mb-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white transition-all duration-200 ease-in-out disabled:opacity-50 disabled:hover:bg-gray-100 dark:disabled:hover:bg-gray-700 flex items-center justify-center
            max-sm:w-10 max-sm:h-10 max-sm:mb-0 max-sm:rounded-full`}
            aria-label={isFullscreen ? "退出全屏" : "进入全屏"}
          >
            {isFullscreen ? <Minimize className="w-6 h-6 opacity-90 max-sm:w-5 max-sm:h-5" /> : <Maximize className="w-6 h-6 opacity-90 max-sm:w-5 max-sm:h-5" />}
          </Button>

         {/* Re-adding Dark Mode Toggle Button */}
         <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            disabled={isSearchFocused}
            className={`w-14 h-14 rounded-xl flex-shrink-0 mb-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white transition-all duration-200 ease-in-out disabled:opacity-50 disabled:hover:bg-gray-100 dark:disabled:hover:bg-gray-700 flex items-center justify-center
            max-sm:w-10 max-sm:h-10 max-sm:mb-0 max-sm:rounded-full`}
            aria-label={darkMode ? "切换到白天模式" : "切换到夜晚模式"}
          >
            {darkMode ? <Sun className="w-6 h-6 text-yellow-400 opacity-100 max-sm:w-5 max-sm:h-5" /> : <Moon className="w-6 h-6 text-blue-500 opacity-90 max-sm:w-5 max-sm:h-5" />}
          </Button>

        <div className={`w-full px-1 overflow-hidden transition-all duration-300 ease-in-out ${isSearchFocused ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'}
                       max-sm:absolute max-sm:top-full max-sm:left-0 max-sm:right-0 max-sm:bg-white dark:max-sm:bg-gray-800 max-sm:p-3 max-sm:shadow-md max-sm:rounded-b-xl max-sm:mt-1 z-20`}
        >
             <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 px-1 hidden sm:block">搜索单词</p>
             <div className="relative">
               <Input
                 ref={searchInputRef}
                 type="text"
                 placeholder="搜索..."
                 value={searchQuery}
                 onChange={handleSearchChange}
                 className="w-full pl-3 pr-8 py-2 h-9 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:bg-white dark:focus:bg-gray-600 focus:border-primary focus:ring-1 focus:ring-primary text-sm"
               />
                <Search className="absolute right-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 peer-focus:text-primary" />
             </div>
        </div>

      </div>

      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden transition-all duration-300 ease-in-out max-sm:pt-20">
        {isCompleting ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-lg text-gray-600 dark:text-gray-300">正在完成学习并检查剩余任务...</p>
            </div>
        ) : (
             // Always render the word card area when not completing
             <div className="w-full max-w-lg h-[calc(100vh-2rem)] flex flex-col max-sm:max-w-full max-sm:h-[calc(100vh-5rem)]">
                 <Card className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-md flex-1 flex flex-col transition-colors duration-300">
                    <div className="relative h-14 min-h-[56px] border-b border-gray-200 dark:border-gray-700">
                       {/* 居中标题 */}
                       <div className="absolute left-0 right-0 top-0 bottom-0 flex items-center justify-center pointer-events-none">
                         <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                           {learningMode === 'new' ? '今日新词' : '今日复习'}
                         </h2>
                       </div>

                       {/* 右侧完成按钮 */}
                       <div className="absolute right-4 top-1/2 -translate-y-1/2">
                         <Button
                           variant="ghost"
                           size={((!isScrollMode && currentPage === totalPages) || (isScrollMode && scrollProgress > 0.5)) && totalPages > 0 && !learningComplete ? "default" : "icon"}
                           onClick={() => {
                             if (isAnimating || isCompleting) return;
                             if (isScrollMode && scrollProgress > 0.95 && !learningComplete) {
                               handleCompletion();
                             } else if (!isScrollMode) {
                               if (currentPage === totalPages && totalPages > 0 && !learningComplete) {
                                 handleCompletion();
                               }
                             }
                           }}
                           disabled={isAnimating || isCompleting || (totalPages === 0) || 
                             (!isScrollMode && currentPage === totalPages && learningComplete) || 
                             (isScrollMode && (scrollProgress <= 0.5 || learningComplete))}
                           className={`
                             transition-all duration-200 z-10
                             disabled:opacity-50 disabled:cursor-not-allowed
                             w-10 h-10 flex items-center justify-center
                             ${((!isScrollMode && currentPage === totalPages) || (isScrollMode && scrollProgress > 0.5)) && totalPages > 0 && !learningComplete
                               ? 'px-4 py-1 h-8 text-sm rounded-md font-medium bg-green-500 text-white hover:bg-green-600 disabled:bg-green-500/60 w-auto'
                               : 'text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary disabled:text-gray-400/50 dark:disabled:text-gray-600/50'
                             }
                             ${isScrollMode ? `opacity-${Math.min(10, Math.max(0, Math.floor(scrollProgress * 10)))}` : ''}
                           `}
                           style={isScrollMode ? { 
                             opacity: Math.max(0.3, scrollProgress),
                             pointerEvents: scrollProgress > 0.95 ? 'auto' : 'none'
                           } : undefined}
                         >
                           {((!isScrollMode && currentPage === totalPages) || (isScrollMode && scrollProgress > 0.5)) && totalPages > 0 && !learningComplete ? '完成' : null}
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
                          {showCover && (
                            <>
                              <style>
                                {`
                                  .word-revealed {
                                    position: relative; /* Keep revealed word on top if needed */
                                    z-index: 20;
                                  }
                                  .cover-draggable {
                                    cursor: url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%2732%27%20height%3D%2732%27%20viewBox%3D%270%200%2032%2032%27%20fill%3D%27none%27%3E%3Cpath%20d%3D%27M4%2016%20C%206%2015.8%2C%2026%2015.8%2C%2028%2016%27%20stroke%3D%27%23333%27%20stroke-width%3D%274%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27/%3E%3Cpath%20d%3D%27M10%2010%20C%208%2011%2C%205%2015%2C%204%2016%27%20stroke%3D%27%23333%27%20stroke-width%3D%274%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27/%3E%3Cpath%20d%3D%27M10%2022%20C%208%2021%2C%205%2017%2C%204%2016%27%20stroke%3D%27%23333%27%20stroke-width%3D%274%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27/%3E%3Cpath%20d%3D%27M22%2010%20C%2024%2011%2C%2027%2015%2C%2028%2016%27%20stroke%3D%27%23333%27%20stroke-width%3D%274%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27/%3E%3Cpath%20d%3D%27M22%2022%20C%2024%2021%2C%2027%2017%2C%2028%2016%27%20stroke%3D%27%23333%27%20stroke-width%3D%274%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27/%3E%3C/svg%3E") 16 16, ew-resize;
                                  }
                                  .dark .cover-draggable {
                                    cursor: url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%2732%27%20height%3D%2732%27%20viewBox%3D%270%200%2032%2032%27%20fill%3D%27none%27%3E%3Cpath%20d%3D%27M4%2016%20C%206%2015.8%2C%2026%2015.8%2C%2028%2016%27%20stroke%3D%27%23eee%27%20stroke-width%3D%274%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27/%3E%3Cpath%20d%3D%27M10%2010%20C%208%2011%2C%205%2015%2C%204%2016%27%20stroke%3D%27%23eee%27%20stroke-width%3D%274%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27/%3E%3Cpath%20d%3D%27M10%2022%20C%208%2021%2C%205%2017%2C%204%2016%27%20stroke%3D%27%23eee%27%20stroke-width%3D%274%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27/%3E%3Cpath%20d%3D%27M22%2010%20C%2024%2011%2C%2027%2015%2C%2028%2016%27%20stroke%3D%27%23eee%27%20stroke-width%3D%274%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27/%3E%3Cpath%20d%3D%27M22%2022%20C%2024%2021%2C%2027%2017%2C%2028%2016%27%20stroke%3D%27%23eee%27%20stroke-width%3D%274%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27/%3E%3C/svg%3E") 16 16, ew-resize;
                                  }
                                `}
                              </style>
                              <div
                                className={`cover-draggable absolute top-0 bottom-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm z-10 ${isDragging ? '' : 'transition-all ease-in-out duration-300'}`}
                                style={{
                                  left: `${coverPosition}%`,
                                  width: '50%',
                                  borderLeft: '2px dashed rgba(107, 114, 128, 0.5)',
                                  // Removed inline cursor style, handled by CSS class now
                                }}
                                onMouseDown={handleCoverDragStart}
                                onTouchStart={handleCoverDragStart}
                              >
                              </div>
                            </>
                          )}

                          {/* Word List - Now inside the wrapper */}
                          <div className="space-y-3">
                              {wordsToShow.length > 0 ? (
                                wordsToShow.map((word, index) => {
                                  const overallIndex = isScrollMode ? index : (currentPage - 1) * WORDS_PER_PAGE + index;
                                  const isKnown = knownWordIds.has(word.id);
                                  const currentSwipeState = swipeState.get(word.id);
                                  const swipeDeltaX = currentSwipeState?.isSwiping ? currentSwipeState.startX - currentSwipeState.currentX : 0;
                                  const translateX = currentSwipeState?.isSwiping ? Math.max(0, Math.min(swipeDeltaX, 100)) : 0;
                                  const showSwipeBg = currentSwipeState?.isSwiping && swipeDeltaX > 10;

                                  const wordItemWrapperClassName = `word-item-wrapper`;

                                  const wordContentClassName = `word-content flex items-center p-3 transition-all duration-200 ease-in-out rounded-lg border \
                                                         border-green-200 dark:border-green-700/50 \
                                                         bg-white dark:bg-gray-800 \
                                                         ${isKnown ? 'is-known' : ''} \
                                                         ${!isScrollMode ? getAnimationClass() : 'animate-fade-in'} \
                                                         ${!isScrollMode && isAnimating && animationDirection === null ? `animate-card-flip-${Math.min(index, 4)}` : ''} \
                                                         ${!currentSwipeState?.isSwiping ? 'hover:shadow-md hover:border-green-300 dark:hover:border-green-600 hover:bg-green-50/50 dark:hover:bg-green-900/20 cursor-pointer' : ''} \
                                                         ${showCover && revealedWordId === word.id ? 'word-revealed bg-green-100 dark:bg-green-900/40' : ''}`;

                                  const wordTextClassName = `${darkMode ? (isKnown ? 'text-gray-400' : 'text-gray-100') : (isKnown ? 'text-gray-500' : 'text-gray-900')}`;

                                  return (
                                    <div 
                                      key={word.id} 
                                      className={wordItemWrapperClassName}
                                      data-word-id={word.id}
                                    >
                                      {/* Swipe Background - 根据状态改变 */}
                                      <div
                                        className={`swipe-background ${isKnown ? 'restore' : 'mark-known'}`}
                                        style={{ opacity: showSwipeBg ? 1 : 0 }}
                                      >
                                        {isKnown ? <RotateCcw className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                                        <span className="ml-1 text-sm font-medium">{isKnown ? '恢复' : '已认识'}</span>
                                      </div>
                                      {/* Word Content (Draggable) */}
                                      <div
                                        className={wordContentClassName}
                                        style={{ transform: `translateX(-${translateX}px)` }}
                                        onMouseDown={(e) => {
                                          handleSwipeStart(word.id, e.clientX);
                                          if (showCover) handleWordMouseDown(word.id);
                                        }}
                                        onMouseMove={(e) => handleSwipeMove(word.id, e.clientX)}
                                        onMouseUp={(e) => {
                                            const marked = handleSwipeEnd(word.id);
                                            if (showCover) handleWordMouseUp();
                                        }}
                                        onMouseLeave={(e) => {
                                           if (swipeState.get(word.id)?.isSwiping) handleSwipeEnd(word.id);
                                           if (showCover) handleWordMouseLeave(e);
                                        }}
                                        onTouchStart={(e) => {
                                          handleSwipeStart(word.id, e.touches[0].clientX);
                                          if (showCover) handleWordTouchStart(word.id);
                                        }}
                                        onTouchMove={(e) => {
                                            if (swipeState.get(word.id)?.isSwiping && e.cancelable) {
                                            }
                                            handleSwipeMove(word.id, e.touches[0].clientX);
                                        }}
                                        onTouchEnd={(e) => {
                                            const marked = handleSwipeEnd(word.id);
                                            if (showCover) handleWordTouchEnd();
                                        }}
                                        onClick={(e) => {
                                          if (swipeState.get(word.id)?.isSwiping || swipeState.size > 0) {
                                              e.stopPropagation();
                                          } else if (showCover) {
                                              e.stopPropagation();
                                          }
                                        }}
                                        onDoubleClick={() => handleWordDoubleClick(word)}
                                      >
                                        {/* Display index based on mode */}
                                        <div className="w-6 text-center flex-shrink-0 mr-3 text-gray-500 dark:text-gray-400 text-sm font-medium">
                                            {overallIndex + 1}
                                        </div>
                                        <div className="flex-1">
                                          <p className={wordTextClassName + " font-medium"} style={{ fontSize: `${fontSizes.english}px` }}>{word.word}</p>
                                          {word?.pronunciation && (
                                            <p 
                                              className={`${isKnown ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'}`}
                                              style={{ fontSize: `${fontSizes.pronunciation}px` }}
                                            >
                                              [{word.pronunciation}]
                                            </p>
                                          )}
                                        </div>
                                        <div className="text-right ml-3 flex items-center gap-1.5 flex-grow justify-end">
                                          <div className="flex items-center justify-end">
                                            <div className="flex items-center gap-1.5">
                                              {word?.part_of_speech && (
                                                <span className={`inline-flex items-center rounded-md \
                                                                ${isKnown ? 'bg-gray-100 dark:bg-gray-700/30 text-gray-500 dark:text-gray-400 ring-gray-500/20 dark:ring-gray-500/30 opacity-50' : 'bg-green-100 dark:bg-green-800/30 text-green-700 dark:text-green-200 ring-green-600/20 dark:ring-green-500/30'} \
                                                                px-1.5 py-0.5 \
                                                                text-xs font-medium \
                                                                ring-1 ring-inset`}>
                                                    {word.part_of_speech}
                                                  </span>
                                              )}
                                              
                                              {word?.translation && (
                                                <p 
                                                  className={`text-sm ${isKnown ? 'text-gray-400 dark:text-gray-500 opacity-50' : 'text-gray-600 dark:text-gray-400'}`}
                                                  style={{ fontSize: `${fontSizes.chinese}px` }}
                                                >
                                                  {showCover && coverPosition >= 40 ? (
                                                    <span className="blur-sm select-none">{"●".repeat(Math.min(10, (word.translation || '').length))}</span>
                                                  ) : (
                                                    word.translation || <span className="italic text-gray-500 dark:text-gray-400">无释义</span>
                                                  )}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })
                               ) : (
                                <div className="flex items-center justify-center h-full min-h-[100px]"><p className="text-gray-500 dark:text-gray-400">{searchQuery ? '未找到匹配的单词' : '没有需要学习的单词'}</p></div>
                               )}
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
                              {Array.isArray(displayedWords) && displayedWords.length > 0 ? `${currentPage} / ${totalPages}` : '0 / 0'}
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
                          onClick={toggleShuffle} 
                          disabled={isBottomButtonsDisabled || isCompleting}
                        >
                          {isShuffled ? "恢复" : "打乱"}
                        </Button>
                      </div>
                    </div>
                 </Card>
             </div>
        )}
      </div>

      {/* Completion Screen Overlay (Rendered conditionally on top) */}
      {learningComplete && !isCompleting && renderCompletionScreen()}

      {showDetailModal && selectedWordForDetail && (
        <WordDetailModal
          word={selectedWordForDetail}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedWordForDetail(null);
            setIsFirstModalOpen(false);
          }}
          onSave={handleSaveEdit}
          darkMode={darkMode}
          onSwipe={handleSwipeWord}
          canSwipePrev={displayedWords.findIndex(w => w.id === selectedWordForDetail.id) > 0}
          canSwipeNext={displayedWords.findIndex(w => w.id === selectedWordForDetail.id) < displayedWords.length - 1}
          showInitialHint={isFirstModalOpen}
        />
      )}

      {/* 添加批注面板 */}
      <AnnotationPanel words={displayedWords} darkMode={darkMode} />

      {/* 添加设置面板 */}
      <SettingsPanel
        isOpen={showSettingsPanel}
        onClose={() => setShowSettingsPanel(false)}
        fontSizes={fontSizes}
        onFontSizeChange={handleFontSizeChange}
        onReset={handleResetFontSizes}
      />

    </div>
  );
}; 