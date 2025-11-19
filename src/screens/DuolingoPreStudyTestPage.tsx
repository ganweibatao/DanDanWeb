import React, { useState, useEffect, useRef } from "react";
import { Volume2, CreditCard, Home } from "lucide-react";
import { Steps } from 'antd';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query'; // +++ 新增导入
import FlashcardView from '../components/FlashcardView'; // +++ 新增导入
import { useWordPronunciation } from '../hooks/useWordPronunciation';
import { splitBySyllables } from '../utils/phonics'; // 新增导入
import DuolingoStudyPlan from '../components/StudyPlan/DuolingoStudyPlan'; // +++ 新增学习计划导入
import WordSelectionComponent from '../components/WordSelection'; // +++ 新增单词选择组件导入
import { createWordStages, advanceWordStagesBatch, getWordsWithStages, WordStage, AvailableWord } from '../services/learningApi'; // +++ 新增单词阶段记录创建API导入
import { useStudentPlans } from '../hooks/useStudentPlans'; // +++ 新增学生计划hook导入
import { vocabularyService, VocabularyWord, VocabularyBook, markKnownWord, unmarkKnownWord, fetchKnownWordsCached, markKnownWordsBatch } from '../services/api'; // +++ 新增词书API服务导入
import { useAuth } from '../hooks/useAuth'; // +++ 新增认证hook导入
import { toast } from "sonner"; // Assuming you use sonner for notifications

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

// --- 新增：叉号图标 ---
const XMarkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
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
  bookWordId?: number; // 词汇书单词ID (可选，用于创建学习阶段记录)
  wordBasicId?: number; // WordBasic ID (可选，用于标记已知单词)
  // 根据实际需要添加更多字段，如发音文件URL等
}


// 转换 AvailableWord 到 Word 格式的适配器函数
const convertAvailableWordToWord = (availableWord: AvailableWord, _index: number): Word => {
  // 提取释义：从数组格式中提取实际的释义文本
  let extractedMeaning: string | undefined = undefined;
  let extractedPartOfSpeech: string | undefined = undefined;
  
  if (availableWord.meaning) {
    if (typeof availableWord.meaning === 'string') {
      extractedMeaning = availableWord.meaning;
    } else if (Array.isArray(availableWord.meaning) && availableWord.meaning.length > 0) {
      const firstMeaning = availableWord.meaning[0];
      if (typeof firstMeaning === 'object' && firstMeaning.meaning) {
        extractedMeaning = firstMeaning.meaning;
        extractedPartOfSpeech = firstMeaning.pos || undefined;
      }
    }
  }

  const result = {
    id: availableWord.id,
    text: availableWord.word,
    phonetic: availableWord.phonetic || undefined,
    meaning: extractedMeaning,
    partOfSpeech: extractedPartOfSpeech,
    examples: undefined, // AvailableWord 没有 example 字段
    bookWordId: availableWord.id, // 使用词书单词的ID作为bookWordId
    wordBasicId: availableWord.word_basic_id || undefined, // 现在有 word_basic_id 字段了
  };

  return result;
};

// 模拟数据已移除，现在系统只使用真实的词书数据

interface DuolingoPreStudyTestPageProps {}

