import React, { useState, useEffect, useRef } from 'react';
import { VocabularyWord } from '../services/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { X, Save, Info, BookText, Type, Brain, Pencil, ChevronLeft, ChevronRight } from 'lucide-react'; // Import icons

interface EditableVocabularyWord extends VocabularyWord {
    example?: string | null;
    examples?: string;
    notes?: string;
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
}) => {
  const [editedTranslation, setEditedTranslation] = useState(word.translation || "");
  const [editedExample, setEditedExample] = useState(word.example || "");
  const [editedExamples, setEditedExamples] = useState(word.examples || "");
  const [editedNotes, setEditedNotes] = useState(word.notes || "");

  const [isEditingTranslation, setIsEditingTranslation] = useState(false);
  const [isEditingExample, setIsEditingExample] = useState(false);
  const [isEditingExamples, setIsEditingExamples] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  // 滑动状态
  const [startX, setStartX] = useState<number | null>(null);
  const [currentX, setCurrentX] = useState<number | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'prev' | 'next' | null>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  // 新增状态：控制滑动提示的显示
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const hintTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 添加键盘事件监听
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || isEditingTranslation || isEditingExample || isEditingExamples || isEditingNotes) {
        return;
      }
      
      if (e.key === 'ArrowLeft' && canSwipePrev) {
        onSwipe('prev');
        setSwipeDirection('prev');
        e.preventDefault();
      } else if (e.key === 'ArrowRight' && canSwipeNext) {
        onSwipe('next');
        setSwipeDirection('next');
        e.preventDefault();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onSwipe, canSwipePrev, canSwipeNext, isEditingTranslation, isEditingExample, isEditingExamples, isEditingNotes]);

  // 重置状态和滑动状态
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
      
      setIsSwiping(false);
      setStartX(null);
      setCurrentX(null);
      setSwipeDirection(null);
      if (modalContentRef.current) {
        modalContentRef.current.style.transform = 'translateX(0)';
      }
      
      setShowSwipeHint(false);
    }
    return () => {
      if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    };
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
  
  // 修改 handleTouchStart
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      setStartX(e.touches[0].clientX);
      setCurrentX(e.touches[0].clientX);
      setIsSwiping(true);
      if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isSwiping && startX !== null && e.touches.length === 1) {
      const current = e.touches[0].clientX;
      setCurrentX(current);
      const deltaX = current - startX;
      
      if (modalContentRef.current) {
        modalContentRef.current.style.transition = 'none';
        modalContentRef.current.style.transform = `translateX(${deltaX}px)`;
      }
    }
  };

  // 修改 handleTouchEnd
  const handleTouchEnd = () => {
    if (isSwiping && startX !== null && currentX !== null) {
      const deltaX = currentX - startX;
      const threshold = 50;
      
      if (deltaX > threshold && canSwipePrev) {
        setSwipeDirection('prev');
        onSwipe('prev');
      } else if (deltaX < -threshold && canSwipeNext) {
        setSwipeDirection('next');
        onSwipe('next');
      } else {
        setSwipeDirection(null);
        if (modalContentRef.current) {
          modalContentRef.current.style.transition = 'transform 0.3s ease-in-out';
          modalContentRef.current.style.transform = 'translateX(0)';
        }
      }
    }
    setIsSwiping(false);
    setStartX(null);
    setCurrentX(null);
  };
  
  // 修改 handleMouseStart
  const handleMouseStart = (e: React.MouseEvent<HTMLDivElement>) => {
    setStartX(e.clientX);
    setCurrentX(e.clientX);
    setIsSwiping(true);
    if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isSwiping && startX !== null) {
      const current = e.clientX;
      setCurrentX(current);
      const deltaX = current - startX;
      if (modalContentRef.current) {
        modalContentRef.current.style.transition = 'none';
        modalContentRef.current.style.transform = `translateX(${deltaX}px)`;
      }
    }
  };

  // 修改 handleMouseEnd
  const handleMouseEnd = () => {
    handleTouchEnd();
  };
  
  const handleMouseLeave = () => {
    if (isSwiping) {
       handleTouchEnd();
    }
  };

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
    if (swipeDirection === 'prev') return 'animate-slide-in-right';
    if (swipeDirection === 'next') return 'animate-slide-in-left';
    return 'animate-fade-in-scale';
  };

  return (
    // Modal backdrop
    <div
      className={`fixed inset-0 bg-black/50 ${darkMode ? 'dark' : ''} backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out`}
      onClick={onClose}
    >
      <div className="flex items-center justify-center w-full max-w-3xl gap-2">
        {canSwipePrev && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-shrink-0 text-white bg-black/40 hover:bg-black/60 rounded-full h-14 w-12 p-0 flex items-center justify-center shadow-md"
            onClick={(e) => {
              e.stopPropagation();
              onSwipe('prev');
            }}
            aria-label="上一个单词"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}
        
        <div
          ref={modalContentRef}
          className={`bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md ${getSlideAnimationClass()} transition-transform duration-300 ease-in-out relative`}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseStart}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseEnd}
          onMouseLeave={handleMouseLeave}
          style={{ cursor: isSwiping ? 'grabbing' : 'grab' }}
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
        </div>
        
        {canSwipeNext && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-shrink-0 text-white bg-black/40 hover:bg-black/60 rounded-full h-14 w-12 p-0 flex items-center justify-center shadow-md"
            onClick={(e) => {
              e.stopPropagation();
              onSwipe('next');
            }}
            aria-label="下一个单词"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
};

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
