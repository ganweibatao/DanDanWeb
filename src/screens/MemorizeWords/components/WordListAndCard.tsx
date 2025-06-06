import React, { useEffect, useState } from "react";
import { Check, RotateCcw, Volume2, Loader2 } from "lucide-react";
import { DisplayVocabularyWord } from "../types";
import { useWordPronunciation } from "../../../hooks/useWordPronunciation";
import { useSoundEffects } from "../../../hooks/useSoundEffects";
import { useSettings } from "../../../context/SettingsContext";

// WordCard 组件
interface WordCardProps {
  word: DisplayVocabularyWord;
  isKnown: boolean;
  index: number;
  fontSizes: { english: number; pronunciation: number; chinese: number };
  darkMode: boolean;
  showCover: boolean;
  coverPosition: number;
  revealedWordId: number | null;
  swipeState: Map<number, { startX: number; currentX: number; isSwiping: boolean }>;
  onSwipeStart: (wordId: number, clientX: number) => void;
  onSwipeMove: (wordId: number, clientX: number) => void;
  onSwipeEnd: (wordId: number, word?: DisplayVocabularyWord) => boolean;
  onMouseDown: (wordId: number) => void;
  onMouseUp: () => void;
  onMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => void;
  onTouchStart: (wordId: number) => void;
  onTouchEnd: () => void;
  onDoubleClick: (word: DisplayVocabularyWord) => void;
  knownWordIds: Set<number>;
}

