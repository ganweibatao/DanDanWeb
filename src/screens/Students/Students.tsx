import { 
  ChevronRightIcon, 
  HomeIcon, 
  UsersIcon, 
  BookOpenIcon, 
  StarIcon, 
  ShoppingCartIcon, 
  UserCircleIcon, 
  MoreHorizontalIcon, 
  ZapIcon,
  LockIcon,
  CheckCircleIcon,
  SchoolIcon,
  SettingsIcon,
  HelpCircleIcon,
  LogOutIcon,
  CalendarIcon,
  TrendingUpIcon
} from "lucide-react";
import React, { useState, useMemo, useEffect } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"; // Added CardHeader, CardTitle
import { useNavigate } from "react-router-dom";
// Import Radix components directly for CheckboxItem and Label
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Input } from "../../components/ui/input"; // <-- Add Input import
import {
  DropdownMenu,          // Keep using the custom wrapper for Root
  DropdownMenuTrigger,     // Keep using the custom wrapper
  DropdownMenuContent,     // Keep using the custom wrapper
  DropdownMenuItem,        // Keep using the custom wrapper
  // Remove CheckboxItem, Label, Separator from this import
  DropdownMenuSeparator,    // Keep using the custom wrapper for Separator if needed
} from "../../components/ui/dropdown-menu";
import { Sidebar } from "../../components/layout/Sidebar"; // Import the shared sidebar
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"; // <-- Add Tabs import
import { EbinghausMatrix } from "../../components/EbinghausMatrix"; // <-- Add EbinghausMatrix import
// Commenting out unused imports for now
// import { BookSelector } from "../../components/BookSelector";
// import { Link } from "react-router-dom";
// import { ChevronDownIcon, CalendarIcon, TrendingUpIcon } from "lucide-react";
// import {
//   NavigationMenu,
//   NavigationMenuItem,
//   NavigationMenuLink,
//   NavigationMenuList,
// } from "../../components/ui/navigation-menu";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
// import { EbinghausMatrix } from "../../components/EbinghausMatrix";

// 导入VocabularyBook类型 (保留，可能之后会用到)
interface VocabularyBook {
  id: string;
  name: string;
  wordCount: number;
  level: string;
  description: string;
}

// 添加学习进度类型 (保留)
interface LearningProgress {
  date: string;
  completed: number;
  total: number;
  reviewCount: number;
}

// 学习路径节点类型
interface LearningNode {
  id: number;
  type: 'lesson' | 'checkpoint' | 'boss'; // Example types
  status: 'locked' | 'active' | 'completed';
  title?: string; // Optional title for checkpoints/bosses
}

// 模拟的学习路径数据
const learningPath: LearningNode[] = [
  { id: 1, type: 'lesson', status: 'completed' },
  { id: 2, type: 'lesson', status: 'active' },
  { id: 3, type: 'lesson', status: 'locked' },
  { id: 4, type: 'checkpoint', status: 'locked', title: '检查点 1' },
  { id: 5, type: 'lesson', status: 'locked' },
  { id: 6, type: 'lesson', status: 'locked' },
  { id: 7, type: 'boss', status: 'locked', title: '单元挑战' },
];

// 新增：模拟词库书数据
const vocabularyBooksData: VocabularyBook[] = [
  {
    id: '1',
    name: '初中核心词汇',
    wordCount: 1500,
    level: 'A1',
    description: '覆盖初中阶段基础词汇'
  },
  {
    id: '2',
    name: '高中必备词汇',
    wordCount: 3500,
    level: 'B1',
    description: '高中阶段重要词汇汇总'
  },
  {
    id: '3',
    name: '四级高频词汇',
    wordCount: 4500,
    level: 'B2',
    description: '大学英语四级考试核心词'
  },
  {
    id: '4',
    name: '六级高频词汇',
    wordCount: 5500,
    level: 'C1',
    description: '大学英语六级考试核心词'
  },
  {
    id: '5',
    name: '考研英语词汇',
    wordCount: 5500,
    level: 'C1',
    description: '研究生入学考试必备词汇'
  },
  {
    id: '6',
    name: '雅思核心词汇',
    wordCount: 7000,
    level: 'C1/C2',
    description: '雅思考试常考词汇'
  },
];

// 艾宾浩斯遗忘曲线复习周期（天数）
const ebinghausIntervals = [1, 2, 4, 7, 15];

