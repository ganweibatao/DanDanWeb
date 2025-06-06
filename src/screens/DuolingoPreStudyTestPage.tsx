import React, { useState, useEffect, useRef } from "react";
import { Volume2, CreditCard } from "lucide-react";
import { Steps } from 'antd';
import FlashcardView from '../components/FlashcardView'; // +++ 新增导入
import { useWordPronunciation } from '../hooks/useWordPronunciation';
import { splitBySyllables } from '../utils/phonics'; // 新增导入
import DuolingoStudyPlan from '../components/StudyPlan/DuolingoStudyPlan'; // +++ 新增学习计划导入

// --- SVG 图标 --- 
const BackArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
    <path fillRule="evenodd" d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 0 1 1.04-.208Z" clipRule="evenodd" />
  </svg>
);

// 删除自定义的 SpeakerWaveIcon，使用 lucide-react 的 Volume2 图标

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 ml-1">
    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z" clipRule="evenodd" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 0 1-.02 1.06L8.832 10l3.938 3.71a.75.75 0 1 1-1.04 1.08l-4.5-4.25a.75.75 0 0 1 0-1.08l4.5-4.25a.75.75 0 0 1 1.06.02Z" clipRule="evenodd" />
  </svg>
);

// --- 新增：菜单相关图标 ---
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
  </svg>
);

const GameControllerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.007-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.959.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
  </svg>
);

const CardIcon = () => (
  <CreditCard className="w-5 h-5" />
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// --- 新增：学习计划图标 ---
const StudyPlanIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3-6h.008v.008H15.75V12h.008zM9 6h.008v.008H9V6zM12 6h.008v.008H12V6zM15 6h.008v.008H15V6zM6.75 21h10.5a2.25 2.25 0 002.25-2.25V3a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 3v15.75A2.25 2.25 0 006.75 21z" />
  </svg>
);

// --- 新增：全屏相关图标 ---
const ExpandIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
  </svg>
);

const CompressIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M15 9V4.5M15 9h4.5M15 9l5.25-5.25M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 15v4.5M15 15h4.5m0 0l5.25 5.25" />
  </svg>
);

// --- 类型定义 --- 
interface Word {
  id: number;
  text: string;
  phonetic?: string; // 音标 (可选)
  meaning?: string;  // 释义 (可选)
  partOfSpeech?: string; // 词性 (可选)
  examples?: string[]; // 例句 (可选)
  // 根据实际需要添加更多字段，如发音文件URL等
}

// --- 模拟数据 (已更新) ---
const MOCK_WORDS: Word[] = [
  { id: 21, text: "leak", phonetic: "/liːk/", meaning: "漏洞；泄露", partOfSpeech: "n./v." },
  { id: 22, text: "circle", phonetic: "/ˈsɜːrk(ə)l/", meaning: "圆圈；环绕", partOfSpeech: "n./v." },
  { id: 23, text: "venture", phonetic: "/ˈventʃər/", meaning: "冒险；投机活动", partOfSpeech: "n./v." },
  { id: 24, text: "consequent", phonetic: "/ˈkɑːnsəkwent/", meaning: "随之发生的；作为结果的", partOfSpeech: "adj." },
  { id: 25, text: "automatic", phonetic: "/ˌɔːtəˈmætɪk/", meaning: "自动的；无意识的", partOfSpeech: "adj." },
  { id: 26, text: "protein", phonetic: "/ˈproʊtiːn/", meaning: "蛋白质", partOfSpeech: "n." },
  { id: 27, text: "dormitory", phonetic: "/ˈdɔːrmətɔːri/", meaning: "宿舍", partOfSpeech: "n." },
  { id: 28, text: "instrument", phonetic: "/ˈɪnstrəmənt/", meaning: "仪器；工具；乐器", partOfSpeech: "n." },
  
  // --- 音节拆分测试单词 ---
  { id: 29, text: "apple", phonetic: "/ˈæp(ə)l/", meaning: "苹果", partOfSpeech: "n." },
  { id: 30, text: "purple", phonetic: "/ˈpɜːr.pəl/", meaning: "紫色的", partOfSpeech: "adj." },
  { id: 31, text: "simple", phonetic: "/ˈsɪm.pəl/", meaning: "简单的", partOfSpeech: "adj." },
  { id: 32, text: "table", phonetic: "/ˈteɪ.bəl/", meaning: "桌子", partOfSpeech: "n." },
  { id: 33, text: "little", phonetic: "/ˈlɪt.əl/", meaning: "小的", partOfSpeech: "adj." },
  { id: 34, text: "bottle", phonetic: "/ˈbɑːt.əl/", meaning: "瓶子", partOfSpeech: "n." },
  { id: 35, text: "bubble", phonetic: "/ˈbʌb.əl/", meaning: "泡泡", partOfSpeech: "n." },
  { id: 36, text: "middle", phonetic: "/ˈmɪd.əl/", meaning: "中间", partOfSpeech: "n./adj." },
  { id: 37, text: "gentle", phonetic: "/ˈdʒen.təl/", meaning: "温和的", partOfSpeech: "adj." },
  { id: 38, text: "uncle", phonetic: "/ˈʌŋ.kəl/", meaning: "叔叔", partOfSpeech: "n." },
  
  // --- 其他常见单词 ---
  { id: 39, text: "banana", phonetic: "/bəˈnænə/", meaning: "香蕉", partOfSpeech: "n." },
  { id: 40, text: "water", phonetic: "/ˈwɔː.tər/", meaning: "水", partOfSpeech: "n." },
  { id: 41, text: "happy", phonetic: "/ˈhæp.i/", meaning: "快乐的", partOfSpeech: "adj." },
  { id: 42, text: "student", phonetic: "/ˈstuː.dənt/", meaning: "学生", partOfSpeech: "n." },
  { id: 43, text: "teacher", phonetic: "/ˈtiː.tʃər/", meaning: "老师", partOfSpeech: "n." },
  { id: 44, text: "computer", phonetic: "/kəmˈpjuː.tər/", meaning: "电脑", partOfSpeech: "n." },
  { id: 45, text: "telephone", phonetic: "/ˈtel.ɪ.foʊn/", meaning: "电话", partOfSpeech: "n." },
  { id: 46, text: "beautiful", phonetic: "/ˈbjuː.tɪ.fəl/", meaning: "美丽的", partOfSpeech: "adj." },
  { id: 47, text: "important", phonetic: "/ɪmˈpɔːr.tənt/", meaning: "重要的", partOfSpeech: "adj." },
  { id: 48, text: "interesting", phonetic: "/ˈɪn.tər.ɪ.stɪŋ/", meaning: "有趣的", partOfSpeech: "adj." },
  
  // --- 复杂多音节单词 ---
  { id: 49, text: "understand", phonetic: "/ˌʌn.dərˈstænd/", meaning: "理解", partOfSpeech: "v." },
  { id: 50, text: "remember", phonetic: "/rɪˈmem.bər/", meaning: "记住", partOfSpeech: "v." },
  { id: 51, text: "different", phonetic: "/ˈdɪf.ər.ənt/", meaning: "不同的", partOfSpeech: "adj." },
  { id: 52, text: "hospital", phonetic: "/ˈhɑː.spɪ.təl/", meaning: "医院", partOfSpeech: "n." },
  { id: 53, text: "restaurant", phonetic: "/ˈres.tər.ɑːnt/", meaning: "餐厅", partOfSpeech: "n." },
  { id: 54, text: "elephant", phonetic: "/ˈel.ɪ.fənt/", meaning: "大象", partOfSpeech: "n." },
  { id: 55, text: "chocolate", phonetic: "/ˈtʃɔː.kə.lət/", meaning: "巧克力", partOfSpeech: "n." },
];

interface DuolingoPreStudyTestPageProps {}

