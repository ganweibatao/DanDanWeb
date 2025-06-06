// 1.用户触发播放发音 → 调用 playPronunciation 函数
// 2.useQuery 检查缓存，如果没有则调用 fetchWordPronunciationBlobs
// 3.通过后端代理请求有道词典API获取音频
// 4.将返回的 Blob 创建为 Object URL
// 5.使用 HTML5 Audio API 播放音频
// 6.播放结束后清理资源（撤销 Object URL）
// 用户触发播放发音 (playPronunciation)
//           ↓
//     React Query 内存缓存有数据？
//           ↓                    ↓
//         有 ✅                  没有 ❌
//           ↓                    ↓
//     直接使用缓存        调用 fetchWordPronunciationBlobs
//       播放音频                  ↓  
//                         检查 IndexedDB 有数据？
//                               ↓                ↓
//                             有 ✅              没有 ❌
//                               ↓                ↓
//                         读取 IndexedDB      请求后端接口
//                         检查 IndexedDB 有数据？
//                               ↓                ↓
//                             有 ✅              没有 ❌
//                               ↓                ↓
//                         读取 IndexedDB      请求后端接口
//                         返回 Blob               ↓
//                               ↓           获取到 Blob？
//                         存入 RQ 缓存             ↓
//                         播放音频               有 ✅
//                                                 ↓
//                                        存入 IndexedDB
//                                              ↓
//                                        存入 RQ 缓存
//                                              ↓
//                                          播放音频

import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { pronunciationService } from '@/services/dictionaryService';
import { savePronunciationBlobToIDB, getPronunciationBlobFromIDB, removePronunciationBlobFromIDB } from '@/utils/pronunciationIDB';

// --- 类型定义 --- 
export type PronunciationBlobs = { 
  uk_audio_blob?: Blob; 
  us_audio_blob?: Blob;
};
export type PronunciationError = Error;
export type PronunciationType = 'uk' | 'us';

// --- 获取函数，内置速率限制 --- 
export async function fetchWordPronunciationBlobs(word: string): Promise<PronunciationBlobs> {
  if (!word || word.trim().length === 0) return {};
  // 先查本地 IndexedDB
  console.log(`[Pronunciation] 👀 检查 IndexedDB 是否已有 "${word}" 的发音缓存 …`);
  const localBlob = await getPronunciationBlobFromIDB(word);
  if (localBlob && localBlob.size > 0) {
    console.log(`[Pronunciation] ✅ 命中 IndexedDB，直接返回 "${word}" 的发音 Blob`);
    return { uk_audio_blob: localBlob, us_audio_blob: localBlob };
  }
  // 没有就请求网络
  console.log(`[Pronunciation] 📡 IndexedDB 未命中，准备向后端接口请求 "${word}" 的发音 …`);
  const blob = await pronunciationService.getYoudaoPronunciation(word);
  if (blob && blob.size > 0) {
    console.log(`[Pronunciation] ✅ 从后端获取 "${word}" 发音成功，写入 IndexedDB 并返回`);
    await savePronunciationBlobToIDB(word, blob);
    return { uk_audio_blob: blob, us_audio_blob: blob };
  }
  return {};
}

