import { apiClient, handleApiError, VocabularyWord } from './api';

// --- 基于后端序列化器的类型定义 ---

/**
 * 格式化单元编号为显示格式。
 * @param unitNumber 单元编号
 * @returns 格式化后的单元编号字符串
 */
export function getDisplayUnitNumber(unitNumber: number): string {
  return unitNumber.toString();
}


// 嵌套的教师详情，简化以匹配可能的 null 或基本信息
interface TeacherDetails {
    id: number;
    user: {
        id: number;
        username: string;
    };
}


// --- End NEW ---

// 词汇书的完整接口
export interface VocabularyBook {
    id: number;
    name: string;
    word_count: number;
    is_system_preset: boolean;
    created_at: string;
    updated_at: string;
}

// 学习计划的接口
export interface LearningPlan {
    id: number;
    student_details: {
        id: number;
        name: string;
        email: string;
    };
    teacher: TeacherDetails | null; // 嵌套的教师信息 (根据模型可以为 null)
    vocabulary_book: VocabularyBook; // Now using the detailed summary type
    start_date: string; // ISO 日期字符串
    is_active: boolean;
    total_days: number; // 由序列化器计算
    progress: number; // 由序列化器计算
    created_at: string; // ISO 日期字符串
    updated_at: string; // ISO 日期字符串

    units_summary?: { // 基于序列化器逻辑的可选摘要
        total: number;
        learned: number;
        remaining: number;
    };
}

// --- 新增：定义分页响应的接口 ---
interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

// Represents the expected response from the 'today' endpoint
// Made exportable as it's used in components
export interface TodayLearningResponse {
    new_words: VocabularyWord[]; // 新学单词
    review_words: VocabularyWord[];  // 复习单词
    day_number?: number;
}

// 添加新的接口定义，用于返回额外的单词
interface AddNewWordsResponse {
    plan_id: number;
    unit_id: number;
    original_end_word_order: number;
    new_end_word_order: number;
    words: VocabularyWord[];
}

// 艾宾浩斯矩阵数据接口 - 基于单词学习阶段
export interface EbinghausMatrixData {
  id: number;
  total_words: number;
  word_stages: Array<{
    id: number;
    current_stage: number;
    start_date: string;
    next_review_date: string | null;
    book_word: {
      id: number;
      word: string;
      word_order: number;
    };
  }>;
}

// 在文件顶部或合适位置补充类型声明
export interface ExtendedEbinghausMatrixData extends EbinghausMatrixData {
  has_unused_lists: boolean;
  max_actual_unit_number: number;
  estimated_unit_count: number;
}

// 创建/更新学习计划的数据结构
// Ensure this interface is exported
export interface LearningPlanPayload {
    student_id: number;
    vocabulary_book_id: number;
    start_date?: string; // 可选：后端可能有默认值
    is_active?: boolean; // 可选：后端可能有默认值
}

// --- API 服务函数 ---

/**
 * 获取指定学生的所有学习计划列表。
 * 旨在由查看学生计划的教师调用。
 * @param studentId 正在获取其计划的学生 ID。
 * @returns 一个解析为 LearningPlan 对象数组或在出错时解析为空数组的 Promise。
 */
export const getAllPlansForStudent = async (studentId: string | number): Promise<LearningPlan[]> => {
    try {
        // 假设后端 `/learning/plans/?student_id=${studentId}` 返回该学生的所有计划
        // 如果后端强制分页，需要循环获取所有页面
        const response = await apiClient.get<PaginatedResponse<LearningPlan>>(`learning/plans/?student_id=${studentId}`);

        if (response.data && response.data.results) {
            // 返回所有结果
            return response.data.results;
        } else {
            console.warn(`未找到学生 ID ${studentId} 的学习计划，或响应格式不正确`);
            return []; // 返回空数组表示未找到
        }
    } catch (error: any) {
        console.error(`获取学生 ${studentId} 的所有学习计划失败:`, error.response?.data || error.message);
        // 返回空数组表示获取失败。组件应处理此情况。
        return [];
    }
};


/**
 * 获取指定学生的当前活动学习计划。
 * @deprecated 使用 getAllPlansForStudent 并从中查找活动计划。
 * @param studentId 正在获取其计划的学生 ID。
 * @returns 一个解析为 LearningPlan 对象或在未找到/出错时解析为 null 的 Promise。
 */
