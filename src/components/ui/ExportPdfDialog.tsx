import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from './dialog';
import { Button } from './button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

export type ExportType = '中英' | '仅中文' | '仅英文';

interface ExportPdfDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (exportType: ExportType) => void;
  isLoading?: boolean;
}

export const ExportPdfDialog = ({
  open,
  onOpenChange,
  onExport,
  isLoading = false
}: ExportPdfDialogProps) => {
  const [exportType, setExportType] = useState<ExportType>('中英');

  const handleExport = () => {
    onExport(exportType);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>导出单词列表 PDF</DialogTitle>
        <DialogDescription>
          请选择导出的内容格式，导出将包含当前学习的全部单词（不仅限于当前页）。
        </DialogDescription>
        
        <div className="my-6">
          <Select 
            value={exportType} 
            onValueChange={(value) => setExportType(value as ExportType)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="选择导出格式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="中英">中英双语（单词+释义）</SelectItem>
              <SelectItem value="仅中文">仅中文释义</SelectItem>
              <SelectItem value="仅英文">仅英文单词</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            取消
          </Button>
          <Button 
            onClick={handleExport}
            disabled={isLoading}
          >
            {isLoading ? '导出中...' : '导出 PDF'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 