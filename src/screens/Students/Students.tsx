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
import { EbinghausMatrix } from "./EbinghausMatrix"; // <-- Add EbinghausMatrix import
import { useVocabulary, VocabularyBook } from "../../hooks/useVocabulary"; // 导入自定义 hook and type
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
import { SidebarFooterLinks } from '../../components/layout/SidebarFooterLinks'; // Import SidebarFooterLinks
import { useQueryClient, useMutation } from '@tanstack/react-query'; // <-- Add React Query imports
import { useTodaysLearning } from "../../hooks/useTodaysLearning"; // <-- Import the hook
import { LearningPlan, LearningPlanPayload } from "../../services/learningApi";
import { getWordsForUnit } from "../../services/learningApi";


// 艾宾浩斯遗忘曲线复习周期（天数）
const ebinghausIntervals = [1, 2, 4, 7, 15];


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
    currentLearningBook,
    setCurrentLearningBook,
    wordsPerDay,
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

  // prepareAndOpenDialog 相关逻辑，移除 setTodayLearningStatus，改为本地 loading/error 状态
  const [dialogLoading] = useState(false);
  const [dialogError] = useState<string | null>(null);

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

    try {
      // Trigger a refetch to ensure data is fresh when dialog opens
      // console.log("[prepareAndOpenDialog] Refetching today's learning data...");
      await refetchTodaysLearning();
      // Handle potential errors from refetch if needed, though useQuery handles the state
    } catch (error) {
       console.error("[prepareAndOpenDialog] Error during refetch: ", error);
       // Error state is already handled by useTodaysLearning hook
    }

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
        // 新增：设置学习开始时间
        sessionStorage.setItem("learningSessionStart", Date.now().toString());
        navigate(`/students/${studentId}/memorize`, {
          state: {
            planId: currentlySelectedPlanId,
            unitId: newUnit.id,
            unitNumber: newUnit.unit_number,
            mode: 'new',
            autoFullscreen: true,
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
            mode: 'review',
            autoFullscreen: true,
          }
        });
      } else {
        toast.info("暂无待复习内容。");
      }
    }
  };

  // --- NEW: Handler for reviewing today's learned words from cache ---
  // --- MODIFIED: Now navigates with unit ID and mode, not words ---
  const navigateToReviewToday = (unitId: number, unitNumber: number | undefined) => {
      if (!currentlySelectedPlanId) {
          toast.error("无法温习：未找到当前计划。");
          return;
      }
      if (!studentId) {
          toast.error("无法温习：缺少学生信息。"); return;
      }

      // 新增：设置学习开始时间
      sessionStorage.setItem("learningSessionStart", Date.now().toString());

      setIsStartDialogVisible(false);
      const targetPath = `/students/${studentId}/memorize`;
      navigate(targetPath, {
          state: {
              mode: 'reviewToday',
              planId: currentlySelectedPlanId,
              unitId: unitId,
              unitNumber: unitNumber,
              isReviewingToday: true,
              autoFullscreen: true,
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
    <div className="flex h-screen overflow-hidden bg-duo-white text-duo-textPrimary font-sans">
      <Sidebar studentId={studentId} /> {/* Pass studentId to Sidebar */}

      {/* Main Content Area - Updated with Ebbinghaus View */}
      <main className="flex-1 p-6 overflow-y-auto h-screen bg-duo-bg">
        {currentLearningBook ? (
          // === Ebbinghaus View when a book is selected ===
          <div className="flex flex-col h-full">
            <div className="w-full flex-grow flex flex-col">
              <div className="flex-grow flex flex-col">
                <Card className="flex flex-col flex-grow h-full max-h-[calc(100vh-48px)] bg-transparent border-0 shadow-none p-0 relative">
                  {/* 悬浮 smile 视频，absolute 定位于 Card 右上角，兼容主流浏览器，IE 兜底静态图 */}
                  {/* {(() => {
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
                  })()} */}
                  <CardContent className="flex flex-col flex-grow h-full p-0">
                    {/* 修改标题部分，添加学生姓名/邮箱显示，风格与右侧卡片统一 */}
                    <div
                      className="flex items-center gap-2 mb-4 px-5 py-3 rounded-2xl shadow-lg bg-duo-green border border-duo-green"
                    >
                      {/* Use deep green text */}
                      <CalendarIcon className="w-8 h-8 text-white animate-pulse" /> 
                      <h3 className="text-2xl font-bold text-white font-playful-font tracking-wider leading-tight">
                        {isLoadingStudent ? (
                          "加载中..."
                        ) : studentInfo ? (
                          studentInfo.name ? (
                            <div className="flex flex-col items-start">
                              {/* Use deep green text */}
                              <span className="text-sm text-white font-bold drop-shadow-lg">
                                {studentInfo.name}
                              </span>
                              <span className="pl-8">的艾宾浩斯计划</span>
                            </div>
                          ) : studentInfo.email ? (
                            <div className="flex flex-col items-start">
                              {/* Use deep green text */}
                              <span className="text-xl text-white font-bold drop-shadow-lg">
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
                        <div className="flex items-center justify-center h-full py-12 text-duo-textSecondary">
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

                                    // 检查 unit.id 是否为有效 (正数) 的数据库ID
                                    if (!unit || unit.id <= 0) { 
                                        toast.info("此单元格代表一个尚未创建或无法识别的计划条目，无法加载其特定单词。请先按计划顺序学习或确保计划已正确生成。");
                                        return;
                                    }

                                    const unitId = unit.id;
                                    
                                    // console.log("[Students onSelectUnit] 开始获取单元词汇:", {
                                    //   unitId,
                                    //   unitNumber: unit.unit_number,
                                    //   isLearned: unit.is_learned,
                                    //   planId: currentlySelectedPlanId
                                    // });

                                    // 使用新的 API 获取特定单元的单词
                                    getWordsForUnit(currentlySelectedPlanId, unitId)
                                      .then(words => {

                                        
                                        if (!words || words.length === 0) {
                                          toast.error(`无法获取单元 ${unit.unit_number} 的单词数据，或者该单元没有单词。`);
                                          return;
                                        }

                                        const mode: 'new' | 'review' = unit.is_learned ? 'review' : 'new';

                                        const navigationState: any = {
                                          mode,
                                          planId: currentlySelectedPlanId,
                                          unitId: unitId,
                                          unitNumber: unit.unit_number, // 传递单元序号
                                          words: words,
                                          autoFullscreen: true,
                                        };
                                        
                                      
                                        navigate(`/students/${studentId}/memorize`, { state: navigationState });
                                      })
                                      .catch(error => {
                                        console.error(`获取单元 L${unit.unit_number} (ID: ${unitId}) 的单词失败:`, error);
                                        toast.error(`获取单元 L${unit.unit_number} 的单词失败，请重试。`);
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
                        <div className="flex items-center justify-center h-full py-12 text-duo-textSecondary">
                          正在准备矩阵数据...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full py-12 text-gray-500">
                          请先去词库选择一本词书以开始学习
                        </div>
                      )}
                    </div>
                    {/* Legend 美化 - 更新图例颜色以匹配矩阵 */}
                    <div className="flex flex-wrap gap-x-6 gap-y-2 items-center justify-center mt-8 pt-6 px-4 py-4 border-t border-duo-grayLight text-sm text-duo-textSecondary bg-duo-grayLight rounded-b-2xl min-h-[44px]">
                      <TooltipProvider delayDuration={100}>
                                                  <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-duo-white border border-duo-grayMedium"></div>
                            <span>未学</span>
                          </div>
                                                  <div className="flex items-center gap-1.5">
                            {/* Legend: 待复习 - 多邻国蓝色 */}
                            <div className="w-4 h-4 rounded-full bg-duo-blue border border-duo-blueDark"></div>
                            <span>待复习</span>
                          </div>
                                                  <div className="flex items-center gap-1.5">
                            {/* Legend: 已完成 - 多邻国绿色 */}
                            <div className="w-4 h-4 rounded-full bg-duo-green border border-duo-green"></div>
                            <span>已完成</span>
                          </div>
                                                  <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 rounded-full bg-duo-grayMedium border border-duo-grayDark opacity-70"></div>
                            <span className="line-through">list x</span>
                            <Tooltip>
                            <TooltipTrigger asChild>
                              <LightbulbIcon className="w-5 h-5 text-duo-grayMedium hover:text-duo-orange cursor-help" />
                            </TooltipTrigger>
                                                          <TooltipContent side="top" className="text-xs max-w-xs bg-duo-grayDark text-duo-white border-duo-grayMedium p-2 rounded shadow-lg">
                              <p>中间画横线表示用户学习速度快，提前学完了所有单词，原计划分配任务多余了</p>
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
            <h2 className="text-2xl font-semibold text-duo-textPrimary mb-4"> {/* Increased margin bottom */}
              开始您的学习之旅
            </h2>
            <p className="text-duo-textSecondary max-w-md">
              请从左侧边栏选择您想要学习的词库书，然后我们将为您生成个性化的艾宾浩斯学习计划。
            </p>
          </div>
        )}
      </main>

      {/* Right Sidebar */}
      <aside className="w-80 bg-duo-bg p-6 flex flex-col space-y-6 overflow-y-auto h-screen">
        {/* === MOVED: Vocabulary Book Selection First === */}
        <Card className="bg-gradient-to-b from-duo-grayLight to-duo-white border-duo-grayMedium text-duo-textPrimary shadow-md rounded-2xl">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            {/* Use deep green for icon */}
                          <span className="inline-block">
                <svg className="w-8 h-8 text-duo-green drop-shadow-lg" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 12V4l9 5-9 5-9-5 9-5z" /></svg>
              </span>
            {/* Use deep green for title */}
            <CardTitle className="text-xl font-bold text-duo-green">学习词库</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingPlan ? ( <p>加载中...</p> )
             : planError ? (
                // Display error message
                <p className="text-sm text-red-500">获取计划失败: {planError.message}</p>
             ) : allStudentPlans && allStudentPlans.length > 0 ? (
                <div className="mt-4 pt-2">
                  <h4 className="text-sm font-semibold text-duo-textSecondary mb-2">已有学习计划</h4>
                  <div className="flex flex-wrap gap-2">
                    {allStudentPlans.map((plan) => {
                      if (!plan.vocabulary_book) {
                        return <Badge key={plan.id} variant="destructive" className="text-xs">无效计划 (无词库)</Badge>;
                      }
                      const isSelected = plan.id === currentlySelectedPlanId;
                      const isActive = plan.is_active; // 保留但不用于样式
                      return (
                        <Button
                          key={plan.id}
                          variant={isSelected ? "default" : "secondary"}
                          size="sm"
                          className={`h-auto font-normal rounded-full px-4 py-1.5 text-xs shadow transition-all duration-150 relative
                            ${isSelected ? 'bg-duo-green text-white hover:bg-duo-green ring-2 ring-offset-1 ring-duo-green scale-105' : 'bg-duo-grayLight text-duo-textPrimary hover:bg-duo-grayMedium'}
                          `}
                          onClick={() => handleSelectPlan(plan)}
                        >
                          {plan.vocabulary_book.name}
                          {isSelected && <CheckCircleIcon className="w-3 h-3 ml-1.5 inline-block text-white" />}
                        </Button>
                      );
                    })}
                  </div>
                  {/* Words per day input section (check allStudentPlans length) */}
                  {(currentlySelectedPlanId !== null || (allStudentPlans && allStudentPlans.length === 0)) && (
                    <div className="mt-6 pt-4">
                      <label htmlFor="wordsPerDayInput" className="block text-sm font-medium text-duo-textSecondary mb-1.5">
                        每日新词数量
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="wordsPerDayInput"
                          type="number"
                          value={inputWordsPerDay}
                          onChange={(e) => setInputWordsPerDay(e.target.value)}
                          min="1"
                          className="h-10 flex-grow rounded-lg shadow border border-duo-grayMedium focus:ring-2 focus:ring-duo-blue"
                          disabled={isLoadingPlan}
                        />
                        <Button
                          size="sm"
                          onClick={handleSaveWordsPerDay}
                          disabled={!isWordsPerDaySaveEnabled || isLoadingPlan}
                          className="h-10 px-4 flex-shrink-0 rounded-lg bg-duo-green text-white font-bold shadow hover:bg-duo-green border-0"
                        >
                          {isLoadingPlan ? '保存中...' :
                            (currentlySelectedPlanId !== null ? '修改' : '创建计划')
                          }
                        </Button>
                      </div>
                      {/* 友好提示 */}
                      {currentlySelectedPlanId !== null && (
                        <p className="text-xs text-duo-textSecondary mt-2">当前计划词库：<span className="font-semibold text-duo-green">{currentLearningBook?.name}</span></p>
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
          className="relative bg-gradient-to-br from-duo-green to-duo-grayLight border-0 shadow-xl shadow-duo-green/40 text-duo-white"
          style={{ overflow: 'visible' }}
        >
          {/* 推荐 Badge */}
          <span
            className="absolute top-3 right-3 z-10 bg-duo-white text-duo-green text-xs font-bold px-2 py-0.5 rounded-full shadow-md select-none border border-duo-green animate-bounce"
            style={{ letterSpacing: '0.05em' }}
          >
            建议
          </span>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-duo-white">
              <span className="inline-block animate-pulse">
                <ZapIcon className="w-8 h-8 text-duo-orange drop-shadow-lg" />
              </span>
               {/* Use deep green text */}
               <span className="text-duo-white">开始学习</span>
            </CardTitle>
            <Button
                size="sm"
                className="h-9 px-3 flex-shrink-0 bg-duo-white text-duo-green font-bold shadow hover:bg-duo-grayLight border border-duo-green"
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
                  
                   <div className="h-2 mt-1 bg-duo-grayLight rounded-full w-full">
                     <div className="h-full bg-duo-green rounded-full transition-all" style={{width: '0%'}}></div>
                   </div>
                </div>
                <Badge className="bg-duo-green text-white border-duo-green shadow">0 / 10</Badge>
              </div>
             
          </CardContent>
        </Card>

         <SidebarFooterLinks />
      </aside>
      
      {/* Start Learning Confirmation Dialog */}
      <AlertDialog open={isStartDialogVisible} onOpenChange={setIsStartDialogVisible}>
        <AlertDialogContent className="bg-duo-white border-duo-grayMedium">
          <div className="relative">
             {/* Close Button */}
             <button
               onClick={() => setIsStartDialogVisible(false)}
               className="absolute top-[-0.5rem] right-[-0.5rem] p-1 rounded-full text-duo-grayMedium hover:bg-duo-grayLight focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-duo-blue"
               aria-label="Close"
             >
               <X className="w-5 h-5" />
             </button>

            <AlertDialogHeader>
              <AlertDialogTitle className="text-duo-textPrimary">开始今日学习</AlertDialogTitle>
              <AlertDialogDescription className="text-duo-textSecondary">
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
                    // UPDATED: Check if today's new unit exists and is learned
                    const todayNewUnitLearned = data?.newUnit && data.newUnit.is_learned;
                    // REMOVED: const canReviewToday = lastLearnedNewUnitCache && lastLearnedNewUnitCache.words.length > 0;

                    let button1Text = "处理新词";
                    let button1Action = () => {};
                    let button1Disabled = !!(isLoading || errorOccurred);

                    if (isLoading) { button1Text = "加载中..."; button1Disabled = true; }
                    else if (errorOccurred) { button1Text = "加载出错"; button1Disabled = true; }
                    else if (canLearnNextNew) { button1Text = "学习新词"; button1Action = () => navigateToMemorize('new'); button1Disabled = false; }
                    // UPDATED: If cannot learn new, but today's new unit *is* learned, offer review
                    else if (todayNewUnitLearned && data.newUnit) {
                        button1Text = "温习新词";
                        // FIX: Wrap the call in an arrow function to match the expected type
                        button1Action = () => navigateToReviewToday(data.newUnit!.id, data.newUnit!.unit_number);
                        button1Disabled = false;
                    }
                    else if (data?.newUnit === null || (data?.newUnit && !data.newUnit.words)) { button1Text = "暂无新词"; button1Disabled = true; }
                    // REMOVED redundant else-if checking canReviewToday
                    // else if (canReviewToday) { button1Text = "温习新词"; button1Action = navigateToReviewToday; button1Disabled = false; }
                    else { button1Text = "新词任务完成"; button1Disabled = true; } // Adjusted fallback text

                    const canReviewOld = data?.reviewUnits && data.reviewUnits.length > 0;
                    const button2Text = canReviewOld ? "复习旧词" : "暂无复习";
                    const button2Action = () => navigateToMemorize('review');
                    const button2Disabled = isLoading || errorOccurred || !canReviewOld;

                    return (
                        <>
                            {/* 按钮 1：学习新词 / 温习新词 / 暂无新词 */}
                            <Button
                                variant={canLearnNextNew ? "default" : (todayNewUnitLearned ? "secondary" : "outline")}
                                onClick={button1Action}
                                disabled={button1Disabled}
                                className={`w-full sm:w-auto mt-2 sm:mt-0 ${canLearnNextNew ? 'bg-duo-green text-white hover:bg-duo-green' : (todayNewUnitLearned ? 'bg-duo-grayLight text-duo-textPrimary hover:bg-duo-grayMedium' : 'border-duo-green text-duo-green hover:bg-duo-grayLight')}`}
                            >
                                {button1Text}
                            </Button>

                            {/* 按钮 2：复习旧词 */}
                            <Button
                                variant="secondary"
                                onClick={button2Action}
                                disabled={button2Disabled}
                                className="w-full sm:w-auto mt-2 sm:mt-0 bg-duo-grayLight text-duo-textPrimary hover:bg-duo-grayMedium"
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
        <AlertDialogContent className="bg-duo-white border-duo-grayMedium">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-duo-textPrimary">确认修改计划？</AlertDialogTitle>
              <AlertDialogDescription className="text-duo-textSecondary">
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
                className="bg-duo-green hover:bg-duo-green text-white"
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