import { 
  ChevronRightIcon, 
  HomeIcon, 
  UsersIcon, 
  BookOpenIcon, 
  StarIcon, 
  ShoppingCartIcon, 
  UserCircleIcon, 
  MoreHorizontalIcon, 
  ZapIcon,
  LockIcon,
  CheckCircleIcon,
  SchoolIcon,
  SettingsIcon,
  HelpCircleIcon,
  LogOutIcon,
  CalendarIcon,
  TrendingUpIcon,
  ArrowLeft, ArrowRight, Shuffle, Search, Sun, Moon, X,
  LightbulbIcon
} from "lucide-react";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"; // Added CardHeader, CardTitle
import { useNavigate, useParams } from "react-router-dom";
// Import Radix components directly for CheckboxItem and Label
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Input } from "../../components/ui/input"; // <-- Add Input import
import {
  DropdownMenu,          // Keep using the custom wrapper for Root
  DropdownMenuTrigger,     // Keep using the custom wrapper
  DropdownMenuContent,     // Keep using the custom wrapper
  DropdownMenuItem,        // Keep using the custom wrapper
  // Remove CheckboxItem, Label, Separator from this import
  DropdownMenuSeparator,    // Keep using the custom wrapper for Separator if needed
} from "../../components/ui/dropdown-menu";
import { Sidebar } from "../../components/layout/Sidebar"; // Import the shared sidebar
import { EbinghausMatrix } from "../../components/EbinghausMatrix"; // <-- Add EbinghausMatrix import
import { useVocabulary, VocabularyBook } from "../../hooks/useVocabulary"; // 导入自定义 hook and type
import { vocabularyService, VocabularyWord } from "../../services/api"; // <-- Import VocabularyWord from api.ts
import { useAuth } from "../../hooks/useAuth"; // <-- Add useAuth import
import {
    createOrUpdateLearningPlan,
    getAllPlansForStudent,
    LearningPlan,
    getTodaysLearning,
    LearningUnit,
    TodayLearningResponse,
    getEbinghausMatrixData,
    EbinghausMatrixData // <-- 添加新的类型
} from "../../services/learningApi"; // <-- Add learning plan API imports
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
import { schoolService } from "../../services/schoolApi"; // 导入学生API服务
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip"; // <-- Import Tooltip components
import { useStudentInfo } from '../../hooks/useStudentInfo'; // 新增
import { useStudentPlans } from '../../hooks/useStudentPlans'; // 新增
import { useMatrixData } from '../../hooks/useMatrixData'; // 新增
import { StudentPlanProvider, useStudentPlanContext } from '../../context/StudentPlanContext';
import { useTodayLearningStatus } from '../../hooks/useTodayLearningStatus';
import { useLocalStorageCache } from '../../hooks/useLocalStorage';


// 艾宾浩斯遗忘曲线复习周期（天数）
const ebinghausIntervals = [1, 2, 4, 7, 15];

// Interface for the cached new unit data
interface LastLearnedNewUnitCache {
    unitId: number;
    unitNumber?: number;
    words: VocabularyWord[];
    timestamp?: number;
}

// Keep TodayLearningStatus simple for backend results
interface TodayLearningStatus {
  newUnit: LearningUnit | null; // Next unit from backend (or null if all done)
  reviewUnits: LearningUnit[] | null; // Pending reviews from backend
  isLoading: boolean;
  error: string | null;
}

