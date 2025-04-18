import React from "react";
import { Button } from "../../../components/ui/button";

interface CompletionScreenProps {
  learningMode: 'new' | 'review' | null;
  remainingTaskType: 'new' | 'review' | 'none' | null;
  handleGoHome: () => void;
  navigate: (to: any) => void;
}

export const CompletionScreen: React.FC<CompletionScreenProps> = ({
  learningMode,
  remainingTaskType,
  handleGoHome,
  navigate,
}) => {
  return (
    <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Centered content card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md mx-auto animate-fade-in-scale">
        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-semibold mb-3 text-center text-gray-900 dark:text-gray-100">
          {learningMode === 'new' ? '新单词学习完成！' : '复习完成！'}
        </h2>
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-4">
          {/* Button to continue learning (if applicable) */}
          {(remainingTaskType === 'new' || remainingTaskType === 'review') && (
            <Button
              onClick={() => navigate(0)} // Reload to fetch next batch
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white w-full sm:w-auto"
              size="lg"
            >
              {remainingTaskType === 'new' ? '学习新词' : '继续复习'}
            </Button>
          )}
          {/* Button to go home */}
          <Button
            onClick={handleGoHome}
            variant="outline"
            className="w-full sm:w-auto border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            size="lg"
          >
            返回主页
          </Button>
        </div>
      </div>
    </div>
  );
}; 