export const getActivePlanForStudent = async (studentId: string | number): Promise<LearningPlan | null> => {
    try {
        // 尝试直接获取活动计划（如果后端支持过滤）
        const response = await apiClient.get<PaginatedResponse<LearningPlan>>(`learning/plans/?student_id=${studentId}&is_active=true`);

        if (response.data && response.data.results && response.data.results.length > 0) {
            return response.data.results[0]; // 返回第一个活动计划
        } else {
            console.warn(`未找到学生 ID ${studentId} 的活动学习计划`);
            // 如果没有直接找到活动计划，获取所有计划并查找最新的或第一个作为备选
             const allPlansResponse = await apiClient.get<PaginatedResponse<LearningPlan>>(`learning/plans/?student_id=${studentId}`);
             if (allPlansResponse.data && allPlansResponse.data.results && allPlansResponse.data.results.length > 0) {
               console.warn(`未找到活动计划，返回学生 ${studentId} 的最新（或第一个）计划`);
               // 假设列表按创建时间降序排列，或者可以根据 updated_at 排序找到最新的
               // 为简单起见，先返回第一个
               return allPlansResponse.data.results[0];
             }
            return null; // 如果没有任何计划，返回 null
        }
    } catch (error: any) {
        console.error(`获取学生 ${studentId} 的活动学习计划失败:`, error.response?.data || error.message);
        return null; // 出错时返回 null
    }
};


/**
 * 为学生创建新的学习计划或更新现有计划。
 * @param planData 创建/更新计划所需的数据。
 * @returns 一个解析为已创建或已更新的 LearningPlan 对象的 Promise。
 */
export const createOrUpdateLearningPlan = async (planData: LearningPlanPayload): Promise<LearningPlan> => {
    try {
        const response = await apiClient.post<LearningPlan>('learning/plans/', planData);
        return response.data;
    } catch (error: any) {
        console.error("创建/更新学习计划时发生 API 错误:", error.response?.data || error.message);
        throw error; // 重新抛出，让调用者处理
    }
};

/**
 * 删除指定的学习计划。
 * @param planId 要删除的学习计划 ID。
 * @returns 一个解析为 void 的 Promise。
 */
export const deleteLearningPlan = async (planId: number): Promise<void> => {
    try {
        await apiClient.delete(`learning/plans/${planId}/`);
    } catch (error: any) {
        console.error("删除学习计划时发生 API 错误:", error.response?.data || error.message);
        throw error; // 重新抛出，让调用者处理
    }
};

/**
 * 获取学生当天需要学习或复习的单词。
 * @param planId 当前活动的学习计划 ID。
 * @param mode 学习模式 ('new' 或 'review')。
 * @returns 一个解析为包含单词列表的对象的 Promise。
 */
export const getTodaysLearning = async (planId: number, mode: 'new' | 'review'): Promise<TodayLearningResponse> => {
    try {
        // 构建请求URL和参数以便日志记录
        const url = 'learning/today/';
        const requestParams = { plan_id: planId, mode: mode };
        
        // 发送请求
        const response = await apiClient.get<TodayLearningResponse>(url, {
            params: requestParams,
        });
        
        if (mode === 'new') {
        } else {
            // console.log(`[getTodaysLearning API] review_units数据:`, response.data.review_units);
            // console.log(`[getTodaysLearning API] review_units长度:`, response.data.review_units?.length || 0);
        }
        
        return response.data;
    } catch (error: any) {
        // 详细记录错误信息
        
        if (error.response) {
            console.error(`[getTodaysLearning API] 错误状态码:`, error.response.status);
            console.error(`[getTodaysLearning API] 错误响应头:`, error.response.headers);
            console.error(`[getTodaysLearning API] 错误响应数据:`, error.response.data);
        } else if (error.request) {
            console.error(`[getTodaysLearning API] 请求已发送但未收到响应:`, error.request);
        }
        
        throw new Error(
            error.response?.data?.detail || 
            error.response?.data?.message || 
            error.message || 
            '加载学习任务失败'
        );
    }
};


// --- NEW: API functions for marking tasks as completed ---





/**
 * 获取额外的新单词用于学习，同时返回新的单词范围信息。
 * @param planId 当前活动的学习计划 ID。
 * @param unitId 当前学习单元 ID。
 * @param count 要获取的单词数量。
 * @returns 一个解析为包含额外单词和新单词范围的对象的 Promise。
 */
export const getAdditionalNewWords = async (
    planId: number,
    unitId: number,
    count: number = 5
): Promise<AddNewWordsResponse> => {
    try {
        // 修改URL路径以匹配后端定义的路径
        const response = await apiClient.get<AddNewWordsResponse>(`learning/plan/${planId}/add_new_words/`, {
            params: { unit_id: unitId, count },
        });
        return response.data;
    } catch (error: any) {
        console.error(`获取额外新单词失败 (Plan: ${planId}, Unit: ${unitId}, Count: ${count}):`, 
                     error.response?.data || error.message);
        throw handleApiError(error, `获取额外新单词失败`);
    }
};

/**
 * 获取指定学习计划下特定学习单元的单词列表。
 * @param planId 学习计划的 ID。
 * @param unitId 学习单元的 ID。
 * @returns 一个解析为 VocabularyWord 对象数组的 Promise。
 */
