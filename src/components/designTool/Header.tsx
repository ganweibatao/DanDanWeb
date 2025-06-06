import React, { useState, useRef } from 'react';
import styles from './Header.module.css';
import { ThemeSetting } from '../../context/SettingsContext';
import { useNavigate } from 'react-router-dom';
import { DisplayVocabularyWord } from '../../screens/MemorizeWords/types';
import { ExportType } from '../../components/ui/ExportPdfDialog';
import { useClickOutside } from '../../hooks/useClickOutside';

interface HeaderProps {
  onOpenWordCardView: () => void;
  onExport: (exportType: ExportType) => void;
  theme?: ThemeSetting;
  isScrollModeActive?: boolean;
  currentPageWords?: DisplayVocabularyWord[];
  newTodayWords?: DisplayVocabularyWord[];
  reviewTodayWords?: DisplayVocabularyWord[];
  currentPage?: number;
  isFullscreen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  onOpenWordCardView, 
  onExport,
  theme, 
  currentPageWords,
  newTodayWords,
  reviewTodayWords,
  currentPage,
  isFullscreen
}) => {
  const navigate = useNavigate();
  const isDark = theme === 'dark' || 
                 (theme === 'system' && window.matchMedia?.('(prefers-color-scheme: dark)').matches);
  
  // 添加下拉菜单状态
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉菜单
  useClickOutside(dropdownRef, () => setShowExportDropdown(false));

  const handleSnakeGameClick = () => {
    if (currentPageWords && currentPageWords.length > 0) {
      navigate('/word-snake', { 
        state: { 
          words: currentPageWords, 
          cameFromPage: currentPage,
          autoFullscreen: isFullscreen
        } 
      });
    } else {
      // toast.error("当前没有可用于游戏的单词。");
    }
  };

  const handleExportClick = (type: ExportType) => {
    onExport(type);
    setShowExportDropdown(false);
  };

  return (
    <header className={`${styles.header} ${isDark ? styles.dark : ''}`}>
      <div className={styles.leftSection}>
        <div className={styles.logoContainer}>
          <span className={styles.logoText}>DanZai</span>
        </div>
      </div>

      <div className={styles.centerSection}>
        <nav className={styles.navTabs}>
          <button className={styles.active}>学习</button>
          <button onClick={onOpenWordCardView}>词卡检测</button>
          <button className={styles.official} onClick={handleSnakeGameClick}>单词贪吃蛇游戏</button>
        </nav>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.exportContainer} ref={dropdownRef}>
          <button 
            className={styles.exportButton} 
            onClick={() => setShowExportDropdown(!showExportDropdown)}
          >
          <svg className={styles.downloadIcon} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: 6, verticalAlign: 'middle'}}>
            <path d="M10 3V14M10 14L5 9M10 14L15 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="3" y="16" width="14" height="2" rx="1" fill="currentColor"/>
          </svg>
          导出今日所学 (PDF)
        </button>
          
          {showExportDropdown && (
            <div className={`${styles.exportDropdown} ${isDark ? styles.dark : ''}`}>
              <button onClick={() => handleExportClick('中英')}>中英双语（单词+释义）</button>
              <button onClick={() => handleExportClick('仅中文')}>仅中文释义</button>
              <button onClick={() => handleExportClick('仅英文')}>仅英文单词</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 