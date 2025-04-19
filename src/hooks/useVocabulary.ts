// 职责: 提供一个核心的自定义 React Hook (useVocabulary)，封装了与词库管理相关的所有状态和逻辑。
// 包含内容:
// 管理选中的词库 (selectedBooks) 和当前学习的词库 (currentLearningBook) 状态 (使用 useLocalStorage)。
// 管理每日学习单词数 (wordsPerDay) 状态 (使用 useLocalStorage)。
// 管理词库搜索逻辑（包括搜索词 searchQuery、加载状态 isLoading、搜索结果 vocabularyBooks、错误状态 error），并使用 useDebounce。
// 从服务器同步用户偏好设置。
// 计算学习计划 (learningPlan)。
// 生成下拉菜单的显示文本 (dropdownTriggerText)。
// 提供保存用户偏好设置到服务器的方法 (saveUserPreferences)。
// 目的: 将词库相关的复杂逻辑从 Students.tsx 组件中抽离出来，使组件代码更简洁、逻辑更清晰、可复用性更高
import { useState, useEffect, useMemo } from 'react';
import { VocabularyBook as ApiVocabularyBook, vocabularyService } from '../services/api';
export type { ApiVocabularyBook as VocabularyBook };
import { useDebounce } from './useDebounce';
import { useLocalStorage } from './useLocalStorage';

/**
 * 自定义 hook，用于处理词库相关的操作
 * @returns 词库相关的状态和方法
 */
export function useVocabulary() {
  // 使用 useLocalStorage 管理本地存储
  const [selectedBooks, setSelectedBooks] = useLocalStorage<ApiVocabularyBook[]>('selectedBooks', []);
  const [currentLearningBook, setCurrentLearningBook] = useLocalStorage<ApiVocabularyBook | null>('currentLearningBook', null);
  const [wordsPerDay, setWordsPerDay] = useLocalStorage<number>('wordsPerDay', 20);
  
  // 搜索相关状态
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [vocabularyBooks, setVocabularyBooks] = useState<ApiVocabularyBook[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // 使用防抖处理搜索
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  /*
  // 从服务器同步用户偏好设置 - 暂时禁用
  useEffect(() => {
    const syncUserPreferences = async () => {
      try {
        const preferences = await vocabularyService.getUserVocabularyPreferences();
        if (preferences.bookIds.length > 0) {
          // 获取完整的词库信息
          const books = await vocabularyService.getVocabularyBooks();
          const selectedBookObjects = books.filter((book: ApiVocabularyBook) => 
            preferences.bookIds.includes(book.id)
          );
          setSelectedBooks(selectedBookObjects);
          
          // 如果有当前学习的词库，也更新它
          if (preferences.bookIds.length > 0) {
            const currentBook = selectedBookObjects[0];
            setCurrentLearningBook(currentBook);
          }
        }
      } catch (error) {
        console.error('同步用户偏好设置失败（已禁用）:', error);
      }
    };

    syncUserPreferences();
  }, []);
  */

  // 初始加载词库列表
  useEffect(() => {
    const loadInitialBooks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const books = await vocabularyService.getVocabularyBooks(5); // 获取前5本
        setVocabularyBooks(books);
      } catch (err) {
        setError('加载词库失败，请稍后重试');
        console.error('加载词库失败:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialBooks();
  }, []);

  // 处理搜索
  useEffect(() => {
    const searchBooks = async () => {
      if (!debouncedSearchQuery) {
        // 如果搜索词为空，加载初始词库列表
        const books = await vocabularyService.getVocabularyBooks(5);
        setVocabularyBooks(books);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const results = await vocabularyService.searchVocabularyBooks(debouncedSearchQuery);
        setVocabularyBooks(results);
      } catch (err) {
        setError('搜索词库失败，请稍后重试');
        console.error('搜索词库失败:', err);
      } finally {
        setIsLoading(false);
      }
    };

    searchBooks();
  }, [debouncedSearchQuery]);

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
    // 状态
    selectedBooks,
    setSelectedBooks,
    currentLearningBook,
    setCurrentLearningBook,
    wordsPerDay,
    setWordsPerDay,
    searchQuery,
    setSearchQuery,
    isLoading,
    vocabularyBooks,
    error,
    learningPlan,
    dropdownTriggerText,
    
    // 方法
    saveUserPreferences
  };
} 