export const getWordsForUnit = async (planId: number, unitId: number): Promise<VocabularyWord[]> => {
    try {
        const response = await apiClient.get<VocabularyWord[]>(`learning/plans/${planId}/units/${unitId}/words/`);
        return response.data;
    } catch (error: any) {
        console.error(`获取计划 ${planId} 单元 ${unitId} 的单词失败:`, error.response?.data || error.message);
        handleApiError(error, '获取单元单词失败'); // 使用通用错误处理并抛出
        throw error; // 重新抛出，让调用者（如React Query的useQuery）可以捕获
    }
};

/**
 * 获取艾宾浩斯矩阵数据 - 轻量版，仅返回显示矩阵所需的数据
 * @param planId 学习计划ID
 * @returns 一个解析为精简的矩阵数据对象的Promise
 */
export async function getEbinghausMatrixData(planId: number): Promise<ExtendedEbinghausMatrixData> {
  try {
    const response = await apiClient.get<EbinghausMatrixData>(`learning/matrix-data/?plan_id=${planId}`);
    const res = response.data as ExtendedEbinghausMatrixData;
    return res;
  } catch (error: any) {
    console.error(`获取艾宾浩斯矩阵数据失败:`, error.response?.data || error.message);
    throw error; // 重新抛出错误，让调用者处理
  }
}

// 基于 stage 的单词接口，与 DuolingoStudyPlan 中的 Word 接口保持一致
export interface WordStage {
  bookWordId: number;
  word: string;
  meaning: any;
  phonetic: string | null;
  startDate: string; // "2024-02-03"
  currentStage: number; // 0~5
  stageHistory: { stage: number; completedAt: string }[];
}

/**
 * 获取学习计划中所有单词的stage数据
 * @param planId 学习计划ID
 * @returns 一个解析为WordStage数组的Promise
 */
export async function getWordsWithStages(planId: number): Promise<WordStage[]> {
  try {
    const response = await apiClient.get(`learning/plans/${planId}/words_stages/`);

    // 兼容多种后端返回结构，确保最终返回 WordStage[]
    const rawData = response.data;

    let normalized: WordStage[] = [];

    if (Array.isArray(rawData)) {
      // 情况1：直接返回数组
      normalized = rawData as WordStage[];
    } else if (rawData && Array.isArray((rawData as any).results)) {
      // 情况2：分页格式 { results: [...] }
      normalized = (rawData as any).results as WordStage[];
    } else if (rawData && Array.isArray((rawData as any).words)) {
      // 情况3：自定义包装 { words: [...] }
      normalized = (rawData as any).words as WordStage[];
    } else {
      console.warn(
        `[getWordsWithStages] 未识别的响应格式，返回空数组。原始数据:`,
        rawData,
      );
    }

    return normalized;
  } catch (error: any) {
    console.error(`获取单词stage数据失败:`, error.response?.data || error.message);
    throw new Error(
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      '获取单词stage数据失败'
    );
  }
}

// --- 新增：按需创建单词阶段记录的API ---

export interface AvailableWord {
  id: number;
  word: string;
  meaning: any;
  phonetic: string | null;
  word_order: number;
  word_basic_id: number | null; // WordBasic ID，用于标记已知单词
  has_stage: boolean; // 是否已创建学习阶段记录
  is_known: boolean; // 学生是否已认识该单词
}

export interface AvailableWordsResponse {
  words: AvailableWord[];
  total_count: number; // The number of words available for learning (e.g., excluding known words)
  all_words_count: number; // The total number of words in the book
  staged_count: number;
  known_in_book_count: number;
}

/**
 * 获取词汇书中可用于学习的单词列表
 * @param planId 学习计划ID
 * @param limit 限制返回的单词数量，默认返回所有
 * @param offset 偏移量，用于分页
 * @returns 可用单词列表及统计信息
 */
export async function getAvailableWords(planId: number, limit?: number, offset?: number): Promise<AvailableWordsResponse> {
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
}

/**
 * 为指定单词创建学习阶段记录
 * @param planId 学习计划ID
 * @param bookWordIds 要创建阶段记录的单词ID列表
 * @returns 创建结果
 */
export async function createWordStages(planId: number, bookWordIds: number[]): Promise<{
  success: boolean;
  message: string;
  created_count: number;
  word_ids: number[];
}> {
  try {
    const response = await apiClient.post(`learning/plans/${planId}/create_word_stages/`, {
      book_word_ids: bookWordIds
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error, "创建单词学习阶段失败");
  }
}

export async function advanceWordStagesBatch(planId: number, bookWordIds: number[]): Promise<any> {
    try {
        const response = await apiClient.post(`learning/plans/${planId}/advance-stages-batch/`, { book_word_ids: bookWordIds });
        return response.data;
    } catch (error) {
        throw handleApiError(error, "批量推进单词学习阶段失败");
    }
}