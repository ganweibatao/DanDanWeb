import React, { useState } from 'react';
import styles from './BottomToolbar.module.css';
import { ThemeSetting, useSettings } from '../../context/SettingsContext';

// SVG Icon Components
const LayersIcon = ({ size = 16, color = "currentColor" }: { size?: number, color?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
    <polyline points="2 17 12 22 22 17"></polyline>
    <polyline points="2 12 12 17 22 12"></polyline>
  </svg>
);

const EyeSlashIcon = ({ size = 16, color = "currentColor" }: { size?: number, color?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

const ShuffleIcon = ({ size = 16, color = "currentColor" }: { size?: number, color?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 3 21 3 21 8"></polyline>
    <line x1="4" y1="20" x2="21" y2="3"></line>
    <polyline points="21 16 21 21 16 21"></polyline>
    <line x1="15" y1="15" x2="21" y2="21"></line>
    <line x1="4" y1="4" x2="9" y2="9"></line>
  </svg>
);

const AddIcon = ({ size = 16, color = "currentColor" }: { size?: number, color?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

interface BottomToolbarProps {
  onToggleScrollMode: () => void;
  onToggleCover: () => void;
  onToggleShuffle: () => void;
  onOpenAddWordsDialog: () => void;
  onGoBack?: () => void;
  isScrollModeActive?: boolean;
  isCoverActive?: boolean;
  isShuffleActive?: boolean;
  theme?: ThemeSetting;
}

const BottomToolbar: React.FC<BottomToolbarProps> = ({
  onToggleScrollMode,
  onToggleCover,
  onToggleShuffle,
  onOpenAddWordsDialog,
  onGoBack,
  isScrollModeActive,
  isCoverActive,
  isShuffleActive,
  theme
}) => {
  const [activeViewMode, setActiveViewMode] = useState<'laptop' | 'tablet' | 'mobile'>('laptop');
  const { settings, updateSetting } = useSettings();
  const { fontSizes, baseFontSize } = settings;
  const mainFontPx = Math.round(17 * (baseFontSize / 100));

  const isDark = theme === 'dark' || 
                 (theme === 'system' && window.matchMedia?.('(prefers-color-scheme: dark)').matches);

  const handleViewModeChange = (mode: 'laptop' | 'tablet' | 'mobile') => {
    setActiveViewMode(mode);
  };

  const handleFontSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateSetting('baseFontSize', Number(event.target.value));
  };

  // Simple SVG for a back arrow
  const BackArrowIcon = () => (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  );
  
  const LaptopIcon = ({ size = 16, color = "currentColor" }: { size?: number, color?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <line x1="2" y1="20" x2="22" y2="20"></line>
    </svg>
  );

  const TabletIcon = ({ size = 16, color = "currentColor" }: { size?: number, color?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
        <line x1="12" y1="18" x2="12.01" y2="18"></line>
    </svg>
  );

  return (
    <footer className={`${styles.bottomToolbar} ${isDark ? styles.dark : ''}`}>
      <div className={styles.leftControls}>
        <button className={styles.sitemapButton} onClick={onGoBack}>
          <BackArrowIcon />
          返回
        </button>
        {/* <button className={`${styles.iconOnlyButton} ${styles.iconOnlyButton}`}>
             <MenuIcon size={18}/>
        </button> */}
      </div>

      <div className={styles.centerControls}>
        <div className={styles.toolButtonContainer}>
          <button
            className={styles.squareButton}
            onClick={onOpenAddWordsDialog}
          >
            <span>添加</span>
          </button>
          <button 
            className={`${styles.squareButton} ${isScrollModeActive ? styles.active : ''}`}
            onClick={onToggleScrollMode}
          >
            <span>分页</span>
          </button>
          <button 
            className={`${styles.squareButton} ${isCoverActive ? styles.active : ''}`}
            onClick={onToggleCover}
          >
            <span>遮板</span>
          </button>
          <button 
            className={`${styles.squareButton} ${isShuffleActive ? styles.active : ''}`}
            onClick={onToggleShuffle}
          >
            <span>打乱</span>
          </button>
        </div>
      </div>

      <div className={styles.rightControls}>
        <div className={styles.fontSizeSliderContainer}>
          <input 
            type="range" 
            min="78" 
            max="122" 
            value={settings.baseFontSize}
            className={styles.fontSizeSlider} 
            aria-label="Font size"
            onChange={handleFontSizeChange}
          />
          <span className={styles.fontSizePercentage}>{mainFontPx}px</span>
        </div>
        <div className={styles.viewModeToggle}>
          <button 
            className={`${styles.iconOnlyButton} ${activeViewMode === 'laptop' ? styles.active : ''}`}
            aria-label="Desktop view"
            onClick={() => handleViewModeChange('laptop')}
          >
            <LaptopIcon size={18}/>
          </button>
          <button 
            className={`${styles.iconOnlyButton} ${activeViewMode === 'tablet' ? styles.active : ''}`}
            aria-label="Tablet view"
            onClick={() => handleViewModeChange('tablet')}
          >
            <TabletIcon size={18} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default BottomToolbar; 