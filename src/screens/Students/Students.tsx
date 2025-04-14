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
  ArrowLeft, ArrowRight, Shuffle, Search, Sun, Moon, X
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
    TodayLearningResponse // <-- ADDED Import
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


// 艾宾浩斯遗忘曲线复习周期（天数）
const ebinghausIntervals = [1, 2, 4, 7, 15];

// Interface for the cached new unit data
interface LastLearnedNewUnitCache {
    unitId: number;
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

export const Students = (): JSX.Element => {
  const navigate = useNavigate();
  const { studentId } = useParams<{ studentId: string }>(); // <-- Get studentId from route params
  const { user } = useAuth(); // <-- Keep useAuth for general auth status if needed
  
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
    isLoading: isLoadingBooks, // Renamed to avoid conflict
    vocabularyBooks,
    error: bookError,       // Renamed to avoid conflict
    dropdownTriggerText,
    // saveUserPreferences // Not used directly in handleSave anymore
  } = useVocabulary();
  
  // --- NEW: State for all student plans ---
  const [allStudentPlans, setAllStudentPlans] = useState<LearningPlan[]>([]);
  const [currentlySelectedPlanId, setCurrentlySelectedPlanId] = useState<number | null>(null); // Track which plan is focused in UI

  // State for the input field, separate from the hook's wordsPerDay initially
  const [inputWordsPerDay, setInputWordsPerDay] = useState<string>(String(wordsPerDay));
  const [isLoadingPlan, setIsLoadingPlan] = useState<boolean>(false); // Loading state for fetching plans
  const [planError, setPlanError] = useState<string | null>(null); // Error state for fetching plans

  // --- NEW: State for Dialog ---
  const [isStartDialogVisible, setIsStartDialogVisible] = useState<boolean>(false);
  const [todayLearningStatus, setTodayLearningStatus] = useState<TodayLearningStatus>({
      newUnit: null,
      reviewUnits: null,
      isLoading: false,
      error: null,
  });
  // State specifically for the cached data from local storage
  const [lastLearnedNewUnitCache, setLastLearnedNewUnitCache] = useState<LastLearnedNewUnitCache | null>(null);

  // --- MODIFIED: Fetch ALL student plans ---
  // Wrap fetch logic in useCallback to avoid re-creation on every render
  const fetchStudentPlans = useCallback(async () => {
    if (!studentId) return;
    const studentIdNum = parseInt(studentId, 10);
    if (isNaN(studentIdNum)) {
      setPlanError("无效的学生ID");
      setAllStudentPlans([]); // Clear plans on invalid ID
      setCurrentLearningBook(null); // Clear details
      setWordsPerDay(20); // Reset words per day
      setInputWordsPerDay("20"); // Reset input
      return;
    }

    setIsLoadingPlan(true);
    setPlanError(null);
    try {
      const plans = await getAllPlansForStudent(studentIdNum);
      setAllStudentPlans(plans); // Store all fetched plans

      if (plans.length > 0) {
        // Find the active plan first
        const activePlan = plans.find(p => p.is_active);
        const planToShow = activePlan || plans[0]; // Default to the first plan if no active one

        if (planToShow && planToShow.vocabulary_book) {
          console.log("获取到的学生计划:", plans);
          console.log("将要显示的计划详情:", planToShow);

          const bookDetails: VocabularyBook = {
            id: planToShow.vocabulary_book.id,
            name: planToShow.vocabulary_book.name,
            word_count: planToShow.vocabulary_book.word_count,
            // Add other fields if necessary
          };
          // Update state based on the initially shown plan
          setCurrentLearningBook(bookDetails); // Set book details for viewing
          setWordsPerDay(planToShow.words_per_day); // Set WPD for viewing
          setInputWordsPerDay(String(planToShow.words_per_day)); // Sync input field
          setCurrentlySelectedPlanId(planToShow.id); // Mark this plan as selected in the UI list
          // Update dropdown selection to reflect the current book? Optional.
          // setSelectedBooks([bookDetails]);
        } else {
           console.warn(`学生 ${studentIdNum} 的计划中缺少词库信息`, planToShow);
           // Reset if plan data is incomplete
           setCurrentLearningBook(null);
           setWordsPerDay(20);
           setInputWordsPerDay("20");
           setCurrentlySelectedPlanId(null);
           setPlanError("计划数据不完整");
        }

      } else {
        console.log(`未找到学生 ${studentIdNum} 的任何学习计划`);
        // Reset state if no plans are found
        setCurrentLearningBook(null);
        setWordsPerDay(20); // Reset to default
        setInputWordsPerDay("20"); // Reset input to default
        setCurrentlySelectedPlanId(null);
        // setPlanError("未找到学习计划"); // Not necessarily an error, just none exist
      }
    } catch (error: any) {
      console.error("获取学生计划列表失败:", error);
      setPlanError("获取学生计划列表失败: " + (error.message || "请稍后重试"));
      // Reset state on error
      setAllStudentPlans([]);
      setCurrentLearningBook(null);
      setWordsPerDay(20);
      setInputWordsPerDay(String(wordsPerDay)); // Revert input
      setCurrentlySelectedPlanId(null);
    } finally {
      setIsLoadingPlan(false);
    }
    // Add dependencies for useCallback
  }, [studentId]);


