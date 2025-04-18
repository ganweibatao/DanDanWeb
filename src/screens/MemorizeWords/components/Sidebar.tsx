import React, { useState } from 'react';
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
  // 移动端判断
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 640;

  return (
    <>
      {/* PC端悬浮侧边栏 */}
      <div
        className={`
          hidden sm:flex fixed top-1/2 left-4 z-40
          transform -translate-y-1/2
          bg-white/80 dark:bg-gray-800/80 backdrop-blur-md
          shadow-2xl rounded-[2rem]
          flex-col items-center
          transition-all duration-300
          w-14 px-2
          py-4
          border border-gray-100 dark:border-gray-700
        `}
      >
        {isSearchFocused && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCloseSearch}
            className="absolute top-2 right-2 w-7 h-7 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full z-10"
            aria-label="关闭搜索"
          >
            <X className="w-4 h-4" />
          </Button>
        )}

        {/* 主按钮组 */}
        <div className="flex-1 flex flex-col justify-center items-center w-full">
          <div className="flex flex-col items-center w-full space-y-1">
            {[
              { icon: ArrowLeft, label: "返回", onClick: handleGoHome },
              { icon: Search, label: "搜索", onClick: handleSearchClick },
              ...(shouldShowAddWordsButton ? [{ icon: PlusCircle, label: "添加单词", onClick: handleOpenAddWordsDialog }] : []),
              { icon: Settings, label: "设置", onClick: handleGoToSettings },
            ].map(({ icon: Icon, label, onClick }) => (
              <Button
                key={label}
                variant="ghost"
                size="icon"
                onClick={onClick}
                className={`
                  w-12 h-12 rounded-2xl flex-shrink-0
                  transition-all duration-200
                  text-gray-500 dark:text-gray-300
                  hover:text-green-600 hover:bg-green-50 dark:hover:text-green-400 dark:hover:bg-gray-700
                  active:scale-95
                `}
                aria-label={label}
              >
                <Icon className="w-6 h-6" />
              </Button>
            ))}
          </div>

          {/* 分割线 */}
          <div className="w-8 h-0.5 bg-gray-200 dark:bg-gray-700 my-1 rounded-full" />

          {/* 底部按钮组 */}
          <div className="flex flex-col items-center w-full space-y-1">
            {/* 全屏按钮 */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleFullscreen}
              disabled={isSearchFocused}
              className={`w-12 h-12 rounded-2xl flex-shrink-0 transition-all duration-200 text-gray-500 dark:text-gray-300 hover:text-green-600 hover:bg-green-50 dark:hover:text-green-400 dark:hover:bg-gray-700 active:scale-95 mb-1 flex items-center justify-center`}
              aria-label={isFullscreen ? "退出全屏" : "进入全屏"}
            >
              {isFullscreen ? <Minimize className="w-6 h-6 opacity-90" /> : <Maximize className="w-6 h-6 opacity-90" />}
            </Button>

            {/* 夜间模式按钮 */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              disabled={isSearchFocused}
              className={`w-12 h-12 rounded-2xl flex-shrink-0 transition-all duration-200 text-gray-500 dark:text-gray-300 hover:text-green-600 hover:bg-green-50 dark:hover:text-green-400 dark:hover:bg-gray-700 active:scale-95 flex items-center justify-center`}
              aria-label={darkMode ? "切换到白天模式" : "切换到夜晚模式"}
            >
              {darkMode ? <Sun className="w-6 h-6 text-yellow-400 opacity-100" /> : <Moon className="w-6 h-6 text-blue-500 opacity-90" />}
            </Button>
          </div>
        </div>
      </div>

      {/* 移动端底部横排栏 */}
      <div
        className="sm:hidden fixed bottom-0 left-0 right-0 z-30 flex flex-row justify-around items-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-2xl py-2 px-2 rounded-t-2xl"
        style={{ boxShadow: '0 0 24px 0 rgba(0,0,0,0.10)' }}
      >
        {[
          { icon: ArrowLeft, label: "返回", onClick: handleGoHome },
          { icon: Search, label: "搜索", onClick: handleSearchClick },
          ...(shouldShowAddWordsButton ? [{ icon: PlusCircle, label: "添加单词", onClick: handleOpenAddWordsDialog }] : []),
          { icon: Settings, label: "设置", onClick: handleGoToSettings },
          { icon: isFullscreen ? Minimize : Maximize, label: isFullscreen ? "退出全屏" : "全屏", onClick: handleToggleFullscreen },
          { icon: darkMode ? Sun : Moon, label: darkMode ? "白天" : "夜晚", onClick: toggleDarkMode },
        ].map(({ icon: Icon, label, onClick }) => (
          <Button
            key={label}
            variant="ghost"
            size="icon"
            onClick={onClick}
            className="w-10 h-10 rounded-xl flex-shrink-0 hover:bg-green-100 dark:hover:bg-gray-700 transition-all duration-200"
            aria-label={label}
          >
            <Icon className="w-6 h-6" />
          </Button>
        ))}
      </div>
    </>
  );
}; 