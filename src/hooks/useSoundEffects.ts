import React, { useRef, useEffect } from 'react';
import { useSound } from '../context/SoundContext'; // 修正导入路径

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
  'summaryAppear'; // 新增：总结界面出现音效

// 创建 Audio 对象的映射
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
  summaryAppear: '/sounds/explosionCrunch_004.ogg', // 新增
};

// Helper to create the initial ref value with all keys set to null
const createInitialAudioRefs = (): Record<SoundType, HTMLAudioElement | null> => {
  const refs: Partial<Record<SoundType, HTMLAudioElement | null>> = {};
  (Object.keys(soundFiles) as SoundType[]).forEach(key => {
    refs[key] = null;
  });
  return refs as Record<SoundType, HTMLAudioElement | null>; // Assert type after population
};

// Hook
export function useSoundEffects() {
  const { isSoundEnabled, volume } = useSound();
  // 初始化 useRef，包含所有 key，值为 null
  const audioRefs = useRef<Record<SoundType, HTMLAudioElement | null>>(createInitialAudioRefs());
  const isChainPlayingRef = useRef(false);

  // 预加载/创建/清理 Audio 对象
  useEffect(() => {
    if (!isSoundEnabled) {
      // 如果音效被禁用，暂停音频但不清除 refs
      Object.values(audioRefs.current).forEach(audio => {
        if (audio) {
          audio.pause();
        }
      });
      isChainPlayingRef.current = false;
      return;
    }

    // 音效启用时，加载或创建音频对象
    Object.entries(soundFiles).forEach(([key, src]) => {
      const type = key as SoundType;
      // 如果 ref 存在但 audio 对象为 null，则创建
      if (audioRefs.current[type] === null) { 
        try {
          const audio = new Audio(src);
          audio.load();
          if (type === 'chainLoop') {
            audio.loop = true;
          }
          audioRefs.current[type] = audio;
          console.log(`Preloading sound: ${src}`);
        } catch (error) {
          console.error(`Failed to create or load audio for ${type}:`, error);
        }
      }
    });

    // 清理函数（组件卸载时）
    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        if (audio) {
          audio.pause();
        }
      });
      isChainPlayingRef.current = false;
    };
  }, [isSoundEnabled]);

  // 通用播放逻辑 (检查 audioRefs.current[type] 是否为 null)
  const playSound = (type: SoundType) => {
    if (!isSoundEnabled) return;
    const audio = audioRefs.current[type]; // 直接访问，因为 key 保证存在
    if (audio) { // 检查对象是否已创建
      audio.volume = volume;
      audio.currentTime = 0;
      audio.play().catch(error => {
        if (error.name !== 'AbortError') {
          console.error(`Error playing sound (${type}):`, error);
        }
      });
    } else {
      // 理论上不应该发生，因为 useEffect 会创建，但可以保留警告或尝试即时创建
      console.warn(`Sound object for ${type} is unexpectedly null.`);
      // Optionally, try immediate creation again
      // try { ... } catch { ... }
    }
  };

  // --- Chain Sound Specific Functions (检查 audioRefs.current.chainLoop 是否为 null) ---
  const startChainSound = () => {
    if (!isSoundEnabled || isChainPlayingRef.current) return;
    const audio = audioRefs.current.chainLoop;
    if (audio) {
      audio.volume = volume;
      audio.currentTime = 0;
      audio.loop = true;
      audio.play().then(() => {
        isChainPlayingRef.current = true;
        console.log("Chain sound started");
      }).catch(error => {
        if (error.name !== 'AbortError') {
          console.error("Error starting chain sound:", error);
        }
        isChainPlayingRef.current = false;
      });
    } else {
      console.warn("Chain sound object is unexpectedly null, cannot start.");
    }
  };

  const stopChainSound = () => {
    const audio = audioRefs.current.chainLoop;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      console.log("Chain sound stopped");
    }
    isChainPlayingRef.current = false;
  };

  const updateChainPlaybackRate = (rate: number) => {
    if (!isSoundEnabled) return;
    const audio = audioRefs.current.chainLoop;
    const clampedRate = Math.max(0.1, Math.min(rate, 4.0));
    if (audio) {
      try {
        if (typeof audio.playbackRate === 'number') {
          audio.playbackRate = clampedRate;
        } else {
          console.warn('playbackRate property not supported or writable on this audio element.');
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
  const playNextPageSound = () => playSound('nextPage');
  const playPrevPageSound = () => playSound('prevPage');
  const playSummaryAppearSound = () => playSound('summaryAppear'); // 新增

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
    playSummaryAppearSound, // 新增
    // Chain sound exports
    startChainSound,
    stopChainSound,
    updateChainPlaybackRate,
  };
} 