const StudentsInner = (): JSX.Element => {
  const navigate = useNavigate();
  const { studentId } = useParams<{ studentId: string }>(); // <-- Get studentId from route params
  const { user } = useAuth(); // <-- Keep useAuth for general auth status if needed
  
  // 使用 useStudentInfo hook 获取学生信息
  const { studentInfo, isLoading: isLoadingStudent, error: studentError } = useStudentInfo(studentId);
  
  // 使用自定义 hook 管理词库相关状态
  const {
    selectedBooks,
    setSelectedBooks,
    currentLearningBook,
    setCurrentLearningBook,
    wordsPerDay,
    setWordsPerDay,
    searchQuery,
    setSearchQuery,
    isLoading: isLoadingBooks,
    vocabularyBooks,
    error: bookError,
    dropdownTriggerText,
    // saveUserPreferences // Not used directly in handleSave anymore
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
    fetchStudentPlans,
  } = useStudentPlans(studentId);
  
  // --- NEW: State for Dialog ---
  const [isStartDialogVisible, setIsStartDialogVisible] = useState<boolean>(false);
  // 使用 useLocalStorageCache 替换 lastLearnedNewUnitCache useState
  const [lastLearnedNewUnitCache, setLastLearnedNewUnitCache, clearLastLearnedNewUnitCache] =
    useLocalStorageCache<LastLearnedNewUnitCache | null>(
      `lastLearnedNewUnit_${currentlySelectedPlanId ?? ''}`,
      null
    );

  // 使用 useMatrixData hook 管理矩阵数据
  const {
    matrixData,
    isLoadingMatrix,
    matrixError,
    fetchMatrixData,
    setMatrixData,
  } = useMatrixData();

  // --- NEW: 修改计划确认弹窗 ---
  const [isModifyConfirmDialogVisible, setIsModifyConfirmDialogVisible] = useState(false);

  // Fetch student's plan when component mounts or studentId/fetch function changes
  useEffect(() => {
    console.log(`[Effect] Running fetchStudentPlans for studentId: ${studentId}`);
    fetchStudentPlans();
  }, [studentId, fetchStudentPlans]); // <-- Use the stable fetch function

  // Sync input field if wordsPerDay changes (e.g., when selecting a different plan)
  useEffect(() => {
    setInputWordsPerDay(String(wordsPerDay));
  }, [wordsPerDay]);

  // 当首次选择计划时也获取矩阵数据
  useEffect(() => {
    if (currentlySelectedPlanId && !matrixData && !isLoadingMatrix) {
      fetchMatrixData(currentlySelectedPlanId);
    }
  }, [currentlySelectedPlanId, matrixData, isLoadingMatrix, fetchMatrixData]);

  // --- NEW: Extracted function to actually perform the save/update ---
  const executeSaveOrUpdatePlan = async () => {
    const newValue = parseInt(inputWordsPerDay, 10);
    const studentIdNum = studentId ? parseInt(studentId, 10) : null;
    let bookIdToSave: number | null = null;

    if (currentlySelectedPlanId !== null && currentLearningBook?.id) {
        bookIdToSave = currentLearningBook.id; // Updating existing selected plan
    } else if (currentlySelectedPlanId === null && selectedBooks.length > 0) {
        bookIdToSave = selectedBooks[0].id; // Creating new, use first selected book
    }

    // This validation is technically done before calling this, but double-check
    if (!(newValue > 0 && studentIdNum && bookIdToSave)) {
        console.error("executeSaveOrUpdatePlan called with invalid data");
        toast.error("保存失败：内部错误。");
        return; // Should not happen if called correctly
    }

    // Prepare payload
    const planData: any = {
        student_id: studentIdNum,
        vocabulary_book_id: bookIdToSave,
        words_per_day: newValue,
        is_active: true,
    };

    // Add start_date ONLY when creating a new plan
    if (currentlySelectedPlanId === null) {
        planData.start_date = new Date().toISOString().split('T')[0];
    }

    console.log("Executing save/create plan:", planData);

    try {
        await createOrUpdateLearningPlan(planData);
        const actionText = currentlySelectedPlanId ? '修改' : '创建'; // Use '修改' for update
        toast.success(`学习计划已${actionText}`);
        await fetchStudentPlans(); // Refresh list
        fetchMatrixData(currentlySelectedPlanId || 0); // Also refresh matrix if updating an existing plan
    } catch (error: any) {
        console.error("执行保存或创建计划时出错:", error);
        toast.error(`保存失败: ${error.response?.data?.detail || error.message || '请稍后重试'}`);
        // Revert input on error
        if (currentlySelectedPlanId) {
            setInputWordsPerDay(String(wordsPerDay)); // Revert to selected plan's WPD
        } else {
            setInputWordsPerDay("20"); // Revert to default if creation failed
        }
    }
  };

  // --- MODIFIED: Handle initiating the save/update, potentially showing dialog first ---
  const handleSaveWordsPerDay = () => {
    const newValue = parseInt(inputWordsPerDay, 10);
    const studentIdNum = studentId ? parseInt(studentId, 10) : null;
    let bookIdToSave: number | null = null;
    // Determine if the selected book in dropdown matches the current plan's book
    const isBookSelectionMatchingCurrentPlan = currentlySelectedPlanId !== null &&
                                            selectedBooks.length === 1 &&
                                            selectedBooks[0].id === currentLearningBook?.id;

    // Basic validations
    if (newValue <= 0) {
      toast.warning("请输入有效的每日单词数量（大于0）。");
      setInputWordsPerDay(String(wordsPerDay)); // Revert
      return;
    }
    if (!studentIdNum) {
      toast.error("错误：无效或缺失的学生 ID。");
      return;
    }

    // Determine context: Modifying the current plan or Creating a new one
    const isModifyingCurrentPlan = isBookSelectionMatchingCurrentPlan;

    if (isModifyingCurrentPlan) {
        // --- Logic for Modifying the CURRENT plan ---
        // Check if the value actually changed
        if (newValue !== wordsPerDay) {
            setIsModifyConfirmDialogVisible(true); // Show confirmation dialog
        } else {
            // Value hasn't changed, maybe do nothing or just show a subtle message?
            toast.info("每日单词数量未更改。");
            // Optionally, you could still call executeSaveOrUpdatePlan() if the backend handles idempotency well
            // executeSaveOrUpdatePlan();
        }
    } else {
      // Creating a new plan (either no plan selected, or different book selected)
      if (selectedBooks.length === 0) {
          toast.warning("请先从下拉菜单选择一个词库书以创建计划。");
          return;
      }
      bookIdToSave = selectedBooks[0].id;
      executeSaveOrUpdatePlan(); // Create directly, no confirmation needed
    }
  };

  // --- MODIFIED: Determine if save button should be enabled --- (Simpler Logic)
  const isWordsPerDaySaveEnabled = useMemo(() => {
    const numericValue = parseInt(inputWordsPerDay, 10);
    const isValidInput = numericValue > 0;

    // Case 1: Modifying an existing selected plan
    const isModifyingEnabled = currentlySelectedPlanId !== null &&
                              isValidInput;
    // Case 2: Creating a new plan
    const isCreatingEnabled = currentlySelectedPlanId === null &&
                              // allStudentPlans.length === 0 && // Allow creating even if others exist, just not active maybe?
                              selectedBooks.length > 0 && // A book must be selected from dropdown
                              isValidInput;

    // Enable if either conditions are met AND not currently loading.
    return (isModifyingEnabled || isCreatingEnabled) && !isLoadingPlan;
  }, [inputWordsPerDay, currentlySelectedPlanId, selectedBooks, isLoadingPlan]);

  // Ensure filteredBooks is always an array for the dropdown
  const filteredDropdownBooks = Array.isArray(vocabularyBooks) ? vocabularyBooks : [];

  // --- Derived State: Get the currently selected plan object --- 
  const selectedPlan = useMemo(() => {
      if (!currentlySelectedPlanId) return null;
      return allStudentPlans.find(p => p.id === currentlySelectedPlanId) || null;
  }, [currentlySelectedPlanId, allStudentPlans]);

  // 新增：今日学习任务接口数据状态
  const [todayApiResult, setTodayApiResult] = useState<any>(null);
  const [todayLoading, setTodayLoading] = useState(false);
  const [todayError, setTodayError] = useState<string | null>(null);

  // 拉取今日学习任务数据（new+review）
  useEffect(() => {
    if (!currentlySelectedPlanId) {
      setTodayApiResult(null);
      setTodayError(null);
      setTodayLoading(false);
      return;
    }
    setTodayLoading(true);
    setTodayError(null);
    Promise.all([
      getTodaysLearning(currentlySelectedPlanId, 'new'),
      getTodaysLearning(currentlySelectedPlanId, 'review')
    ])
      .then(([newRes, reviewRes]) => {
        setTodayApiResult({
          new_unit: newRes.new_unit,
          review_units: reviewRes.review_units
        });
      })
      .catch(e => setTodayError(e.message || '加载失败'))
      .finally(() => setTodayLoading(false));
  }, [currentlySelectedPlanId]);

  // 使用新版 hook
  const todayLearningStatus = useTodayLearningStatus(todayApiResult, todayLoading, todayError);

  // prepareAndOpenDialog 相关逻辑，移除 setTodayLearningStatus，改为本地 loading/error 状态
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);

  // --- MODIFIED: Function to fetch data, check local storage, and open dialog ---
  const prepareAndOpenDialog = async () => {
    if (!currentlySelectedPlanId) {
      toast.warning("请先选择一个学习计划。");
      return;
    }

    // 1. Clear previous cache state and set loading for backend fetch
    clearLastLearnedNewUnitCache();
    setDialogLoading(true);
    setDialogError(null);
    setIsStartDialogVisible(true); // Open dialog immediately

    // 2. Check Local Storage for the *last learned new unit*
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
        }
    } catch (error) {
        console.error("Failed to read or parse last learned new unit data from local storage:", error);
    }

    // 3. Fetch next learning state from backend (new and review)
    try {
      const [newData, reviewData] = await Promise.all([
        getTodaysLearning(currentlySelectedPlanId, 'new'),
        getTodaysLearning(currentlySelectedPlanId, 'review')
      ]);

      console.log("Fetched next new unit data from backend:", newData);
      console.log("Fetched pending review units from backend:", reviewData);

      if (
        newData.new_unit &&
        Array.isArray(newData.new_unit.words) &&
        newData.new_unit.words.length > 0
      ) {
        setLastLearnedNewUnitCache({
          unitId: newData.new_unit.id,
          unitNumber: newData.new_unit.unit_number,
          words: newData.new_unit.words as VocabularyWord[],
          timestamp: Date.now()
        });
      }

    } catch (error: any) {
      console.error("Failed to fetch today's learning status:", error);
      toast.error(`获取学习信息失败: ${error.message || '请稍后重试'}`);
      setDialogError("加载失败");
    } finally {
      setDialogLoading(false); // <-- 无论成功失败都关闭 loading
    }
  };

  // Start Learning Handler remains the same
  const handleStartLearning = () => {
    prepareAndOpenDialog();
  };

  // --- navigateToMemorize: Handles navigating with data for the *next* session ---
  // (Mostly unchanged, ensures correct data is passed based on backend fetch results)
  const navigateToMemorize = (mode: 'new' | 'review', unitData: LearningUnit | LearningUnit[] | null) => {
      if (!currentlySelectedPlanId || !unitData) {
          toast.error("无法开始学习：缺少数据。"); return;
      }
      // Ensure studentId exists before navigating
      if (!studentId) {
          toast.error("无法开始学习：缺少学生信息。"); return;
      }

      setIsStartDialogVisible(false);
      let navigationState: any = { mode: mode, planId: currentlySelectedPlanId, isReviewingToday: false };
      let words: VocabularyWord[] = [];
      const targetPath = `/students/${studentId}/memorize`;

      if (mode === 'new' && !Array.isArray(unitData)) {
          // 优先使用缓存
          if (lastLearnedNewUnitCache && lastLearnedNewUnitCache.words && lastLearnedNewUnitCache.words.length > 0) {
              words = lastLearnedNewUnitCache.words;
              navigationState.unitId = lastLearnedNewUnitCache.unitId;
              navigationState.unitNumber = lastLearnedNewUnitCache.unitNumber;
              navigationState.words = words;
              navigationState.isReviewingToday = true; // 标记为温习今日新词
          } else if (unitData.words && unitData.words.length > 0) {
              words = unitData.words;
              navigationState.unitId = unitData.id;
              navigationState.unitNumber = unitData.unit_number;
              navigationState.words = words;
              navigationState.start_word_order = unitData.start_word_order;
              navigationState.end_word_order = unitData.end_word_order;
          } else { toast.error("下一个新学单元无单词。"); return; }
          navigate(targetPath, { state: navigationState });
      } else if (mode === 'review' && Array.isArray(unitData)) {
          const reviewUnits = unitData as LearningUnit[];
          reviewUnits.forEach(unit => { if (unit.words) words = words.concat(unit.words); });
          if (words.length > 0) {
              navigationState.reviewUnits = reviewUnits;
              navigationState.words = words;
              navigate(targetPath, { state: navigationState });
          } else { toast.info("待复习内容无单词。"); }
      } else { console.error("Invalid call to navigateToMemorize"); toast.error("内部错误"); }
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
      console.log(`Navigating to: ${targetPath} to review today's learned unit ${lastLearnedNewUnitCache.unitId} from cache.`);
      console.log('[Students navigateToReviewToday] State before navigation:', lastLearnedNewUnitCache);
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
    console.log('todayLearningStatus:', todayLearningStatus);
    console.log('dialogLoading:', dialogLoading, 'dialogError:', dialogError);
  }, [todayLearningStatus, dialogLoading, dialogError]);

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-sans">
      <Sidebar studentId={studentId} /> {/* Pass studentId to Sidebar */}

      {/* Main Content Area - Updated with Ebbinghaus View */}
      <main className="flex-1 p-6 overflow-y-auto h-screen">
        {currentLearningBook ? (
          // === Ebbinghaus View when a book is selected ===
          <div className="flex flex-col h-full">
            {/* Directly render the plan content, no Tabs needed */}
            <div className="w-full flex-grow flex flex-col"> {/* Removed margin top that was added when removing Tabs */}
              {/* Ebbinghaus Plan Content */}
              <div className="flex-grow"> {/* Removed mt-0 - Keep this outer flex-grow to push card down if main content is empty? Maybe remove? Test removing it */}
                 <Card className="border-gray-200 dark:border-gray-700 shadow-md rounded-xl overflow-hidden bg-white dark:bg-gray-800">
                   <CardContent className="pt-6 px-6 pb-6 flex flex-col">
                     {/* 修改标题部分，添加学生姓名/邮箱显示 */}
                     <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-600"> 
                       <CalendarIcon className="w-5 h-5 text-green-700 dark:text-green-300" />
                       <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                         {isLoadingStudent ? (
                           "加载中..."
                         ) : studentInfo.name ? (
                           `${studentInfo.name}的艾宾浩斯计划`
                         ) : studentInfo.email ? (
                           `${studentInfo.email}的艾宾浩斯计划`
                         ) : (
                           "艾宾浩斯计划"
                         )}
                       </h3>
                     </div>
                     {/* Matrix container - Remove scrollbar classes */}
                     <div> {/* Removed pr-2 and scrollbar-* classes */}
                       {isLoadingMatrix ? (
                         <div className="flex items-center justify-center h-full py-12 text-gray-500">
                           加载矩阵数据中...
                         </div>
                       ) : matrixError ? (
                         <div className="flex items-center justify-center h-full py-12 text-red-500">
                           {matrixError}
                         </div>
                       ) : matrixData ? (
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
                      {/* Legend */}
                      <div className="flex flex-wrap gap-x-4 gap-y-2 items-center justify-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-400">
                        <TooltipProvider delayDuration={100}> {/* Wrap legend items in TooltipProvider */}
                          <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600/50"></div>
                            <span>未学</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-purple-100 dark:bg-purple-800/30 border border-purple-200 dark:border-purple-600"></div>
                            <span>待复习</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-green-50 dark:bg-green-800/30 border border-green-200 dark:border-green-700/50"></div>
                            <span>已完成</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-600/50 border border-gray-300 dark:border-gray-500 opacity-70"></div> {/* Slightly dimmed gray background */}
                            <span className="line-through">list x</span> {/* Text with strikethrough */}
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
                        {/* Add more legend items if needed */}
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
        <Card className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-200">学习词库</CardTitle>
          </CardHeader>
          <CardContent>
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="w-full">
                <Button variant="outline" className="w-full justify-between">
                  <span className="truncate pr-2">{dropdownTriggerText}</span> 
                  <ChevronRightIcon className="w-4 h-4 opacity-50 flex-shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                <DropdownMenuPrimitive.Label className="px-2 py-1.5 text-sm font-semibold">可用词库书 </DropdownMenuPrimitive.Label>
                <div className="px-2 py-1">
                  <Input
                    placeholder="搜索词库..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-8"
                  />
                </div>
                <DropdownMenuPrimitive.Separator className="-mx-1 my-1 h-px bg-muted" />
                <div className="max-h-60 overflow-y-auto">
                  {isLoadingBooks ? (
                    <div className="px-2 py-1.5 text-sm text-gray-500">加载中...</div>
                  ) : bookError ? (
                    <div className="px-2 py-1.5 text-sm text-red-500">{bookError}</div>
                  ) : (
                    <>
                      {filteredDropdownBooks.map((book) => (
                        <DropdownMenuPrimitive.CheckboxItem
                          key={book.id}
                          // Checked state reflects `selectedBooks` from hook.
                          checked={selectedBooks.some(selected => selected.id === book.id)}
                          onCheckedChange={(checked: boolean) => {
                              // MODIFIED: Simplified logic - always use setSelectedBooks from hook
                              // If creating new plan, we need selectedBooks to be populated.
                              if (checked) {
                                // Simple approach: Allow multiple visually, but save logic uses the first.
                                // Alternative: Enforce single selection visually? For now, keep multi.
                                setSelectedBooks((prev: VocabularyBook[]) => [...prev, book]);
                              } else {
                                setSelectedBooks((prev: VocabularyBook[]) => prev.filter((selected: VocabularyBook) => selected.id !== book.id));
                              }
                          }}
                          className="relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                        >
                          <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                            <DropdownMenuPrimitive.ItemIndicator>
                              <CheckCircleIcon className="h-4 w-4" />
                            </DropdownMenuPrimitive.ItemIndicator>
                          </span>
                          <div>
                            <p className="font-semibold text-sm">{book.name}</p>
                            <p className="text-xs text-gray-500">{book.word_count}词</p>
                          </div>
                        </DropdownMenuPrimitive.CheckboxItem>
                      ))}
                      {filteredDropdownBooks.length === 0 && (
                        <p className="px-2 py-1.5 text-sm text-gray-500">未找到可用词库</p>
                      )}
                    </>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* --- MODIFIED: Display ALL Student Plans --- */}
            {isLoadingPlan ? (
                 <p className="mt-4 text-sm text-gray-500">加载学习计划中...</p>
             ) : planError ? (
                 <p className="mt-4 text-sm text-red-500">{planError}</p>
             ) : allStudentPlans.length > 0 ? (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">已有学习计划:</h4>
                {planError && <p className="text-xs text-red-500 mb-2">{planError}</p>}
                <div className="flex flex-wrap gap-2">
                  {allStudentPlans.map((plan) => {
                    // Check if the plan has associated book details
                    if (!plan.vocabulary_book) {
                      console.warn("Plan missing vocabulary book:", plan);
                      return <Badge key={plan.id} variant="destructive" className="text-xs">无效计划 (无词库)</Badge>; // Show an error badge
                    }
                    const isSelected = plan.id === currentlySelectedPlanId; // Check if this plan is the one whose details are shown
                    const isActive = plan.is_active; // Check if this plan is marked as active by the backend

                    return (
                      <Button
                        key={plan.id}
                        variant={isActive ? "default" : "secondary"} // Green if active, grey if inactive
                        size="sm"
                        className={`h-auto font-normal rounded-full px-3 py-1 text-xs transition-colors relative ${
                          isActive
                            ? 'bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'
                            : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-500'
                        } ${isSelected ? 'ring-2 ring-offset-1 ring-blue-500 dark:ring-blue-400' : ''}`} // Add ring if selected
                        onClick={() => handleSelectPlan(plan)} // Select this plan on click
                      >
                        {plan.vocabulary_book.name}
                        {isActive && <CheckCircleIcon className="w-3 h-3 ml-1.5 inline-block" />}
                      </Button>
                    );
                  })}
                </div>

                {/* Input for wordsPerDay - MODIFIED: Show if a plan is selected OR if no plans exist yet */}
                {(currentlySelectedPlanId !== null || allStudentPlans.length === 0) && ( // Show if plan selected OR no plans exist
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <label htmlFor="wordsPerDayInput" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                      每日新词数量:
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="wordsPerDayInput"
                        type="number"
                        // Value: If plan selected, use input state synced to it. If no plans, use input state directly (starts at default).
                        value={inputWordsPerDay}
                        onChange={(e) => setInputWordsPerDay(e.target.value)}
                        min="1"
                        className="h-9 flex-grow"
                        // Disable if loading OR if creating new but no book selected from dropdown
                        disabled={isLoadingPlan || (currentlySelectedPlanId === null && selectedBooks.length === 0)}
                      />
                      <Button
                        size="sm"
                        onClick={handleSaveWordsPerDay}
                        // Disable based on combined logic (or loading state)
                        disabled={!isWordsPerDaySaveEnabled || isLoadingPlan}
                        className="h-9 px-3 flex-shrink-0"
                      >
                        {/* Button text changes based on context */}
                        {isLoadingPlan ? '保存中...' :
                          (currentlySelectedPlanId !== null && selectedBooks.length === 1 && selectedBooks[0].id === currentLearningBook?.id) ? '修改' :
                          '创建计划'
                        }
                      </Button>
                    </div>
                     {/* Show hint when creating new plan */}
                     {currentlySelectedPlanId === null && selectedBooks.length === 0 && (
                         <p className="text-xs text-gray-500 mt-1">请先从上方下拉菜单选择词库书</p>
                     )}
                     {/* Optionally show more details of the selected plan */}
                     {currentlySelectedPlanId !== null && (
                        <p className="text-xs text-gray-500 mt-1">当前计划词库: {currentLearningBook?.name}</p>
                     )}
                     {/* <p className="text-xs text-gray-500 mt-1">开始日期: {allStudentPlans.find(p => p.id === currentlySelectedPlanId)?.start_date}</p> */}
                  </div>
                )}
              </div>
            ) : (
                 // MODIFIED: When no plans exist, still show the dropdown and potentially the input/button below
                 <div className="mt-4">
                     <p className="text-sm text-gray-500">该学生暂无学习计划。</p>
                     {/* Input for wordsPerDay - Also show here if no plans exist */}
                     {(currentlySelectedPlanId === null && allStudentPlans.length === 0) && ( // Explicitly check for no plans case
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <label htmlFor="wordsPerDayInput" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                          每日新词数量 (创建新计划):
                        </label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="wordsPerDayInput"
                            type="number"
                            value={inputWordsPerDay} // Use the independent input state
                            onChange={(e) => setInputWordsPerDay(e.target.value)}
                            min="1"
                            className="h-9 flex-grow"
                             // Disable if loading OR if no book selected from dropdown
                            disabled={isLoadingPlan || selectedBooks.length === 0}
                          />
                          <Button
                            size="sm"
                            onClick={handleSaveWordsPerDay}
                             // Disable based on combined logic (or loading state)
                            disabled={!isWordsPerDaySaveEnabled || isLoadingPlan}
                            className="h-9 px-3 flex-shrink-0"
                          >
                            {isLoadingPlan ? '创建中...' : '创建计划'}
                          </Button>
                        </div>
                        {/* Show hint when creating new plan */}
                        {selectedBooks.length === 0 && (
                           <p className="text-xs text-gray-500 mt-1">请先从上方下拉菜单选择词库书</p>
                        )}
                        {/* Show selected book for creation */}
                        {selectedBooks.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1">为词库: {selectedBooks[0].name} 创建计划</p>
                        )}
                      </div>
                    )}
                 </div>
             )}
          </CardContent>
        </Card>

        {/* === Daily Quests (Now Second) === */}
        <Card className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-200">开始学习</CardTitle>
            <Button 
                size="sm"
                className="h-9 px-3 flex-shrink-0"
                onClick={handleStartLearning}
                disabled={!currentlySelectedPlanId}
             >
                 开始
             </Button>
          </CardHeader>
          <CardContent>
             <div className="flex items-center space-x-4 mb-2">
                <ZapIcon className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />
                <div className="flex-1">
                   <p className="font-semibold text-sm text-gray-700 dark:text-gray-300">获得10点经验值</p>
                   <div className="h-2 mt-1 bg-gray-200 dark:bg-gray-600 rounded-full w-full"><div className="h-full bg-yellow-400 rounded-full" style={{width: '0%'}}></div></div>
                </div>
                <Badge className="bg-gray-600 text-gray-300 border-gray-500">0 / 10</Badge>
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
        {/* ... footer links ... */}
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
                {dialogLoading ? "正在检查学习任务..." :
                 dialogError ? `加载失败: ${dialogError}` :
                 "请选择要进行的学习活动。"
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            {/* Footer with only two main buttons */}
            <AlertDialogFooter className="flex flex-col sm:flex-row sm:justify-end sm:space-x-2">
                {(() => {
                    // 确定第一个按钮的状态 (New/Review Today)
                    const canLearnNextNew = todayLearningStatus.newUnit && !todayLearningStatus.newUnit.is_learned && todayLearningStatus.newUnit.words && todayLearningStatus.newUnit.words.length > 0;
                    const canReviewToday = lastLearnedNewUnitCache && lastLearnedNewUnitCache.words.length > 0;
                    let button1Text = "处理新词"; // Default/intermediate text
                    let button1Action = () => {};
                    // Start assuming disabled if loading or error
                    let button1Disabled = !!(dialogLoading || dialogError);

                    if (dialogLoading) {
                        button1Text = "加载中...";
                        button1Disabled = true;
                    } else if (dialogError) {
                        button1Text = "加载出错"; // Or keep disabled
                        button1Disabled = true; // Explicitly disable on error
                    } else if (canLearnNextNew) {
                        // Priority 1: Backend provides a new unit to learn
                        button1Text = "学习新词";
                        button1Action = () => navigateToMemorize('new', todayLearningStatus.newUnit);
                        button1Disabled = false; // Enable learning
                    } else if (todayLearningStatus.newUnit === null) {
                        // Priority 2: Backend explicitly says NO new units left (all learned)
                        button1Text = "暂无新词"; // Correct state when all new units are done
                        button1Disabled = true; // Disable this path
                        // Note: We ignore canReviewToday here because backend says no more new units.
                    } else if (canReviewToday) {
                        // Priority 3: Backend didn't provide a *learnable* new unit (maybe it exists but is_learned), BUT cache exists
                        button1Text = "温习新词";
                        button1Action = navigateToReviewToday;
                        button1Disabled = false; // Enable reviewing cache
                    } else {
                        // Fallback: No learnable new unit, no cache, maybe newUnit exists but is_learned/empty
                        button1Text = "新词已完成";
                        button1Disabled = true; // Disable
                    }

                    // 确定第二个按钮的状态 (Review Old) remains the same logic
                    const canReviewOld = todayLearningStatus.reviewUnits && todayLearningStatus.reviewUnits.length > 0;
                    const button2Text = canReviewOld ? "复习旧词" : "暂无复习";
                    const button2Action = () => navigateToMemorize('review', todayLearningStatus.reviewUnits);
                    // 如果加载中、错误或没有旧的复习内容可用，则禁用
                    const button2Disabled = dialogLoading || !!dialogError || !canReviewOld; // 确保为布尔值

                    return (
                        <>
                            {/* 按钮 1：学习新词 / 温习新词 / 暂无新词 */}
                            <Button
                                // Variant logic might need adjustment based on the new states
                                variant={canLearnNextNew ? "default" : (canReviewToday && !button1Disabled ? "secondary" : "outline")} // Adjust variant based on action/state
                                onClick={button1Action}
                                disabled={button1Disabled} // Use the calculated disabled state
                                className="w-full sm:w-auto mt-2 sm:mt-0"
                            >
                                {button1Text} {/* Use the calculated text */}
                            </Button>

                            {/* 按钮 2：复习旧词 */}
                            <Button
                                variant="secondary"
                                onClick={button2Action}
                                disabled={button2Disabled}
                                className="w-full sm:w-auto mt-2 sm:mt-0"
                            >
                                {dialogLoading ? "加载中..." : button2Text}
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
                  executeSaveOrUpdatePlan(); // Call the actual save function
                  setIsModifyConfirmDialogVisible(false);
                }}
                // Optional: Add styling for the confirm button, e.g., bg-blue-600
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