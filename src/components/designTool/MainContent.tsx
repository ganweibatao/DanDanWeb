import React, { useState } from 'react';
import styles from './MainContent.module.css';
import { WordList } from '../../screens/MemorizeWords/components/WordListAndCard';
import { DisplayVocabularyWord } from '../../screens/MemorizeWords/types';
import Pagination from '../designTool/Pagination';

// 模拟数据和函数，后续需要替换为真实逻辑
const mockWords: DisplayVocabularyWord[] = [
    { id: 1, word: 'spread', translation: '传播', pronunciation: '/spred/', part_of_speech: 'v.' },
    { id: 2, word: 'translation', translation: '译文; 译本', pronunciation: '/[trænzˈleɪʃn]/', part_of_speech: 'n.' },
    { id: 3, word: 'take in', translation: '吸收; 摄入', pronunciation: '/[teɪk ɪn]/', part_of_speech: 'phr.' },
    { id: 4, word: 'greenhouse gas', translation: '温室气体', pronunciation: '/[ˈɡriːnhaʊs ɡæs]/', part_of_speech: 'phr.' },
    { id: 5, word: 'to begin with', translation: '首先; 第一点', pronunciation: '/[tə bɪˈɡɪn wɪð]/', part_of_speech: 'phr.' },
    { id: 6, word: 'come from', translation: '来自', pronunciation: '/[kʌm frɒm]/', part_of_speech: 'phr.' },
    { id: 7, word: 'come from', translation: '来自', pronunciation: '/[kʌm frɒm]/', part_of_speech: 'phr.' },
];

const mockKnownWordIds = new Set<number>();
const mockFontSizes = { english: 18, pronunciation: 12, chinese: 14 }; // 调整字号以匹配图片
const mockSwipeState = new Map<number, { startX: number; currentX: number; isSwiping: boolean }>();

// TODO: 实现这些交互函数
const mockFunction = (...args: any[]) => { console.log('Function called:', args); };
const mockSwipeEndFunction = (...args: any[]): boolean => { console.log('Swipe end function called:', args); return false; };

const ITEMS_PER_PAGE = 5; // Define how many items to show per page

const MainContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(mockWords.length / ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentWords = mockWords.slice(startIndex, endIndex);

  return (
    <div className={styles.pageContainer}> 
      <h2 className={styles.listTitle}>List 3</h2>
      <main className={styles.mainContent}>
        <WordList
          words={currentWords}
          knownWordIds={mockKnownWordIds}
          fontSizes={mockFontSizes}
          darkMode={false}
          showCover={false}
          coverPosition={0}
          revealedWordId={null}
          swipeState={mockSwipeState}
          onSwipeStart={mockFunction}
          onSwipeMove={mockFunction}
          onSwipeEnd={mockSwipeEndFunction}
          onMouseDown={mockFunction}
          onMouseUp={mockFunction}
          onMouseLeave={mockFunction}
          onTouchStart={mockFunction}
          onTouchEnd={mockFunction}
          onDoubleClick={mockFunction}
        />
      </main>
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default MainContent;