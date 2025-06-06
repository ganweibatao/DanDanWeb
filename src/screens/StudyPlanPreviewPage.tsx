import React from 'react';
import { DuolingoStudyPlan } from '../components/StudyPlan/DuolingoStudyPlan'; // 确保路径正确

const StudyPlanPreviewPage: React.FC = () => {
  // 示例数据更新
  const examplePlanData = {
    newWordsCount: 20,
    review1WordsCount: 15,
    review2WordsCount: 10,
    review3WordsCount: 5,
    review4WordsCount: 3, // 新增第4轮数据
    review5WordsCount: 0, // 原第4轮数据变为第5轮
  };

  const examplePlanDataAllActive = {
    newWordsCount: 20,
    review1WordsCount: 15,
    review2WordsCount: 10,
    review3WordsCount: 5,
    review4WordsCount: 8, // 新增第4轮数据
    review5WordsCount: 6, // 原第4轮数据变为第5轮
  };
  
  const examplePlanDataSomeInactive = {
    newWordsCount: 0,
    review1WordsCount: 15,
    review2WordsCount: 0,
    review3WordsCount: 5,
    review4WordsCount: 0, // 新增第4轮数据
    review5WordsCount: 0, // 原第4轮数据变为第5轮
  };


  return (
    <div className="p-8 bg-gray-100 min-h-screen flex flex-col items-center space-y-8">
      <h1 className="text-3xl font-bold mb-4">学习计划组件预览</h1>

      <div>
        <h2 className="text-2xl font-semibold mb-2">场景1: 部分阶段有单词</h2>
        <DuolingoStudyPlan
          newWordsCount={examplePlanData.newWordsCount}
          review1WordsCount={examplePlanData.review1WordsCount}
          review2WordsCount={examplePlanData.review2WordsCount}
          review3WordsCount={examplePlanData.review3WordsCount}
          review4WordsCount={examplePlanData.review4WordsCount}
          review5WordsCount={examplePlanData.review5WordsCount}
        />
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-2">场景2: 所有阶段都有单词</h2>
         <DuolingoStudyPlan
          newWordsCount={examplePlanDataAllActive.newWordsCount}
          review1WordsCount={examplePlanDataAllActive.review1WordsCount}
          review2WordsCount={examplePlanDataAllActive.review2WordsCount}
          review3WordsCount={examplePlanDataAllActive.review3WordsCount}
          review4WordsCount={examplePlanDataAllActive.review4WordsCount}
          review5WordsCount={examplePlanDataAllActive.review5WordsCount}
        />
      </div>
      
      <div>
        <h2 className="text-2xl font-semibold mb-2">场景3: 部分阶段无单词</h2>
         <DuolingoStudyPlan
          newWordsCount={examplePlanDataSomeInactive.newWordsCount}
          review1WordsCount={examplePlanDataSomeInactive.review1WordsCount}
          review2WordsCount={examplePlanDataSomeInactive.review2WordsCount}
          review3WordsCount={examplePlanDataSomeInactive.review3WordsCount}
          review4WordsCount={examplePlanDataSomeInactive.review4WordsCount}
          review5WordsCount={examplePlanDataSomeInactive.review5WordsCount}
        />
      </div>

    </div>
  );
};

export default StudyPlanPreviewPage; 