import { 
  CalendarIcon,
  X
} from "lucide-react";
import React, { useState, useMemo, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card"; // Added CardHeader, CardTitle
import { useNavigate, useParams } from "react-router-dom";
import { Sidebar } from "./StudentsSidebar"; // Import the shared sidebar
import { DuolingoStudyPlan } from "../../components/StudyPlan/DuolingoStudyPlan"; // <-- Add DuolingoStudyPlan import
import { useVocabulary } from "../../hooks/useVocabulary"; // 导入自定义 hook and type
import { toast } from "sonner"; // Assuming you use sonner for notifications
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog"; // <-- Import AlertDialog components (FIXED PATH)

import { useStudentInfo } from '../../hooks/useStudentInfo'; // <-- This hook is now React Query based
import { useStudentPlans } from '../../hooks/useStudentPlans';
import { StudentPlanProvider } from '../../context/StudentPlanContext';
import { getWordsWithStages, WordStage } from "../../services/learningApi";


const stageIntervals = [0, 1, 1, 2, 3, 7]; // 复习间隔天数

// Helper function to add days to a date string
function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

// 判断单词今日是否可复习
function canReview(word: WordStage, today: string): boolean {
  const stage = word.currentStage;

  // Stage 0 为新学；Stage >5 视为已掌握，不参与复习
  if (stage === 0 || stage > 5) return false;

  // 优先使用后端直接给出的下次复习日期（字段名可能是 nextReviewDate 或 next）
  const rawNext = (word as any).nextReviewDate || (word as any).next || (word as any).next_review_date;
  if (rawNext) {
    // 统一取前 10 位 YYYY-MM-DD
    const nextDate = ('' + rawNext).slice(0, 10);
    return today >= nextDate;
  }

  // 兼容旧数据：根据 stageHistory 推算
  const lastCompleted = word.stageHistory?.find(h => h.stage === stage - 1)?.completedAt || word.startDate;
  const intervalDays = stageIntervals[stage] ?? 0;
  const nextAvailableDate = addDays(lastCompleted.slice(0, 10), intervalDays);
  return today >= nextAvailableDate;
}


const StudentsInner = (): JSX.Element => {
  const navigate = useNavigate();
  const { studentId } = useParams<{ studentId: string }>();

  const {
    studentInfo,
    isLoadingStudent,
    studentError,
  } = useStudentInfo(studentId);
  
  const {
    currentLearningBook,
    setCurrentLearningBook,
  } = useVocabulary();
  
  const {
    allStudentPlans,
    currentlySelectedPlanId,
  } = useStudentPlans(studentId);
  
  const [isStartDialogVisible, setIsStartDialogVisible] = useState<boolean>(false);
  const [todaysWords, setTodaysWords] = useState<WordStage[]>([]);
  const [isLoadingWords, setIsLoadingWords] = useState<boolean>(false);
  const [wordsError, setWordsError] = useState<Error | null>(null);

  useEffect(() => {
    if (currentlySelectedPlanId) {
      const fetchWords = async () => {
        setIsLoadingWords(true);
        setWordsError(null);
        try {
          const words = await getWordsWithStages(currentlySelectedPlanId);
          setTodaysWords(words);
        } catch (error) {
          setWordsError(error as Error);
          toast.error("加载学习单词失败。");
        } finally {
          setIsLoadingWords(false);
        }
      };
      fetchWords();
    } else {
      setTodaysWords([]);
    }
  }, [currentlySelectedPlanId]);

  const selectedPlan = useMemo(() => {
      if (!currentlySelectedPlanId || !allStudentPlans) return null;
      return allStudentPlans.find(p => p.id === currentlySelectedPlanId) || null;
  }, [currentlySelectedPlanId, allStudentPlans]);

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
      <Sidebar studentId={studentId} />

      <div className="flex-1 flex flex-col bg-duo-bg">
        <main className="flex-1 p-6 overflow-y-auto bg-duo-bg">
          <div className="flex flex-col h-full">
            <div className="w-full flex-grow flex flex-col">
              <div className="flex-grow flex flex-col">
                <Card className="flex flex-col flex-grow h-full max-h-[calc(100vh-48px)] bg-transparent border-0 shadow-none p-0 relative">
                  <CardContent className="flex flex-col flex-grow h-full p-0">
                    <div
                      className="flex items-center gap-2 mb-4 px-5 py-3 rounded-2xl shadow-lg bg-duo-green border border-duo-green"
                    >
                      <CalendarIcon className="w-8 h-8 text-white animate-pulse" /> 
                      <h3 className="text-2xl font-bold text-white font-playful-font tracking-wider leading-tight">
                        {isLoadingStudent ? (
                          "加载中..."
                        ) : studentInfo ? (
                          studentInfo.name ? (
                            <div className="flex flex-col items-start">
                              <span className="text-sm text-white font-bold drop-shadow-lg">
                                {studentInfo.name}
                              </span>
                              <span className="pl-8">的艾宾浩斯学习计划</span>
                            </div>
                          ) : studentInfo.email ? (
                            <div className="flex flex-col items-start">
                              <span className="text-xl text-white font-bold drop-shadow-lg">
                                {studentInfo.email}
                              </span>
                              <span className="pl-8">的艾宾浩斯学习计划</span>
                            </div>
                          ) : (
                            <span>艾宾浩斯学习计划</span>
                          )
                        ) : studentError ? (
                          <span className="text-red-500 text-sm">加载学生信息出错</span>
                        ) : (
                          <span>艾宾浩斯学习计划</span>
                        )}
                      </h3>
                    </div>
                    {/* Study Plan container - Conditional rendering */}
                    {isLoadingWords ? (
                      <div className="flex justify-center items-center h-full">
                        <p className="text-duo-textSecondary">正在加载艾宾浩斯学习计划...</p>
                      </div>
                    ) : !currentlySelectedPlanId ? (
                      <div className="flex justify-center items-center h-full">
                        <p className="text-duo-textSecondary">该学生暂无艾宾浩斯学习计划。</p>
                      </div>
                    ) : (
                      <div className="flex-grow flex flex-col min-h-0">
                        <div className="flex-1 min-h-0">
                          <div className="h-full overflow-y-auto scrollbar-hide relative">
                            <DuolingoStudyPlan 
                              words={todaysWords}
                              today={new Date().toISOString().split('T')[0]}
                              studentId={studentId}
                              studentPlans={allStudentPlans || []}
                              currentlySelectedPlanId={currentlySelectedPlanId}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>

        <footer className="bg-duo-white p-4 border-t-2 border-duo-grayLight shadow-sm">
            <div className="flex items-center justify-center gap-4">
              {(() => {
                const isLoading = isLoadingWords;
                const errorOccurred = !!wordsError;
                const allWords = todaysWords || [];

                // 右侧按钮："复习所有到期单词"，仅统计阶段 >0 的单词（排除待学）
                const reviewableWords = allWords.filter(
                  w => w.currentStage > 0 && canReview(w, new Date().toISOString().split('T')[0])
                );
                const reviewWordsAvailable = reviewableWords.length;
                const canReviewOld = reviewWordsAvailable > 0;

                // 左侧按钮："添加新词"
                const addWordsBtnAction = () => {
                  // 获取当前计划的词库ID
                  const currentPlan = allStudentPlans?.find(plan => plan.id === currentlySelectedPlanId);
                  const vocabularyBookId = currentPlan?.vocabulary_book?.id;
                  
                  navigate(`/study/${studentId}`, {
                    state: {
                      fromStudyPlan: true,
                      mode: 'new',
                      planId: currentlySelectedPlanId,
                      vocabularyBookId: vocabularyBookId,
                      stageTitle: '学习新词',
                    }
                  });
                };
                // 只要有计划就可以为学生添加新词
                const addWordsBtnDisabled = !currentlySelectedPlanId;

                // 复习单词按钮状态
                const reviewBtnText = canReviewOld ? `复习单词 (${reviewWordsAvailable})` : "暂无复习";
                const reviewBtnAction = () => {
                  // 获取当前计划的词库ID
                  const currentPlan = allStudentPlans?.find(plan => plan.id === currentlySelectedPlanId);
                  const vocabularyBookId = currentPlan?.vocabulary_book?.id;
                  
                  navigate(`/study/${studentId}`, {
                    state: {
                      fromStudyPlan: true,
                      mode: 'review',
                      planId: currentlySelectedPlanId,
                      vocabularyBookId: vocabularyBookId,
                      wordTexts: reviewableWords.map(w => w.word), // 传递需要复习的单词文本
                      stageTitle: '复习单词',
                    }
                  });
                };
                const reviewBtnDisabled = isLoading || errorOccurred || !canReviewOld;

                return (
                  <>
                    {/* 添加新词按钮 */}
                    <button
                      onClick={addWordsBtnAction}
                      disabled={addWordsBtnDisabled}
                      className="flex-1 max-w-xs py-3 px-6 rounded-2xl font-semibold transition-colors duration-150 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-duo-green text-white hover:bg-duo-green/90 focus:ring-duo-green/50"
                    >
                      学习新词
                    </button>

                    {/* 复习单词按钮 */}
                    <button
                      onClick={reviewBtnAction}
                      disabled={reviewBtnDisabled}
                      className={`flex-1 max-w-xs py-3 px-6 rounded-2xl font-semibold transition-colors duration-150 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                        canReviewOld
                          ? "bg-duo-grayLight text-duo-textPrimary hover:bg-duo-grayMedium focus:ring-duo-grayMedium/50"
                          : "border-2 border-duo-grayMedium text-duo-grayMedium"
                      }`}
                    >
                      {isLoading ? "加载中..." : reviewBtnText}
                    </button>
                  </>
                );
              })()}
            </div>
          </footer>
      </div>
      
      <AlertDialog open={isStartDialogVisible} onOpenChange={setIsStartDialogVisible}>
        <AlertDialogContent className="bg-duo-white border-duo-grayMedium">
          <div className="relative">
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
                {isLoadingWords ? "正在检查学习任务..." :
                 wordsError ? `加载失败: ${wordsError.message}` :
                 "请选择要进行的学习活动。"
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-col sm:flex-row sm:justify-end sm:space-x-2">
                {(() => {
                    const isLoading = isLoadingWords;
                    const errorOccurred = !!wordsError;
                    const data = todaysWords;

                    const todayStr = new Date().toISOString().split('T')[0];

                    const newWordsAvailable = data?.filter(w => w.currentStage === 0).length || 0;
                    const reviewWordsList = data?.filter(
                      w => w.currentStage > 0 && canReview(w, todayStr)
                    ) || [];
                    const reviewWordsAvailable = reviewWordsList.length;
                    const canLearnNextNew = newWordsAvailable > 0;
                    const canReviewOld = reviewWordsAvailable > 0;

                    let button1Text = "处理新词";
                    let button1Action = () => {};
                    let button1Disabled = !!(isLoading || errorOccurred);

                    if (isLoading) { button1Text = "加载中..."; button1Disabled = true; }
                    else if (errorOccurred) { button1Text = "加载出错"; button1Disabled = true; }
                    else if (canLearnNextNew) { 
                        button1Text = `学习新词 (${newWordsAvailable})`; 
                        button1Action = () => {
                            setIsStartDialogVisible(false);
                            // 获取当前计划的词库ID
                            const currentPlan = allStudentPlans?.find(plan => plan.id === currentlySelectedPlanId);
                            const vocabularyBookId = currentPlan?.vocabulary_book?.id;
                            
                            navigate(`/students/${studentId}/memorize`, {
                                state: {
                                    planId: currentlySelectedPlanId,
                                    vocabularyBookId: vocabularyBookId,
                                    mode: 'new',
                                    stage: 0,
                                    words: data?.filter(w => w.currentStage === 0) || [],
                                }
                            });
                        };
                        button1Disabled = false; 
                    }
                    else { button1Text = "暂无新词"; button1Disabled = true; }

                    const button2Text = canReviewOld ? `复习单词 (${reviewWordsAvailable})` : "暂无复习";
                    const button2Action = () => {
                        setIsStartDialogVisible(false);
                        // 获取当前计划的词库ID
                        const currentPlan = allStudentPlans?.find(plan => plan.id === currentlySelectedPlanId);
                        const vocabularyBookId = currentPlan?.vocabulary_book?.id;
                        
                        navigate(`/students/${studentId}/memorize`, {
                            state: {
                                planId: currentlySelectedPlanId,
                                vocabularyBookId: vocabularyBookId,
                                mode: 'review',
                                words: data?.filter(w => w.currentStage > 0) || [],
                            }
                        });
                    };
                    const button2Disabled = isLoading || errorOccurred || !canReviewOld;

                    return (
                        <>
                            <Button
                                variant={canLearnNextNew ? "default" : "outline"}
                                onClick={button1Action}
                                disabled={button1Disabled}
                                className={`w-full sm:w-auto mt-2 sm:mt-0 ${canLearnNextNew ? 'bg-duo-green text-white hover:bg-duo-green' : 'border-duo-green text-duo-green hover:bg-duo-grayLight'}`}
                            >
                                {button1Text}
                            </Button>

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

    </div>
  );
};

export const Students = () => (
  <StudentPlanProvider>
    <StudentsInner />
  </StudentPlanProvider>
);  