const DuolingoPreStudyTestPage: React.FC<DuolingoPreStudyTestPageProps> = () => {
  const [words, setWords] = useState<Word[]>([]);
  // 选中待记忆的单词
  const [selectedWords, setSelectedWords] = useState<Set<number>>(new Set());
  // 正在被移除的（已认识）单词，用于播放动画
  const [removingWordIds, setRemovingWordIds] = useState<Set<number>>(new Set());
  const [expandedWordIds, setExpandedWordIds] = useState<Set<number>>(new Set());
  const nextWordIdRef = useRef<number>(MOCK_WORDS.length + 1);
  const [knownWords, setKnownWords] = useState<Word[]>([]);
  const [totalWordsInLibrary] = useState(286);
  const [showKnownWordsListView, setShowKnownWordsListView] = useState(false);
  const [removingFromKnownIds, setRemovingFromKnownIds] = useState<Set<number>>(new Set());
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [selectedDictionary, setSelectedDictionary] = useState<'youdao' | 'eudic' | 'local'>('youdao');
  const [currentQueryWord, setCurrentQueryWord] = useState<string | null>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Added for custom click handling
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null); // For dropdown menu timing

  // --- 新增状态变量 ---
  const [localDefinitions, setLocalDefinitions] = useState<Record<string, Partial<Word>>>({});
  const [currentLocalDefinition, setCurrentLocalDefinition] = useState<Partial<Word> | null>(null);
  const [isEditingLocal, setIsEditingLocal] = useState<boolean>(false);
  const [editingBuffer, setEditingBuffer] = useState<Partial<Word> | null>(null);

  // --- 新增学习模式状态 ---
  const [isLearningModeActive, setIsLearningModeActive] = useState(false);
  const [learningWords, setLearningWords] = useState<Word[]>([]); // 实际要学习的单词 (原始顺序)
  const [currentLearningWords, setCurrentLearningWords] = useState<Word[]>([]); // 当前用于分页和显示的单词列表 (可能是乱序的)
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const WORDS_PER_GROUP = 5;
  // 'both', 'engOnly', 'meaningOnly'
  const [learningDisplayMode, setLearningDisplayMode] = useState<'both' | 'engOnly' | 'meaningOnly'>('both');
  const [isDisplayModeDropdownOpen, setIsDisplayModeDropdownOpen] = useState(false);

  // --- 新增：当前组是否乱序的状态 ---
  const [isCurrentGroupShuffled, setIsCurrentGroupShuffled] = useState(false);
  const [originalWordGroupBeforeShuffle, setOriginalWordGroupBeforeShuffle] = useState<Word[] | null>(null);

    // --- 新增：撕纸条模式相关状态 ---
  const [isInTearingPaperMode, setIsInTearingPaperMode] = useState(false);
  const [tearingPaperWords, setTearingPaperWords] = useState<Word[]>([]);
  const [clippedKnownWords, setClippedKnownWords] = useState<Word[]>([]);
  const [clippedUnknownWords, setClippedUnknownWords] = useState<Word[]>([]);
  const [animatingClipWord, setAnimatingClipWord] = useState<{ wordId: number; direction: 'left' | 'right' } | null>(null);

  // --- 新增：学后检测模式相关状态 ---
  const [isInPostTestMode, setIsInPostTestMode] = useState(false);
  const [postTestWords, setPostTestWords] = useState<Word[]>([]);
  const [postTestCorrectWords, setPostTestCorrectWords] = useState<Word[]>([]);
  const [postTestIncorrectWords, setPostTestIncorrectWords] = useState<Word[]>([]);
  const [animatingPostTestWord, setAnimatingPostTestWord] = useState<{ wordId: number; direction: 'left' | 'right' } | null>(null);

  // --- 新增：混组检测模式相关状态 ---
  const [isInMixedGroupTestMode, setIsInMixedGroupTestMode] = useState(false);
  const [mixedTestWords, setMixedTestWords] = useState<Word[]>([]);
  const [mixedTestCorrectWords, setMixedTestCorrectWords] = useState<Word[]>([]);
  const [mixedTestIncorrectWords, setMixedTestIncorrectWords] = useState<Word[]>([]);
  const [animatingMixedTestWord, setAnimatingMixedTestWord] = useState<{ wordId: number; direction: 'left' | 'right' } | null>(null);

  // --- 新增：左侧菜单状态 ---
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(true);

  // --- 新增：全屏状态 ---
  const [isFullscreen, setIsFullscreen] = useState(false);

  // --- 新增：结果弹窗状态 ---
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultModalData, setResultModalData] = useState<{
    title: string;
    correctCount: number;
    incorrectCount: number;
    totalCount: number;
    accuracy: string;
  } | null>(null);

  // --- 新增：加载更多单词相关状态 ---
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreWords] = useState(true); // 假设总是有更多单词可以加载
  const [loadedWordsCount, setLoadedWordsCount] = useState(0); // 跟踪已加载的单词数量

  // --- 新增：词卡检测相关状态 ---
  const [showFlashcardView, setShowFlashcardView] = useState(false);
  const [flashcardWordsForView, setFlashcardWordsForView] = useState<Word[]>([]);

  // 新增：音节拆分状态
  const [syllableSplitWords, setSyllableSplitWords] = useState<Map<number, string[]>>(new Map());

  // --- 新增：自定义学习单词数量状态
  const [customLearningCount, setCustomLearningCount] = useState<string>('');

  // --- 新增：学习计划相关状态 ---
  const [showStudyPlan, setShowStudyPlan] = useState(false);

  // --- 新增：选择单词模式下的状态 ---
  const [isWordListShuffled, setIsWordListShuffled] = useState(false);
  const [originalWordListBeforeShuffle, setOriginalWordListBeforeShuffle] = useState<Word[] | null>(null);
  const [wordListDisplayMode, setWordListDisplayMode] = useState<'both' | 'engOnly' | 'meaningOnly'>('engOnly');
  const [isWordListDisplayModeDropdownOpen, setIsWordListDisplayModeDropdownOpen] = useState(false);

  // --- 新增：获取当前步骤的函数 ---
  const getCurrentStep = () => {
    if (showFlashcardView) return -1; // 词卡检测不在主流程中
    if (showKnownWordsListView) return -1; // 查看已掌握单词不在主流程中
    if (showStudyPlan) return -1; // 学习计划不在主流程中
    if (!isLearningModeActive) return 0; // 选择单词
    if (isInPostTestMode) return 4; // 学后检测
    if (isInMixedGroupTestMode) return 3; // 混组检测
    if (isInTearingPaperMode) return 2; // 撕纸条
    return 1; // 学习单词
  };

  // --- 新增：菜单处理函数 ---
  const toggleMenu = () => {
    setIsMenuCollapsed(prev => !prev);
  };

  const handleMenuItemClick = (menuItem: string) => {
    switch (menuItem) {
      case 'menu':
        toggleMenu();
        break;
      case 'games':
        console.log('打开教学游戏');
        alert('教学游戏功能即将上线！');
        break;
      case 'cards':
        console.log('打开词卡检测');
        let wordsToDisplayInFlashcard: Word[] = [];
        if (isLearningModeActive && learningWords.length > 0) {
          // 在学习模式下，优先使用当前组的单词
          const currentGroup = currentLearningWords.slice(
            currentGroupIndex * WORDS_PER_GROUP,
            (currentGroupIndex + 1) * WORDS_PER_GROUP
          );
          wordsToDisplayInFlashcard = currentGroup;
        } else if (selectedWords.size > 0) {
          wordsToDisplayInFlashcard = Array.from(selectedWords).map(id => 
            words.find(w => w.id === id) || knownWords.find(w => w.id === id)
          ).filter(Boolean) as Word[];
        } else if (!isLearningModeActive && words.length > 0) {
          wordsToDisplayInFlashcard = words;
        }

        if (wordsToDisplayInFlashcard.length > 0) {
          setFlashcardWordsForView(wordsToDisplayInFlashcard);
          setShowFlashcardView(true);
        } else {
          alert("没有可供检测的单词。请先选择单词或确保当前列表/学习模式中有单词。");
        }
        break;
      case 'studyplan':
        console.log('打开学习计划');
        setShowStudyPlan(true);
        setIsMenuCollapsed(true); // 自动收起菜单
        break;
      case 'settings':
        console.log('打开设置');
        alert('设置功能即将上线！');
        break;
      default:
        break;
    }
  };

  // --- 新增：全屏处理函数 ---
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error('无法进入全屏模式:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch((err) => {
        console.error('无法退出全屏模式:', err);
      });
    }
  };

  useEffect(() => {
    const initialSetupWords = [...MOCK_WORDS];
    let highestIdInInitialSet = 0;

    if (initialSetupWords.length > 0) {
      // Find the maximum ID among the initial MOCK_WORDS
      highestIdInInitialSet = Math.max(...initialSetupWords.map(w => w.id));
    }
    // If MOCK_WORDS is empty, highestIdInInitialSet remains 0, so nextIdCounter will start from 1.

    let nextIdCounter = highestIdInInitialSet + 1;

    // Pad with new words until the list has 60 words (since we now have 35 predefined words)
    while (initialSetupWords.length < 60) {
      initialSetupWords.push({
        id: nextIdCounter,
        text: `word${nextIdCounter}`,
        phonetic: "",
        meaning: "",
        partOfSpeech: "", // Add default empty partOfSpeech for new words
      });
      nextIdCounter++;
    }

    setWords(initialSetupWords);
    // 默认选中所有单词
    const allWordIds = new Set(initialSetupWords.map(word => word.id));
    setSelectedWords(allWordIds);
    
    // Set nextWordIdRef to the next available ID for dynamically added words
    nextWordIdRef.current = nextIdCounter;
    // 初始化已加载单词数量
    setLoadedWordsCount(initialSetupWords.length - MOCK_WORDS.length); // 记录动态生成的单词数量

    // Cleanup for timeouts on component unmount
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []); // 移除依赖项

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // 勾选/取消勾选，要去记忆的单词
  const handleToggleSelect = (wordId: number) => {
    const isCurrentlySelected = selectedWords.has(wordId);
    
    if (isCurrentlySelected) {
      // 取消勾选时，先更新选中状态让勾选框立即消失，然后延迟触发滑出动画
      if (removingWordIds.has(wordId)) return; // 防止重复操作
      
      const wordToMarkKnown = words.find(w => w.id === wordId);
      if (wordToMarkKnown) {
        // 添加到已掌握列表
        setKnownWords(prevKnownWords => {
          if (prevKnownWords.find(kw => kw.id === wordId)) {
            return prevKnownWords;
          }
          return [...prevKnownWords, wordToMarkKnown];
        });
      }
      
      // 立即从选中列表中移除，让勾选框消失
      setSelectedWords(prev => {
        const newSelected = new Set(prev);
        newSelected.delete(wordId);
        return newSelected;
      });
      
      // 稍微延迟后触发滑出动画，让用户看到勾选框消失的过程
      setTimeout(() => {
        setRemovingWordIds(prev => {
          const newSet = new Set(prev);
          newSet.add(wordId);
          return newSet;
        });

        // 滑出动画结束后真正移除并补位
        setTimeout(() => {
          setWords(prevWords => {
            const remaining = prevWords.filter(w => w.id !== wordId);
            const newWord: Word = {
              id: nextWordIdRef.current,
              text: `word${nextWordIdRef.current}`,
              phonetic: "",
              meaning: "",
              partOfSpeech: "",
            };
            nextWordIdRef.current += 1;
            return [...remaining, newWord];
          });

          // 从移除列表里删除
          setRemovingWordIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(wordId);
            return newSet;
          });
        }, 400); // 滑出动画时长
      }, 150); // 延迟150ms开始滑出动画，让用户看到勾选框消失
    } else {
      // 重新勾选
      setSelectedWords(prev => {
        const newSelected = new Set(prev);
        newSelected.add(wordId);
        return newSelected;
      });
    }
  };


  const handleMarkUnknown = (wordId: number) => {
    const wordToUnmark = knownWords.find(w => w.id === wordId);
    if (!wordToUnmark) return;

    setRemovingFromKnownIds(prev => new Set(prev).add(wordId));

    setTimeout(() => {
      setKnownWords(prevKnownWords => prevKnownWords.filter(w => w.id !== wordId));
      setRemovingFromKnownIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(wordId);
        return newSet;
      });

      setWords(prevWords => {
        if (prevWords.find(w => w.id === wordToUnmark.id)) {
          return prevWords; // 如果已存在，则不重复添加
        }
        return [wordToUnmark, ...prevWords]; // 添加回主列表顶部
      });

      setSelectedWords(prevSelected => {
        const newSelected = new Set(prevSelected);
        newSelected.delete(wordId);
        return newSelected;
      });
    }, 400);
  };

  const handleStartMemorizing = () => {
    const wordsToMemorize = words.filter(word => selectedWords.has(word.id));
    if (wordsToMemorize.length === 0) {
      alert("请至少选择一个单词开始学习！");
      return;
    }
    console.log("开始识记这些单词:", wordsToMemorize);
    
    setLearningWords([...wordsToMemorize]);
    setCurrentLearningWords([...wordsToMemorize]); // 初始时和 learningWords 一样
    setIsLearningModeActive(true);
    setCurrentGroupIndex(0);
    setExpandedWordIds(new Set()); // 清空选词界面的展开状态
    setShowKnownWordsListView(false); // 如果在查看已认识列表，也切回去
    setIsCurrentGroupShuffled(false); // 重置乱序状态
    setOriginalWordGroupBeforeShuffle(null); // 清除之前存储的原始顺序
    // 关闭选择单词模式的下拉菜单
    setIsWordListDisplayModeDropdownOpen(false);
  };

  // --- 新增：选择单词模式下的打乱顺序处理
  const handleShuffleWordList = () => {
    if (words.length === 0) {
      return;
    }

    if (!isWordListShuffled) {
      // 执行乱序
      setOriginalWordListBeforeShuffle([...words]);
      
      const shuffledWords = [...words];
      for (let i = shuffledWords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledWords[i], shuffledWords[j]] = [shuffledWords[j], shuffledWords[i]];
      }
      
      setWords(shuffledWords);
      setIsWordListShuffled(true);
    } else {
      // 恢复顺序
      if (originalWordListBeforeShuffle) {
        setWords([...originalWordListBeforeShuffle]);
        setIsWordListShuffled(false);
        setOriginalWordListBeforeShuffle(null);
      } else {
        setIsWordListShuffled(false);
      }
    }
  };

  // --- 新增：选择单词模式下的显示模式处理
  const handleSelectWordListDisplayMode = (mode: 'both' | 'engOnly' | 'meaningOnly') => {
    // 清除下拉菜单定时器
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setWordListDisplayMode(mode);
    setIsWordListDisplayModeDropdownOpen(false);
    // 切换显示模式时清空所有展开状态
    setExpandedWordIds(new Set());
  };

  // --- 新增：处理自定义学习数量
  const handleCustomLearningCount = (count: number) => {
    const maxWords = words.length;
    const validCount = Math.min(Math.max(1, count), maxWords); // 确保在1到最大单词数之间
    
    // 按顺序选择前N个单词
    const wordsToSelect = words.slice(0, validCount);
    const selectedIds = new Set(wordsToSelect.map(w => w.id));
    
    // 将未选中的单词移到已掌握（带动画效果）
    const unselectedWords = words.filter(w => !selectedIds.has(w.id));
    if (unselectedWords.length > 0) {
      // 先添加到已掌握列表
      setKnownWords(prevKnownWords => {
        const newKnownWords = [...prevKnownWords];
        unselectedWords.forEach(word => {
          if (!newKnownWords.find(kw => kw.id === word.id)) {
            newKnownWords.push(word);
          }
        });
        return newKnownWords;
      });
      
      // 触发移除动画
      const unselectedIds = unselectedWords.map(w => w.id);
      setRemovingWordIds(prev => {
        const newSet = new Set(prev);
        unselectedIds.forEach(id => newSet.add(id));
        return newSet;
      });
      
      // 动画结束后替换单词并清理状态
      setTimeout(() => {
        setWords(prevWords => {
          const remainingWords = prevWords.filter(w => !unselectedIds.includes(w.id));
          const wordsToAdd = unselectedWords.length;
          
          for (let i = 0; i < wordsToAdd; i++) {
            remainingWords.push({
              id: nextWordIdRef.current,
              text: `word${nextWordIdRef.current}`,
              phonetic: "",
              meaning: "",
              partOfSpeech: "",
            });
            nextWordIdRef.current += 1;
          }
          
          return remainingWords;
        });
        
        // 清除移除动画状态
        setRemovingWordIds(prev => {
          const newSet = new Set(prev);
          unselectedIds.forEach(id => newSet.delete(id));
          return newSet;
        });
      }, 400);
    }
    
    // 更新选中状态
    setSelectedWords(selectedIds);
    
    // 清空输入框
    setCustomLearningCount('');
    
    console.log(`已自动选择前 ${validCount} 个单词进行学习`);
  };

  // --- 新增：处理输入框回车事件
  const handleCustomLearningKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const count = parseInt(customLearningCount);
      if (isNaN(count) || count <= 0) {
        alert('请输入有效的正整数！');
        return;
      }
      if (count > words.length) {
        alert(`输入数量不能超过当前单词总数 ${words.length}！`);
        return;
      }
      handleCustomLearningCount(count);
    }
  };

  // --- 新增：处理输入框数值变化时的实时验证
  const handleCustomLearningChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 只允许正整数输入
    if (value === '' || /^\d+$/.test(value)) {
      setCustomLearningCount(value);
    }
  };
  
  const toggleMeaning = (wordId: number) => {
    setExpandedWordIds(prevExpandedIds => {
      const newExpandedIds = new Set(prevExpandedIds);
      if (newExpandedIds.has(wordId)) {
        newExpandedIds.delete(wordId);
      } else {
        newExpandedIds.add(wordId);
      }
      return newExpandedIds;
    });
  };

  // Custom click handler to differentiate single and double clicks for toggling meaning
  const handleClickToToggleMeaning = (wordId: number) => {
    if (clickTimeoutRef.current) {
      // If a timeout is already set, it means this is a second click (part of a double click)
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      // Do nothing here, let the onDoubleClick handler on the parent take care of it
    } else {
      // First click, set a timeout to toggle meaning
      clickTimeoutRef.current = setTimeout(() => {
        toggleMeaning(wordId);
        clickTimeoutRef.current = null; // Reset ref after action
      }, 250); // 250ms window to detect double click
    }
  };

  const handleDoubleClickWord = (wordText: string) => {
    setCurrentQueryWord(wordText);

    // --- 新增：双击查看单词详情时自动收起菜单栏 ---
    setIsMenuCollapsed(true);

    if (selectedDictionary === 'local') {
      const existingLocalDef = localDefinitions[wordText];
      if (existingLocalDef) {
        setCurrentLocalDefinition(existingLocalDef);
      } else {
        // Try to find the word in the main list or known words to prefill basic info
        const wordFromLists = words.find(w => w.text === wordText) || knownWords.find(w => w.text === wordText);
        setCurrentLocalDefinition({
          text: wordText,
          phonetic: wordFromLists?.phonetic || "",
          meaning: wordFromLists?.meaning || "",
          partOfSpeech: wordFromLists?.partOfSpeech || "",
          examples: [],
        });
      }
      setIframeSrc(null); // Clear iframe for local view
      setIsEditingLocal(false);
    } else {
      // Default to Youdao if not local, or could be Eudic (handled by its own logic)
      const url = `https://dict.youdao.com/result?word=${encodeURIComponent(wordText)}&lang=en`;
      setIframeSrc(url);
      // setSelectedDictionary('youdao'); // Keep current selected or default to youdao if needed
    }
  };

  const handleSwitchDictionary = (dict: 'youdao' | 'eudic' | 'local') => {
    setSelectedDictionary(dict);
    setIsEditingLocal(false); // Reset edit mode when switching dictionaries

    if (currentQueryWord) {
      if (dict === 'youdao') {
        const url = `https://dict.youdao.com/result?word=${encodeURIComponent(currentQueryWord)}&lang=en`;
        setIframeSrc(url);
      } else if (dict === 'eudic') {
        const url = `https://dict.eudic.net/dicts/en/${encodeURIComponent(currentQueryWord)}`;
        window.open(url, '_blank');
        // setIframeSrc(null); // Keep iframe or clear, based on preference
      } else if (dict === 'local') {
        const existingLocalDef = localDefinitions[currentQueryWord];
        if (existingLocalDef) {
          setCurrentLocalDefinition(existingLocalDef);
        } else {
          const wordFromLists = words.find(w => w.text === currentQueryWord) || knownWords.find(w => w.text === currentQueryWord);
          setCurrentLocalDefinition({
            text: currentQueryWord,
            phonetic: wordFromLists?.phonetic || "",
            meaning: wordFromLists?.meaning || "",
            partOfSpeech: wordFromLists?.partOfSpeech || "",
            examples: [],
          });
        }
        setIframeSrc(null); // Clear iframe for local view
      }
    } else {
      // If no word is queried yet, just switch dictionary type. Local view will be empty or placeholder.
      if (dict === 'local') {
        setCurrentLocalDefinition(null);
        setIframeSrc(null);
      }
      // For 'youdao' or 'eudic', if no currentQueryWord, iframe might show a generic page or be cleared
      // setIframeSrc(null); // Or some default landing for the dictionary
    }
  };

  // --- 新增：本地释义编辑相关函数 ---
  const handleLocalDefChange = (field: keyof Word, value: string) => {
    if (editingBuffer) {
      setEditingBuffer(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleExampleChange = (index: number, value: string) => {
    if (editingBuffer && editingBuffer.examples) {
      const updatedExamples = [...editingBuffer.examples];
      updatedExamples[index] = value;
      setEditingBuffer(prev => ({ ...prev, examples: updatedExamples }));
    }
  };

  const addExampleField = () => {
    if (editingBuffer) {
      setEditingBuffer(prev => ({ 
        ...prev, 
        examples: [...(prev?.examples || []), ""] 
      }));
    }
  };

  const removeExampleField = (index: number) => {
    if (editingBuffer && editingBuffer.examples) {
      const updatedExamples = editingBuffer.examples.filter((_, i) => i !== index);
      setEditingBuffer(prev => ({ ...prev, examples: updatedExamples }));
    }
  };

  const handleSaveLocalDefinition = () => {
    if (currentQueryWord && editingBuffer) {
      const definitionToSave = { ...editingBuffer };
      // Ensure text field is present, even if not directly edited in this form
      if (!definitionToSave.text) {
        definitionToSave.text = currentQueryWord;
      }
      setLocalDefinitions(prev => ({ ...prev, [currentQueryWord]: definitionToSave }));
      setCurrentLocalDefinition(definitionToSave);
      setIsEditingLocal(false);
      setEditingBuffer(null);
    }
  };

  const handleCancelEditLocal = () => {
    setIsEditingLocal(false);
    setEditingBuffer(null); // Or reset to currentLocalDefinition if preferred
  };

  const selectedCount = selectedWords.size;

  const toggleShowKnownWordsListView = () => {
    setShowKnownWordsListView(prev => !prev);
    setExpandedWordIds(new Set()); // 切换视图时清空展开状态
  };

  // --- 新增：加载更多单词的函数 ---
  const handleLoadMoreWords = async () => {
    if (isLoadingMore || !hasMoreWords) return; // 防止重复点击和没有更多单词时的加载
    
    setIsLoadingMore(true);
    
    // 模拟加载延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newWords: Word[] = [];
    for (let i = 0; i < 20; i++) {
      newWords.push({
        id: nextWordIdRef.current,
        text: `word${nextWordIdRef.current}`,
        phonetic: "",
        meaning: "",
        partOfSpeech: "",
      });
      nextWordIdRef.current += 1;
    }
    
    setWords(prevWords => [...prevWords, ...newWords]);
    // 新加载的单词也默认选中
    setSelectedWords(prevSelected => {
      const newSelected = new Set(prevSelected);
      newWords.forEach(word => newSelected.add(word.id));
      return newSelected;
    });
    setLoadedWordsCount(prev => prev + 20); // 更新已加载单词数量
    setIsLoadingMore(false);
    
    // 可以根据实际需求设置是否还有更多单词
    // 例如：当已加载单词数量达到某个阈值时停止加载
    // if (loadedWordsCount + 20 >= 200) {
    //   setHasMoreWords(false);
    // }
  };

  // --- 学习模式下的操作函数 ---
  const handleExitLearningMode = () => {
    setIsLearningModeActive(false);
    setLearningWords([]);
    setCurrentLearningWords([]);
    setIsCurrentGroupShuffled(false); // 重置乱序状态
    setOriginalWordGroupBeforeShuffle(null); // 清除之前存储的原始顺序
    // 重置选择单词模式的状态
    setWordListDisplayMode('engOnly');
    setIsWordListDisplayModeDropdownOpen(false);
    // setSelectedWords(new Set()); // 可选：是否清空之前的选择
  };

  const totalLearningGroups = Math.ceil(currentLearningWords.length / WORDS_PER_GROUP);

  const handleNextGroup = () => {
    if (currentGroupIndex < totalLearningGroups - 1) {
      setCurrentGroupIndex(prev => {
        const newIndex = prev + 1;
        // 如果词卡检测界面是打开的，更新词卡中的单词
        if (showFlashcardView) {
          const newCurrentGroup = currentLearningWords.slice(
            newIndex * WORDS_PER_GROUP,
            (newIndex + 1) * WORDS_PER_GROUP
          );
          setFlashcardWordsForView(newCurrentGroup);
        }
        return newIndex;
      });
      setIsCurrentGroupShuffled(false); // 新组，重置乱序状态
      setOriginalWordGroupBeforeShuffle(null); // 清除为上一组存储的顺序
    }
  };

  const handlePreviousGroup = () => {
    if (currentGroupIndex > 0) {
      setCurrentGroupIndex(prev => {
        const newIndex = prev - 1;
        // 如果词卡检测界面是打开的，更新词卡中的单词
        if (showFlashcardView) {
          const newCurrentGroup = currentLearningWords.slice(
            newIndex * WORDS_PER_GROUP,
            (newIndex + 1) * WORDS_PER_GROUP
          );
          setFlashcardWordsForView(newCurrentGroup);
        }
        return newIndex;
      });
      setIsCurrentGroupShuffled(false); // 新组，重置乱序状态
      setOriginalWordGroupBeforeShuffle(null); // 清除为上一组存储的顺序
    }
  };

  const handleShuffleLearningWords = () => {
    // 学后检测模式下的特殊处理
    if (isInPostTestMode) {
      if (postTestWords.length === 0) {
        return;
      }
      
      if (!isCurrentGroupShuffled) {
        // 执行乱序
        setOriginalWordGroupBeforeShuffle([...postTestWords]); // 保存原始顺序
        
        const shuffledWords = [...postTestWords];
        for (let i = shuffledWords.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledWords[i], shuffledWords[j]] = [shuffledWords[j], shuffledWords[i]];
        }
        
        setPostTestWords(shuffledWords);
        setIsCurrentGroupShuffled(true);
      } else {
        // 恢复顺序
        if (originalWordGroupBeforeShuffle) {
          setPostTestWords([...originalWordGroupBeforeShuffle]);
          setIsCurrentGroupShuffled(false);
          setOriginalWordGroupBeforeShuffle(null);
        } else {
          setIsCurrentGroupShuffled(false);
        }
      }
      return;
    }

    // 常规学习模式下的处理
    if (learningWords.length === 0 || currentWordGroup.length === 0) {
      return;
    }

    const startIndex = currentGroupIndex * WORDS_PER_GROUP;
    const endIndex = Math.min(startIndex + currentWordGroup.length, currentLearningWords.length);

    if (!isCurrentGroupShuffled) {
      // 当前是 "乱序" 状态，即将执行乱序
      setOriginalWordGroupBeforeShuffle([...currentWordGroup]); // 保存当前组的顺序

      const groupToShuffle = [...currentWordGroup];
      for (let i = groupToShuffle.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [groupToShuffle[i], groupToShuffle[j]] = [groupToShuffle[j], groupToShuffle[i]];
      }

      const newCurrentLearningWords = [
        ...currentLearningWords.slice(0, startIndex),
        ...groupToShuffle,
        ...currentLearningWords.slice(endIndex)
      ];
      setCurrentLearningWords(newCurrentLearningWords);
      setIsCurrentGroupShuffled(true);
    } else {
      // 当前是 "恢复顺序" 状态，即将执行恢复
      if (originalWordGroupBeforeShuffle) {
        const newCurrentLearningWords = [
          ...currentLearningWords.slice(0, startIndex),
          ...originalWordGroupBeforeShuffle,
          ...currentLearningWords.slice(endIndex)
        ];
        setCurrentLearningWords(newCurrentLearningWords);
        setIsCurrentGroupShuffled(false);
        setOriginalWordGroupBeforeShuffle(null); // 清除已恢复的原始顺序
      } else {
        // 理论上不应发生，因为 originalWordGroupBeforeShuffle 应在乱序时设置
        setIsCurrentGroupShuffled(false); // 重置状态
      }
    }
  };


  const handleSelectDisplayMode = (mode: 'both' | 'engOnly' | 'meaningOnly') => {
    // 清除下拉菜单定时器
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setLearningDisplayMode(mode);
    setIsDisplayModeDropdownOpen(false);
    // 切换显示模式时清空所有展开状态
    setExpandedWordIds(new Set());
  };

  const getDisplayModeText = (mode: 'both' | 'engOnly' | 'meaningOnly') => {
    switch (mode) {
      case 'both': return '英文+中文';
      case 'engOnly': return '仅英文';
      case 'meaningOnly': return '仅中文';
    }
  };

  const handlePlayGame = () => {
    if (currentWordGroup.length === 0) {
      alert("当前没有单词可供检测！");
      return;
    }
    console.log("进入撕纸条模式，当前学习单词组:", currentWordGroup);
    setIsInTearingPaperMode(true);
    setTearingPaperWords([...currentWordGroup]); 
    setClippedKnownWords([]);
    setClippedUnknownWords([]);
    setAnimatingClipWord(null);
    setExpandedWordIds(new Set()); // 收起所有展开的释义
    // alert("开始混组检测！(功能待实现)"); // 这句可以去掉了
  };

  // --- 新增：学后检测相关函数 ---
  const handleStartPostTest = () => {
    console.log("开始学后检测，所有学习单词:", learningWords);
    setIsInPostTestMode(true);
    setPostTestWords([...learningWords]); // 显示所有学习过的单词
    setPostTestCorrectWords([]);
    setPostTestIncorrectWords([]);
    setAnimatingPostTestWord(null);
    setExpandedWordIds(new Set()); // 收起所有展开的释义
    setIsCurrentGroupShuffled(false); // 重置乱序状态
    setOriginalWordGroupBeforeShuffle(null); // 清除之前的顺序记录
  };

  // --- 新增：混组检测相关函数 ---
  const handleStartMixedGroupTest = () => {
    // 获取从第一组到当前组的所有学习单词
    const endIndex = (currentGroupIndex + 1) * WORDS_PER_GROUP;
    const allLearnedWords = learningWords.slice(0, endIndex);
    
    // 随机选择5个单词
    const shuffledWords = [...allLearnedWords].sort(() => Math.random() - 0.5);
    const selectedWords = shuffledWords.slice(0, Math.min(5, shuffledWords.length));
    
    console.log("开始混组检测，随机选择的单词:", selectedWords);
    setIsInMixedGroupTestMode(true);
    setMixedTestWords([...selectedWords]);
    setMixedTestCorrectWords([]);
    setMixedTestIncorrectWords([]);
    setAnimatingMixedTestWord(null);
    setExpandedWordIds(new Set()); // 收起所有展开的释义
  };

  const handleExitMixedGroupTestMode = () => {
    setIsInMixedGroupTestMode(false);
    setMixedTestWords([]);
    setMixedTestCorrectWords([]);
    setMixedTestIncorrectWords([]);
    setAnimatingMixedTestWord(null);
  };

  const handleMixedTestCorrect = (wordId: number) => {
    if (animatingMixedTestWord) return;

    const word = mixedTestWords.find(w => w.id === wordId);
    if (!word) return;

    setAnimatingMixedTestWord({ wordId, direction: 'right' });
    setTimeout(() => {
      setMixedTestCorrectWords(prev => [...prev, word]);
      setMixedTestWords(prev => prev.filter(w => w.id !== wordId));
      setAnimatingMixedTestWord(null);
    }, 400);
  };

  const handleMixedTestIncorrect = (wordId: number) => {
    if (animatingMixedTestWord) return;

    const word = mixedTestWords.find(w => w.id === wordId);
    if (!word) return;

    setAnimatingMixedTestWord({ wordId, direction: 'left' });
    setTimeout(() => {
      setMixedTestIncorrectWords(prev => [...prev, word]);
      setMixedTestWords(prev => prev.filter(w => w.id !== wordId));
      setAnimatingMixedTestWord(null);
    }, 400);
  };

  const handleSubmitMixedGroupTest = () => {
    const correctCount = mixedTestCorrectWords.length;
    const incorrectCount = mixedTestIncorrectWords.length;
    const totalCount = correctCount + incorrectCount;
    const accuracy = totalCount > 0 ? (correctCount / totalCount * 100).toFixed(1) : '0';
    
    setResultModalData({
      title: '混组检测完成！',
      correctCount,
      incorrectCount,
      totalCount,
      accuracy
    });
    setShowResultModal(true);
  };

  const handleCloseResultModal = () => {
    setShowResultModal(false);
    setResultModalData(null);
    
    // 根据当前模式决定返回哪里
    if (isInMixedGroupTestMode) {
      handleExitMixedGroupTestMode();
      // 混组检测完成后自动进入下一组
      if (currentGroupIndex < totalLearningGroups - 1) {
        // 还有下一组，自动进入下一组
        handleNextGroup();
      } else {
        // 已经是最后一组，提示用户可以进行学后检测
        setTimeout(() => {
          if (window.confirm('恭喜！您已完成所有组的学习。是否开始学后检测？')) {
            handleStartPostTest();
          }
        }, 500); // 稍微延迟一下，让用户看到完成信息
      }
    } else if (isInPostTestMode) {
      handleExitPostTestMode();
      handleExitLearningMode(); // 学后检测完成后返回选词界面
    }
  };

  const handleExitPostTestMode = () => {
    setIsInPostTestMode(false);
    setPostTestWords([]);
    setPostTestCorrectWords([]);
    setPostTestIncorrectWords([]);
    setAnimatingPostTestWord(null);
  };

  const handlePostTestCorrect = (wordId: number) => {
    if (animatingPostTestWord) return;

    const word = postTestWords.find(w => w.id === wordId);
    if (!word) return;

    setAnimatingPostTestWord({ wordId, direction: 'right' });
    setTimeout(() => {
      setPostTestCorrectWords(prev => [...prev, word]);
      setPostTestWords(prev => prev.filter(w => w.id !== wordId));
      setAnimatingPostTestWord(null);
    }, 400);
  };

  const handlePostTestIncorrect = (wordId: number) => {
    if (animatingPostTestWord) return;

    const word = postTestWords.find(w => w.id === wordId);
    if (!word) return;

    setAnimatingPostTestWord({ wordId, direction: 'left' });
    setTimeout(() => {
      setPostTestIncorrectWords(prev => [...prev, word]);
      setPostTestWords(prev => prev.filter(w => w.id !== wordId));
      setAnimatingPostTestWord(null);
    }, 400);
  };

  const handleSubmitPostTest = () => {
    const correctCount = postTestCorrectWords.length;
    const incorrectCount = postTestIncorrectWords.length;
    const totalCount = correctCount + incorrectCount;
    const accuracy = totalCount > 0 ? (correctCount / totalCount * 100).toFixed(1) : '0';
    
    setResultModalData({
      title: '学后检测完成！',
      correctCount,
      incorrectCount,
      totalCount,
      accuracy
    });
    setShowResultModal(true);
    
    // 可以在这里添加提交到服务器的逻辑
  };

  // --- 新增：退出撕纸条模式的函数 ---
  const handleExitTearingPaperMode = () => {
    setIsInTearingPaperMode(false);
    setTearingPaperWords([]); 
    setClippedKnownWords([]);
    setClippedUnknownWords([]);
    setAnimatingClipWord(null);
    // 返回到当前组的常规学习界面
  };

  // --- 新增：处理撕纸条中的"认识" ---
  const handleClipWordAsKnown = (wordId: number) => {
    if (animatingClipWord) return; 

    const word = tearingPaperWords.find(w => w.id === wordId);
    if (!word) return;

    setAnimatingClipWord({ wordId, direction: 'right' });
    setTimeout(() => {
      setClippedKnownWords(prev => [...prev, word]);
      setTearingPaperWords(prev => prev.filter(w => w.id !== wordId));
      setAnimatingClipWord(null);
    }, 400); // 优化为400ms，与CSS动画保持一致
  };

  // --- 新增：处理撕纸条中的"不认识" ---
  const handleClipWordAsUnknown = (wordId: number) => {
    if (animatingClipWord) return;

    const word = tearingPaperWords.find(w => w.id === wordId);
    if (!word) return;

    setAnimatingClipWord({ wordId, direction: 'left' });
    setTimeout(() => {
      setClippedUnknownWords(prev => [...prev, word]);
      setTearingPaperWords(prev => prev.filter(w => w.id !== wordId));
      setAnimatingClipWord(null);
    }, 400); // 优化为400ms，与CSS动画保持一致
  };

  // --- 计算当前显示的单词组 (学习模式) ---
  const currentWordGroup = currentLearningWords.slice(
    currentGroupIndex * WORDS_PER_GROUP,
    (currentGroupIndex + 1) * WORDS_PER_GROUP
  );

  // 顶层加状态
  const { playPronunciation, isLoading: isPronLoading } = useWordPronunciation(''); // 传空字符串，因为现在主要用 customWord 参数

  // 新增：处理单词音节拆分显示的函数
  const handleWordPronunciationAndSplit = (wordId: number, wordText: string) => {
    console.log(`🎵 开始处理单词发音和拆分: ${wordText} (ID: ${wordId})`);
    
    // 播放发音
    playPronunciation('us', wordText);
    
    // 音节拆分
    try {
      const syllables = splitBySyllables(wordText);
      console.log(`🔤 音节拆分结果:`, syllables);
      
      if (syllables && syllables.length > 1) {
        setSyllableSplitWords(prev => {
          const newMap = new Map(prev);
          newMap.set(wordId, syllables);
          console.log(`💾 保存拆分状态:`, { wordId, syllables, mapSize: newMap.size });
          return newMap;
        });
        
              // 1.5秒后恢复正常显示
      setTimeout(() => {
        setSyllableSplitWords(prev => {
          const newMap = new Map(prev);
          newMap.delete(wordId);
          console.log(`🔄 恢复单词显示: ${wordText} (ID: ${wordId})`);
          return newMap;
        });
      }, 1500);
      } else {
        console.log(`⚠️ 单词 "${wordText}" 拆分结果无效或只有一个音节:`, syllables);
      }
    } catch (error) {
      console.error(`❌ 音节拆分失败:`, error);
    }
  };

  // 新增：获取单词显示文本的函数
  const getWordDisplayText = (wordId: number, wordText: string) => {
    const syllables = syllableSplitWords.get(wordId);
    if (syllables && syllables.length > 0) {
      const result = syllables.join('  ');
      console.log(`✨ 显示拆分版本: ${wordText} → ${result}`);
      return result;
    }
    return wordText;
  };

  return (
    <div className="flex flex-col h-screen bg-duo-bg font-sans">
      {/* 自定义 Steps 样式 */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .learning-progress-steps .ant-steps-item-process .ant-steps-item-icon {
            background-color: #ffffff !important;
            border-color: #ffffff !important;
          }
          .learning-progress-steps .ant-steps-item-process .ant-steps-item-icon .ant-steps-icon {
            color: #58cc02 !important;
          }
          .learning-progress-steps .ant-steps-item-finish .ant-steps-item-icon {
            background-color: transparent !important;
            border-color: rgba(255, 255, 255, 0.5) !important;
          }
          .learning-progress-steps .ant-steps-item-finish .ant-steps-item-icon .ant-steps-icon {
            color: rgba(255, 255, 255, 0.5) !important;
          }
          .learning-progress-steps .ant-steps-item-wait .ant-steps-item-icon {
            background-color: transparent !important;
            border-color: rgba(255, 255, 255, 0.5) !important;
          }
          .learning-progress-steps .ant-steps-item-wait .ant-steps-item-icon .ant-steps-icon {
            color: rgba(255, 255, 255, 0.5) !important;
          }
          .learning-progress-steps .ant-steps-item-title {
            color: #ffffff !important;
            font-size: 13px !important;
            font-weight: 500 !important;
          }
          .learning-progress-steps .ant-steps-item-process .ant-steps-item-title {
            color: #ffffff !important;
            font-size: 15px !important;
            font-weight: 700 !important;
          }
          .learning-progress-steps .ant-steps-item-wait .ant-steps-item-title {
            color: rgba(255, 255, 255, 0.6) !important;
          }
          .learning-progress-steps .ant-steps-item-finish .ant-steps-item-title {
            color: rgba(255, 255, 255, 0.6) !important;
          }
          .learning-progress-steps .ant-steps-item-tail::after {
            background-color: rgba(255, 255, 255, 0.3) !important;
          }
          .learning-progress-steps .ant-steps-item-finish .ant-steps-item-tail::after {
            background-color: rgba(255, 255, 255, 0.8) !important;
          }
        `
      }} />
      {/* --- Header --- */}
      <header className="bg-duo-green p-3 flex items-center justify-between shadow-md sticky top-0 z-20 h-16">
        <div className="flex items-center space-x-2">
          <button 
              onClick={
                showStudyPlan
                  ? () => setShowStudyPlan(false)
                  : isLearningModeActive 
                    ? isInPostTestMode
                      ? handleExitPostTestMode
                      : isInMixedGroupTestMode
                        ? handleExitMixedGroupTestMode
                        : isInTearingPaperMode
                          ? handleExitTearingPaperMode 
                          : handleExitLearningMode
                    : () => { 
                      // TODO: Implement actual back navigation if needed for non-learning mode
                      console.log("Back button clicked in non-learning mode");
                    }
              } 
              className="text-duo-white p-2 rounded-lg hover:bg-duo-green/80"
              title={
                showStudyPlan
                  ? "返回"
                  : isLearningModeActive 
                    ? isInPostTestMode
                      ? "返回学习"
                      : isInMixedGroupTestMode
                        ? "返回学习"
                        : isInTearingPaperMode
                          ? "返回学习" 
                          : "返回选词" 
                    : "返回"
              }
          >
            <BackArrowIcon />
          </button>
        </div>
        {/* --- 学习流程展示 --- */}
        <div className="absolute top-1/2 left-1/3 -translate-x-1/3 -translate-y-1/2">
          <Steps
            current={getCurrentStep()}
            size="small"
            className="learning-progress-steps"
            items={[
              { title: '选择单词' },
              { title: '学习单词' },
              { title: '撕纸条' },
              { title: '混组检测' },
              { title: '学后检测' },
            ]}
          />
        </div>


        
        {/* --- 学习模式下的控制按钮 --- */}
        {isLearningModeActive && (
          <div className="absolute top-1/2 -translate-y-1/2 right-20 flex items-center space-x-2">
            {/* 打乱顺序按钮 */}
            <button
              onClick={handleShuffleLearningWords}
              disabled={learningWords.length === 0 || isInMixedGroupTestMode}
              className="px-3 py-1.5 bg-duo-white/20 backdrop-blur-sm border border-duo-white/30 text-duo-white rounded-lg hover:bg-duo-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm"
              title={isInMixedGroupTestMode ? "混组检测模式下不可用" : (isCurrentGroupShuffled ? "恢复顺序" : "打乱顺序")}
            >
              {isCurrentGroupShuffled ? "恢复顺序" : "打乱顺序"}
            </button>
            
            {/* 显示模式按钮 */}
            <div 
              className="relative"
              onMouseEnter={() => {
                // 清除可能存在的关闭定时器
                if (dropdownTimeoutRef.current) {
                  clearTimeout(dropdownTimeoutRef.current);
                  dropdownTimeoutRef.current = null;
                }
                if (learningWords.length > 0) {
                  setIsDisplayModeDropdownOpen(true);
                }
              }}
              onMouseLeave={() => {
                // 设置延迟关闭，给用户时间移动到下拉菜单
                dropdownTimeoutRef.current = setTimeout(() => {
                  setIsDisplayModeDropdownOpen(false);
                }, 150);
              }}
            >
              <button
                onClick={() => learningWords.length > 0 && setIsDisplayModeDropdownOpen(!isDisplayModeDropdownOpen)}
                disabled={learningWords.length === 0}
                className="px-3 py-1.5 bg-duo-white/20 backdrop-blur-sm border border-duo-white/30 text-duo-white rounded-lg hover:bg-duo-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm flex items-center space-x-1"
                title="切换显示模式"
              >
                <span>{getDisplayModeText(learningDisplayMode)}</span>
                <svg className={`w-3 h-3 transition-transform ${isDisplayModeDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isDisplayModeDropdownOpen && learningWords.length > 0 && (
                <div 
                  className="absolute top-full left-0 mt-1 w-32 bg-white border border-gray-300 rounded-lg shadow-lg z-50"
                  onMouseEnter={() => {
                    // 鼠标进入下拉菜单时，取消关闭定时器
                    if (dropdownTimeoutRef.current) {
                      clearTimeout(dropdownTimeoutRef.current);
                      dropdownTimeoutRef.current = null;
                    }
                  }}
                  onMouseLeave={() => {
                    // 鼠标离开下拉菜单时，设置延迟关闭
                    dropdownTimeoutRef.current = setTimeout(() => {
                      setIsDisplayModeDropdownOpen(false);
                    }, 100);
                  }}
                >
                  <button
                    onClick={() => handleSelectDisplayMode('both')}
                    className={`w-full px-3 py-2 text-left hover:bg-gray-50 first:rounded-t-lg transition-colors font-medium text-sm ${
                      learningDisplayMode === 'both' ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
                    }`}
                  >
                    英文+中文
                  </button>
                  <button
                    onClick={() => handleSelectDisplayMode('engOnly')}
                    className={`w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors font-medium text-sm ${
                      learningDisplayMode === 'engOnly' ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
                    }`}
                  >
                    仅英文
                  </button>
                  <button
                    onClick={() => handleSelectDisplayMode('meaningOnly')}
                    className={`w-full px-3 py-2 text-left hover:bg-gray-50 last:rounded-b-lg transition-colors font-medium text-sm ${
                      learningDisplayMode === 'meaningOnly' ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
                    }`}
                  >
                    仅中文
                  </button>
                </div>
              )}
            </div>

          </div>
        )}
        
        <div className="w-auto ml-auto flex items-center space-x-4">
          {!isLearningModeActive && !showKnownWordsListView && (
            <button 
              onClick={toggleShowKnownWordsListView} 
              className="text-duo-white text-sm md:text-base hover:underline focus:outline-none cursor-pointer flex items-center"
              title="查看已掌握的单词"
            >
              <span className="inline-block max-w-24 md:max-w-36 truncate">
                已掌握: {knownWords.length}/{totalWordsInLibrary}
              </span> 
              <ChevronRightIcon />
            </button>
          )}
          {!isLearningModeActive && showKnownWordsListView && (
             <button 
              onClick={toggleShowKnownWordsListView} 
              className="text-duo-white text-sm md:text-base hover:underline focus:outline-none cursor-pointer flex items-center"
              title="返回学习列表"
            >
              <ChevronLeftIcon /> 返回
            </button>
          )}
          
          {/* --- 新增：选择单词模式下的控制按钮 --- */}
          {!isLearningModeActive && !showKnownWordsListView && (
            <div className="flex items-center space-x-2">
              {/* 打乱顺序按钮 */}
              <button
                onClick={handleShuffleWordList}
                disabled={words.length === 0}
                className="px-3 py-1.5 bg-duo-white/20 backdrop-blur-sm border border-duo-white/30 text-duo-white rounded-lg hover:bg-duo-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm"
                title={isWordListShuffled ? "恢复顺序" : "打乱顺序"}
              >
                {isWordListShuffled ? "恢复顺序" : "打乱顺序"}
              </button>
              
              {/* 显示模式按钮 */}
              <div 
                className="relative"
                onMouseEnter={() => {
                  // 清除可能存在的关闭定时器
                  if (dropdownTimeoutRef.current) {
                    clearTimeout(dropdownTimeoutRef.current);
                    dropdownTimeoutRef.current = null;
                  }
                  if (words.length > 0) {
                    setIsWordListDisplayModeDropdownOpen(true);
                  }
                }}
                onMouseLeave={() => {
                  // 设置延迟关闭，给用户时间移动到下拉菜单
                  dropdownTimeoutRef.current = setTimeout(() => {
                    setIsWordListDisplayModeDropdownOpen(false);
                  }, 150);
                }}
              >
                <button
                  onClick={() => words.length > 0 && setIsWordListDisplayModeDropdownOpen(!isWordListDisplayModeDropdownOpen)}
                  disabled={words.length === 0}
                  className="px-3 py-1.5 bg-duo-white/20 backdrop-blur-sm border border-duo-white/30 text-duo-white rounded-lg hover:bg-duo-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm flex items-center space-x-1"
                  title="切换显示模式"
                >
                  <span>{getDisplayModeText(wordListDisplayMode)}</span>
                  <svg className={`w-3 h-3 transition-transform ${isWordListDisplayModeDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isWordListDisplayModeDropdownOpen && words.length > 0 && (
                  <div 
                    className="absolute top-full left-0 mt-1 w-32 bg-white border border-gray-300 rounded-lg shadow-lg z-50"
                    onMouseEnter={() => {
                      // 鼠标进入下拉菜单时，取消关闭定时器
                      if (dropdownTimeoutRef.current) {
                        clearTimeout(dropdownTimeoutRef.current);
                        dropdownTimeoutRef.current = null;
                      }
                    }}
                    onMouseLeave={() => {
                      // 鼠标离开下拉菜单时，设置延迟关闭
                      dropdownTimeoutRef.current = setTimeout(() => {
                        setIsWordListDisplayModeDropdownOpen(false);
                      }, 100);
                    }}
                  >
                    <button
                      onClick={() => handleSelectWordListDisplayMode('both')}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-50 first:rounded-t-lg transition-colors font-medium text-sm ${
                        wordListDisplayMode === 'both' ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
                      }`}
                    >
                      英文+中文
                    </button>
                    <button
                      onClick={() => handleSelectWordListDisplayMode('engOnly')}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors font-medium text-sm ${
                        wordListDisplayMode === 'engOnly' ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
                      }`}
                    >
                      仅英文
                    </button>
                    <button
                      onClick={() => handleSelectWordListDisplayMode('meaningOnly')}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-50 last:rounded-b-lg transition-colors font-medium text-sm ${
                        wordListDisplayMode === 'meaningOnly' ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
                      }`}
                    >
                      仅中文
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* --- 新增：全屏切换按钮 --- */}
          <button
            onClick={handleToggleFullscreen}
            className="text-duo-white p-2 rounded-lg hover:bg-duo-green/80 transition-colors"
            title={isFullscreen ? "退出全屏" : "进入全屏"}
          >
            {isFullscreen ? <CompressIcon /> : <ExpandIcon />}
          </button>
        </div>
      </header>

      {/* --- 单词列表区域 / 学习区域 --- */}
      <main className="flex-grow flex overflow-hidden">
        {/* --- 左侧菜单栏 --- */}
        <div className={`transition-all duration-300 ease-in-out ${
          isMenuCollapsed ? 'bg-duo-bg' : 'bg-duo-white'
        } border-r-2 ${
          isMenuCollapsed ? 'border-duo-bg' : 'border-duo-grayLight'
        } z-10 ${
          isMenuCollapsed ? 'w-16' : 'w-64'
        } flex-shrink-0`}>
          <div className="p-3 h-full flex flex-col">
            {/* 菜单项列表 */}
            <nav className="flex-grow pt-3">
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => handleMenuItemClick('menu')}
                    className={`w-full flex items-center p-3 rounded-xl text-left transition-all duration-200 hover:bg-duo-grayMedium/10 hover:text-duo-grayDark group ${
                      isMenuCollapsed ? 'justify-center' : ''
                    } relative overflow-hidden`}
                    title={isMenuCollapsed ? "展开菜单" : "收起菜单"}
                  >
                    <div className="flex items-center justify-center w-6 h-6 text-duo-grayMedium group-hover:text-duo-grayDark transition-colors duration-200">
                      <MenuIcon />
                    </div>
                    {!isMenuCollapsed && (
                      <span className="ml-3 font-medium text-duo-textPrimary group-hover:text-duo-grayDark transition-colors duration-200">
                        {isMenuCollapsed ? "展开菜单" : "收起菜单"}
                      </span>
                    )}
                    {/* 悬停效果背景 */}
                    <div className="absolute inset-0 bg-duo-grayMedium/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"></div>
                  </button>
                </li>
                
                <li>
                  <button
                    onClick={() => handleMenuItemClick('games')}
                    className={`w-full flex items-center p-3 rounded-xl text-left transition-all duration-200 hover:bg-duo-grayMedium/10 hover:text-duo-grayDark group ${
                      isMenuCollapsed ? 'justify-center' : ''
                    } relative overflow-hidden`}
                    title="教学游戏"
                  >
                    <div className="flex items-center justify-center w-6 h-6 text-duo-grayMedium group-hover:text-duo-grayDark transition-colors duration-200">
                      <GameControllerIcon />
                    </div>
                    {!isMenuCollapsed && (
                      <span className="ml-3 font-medium text-duo-textPrimary group-hover:text-duo-grayDark transition-colors duration-200">
                        教学游戏
                      </span>
                    )}
                    {/* 悬停效果背景 */}
                    <div className="absolute inset-0 bg-duo-grayMedium/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"></div>
                  </button>
                </li>
                
                <li>
                  <button
                    onClick={() => handleMenuItemClick('cards')}
                    className={`w-full flex items-center p-3 rounded-xl text-left transition-all duration-200 hover:bg-duo-grayMedium/10 hover:text-duo-grayDark group ${
                      isMenuCollapsed ? 'justify-center' : ''
                    } relative overflow-hidden`}
                    title="词卡检测"
                  >
                    <div className="flex items-center justify-center w-6 h-6 text-duo-grayMedium group-hover:text-duo-grayDark transition-colors duration-200">
                      <CardIcon />
                    </div>
                    {!isMenuCollapsed && (
                      <span className="ml-3 font-medium text-duo-textPrimary group-hover:text-duo-grayDark transition-colors duration-200">
                        词卡检测
                      </span>
                    )}
                    {/* 悬停效果背景 */}
                    <div className="absolute inset-0 bg-duo-grayMedium/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"></div>
                  </button>
                </li>
                
                <li>
                  <button
                    onClick={() => handleMenuItemClick('studyplan')}
                    className={`w-full flex items-center p-3 rounded-xl text-left transition-all duration-200 hover:bg-duo-grayMedium/10 hover:text-duo-grayDark group ${
                      isMenuCollapsed ? 'justify-center' : ''
                    } relative overflow-hidden`}
                    title="学习计划"
                  >
                    <div className="flex items-center justify-center w-6 h-6 text-duo-grayMedium group-hover:text-duo-grayDark transition-colors duration-200">
                      <StudyPlanIcon />
                    </div>
                    {!isMenuCollapsed && (
                      <span className="ml-3 font-medium text-duo-textPrimary group-hover:text-duo-grayDark transition-colors duration-200">
                        学习计划
                      </span>
                    )}
                    {/* 悬停效果背景 */}
                    <div className="absolute inset-0 bg-duo-grayMedium/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"></div>
                  </button>
                </li>
                
                <li>
                  <button
                    onClick={() => handleMenuItemClick('settings')}
                    className={`w-full flex items-center p-3 rounded-xl text-left transition-all duration-200 hover:bg-duo-grayMedium/10 hover:text-duo-grayDark group ${
                      isMenuCollapsed ? 'justify-center' : ''
                    } relative overflow-hidden`}
                    title="设置"
                  >
                    <div className="flex items-center justify-center w-6 h-6 text-duo-grayMedium group-hover:text-duo-grayDark transition-colors duration-200">
                      <SettingsIcon />
                    </div>
                    {!isMenuCollapsed && (
                      <span className="ml-3 font-medium text-duo-textPrimary group-hover:text-duo-grayDark transition-colors duration-200">
                        设置
                      </span>
                    )}
                    {/* 悬停效果背景 */}
                    <div className="absolute inset-0 bg-duo-grayMedium/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"></div>
                  </button>
                </li>
              </ul>
            </nav>
            
            {/* 菜单底部 */}
            {!isMenuCollapsed && (
              <div className="mt-auto pt-4 border-t border-duo-grayLight">
                <div className="text-xs text-duo-textSecondary text-center opacity-70">
                  <div className="flex items-center justify-center space-x-1">
                    <div className="w-2 h-2 bg-duo-green rounded-full"></div>
                    <span>小蜥蜴</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- 左侧单词列表 / 学习面板 --- */}
        <div className={`transition-all duration-300 flex flex-col ${
          (currentQueryWord || iframeSrc) 
            ? 'w-1/2' 
            : 'w-2/3'
        } ${showFlashcardView || showStudyPlan ? 'hidden' : ''}`}>
          {/* 单词列表滚动区域 */}
          <div className={`flex-grow overflow-y-auto space-y-2 [&::-webkit-scrollbar]:hidden ${
            (currentQueryWord || iframeSrc) 
              ? 'p-3 md:p-4' 
              : 'pl-8 md:pl-12 pr-8 md:pr-12 pt-3 md:pt-4 pb-3 md:pb-4'
          }`}>
                          {isLearningModeActive ? (
              // --- 学习模式视图 ---
              <>
              { isInMixedGroupTestMode ? (
                                                // --- 混组检测模式视图 ---
                mixedTestWords.length > 0 ? (
                  mixedTestWords.map((word) => {
                    const isAnimatingOut = animatingMixedTestWord?.wordId === word.id;
                    const animationDirection = animatingMixedTestWord?.direction;
                    let animationClass = "";
                    if (isAnimatingOut) {
                      animationClass = animationDirection === 'left' ? 'animate-slide-out-left' : 'animate-slide-out-right';
                    }
                    const wordCardStyle = "bg-duo-white border-3 border-duo-grayMedium";
                    const textStyle = "text-duo-textPrimary";
                    const phoneticStyle = "text-duo-textSecondary";
                    const isExpanded = expandedWordIds.has(word.id);

                    return (
                      <div
                        key={`${word.id}-mixedtest`}
                        className={`w-full rounded-2xl shadow-sm transform ${wordCardStyle} ${animationClass} ${
                          isAnimatingOut ? 'z-10' : 'z-0'
                        } ${!isAnimatingOut ? 'hover:bg-duo-blue/10 hover:border-duo-blue' : ''}`}
                        onDoubleClick={() => handleDoubleClickWord(word.text)}
                      >
                        <div className="p-2 flex justify-between items-start w-full">
                          {/* 单词主体信息 - 左侧 */}
                          <div className="flex-grow flex items-start mr-3">
                            <div 
                              className="cursor-pointer flex-grow"
                              onClick={() => {
                                handleClickToToggleMeaning(word.id);
                              }}
                            >
                              <div className="flex items-start">
                                <div className="flex-shrink-0 mr-3">
                                  <div className="flex items-center">
                                    <span className={`font-bold text-2xl ${textStyle} transition-all duration-500 ease-in-out`}>
                                      {getWordDisplayText(word.id, word.text)}
                                    </span>
                                    <button
                                      title="播放发音"
                                      onClick={e => {
                                        e.stopPropagation();
                                        handleWordPronunciationAndSplit(word.id, word.text);
                                      }}
                                      className={`p-1 ml-2 rounded-full text-duo-grayDark hover:bg-duo-grayLight/70 transition-colors`}
                                      disabled={isPronLoading}
                                    >
                                      <Volume2 className="w-5 h-5" />
                                    </button>
                                  </div>
                                  {word.phonetic && <span className={`text-lg ${phoneticStyle}`}>{word.phonetic}</span>}
                                </div>
                                
                                {isExpanded && word.meaning && (
                                  <div className={`pl-3 border-l border-duo-grayLight/60 text-lg self-center ${phoneticStyle}`} style={{maxWidth: '280px'}}>
                                    {word.partOfSpeech && <span className="italic opacity-80 mr-1">{word.partOfSpeech}</span>}
                                    <p className="inline text-xl font-semibold">{word.meaning}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* "错误" "正确"按钮 - 右侧 */}
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <button
                              title="错误"
                              onClick={() => handleMixedTestIncorrect(word.id)}
                              disabled={!!animatingMixedTestWord}
                              className="px-4 py-2 rounded-xl bg-red-100 border-2 border-red-400 text-red-700 hover:bg-red-200 hover:border-red-500 transition-all duration-200 font-semibold disabled:opacity-50 transform hover:scale-105 active:scale-95"
                            >
                              错误
                            </button>
                            <button
                              title="正确"
                              onClick={() => handleMixedTestCorrect(word.id)}
                              disabled={!!animatingMixedTestWord}
                              className="px-4 py-2 rounded-xl bg-green-100 border-2 border-green-400 text-green-700 hover:bg-green-200 hover:border-green-500 transition-all duration-200 font-semibold disabled:opacity-50 transform hover:scale-105 active:scale-95"
                            >
                              正确
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  (mixedTestCorrectWords.length + mixedTestIncorrectWords.length > 0) && !animatingMixedTestWord ? null // 完成时在下方载体显示信息
                  : <p className="text-center text-duo-textSecondary py-6 text-lg">没有需要检测的单词或已完成。</p>
                )
              ) : isInPostTestMode ? (
                // --- 学后检测模式视图 ---
                postTestWords.length > 0 ? (
                  postTestWords.map((word, index) => {
                    const isAnimatingOut = animatingPostTestWord?.wordId === word.id;
                    const animationDirection = animatingPostTestWord?.direction;
                    let animationClass = "";
                    if (isAnimatingOut) {
                      animationClass = animationDirection === 'left' ? 'animate-slide-out-left' : 'animate-slide-out-right';
                    }
                    const wordCardStyle = "bg-duo-white border-3 border-duo-grayMedium";
                    const textStyle = "text-duo-textPrimary";
                    const phoneticStyle = "text-duo-textSecondary";
                    const indexColorStyle = "text-duo-grayMedium";
                    const isExpanded = expandedWordIds.has(word.id);

                    return (
                      <div
                        key={`${word.id}-posttest`}
                        className={`w-full rounded-2xl shadow-sm transform ${wordCardStyle} ${animationClass} ${
                          isAnimatingOut ? 'z-10' : 'z-0'
                        } ${!isAnimatingOut ? 'hover:bg-duo-blue/10 hover:border-duo-blue' : ''}`}
                        onDoubleClick={() => handleDoubleClickWord(word.text)}
                      >
                        <div className="p-2 flex justify-between items-start w-full">
                          {/* 单词主体信息 - 左侧 */}
                          <div className="flex-grow flex items-start mr-3">
                            <div 
                              className="cursor-pointer flex-grow"
                              onClick={() => {
                                handleClickToToggleMeaning(word.id);
                              }}
                            >
                              <div className="flex items-start">
                                <div className="flex-shrink-0 mr-3">
                                  <div className="flex items-center">
                                    <span className={`text-2xl mr-2 ${indexColorStyle}`}>{index + 1}</span>
                                    <span className={`font-bold text-2xl ${textStyle} transition-all duration-500 ease-in-out`}>
                                      {getWordDisplayText(word.id, word.text)}
                                    </span>
                                    <button
                                      title="播放发音"
                                      onClick={e => {
                                        e.stopPropagation();
                                        handleWordPronunciationAndSplit(word.id, word.text);
                                      }}
                                      className={`p-1 ml-2 rounded-full text-duo-grayDark hover:bg-duo-grayLight/70 transition-colors`}
                                      disabled={isPronLoading}
                                    >
                                      <Volume2 className="w-5 h-5" />
                                    </button>
                                  </div>
                                  {word.phonetic && <span className={`text-lg ${phoneticStyle}`}>{word.phonetic}</span>}
                                </div>
                                
                                {isExpanded && word.meaning && (
                                  <div className={`pl-3 border-l border-duo-grayLight/60 text-lg self-center ${phoneticStyle}`} style={{maxWidth: '280px'}}>
                                    {word.partOfSpeech && <span className="italic opacity-80 mr-1">{word.partOfSpeech}</span>}
                                    <p className="inline text-xl font-semibold">{word.meaning}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* "错误" "正确"按钮 - 右侧 */}
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <button
                              title="错误"
                              onClick={() => handlePostTestIncorrect(word.id)}
                              disabled={!!animatingPostTestWord}
                              className="px-4 py-2 rounded-xl bg-red-100 border-2 border-red-400 text-red-700 hover:bg-red-200 hover:border-red-500 transition-all duration-200 font-semibold disabled:opacity-50 transform hover:scale-105 active:scale-95"
                            >
                              错误
                            </button>
                            <button
                              title="正确"
                              onClick={() => handlePostTestCorrect(word.id)}
                              disabled={!!animatingPostTestWord}
                              className="px-4 py-2 rounded-xl bg-green-100 border-2 border-green-400 text-green-700 hover:bg-green-200 hover:border-green-500 transition-all duration-200 font-semibold disabled:opacity-50 transform hover:scale-105 active:scale-95"
                            >
                              正确
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  (postTestCorrectWords.length + postTestIncorrectWords.length > 0) && !animatingPostTestWord ? null // 完成时在下方载体显示信息
                  : <p className="text-center text-duo-textSecondary py-6 text-lg">没有需要检测的单词或已完成。</p>
                )
              ) : isInTearingPaperMode ? (
                // --- 撕纸条模式视图 ---
                tearingPaperWords.length > 0 ? (
                  tearingPaperWords.map((word) => {
                    const isAnimatingOut = animatingClipWord?.wordId === word.id;
                    const animationDirection = animatingClipWord?.direction;
                    let animationClass = "";
                    if (isAnimatingOut) {
                      animationClass = animationDirection === 'left' ? 'animate-slide-out-left' : 'animate-slide-out-right';
                    }
                    const wordCardStyle = "bg-duo-white border-3 border-duo-grayMedium";
                    const textStyle = "text-duo-textPrimary";
                    const phoneticStyle = "text-duo-textSecondary";
                    const isExpanded = expandedWordIds.has(word.id);

                    return (
                      <div
                        key={`${word.id}-tearing`}
                        className={`w-full rounded-2xl shadow-sm transform ${wordCardStyle} ${animationClass} ${
                          isAnimatingOut ? 'z-10' : 'z-0'
                        } ${!isAnimatingOut ? 'hover:bg-duo-blue/10 hover:border-duo-blue' : ''}`}
                        onDoubleClick={() => handleDoubleClickWord(word.text)} // 双击查词依然可用
                      >
                        <div className="p-2 flex justify-between items-start w-full">
                          {/* 单词主体信息 - 左侧 */}
                          <div className="flex-grow flex items-start mr-3">
                            <div 
                              className="cursor-pointer flex-grow"
                              onClick={() => {
                                // 点击切换中文释义显示
                                handleClickToToggleMeaning(word.id);
                              }}
                            >
                              <div className="flex items-start">
                                {/* 单词和音标区域 */}
                                <div className="flex-shrink-0 mr-3">
                                  <div className="flex items-center">
                                    <span className={`font-bold text-2xl ${textStyle} transition-all duration-500 ease-in-out`}>
                                      {getWordDisplayText(word.id, word.text)}
                                    </span>
                                    <button
                                      title="播放发音"
                                      onClick={e => {
                                        e.stopPropagation();
                                        handleWordPronunciationAndSplit(word.id, word.text);
                                      }}
                                      className={`p-1 ml-2 rounded-full text-duo-grayDark hover:bg-duo-grayLight/70 transition-colors`}
                                      disabled={isPronLoading}
                                    >
                                      <Volume2 className="w-5 h-5" />
                                    </button>
                                  </div>
                                  {word.phonetic && <span className={`text-lg ${phoneticStyle}`}>{word.phonetic}</span>}
                                </div>
                                
                                {/* 中文释义区域 - 在展开时显示 */}
                                {isExpanded && word.meaning && (
                                  <div className={`pl-3 border-l border-duo-grayLight/60 text-lg self-center ${phoneticStyle}`} style={{maxWidth: '280px'}}>
                                    {word.partOfSpeech && <span className="italic opacity-80 mr-1">{word.partOfSpeech}</span>}
                                    <p className="inline text-xl font-semibold">{word.meaning}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* "不认识" "认识"按钮 - 右侧 */}
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <button
                              title="不认识"
                              onClick={() => handleClipWordAsUnknown(word.id)}
                              disabled={!!animatingClipWord}
                              className="px-4 py-2 rounded-xl bg-red-100 border-2 border-red-400 text-red-700 hover:bg-red-200 hover:border-red-500 transition-all duration-200 font-semibold disabled:opacity-50 transform hover:scale-105 active:scale-95"
                            >
                              不认识
                            </button>
                            <button
                              title="认识"
                              onClick={() => handleClipWordAsKnown(word.id)}
                              disabled={!!animatingClipWord}
                              className="px-4 py-2 rounded-xl bg-green-100 border-2 border-green-400 text-green-700 hover:bg-green-200 hover:border-green-500 transition-all duration-200 font-semibold disabled:opacity-50 transform hover:scale-105 active:scale-95"
                            >
                              认识
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  // 如果 tearingPaperWords 为空但撕纸条模式激活，表示初始为空或已处理完
                   (clippedKnownWords.length + clippedUnknownWords.length > 0) && !animatingClipWord ? null // 完成时在下方载体显示信息
                   : <p className="text-center text-duo-textSecondary py-6 text-lg">当前分组没有需要检测的单词或已完成。</p>
                )
              ) : (
                // --- 常规学习模式视图 ---
                <>
                {currentWordGroup.map((word) => {
                  // Define styles similar to the pre-study list for consistency
                  const wordCardStyle = "bg-duo-white border-3 border-duo-grayMedium"; // Default card style for learning mode
                  const textStyle = "text-duo-textPrimary";
                  const phoneticStyle = "text-duo-textSecondary";
                  const isExpandedInLearning = expandedWordIds.has(word.id);
                  // 根据当前模式与展开状态决定哪些内容应该显示
                  // 英文显示规则：
                  // 1. "both" 模式始终显示英文
                  // 2. "engOnly" 模式始终显示英文
                  // 3. "meaningOnly" 模式默认隐藏英文，点击后显示英文
                  const showEnglish = (learningDisplayMode === 'both') ||
                                     (learningDisplayMode === 'engOnly') ||
                                     (learningDisplayMode === 'meaningOnly' && isExpandedInLearning);

                  // 中文释义显示规则：
                  // 1. "both" 模式默认显示中文，点击后隐藏中文（反向逻辑）
                  // 2. "engOnly" 模式且处于展开状态 (点击后显示中文)
                  // 3. "meaningOnly" 模式始终显示中文
                  const showChinese = (learningDisplayMode === 'both' && !isExpandedInLearning) ||
                                      (learningDisplayMode === 'engOnly' && isExpandedInLearning) ||
                                      (learningDisplayMode === 'meaningOnly');

                  return (
                    <div 
                      key={`${word.id}-learning`}
                      className={`w-full rounded-2xl shadow-sm transform transition-all duration-300 ease-in-out translate-x-0 opacity-100 ${wordCardStyle} hover:bg-duo-blue/10 hover:border-duo-blue`}
                      onDoubleClick={() => handleDoubleClickWord(word.text)}
                    >
                      <div className="p-2 flex justify-between items-start w-full">
                        <div
                          className="flex-grow flex items-start cursor-pointer mr-3"
                          onClick={() => {
                            // "仅英文"、"仅中文" 以及 "both" 模式都允许点击切换展开状态
                            handleClickToToggleMeaning(word.id);
                          }}
                        >
                          <div className="flex-grow">
                            <div className="flex items-start"> {/* Main flex container for word block and meaning block */} 
                              {/* Word Block (Index, Text, Phonetic, Sound Button) */}
                              <div className="flex-shrink-0 mr-3">
                                <div className="flex items-center">
                                  {/* 删除序号，仅保留单词和发音按钮 */}
                                  <span className={` font-bold text-2xl ${textStyle} ${!showEnglish ? 'invisible' : ''} transition-all duration-500 ease-in-out`}>
                                    {getWordDisplayText(word.id, word.text) || '\u00A0'}
                                  </span>
                                  <button
                                    title="播放发音"
                                    onClick={e => {
                                      e.stopPropagation();
                                      handleWordPronunciationAndSplit(word.id, word.text);
                                    }}
                                    className={`p-1 ml-2 rounded-full text-duo-grayDark hover:bg-duo-grayLight/70 transition-colors ${!showEnglish ? 'invisible' : ''}`}
                                    disabled={isPronLoading}
                                  >
                                    <Volume2 className="w-5 h-5" />
                                  </button>
                                </div>
                                <span className={`text-lg ${phoneticStyle} ${!showEnglish ? 'invisible' : ''}`}>
                                  {word.phonetic || '\u00A0'}
                                </span>
                              </div>

                              {/* Meaning Block (Part of Speech, Meaning) */}
                              {/* Visible if: 
                                  ('both' mode AND expanded) OR 
                                  ('meaningOnly' mode AND expanded)
                              */}
                              {showChinese && (
                                <div className={`pl-3 border-l border-duo-grayLight/60 text-lg self-center ${phoneticStyle}`} style={{maxWidth: '280px'}}>
                                  {word.partOfSpeech && <span className="italic opacity-80 mr-1">{word.partOfSpeech}</span>}
                                  {word.meaning ? (
                                    <p className="inline text-xl font-semibold">{word.meaning}</p>
                                  ) : (
                                    // Show this specifically if mode is 'meaningOnly' (and expanded) and meaning is empty
                                    learningDisplayMode === 'meaningOnly' && <p className="inline italic">暂无释义</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* The right-aligned standalone sound button is removed as it's now integrated with the word text block above */}
                      </div>
                    </div>
                  );
                })}
                {learningWords.length > 0 && currentWordGroup.length === 0 && (
                    <p className="text-center text-duo-textSecondary py-6 text-lg">当前分组显示完毕。</p>
                )}
                 {learningWords.length === 0 && (
                    <div className="text-center py-16">
                      <p className="text-duo-textSecondary text-xl mb-5">没有选中的单词可供学习。</p>
                      <button
                        onClick={handleExitLearningMode}
                        className="bg-duo-green text-duo-white font-semibold py-3 px-8 rounded-xl hover:bg-duo-green/90 transition-colors shadow-md text-base"
                      >
                        返回选词
                      </button>
                    </div>
                )}
                </>
              )}
              </>
            ) : showKnownWordsListView ? (
              // --- 已掌握单词列表视图 (existing code) ---
              <>
                {knownWords.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-duo-textSecondary text-lg mb-4">你还没有标记任何已掌握的单词。</p>
                    <button
                      onClick={toggleShowKnownWordsListView}
                      className="bg-duo-green text-duo-white font-semibold py-2.5 px-6 rounded-xl hover:bg-duo-green/90 transition-colors shadow-md text-base"
                    >
                      去学习选词
                    </button>
                  </div>
                ) : (
                  knownWords.map((word, index) => {
                    const isRemovingFromKnown = removingFromKnownIds.has(word.id);
                    // 为已掌握单词定义样式
                    const knownWordBaseStyle = "bg-green-50 border-3 border-green-500";
                    const knownWordTextStyle = "text-green-700";
                    const knownWordPhoneticStyle = "text-green-600";
                    const knownWordIndexStyle = "text-green-500";

                    return (
                      <div 
                        key={word.id} 
                        className={`w-full rounded-2xl shadow-sm transform transition-all duration-300 ease-in-out ${isRemovingFromKnown ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'} ${knownWordBaseStyle}`}
                        onDoubleClick={() => handleDoubleClickWord(word.text)}
                      >
                        <div className="p-2 flex justify-between items-start w-full">
                          <div 
                            className="flex-grow flex items-start mr-3"
                          >
                            <div className="flex-grow">
                              <div className="flex items-start">
                                <div className="flex-shrink-0 mr-3">
                                  <div className="flex items-center">
                                    <span className={`text-2xl mr-2 ${knownWordIndexStyle}`}>{index + 1}</span>
                                    <span className={` font-bold text-2xl ${knownWordTextStyle} transition-all duration-500 ease-in-out`}>{getWordDisplayText(word.id, word.text)}</span>
                                    <button
                                      title="播放发音"
                                      onClick={e => {
                                        e.stopPropagation();
                                        handleWordPronunciationAndSplit(word.id, word.text);
                                      }}
                                      className={`p-1 ml-2 rounded-full ${knownWordTextStyle} hover:bg-green-100 transition-colors`}
                                      disabled={isPronLoading}
                                    >
                                      <Volume2 className="w-5 h-5" />
                                    </button>
                                  </div>
                                  {word.phonetic && <span className={`text-lg ${knownWordPhoneticStyle}`}>{word.phonetic}</span>}
                                </div>
                                {word.meaning && (
                                  <div className={`pl-3 border-l border-green-300 text-lg self-center ${knownWordPhoneticStyle}`} style={{maxWidth: '280px'}}>
                                    {word.partOfSpeech && <span className="italic opacity-80 mr-1">{word.partOfSpeech}</span>}
                                    <p className="inline text-xl font-semibold">{word.meaning}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            title="标记为未掌握"
                            onClick={(e) => { e.stopPropagation(); handleMarkUnknown(word.id); }}
                            className={`px-3 py-2 rounded-xl transition-colors duration-150 flex items-center justify-center min-w-[3rem] h-8 md:h-9 text-sm font-medium
                              bg-yellow-100 border-2 border-yellow-400 text-yellow-700 hover:bg-yellow-200 hover:border-yellow-500 
                              focus:ring-2 focus:ring-yellow-500/50`}
                          >
                            重新学习
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </>
            ) : (
              // --- 主学习列表视图 ---
              words.map((word, index) => {
                const isSelected = selectedWords.has(word.id);
                const isRemoving = removingWordIds.has(word.id);
                
                // 保持统一的卡片样式，不因选中状态改变
                const wordStateStyle = "bg-duo-white border-3 border-duo-grayMedium"; 
                const textColorStyle = "text-duo-textPrimary";
                const phoneticColorStyle = "text-duo-textSecondary";
                const indexColorStyle = "text-duo-grayMedium";

                const isExpanded = expandedWordIds.has(word.id);

                // 根据显示模式确定要显示的内容
                const showEnglish = (wordListDisplayMode === 'both') ||
                                   (wordListDisplayMode === 'engOnly') ||
                                   (wordListDisplayMode === 'meaningOnly' && isExpanded);

                const showChinese = (wordListDisplayMode === 'both' && !isExpanded) ||
                                    (wordListDisplayMode === 'engOnly' && isExpanded) ||
                                    (wordListDisplayMode === 'meaningOnly');

                return (
                  <div 
                      key={word.id} 
                      className={`w-full rounded-2xl shadow-sm transform transition-all duration-300 ease-in-out ${isRemoving ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'} ${wordStateStyle} hover:bg-duo-blue/10 hover:border-duo-blue`}
                      onDoubleClick={() => handleDoubleClickWord(word.text)}
                  >
                    <div className="p-2 flex justify-between items-start w-full">
                      <div 
                        className="flex-grow flex items-start cursor-pointer mr-3"
                        onClick={() => handleClickToToggleMeaning(word.id)}
                      >
                        
                        <div className="flex-grow">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 mr-3">
                              <div className="flex items-center">
                                <span className={`text-2xl mr-2 ${indexColorStyle} ${!showEnglish ? 'invisible' : ''}`}>{index + 1}</span>
                                <span 
                                  className={` font-bold text-2xl ${textColorStyle} ${!showEnglish ? 'invisible' : ''} transition-all duration-500 ease-in-out`}
                                >
                                  {showEnglish ? getWordDisplayText(word.id, word.text) : '\u00A0'}
                                </span>
                                <button
                                  title="播放发音"
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleWordPronunciationAndSplit(word.id, word.text);
                                  }}
                                  className={`p-1 ml-2 rounded-full text-duo-grayDark hover:bg-duo-grayLight/70 transition-colors ${!showEnglish ? 'invisible' : ''}`}
                                  disabled={isPronLoading}
                                >
                                  <Volume2 className="w-5 h-5" />
                                </button>
                              </div>
                              {word.phonetic && <span className={`text-lg ${phoneticColorStyle} ${!showEnglish ? 'invisible' : ''}`}>{word.phonetic || '\u00A0'}</span>}
                            </div>
                            {showChinese && word.meaning && (
                              <div className={`pl-3 border-l border-duo-grayLight/60 text-lg self-center ${phoneticColorStyle}`} style={{maxWidth: '280px'}}>
                                {word.partOfSpeech && <span className="italic opacity-80 mr-1">{word.partOfSpeech}</span>}
                                <p className="inline text-xl font-semibold">{word.meaning}</p>
                              </div>
                            )}
                            {showChinese && !word.meaning && wordListDisplayMode === 'meaningOnly' && (
                              <div className={`pl-3 border-l border-duo-grayLight/60 text-lg self-center ${phoneticColorStyle}`} style={{maxWidth: '280px'}}>
                                <p className="inline italic">暂无释义</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5 md:space-x-2.5 flex-shrink-0">
                        <label 
                          htmlFor={`known-checkbox-${word.id}`} 
                          className="flex items-center cursor-pointer p-0.5 rounded-lg"
                          title={isSelected ? "移到已掌握" : "选择学习"}
                          onClick={(e) => e.stopPropagation()} 
                        >
                          <input 
                            id={`known-checkbox-${word.id}`}
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={isSelected}
                            onChange={() => { handleToggleSelect(word.id); }}
                          />
                          <div className={`w-8 h-8 md:w-9 md:h-9 rounded-lg border-2 flex items-center justify-center transition-all duration-150 
                            ${isSelected 
                              ? 'bg-duo-blue border-duo-blueDark text-white' 
                              : 'bg-duo-grayLight/50 border-duo-grayMedium text-duo-grayDark hover:border-duo-grayDark'}
                            peer-focus:ring-2 peer-focus:ring-duo-blue/50
                          `}>
                            {isSelected && <CheckIcon /> }
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* --- 新增：加载更多按钮（仅在学前检测模式下显示） --- */}
            {!isLearningModeActive && !showKnownWordsListView && hasMoreWords && (
              <div className="pt-4 pb-2">
                <button
                  onClick={handleLoadMoreWords}
                  disabled={isLoadingMore}
                  className="w-full py-4 bg-duo-white border-2 border-duo-grayMedium text-duo-textPrimary font-semibold rounded-2xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-duo-blue/50"
                >
                  {isLoadingMore ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-duo-blue border-t-transparent rounded-full animate-spin"></div>
                      <span>加载中...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>加载更多单词</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  )}
                </button>
              </div>
            )}

            {/* --- 没有更多单词时的提示 --- */}
            {!isLearningModeActive && !showKnownWordsListView && !hasMoreWords && loadedWordsCount > 0 && (
              <div className="pt-4 pb-2 text-center">
                <p className="text-duo-textSecondary text-base py-3">
                  已加载所有单词 ({words.length} 个)
                </p>
              </div>
            )}
          </div>
          

          
          {/* --- 剪纸盒模式载体区域 --- */}
          {isLearningModeActive && isInTearingPaperMode && (
            <div className={`flex-shrink-0 pt-0 ${
              (currentQueryWord || iframeSrc) 
                ? 'px-3 md:px-4' 
                : 'pl-8 md:pl-12 pr-8 md:pr-12'
            }`}>
              {/* 认识和不认识载体 - 左右排列 */}
              <div className="flex space-x-48 mb-4">
                {/* 不认识的单词载体 */}
                <div className="flex flex-col items-center justify-center flex-1 h-40 bg-gradient-to-br from-red-50 to-red-100 border-4 border-red-400 rounded-3xl shadow-xl p-6 transition-all duration-300 relative overflow-hidden">
                  
                  {/* 文字内容 */}
                  <span className="text-red-700 font-bold text-xl mb-2 tracking-wide">不认识</span>
                  <span className="text-red-700 text-5xl font-extrabold ">
                    {clippedUnknownWords.length}
                  </span>
                  
                  {/* 进度指示器 */}
                  <div className="mt-3 w-full bg-red-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${Math.min(100, (clippedUnknownWords.length / Math.max(1, clippedKnownWords.length + clippedUnknownWords.length + tearingPaperWords.length)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* 认识的单词载体 */}
                <div className="flex flex-col items-center justify-center flex-1 h-40 bg-gradient-to-br from-green-50 to-green-100 border-4 border-green-400 rounded-3xl shadow-xl p-6 transition-all duration-300 relative overflow-hidden">
                  
                  {/* 文字内容 */}
                  <span className="text-green-700 font-bold text-xl mb-2 tracking-wide">认识</span>
                  <span className="text-green-700 text-5xl font-extrabold">
                    {clippedKnownWords.length}
                  </span>
                  
                  {/* 进度指示器 */}
                  <div className="mt-3 w-full bg-green-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${Math.min(100, (clippedKnownWords.length / Math.max(1, clippedKnownWords.length + clippedUnknownWords.length + tearingPaperWords.length)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              

              
              {tearingPaperWords.length === 0 && (clippedKnownWords.length + clippedUnknownWords.length === 0) && !animatingClipWord && currentWordGroup.length > 0 && (
                <div className="text-center p-6 bg-duo-white border-2 border-duo-grayLight rounded-3xl shadow-md">
                  <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 bg-duo-grayLight/30 rounded-full flex items-center justify-center">
                      <span className="text-2xl">👆</span>
                    </div>
                  </div>
                  <p className="text-duo-textSecondary font-medium text-lg">点击上方单词右侧的按钮进行分类</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* --- 右侧iframe区域 --- */}
        <div 
          className={`transition-all duration-300 p-2 md:p-4 relative ${
            (currentQueryWord || iframeSrc) ? 'w-1/2' : 'w-1/3'
          } ${showFlashcardView || showStudyPlan ? 'hidden' : ''}`}
          onClick={(e) => {
            // 如果点击的是空白区域（没有查询词时的提示区域），清除查询状态
            if (!currentQueryWord && !iframeSrc && e.target === e.currentTarget) {
              // 这里可以添加其他清理逻辑
            }
          }}
        >
          {/* --- 词典切换和关闭按钮 --- */}
          {(currentQueryWord || selectedDictionary === 'local') && (
            <div className="absolute top-2 right-12 flex space-x-1 bg-white/70 p-0.5 rounded-md shadow-sm z-10">
              <button 
                onClick={() => handleSwitchDictionary('youdao')}
                className={`px-2 py-0.5 rounded ${selectedDictionary === 'youdao' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'} text-xs`}
                title="有道词典"
              >
                有道
              </button>
              <button 
                onClick={() => handleSwitchDictionary('eudic')}
                className={`px-2 py-0.5 rounded ${selectedDictionary === 'eudic' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'} text-xs`}
                title="欧路词典"
              >
                欧路
              </button>
              <button 
                onClick={() => handleSwitchDictionary('local')}
                className={`px-2 py-0.5 rounded ${selectedDictionary === 'local' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'} text-xs`}
                title="本地释义"
              >
                本地
              </button>
            </div>
          )}
          {selectedDictionary !== 'local' && iframeSrc && (
            <button
              onClick={() => {
                setIframeSrc(null);
                setCurrentQueryWord(null);
              }}
              className="absolute top-2 right-2 bg-white/70 hover:bg-white text-gray-700 p-1.5 rounded-full shadow-md z-10"
              title="关闭释义"
            >
              <CloseIcon />
            </button>
          )}
          {/* --- 新增：本地释义视图的关闭按钮 --- */}
          {selectedDictionary === 'local' && currentQueryWord && (
            <button
              onClick={() => {
                setCurrentQueryWord(null);
                setCurrentLocalDefinition(null);
                setIsEditingLocal(false); // 也重置编辑状态
              }}
              className="absolute top-2 right-2 bg-white/70 hover:bg-white text-gray-700 p-1.5 rounded-full shadow-md z-10"
              title="关闭本地释义"
            >
              <CloseIcon />
            </button>
          )}

          {/* --- 内容显示区域 --- */}
          {selectedDictionary === 'local' && currentQueryWord ? (
            // --- 本地释义显示/编辑区域 ---
            <div className="w-full h-full flex flex-col p-2 md:p-6 bg-duo-white rounded-lg overflow-y-auto font-sans">
              {currentQueryWord ? (
                isEditingLocal && editingBuffer ? (
                  // --- 编辑模式 ---
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-2xl font-bold text-duo-textPrimary">编辑: {editingBuffer.text || currentQueryWord}</h2>
                    </div>
                    <div>
                      <label htmlFor="local-phonetic" className="block text-sm font-medium text-duo-textSecondary mb-1">音标</label>
                      <input 
                        type="text" 
                        id="local-phonetic" 
                        value={editingBuffer.phonetic || ''} 
                        onChange={(e) => handleLocalDefChange('phonetic', e.target.value)} 
                        className="w-full p-2 border border-duo-grayMedium rounded-lg focus:ring-duo-blue focus:border-duo-blue"
                        placeholder="例如 /æpəl/"
                      />
                    </div>
                    <div>
                      <label htmlFor="local-pos" className="block text-sm font-medium text-duo-textSecondary mb-1">词性</label>
                      <input 
                        type="text" 
                        id="local-pos" 
                        value={editingBuffer.partOfSpeech || ''} 
                        onChange={(e) => handleLocalDefChange('partOfSpeech', e.target.value)} 
                        className="w-full p-2 border border-duo-grayMedium rounded-lg focus:ring-duo-blue focus:border-duo-blue"
                        placeholder="例如 n. / v. / adj."
                      />
                    </div>
                    <div>
                      <label htmlFor="local-meaning" className="block text-sm font-medium text-duo-textSecondary mb-1">中文释义</label>
                      <input 
                        type="text" 
                        id="local-meaning" 
                        value={editingBuffer.meaning || ''} 
                        onChange={(e) => handleLocalDefChange('meaning', e.target.value)} 
                        className="w-full p-2 border border-duo-grayMedium rounded-lg focus:ring-duo-blue focus:border-duo-blue"
                        placeholder="例如 苹果"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-duo-textSecondary mb-1">例句</label>
                      {editingBuffer.examples?.map((ex, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                          <input 
                            type="text" 
                            value={ex} 
                            onChange={(e) => handleExampleChange(index, e.target.value)} 
                            className="flex-grow p-2 border border-duo-grayMedium rounded-lg focus:ring-duo-blue focus:border-duo-blue"
                            placeholder={`例句 ${index + 1}`}
                          />
                          <button onClick={() => removeExampleField(index)} className="p-2 text-red-500 hover:text-red-700">
                            <CloseIcon />
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={addExampleField} 
                        className="mt-1 text-sm text-duo-blue hover:underline"
                      >
                        + 添加例句
                      </button>
                    </div>
                    <div className="flex space-x-3 mt-5">
                      <button 
                        onClick={handleSaveLocalDefinition} 
                        className="flex-1 bg-duo-green text-white font-semibold py-2.5 px-4 rounded-xl hover:bg-duo-green/90 transition-colors shadow-sm"
                      >
                        保存
                      </button>
                      <button 
                        onClick={handleCancelEditLocal} 
                        className="flex-1 bg-duo-grayMedium text-duo-white font-semibold py-2.5 px-4 rounded-xl hover:bg-duo-grayDark transition-colors shadow-sm"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : currentLocalDefinition ? (
                  // --- 显示模式 ---
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="font-bold text-2xl font-bold text-duo-textPrimary break-all">{currentLocalDefinition.text || currentQueryWord}</h2>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => {
                            setIsEditingLocal(true);
                            // Ensure editingBuffer gets all fields from currentLocalDefinition, especially .text
                            setEditingBuffer({ 
                              text: currentLocalDefinition.text || currentQueryWord,
                              phonetic: currentLocalDefinition.phonetic || "",
                              meaning: currentLocalDefinition.meaning || "",
                              partOfSpeech: currentLocalDefinition.partOfSpeech || "",
                              examples: currentLocalDefinition.examples || [],
                            });
                          }}
                          className="bg-duo-blue text-white px-4 py-2 rounded-lg hover:bg-duo-blue/90 transition-colors text-sm font-semibold min-w-max"
                        >
                          编辑释义
                        </button>
                      </div>
                    </div>
                    {currentLocalDefinition.phonetic && <p className="text-duo-textSecondary text-xl mb-1">[{currentLocalDefinition.phonetic}]</p>}
                    {(currentLocalDefinition.partOfSpeech || currentLocalDefinition.meaning) && (
                      <div className="text-duo-textPrimary text-xl mb-3 break-words">
                        {currentLocalDefinition.partOfSpeech && <span className="italic mr-2">{currentLocalDefinition.partOfSpeech}</span>}
                        {currentLocalDefinition.meaning && <span>{currentLocalDefinition.meaning}</span>}
                      </div>
                    )}
                    
                    {currentLocalDefinition.examples && currentLocalDefinition.examples.length > 0 ? (
                      <div className="mt-3">
                        <h4 className="font-semibold text-duo-textPrimary mb-1 text-lg">例句:</h4>
                        <ul className="list-disc list-inside space-y-1.5 text-duo-textSecondary text-lg">
                          {currentLocalDefinition.examples.map((ex, idx) => ex && <li key={idx} className="break-words">{ex}</li>)}
                        </ul>
                      </div>
                    ) : (
                        (!currentLocalDefinition.phonetic && !currentLocalDefinition.meaning && !currentLocalDefinition.partOfSpeech) &&
                        <p className="text-duo-textSecondary text-center py-6 text-base">此单词暂无本地释义。点击"编辑释义"添加。</p>
                    )}

                    {(currentLocalDefinition.phonetic || currentLocalDefinition.meaning || currentLocalDefinition.partOfSpeech) && (!currentLocalDefinition.examples || currentLocalDefinition.examples.length === 0) && (
                        <p className="text-duo-textSecondary text-base mt-4">无例句。点击"编辑释义"添加。</p>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-lg">
                    <p>{`加载 "${currentQueryWord}" 的本地释义...`}</p>
                  </div>
                )
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 text-lg space-y-2">
                  {!isLearningModeActive && <p className="text-center">双击左侧单词查看详细释义</p>}
                </div>
              )}
            </div>
          ) : iframeSrc ? (
            // --- Youdao/Eudic iframe --- (Eudic opens new tab, so this is mainly for Youdao)
            <div className="w-full h-full overflow-hidden">
              <iframe
                src={iframeSrc}
                title="Word Definition"
                className="w-full border-0"
                style={{
                  height: 'calc(100% + 200px)', // 增加高度以便向上偏移
                  width: 'calc(100% + 120px)', // 增加宽度以补偿左偏移
                  marginTop: '-200px', // 向下偏移162px
                  marginLeft: '-120px', // 向左偏移120px
                  transformOrigin: 'top left'
                }}
                onLoad={(e) => {
                  // 尝试在iframe加载完成后进行额外调整
                  try {
                    const iframe = e.target as HTMLIFrameElement;
                    // 添加一个小延迟，确保页面完全加载
                    setTimeout(() => {
                      // 由于跨域限制，这里主要是为了将来可能的扩展
                      console.log('有道词典页面已加载完成');
                    }, 1000);
                  } catch (error) {
                    // 忽略跨域错误
                    console.log('iframe加载完成，但无法访问内容（跨域限制）');
                  }
                }}
              />
            </div>
          ) : (
            // --- 默认提示 (当 iframeSrc is null and selectedDictionary is not 'local', OR selectedDictionary is 'local' with no current word) --- 
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 text-lg space-y-2">
              {!isLearningModeActive && <p className="text-center">双击左侧单词查看详细释义</p>}
            </div>
          )}
        </div>
      </main>

      {/* --- 学习计划视图（居中显示）--- */}
      {showStudyPlan && (
        <div className="fixed inset-0 bg-duo-bg z-30 flex items-center justify-center p-8">
          {/* 关闭按钮 */}
          <button
            onClick={() => setShowStudyPlan(false)}
            className="absolute top-4 right-4 bg-duo-white/70 hover:bg-duo-white text-gray-700 p-3 rounded-full shadow-md z-40 transition-all duration-200 hover:scale-110"
            title="关闭学习计划"
          >
            <CloseIcon />
          </button>
          
          {/* 学习计划组件 */}
          <div className="w-full max-w-4xl">
            <DuolingoStudyPlan
              newWordsCount={selectedWords.size}
              review1WordsCount={5}
              review2WordsCount={3}
              review3WordsCount={8}
              review4WordsCount={2}
              review5WordsCount={1}
              words={[
                // 模拟数据
                { word: "apple", startDate: "2024-01-01", currentStage: 0, stageHistory: [] },
                { word: "banana", startDate: "2024-01-01", currentStage: 1, stageHistory: [{ stage: 0, completedAt: "2024-01-01" }] },
                { word: "orange", startDate: "2024-01-02", currentStage: 2, stageHistory: [
                  { stage: 0, completedAt: "2024-01-01" },
                  { stage: 1, completedAt: "2024-01-02" }
                ]},
              ]}
              today="2024-01-10"
            />
          </div>
        </div>
      )}

      {/* 学习模式下不显示原footer，或者显示不同的footer */}
      {!isLearningModeActive && !showKnownWordsListView && !showFlashcardView && !showStudyPlan && (
        <footer className="bg-duo-white p-4 border-t-2 border-duo-grayLight shadow-inner sticky bottom-0 z-10">
          <div className="flex items-center space-x-6">
            {/* 自定义学习数量输入框 - 固定宽度与右侧按钮保持一致 */}
            <div className="w-80 flex items-center justify-center space-x-3">
              <span className="text-duo-textSecondary font-medium whitespace-nowrap">学习</span>
              <input
                type="number"
                value={customLearningCount}
                onChange={handleCustomLearningChange}
                onKeyPress={handleCustomLearningKeyPress}
                placeholder={`1-${words.length}`}
                min="1"
                max={words.length}
                className="w-32 px-3 py-2 border-2 border-duo-grayMedium rounded-xl text-center font-semibold text-duo-textPrimary focus:outline-none focus:ring-2 focus:ring-duo-blue focus:border-duo-blue transition-colors"
                title="输入想要学习的单词数量，按回车确认"
              />
              <span className="text-duo-textSecondary font-medium whitespace-nowrap">个单词</span>
            </div>
            
            {/* 选词信息 */}
            <div className="flex-1 flex justify-center">
              <span className="text-duo-textSecondary text-base font-medium whitespace-nowrap">
                待学习 <span className="font-bold text-duo-orange text-lg">{selectedCount}</span> 个单词
              </span>
            </div>
            
            <button 
              onClick={handleStartMemorizing} 
              disabled={selectedCount === 0}
              className="w-80 bg-duo-green text-duo-white font-semibold py-3 rounded-2xl hover:bg-duo-green/90 transition-colors duration-150 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-duo-green/50"
            >
              开始学习
            </button>
          </div>
        </footer>
      )}
             {/* Optionally, a different footer for learning mode if needed */}
       {isLearningModeActive && !showStudyPlan && (
         isInMixedGroupTestMode ? (
           // --- 混组检测模式的 Footer ---
           <footer className="bg-duo-white p-4 border-t-2 border-duo-grayLight shadow-inner sticky bottom-0 z-10">
             <div className="flex items-center justify-between">
               {/* 左侧：错误数量 */}
               <div className="flex items-center space-x-2">
                 <span className="text-red-600 font-bold text-lg">错误</span>
                 <span className="text-red-600 font-bold text-2xl">{mixedTestIncorrectWords.length}</span>
                 <span className="text-red-600 font-medium">个</span>
               </div>
               
               {/* 中间：正确数量 */}
               <div className="flex items-center space-x-2">
                 <span className="text-green-600 font-bold text-lg">正确</span>
                 <span className="text-green-600 font-bold text-2xl">{mixedTestCorrectWords.length}</span>
                 <span className="text-green-600 font-medium">个</span>
               </div>
               
               {/* 右侧：确认提交按钮 */}
               <button
                 onClick={handleSubmitMixedGroupTest}
                 disabled={mixedTestWords.length > 0}
                 className="px-8 py-3 bg-duo-blue text-white font-bold rounded-2xl hover:bg-duo-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:transform-none"
               >
                 确认提交
               </button>
             </div>
           </footer>
         ) : isInPostTestMode ? (
           // --- 学后检测模式的 Footer ---
           <footer className="bg-duo-white p-4 border-t-2 border-duo-grayLight shadow-inner sticky bottom-0 z-10">
             <div className="flex items-center justify-between">
               {/* 左侧：错误数量 */}
               <div className="flex items-center space-x-2">
                 <span className="text-red-600 font-bold text-lg">错误</span>
                 <span className="text-red-600 font-bold text-2xl">{postTestIncorrectWords.length}</span>
                 <span className="text-red-600 font-medium">个</span>
               </div>
               
               {/* 中间：正确数量 */}
               <div className="flex items-center space-x-2">
                 <span className="text-green-600 font-bold text-lg">正确</span>
                 <span className="text-green-600 font-bold text-2xl">{postTestCorrectWords.length}</span>
                 <span className="text-green-600 font-medium">个</span>
               </div>
               
               {/* 右侧：确认提交按钮 */}
               <button
                 onClick={handleSubmitPostTest}
                 disabled={postTestWords.length > 0}
                 className="px-8 py-3 bg-duo-blue text-white font-bold rounded-2xl hover:bg-duo-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:transform-none"
               >
                 确认提交
               </button>
             </div>
           </footer>
         ) : isInTearingPaperMode && tearingPaperWords.length === 0 && (clippedKnownWords.length + clippedUnknownWords.length > 0) && !animatingClipWord ? (
           // --- 撕纸条完成模式的 Footer ---
           <footer className="bg-duo-white p-4 border-t-2 border-duo-grayLight shadow-inner sticky bottom-0 z-10">
             <div className="flex items-center justify-between mb-3">
               <span className="text-base text-duo-textSecondary">
                 本组单词已<span className="font-bold text-duo-orange text-lg">全部检测</span>完成！
               </span>
             </div>
             <div className="flex space-x-4">
               {currentGroupIndex >= totalLearningGroups - 1 ? (
                 // 最后一组：混组检测在左，开始学后检测在右
                 <>
                   <button
                     onClick={() => {
                       handleExitTearingPaperMode();
                       handleStartMixedGroupTest();
                     }}
                     className="flex-1 bg-duo-white border-2 border-duo-grayMedium text-duo-grayDark font-semibold py-3 rounded-2xl hover:bg-duo-grayLight/50 transition-colors duration-150 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-duo-grayMedium/50"
                   >
                     混组检测
                   </button>
                   <button
                     onClick={() => {
                       handleExitTearingPaperMode();
                       handleStartPostTest();
                     }}
                     className="flex-1 bg-duo-green text-duo-white font-semibold py-3 rounded-2xl hover:bg-duo-green/90 transition-colors duration-150 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-duo-green/50"
                   >
                     开始学后检测
                   </button>
                 </>
               ) : (
                 // 非最后一组：重复本组在左，下一组在中，混组检测在右
                 <>
                   <button
                     onClick={() => {
                       handleExitTearingPaperMode();
                     }}
                     className="flex-1 bg-duo-white border-2 border-duo-grayMedium text-duo-grayDark font-semibold py-3 rounded-2xl hover:bg-duo-grayLight/50 transition-colors duration-150 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-duo-grayMedium/50"
                   >
                     重复本组
                   </button>
                   {currentGroupIndex < totalLearningGroups - 1 && (
                     <button
                       onClick={() => {
                         handleExitTearingPaperMode(); 
                         handleNextGroup(); // 切换到下一组并退出撕纸条，回到普通学习模式
                       }}
                       className="flex-1 bg-duo-white border-2 border-duo-grayMedium text-duo-grayDark font-semibold py-3 rounded-2xl hover:bg-duo-grayLight/50 transition-colors duration-150 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-duo-grayMedium/50"
                     >
                       下一组
                     </button>
                   )}
                   <button
                     onClick={() => {
                       handleExitTearingPaperMode();
                       handleStartMixedGroupTest();
                     }}
                     className="flex-1 bg-duo-green text-white font-semibold py-3 rounded-2xl hover:bg-duo-green/90 transition-colors duration-150 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-duo-green/50"
                   >
                     混组检测
                   </button>
                 </>
               )}
             </div>
           </footer>
         ) : !isInTearingPaperMode ? (
           // --- 常规学习模式的 Footer ---
           <footer className="bg-duo-white p-3 border-t-2 border-duo-grayLight shadow-inner sticky bottom-0 z-10">
             {/* Pagination Controls: Previous | Group Info | Next | TearPaper */}
             <div className="flex items-center space-x-6">
               <button
                 onClick={handlePreviousGroup}
                 disabled={currentGroupIndex === 0 || learningWords.length === 0}
                 className="flex-1 py-3 bg-duo-white border-2 border-duo-grayMedium text-duo-grayDark rounded-2xl hover:bg-duo-grayLight/50 disabled:opacity-60 disabled:cursor-not-allowed transition-all font-semibold shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-duo-grayMedium/50"
               >
                 上一组
               </button>
               
               {/* 分组信息 */}
               <div className="flex-shrink-0 px-16">
                 <span className="text-duo-textSecondary text-base font-medium whitespace-nowrap">
                    {learningWords.length > 0 ? `第 ${currentGroupIndex + 1}/${totalLearningGroups} 组` : "无学习内容"}
                 </span>
               </div>
               
               <button
                 onClick={handleNextGroup}
                 disabled={(currentGroupIndex >= totalLearningGroups - 1 || totalLearningGroups === 0) || learningWords.length === 0}
                 className="flex-1 py-3 bg-duo-white border-2 border-duo-grayMedium text-duo-grayDark rounded-2xl hover:bg-duo-grayLight/50 disabled:opacity-60 disabled:cursor-not-allowed transition-all font-semibold shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-duo-grayMedium/50"
               >
                 下一组
               </button>
               
               {/* 撕纸条按钮 */}
               <button
                 onClick={handlePlayGame}
                 disabled={learningWords.length === 0 || isInPostTestMode || isInMixedGroupTestMode}
                 className="flex-1 py-3 bg-duo-green text-white rounded-2xl hover:bg-duo-green/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all font-semibold shadow-sm hover:shadow"
                 title={
                   isInPostTestMode || isInMixedGroupTestMode ? "检测模式下不可用" : 
                   "开始撕纸条模式"
                 }
               >
                 撕纸条
               </button>
             </div>
           </footer>
         ) : null
       )}

      {/* --- 结果统计弹窗 --- */}
      {showResultModal && resultModalData && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-duo-white rounded-3xl shadow-md max-w-lg w-full mx-4 transform transition-all duration-300 scale-100">
            {/* 弹窗头部 - 简化 */}
            <div className="bg-gray-50 p-6 rounded-t-3xl text-center border-b border-gray-200">
              {/* <div className="w-20 h-20 bg-duo-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <div className="text-4xl">
                  {parseFloat(resultModalData.accuracy) >= 80 ? '🎉' : parseFloat(resultModalData.accuracy) >= 60 ? '👍' : '💪'}
                </div>
              </div> */}
              <h2 className="text-duo-textPrimary text-2xl font-bold mb-1">{resultModalData.title}</h2>
              <div className="text-duo-textSecondary text-base">
                恭喜完成检测！
              </div>
            </div>

            {/* 弹窗内容 */}
            <div className="p-8">
              {/* 准确率圆环 */}
              <div className="text-center mb-8">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <div className="w-32 h-32 rounded-full border-8 border-gray-200"></div>
                  <div 
                    className="absolute top-0 left-0 w-32 h-32 rounded-full border-8 border-duo-green border-t-transparent transform -rotate-90 transition-all duration-1000"
                    style={{
                      borderRightColor: parseFloat(resultModalData.accuracy) >= 25 ? '#58cc02' : 'transparent',
                      borderBottomColor: parseFloat(resultModalData.accuracy) >= 50 ? '#58cc02' : 'transparent',
                      borderLeftColor: parseFloat(resultModalData.accuracy) >= 75 ? '#58cc02' : 'transparent',
                    }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-duo-textPrimary">{resultModalData.accuracy}%</div>
                      <div className="text-sm text-duo-textSecondary">准确率</div>
                    </div>
                  </div>
                </div>
                
                {/* 评价文字 */}
                <div className="text-lg font-semibold text-duo-textPrimary mb-2">
                  {parseFloat(resultModalData.accuracy) >= 90 ? '完美表现！' :
                   parseFloat(resultModalData.accuracy) >= 80 ? '表现优秀！' :
                   parseFloat(resultModalData.accuracy) >= 70 ? '表现良好！' :
                   parseFloat(resultModalData.accuracy) >= 60 ? '继续努力！' : '需要加强练习！'}
                </div>
              </div>
              {/* 关闭按钮 */}
              <div className="flex justify-center">
                <button
                  onClick={handleCloseResultModal}
                  className="px-8 py-3 bg-duo-green text-duo-white font-bold rounded-2xl shadow-lg active:scale-[0.98] text-lg"
                >
                  继续学习
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- 新增：词卡检测视图 --- */}
      {showFlashcardView && flashcardWordsForView.length > 0 && (
        <FlashcardView 
          words={flashcardWordsForView} 
          onClose={() => setShowFlashcardView(false)} 
          // onWordKnown={(wordId) => console.log('Word known in flashcard:', wordId)} // 可选的回调
          // onWordUnknown={(wordId) => console.log('Word unknown in flashcard:', wordId)} // 可选的回调
        />
      )}
    </div>
  );
};

export default DuolingoPreStudyTestPage;