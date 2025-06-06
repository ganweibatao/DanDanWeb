import { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { MailOutlined, LockOutlined, WechatOutlined, EyeOutlined, EyeInvisibleOutlined, ReloadOutlined, UserOutlined, KeyOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { apiClient, wechatAuthService, authService } from '../../services/api';

const Register = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Check if navigation state requests WeChat mode by default
  const defaultToWechat = location.state?.defaultMode === 'wechat';

  const defaultMode = location.state?.defaultMode as 'wechat' | 'email' | undefined;
  const [loginMode, setLoginMode] = useState<'wechat' | 'email'>(defaultMode || 'email');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [wechatAuthUrl, setWechatAuthUrl] = useState<string | null>(null);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isVerificationCodeSent, setIsVerificationCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const qrCodeRef = useRef<HTMLDivElement>(null);

  const handleSendVerificationCode = async () => {
    if (!email) {
      setRegistrationError('请输入邮箱地址');
      return;
    }
    setRegistrationError(null);
    try {
      await authService.sendEmailCode(email);
      setIsVerificationCodeSent(true);
      setCountdown(60);
    } catch (error: any) {
      setRegistrationError(error.message || '发送验证码失败，请稍后重试');
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setIsVerificationCodeSent(false);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleEmailRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistrationError(null);
    if (password.length < 8 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      setRegistrationError('密码必须包含8至16个字符，并且包含大小写字母和数字。');
      return;
    }
    try {
      await authService.register({
        name,
        email,
        password,
        verification_code: verificationCode,
      });
      navigate('/login?registrationSuccess=true');
    } catch (error: any) {
      if (error.message) {
        setRegistrationError(error.message);
      } else if (error.response?.data?.error) {
        setRegistrationError(error.response.data.error);
      } else if (error.response?.data?.detail) {
        setRegistrationError(error.response.data.detail);
      } else {
        setRegistrationError('注册失败，请稍后重试');
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
            setRegistrationError('无法获取微信扫码链接，请稍后重试。返回邮箱注册或刷新页面重试。');
          }
        })();
      } else {
         window.location.href = wechatAuthUrl;
      }
    }

    const queryParams = new URLSearchParams(location.search);
    const errorParam = queryParams.get('error');
    const msgParam = queryParams.get('msg');

    if (errorParam) {
      let errorMessage = '微信注册失败，请稍后重试。';
      if (errorParam === 'wx_callback_state_mismatch' || errorParam === 'wx_callback_state_expired') {
        errorMessage = '注册凭证无效或已过期，请重新扫描二维码。';
      } else if (errorParam === 'wx_api_token' || errorParam === 'wx_api_userinfo' || errorParam === 'wx_api_request_failed') {
        errorMessage = `微信授权失败: ${msgParam || '请重试'}`;
      } else if (errorParam === 'wx_callback_missing_params') {
        errorMessage = '微信回调参数错误，请重试。';
      } else if (errorParam === 'wx_email_conflict') {
        errorMessage = '该微信关联的邮箱可能已被其他账号使用，请检查或联系客服。';
      } else if (errorParam === 'wx_callback_server_error') {
        errorMessage = '服务器处理微信注册时发生内部错误，请稍后重试。';
      }
      setRegistrationError(errorMessage);
    }
  }, [loginMode, wechatAuthUrl, location, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-md shadow-sm w-full max-w-md">
        {loginMode === 'wechat' ? (
          <div className="flex flex-col items-center justify-center py-10 min-h-[200px]">
            {registrationError ? (
              <div className="w-full p-3 text-center">
                <p className="text-red-600 mb-4">{registrationError}</p>
                <Button 
                  onClick={() => { 
                    setRegistrationError(null);
                    setLoginMode('email'); 
                  }}
                  variant="outline"
                  className="border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600"
                >
                  返回邮箱注册
                </Button>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-300 text-center">
                正在跳转到微信进行扫码注册...
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="text-center pt-1 pb-4">
              <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">创建账号</h2>
            </div>
            <form onSubmit={handleEmailRegisterSubmit} className="space-y-4">
              <div>
                <label htmlFor="name-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  姓名
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserOutlined className="text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    id="name-input"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="appearance-none block w-full px-3 py-2.5 pl-10 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="请输入您的姓名"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  电子邮箱
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
                    placeholder="请输入您的邮箱"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="verification-code-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  邮箱验证码
                </label>
                <div className="mt-1 flex items-center space-x-2">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <KeyOutlined className="text-gray-400" />
                    </div>
                    <Input
                      type="text"
                      id="verification-code-input"
                      name="verificationCode"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      required
                      maxLength={6}
                      className="appearance-none block w-full px-3 py-2.5 pl-10 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="6位验证码"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleSendVerificationCode}
                    disabled={isVerificationCodeSent || countdown > 0}
                    className={`py-2.5 px-4 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-400 ${
                      isVerificationCodeSent || countdown > 0
                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-700 dark:text-green-100 dark:hover:bg-green-600'
                    }`}
                  >
                    {countdown > 0 ? `${countdown}秒后重发` : (isVerificationCodeSent ? '已发送' : '获取验证码')}
                  </Button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    密码
                  </label>
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
                    placeholder="8至16个字符，含大小写字母和数字"
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

              {registrationError && (
                <div className="w-full text-center text-red-600 pt-0.5 text-sm">
                  {registrationError}
                </div>
              )}

              <div className="flex gap-3 pt-2.5">
                <Button
                  type="submit"
                  className="flex-1 flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-400 dark:bg-green-600 dark:hover:bg-green-700"
                >
                  注册
                </Button>
              </div>
            </form>

            {/* Other Login Methods Section */}
            <div className="mt-6 pt-3 pb-0.5">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    其他方式注册
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-col items-center">
                <button
                  onClick={() => {
                    setRegistrationError(null);
                    setLoginMode('wechat'); 
                  }}
                  type="button"
                  className="flex items-center space-x-1 rounded-lg p-2 text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-green-500"
                  aria-label="微信注册"
                >
                  <WechatOutlined className="h-10 w-10 text-2xl" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">微信注册</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Mode Switcher: Only show "Email Login" when in WeChat mode */}
        {loginMode === 'wechat' && (
          <div className="flex items-center justify-center mt-4 mb-1 text-sm text-gray-600 dark:text-gray-300">
            <button
              onClick={() => { setLoginMode('email'); setRegistrationError(null); }}
              className="flex items-center text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300"
            >
              <MailOutlined className="mr-1 text-lg" /> 邮箱注册
            </button>
          </div>
        )}
        
        {/* <div className="mt-4 text-sm text-gray-600 dark:text-gray-300 text-center">
            已有账号？ 
            <Link to="/login" className="font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300">
                前往登录
            </Link>
        </div> */}

        <div className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4">
          注册即视为同意
          <a href="/terms-of-service" className="text-green-600 hover:underline dark:text-green-400"> 用户服务协议 </a>、
          <a href="/privacy-policy" className="text-green-600 hover:underline dark:text-green-400"> 隐私政策 </a>和
          <a href="/licensing-agreement" className="text-green-600 hover:underline dark:text-green-400"> 授权许可协议</a>。
        </div>
      </div>
    </div>
  );
};

export { Register }; 