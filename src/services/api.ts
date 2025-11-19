/// <reference types="vite/client" />
import axios, { AxiosError } from 'axios';
import _ from 'lodash';
import axiosRetry from 'axios-retry';
import { AvailableWordsResponse } from './learningApi';

// 导出auth服务
export * from './auth';

export interface VocabularyBook {
  id: number;
  name: string;
  word_count: number;
  cover_image?: string | null; // 可选封面图片路径
  is_system_preset: boolean; // 是否为系统预设书籍
  created_by?: number | null; // 创建者ID，系统预设词库可能为null
}

export interface VocabularyWord {
  id: number;
  book_id: number;
  word: string;
  translation: string | null;
  part_of_speech?: string | null;
  pronunciation?: string | null;
  example?: string | null;
  phonetic?: string | null;
  definition?: string | null;
  word_basic_id?: number; // WordBasic ID，用于标记已知单词
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

// 添加 API 响应类型
interface VocabularyBooksResponse {
  results?: VocabularyBook[];
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api/v1');

// 创建 axios 实例，统一配置
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 修改为30秒，以应对可能的网络延迟
  withCredentials: true, // 确保发送 Cookie (包括微信登录时设置的auth_token Cookie)
  xsrfCookieName: 'csrftoken', // Django 默认的 CSRF cookie 名称
  xsrfHeaderName: 'X-CSRFToken', // Django 默认的 CSRF header 名称
});

// 配置重试机制 - 已启用
axiosRetry(apiClient, { 
  retries: 3, // 重试3次
  retryDelay: (retryCount) => {
    return retryCount * 1000; // 重试延迟，1秒、2秒、3秒
  },
  retryCondition: (error) => {
    // 仅在网络错误或超时时重试
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.code === 'ECONNABORTED';
  }
});

// 请求拦截器，手动添加 CSRF token
apiClient.interceptors.request.use(
  (config) => {
    // NProgress.start();
    
    // 提取 CSRF token 并打印
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];
    
    // 对非 GET 请求手动添加 CSRF token
    if (config.method !== 'get' && csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    
    return config;
  },
  (error) => {
    // NProgress.done();
    return Promise.reject(error);
  }
);

// 响应拦截器，统一处理错误
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // NProgress.done();
    if (error.response?.status === 401) {
      console.error('未授权访问或会话已过期，请重新登录');
      if (!window.location.pathname.startsWith('/login')) { // 避免在登录页重复跳转
        window.location.href = '/login?sessionExpired=true';
      }
    } else {
      console.error('API 请求发生错误:', error.response?.status, error.message);
    }
    return Promise.reject(error);
  }
);

// 错误处理工具函数
export const handleApiError = (error: unknown, defaultMessage: string): never => {
  console.error(defaultMessage, error);
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    // 保留原始的axios错误，这样调用者可以访问response数据
    throw axiosError;
  }
  throw new Error(defaultMessage);
};

