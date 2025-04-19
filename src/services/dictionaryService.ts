import axios from 'axios';
import { apiClient } from './api';

export interface DictDefinition {
  definition: string;
  synonyms: string[];
  antonyms: string[];
  example?: string;
}

export interface DictMeaning {
  partOfSpeech: string;
  definitions: DictDefinition[];
}

export interface DictionaryEntry {
  word: string;
  phonetics: { text?: string; audio?: string }[];
  meanings: DictMeaning[];
}

// 只用 dictionaryapi.dev
export const dictionaryService = {
  getWordDetails: async (word: string): Promise<DictionaryEntry[]> => {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
    const res = await axios.get<DictionaryEntry[]>(url);
    return res.data;
  },
};

// 工具函数：从 dictionaryapi.dev 的 meanings/definitions 字段中提取同义词、反义词、派生词
export function parseSynAntoDerivativesFromDictApi(entries: DictionaryEntry[]) {
  const synonyms = new Set<string>();
  const antonyms = new Set<string>();
  const derivatives = new Set<string>(); // 派生词没有专门字段，这里用 definitions 里的 synonyms/antonyms 近似

  entries.forEach(entry => {
    entry.meanings.forEach(meaning => {
      meaning.definitions.forEach(def => {
        def.synonyms?.forEach(s => synonyms.add(s));
        def.antonyms?.forEach(a => antonyms.add(a));
        // 派生词没有专门字段，部分词典会把派生词也放在 synonyms 里
      });
    });
  });

  // 派生词无法直接获得，部分词典会把派生词放在 synonyms 里，或者 definitions 里有描述
  // 这里只能返回 synonyms/antonyms
  return {
    synonyms: Array.from(synonyms),
    antonyms: Array.from(antonyms),
    derivatives: Array.from(derivatives), // 目前为空
  };
}

// 新增：Datamuse API 查询
export const datamuseService = {
  // 查询简要释义（definition）、词性（part of speech）
  getDefinitions: async (word: string): Promise<{defs: string[], pos: string[]}> => {
    // md=d: definition, md=p: part of speech
    const url = `https://api.datamuse.com/words?sp=${encodeURIComponent(word)}&md=dp&max=1`;
    const res = await axios.get(url);
    const item = res.data[0];
    return {
      defs: item?.defs ? item.defs.map((d: string) => d.replace(/^.+\t/, '')) : [],
      pos: item?.tags?.filter((t: string) => ['n', 'v', 'adj', 'adv'].includes(t)) || [],
    };
  },
  // 查询近义词
  getSynonyms: async (word: string): Promise<string[]> => {
    const url = `https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}`;
    const res = await axios.get(url);
    return res.data.map((item: any) => item.word);
  },
  // 查询反义词
  getAntonyms: async (word: string): Promise<string[]> => {
    const url = `https://api.datamuse.com/words?rel_ant=${encodeURIComponent(word)}`;
    const res = await axios.get(url);
    return res.data.map((item: any) => item.word);
  },
  // 查询派生词（parent/root）
  getDerivatives: async (word: string): Promise<string[]> => {
    const url = `https://api.datamuse.com/words?rel_der=${encodeURIComponent(word)}`;
    const res = await axios.get(url);
    return res.data.map((item: any) => item.word);
  },
  // 查询短语（包含该词的短语）
  getPhrases: async (word: string): Promise<string[]> => {
    const url = `https://api.datamuse.com/words?rel_com=${encodeURIComponent(word)}`;
    const res = await axios.get(url);
    return res.data.map((item: any) => item.word);
  },
};

export const icibaService = {
  getSuggest: async (word: string) => {
    const res = await apiClient.get('/vocabulary/iciba_suggest/', { params: { word } });
    return res.data;
  },
}; 