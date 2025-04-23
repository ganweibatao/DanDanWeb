// 这是用户注册界面，主要功能和组件：
// 整体布局与登录页面类似，也是卡片居中设计
// 顶部显示公司logo和"注册"标题
// 包含四个输入框：用户名、邮箱、密码、确认密码
// 底部有"注册"按钮
// 页面底部有引导用户登录的链接（"已有账号? 立即登录"）
// 表单提交时会触发handleRegister函数，目前仅打印注册信息，后续可添加实际注册逻辑
import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { Home, Eye, EyeOff } from "lucide-react";
import axios from "axios";

export const Register = (): JSX.Element => {
  const navigate = useNavigate();
  const [registerMethod, setRegisterMethod] = useState<"phone" | "email">("phone");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [countDown, setCountDown] = useState(0);
  const [error, setError] = useState("");
  const [userType, setUserType] = useState<"teacher" | "student">("student");

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    
    try {
      if (registerMethod === "phone") {
        setError("手机验证码注册功能暂未开放");
        return;
      }
      
      // 验证密码
      if (password !== confirmPassword) {
        setError("两次输入的密码不一致");
        return;
      }
      
      // 邮箱注册
      const response = await axios.post("http://localhost:8000/api/v1/accounts/users/register/", {
        email: email,
        password: password,
        user_type: userType
      });

      
      // 注册成功,根据身份跳转
      const regUserType = response.data.user_type as "student" | "teacher" | string;
      const regUserId = response.data.user_id as number | string;
      if (regUserType === "student") {
        navigate(`/students/${regUserId}`);
      } else if (regUserType === "teacher") {
        navigate("/schools");
      } else {
        // 其他类型默认跳转到个人中心
        navigate("/schools");
      }
      
    } catch (err: any) {
      // 改进错误处理，显示更详细的错误信息
      console.error('注册错误:', err);
      if (err.response) {
        setError(err.response.data.error || `注册失败: ${err.response.status} ${err.response.statusText}`);
      } else if (err.request) {
        setError("无法连接到服务器，请检查网络连接");
      } else {
        setError(`注册失败: ${err.message}`);
      }
    }
  };

  const handleSendCode = () => {
    if (!phone) {
      setError("请输入手机号码");
      return;
    }
    // 这里添加发送验证码逻辑
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

  return (
    <div className="register-page flex min-h-screen items-center justify-center p-4" style={{background: '#f5f6fa', color: '#222'}}>
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
          <h1 className="text-2xl font-bold text-[#222]">注册</h1>
        </CardHeader>
        <CardContent className="bg-white">
          <div className="flex mb-4 border-b border-[#e0e0e0]">
            <button
              className={`flex-1 pb-2 font-medium ${
                registerMethod === "phone"
                  ? "text-[#222] border-b-2 border-[#222]"
                  : "text-gray-500"
              }`}
              onClick={() => setRegisterMethod("phone")}
              type="button"
            >
              手机号注册
            </button>
            <button
              className={`flex-1 pb-2 font-medium ${
                registerMethod === "email"
                  ? "text-[#222] border-b-2 border-[#222]"
                  : "text-gray-500"
              }`}
              onClick={() => setRegisterMethod("email")}
              type="button"
            >
              邮箱注册
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-600 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                注册身份
              </label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={userType === "student" ? "default" : "outline"}
                  className={`flex-1 ${
                    userType === "student"
                      ? "bg-[#222] text-white"
                      : "border-[#222] text-[#222]"
                  }`}
                  onClick={() => setUserType("student")}
                >
                  学生
                </Button>
                <Button
                  type="button"
                  variant={userType === "teacher" ? "default" : "outline"}
                  className={`flex-1 ${
                    userType === "teacher"
                      ? "bg-[#222] text-white"
                      : "border-[#222] text-[#222]"
                  }`}
                  onClick={() => setUserType("teacher")}
                >
                  教师
                </Button>
              </div>
            </div>

            {registerMethod === "phone" ? (
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
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className={`w-32 border-[#222] ${
                        countDown > 0 ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      onClick={handleSendCode}
                      disabled={countDown > 0}
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
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    邮箱
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    required
                    className="w-full bg-[#f5f5f5] border-[#e0e0e0] focus:bg-white"
                    placeholder="请输入邮箱"
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
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    确认密码
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full bg-[#f5f5f5] border-[#e0e0e0] focus:bg-white pr-10"
                      placeholder="请再次输入密码"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </>
            )}
            
            <Button
              type="submit"
              className="w-full bg-[#222] text-white py-2"
            >
              注册
            </Button>
            <div className="text-center mt-4">
              <span className="text-sm text-gray-600">已有账号? </span>
              <Link to="/login" className="text-sm text-blue-600 hover:underline">
                立即登录
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}; 