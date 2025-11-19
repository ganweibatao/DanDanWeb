import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchKnownWordsCached } from '../../services/api';

// --- 新增：词书接口定义 ---
interface VocabularyBook {
  id: number;
  name: string;
  description?: string | null;
  word_count: number;
  cover_image?: string | null;
}

// --- 新增：学习计划接口定义 ---
interface LearningPlan {
  id: number;
  vocabulary_book: VocabularyBook;
  start_date: string;
  is_active: boolean;
  total_days: number;
  progress: number;
  created_at: string;
  updated_at: string;
}

interface StudyStageProps {
  title: string;
  count: number;
  isNew?: boolean;
  className?: string; // Kept for potential future use, but won't be used for pt- classes now
  forceInactive?: boolean;
}

const StageCircle: React.FC<StudyStageProps> = ({ title, count, isNew, className, forceInactive }) => {
  const isActive = !forceInactive && count > 0;
  const activeBgColor = 'bg-duo-green';
  const inactiveBgColor = 'bg-duo-grayLight';
  const activeHoverBgColor = 'hover:bg-duo-green/80';
  const inactiveHoverBgColor = 'hover:bg-duo-grayMedium';

  const bgColor = isActive ? activeBgColor : inactiveBgColor;
  const hoverBgColor = isActive ? activeHoverBgColor : inactiveHoverBgColor;
  const textColor = isActive ? 'text-white' : 'text-duo-grayDark';
  const statusTextColor = isActive ? 'text-white/90' : 'text-duo-grayDark/90';
  // 仅在新词且可学习时显示"待学习"，其他情况不显示状态文本
  const statusText = isNew && isActive ? '待学习' : '';

  return (
    // className prop is still accepted but won't receive pt- classes from parent
    <div className={`flex flex-col items-center text-center flex-shrink-0 
                    w-24 md:w-28 lg:w-32 
                    mx-2 lg:mx-3 ${className || ''}`}>
      <div
        className={`w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 
                   rounded-xl 
                   flex flex-col items-center justify-around 
                   p-2 
                   shadow-lg 
                   ${bgColor} ${hoverBgColor} ${textColor} 
                   transition-colors duration-300 ease-in-out 
                   mb-2 cursor-pointer`}
      >
        <span className="text-lg md:text-xl lg:text-2xl font-semibold leading-tight text-center">{title}</span>
        <span className="text-2xl md:text-3xl lg:text-xl leading-none">{count}</span>
        <span className={`text-xs leading-tight ${statusTextColor} hidden md:block`}>{statusText}</span>
      </div>
    </div>
  );
};

interface Word {
  word: string;
  startDate: string; // "2024-02-03"
  currentStage: number; // 0~5
  stageHistory: { stage: number; completedAt: string }[];
  nextReviewDate?: string; // 新增：后端直接给出的下次复习日期，可选
}

interface DuolingoStudyPlanProps {
  words: Word[];
  today: string;
  studentPlans?: LearningPlan[];
  onStartLearning?: (planId: number, vocabularyBookId: number) => void;
  studentId?: string;
  currentlySelectedPlanId?: number | null;
}


function canReview(word: Word, stage: number, today: string) {
  if (stage === 0) return true; // 新词随时可学

  // 仅使用后端返回的下一次复习日期判断是否可复习
  const providedNextDate = word.nextReviewDate || (word as any).next_review_date;
  if (!providedNextDate) {
    // 若后端没有给出日期，则默认为不可复习
    if (process.env.NODE_ENV !== 'production') {
      // console.warn(
      //   `[canReview] word=${word.word} stage=${stage} 缺少 nextReviewDate，视为不可复习`
      // );
    }
    return false;
  }

  const normalized = providedNextDate.slice(0, 10); // YYYY-MM-DD
  const res = today >= normalized;
  if (process.env.NODE_ENV !== 'production') {
    // console.log(
    //   `[canReview] word=${word.word} stage=${stage} today=${today} nextDate=${normalized} => ${res}`
    // );
  }
  return res;
}

