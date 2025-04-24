import { 
  ChevronRightIcon, 
  HomeIcon, 
  ZapIcon,
  LockIcon,
  CheckCircleIcon,
  CalendarIcon,
  TrendingUpIcon, X,
  LightbulbIcon
} from "lucide-react";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"; // Added CardHeader, CardTitle
import { useNavigate, useParams } from "react-router-dom";
// Import Radix components directly for CheckboxItem and Label
import { Input } from "../../components/ui/input"; // <-- Add Input import
import { Sidebar } from "./StudentsSidebar"; // Import the shared sidebar
import { EbinghausMatrix } from "../../components/EbinghausMatrix"; // <-- Add EbinghausMatrix import
import { useVocabulary, VocabularyBook } from "../../hooks/useVocabulary"; // 导入自定义 hook and type
import { vocabularyService, VocabularyWord } from "../../services/api";
import { useAuth } from "../../hooks/useAuth"; // <-- Add useAuth import
import { createOrUpdateLearningPlan, getTodaysLearning, LearningUnit } from "../../services/learningApi"; // <-- Add learning plan API imports
import { toast } from "sonner"; // Assuming you use sonner for notifications
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog"; // <-- Import AlertDialog components (FIXED PATH)
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip"; // <-- Import Tooltip components
import { useStudentInfo } from '../../hooks/useStudentInfo'; // <-- This hook is now React Query based
import { useStudentPlans } from '../../hooks/useStudentPlans';
import { useMatrixData } from '../../hooks/useMatrixData';
import { StudentPlanProvider, useStudentPlanContext } from '../../context/StudentPlanContext';
import { useLocalStorageCache } from '../../hooks/useLocalStorage';
import { SidebarFooterLinks } from '../../components/layout/SidebarFooterLinks'; // Import SidebarFooterLinks
import { useQueryClient, useMutation } from '@tanstack/react-query'; // <-- Add React Query imports
import { useTodaysLearning, CombinedTodayLearning } from "../../hooks/useTodaysLearning"; // <-- Import the hook
import { LearningPlan, LearningPlanPayload, UnitReview } from "../../services/learningApi";


// 艾宾浩斯遗忘曲线复习周期（天数）
const ebinghausIntervals = [1, 2, 4, 7, 15];

// Interface for the cached new unit data
interface LastLearnedNewUnitCache {
    unitId: number;
    unitNumber?: number;
    words: VocabularyWord[];
    timestamp?: number;
}

