import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";

interface AddWordsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCount: number;
  value: number;
  onValueChange: (v: number) => void;
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
}

export const AddWordsDialog: React.FC<AddWordsDialogProps> = ({
  open,
  onOpenChange,
  currentCount,
  value,
  onValueChange,
  onCancel,
  onConfirm,
  loading,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>添加更多单词</DialogTitle>
        <DialogDescription>
          当前已有 {currentCount} 个单词。您可以选择添加额外的单词进行学习。
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="words-count" className="text-right">
            词量
          </Label>
          <Input
            id="words-count"
            type="number"
            value={value}
            onChange={e => onValueChange(Number(e.target.value))}
            min={1}
            max={50}
            className="col-span-3"
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          取消
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {loading ? "加载中..." : "添加"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
); 