import React from "react";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";

interface CompletionScreenProps {
  learningMode: 'new' | 'review' | null;
  remainingTaskType: 'new' | 'review' | 'none' | null;
  handleGoHome: () => void;
  navigate: (to: any) => void; // Consider a more specific type like NavigateFunction from react-router
  onClose: () => void; // New prop to handle closing without navigating
}

export const CompletionScreen: React.FC<CompletionScreenProps> = ({
  learningMode,
  remainingTaskType,
  handleGoHome,
  navigate,
  onClose, // Use the new prop
}) => {
  // This dialog is always open when rendered; its mounting is controlled by the parent.
  // onOpenChange is used here to handle the internal close button (X) click.
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose(); // Call the new onClose prop instead of handleGoHome
    }
  };

  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md p-0 sm:rounded-lg" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader className="pt-6 px-6">
          <DialogTitle className="text-center text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {learningMode === 'new' ? '新单词学习完成！' : '复习完成！'}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-4 px-6 pb-6">
          {(remainingTaskType === 'new' || remainingTaskType === 'review') && (
            <Button
              onClick={() => navigate(0)} // Consider a more semantic navigation target
              variant="default"
              size="lg"
              className="w-full sm:w-auto"
            >
              {remainingTaskType === 'new' ? '学习新词' : '继续复习'}
            </Button>
          )}
          <Button
            onClick={handleGoHome}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto rounded-full" // Made button rounded
          >
            返回主页
          </Button>
        </div>
        {/* No explicit DialogFooter needed as buttons are placed directly */}
      </DialogContent>
    </Dialog>
  );
}; 