export const vocabularyService = {
  // 获取词库列表
  getVocabularyBooks: async (limit?: number): Promise<VocabularyBook[]> => {
    try {
      const url = `vocabulary/books/`;
      const response = await apiClient.get<VocabularyBook[] | VocabularyBooksResponse>(url, {
        params: { limit }
      });
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      return handleApiError(error, '获取词库列表失败');
    }
  },

  // 搜索词库
  searchVocabularyBooks: async (query: string): Promise<VocabularyBook[]> => {
    try {
      const url = `vocabulary/books/`;
      const response = await apiClient.get<VocabularyBook[] | VocabularyBooksResponse>(url, {
        params: { search: query }
      });
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      return handleApiError(error, '搜索词库失败');
    }
  },
  
  // 获取词库详情
  getVocabularyBook: async (bookId: number): Promise<VocabularyBook> => {
    try {
      const url = `vocabulary/books/${bookId}/`;
      const response = await apiClient.get<VocabularyBook>(url);
      return response.data;
    } catch (error) {
      return handleApiError(error, '获取词库详情失败');
    }
  },
  
  // 获取词库中的单词
  getVocabularyWords: async (bookId: number, page = 1, pageSize = 20): Promise<{ words: VocabularyWord[], total: number }> => {
    try {
      const url = `vocabulary/books/${bookId}/words/`;
      const response = await apiClient.get<{ results: VocabularyWord[], count: number }>(url, {
        params: { page, page_size: pageSize }
      });
      
      // 添加调试日志
      if (response.data.results && response.data.results.length > 0) {
        const firstWord = response.data.results[0];
        console.log(`[API] 获取词书 ${bookId} 第 ${page} 页，共 ${response.data.results.length} 个单词`);
        console.log(`[API] 第一个单词示例:`, {
          id: firstWord.id,
          word: firstWord.word,
          word_basic_id: firstWord.word_basic_id,
          translation: firstWord.translation
        });
      }
      
      return { 
        words: response.data.results || [], 
        total: response.data.count || 0 
      };
    } catch (error) {
      return handleApiError(error, '获取词库单词失败');
    }
  },
  
  // 保存用户选择的词库
  saveUserVocabularyPreferences: async (bookIds: number[], wordsPerDay: number): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      const url = `vocabulary/preferences/`;
      const response = await apiClient.post<ApiResponse<{ success: boolean }>>(url, {
        book_ids: bookIds,
        words_per_day: wordsPerDay
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, '保存词库偏好设置失败');
    }
  },
  
  // 获取用户词库偏好设置
  getUserVocabularyPreferences: async (): Promise<{ bookIds: number[], wordsPerDay: number }> => {
    try {
      const url = `vocabulary/preferences/`;
      const response = await apiClient.get<{ book_ids: number[], words_per_day: number }>(url);
      return {
        bookIds: response.data.book_ids || [],
        wordsPerDay: response.data.words_per_day || 20
      };
    } catch (error) {
      // 如果获取失败，返回默认值
      console.warn('获取用户词库偏好设置失败，使用默认值', error);
      return { bookIds: [], wordsPerDay: 20 };
    }
  },

  // 创建自定义词库
  createVocabularyBook: async (name: string): Promise<VocabularyBook> => {
    try {
      const url = `vocabulary/books/`;
      const response = await apiClient.post<VocabularyBook>(url, {
        name,
        is_system_preset: false
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, '创建词库失败');
    }
  },

  // 导入单词到词库
  importWordsToBook: async (bookId: number, csvFile: File): Promise<{ message: string; imported_words: any[] }> => {
    try {
      const formData = new FormData();
      formData.append('csv_file', csvFile);
      
      const url = `vocabulary/books/${bookId}/import/`;
      const response = await apiClient.post<{ message: string; imported_words: any[] }>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, '导入单词失败');
    }
  },

  // 删除词库
  deleteVocabularyBook: async (bookId: number): Promise<void> => {
    try {
      const url = `vocabulary/books/${bookId}/`;
      await apiClient.delete(url);
    } catch (error) {
      return handleApiError(error, '删除词库失败');
    }
  },

  // 更新词库中的单词
  updateVocabularyWord: async (wordId: number, data: {
    word?: string;
    translation?: string;
    phonetic?: string;
    part_of_speech?: string;
    example?: string;
  }): Promise<VocabularyWord> => {
    try {
      const url = `vocabulary/words/${wordId}/`;
      const response = await apiClient.patch<VocabularyWord>(url, data);
      return response.data;
    } catch (error) {
      return handleApiError(error, '更新单词失败');
    }
  },

  // 获取在指定词书中的已掌握单词数量
  getKnownWordsCountInBook: async (bookId: number, studentId: number): Promise<{ known_words_count: number }> => {
    try {
      // 假设后端API为 /vocabulary/books/{bookId}/known_words_count/?student_id={studentId}
      const url = `vocabulary/books/${bookId}/known_words_count/`;
      const response = await apiClient.get<{ known_words_count: number }>(url, {
        params: { student_id: studentId }
      });
      return response.data;
    } catch (error) {
      console.warn(`获取词书 ${bookId} 的已掌握单词数失败，返回默认值0`, error);
      return { known_words_count: 0 };
    }
  },

  /**
   * 获取词汇书中可用于学习的单词列表
   * @param planId 学习计划ID
   * @param limit 限制返回的单词数量，默认返回所有
   * @param offset 偏移量，用于分页
   * @returns 可用单词列表及统计信息
   */
  async getAvailableWords(planId: number, limit?: number, offset?: number): Promise<AvailableWordsResponse> {
    try {
      const params: { limit?: number; offset?: number } = {};
      if (limit !== undefined) params.limit = limit;
      if (offset !== undefined) params.offset = offset;
      
      const response = await apiClient.get<AvailableWordsResponse>(`learning/plans/${planId}/available_words/`, {
        params
      });
      return response.data;
    } catch (error) {
      handleApiError(error, `获取学习计划 ${planId} 的可用单词列表失败`);
      throw error;
    }
  },

  /**
   * 通过单词文本查询词书中对应的单词详情
   * @param bookId 词书ID
   * @param wordTexts 单词文本数组
   * @returns 匹配的单词详情列表
   */
  async getWordsByTexts(bookId: number, wordTexts: string[]): Promise<VocabularyWord[]> {
    try {
      const url = `vocabulary/books/${bookId}/words/batch/`;
      const response = await apiClient.post<{ 
        words: VocabularyWord[];
        total_requested: number;
        total_found: number;
      }>(url, {
        word_texts: wordTexts
      });
      
      console.log(`[API] 查询词书 ${bookId} 中 ${wordTexts.length} 个单词，找到 ${response.data.total_found} 个匹配结果`);
      return response.data.words || [];
    } catch (error) {
      return handleApiError(error, `查询词书 ${bookId} 中的单词详情失败`);
    }
  },
};

// 全局缓存对象，避免短时间内重复请求
const knownWordsCache = new Map<number, {data: { count: number; results: any[] }, timestamp: number}>();

