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
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

export const Register = (): JSX.Element => {
  const [registerMethod, setRegisterMethod] = useState<"phone" | "email">("phone");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [countDown, setCountDown] = useState(0);

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (registerMethod === "phone") {
      console.log("手机验证码注册:", { phone, verificationCode });
      // 这里添加手机验证码注册逻辑
    } else {
      console.log("邮箱注册:", { email, password, confirmPassword });
      // 这里添加邮箱注册逻辑
    }
  };

  const handleSendCode = () => {
    if (!phone) {
      alert("请输入手机号码");
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
    <div className="flex min-h-screen items-center justify-center bg-color-schemes-color-scheme-1-background p-4">
      <Card className="w-full max-w-md shadow-lg border-2 border-[color:var(--primitives-color-neutral-darkest)]">
        <CardHeader className="text-center bg-[color:var(--color-schemes-color-scheme-2-background)] relative">
          <Link
            to="/"
            className="absolute left-4 top-4 text-[color:var(--primitives-color-neutral-darkest)] hover:opacity-80 transition-opacity"
          >
            <Home className="h-6 w-6" />
          </Link>
          <img
            className="mx-auto w-[84px] h-9 mb-4"
            alt="Company logo"
            src="/img/company-logo.svg"
          />
          <h1 className="text-2xl font-bold text-[color:var(--color-schemes-color-scheme-1-text)]">注册</h1>
        </CardHeader>
        <CardContent className="bg-[color:var(--color-schemes-color-scheme-2-background)]">
          <div className="flex mb-4 border-b border-[color:var(--color-schemes-color-scheme-1-border)]">
            <button
              className={`flex-1 pb-2 font-medium ${
                registerMethod === "phone"
                  ? "text-[color:var(--primitives-color-neutral-darkest)] border-b-2 border-[color:var(--primitives-color-neutral-darkest)]"
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
                  ? "text-[color:var(--primitives-color-neutral-darkest)] border-b-2 border-[color:var(--primitives-color-neutral-darkest)]"
                  : "text-gray-500"
              }`}
              onClick={() => setRegisterMethod("email")}
              type="button"
            >
              邮箱注册
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
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
                    className="w-full bg-[#f5f5f5] border-[color:var(--color-schemes-color-scheme-1-border)] focus:bg-white"
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
                      className="flex-1 bg-[#f5f5f5] border-[color:var(--color-schemes-color-scheme-1-border)] focus:bg-white"
                      placeholder="请输入验证码"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className={`w-32 border-[color:var(--primitives-color-neutral-darkest)] ${
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
                    className="w-full bg-[#f5f5f5] border-[color:var(--color-schemes-color-scheme-1-border)] focus:bg-white"
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
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    required
                    className="w-full bg-[#f5f5f5] border-[color:var(--color-schemes-color-scheme-1-border)] focus:bg-white"
                    placeholder="请输入密码"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    确认密码
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full bg-[#f5f5f5] border-[color:var(--color-schemes-color-scheme-1-border)] focus:bg-white"
                    placeholder="请再次输入密码"
                  />
                </div>
              </>
            )}
            
            <Button
              type="submit"
              className="w-full bg-[color:var(--primitives-color-neutral-darkest)] py-2"
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