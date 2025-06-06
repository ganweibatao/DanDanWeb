import React, { useState } from 'react';
import styles from './DesignToolPage.module.css';
import Header from '../components/designTool/Header';
import LeftSidebar from '../components/designTool/LeftSidebar';
import MainContent from '../components/designTool/MainContent';
import BottomToolbar from '../components/designTool/BottomToolbar';
import { useFullscreen } from '../hooks/useFullscreen';
import { useSettings } from '../context/SettingsContext'; // Import useSettings

const DesignToolPage: React.FC = () => {
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const { settings, setTheme } = useSettings(); // Use the SettingsContext
  const [isNotesPanelOpen, setIsNotesPanelOpen] = useState(false);

  const handleToggleNightMode = () => {
    // Toggle between 'light' and 'dark' mode
    // If current theme is 'system', assume it resolved to 'light' for toggling to 'dark' first
    // or check resolved system theme if needed for more precise toggle from system.
    const currentTheme = settings.theme === 'system' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') 
      : settings.theme;
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  };

  const handleSearch = () => {
    // TODO: Implement search functionality
    console.log('Search activated');
  };

  const handleToggleNotesPanel = () => {
    setIsNotesPanelOpen(prev => !prev);
    // TODO: Implement actual notes panel display logic 
    console.log('Toggle Notes Panel. Is open:', !isNotesPanelOpen);
  };

  const handleSettings = () => {
    // TODO: Implement settings panel logic, maybe open SettingsPanel component
    console.log('Settings activated');
  };

  return (
    <div className={styles.pageContainer}>
      <Header />
      <div className={styles.mainArea}>
        <LeftSidebar 
          onToggleFullscreen={toggleFullscreen}
          onToggleNightMode={handleToggleNightMode}
          onSearch={handleSearch}
          onToggleNotesPanel={handleToggleNotesPanel}
          isNotesPanelActive={isNotesPanelOpen}
          onSettings={handleSettings}
          isFullscreen={isFullscreen}
          currentTheme={settings.theme} // Pass current theme to LeftSidebar
        />
        <div className={styles.contentWrapper}>
          <MainContent />
          {/* {isNotesPanelOpen && <AnnotationPanel />} */}
        </div>
      </div>
      <BottomToolbar />
    </div>
  );
};

export default DesignToolPage; 