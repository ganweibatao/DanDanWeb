import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Sidebar } from './Students/StudentsSidebar';
import { ProfileSidebar } from '../components/layout/ProfileSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { BookOpenIcon, UploadIcon, EyeIcon, TrashIcon, CalendarIcon, EditIcon, SaveIcon, XIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useVocabulary, VocabularyBook } from '../hooks/useVocabulary';
import { createOrUpdateLearningPlan, deleteLearningPlan, LearningPlanPayload, LearningPlan } from '../services/learningApi';
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
  const navigate = useNavigate();

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
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  
  // 查看单词相关状态
  const [viewWordsDialogOpen, setViewWordsDialogOpen] = useState(false);
  const [selectedBookForViewing, setSelectedBookForViewing] = useState<VocabularyBook | null>(null);
  const [bookWords, setBookWords] = useState<VocabularyWord[]>([]);
  const [loadingWords, setLoadingWords] = useState(false);
  
  // 分页相关状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalWords, setTotalWords] = useState(0);
  const [pageSize] = useState(20); // 每页显示20个单词
  
  // 编辑相关状态
  const [editingWordId, setEditingWordId] = useState<number | null>(null);
  const [editingWord, setEditingWord] = useState<Partial<VocabularyWord>>({});
  
  // 删除确认对话框状态
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<{ bookId: number; bookName: string } | null>(null);

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
        description: `已为学生添加学习计划。`,
      });
      queryClient.invalidateQueries({ queryKey: ['studentPlans', Number(studentId)] });
      // 强制重新获取数据
      queryClient.refetchQueries({ queryKey: ['studentPlans', Number(studentId)] });
    },
    onError: (error) => {
      toast({
        title: "添加失败",
        description: error.message || "无法添加学习计划，请稍后重试。",
      });
    },
  });
  
  // --- Mutation for Deleting Learning Plan ---
  const deletePlanMutation = useMutation<void, Error, number>({
    mutationFn: deleteLearningPlan,
    onSuccess: () => {
      toast({
        title: "成功",
        description: "学习计划已删除。",
      });
      queryClient.invalidateQueries({ queryKey: ['studentPlans', Number(studentId)] });
      // 强制重新获取数据
      queryClient.refetchQueries({ queryKey: ['studentPlans', Number(studentId)] });
    },
    onError: (error) => {
      toast({
        title: "删除失败",
        description: error.message || "无法删除学习计划，请稍后重试。",
      });
    },
  });
  // --- End Mutations ---

  // Handle Add Plan
  const handleAddPlan = (book: VocabularyBook) => {
    if (!studentId) {
      toast({ title: "错误", description: "无法获取学生ID" });
      return;
    }

    const planPayload: LearningPlanPayload = {
      student_id: Number(studentId),
      vocabulary_book_id: book.id,
      is_active: true,
      start_date: new Date().toISOString().split('T')[0],
    };

    addPlanMutation.mutate(planPayload);
  };

  // Handle Delete Plan - 显示确认对话框
  const handleDeletePlan = (bookId: number) => {
    const book = allBooks.find(b => b.id === bookId);
    if (book) {
      setPlanToDelete({ bookId, bookName: book.name });
      setDeleteDialogOpen(true);
    }
  };

  // 确认删除计划
  const confirmDeletePlan = () => {
    if (planToDelete) {
      const plan = allStudentPlans?.find(plan => plan.vocabulary_book.id === planToDelete.bookId && plan.is_active);
      if (plan) {
        deletePlanMutation.mutate(plan.id);
      }
    }
    setDeleteDialogOpen(false);
    setPlanToDelete(null);
  };

  // 更新单词的mutation
  const updateWordMutation = useMutation<VocabularyWord, Error, { wordId: number; data: Partial<VocabularyWord> }>({
    mutationFn: ({ wordId, data }) => {
      // 过滤掉null值，转换为API期望的格式
      const updateData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, value === null ? undefined : value])
      ) as { word?: string; translation?: string; phonetic?: string; part_of_speech?: string; example?: string };
      return vocabularyService.updateVocabularyWord(wordId, updateData);
    },
    onSuccess: (updatedWord) => {
      toast({
        title: "成功",
        description: "单词已更新",
      });
      // 更新本地状态中的单词
      setBookWords(prevWords => 
        prevWords.map(word => 
          word.id === updatedWord.id ? updatedWord : word
        )
      );
      setEditingWordId(null);
      setEditingWord({});
    },
    onError: (error) => {
      toast({
        title: "更新失败",
        description: error.message || "无法更新单词，请稍后重试。",
      });
    },
  });

  // 处理查看词库单词（支持分页）
  const handleViewWords = async (book: VocabularyBook) => {
    setSelectedBookForViewing(book);
    setViewWordsDialogOpen(true);
    setCurrentPage(1);
    await loadWords(book.id, 1);
  };

  // 加载指定页的单词
  const loadWords = async (bookId: number, page: number) => {
    setLoadingWords(true);
    
    try {
      const result = await vocabularyService.getVocabularyWords(bookId, page, pageSize);
      setBookWords(result.words);
      setTotalWords(result.total);
      setCurrentPage(page);
    } catch (error) {
      toast({
        title: "加载失败",
        description: "无法加载词库单词，请稍后重试",
      });
      setBookWords([]);
      setTotalWords(0);
    } finally {
      setLoadingWords(false);
    }
  };

  // 处理翻页
  const handlePageChange = async (page: number) => {
    if (selectedBookForViewing) {
      await loadWords(selectedBookForViewing.id, page);
    }
  };

  // 开始编辑单词
  const handleEditWord = (word: VocabularyWord) => {
    setEditingWordId(word.id);
    setEditingWord({
      word: word.word,
      translation: word.translation || '',
      pronunciation: word.pronunciation || '',
      part_of_speech: word.part_of_speech || '',
      example: word.example || '',
    });
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingWordId(null);
    setEditingWord({});
  };

  // 保存编辑
  const handleSaveEdit = () => {
    if (editingWordId && editingWord) {
      updateWordMutation.mutate({
        wordId: editingWordId,
        data: editingWord
      });
    }
  };

  // 处理编辑字段变化
  const handleEditFieldChange = (field: keyof VocabularyWord, value: string) => {
    setEditingWord(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 关闭查看单词对话框
  const handleCloseViewWords = () => {
    setViewWordsDialogOpen(false);
    setSelectedBookForViewing(null);
    setBookWords([]);
    setLoadingWords(false);
    setCurrentPage(1);
    setTotalWords(0);
    setEditingWordId(null);
    setEditingWord({});
  };

  // 跳转到学习计划页面
  const handleGoBack = () => {
    navigate(-1); // 返回上一页
  };

  // 引入学生的已有计划，通过 hook 获取
  const { allStudentPlans, currentlySelectedPlanId, handleSelectPlan } = useStudentPlans(studentId);

  // 获取当前选中的计划
  const currentPlan = allStudentPlans?.find(plan => plan.id === currentlySelectedPlanId);

  // 计算总页数
  const totalPages = Math.ceil(totalWords / pageSize);

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 font-sans">
      <Sidebar />
      <main className="flex-1 p-10 overflow-y-auto bg-gray-50 dark:bg-gray-800">
        <section>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">选择词库</h2>
            <div className="flex items-center space-x-3">
              {/* 返回按钮 */}
              <Button
                onClick={handleGoBack}
                variant="outline"
                className="bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200 hover:border-gray-300 flex items-center space-x-2"
              >
                <ChevronLeftIcon className="w-4 h-4" />
                <span>返回</span>
              </Button>
              <Button
                onClick={() => setImportDialogOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white flex items-center space-x-2"
              >
                <UploadIcon className="w-4 h-4" />
                <span>导入自定义词库</span>
              </Button>
            </div>
          </div>

          {/* 学习计划选择器 */}
          {allStudentPlans && allStudentPlans.length > 1 && (
            <div className="mb-6 p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <CalendarIcon className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    当前学习词库：
                  </span>
                  <Select
                    value={currentlySelectedPlanId?.toString() || ''}
                    onValueChange={(value) => {
                      const selectedPlan = allStudentPlans.find(plan => plan.id === parseInt(value));
                      if (selectedPlan) {
                        handleSelectPlan(selectedPlan);
                      }
                    }}
                  >
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="选择学习计划" />
                    </SelectTrigger>
                    <SelectContent>
                      {allStudentPlans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id.toString()}>
                          <span>{plan.vocabulary_book.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {currentPlan && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    开始时间：{new Date(currentPlan.start_date).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          )}

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
              // 调试日志
              if (book.id === 9) { // 假设这是你测试的书籍ID，请根据实际情况修改
                console.log('调试信息:', {
                  bookId: book.id,
                  bookName: book.name,
                  allStudentPlans,
                  isJoined,
                  matchedPlan: allStudentPlans?.find(plan => plan.vocabulary_book.id === book.id)
                });
              }
              return (
                <Card key={book.id} className="bg-white dark:bg-gray-700 shadow-md rounded-lg overflow-hidden h-full flex flex-col">
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
                        className="w-full text-green-600 border-green-500 hover:bg-green-50 dark:text-green-400 dark:border-green-500 dark:hover:bg-green-700"
                        onClick={() => handleViewWords(book)}
                      >
                        <EyeIcon className="w-4 h-4 mr-2" />
                        查看单词
                      </Button>
                      {isJoined ? (
                        <Button
                          variant="outline"
                          className="w-full text-gray-600 border-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:border-gray-500 dark:hover:bg-gray-700 dark:hover:text-white"
                          onClick={() => handleDeletePlan(book.id)}
                          disabled={deletePlanMutation.isPending}
                        >
                          <TrashIcon className="w-4 h-4 mr-2" />
                          {deletePlanMutation.isPending ? "删除中..." : "删除计划"}
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          className="w-full bg-green-500 hover:bg-green-600 text-white"
                          onClick={() => handleAddPlan(book)}
                          disabled={addPlanMutation.isPending}
                        >
                          {addPlanMutation.isPending ? '正在添加...' : '加入学习计划'}
                        </Button>
                      )}
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

      {/* 删除计划确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除学习计划</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除 "{planToDelete?.bookName}" 的学习计划吗？
              <br />
              此操作无法撤销，学习进度将会丢失。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeletePlan}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deletePlanMutation.isPending ? "删除中..." : "确认删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* 查看单词对话框 */}
      <Dialog open={viewWordsDialogOpen} onOpenChange={handleCloseViewWords}>
        <DialogContent className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold mb-4">
              {selectedBookForViewing?.name} - 单词列表
            </DialogTitle>
          </DialogHeader>
          
          {/* 分页控件 - 顶部 */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mb-4 p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loadingWords}
              >
                <ChevronLeftIcon className="w-4 h-4" />
                上一页
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                第 {currentPage} 页 / 共 {totalPages} 页 (总计 {totalWords} 个单词)
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loadingWords}
              >
                下一页
                <ChevronRightIcon className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          <div className="max-h-[60vh] overflow-y-auto">
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
                {bookWords.map((word, index) => {
                  const isEditing = editingWordId === word.id;
                  const globalIndex = (currentPage - 1) * pageSize + index + 1;
                  
                  return (
                    <div
                      key={word.id || index}
                      className="grid grid-cols-12 gap-4 py-3 px-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 relative"
                    >
                      {/* 序号 */}
                      <div className="col-span-1 text-sm text-gray-400 dark:text-gray-500 flex items-center">
                        {globalIndex}
                      </div>
                      
                      {/* 英文单词和音标 */}
                      <div className="col-span-4 flex items-start pt-1">
                        <div className="w-full">
                          {isEditing ? (
                            <div className="space-y-2">
                              <Input
                                value={editingWord.word || ''}
                                onChange={(e) => handleEditFieldChange('word', e.target.value)}
                                placeholder="英文单词"
                                className="text-sm"
                              />
                              <Input
                                value={editingWord.pronunciation || ''}
                                onChange={(e) => handleEditFieldChange('pronunciation', e.target.value)}
                                placeholder="音标"
                                className="text-xs"
                              />
                              <Input
                                value={editingWord.part_of_speech || ''}
                                onChange={(e) => handleEditFieldChange('part_of_speech', e.target.value)}
                                placeholder="词性"
                                className="text-xs"
                              />
                            </div>
                          ) : (
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
                          )}
                        </div>
                      </div>
                      
                      {/* 释义和例句 */}
                      <div className="col-span-6 flex items-start pt-1">
                        <div className="w-full">
                          {isEditing ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editingWord.translation || ''}
                                onChange={(e) => handleEditFieldChange('translation', e.target.value)}
                                placeholder="中文释义"
                                className="text-sm min-h-[60px]"
                              />
                              <Textarea
                                value={editingWord.example || ''}
                                onChange={(e) => handleEditFieldChange('example', e.target.value)}
                                placeholder="例句"
                                className="text-xs min-h-[40px]"
                              />
                            </div>
                          ) : (
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
                          )}
                        </div>
                      </div>
                      
                      {/* 操作按钮 */}
                      <div className="col-span-1 flex items-center justify-end">
                        {isEditing ? (
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleSaveEdit}
                              disabled={updateWordMutation.isPending}
                              className="p-1 h-6 w-6"
                            >
                              <SaveIcon className="w-3 h-3 text-green-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelEdit}
                              className="p-1 h-6 w-6"
                            >
                              <XIcon className="w-3 h-3 text-red-600" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditWord(word)}
                            className="p-1 h-6 w-6"
                          >
                            <EditIcon className="w-3 h-3 text-blue-600" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* 分页控件 - 底部 */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-4 p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loadingWords}
              >
                <ChevronLeftIcon className="w-4 h-4" />
                上一页
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                第 {currentPage} 页 / 共 {totalPages} 页
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loadingWords}
              >
                下一页
                <ChevronRightIcon className="w-4 h-4" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}; 