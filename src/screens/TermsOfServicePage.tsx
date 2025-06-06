import { Sidebar as StudentsSidebar } from './Students/StudentsSidebar';
import { useAuth } from '../hooks/useAuth'; // 引入 useAuth hook

const TermsOfServicePage = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">加载中...</div>;
  }

  return (
    <div className={`flex h-screen bg-white dark:bg-gray-900 overflow-hidden ${!isAuthenticated ? 'justify-center' : ''}`}>
      {isAuthenticated && <StudentsSidebar />}

      <main className={`flex-1 overflow-y-auto p-8 md:p-12 ${!isAuthenticated ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}`}>
        <div className={`mx-auto ${isAuthenticated ? 'max-w-4xl' : 'max-w-5xl px-4 md:px-6 lg:px-8 py-12'}`}>
          <h1 className={`font-bold mb-10 ${isAuthenticated ? 'text-3xl md:text-4xl text-gray-800 dark:text-gray-100' : 'text-4xl md:text-5xl text-gray-900 dark:text-white text-center'}`}>
            服务条款
          </h1>
          <div className="space-y-8 leading-relaxed text-gray-700 dark:text-gray-200 text-lg">
            <p className={`${!isAuthenticated ? 'text-center' : ''}`}>
              请注意，我们在2024年9月23日修订了本服务条款和条件。
            </p>
            
            <section>
              <h2 className={`font-semibold mb-3 ${isAuthenticated ? 'text-2xl text-gray-800 dark:text-gray-100' : 'text-3xl text-gray-900 dark:text-white'}`}>1. 一般</h2>
              <p>
                蛋仔网站(“网站”)和移动应用程序和相关服务(连同网站一起简称“服务”)由小蜥蜴（深圳）信息技术有限责任公司(简称“蛋仔”或“我们”)运营。本服务的访问和使用受以下服务条款和条件(简称“《条款和条件》”)的约束。通过访问或使用服务的任何部分，意味着您已阅读、理解并同意受本《条款和条件》的约束，包括将来的任何修改。蛋仔可修订、更新或变更本《条款和条件》。如果我们对《条款和条件》进行修订、更新或变更，我们将在网站上发布通知，说明我们已对本《条款和条件》进行了更改，并在更改发布后将该通知至少保留7天，并在《条款和条件》的底部注明这些条款的最后修订日期。对本《条款和条件》的任何修订将于以下日期(以较早日期为准)生效：(1)该7天期限结束时，或(2)您在该等变更后首次访问或使用服务时。如果您不同意遵守本《条款和条件》，则您无权使用、访问或参与本服务。
              </p>
              <p className="mt-2">
                请注意，本《条款和条件》包含强制性的争议仲裁条款，要求某些情况下在个案基础上通过仲裁而不是陪审团审判或集体诉讼来解决争议。在此处查看这些条款。
              </p>
            </section>

            <section>
              <h2 className={`font-semibold mb-3 ${isAuthenticated ? 'text-2xl text-gray-800 dark:text-gray-100' : 'text-3xl text-gray-900 dark:text-white'}`}>2. 网站和服务描述</h2>
              <p>
                本服务允许用户访问和使用各种教育服务，包括学习或练习一门语言。蛋仔可随时自行决定对服务的任何方面进行临时或永久更新、更改、暂停、改进或中断。
              </p>
            </section>

            <section>
              <h2 className={`font-semibold mb-3 ${isAuthenticated ? 'text-2xl text-gray-800 dark:text-gray-100' : 'text-3xl text-gray-900 dark:text-white'}`}>3. 服务的可接受使用</h2>
              <p>用户应保证注册信息真实、准确、完整。</p>
              <p>用户不得冒用他人身份注册或使用平台。</p>
              <p>用户应妥善保管账号和密码，因保管不善造成的损失由用户自行承担。</p>
            </section>
            
            <section>
              <h2 className={`font-semibold mb-3 ${isAuthenticated ? 'text-2xl text-gray-800 dark:text-gray-100' : 'text-3xl text-gray-900 dark:text-white'}`}>4. 知识产权</h2>
              <p>平台内所有内容（包括但不限于文字、图片、音频、视频、软件等）均受法律保护，归平台或相关权利人所有。</p>
              <p>未经授权，用户不得擅自复制、传播、修改、出售或用于商业用途。</p>
            </section>

            <section>
              <h2 className={`font-semibold mb-3 ${isAuthenticated ? 'text-2xl text-gray-800 dark:text-gray-100' : 'text-3xl text-gray-900 dark:text-white'}`}>5. 行为规范</h2>
              <p>用户不得利用平台从事违法违规活动，不得发布不良信息。</p>
              <p>用户应尊重他人合法权益和平台秩序。</p>
            </section>

            <section>
              <h2 className={`font-semibold mb-3 ${isAuthenticated ? 'text-2xl text-gray-800 dark:text-gray-100' : 'text-3xl text-gray-900 dark:text-white'}`}>6. 免责声明</h2>
              <p>平台将尽力保障服务的连续性和安全性，但不对因不可抗力或第三方原因导致的服务中断、数据丢失等承担责任。</p>
              <p>用户因使用平台服务产生的风险和责任由用户自行承担。</p>
            </section>

            <section>
              <h2 className={`font-semibold mb-3 ${isAuthenticated ? 'text-2xl text-gray-800 dark:text-gray-100' : 'text-3xl text-gray-900 dark:text-white'}`}>7. 服务变更与终止</h2>
              <p>平台有权根据实际情况变更、暂停或终止部分或全部服务，并提前公告。</p>
              <p>如用户违反本条款，平台有权随时中止或终止对其服务。</p>
            </section>

            <section>
              <h2 className={`font-semibold mb-3 ${isAuthenticated ? 'text-2xl text-gray-800 dark:text-gray-100' : 'text-3xl text-gray-900 dark:text-white'}`}>8. 联系我们</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>如有疑问、建议或投诉，请通过 751041637@qq.com 联系我们。</li>
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

export default TermsOfServicePage; 