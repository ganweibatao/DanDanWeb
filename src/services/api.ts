/// <reference types="vite/client" />
import axios, { AxiosError } from 'axios';

export interface VocabularyBook {
  id: number;
  name: string;
  word_count: number;
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

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000') + '/api/v1/';

// 创建 axios 实例，统一配置
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器，自动添加 token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    console.log('axios 请求:', config.baseURL, config.url, 'token:', token);
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器，统一处理错误
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // 处理未授权错误，例如重定向到登录页
      console.error('未授权访问，请重新登录');
      // 可以在这里添加重定向逻辑
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

// 批量获取单词自定义信息（如笔记、例句等）
export const fetchWordsCustomization = async (
  studentId: number,
  wordBasicIds: number[]
) => {
  try {
    const url = `vocabulary/words/customization/`;
    const response = await apiClient.post(url, {
      student_id: studentId,
      word_ids: wordBasicIds
    });
    return response.data; // 期望为 [{ word_basic_id, notes, ... }, ...]
  } catch (error) {
    return handleApiError(error, '获取单词自定义信息失败');
  }
}; 