export const DuolingoStudyPlan: React.FC<DuolingoStudyPlanProps> = ({
  words,
  today,
  studentPlans = [],
  studentId,
  currentlySelectedPlanId,
}) => {
  const navigate = useNavigate();
  
  // 根据 words 数组自动计算各个 stage 的单词数量
  const safeWords = Array.isArray(words) ? words : [];
  // 各阶段总数
  const totalStage0 = safeWords.filter(w => w.currentStage === 0).length;
  const totalStage1 = safeWords.filter(w => w.currentStage === 1).length;
  const totalStage2 = safeWords.filter(w => w.currentStage === 2).length;
  const totalStage3 = safeWords.filter(w => w.currentStage === 3).length;
  const totalStage4 = safeWords.filter(w => w.currentStage === 4).length;
  const totalStage5 = safeWords.filter(w => w.currentStage === 5).length;

  // 当前可复习数量（决定颜色）
  const reviewable1 = safeWords.filter(w => w.currentStage === 1 && canReview(w, 1, today)).length;
  const reviewable2 = safeWords.filter(w => w.currentStage === 2 && canReview(w, 2, today)).length;
  const reviewable3 = safeWords.filter(w => w.currentStage === 3 && canReview(w, 3, today)).length;
  const reviewable4 = safeWords.filter(w => w.currentStage === 4 && canReview(w, 4, today)).length;
  const reviewable5 = safeWords.filter(w => w.currentStage === 5 && canReview(w, 5, today)).length;


  const stages = [
    { title: '待学', count: totalStage0, isNew: true, forceInactive: totalStage0 === 0 },
    { title: '第 1 轮', count: totalStage1, forceInactive: reviewable1 === 0 },
    { title: '第 2 轮', count: totalStage2, forceInactive: reviewable2 === 0 },
    { title: '第 3 轮', count: totalStage3, forceInactive: reviewable3 === 0 },
    { title: '第 4 轮', count: totalStage4, forceInactive: reviewable4 === 0 },
    { title: '第 5 轮', count: totalStage5, forceInactive: reviewable5 === 0 },
  ];

  const [showModal, setShowModal] = useState(false);
  const [modalStage, setModalStage] = useState<number | null>(null);

  // 获取当前选中的计划
  const currentSelectedPlan = React.useMemo(() => {
    if (!currentlySelectedPlanId || !studentPlans || studentPlans.length === 0) {
      return studentPlans?.find(plan => plan.is_active) || studentPlans?.[0] || null;
    }
    return studentPlans.find(plan => plan.id === currentlySelectedPlanId) || null;
  }, [currentlySelectedPlanId, studentPlans]);

  // 计算总词数、已选词数、未选生词数，以及已掌握词数
  const totalWords = currentSelectedPlan?.vocabulary_book.word_count || 0;
  const selectedWordsCount = safeWords.length;
  // 本地估算的已掌握数量（>5 代表完成所有复习轮）
  const localMasteredCount = safeWords.filter(w => w.currentStage > 5).length;

  // 远程已掌握数量（从 known-words 接口获取）
  const [knownWordsCount, setKnownWordsCount] = useState<number | null>(null);

  // 计算生词数量（需扣除熟词库单词）
  const masteredCountFromApi = knownWordsCount !== null ? knownWordsCount : localMasteredCount;
  const extraMasteredOutsideStages = Math.max(masteredCountFromApi - localMasteredCount, 0);
  const unselectedCount = Math.max(totalWords - selectedWordsCount - extraMasteredOutsideStages, 0);

  // 当 studentId 或当前词书变化时，重新获取熟词数量
  useEffect(() => {
    const bookId = currentSelectedPlan?.vocabulary_book?.id;
    if (!studentId || !bookId) return;

    const stuIdNum = Number(studentId);
    if (Number.isNaN(stuIdNum)) return;

    (async () => {
      try {
        const response = await fetchKnownWordsCached(stuIdNum, bookId);
        setKnownWordsCount(response.count || 0);
      } catch (err) {
        console.error('[DuolingoStudyPlan] 获取已掌握单词数量失败:', err);
        // 保持现有值，避免 UI 抖动
      }
    })();
  }, [studentId, currentSelectedPlan]);

  // 点击轮次
  const handleStageClick = (stageIndex: number) => {
    // 仍然展示弹窗，让用户查看单词后再决定"学习"
    setModalStage(stageIndex);
    setShowModal(true);
  };

  // 过滤单词
  const getWordsByStage = (stage: number) => {
    const safeWords = Array.isArray(words) ? words : [];
    const wordsInStage = safeWords.filter(w => w.currentStage === stage);
    const canReviewWords = wordsInStage.filter(w => canReview(w, stage, today));
    const cannotReviewWords = wordsInStage.filter(w => !canReview(w, stage, today));
    return { canReviewWords, cannotReviewWords };
  };


  return (
    <div className="p-4 md:p-6 lg:p-8 bg-duo-bg rounded-lg md:rounded-xl lg:rounded-2xl max-w-full">
      


      {/* 桌面大屏布局 - 改为带侧边栏的网格布局 */}
      <div className="hidden lg:block">
        <div className="flex gap-8 max-w-6xl mx-auto items-center">
          {/* 左侧：生词库信息方框 */}
          <div className="w-64 flex-shrink-0 relative">
            <div className="bg-white rounded-xl shadow-sm p-6">
              {/* 生词库部分 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">生词库</h3>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700 truncate flex-1 mr-2">
                    {currentSelectedPlan?.vocabulary_book.name || '词汇书'}
                  </span>
                  <span className="text-sm font-medium text-duo-green flex-shrink-0">
                    {unselectedCount}/{totalWords}
                  </span>
                </div>
              </div>
              
              {/* 分隔线 */}
              <div className="border-t-2 border-gray-200 my-4"></div>
              
              {/* 熟悉库部分 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">熟词库</h3>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700 truncate flex-1 mr-2">
                    {currentSelectedPlan?.vocabulary_book.name || '词汇书'}
                  </span>
                  <span className="text-sm font-medium text-duo-green flex-shrink-0">
                    {`${(knownWordsCount !== null ? knownWordsCount : localMasteredCount)}/${totalWords}`}
                  </span>
                </div>
              </div>
            </div>
            

          </div>
          
          {/* 右侧：学习计划网格 */}
          <div className="flex-1">
            <div className="grid grid-cols-3 gap-x-8 gap-y-12 relative">
          {/* 第一行：新词 -> 第1轮 -> 第2轮 */}
          <div className="flex flex-col items-center">
            <div onClick={() => handleStageClick(0)}>
              <StageCircle
                title={stages[0].title}
                count={stages[0].count}
                isNew={stages[0].isNew}
                forceInactive={stages[0].forceInactive}
              />
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div onClick={() => handleStageClick(1)}>
              <StageCircle
                title={stages[1].title}
                count={stages[1].count}
                isNew={stages[1].isNew}
                forceInactive={stages[1].forceInactive}
              />
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div onClick={() => handleStageClick(2)}>
              <StageCircle
                title={stages[2].title}
                count={stages[2].count}
                isNew={stages[2].isNew}
                forceInactive={stages[2].forceInactive}
              />
            </div>
          </div>
          
          {/* 水平箭头容器 - 新词到第1轮 */}
          <div className="absolute top-1/4 left-1/3 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
            {/* 间隔时间标注 */}
            <div className="text-sm md:text-base text-duo-grayMedium font-medium mb-1 whitespace-nowrap">
              新学
            </div>
            {/* 箭头 */}
            <div className="flex items-center">
              <div className="w-6 h-0.5 bg-duo-grayMedium opacity-75"></div>
              <svg 
                width="16" 
                height="16"
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M13.1727 12L8.22266 7.04999L9.63766 5.63599L16.0027 12L9.63766 18.364L8.22266 16.95L13.1727 12Z" 
                      fill="currentColor" 
                      className="text-duo-grayMedium opacity-75"/>
              </svg>
            </div>
          </div>
          
          {/* 水平箭头容器 - 第1轮到第2轮 */}
          <div className="absolute top-1/4 left-2/3 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
            {/* 间隔时间标注 */}
            <div className="text-sm md:text-base text-duo-grayMedium font-medium mb-1 whitespace-nowrap">
              复习
            </div>
            {/* 箭头 */}
            <div className="flex items-center">
              <div className="w-6 h-0.5 bg-duo-grayMedium opacity-75"></div>
              <svg 
                width="16" 
                height="16"
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M13.1727 12L8.22266 7.04999L9.63766 5.63599L16.0027 12L9.63766 18.364L8.22266 16.95L13.1727 12Z" 
                      fill="currentColor" 
                      className="text-duo-grayMedium opacity-75"/>
              </svg>
            </div>
          </div>
          
          {/* 垂直箭头容器 - 第2轮到第3轮 */}
          <div className="absolute top-1/2 left-[83.333333%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
            {/* 箭头 */}
            <div className="flex flex-col items-center relative">
              <div className="w-0.5 h-6 bg-duo-grayMedium opacity-75"></div>
              <svg 
                width="16" 
                height="16"
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="rotate-90"
              >
                <path d="M13.1727 12L8.22266 7.04999L9.63766 5.63599L16.0027 12L9.63766 18.364L8.22266 16.95L13.1727 12Z" 
                      fill="currentColor" 
                      className="text-duo-grayMedium opacity-75"/>
              </svg>
              {/* 间隔时间标注 */}
              <div className="absolute top-1/2 left-full ml-2 transform -translate-y-1/2 text-sm md:text-base text-duo-grayMedium font-medium whitespace-nowrap">
                复习
              </div>
            </div>
          </div>
          
                    {/* 第二行：第5轮 <- 第4轮 <- 第3轮 */}
          <div className="flex flex-col items-center">
            <div onClick={() => handleStageClick(5)}>
              <StageCircle
                title={stages[5].title}
                count={stages[5].count}
                isNew={stages[5].isNew}
                forceInactive={stages[5].forceInactive}
              />
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div onClick={() => handleStageClick(4)}>
              <StageCircle
                title={stages[4].title}
                count={stages[4].count}
                isNew={stages[4].isNew}
                forceInactive={stages[4].forceInactive}
              />
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div onClick={() => handleStageClick(3)}>
              <StageCircle
                title={stages[3].title}
                count={stages[3].count}
                isNew={stages[3].isNew}
                forceInactive={stages[3].forceInactive}
              />
            </div>
          </div>
          
          {/* 水平箭头容器 - 第4轮到第5轮（向左） */}
          <div className="absolute bottom-1/4 left-1/3 transform -translate-x-1/2 translate-y-1/2 flex flex-col items-center z-10">
            {/* 间隔时间标注 */}
            <div className="text-sm md:text-base text-duo-grayMedium font-medium mb-1 whitespace-nowrap">
              复习
            </div>
            {/* 箭头（向左） */}
            <div className="flex items-center">
              <svg 
                width="16" 
                height="16"
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="rotate-180"
              >
                <path d="M13.1727 12L8.22266 7.04999L9.63766 5.63599L16.0027 12L9.63766 18.364L8.22266 16.95L13.1727 12Z" 
                      fill="currentColor" 
                      className="text-duo-grayMedium opacity-75"/>
              </svg>
              <div className="w-6 h-0.5 bg-duo-grayMedium opacity-75"></div>
            </div>
          </div>
          
          {/* 水平箭头容器 - 第3轮到第4轮（向左） */}
          <div className="absolute bottom-1/4 left-2/3 transform -translate-x-1/2 translate-y-1/2 flex flex-col items-center z-10">
            {/* 间隔时间标注 */}
            <div className="text-sm md:text-base text-duo-grayMedium font-medium mb-1 whitespace-nowrap">
              复习
            </div>
            {/* 箭头（向左） */}
            <div className="flex items-center">
              <svg 
                width="16" 
                height="16"
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="rotate-180"
              >
                <path d="M13.1727 12L8.22266 7.04999L9.63766 5.63599L16.0027 12L9.63766 18.364L8.22266 16.95L13.1727 12Z" 
                      fill="currentColor" 
                      className="text-duo-grayMedium opacity-75"/>
              </svg>
              <div className="w-6 h-0.5 bg-duo-grayMedium opacity-75"></div>
            </div>
          </div>
          
          {/* 箭头从生词库组件指向词汇圆圈 */}
          <div className="absolute left-[-4rem] top-1/4 transform translate-x-1/2 -translate-y-1/2 flex items-center z-10">
            {/* 箭头 */}
            <div className="flex items-center">
              <div className="w-6 h-0.5 bg-duo-grayMedium opacity-75"></div>
              <svg 
                width="16" 
                height="16"
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M13.1727 12L8.22266 7.04999L9.63766 5.63599L16.0027 12L9.63766 18.364L8.22266 16.95L13.1727 12Z" 
                      fill="currentColor" 
                      className="text-duo-grayMedium opacity-75"/>
              </svg>
            </div>
          </div>
          
          {/* 箭头从第5轮圆圈指向生词库组件 */}
          <div className="absolute left-[-4rem] bottom-1/4 transform translate-x-1/2 translate-y-1/2 flex items-center z-10">
            {/* 箭头（向左） */}
            <div className="flex items-center">
              <svg 
                width="16" 
                height="16"
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="rotate-180"
              >
                <path d="M13.1727 12L8.22266 7.04999L9.63766 5.63599L16.0027 12L9.63766 18.364L8.22266 16.95L13.1727 12Z" 
                      fill="currentColor" 
                      className="text-duo-grayMedium opacity-75"/>
              </svg>
              <div className="w-6 h-0.5 bg-duo-grayMedium opacity-75"></div>
            </div>
          </div>
            </div>
          </div>
        </div>
      </div>

      {/* 移动端和平板网格布局 */}
      <div className="lg:hidden">
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          {/* 第一行：新词 -> 第1轮 */}
          <div className="flex flex-col items-center">
            <div onClick={() => handleStageClick(0)} className="w-full">
              <div className="flex items-center space-x-4 p-4 md:p-5 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-lg flex items-center justify-center 
                               ${!stages[0].forceInactive ? 'bg-duo-green text-white' : 'bg-duo-grayLight text-duo-grayDark'}`}>
                  <span className="text-xl md:text-2xl font-bold">{stages[0].count}</span>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-duo-textPrimary text-lg md:text-xl">{stages[0].title}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center relative">
            <div onClick={() => handleStageClick(1)} className="w-full">
              <div className="flex items-center space-x-4 p-4 md:p-5 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-lg flex items-center justify-center 
                               ${!stages[1].forceInactive ? 'bg-duo-green text-white' : 'bg-duo-grayLight text-duo-grayDark'}`}>
                  <span className="text-xl md:text-2xl font-bold">{stages[1].count}</span>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-duo-textPrimary text-lg md:text-xl">{stages[1].title}</div>
                </div>
              </div>
            </div>
            {/* 箭头从左边指向右边 */}
            <div className="absolute left-[-1rem] top-1/2 transform -translate-y-1/2 hidden sm:block">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                <path d="M13.1727 12L8.22266 7.04999L9.63766 5.63599L16.0027 12L9.63766 18.364L8.22266 16.95L13.1727 12Z" fill="currentColor"/>
              </svg>
            </div>
          </div>
          
                     {/* 第二行：第2轮 -> 第3轮 */}
           <div className="flex flex-col items-center relative">
             <div onClick={() => handleStageClick(2)} className="w-full">
               <div className="flex items-center space-x-4 p-4 md:p-5 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                 <div className={`w-14 h-14 md:w-16 md:h-16 rounded-lg flex items-center justify-center 
                                ${!stages[2].forceInactive ? 'bg-duo-green text-white' : 'bg-duo-grayLight text-duo-grayDark'}`}>
                   <span className="text-xl md:text-2xl font-bold">{stages[2].count}</span>
                 </div>
                 <div className="flex-1">
                   <div className="font-semibold text-duo-textPrimary text-lg md:text-xl">{stages[2].title}</div>
                 </div>
               </div>
             </div>
             {/* 向下箭头到第3轮 */}
             <div className="absolute bottom-[-1.5rem] left-1/2 transform -translate-x-1/2 hidden sm:flex sm:flex-col sm:items-center">
               <div className="w-0.5 h-4 bg-gray-400 opacity-75"></div>
               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-gray-400 rotate-90">
                 <path d="M13.1727 12L8.22266 7.04999L9.63766 5.63599L16.0027 12L9.63766 18.364L8.22266 16.95L13.1727 12Z" fill="currentColor"/>
               </svg>
             </div>
           </div>
          
          <div className="flex flex-col items-center">
            <div onClick={() => handleStageClick(3)} className="w-full">
              <div className="flex items-center space-x-4 p-4 md:p-5 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-lg flex items-center justify-center 
                               ${!stages[3].forceInactive ? 'bg-duo-green text-white' : 'bg-duo-grayLight text-duo-grayDark'}`}>
                  <span className="text-xl md:text-2xl font-bold">{stages[3].count}</span>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-duo-textPrimary text-lg md:text-xl">{stages[3].title}</div>
                </div>
              </div>
            </div>
          </div>
          
                     {/* 第三行：第5轮 <- 第4轮 */}
           <div className="flex flex-col items-center">
             <div onClick={() => handleStageClick(5)} className="w-full">
               <div className="flex items-center space-x-4 p-4 md:p-5 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                 <div className={`w-14 h-14 md:w-16 md:h-16 rounded-lg flex items-center justify-center 
                                ${!stages[5].forceInactive ? 'bg-duo-green text-white' : 'bg-duo-grayLight text-duo-grayDark'}`}>
                   <span className="text-xl md:text-2xl font-bold">{stages[5].count}</span>
                 </div>
                 <div className="flex-1">
                   <div className="font-semibold text-duo-textPrimary text-lg md:text-xl">{stages[5].title}</div>
                 </div>
               </div>
             </div>
           </div>
          
          <div className="flex flex-col items-center relative">
            <div onClick={() => handleStageClick(4)} className="w-full">
              <div className="flex items-center space-x-4 p-4 md:p-5 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-lg flex items-center justify-center 
                               ${!stages[4].forceInactive ? 'bg-duo-green text-white' : 'bg-duo-grayLight text-duo-grayDark'}`}>
                  <span className="text-xl md:text-2xl font-bold">{stages[4].count}</span>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-duo-textPrimary text-lg md:text-xl">{stages[4].title}</div>
                </div>
              </div>
            </div>
            {/* 箭头从右边指向左边 */}
            <div className="absolute right-[-1rem] top-1/2 transform -translate-y-1/2 hidden sm:flex sm:flex-col sm:items-center">
              <div className="flex items-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-gray-400 rotate-180">
                  <path d="M13.1727 12L8.22266 7.04999L9.63766 5.63599L16.0027 12L9.63766 18.364L8.22266 16.95L13.1727 12Z" fill="currentColor"/>
                </svg>
                <div className="w-8 h-0.5 bg-gray-400 opacity-75"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-sm md:text-base text-duo-textSecondary 
                   mt-6 md:mt-10 text-center font-medium px-2">
        每个单词完成撕纸条（检测）并正确后，单词即进入下一轮词库。
      </p>

      {/* 弹窗 */}
      {showModal && modalStage !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 
                         w-full max-w-sm sm:max-w-md md:max-w-lg 
                         max-h-[80vh] overflow-y-auto 
                         shadow-lg">
            <h3 className="text-lg sm:text-xl font-bold mb-4 text-center">
              {stages[modalStage].title} - 单词列表
            </h3>
            {(() => {
              const { canReviewWords, cannotReviewWords } = getWordsByStage(modalStage);
              return (
                <div className="space-y-4">
                  <div>
                    <div className="font-semibold text-green-600 mb-2">可背诵单词</div>
                    {canReviewWords.length > 0 ? (
                      <ul className="list-disc list-inside text-sm space-y-1 max-h-32 overflow-y-auto">
                        {canReviewWords.map(w => (
                          <li key={w.word} className="break-words">{w.word}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-xs text-gray-400">暂无可背诵单词</div>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-500 mb-2">不可背诵单词</div>
                    {cannotReviewWords.length > 0 ? (
                      <ul className="list-disc list-inside text-sm space-y-1 max-h-32 overflow-y-auto">
                        {cannotReviewWords.map(w => {
                          // 优先使用后端给出的下次复习日期（支持 camelCase 和 snake_case），若无则本地估算
                          const backendNextDate: string | undefined = (w as any).nextReviewDate || (w as any).next_review_date;
                          const nextAvailableDate = backendNextDate ? backendNextDate.slice(0, 10) : '未知';
                          return (
                            <li key={w.word} className="break-words">
                              {w.word}（下次可背诵：{nextAvailableDate}）
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <div className="text-xs text-gray-400">暂无不可背诵单词</div>
                    )}
                  </div>
                </div>
              );
            })()}
            <div className="mt-6 flex gap-3">
              <button
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg 
                         hover:bg-gray-300 transition-colors font-medium"
                onClick={() => setShowModal(false)}
              >
                关闭
              </button>
              <button
                className="flex-1 px-4 py-2 bg-duo-green text-white rounded-lg 
                         hover:bg-duo-green/80 transition-colors font-medium"
                onClick={() => {
                  const { canReviewWords, cannotReviewWords } = getWordsByStage(modalStage);
                  if (!currentSelectedPlan) {
                    console.error('没有找到当前选中的学习计划');
                    alert('没有找到当前选中的学习计划，无法加载单词数据');
                    return;
                  }

                  // 早复习: 如果当前无可复习单词，则取所有处于该阶段的单词
                  const wordsToReview = canReviewWords.length > 0 ? canReviewWords : [...canReviewWords, ...cannotReviewWords];

                  const studyPath = studentId ? `/study/${studentId}` : '/study';
                  navigate(studyPath, {
                    state: {
                      fromStudyPlan: true,
                      mode: modalStage === 0 ? 'new' : 'review',
                      stageTitle: stages[modalStage].title,
                      stage: modalStage,
                      planId: currentSelectedPlan.id,
                      vocabularyBookId: currentSelectedPlan.vocabulary_book.id,
                      wordTexts: wordsToReview.map(w => w.word),
                    }
                  });
                  setShowModal(false);
                }}
              >
                {modalStage === 0 ? '学习' : (getWordsByStage(modalStage).canReviewWords.length > 0 ? '复习' : '提前复习')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DuolingoStudyPlan; 