  // Fetch student's plan when component mounts or studentId/fetch function changes
  useEffect(() => {
    console.log(`[Effect] Running fetchStudentPlans for studentId: ${studentId}`);
    fetchStudentPlans();
  }, [studentId, fetchStudentPlans]); // <-- Use the stable fetch function

  // Sync input field if wordsPerDay changes (e.g., when selecting a different plan)
  useEffect(() => {
    setInputWordsPerDay(String(wordsPerDay));
  }, [wordsPerDay]);

  // Function to handle selecting a plan from the list
  const handleSelectPlan = (plan: LearningPlan) => {
    if (plan.vocabulary_book) {
      const bookDetails: VocabularyBook = {
         id: plan.vocabulary_book.id,
         name: plan.vocabulary_book.name,
         word_count: plan.vocabulary_book.word_count,
      };
      setCurrentLearningBook(bookDetails); // Update the book details being viewed
      setWordsPerDay(plan.words_per_day); // Update WPD being viewed
      setInputWordsPerDay(String(plan.words_per_day)); // Sync input
      setCurrentlySelectedPlanId(plan.id); // Mark this plan as selected in the UI
      console.log(`Selected plan ID: ${plan.id}, Book: ${bookDetails.name}`);
    } else {
        console.warn("Selected plan is missing vocabulary book details:", plan);
        toast.error("无法加载计划详情：缺少词库信息。");
    }
  };


