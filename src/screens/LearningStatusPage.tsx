import React, { useState, useMemo } from 'react';
import { Sidebar } from './Students/StudentsSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { BookOpenIcon, CheckIcon, FlameIcon, ZapIcon, GemIcon, CalendarCheck2Icon } from 'lucide-react';

// 词库分类
const categories = [
  { key: 'primary', label: '小学' },
  { key: 'junior', label: '初中' },
  { key: 'senior', label: '高中' },
  { key: 'exam', label: '考研/托福' },
  { key: 'other', label: '其他' },
];

// 模拟词库数据
const allBooks = [
  { id: '1', name: '小学英语基础词库', wordCount: 800, level: '小学', description: '适合小学阶段的英语词汇', category: 'primary' },
  { id: '2', name: '初中英语核心词库', wordCount: 1500, level: '初中', description: '初中必备英语词汇', category: 'junior' },
  { id: '3', name: '高中英语词汇大全', wordCount: 3500, level: '高中', description: '高中阶段必备词汇', category: 'senior' },
  { id: '4', name: '考研英语词汇', wordCount: 5500, level: '考研', description: '考研英语专用词汇', category: 'exam' },
  { id: '5', name: '托福核心词汇', wordCount: 4000, level: '托福', description: '托福考试常见词汇', category: 'exam' },
  { id: '6', name: '商务英语词汇', wordCount: 2500, level: '商务', description: '职场常用英语词汇', category: 'other' },
];

// 模拟学习统计数据
type StudyStats = {
  streak: number; // 连续总天数
  totalCheckIn: number; // 累计打卡天数
  xp: number; // 总经验
  wordsLearned: number; // 已学单词
  session: {
    wordsToday: number; // 今日学习单词
    xpToday: number; // 今日获得经验
    checkInToday: boolean; // 今日是否打卡
  }
};

const mockStats: StudyStats = {
  streak: 7,
  totalCheckIn: 20,
  xp: 1230,
  wordsLearned: 350,
  session: {
    wordsToday: 30,
    xpToday: 60,
    checkInToday: true,
  },
};

export const LearningStatusPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('primary');
  const [search, setSearch] = useState('');
  const [selectedBook, setSelectedBook] = useState<any | null>(null);
  const [wordsPerDay, setWordsPerDay] = useState(50);
  const [dialogOpen, setDialogOpen] = useState(false);

  // 分类过滤+搜索
  const filteredBooks = useMemo(() => {
    return allBooks.filter(
      b => b.category === selectedCategory && b.name.includes(search)
    );
  }, [selectedCategory, search]);

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 font-sans">
      <Sidebar />
      <main className="flex-1 p-10 overflow-y-auto bg-gray-50 dark:bg-gray-800">
        {/* 学习统计板块 */}
        <section className="mb-10">
          <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">学习统计</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-2">
            <Card className="bg-white dark:bg-gray-700 shadow rounded-lg">
              <CardContent className="flex items-center p-4 space-x-3">
                <FlameIcon className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{mockStats.streak}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">连续总天数</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-700 shadow rounded-lg">
              <CardContent className="flex items-center p-4 space-x-3">
                <CalendarCheck2Icon className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{mockStats.totalCheckIn}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">累计打卡天数</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-700 shadow rounded-lg">
              <CardContent className="flex items-center p-4 space-x-3">
                <ZapIcon className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{mockStats.xp}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">总经验</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-700 shadow rounded-lg">
              <CardContent className="flex items-center p-4 space-x-3">
                <BookOpenIcon className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{mockStats.wordsLearned}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">已学单词</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-700 shadow rounded-lg">
              <CardContent className="flex flex-col items-start p-4">
                <div className="flex items-center mb-2">
                  <GemIcon className="w-6 h-6 text-blue-500 mr-2" />
                  <span className="font-semibold text-gray-700 dark:text-gray-200">本次学习情况</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  今日单词：<span className="font-bold text-base text-gray-800 dark:text-gray-100">{mockStats.session.wordsToday}</span><br />
                  今日经验：<span className="font-bold text-base text-gray-800 dark:text-gray-100">{mockStats.session.xpToday}</span><br />
                  今日打卡：<span className={`font-bold text-base ${mockStats.session.checkInToday ? 'text-green-500' : 'text-red-500'}`}>{mockStats.session.checkInToday ? '已打卡' : '未打卡'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
        {/* 词库选择板块 */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">词库选择</h2>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
            <TabsList className="bg-white dark:bg-gray-700 rounded-lg shadow p-1 flex">
              {categories.map(cat => (
                <TabsTrigger key={cat.key} value={cat.key} className="px-4 py-2 text-base font-medium">
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          {/* 搜索框 */}
          <div className="mb-6 max-w-md">
            <Input
              placeholder="搜索词库..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            />
          </div>
          {/* 词库列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.length === 0 && (
              <div className="col-span-full text-center text-gray-400 dark:text-gray-500">暂无词库</div>
            )}
            {filteredBooks.map(book => (
              <Card key={book.id} className="bg-white dark:bg-gray-700 shadow rounded-lg flex flex-col justify-between">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BookOpenIcon className="w-6 h-6 text-blue-500" />
                    <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">{book.name}</CardTitle>
                  </div>
                  <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded">{book.level}</span>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">{book.description}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-400 mb-4">单词量：{book.wordCount}</div>
                  <Dialog open={dialogOpen && selectedBook?.id === book.id} onOpenChange={open => { setDialogOpen(open); if (!open) setSelectedBook(null); }}>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full bg-green-500 hover:bg-green-600 text-white mt-2"
                        onClick={() => { setSelectedBook(book); setDialogOpen(true); }}
                      >
                        加入学习计划
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm">
                      <DialogHeader>
                        <DialogTitle className="text-lg font-bold mb-2">设置每日学习单词量</DialogTitle>
                      </DialogHeader>
                      <div className="mb-4">
                        <Input
                          type="number"
                          min={10}
                          max={book.wordCount}
                          value={wordsPerDay}
                          onChange={e => setWordsPerDay(Number(e.target.value))}
                          className="bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                        />
                        <div className="text-xs text-gray-400 mt-1">建议每日10~200，最多{book.wordCount}个</div>
                      </div>
                      <Button
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                        onClick={() => { setDialogOpen(false); setSelectedBook(null); }}
                      >
                        <CheckIcon className="w-4 h-4 mr-1 inline" /> 确认加入
                      </Button>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}; 