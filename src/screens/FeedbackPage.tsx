import { useState } from 'react';
import { Sidebar as StudentsSidebar } from './Students/StudentsSidebar';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { CheckCircleIcon } from 'lucide-react';
import { sendFeedback } from '../services/feedbackApi';

export default function FeedbackPage() {
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState('general');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) return;
    setFeedbackSubmitting(true);
    try {
      await sendFeedback(feedbackCategory, feedbackText);
      setFeedbackSubmitted(true);
      setTimeout(() => {
        setFeedbackSubmitted(false);
        setFeedbackText('');
        setFeedbackCategory('general');
      }, 3000);
    } catch (e: any) {
      alert(e.message || '提交失败，请稍后重试');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <StudentsSidebar />
      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-white dark:bg-gray-900">
        <header className="flex items-center justify-between px-10 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">向DanZai团队发送反馈</h1>
          </div>
        </header>
        <div className="flex-grow p-10 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            {!feedbackSubmitted ? (
              <div className="space-y-6">
                <p className="text-gray-600 dark:text-gray-400">
                  我们非常重视您的意见！请告诉我们您的想法，以帮助我们改进DanZai平台。
                </p>
                {/* 反馈类别选择 */}
                <div>
                  <label htmlFor="feedbackCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    反馈类别
                  </label>
                  <Select value={feedbackCategory} onValueChange={setFeedbackCategory}>
                    <SelectTrigger id="feedbackCategory" className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                      <SelectValue placeholder="选择反馈类别" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">一般反馈</SelectItem>
                      <SelectItem value="bug">错误报告</SelectItem>
                      <SelectItem value="feature">功能请求</SelectItem>
                      <SelectItem value="content">内容相关</SelectItem>
                      <SelectItem value="other">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* 反馈内容 */}
                <div>
                  <label htmlFor="feedbackContent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    反馈内容
                  </label>
                  <textarea
                    id="feedbackContent"
                    rows={6}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="请详细描述您的反馈..."
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100"
                  />
                </div>
                {/* 提交按钮 */}
                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmitFeedback}
                    disabled={!feedbackText.trim() || feedbackSubmitting}
                    className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {feedbackSubmitting ? '提交中...' : '提交反馈'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 space-y-4">
                <CheckCircleIcon className="w-16 h-16 mx-auto text-green-500" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">感谢您的反馈！</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  我们已收到您的反馈，并将认真考虑您的建议。
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 