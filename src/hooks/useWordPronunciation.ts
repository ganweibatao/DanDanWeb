import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

// --- 类型定义 --- 
type PronunciationBlobs = { uk_audio_blob?: Blob; us_audio_blob?: Blob };
type PronunciationError = Error;
type PronunciationType = 'uk' | 'us';

// --- 模块级变量，用于速率限制 --- 
let lastPronunciationFetchStartTime = 0;
const MIN_INTERVAL_MS = 50; // 每两次网络请求之间的最小间隔

// --- 获取函数，内置速率限制 --- 
async function fetchWordPronunciationBlobs(word: string): Promise<PronunciationBlobs> {

  // --- 在实际网络请求前应用速率限制 ---
  const now = Date.now();
  const timeSinceLastFetch = now - lastPronunciationFetchStartTime;
  const delayNeeded = MIN_INTERVAL_MS - timeSinceLastFetch;

  if (delayNeeded > 0) {
      console.log(`[Rate Limit] Delaying fetch for "${word}" by ${delayNeeded}ms`);
      await new Promise(resolve => setTimeout(resolve, delayNeeded));
  }
  // 更新时间戳，标记本次网络请求的开始
  lastPronunciationFetchStartTime = Date.now();
  console.log(`[Rate Limit] Starting fetch for "${word}" at ${lastPronunciationFetchStartTime}`);
  // --- 速率限制结束 ---

  if (!word || word.trim().length === 0) {
    return {};
  }

  let uk_audio_url: string | undefined = undefined;
  let us_audio_url: string | undefined = undefined;

  // Step 1: Fetch URLs from dictionaryapi.dev
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    if (!response.ok) {
      if (response.status === 404) {
        return {}; // Word not found, return empty blobs
      } else {
        throw new Error(`API request for URLs failed with status ${response.status}`);
      }
    }
    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      const entry = data[0]; // Use first entry
      if (entry.phonetics && Array.isArray(entry.phonetics)) {
        // Find UK audio URL more robustly
        const ukPhonetic = entry.phonetics.find((p: any) => p.audio && (p.audio.includes('-uk') || p.audio.includes('_gb') || (p.text && p.text.includes('-uk'))));
        if (ukPhonetic?.audio) {
            uk_audio_url = ukPhonetic.audio.startsWith('//') ? 'https:' + ukPhonetic.audio : ukPhonetic.audio;
        }

        // Find US audio URL more robustly
        const usPhonetic = entry.phonetics.find((p: any) => p.audio && (p.audio.includes('-us') || (p.text && p.text.includes('-us'))));
        if (usPhonetic?.audio) {
            us_audio_url = usPhonetic.audio.startsWith('//') ? 'https:' + usPhonetic.audio : usPhonetic.audio;
        }

        // Fallback: if no specific found, try the first available audio
        if (!uk_audio_url && !us_audio_url) {
          const firstAudioPhonetic = entry.phonetics.find((p: any) => p.audio && typeof p.audio === 'string' && p.audio.trim() !== '');
          if (firstAudioPhonetic?.audio) {
            // Assign to US by default in fallback, or could be UK based on context
            us_audio_url = firstAudioPhonetic.audio.startsWith('//') ? 'https:' + firstAudioPhonetic.audio : firstAudioPhonetic.audio;
            console.warn(`[RQ Blob Fetch] No specific UK/US URL for "${word}", using first available as US.`);
          }
        }
        // Prevent assigning the same URL if somehow matched by both specific searches
        else if (uk_audio_url === us_audio_url && uk_audio_url) {
             uk_audio_url = undefined; // Prioritize US
        }
      }
    }
  } catch (error) {
    // Don't throw here, let Step 2 handle potential partial success
    // Consider returning {} or letting it proceed if one URL was found before error
  }

  if (!uk_audio_url && !us_audio_url) {
    console.warn(`[RQ Blob Fetch] No valid pronunciation URLs found for "${word}".`);
    return {}; // No URLs found, return empty blobs
  }

  // Step 2: Fetch Blobs for valid URLs sequentially with delay
  const blobs: PronunciationBlobs = {};

  const fetchBlob = async (url: string, type: PronunciationType): Promise<[PronunciationType, Blob | null]> => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${type.toUpperCase()} blob: ${response.status}`);
      }
      const blob = await response.blob();
      return [type, blob];
    } catch (err) {
      console.error(`[RQ Blob Fetch] Error fetching ${type.toUpperCase()} blob for "${word}":`, err);
      return [type, null]; // Return null on error
    }
  };

  // Fetch UK blob if URL exists
  if (uk_audio_url) {
    try {
      const [type, blob] = await fetchBlob(uk_audio_url, 'uk');
      if (blob) blobs.uk_audio_blob = blob;
    } catch (e) {
        // Error already logged in fetchBlob, continue to next fetch if possible
    }
  }

  // If both URLs exist, wait 100ms before fetching the US blob
  if (uk_audio_url && us_audio_url) {
    await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
  }

  // Fetch US blob if URL exists
  if (us_audio_url) {
     try {
       const [type, blob] = await fetchBlob(us_audio_url, 'us');
       if (blob) blobs.us_audio_blob = blob;
     } catch (e) {
        // Error already logged in fetchBlob
     }
  }

  return blobs;
}

export function useWordPronunciation(word: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null); // Ref to store the current Object URL
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // --- useQuery 直接调用 fetchWordPronunciationBlobs --- 
  const {
    data: audioBlobs,
    isLoading: isLoadingBlobs,
    error: fetchError,
    isSuccess,
    isError,
  } = useQuery<PronunciationBlobs, PronunciationError>({
    queryKey: ['pronunciationBlob', word],
    queryFn: () => fetchWordPronunciationBlobs(word), // <-- 直接调用
    enabled: !!word && word.trim().length > 0,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
    placeholderData: { uk_audio_blob: undefined, us_audio_blob: undefined },
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
              console.log("[Cleanup] Revoking Object URL:", objectUrlRef.current);
              URL.revokeObjectURL(objectUrlRef.current);
              objectUrlRef.current = null;
          }
      };
  }, [word]);

  // --- playPronunciation 使用 Blob 和 Object URL --- 
  const playPronunciation = useCallback(async (type: PronunciationType = 'us') => {
    // Revoke previous Object URL & cleanup audio element
    if (objectUrlRef.current) {
        console.log("[Play] Revoking previous Object URL:", objectUrlRef.current);
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
    }
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src'); // More reliable cleanup
        audioRef.current.load(); // Reset internal state
        audioRef.current = null;
    }
    setIsPlayingAudio(false);

    if (isLoadingBlobs) {
      toast.info("正在加载发音数据...");
      return;
    }
    if (isError || !isSuccess || !audioBlobs) {
      toast.error(`无法播放 "${word}" 的发音，获取数据时出错或无数据。`);
      return;
    }

    const currentBlobs = audioBlobs as PronunciationBlobs; // Assert type after success check
    const blobToPlay = type === 'uk' ? currentBlobs.uk_audio_blob : currentBlobs.us_audio_blob;
    const fallbackBlob = type === 'uk' ? currentBlobs.us_audio_blob : currentBlobs.uk_audio_blob;

    let finalBlob: Blob | undefined = blobToPlay || fallbackBlob;
    let playingType = blobToPlay ? type : (fallbackBlob ? (type === 'uk' ? 'us' : 'uk') : undefined);

    if (!finalBlob || !playingType) {
        toast.info(`单词 "${word}" 没有可用的本地发音数据。`);
        return;
    }

    if (blobToPlay !== finalBlob && finalBlob) {
        toast.info(`单词 "${word}" 没有 ${type === 'uk' ? '英式' : '美式'} 发音，将播放 ${playingType === 'uk' ? '英式' : '美式'} 发音。`);
    }

    try {
      setIsPlayingAudio(true);
      // Create and store the new Object URL
      const newObjectUrl = URL.createObjectURL(finalBlob);
      objectUrlRef.current = newObjectUrl; // Store the new URL

      audioRef.current = new Audio(newObjectUrl);

      const cleanupAndRevoke = () => {
        if (objectUrlRef.current === newObjectUrl) { // Only revoke if it's still the current URL
            URL.revokeObjectURL(newObjectUrl);
            objectUrlRef.current = null;
        }
         if (audioRef.current) {
             audioRef.current.removeAttribute('src');
             audioRef.current = null;
         }
        setIsPlayingAudio(false);
      };

      audioRef.current.onended = () => {
        console.log(`[Play] Audio ended for ${newObjectUrl}`);
        cleanupAndRevoke();
      };
      audioRef.current.onerror = (e) => {
        console.error("Audio loading/playback error:", newObjectUrl, e);
        toast.error("加载或播放音频时出错");
        cleanupAndRevoke();
      };

      // Play the audio
      await audioRef.current.play();

    } catch (error) {
      console.error("Error initiating audio playback:", error);
      toast.error("启动音频播放时出错");
      // Ensure cleanup even if play() fails immediately
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
  }, [word, audioBlobs, isLoadingBlobs, isSuccess, isError]); // Dependencies

  return {
    isLoading: isLoadingBlobs,
    isPlayingAudio,
    playPronunciation,
    hasUkPronunciation: !!(audioBlobs as PronunciationBlobs | undefined)?.uk_audio_blob,
    hasUsPronunciation: !!(audioBlobs as PronunciationBlobs | undefined)?.us_audio_blob,
    fetchError: fetchError,
  };
} 