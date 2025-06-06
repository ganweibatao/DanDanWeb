import { SettingsSidebar } from '../../components/layout/SettingsRightSidebar';
import { Sidebar } from '../Students/StudentsSidebar';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';

export const BindWeChatPage = (): JSX.Element => {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  const handleBindWeChat = () => {
    if (!isAuthenticated || !user?.id) {
      toast.error('用户未登录，无法绑定微信。');
      return;
    }
    // 重定向到后端处理微信账号关联的URL
    window.location.href = '/auth/associate/wechat/';
  };

  if (authLoading) {
    return <div className="flex justify-center items-center h-screen">加载中...</div>;
  }
  if (!isAuthenticated) {
    return <div className="flex justify-center items-center h-screen">请先登录以访问此页面。</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-100 text-gray-900 dark:text-gray-900 font-sans">
      <Sidebar /> {/* 主应用侧边栏 */}

      {/* 主内容区域 */}
      <main className="flex-1 p-10 overflow-y-auto bg-white dark:bg-gray-900">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-200">绑定微信</h1>

        <section className="mb-10 space-y-6">
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">关联您的微信账号</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              将您的微信账号与当前平台账户绑定后，您可以使用微信进行快速登录。
              点击下方的按钮，页面将会跳转至微信官方授权页面进行操作。
            </p>
            <Button 
              onClick={handleBindWeChat}
              className="bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700 font-semibold py-2 px-6 rounded-md transition-colors"
            >
              立即绑定微信
            </Button>
            {/* 
              未来可增强功能：显示当前微信绑定状态。
              例如：
              如果已绑定:
              // <p>您已绑定微信账号：[微信昵称]</p>
              // <Button onClick={handleUnbindWeChat}>解除绑定</Button> // 解除绑定需要后端接口支持
              如果未绑定，则显示上面的"立即绑定微信"按钮。
            */}
          </div>
        </section>
      </main>

      {/* 设置相关的右侧边栏 */}
      <SettingsSidebar />
    </div>
  );
}; 