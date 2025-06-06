import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

// 假设的单词数据结构
interface Word {
  id: number;
  english: string;
  options: string[]; // 包含四个中文翻译
  correctOption: string;
}

// 真实的单词数据
const realWords: Word[] = [
  // 初级词汇 1-40
  { id: 1, english: "apple", options: ["苹果", "香蕉", "橙子", "葡萄"], correctOption: "苹果" },
  { id: 2, english: "dog", options: ["猫", "狗", "鸟", "鱼"], correctOption: "狗" },
  { id: 3, english: "book", options: ["书", "笔", "纸", "桌子"], correctOption: "书" },
  { id: 4, english: "red", options: ["蓝色", "红色", "黄色", "绿色"], correctOption: "红色" },
  { id: 5, english: "school", options: ["医院", "学校", "商店", "银行"], correctOption: "学校" },
  { id: 6, english: "water", options: ["水", "牛奶", "咖啡", "茶"], correctOption: "水" },
  { id: 7, english: "mother", options: ["父亲", "母亲", "兄弟", "姐妹"], correctOption: "母亲" },
  { id: 8, english: "run", options: ["跑", "跳", "走", "坐"], correctOption: "跑" },
  { id: 9, english: "happy", options: ["悲伤", "快乐", "愤怒", "恐惧"], correctOption: "快乐" },
  { id: 10, english: "table", options: ["椅子", "桌子", "床", "沙发"], correctOption: "桌子" },
  { id: 11, english: "cat", options: ["狗", "猫", "鸟", "鱼"], correctOption: "猫" },
  { id: 12, english: "pen", options: ["笔", "纸", "书", "橡皮"], correctOption: "笔" },
  { id: 13, english: "chair", options: ["桌子", "椅子", "床", "沙发"], correctOption: "椅子" },
  { id: 14, english: "milk", options: ["水", "牛奶", "咖啡", "茶"], correctOption: "牛奶" },
  { id: 15, english: "father", options: ["母亲", "父亲", "兄弟", "姐妹"], correctOption: "父亲" },
  { id: 16, english: "jump", options: ["跑", "跳", "走", "坐"], correctOption: "跳" },
  { id: 17, english: "sad", options: ["快乐", "悲伤", "愤怒", "恐惧"], correctOption: "悲伤" },
  { id: 18, english: "bed", options: ["椅子", "桌子", "床", "沙发"], correctOption: "床" },
  { id: 19, english: "bird", options: ["狗", "猫", "鸟", "鱼"], correctOption: "鸟" },
  { id: 20, english: "paper", options: ["笔", "纸", "书", "橡皮"], correctOption: "纸" },
  { id: 21, english: "sofa", options: ["椅子", "桌子", "床", "沙发"], correctOption: "沙发" },
  { id: 22, english: "tea", options: ["水", "牛奶", "咖啡", "茶"], correctOption: "茶" },
  { id: 23, english: "sister", options: ["母亲", "父亲", "兄弟", "姐妹"], correctOption: "姐妹" },
  { id: 24, english: "walk", options: ["跑", "跳", "走", "坐"], correctOption: "走" },
  { id: 25, english: "angry", options: ["快乐", "悲伤", "愤怒", "恐惧"], correctOption: "愤怒" },
  { id: 26, english: "eraser", options: ["笔", "纸", "书", "橡皮"], correctOption: "橡皮" },
  { id: 27, english: "fish", options: ["狗", "猫", "鸟", "鱼"], correctOption: "鱼" },
  { id: 28, english: "yellow", options: ["蓝色", "红色", "黄色", "绿色"], correctOption: "黄色" },
  { id: 29, english: "brother", options: ["母亲", "父亲", "兄弟", "姐妹"], correctOption: "兄弟" },
  { id: 30, english: "sit", options: ["跑", "跳", "走", "坐"], correctOption: "坐" },
  { id: 31, english: "blue", options: ["蓝色", "红色", "黄色", "绿色"], correctOption: "蓝色" },
  { id: 32, english: "green", options: ["蓝色", "红色", "黄色", "绿色"], correctOption: "绿色" },
  { id: 33, english: "orange", options: ["苹果", "香蕉", "橙子", "葡萄"], correctOption: "橙子" },
  { id: 34, english: "banana", options: ["苹果", "香蕉", "橙子", "葡萄"], correctOption: "香蕉" },
  { id: 35, english: "grape", options: ["苹果", "香蕉", "橙子", "葡萄"], correctOption: "葡萄" },
  { id: 36, english: "coffee", options: ["水", "牛奶", "咖啡", "茶"], correctOption: "咖啡" },
  { id: 37, english: "window", options: ["门", "窗户", "墙", "地板"], correctOption: "窗户" },
  { id: 38, english: "door", options: ["门", "窗户", "墙", "地板"], correctOption: "门" },
  { id: 39, english: "wall", options: ["门", "窗户", "墙", "地板"], correctOption: "墙" },
  { id: 40, english: "floor", options: ["门", "窗户", "墙", "地板"], correctOption: "地板" },

  // 中级词汇 41-80
  { id: 41, english: "travel", options: ["旅行", "工作", "学习", "休息"], correctOption: "旅行" },
  { id: 42, english: "future", options: ["过去", "现在", "未来", "昨天"], correctOption: "未来" },
  { id: 43, english: "health", options: ["健康", "疾病", "疼痛", "感冒"], correctOption: "健康" },
  { id: 44, english: "danger", options: ["安全", "危险", "保护", "帮助"], correctOption: "危险" },
  { id: 45, english: "protect", options: ["保护", "伤害", "忽视", "打击"], correctOption: "保护" },
  { id: 46, english: "energy", options: ["能量", "力量", "速度", "重量"], correctOption: "能量" },
  { id: 47, english: "culture", options: ["文化", "历史", "地理", "科学"], correctOption: "文化" },
  { id: 48, english: "history", options: ["文化", "历史", "地理", "科学"], correctOption: "历史" },
  { id: 49, english: "science", options: ["文化", "历史", "地理", "科学"], correctOption: "科学" },
  { id: 50, english: "geography", options: ["文化", "历史", "地理", "科学"], correctOption: "地理" },
  { id: 51, english: "patient", options: ["耐心的", "急躁的", "开心的", "悲伤的"], correctOption: "耐心的" },
  { id: 52, english: "brave", options: ["勇敢的", "胆小的", "懒惰的", "聪明的"], correctOption: "勇敢的" },
  { id: 53, english: "polite", options: ["有礼貌的", "粗鲁的", "安静的", "吵闹的"], correctOption: "有礼貌的" },
  { id: 54, english: "honest", options: ["诚实的", "狡猾的", "懒惰的", "聪明的"], correctOption: "诚实的" },
  { id: 55, english: "clever", options: ["聪明的", "愚蠢的", "懒惰的", "胆小的"], correctOption: "聪明的" },
  { id: 56, english: "lazy", options: ["勤奋的", "懒惰的", "勇敢的", "聪明的"], correctOption: "懒惰的" },
  { id: 57, english: "famous", options: ["著名的", "普通的", "陌生的", "安静的"], correctOption: "著名的" },
  { id: 58, english: "strange", options: ["奇怪的", "普通的", "著名的", "安静的"], correctOption: "奇怪的" },
  { id: 59, english: "quiet", options: ["安静的", "吵闹的", "著名的", "奇怪的"], correctOption: "安静的" },
  { id: 60, english: "noisy", options: ["安静的", "吵闹的", "著名的", "奇怪的"], correctOption: "吵闹的" },
  { id: 61, english: "invite", options: ["邀请", "拒绝", "接受", "忽视"], correctOption: "邀请" },
  { id: 62, english: "refuse", options: ["邀请", "拒绝", "接受", "忽视"], correctOption: "拒绝" },
  { id: 63, english: "accept", options: ["邀请", "拒绝", "接受", "忽视"], correctOption: "接受" },
  { id: 64, english: "ignore", options: ["邀请", "拒绝", "接受", "忽视"], correctOption: "忽视" },
  { id: 65, english: "advice", options: ["建议", "命令", "请求", "抱怨"], correctOption: "建议" },
  { id: 66, english: "order", options: ["建议", "命令", "请求", "抱怨"], correctOption: "命令" },
  { id: 67, english: "request", options: ["建议", "命令", "请求", "抱怨"], correctOption: "请求" },
  { id: 68, english: "complain", options: ["建议", "命令", "请求", "抱怨"], correctOption: "抱怨" },
  { id: 69, english: "dangerous", options: ["安全的", "危险的", "有趣的", "无聊的"], correctOption: "危险的" },
  { id: 70, english: "safe", options: ["安全的", "危险的", "有趣的", "无聊的"], correctOption: "安全的" },
  { id: 71, english: "interesting", options: ["安全的", "危险的", "有趣的", "无聊的"], correctOption: "有趣的" },
  { id: 72, english: "boring", options: ["安全的", "危险的", "有趣的", "无聊的"], correctOption: "无聊的" },
  { id: 73, english: "success", options: ["成功", "失败", "努力", "放弃"], correctOption: "成功" },
  { id: 74, english: "failure", options: ["成功", "失败", "努力", "放弃"], correctOption: "失败" },
  { id: 75, english: "effort", options: ["成功", "失败", "努力", "放弃"], correctOption: "努力" },
  { id: 76, english: "give up", options: ["成功", "失败", "努力", "放弃"], correctOption: "放弃" },
  { id: 77, english: "medicine", options: ["药", "水", "牛奶", "咖啡"], correctOption: "药" },
  { id: 78, english: "engineer", options: ["工程师", "医生", "老师", "学生"], correctOption: "工程师" },
  { id: 79, english: "nurse", options: ["护士", "医生", "老师", "学生"], correctOption: "护士" },
  { id: 80, english: "driver", options: ["司机", "医生", "老师", "学生"], correctOption: "司机" },

  // 高级词汇 81-100
  { id: 81, english: "philosophy", options: ["哲学", "物理", "化学", "生物"], correctOption: "哲学" },
  { id: 82, english: "psychology", options: ["心理学", "物理", "化学", "生物"], correctOption: "心理学" },
  { id: 83, english: "economics", options: ["经济学", "物理", "化学", "生物"], correctOption: "经济学" },
  { id: 84, english: "sociology", options: ["社会学", "物理", "化学", "生物"], correctOption: "社会学" },
  { id: 85, english: "architecture", options: ["建筑学", "医学", "法学", "文学"], correctOption: "建筑学" },
  { id: 86, english: "linguistics", options: ["语言学", "医学", "法学", "文学"], correctOption: "语言学" },
  { id: 87, english: "astronomy", options: ["天文学", "地理学", "生物学", "化学"], correctOption: "天文学" },
  { id: 88, english: "genetics", options: ["遗传学", "地理学", "生物学", "化学"], correctOption: "遗传学" },
  { id: 89, english: "innovation", options: ["创新", "传统", "保守", "普通"], correctOption: "创新" },
  { id: 90, english: "sustainable", options: ["可持续的", "短暂的", "普通的", "简单的"], correctOption: "可持续的" },
  { id: 91, english: "paradigm", options: ["范式", "模型", "理论", "方法"], correctOption: "范式" },
  { id: 92, english: "algorithm", options: ["算法", "程序", "数据", "模型"], correctOption: "算法" },
  { id: 93, english: "quantum", options: ["量子", "经典", "普通", "简单"], correctOption: "量子" },
  { id: 94, english: "metaphor", options: ["隐喻", "明喻", "比喻", "拟人"], correctOption: "隐喻" },
  { id: 95, english: "paradox", options: ["悖论", "定理", "假设", "理论"], correctOption: "悖论" },
  { id: 96, english: "synergy", options: ["协同", "对抗", "竞争", "冲突"], correctOption: "协同" },
  { id: 97, english: "ambiguous", options: ["模棱两可的", "明确的", "简单的", "普通的"], correctOption: "模棱两可的" },
  { id: 98, english: "ubiquitous", options: ["无处不在的", "罕见的", "普通的", "简单的"], correctOption: "无处不在的" },
  { id: 99, english: "intrinsic", options: ["内在的", "外在的", "普通的", "简单的"], correctOption: "内在的" },
  { id: 100, english: "cognitive", options: ["认知的", "感性的", "普通的", "简单的"], correctOption: "认知的" }
];

