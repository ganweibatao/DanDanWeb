import { set, get, del } from 'idb-keyval';

/**
 * 将音频 Blob 存入 IndexedDB
 */
export async function savePronunciationBlobToIDB(word: string, blob: Blob) {
  await set(`pronunciation-blob-${word}`, blob);
}

/**
 * 从 IndexedDB 获取音频 Blob
 */
export async function getPronunciationBlobFromIDB(word: string): Promise<Blob | undefined> {
  return await get(`pronunciation-blob-${word}`);
}

/**
 * 删除 IndexedDB 中的音频 Blob
 */
export async function removePronunciationBlobFromIDB(word: string) {
  await del(`pronunciation-blob-${word}`);
}

/**
 * 将音效 Blob 存入 IndexedDB
 */
export async function saveSoundBlobToIDB(path: string, blob: Blob) {
  await set(`sound-blob-${path}`, blob);
}

/**
 * 从 IndexedDB 获取音效 Blob
 */
export async function getSoundBlobFromIDB(path: string): Promise<Blob | undefined> {
  return await get(`sound-blob-${path}`);
}

/**
 * 删除 IndexedDB 中的音效 Blob
 */
export async function removeSoundBlobFromIDB(path: string) {
  await del(`sound-blob-${path}`);
} 