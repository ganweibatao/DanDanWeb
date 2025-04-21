import { useState, useMemo } from 'react';
import { useQuery, QueryFunctionContext, keepPreviousData } from '@tanstack/react-query';
import { VocabularyBook as ApiVocabularyBook, vocabularyService } from '../services/api';
export type { ApiVocabularyBook as VocabularyBook };
import { useDebounce } from './useDebounce';
import { useLocalStorage } from './useLocalStorage';

const VOCABULARY_BOOKS_QUERY_KEY_BASE = 'vocabularyBooks';

// 定义新的 Query Key 类型，包含搜索查询
type VocabularyBooksQueryKey = [string, { searchQuery: string }];

// 定义新的 Query Function，根据搜索查询决定调用哪个 API
const fetchVocabularyBooksQueryFn = async ({ queryKey }: QueryFunctionContext<VocabularyBooksQueryKey>): Promise<ApiVocabularyBook[]> => {
  const [, { searchQuery }] = queryKey;
  try {
    if (searchQuery) {
      // 执行搜索
      return await vocabularyService.searchVocabularyBooks(searchQuery);
    } else {
      // 获取初始列表（前5本）
      return await vocabularyService.getVocabularyBooks(5);
    }
  } catch (error) {
    console.error('获取词库数据失败:', error);
    // 抛出错误，让 React Query 处理
    throw new Error(searchQuery ? '搜索词库失败' : '加载词库列表失败');
  }
};

/**
 * 自定义 hook，用于处理词库相关的操作（已整合 React Query）
 * @returns 词库相关的状态和方法
 */
export function useVocabulary() {
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
    data: vocabularyBooks = [], // 提供默认空数组
    isLoading, // 使用 React Query 的 isLoading
    error, // 使用 React Query 的 error (类型为 Error | null)
  } = useQuery<ApiVocabularyBook[], Error, ApiVocabularyBook[], VocabularyBooksQueryKey>({
    // Query Key 依赖于防抖后的搜索词
    queryKey: [VOCABULARY_BOOKS_QUERY_KEY_BASE, { searchQuery: debouncedSearchQuery }],
    queryFn: fetchVocabularyBooksQueryFn,
    staleTime: 5 * 60 * 1000, // 缓存5分钟
    placeholderData: keepPreviousData, // 在新数据加载时保持旧数据
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
    // 状态 (来自 useLocalStorage)
    selectedBooks,
    setSelectedBooks,
    currentLearningBook,
    setCurrentLearningBook,
    wordsPerDay,
    setWordsPerDay,
    // 状态 (来自 useState)
    searchQuery,
    setSearchQuery,
    // 状态 (来自 useQuery)
    isLoading,
    vocabularyBooks, // 现在直接来自 useQuery 的 data
    error: error ? error.message : null, // 返回错误消息字符串或 null
    // 派生状态
    learningPlan,
    dropdownTriggerText,
    // 方法
    saveUserPreferences
  };
} 