const StudentsInner = (): JSX.Element => {
  const navigate = useNavigate();
  const { studentId } = useParams<{ studentId: string }>(); // <-- Get studentId from route params
  const queryClient = useQueryClient(); // <-- Initialize queryClient
  
  // 使用 useStudentInfo hook 获取学生信息
  const {
    studentInfo, // This is { name, email } | null
    isLoadingStudent,
    studentError,
  } = useStudentInfo(studentId);
  
  // 使用自定义 hook 管理词库选择和设置相关状态 (移除列表获取)
  const {
    selectedBooks,
    setSelectedBooks,
    currentLearningBook,
    setCurrentLearningBook,
    wordsPerDay,
    setWordsPerDay,
    searchQuery,
    setSearchQuery,
    isLoading,
    vocabularyBooks,
    error,
    learningPlan,
    dropdownTriggerText,
    saveUserPreferences
  } = useVocabulary();
  
  // 用 useStudentPlanContext 替换 currentLearningBook、wordsPerDay、inputWordsPerDay 相关 useState
  const {
    inputWordsPerDay, setInputWordsPerDay
  } = useStudentPlanContext();

  // 使用 useStudentPlans hook 管理计划相关状态
  const {
    allStudentPlans,
    currentlySelectedPlanId,
    isLoadingPlan,
    planError,
    handleSelectPlan,
  } = useStudentPlans(studentId);
  
  // --- NEW: State for Dialog ---
  const [isStartDialogVisible, setIsStartDialogVisible] = useState<boolean>(false);
  // 使用 useLocalStorageCache 替换 lastLearnedNewUnitCache useState
  const [lastLearnedNewUnitCache, setLastLearnedNewUnitCache, clearLastLearnedNewUnitCache] =
    useLocalStorageCache<LastLearnedNewUnitCache | null>(
      `lastLearnedNewUnit_${currentlySelectedPlanId ?? ''}`,
      null
    );

  // 使用 useMatrixData hook 管理矩阵数据 - NOW REACT QUERY BASED
  const {
    matrixData, // Contains ExtendedEbinghausMatrixData | null
    isLoadingMatrix,
    matrixError, // Contains Error | null
  } = useMatrixData(currentlySelectedPlanId);

  // --- NEW: 修改计划确认弹窗 ---
  const [isModifyConfirmDialogVisible, setIsModifyConfirmDialogVisible] = useState(false);

  // USE the new hook to get today's learning data
  const {
    todaysLearningData, // Contains { newUnit, reviewUnits, dayNumber } | undefined
    isLoadingTodaysLearning,
    todaysLearningError, // Contains Error | null
    refetchTodaysLearning, // Function to manually refetch
  } = useTodaysLearning(currentlySelectedPlanId);

  // === Calculation for today's unfinished units (Adapt to new data structure) ===
  function isLearningUnit(unit: any): unit is LearningUnit {
      return typeof unit === 'object' && unit !== null && typeof unit.unit_number === 'number';
  }
  function isUnitReview(review: any): review is UnitReview {
       return typeof review === 'object' && review !== null && typeof review.is_completed === 'boolean';
  }

  const todayUnfinishedUnitNumbers: number[] = useMemo(() => {
    const numbers: number[] = [];
    if (todaysLearningData && isLearningUnit(todaysLearningData.newUnit) && !todaysLearningData.newUnit.is_learned) {
      numbers.push(todaysLearningData.newUnit.unit_number);
    }
    if (todaysLearningData && Array.isArray(todaysLearningData.reviewUnits)) {
      todaysLearningData.reviewUnits.forEach((unit) => {
         if (isLearningUnit(unit) && unit.reviews && Array.isArray(unit.reviews)) {
            if (unit.reviews.some((r) => isUnitReview(r) && !r.is_completed)) {
               numbers.push(unit.unit_number);
            }
         }
      });
    }
    return numbers;
  }, [todaysLearningData]);

  // prepareAndOpenDialog 相关逻辑，移除 setTodayLearningStatus，改为本地 loading/error 状态
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);

  // === NEW: Mutation for Creating/Updating Learning Plan ===
  const updatePlanMutation = useMutation<LearningPlan, Error, LearningPlanPayload>({
      mutationFn: (planData: LearningPlanPayload) => createOrUpdateLearningPlan(planData),
      onSuccess: (data, variables) => {
          const actionText = variables.start_date ? '创建' : '修改';
          toast.success(`学习计划已${actionText}`);

          // Invalidate the student plans query instead
          queryClient.invalidateQueries({ queryKey: ['studentPlans', variables.student_id] });

          // Invalidate matrix data
          const planIdForMatrix = data?.id ?? currentlySelectedPlanId;
          if (planIdForMatrix) {
              queryClient.invalidateQueries({ queryKey: ['matrixData', planIdForMatrix] });
          }
      },
      onError: (error: Error, variables) => {
          toast.error(`保存失败: ${error.message || '请稍后重试'}`);
          if (!variables.start_date && currentlySelectedPlanId) {
              const originalPlan = allStudentPlans?.find(p => p.id === currentlySelectedPlanId);
              setInputWordsPerDay(String(originalPlan?.words_per_day ?? wordsPerDay));
          } else {
              setInputWordsPerDay("20");
          }
      }
  });

  // === REIMPLEMENTED: Function to execute the save/update using the mutation ===
  const executeSaveOrUpdatePlan = () => {
    const newValue = parseInt(inputWordsPerDay, 10);
    let bookIdToSave: number | null = null;
    const isCreating = currentlySelectedPlanId === null;

    if (!isCreating && currentLearningBook?.id) {
      bookIdToSave = currentLearningBook.id; // Updating existing selected plan's book
    } else if (isCreating && selectedBooks.length > 0) {
      bookIdToSave = selectedBooks[0].id; // Creating new, use first selected book from dropdown
    } else {
        // This case might happen if trying to modify but currentLearningBook is somehow null
        // Or trying to create without selecting a book
        console.error("Cannot save plan: Invalid state (missing book ID).");
        toast.error("保存失败：请确保已选择词库书。", { description: isCreating ? "创建新计划需要选择一个词库书。" : "无法确定当前计划的词库书。"});
        return;
    }

    if (!(newValue > 0 && studentId && bookIdToSave)) {
      console.error("executeSaveOrUpdatePlan validation failed just before mutation:", { newValue, studentId, bookIdToSave });
      toast.error("保存失败：数据无效。", { description: "请检查每日单词数是否大于0，学生ID是否存在，以及是否已选择词库书。" });
      return;
    }

    // Prepare payload for the mutation
    const planData: LearningPlanPayload = {
      student_id: parseInt(studentId, 10),
      vocabulary_book_id: bookIdToSave,
      words_per_day: newValue,
      is_active: true, // Assuming we always set/keep it active on save
    };

    // Add start_date ONLY when creating a new plan
    if (isCreating) {
      planData.start_date = new Date().toISOString().split('T')[0];
    }

    console.log("Calling updatePlanMutation.mutate with payload:", planData);
    updatePlanMutation.mutate(planData); // Trigger the mutation
  };

  // === REIMPLEMENTED: Handle initiating the save/update, potentially showing dialog ===
  const handleSaveWordsPerDay = () => {
    const newValue = parseInt(inputWordsPerDay, 10);
    const isCreating = currentlySelectedPlanId === null;

    // Basic validations
    if (newValue <= 0) {
      toast.warning("请输入有效的每日单词数量（大于0）。");
      // Find original value to revert to
       const originalPlan = !isCreating ? allStudentPlans?.find(p => p.id === currentlySelectedPlanId) : null;
       setInputWordsPerDay(String(originalPlan?.words_per_day ?? wordsPerDay));
      return;
    }
    if (!studentId) {
      toast.error("错误：无效或缺失的学生 ID。", { description: "无法保存计划。"});
      return;
    }

    if (isCreating) {
        // Creating a new plan
        if (selectedBooks.length === 0) {
            toast.warning("请先选择一个词库书以创建计划。", { description: "从右侧选择词库并设置每日数量。" });
            return;
        }
        executeSaveOrUpdatePlan(); // Create directly
    } else {
        // Modifying the current plan
        const originalPlan = allStudentPlans?.find(p => p.id === currentlySelectedPlanId);
        // Check if the WPD value actually changed
        if (originalPlan && newValue !== originalPlan.words_per_day) {
            setIsModifyConfirmDialogVisible(true); // Show confirmation dialog
        } else if (!originalPlan) {
             console.error("Cannot modify plan: Could not find original plan data for ID:", currentlySelectedPlanId);
             toast.error("修改失败：找不到当前计划信息。", { description: "请尝试刷新页面。"});
        } else {
            toast.info("每日单词数量未更改。", { description: "无需保存。"});
        }
    }
  };

  // Determine if save button should be enabled (using mutation's loading state)
  const isWordsPerDaySaveEnabled = useMemo(() => {
    const numericValue = parseInt(inputWordsPerDay, 10);
    const isValidInput = numericValue > 0 && !isNaN(numericValue);
    const isCreating = currentlySelectedPlanId === null;

    // Enable if input is valid AND:
    // 1. Creating: a book is selected
    // 2. Modifying: the value is different from original (or maybe allow saving same value?)
    const originalWPD = !isCreating ? allStudentPlans?.find(p => p.id === currentlySelectedPlanId)?.words_per_day : undefined;

    const canCreate = isCreating && selectedBooks.length > 0 && isValidInput;
    const canModify = !isCreating && isValidInput && (originalWPD === undefined || numericValue !== originalWPD);

    // Disable button if mutation is in progress or initial plan list is loading
    return (canCreate || canModify) && !updatePlanMutation.isPending && !isLoadingPlan;
  }, [inputWordsPerDay, currentlySelectedPlanId, selectedBooks, isLoadingPlan, updatePlanMutation.isPending, allStudentPlans]);

  // --- MODIFIED: Function to fetch data, check local storage, and open dialog ---
  const prepareAndOpenDialog = async () => {
    if (!currentlySelectedPlanId) {
      toast.warning("请先选择一个学习计划。");
      return;
    }

    // 1. Clear previous *local* cache state (optional, maybe not needed)
    // clearLastLearnedNewUnitCache();

    // 2. Ensure latest data is fetched (optional, hook might already have it)
    // setDialogLoading(true); // Use hook's loading state instead?
    // setDialogError(null);
    try {
      // Trigger a refetch to ensure data is fresh when dialog opens
      console.log("[prepareAndOpenDialog] Refetching today's learning data...");
      await refetchTodaysLearning();
      console.log("[prepareAndOpenDialog] Refetch complete.");
      // Handle potential errors from refetch if needed, though useQuery handles the state
    } catch (error) {
       console.error("[prepareAndOpenDialog] Error during refetch: ", error);
       // Error state is already handled by useTodaysLearning hook
    }

    // 3. Check Local Storage for the *last learned new unit* (Keep this logic)
    let storedCache: LastLearnedNewUnitCache | null = null;
    try {
      const storedData = localStorage.getItem(`lastLearnedNewUnit_${currentlySelectedPlanId}`);
      if (storedData) {
        storedCache = JSON.parse(storedData);
        // Basic validation
        if (typeof storedCache?.unitId === 'number' && Array.isArray(storedCache?.words)) {
          console.log("Loaded last learned new unit data from local storage:", storedCache);
          console.log('[Students prepareAndOpenDialog] Parsed cache data:', storedCache);
          setLastLearnedNewUnitCache(storedCache); // Update state
        } else {
          console.warn("Invalid data format in local storage for last learned new unit. Ignoring.");
          localStorage.removeItem(`lastLearnedNewUnit_${currentlySelectedPlanId}`); // Clean up invalid data
        }
      } else {
        console.log("No last learned new unit data found in local storage for this plan.");
        // Clear the state if no cache found in local storage
        setLastLearnedNewUnitCache(null);
      }
    } catch (error) {
      console.error("Failed to read or parse last learned new unit data from local storage:", error);
      setLastLearnedNewUnitCache(null); // Clear state on error
    }

    // 4. Open the dialog
    setIsStartDialogVisible(true);
    // setDialogLoading(false); // Loading state comes from useTodaysLearning now
  };

  // Start Learning Handler remains the same
  const handleStartLearning = () => {
    prepareAndOpenDialog();
  };

  // --- navigateToMemorize: Adapt to use todaysLearningData ---
  const navigateToMemorize = (mode: 'new' | 'review') => {
    if (!currentlySelectedPlanId || !studentId) {
      toast.error("无法开始学习：缺少计划或学生信息。"); return;
    }
    if (!todaysLearningData) {
      toast.error("无法开始学习：学习数据仍在加载中。", { description: "请稍候片刻再试。" });
      return;
    }
    setIsStartDialogVisible(false);

    if (mode === 'new') {
      const newUnit = todaysLearningData.newUnit;
      if (newUnit && newUnit.id) {
        navigate(`/students/${studentId}/memorize`, {
          state: {
            planId: currentlySelectedPlanId,
            unitId: newUnit.id,
            unitNumber: newUnit.unit_number,
            mode: 'new'
          }
        });
      } else {
        toast.error("下一个新学单元无数据。");
      }
    } else if (mode === 'review') {
      // 只传递所有需要复习的 unitId 列表
      const reviewUnits = todaysLearningData.reviewUnits;
      if (Array.isArray(reviewUnits) && reviewUnits.length > 0) {
        navigate(`/students/${studentId}/memorize`, {
          state: {
            planId: currentlySelectedPlanId,
            reviewUnitIds: reviewUnits.map(u => u.id),
            mode: 'review'
          }
        });
      } else {
        toast.info("暂无待复习内容。");
      }
    }
  };

  // --- NEW: Handler for reviewing today's learned words from cache ---
  const navigateToReviewToday = () => {
      if (!lastLearnedNewUnitCache || !currentlySelectedPlanId) {
          toast.error("无法温习：未找到上次新学记录。");
          return;
      }
      // Ensure studentId exists before navigating
      if (!studentId) {
          toast.error("无法温习：缺少学生信息。"); return;
      }

      setIsStartDialogVisible(false);
      const targetPath = `/students/${studentId}/memorize`; // <-- USE NEW PATH
      navigate(targetPath, { // <-- USE NEW PATH
          state: {
              words: lastLearnedNewUnitCache.words,
              mode: 'new',
              planId: currentlySelectedPlanId,
              unitId: lastLearnedNewUnitCache.unitId,
              unitNumber: lastLearnedNewUnitCache.unitNumber, // <-- 添加 unitNumber
              isReviewingToday: true
          }
      });
  };

  useEffect(() => {
  }, [todaysLearningData, dialogLoading, dialogError]);

  useEffect(() => {
    // This log helps track the key states influencing the main view rendering.
  }, [
    studentId,
    currentlySelectedPlanId,
    currentLearningBook,
    matrixData,
    isLoadingMatrix,
    matrixError,
  ]);

  // RE-ADD derived state for selectedPlan
  const selectedPlan = useMemo(() => {
      if (!currentlySelectedPlanId || !allStudentPlans) return null; // Check allStudentPlans exists
      return allStudentPlans.find(p => p.id === currentlySelectedPlanId) || null;
  }, [currentlySelectedPlanId, allStudentPlans]);

  // 自动同步 currentLearningBook 与当前计划
  React.useEffect(() => {
    if (currentlySelectedPlanId && allStudentPlans) {
      const plan = allStudentPlans.find(p => p.id === currentlySelectedPlanId);
      if (plan && plan.vocabulary_book) {
        setCurrentLearningBook(plan.vocabulary_book);
      }
    }
  }, [currentlySelectedPlanId, allStudentPlans, setCurrentLearningBook]);

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-sans">
      <Sidebar studentId={studentId} /> {/* Pass studentId to Sidebar */}

      {/* Main Content Area - Updated with Ebbinghaus View */}
      <main className="flex-1 p-6 overflow-y-auto h-screen">
        {currentLearningBook ? (
          // === Ebbinghaus View when a book is selected ===
          <div className="flex flex-col h-full">
            <div className="w-full flex-grow flex flex-col">
              <div className="flex-grow flex flex-col">
                <Card className="flex flex-col flex-grow h-full max-h-[calc(100vh-48px)] rounded-2xl shadow-lg p-8 bg-white dark:bg-gray-900 relative">
                  {/* 悬浮 smile 视频，absolute 定位于 Card 右上角，兼容主流浏览器，IE 兜底静态图 */}
                  {(() => {
                    // 简单判断浏览器类型
                    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
                    const isIE = /MSIE|Trident/.test(ua);
                    const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
                    const isWebmSupported = /Chrome|Edg|Firefox/.test(ua);
                    if (isIE) {
                      // IE 浏览器不展示
                      return null;
                    } else if (isWebmSupported) {
                      return (
                        <video
                          className="absolute top-0 right-0 z-20 pointer-events-none block dark:hidden"
                          style={{
                            width: 150,
                            height: 150,
                            transform: 'translate(-45%, -30%)',
                            filter: 'brightness(1.3) saturate(2.0)',
                          }}
                          autoPlay
                          loop
                          muted
                          playsInline
                        >
                          <source src="/videos/smile.webm" type="video/webm" />
                          <source src="/videos/smile.mov" type="video/quicktime" />
                        </video>
                      );
                    } else if (isSafari) {
                      return (
                        <video
                          className="absolute top-0 right-0 z-20 pointer-events-none block dark:hidden"
                          style={{
                            width: 150,
                            height: 150,
                            transform: 'translate(-45%, -30%)',
                            filter: 'brightness(1.3) saturate(2.0)',
                          }}
                          autoPlay
                          loop
                          muted
                          playsInline
                        >
                          <source src="/videos/smile.mov" type="video/quicktime" />
                        </video>
                      );
                    } else {
                      // 其他未知浏览器不展示
                      return null;
                    }
                  })()}
                  <CardContent className="flex flex-col flex-grow h-full p-0">
                    {/* 修改标题部分，添加学生姓名/邮箱显示，风格与右侧卡片统一 */}
                    <div
                      className="flex items-center gap-2 mb-4 px-5 py-3 rounded-2xl shadow-lg"
                      style={{
                        // Use custom mint color for banner background
                        background: '#B3E9C7', // custom-mint-medium
                        boxShadow: '0 4px 20px rgba(179, 233, 199, 0.5)',
                        border: '1px solid rgba(179, 233, 199, 0.5)',
                        ...(typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
                          ? {
                              // Use a slightly darker mint for dark mode
                              background: '#8FBC8F', // DarkSeaGreen (example, adjust as needed)
                              border: '1px solid rgba(143, 188, 143, 0.7)',
                              boxShadow: '0 4px 20px rgba(143, 188, 143, 0.3)'
                            }
                          : {})
                      }}
                    >
                      {/* Use deep purple for icon and text */}
                      <CalendarIcon className="w-8 h-8 text-custom-purple-dark dark:text-custom-purple-light animate-pulse" /> 
                      <h3 className="text-2xl font-bold text-custom-purple-dark dark:text-custom-purple-light font-playful-font tracking-wider leading-tight">
                        {isLoadingStudent ? (
                          "加载中..."
                        ) : studentInfo ? (
                          studentInfo.name ? (
                            <div className="flex flex-col items-start">
                              {/* Use deep purple text */}
                              <span className="text-sm text-custom-purple-dark dark:text-custom-purple-light font-bold drop-shadow-lg">
                                {studentInfo.name}
                              </span>
                              <span className="pl-8">的艾宾浩斯计划</span>
                            </div>
                          ) : studentInfo.email ? (
                            <div className="flex flex-col items-start">
                              {/* Use deep purple text */}
                              <span className="text-xl text-custom-purple-dark dark:text-custom-purple-light font-bold drop-shadow-lg">
                                {studentInfo.email}
                              </span>
                              <span className="pl-8">的艾宾浩斯计划</span>
                            </div>
                          ) : (
                            <span>艾宾浩斯计划</span>
                          )
                        ) : studentError ? (
                          <span className="text-red-500 text-sm">加载学生信息出错</span>
                        ) : (
                          <span>艾宾浩斯计划</span>
                        )}
                      </h3>
                    </div>
                    {/* Matrix container - Remove scrollbar classes */}
                    <div className="flex-grow flex flex-col min-h-0">
                      {isLoadingMatrix ? (
                        <div className="flex items-center justify-center h-full py-12 text-gray-500">
                          加载矩阵数据中...
                        </div>
                      ) : matrixError ? (
                        <div className="flex items-center justify-center h-full py-12 text-red-500">
                          获取矩阵数据失败: {matrixError.message}
                        </div>
                      ) : matrixData ? (
                        <div className="flex-1 min-h-0">
                          <div className="h-full overflow-y-auto scrollbar-hide relative">
                                <EbinghausMatrix 
                                  days={matrixData.total_days || 0} 
                                  totalWords={matrixData.total_words}
                                  wordsPerDay={matrixData.words_per_day}
                                  planId={currentlySelectedPlanId || undefined}
                                  studentId={studentId}
                                  onSelectUnit={(unit) => {
                                    // 处理单元格点击事件，导航到记忆页面
                                    if (!currentlySelectedPlanId || !studentId) {
                                      toast.error("无法开始学习：缺少计划或学生信息");
                                      return;
                                    }
                                
                                    // 确定模式：检查是否是复习或新学单元
                                    const mode: 'new' | 'review' = unit.is_learned ? 'review' : 'new';
                                
                                    // 根据模式获取今日学习数据
                                    getTodaysLearning(currentlySelectedPlanId, mode === 'new' ? 'new' : 'review')
                                      .then(data => {
                                        let navigationState: any = { 
                                          mode, 
                                          planId: currentlySelectedPlanId,
                                          isReviewingToday: false 
                                        };
                                    
                                        if (mode === 'new') {
                                          // 新学习模式
                                          const newUnit = data.new_unit;
                                          if (!newUnit || !newUnit.words || newUnit.words.length === 0) {
                                            toast.error("无法获取新学单元数据");
                                            return;
                                          }
                                      
                                          navigationState.unitId = newUnit.id;
                                          navigationState.unitNumber = newUnit.unit_number; // <-- 添加这一行，传递单元序号
                                          navigationState.words = newUnit.words;
                                          navigationState.start_word_order = newUnit.start_word_order;
                                          navigationState.end_word_order = newUnit.end_word_order;
                                        } else {
                                          // 复习模式 - 如果点击的是某个复习单元，可能需要筛选出对应的复习单元
                                          const reviewUnits = data.review_units || [];
                                          // 查找点击的单元是否在复习列表中
                                          const targetUnit = reviewUnits.find(ru => ru.unit_number === unit.unit_number);
                                      
                                          if (targetUnit && targetUnit.words && targetUnit.words.length > 0) {
                                            // 如果找到了对应的单元，只导航到这个单元
                                            navigationState.words = targetUnit.words;
                                            navigationState.reviewUnits = [targetUnit];
                                          } else if (reviewUnits.length > 0) {
                                            // 否则，使用所有可复习单元
                                            let allWords: VocabularyWord[] = [];
                                            reviewUnits.forEach(unit => {
                                              if (unit.words) allWords = allWords.concat(unit.words);
                                            });
                                        
                                            if (allWords.length === 0) {
                                              toast.error("没有待复习的单词");
                                              return;
                                            }
                                        
                                            navigationState.words = allWords;
                                            navigationState.reviewUnits = reviewUnits;
                                          } else {
                                            toast.error("没有待复习的单元数据");
                                            return;
                                          }
                                        }
                                    
                                        // 导航到记忆单词页面
                                        navigate(`/students/${studentId}/memorize`, { state: navigationState });
                                      })
                                      .catch(error => {
                                        console.error("获取学习数据失败:", error);
                                        toast.error("获取学习数据失败，请重试");
                                      });
                                  }}
                                  ebinghausIntervals={ebinghausIntervals}
                              learningUnits={matrixData.units.map(unit => ({
                                ...unit,
                                reviews: Array.isArray(unit.reviews) ? unit.reviews.map(review => ({
                                  ...review,
                                  // 确保包含所有需要的字段
                                  review_date: review.review_date,
                                  completed_at: null // 提供默认值
                                })) : []
                              })) as LearningUnit[]} 
                                  max_actual_unit_number={matrixData.max_actual_unit_number}
                                  estimated_unit_count={matrixData.estimated_unit_count}
                                  has_unused_lists={matrixData.has_unused_lists}
                                />
                          </div>
                        </div>
                      ) : selectedPlan ? (
                        <div className="flex items-center justify-center h-full py-12 text-gray-500">
                          正在准备矩阵数据...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full py-12 text-gray-500">
                          请先选择一个计划以查看艾宾浩斯矩阵。
                        </div>
                      )}
                    </div>
                    {/* Legend 美化 */}
                    <div className="flex flex-wrap gap-x-4 gap-y-2 items-center justify-center mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 rounded-b-2xl min-h-[44px]">
                      <TooltipProvider delayDuration={100}>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600/50"></div>
                          <span>未学</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {/* Legend: 待复习 - very light purple */}
                          <div className="w-3 h-3 rounded-full bg-custom-purple-verylight border border-custom-purple-light"></div>
                          <span>待复习</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {/* Legend: 已完成 - medium mint (with dark mode) */}
                          <div className="w-3 h-3 rounded-full bg-custom-mint-medium border border-custom-mint-light dark:bg-custom-mint-medium dark:border-custom-mint-light"></div>
                          <span>已完成</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-600/50 border border-gray-300 dark:border-gray-500 opacity-70"></div>
                          <span className="line-through">list x</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <LightbulbIcon className="w-3.5 h-3.5 text-gray-400 hover:text-yellow-500 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs max-w-xs bg-gray-900 text-white border-gray-700 p-2 rounded shadow-lg">
                              <p>中间画横线表示用户学习速度比较快，提前学完了所有单词，原计划分配任务多余了</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TooltipProvider>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        ) : (
          // === Prompt to select a book - Removing Icon and Button ===
          <div className="flex flex-col items-center justify-center h-full text-center">
            {/* Remove BookOpenIcon */}
            {/* <BookOpenIcon className="w-24 h-24 text-gray-300 dark:text-gray-600 mb-6" /> */}
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4"> {/* Increased margin bottom */}
              开始您的学习之旅
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              请从右侧边栏选择您想要学习的词库书，然后我们将为您生成个性化的艾宾浩斯学习计划。
            </p>
          </div>
        )}
      </main>

      {/* Right Sidebar */}
      <aside className="w-80 bg-gray-50 dark:bg-gray-800 p-6 flex flex-col space-y-6 border-l border-gray-200 dark:border-gray-700 shadow-lg overflow-y-auto h-screen">
        {/* === MOVED: Vocabulary Book Selection First === */}
        <Card className="bg-gradient-to-b from-custom-mint-verylight to-white dark:from-gray-700 dark:to-gray-800 border-custom-mint-medium dark:border-custom-mint-light text-gray-900 dark:text-white shadow-md rounded-2xl transition-transform duration-200 hover:scale-[1.03]">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            {/* Use deep purple for icon */}
            <span className="inline-block">
              <svg className="w-8 h-8 text-custom-purple-dark drop-shadow-lg" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 12V4l9 5-9 5-9-5 9-5z" /></svg>
            </span>
            {/* Use deep purple for title */}
            <CardTitle className="text-xl font-bold text-custom-purple-dark dark:text-custom-purple-light">学习词库</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingPlan ? ( <p>加载中...</p> )
             : planError ? (
                // Display error message
                <p className="text-sm text-red-500">获取计划失败: {planError.message}</p>
             ) : allStudentPlans && allStudentPlans.length > 0 ? (
                <div className="mt-4 pt-2">
                  <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">已有学习计划</h4>
                  <div className="flex flex-wrap gap-2">
                    {allStudentPlans.map((plan) => {
                      if (!plan.vocabulary_book) {
                        return <Badge key={plan.id} variant="destructive" className="text-xs">无效计划 (无词库)</Badge>;
                      }
                      const isSelected = plan.id === currentlySelectedPlanId;
                      const isActive = plan.is_active;
                      return (
                        <Button
                          key={plan.id}
                          variant={isActive ? "default" : "secondary"}
                          size="sm"
                          className={`h-auto font-normal rounded-full px-4 py-1.5 text-xs shadow transition-all duration-150 relative
                            ${isActive ? 'bg-custom-purple-light text-white hover:bg-custom-purple-dark dark:bg-custom-purple-light dark:hover:bg-custom-purple-dark' : 'bg-secondary-100 dark:bg-secondary-600 text-secondary-800 dark:text-secondary-200 hover:bg-secondary-200 dark:hover:bg-secondary-500'}
                            ${isSelected ? 'ring-2 ring-offset-1 ring-custom-purple-light dark:ring-custom-purple-light scale-105' : ''}
                          `}
                          onClick={() => handleSelectPlan(plan)}
                        >
                          {plan.vocabulary_book.name}
                          {isActive && <CheckCircleIcon className="w-3 h-3 ml-1.5 inline-block text-white dark:text-white" />}
                        </Button>
                      );
                    })}
                  </div>
                  {/* Words per day input section (check allStudentPlans length) */}
                  {(currentlySelectedPlanId !== null || (allStudentPlans && allStudentPlans.length === 0)) && (
                    <div className="mt-6 pt-4">
                      <label htmlFor="wordsPerDayInput" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                        每日新词数量
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="wordsPerDayInput"
                          type="number"
                          value={inputWordsPerDay}
                          onChange={(e) => setInputWordsPerDay(e.target.value)}
                          min="1"
                          className="h-10 flex-grow rounded-lg shadow border border-custom-mint-medium dark:border-custom-mint-light focus:ring-2 focus:ring-custom-mint-medium"
                          disabled={isLoadingPlan}
                        />
                        <Button
                          size="sm"
                          onClick={handleSaveWordsPerDay}
                          disabled={!isWordsPerDaySaveEnabled || isLoadingPlan}
                          className="h-10 px-4 flex-shrink-0 rounded-lg bg-custom-mint-light text-custom-purple-dark font-bold shadow hover:bg-custom-mint-medium dark:bg-custom-mint-medium dark:text-custom-purple-dark dark:hover:bg-custom-mint-light border-0"
                        >
                          {isLoadingPlan ? '保存中...' :
                            (currentlySelectedPlanId !== null ? '修改' : '创建计划')
                          }
                        </Button>
                      </div>
                      {/* 友好提示 */}
                      {currentlySelectedPlanId !== null && (
                        <p className="text-xs text-gray-500 mt-2">当前计划词库：<span className="font-semibold text-custom-purple-dark dark:text-custom-purple-light">{currentLearningBook?.name}</span></p>
                      )}
                    </div>
                  )}
                </div>
             ) : ( <p>该学生暂无学习计划。</p> )
            }
          </CardContent>
        </Card>

        {/* === Daily Quests (Now Second) === */}
        <Card
          className="relative bg-gradient-to-br from-custom-mint-medium to-custom-mint-verylight dark:from-custom-mint-medium dark:to-custom-mint-light border-0 shadow-xl shadow-custom-mint-light/40 dark:shadow-custom-mint-medium/40 text-custom-purple-dark dark:text-custom-purple-light transition-transform duration-200 hover:scale-[1.03]"
          style={{ overflow: 'visible' }}
        >
          {/* 推荐 Badge */}
          <span
            className="absolute top-3 right-3 z-10 bg-custom-mint-verylight dark:bg-custom-mint-light text-custom-purple-dark text-xs font-bold px-2 py-0.5 rounded-full shadow-md select-none border border-custom-mint-light dark:border-custom-mint-medium animate-bounce"
            style={{ letterSpacing: '0.05em' }}
          >
            建议
          </span>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            {/* Use deep purple text for title, keep icon purple */}
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-white dark:text-white">
              {/* 动画图标 */}
              <span className="inline-block animate-pulse">
                {/* Use deep purple for icon */}
                <ZapIcon className="w-8 h-8 text-custom-purple-dark drop-shadow-lg" />
              </span>
               {/* Use white text for title for contrast */}
               {/* Updated: Use deep purple text for title */}
               <span className="text-custom-purple-dark dark:text-custom-purple-light">开始学习</span>
            </CardTitle>
            <Button
                size="sm"
                className="h-9 px-3 flex-shrink-0 bg-custom-purple-dark text-custom-mint-verylight dark:bg-custom-purple-dark dark:text-white font-bold shadow hover:bg-custom-purple-light dark:hover:bg-custom-purple-light border-0"
                onClick={handleStartLearning}
                disabled={!currentlySelectedPlanId}
             >
                 开始
             </Button>
          </CardHeader>
          <CardContent>
             <div className="flex items-center space-x-4 mb-2">
                {/* 图标已上移，这里可省略 */}
                <div className="flex-1">
                   {/* Use white text for description */}
                   {/* Updated: Use gray text for description */}
                   <p className="font-semibold text-sm text-gray-600 dark:text-gray-400">获得10点经验值</p>
                   {/* Use light gray or very light mint for progress bar background */}
                   <div className="h-2 mt-1 bg-gray-200 dark:bg-gray-600 rounded-full w-full">
                     {/* Use light purple for progress bar fill */}
                     <div className="h-full bg-custom-purple-light dark:bg-custom-purple-light rounded-full transition-all" style={{width: '0%'}}></div>
                   </div>
                </div>
                {/* Use light purple for progress badge */}
                <Badge className="bg-custom-purple-light text-white dark:bg-custom-purple-light dark:text-white border-custom-purple-light shadow">0 / 10</Badge>
              </div>
             {/* Add more quests if needed */}
          </CardContent>
        </Card>

        {/* === Unlock Leaderboards (Now Third) === */}
        <Card className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center text-gray-800 dark:text-gray-200">
               <LockIcon className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400"/> 解锁排行榜！
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
               完成10个课程即可开始竞争
            </p>
                    </CardContent>
                  </Card>
                        
        {/* Vocabulary Book Selection - Now with Multi-select Dropdown (REMOVED FROM HERE) */}
        

        {/* Footer Links */}
         <SidebarFooterLinks />
      </aside>
      
      {/* Start Learning Confirmation Dialog */}
      <AlertDialog open={isStartDialogVisible} onOpenChange={setIsStartDialogVisible}>
        <AlertDialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="relative">
             {/* Close Button */}
             <button
               onClick={() => setIsStartDialogVisible(false)}
               className="absolute top-[-0.5rem] right-[-0.5rem] p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-800"
               aria-label="Close"
             >
               <X className="w-5 h-5" />
             </button>

            <AlertDialogHeader>
              <AlertDialogTitle className="text-gray-900 dark:text-white">开始今日学习</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                {/* Simplified description based on the two main options */}
                {isLoadingTodaysLearning ? "正在检查学习任务..." :
                 todaysLearningError ? `加载失败: ${todaysLearningError.message}` :
                 "请选择要进行的学习活动。"
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            {/* Footer with only two main buttons */}
            <AlertDialogFooter className="flex flex-col sm:flex-row sm:justify-end sm:space-x-2">
                {(() => {
                    const isLoading = isLoadingTodaysLearning;
                    const errorOccurred = !!todaysLearningError;
                    const data = todaysLearningData; // Data from useTodaysLearning

                    const canLearnNextNew = data?.newUnit && !data.newUnit.is_learned && data.newUnit.words && data.newUnit.words.length > 0;
                    const canReviewToday = lastLearnedNewUnitCache && lastLearnedNewUnitCache.words.length > 0;
                    let button1Text = "处理新词";
                    let button1Action = () => {};
                    let button1Disabled = !!(isLoading || errorOccurred);

                    if (isLoading) { button1Text = "加载中..."; button1Disabled = true; }
                    else if (errorOccurred) { button1Text = "加载出错"; button1Disabled = true; }
                    else if (canLearnNextNew) { button1Text = "学习新词"; button1Action = () => navigateToMemorize('new'); button1Disabled = false; }
                    else if (data?.newUnit === null) { button1Text = "暂无新词"; button1Disabled = true; }
                    else if (canReviewToday) { button1Text = "温习新词"; button1Action = navigateToReviewToday; button1Disabled = false; }
                    else { button1Text = "新词已完成"; button1Disabled = true; }

                    const canReviewOld = data?.reviewUnits && data.reviewUnits.length > 0;
                    const button2Text = canReviewOld ? "复习旧词" : "暂无复习";
                    const button2Action = () => navigateToMemorize('review');
                    const button2Disabled = isLoading || errorOccurred || !canReviewOld;

                    return (
                        <>
                            {/* 按钮 1：学习新词 / 温习新词 / 暂无新词 */}
                            <Button
                                variant={canLearnNextNew ? "default" : (canReviewToday && !button1Disabled ? "secondary" : "outline")}
                                onClick={button1Action}
                                disabled={button1Disabled}
                                className="w-full sm:w-auto mt-2 sm:mt-0"
                            >
                                {button1Text}
                            </Button>

                            {/* 按钮 2：复习旧词 */}
                            <Button
                                variant="secondary"
                                onClick={button2Action}
                                disabled={button2Disabled}
                                className="w-full sm:w-auto mt-2 sm:mt-0"
                            >
                                {isLoading ? "加载中..." : button2Text}
                            </Button>
                        </>
                    );
                })()}
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* --- NEW: Confirmation Dialog for Modifying Plan --- */}
      <AlertDialog open={isModifyConfirmDialogVisible} onOpenChange={setIsModifyConfirmDialogVisible}>
        <AlertDialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-gray-900 dark:text-white">确认修改计划？</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                修改每日新词数量可能会影响您当前的艾宾浩斯学习计划进度和安排。
                您确定要继续吗？
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsModifyConfirmDialogVisible(false)} className="mt-2 sm:mt-0">取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  executeSaveOrUpdatePlan();
                  setIsModifyConfirmDialogVisible(false);
                }}
              >
                确认修改
              </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export const Students = () => (
  <StudentPlanProvider>
    <StudentsInner />
  </StudentPlanProvider>
);  