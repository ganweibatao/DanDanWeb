import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

// 使用 dictionaryapi.dev 获取发音链接
async function fetchWordPronunciation(word: string): Promise<{ uk_audio_url?: string; us_audio_url?: string }> {
  console.log(`Fetching pronunciation for: ${word} using dictionaryapi.dev`);
  if (!word) {
    return {};
  }

  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);

    if (!response.ok) {
      // Handle common errors like 404 Not Found
      if (response.status === 404) {
        console.warn(`Word "${word}" not found on dictionaryapi.dev.`);
        // Return empty object as no pronunciation is available
        return {};
      } else {
        // Throw for other server-side errors
        throw new Error(`API request failed with status ${response.status}`);
      }
    }

    const data = await response.json();

    // Check if data is an array and has content
    if (Array.isArray(data) && data.length > 0) {
      const entry = data[0]; // Use the first entry
      if (entry.phonetics && Array.isArray(entry.phonetics)) {
        // Find the first phonetic object with a valid audio URL
        const phoneticWithAudio = entry.phonetics.find((p: any) => p.audio && typeof p.audio === 'string' && p.audio.trim() !== '');

        if (phoneticWithAudio) {
          let uk_audio: string | undefined = undefined;
          let us_audio: string | undefined = undefined;

          // Basic check for common indicators (might need refinement)
          if (phoneticWithAudio.audio.includes('_gb')) {
             uk_audio = phoneticWithAudio.audio;
          } else if (phoneticWithAudio.audio.includes('_us')) {
             us_audio = phoneticWithAudio.audio;
          } else {
             // If no clear indicator, assign to US audio as a default or based on other logic
             // Or potentially check phoneticWithAudio.text for IPA variations if needed
             us_audio = phoneticWithAudio.audio; // Defaulting to US for now
          }
           // Ensure URLs start with https:
          if (uk_audio?.startsWith('//')) uk_audio = 'https:' + uk_audio;
          if (us_audio?.startsWith('//')) us_audio = 'https:' + us_audio;

           console.log(`Found audio for "${word}": UK=${uk_audio}, US=${us_audio}`);
          return {
            uk_audio_url: uk_audio,
            us_audio_url: us_audio,
          };
        }
      }
    }

    console.warn(`No valid pronunciation audio found for "${word}" in the API response.`);
    return {}; // Return empty if no audio found in phonetics

  } catch (error) {
    console.error(`Error fetching pronunciation for "${word}":`, error);
    // Don't show toast here, let the calling hook handle UI feedback
    // toast.error(`获取 "${word}" 发音失败`);
    return {}; // Return empty object on fetch error
  }
}

type PronunciationType = 'uk' | 'us';

export function useWordPronunciation(word: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrls, setAudioUrls] = useState<{ uk_audio_url?: string; us_audio_url?: string } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchUrls = useCallback(async () => {
    if (!word || audioUrls) return; // 如果没有单词或已加载，则不执行

    setIsLoading(true);
    try {
      const urls = await fetchWordPronunciation(word);
      setAudioUrls(urls);
      if (!urls.uk_audio_url && !urls.us_audio_url) {
        // 可以选择性地提示用户没有找到发音
        // toast.info(`未找到单词 "${word}" 的发音`);
        console.warn(`Pronunciation not found for word: ${word}`);
      }
    } catch (error) {
      console.error("Failed to fetch pronunciation:", error);
      toast.error(`获取 "${word}" 发音失败`);
      setAudioUrls(null); // 出错时重置
    } finally {
      setIsLoading(false);
    }
  }, [word, audioUrls]);

  const playPronunciation = useCallback(async (type: PronunciationType = 'us') => {
    // 1. 获取 URL
    let urlsToPlay = audioUrls;
    if (!urlsToPlay) {
      // 如果 URL 尚未加载，先尝试加载
      setIsLoading(true);
      try {
        urlsToPlay = await fetchWordPronunciation(word);
        setAudioUrls(urlsToPlay);
        if (!urlsToPlay.uk_audio_url && !urlsToPlay.us_audio_url) {
          console.warn(`Pronunciation not found for word: ${word}`);
           toast.info(`未找到单词 "${word}" 的发音`);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error("Failed to fetch pronunciation:", error);
        toast.error(`获取 "${word}" 发音失败`);
        setAudioUrls(null);
        setIsLoading(false);
        return;
      } finally {
         // 不论成功失败都结束 Loading 状态，除非下面找到 URL 并开始播放
      }
    }

    // 2. 选择要播放的 URL
    const urlToPlay = type === 'uk' ? urlsToPlay?.uk_audio_url : urlsToPlay?.us_audio_url;
    // 如果首选类型没有，尝试播放另一种类型
    const fallbackUrl = type === 'uk' ? urlsToPlay?.us_audio_url : urlsToPlay?.uk_audio_url;
    const finalUrl = urlToPlay || fallbackUrl;

    if (!finalUrl) {
      toast.info(`单词 "${word}" 没有可用的 ${type === 'uk' ? '英式' : '美式'} 发音`);
      setIsLoading(false); // 确保没有 URL 时 loading 结束
      return;
    }

    // 3. 播放音频
    try {
        setIsLoading(true); // 开始播放前设置为 true
        if (audioRef.current) {
            audioRef.current.pause(); // 停止当前可能正在播放的音频
        }
        audioRef.current = new Audio(finalUrl);
        audioRef.current.oncanplaythrough = () => {
            audioRef.current?.play().catch(e => {
                console.error("Audio play failed:", e);
                toast.error("音频播放失败");
                setIsLoading(false); // 播放失败也需要结束 loading
            });
        };
        audioRef.current.onended = () => {
            setIsLoading(false); // 播放结束
            audioRef.current = null;
        };
         audioRef.current.onerror = (e) => {
            console.error("Audio loading/playback error:", e);
            toast.error("加载或播放音频时出错");
            setIsLoading(false); // 出错结束 loading
            audioRef.current = null;
        };
        // 加载音频资源
        audioRef.current.load();

    } catch (error) {
        console.error("Error playing audio:", error);
        toast.error("播放音频时出错");
        setIsLoading(false);
        audioRef.current = null;
    }
  }, [word, audioUrls]);

  // 可选：预加载 URL，例如当单词卡片可见时
  const preloadUrls = useCallback(() => {
    if (!isLoading && !audioUrls) {
      fetchUrls();
    }
  }, [isLoading, audioUrls, fetchUrls]);

  return {
    isLoading,
    playPronunciation,
    preloadUrls, // 可以暴露预加载方法
    hasUkPronunciation: !!audioUrls?.uk_audio_url,
    hasUsPronunciation: !!audioUrls?.us_audio_url,
  };
} 