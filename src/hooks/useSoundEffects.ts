import { useSettings } from '../context/SettingsContext'; // Import useSettings
import { useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import { getSoundBlobFromIDB, saveSoundBlobToIDB } from '../utils/pronunciationIDB';

// 定义音效类型
type SoundType = 
  'markKnown' | 'restore' | 
  'correct' | 'incorrect' | 
  'openCover' | 'closeCover' | 
  'shuffle' | 'restoreOrder' | 
  'switchToPagination' | 'switchToScroll' | 
  'completeLearning' | 
  'chainLoop' | 
  'summaryAppear' | 'playEatAppleSound' | 'snakeHiss' | 'bonkWall' | 'success';

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
  summaryAppear: '/sounds/explosionCrunch_004.ogg', 
  playEatAppleSound: '/sounds/apple-bite.mp3',
  snakeHiss: '/sounds/hiss3-103123.mp3', // 新增：蛇嘶嘶声音
  bonkWall: '/sounds/bonk-99378.mp3', // 新增：撞墙音效
  success: '/sounds/success.mp3', // 新增：游戏成功音效路径 (请替换为实际文件)
};

// 加载音频资源的函数（支持持久化缓存）
const loadAudio = async (path: string): Promise<Blob> => {
  // 1. 先查本地缓存
  let blob = await getSoundBlobFromIDB(path);
  if (blob) {
    // console.log('[loadAudio] 命中本地缓存', path, blob);
    return blob;
  }
  // 2. 本地没有，从网络加载
  const response = await fetch(path);
  blob = await response.blob();
  // 3. 存入本地
  await saveSoundBlobToIDB(path, blob);
  // console.log('[loadAudio] 网络加载并存入本地', path, blob);
  return blob;
};

// Hook
export function useSoundEffects() {
  // Use useSettings to get sound enablement and volume
  const { settings } = useSettings();
  const { isSoundEnabled, volume } = settings; // Destructure from settings
  const queryClient = useQueryClient();
  const chainAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // 预加载所有音频文件
  Object.entries(soundFiles).forEach(([_, path]) => {
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
    if (!isSoundEnabled) {
      console.warn(`[playSound] 音效未开启，跳过播放 type=${type}`);
      return;
    }
    const path = soundFiles[type];
    // 从缓存获取音频 Blob
    const blobFromCache = queryClient.getQueryData<Blob>(['sound', path]);
    const playBlob = (blob: Blob) => {
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.volume = volume;
      audio.playbackRate = playbackRate;
      audio.currentTime = 0;
      audio.play().catch(error => {
        if (error.name !== 'AbortError' && error.name !== 'NotAllowedError') {
          console.error(`[音效播放失败] type=${type}, path=${path}, volume=${volume}, isSoundEnabled=${isSoundEnabled}`, error);
        }
      });
      // 播放完毕后释放 URL
      audio.addEventListener('ended', () => URL.revokeObjectURL(url));
      audio.addEventListener('error', () => URL.revokeObjectURL(url));
    };
    if (blobFromCache instanceof Blob) {
      playBlob(blobFromCache);
    } else {
      loadAudio(path).then(blob => {
        queryClient.setQueryData(['sound', path], blob);
        playBlob(blob);
      }).catch(err => {
        console.error(`[音效加载失败] type=${type}, path=${path}, isSoundEnabled=${isSoundEnabled}`, err);
      });
    }
  };

  // 循环音效相关函数
  const startChainSound = () => {
    if (!isSoundEnabled) return;
    const path = soundFiles.chainLoop;
    const blobFromCache = queryClient.getQueryData<Blob>(['sound', path]);
    const playChainBlob = (blob: Blob) => {
      if (chainAudioRef.current) {
        chainAudioRef.current.pause();
        URL.revokeObjectURL(chainAudioRef.current.src);
      }
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.volume = volume;
      audio.loop = true;
      audio.currentTime = 0;
      audio.play().catch(error => {
        if (error.name !== 'NotAllowedError' && error.name !== 'AbortError') {
          console.error('Error playing chain sound:', error);
        }
      });
      audio.addEventListener('ended', () => URL.revokeObjectURL(url));
      audio.addEventListener('error', () => URL.revokeObjectURL(url));
      chainAudioRef.current = audio;
    };
    if (blobFromCache instanceof Blob) {
      playChainBlob(blobFromCache);
    } else {
      loadAudio(path).then(blob => {
        queryClient.setQueryData(['sound', path], blob);
        playChainBlob(blob);
      }).catch(err => console.error('Failed to load chain sound:', err));
    }
  };

  const stopChainSound = () => {
    if (chainAudioRef.current) {
      try {
        chainAudioRef.current.pause();
        chainAudioRef.current.currentTime = 0;
        URL.revokeObjectURL(chainAudioRef.current.src);
      } catch (error) {
        console.error('Error stopping chain sound:', error);
      }
      chainAudioRef.current = null;
    }
  };

  const updateChainPlaybackRate = (rate: number) => {
    if (!isSoundEnabled) return;
    if (chainAudioRef.current) {
      try {
        const safeRate = Math.max(0.1, Math.min(rate, 4.0));
        chainAudioRef.current.playbackRate = safeRate;
      } catch (error) {
        console.error('Error setting playbackRate:', error);
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
  const playSummaryAppearSound = () => playSound('summaryAppear');
  const playEatAppleSound = () => playSound('playEatAppleSound');
  const playSnakeHissSound = () => playSound('snakeHiss', 1.5);
  const playBonkSound = () => playSound('bonkWall', 1.5);
  const playSuccessSound = () => playSound('success'); // 新增：播放成功音效的函数

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
    playSummaryAppearSound,
    startChainSound,
    stopChainSound,
    updateChainPlaybackRate,
    playEatAppleSound,
    playSnakeHissSound,
    playBonkSound,
    playSuccessSound, // 新增：导出成功音效函数
  };
} 