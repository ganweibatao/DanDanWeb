// 这是一个用户登录界面，主要功能和组件：
// 整个页面采用卡片居中设计，背景使用与主题一致的颜色
// 顶部显示公司logo和"登录"标题
// 包含两个输入框：用户名和密码
// 右上角有"忘记密码"链接
// 底部有"登录"按钮
// 页面底部有引导用户注册的链接（"还没有账号? 立即注册"）
// 表单提交时会触发handleLogin函数，目前仅打印输入信息，后续可添加实际登录逻辑
import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Link, useNavigate } from "react-router-dom"; // 用来创建页面间的链接和登录后页面跳转
import { Home, Eye, EyeOff } from "lucide-react"; // 引入Home, Eye, EyeOff图标组件
import axios from "axios";

export const Login = (): JSX.Element => {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // showPassword 是状态变量，用来记录当前密码是否显示,setShowPassword 是用来更新这个状态的函数
  const [verificationCode, setVerificationCode] = useState("");
  const [countDown, setCountDown] = useState(0);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    
    try {
      let response;
      if (loginMethod === "phone") {
        // 手机验证码登录暂未实现
        setError("手机验证码登录功能暂未开放");
        return;
      } else {
        // 邮箱登录
        response = await axios.post("http://localhost:8000/api/v1/accounts/users/login/", {
          email: emailOrPhone,
          password: password
        });
      }
      
      // 保存token和用户信息
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify({
        id: response.data.user_id,
        email: response.data.email,
        userType: response.data.user_type
      }));
      
      // 设置axios默认header
      axios.defaults.headers.common["Authorization"] = `Token ${response.data.token}`;
      
      // 登录成功,跳转到学校页面，并替换历史记录。
      // 在登录成功后，我们应该清除浏览器的历史记录，这样用户就不能返回到登录页面
      navigate("/schools", { replace: true });
      
    } catch (err: any) {
      if (err.response) {
        setError(err.response.data.error || "登录失败,请重试");
      } else {
        setError("网络错误,请稍后重试");
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
            >
              账号密码登录
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-600 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
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
            >
              登录
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