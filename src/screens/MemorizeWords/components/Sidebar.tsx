import React from 'react';
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { ArrowLeft, Search, PlusCircle, Settings, X, Sun, Moon, Maximize, Minimize } from 'lucide-react';

interface SidebarProps {
  isSearchFocused: boolean;
  handleCloseSearch: () => void;
  handleGoHome: () => void;
  handleSearchClick: () => void;
  shouldShowAddWordsButton: boolean;
  handleOpenAddWordsDialog: () => void;
  handleGoToSettings: () => void;
  isFullscreen: boolean;
  handleToggleFullscreen: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
  searchQuery: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isSearchFocused,
  handleCloseSearch,
  handleGoHome,
  handleSearchClick,
  shouldShowAddWordsButton,
  handleOpenAddWordsDialog,
  handleGoToSettings,
  isFullscreen,
  handleToggleFullscreen,
  darkMode,
  toggleDarkMode,
  searchInputRef,
  searchQuery,
  handleSearchChange,
}) => {
  return (
    <div
      className={`fixed top-1/2 left-4 transform -translate-y-1/2 ${
        isSearchFocused ? 'w-72' : 'w-20'
      } bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-3 flex flex-col items-center shadow-lg z-20 rounded-2xl transition-all duration-300 ease-in-out h-auto
        max-sm:top-4 max-sm:left-1/2 max-sm:-translate-x-1/2 max-sm:translate-y-0 max-sm:flex-row max-sm:w-auto max-sm:gap-2 max-sm:rounded-full max-sm:p-2`}
    >
      {isSearchFocused && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCloseSearch}
          className="absolute top-2 right-2 w-7 h-7 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full z-10
                           max-sm:relative max-sm:top-auto max-sm:right-auto max-sm:order-last"
          aria-label="关闭搜索"
        >
          <X className="w-4 h-4" />
        </Button>
      )}

      {[
        { icon: ArrowLeft, label: "返回", onClick: handleGoHome, active: false },
        { icon: Search, label: "搜索", onClick: handleSearchClick, active: isSearchFocused },
        ...(shouldShowAddWordsButton ? [{ icon: PlusCircle, label: "添加单词", onClick: handleOpenAddWordsDialog, active: false }] : []),
        { icon: Settings, label: "设置", onClick: handleGoToSettings, active: false },
      ].map(({ icon: Icon, label, onClick, active }) => (
        <Button
          key={label}
          variant="ghost"
          size="icon"
          onClick={onClick}
          disabled={isSearchFocused && label !== '搜索'}
          className={`w-14 h-14 rounded-xl flex-shrink-0 mb-3 transition-all duration-200 ease-in-out flex items-center justify-center ${
            active
              ? 'bg-primary text-primary-foreground scale-105 shadow-md'
              : `bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:hover:bg-gray-100 dark:disabled:hover:bg-gray-700`
          }
             max-sm:w-10 max-sm:h-10 max-sm:mb-0 max-sm:rounded-full`}
          aria-label={label}
        >
          <Icon className={`w-6 h-6 ${darkMode ? 'opacity-90' : 'opacity-80'} max-sm:w-5 max-sm:h-5`} />
        </Button>
      ))}

      {/* 全屏按钮 */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggleFullscreen}
        disabled={isSearchFocused}
        className={`w-14 h-14 rounded-xl flex-shrink-0 mb-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white transition-all duration-200 ease-in-out disabled:opacity-50 disabled:hover:bg-gray-100 dark:disabled:hover:bg-gray-700 flex items-center justify-center
            max-sm:w-10 max-sm:h-10 max-sm:mb-0 max-sm:rounded-full`}
        aria-label={isFullscreen ? "退出全屏" : "进入全屏"}
      >
        {isFullscreen ? <Minimize className="w-6 h-6 opacity-90 max-sm:w-5 max-sm:h-5" /> : <Maximize className="w-6 h-6 opacity-90 max-sm:w-5 max-sm:h-5" />}
      </Button>

      {/* 夜间模式按钮 */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleDarkMode}
        disabled={isSearchFocused}
        className={`w-14 h-14 rounded-xl flex-shrink-0 mb-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white transition-all duration-200 ease-in-out disabled:opacity-50 disabled:hover:bg-gray-100 dark:disabled:hover:bg-gray-700 flex items-center justify-center
            max-sm:w-10 max-sm:h-10 max-sm:mb-0 max-sm:rounded-full`}
        aria-label={darkMode ? "切换到白天模式" : "切换到夜晚模式"}
      >
        {darkMode ? <Sun className="w-6 h-6 text-yellow-400 opacity-100 max-sm:w-5 max-sm:h-5" /> : <Moon className="w-6 h-6 text-blue-500 opacity-90 max-sm:w-5 max-sm:h-5" />}
      </Button>

      <div className={`w-full px-1 overflow-hidden transition-all duration-300 ease-in-out ${isSearchFocused ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'}
                       max-sm:absolute max-sm:top-full max-sm:left-0 max-sm:right-0 max-sm:bg-white dark:max-sm:bg-gray-800 max-sm:p-3 max-sm:shadow-md max-sm:rounded-b-xl max-sm:mt-1 z-20`}
      >
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 px-1 hidden sm:block">搜索单词</p>
        <div className="relative">
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="搜索..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-3 pr-8 py-2 h-9 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:bg-white dark:focus:bg-gray-600 focus:border-primary focus:ring-1 focus:ring-primary text-sm"
          />
          <Search className="absolute right-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 peer-focus:text-primary" />
        </div>
      </div>
    </div>
  );
}; 