export function useWordPronunciation(word: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const queryClient = useQueryClient();

  // --- useQuery 直接调用 fetchWordPronunciationBlobs --- 
  const {
    data: audioBlobs,
    isLoading: isLoadingBlobs,
    error: fetchError,
    isSuccess,
    isError,
  } = useQuery<PronunciationBlobs, PronunciationError>({
    queryKey: ['pronunciationBlob', word],
    queryFn: () => fetchWordPronunciationBlobs(word),
    enabled: !!word && word.trim().length > 0,
    staleTime: 1000 * 60 * 60, // 1小时
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7天
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    select: (data) => {
      if (!data || (!data.uk_audio_blob && !data.us_audio_blob)) return undefined as any;
      if (data.uk_audio_blob && !(data.uk_audio_blob instanceof Blob)) return undefined as any;
      return data;
    },
  });
  
  // --- Effect to handle fetch errors (optional logging/notification) ---
   useEffect(() => {
    if (isError && fetchError) {
      console.error(`[RQ Hook] Error fetching pronunciation blobs for "${word}":`, fetchError.message);
      // toast.error(`获取 "${word}" 发音数据失败`); // Optional UI feedback
    }
  }, [isError, fetchError, word]);

  // --- Effect to revoke Object URL on unmount or when word changes --- 
  useEffect(() => {
      return () => {
          if (objectUrlRef.current) {
              URL.revokeObjectURL(objectUrlRef.current);
              objectUrlRef.current = null;
          }
      };
  }, [word]);

  // --- 使用 Blob 和 Object URL --- 
  const playPronunciation = useCallback(async (type: PronunciationType = 'us', customWord?: string) => {
    const wordToPlay = customWord || word;
    
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
      audioRef.current = null;
    }
    setIsPlayingAudio(false);
    
    // 如果传了 customWord，需要动态获取其发音数据
    let currentBlobs: PronunciationBlobs | undefined;
    let isLoadingCustom = false;
    let hasErrorCustom = false;
    
    if (customWord && customWord !== word) {
      // 为自定义单词动态获取发音数据
      try {
        setIsPlayingAudio(true); // 设置加载状态
        currentBlobs = await fetchWordPronunciationBlobs(customWord);
        if (!currentBlobs || (!currentBlobs.uk_audio_blob && !currentBlobs.us_audio_blob)) {
          hasErrorCustom = true;
        }
      } catch (error) {
        hasErrorCustom = true;
        console.error(`获取 "${customWord}" 发音数据失败:`, error);
      }
      setIsPlayingAudio(false);
    } else {
      // 使用当前 hook 的数据
      isLoadingCustom = isLoadingBlobs;
      hasErrorCustom = isError;
      currentBlobs = audioBlobs as PronunciationBlobs;
    }
    
    if (isLoadingCustom) {
      toast.info('正在加载发音数据...');
      return;
    }
    if (hasErrorCustom || !currentBlobs) {
      toast.error(`无法播放 "${wordToPlay}" 的发音，获取数据时出错或无数据。`);
      return;
    }
    
    const blobToPlay = type === 'uk' ? currentBlobs.uk_audio_blob : currentBlobs.us_audio_blob;
    const fallbackBlob = type === 'uk' ? currentBlobs.us_audio_blob : currentBlobs.uk_audio_blob;
    let finalBlob: Blob | undefined = blobToPlay || fallbackBlob;
    let playingType = blobToPlay ? type : (fallbackBlob ? (type === 'uk' ? 'us' : 'uk') : undefined);
    if (!finalBlob || !playingType) {
      toast.info(`单词 "${wordToPlay}" 没有可用的本地发音数据。`);
      return;
    }
    if (blobToPlay !== finalBlob && finalBlob) {
      toast.info(`单词 "${wordToPlay}" 没有 ${type === 'uk' ? '英式' : '美式'} 发音，将播放 ${playingType === 'uk' ? '英式' : '美式'} 发音。`);
    }
    try {
      setIsPlayingAudio(true);
      if (!(finalBlob instanceof Blob)) {
        toast.error(`无法播放 "${wordToPlay}" 的发音，fetch 到的数据格式不正确。`);
        setIsPlayingAudio(false);
        return;
      }
      const newObjectUrl = URL.createObjectURL(finalBlob);
      objectUrlRef.current = newObjectUrl;
      audioRef.current = new Audio(newObjectUrl);
      const cleanupAndRevoke = () => {
        if (objectUrlRef.current === newObjectUrl) {
          URL.revokeObjectURL(newObjectUrl);
          objectUrlRef.current = null;
        }
        if (audioRef.current) {
          audioRef.current.removeAttribute('src');
          audioRef.current = null;
        }
        setIsPlayingAudio(false);
      };
      audioRef.current.onended = cleanupAndRevoke;
      audioRef.current.onerror = cleanupAndRevoke;
      await audioRef.current.play();
    } catch (error) {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.removeAttribute('src');
        audioRef.current = null;
      }
      setIsPlayingAudio(false);
    }
  }, [word, audioBlobs, isLoadingBlobs, isSuccess, isError]);

  // 添加手动清理缓存的函数
  const invalidateCache = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['pronunciationBlob', word] });
    queryClient.removeQueries({ queryKey: ['pronunciationBlob', word] });
    removePronunciationBlobFromIDB(word);
    toast.info(`已清理 "${word}" 的发音缓存，将重新获取`);
  }, [word, queryClient]);

  // --- 记录 React Query 缓存命中情况 ---
  useEffect(() => {
    if (isSuccess && audioBlobs && !isLoadingBlobs) {
      console.log(`[Pronunciation] 💾 React Query 缓存命中，已加载 "${word}" 的发音 Blob`);
    }
  }, [isSuccess, isLoadingBlobs, audioBlobs, word]);

  return {
    isLoading: isLoadingBlobs,
    isPlayingAudio,
    playPronunciation,
    hasUkPronunciation: !!(audioBlobs as PronunciationBlobs | undefined)?.uk_audio_blob,
    hasUsPronunciation: !!(audioBlobs as PronunciationBlobs | undefined)?.us_audio_blob,
    fetchError: fetchError,
    invalidateCache,
  };
} 