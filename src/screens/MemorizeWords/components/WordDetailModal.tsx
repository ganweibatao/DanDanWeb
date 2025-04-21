import React, { useState, useEffect, useRef } from 'react';
import { VocabularyWord } from '../../../services/api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { X, Save, Info, BookText, Type, Brain, Pencil, ChevronLeft, ChevronRight } from 'lucide-react'; // Import icons
import { dictionaryService, DictionaryEntry, parseSynAntoDerivativesFromDictApi, datamuseService, icibaService } from '../../../services/dictionaryService';

interface EditableVocabularyWord extends VocabularyWord {
    example?: string | null;
    examples?: string;
    notes?: string;
    example_sentence?: string | null;
}

interface WordDetailModalProps {
  word: EditableVocabularyWord;
  isOpen: boolean;
  onClose: () => void;
  onSave: (word: EditableVocabularyWord, updates: { translation: string; example?: string | null; examples?: string; notes?: string }) => void;
  darkMode: boolean; // Receive darkMode prop
  onSwipe: (direction: 'prev' | 'next') => void; // 添加滑动回调
  canSwipePrev: boolean; // 是否可以向前滑动
  canSwipeNext: boolean; // 是否可以向后滑动
  showInitialHint: boolean; // 新增 prop
  wordExtraInfo?: { dictDetails: DictionaryEntry[]; synonyms: string[]; antonyms: string[]; derivatives: string[] };
  isExtraInfoLoading?: boolean;
  /**
   * 当已到最前/最后一页时，点击左/右箭头触发的回调（用于父组件加载新一页）
   */
  onRequestPrevPage?: () => void;
  onRequestNextPage?: () => void;
}

