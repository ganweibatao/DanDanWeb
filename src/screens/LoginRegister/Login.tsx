// 这是一个用户登录界面，主要功能和组件：
// 整个页面采用卡片居中设计，背景使用与主题一致的颜色
// 顶部显示公司logo和"登录"标题
// 包含两个输入框：用户名和密码
// 右上角有"忘记密码"链接
// 底部有"登录"按钮
// 页面底部有引导用户注册的链接（"还没有账号? 立即注册"）
// 表单提交时会触发handleLogin函数，目前仅打印输入信息，后续可添加实际登录逻辑
import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Link, useNavigate, useLocation } from "react-router-dom"; // 用来创建页面间的链接和登录后页面跳转
import { Home, Eye, EyeOff } from "lucide-react"; // 引入Home, Eye, EyeOff图标组件
import { apiClient } from "../../services/api"; // <-- 导入配置好的 apiClient
import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query"; // <-- 导入 useMutation, useQueryClient, type UseMutationOptions
import { AxiosError } from "axios"; // <-- 导入 AxiosError

// 定义登录函数返回的用户信息类型
interface UserLoginResponse {
  user_id: number;
  email: string;
  user_type: string;
}

// 登录的凭据类型
interface LoginCredentials {
  email: string;
  password: string;
}

export const Login = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation(); // <-- 获取 location 对象
  const queryClient = useQueryClient(); // <-- 获取 queryClient 实例
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // showPassword 是状态变量，用来记录当前密码是否显示,setShowPassword 是用来更新这个状态的函数
  const [verificationCode, setVerificationCode] = useState("");
  const [countDown, setCountDown] = useState(0);
  const [error, setError] = useState("");

  // 新增：检查 URL 是否包含 sessionExpired 参数
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('sessionExpired') === 'true') {
      setError('会话已过期，请重新登录');
      // 可选：从 URL 中移除参数，避免刷新页面时仍然显示该消息
      // navigate(location.pathname, { replace: true });
    }
  }, [location.search, navigate]); // 当 location.search 变化时重新运行

  const loginMutation = useMutation<UserLoginResponse, AxiosError<{ error?: string }>, LoginCredentials>({
    mutationFn: async (credentials) => { // <-- 使用 mutationFn
        // 注意：这里不再能访问组件状态 loginMethod，如果需要手机登录，需要不同的 mutation 或调整
        const response = await apiClient.post<UserLoginResponse>("accounts/users/login/", credentials);
        return response.data;
      },
    onSuccess: (data) => {
      console.log("登录成功:", data);
      queryClient.setQueryData(['currentUser'], data);
      // 根据 user_type 跳转
      if (data.user_type === 'teacher') {
        navigate("/teacher", { replace: true });
      } else if (data.user_type === 'student') {
        navigate("/students", { replace: true });
      } else if (data.user_type === 'admin') {
        navigate("/teacher", { replace: true }); // 如有管理员页面
      } else {
        navigate("/", { replace: true });
      }
    },
    onError: (err) => {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("登录失败，请检查网络或联系管理员");
      }
      console.error("登录失败:", err);
    },
  });

  // 表单提交处理函数
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (loginMethod === "email") {
      loginMutation.mutate({ email: emailOrPhone, password: password });
    } else {
      setError("手机验证码登录功能暂未开放");
    }
  };

  const handleSendCode = () => {
    if (!phone) {
      setError("请输入手机号码");
      return;
    }
    console.log("发送验证码到手机:", phone);
    setCountDown(60);
    const timer = setInterval(() => {
      setCountDown((prevCount) => {
        if (prevCount <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);
  };

  const isLoading = loginMutation.isPending; // <-- 使用 isPending 检查加载状态

  return (
    <div className="login-page flex min-h-screen items-center justify-center p-4" style={{background: '#f5f6fa', color: '#222'}}>
      <Card className="w-full max-w-md shadow-lg border-2 border-[#222] bg-white">
        <CardHeader className="text-center bg-white relative">
          <Link
            to="/"
            className="absolute left-4 top-4 text-[#222] hover:opacity-80 transition-opacity"
          >
            <Home className="h-6 w-6" />
          </Link>
          <img
            className="mx-auto w-[84px] h-9 mb-4"
            alt="Company logo"
            src="/img/company-logo.svg"
          />
          <h1 className="text-2xl font-bold text-[#222]">登录</h1>
        </CardHeader>
        <CardContent className="bg-white">
          <div className="flex mb-4 border-b border-[#e0e0e0]">
            <button
              className={`flex-1 pb-2 font-medium ${
                loginMethod === "phone"
                  ? "text-[#222] border-b-2 border-[#222]"
                  : "text-gray-500"
              }`}
              onClick={() => setLoginMethod("phone")}
              type="button"
              disabled={isLoading}
            >
              手机验证码登录
            </button>
            <button
              className={`flex-1 pb-2 font-medium ${
                loginMethod === "email"
                  ? "text-[#222] border-b-2 border-[#222]"
                  : "text-gray-500"
              }`}
              onClick={() => setLoginMethod("email")}
              type="button"
              disabled={isLoading}
            >
              账号密码登录
            </button>
          </div>

          {(error || loginMutation.isError) && (
            <div className="mb-4 p-3 bg-red-100 text-red-600 rounded">
              {error || loginMutation.error?.message }
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {loginMethod === "phone" ? (
              <>
                <div className="space-y-2">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    手机号码
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                    required
                    className="w-full bg-[#f5f5f5] border-[#e0e0e0] focus:bg-white"
                    placeholder="请输入手机号码"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="verificationCode"
                    className="block text-sm font-medium text-gray-700"
                  >
                    验证码
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="verificationCode"
                      type="text"
                      value={verificationCode}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVerificationCode(e.target.value)}
                      required
                      className="flex-1 bg-[#f5f5f5] border-[#e0e0e0] focus:bg-white"
                      placeholder="请输入验证码"
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className={`w-32 border-[#222] ${
                        countDown > 0 ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      onClick={handleSendCode}
                      disabled={countDown > 0 || isLoading}
                    >
                      {countDown > 0 ? `${countDown}秒后重发` : "获取验证码"}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label
                    htmlFor="emailOrPhone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    手机号/邮箱
                  </label>
                  <Input
                    id="emailOrPhone"
                    type="text"
                    value={emailOrPhone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmailOrPhone(e.target.value)}
                    required
                    className="w-full bg-[#f5f5f5] border-[#e0e0e0] focus:bg-white"
                    placeholder="请输入手机号或邮箱"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    密码
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                      required
                      className="w-full bg-[#f5f5f5] border-[#e0e0e0] focus:bg-white pr-10"
                      placeholder="请输入密码"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end">
              <a href="#" className="text-sm text-blue-600 hover:underline">
                忘记密码?
              </a>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-[#222] text-white py-2"
              disabled={isLoading}
            >
              {isLoading ? '登录中...' : '登录'}
            </Button>
            <div className="text-center mt-4">
              <span className="text-sm text-gray-600">还没有账号? </span>
              <Link to="/register" className="text-sm text-blue-600 hover:underline">
                立即注册
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}; 