import React, { useState } from 'react';
import { Sidebar as StudentsSidebar } from './Students/StudentsSidebar';

// 定义标签类型
interface TabItem {
  id: string;
  label: string;
}

const tabs: TabItem[] = [
  { id: 'mission', label: '我们的使命' },
  { id: 'team', label: '团队' },
  { id: 'careers', label: '招聘贤才' },
  { id: 'contact', label: '联系我们' },
];

const AboutUsPage = () => {
  const [activeTab, setActiveTab] = useState<string>('mission');

  const renderContent = () => {
    switch (activeTab) {
      case 'mission':
        return (
          <div className="space-y-12 mt-8">
            {/* 个性化教育 */}
            <section className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 w-full md:w-1/3">
                {/* 替换为实际图片 */}
                <img 
                  src="/img/hand%20up.png" // 使用 static/img 目录中的 hand up.png 图片
                  alt="快乐学习英语的蛋黄" 
                  className="rounded-lg object-contain w-full h-auto max-h-60 md:max-h-full"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
                  个性化教育
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  每个人的学习方式都不尽相同，该如何达成既照顾大家不同的学习习惯，又保证学习效果一直都是个难题。终于，小蜥蜴（深圳）信息技术有限责任公司通过分析亿万用户的学习习惯，成功总结出了一套适用于所有人的、且最有效的学习方法，推出在线语言学习应用——蛋仔英语。
                </p>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-2">
                  我们的终极目标是运用现代科技，让人人都能享受到私人教练的指导。
                </p>
              </div>
            </section>

            {/* 学习 = 快乐 */}
            <section className="flex flex-col md:flex-row-reverse items-center gap-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="flex-shrink-0 w-full md:w-1/3">
                {/* 替换为实际图片 */}
                <img 
                  src="/img/Clap.png" 
                  alt="学习等于快乐插图" 
                  className="rounded-lg object-cover w-full h-auto"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
                  学习 = 快乐
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  如何帮助大家坚持学习一直都是个难题。现在，蛋仔英语有趣的游戏关卡设计、好玩的虚拟人物，以及令人欲罢不能的排行榜，让学习不再是枯燥无味的事情。我们致力于让学习者享受学习的过程，并从中获得乐趣。
                </p>
              </div>
            </section>
            
            {/* 您原有的内容，可以考虑整合或删除 */}
            <div className="mt-10 pt-10 border-t border-gray-200 dark:border-gray-700 space-y-6">
                <h2 className="text-2xl font-semibold text-daxiran-green-dark dark:text-daxiran-green-lightest">我们的特色</h2>
                <ul className="list-disc pl-6 space-y-3 text-gray-600 dark:text-gray-300">
                  <li>
                    <strong>个性化学习路径：</strong> 基于艾宾浩斯记忆曲线和智能算法，为每位学生量身定制学习计划和复习策略，确保学习效率最大化。
                  </li>
                  <li>
                    <strong>互动式学习体验：</strong> 结合游戏化设计和生动的卡通风格，将单词学习融入有趣的互动场景，提高学习参与度和记忆效果。
                  </li>
                  <li>
                    <strong>全面的学习数据分析：</strong> 教师和家长可以实时追踪学生的学习进度、掌握情况和薄弱环节，从而提供更精准的辅导和支持。
                  </li>
                  <li>
                    <strong>持续创新与优化：</strong> 我们拥有一支充满激情和创造力的研发团队，不断探索前沿教育技术，持续迭代产品，为用户带来更好的体验。
                  </li>
                </ul>
                <h2 className="text-2xl font-semibold mt-8 mb-4 text-daxiran-green-dark dark:text-daxiran-green-lightest">联系我们</h2>
                <p className="text-gray-600 dark:text-gray-300">
                  如果您对我们的产品有任何疑问、建议或合作意向，欢迎随时与我们联系。
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  邮箱：contact@danzai.tech (示例邮箱，已修改)
                </p>
            </div>

          </div>
        );
      case 'method':
        return <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-700 rounded-lg"><p className="text-gray-700 dark:text-gray-200">教学方法内容正在准备中...</p></div>;
      case 'team':
        return (
          <div className="space-y-10 mt-8 text-gray-600 dark:text-gray-300 leading-relaxed">
            <section>
              <p className="text-lg">
                蛋仔拥有一支充满活力、经验丰富且对教育事业抱有极大热忱的专业团队。我们汇集了教育学、语言学、人工智能、软件工程、交互设计等多个领域的顶尖人才，共同致力于打造业界领先的英语学习产品。
              </p>
            </section>

            <section className="flex flex-col md:flex-row items-start gap-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="flex-shrink-0 w-full md:w-1/3">
                 {/* 您可以替换为团队相关图片 */}
                <img 
                  src="/img/team-placeholder.png" 
                  alt="专业团队" 
                  className="rounded-lg shadow-lg object-cover w-full h-auto"
                />
              </div>
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">卓越的教研与内容创作</h3>
                  <p>我们的教研团队由资深英语教育专家和一线教师组成，他们深度理解语言学习规律和学生需求，精心设计每一项学习内容和练习，确保科学性、趣味性和有效性。</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">强大的技术研发实力</h3>
                  <p>技术团队掌握前沿的人工智能算法和大数据分析技术，为个性化学习路径、智能评估反馈等核心功能提供坚实保障。我们追求技术的创新应用，不断提升产品智能化水平。</p>
                </div>
              </div>
            </section>
            
            <section className="pt-8 border-t border-gray-200 dark:border-gray-700 space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">极致的产品与用户体验</h3>
                  <p>产品与设计团队始终以用户为中心，通过细致的用户研究和创新的交互设计，打造简洁易用、美观有趣的界面和流程，让学习过程更加愉悦和高效。</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">我们的文化：专业、创新、协作、关怀</h3>
                  <p>我们崇尚专业精神，鼓励持续学习和创新思维。团队成员紧密协作，共同攻克难关。我们不仅关心产品的质量，更关心每一位用户的成长与进步。蛋仔团队致力于成为您最值得信赖的英语学习伙伴。</p>
                </div>
            </section>
          </div>
        );
      case 'careers':
        return <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-700 rounded-lg"><p className="text-gray-700 dark:text-gray-200">招聘贤才信息正在准备中...</p></div>;
      case 'contact':
        return (
            <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200">
                <h3 className="text-xl font-semibold mb-4">联系我们</h3>
                <p>邮箱：751041637@qq.com</p>
                <p>地址：深圳市福田区沙头街道天安社区深南大道6017号都市阳光名苑2栋2楼</p>
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 overflow-hidden">
      <StudentsSidebar /> {/* 左侧边栏 */}
      
      {/* 右侧主内容区域 */}
      <main className="flex-1 overflow-y-auto p-8 md:p-12 bg-white dark:bg-gray-800">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-10">
            关于我们
          </h1>

          {/* 横向导航标签 */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
            <nav className="-mb-px flex space-x-6 md:space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm md:text-base
                    ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-300'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
                    }
                    focus:outline-none
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* 动态内容区域 */}
          <div>
            {renderContent()}
          </div>
          
          <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              版权所有 © 小蜥蜴（深圳）信息技术有限责任公司 | 粤ICP备2024314890号
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default AboutUsPage; 