import React, { useState } from 'react';
import { DuolingoStudyPlan } from './DuolingoStudyPlan';

// 测试用的单词数据类型
interface TestWord {
  word: string;
  startDate: string;
  currentStage: number;
  stageHistory: { stage: number; completedAt: string }[];
}

// 创建测试单词的辅助函数
const createTestWord = (
  word: string, 
  startDate: string, 
  currentStage: number, 
  stageHistory: { stage: number; completedAt: string }[] = []
): TestWord => ({
  word,
  startDate,
  currentStage,
  stageHistory
});

// 预设的测试场景
const testScenarios = {
  // 场景1: 基础阶段分布
  basicStages: {
    name: '基础阶段分布测试',
    words: [
      createTestWord('apple', '2024-01-01', 0),
      createTestWord('banana', '2024-01-01', 0),
      createTestWord('cat', '2024-01-01', 1, [{ stage: 0, completedAt: '2024-01-01' }]),
      createTestWord('dog', '2024-01-01', 2, [
        { stage: 0, completedAt: '2024-01-01' },
        { stage: 1, completedAt: '2024-01-02' }
      ]),
      createTestWord('elephant', '2024-01-01', 3, [
        { stage: 0, completedAt: '2024-01-01' },
        { stage: 1, completedAt: '2024-01-02' },
        { stage: 2, completedAt: '2024-01-03' }
      ]),
      createTestWord('fish', '2024-01-01', 4, [
        { stage: 0, completedAt: '2024-01-01' },
        { stage: 1, completedAt: '2024-01-02' },
        { stage: 2, completedAt: '2024-01-03' },
        { stage: 3, completedAt: '2024-01-05' }
      ]),
      createTestWord('grape', '2024-01-01', 5, [
        { stage: 0, completedAt: '2024-01-01' },
        { stage: 1, completedAt: '2024-01-02' },
        { stage: 2, completedAt: '2024-01-03' },
        { stage: 3, completedAt: '2024-01-05' },
        { stage: 4, completedAt: '2024-01-08' }
      ])
    ],
    today: '2024-01-15'
  },

  // 场景2: 时间间隔测试
  timeIntervals: {
    name: '时间间隔测试',
    words: [
      // 第1轮：可复习（昨天完成第0轮）
      createTestWord('ready1', '2024-01-01', 1, [
        { stage: 0, completedAt: '2024-01-09' }
      ]),
      // 第1轮：不可复习（今天完成第0轮）
      createTestWord('notready1', '2024-01-01', 1, [
        { stage: 0, completedAt: '2024-01-10' }
      ]),
      // 第3轮：可复习（2天前完成第2轮）
      createTestWord('ready3', '2024-01-01', 3, [
        { stage: 0, completedAt: '2024-01-05' },
        { stage: 1, completedAt: '2024-01-06' },
        { stage: 2, completedAt: '2024-01-08' }
      ]),
      // 第3轮：不可复习（昨天完成第2轮）
      createTestWord('notready3', '2024-01-01', 3, [
        { stage: 0, completedAt: '2024-01-05' },
        { stage: 1, completedAt: '2024-01-06' },
        { stage: 2, completedAt: '2024-01-09' }
      ])
    ],
    today: '2024-01-10'
  },

  // 场景3: 单词完整学习周期
  fullCycle: {
    name: '完整学习周期',
    words: [
      createTestWord('learning', '2024-01-01', 3, [
        { stage: 0, completedAt: '2024-01-01' },
        { stage: 1, completedAt: '2024-01-02' },
        { stage: 2, completedAt: '2024-01-03' }
      ])
    ],
    today: '2024-01-05'
  },

  // 场景4: 空数据测试
  empty: {
    name: '空数据测试',
    words: [],
    today: '2024-01-10'
  }
};