export const WordCard: React.FC<WordCardProps> = ({
  word,
  isKnown,
  index,
  fontSizes,
  showCover,
  coverPosition,
  revealedWordId,
  swipeState,
  onSwipeStart,
  onSwipeMove,
  onSwipeEnd,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  onTouchStart,
  onTouchEnd,
  onDoubleClick,
  knownWordIds,
}) => {
  const { playMarkKnownSound, playRestoreSound } = useSoundEffects();
  const { settings } = useSettings();
  const { wordItemBgColor, theme, baseFontSize } = settings;
  const [isHovering, setIsHovering] = useState(false);

  // 计算实际字号
  const computedFontSizes = {
    english: fontSizes.english * (baseFontSize / 100),
    pronunciation: fontSizes.pronunciation * (baseFontSize / 100),
    chinese: fontSizes.chinese * (baseFontSize / 100),
  };

  const currentSwipeState = swipeState.get(word.id);
  const swipeDeltaX = currentSwipeState?.isSwiping ? currentSwipeState.startX - currentSwipeState.currentX : 0;
  const translateX = currentSwipeState?.isSwiping ? Math.max(0, Math.min(swipeDeltaX, 100)) : 0;
  const showSwipeBg = currentSwipeState?.isSwiping && swipeDeltaX > 10;
  const canHover = !currentSwipeState?.isSwiping;

  const { 
      isLoading: isPronunciationLoading, 
      playPronunciation, 
  } = useWordPronunciation(word.word);

  const wordContentClassName = `word-content flex items-center p-3 transition-all duration-200 ease-in-out rounded-lg border \
    border-green-200 dark:border-green-700/50 \
    ${isKnown ? 'is-known' : ''} \
    ${canHover ? 'hover:shadow-sm hover:border-green-300 dark:hover:border-green-600 cursor-pointer' : ''} \
    ${showCover && revealedWordId === word.id ? 'word-revealed' : ''}`;

  const wordTextClassName = `${theme === 'dark' ? (isKnown ? 'text-gray-400' : 'text-gray-100') : (isKnown ? 'text-gray-500' : 'text-gray-900')}`;

  const wordContentStyle: React.CSSProperties = {
    transform: `translateX(-${translateX}px)`,
    backgroundColor: undefined,
  };

  if (theme === 'light') {
    const hoverBgColor = '#f9f9f9';
    if (isHovering && canHover) {
      wordContentStyle.backgroundColor = hoverBgColor;
    } else {
      wordContentStyle.backgroundColor = wordItemBgColor;
    }
  }

  // 用于区分单击和双击
  const clickTimer = React.useRef<NodeJS.Timeout | null>(null);
  // 新增：用于防止滑动后立即触发单击发音
  const justSwiped = React.useRef(false);
  const justSwipedTimer = React.useRef<NodeJS.Timeout | null>(null);

  const handleSwipeEnd = (wordId: number) => {
    const currentSwipe = swipeState.get(wordId);
    const swipeDeltaX = currentSwipe ? currentSwipe.startX - currentSwipe.currentX : 0;
    const isRealSwipe = currentSwipe?.isSwiping && Math.abs(swipeDeltaX) > 10; // 只认定滑动距离大于10px为滑动

    const marked = onSwipeEnd(wordId, word);
    if (marked) {
      const currentlyKnown = knownWordIds.has(wordId);
      console.log(`Word ${wordId} swipe ended. Marked: ${marked}, Currently Known: ${currentlyKnown}`);
      if (marked && !currentlyKnown) {
        playMarkKnownSound();
      } else if (!marked && currentlyKnown) {
        playRestoreSound();
      }
    }
    // 只有真正滑动时才设置 justSwiped
    if (isRealSwipe) {
      justSwiped.current = true;
      if (justSwipedTimer.current) clearTimeout(justSwipedTimer.current);
      justSwipedTimer.current = setTimeout(() => {
        justSwiped.current = false;
      }, 120);
    }
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (clickTimer.current) clearTimeout(clickTimer.current);
      if (justSwipedTimer.current) clearTimeout(justSwipedTimer.current);
    };
  }, []);

  return (
    <div className="word-item-wrapper" data-word-id={word.id}>
      {/* Swipe Background */}
      {showSwipeBg && (
        <div
          className={`swipe-background ${isKnown ? 'restore' : 'mark-known'}`}
        >
          {isKnown ? <RotateCcw className="w-5 h-5" /> : <Check className="w-5 h-5" />}
          <span className="ml-1 text-sm font-medium">{isKnown ? '恢复' : '已认识'}</span>
        </div>
      )}
      {/* Word Content */}
      <div
        className={wordContentClassName}
        style={wordContentStyle}
        onMouseEnter={() => canHover && setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseDown={(e) => {
          setIsHovering(false);
          onSwipeStart(word.id, e.clientX);
          if (showCover) onMouseDown(word.id);
        }}
        onMouseMove={(e) => onSwipeMove(word.id, e.clientX)}
        onMouseUp={(e) => {
          handleSwipeEnd(word.id);
          if (showCover) onMouseUp();
        }}
        onTouchStart={(e) => {
          onSwipeStart(word.id, e.touches[0].clientX);
          if (showCover) onTouchStart(word.id);
        }}
        onTouchMove={(e) => onSwipeMove(word.id, e.touches[0].clientX)}
        onTouchEnd={(e) => {
          handleSwipeEnd(word.id);
          if (showCover) onTouchEnd();
        }}
        onDoubleClick={() => {
          // 双击时只弹窗，不发音
          if (clickTimer.current) {
            clearTimeout(clickTimer.current);
            clickTimer.current = null;
          }
          onDoubleClick(word);
        }}
        onClick={(e) => {
          // 用定时器区分单击和双击
          if (
            e.detail === 2 ||
            (swipeState.get(word.id)?.isSwiping) ||
            (showCover && revealedWordId === word.id) ||
            justSwiped.current // 新增：滑动后短时间内禁止发音
          ) {
            return;
          }
          if (clickTimer.current) {
            clearTimeout(clickTimer.current);
            clickTimer.current = null;
          }
          clickTimer.current = setTimeout(() => {
            playPronunciation('us');
            clickTimer.current = null;
          }, 200); // 200ms内未双击则视为单击
        }}
      >
        <div className="w-6 text-center flex-shrink-0 mr-3 text-gray-500 dark:text-gray-400 text-sm font-medium">
          {index + 1}
        </div>
        <div className="flex-1 flex items-center gap-2">
          <div>
            <p className={wordTextClassName + " font-medium truncate"} style={{ fontSize: `${computedFontSizes.english}px` }}>{word.word}</p>
            {word?.pronunciation && (
              <p className={`${isKnown ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'} truncate`} style={{ fontSize: `${computedFontSizes.pronunciation}px` }}>
                [{word.pronunciation}]
              </p>
            )}
          </div>
        </div>
        <div className="text-right ml-3 flex items-center gap-1.5 flex-grow justify-end">
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-1.5">
              {word?.part_of_speech && (
                <span className={`inline-flex items-center rounded-md \
                  ${isKnown ? 'bg-gray-100 dark:bg-gray-700/30 text-gray-500 dark:text-gray-400 ring-gray-500/20 dark:ring-gray-500/30 opacity-50' 
                           : 'bg-green-100 dark:bg-green-800/30 text-green-700 dark:text-green-200 ring-green-600/20 dark:ring-green-500/30'} \
                  px-1.5 py-0.5 \
                  text-xs font-medium \
                  ring-1 ring-inset`}>
                  {word.part_of_speech}
                </span>
              )}
              {word?.translation && (
                <p className={`text-sm ${isKnown ? 'text-gray-400 dark:text-gray-500 opacity-50' : 'text-gray-600 dark:text-gray-200'}`} style={{ fontSize: `${computedFontSizes.chinese}px` }}>
                  {showCover && coverPosition >= 40 && revealedWordId !== word.id ? (
                    <span className="blur-sm select-none">{"●".repeat(Math.min(10, (word.translation || '').length))}</span>
                  ) : (
                    word.translation || <span className="italic text-gray-500 dark:text-gray-400">无释义</span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// WordList 组件
interface WordListProps {
  words: DisplayVocabularyWord[];
  knownWordIds: Set<number>;
  fontSizes: { english: number; pronunciation: number; chinese: number };
  darkMode: boolean;
  showCover: boolean;
  coverPosition: number;
  revealedWordId: number | null;
  swipeState: Map<number, { startX: number; currentX: number; isSwiping: boolean }>;
  onSwipeStart: (wordId: number, clientX: number) => void;
  onSwipeMove: (wordId: number, clientX: number) => void;
  onSwipeEnd: (wordId: number, word?: DisplayVocabularyWord) => boolean;
  onMouseDown: (wordId: number) => void;
  onMouseUp: () => void;
  onMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => void;
  onTouchStart: (wordId: number) => void;
  onTouchEnd: () => void;
  onDoubleClick: (word: DisplayVocabularyWord) => void;
}

export const WordList: React.FC<WordListProps> = (props) => {
  const { settings } = useSettings();
  const { baseFontSize } = settings;
  // 计算实际字号
  const computedFontSizes = {
    english: props.fontSizes.english * (baseFontSize / 100),
    pronunciation: props.fontSizes.pronunciation * (baseFontSize / 100),
    chinese: props.fontSizes.chinese * (baseFontSize / 100),
  };
  return (
    <div className="space-y-1 w-full">
      {props.words.length > 0 ? (
        props.words.map((word, idx) => (
          <WordCard
            key={word.id}
            word={word}
            index={idx}
            isKnown={props.knownWordIds.has(word.id)}
            fontSizes={computedFontSizes}
            darkMode={props.darkMode}
            showCover={props.showCover}
            coverPosition={props.coverPosition}
            revealedWordId={props.revealedWordId}
            swipeState={props.swipeState}
            onSwipeStart={props.onSwipeStart}
            onSwipeMove={props.onSwipeMove}
            onSwipeEnd={props.onSwipeEnd}
            onMouseDown={props.onMouseDown}
            onMouseUp={props.onMouseUp}
            onMouseLeave={props.onMouseLeave}
            onTouchStart={props.onTouchStart}
            onTouchEnd={props.onTouchEnd}
            onDoubleClick={props.onDoubleClick}
            knownWordIds={props.knownWordIds}
          />
        ))
      ) : (
        <div className="flex items-center justify-center h-full min-h-[100px]">
          <p className="text-gray-500 dark:text-gray-400">没有需要学习的单词</p>
        </div>
      )}
    </div>
  );
}; 