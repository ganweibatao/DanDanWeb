import { Sidebar as StudentsSidebar } from './Students/StudentsSidebar';
import { useAuth } from '../hooks/useAuth';

const PrivacyPolicyPage = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // 在加载认证状态时，可以选择显示加载指示器或null
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">加载中...</div>; // 或者返回 null
  }

  return (
    <div className={`flex h-screen bg-white dark:bg-gray-900 overflow-hidden ${!isAuthenticated ? 'justify-center' : ''}`}>
      {isAuthenticated && <StudentsSidebar />} 

      <main className={`flex-1 overflow-y-auto p-8 md:p-12 ${!isAuthenticated ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}`}>
        <div className={`mx-auto ${isAuthenticated ? 'max-w-4xl' : 'max-w-5xl px-4 md:px-6 lg:px-8 py-12'}`}> 
          <h1 className={`font-bold mb-10 ${isAuthenticated ? 'text-3xl md:text-4xl text-gray-800 dark:text-gray-100' : 'text-4xl md:text-5xl text-gray-900 dark:text-white text-center'}`}>
            隐私政策
          </h1>
          <div className="space-y-8 leading-relaxed text-gray-700 dark:text-gray-200 text-lg">
            <p className={`${!isAuthenticated ? 'text-center' : ''}`}>
              欢迎使用本平台。我们深知个人信息对您的重要性，并会尽全力保护您的隐私安全。请您在使用我们的服务前，仔细阅读本隐私政策。
            </p>
            
            <section> 
              <h2 className={`font-semibold mb-3 ${isAuthenticated ? 'text-2xl text-gray-800 dark:text-gray-100' : 'text-3xl text-gray-900 dark:text-white'}`}>1. 信息收集</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>注册信息：如姓名、邮箱、手机号、学校信息等。</li>
                <li>学习数据：包括学习进度、成绩、错题记录、互动内容等。</li>
                <li>设备信息：如设备型号、操作系统、IP地址、浏览器类型等。</li>
                <li>Cookies及同类技术：用于提升用户体验和分析服务使用情况。</li>
              </ul>
            </section>

            <section>
              <h2 className={`font-semibold mb-3 ${isAuthenticated ? 'text-2xl text-gray-800 dark:text-gray-100' : 'text-3xl text-gray-900 dark:text-white'}`}>2. 信息使用</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>用于账号注册、身份验证和安全保障。</li>
                <li>用于个性化学习内容推荐和学习效果分析。</li>
                <li>用于平台运营、服务改进及用户支持。</li>
                <li>符合法律法规的其他用途。</li>
              </ul>
            </section>

            <section>
              <h2 className={`font-semibold mb-3 ${isAuthenticated ? 'text-2xl text-gray-800 dark:text-gray-100' : 'text-3xl text-gray-900 dark:text-white'}`}>3. 信息保护</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>我们采用多种安全技术和管理措施保护您的信息安全，防止数据丢失、滥用或被未授权访问。</li>
                <li>仅授权员工可访问相关信息，并签署保密协议。</li>
              </ul>
            </section>

            <section>
              <h2 className={`font-semibold mb-3 ${isAuthenticated ? 'text-2xl text-gray-800 dark:text-gray-100' : 'text-3xl text-gray-900 dark:text-white'}`}>4. 信息共享与第三方</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>未经您同意，我们不会向第三方披露您的个人信息，法律法规或监管机构要求除外。</li>
                <li>如涉及第三方服务（如支付、认证等），我们会要求其同样保护您的信息安全。</li>
              </ul>
            </section>

            <section>
              <h2 className={`font-semibold mb-3 ${isAuthenticated ? 'text-2xl text-gray-800 dark:text-gray-100' : 'text-3xl text-gray-900 dark:text-white'}`}>5. 未成年人信息保护</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>我们高度重视未成年人信息保护，未成年人使用本平台需征得监护人同意。</li>
                <li>如发现未成年人未经同意注册或使用服务，我们会及时采取措施。</li>
              </ul>
            </section>

            <section>
              <h2 className={`font-semibold mb-3 ${isAuthenticated ? 'text-2xl text-gray-800 dark:text-gray-100' : 'text-3xl text-gray-900 dark:text-white'}`}>6. 用户权利</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>您有权访问、更正、删除您的个人信息，或撤回授权。</li>
                <li>如需行使上述权利，请通过下方联系方式与我们联系。</li>
              </ul>
            </section>

            <section>
              <h2 className={`font-semibold mb-3 ${isAuthenticated ? 'text-2xl text-gray-800 dark:text-gray-100' : 'text-3xl text-gray-900 dark:text-white'}`}>7. 隐私政策的变更</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>我们可能会适时更新本政策，重大变更会通过平台公告或其他方式通知您。</li>
              </ul>
            </section>

            <section>
              <h2 className={`font-semibold mb-3 ${isAuthenticated ? 'text-2xl text-gray-800 dark:text-gray-100' : 'text-3xl text-gray-900 dark:text-white'}`}>8. 联系我们</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>如有任何疑问、意见或投诉，请通过 751041637@qq.com 联系我们。</li>
              </ul>
            </section>
          </div>
          
          <footer className={`text-center ${isAuthenticated ? 'mt-16 pt-8 border-t border-gray-200 dark:border-gray-700' : 'mt-20 pt-10'}`}>
            <p className="text-sm text-gray-500 dark:text-gray-400 pb-8">
              版权所有 © 小蜥蜴（深圳）信息技术有限责任公司
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicyPage; 