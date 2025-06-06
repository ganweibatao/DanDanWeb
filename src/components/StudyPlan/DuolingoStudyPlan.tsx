import React, { useState } from 'react';

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
  const statusText = isNew ? (isActive ? '待学习' : '') : (isActive ? '待复习' : '已完成');

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
}

interface DuolingoStudyPlanProps {
  newWordsCount: number;
  review1WordsCount: number;
  review2WordsCount: number;
  review3WordsCount: number;
  review4WordsCount: number;
  review5WordsCount: number;
  words: Word[];
  today: string;
}

const stageIntervals = [0, 1, 1, 2, 3, 7]; // 新学到第5轮

function addDays(dateStr: string, days: number) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function canReview(word: Word, stage: number, today: string) {
  if (stage === 0) return true;
  const lastCompleted = word.stageHistory.find(h => h.stage === stage - 1)?.completedAt || word.startDate;
  const nextAvailableDate = addDays(lastCompleted, stageIntervals[stage]);
  return today >= nextAvailableDate;
}

export const DuolingoStudyPlan: React.FC<DuolingoStudyPlanProps> = ({
  newWordsCount,
  review1WordsCount,
  review2WordsCount,
  review3WordsCount,
  review4WordsCount,
  review5WordsCount,
  words,
  today,
}) => {
  const stages = [
    { title: '词汇', count: newWordsCount, isNew: true },
    { title: '第 1 轮', count: review1WordsCount },
    { title: '第 2 轮', count: review2WordsCount },
    { title: '第 3 轮', count: review3WordsCount },
    { title: '第 4 轮', count: review4WordsCount },
    { title: 'Final', count: review5WordsCount }, 
  ];

  const [showModal, setShowModal] = useState(false);
  const [modalStage, setModalStage] = useState<number | null>(null);

  // 点击轮次
  const handleStageClick = (stageIndex: number) => {
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

  // Removed ptUnitValues and stagePtClasses - stages will align horizontally

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-duo-bg rounded-lg md:rounded-xl lg:rounded-2xl max-w-full">
      
      {/* 桌面大屏布局 - 改为网格布局 */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-3 gap-8 max-w-4xl mx-auto">
          {/* 第一行：新词 -> 第1轮 -> 第2轮 */}
          <div className="flex flex-col items-center">
            {/* 词库上方的标签 */}
            <span className="text-base text-gray-500 mb-2 font-medium text-center">
              新学
            </span>
            <div onClick={() => handleStageClick(0)}>
              <StageCircle
                title={stages[0].title}
                count={stages[0].count}
                isNew={stages[0].isNew}
                forceInactive={stages[0].title === '新词'}
              />
            </div>
          </div>
          
          <div className="flex flex-col items-center relative">
            {/* 第1轮上方的时间标签 */}
            <span className="text-base text-gray-500 mb-2 font-medium text-center">
              1天后
            </span>
            <div onClick={() => handleStageClick(1)}>
              <StageCircle
                title={stages[1].title}
                count={stages[1].count}
                isNew={stages[1].isNew}
                forceInactive={false}
              />
            </div>
            {/* 从新词到第1轮的箭头和间隔标注 */}
            <div className="absolute left-[-6rem] top-1/2 transform -translate-y-1/2 flex flex-col items-center">
              {/* 间隔时间标注 */}
              <div className="text-sm md:text-base text-duo-grayMedium font-medium mb-1 whitespace-nowrap">
                间隔1天
              </div>
              {/* 长箭头 */}
              <div className="flex items-center">
                <div className="w-16 h-0.5 bg-duo-grayMedium opacity-75"></div>
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
          </div>
          
          <div className="flex flex-col items-center relative">
            {/* 第2轮上方的时间标签 */}
            <span className="text-base text-gray-500 mb-2 font-medium text-center">
              2天后
            </span>
            <div onClick={() => handleStageClick(2)}>
              <StageCircle
                title={stages[2].title}
                count={stages[2].count}
                isNew={stages[2].isNew}
                forceInactive={false}
              />
            </div>
            {/* 从第1轮到第2轮的箭头和间隔标注 */}
            <div className="absolute left-[-6rem] top-1/2 transform -translate-y-1/2 flex flex-col items-center">
              {/* 间隔时间标注 */}
              <div className="text-sm md:text-base text-duo-grayMedium font-medium mb-1 whitespace-nowrap">
                间隔1天
              </div>
              {/* 长箭头 */}
              <div className="flex items-center">
                <div className="w-16 h-0.5 bg-duo-grayMedium opacity-75"></div>
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
            {/* 从第2轮到第3轮的向下箭头和间隔标注 - 调整位置避免重叠 */}
            <div className="absolute bottom-[-2.5rem] left-1/2 transform -translate-x-1/2 flex flex-col items-center">
              {/* 长箭头（向下） */}
              <div className="flex flex-col items-center relative">
                <div className="w-0.5 h-5 bg-duo-grayMedium opacity-75"></div>
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
                {/* 间隔时间标注 - 放在纵向箭头中间的右方 */}
                <div className="absolute top-1/2 left-4 transform -translate-y-1/2 text-sm md:text-base text-duo-grayMedium font-medium whitespace-nowrap">
                  间隔2天
                </div>
              </div>
            </div>
          </div>
          
                    {/* 第二行：Final <- 第4轮 <- 第3轮 */}
          <div className="flex flex-col items-center">
            {/* Final上方的时间标签 */}
            <span className="text-base text-gray-500 mb-2 font-medium text-center">
              14天后
            </span>
            <div onClick={() => handleStageClick(5)}>
              <StageCircle
                title={stages[5].title}
                count={stages[5].count}
                isNew={stages[5].isNew}
                forceInactive={false}
              />
            </div>
          </div>
          
          <div className="flex flex-col items-center relative">
            {/* 第4轮上方的时间标签 */}
            <span className="text-base text-gray-500 mb-2 font-medium text-center">
              7天后
            </span>
            <div onClick={() => handleStageClick(4)}>
              <StageCircle
                title={stages[4].title}
                count={stages[4].count}
                isNew={stages[4].isNew}
                forceInactive={false}
              />
            </div>
            {/* 从第4轮到Final的箭头和间隔标注（向左） */}
            <div className="absolute left-[-4rem] top-1/2 transform -translate-y-1/2 flex flex-col items-center">
              {/* 间隔时间标注 */}
              <div className="text-sm md:text-base text-duo-grayMedium font-medium mb-1 whitespace-nowrap">
                间隔7天
              </div>
              {/* 长箭头（向左） */}
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
                <div className="w-16 h-0.5 bg-duo-grayMedium opacity-75"></div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center relative">
            {/* 第3轮上方的时间标签 */}
            <span className="text-base text-gray-500 mb-2 font-medium text-center">
              4天后
            </span>
            <div onClick={() => handleStageClick(3)}>
              <StageCircle
                title={stages[3].title}
                count={stages[3].count}
                isNew={stages[3].isNew}
                forceInactive={false}
              />
            </div>
            {/* 从第3轮到第4轮的箭头和间隔标注（向左） */}
            <div className="absolute left-[-4rem] top-1/2 transform -translate-y-1/2 flex flex-col items-center">
              {/* 间隔时间标注 */}
              <div className="text-sm md:text-base text-duo-grayMedium font-medium mb-1 whitespace-nowrap">
                间隔3天
              </div>
              {/* 长箭头（向左） */}
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
                <div className="w-16 h-0.5 bg-duo-grayMedium opacity-75"></div>
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
                               ${stages[0].count > 0 && stages[0].title !== '新词' ? 'bg-duo-green text-white' : 'bg-duo-grayLight text-duo-grayDark'}`}>
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
                               ${stages[1].count > 0 ? 'bg-duo-green text-white' : 'bg-duo-grayLight text-duo-grayDark'}`}>
                  <span className="text-xl md:text-2xl font-bold">{stages[1].count}</span>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-duo-textPrimary text-lg md:text-xl">{stages[1].title}</div>
                  <div className="text-sm md:text-base text-gray-500 mt-1">1天后</div>
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
                                ${stages[2].count > 0 ? 'bg-duo-green text-white' : 'bg-duo-grayLight text-duo-grayDark'}`}>
                   <span className="text-xl md:text-2xl font-bold">{stages[2].count}</span>
                 </div>
                 <div className="flex-1">
                   <div className="font-semibold text-duo-textPrimary text-lg md:text-xl">{stages[2].title}</div>
                   <div className="text-sm md:text-base text-gray-500 mt-1">2天后</div>
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
                               ${stages[3].count > 0 ? 'bg-duo-green text-white' : 'bg-duo-grayLight text-duo-grayDark'}`}>
                  <span className="text-xl md:text-2xl font-bold">{stages[3].count}</span>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-duo-textPrimary text-lg md:text-xl">{stages[3].title}</div>
                  <div className="text-sm md:text-base text-gray-500 mt-1">4天后</div>
                </div>
              </div>
            </div>
          </div>
          
                     {/* 第三行：Final <- 第4轮 */}
           <div className="flex flex-col items-center">
             <div onClick={() => handleStageClick(5)} className="w-full">
               <div className="flex items-center space-x-4 p-4 md:p-5 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                 <div className={`w-14 h-14 md:w-16 md:h-16 rounded-lg flex items-center justify-center 
                                ${stages[5].count > 0 ? 'bg-duo-green text-white' : 'bg-duo-grayLight text-duo-grayDark'}`}>
                   <span className="text-xl md:text-2xl font-bold">{stages[5].count}</span>
                 </div>
                 <div className="flex-1">
                   <div className="font-semibold text-duo-textPrimary text-lg md:text-xl">{stages[5].title}</div>
                   <div className="text-sm md:text-base text-gray-500 mt-1">14天后</div>
                 </div>
               </div>
             </div>
           </div>
          
          <div className="flex flex-col items-center relative">
            <div onClick={() => handleStageClick(4)} className="w-full">
              <div className="flex items-center space-x-4 p-4 md:p-5 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-lg flex items-center justify-center 
                               ${stages[4].count > 0 ? 'bg-duo-green text-white' : 'bg-duo-grayLight text-duo-grayDark'}`}>
                  <span className="text-xl md:text-2xl font-bold">{stages[4].count}</span>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-duo-textPrimary text-lg md:text-xl">{stages[4].title}</div>
                  <div className="text-sm md:text-base text-gray-500 mt-1">7天后</div>
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
                   mt-4 md:mt-6 text-center font-medium px-2">
        复习轮次变绿时，表示本轮有单词需要被复习了。
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
                          // 计算下次可背诵时间
                          const lastCompleted = w.stageHistory.find(h => h.stage === modalStage - 1)?.completedAt || w.startDate;
                          const nextAvailableDate = addDays(lastCompleted, stageIntervals[modalStage]);
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
                  // 这里可以添加跳转到学习页面的逻辑
                  console.log(`开始学习${stages[modalStage].title}`);
                  setShowModal(false);
                }}
              >
                学习
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DuolingoStudyPlan; 