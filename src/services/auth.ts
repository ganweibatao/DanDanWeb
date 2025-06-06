import { apiClient } from './api';
import { AxiosError } from 'axios';

// 定义接口类型
export interface AuthResponse<T = any> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

// 登录响应类型
export interface LoginResponse {
  token?: string;
  user: {
    id: number;
    username: string;
    email: string;
    user_type: string;
  };
}

// 错误处理工具函数
export const handleApiError = (error: unknown, defaultMessage: string): never => {
  console.error(defaultMessage, error);
  let specificMessage: string | undefined = undefined;

  if (error && typeof error === 'object' && 'isAxiosError' in error && error.isAxiosError) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data && typeof axiosError.response.data === 'object') {
      // 尝试从 data 对象中获取 error, detail, 或 message
      const errorData = axiosError.response.data as { error?: string; detail?: string; message?: string; [key: string]: any };
      specificMessage = errorData.error || errorData.detail || errorData.message;
    } else if (axiosError.message && !axiosError.response) {
      // 处理网络错误或其他非 HTTP 响应错误
      specificMessage = axiosError.message;
    }
  } else if (error instanceof Error) {
    // 处理非 Axios 错误对象
    specificMessage = error.message;
  }

  throw new Error(specificMessage || defaultMessage);
};

// 添加微信登录相关服务
export const wechatAuthService = {
  // 获取微信登录二维码
  getQrCode: async (): Promise<{ auth_url: string }> => {
    try {
      const response = await apiClient.get('/accounts/users/wechat_qrcode/');
      return response.data;
    } catch (error) {
      return handleApiError(error, '获取微信登录二维码失败');
    }
  }
};

// 添加认证相关服务
export const authService = {
  // 用户邮箱登录
  login: async (data: {
    email: string,
    password: string
  }): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<LoginResponse>('/accounts/users/login/', {
        email: data.email,
        password: data.password
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, '登录失败');
    }
  },

  // 退出登录
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/accounts/users/logout/');
    } catch (error) {
      // 即使API调用失败，也认为退出成功
      console.warn('退出登录API调用失败:', error);
    } finally {
      // 清理本地缓存的用户信息（如有）
      localStorage.removeItem('user');
      // 你可以根据需要清理更多本地状态
    }
  },

  // 用户邮箱注册
  register: async (data: {
    name: string,
    email: string, 
    password: string, 
    verification_code: string,
    user_type?: string
  }): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/accounts/users/register/', {
        email: data.email,
        password: data.password,
        verification_code: data.verification_code,
        username: data.name, // 用户名设置为姓名
        user_type: data.user_type || 'teacher' // 默认为teacher类型
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, '注册失败');
    }
  },

  // 发送邮箱验证码
  sendEmailCode: async (email: string): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/accounts/email/send-code/', {
        email
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, '发送验证码失败');
    }
  },

  // 验证邮箱验证码
  verifyEmailCode: async (email: string, code: string): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/accounts/email/verify-code/', {
        email,
        code
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, '验证码校验失败');
    }
  },

  // 重置密码
  resetPassword: async (data: { email: string; code: string; new_password: string }): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/accounts/password/reset/', {
        email: data.email,
        code: data.code,
        new_password: data.new_password,
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, '重置密码失败');
    }
  }
}; 