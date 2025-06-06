import { Sidebar as StudentsSidebar } from './Students/StudentsSidebar';

// 图标组件
const OwlIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="40" fill="#4c1d95"/>
    <circle cx="35" cy="40" r="10" fill="white"/>
    <circle cx="65" cy="40" r="10" fill="white"/>
    <circle cx="35" cy="40" r="5" fill="black"/>
    <circle cx="65" cy="40" r="5" fill="black"/>
    <polygon points="45,60 55,60 50,70" fill="orange"/>
    <path d="M20,30 Q30,15 40,30" stroke="#4c1d95" strokeWidth="5" fill="none"/>
    <path d="M60,30 Q70,15 80,30" stroke="#4c1d95" strokeWidth="5" fill="none"/>
  </svg>
);
const FilledHeartIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);
const InfinityHeartIcon = ({ className }: { className?: string }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <svg className="w-10 h-10 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.178 7.822a4 4 0 0 0-5.656 0l-6.364 6.364a4 4 0 1 0 5.656 5.656l6.364-6.364a4 4 0 0 0-5.656-5.656z"></path></svg>
  </div>
);

export default function StorePage() {
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <StudentsSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="rounded-xl bg-gradient-to-br from-indigo-600 via-purple-700 to-blue-800 p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8 relative overflow-hidden">
          <OwlIcon className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 text-purple-300" />
          <div className="flex-grow text-center md:text-left">
            <span className="absolute top-2 right-2 bg-yellow-400 text-purple-800 text-xs font-bold px-2 py-0.5 rounded-full transform rotate-[-10deg]">SUPER</span>
            <h2 className="text-xl md:text-2xl font-bold mb-2">马上开启 2 天免费会员，享受 Super 精彩福利</h2>
            <button className="bg-white text-indigo-700 font-bold hover:bg-gray-100 px-6 py-2.5 rounded-lg shadow w-full md:w-auto">开始 14 天免费体验</button>
          </div>
        </div>
        {/* 红心 Section */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">红心</h2>
          <div className="space-y-4">
            {/* 补心 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                  <FilledHeartIcon className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">补心</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">用宝石重新获取满心，就能继续学习！犯错也不用担心咯！</p>
                </div>
              </div>
              <button disabled className="bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600 cursor-not-allowed px-4 py-2 rounded">已满</button>
            </div>
            {/* 无限红心 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                <div className="bg-teal-100 dark:bg-teal-900/30 p-2 rounded-full">
                  <InfinityHeartIcon className="w-8 h-8 text-teal-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">无限红心</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">用 Super，答错也不丢心！</p>
                </div>
              </div>
              <button className="border border-purple-400 text-purple-600 dark:border-purple-500 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-gray-700 font-semibold px-4 py-2 rounded">免费体验</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
} 