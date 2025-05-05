import React, { useState, useEffect } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "./ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogFooter 
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent } from './ui/card';
import { Badge } from "./ui/badge";
import { EbinghausMatrix } from '../screens/Students/EbinghausMatrix';

// 词汇书籍数据结构
interface VocabularyBook {
  id: string;
  name: string;
  wordCount: number;
  level: string;
  description: string;
}

// 模拟的词汇书籍数据
const mockBooks: VocabularyBook[] = [
  {
    id: '1',
    name: '初中英语核心词汇',
    wordCount: 1500,
    level: '初级',
    description: '适合初中学生学习的基础英语词汇'
  },
  {
    id: '2',
    name: '高中英语词汇大全',
    wordCount: 3500,
    level: '中级',
    description: '高中阶段必备的英语词汇集合'
  },
  {
    id: '3',
    name: '考研英语词汇',
    wordCount: 5500,
    level: '高级',
    description: '考研英语专用词汇，包含近年考研常见词汇'
  },
  {
    id: '4',
    name: '托福核心词汇',
    wordCount: 4000,
    level: '高级',
    description: '托福考试中最常见的核心词汇集合'
  },
  {
    id: '5',
    name: '商务英语词汇',
    wordCount: 2500,
    level: '中级',
    description: '职场和商务环境中常用的英语词汇'
  }
];

// 艾宾浩斯遗忘曲线复习周期（天数）
const ebinghausIntervals = [1, 2, 4, 7, 15];

// 生成每日日历数据
const generateCalendarData = (wordsPerDay: number, totalWords: number) => {
  const days = Math.ceil(totalWords / wordsPerDay);
  const calendar = [];

  // 当前日期
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const day = new Date(today);
    day.setDate(today.getDate() + i);
    
    // 当天学习的新单词
    const newWords = Math.min(wordsPerDay, totalWords - i * wordsPerDay);
    
    // 当天需要复习的旧单词
    const reviewWords = ebinghausIntervals
      .map(interval => {
        const dayToCheck = i - interval;
        if (dayToCheck >= 0) {
          return Math.min(wordsPerDay, totalWords - dayToCheck * wordsPerDay);
        }
        return 0;
      })
      .filter(count => count > 0);
    
    calendar.push({
      date: day,
      newWords,
      reviewWords
    });
  }
  
  return calendar;
};

interface BookSelectorProps {
  onSelectBook?: (book: VocabularyBook, wordsPerDay: number) => void;
  id?: string;
}

