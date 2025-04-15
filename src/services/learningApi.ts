import { apiClient, handleApiError, VocabularyWord } from './api';

// --- 基于后端序列化器的类型定义 ---

// 嵌套的词汇书详情的基本接口
interface VocabularyBookDetails {
    id: number;
    name: string;
    description?: string | null;
    word_count: number;
    cover_image?: string | null;
}

// 嵌套的学生详情的基本接口
interface StudentDetails {
    id: number;
    username: string;
    email?: string | null;
    avatar?: string | null;
    avatarFallback: string; // 假设这个是在前端生成或映射到后端字段
    name?: string | null; // 假设这个映射到 user.first_name + user.last_name 或类似字段
}

// 嵌套的教师详情的基本接口 (基于典型的序列化器输出)
interface TeacherDetails {
    id: number;
    user: { // 假设嵌套了用户详情
        id: number;
        username: string;
        first_name?: string | null;
        last_name?: string | null;
        email?: string | null;
    };
    // 如果 TeacherSerializer 中有其他教师特定字段，可在此添加
}

// --- NEW: Define types for Learning Unit and Review ---
export interface UnitReview {
    id: number;
    review_date: string;
    review_order: number;
    is_completed: boolean;
    completed_at?: string | null;
}

export interface LearningUnit {
    id: number;
    learning_plan: number;
    unit_number: number;
    start_word_order?: number;
    end_word_order?: number;
    expected_learn_date?: string | null;
    is_learned: boolean;
    learned_at?: string | null;
    reviews: UnitReview[];
    created_at: string;
    updated_at: string;
    words?: VocabularyWord[]; // 添加可选的 words 字段
}
// --- End NEW ---

// Represents a single vocabulary book (matching VocabularyBookSerializer)
interface VocabularyBookSummary {
    id: number;
    name: string;
    word_count: number;
    // Add other relevant fields from your VocabularyBookSerializer if needed
}

// Represents a single learning plan (matching LearningPlanSerializer)
export interface LearningPlan {
    id: number;
    student_details: StudentDetails; // 嵌套的学生信息
    teacher: TeacherDetails | null; // 嵌套的教师信息 (根据模型可以为 null)
    vocabulary_book: VocabularyBookSummary; // Now using the detailed summary type
    words_per_day: number;
    start_date: string; // ISO 日期字符串
    is_active: boolean;
    total_days: number; // 由序列化器计算
    progress: number; // 由序列化器计算
    created_at: string; // ISO 日期字符串
    updated_at: string; // ISO 日期字符串
    units?: LearningUnit[]; // <--- Add the units array here
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
    new_unit: LearningUnit | null; // Unit 对象现在可能包含 words
    review_units: LearningUnit[];  // Unit 对象现在可能包含 words
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

// 艾宾浩斯矩阵数据接口 - 精简版
export interface EbinghausMatrixData {
  id: number;
  total_days: number;
  words_per_day: number;
  total_words: number;
  units: Array<{
    id: number;
    unit_number: number;
    is_learned: boolean;
    learned_at: string | null;
    reviews: Array<{
      id: number;
      review_order: number;
      is_completed: boolean;
      review_date: string; // 添加这个字段以匹配UnitReview接口
    }>;
    learning_plan: number; // 添加这个字段以匹配LearningUnit接口
    created_at: string; // 添加这个字段以匹配LearningUnit接口
    updated_at: string; // 添加这个字段以匹配LearningUnit接口
  }>;
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


// 创建/更新学习计划的数据结构
interface LearningPlanPayload {
    student_id: number;
    vocabulary_book_id: number;
    words_per_day: number;
    start_date?: string; // 可选：后端可能有默认值
    is_active?: boolean; // 可选：后端可能有默认值
}

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
 * 获取学生当天需要学习或复习的单词。
 * @param planId 当前活动的学习计划 ID。
 * @param mode 学习模式 ('new' 或 'review')。
 * @returns 一个解析为包含单词列表的对象的 Promise。
 */
export const getTodaysLearning = async (planId: number, mode: 'new' | 'review'): Promise<TodayLearningResponse> => {
    try {
        const response = await apiClient.get<TodayLearningResponse>('learning/today/', {
            params: { plan_id: planId, mode: mode },
        });
        return {
            new_unit: response.data?.new_unit || null,
            review_units: response.data?.review_units || [],
            day_number: response.data?.day_number || undefined,
        };
    } catch (error: any) {
        console.error(`获取今日学习内容失败 (Plan: ${planId}, Mode: ${mode}):`, error.response?.data || error.message);
        // 修正：统一在 catch 块返回一个默认结构的错误对象，而不是直接抛出
        return { new_unit: null, review_units: [], day_number: undefined };
    }
};


// --- NEW: API functions for marking tasks as completed ---

/**
 * 将指定的学习单元标记为已学习。
 * @param unitId 要标记的学习单元的 ID
 * @param options 可选参数对象，包含start_word_order和end_word_order
 * @returns 一个解析为已更新的 LearningUnit 对象的 Promise。
 */
export const markUnitAsLearned = async (
    unitId: number, 
    options?: { start_word_order?: number; end_word_order?: number }
): Promise<LearningUnit> => {
    try {
        const response = await apiClient.post<LearningUnit>(
            `learning/units/${unitId}/mark-learned/`, 
            options
        );
        return response.data;
    } catch (error: any) {
        console.error(`将单元 ${unitId} 标记为已学习失败:`, error.response?.data || error.message);
        throw handleApiError(error, `将单元 ${unitId} 标记为已学习失败`);
    }
};

/**
 * 将指定的复习任务标记为已完成。
 * @param reviewId 要标记的复习任务的 ID。
 * @returns 一个解析为已更新的 UnitReview 对象的 Promise。
 */
export const markReviewAsCompleted = async (reviewId: number): Promise<UnitReview> => {
    try {
        const response = await apiClient.post<UnitReview>(`learning/reviews/${reviewId}/mark-completed/`);
        return response.data;
    } catch (error: any) {
        console.error(`将复习 ${reviewId} 标记为已完成失败:`, error.response?.data || error.message);
        throw handleApiError(error, `将复习 ${reviewId} 标记为已完成失败`);
    }
};

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
 * 获取艾宾浩斯矩阵数据 - 轻量版，仅返回显示矩阵所需的数据
 * @param planId 学习计划ID
 * @returns 一个解析为精简的矩阵数据对象的Promise
 */
export const getEbinghausMatrixData = async (planId: number): Promise<EbinghausMatrixData> => {
  try {
    const response = await apiClient.get<EbinghausMatrixData>(`learning/matrix-data/?plan_id=${planId}`);
    return response.data;
  } catch (error: any) {
    console.error(`获取艾宾浩斯矩阵数据失败:`, error.response?.data || error.message);
    throw error; // 重新抛出错误，让调用者处理
  }
};