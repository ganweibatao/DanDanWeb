import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Sidebar } from './Students/StudentsSidebar';
import { ProfileSidebar } from '../components/layout/ProfileSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { BookOpenIcon, CheckIcon, UploadIcon, EyeIcon } from 'lucide-react';
import { useVocabulary, VocabularyBook } from '../hooks/useVocabulary';
import { createOrUpdateLearningPlan, LearningPlanPayload, LearningPlan } from '../services/learningApi';
import { useToast } from '../hooks/use-toast';
import { useStudentPlans } from '../hooks/useStudentPlans';
import { ImportVocabularyDialog } from '../components/ImportVocabularyDialog';
import { vocabularyService, VocabularyWord } from '../services/api';
import InfiniteScroll from 'react-infinite-scroll-component';

// 词库分类
const categories = [
  { key: 'primary', label: '小学', apiCategory: 'primary' },
  { key: 'junior', label: '初中', apiCategory: 'junior' },
  { key: 'senior', label: '高中', apiCategory: 'senior' },
  { key: 'exam', label: '考研/托福', apiCategory: 'exam' },
  { key: 'other', label: '其他', apiCategory: 'other' },
];

export const VocabularyPage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Vocabulary Hook
  const {
    vocabularyBooks: allBooks,
    isLoading: isLoadingBooks,
    error: booksError,
    limit,
    setLimit,
  } = useVocabulary();

  // State for UI control
  const [selectedCategory, setSelectedCategory] = useState('primary');
  const [selectedBook, setSelectedBook] = useState<VocabularyBook | null>(null);
  const [wordsPerDay, setWordsPerDay] = useState(50);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  
  // 查看单词相关状态
  const [viewWordsDialogOpen, setViewWordsDialogOpen] = useState(false);
  const [selectedBookForViewing, setSelectedBookForViewing] = useState<VocabularyBook | null>(null);
  const [bookWords, setBookWords] = useState<VocabularyWord[]>([]);
  const [loadingWords, setLoadingWords] = useState(false);

  // 显示所有词库，但过滤掉导入失败的词库（单词量为0）
  const filteredBooks = useMemo(() => {
    return allBooks.filter(book => book.word_count > 0);
  }, [allBooks]);

  // --- Mutation for Adding Learning Plan ---
  const addPlanMutation = useMutation<LearningPlan, Error, LearningPlanPayload>({
    mutationFn: createOrUpdateLearningPlan,
    onSuccess: (data) => {
      toast({
        title: "成功",
        description: `已为学生添加《${selectedBook?.name}》学习计划。`,
      });
      queryClient.invalidateQueries({ queryKey: ['studentPlans', Number(studentId)] });
      setDialogOpen(false);
      setSelectedBook(null);
    },
    onError: (error) => {
      toast({
        title: "添加失败",
        description: error.message || "无法添加学习计划，请稍后重试。",
      });
    },
  });
  // --- End Mutation ---

  // Handle Confirm Add Plan
  const handleConfirmAddPlan = () => {
    if (!studentId) {
      toast({ title: "错误", description: "无法获取学生ID" });
      return;
    }
    if (!selectedBook) {
      toast({ title: "错误", description: "未选择词库" });
      return;
    }

    const planPayload: LearningPlanPayload = {
      student_id: Number(studentId),
      vocabulary_book_id: selectedBook.id,
      words_per_day: wordsPerDay,
      is_active: true,
      start_date: new Date().toISOString().split('T')[0],
    };

    addPlanMutation.mutate(planPayload);
  };

  useEffect(() => {
    if (dialogOpen && selectedBook) {
      setWordsPerDay(50);
    }
  }, [dialogOpen, selectedBook]);

  // 处理查看词库单词
  const handleViewWords = async (book: VocabularyBook) => {
    setSelectedBookForViewing(book);
    setViewWordsDialogOpen(true);
    setLoadingWords(true);
    
    try {
      const result = await vocabularyService.getVocabularyWords(book.id, 1, 200); // 获取前200个单词
      setBookWords(result.words);
    } catch (error) {
      toast({
        title: "加载失败",
        description: "无法加载词库单词，请稍后重试",
      });
      setBookWords([]);
    } finally {
      setLoadingWords(false);
    }
  };

  // 关闭查看单词对话框
  const handleCloseViewWords = () => {
    setViewWordsDialogOpen(false);
    setSelectedBookForViewing(null);
    setBookWords([]);
    setLoadingWords(false);
  };



  // 引入学生的已有计划，通过 hook 获取
  const { allStudentPlans, currentlySelectedPlanId } = useStudentPlans(studentId);

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 font-sans">
      <Sidebar />
      <main className="flex-1 p-10 overflow-y-auto bg-gray-50 dark:bg-gray-800">
        <section>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">选择词库</h2>
            <Button
              onClick={() => setImportDialogOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white flex items-center space-x-2"
            >
              <UploadIcon className="w-4 h-4" />
              <span>导入自定义词库</span>
            </Button>
          </div>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
             <TabsList className="bg-white dark:bg-gray-700 rounded-lg shadow p-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1">
              {categories.map(cat => (
                <TabsTrigger key={cat.key} value={cat.key} className="px-3 py-2 text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                  {cat.label}
                </TabsTrigger>
              ))}
             </TabsList>
          </Tabs>

          <InfiniteScroll
            dataLength={filteredBooks.length}
            next={() => setLimit(limit + 5)}
            hasMore={filteredBooks.length >= limit}
            loader={<div className="col-span-full text-center text-gray-500">加载更多...</div>}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {isLoadingBooks && (
              <div className="col-span-full text-center text-gray-500">加载中...</div>
            )}
            {booksError && (
              <div className="col-span-full text-center text-red-500 dark:text-red-400">加载词库失败: {booksError}</div>
            )}
            {!isLoadingBooks && !booksError && filteredBooks.length === 0 && (
              <div className="col-span-full text-center text-gray-400 dark:text-gray-500">
                暂无词库
              </div>
            )}
            {!isLoadingBooks && !booksError && filteredBooks.map((book: VocabularyBook) => {
              const isJoined = allStudentPlans?.some(plan => plan.vocabulary_book.id === book.id && plan.is_active);
              return (
                <Card key={book.id} className="bg-white dark:bg-gray-700 shadow-md rounded-lg overflow-hidden h-full flex flex-col">
                  <div className="w-full h-32 bg-gray-100 dark:bg-gray-600 overflow-hidden">
                    {book.cover_image ? (
                      <img src={book.cover_image} alt={book.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                        <BookOpenIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                  </div>
                  <CardHeader className="px-4 py-3 flex flex-row items-center justify-between border-b dark:border-gray-600">
                    {isJoined && (
                      <span className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">已加入</span>
                    )}
                    <div className="flex items-center space-x-2 flex-grow min-w-0">
                      {/* <BookOpenIcon className="w-5 h-5 text-blue-500" /> */}
                      <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-100" title={book.name}>{book.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 flex-1 flex flex-col justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">单词量：{book.word_count}</div>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full text-blue-600 border-blue-500 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-500 dark:hover:bg-blue-700"
                        onClick={() => handleViewWords(book)}
                      >
                        <EyeIcon className="w-4 h-4 mr-2" />
                        查看单词
                      </Button>
                      <Dialog open={dialogOpen && selectedBook?.id === book.id} onOpenChange={open => { setDialogOpen(open); if (!open) setSelectedBook(null); }}>
                        <DialogTrigger asChild>
                          <Button
                            variant={isJoined ? "outline" : "default"}
                            className={`w-full ${isJoined ? "border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-700 dark:hover:text-white" : "bg-green-500 hover:bg-green-600 text-white"}`}
                            onClick={() => { 
                              if (!isJoined) {
                                setSelectedBook(book); 
                                setDialogOpen(true); 
                              }
                            }}
                            disabled={addPlanMutation.isPending || isJoined}
                          >
                            {isJoined ? "已在计划中" : "加入学习计划"}
                          </Button>
                        </DialogTrigger>
                       <DialogContent className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm">
                        <DialogHeader>
                          <DialogTitle className="text-lg font-bold mb-2">设置《{selectedBook?.name}》每日学习量</DialogTitle>
                        </DialogHeader>
                        <div className="mb-4">
                          <Input
                            type="number"
                            min={10}
                            max={selectedBook?.word_count ?? 200}
                            value={wordsPerDay}
                            onChange={e => setWordsPerDay(Math.max(10, Number(e.target.value)))}
                            className="bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                            disabled={addPlanMutation.isPending}
                          />
                          <div className="text-xs text-gray-400 mt-1">建议每日10~200，最多{selectedBook?.word_count ?? 'N/A'}个</div>
                        </div>
                        <Button
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                          onClick={handleConfirmAddPlan}
                          disabled={addPlanMutation.isPending}
                        >
                          {addPlanMutation.isPending ? '正在添加...' : <> <CheckIcon className="w-4 h-4 mr-1 inline" /> 确认加入 </>}
                        </Button>
                       </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </InfiniteScroll>
        </section>
      </main>
      <ProfileSidebar />
      
      {/* 导入词库对话框 */}
      <ImportVocabularyDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
      />
      
            {/* 查看单词对话框 */}
      <Dialog open={viewWordsDialogOpen} onOpenChange={handleCloseViewWords}>
        <DialogContent className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-6xl max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold mb-4">
              {selectedBookForViewing?.name} - 单词列表
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            {loadingWords ? (
              <div className="text-center py-8">
                <div className="text-gray-500">加载中...</div>
              </div>
            ) : bookWords.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500">暂无单词</div>
              </div>
            ) : (
              <div className="space-y-1">
                {bookWords.map((word, index) => (
                  <div
                    key={word.id || index}
                    className="grid grid-cols-12 gap-4 py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600"
                  >
                    {/* 序号 */}
                    <div className="col-span-1 text-sm text-gray-400 dark:text-gray-500 flex items-center">
                      {index + 1}
                    </div>
                    
                    {/* 英文单词 */}
                    <div className="col-span-4 flex items-center">
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {word.word || '未知单词'}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          {word.pronunciation && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              [{word.pronunciation}]
                            </span>
                          )}
                          {word.part_of_speech && (
                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded dark:bg-blue-900 dark:text-blue-200">
                              {word.part_of_speech}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* 释义 */}
                    <div className="col-span-7 flex items-start pt-1">
                      <div>
                        {word.translation && (
                          <div className="text-gray-700 dark:text-gray-300 mb-1">
                            {word.translation}
                          </div>
                        )}
                        {word.example && (
                          <div className="text-xs text-gray-600 dark:text-gray-400 italic">
                            {word.example}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {bookWords.length > 0 && (
            <div className="mt-4 text-center text-sm text-gray-500">
              显示前 {bookWords.length} 个单词 / 总共 {selectedBookForViewing?.word_count} 个单词
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}; 