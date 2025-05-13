import React, { useRef, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext'; // Import useSettings
import { useQuery, useQueryClient } from '@tanstack/react-query';

// 定义音效类型
type SoundType = 
  'markKnown' | 'restore' | 
  'correct' | 'incorrect' | 
  'openCover' | 'closeCover' | 
  'shuffle' | 'restoreOrder' | 
  'switchToPagination' | 'switchToScroll' | 
  'completeLearning' | 
  'chainLoop' | 
  'nextPage' | 'prevPage' |
  'summaryAppear' | 'playEatAppleSound' | 'snakeHiss' | 'bonkWall'; // 新增：撞墙音效

// 音效文件映射
const soundFiles: Record<SoundType, string> = {
  markKnown: '/sounds/footstep_carpet_001.ogg', // 标记已知声音
  restore: '/sounds/footstep_carpet_004.ogg',
  correct: '/sounds/impactMetal_light_000.mp3',
  incorrect: '/sounds/impactMetal_medium_000.mp3',
  openCover: '/sounds/impactGlass_heavy_002.ogg',
  closeCover: '/sounds/impactGlass_heavy_004.ogg',
  shuffle: '/sounds/impactMining_004.ogg', // 打乱声音
  restoreOrder: '/sounds/impactMining_000.ogg', // 恢复声音
  switchToPagination: '/sounds/impactMetal_heavy_002.ogg', // 分页模式声音
  switchToScroll: '/sounds/impactMetal_heavy_000.ogg', // 滚动模式声音
  completeLearning: '/sounds/impactBell_heavy_000.ogg', // 完成声音
  chainLoop: '/sounds/impactWood_light_000.ogg', // 滚动声音
  nextPage: '/sounds/glitch_004.ogg', // 下一页声音
  prevPage: '/sounds/glitch_001.ogg', // 上一页声音
  summaryAppear: '/sounds/explosionCrunch_004.ogg', 
  playEatAppleSound: '/sounds/apple-bite.mp3',
  snakeHiss: '/sounds/hiss3-103123.mp3', // 新增：蛇嘶嘶声音
  bonkWall: '/sounds/bonk-99378.mp3', // 新增：撞墙音效
};

// 加载音频资源的函数
const loadAudio = async (path: string): Promise<HTMLAudioElement> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio(path);
    
    audio.addEventListener('canplaythrough', () => resolve(audio), { once: true });
    audio.addEventListener('error', (e) => reject(e), { once: true });
    
    audio.load();
  });
};