// 获取学生已认识单词列表
export const fetchKnownWords = async (
  studentId: number,
  bookId?: number | null // 新增可选的 bookId 参数
): Promise<{ count: number; results: { id: number; student: number; word: number; marked_at: string }[], next: string | null }> => {
  try {
    const url = `vocabulary/known-words/`;
    
    // 构建请求参数
    const params: { student: number; book?: number } = { student: studentId };
    if (bookId) {
      params.book = bookId;
    }

    const response = await apiClient.get<any>(url, { params });
    return response.data;
  } catch (error) {
    return handleApiError(error, '获取已知单词列表失败');
  }
};

// 标记单词为已认识
export const markKnownWord = async (
  studentId: number,
  wordBasicId: number
): Promise<{ id: number; student: number; word: number; marked_at: string }> => {
  try {
    const url = `vocabulary/known-words/`;
    const response = await apiClient.post(url, { student: studentId, word: wordBasicId });
    
    // 操作成功后，同步更新缓存
    const cacheKey = studentId;
    const cached = knownWordsCache.get(cacheKey);
    if (cached) {
      // 检查缓存中是否已有该记录
      const exists = cached.data.results.some(item => item.word === wordBasicId);
      if (!exists) {
        // 将新标记的单词添加到缓存
        const newResults = [...cached.data.results, response.data];
        knownWordsCache.set(cacheKey, {
          data: {
            count: newResults.length,
            results: newResults
          },
          timestamp: cached.timestamp // 保持原有时间戳，维持缓存的有效期
        });
      }
    }
    
    return response.data;
  } catch (error) {
    return handleApiError(error, '标记单词为已认识失败');
  }
};

// 恢复单词为不认识
export const unmarkKnownWord = async (
  studentId: number,
  wordBasicId: number
): Promise<void> => {
  try {
    const url = `vocabulary/known-words/unmark/`;
    await apiClient.delete(url, { data: { student: studentId, word: wordBasicId } });
    
    // 操作成功后，同步更新缓存
    const cacheKey = studentId;
    const cached = knownWordsCache.get(cacheKey);
    if (cached) {
      // 从缓存中移除该单词
      const newResults = cached.data.results.filter(item => item.word !== wordBasicId);
      if (newResults.length !== cached.data.results.length) {
        knownWordsCache.set(cacheKey, {
          data: {
            count: newResults.length,
            results: newResults
          },
          timestamp: cached.timestamp // 保持原有时间戳，维持缓存的有效期
        });
      }
    }
  } catch (error) {
    return handleApiError(error, '恢复单词为不认识失败');
  }
};

// 使用缓存获取学生已认识的单词
// 注意：当按bookId筛选时，通常不建议跨页面缓存，除非能确保缓存键的唯一性
export const fetchKnownWordsCached = async (
  studentId: number,
  bookId?: number | null // 新增可选的 bookId 参数
): Promise<{ count: number; results: any[] }> => {
  // 如果是按 bookId 查询，我们跳过缓存，总是获取最新数据
  if (bookId) {
    const response = await fetchKnownWords(studentId, bookId);
    const allResults = response.results || [];
    let nextUrl = response.next;

    // 处理分页，获取所有页面的数据
    while (nextUrl) {
      const nextPageResponse = await apiClient.get(nextUrl);
      allResults.push(...nextPageResponse.data.results);
      nextUrl = nextPageResponse.data.next;
    }
    
    return { count: response.count, results: allResults };
  }

  const cacheKey = studentId;
  const cached = knownWordsCache.get(cacheKey);

  if (cached && (Date.now() - cached.timestamp < 300000)) { // 5分钟缓存
    console.log(`[Cache] Using cached known words for student ${studentId}`);
    return cached.data;
  }

  try {
    // 全量获取时不清空缓存，而是更新它
    const response = await fetchKnownWords(studentId);
    const allResults = response.results || [];
    let nextUrl = response.next;


    while (nextUrl) {
      const nextPageResponse = await apiClient.get(nextUrl);
      allResults.push(...nextPageResponse.data.results);
      nextUrl = nextPageResponse.data.next;
    }
    
    const data = { count: response.count, results: allResults };
    knownWordsCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    // 如果获取失败，尝试返回旧的缓存（如果存在）
    if (cached) {
      return cached.data;
    }
    return handleApiError(error, '获取已知单词列表失败');
  }
};

/**
 * 发送用户反馈
 * @param category 反馈类别
 * @param content 反馈内容
 */
export const sendFeedback = async (category: string, content: string): Promise<void> => {
  try {
    await apiClient.post('/learning/feedback/', {
      category,
      content,
    });
  } catch (error) {
    return handleApiError(error, '反馈提交失败');
  }
};

// 批量标记单词为已认识
export const markKnownWordsBatch = async (
  studentId: number,
  wordBasicIds: number[]
): Promise<{ success: boolean; created_count: number; skipped_existing: number[] }> => {
  try {
    const url = `vocabulary/known-words/mark-batch/`;
    const response = await apiClient.post(url, {
      student: studentId,
      word_ids: wordBasicIds,
    });
    // 同步更新缓存：简单做法是失效该学生的缓存
    knownWordsCache.delete(studentId);
    return response.data;
  } catch (error) {
    return handleApiError(error, '批量标记已知单词失败');
  }
};