  // --- MODIFIED: Handle saving words per day for the currently selected plan OR creating a new plan ---
  const handleSaveWordsPerDay = async () => {
    const newValue = parseInt(inputWordsPerDay, 10);
    const studentIdNum = studentId ? parseInt(studentId, 10) : null;
    // Determine book ID: Use selected plan's book OR the first book from the dropdown if creating new
    let bookIdToSave: number | null = null;

    if (currentlySelectedPlanId !== null && currentLearningBook?.id) {
        bookIdToSave = currentLearningBook.id; // Updating existing selected plan
    } else if (currentlySelectedPlanId === null && selectedBooks.length > 0) {
        // Creating a new plan, use the first selected book from the dropdown
        bookIdToSave = selectedBooks[0].id;
    }

    // Check for valid newValue, studentIdNum, and a book associated with the action
    if (newValue > 0 && studentIdNum && bookIdToSave) {
      // Prepare payload - explicitly set is_active to true
      const planData: any = {
        student_id: studentIdNum,
        vocabulary_book_id: bookIdToSave,
        words_per_day: newValue,
        is_active: true, // New or updated plan becomes active
      };

      // Add start_date ONLY when creating a new plan
      if (currentlySelectedPlanId === null) {
        planData.start_date = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
      }

      console.log("Attempting to save/create plan:", planData);

      try {
        setIsLoadingPlan(true); // Indicate loading during save/create
        await createOrUpdateLearningPlan(planData);
        const actionText = currentlySelectedPlanId ? '更新' : '创建';
        toast.success(`学生 ${studentIdNum} 的学习计划 (${selectedBooks.find(b => b.id === bookIdToSave)?.name || '词库'}) 已${actionText}`);
        // Refresh the plans list to show the new/updated plan
        await fetchStudentPlans(); // Re-fetch plans after successful save/create

      } catch (error: any) {
        console.error("保存或创建计划时出错:", error);
        toast.error(`保存失败: ${error.response?.data?.detail || error.message || '请稍后重试'}`);
        // Revert input based on whether we were updating or trying to create
        if (currentlySelectedPlanId) {
          setInputWordsPerDay(String(wordsPerDay)); // Revert to selected plan's WPD
        } else {
          // Optionally clear input or revert to default if creation failed?
           setInputWordsPerDay("20"); // Revert to default if creation failed
        }
      } finally {
          setIsLoadingPlan(false);
      }
    } else {
      // Handle invalid input or missing data
      if (newValue <= 0) {
         toast.warning("请输入有效的每日单词数量（大于0）。");
         console.warn("无效的每日单词数");
      }
      if (!studentIdNum) {
         toast.error("错误：无效或缺失的学生 ID。");
         console.error("无效或缺失的学生 ID");
      }
       if (!bookIdToSave) {
         // This now means either no plan is selected AND no book is chosen from dropdown
         toast.warning("请先从下拉菜单选择一个词库书。");
         console.warn("没有选择词库书");
      }
       // Reset input to the last known valid value or default
       if (currentlySelectedPlanId) {
         setInputWordsPerDay(String(wordsPerDay));
       } else {
           setInputWordsPerDay("20"); // Reset to default if trying to create without book/valid number
       }
    }
  };

  // --- MODIFIED: Determine if save button should be enabled ---
  const isWordsPerDaySaveEnabled = useMemo(() => {
    const numericValue = parseInt(inputWordsPerDay, 10);
    // Case 1: Updating an existing selected plan
    const isUpdatingEnabled = currentlySelectedPlanId !== null &&
                              numericValue > 0 &&
                              numericValue !== wordsPerDay;
    // Case 2: Creating a new plan (no plan selected, but books available and one selected in dropdown)
    const isCreatingEnabled = currentlySelectedPlanId === null &&
                              allStudentPlans.length === 0 && // Or maybe just currentlySelectedPlanId === null ? Let's stick to explicit no plans yet.
                              selectedBooks.length > 0 && // A book must be selected from dropdown
                              numericValue > 0;

    // Enable if either updating conditions are met OR creation conditions are met.
    return (isUpdatingEnabled || isCreatingEnabled) && !isLoadingPlan;
  }, [inputWordsPerDay, wordsPerDay, currentlySelectedPlanId, selectedBooks, allStudentPlans.length, isLoadingPlan]);

  // Ensure filteredBooks is always an array for the dropdown
  const filteredDropdownBooks = Array.isArray(vocabularyBooks) ? vocabularyBooks : [];

  // --- Derived State: Get the currently selected plan object --- 
  const selectedPlan = useMemo(() => {
      if (!currentlySelectedPlanId) return null;
      return allStudentPlans.find(p => p.id === currentlySelectedPlanId) || null;
  }, [currentlySelectedPlanId, allStudentPlans]);

