import { useState, useMemo } from 'react';

/**
 * 用于单词分页、打乱、搜索过滤的通用 hook
 * @param words 原始单词数组
 * @param wordsPerPage 每页单词数
 */
export function useWordPagination<T extends { word: string; translation?: string }>(words: T[], wordsPerPage: number) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isShuffled, setIsShuffled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 过滤
  const filteredWords = useMemo(() => {
    if (!searchQuery.trim()) return words;
    const lower = searchQuery.toLowerCase();
    return words.filter(w =>
      w.word.toLowerCase().includes(lower) ||
      (w.translation && w.translation.includes(searchQuery))
    );
  }, [words, searchQuery]);

  // 打乱
  const shuffledWords = useMemo(() => {
    if (!isShuffled) return filteredWords;
    const arr = [...filteredWords];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [filteredWords, isShuffled]);

  // 分页
  const totalPages = Math.ceil(shuffledWords.length / wordsPerPage);
  const wordsToShow = useMemo(() => {
    const start = (currentPage - 1) * wordsPerPage;
    return shuffledWords.slice(start, start + wordsPerPage);
  }, [shuffledWords, currentPage, wordsPerPage]);

  // 切换页码、打乱、搜索
  const goToPage = (page: number) => setCurrentPage(page);
  const toggleShuffle = () => setIsShuffled(s => !s);
  const setSearch = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  return {
    wordsToShow,
    totalPages,
    currentPage,
    goToPage,
    isShuffled,
    toggleShuffle,
    searchQuery,
    setSearch,
    setCurrentPage,
    setIsShuffled,
    setSearchQuery,
    filteredWords,
    shuffledWords,
  };
} 