export const Students = (): JSX.Element => {
  const navigate = useNavigate();
  // const currentYear = new Date().getFullYear(); // Not used in new layout
  
  // 保留状态，可能未来有用
  const [selectedBooks, setSelectedBooks] = useState<VocabularyBook[]>([]);
  const [wordsPerDay, setWordsPerDay] = useState<number>(20);
  const [inputWordsPerDay, setInputWordsPerDay] = useState<string>(String(wordsPerDay)); // <-- State for input value
  const [currentLearningBook, setCurrentLearningBook] = useState<VocabularyBook | null>(null);
  const [searchQuery, setSearchQuery] = useState(''); // <-- Add state for search query
  
  // Effect to sync input when actual wordsPerDay changes
  useEffect(() => {
    setInputWordsPerDay(String(wordsPerDay));
  }, [wordsPerDay]);

  // Effect to reset input when no books are selected
  useEffect(() => {
    if (selectedBooks.length === 0) {
      // Optionally reset to default when all books are deselected
      // setWordsPerDay(20); 
      setInputWordsPerDay(String(20)); // Reset input display to default
    } else {
      // Sync input with current setting when books become selected
      setInputWordsPerDay(String(wordsPerDay));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBooks.length]); // Re-run only when the number of selected books changes

  // Function to handle saving words per day
  const handleSaveWordsPerDay = () => {
    const newValue = parseInt(inputWordsPerDay, 10);
    if (newValue > 0) {
      setWordsPerDay(newValue);
      // Optionally add feedback like a toast notification
    } else {
      // Handle invalid input, e.g., reset input or show error
      setInputWordsPerDay(String(wordsPerDay)); // Reset to last valid value
    }
  };

  // Determine if save button should be enabled
  const isWordsPerDaySaveEnabled = useMemo(() => {
    const numericValue = parseInt(inputWordsPerDay, 10);
    return numericValue > 0 && numericValue !== wordsPerDay;
  }, [inputWordsPerDay, wordsPerDay]);

  // 计算学习计划 - 使用 useMemo 优化
  const learningPlan = useMemo(() => {
    if (!currentLearningBook) return { totalDays: 0, learningDays: 0, listsCount: 0, wordsPerList: 0 };
    
    const totalWordCount = currentLearningBook.wordCount;
    const wordsPerList = wordsPerDay > 0 ? wordsPerDay : 1; // Avoid division by zero
    const listsCount = Math.ceil(totalWordCount / wordsPerList);
    const learningDays = listsCount;
    const lastReviewDay = listsCount > 0 ? listsCount + ebinghausIntervals[ebinghausIntervals.length - 1] : 0;
    const totalDays = lastReviewDay;
    
    return { totalDays, learningDays, listsCount, wordsPerList };
  }, [currentLearningBook, wordsPerDay]);

  // Filtered vocabulary books based on search query
  const filteredBooks = vocabularyBooksData.filter(book => 
    book.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate dropdown trigger text beforehand
  const dropdownTriggerText = useMemo(() => {
    if (selectedBooks.length === 0) {
      return "请选择词库...";
    } else if (selectedBooks.length === 1) {
      return selectedBooks[0].name;
    } else {
      return `${selectedBooks.length} 本已选`;
    }
  }, [selectedBooks]);

  const renderLearningNode = (node: LearningNode) => {
    const baseClasses = "w-20 h-20 rounded-full flex items-center justify-center relative border-4 shadow-lg";
    const iconClasses = "w-10 h-10";
    
    switch (node.status) {
      case 'completed':
        return (
          <button className={`${baseClasses} bg-green-100 dark:bg-green-500 border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-600 transition-colors`}>
            <StarIcon className={`${iconClasses} text-green-600 dark:text-white`} />
          </button>
        );
      case 'active':
        return (
          <div className="relative flex flex-col items-center">
             <button className={`${baseClasses} bg-green-100 dark:bg-green-500 border-green-300 dark:border-green-700 animate-pulse`}>
               <div className="w-16 h-16 flex items-center justify-center text-green-600 dark:text-white">
                 <ZapIcon className="w-10 h-10" />
               </div>
             </button>
             <div className="absolute -top-6 bg-gray-700 dark:bg-gray-600 text-white px-3 py-1 rounded-md text-sm font-semibold shadow-md">
               开始
             </div>
          </div>
        );
      case 'locked':
        if (node.type === 'checkpoint' || node.type === 'boss') {
           return (
             <button className={`${baseClasses} bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-700 cursor-not-allowed opacity-70`} disabled>
               <div className="w-12 h-12 flex items-center justify-center text-gray-400 dark:text-gray-500">
                 <LockIcon className="w-8 h-8" />
               </div>
             </button>
           );
        }
        return (
          <button className={`${baseClasses} bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-700 cursor-not-allowed opacity-70`} disabled>
            <StarIcon className={`${iconClasses} text-gray-400 dark:text-gray-500`} />
          </button>
        );
      default:
        return null;
    }
  };

  const handleStartLearning = () => {
    // 可能需要传递一些信息，比如当前选择的书籍ID
    // navigate(`/memorize?bookId=${currentLearningBook?.id}`); 
    navigate('/memorize'); // 简单跳转
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-sans">
      <Sidebar /> {/* Use the shared Sidebar component */}

      {/* Main Content Area - Updated with Ebbinghaus View */}
      <main className="flex-1 p-10 overflow-y-auto h-screen">
        {currentLearningBook ? (
          // === Ebbinghaus View when a book is selected ===
          <div className="flex flex-col h-full">
            {/* Directly render the plan content, no Tabs needed */}
            <div className="w-full flex-grow flex flex-col"> {/* Removed margin top that was added when removing Tabs */}
              {/* Ebbinghaus Plan Content */}
              <div className="flex-grow"> {/* Removed mt-0 */}
                 <Card className="border-gray-200 dark:border-gray-700 shadow-md rounded-xl overflow-hidden h-full bg-white dark:bg-gray-800"> 
                   <CardContent className="pt-6 px-6 pb-6 h-full flex flex-col">
                     {/* Moved and restyled the header */}
                     <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-600"> 
                       <CalendarIcon className="w-5 h-5 text-green-700 dark:text-green-300" />
                       <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">艾宾浩斯计划</h3>
                     </div>
                     {/* Matrix container */}
                     <div className="flex-grow overflow-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-700">
                       <EbinghausMatrix 
                         days={learningPlan.totalDays} 
                         totalWords={currentLearningBook.wordCount}
                         wordsPerDay={wordsPerDay}
                         onSelectUnit={(unit) => console.log('Selected Unit:', unit)} // Placeholder handler
                         ebinghausIntervals={ebinghausIntervals}
                       />
                     </div>
                      {/* Legend */}
                      <div className="flex flex-wrap gap-x-4 gap-y-2 items-center justify-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-400"> 
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600/50"></div> 
                          <span>新学</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-purple-100 dark:bg-purple-800/30 border border-purple-200 dark:border-purple-600"></div> 
                          <span>复习</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-green-50 dark:bg-green-800/30 border border-green-200 dark:border-green-700/50"></div> 
                          <span>已完成</span>
                        </div>
                        {/* Add more legend items if needed */}
                      </div>
                   </CardContent>
                 </Card>
              </div>
            </div>
          </div>
        ) : (
          // === Prompt to select a book - Removing Icon and Button ===
          <div className="flex flex-col items-center justify-center h-full text-center">
            {/* Remove BookOpenIcon */}
            {/* <BookOpenIcon className="w-24 h-24 text-gray-300 dark:text-gray-600 mb-6" /> */}
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4"> {/* Increased margin bottom */}
              开始您的学习之旅
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              请从右侧边栏选择您想要学习的词库书，然后我们将为您生成个性化的艾宾浩斯学习计划。
            </p>
            {/* Remove Button */}
            {/* <Button 
              variant="outline"
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 mt-6" // Added margin top
              onClick={() => {
                 alert("请点击右侧边栏的 '选择词库...' 按钮选择词库。");
               }}
            >
              去选择词库
            </Button> */}
          </div>
        )}
      </main>

      {/* Right Sidebar */}
      <aside className="w-80 bg-gray-50 dark:bg-gray-800 p-6 flex flex-col space-y-6 border-l border-gray-200 dark:border-gray-700 shadow-lg overflow-y-auto h-screen">
        {/* Unlock Leaderboards */}
        <Card className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center text-gray-800 dark:text-gray-200">
               <LockIcon className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400"/> 解锁排行榜！
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
               完成10个课程即可开始竞争
            </p>
                    </CardContent>
                  </Card>

        {/* Daily Quests */}
        <Card className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-200">开始学习</CardTitle>
            <Button variant="link" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-0 h-auto text-sm" onClick={handleStartLearning}>开始</Button>
          </CardHeader>
          <CardContent>
             <div className="flex items-center space-x-4 mb-2">
                <ZapIcon className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />
                <div className="flex-1">
                   <p className="font-semibold text-sm text-gray-700 dark:text-gray-300">获得10点经验值</p>
                   <div className="h-2 mt-1 bg-gray-200 dark:bg-gray-600 rounded-full w-full"><div className="h-full bg-yellow-400 rounded-full" style={{width: '0%'}}></div></div>
                </div>
                <Badge className="bg-gray-600 text-gray-300 border-gray-500">0 / 10</Badge>
                </div>
             {/* Add more quests if needed */}
                          </CardContent>
                        </Card>
                        
        {/* Vocabulary Book Selection - Now with Multi-select Dropdown */}
        <Card className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-200">选择学习词库</CardTitle>
          </CardHeader>
          <CardContent>
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="w-full">
                <Button variant="outline" className="w-full justify-between">
                  <span className="truncate pr-2">{dropdownTriggerText}</span> 
                  <ChevronRightIcon className="w-4 h-4 opacity-50 flex-shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                <DropdownMenuPrimitive.Label className="px-2 py-1.5 text-sm font-semibold">可用词库书</DropdownMenuPrimitive.Label>
                <div className="px-2 py-1">
                  <Input 
                    placeholder="搜索词库..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-8"
                  />
                </div>
                <DropdownMenuPrimitive.Separator className="-mx-1 my-1 h-px bg-muted" />
                <div className="max-h-60 overflow-y-auto">
                  {filteredBooks.map((book) => (
                    <DropdownMenuPrimitive.CheckboxItem
                      key={book.id}
                      checked={selectedBooks.some(selected => selected.id === book.id)}
                      onCheckedChange={(checked: boolean) => {
                        if (checked) {
                          setSelectedBooks(prev => [...prev, book]);
                        } else {
                          if (currentLearningBook?.id === book.id) {
                            setCurrentLearningBook(null);
                          }
                          setSelectedBooks(prev => prev.filter(selected => selected.id !== book.id));
                        }
                      }}
                      className="relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    >
                      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                        <DropdownMenuPrimitive.ItemIndicator>
                           <CheckCircleIcon className="h-4 w-4" />
                        </DropdownMenuPrimitive.ItemIndicator>
                      </span>
                      <div>
                         <p className="font-semibold text-sm">{book.name}</p>
                         <p className="text-xs text-gray-500">{book.wordCount}词 · {book.level}</p>
                      </div>
                    </DropdownMenuPrimitive.CheckboxItem>
                  ))}
                  {filteredBooks.length === 0 && (
                     <p className="px-2 py-1.5 text-sm text-gray-500">未找到匹配词库</p>
                   )}
                 </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {selectedBooks.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">当前选择:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedBooks.map((book) => {
                    const isCurrent = currentLearningBook?.id === book.id;
                    return (
                      <Button
                        key={book.id}
                        variant={isCurrent ? "default" : "secondary"}
                        size="sm"
                        className={`h-auto font-normal rounded-full px-3 py-1 text-xs transition-colors ${ 
                          isCurrent 
                            ? 'bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600' 
                            : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-500'
                        }`}
                        onClick={() => setCurrentLearningBook(book)}
                      >
                        {book.name}
                        {isCurrent && <CheckCircleIcon className="w-3 h-3 ml-1.5 inline-block" />}
                      </Button>
                    );
                  })}
                </div>

                {/* Add Input for wordsPerDay if books are selected */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <label htmlFor="wordsPerDayInput" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    每日新词数量:
                  </label>
                  <div className="flex items-center gap-2"> {/* Flex container for input and button */} 
                    <Input
                      id="wordsPerDayInput"
                      type="number" // Keep type number for browser validation/keypad
                      value={inputWordsPerDay} // Bind to temporary input state
                      onChange={(e) => {
                        // Directly update the string state
                        setInputWordsPerDay(e.target.value); 
                      }}
                      min="1" 
                      className="h-9 flex-grow" // Input takes available space
                    />
                    <Button
                      size="sm"
                      onClick={handleSaveWordsPerDay}
                      disabled={!isWordsPerDaySaveEnabled} // Disable button based on state
                      className="h-9 px-3 flex-shrink-0" // Prevent button shrinking
                    >
                      保存
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer Links */}
        {/* ... footer links ... */}
      </aside>
    </div>
  );
};