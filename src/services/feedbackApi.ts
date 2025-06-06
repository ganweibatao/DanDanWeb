import { apiClient, handleApiError } from './api';

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