const DuolingoPreStudyTestPage: React.FC<DuolingoPreStudyTestPageProps> = () => {
  const queryClient = useQueryClient(); // +++ 新增queryClient
  const [words, setWords] = useState<Word[]>([]);
  // 选中待记忆的单词
  const [selectedWords, setSelectedWords] = useState<Set<number>>(new Set());
  // 正在被移除的（已认识）单词，用于播放动画
  const [removingWordIds, setRemovingWordIds] = useState<Set<number>>(new Set());
  const [expandedWordIds, setExpandedWordIds] = useState<Set<number>>(new Set());
  const nextWordIdRef = useRef<number>(1000); // 从1000开始，避免与真实单词ID冲突
  const [knownWords, setKnownWords] = useState<Word[]>([]);
  const [showKnownWordsListView, setShowKnownWordsListView] = useState(false);
  const [totalKnownWordsCount, setTotalKnownWordsCount] = useState(0); // 新增：总的已掌握单词数量
  const [currentBookKnownWordsCount, setCurrentBookKnownWordsCount] = useState(0); // 新增：当前词书中的已掌握单词数量
  const [removingFromKnownIds, setRemovingFromKnownIds] = useState<Set<number>>(new Set());
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [selectedDictionary, setSelectedDictionary] = useState<'youdao' | 'eudic' | 'local'>('youdao');
  const [currentQueryWord, setCurrentQueryWord] = useState<string | null>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Added for custom click handling
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null); // For dropdown menu timing
  // --- 新增：单词列表滚动容器的ref ---
  const wordListScrollRef = useRef<HTMLDivElement>(null);

  // +++ 新增：获取学生计划数据 +++
  // 从URL参数或认证系统获取学生ID
  const { studentId: studentIdFromParams } = useParams<{ studentId: string }>();
  const location = useLocation();
  const { user, userRole, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate(); // 新增：用于跳转主页
  
  // 获取学生ID的优先级：
  // 1. URL参数中的学生ID（老师查看学生的情况）
  // 2. 当前登录学生的ID（学生自己使用的情况）
  // 3. 从URL路径中提取（兼容其他格式）
  const getStudentId = (): string | null => {
    // 优先使用URL参数
    if (studentIdFromParams) {
      return studentIdFromParams;
    }
    
    // 如果当前用户是学生，使用学生自己的ID
    if (userRole === 'student' && user?.student_profile_id) {
      return user.student_profile_id.toString();
    }
    
    // 尝试从URL路径中提取学生ID（兼容其他格式）
    const studentIdMatch = location.pathname.match(/\/students\/(\d+)/);
    if (studentIdMatch && studentIdMatch[1]) {
      return studentIdMatch[1];
    }
    
    // 最后尝试从localStorage获取
    const savedId = localStorage.getItem('lastStudentId');
    return savedId || null;
  };
  
  const studentId = getStudentId();
  const { allStudentPlans, isLoadingPlan } = useStudentPlans(studentId);
  
  // --- 新增：处理从学习计划传递的预加载单词 ---
  useEffect(() => {
    const locationState = location.state as {
      fromStudyPlan?: boolean;
      stageTitle?: string;
      stage?: number;
      planId?: number;
      vocabularyBookId?: number;
      wordTexts?: string[];
      mode?: string;
    } | null;
    
    console.log('DuolingoPreStudyTestPage - locationState:', locationState);
    
    if (locationState?.fromStudyPlan && locationState.planId) {
      // 设置当前学习计划ID
      setCurrentLearningPlanId(locationState.planId);
      currentPlanIdRef.current = locationState.planId;
      console.log('设置当前学习计划ID:', locationState.planId);
      
      // 优先设置sourceStage从location.state获取
      if (typeof locationState.stage === 'number') {
        setSourceStage(locationState.stage);
        console.log('从location.state设置sourceStage:', locationState.stage);
      }
      
      if (locationState.wordTexts && locationState.vocabularyBookId) {
        // 有具体单词列表的情况（如复习单词）
        console.log(`从学习计划加载${locationState.stageTitle}单词，需要获取 ${locationState.wordTexts.length} 个单词的完整数据`);
        
        // 从后端获取完整的单词数据，并将 mode 传递给加载函数（复习模式时直接进入学后检测）
        loadWordsFromStudyPlan(
          locationState.planId,
          locationState.vocabularyBookId,
          locationState.wordTexts,
          locationState.stageTitle!,
          locationState.mode
        );
      } else if (locationState.vocabularyBookId) {
        // 没有具体单词列表但有词库ID的情况（如学习新词）
        console.log(`从学习计划设置词库 ${locationState.vocabularyBookId}，模式: ${locationState.mode}`);
        
        // 设置词库信息，让页面使用正确的学习计划
        setCurrentVocabularyBookId(locationState.vocabularyBookId);
        setIsFromStudyPlan(true);
        
        // 调用loadVocabularyWords来加载可用单词，传入正确的planId
        loadVocabularyWords(locationState.vocabularyBookId, locationState.planId);
      }
      
      // 清理location.state以避免重复加载
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // 从学习计划加载单词的函数
  const loadWordsFromStudyPlan = async (
    planId: number,
    vocabularyBookId: number,
    wordTexts: string[],
    stageTitle: string,
    mode?: string,
  ) => {
    try {
      setIsLoadingWords(true);
      console.log(`正在从词库获取可背诵单词数据...`);
      
      // 1. 首先尝试从后台获取单词阶段信息来确定sourceStage
      try {
        console.log('正在从后台获取单词阶段信息...');
        const wordsWithStages = await getWordsWithStages(planId);
        console.log('从后台获取的单词阶段数据:', wordsWithStages);
        
        // 从后台数据中获取当前阶段信息
        if (wordsWithStages.length > 0) {
          // 检查是否有特定单词的阶段信息
          const targetWordStages = wordsWithStages.filter(ws => 
            wordTexts.includes(ws.word)
          );
          
          if (targetWordStages.length > 0) {
            // 取第一个单词的当前阶段作为sourceStage（通常同一批复习的单词阶段相同）
            const backendStage = targetWordStages[0].currentStage;
            setSourceStage(backendStage);
            console.log(`从后台数据设置sourceStage: ${backendStage}`);
          }
        }
      } catch (stageError) {
        console.warn('获取后台阶段信息失败，将使用location.state中的stage:', stageError);
        // 如果从后台获取失败，sourceStage保持从location.state设置的值
      }
      
      // 2. 使用新的批量查询API直接获取指定单词的详情
      const vocabularyWords = await vocabularyService.getWordsByTexts(vocabularyBookId, wordTexts);
      
      // 转换词库单词格式为Word格式
      const convertedWords = vocabularyWords.map(vocabWord => ({
        id: vocabWord.id,
        text: vocabWord.word,
        phonetic: vocabWord.pronunciation || undefined,  // 修复：使用pronunciation字段
        meaning: vocabWord.translation || undefined,
        partOfSpeech: vocabWord.part_of_speech || undefined,
        examples: vocabWord.example ? [vocabWord.example] : [],
        bookWordId: vocabWord.id,
        wordBasicId: vocabWord.word_basic_id || undefined,
      }));
      
      console.log(`从词库「${stageTitle}」加载了 ${convertedWords.length}/${wordTexts.length} 个可背诵单词的完整数据`);
      
      // 调试：输出第一个单词的详细信息
      if (convertedWords.length > 0) {
        console.log(`[DEBUG] 第一个单词的数据:`, {
          原始数据: vocabularyWords[0],
          转换后数据: convertedWords[0]
        });
      }
      
      // 设置单词数据
      setWords(convertedWords);
      
      // 更新词书信息
      const bookResult = await vocabularyService.getVocabularyBook(vocabularyBookId);
      setCurrentVocabularyBook(bookResult);
      setCurrentVocabularyBookId(vocabularyBookId);
      
      // 设置词书总单词数量 - 使用词书的 word_count 属性
      setTotalWordsInCurrentBook(bookResult.word_count);
      
      // 设置学习计划ID
      setCurrentLearningPlanId(planId);
      
      // 加载当前词书中已掌握的单词数量
      if (studentId) {
        await loadKnownWordsCountInBook(vocabularyBookId, parseInt(studentId));
      }
      
      // 标记为从学习计划加载的单词，不显示"加载更多单词"按钮
      setIsFromStudyPlan(true);
      setHasMoreWords(false); // 从学习计划加载的单词是固定的，没有更多单词
      
      /*
       * ---------------------- 关键改动 ----------------------
       * 当 mode === 'review' 时，表示用户从"复习单词"入口进入，
       * 需要直接进入与"学后检测"相同的流程。
       * -------------------------------------------------------
       */
      if (mode === 'review') {
        // 1. 初始化学习列表（用于后续准确统计等）
        setLearningWords(convertedWords);
        setCurrentLearningWords(convertedWords);
        // 2. 激活学习模式并直接进入学后检测视图
        setIsLearningModeActive(true);
        setIsInPostTestMode(true);
        setPostTestWords(convertedWords);
        setPostTestCorrectWords([]);
        setPostTestIncorrectWords([]);
        setAnimatingPostTestWord(null);
        setIsCurrentGroupShuffled(false);
        setOriginalWordGroupBeforeShuffle(null);
        setExpandedWordIds(new Set());
      }
      
    } catch (error) {
      console.error('从词库加载可背诵单词失败:', error);
      toast.error('加载单词数据失败，请重试');
    } finally {
      setIsLoadingWords(false);
    }
  };
  
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
  const [learningDisplayMode, setLearningDisplayMode] = useState<'both' | 'engOnly' | 'meaningOnly'>('engOnly');
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

  // --- 新增：单词选择模式相关状态 ---
  const [showWordSelection, setShowWordSelection] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState<number | null>(null);
  
  // --- 新增：当前学习会话的学习计划ID ---
  const [currentLearningPlanId, setCurrentLearningPlanId] = useState<number | null>(null);
  // 使用ref来确保能获取到最新的planId，避免异步状态更新问题
  const currentPlanIdRef = useRef<number | null>(null);
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
    incorrectWords?: Word[]; // 用于显示错误单词列表
  } | null>(null);

  // --- 新增：加载更多单词相关状态 ---
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreWords, setHasMoreWords] = useState(true); // 是否还有更多单词可以加载
  const [loadedWordsCount, setLoadedWordsCount] = useState(0); // 跟踪已加载的单词数量
  
  // --- 新增：词书单词相关状态 ---
  const [isLoadingWords, setIsLoadingWords] = useState(false);
  const [currentVocabularyBookId, setCurrentVocabularyBookId] = useState<number | null>(null);
  const [currentVocabularyBook, setCurrentVocabularyBook] = useState<VocabularyBook | null>(null);
  const [totalWordsInCurrentBook, setTotalWordsInCurrentBook] = useState(0);
  
  // --- 新增：已知单词ID状态 ---
  const [knownWordBasicIds, setKnownWordBasicIds] = useState<Set<number>>(new Set());
  const [isLoadingKnownWords, setIsLoadingKnownWords] = useState(false);

  // --- 新增：词卡检测相关状态 ---
  const [showFlashcardView, setShowFlashcardView] = useState(false);
  const [flashcardWordsForView, setFlashcardWordsForView] = useState<Word[]>([]);

  // 新增：音节拆分状态
  const [syllableSplitWords, setSyllableSplitWords] = useState<Map<number, string[]>>(new Map());

  // --- 新增：学习计划相关状态 ---
  const [showStudyPlan, setShowStudyPlan] = useState(false);
  const [studyPlanWords, setStudyPlanWords] = useState<WordStage[]>([]);
  const [isLoadingStudyPlanWords, setIsLoadingStudyPlanWords] = useState(false);
  
  // --- 新增：标识是否从学习计划加载单词 ---
  const [isFromStudyPlan, setIsFromStudyPlan] = useState(false);

  // --- 新增：选择单词模式下的状态 ---
  const [isWordListShuffled, setIsWordListShuffled] = useState(false);
  const [originalWordListBeforeShuffle, setOriginalWordListBeforeShuffle] = useState<Word[] | null>(null);
  const [wordListDisplayMode, setWordListDisplayMode] = useState<'both' | 'engOnly' | 'meaningOnly'>('engOnly');
  const [isWordListDisplayModeDropdownOpen, setIsWordListDisplayModeDropdownOpen] = useState(false);

  // --- 新增：已掌握单词列表状态 ---
  const [isKnownWordsShuffled, setIsKnownWordsShuffled] = useState(false);
  const [originalKnownWordsBeforeShuffle, setOriginalKnownWordsBeforeShuffle] = useState<Word[] | null>(null);
  const [knownWordsDisplayMode, setKnownWordsDisplayMode] = useState<'both' | 'engOnly' | 'meaningOnly'>('engOnly');
  const [isKnownWordsDisplayModeDropdownOpen, setIsKnownWordsDisplayModeDropdownOpen] = useState(false);

  // --- 新增：标记当前撕纸条分组是否已推进阶段 ---
  const [hasAdvancedStageForCurrentGroup, setHasAdvancedStageForCurrentGroup] = useState(false);
  // 新增：记录已经推进过的"学习阶段"（stage 0）分组索引
  const advancedLearningGroupsRef = useRef<Set<number>>(new Set());

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

  const handleMenuItemClick = async (menuItem: string) => {
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
        
        const activePlan = allStudentPlans?.find(p => p.is_active) || (allStudentPlans && allStudentPlans.length > 0 ? allStudentPlans[0] : null);

        if (activePlan) {
            setIsLoadingStudyPlanWords(true);
            setShowStudyPlan(true); // Show the modal with a loader first
            try {
                const words = await getWordsWithStages(activePlan.id);
                setStudyPlanWords(words);
            } catch (error) {
                console.error("Failed to fetch words with stages:", error);
                // Optionally show an error to the user
            } finally {
                setIsLoadingStudyPlanWords(false);
            }
        } else {
            // No active plan, maybe just show the empty plan view
             setShowStudyPlan(true);
             setStudyPlanWords([]); // Ensure words are cleared
        }
        
        setIsMenuCollapsed(true); // 自动收起菜单
        break;
      case 'settings': {
        // 循环切换字体大小档位
        const currentIndex = fontScaleValues.indexOf(fontScale);
        const nextIndex = (currentIndex + 1) % fontScaleValues.length;
        const newScale = fontScaleValues[nextIndex];
        setFontScale(newScale);
        toast.success(`已切换字体大小：${nextIndex === 0 ? '小' : nextIndex === 1 ? '中' : '大'}`);
        break;
      }
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
    // 检查学习计划并智能选择要使用的计划
    const checkActiveStudentPlans = async () => {
      // 如果没有学生ID，显示空状态
      if (!studentId) {
        console.log('没有学生ID，显示空状态');
        clearWordsData();
        return;
      }
      
      // 如果认证状态还在加载中，等待
      if (isAuthLoading) {
        console.log('认证状态加载中，等待...');
        return;
      }

      // 新增：如果已经有学习计划ID（从学习计划页面跳转来的），就不要自动覆盖
      if (currentLearningPlanId) {
        console.log('已有学习计划ID，跳过自动加载:', currentLearningPlanId);
        return;
      }

      // 不在这里预先加载所有已知单词，而是在具体词书选定后再加载

      if (allStudentPlans && allStudentPlans.length > 0) {
        // 优先查找活跃的学习计划
        const activePlan = allStudentPlans.find(plan => plan.is_active);
        if (activePlan) {
          console.log('发现活跃学习计划，加载词书单词:', activePlan);
          console.log('设置学习计划ID为:', activePlan.id);
          setCurrentLearningPlanId(activePlan.id);
          Promise.all([
            loadVocabularyWords(activePlan.vocabulary_book.id, activePlan.id),
            loadKnownWordsCountInBook(activePlan.vocabulary_book.id, Number(studentId))
          ]);
          return;
        }
        
        // 如果没有活跃计划但只有一个计划，默认使用那个计划
        if (allStudentPlans.length === 1) {
          const singlePlan = allStudentPlans[0];
          console.log('只有一个学习计划，默认使用该计划:', singlePlan);
          console.log('设置学习计划ID为:', singlePlan.id);
          setCurrentLearningPlanId(singlePlan.id);
          Promise.all([
            loadVocabularyWords(singlePlan.vocabulary_book.id, singlePlan.id),
            loadKnownWordsCountInBook(singlePlan.vocabulary_book.id, Number(studentId))
          ]);
          return;
        }
        
        // 如果有多个非活跃计划，提示用户选择
        console.log('有多个学习计划但无活跃计划，显示空状态');
      }
      
      // 如果没有计划或有多个非活跃计划，显示空状态
      clearWordsData();
    };

    // 在获取到学生ID且不在加载状态时执行检查
    if (studentId && !isLoadingPlan) {
      checkActiveStudentPlans();
    } else if (!studentId && !isAuthLoading) {
      // 如果没有学生ID且认证已完成，直接使用模拟数据
      checkActiveStudentPlans();
    }

    // Cleanup for timeouts on component unmount
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, [allStudentPlans, studentId, isAuthLoading, isLoadingPlan, studentIdFromParams, location.pathname, currentLearningPlanId]); // 新增currentLearningPlanId到依赖项

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
  const handleToggleSelect = async (wordId: number) => {
    const isCurrentlySelected = selectedWords.has(wordId);
    
    if (isCurrentlySelected) {
      // 取消勾选 - 只更新选择状态，不标记为已知
      setSelectedWords(prev => {
        const newSelected = new Set(prev);
        newSelected.delete(wordId);
        return newSelected;
      });
    } else {
      // 勾选
      setSelectedWords(prev => {
        const newSelected = new Set(prev);
        newSelected.add(wordId);
        return newSelected;
      });
    }
  };


  const handleMarkUnknown = async (wordId: number) => {
    const wordToUnmark = knownWords.find(w => w.id === wordId);
    if (!wordToUnmark) return;

    // 先调用后端API取消已知标记
    const currentStudentId = getStudentId();
    if (currentStudentId && wordToUnmark.wordBasicId) {
      try {
        await unmarkKnownWord(Number(currentStudentId), wordToUnmark.wordBasicId);
        console.log(`成功取消单词 "${wordToUnmark.text}" 的已知标记`);
      } catch (error: any) {
        console.error('取消单词已知标记失败:', error);
        console.warn(`取消单词 "${wordToUnmark.text}" 的已知标记时出错，但继续执行UI操作`);
        // 如果需要，可以在这里添加用户友好的错误提示
        // 例如：toast.error('网络错误，单词状态可能未同步到服务器');
      }
    } else {
      console.warn('无法取消单词已知标记：缺少学生ID或单词基础ID');
    }

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

      // 更新已知单词ID集合和当前词书的已掌握单词计数
      if (wordToUnmark.wordBasicId) {
        setKnownWordBasicIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(wordToUnmark.wordBasicId!);
          return newSet;
        });
        // 更新当前词书的已掌握单词计数
        setCurrentBookKnownWordsCount(prev => Math.max(0, prev - 1));
      }
    }, 400);
  };

  const handleStartMemorizing = async () => {
    const wordsToMemorize = words.filter(word => selectedWords.has(word.id));
    if (wordsToMemorize.length === 0) {
      alert("请至少选择一个单词开始学习！");
      return;
    }
    console.log("开始识记这些单词:", wordsToMemorize);
    
    // --- 新增：如果有学习计划ID，则为选中的单词创建学习阶段记录 ---
    const planId = currentPlanIdRef.current || currentLearningPlanId;
    if (planId) {
      try {
        console.log("正在为选中的单词创建学习阶段记录...");
        console.log("当前学习计划ID:", planId);
        console.log("所有学生计划:", allStudentPlans);
        console.log("当前学生ID:", studentId);
        
        // 验证学习计划是否仍然存在
        const planExists = allStudentPlans?.find(plan => plan.id === planId);
        if (!planExists) {
          console.warn("警告：当前学习计划ID在学生计划中未找到，可能已被删除");
          
          // 尝试重新获取最新的学习计划数据
          try {
            console.log("尝试重新获取学习计划数据...");
            await queryClient.refetchQueries({ queryKey: ['studentPlans', Number(studentId)] });
            
            // 重新检查
            const freshPlans = queryClient.getQueryData(['studentPlans', Number(studentId)]) as any[];
            const freshPlanExists = freshPlans?.find(plan => plan.id === planId);
            
            if (!freshPlanExists) {
              console.error("重新获取后仍未找到学习计划，清除无效的学习计划ID");
              setCurrentLearningPlanId(null);
              currentPlanIdRef.current = null;
              alert("学习计划已被删除，请重新选择学习计划");
              return;
            } else {
              console.log("重新获取后找到了学习计划，继续执行");
            }
          } catch (refreshError) {
            console.error("重新获取学习计划数据失败:", refreshError);
            setCurrentLearningPlanId(null);
            alert("无法验证学习计划状态，请刷新页面重试");
            return;
          }
        }
        
        // 假设每个 word 对象有一个 bookWordId 属性，如果没有则使用 id
        // 需要根据实际数据结构调整
        const bookWordIds = wordsToMemorize.map(word => word.bookWordId || word.id);
        console.log("要创建阶段记录的单词ID:", bookWordIds);
        
        await createWordStages(planId, bookWordIds);
        // 刷新学习计划数据，使"待学"数量即时更新
        queryClient.invalidateQueries({ queryKey: ['wordsWithStages', planId] });
        console.log("单词学习阶段记录创建成功");
      } catch (error: any) {
        console.error("创建单词学习阶段记录失败:", error);
        console.error("错误详情:", {
          message: error.message,
          response: error.response,
          status: error.response?.status,
          data: error.response?.data
        });
        
        // 如果是404错误，提供更具体的信息
        if (error.response?.status === 404) {
          alert(`API端点不存在 (404)。请检查后端服务器是否正常运行，以及API路由是否正确配置。\n调用的URL: learning/plans/${planId}/create_word_stages/`);
        } else {
          alert(`创建学习记录失败 (状态码: ${error.response?.status || '未知'})，但可以继续学习`);
        }
      }
    } else {
      console.log("没有当前学习计划ID，跳过创建学习阶段记录");
    }
    
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

  // --- 新增：已掌握单词列表的打乱顺序处理
  const handleShuffleKnownWords = () => {
    if (knownWords.length === 0) {
      return;
    }

    if (!isKnownWordsShuffled) {
      // 执行乱序
      setOriginalKnownWordsBeforeShuffle([...knownWords]);
      
      const shuffledWords = [...knownWords];
      for (let i = shuffledWords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledWords[i], shuffledWords[j]] = [shuffledWords[j], shuffledWords[i]];
      }
      
      setKnownWords(shuffledWords);
      setIsKnownWordsShuffled(true);
    } else {
      // 恢复顺序
      if (originalKnownWordsBeforeShuffle) {
        setKnownWords([...originalKnownWordsBeforeShuffle]);
        setIsKnownWordsShuffled(false);
        setOriginalKnownWordsBeforeShuffle(null);
      } else {
        setIsKnownWordsShuffled(false);
      }
    }
  };

  // --- 新增：已掌握单词列表的显示模式处理
  const handleSelectKnownWordsDisplayMode = (mode: 'both' | 'engOnly' | 'meaningOnly') => {
    // 清除下拉菜单定时器
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setKnownWordsDisplayMode(mode);
    setIsKnownWordsDisplayModeDropdownOpen(false);
    // 切换显示模式时清空所有展开状态
    setExpandedWordIds(new Set());
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
      // 双击时不改变释义状态，让双击处理器直接处理
      // 不调用 toggleMeaning，保持释义状态不变
    } else {
      // 单击立即切换释义状态
      toggleMeaning(wordId);
      // 设置一个短延迟来检测是否是双击的一部分
      clickTimeoutRef.current = setTimeout(() => {
        clickTimeoutRef.current = null; // 重置定时器引用
      }, 200); // 保留检测双击的窗口期
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
          id: wordFromLists?.id || wordFromLists?.bookWordId, // 添加单词ID
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

  const handleSaveLocalDefinition = async () => {
    if (currentQueryWord && editingBuffer) {
      // 检查当前词汇书是否为系统预设书籍
      if (currentVocabularyBook?.is_system_preset) {
        alert('系统预设词库不允许修改，请选择自定义词库进行编辑。');
        return;
      }
      
      const definitionToSave = { ...editingBuffer };
      // Ensure text field is present, even if not directly edited in this form
      if (!definitionToSave.text) {
        definitionToSave.text = currentQueryWord;
      }

      try {
        // 1. 更新本地状态
        const oldWordText = currentQueryWord;
        const newWordText = definitionToSave.text || currentQueryWord;
        
        // 更新单词列表（words 和 knownWords）
        const updateWordInList = (wordList: Word[]) => {
          return wordList.map(word => {
            if (word.text === oldWordText) {
              return {
                ...word,
                text: newWordText,
                phonetic: definitionToSave.phonetic || word.phonetic,
                meaning: definitionToSave.meaning || word.meaning,
                partOfSpeech: definitionToSave.partOfSpeech || word.partOfSpeech,
                examples: definitionToSave.examples || word.examples,
              };
            }
            return word;
          });
        };

        setWords(prev => updateWordInList(prev));
        setKnownWords(prev => updateWordInList(prev));

        // 同时更新学习模式下的相关状态
        if (isLearningModeActive) {
          setLearningWords(prev => updateWordInList(prev));
          setCurrentLearningWords(prev => updateWordInList(prev));
          
          // 更新各种检测模式下的单词列表
          if (isInTearingPaperMode) {
            setTearingPaperWords(prev => updateWordInList(prev));
            setClippedKnownWords(prev => updateWordInList(prev));
            setClippedUnknownWords(prev => updateWordInList(prev));
          }
          
          if (isInPostTestMode) {
            setPostTestWords(prev => updateWordInList(prev));
            setPostTestCorrectWords(prev => updateWordInList(prev));
            setPostTestIncorrectWords(prev => updateWordInList(prev));
          }
          
          if (isInMixedGroupTestMode) {
            setMixedTestWords(prev => updateWordInList(prev));
            setMixedTestCorrectWords(prev => updateWordInList(prev));
            setMixedTestIncorrectWords(prev => updateWordInList(prev));
          }
        }

        // 2. 更新本地释义缓存（使用新的单词文本作为key）
        setLocalDefinitions(prev => {
          const updated = { ...prev };
          // 如果单词文本改变了，删除旧的key并添加新的
          if (oldWordText !== newWordText) {
            delete updated[oldWordText];
          }
          updated[newWordText] = definitionToSave;
          return updated;
        });

        // 3. 更新词库中的原始单词数据
        if (editingBuffer.id) {
          try {
            await vocabularyService.updateVocabularyWord(editingBuffer.id, {
              word: definitionToSave.text,
              translation: definitionToSave.meaning,
              phonetic: definitionToSave.phonetic,
              part_of_speech: definitionToSave.partOfSpeech,
              example: definitionToSave.examples && definitionToSave.examples.length > 0 
                ? definitionToSave.examples[0] 
                : undefined,
            });
            console.log('词库单词已更新');
          } catch (backendError) {
            console.error('更新词库单词失败:', backendError);
            // 即使后端保存失败，前端修改仍然生效
            alert('保存到服务器失败，但本地修改已生效');
          }
        } else {
          console.log('没有单词ID，跳过后端保存');
        }

        // 4. 更新当前显示的释义和查询词
        setCurrentLocalDefinition(definitionToSave);
        setCurrentQueryWord(newWordText); // 更新查询词为新的单词文本
        setIsEditingLocal(false);
        setEditingBuffer(null);

        console.log('单词编辑已保存:', {
          oldText: oldWordText,
          newText: newWordText,
          definition: definitionToSave
        });

      } catch (error) {
        console.error('保存单词编辑失败:', error);
        alert('保存失败，请重试');
      }
    }
  };

  const handleCancelEditLocal = () => {
    setIsEditingLocal(false);
    setEditingBuffer(null); // Or reset to currentLocalDefinition if preferred
  };

  const selectedCount = selectedWords.size;

  const toggleShowKnownWordsListView = () => {
    setShowKnownWordsListView(prev => {
      const newValue = !prev;
      
      // 如果是第一次显示已掌握单词列表，并且有当前词书ID和学生ID，则加载已掌握单词数据
      if (newValue && currentVocabularyBookId && studentId && knownWords.length === 0) {
        console.log('第一次显示已掌握单词列表，开始加载数据...');
        loadKnownWordsCountInBook(currentVocabularyBookId, Number(studentId));
      }
      
      return newValue;
    });
    setExpandedWordIds(new Set()); // 切换视图时清空展开状态
  };

  // --- 新增：加载更多单词的函数 ---
  const handleLoadMoreWords = async () => {
    if (isLoadingMore || !hasMoreWords) return; // 防止重复点击和没有更多单词时的加载
    
    // 保存当前滚动位置
    const scrollContainer = wordListScrollRef.current;
    const savedScrollTop = scrollContainer?.scrollTop || 0;
    
    setIsLoadingMore(true);
    
    if (currentVocabularyBookId && currentLearningPlanId) {
      // 如果当前正在使用词书，加载词书的下一批20个单词
      await loadVocabularyWords(currentVocabularyBookId, currentLearningPlanId, false);
    } else {
      // 如果使用模拟数据，生成新的模拟单词
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
    }
    
    setIsLoadingMore(false);
    
    // 恢复滚动位置，使用requestAnimationFrame确保DOM更新后再执行
    requestAnimationFrame(() => {
      if (scrollContainer) {
        scrollContainer.scrollTop = savedScrollTop;
      }
    });
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
    setHasAdvancedStageForCurrentGroup(false); // 进入新组时重置阶段推进标记
    setExpandedWordIds(new Set()); // 收起所有展开的释义
    // alert("开始混组检测！(功能待实现)"); // 这句可以去掉了
  };

  // --- 新增：学后检测相关函数 ---
  const handleStartPostTest = () => {
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
    // 获取当前组和之前组的单词
    const endIndex = (currentGroupIndex + 1) * WORDS_PER_GROUP;
    const startIndex = currentGroupIndex * WORDS_PER_GROUP;
    const currentGroupWords = learningWords.slice(startIndex, endIndex);
    const previousWords = learningWords.slice(0, startIndex);

    if (currentGroupWords.length === 0) {
      alert("当前组没有单词，无法进行混组检测。");
      return;
    }

    const allLearnedWords = learningWords.slice(0, endIndex);
    const totalTestSize = Math.min(5, allLearnedWords.length);
    let selectedWords: Word[] = [];

    // 1. 保证当前组至少有一个
    const shuffledCurrent = [...currentGroupWords].sort(() => 0.5 - Math.random());
    selectedWords.push(shuffledCurrent[0]);

    // 2. 保证之前组至少有一个
    const shuffledPrevious = [...previousWords].sort(() => 0.5 - Math.random());
    selectedWords.push(shuffledPrevious[0]);

    // 3. 从剩下所有学过的单词中（排除已选中的），随机选出剩余的
    const remainingWords = allLearnedWords.filter(w => !selectedWords.find(sw => sw.id === w.id));
    const shuffledRemaining = remainingWords.sort(() => 0.5 - Math.random());

    const numToFill = totalTestSize - selectedWords.length;
    if (numToFill > 0) {
      selectedWords.push(...shuffledRemaining.slice(0, numToFill));
    }
    
    const finalWords = selectedWords.sort(() => Math.random() - 0.5);

    console.log("开始混组检测，随机选择的单词:", finalWords);
    
    setIsInMixedGroupTestMode(true);
    setMixedTestWords(finalWords);
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

  // --- 新增：重新评定混组检测中的错误单词 ---
  const handleRejudgeMixedIncorrectWord = (wordId: number, toCorrect: boolean) => {
    // 如果用户在错误列表再次选择"正确"，将该单词从错误列表移至正确列表
    if (!toCorrect) return; // 依然标记为错误则无需处理
    const word = mixedTestIncorrectWords.find(w => w.id === wordId);
    if (!word) return;
    setMixedTestIncorrectWords(prev => prev.filter(w => w.id !== wordId));
    setMixedTestCorrectWords(prev => [...prev, word]);
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
      accuracy,
      incorrectWords: mixedTestIncorrectWords
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

  // --- 新增：重新评定学后检测中的错误单词 ---
  const handleRejudgePostIncorrectWord = (wordId: number, toCorrect: boolean) => {
    // 如果用户在错误列表再次选择"正确"，将该单词从错误列表移至正确列表
    if (!toCorrect) return; // 依然标记为错误则无需处理
    const word = postTestIncorrectWords.find(w => w.id === wordId);
    if (!word) return;
    setPostTestIncorrectWords(prev => prev.filter(w => w.id !== wordId));
    setPostTestCorrectWords(prev => [...prev, word]);
  };

  const handleSubmitPostTest = async () => {
    const correctCount = postTestCorrectWords.length;
    const incorrectCount = postTestIncorrectWords.length;
    const totalCount = correctCount + incorrectCount;
    const accuracy = totalCount > 0 ? (correctCount / totalCount * 100).toFixed(1) : '0';
    
    console.log('handleSubmitPostTest - 当前状态:', {
      sourceStage,
      isFromStudyPlan,
      currentLearningPlanId,
      postTestCorrectWords: postTestCorrectWords.length,
      postTestIncorrectWords: postTestIncorrectWords.length
    });
    
    setResultModalData({
      title: '学后检测完成！',
      correctCount,
      incorrectCount,
      totalCount,
      accuracy,
      incorrectWords: postTestIncorrectWords
    });
    setShowResultModal(true);
    
    // 如果是学习计划中的提前复习，需要将本次检测的单词推进到下一阶段
    if (isFromStudyPlan && currentLearningPlanId) {
      try {
        const reviewed = [...postTestCorrectWords, ...postTestIncorrectWords];
        const bookWordIds = reviewed.map(w => w.bookWordId).filter((id): id is number => !!id);

        if (bookWordIds.length > 0) {
          // 1) 先推进学习阶段
          await advanceWordStagesBatch(currentLearningPlanId, bookWordIds);

          // 2) 如果是第5轮复习，则批量标记为已掌握
          if (sourceStage === 5) {
            const wordBasicIds = reviewed
              .map(w => w.wordBasicId)
              .filter((id): id is number => typeof id === 'number');

            const currentStudentId = getStudentId();
            if (currentStudentId && wordBasicIds.length > 0) {
              try {
                console.log('开始调用markKnownWordsBatch接口...');
                await markKnownWordsBatch(Number(currentStudentId), wordBasicIds);
                console.log(`✅ 已批量标记 ${wordBasicIds.length} 个单词为已掌握`);
              } catch (err) {
                console.error('❌ 批量标记已掌握单词失败:', err);
              }
            } else {
              console.warn('跳过批量标记：缺少必要条件', { currentStudentId, wordBasicIdsCount: wordBasicIds.length });
            }
          } else {
            console.log(`跳过批量标记：不是stage5复习 (当前sourceStage=${sourceStage})`);
          }

          queryClient.invalidateQueries({ queryKey: ['wordsWithStages', currentLearningPlanId] });
        }
      } catch (err) {
        console.error('提前复习阶段推进失败:', err);
      }
    }

    // 提交后跳转到学生页面
    const currentStudentId = getStudentId();
    const planId = currentLearningPlanId;
    if (currentStudentId && planId) {
      navigate(`/students/${currentStudentId}?planId=${planId}`);
    }
    // 可以在这里添加提交到服务器的逻辑
  };

  // --- 新增：退出撕纸条模式的函数 ---
  const handleExitTearingPaperMode = async () => {
    const planId = currentPlanIdRef.current || currentLearningPlanId;
    if (tearingPaperWords.length === 0 && planId) {
      const wordsToAdvance = [...clippedKnownWords, ...clippedUnknownWords];
      const bookWordIds = wordsToAdvance.map(w => w.bookWordId).filter((id): id is number => !!id);

      if (bookWordIds.length > 0) {
        // 判断当前组是否仍处于学习阶段（stage 0）
        const isLearningStageGroup = currentWordGroup.every((w: any) => w.currentStage === 0 || w.currentStage === undefined);
        const alreadyAdvanced = advancedLearningGroupsRef.current.has(currentGroupIndex);
        const shouldAdvance = (!isLearningStageGroup) || (isLearningStageGroup && !alreadyAdvanced);

        if (shouldAdvance) {
          try {
            await advanceWordStagesBatch(planId, bookWordIds);

            // 如需批量标记已掌握（stage 5），检查 sourceStage
            if (sourceStage === 5) {
              const wordBasicIds = wordsToAdvance
                .map(w => w.wordBasicId)
                .filter((id): id is number => typeof id === 'number');
              const currentStudentId = getStudentId();
              if (currentStudentId && wordBasicIds.length > 0) {
                await markKnownWordsBatch(Number(currentStudentId), wordBasicIds).catch(err => console.error('批量标记已掌握单词失败:', err));
              }
            }

            queryClient.invalidateQueries({ queryKey: ['wordsWithStages', planId] });
            console.log('阶段推进成功');
            if (isLearningStageGroup) {
              advancedLearningGroupsRef.current.add(currentGroupIndex);
              setHasAdvancedStageForCurrentGroup(true);
            }
          } catch (err) {
            console.error('阶段推进失败:', err);
          }
        }
      }
    }

    setIsInTearingPaperMode(false);
    setTearingPaperWords([]);
    setClippedKnownWords([]);
    setClippedUnknownWords([]);
    setAnimatingClipWord(null);
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


  const handleWordsSelected = (selectedWordIds: number[]) => {
    console.log('选中的单词ID:', selectedWordIds);
    // 这里可以添加后续逻辑，比如导航到学习页面
    setShowWordSelection(false);
    // 可以在这里触发一些学习开始的逻辑
  };

  const handleCancelWordSelection = () => {
    setShowWordSelection(false);
    setCurrentPlanId(null);
  };

  // --- 新增：全部选择/取消全部功能 ---
  const handleSelectAll = () => {
    const allWordIds = new Set(words.map(word => word.id));
    setSelectedWords(allWordIds);
  };

  const handleDeselectAll = () => {
    setSelectedWords(new Set());
  };

  // --- 新增：处理叉号点击（标记为已知） ---
  const handleMarkAsKnown = async (wordId: number) => {
    if (removingWordIds.has(wordId)) return; // 防止重复操作
    
    const wordToMarkKnown = words.find(w => w.id === wordId);
    if (wordToMarkKnown) {
      // 调用后端API标记单词为已知
      const currentStudentId = getStudentId();
      if (currentStudentId && wordToMarkKnown.wordBasicId) {
        try {
          await markKnownWord(Number(currentStudentId), wordToMarkKnown.wordBasicId);
          console.log(`成功标记单词 "${wordToMarkKnown.text}" 为已知`);
        } catch (error: any) {
          // 检查是否是重复标记的错误
          const errorData = error.response?.data;
          const isUniqueConstraintError = errorData?.non_field_errors?.some((msg: string) => 
            msg.includes('The fields student, word must make a unique set')
          );
          
          if (isUniqueConstraintError) {
            console.log(`单词 "${wordToMarkKnown.text}" 已经被标记为已知，开始重新标记...`);
            try {
              // 先取消标记
              await unmarkKnownWord(Number(currentStudentId), wordToMarkKnown.wordBasicId);
              console.log(`成功取消单词 "${wordToMarkKnown.text}" 的已知标记`);
              
              // 然后重新标记
              await markKnownWord(Number(currentStudentId), wordToMarkKnown.wordBasicId);
              console.log(`成功重新标记单词 "${wordToMarkKnown.text}" 为已知`);
            } catch (remarkerError: any) {
              console.error('重新标记单词失败:', remarkerError);
              console.warn(`重新标记单词 "${wordToMarkKnown.text}" 时出错，但继续执行UI操作`);
            }
          } else {
            console.error('标记单词为已知失败:', error);
            console.warn(`标记单词 "${wordToMarkKnown.text}" 为已知时出错，但继续执行UI操作`);
          }
        }
      } else {
        console.warn('无法标记单词为已知：缺少学生ID或单词基础ID');
        console.log('调试信息:', {
          studentId: currentStudentId,
          wordId: wordId,
          wordToMarkKnown: wordToMarkKnown,
          wordBasicId: wordToMarkKnown?.wordBasicId,
          wordsState: words.slice(0, 3) // 只显示前3个单词作为样例
        });
        
        if (!currentStudentId) {
          console.error('学生ID获取失败，请检查登录状态或URL参数');
        }
        
        if (currentStudentId && (!wordToMarkKnown?.wordBasicId)) {
          console.error(`单词 "${wordToMarkKnown?.text}" 缺少基础ID，无法标记为已知`);
          console.log('这可能是数据同步问题，单词数据:', wordToMarkKnown);
        }
      }
      
      // 添加到已掌握列表
      setKnownWords(prevKnownWords => {
        if (prevKnownWords.find(kw => kw.id === wordId)) {
          return prevKnownWords;
        }
        return [...prevKnownWords, wordToMarkKnown];
      });
      
      // 更新已知单词ID集合
      if (wordToMarkKnown.wordBasicId) {
        setKnownWordBasicIds(prev => new Set(prev).add(wordToMarkKnown.wordBasicId!));
        // 更新当前词书的已掌握单词计数
        setCurrentBookKnownWordsCount(prev => prev + 1);
      }
    }
    
    // 从选中列表中移除
    setSelectedWords(prev => {
      const newSelected = new Set(prev);
      newSelected.delete(wordId);
      return newSelected;
    });
    
    // 触发滑出动画
    setTimeout(() => {
      setRemovingWordIds(prev => {
        const newSet = new Set(prev);
        newSet.add(wordId);
        return newSet;
      });

      // 滑出动画结束后真正移除单词
      setTimeout(async () => {
        setWords(prevWords => {
          return prevWords.filter(w => w.id !== wordId);
        });

        // 从移除列表里删除
        setRemovingWordIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(wordId);
          return newSet;
        });
      }, 400); // 滑出动画时长
    }, 150); // 延迟150ms开始滑出动画
  };


  // --- 新增：加载词书单词的函数 ---
  const loadVocabularyWords = async (vocabularyBookId: number, planId?: number, loadAll: boolean = false) => {
    if (isLoadingWords) return;
    setIsLoadingWords(true);
    
    try {
      // 使用传入的 planId 或者当前的 currentLearningPlanId
      const targetPlanId = planId || currentLearningPlanId;
      if (!targetPlanId) {
        console.error('无法加载词汇：缺少学习计划ID');
        toast.error('缺少学习计划信息，无法加载单词');
        clearWordsData();
        return;
      }

      // 1. 获取可用单词及其状态 - 如果不是加载全部，则默认限制为20个
      const limit = loadAll ? undefined : 20;
      const offset = loadAll ? undefined : words.length; // 如果是加载更多，从当前单词数开始，首次加载时words.length为0
      
      const response = await vocabularyService.getAvailableWords(targetPlanId, limit, offset);
      const allAvailableWords = response.words;
      
      // 添加调试信息
      console.log(`[loadVocabularyWords] API返回 ${allAvailableWords.length} 个可学习单词`);
      console.log(`[loadVocabularyWords] 前5个单词:`, allAvailableWords.slice(0, 5).map(w => ({
        id: w.id,
        word: w.word
      })));
      
      // 后端已经筛选过，所有返回的单词都是可学习的，直接转换格式
      const convertedWords = allAvailableWords.map(convertAvailableWordToWord);

      // 4. 更新状态
      if (loadAll || words.length === 0) {
        // 首次加载或加载全部时，直接设置单词列表
        setWords(convertedWords);
        // 默认不选择任何单词
        setSelectedWords(new Set()); 
      } else {
        // 加载更多时，追加到现有列表
        setWords(prevWords => [...prevWords, ...convertedWords]);
        // 新加载的单词默认不选中，保持现有选择状态
        // setSelectedWords 保持不变
      }
      
      // 重置学习计划标识，因为这是常规的词书加载
      setIsFromStudyPlan(false);
      
      // 更新词书信息
      const bookResult = await vocabularyService.getVocabularyBook(vocabularyBookId);
      setCurrentVocabularyBook(bookResult);
      setCurrentVocabularyBookId(vocabularyBookId); // 设置当前词书ID
      setTotalWordsInCurrentBook(response.all_words_count); // 使用 all_words_count 显示词书总数
      setCurrentBookKnownWordsCount(response.known_in_book_count);
      
      // 检查是否还有更多单词可以加载
      const currentWordsCount = loadAll || words.length === 0 ? convertedWords.length : words.length + convertedWords.length;
      const returnedWordsCount = response.words.length;
      // 如果返回的单词数等于请求的限制数，且当前总数小于总可用数，则可能还有更多
      setHasMoreWords(
        !loadAll && 
        currentWordsCount < response.total_count && // 这里继续使用 total_count 判断是否还有"可加载"的单词
        returnedWordsCount === (limit || 20)
      );

      console.log(`[loadVocabularyWords] 加载了 ${convertedWords.length} 个新单词，当前总数: ${currentWordsCount}，词书总数: ${response.all_words_count}`);

    } catch (error) {
      console.error('加载词书单词失败:', error);
      toast.error('加载可选单词列表失败');
      clearWordsData();
    } finally {
      setIsLoadingWords(false);
    }
  };

  // fetchAdditionalWords 函数已被移除，因为现在统一使用 available_words API

  const clearWordsData = () => {
    // 清空所有单词数据，显示空列表状态
    setWords([]);
    setSelectedWords(new Set());
    setKnownWords([]);
    setKnownWordBasicIds(new Set()); // 清空已知单词ID集合
    setTotalKnownWordsCount(0); // 清空已掌握单词总数
    setCurrentBookKnownWordsCount(0); // 清空当前词书已掌握单词数量
    setLoadedWordsCount(0);
    setCurrentVocabularyBookId(null);
    setCurrentVocabularyBook(null);
    setTotalWordsInCurrentBook(0);
    setHasMoreWords(false);
    setIsFromStudyPlan(false); // 重置学习计划标识
    console.log('没有找到学习计划或词书数据，请先创建学习计划');
  };

  // --- 新增：从学习计划开始学习的处理函数 ---
  const handleStartLearningFromPlan = async (planId: number, vocabularyBookId: number) => {
    console.log('从学习计划开始学习:', { planId, vocabularyBookId });
    
    // 设置当前学习计划ID
    setCurrentLearningPlanId(planId);
    
    // 关闭学习计划界面
    setShowStudyPlan(false);
    
    // 加载对应词书的单词，传入正确的 planId
    await loadVocabularyWords(vocabularyBookId, planId);
    
    console.log(`已切换到词书 ID: ${vocabularyBookId} 的单词选择界面`);
  };

  // --- 新增：加载当前词书中所有已掌握的单词 ---
  const loadKnownWordsCountInBook = async (bookId: number, studentId: number) => {
    if (isLoadingKnownWords) return;

    console.log(`[KnownWords] 开始加载词书 ${bookId} 中已掌握的单词数量和列表...`);
    setIsLoadingKnownWords(true);
    setCurrentBookKnownWordsCount(0); // 重置计数
    setKnownWords([]); // 重置已掌握单词列表

    try {
      // 统一使用 fetchKnownWordsCached(studentId, bookId) 调用 known-words/?student=XX&book=XX
      console.log(`[KnownWords] 调用 API: known-words/?student=${studentId}&book=${bookId}`);
      const response = await fetchKnownWordsCached(studentId, bookId);
      const knownCount = response.count || 0;
      console.log(`[KnownWords] 加载完成，在词书 ${bookId} 中共找到 ${knownCount} 个已掌握的单词。`);
      
      // 设置当前词书的已掌握单词数量
      setCurrentBookKnownWordsCount(knownCount);
      
      // 设置总的已掌握单词数量（这里用当前词书的数量，如果需要总数需要另外调用）
      setTotalKnownWordsCount(knownCount);

      // 更新已知单词ID集合和详细信息
      if (response.results && response.results.length > 0) {
        const knownWordBasicIds = new Set(response.results.map(item => item.word));
        setKnownWordBasicIds(knownWordBasicIds);
        console.log(`[KnownWords] 设置了 ${knownWordBasicIds.size} 个已掌握单词的ID`);
        
        // 转换为Word格式
        const knownWordsData = response.results.map((item, index) => ({
          id: item.word, // 使用word_basic_id作为ID
          text: item.word_text || '',
          phonetic: item.phonetic || '',
          meaning: item.meaning || '',
          partOfSpeech: item.part_of_speech || '',
          examples: item.example_sentence ? [item.example_sentence] : [],
          wordBasicId: item.word,
        }));
        
        setKnownWords(knownWordsData);
        console.log(`[KnownWords] 设置了 ${knownWordsData.length} 个已掌握单词的详细信息`);
      } else {
        setKnownWordBasicIds(new Set());
        setKnownWords([]);
      }
    } catch (error) {
      console.error(`[KnownWords] 加载已掌握单词数量失败:`, error);
      setCurrentBookKnownWordsCount(0); // 出错时设为0
      setKnownWords([]); // 出错时清空列表
      setKnownWordBasicIds(new Set());
      setTotalKnownWordsCount(0);
    } finally {
      setIsLoadingKnownWords(false);
    }
  };

  // Home 按钮跳转逻辑：携带当前学生ID及学习计划ID
  const handleGoHome = () => {
    // 构造基础路径，若有 studentId 则使用 /students/:id，否则回到 /students
    const basePath = studentId ? `/students/${studentId}` : '/students';
    // 若有计划ID则带上 planId 查询参数
    const planQuery = currentLearningPlanId ? `?planId=${currentLearningPlanId}` : '';
    navigate(`${basePath}${planQuery}`);
  };

  // --- 新增：仅关闭结果弹窗，不退出当前模式 ---
  const handleDismissResultModal = () => {
    setShowResultModal(false);
    setResultModalData(null);
  };

  // ---------------- 字体大小设置 ----------------
  const fontScaleValues = [1, 1.2, 1.4]; // 小-中-大 三档
  const [fontScale, setFontScale] = useState<number>(() => {
    const stored = localStorage.getItem('duo_font_scale');
    return stored ? parseFloat(stored) || 1 : 1;
  });

  // 将字体缩放应用到根元素并持久化
  useEffect(() => {
    document.documentElement.style.fontSize = `${16 * fontScale}px`;
    localStorage.setItem('duo_font_scale', fontScale.toString());
  }, [fontScale]);

  // --- 新增：撕纸条完成后自动推进阶段 ---
  useEffect(() => {
    if (
      isInTearingPaperMode &&
      tearingPaperWords.length === 0
    ) {
      const planId = currentPlanIdRef.current || currentLearningPlanId;
      if (planId) {
        const bookWordIds = [...clippedKnownWords, ...clippedUnknownWords]
          .map(w => w.bookWordId)
          .filter((id): id is number => !!id);

        if (bookWordIds.length > 0) {
          // 判断当前组是否仍处于学习阶段（stage 0）
          const isLearningStageGroup = currentWordGroup.every((w: any) => w.currentStage === 0 || w.currentStage === undefined);
          const alreadyAdvanced = advancedLearningGroupsRef.current.has(currentGroupIndex);
          const shouldAdvance = (!isLearningStageGroup) || (isLearningStageGroup && !alreadyAdvanced);

          if (shouldAdvance) {
            (async () => {
              try {
                await advanceWordStagesBatch(planId, bookWordIds);

                // 如需批量标记已掌握（stage 5），检查 sourceStage
                if (sourceStage === 5) {
                  const wordsToAdvance = [...clippedKnownWords, ...clippedUnknownWords];
                  const wordBasicIds = wordsToAdvance
                    .map(w => w.wordBasicId)
                    .filter((id): id is number => typeof id === 'number');
                  const currentStudentId = getStudentId();
                  if (currentStudentId && wordBasicIds.length > 0) {
                    await markKnownWordsBatch(Number(currentStudentId), wordBasicIds).catch(err => console.error('批量标记已掌握单词失败:', err));
                  }
                }

                queryClient.invalidateQueries({ queryKey: ['wordsWithStages', planId] });
                console.log('阶段推进成功');
                if (isLearningStageGroup) {
                  advancedLearningGroupsRef.current.add(currentGroupIndex);
                  setHasAdvancedStageForCurrentGroup(true);
                }
              } catch (err) {
                console.error('阶段推进失败:', err);
              }
            })();
          }
        }
      }
    }
    // 退出撕纸条模式时不再强制清零标记，避免重复推进
  }, [isInTearingPaperMode, tearingPaperWords.length, clippedKnownWords, clippedUnknownWords, currentLearningPlanId, currentGroupIndex, currentWordGroup]);

  // --- 新增：混组检测追加 5 个单词 ---
  const handleAddMoreMixedWords = () => {
    if (!isInMixedGroupTestMode) return;
    const endIndex = (currentGroupIndex + 1) * WORDS_PER_GROUP;
    const allLearnedWords = learningWords.slice(0, endIndex);
    const testedIds = new Set([
      ...mixedTestWords,
      ...mixedTestCorrectWords,
      ...mixedTestIncorrectWords,
    ].map(w => w.id));
    const remaining = allLearnedWords.filter(w => !testedIds.has(w.id));
    if (remaining.length === 0) return; // 无剩余
    const shuffled = [...remaining].sort(() => 0.5 - Math.random());
    const toAdd = shuffled.slice(0, 5);
    setMixedTestWords(prev => [...prev, ...toAdd]);
  };

  // 记录从学习计划进入时的阶段 (0-5) ，用于判断 stage 5 批处理
  const [sourceStage, setSourceStage] = useState<number | null>(null);

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
          {/* Home 按钮：始终显示，用于返回学生列表 */}
          <button
            onClick={handleGoHome}
            className="text-duo-white p-2 rounded-lg hover:bg-duo-green/80"
            title="主页"
          >
            <Home className="w-7 h-7" />
          </button>
          {/* 在非学习模式下隐藏返回按钮，除非是特殊视图模式 */}
          {((isLearningModeActive && !isInPostTestMode) || showStudyPlan || showKnownWordsListView || showFlashcardView) && (
            <button 
                onClick={
                  showStudyPlan
                    ? () => setShowStudyPlan(false)
                    : showFlashcardView
                      ? () => setShowFlashcardView(false)
                      : showKnownWordsListView
                        ? toggleShowKnownWordsListView
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
                    : showFlashcardView
                      ? "返回"
                      : showKnownWordsListView
                        ? "返回学习列表"
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
          )}
        </div>
        {/* --- 学习流程展示 --- */}
        {isInPostTestMode && isFromStudyPlan ? (
          <h2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white font-bold text-lg md:text-xl lg:text-2xl select-none">
            单词复习
          </h2>
        ) : (
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
        )}


        
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
                已掌握: {currentBookKnownWordsCount}/{totalWordsInCurrentBook || words.length}
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
          
          {/* --- 新增：已掌握单词列表模式下的控制按钮 --- */}
          {!isLearningModeActive && showKnownWordsListView && (
            <div className="flex items-center space-x-2">
              {/* 打乱顺序按钮 */}
              <button
                onClick={handleShuffleKnownWords}
                disabled={knownWords.length === 0}
                className="px-3 py-1.5 bg-duo-white/20 backdrop-blur-sm border border-duo-white/30 text-duo-white rounded-lg hover:bg-duo-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm"
                title={isKnownWordsShuffled ? "恢复顺序" : "打乱顺序"}
              >
                {isKnownWordsShuffled ? "恢复顺序" : "打乱顺序"}
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
                  if (knownWords.length > 0) {
                    setIsKnownWordsDisplayModeDropdownOpen(true);
                  }
                }}
                onMouseLeave={() => {
                  // 设置延迟关闭，给用户时间移动到下拉菜单
                  dropdownTimeoutRef.current = setTimeout(() => {
                    setIsKnownWordsDisplayModeDropdownOpen(false);
                  }, 150);
                }}
              >
                <button
                  onClick={() => knownWords.length > 0 && setIsKnownWordsDisplayModeDropdownOpen(!isKnownWordsDisplayModeDropdownOpen)}
                  disabled={knownWords.length === 0}
                  className="px-3 py-1.5 bg-duo-white/20 backdrop-blur-sm border border-duo-white/30 text-duo-white rounded-lg hover:bg-duo-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm flex items-center space-x-1"
                  title="切换显示模式"
                >
                  <span>{getDisplayModeText(knownWordsDisplayMode)}</span>
                  <svg className={`w-3 h-3 transition-transform ${isKnownWordsDisplayModeDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isKnownWordsDisplayModeDropdownOpen && knownWords.length > 0 && (
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
                        setIsKnownWordsDisplayModeDropdownOpen(false);
                      }, 100);
                    }}
                  >
                    <button
                      onClick={() => handleSelectKnownWordsDisplayMode('both')}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-50 first:rounded-t-lg transition-colors font-medium text-sm ${
                        knownWordsDisplayMode === 'both' ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
                      }`}
                    >
                      英文+中文
                    </button>
                    <button
                      onClick={() => handleSelectKnownWordsDisplayMode('engOnly')}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors font-medium text-sm ${
                        knownWordsDisplayMode === 'engOnly' ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
                      }`}
                    >
                      仅英文
                    </button>
                    <button
                      onClick={() => handleSelectKnownWordsDisplayMode('meaningOnly')}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-50 last:rounded-b-lg transition-colors font-medium text-sm ${
                        knownWordsDisplayMode === 'meaningOnly' ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
                      }`}
                    >
                      仅中文
                    </button>
                  </div>
                )}
              </div>
            </div>
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
          <div 
            ref={wordListScrollRef}
            className={`flex-grow overflow-y-auto space-y-2 [&::-webkit-scrollbar]:hidden ${
              (currentQueryWord || iframeSrc) 
                ? 'p-3 md:p-4' 
                : 'pl-8 md:pl-12 pr-8 md:pr-12 pt-3 md:pt-4 pb-3 md:pb-4'
            }`}
          >
            {/* --- 新增：加载状态指示器 --- */}
            {(isAuthLoading || isLoadingPlan || isLoadingWords) && (
              <div className="text-center py-8">
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-6 h-6 border-2 border-duo-blue border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-duo-textSecondary text-lg">
                    {isAuthLoading && "正在加载用户信息..."}
                    {!isAuthLoading && isLoadingPlan && "正在加载学习计划..."}
                    {!isAuthLoading && !isLoadingPlan && isLoadingWords && "正在加载词书单词..."}
                  </span>
                </div>
              </div>
            )}


                          {!(isAuthLoading || isLoadingPlan || isLoadingWords) && isLearningModeActive ? (
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
                                {/* 根据learningDisplayMode决定显示模式 */}
                                {(() => {
                                  const showEnglish = (learningDisplayMode === 'both') ||
                                                     (learningDisplayMode === 'engOnly') ||
                                                     (learningDisplayMode === 'meaningOnly' && isExpanded);
                                  const showChinese = (learningDisplayMode === 'both' && !isExpanded) ||
                                                      (learningDisplayMode === 'engOnly' && isExpanded) ||
                                                      (learningDisplayMode === 'meaningOnly');
                                  
                                  return (
                                    <>
                                      <div className="flex-shrink-0 mr-3">
                                        <div className="flex items-center">
                                          <span className={`font-bold text-2xl ${textStyle} ${!showEnglish ? 'invisible' : ''} transition-all duration-500 ease-in-out`}>
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
                                      
                                      {showChinese && (
                                        <div className={`pl-3 border-l border-duo-grayLight/60 text-lg self-center ${phoneticStyle}`} style={{maxWidth: '280px'}}>
                                          {word.partOfSpeech && <span className="italic opacity-80 mr-1">{word.partOfSpeech}</span>}
                                          {word.meaning ? (
                                            <p className="inline text-xl font-semibold">{word.meaning}</p>
                                          ) : (
                                            learningDisplayMode === 'meaningOnly' && <p className="inline italic">暂无释义</p>
                                          )}
                                        </div>
                                      )}
                                    </>
                                  );
                                })()}
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
                  // 当检测完毕且存在错误单词时，将错误单词以与初始检测列表相同的卡片形式展示，方便重新评定
                  mixedTestIncorrectWords.length > 0 && !animatingMixedTestWord ? (
                    mixedTestIncorrectWords.map((word) => {
                      const wordCardStyle = "bg-red-50 border-3 border-red-300";
                      const textStyle = "text-red-700";
                      const phoneticStyle = "text-red-600";
                      const isExpanded = expandedWordIds.has(word.id);

                      return (
                        <div
                          key={`${word.id}-incorrect-review`}
                          className={`w-full rounded-2xl shadow-sm transform ${wordCardStyle} hover:bg-red-100 hover:border-red-400`}
                          onDoubleClick={() => handleDoubleClickWord(word.text)}
                        >
                          <div className="p-2 flex justify-between items-start w-full">
                            {/* 单词信息 */}
                            <div className="flex-grow flex items-start mr-3 cursor-pointer" onClick={() => handleClickToToggleMeaning(word.id)}>
                              <div className="flex-grow">
                                <div className="flex items-start">
                                  {/* 根据learningDisplayMode决定显示模式 */}
                                  {(() => {
                                    const showEnglish = (learningDisplayMode === 'both') ||
                                                       (learningDisplayMode === 'engOnly') ||
                                                       (learningDisplayMode === 'meaningOnly' && isExpanded);
                                    const showChinese = (learningDisplayMode === 'both' && !isExpanded) ||
                                                        (learningDisplayMode === 'engOnly' && isExpanded) ||
                                                        (learningDisplayMode === 'meaningOnly');
                                    
                                    return (
                                      <>
                                        <div className="flex-shrink-0 mr-3">
                                          <div className="flex items-center">
                                            <span className={`font-bold text-2xl ${textStyle} ${!showEnglish ? 'invisible' : ''}`}>
                                              {getWordDisplayText(word.id, word.text) || '\u00A0'}
                                            </span>
                                            <button
                                              title="播放发音"
                                              onClick={e => { e.stopPropagation(); handleWordPronunciationAndSplit(word.id, word.text); }}
                                              className={`p-1 ml-2 rounded-full ${textStyle} hover:bg-red-100 transition-colors ${!showEnglish ? 'invisible' : ''}`}
                                              disabled={isPronLoading}
                                            >
                                              <Volume2 className="w-5 h-5" />
                                            </button>
                                          </div>
                                          <span className={`text-lg ${phoneticStyle} ${!showEnglish ? 'invisible' : ''}`}>
                                            {word.phonetic || '\u00A0'}
                                          </span>
                                        </div>
                                        {showChinese && (
                                          <div className={`pl-3 border-l border-red-300 text-lg self-center ${phoneticStyle}`} style={{maxWidth: '280px'}}>
                                            {word.partOfSpeech && <span className="italic opacity-80 mr-1">{word.partOfSpeech}</span>}
                                            {word.meaning ? (
                                              <p className="inline text-xl font-semibold">{word.meaning}</p>
                                            ) : (
                                              learningDisplayMode === 'meaningOnly' && <p className="inline italic">暂无释义</p>
                                            )}
                                          </div>
                                        )}
                                      </>
                                    );
                                  })()}
                                </div>
                              </div>
                            </div>

                            {/* 重新评定按钮 */}
                            <div className="flex items-center space-x-2 flex-shrink-0">
                              <button
                                title="改为正确"
                                onClick={() => handleRejudgeMixedIncorrectWord(word.id, true)}
                                className="px-4 py-2 rounded-xl bg-green-100 border-2 border-green-400 text-green-700 hover:bg-green-200 hover:border-green-500 transition-all duration-200 font-semibold"
                              >
                                正确
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-center text-duo-textSecondary py-6 text-lg">没有需要检测的单词或已完成。</p>
                  )
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
                                {/* 根据learningDisplayMode决定显示模式 */}
                                {(() => {
                                  const showEnglish = (learningDisplayMode === 'both') ||
                                                     (learningDisplayMode === 'engOnly') ||
                                                     (learningDisplayMode === 'meaningOnly' && isExpanded);
                                  const showChinese = (learningDisplayMode === 'both' && !isExpanded) ||
                                                      (learningDisplayMode === 'engOnly' && isExpanded) ||
                                                      (learningDisplayMode === 'meaningOnly');
                                  
                                  return (
                                    <>
                                      <div className="flex-shrink-0 mr-3">
                                        <div className="flex items-center">
                                          <span className={`text-2xl mr-2 ${indexColorStyle} ${!showEnglish ? 'invisible' : ''}`}>{index + 1}</span>
                                          <span className={`font-bold text-2xl ${textStyle} ${!showEnglish ? 'invisible' : ''} transition-all duration-500 ease-in-out`}>
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
                                      
                                      {showChinese && (
                                        <div className={`pl-3 border-l border-duo-grayLight/60 text-lg self-center ${phoneticStyle}`} style={{maxWidth: '280px'}}>
                                          {word.partOfSpeech && <span className="italic opacity-80 mr-1">{word.partOfSpeech}</span>}
                                          {word.meaning ? (
                                            <p className="inline text-xl font-semibold">{word.meaning}</p>
                                          ) : (
                                            learningDisplayMode === 'meaningOnly' && <p className="inline italic">暂无释义</p>
                                          )}
                                        </div>
                                      )}
                                    </>
                                  );
                                })()}
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
                  postTestIncorrectWords.length > 0 && !animatingPostTestWord ? (
                    postTestIncorrectWords.map((word) => {
                      const wordCardStyle = "bg-red-50 border-3 border-red-300";
                      const textStyle = "text-red-700";
                      const phoneticStyle = "text-red-600";
                      const isExpanded = expandedWordIds.has(word.id);

                      return (
                        <div
                          key={`${word.id}-postincorrect`}
                          className={`w-full rounded-2xl shadow-sm transform ${wordCardStyle} hover:bg-red-100 hover:border-red-400`}
                          onDoubleClick={() => handleDoubleClickWord(word.text)}
                        >
                          <div className="p-2 flex items-start w-full">
                            <div
                              className="cursor-pointer flex-grow"
                              onClick={() => handleClickToToggleMeaning(word.id)}
                            >
                              <div className="flex items-start">
                                {/* 根据learningDisplayMode决定显示模式 */}
                                {(() => {
                                  const showEnglish = (learningDisplayMode === 'both') ||
                                                     (learningDisplayMode === 'engOnly') ||
                                                     (learningDisplayMode === 'meaningOnly' && isExpanded);
                                  const showChinese = (learningDisplayMode === 'both' && !isExpanded) ||
                                                      (learningDisplayMode === 'engOnly' && isExpanded) ||
                                                      (learningDisplayMode === 'meaningOnly');
                                  
                                  return (
                                    <>
                                      <div className="flex-shrink-0 mr-3">
                                        <div className="flex items-center">
                                          <span className={`font-bold text-2xl ${textStyle} ${!showEnglish ? 'invisible' : ''}`}>
                                            {getWordDisplayText(word.id, word.text) || '\u00A0'}
                                          </span>
                                          <button
                                            title="播放发音"
                                            onClick={e => {
                                              e.stopPropagation();
                                              handleWordPronunciationAndSplit(word.id, word.text);
                                            }}
                                            className={`p-1 ml-2 rounded-full ${textStyle} hover:bg-red-100 transition-colors ${!showEnglish ? 'invisible' : ''}`}
                                            disabled={isPronLoading}
                                          >
                                            <Volume2 className="w-5 h-5" />
                                          </button>
                                        </div>
                                        <span className={`text-lg ${phoneticStyle} ${!showEnglish ? 'invisible' : ''}`}>
                                          {word.phonetic || '\u00A0'}
                                        </span>
                                      </div>

                                      {showChinese && (
                                        <div className={`pl-3 border-l border-red-300 text-lg self-center ${phoneticStyle}`} style={{ maxWidth: '280px' }}>
                                          {word.partOfSpeech && <span className="italic opacity-80 mr-1">{word.partOfSpeech}</span>}
                                          {word.meaning ? (
                                            <p className="inline text-xl font-semibold">{word.meaning}</p>
                                          ) : (
                                            learningDisplayMode === 'meaningOnly' && <p className="inline italic">暂无释义</p>
                                          )}
                                        </div>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                            </div>

                            {/* 重新评定按钮 */}
                            <div className="flex items-center space-x-2 flex-shrink-0">
                              <button
                                title="改为正确"
                                onClick={() => handleRejudgePostIncorrectWord(word.id, true)}
                                className="px-4 py-2 rounded-xl bg-green-100 border-2 border-green-400 text-green-700 hover:bg-green-200 hover:border-green-500 transition-all duration-200 font-semibold"
                              >
                                正确
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-center text-duo-textSecondary py-6 text-lg">没有需要检测的单词或已完成。</p>
                  )
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
                                {/* 英文显示规则：根据learningDisplayMode决定 */}
                                {(() => {
                                  const showEnglish = (learningDisplayMode === 'both') ||
                                                     (learningDisplayMode === 'engOnly') ||
                                                     (learningDisplayMode === 'meaningOnly' && isExpanded);
                                  const showChinese = (learningDisplayMode === 'both' && !isExpanded) ||
                                                      (learningDisplayMode === 'engOnly' && isExpanded) ||
                                                      (learningDisplayMode === 'meaningOnly');
                                  
                                  return (
                                    <>
                                      {/* 单词和音标区域 */}
                                      <div className="flex-shrink-0 mr-3">
                                        <div className="flex items-center">
                                          <span className={`font-bold text-2xl ${textStyle} ${!showEnglish ? 'invisible' : ''} transition-all duration-500 ease-in-out`}>
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
                                      
                                      {/* 中文释义区域 - 根据显示模式显示 */}
                                      {showChinese && (
                                        <div className={`pl-3 border-l border-duo-grayLight/60 text-lg self-center ${phoneticStyle}`} style={{maxWidth: '280px'}}>
                                          {word.partOfSpeech && <span className="italic opacity-80 mr-1">{word.partOfSpeech}</span>}
                                          {word.meaning ? (
                                            <p className="inline text-xl font-semibold">{word.meaning}</p>
                                          ) : (
                                            learningDisplayMode === 'meaningOnly' && <p className="inline italic">暂无释义</p>
                                          )}
                                        </div>
                                      )}
                                    </>
                                  );
                                })()}
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
            ) : !(isAuthLoading || isLoadingPlan || isLoadingWords) ? (
              // --- 主学习列表视图 ---
              <>
              {words.length === 0 ? (
                // --- 空状态提示 ---
                <div className="flex flex-col items-center justify-center py-20 px-6">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-6 bg-duo-grayLight/30 rounded-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-duo-grayMedium" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-duo-textPrimary mb-3">
                      暂无词书数据
                    </h3>
                    <p className="text-duo-textSecondary text-base mb-6 max-w-md mx-auto leading-relaxed">
                      {!studentId 
                        ? "请先登录并创建学习计划，或选择一个词书开始学习"
                        : allStudentPlans && allStudentPlans.length > 0
                          ? "请选择一个学习计划或词书开始学习"
                          : "当前没有学习计划，请先创建一个学习计划"
                      }
                    </p>
                    {/* 可以在这里添加创建学习计划或选择词书的按钮 */}
                  </div>
                </div>
              ) : (
                // --- 单词列表 ---
                (showKnownWordsListView ? knownWords : words).map((word, index) => {
                const isKnownList = showKnownWordsListView;
                const isSelected = !isKnownList && selectedWords.has(word.id);
                const isRemoving = isKnownList ? removingFromKnownIds.has(word.id) : removingWordIds.has(word.id);
                
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
                              <span className={`text-lg ${phoneticColorStyle} ${!showEnglish ? 'invisible' : ''}`}>
                                {word.phonetic || '\u00A0'}
                              </span>
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
                        {isKnownList ? (
                          // 已掌握视图：只显示"取消已掌握"按钮
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkUnknown(word.id);
                            }}
                            className="w-8 h-8 md:w-9 md:h-9 rounded-lg border-2 border-red-300 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-400 transition-all duration-150 flex items-center justify-center"
                            title="取消已掌握"
                          >
                            <XMarkIcon />
                          </button>
                        ) : (
                          <>
                            {/* 选择框 */}
                            <label 
                              htmlFor={`select-checkbox-${word.id}`} 
                              className="flex items-center cursor-pointer p-0.5 rounded-lg"
                              title={isSelected ? '取消选择' : '选择学习'}
                              onClick={(e) => e.stopPropagation()} 
                            >
                              <input 
                                id={`select-checkbox-${word.id}`} 
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
                                {isSelected && <CheckIcon />}
                              </div>
                            </label>
                            {/* 叉号按钮 - 标记为已知 */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsKnown(word.id);
                              }}
                              className="w-8 h-8 md:w-9 md:h-9 rounded-lg border-2 border-red-300 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-400 transition-all duration-150 flex items-center justify-center"
                              title="认识这个单词"
                            >
                              <XMarkIcon />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }))}
              </>
            ) : null
            }

            {/* --- 新增：加载更多按钮（仅在学前检测模式下显示，且不是从学习计划加载时） --- */}
            {!isLearningModeActive && !showKnownWordsListView && hasMoreWords && !isFromStudyPlan && (
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
            {!isLearningModeActive && !showKnownWordsListView && !hasMoreWords && words.length > 0 && (
              <div className="pt-4 pb-2 text-center">
                <p className="text-duo-textSecondary text-base py-3">
                  {isFromStudyPlan 
                    ? `已加载学习计划中的可背诵单词 (${words.length} 个)`
                    : currentVocabularyBookId 
                      ? `已加载词书中所有单词 (${words.length}/${totalWordsInCurrentBook} 个)`
                      : `已加载所有单词 (${words.length} 个)`
                  }
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
              <XMarkIcon />
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
              <XMarkIcon />
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
                      <div>
                        <h2 className="text-2xl font-bold text-duo-textPrimary">编辑: {editingBuffer.text || currentQueryWord}</h2>
                        {currentVocabularyBook && (
                          <div className="mt-1">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              currentVocabularyBook.is_system_preset 
                                ? 'bg-gray-100 text-gray-600' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {currentVocabularyBook.is_system_preset ? '系统预设词库' : '自定义词库'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="local-text" className="block text-sm font-medium text-duo-textSecondary mb-1">英文单词</label>
                      <input 
                        type="text" 
                        id="local-text" 
                        value={editingBuffer.text || ''} 
                        onChange={(e) => handleLocalDefChange('text', e.target.value)} 
                        className="w-full p-2 border border-duo-grayMedium rounded-lg focus:ring-duo-blue focus:border-duo-blue"
                        placeholder="例如 apple"
                      />
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
                            <XMarkIcon />
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
                      <div>
                        <h2 className="font-bold text-2xl font-bold text-duo-textPrimary break-all">{currentLocalDefinition.text || currentQueryWord}</h2>
                        {currentVocabularyBook && (
                          <div className="mt-1">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              currentVocabularyBook.is_system_preset 
                                ? 'bg-gray-100 text-gray-600' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {currentVocabularyBook.is_system_preset ? '系统预设词库' : '自定义词库'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => {
                            if (currentVocabularyBook?.is_system_preset) {
                              alert('系统预设词库不允许修改，请选择自定义词库进行编辑。');
                              return;
                            }
                            setIsEditingLocal(true);
                            // 尝试从单词列表中找到对应的单词以获取ID
                            const foundWord = words.find(w => w.text === currentQueryWord) || 
                                            knownWords.find(w => w.text === currentQueryWord);
                            // Ensure editingBuffer gets all fields from currentLocalDefinition, especially .text and id
                            setEditingBuffer({ 
                              id: foundWord?.id || foundWord?.bookWordId, // 添加单词ID用于后端保存
                              text: currentLocalDefinition.text || currentQueryWord,
                              phonetic: currentLocalDefinition.phonetic || "",
                              meaning: currentLocalDefinition.meaning || "",
                              partOfSpeech: currentLocalDefinition.partOfSpeech || "",
                              examples: currentLocalDefinition.examples || [],
                            });
                          }}
                          disabled={currentVocabularyBook?.is_system_preset}
                          className={`px-4 py-2 rounded-lg transition-colors text-sm font-semibold min-w-max ${
                            currentVocabularyBook?.is_system_preset
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-duo-blue text-white hover:bg-duo-blue/90'
                          }`}
                          title={currentVocabularyBook?.is_system_preset ? '系统预设词库不允许编辑' : '编辑释义'}
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
                        <p className="text-duo-textSecondary text-center py-6 text-base">
                          此单词暂无本地释义。
                          {currentVocabularyBook?.is_system_preset 
                            ? '系统预设词库不支持编辑。' 
                            : '点击"编辑释义"添加。'
                          }
                        </p>
                    )}

                    {(currentLocalDefinition.phonetic || currentLocalDefinition.meaning || currentLocalDefinition.partOfSpeech) && (!currentLocalDefinition.examples || currentLocalDefinition.examples.length === 0) && (
                        <p className="text-duo-textSecondary text-base mt-4">
                          无例句。
                          {currentVocabularyBook?.is_system_preset 
                            ? '系统预设词库不支持编辑。' 
                            : '点击"编辑释义"添加。'
                          }
                        </p>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 text-lg space-y-2">
                    <p>{`加载 "${currentQueryWord}" 的本地释义...`}</p>
                    {currentVocabularyBook?.is_system_preset && (
                      <p className="text-sm text-gray-400">系统预设词库仅可查看，不可编辑</p>
                    )}
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
            {isLoadingStudyPlanWords ? (
              <div className="flex justify-center items-center h-64">
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-6 h-6 border-2 border-duo-blue border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-duo-textSecondary text-lg">
                    正在加载学习计划...
                  </span>
                </div>
              </div>
            ) : (
              <DuolingoStudyPlan
                words={studyPlanWords}
                today={new Date().toISOString().slice(0, 10)}
                studentPlans={allStudentPlans || []}
                onStartLearning={handleStartLearningFromPlan}
                studentId={studentId || undefined}
              />
            )}
          </div>
        </div>
      )}

      {/* 学习模式下不显示原footer，或者显示不同的footer */}
      {!isLearningModeActive && !showKnownWordsListView && !showFlashcardView && !showStudyPlan && (
        <footer className="bg-duo-white p-4 border-t-2 border-duo-grayLight shadow-inner sticky bottom-0 z-10">
          <div className="flex items-center">
            {/* 左侧显示选中单词数量 */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <span className="text-duo-textSecondary font-medium text-base">已选择</span>
              <span className="text-duo-green font-bold text-xl">{selectedCount}</span>
              <span className="text-duo-textSecondary font-medium text-base"> 个单词</span>
            </div>
            
            {/* 按钮组 - 居中填满剩余空间 */}
            <div className="flex items-center space-x-4 flex-1 ml-32">
              {/* 全部选择/取消全部按钮 */}
              <button
                onClick={selectedCount === words.length ? handleDeselectAll : handleSelectAll}
                disabled={words.length === 0}
                className="flex-1 py-3 text-center bg-duo-green text-duo-white font-semibold rounded-2xl hover:bg-duo-green/90 transition-colors duration-150 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-duo-green/50"
              >
                {selectedCount === words.length ? '取消全部' : '全部选择'}
              </button>
              
              <button 
                onClick={handleStartMemorizing} 
                disabled={selectedCount === 0}
                className="flex-1 py-3 text-center bg-duo-green text-duo-white font-semibold rounded-2xl hover:bg-duo-green/90 transition-colors duration-150 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-duo-green/50"
              >
                开始学习
              </button>
            </div>
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
               
               {/* 右侧按钮组 */}
               <div className="flex items-center gap-4">
                 {/* 再来5个 */}
                 {(() => {
                   const endIdx = (currentGroupIndex + 1) * WORDS_PER_GROUP;
                   const pool = learningWords.slice(0, endIdx);
                   const testedIds = new Set([
                     ...mixedTestWords,
                     ...mixedTestCorrectWords,
                     ...mixedTestIncorrectWords,
                   ].map(w => w.id));
                   const remainingCount = pool.filter(w => !testedIds.has(w.id)).length;
                   return (
                     <button
                       onClick={handleAddMoreMixedWords}
                       disabled={remainingCount === 0}
                       className="px-8 py-3 bg-duo-blue text-white font-bold rounded-2xl hover:bg-duo-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                     >
                       再来 5 个
                     </button>
                   );
                 })()}
                 {/* 确认提交按钮 */}
                 <button
                   onClick={handleSubmitMixedGroupTest}
                   disabled={mixedTestWords.length > 0}
                   className="px-8 py-3 bg-duo-blue text-white font-bold rounded-2xl hover:bg-duo-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:transform-none"
                 >
                   确认提交
                 </button>
               </div>
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
                     className="flex-1 bg-duo-green text-duo-white font-semibold py-3 rounded-2xl hover:bg-duo-green/90 transition-colors duration-150 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-duo-green/50"
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
                     学后检测
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
                     disabled={currentGroupIndex === 0}
                     onClick={() => {
                       if (currentGroupIndex === 0) return; // 第一组禁用混组检测
                       handleExitTearingPaperMode();
                       handleStartMixedGroupTest();
                     }}
                     className="flex-1 bg-duo-green text-white font-semibold py-3 rounded-2xl hover:bg-duo-green/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-duo-green/50"
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
          <div className="bg-duo-white rounded-3xl shadow-md max-w-lg w-full mx-4 transform transition-all duration-300 scale-100 relative">
            {/* 关闭弹窗按钮 */}
            <button
              onClick={handleDismissResultModal}
              className="absolute top-4 right-4 bg-duo-white/80 hover:bg-duo-white text-duo-grayDark p-2 rounded-full shadow-md"
              title="关闭"
            >
              <XMarkIcon />
            </button>
            {/* 弹窗头部 - 简化 */}
            <div className="bg-gray-50 p-6 rounded-t-3xl text-center border-b border-gray-200">
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
                  {isInMixedGroupTestMode ? '下一组' : '继续学习'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- 新增：单词选择视图 --- */}
      {showWordSelection && currentPlanId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <WordSelectionComponent
              planId={currentPlanId}
              onWordsSelected={handleWordsSelected}
              onCancel={handleCancelWordSelection}
            />
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