// Hook
export function useSoundEffects() {
  // Use useSettings to get sound enablement and volume
  const { settings } = useSettings();
  const { isSoundEnabled, volume } = settings; // Destructure from settings
  const queryClient = useQueryClient();
  
  // 预加载所有音频文件
  Object.entries(soundFiles).forEach(([type, path]) => {
    // 如果音效开启，预取所有音频资源
    if (isSoundEnabled) {
      queryClient.prefetchQuery({
        queryKey: ['sound', path],
        queryFn: () => loadAudio(path),
        staleTime: Infinity, // 音频资源永不过期
        gcTime: 1000 * 60 * 60 * 24 * 7, // 7天后从缓存中清除
      });
    }
  });

  // 播放音效的函数
  const playSound = (type: SoundType, playbackRate: number = 1) => {
    if (!isSoundEnabled) return;
    
    const path = soundFiles[type];
    
    // 从缓存获取音频，避免查询
    const audioFromCache = queryClient.getQueryData<HTMLAudioElement>(['sound', path]);
    
    if (audioFromCache && typeof audioFromCache === 'object') {
      try {
        // 使用缓存的音频
        if ('volume' in audioFromCache) audioFromCache.volume = volume;
        if ('currentTime' in audioFromCache) audioFromCache.currentTime = 0;
        if ('playbackRate' in audioFromCache) audioFromCache.playbackRate = playbackRate;
        
        // 检查play方法
        if ('play' in audioFromCache && typeof audioFromCache.play === 'function') {
          audioFromCache.play().catch(error => {
            // 忽略常见的用户交互错误
            if (error.name !== 'AbortError' && error.name !== 'NotAllowedError') {
              console.error(`Error playing sound (${type}):`, error);
            }
          });
        }
      } catch (error) {
        console.error(`Error setting up audio for ${type}:`, error);
      }
    } else {
      // 如果缓存中没有，即时加载并播放
      loadAudio(path).then(audio => {
        try {
          audio.volume = volume;
          queryClient.setQueryData(['sound', path], audio);
          audio.playbackRate = playbackRate;
          audio.play().catch(error => {
            if (error.name !== 'AbortError' && error.name !== 'NotAllowedError') {
              console.error(`Error playing freshly loaded sound (${type}):`, error);
            }
          });
        } catch (error) {
          console.error(`Error with freshly loaded audio for ${type}:`, error);
        }
      }).catch(err => console.error(`Failed to load audio for ${type}:`, err));
    }
  };

  // 循环音效相关函数
  const startChainSound = () => {
    if (!isSoundEnabled) return;
    
    const path = soundFiles.chainLoop;
    const audioFromCache = queryClient.getQueryData<HTMLAudioElement>(['sound', path]);
    
    if (audioFromCache && typeof audioFromCache === 'object') {
      try {
        // 检查音频对象是否有必要的属性
        if ('volume' in audioFromCache) audioFromCache.volume = volume;
        if ('currentTime' in audioFromCache) audioFromCache.currentTime = 0;
        if ('loop' in audioFromCache) audioFromCache.loop = true;
        
        // 检查play方法是否存在且是函数
        if ('play' in audioFromCache && typeof audioFromCache.play === 'function') {
          audioFromCache.play().catch(error => {
            // 忽略用户交互导致的播放错误
            if (error.name !== 'NotAllowedError' && error.name !== 'AbortError') {
              console.error("Error playing chain sound:", error);
            }
          });
        }
      } catch (error) {
        console.error("Error starting chain sound:", error);
      }
    } else if (isSoundEnabled) {
      // 如果缓存中没有，尝试重新加载
      loadAudio(path).then(audio => {
        audio.volume = volume;
        audio.loop = true;
        queryClient.setQueryData(['sound', path], audio);
        audio.play().catch(console.error);
      }).catch(err => console.error("Failed to load chain sound:", err));
    }
  };

  const stopChainSound = () => {
    const path = soundFiles.chainLoop;
    const audioFromCache = queryClient.getQueryData<HTMLAudioElement>(['sound', path]);
    
    if (audioFromCache && audioFromCache.pause && typeof audioFromCache.pause === 'function') {
      try {
        audioFromCache.pause();
        audioFromCache.currentTime = 0;
      } catch (error) {
        console.error("Error stopping chain sound:", error);
      }
    }
  };

  const updateChainPlaybackRate = (rate: number) => {
    if (!isSoundEnabled) return;
    
    const path = soundFiles.chainLoop;
    const audioFromCache = queryClient.getQueryData<HTMLAudioElement>(['sound', path]);
    
    if (audioFromCache && typeof audioFromCache === 'object') {
      try {
        const safeRate = Math.max(0.1, Math.min(rate, 4.0));
        if ('playbackRate' in audioFromCache) {
          audioFromCache.playbackRate = safeRate;
        }
      } catch (error) {
        console.error("Error setting playbackRate:", error);
      }
    }
  };

  // 导出的具体播放函数
  const playMarkKnownSound = () => playSound('markKnown');
  const playRestoreSound = () => playSound('restore');
  const playCorrectSound = () => playSound('correct');
  const playIncorrectSound = () => playSound('incorrect');
  const playOpenCoverSound = () => playSound('openCover');
  const playCloseCoverSound = () => playSound('closeCover');
  const playShuffleSound = () => playSound('shuffle');
  const playRestoreOrderSound = () => playSound('restoreOrder');
  const playSwitchToPaginationSound = () => playSound('switchToPagination');
  const playSwitchToScrollSound = () => playSound('switchToScroll');
  const playCompleteLearningSound = () => playSound('completeLearning');
  const playNextPageSound = () => {};
  const playPrevPageSound = () => {};
  const playSummaryAppearSound = () => playSound('summaryAppear');
  const playEatAppleSound = () => playSound('playEatAppleSound');
  const playSnakeHissSound = () => playSound('snakeHiss', 1.5);
  const playBonkSound = () => playSound('bonkWall', 1.5);

  return {
    playMarkKnownSound,
    playRestoreSound,
    playCorrectSound,
    playIncorrectSound,
    playOpenCoverSound,
    playCloseCoverSound,
    playShuffleSound,
    playRestoreOrderSound,
    playSwitchToPaginationSound,
    playSwitchToScrollSound,
    playCompleteLearningSound,
    playNextPageSound,
    playPrevPageSound,
    playSummaryAppearSound,
    startChainSound,
    stopChainSound,
    updateChainPlaybackRate,
    playEatAppleSound,
    playSnakeHissSound,
    playBonkSound,
  };
} 