const MIN_VOCAB = 500;
const MAX_VOCAB = 9000;

// 新增：测试模式
const TEST_MODES = [
  { label: "快速测试（20题，难度递增）", value: "quick", count: 20 },
  { label: "完整测试（100题，均匀分布）", value: "full", count: 100 }
];

const VocabularyTestPage: React.FC = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [testMode, setTestMode] = useState<string | null>(null);

  // 根据模式选择题目
  useEffect(() => {
    if (!testMode) return;
    let selectedWords: Word[] = [];
    if (testMode === "quick") {
      // 快速测试：20题，难度递增
      const easy = realWords.slice(0, 7);
      const medium = realWords.slice(40, 47);
      const hard = realWords.slice(80, 86);
      // easy: 7, medium: 7, hard: 6
      selectedWords = [
        ...easy.sort(() => Math.random() - 0.5).slice(0, 7),
        ...medium.sort(() => Math.random() - 0.5).slice(0, 7),
        ...hard.sort(() => Math.random() - 0.5).slice(0, 6)
      ];
      // 按难度递增排列
      selectedWords = [
        ...selectedWords.slice(0, 7),
        ...selectedWords.slice(7, 14),
        ...selectedWords.slice(14, 20)
      ];
    } else {
      // 完整测试：100题，均匀分布
      selectedWords = [...realWords].sort(() => Math.random() - 0.5);
    }
    setWords(selectedWords);
    setCurrentWordIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);
  }, [testMode]);

  const TOTAL_WORDS = words.length;
  const currentWord = words[currentWordIndex];
  const progressValue = currentWord ? ((currentWordIndex + 1) / (TOTAL_WORDS || 1)) * 100 : 0;

  const handleOptionSelect = (option: string) => {
    if (!currentWord) return;
    setSelectedOption(option);
    if (option === currentWord.correctOption) {
      setScore(prevScore => prevScore + 1);
    }
    setTimeout(() => {
      if (currentWordIndex < TOTAL_WORDS - 1) {
        setCurrentWordIndex(prevIndex => prevIndex + 1);
        setSelectedOption(null);
      } else {
        setShowResult(true);
      }
    }, 1000);
  };

  const handleUnknownSelect = () => {
    setSelectedOption("不认识");
    setTimeout(() => {
      if (currentWordIndex < TOTAL_WORDS - 1) {
        setCurrentWordIndex(prevIndex => prevIndex + 1);
        setSelectedOption(null);
      } else {
        setShowResult(true);
      }
    }, 1000);
  };
  
  const estimateVocabularySize = () => {
    // 对数分布估算
    if (TOTAL_WORDS === 0) return 0;
    const ratio = score / TOTAL_WORDS;
    const estimatedSize = MIN_VOCAB * Math.pow(MAX_VOCAB / MIN_VOCAB, ratio);
    return Math.round(estimatedSize);
  };

  const getButtonClassNames = (option: string, currentWordForClass?: Word) => {
    let baseClasses = "p-4 h-auto text-lg text-gray-700 border-2 border-gray-300 rounded-lg transition-all duration-150 ease-in-out transform hover:scale-105";
    if (selectedOption === option && currentWordForClass) {
      if (option === "不认识") {
        return `${baseClasses} bg-yellow-400 hover:bg-yellow-500 text-white`;
      }
      if (option === currentWordForClass.correctOption) {
        return `${baseClasses} bg-green-500 hover:bg-green-600 text-white`;
      }
      return `${baseClasses} bg-red-500 hover:bg-red-600 text-white`;
    }
    return `${baseClasses} bg-white hover:bg-gray-100`;
  };

  if (!testMode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">请选择测试模式</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {TEST_MODES.map(mode => (
              <Button key={mode.value} onClick={() => setTestMode(mode.value)}>{mode.label}</Button>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">测试完成!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg mb-4">你的得分是: {score} / {TOTAL_WORDS}</p>
            <p className="text-lg mb-6">预估词汇量: {estimateVocabularySize()} 词</p>
            <Button onClick={() => setTestMode(null)}>返回模式选择</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>加载中...</p>
      </div>
    );
  }

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen bg-blue-50 p-4"
      style={{ fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Marker Felt', sans-serif" }}
    >
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold text-blue-700 mb-2">词汇量测试</CardTitle>
          <Progress value={progressValue} className="w-full" />
          <p className="text-sm text-gray-500 text-center mt-1">进度: {currentWordIndex + 1} / {TOTAL_WORDS}</p>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="my-8 p-6 bg-white rounded-lg shadow-md">
            <p className="text-5xl font-bold text-gray-800">{currentWord.english}</p>
          </div>
          <div className="w-full space-y-3">
            {/* 四个翻译选项 */}
            <div className="grid grid-cols-2 gap-4">
              {currentWord.options.map((option, index) => (
                <Button
                  key={index}
                  variant={selectedOption === option ? "default" : "outline"}
                  className={getButtonClassNames(option, currentWord)}
                  onClick={() => handleOptionSelect(option)}
                  disabled={selectedOption !== null}
                >
                  {optionLabels[index]}. {option}
                </Button>
              ))}
            </div>
            {/* 不认识按钮独占一行 */}
            <Button
              variant={selectedOption === "不认识" ? "default" : "outline"}
              className={`w-full ${getButtonClassNames("不认识", currentWord)}`}
              onClick={handleUnknownSelect}
              disabled={selectedOption !== null}
            >
              不认识
            </Button>
          </div>
        </CardContent>
      </Card>
      <p className="mt-8 text-sm text-gray-500">像多邻国一样的风格~</p>
    </div>
  );
};

export default VocabularyTestPage; 