export const WordDetailModal: React.FC<WordDetailModalProps> = ({
  word,
  isOpen,
  onClose,
  onSave,
  darkMode,
  onSwipe,
  canSwipePrev,
  canSwipeNext,
  showInitialHint, // 虽然不再使用，但保留参数避免破坏接口
  wordExtraInfo,
  isExtraInfoLoading,
  onRequestPrevPage,
  onRequestNextPage,
}) => {
  const [editedTranslation, setEditedTranslation] = useState(word.translation || "");
  const [editedExample, setEditedExample] = useState(word.example || "");
  const [editedExamples, setEditedExamples] = useState(word.examples || "");
  const [editedNotes, setEditedNotes] = useState(word.notes || "");

  const [isEditingTranslation, setIsEditingTranslation] = useState(false);
  const [isEditingExample, setIsEditingExample] = useState(false);
  const [isEditingExamples, setIsEditingExamples] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const modalContentRef = useRef<HTMLDivElement>(null);

  // 新增：Datamuse API 状态
  const [datamuseDefs, setDatamuseDefs] = useState<string[]>([]);
  const [datamuseSynonyms, setDatamuseSynonyms] = useState<string[]>([]);
  const [datamuseAntonyms, setDatamuseAntonyms] = useState<string[]>([]);
  const [datamuseLoading, setDatamuseLoading] = useState(false);
  const [datamuseError, setDatamuseError] = useState<string|null>(null);

  // 新增：最终展示的释义，优先用预加载
  const [finalDefinitions, setFinalDefinitions] = useState<string[]>([]);

  // 新增：iciba suggest 兜底释义
  const [icibaSuggestDefs, setIcibaSuggestDefs] = useState<any[]>([]);
  const [icibaSuggestLoading, setIcibaSuggestLoading] = useState(false);
  const [icibaSuggestError, setIcibaSuggestError] = useState<string|null>(null);
  const [showIcibaSuggest, setShowIcibaSuggest] = useState(false); // 控制主动弹窗
  // 新增：iciba释义缓存
  const icibaSuggestCache = useRef<{ [word: string]: any[] }>({});

  // 释义tab切换，只有"中文释义""英文释义"
  const [definitionTab, setDefinitionTab] = useState<'zh' | 'en'>('en');

  // 查询单词详情（优先用预加载，兜底再查）
  useEffect(() => {
    if (!isOpen || !word.word) return;
    setDatamuseLoading(true);
    setDatamuseError(null);
    setDatamuseDefs([]);
    setDatamuseSynonyms([]);
    setDatamuseAntonyms([]);
    setFinalDefinitions([]);
    setIcibaSuggestDefs([]);
    setIcibaSuggestError(null);
    setIcibaSuggestLoading(false);
    setShowIcibaSuggest(false);

    // // 优先用预加载释义
    // if (wordExtraInfo && wordExtraInfo.dictDetails && wordExtraInfo.dictDetails.length > 0) {
    //   // 提取所有释义
    //   const defs: string[] = [];
    //   wordExtraInfo.dictDetails.forEach(entry => {
    //     entry.meanings.forEach(meaning => {
    //       meaning.definitions.forEach(def => {
    //         if (def.definition) defs.push(def.definition);
    //       });
    //     });
    //   });
    //   setFinalDefinitions(defs);
    //   // 同步同义词/反义词（如果预加载有的话，也可以在这里处理）
    //   setDatamuseSynonyms(wordExtraInfo.synonyms || []);
    //   setDatamuseAntonyms(wordExtraInfo.antonyms || []);
    //   setDatamuseLoading(false);
    //   return;
    // }
    // 没有预加载时，兜底用datamuse
    Promise.all([
      datamuseService.getDefinitions(word.word),
      datamuseService.getSynonyms(word.word),
      datamuseService.getAntonyms(word.word),
    ]).then(([defs, syns, ants]) => {
      setDatamuseDefs(defs.defs);
      setFinalDefinitions(defs.defs);
      setDatamuseSynonyms(syns);
      setDatamuseAntonyms(ants);
      setDatamuseLoading(false);
    }).catch(e => {
      setDatamuseError('Datamuse 查询失败');
      setDatamuseLoading(false);
    });
  }, [isOpen, word.word, wordExtraInfo]);

  // 添加键盘事件监听
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || isEditingTranslation || isEditingExample || isEditingExamples || isEditingNotes) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        if (canSwipePrev) {
          onSwipe('prev');
        } else if (onRequestPrevPage) {
          onRequestPrevPage();
        }
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        if (canSwipeNext) {
          onSwipe('next');
        } else if (onRequestNextPage) {
          onRequestNextPage();
        }
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onSwipe, canSwipePrev, canSwipeNext, isEditingTranslation, isEditingExample, isEditingExamples, isEditingNotes, onRequestPrevPage, onRequestNextPage]);

  // 重置状态
  useEffect(() => {
    if (isOpen) {
      setEditedTranslation(word.translation || "");
      setEditedExample(word.example || "");
      setEditedExamples(word.examples || "");
      setEditedNotes(word.notes || "");
      setIsEditingTranslation(false);
      setIsEditingExample(false);
      setIsEditingExamples(false);
      setIsEditingNotes(false);
      if (modalContentRef.current) {
        modalContentRef.current.style.transform = 'translateX(0)';
      }
    }
  }, [isOpen, word]);

  const handleSave = (section: 'translation' | 'example' | 'examples' | 'notes') => {
    const updates = {
        translation: editedTranslation,
        example: editedExample,
        examples: editedExamples,
        notes: editedNotes,
    };
    onSave(word, updates);

    if (section === 'translation') setIsEditingTranslation(false);
    if (section === 'example') setIsEditingExample(false);
    if (section === 'examples') setIsEditingExamples(false);
    if (section === 'notes') setIsEditingNotes(false);
  };

  const handleCancelEdit = (section: 'translation' | 'example' | 'examples' | 'notes') => {
      if (section === 'translation') {
          setEditedTranslation(word.translation || "");
          setIsEditingTranslation(false);
      } else if (section === 'example') {
          setEditedExample(word.example || "");
          setIsEditingExample(false);
      } else if (section === 'examples') {
          setEditedExamples(word.examples || "");
          setIsEditingExamples(false);
      } else if (section === 'notes') {
          setEditedNotes(word.notes || "");
          setIsEditingNotes(false);
      }
  }

  // 主动触发iciba suggest
  const handleIcibaSuggest = async () => {
    setIcibaSuggestLoading(true);
    setIcibaSuggestError(null);
    setShowIcibaSuggest(true);
    // 先查缓存
    if (icibaSuggestCache.current[word.word]) {
      setIcibaSuggestDefs(icibaSuggestCache.current[word.word]);
      setIcibaSuggestLoading(false);
      return;
    }
    try {
      const res = await icibaService.getSuggest(word.word);
      let list: any[] = [];
      if (Array.isArray(res?.message)) {
        list = res.message;
      } else if (res?.message?.result?.list) {
        list = res.message.result.list;
      }
      setIcibaSuggestDefs(list);
      icibaSuggestCache.current[word.word] = list; // 写入缓存
    } catch (e) {
      setIcibaSuggestError('中文释义查询失败');
    } finally {
      setIcibaSuggestLoading(false);
    }
  };

  // 监听tab切换到中文释义时自动请求iciba释义
  useEffect(() => {
    if (definitionTab === 'zh' && !showIcibaSuggest && !icibaSuggestLoading && icibaSuggestDefs.length === 0) {
      setShowIcibaSuggest(true);
      setIcibaSuggestError(null);
      // 先查缓存
      if (icibaSuggestCache.current[word.word]) {
        setIcibaSuggestDefs(icibaSuggestCache.current[word.word]);
        setIcibaSuggestLoading(false);
        return;
      }
      setIcibaSuggestLoading(true);
      icibaService.getSuggest(word.word).then(res => {
        let list: any[] = [];
        if (Array.isArray(res?.message)) {
          list = res.message;
        } else if (res?.message?.result?.list) {
          list = res.message.result.list;
        }
        setIcibaSuggestDefs(list);
        icibaSuggestCache.current[word.word] = list; // 写入缓存
      }).catch(e => {
        setIcibaSuggestError('中文释义查询失败');
      }).finally(() => {
        setIcibaSuggestLoading(false);
      });
    }
    // eslint-disable-next-line
  }, [definitionTab, word.word]);

  if (!isOpen) return null;

  // Helper only for the EDITING state UI
  const renderEditingUI = (
    isEditing: boolean,
    editedValue: string,
    setEditedValue: (value: string) => void,
    sectionKey: 'translation' | 'example' | 'examples' | 'notes',
    title: string
  ) => {
    if (!isEditing) return null;

    const InputComponent = sectionKey === 'translation' ? Input : Textarea;
    const placeholderText = `输入${title}...`;

    return (
        <div className="space-y-2 mt-2">
            <InputComponent
                id={`${sectionKey}-edit`}
                value={editedValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setEditedValue(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => { 
                    if (e.key === 'Enter' && !e.shiftKey && sectionKey === 'translation') { 
                        handleSave(sectionKey); 
                    } else if (e.key === 'Escape') { 
                        handleCancelEdit(sectionKey); 
                    } 
                }}
                autoFocus
                className={`w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 ${sectionKey !== 'translation' ? 'min-h-[60px]' : ''}`}
                placeholder={placeholderText}
                rows={sectionKey !== 'translation' ? 3 : undefined}
            />
            <div className="flex items-center justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => handleCancelEdit(sectionKey)} className="flex-shrink-0">
                    取消
                </Button>
                <Button size="sm" onClick={() => handleSave(sectionKey)} className="bg-green-600 hover:bg-green-700 text-white flex-shrink-0">
                    <Save className="w-4 h-4 mr-1" /> 保存
                </Button>
            </div>
        </div>
    );
};

  // 获取滑动动画样式
  const getSlideAnimationClass = () => {
    return 'animate-fade-in-scale';
  };

  // 在组件挂载时注入动画样式
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slide-in-left {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slide-in-right {
        from { transform: translateX(-100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes fade-in-scale {
        from { transform: scale(0.95); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      .animate-slide-in-left {
        animation: slide-in-left 0.3s ease-in-out;
      }
      .animate-slide-in-right {
        animation: slide-in-right 0.3s ease-in-out;
      }
      .animate-fade-in-scale {
        animation: fade-in-scale 0.2s ease-in-out;
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return (
    // Modal backdrop
    <div
      className={`fixed inset-0 bg-black/50 ${darkMode ? 'dark' : ''} backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out`}
      onClick={onClose}
    >
      {/* 优化布局：左右箭头绝对居中于内容两侧 */}
      <div className="relative w-full max-w-3xl flex items-center justify-center">
        {/* 左箭头 */}
        {(canSwipePrev || onRequestPrevPage) && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-shrink-0 text-white bg-black/40 hover:bg-black/60 rounded-full h-14 w-12 p-0 flex items-center justify-center shadow-md"
              onClick={(e) => {
                e.stopPropagation();
                if (canSwipePrev) {
                  onSwipe('prev');
                } else if (onRequestPrevPage) {
                  onRequestPrevPage();
                }
              }}
              aria-label="上一个单词"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </div>
        )}
        {/* 内容区绝对居中 */}
        <div
          ref={modalContentRef}
          className={`mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md ${getSlideAnimationClass()} transition-transform duration-300 ease-in-out relative max-h-[80vh] overflow-y-auto`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {word.word}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-hide">
            <style>
              {`
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
                .scrollbar-hide {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
              `}
            </style>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
               {word.pronunciation && (
                 <div className="flex items-center gap-1">
                   <Type className="w-4 h-4 opacity-70" />
                   <span>[{word.pronunciation}]</span>
                 </div>
               )}
            </div>

            <div className="space-y-1">
              <label htmlFor="translation-display" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 gap-1">
                  <Brain className="w-4 h-4 opacity-70" /> 释义
              </label>
              {!isEditingTranslation ? (
                  <div className="flex justify-between items-start min-h-[36px]">
                      <div className="flex items-center gap-1.5 flex-grow mr-2">
                          {word.part_of_speech && (
                              <span className={`inline-flex items-center rounded-md bg-green-100 dark:bg-green-800/30 text-green-700 dark:text-green-200 ring-green-600/20 dark:ring-green-500/30 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset`}>
                                  {word.part_of_speech}
                              </span>
                          )}
                          <p id="translation-display" className="text-gray-800 dark:text-gray-200 break-words py-0.5 whitespace-pre-wrap">
                              {editedTranslation || <span className="italic text-gray-500 dark:text-gray-400">无释义</span>}
                          </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setIsEditingTranslation(true)} className="opacity-100 flex-shrink-0 ml-2">
                          <Pencil className="w-3 h-3" />
                      </Button>
                  </div>
              ) : renderEditingUI(isEditingTranslation, editedTranslation, setEditedTranslation, 'translation', '释义')}
            </div>

            <div className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-1">
              <label htmlFor="example-display" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 gap-1">
                  <BookText className="w-4 h-4 opacity-70"/> 例句
              </label>
              {!isEditingExample ? (
                  <div className="flex justify-between items-start min-h-[36px]">
                      <p id="example-display" className="text-gray-800 dark:text-gray-200 flex-grow mr-2 break-words py-0.5 whitespace-pre-wrap">
                          {editedExample || <span className="italic text-gray-500 dark:text-gray-400">无例句</span>}
                      </p>
                      <Button variant="outline" size="sm" onClick={() => setIsEditingExample(true)} className="opacity-100 flex-shrink-0 ml-2">
                          <Pencil className="w-3 h-3" />
                      </Button>
                  </div>
              ) : renderEditingUI(isEditingExample, editedExample || "", setEditedExample, 'example', '例句')}
            </div>

            <div className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-1">
                 <label htmlFor="notes-display" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 gap-1">
                     <Info className="w-4 h-4 opacity-70"/> 笔记
                 </label>
                 {!isEditingNotes ? (
                      <div className="flex justify-between items-start min-h-[36px]">
                          <div className="relative flex-grow mr-2"> 
                              <p id="notes-display" className="text-gray-800 dark:text-gray-200 break-words py-0.5 whitespace-pre-wrap">
                                  {editedNotes || <span className="italic text-gray-500 dark:text-gray-400">无笔记</span>}
                              </p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => setIsEditingNotes(true)} className="opacity-100 flex-shrink-0 ml-2">
                              <Pencil className="w-3 h-3" />
                          </Button>
                      </div>
                 ) : renderEditingUI(isEditingNotes, editedNotes, setEditedNotes, 'notes', '笔记')}
             </div>
          </div>

          {/* 单词详细信息展示（全部Datamuse） */}
          <div className="mt-6 border-t pt-4 text-[16px] leading-relaxed px-4">
            <div className="font-extrabold mb-3 text-xl text-gray-900 dark:text-gray-100">单词扩展信息</div>
            {datamuseLoading && <div className="text-gray-500 text-base py-2">正在加载...</div>}
            {datamuseError && <div className="text-red-500 text-base py-2">{datamuseError}</div>}
            {!datamuseLoading && !datamuseError && (
              <>
                {/* 释义（优先预加载） */}
                <div className="mb-4">
                  <div className="font-bold flex items-center gap-2 text-lg text-green-700 dark:text-green-300">
                    释义：
                    <div className="flex gap-1 ml-2">
                      <Button size="sm" variant={definitionTab === 'zh' ? 'default' : 'outline'} onClick={() => setDefinitionTab('zh')} className="px-3 py-1 text-base">中文释义</Button>
                      <Button size="sm" variant={definitionTab === 'en' ? 'default' : 'outline'} onClick={() => setDefinitionTab('en')} className="px-3 py-1 text-base">英文释义</Button>
                    </div>
                  </div>
                  {/* tab内容切换 */}
                  {definitionTab === 'zh' ? (
                    <>
                      {/* iciba释义优先展示，点击按钮后才请求 */}
                      {showIcibaSuggest ? (
                        icibaSuggestLoading ? (
                          <div className="text-gray-400 text-base py-2">释义加载中...</div>
                        ) : icibaSuggestError ? (
                          <div className="text-red-400 text-base py-2">{icibaSuggestError}</div>
                        ) : icibaSuggestDefs.length > 0 ? (
                          <div className="space-y-3">
                            {icibaSuggestDefs.map((item: any, i: number) => (
                              <div key={i} className={i === 0 ? '' : 'ml-6 pl-2 border-l-2 border-blue-100 dark:border-blue-900'}>
                                <div className={i === 0 ? 'font-bold text-blue-900 dark:text-blue-200 text-lg' : 'font-semibold text-blue-700 dark:text-blue-300 text-base'}>
                                  {item.key}
                                  <span className="mx-1 text-gray-500">：</span>
                                  {/* 只在没有means时展示paraphrase */}
                                  {!(Array.isArray(item.means) && item.means.length > 0) && (
                                    <span className={i === 0 ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-400'}>{item.paraphrase}</span>
                                  )}
                                </div>
                                {/* means 字段详细义项展示 */}
                                {Array.isArray(item.means) && item.means.length > 0 && (
                                  <ul className="ml-4 mt-1 list-disc text-base text-gray-700 dark:text-gray-200 leading-loose">
                                    {item.means.map((m: any, mi: number) => (
                                      <li key={mi}>
                                        <span className="text-green-700 dark:text-green-300 mr-1">{m.part}</span>
                                        {Array.isArray(m.means) ? m.means.join('；') : m.means}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : <div className="text-gray-400 text-base py-2">暂无iciba释义</div>
                      ) : <div className="text-gray-400 text-base py-2"></div>}
                    </>
                  ) : finalDefinitions.length > 0 ? (
                    <ul className="list-disc ml-6 text-base text-gray-800 dark:text-gray-100 leading-loose">
                      {finalDefinitions.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  ) : <div className="text-gray-400 text-base py-2">暂无英文释义</div>}
                </div>
                {/* 同义词/反义词始终展示 */}
                <div className="mb-2 flex items-center">
                  <span className="font-bold text-green-700 dark:text-green-300 text-base mr-2">同义词：</span>
                  {datamuseSynonyms.length > 0
                    ? <span className="text-base text-gray-800 dark:text-gray-100">{datamuseSynonyms.slice(0, 5).join('、')}</span>
                    : <span className="text-base text-gray-400">无同义词</span>
                  }
                </div>
                <div className="mb-2 flex items-center">
                  <span className="font-bold text-green-700 dark:text-green-300 text-base mr-2">反义词：</span>
                  <span className="text-base text-gray-800 dark:text-gray-100">
                    {datamuseAntonyms.length > 0 ? datamuseAntonyms.slice(0, 5).join('、') : <span className="text-gray-400">无反义词</span>}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
        {/* 右箭头 */}
        {(canSwipeNext || onRequestNextPage) && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-shrink-0 text-white bg-black/40 hover:bg-black/60 rounded-full h-14 w-12 p-0 flex items-center justify-center shadow-md"
              onClick={(e) => {
                e.stopPropagation();
                if (canSwipeNext) {
                  onSwipe('next');
                } else if (onRequestNextPage) {
                  onRequestNextPage();
                }
              }}
              aria-label="下一个单词"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