  // --- Calculate if review is available based on selected plan's units ---
  useEffect(() => {
    if (selectedPlan && selectedPlan.units && Array.isArray(selectedPlan.units)) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize today's date to midnight

      const hasPendingReview = selectedPlan.units.some(unit =>
        unit.reviews && Array.isArray(unit.reviews) &&
        unit.reviews.some(review => {
          if (review.is_completed) return false; // Skip completed reviews
          try {
            const reviewDate = new Date(review.review_date);
            reviewDate.setHours(0, 0, 0, 0); // Normalize review date
            return reviewDate <= today; // Check if review date is today or in the past
          } catch (e) {
            console.error("Error parsing review date:", review.review_date, e);
            return false; // Treat invalid dates as not reviewable for safety
          }
        })
      );
      setTodayLearningStatus({
        newUnit: null,
        reviewUnits: hasPendingReview ? selectedPlan.units.filter(unit =>
          unit.reviews && Array.isArray(unit.reviews) &&
          unit.reviews.some(review => !review.is_completed)
        ) : null,
        isLoading: false,
        error: null,
      });
      console.log(`Review available check for plan ${selectedPlan.id}: ${hasPendingReview}.`);
    } else {
      setTodayLearningStatus({
        newUnit: null,
        reviewUnits: null,
        isLoading: false,
        error: null,
      });
      console.log("No selected plan or units, review not available.");
    }
  }, [selectedPlan]); // Re-run when the selected plan changes

  // --- MODIFIED: Function to fetch data, check local storage, and open dialog ---
  const prepareAndOpenDialog = async () => {
    if (!currentlySelectedPlanId) {
      toast.warning("请先选择一个学习计划。");
      return;
    }

    // 1. Clear previous cache state and set loading for backend fetch
    setLastLearnedNewUnitCache(null);
    setTodayLearningStatus({ newUnit: null, reviewUnits: null, isLoading: true, error: null });
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

      setTodayLearningStatus({
        newUnit: newData.new_unit, // This is the *next* unit to learn (could be null or learned)
        reviewUnits: reviewData.review_units, // These are pending reviews
        isLoading: false, // Backend fetch complete
        error: null,
      });

    } catch (error: any) {
      console.error("获取今日学习状态失败:", error);
      toast.error(`获取学习信息失败: ${error.message || '请稍后重试'}`);
      setTodayLearningStatus({
        newUnit: null,
        reviewUnits: null,
        isLoading: false, // Fetch failed
        error: "加载失败",
      });
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
      const targetPath = `/students/${studentId}/memorize`; // <-- USE NEW PATH

      if (mode === 'new' && !Array.isArray(unitData)) {
          const newUnit = unitData as LearningUnit;
          if (newUnit.words && newUnit.words.length > 0) {
              words = newUnit.words;
              navigationState.unitId = newUnit.id;
              navigationState.words = words;
              // 添加单词的起始序号和结束序号到路由状态
              navigationState.start_word_order = newUnit.start_word_order;
              navigationState.end_word_order = newUnit.end_word_order;
              console.log(`Navigating to: ${targetPath} to learn NEXT new unit ${newUnit.id} with word range: ${newUnit.start_word_order}-${newUnit.end_word_order}`);
              navigate(targetPath, { state: navigationState }); // <-- USE NEW PATH
          } else { toast.error("下一个新学单元无单词。"); }
      } else if (mode === 'review' && Array.isArray(unitData)) {
          const reviewUnits = unitData as LearningUnit[];
          reviewUnits.forEach(unit => { if (unit.words) words = words.concat(unit.words); });
          if (words.length > 0) {
              // words = Array.from(new Map(words.map(w => [w.id, w])).values()); // Optional dedupe
              navigationState.reviewUnits = reviewUnits;
              navigationState.words = words;
              console.log(`Navigating to: ${targetPath} to review ${words.length} old words.`);
              navigate(targetPath, { state: navigationState }); // <-- USE NEW PATH
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
      navigate(targetPath, { // <-- USE NEW PATH
          state: {
              words: lastLearnedNewUnitCache.words,
              mode: 'new',
              planId: currentlySelectedPlanId,
              unitId: lastLearnedNewUnitCache.unitId,
              isReviewingToday: true
          }
      });
  };

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
                     {/* Moved and restyled the header */}
                     <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-600"> 
                       <CalendarIcon className="w-5 h-5 text-green-700 dark:text-green-300" />
                       <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">艾宾浩斯计划</h3>
                     </div>
                     {/* Matrix container - Remove scrollbar classes */}
                     <div> {/* Removed pr-2 and scrollbar-* classes */}
                       {selectedPlan && currentLearningBook ? (
                         <EbinghausMatrix 
                           days={selectedPlan.total_days || 0} // Use days from the selected plan, provide default
                           totalWords={currentLearningBook.word_count}
                           wordsPerDay={wordsPerDay}
                           onSelectUnit={(unit) => console.log('Selected Unit:', unit)} // Placeholder handler, now receives LearningUnit
                           ebinghausIntervals={ebinghausIntervals}
                           learningUnits={selectedPlan.units || []} // <--- Pass the detailed units here
                         />
                       ) : (
                         <div className="flex items-center justify-center h-full text-gray-500">
                             {isLoadingPlan ? "加载计划中..." : "请先选择一个计划以查看艾宾浩斯矩阵。"}
                         </div>
                       )}
                     </div>
                      {/* Legend */}
                      <div className="flex flex-wrap gap-x-4 gap-y-2 items-center justify-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-400"> 
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600/50"></div> 
                          <span>新学</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-purple-100 dark:bg-purple-800/30 border border-purple-200 dark:border-purple-600"></div> 
                          <span>待复习</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-green-50 dark:bg-green-800/30 border border-green-200 dark:border-green-700/50"></div> 
                          <span>已完成</span>
                        </div>
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
                        {isLoadingPlan ? '保存中...' : (currentlySelectedPlanId ? '保存' : '创建计划')}
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
                {todayLearningStatus.isLoading ? "正在检查学习任务..." :
                 todayLearningStatus.error ? `加载失败: ${todayLearningStatus.error}` :
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
                    let button1Text = "处理新词";
                    let button1Action = () => {};
                    let button1Disabled = !!(todayLearningStatus.isLoading || todayLearningStatus.error); // 确保为布尔值

                    // 优先考虑后台返回的未完成新词单元
                    if (canLearnNextNew) {
                        button1Text = "学习新词";
                        button1Action = () => navigateToMemorize('new', todayLearningStatus.newUnit);
                        button1Disabled = todayLearningStatus.isLoading || !!todayLearningStatus.error;
                    } else if (canReviewToday) {
                        button1Text = "温习新词";
                        button1Action = navigateToReviewToday;
                        button1Disabled = todayLearningStatus.isLoading;
                    } else {
                        button1Text = "新词已完成";
                        button1Disabled = true;
                    }

                    // 确定第二个按钮的状态 (Review Old)
                    const canReviewOld = todayLearningStatus.reviewUnits && todayLearningStatus.reviewUnits.length > 0;
                    const button2Text = canReviewOld ? "复习旧词" : "暂无复习";
                    const button2Action = () => navigateToMemorize('review', todayLearningStatus.reviewUnits);
                    // 如果加载中、错误或没有旧的复习内容可用，则禁用
                    const button2Disabled = todayLearningStatus.isLoading || !!todayLearningStatus.error || !canReviewOld; // 确保为布尔值

                    return (
                        <>
                            {/* 按钮 1：学习新词 / 温习新词 */}
                            <Button
                                variant={canLearnNextNew ? "default" : "secondary"} // 如果有新词，突出显示
                                onClick={button1Action}
                                disabled={button1Disabled}
                                className="w-full sm:w-auto mt-2 sm:mt-0"
                            >
                                {todayLearningStatus.isLoading ? "加载中..." : button1Text}
                            </Button>

                            {/* 按钮 2：复习旧词 */}
                            <Button
                                variant="secondary"
                                onClick={button2Action}
                                disabled={button2Disabled}
                                className="w-full sm:w-auto mt-2 sm:mt-0"
                            >
                                {todayLearningStatus.isLoading ? "加载中..." : button2Text}
                            </Button>
                        </>
                    );
                })()}
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};  