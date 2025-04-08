import React from 'react';
import { Sidebar } from '../components/layout/Sidebar'; // 引入共享侧边栏
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion"; // 引入 Shadcn Accordion 组件
import { ChevronRightIcon } from 'lucide-react'; // 面包屑图标

// 常见问题示例数据
const faqItems = [
  {
    id: "item-1",
    question: "为什么我的课程改变了？",
    answer: "我们不断更新和改进课程内容，以提供最佳的学习体验。有时这可能导致课程结构或内容的调整。",
  },
  {
    id: "item-2",
    question: "什么是连轴转？",
    answer: "连轴转（Streak）是指您连续完成每日学习目标的天数。保持连轴转可以帮助您养成持续学习的习惯。",
  },
  {
    id: "item-3",
    question: "领先板和联赛是什么？",
    answer: "领先板（Leaderboards）和联赛（Leagues）是多邻国的竞赛功能。您可以通过获得经验值（XP）在排行榜上与他人竞争，并根据每周表现晋升或降级。",
  },
  {
    id: "item-4",
    question: "DanZai 是否使用了任何开源库？",
    answer: "是的，DanZai 在其技术栈中使用了多种优秀的开源库和框架，以构建高效、稳定的应用程序。",
  },
];

export const HelpPage = (): JSX.Element => {
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 font-sans">
      <Sidebar /> {/* 使用共享侧边栏 */}

      {/* 主内容区域 */}
      <main className="flex-1 p-10 overflow-y-auto bg-white dark:bg-gray-800">
        {/* 面包屑导航 */}
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
          <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">帮助中心</a>
          <ChevronRightIcon className="w-4 h-4 mx-1" />
          <span>首页</span> {/* 或者根据实际情况显示当前分类 */}
        </div>

        {/* 主标题 */}
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
          常见问题
        </h1>

        {/* 常见问题列表 - 使用 Accordion */}
        <div className="max-w-3xl bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
           <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
             <h2 className="text-lg font-semibold text-blue-600 dark:text-blue-400">使用 DanZai</h2>
           </div>
           <Accordion type="single" collapsible className="w-full">
             {faqItems.map((item) => (
               <AccordionItem key={item.id} value={item.id} className="border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                 <AccordionTrigger className="flex justify-between items-center w-full px-6 py-4 text-left font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none transition-colors [&[data-state=open]>svg]:rotate-180">
                   {item.question}
                   {/* AccordionTrigger 默认会添加一个 ChevronDownIcon */}
                 </AccordionTrigger>
                 <AccordionContent className="px-6 py-4 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50">
                   {item.answer}
                 </AccordionContent>
               </AccordionItem>
             ))}
           </Accordion>
        </div>
      </main>
    </div>
  );
}; 