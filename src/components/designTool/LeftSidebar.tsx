import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Search, Moon, Maximize, LucideIcon, Sun, Clock } from 'lucide-react';
import styles from './LeftSidebar.module.css';
import { ThemeSetting, useSettings } from '../../context/SettingsContext';

interface SidebarButtonProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  isActive?: boolean;
}

const SidebarButton: React.FC<SidebarButtonProps> = ({ icon: Icon, label, onClick, isActive }) => {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={`${styles.sidebarButton} ${isActive ? styles.activeButton : ''}`}
      aria-label={label}
    >
      <Icon className="w-5 h-5" />
    </Button>
  );
};

interface LeftSidebarProps {
  onToggleFullscreen: () => void;
  onToggleNightMode: () => void;
  onSearch: () => void;
  onSettings: () => void;
  isFullscreen?: boolean;
  currentTheme?: ThemeSetting;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  onToggleFullscreen,
  onToggleNightMode,
  onSearch,
  onSettings,
  currentTheme,
}) => {
  const { settings, updateSetting } = useSettings();
  const { showClock } = settings;

  const effectiveTheme = currentTheme === 'system'
    ? (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : currentTheme;

  const isDark = effectiveTheme === 'dark';

  return (
    <aside className={`${styles.leftSidebar} ${isDark ? styles.dark : ''}`}>
      <SidebarButton icon={Maximize} label="全屏" onClick={onToggleFullscreen} />
      <SidebarButton 
        icon={effectiveTheme === 'dark' ? Sun : Moon} 
        label={effectiveTheme === 'dark' ? "切换日间模式" : "切换夜间模式"} 
        onClick={onToggleNightMode} 
      />
      <SidebarButton icon={Search} label="搜索" onClick={onSearch} />
      <SidebarButton
        icon={Clock}
        label="行走时钟"
        onClick={() => updateSetting('showClock', !showClock)}
        isActive={showClock}
      />
      <SidebarButton icon={Settings} label="设置" onClick={onSettings} />
    </aside>
  );
};

export default LeftSidebar; 