export const BookSelector: React.FC<BookSelectorProps> = ({ onSelectBook, id }) => {
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [wordsPerDay, setWordsPerDay] = useState<number>(50);  // 默认值更改为50
  const [wordsPerDayInput, setWordsPerDayInput] = useState<string>('50'); // 添加字符串状态用于输入
  const [isBookSelected, setIsBookSelected] = useState<boolean>(false);
  
  // 添加按钮动画状态
  const [isButtonAnimating, setIsButtonAnimating] = useState<boolean>(false);
  
  const [selectedBook, setSelectedBook] = useState<VocabularyBook | null>(null);
  
  const handleSelectBook = (value: string) => {
    setSelectedBookId(value);
    // 获取选择的书籍对象
    const book = mockBooks.find(book => book.id === value);
    if (book) {
      // 更新selectedBook状态
      setSelectedBook(book);
    }
  };
  
  const handleWordsPerDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // 仅允许输入数字或空字符串
    if (/^\d*$/.test(inputValue)) {
      setWordsPerDayInput(inputValue);
      
      const value = parseInt(inputValue);
      if (!isNaN(value) && value > 0) {
        setWordsPerDay(value);
      }
    }
  };
  
  const isValidWordsPerDay = wordsPerDayInput !== '' && parseInt(wordsPerDayInput) > 0;

  const handleConfirm = () => {
    if (selectedBook && onSelectBook && isValidWordsPerDay) {
      // 不要直接调用onSelectBook，这会导致立即跳转
      // 而是记录选择状态，并提示用户已完成选择但还需要开始学习
      console.log('已确认选择词书，但尚未开始学习');
      
      // 显示一个"开始学习"按钮，用户点击后才会真正开始学习
      setIsBookSelected(true);
    }
  };

  const handleUnitSelect = (unit: any) => {
    console.log('选择了单元:', unit);
    // 这里可以添加选择单元后的逻辑
  };
  
  // 计算总天数和每个List包含的单词数
  const calculateLearningPlan = () => {
    if (!selectedBook) return { totalDays: 0, listsCount: 0, wordsPerList: 0 };
    
    // 每个List就是每日学习量
    const wordsPerList = wordsPerDay;
    
    // 计算需要多少个List
    const listsCount = Math.ceil(selectedBook.wordCount / wordsPerList);
    
    // 计算学习总天数 = List数量 (实际学习新单词的天数)
    const learningDays = listsCount;
    
    // 计算最后一个复习日 (最后一个List的最后一次复习)
    const lastReviewDay = listsCount + ebinghausIntervals[ebinghausIntervals.length - 1];
    
    // 总天数 = 最后一个复习日
    const totalDays = lastReviewDay;
    
    return { totalDays, learningDays, listsCount, wordsPerList };
  };
  
  const learningPlan = calculateLearningPlan();
  
  // 真正开始学习的函数
  const handleStartLearning = () => {
    if (selectedBook && isValidWordsPerDay) {
      // 这里才调用传入的回调函数，导致页面跳转
      onSelectBook && onSelectBook(selectedBook, wordsPerDay);
      // 关闭对话框
      const closeButton = document.querySelector('[data-state="open"] button[aria-label="Close"]') as HTMLButtonElement;
      closeButton?.click();
    }
  };

  // 处理确认按钮点击
  const handleConfirmSelection = () => {
    if (selectedBook && isValidWordsPerDay) {
      // 先调用回调函数
      onSelectBook && onSelectBook(selectedBook, wordsPerDay);
      
      // 关闭对话框 - 尝试几种不同的方法来确保对话框关闭
      try {
        // 方法1: 通过Close按钮关闭
        const closeButton = document.querySelector('[data-state="open"] button[aria-label="Close"]') as HTMLButtonElement;
        if (closeButton) {
          closeButton.click();
          return; // 如果成功关闭，直接返回
        }
        
        // 方法2: 如果使用的是shadcn/ui的Dialog，可以尝试找到根元素并设置其open属性
        const dialogElement = document.querySelector('[data-state="open"][role="dialog"]');
        if (dialogElement && dialogElement.parentElement) {
          // 模拟ESC键按下，这通常也会关闭对话框
          const escKeyEvent = new KeyboardEvent('keydown', {
            key: 'Escape',
            code: 'Escape',
            keyCode: 27,
            which: 27,
            bubbles: true
          });
          dialogElement.dispatchEvent(escKeyEvent);
        }
      } catch (error) {
        console.error('关闭对话框失败:', error);
      }
    }
  };
  
  // 取消按钮点击处理
  const handleCancel = () => {
    setSelectedBookId('');
    setSelectedBook(null);
    
    // 关闭对话框 - 使用相同的逻辑
    try {
      const closeButton = document.querySelector('[data-state="open"] button[aria-label="Close"]') as HTMLButtonElement;
      if (closeButton) {
        closeButton.click();
        return;
      }
      
      const dialogElement = document.querySelector('[data-state="open"][role="dialog"]');
      if (dialogElement && dialogElement.parentElement) {
        const escKeyEvent = new KeyboardEvent('keydown', {
          key: 'Escape',
          code: 'Escape',
          keyCode: 27,
          which: 27,
          bubbles: true
        });
        dialogElement.dispatchEvent(escKeyEvent);
      }
    } catch (error) {
      console.error('关闭对话框失败:', error);
    }
  };

  // 当isBookSelected变为true时，启动按钮动画
  useEffect(() => {
    if (isBookSelected) {
      // 设置一个定时器，让动画循环播放，但不要太频繁，避免性能问题
      const animationInterval = setInterval(() => {
        setIsButtonAnimating(prev => !prev);
      }, 1000); // 每2秒切换一次，减少动画频率
      
      return () => clearInterval(animationInterval);
    }
  }, [isBookSelected]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-xl border border-amber-300 text-amber-800 hover:bg-amber-50 hover:text-amber-900" id={id}>
          选择词汇书籍
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] md:max-w-[700px] max-h-[85vh] flex flex-col overflow-hidden shadow-lg">
        <DialogHeader className="flex-shrink-0 sticky top-0 bg-white z-30 pb-2 border-b border-amber-100 shadow-sm">
          <DialogTitle className="text-center text-lg font-medium text-amber-800">选择词汇书籍</DialogTitle>
          <DialogDescription className="text-center text-amber-600">
            选择适合您学习阶段的词汇书籍并设置每日学习量
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto pr-1 my-3 scrollbar-thin scrollbar-thumb-amber-300 scrollbar-track-amber-50">
          <div className="grid gap-5">
            {/* 词汇书籍选择 */}
            <div className="space-y-2 border border-amber-100 rounded-lg p-3 bg-amber-50/30">
              <div className="space-y-1.5">
                <Label htmlFor="book" className="text-amber-700 font-medium">请选择一本适合您的词汇书籍</Label>
                <Select value={selectedBookId} onValueChange={handleSelectBook}>
                  <SelectTrigger id="book" className="border-amber-200 focus:ring-amber-300">
                    <SelectValue placeholder="选择词汇书籍" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockBooks.map(book => (
                      <SelectItem key={book.id} value={book.id}>
                        {book.name} ({book.wordCount}词)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedBook && (
                <Card className="overflow-hidden border-amber-200 mt-2">
                  <CardContent className="p-3">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <h3 className="text-base font-semibold text-amber-800">{selectedBook.name}</h3>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">{selectedBook.level}</Badge>
                      </div>
                      <p className="text-sm text-amber-700">{selectedBook.description}</p>
                      <p className="text-xs text-amber-600">单词总数: <span className="font-medium">{selectedBook.wordCount}</span></p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* 每日新单词数量设置 */}
            <div className={`space-y-2 border border-amber-100 rounded-lg p-3 ${selectedBook ? 'bg-amber-50/30' : 'bg-gray-50/50 opacity-60'}`}>
              <div className="space-y-1.5">
                <Label htmlFor="wordsPerDay" className="text-amber-700 font-medium">
                  每日新单词数量
                </Label>
                <Input
                  id="wordsPerDay"
                  type="text"
                  placeholder="请输入您期望的每日学习数量"
                  value={wordsPerDayInput}
                  onChange={handleWordsPerDayChange}
                  className="border-amber-200 focus:ring-amber-300 focus:border-amber-400"
                  disabled={!selectedBook}
                />
                <div className="text-xs text-amber-500 mt-1">
                  建议范围：20-100个，根据个人情况灵活设置
                  {wordsPerDayInput === '' && (
                    <span className="block text-amber-600 mt-1">请输入每日新单词数量</span>
                  )}
                  {parseInt(wordsPerDayInput) > 200 && (
                    <span className="block text-amber-600 mt-1">单词数量过多可能影响学习效果</span>
                  )}
                  {parseInt(wordsPerDayInput) < 10 && wordsPerDayInput !== '' && (
                    <span className="block text-amber-600 mt-1">建议每日至少学习10个新单词</span>
                  )}
                </div>
                {selectedBook && (
                  <div className="pt-1 space-y-0.5">
                    <p className="text-xs text-amber-600">
                      学习单元: <span className="font-medium">{learningPlan.listsCount}</span> 个单元 
                      (每个单元 <span className="font-medium">{wordsPerDay}</span> 个单词)
                    </p>
                    <p className="text-xs text-amber-600">
                      学习天数: <span className="font-medium">{learningPlan.learningDays}</span> 天
                      (含复习总计: <span className="font-medium">{learningPlan.totalDays}</span> 天)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex-shrink-0 border-t border-amber-100 pt-3 mt-1 bg-white relative z-10">
          <div className="mr-auto text-xs text-amber-600 italic">
            <span className="font-medium">提示：</span> 确认选择后，系统会自动为您生成学习计划
          </div>
          
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="border-amber-300 text-amber-700 hover:bg-amber-50"
          >
            取消
          </Button>
          <Button 
            onClick={handleConfirmSelection} 
            disabled={!selectedBook || !isValidWordsPerDay}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            确认选择
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 