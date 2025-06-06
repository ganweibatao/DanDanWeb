import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { MailOutlined, LockOutlined, KeyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isVerificationCodeSent, setIsVerificationCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 发送验证码处理
  const handleSendVerificationCode = async () => {
    if (!email) {
      setError('请输入邮箱地址');
      return;
    }
    setError(null);
    try {
      await authService.sendEmailCode(email);
      setIsVerificationCodeSent(true);
      setCountdown(60);
    } catch (err: any) {
      setError(err.message || '发送验证码失败，请稍后重试');
    }
  };

  // 倒计时效果
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setIsVerificationCodeSent(false);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const validatePassword = (pwd: string) => {
    return pwd.length >= 8 && /[a-z]/.test(pwd) && /[A-Z]/.test(pwd) && /\d/.test(pwd);
  };

  // 表单提交处理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!validatePassword(newPassword)) {
      setError('密码必须包含8至16个字符，并且包含大小写字母和数字。');
      return;
    }

    try {
      await authService.resetPassword({ email, code: verificationCode, new_password: newPassword });
      setSuccessMessage('密码已重置，请使用新密码登录');
      // 跳转到登录页
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      setError(err.message || '重置密码失败，请稍后重试');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-md shadow-sm w-full max-w-md">
        <div className="text-center pt-1 pb-4">
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">重置密码</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label htmlFor="password-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              新密码
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockOutlined className="text-gray-400" />
              </div>
              <Input
                type="password"
                id="password-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="appearance-none block w-full px-3 py-2.5 pl-10 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="8至16个字符，含大小写字母和数字"
              />
            </div>
          </div>

          {error && (
            <div className="w-full text-center text-red-600 pt-0.5 text-sm">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="w-full text-center text-green-600 pt-0.5 text-sm">
              {successMessage}
            </div>
          )}

          <div className="flex gap-3 pt-2.5">
            <Button
              type="submit"
              className="flex-1 flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-400 dark:bg-green-600 dark:hover:bg-green-700"
            >
              重置密码
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export { ResetPassword }; 