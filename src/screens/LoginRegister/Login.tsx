import { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { MailOutlined, LockOutlined, WechatOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons'; // Removed UserOutlined, KeyOutlined, ReloadOutlined
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { apiClient, wechatAuthService, authService } from '../../services/api';

const Login = () => { // Renamed component to Login
  const location = useLocation();
  const navigate = useNavigate();

  const defaultMode = location.state?.defaultMode as 'wechat' | 'email' | undefined;
  const [loginMode, setLoginMode] = useState<'wechat' | 'email'>(defaultMode || 'email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [wechatAuthUrl, setWechatAuthUrl] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null); // Renamed to loginError
  const [showPassword, setShowPassword] = useState(false);

  const qrCodeRef = useRef<HTMLDivElement>(null);

  const handleEmailLoginSubmit = async (e: React.FormEvent) => { // Renamed to handleEmailLoginSubmit
    e.preventDefault();
    setLoginError(null);
    try {
      await authService.login({ // Call authService.login
        email,
        password,
      });
      // Login successful, navigate to teacher page or dashboard
      navigate('/teacher'); 
    } catch (error: any) {
      if (error.message) {
        setLoginError(error.message);
      } else if (error.response?.data?.error) {
        setLoginError(error.response.data.error);
      } else if (error.response?.data?.detail) {
        setLoginError(error.response.data.detail);
      } else {
        setLoginError('登录失败，请稍后重试');
      }
    }
  };

  useEffect(() => {
    if (loginMode === 'wechat') {
      if (!wechatAuthUrl) {
        (async () => {
          try {
            const { auth_url } = await wechatAuthService.getQrCode();
            setWechatAuthUrl(auth_url);
          } catch (error) {
            setLoginError('无法获取微信扫码链接，请稍后重试。返回邮箱登录或刷新页面重试。'); // Updated error message context
          }
        })();
      } else {
         window.location.href = wechatAuthUrl;
      }
    }

    const queryParams = new URLSearchParams(location.search);
    const errorParam = queryParams.get('error');
    const msgParam = queryParams.get('msg');
    const registrationSuccess = queryParams.get('registrationSuccess');

    if (registrationSuccess) {
      // You might want to show a success message to the user
      // For now, just log it or clear it. Or even better, use a toast notification library.
      console.log("Registration was successful!");
      // Clear the query param to avoid showing it on refresh
      navigate(location.pathname, { replace: true });
    }

    if (errorParam) {
      let errorMessage = '微信登录失败，请稍后重试。'; // Updated error message context
      if (errorParam === 'wx_callback_state_mismatch' || errorParam === 'wx_callback_state_expired') {
        errorMessage = '登录凭证无效或已过期，请重新扫描二维码。';
      } else if (errorParam === 'wx_api_token' || errorParam === 'wx_api_userinfo' || errorParam === 'wx_api_request_failed') {
        errorMessage = `微信授权失败: ${msgParam || '请重试'}`;
      } else if (errorParam === 'wx_callback_missing_params') {
        errorMessage = '微信回调参数错误，请重试。';
      } else if (errorParam === 'wx_email_conflict') {
        // This error is more for registration, but can be kept if backend redirects here with it
        errorMessage = '该微信关联的邮箱可能已被其他账号使用或存在冲突。';
      } else if (errorParam === 'wx_callback_server_error') {
        errorMessage = '服务器处理微信登录时发生内部错误，请稍后重试。';
      }
      setLoginError(errorMessage);
    }
  }, [loginMode, wechatAuthUrl, location, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-md shadow-sm w-full max-w-md">
        {loginMode === 'wechat' ? (
          <div className="flex flex-col items-center justify-center py-10 min-h-[200px]">
            {loginError ? (
              <div className="w-full p-3 text-center">
                <p className="text-red-600 mb-4">{loginError}</p>
                <Button 
                  onClick={() => { 
                    setLoginError(null);
                    setLoginMode('email'); 
                  }}
                  variant="outline"
                  className="border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600"
                >
                  返回邮箱登录
                </Button>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-300 text-center">
                正在跳转到微信进行扫码登录...
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="text-center pt-1 pb-4">
              <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">账号登录</h2>
            </div>
            <form onSubmit={handleEmailLoginSubmit} className="space-y-4">
              <div>
                <label htmlFor="email-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  账号
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MailOutlined className="text-gray-400" />
                  </div>
                  <Input
                    type="email"
                    id="email-input"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="appearance-none block w-full px-3 py-2.5 pl-10 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="请输入您的邮箱账号"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    密码
                  </label>
                  <a href="/reset-password" className="text-sm text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300 font-medium">
                    忘记密码?
                  </a>
                </div>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockOutlined className="text-gray-400" />
                  </div>
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="password-input"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="appearance-none block w-full px-3 py-2.5 pl-10 pr-10 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="请输入您的密码"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="w-full text-center text-red-600 pt-0.5 text-sm">
                  {loginError}
                </div>
              )}

              <div className="flex gap-3 pt-2.5">
                <Button
                  type="submit"
                  className="flex-1 flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-400 dark:bg-green-600 dark:hover:bg-green-700"
                >
                  登录
                </Button>
              </div>
            </form>

            <div className="mt-6 pt-3 pb-0.5">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    其他方式登录
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-col items-center">
                <button
                  onClick={() => {
                    setLoginError(null);
                    setLoginMode('wechat'); 
                  }}
                  type="button"
                  className="flex items-center space-x-1 rounded-lg p-2 text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-green-500"
                  aria-label="微信登录"
                >
                  <WechatOutlined className="h-10 w-10 text-2xl" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">微信登录</span>
                </button>
              </div>
            </div>
          </>
        )}

        {loginMode === 'wechat' && (
          <div className="flex items-center justify-center mt-4 mb-1 text-sm text-gray-600 dark:text-gray-300">
            <button
              onClick={() => { setLoginMode('email'); setLoginError(null); }}
              className="flex items-center text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300"
            >
              <MailOutlined className="mr-1 text-lg" /> 邮箱登录
            </button>
          </div>
        )}
        
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-300 text-center">
            还没有账号？ 
            <Link to="/register" className="font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300">
                前往注册
            </Link>
        </div>

        <div className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4">
          登录即视为同意
          <a href="/terms-of-service" className="text-green-600 hover:underline dark:text-green-400"> 用户服务协议 </a>、
          <a href="/privacy-policy" className="text-green-600 hover:underline dark:text-green-400"> 隐私政策 </a>和
          <a href="/licensing-agreement" className="text-green-600 hover:underline dark:text-green-400"> 授权许可协议</a>。
        </div>
      </div>
    </div>
  );
};

export { Login }; // Export Login component 