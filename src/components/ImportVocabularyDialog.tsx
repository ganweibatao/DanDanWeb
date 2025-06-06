import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { Upload, FileText, CheckIcon, XIcon, AlertCircle, DownloadIcon } from 'lucide-react';
import { vocabularyService } from '../services/api';
import { useToast } from '../hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ImportVocabularyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ImportVocabularyDialog: React.FC<ImportVocabularyDialogProps> = ({
  open,
  onOpenChange,
}): JSX.Element => {
  const [step, setStep] = useState<'upload' | 'preview' | 'success'>('upload');
  const [bookName, setBookName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 创建词库并导入单词的复合操作
  const importMutation = useMutation({
    mutationFn: async ({ name, file }: { name: string; file: File }) => {
      let createdBook: any = null;
      try {
        // 1. 先创建词库
        createdBook = await vocabularyService.createVocabularyBook(name);
        // 2. 再导入单词
        const result = await vocabularyService.importWordsToBook(createdBook.id, file);
        return { book: createdBook, result };
      } catch (error) {
        // 如果导入单词失败且词库已创建，删除该词库
        if (createdBook && createdBook.id) {
          try {
            await vocabularyService.deleteVocabularyBook(createdBook.id);
          } catch (deleteError) {
            console.error('删除失败的词库时出错:', deleteError);
          }
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: "导入成功",
        description: `词库《${data.book.name}》创建成功，${data.result.message}`,
      });
      queryClient.invalidateQueries({ queryKey: ['vocabularyBooks'] });
      setStep('success');
    },
    onError: (error: Error) => {
      toast({
        title: "导入失败",
        description: error.message,
      });
    },
  });

  const handleFileSelect = (file: File) => {
    const isCSV = file.name.endsWith('.csv');
    
    if (!isCSV) {
      toast({
        title: "文件格式错误",
        description: "请选择CSV文件",
      });
      return;
    }

    setSelectedFile(file);
    
    // 读取CSV文件内容进行预览
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        // CSV 文件处理
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        // 简单的CSV解析函数，处理带引号的字段
        const parseCSVLine = (line: string): string[] => {
          const result: string[] = [];
          let current = '';
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];
            
            if (char === '"') {
              if (inQuotes && nextChar === '"') {
                // 处理双引号转义
                current += '"';
                i++; // 跳过下一个引号
              } else {
                // 切换引号状态
                inQuotes = !inQuotes;
              }
            } else if (char === ',' && !inQuotes) {
              // 字段分隔符
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          
          // 添加最后一个字段
          result.push(current.trim());
          return result;
        };
        
        const headers = parseCSVLine(lines[0] || '').map(h => h.replace(/^"|"$/g, ''));
        const dataRows = lines.slice(1, 6).map(line => {
          const values = parseCSVLine(line);
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = (values[index] || '').replace(/^"|"$/g, '');
          });
          return row;
        }).filter(row => row.word && row.chinese_meaning);
        
        // 验证必需的列
        const requiredColumns = ['word', 'chinese_meaning'];
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));
        
        if (missingColumns.length > 0) {
          toast({
            title: "文件格式错误",
            description: `缺少必需的列: ${missingColumns.join(', ')}`,
          });
          return;
        }
        
        if (dataRows.length === 0) {
          toast({
            title: "文件无效",
            description: "文件中没有有效的数据行",
          });
          return;
        }
        
        setPreviewData(dataRows);
        setStep('preview');
        
      } catch (error) {
        console.error('文件解析错误:', error);
        toast({
          title: "文件解析失败",
          description: "请检查文件格式是否正确",
        });
      }
    };
    
    reader.readAsText(file, 'utf-8');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (!bookName.trim()) {
      toast({
        title: "错误",
        description: "请输入词库名称",
      });
      return;
    }

    if (!selectedFile) {
      toast({
        title: "错误",
        description: "请选择文件",
      });
      return;
    }

    importMutation.mutate({ name: bookName.trim(), file: selectedFile });
  };

  const handleClose = () => {
    if (!importMutation.isPending) {
      setStep('upload');
      setBookName('');
      setSelectedFile(null);
      setPreviewData([]);
      onOpenChange(false);
    }
  };

  const downloadSampleFile = () => {
    const sampleData = [
      ['word', 'chinese_meaning', 'phonetic_symbol', 'part_of_speech', 'example_sentence'],
      ['apple', '苹果', '/ˈæpl/', 'n.', 'I eat an apple every day.'],
      ['book', '书', '/bʊk/', 'n.', 'She is reading a book.'],
      ['run', '跑', '/rʌn/', 'v.', 'He likes to run in the park.'],
      ['beautiful', '美丽的', '/ˈbjuːtɪfl/', 'adj.', 'The sunset is beautiful.'],
      ['quickly', '快速地', '/ˈkwɪkli/', 'adv.', 'She finished her homework quickly.']
    ];
    
    const csvContent = sampleData.map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'vocabulary_sample.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const renderUploadStep = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="book-name">词库名称</Label>
        <Input
          id="book-name"
          placeholder="请输入自定义词库名称"
          value={bookName}
          onChange={(e) => setBookName(e.target.value)}
          className="bg-white dark:bg-gray-700"
        />
      </div>

      <div className="space-y-2">
        <Label>CSV文件</Label>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragOver
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : selectedFile
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className={`w-12 h-12 mx-auto mb-4 ${selectedFile ? 'text-green-500' : 'text-gray-400'}`} />
          <p className={`text-sm mb-2 ${selectedFile ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
            {selectedFile ? '文件已选择，可重新选择其他文件' : '拖拽CSV文件到这里，或点击选择文件'}
          </p>
          <p className="text-xs text-gray-500">
            支持CSV格式，必须包含word和chinese_meaning列
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
          className="hidden"
        />
      </div>

      {selectedFile && (
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4 flex items-center space-x-3">
            <FileText className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                {selectedFile.name}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedFile(null);
                setStep('upload');
              }}
            >
              <XIcon className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200 flex-1">
            <p className="font-medium mb-1">CSV文件格式要求：</p>
            <ul className="text-xs space-y-1 mb-3">
              <li>• <strong>word</strong> (必填)：单词拼写</li>
              <li>• <strong>chinese_meaning</strong> (必填)：中文释义</li>
              <li>• <strong>phonetic_symbol</strong> (选填)：音标</li>
              <li>• <strong>part_of_speech</strong> (选填)：词性</li>
              <li>• <strong>example_sentence</strong> (选填)：例句</li>
            </ul>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadSampleFile}
              className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-800"
            >
              <DownloadIcon className="w-4 h-4 mr-2" />
              下载CSV示例
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">预览导入数据</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setStep('upload')}
        >
          重新选择
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto max-h-60">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {previewData[0] && Object.keys(previewData[0]).map((header) => (
                  <th key={header} className="px-3 py-2 text-left font-medium text-gray-900 dark:text-gray-100">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewData.map((row, index) => (
                <tr key={index} className="border-t">
                  {Object.values(row).map((value, cellIndex) => (
                    <td key={cellIndex} className="px-3 py-2 text-gray-700 dark:text-gray-300">
                      {String(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm">
        <p className="text-gray-500">
          显示前5行数据预览，确认格式正确后点击确认导入
        </p>
        <p className="text-blue-600 dark:text-blue-400">
          词库名称：《{bookName}》
        </p>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckIcon className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
        导入成功！
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        词库《{bookName}》已成功创建并导入单词
      </p>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {step === 'upload' && '导入自定义词库'}
            {step === 'preview' && '确认导入'}
            {step === 'success' && '导入完成'}
          </DialogTitle>
        </DialogHeader>

        <div className="pt-4">
          {step === 'upload' && renderUploadStep()}
          {step === 'preview' && renderPreviewStep()}
          {step === 'success' && renderSuccessStep()}
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          {step === 'upload' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                取消
              </Button>
              <Button 
                onClick={() => setStep('preview')}
                disabled={!bookName.trim() || !selectedFile}
                className={
                  !bookName.trim() || !selectedFile 
                    ? 'opacity-50 cursor-not-allowed' 
                    : ''
                }
              >
                下一步
              </Button>
            </>
          )}
          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={() => setStep('upload')}>
                上一步
              </Button>
              <Button 
                onClick={handleConfirmImport}
                disabled={importMutation.isPending}
              >
                {importMutation.isPending ? '导入中...' : '确认导入'}
              </Button>
            </>
          )}
          {step === 'success' && (
            <Button onClick={handleClose}>
              完成
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 