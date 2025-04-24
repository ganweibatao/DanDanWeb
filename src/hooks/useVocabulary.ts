import { useState, useMemo } from 'react';
import { useQuery, QueryFunctionContext, keepPreviousData } from '@tanstack/react-query';
import { VocabularyBook as ApiVocabularyBook, vocabularyService } from '../services/api';
export type { ApiVocabularyBook as VocabularyBook };
import { useDebounce } from './useDebounce';
import { useLocalStorage } from './useLocalStorage';

const VOCABULARY_BOOKS_QUERY_KEY_BASE = 'vocabularyBooks';

// 定义新的 Query Key 类型，包含搜索查询和分页
type VocabularyBooksQueryKey = [string, { searchQuery: string; limit: number }];

// 定义新的 Query Function，根据搜索查询和分页决定调用哪个 API
const fetchVocabularyBooksQueryFn = async ({ queryKey }: QueryFunctionContext<VocabularyBooksQueryKey>): Promise<ApiVocabularyBook[]> => {
  const [, { searchQuery, limit }] = queryKey;
  try {
    if (searchQuery) {
      // 执行搜索
      return await vocabularyService.searchVocabularyBooks(searchQuery);
    } else {
      // 获取分页列表
      return await vocabularyService.getVocabularyBooks(limit);
    }
  } catch (error) {
    console.error('获取词库数据失败:', error);
    throw new Error(searchQuery ? '搜索词库失败' : '加载词库列表失败');
  }
};

/**
 * 自定义 hook，用于处理词库相关的操作（已整合 React Query）
 * @returns 词库相关的状态和方法
 */
export function useVocabulary() {
  // 分页限制
  const [limit, setLimit] = useState(5);
  // 使用 useLocalStorage 管理本地存储
  const [selectedBooks, setSelectedBooks] = useLocalStorage<ApiVocabularyBook[]>('selectedBooks', []);
  const [currentLearningBook, setCurrentLearningBook] = useLocalStorage<ApiVocabularyBook | null>('currentLearningBook', null);
  const [wordsPerDay, setWordsPerDay] = useLocalStorage<number>('wordsPerDay', 20);
  
  // 搜索相关状态 - 只保留 searchQuery
  const [searchQuery, setSearchQuery] = useState('');
  
  // 使用防抖处理搜索
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // 使用 React Query 获取词库列表或搜索结果
  const {
    data: vocabularyBooks = [],
    isLoading,
    error,
  } = useQuery<ApiVocabularyBook[], Error, ApiVocabularyBook[], VocabularyBooksQueryKey>({
    // Query Key 依赖于防抖后的搜索词和分页
    queryKey: [VOCABULARY_BOOKS_QUERY_KEY_BASE, { searchQuery: debouncedSearchQuery, limit }],
    queryFn: fetchVocabularyBooksQueryFn,
    staleTime: 30 * 60 * 1000, // 缓存30分钟
    placeholderData: keepPreviousData,
  });

  // 保存用户偏好设置到服务器
  const saveUserPreferences = async (newWordsPerDay?: number) => {
    const wordsToSave = newWordsPerDay !== undefined ? newWordsPerDay : wordsPerDay;
    try {
      await vocabularyService.saveUserVocabularyPreferences(
        selectedBooks.map(book => book.id),
        wordsToSave
      );
      return true;
    } catch (error) {
      console.error('保存用户偏好设置失败:', error);
      return false;
    }
  };

  // 计算学习计划
  const learningPlan = useMemo(() => {
    if (!currentLearningBook) return { totalDays: 0, learningDays: 0, listsCount: 0, wordsPerList: 0 };
    
    const totalWordCount = currentLearningBook.word_count;
    const wordsPerList = wordsPerDay > 0 ? wordsPerDay : 1; // 避免除以零
    const listsCount = Math.ceil(totalWordCount / wordsPerList);
    const learningDays = listsCount;
    const lastReviewDay = listsCount > 0 ? listsCount + 15 : 0; // 假设最长复习周期为15天
    const totalDays = lastReviewDay;
    
    return { totalDays, learningDays, listsCount, wordsPerList };
  }, [currentLearningBook, wordsPerDay]);

  // 下拉菜单触发文本
  const dropdownTriggerText = useMemo(() => {
    if (selectedBooks.length === 0) {
      return "请选择词库...";
    } else if (selectedBooks.length === 1) {
      return selectedBooks[0].name;
    } else {
      return `${selectedBooks.length} 本已选`;
    }
  }, [selectedBooks]);

  return {
    // 本地存储状态
    selectedBooks,
    setSelectedBooks,
    currentLearningBook,
    setCurrentLearningBook,
    wordsPerDay,
    setWordsPerDay,
    // 搜索状态
    searchQuery,
    setSearchQuery,
    // 分页状态
    limit,
    setLimit,
    // 查询结果状态
    vocabularyBooks,
    isLoading,
    error: error ? error.message : null,
    // 派生数据与方法
    learningPlan,
    dropdownTriggerText,
    saveUserPreferences,
  };
} 