export const StudyPlanTestDemo: React.FC = () => {
  const [currentScenario, setCurrentScenario] = useState<keyof typeof testScenarios>('basicStages');
  const [customToday, setCustomToday] = useState('');

  const scenario = testScenarios[currentScenario];
  const todayToUse = customToday || scenario.today;

  // 用于模拟学习计划数据
  const mockStudentPlans = [
    {
      id: 1,
      student_details: {
        id: 1,
        name: '测试学生',
        email: 'test@example.com'
      },
      teacher: null,
      vocabulary_book: {
        id: 1,
        name: '测试词书',
        word_count: 100,
        is_system_preset: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      start_date: '2024-01-01',
      is_active: true,
      total_days: 10,
      progress: 30,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ];

  const handleStartLearning = (planId: number, vocabularyBookId: number) => {
    alert(`开始学习计划 ${planId}，词书 ID: ${vocabularyBookId}`);
  };

  // 计算各阶段统计信息
  const stats = {
    stage0: scenario.words.filter(w => w.currentStage === 0).length,
    stage1: scenario.words.filter(w => w.currentStage === 1).length,
    stage2: scenario.words.filter(w => w.currentStage === 2).length,
    stage3: scenario.words.filter(w => w.currentStage === 3).length,
    stage4: scenario.words.filter(w => w.currentStage === 4).length,
    stage5: scenario.words.filter(w => w.currentStage === 5).length,
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          DuolingoStudyPlan 轮转功能测试演示
        </h1>

        {/* 测试控制面板 */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4">测试控制面板</h2>
          
          {/* 场景选择 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择测试场景:
              </label>
              <select 
                value={currentScenario}
                onChange={(e) => setCurrentScenario(e.target.value as keyof typeof testScenarios)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(testScenarios).map(([key, scenario]) => (
                  <option key={key} value={key}>
                    {scenario.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                自定义当前日期（可选）:
              </label>
              <input 
                type="date"
                value={customToday}
                onChange={(e) => setCustomToday(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder={scenario.today}
              />
            </div>
          </div>

          {/* 当前场景信息 */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-semibold mb-2">当前场景信息:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>场景: {scenario.name}</div>
              <div>测试日期: {todayToUse}</div>
              <div>总单词数: {scenario.words.length}</div>
              <div>
                阶段分布: 
                新词({stats.stage0}) 
                第1轮({stats.stage1}) 
                第2轮({stats.stage2}) 
                第3轮({stats.stage3}) 
                第4轮({stats.stage4}) 
                第5轮({stats.stage5})
              </div>
            </div>
          </div>
        </div>

        {/* 当前场景的单词详情 */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4">当前场景单词详情</h3>
          {scenario.words.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">单词</th>
                    <th className="border p-2 text-left">开始日期</th>
                    <th className="border p-2 text-left">当前阶段</th>
                    <th className="border p-2 text-left">学习历史</th>
                    <th className="border p-2 text-left">是否可复习</th>
                  </tr>
                </thead>
                <tbody>
                  {scenario.words.map((word, index) => {
                    // 计算是否可以复习（模拟canReview函数逻辑）
                    const canReviewToday = () => {
                      if (word.currentStage === 0) return true;
                      const stageIntervals = [0, 1, 1, 2, 3, 7];
                      const lastCompleted = word.stageHistory.find(h => h.stage === word.currentStage - 1)?.completedAt || word.startDate;
                      const interval = stageIntervals[word.currentStage];
                      const nextDate = new Date(lastCompleted);
                      nextDate.setDate(nextDate.getDate() + interval);
                      return new Date(todayToUse) >= nextDate;
                    };

                    return (
                      <tr key={index} className={canReviewToday() ? 'bg-green-50' : 'bg-red-50'}>
                        <td className="border p-2 font-medium">{word.word}</td>
                        <td className="border p-2">{word.startDate}</td>
                        <td className="border p-2">
                          {word.currentStage === 0 ? '新词' : 
                           word.currentStage === 5 ? '第5轮' : 
                           `第${word.currentStage}轮`}
                        </td>
                        <td className="border p-2">
                          {word.stageHistory.map(h => `${h.stage}轮(${h.completedAt})`).join(', ')}
                        </td>
                        <td className="border p-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            canReviewToday() 
                              ? 'bg-green-200 text-green-800' 
                              : 'bg-red-200 text-red-800'
                          }`}>
                            {canReviewToday() ? '可复习' : '不可复习'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">当前场景没有单词数据</p>
          )}
        </div>

        {/* 实际组件展示 */}
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4">组件实际效果</h3>
          <DuolingoStudyPlan
            words={scenario.words}
            today={todayToUse}
            studentPlans={mockStudentPlans}
            onStartLearning={handleStartLearning}
            studentId="10"
          />
        </div>

        {/* 测试说明 */}
        <div className="bg-blue-50 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4 text-blue-800">测试说明</h3>
          <div className="text-sm text-blue-700 space-y-2">
            <p><strong>轮转规则:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>新词 → 第1轮: 间隔1天</li>
              <li>第1轮 → 第2轮: 间隔1天</li>
              <li>第2轮 → 第3轮: 间隔2天</li>
              <li>第3轮 → 第4轮: 间隔3天</li>
              <li>第4轮 → 第5轮: 间隔7天</li>
            </ul>
            <p><strong>测试方法:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>切换不同测试场景，观察各阶段数量变化</li>
              <li>修改当前日期，观察可复习单词的变化</li>
              <li>点击各个阶段圆圈，查看详细的单词列表</li>
              <li>绿色背景表示可复习，红色背景表示还需等待</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyPlanTestDemo; 