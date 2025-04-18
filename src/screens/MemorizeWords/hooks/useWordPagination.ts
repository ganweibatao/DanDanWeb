import { useState, useMemo } from 'react';

/**
 * 用于单词分页、搜索过滤的通用 hook（打乱由外部 hook 控制）
 * @param words 原始单词数组
 * @param wordsPerPage 每页单词数
 * @param isShuffled 是否打乱（由外部控制）
 * @param shuffledWords 打乱后的数组（由外部控制）
 */
export function useWordPagination<T extends { word: string; translation?: string }>(
  words: T[],
  wordsPerPage: number,
  isShuffled?: boolean,
  shuffledWords?: T[]
) {
  const [currentPage, setCurrentPage] = useState(1);
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

  // 分页（根据 isShuffled 和 shuffledWords 决定数据源）
  const dataSource = isShuffled && shuffledWords ? shuffledWords : filteredWords;
  const totalPages = Math.ceil(dataSource.length / wordsPerPage);
  const wordsToShow = useMemo(() => {
    const start = (currentPage - 1) * wordsPerPage;
    return dataSource.slice(start, start + wordsPerPage);
  }, [dataSource, currentPage, wordsPerPage]);

  // 切换页码、搜索
  const goToPage = (page: number) => setCurrentPage(page);
  const setSearch = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  return {
    wordsToShow,
    totalPages,
    currentPage,
    goToPage,
    searchQuery,
    setSearch,
    setCurrentPage,
    setSearchQuery,
    filteredWords,
    dataSource,
  };
} 