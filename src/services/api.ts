/// <reference types="vite/client" />
import axios, { AxiosError } from 'axios';
// import NProgress from 'nprogress';
import _ from 'lodash';

export interface VocabularyBook {
  id: number;
  name: string;
  word_count: number;
  cover_image?: string | null; // 可选封面图片路径
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
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 确保发送 Cookie (包括 HttpOnly 和 CSRF cookies)
  xsrfCookieName: 'csrftoken', // Django 默认的 CSRF cookie 名称
  xsrfHeaderName: 'X-CSRFToken', // Django 默认的 CSRF header 名称
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
    // NProgress.done();
    return response;
  },
  (error: AxiosError) => {
    // NProgress.done();
    if (error.response?.status === 401) {
      console.error('未授权访问或会话已过期，请重新登录');
      // 重定向到登录页 (使用 window.location 来确保跳转)
      // 可以附加一个查询参数，让登录页知道是会话过期
      if (!window.location.pathname.startsWith('/login')) { // 避免在登录页重复跳转
        window.location.href = '/login?sessionExpired=true';
      }
    } else {
      // 处理其他错误，例如显示通用错误消息
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
    if (axiosError.response?.data && typeof axiosError.response.data === 'object') {
      const errorData = axiosError.response.data as { message?: string };
      throw new Error(errorData.message || defaultMessage);
    }
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
  }
};

// 保存/更新单词自定义信息（包括笔记）
export const saveWordCustomization = async (
  wordBasicId: number,
  data: {
    meanings?: any;
    example_sentence?: string;
    notes?: string;
    student_id: number;
  }
) => {
  try {
    // 注意：这里的 url 可能需要根据你的后端实际路径调整
    const url = `vocabulary/words/user/${wordBasicId}/`;
    const response = await apiClient.post(url, data);
    return response.data;
  } catch (error) {
    return handleApiError(error, '保存单词自定义信息失败');
  }
};

// 全局缓存对象，避免短时间内重复请求
const knownWordsCache = new Map<number, {data: any[], timestamp: number}>();

// 添加用于单词自定义信息的缓存
const wordsCustomizationCache = new Map<number, {data: Map<number, any>, timestamp: number}>();

// 批量获取单词自定义信息（如笔记、例句等）
export const fetchWordsCustomization = async (
  studentId: number,
  wordBasicIds: number[]
): Promise<any[]> => {
  try {
    const url = `vocabulary/words/customization/`;
    const response = await apiClient.post(url, {
      student_id: studentId,
      word_ids: wordBasicIds
    });
    const data = response.data; // 期望为 [{ word_basic_id, notes, ... }, ...]
    
    // 更新缓存
    const cached = wordsCustomizationCache.get(studentId);
    const currentTime = Date.now();
    const CACHE_TTL = 5 * 60 * 1000; // 缓存有效期：5分钟
    let updatedData = new Map<number, any>();
    
    // 如果缓存存在且未过期，基于现有缓存更新
    if (cached && currentTime - cached.timestamp < CACHE_TTL) {
      updatedData = new Map(cached.data);
    }
    
    // 将新获取的数据更新到缓存中
    data.forEach((item: any) => {
      if (item.word_basic_id) {
        updatedData.set(item.word_basic_id, item);
      }
    });
    
    // 更新缓存
    wordsCustomizationCache.set(studentId, {
      data: updatedData,
      timestamp: currentTime
    });
    
    return data;
  } catch (error) {
    return handleApiError(error, '获取单词自定义信息失败');
  }
};

/**
 * 获取学生单词自定义信息（带缓存）
 * 使用内存缓存优化，减少重复请求
 * @param studentId 学生ID
 * @param wordBasicIds 单词ID数组
 * @returns 返回单词自定义信息数组
 */
export const fetchWordsCustomizationCached = async (studentId: number, wordBasicIds: number[]): Promise<any[]> => {
  // 检查缓存是否有效（5分钟内）
  const cached = wordsCustomizationCache.get(studentId);
  const CACHE_TTL = 5 * 60 * 1000; // 缓存有效期：5分钟
  const currentTime = Date.now();
  
  // 如果缓存存在且未过期，直接使用缓存数据，不管是否包含所有请求的单词ID
  if (cached && currentTime - cached.timestamp < CACHE_TTL) {
    
    // 只返回缓存中存在的单词数据
    const results: any[] = [];
    wordBasicIds.forEach(id => {
      const item = cached.data.get(id);
      if (item) {
        results.push(item);
      }
    });
    
    return results;
  }
  
  // 缓存不存在或已过期，发起请求获取所有单词信息
  try {
    return await fetchWordsCustomization(studentId, wordBasicIds);
  } catch (error) {
    // 如果请求失败且有缓存，使用过期缓存作为后备
    if (cached && cached.data.size > 0) {
      // 尝试从过期缓存中查找数据
      const results: any[] = [];
      wordBasicIds.forEach(id => {
        const item = cached.data.get(id);
        if (item) {
          results.push(item);
        }
      });
      return results;
    }
    // 没有缓存可用，只能抛出错误
    throw error;
  }
};

// 获取学生已认识单词列表
export const fetchKnownWords = async (
  studentId: number
): Promise<{ id: number; student: number; word: number; marked_at: string }[]> => {
  try {
    const url = `vocabulary/known-words/`;
    const response = await apiClient.get<{ results: any[] }>(url, { params: { student: studentId } });
    return response.data.results;
  } catch (error) {
    return handleApiError(error, '获取已认识单词列表失败');
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
    const cached = knownWordsCache.get(studentId);
    if (cached) {
      // 检查缓存中是否已有该记录
      const exists = cached.data.some(item => item.word === wordBasicId);
      if (!exists) {
        // 将新标记的单词添加到缓存
        const newData = [...cached.data, response.data];
        knownWordsCache.set(studentId, {
          data: newData,
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
    const cached = knownWordsCache.get(studentId);
    if (cached) {
      // 从缓存中移除该单词
      const newData = cached.data.filter(item => item.word !== wordBasicId);
      if (newData.length !== cached.data.length) {
        knownWordsCache.set(studentId, {
          data: newData,
          timestamp: cached.timestamp // 保持原有时间戳，维持缓存的有效期
        });
      }
    }
  } catch (error) {
    return handleApiError(error, '恢复单词为不认识失败');
  }
};

/**
 * 获取学生已认识单词列表（带缓存）
 * 使用内存缓存优化，减少重复请求
 * @param studentId 学生ID
 * @returns 返回已知单词数组
 */
export const fetchKnownWordsCached = async (studentId: number): Promise<any[]> => {
  // 检查缓存是否有效（5分钟内）
  const cached = knownWordsCache.get(studentId);
  const CACHE_TTL = 5 * 60 * 1000; // 缓存有效期：5分钟
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  try {
    // 没有缓存或缓存已过期，发起请求
    const data = await fetchKnownWords(studentId);
    
    // 更新缓存
    knownWordsCache.set(studentId, {
      data, 
      timestamp: Date.now()
    });
    
    return data;
  } catch (error) {
    // 如果请求失败且有缓存，使用过期缓存作为后备
    if (cached) {
      return cached.data;
    }
    // 没有缓存可用，只能抛出错误
    throw error;
  }
}; 