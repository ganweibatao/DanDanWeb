// 英语拼读规则（基于发音音节的完整版）TypeScript 迁移版
// 主要导出 splitBySyllables 和 analyzeWordStructure

export interface AnalyzeResult {
  word: string;
  segments: string[];
  syllableCount: number;
  vowelSounds: string[];
  consonantSounds: string[];
  prefixes: string[];
  suffixes: string[];
  pronunciationGuide: string;
}

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);
const VOWEL_COMBINATIONS = [
  'eau', 'ough', 'augh', 'eigh', 'ought',
  'ai', 'ay', 'ee', 'ea', 'ie', 'oa', 'oo', 'ue', 'ui', 'ey', 'ei',
  'au', 'aw', 'ow', 'ou', 'oi', 'oy', 'eu', 'ew', 'igh',
  'ar', 'or', 'er', 'ir', 'ur', 'yr',
  'quar', 'quai', 'quau', 'quea', 'quee', 'quei', 'quie', 'quoa', 'quoo', 'quou',
  'ia', 'io', 'cean', 'ean', 'ian', 'ien', 'oan'
];
const CONSONANT_BLENDS_START = [
  'str', 'spr', 'scr', 'spl', 'squ', 'thr', 'shr', 'chr',
  'bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'pl', 'pr',
  'sl', 'sm', 'sn', 'sp', 'st', 'sw', 'tr', 'tw', 'dw',
  'ch', 'sh', 'th', 'wh', 'ph', 'kn', 'wr', 'gn', 'qu', 'sc', 'sk', 'ps'
];
const CONSONANT_BLENDS_END = [
  'ck', 'ng', 'nk', 'nt', 'nd', 'mp', 'sk', 'sp', 'st', 'ft', 'pt',
  'ct', 'lt', 'rt', 'lk', 'lf', 'lp', 'lm', 'rn', 'rm', 'rb', 'rd',
  'tch', 'dge', 'nch', 'nge', 'tion', 'sion', 'cial', 'tial', 'cian'
];
const PREFIXES = [
  'anti', 'auto', 'counter', 'inter', 'over', 'post', 'pre', 'pro',
  'semi', 'sub', 'super', 'trans', 'ultra', 'under', 'non', 'mis',
  'dis','his','un', 're', 'in', 'im', 'il', 'ir', 'ex', 'de', 'be', 'en', 'em', 'psy'
];
const SUFFIXES = [
  'tion', 'sion', 'cian', 'tian', 'cial', 'tial', 'ment', 'ness', 'ble', 'able','tions','cians',
  'ful', 'less', 'ship', 'hood', 'ward', 'wise', 'like', 'ling', 'ture', 'sure', 'cious', 'tious', 'gious',
  'ware', 'base',
  'neous', 'graph', 'tive', 'cal',
  'ate', 'ive', 'ry', 'ual', 'ous', 'ance', 'ence',
  'ing', 'ed', 'er', 'est', 'ly', 'ty', 'ry', 'sy', 'my', 'py', 'cy', 'gy', 'by', 'dy', 'phy', 'thy', 'chy',
  'en', 'an', 'on', 'in', 'ic', 'al', 'el', 'il', 'ol', 'ul', 'le', 'ue', 'ie', 'ye', 'ae', 'oe',
  'se', 'ce', 'ge', 'te', 'pe', 'ke', 'ze', 've', 'we', 're', 'de', 'me', 'he', 'fe'
];

// 特殊词汇字典
const SPECIAL_WORDS: Record<string, string[]> = {
  'library': ['li', 'brar', 'y'],
  'editorial': ['ed', 'i', 'to', 'ri', 'al'],
  'counterproductive': ['coun', 'ter', 'pro', 'duc', 'tive'],
  'internationalization': ['in', 'ter', 'na', 'tion', 'al', 'i', 'za', 'tion'],
  'responsibility': ['re', 'spon', 'si', 'bil', 'i', 'ty'],
  'personality': ['per', 'son', 'al', 'i', 'ty'],
  'activity': ['ac', 'tiv', 'i', 'ty'],
  'microscope': ['mi', 'cro', 'scope'],
  'telephone': ['tel', 'e', 'phone'],
  'careful': ['care', 'ful'],
  'necessary': ['nec', 'es', 'sa', 'ry'],
  'elementary': ['el', 'e', 'men', 'ta', 'ry'],
  'extraordinary': ['ex', 'tra', 'or', 'di', 'na', 'ry'],
  'geography': ['ge', 'og', 'ra', 'phy'],
  'mountain': ['moun', 'tain'],
  'absolutely': ['ab', 'so', 'lute', 'ly'],
  'creativity': ['cre', 'a', 'tiv', 'i', 'ty'],
  'performance': ['per', 'for', 'mance'],
  'disproportionately': ['dis', 'pro', 'por', 'tion', 'ate', 'ly'],
  'theater': ['the', 'a', 'ter'],
  'museum': ['mu', 'se', 'um'],
  'terrible': ['ter', 'ri', 'ble'],
  'castle': ['cas', 'tle'],
  'homework': ['home', 'work'],
  'beautiful': ['beau', 'ti', 'ful'],
  'family': ['fam', 'i', 'ly'],
  'easily': ['eas', 'i', 'ly'],
  'happily': ['hap', 'pi', 'ly'],
  'heavily': ['heav', 'i', 'ly'],
  'readily': ['read', 'i', 'ly'],
  'psychiatrist': ['psy', 'chi', 'a', 'trist'],
  'psychology': ['psy', 'chol', 'o', 'gy'],
  'psychologist': ['psy', 'chol', 'o', 'gist'],
  'ocean': ['o', 'cean'],
  'afternoon': ['af', 'ter', 'noon'],
  'systematically': ['sys', 'tem', 'at', 'i', 'cal', 'ly'],
  'automatically': ['au', 'to', 'mat', 'i', 'cal', 'ly'],
  'mathematically': ['math', 'e', 'mat', 'i', 'cal', 'ly'],
  'alphabetically': ['al', 'pha', 'bet', 'i', 'cal', 'ly'],
  'chronologically': ['chron', 'o', 'log', 'i', 'cal', 'ly'],
  'geographically': ['ge', 'o', 'graph', 'i', 'cal', 'ly'],
  'theoretically': ['the', 'o', 'ret', 'i', 'cal', 'ly'],
  'hypothetically': ['hy', 'po', 'thet', 'i', 'cal', 'ly'],
};

VOWEL_COMBINATIONS.sort((a, b) => b.length - a.length);
CONSONANT_BLENDS_START.sort((a, b) => b.length - a.length);
CONSONANT_BLENDS_END.sort((a, b) => b.length - a.length);
PREFIXES.sort((a, b) => b.length - a.length);
SUFFIXES.sort((a, b) => b.length - a.length);

function isLikelySingleSyllable(word: string): boolean {
  word = word.toLowerCase();
  if (word.length > 6) return false;
  if (word.length <= 3) return true;
  const confirmedSingle = [
    'house', 'mouse', 'knife', 'write', 'knee', 'wrong', 'rhythm',
    'through', 'though', 'tough', 'rough', 'enough', 'cough',
    'taught', 'caught', 'bought', 'thought', 'brought', 'tree', 'book'
  ];
  if (confirmedSingle.includes(word)) return true;
  const confirmedDouble = [
    'happy', 'table', 'water', 'paper', 'money', 'mother', 'father',
    'sister', 'brother', 'little', 'yellow', 'purple', 'orange', 'circle', 'apple'
  ];
  if (confirmedDouble.includes(word)) return false;
  
  // 检查以 -le 结尾的情况（如 circle, table, apple 等）
  // 当单词以辅音+le结尾时，通常是多音节的
  if (word.length >= 4 && word.endsWith('le')) {
    const beforeLe = word[word.length - 3];
    if (beforeLe && !VOWELS.has(beforeLe)) {
      return false; // 辅音+le 通常表示多音节
    }
  }
  
  const singlePatterns = ['ouse', 'ife', 'ite', 'ough', 'aught', 'ought'];
  for (const pattern of singlePatterns) {
    if (word.endsWith(pattern)) return true;
  }
  let vowelCount = 0;
  let i = 0;
  // 改进静默e的判断：如果以辅音+le结尾，则e不是静默的
  const hasSyllabicLe = word.length >= 4 && word.endsWith('le') && !VOWELS.has(word[word.length - 3]);
  const silentE = word.endsWith('e') && word.length > 3 && !hasSyllabicLe;
  
  while (i < word.length) {
    let foundCombo = false;
    for (const combo of VOWEL_COMBINATIONS) {
      if (i + combo.length <= word.length && word.slice(i, i + combo.length) === combo) {
        vowelCount++;
        i += combo.length;
        foundCombo = true;
        break;
      }
    }
    if (!foundCombo) {
      if (VOWELS.has(word[i])) {
        if (!(silentE && i === word.length - 1)) {
          vowelCount++;
        }
      }
      i++;
    }
  }
  return vowelCount === 1;
}

function findVowelGroups(word: string): Array<[number, number, string]> {
  word = word.toLowerCase();
  const vowelGroups: Array<[number, number, string]> = [];
  let i = 0;
  
  // 改进的静默e判断：如果是辅音+le结尾，则e不是静默的
  const hasSyllabicLe = word.length >= 3 && word.endsWith('le') && !VOWELS.has(word[word.length - 3]);
  const hasSilentE = (word.length > 3 && word.endsWith('e') &&
    !VOWELS.has(word[word.length - 2]) &&
    !hasSyllabicLe &&
    !(word.length === 5 && ['rg', 'ng', 'dg'].includes(word.slice(-3, -1))));
    
  while (i < word.length) {
    let found = false;
    for (const combo of VOWEL_COMBINATIONS) {
      if (i + combo.length <= word.length && word.slice(i, i + combo.length) === combo) {
        if (combo === 'io' && i > 0) {
          if ((i >= 1 && word[i - 1] === 't' && i + 2 < word.length && word[i + 2] === 'n') ||
              (i >= 1 && word[i - 1] === 's' && i + 2 < word.length && word[i + 2] === 'n')) {
            // do nothing
          } else {
            const prevChar = word[i - 1];
            if (!VOWELS.has(prevChar)) {
              vowelGroups.push([i, i, 'i']);
              vowelGroups.push([i + 1, i + 1, 'o']);
              i += 2;
              found = true;
              break;
            }
          }
        }
        vowelGroups.push([i, i + combo.length - 1, combo]);
        i += combo.length;
        found = true;
        break;
      }
    }
    if (!found) {
      if (VOWELS.has(word[i])) {
        if (!(hasSilentE && i === word.length - 1 && word[i] === 'e')) {
          vowelGroups.push([i, i, word[i]]);
        }
      }
      i++;
    }
  }
  return vowelGroups;
}

export function splitBySyllables(word: string): string[] {
  const originalWord = word;
  word = word.toLowerCase();
  if (SPECIAL_WORDS[word]) {
    return SPECIAL_WORDS[word];
  }
  if (isLikelySingleSyllable(word)) {
    return [originalWord];
  }
  let prefix = '';
  for (const p of PREFIXES) {
    if (word.startsWith(p) && word.length > p.length + 2) {
      const remainder = word.slice(p.length);
      const vowelCount = Array.from(remainder).filter(c => VOWELS.has(c)).length;
      if (vowelCount >= 1) {
        prefix = p;
        word = remainder;
        break;
      }
    }
  }
  let suffix = '';
  for (const s of SUFFIXES) {
    if (word.endsWith(s) && word.length >= s.length) {
      // 特殊处理：如果是辅音+le结尾，不将 "le" 作为独立后缀
      if (s === 'le' && word.length >= 3 && !VOWELS.has(word[word.length - 3])) {
        continue; // 跳过这个后缀，让音节拆分算法自然处理
      }
      
      const remainder = word.slice(0, -s.length);
      
      // 改进的后缀识别逻辑：
      // 1. 词根必须有足够的长度
      if (remainder.length < 3) {
        continue;
      }
      
      // 2. 词根必须包含至少一个元音
      const remainderVowelCount = Array.from(remainder).filter(c => VOWELS.has(c)).length;
      if (remainderVowelCount === 0) {
        continue;
      }
      
             // 3. 对于短后缀（1-3字符），需要更严格的检查
       if (s.length <= 3) {
         // 如果词根看起来像完整单词（多个音节），需要更严格的后缀验证
         if (remainderVowelCount >= 2 && remainder.length >= 4) {
           
           // 常见的真正后缀模式检查
           const legitimateSuffixPatterns = [
             // -er：动词变名词，形容词比较级
             { suffix: 'er', validRootEndings: ['t', 'ch', 'k', 'p', 's', 'x', 'z', 'n', 'm'] },
             // -ed：过去式
             { suffix: 'ed', validRootEndings: ['t', 'd', 'p', 'k', 's', 'x', 'z', 'ch', 'sh'] },
             // -ing：进行时
             { suffix: 'ing', validRootEndings: ['t', 'd', 'p', 'k', 's', 'x', 'z', 'ch', 'sh', 'n', 'm'] },
             // -ate：动词后缀，通常跟在特定字母后
             { suffix: 'ate', validRootEndings: ['t', 'd', 'p', 'k', 'c', 'v', 'r', 'n', 'm'] },
             // -ly：副词后缀
             { suffix: 'ly', validRootEndings: ['l', 'n', 't', 'd', 's'] }
           ];
           
           const pattern = legitimateSuffixPatterns.find(p => p.suffix === s);
           if (pattern) {
             if (!pattern.validRootEndings.some(ending => remainder.endsWith(ending))) {
               continue; // 不符合后缀模式，跳过
             }
           } else {
             // 对于没有定义模式的短后缀，如果词根较长且有多个元音，倾向于不拆分
             if (remainder.length >= 6) {
               continue;
             }
           }
         }
       }
      
      // 4. 检查词根是否以特定模式结尾，这些模式通常不适合后缀拆分
      const avoidSuffixRootEndings = ['wat', 'comput', 'memb', 'numb', 'wint', 'summ', 'cent'];
      if (avoidSuffixRootEndings.some(ending => remainder.endsWith(ending))) {
        continue;
      }
      
      // 通过所有检查，可以进行后缀拆分
      if (prefix || remainderVowelCount >= 1) {
        suffix = s;
        word = remainder;
        break;
      }
    }
  }
  const vowelGroups = findVowelGroups(word);
  if (!vowelGroups.length) {
    const result: string[] = [];
    if (prefix) result.push(prefix);
    if (word) result.push(word);
    if (suffix) result.push(suffix);
    return result;
  }
  const syllables: string[] = [];
  if (vowelGroups.length === 1) {
    syllables.push(word);
  } else {
    const syllableBoundaries: number[] = [];
    for (let i = 0; i < vowelGroups.length; i++) {
      if (i === 0) syllableBoundaries.push(0);
      if (i < vowelGroups.length - 1) {
        const currentVowelEnd = vowelGroups[i][1];
        const nextVowelStart = vowelGroups[i + 1][0];
        const consonants = word.slice(currentVowelEnd + 1, nextVowelStart);
        let boundary = currentVowelEnd + 1;
        
        // 特殊处理：检查是否是 -le 结尾的情况
        const isLastVowelGroup = i === vowelGroups.length - 2;
        const endsWithLe = isLastVowelGroup && 
                          word.endsWith('le') && 
                          vowelGroups[i + 1][0] === word.length - 1; // e 的位置应该是倒数第一个字符
        
        if (endsWithLe && consonants.length >= 1) {
          // 对于 -le 结尾，只留一个辅音给 -le，其余归前面音节
          // 例如: apple (a|ppl|e) → ap|ple, circle (i|rcl|e) → cir|cle
          if (consonants.length === 1) {
            boundary = currentVowelEnd + 1; // 单个辅音全部给 -le
          } else {
            boundary = currentVowelEnd + consonants.length - 1; // 留最后一个辅音给 -le
          }
        } else if (consonants.length === 1) {
          // 单个辅音归后面的音节 (如 wa-ter, stu-dent)
          boundary = currentVowelEnd + 1;
        } else if (consonants.length === 2) {
          if (consonants[0] === consonants[1]) {
            boundary = currentVowelEnd + 2;
          } else if (CONSONANT_BLENDS_START.includes(consonants)) {
            boundary = currentVowelEnd + 1;
          } else {
            // 特殊处理某些辅音组合的拆分
            // 对于 mb, mp, nt, nd 等，第一个辅音归前面，第二个归后面
            const consonantSplits = ['mb', 'mp', 'nt', 'nd', 'nk', 'ng', 'ld', 'rd', 'rf', 'rk', 'rm', 'rn', 'rp', 'rt', 'rv'];
            if (consonantSplits.includes(consonants)) {
              boundary = currentVowelEnd + 2; // 第一个辅音归前面音节 (如 mem-ber, win-ter)
            } else {
              boundary = currentVowelEnd + 2; // 默认：第一个辅音归前面
            }
          }
        } else if (consonants.length > 2) {
          let blendFound = false;
          for (const blend of CONSONANT_BLENDS_START) {
            if (consonants.endsWith(blend) && blend.length >= 2) {
              boundary = nextVowelStart - blend.length;
              blendFound = true;
              break;
            }
          }
          if (!blendFound) {
            if (vowelGroups[i + 1][2] === 'i' || vowelGroups[i + 1][2] === 'o') {
              boundary = currentVowelEnd + 2;
            } else {
              boundary = currentVowelEnd + 2;
            }
          }
        }
        syllableBoundaries.push(boundary);
      }
    }
    syllableBoundaries.push(word.length);
    for (let i = 0; i < syllableBoundaries.length - 1; i++) {
      const start = syllableBoundaries[i];
      const end = syllableBoundaries[i + 1];
      const syllable = word.slice(start, end);
      if (syllable) syllables.push(syllable);
    }
  }
  // 后处理
  const processedSyllables: string[] = [];
  let i = 0;
  while (i < syllables.length) {
    let current = syllables[i];
    if (
      i < syllables.length - 1 &&
      current.endsWith('e') &&
      ['ful', 'less'].includes(syllables[i + 1])
    ) {
      current = current + syllables[i + 1];
      i++;
    }
    processedSyllables.push(current);
    i++;
  }
  const result: string[] = [];
  if (prefix) result.push(prefix);
  result.push(...processedSyllables);
  if (suffix) result.push(suffix);
  return result;
}

export function analyzeWordStructure(word: string): AnalyzeResult {
  const segments = splitBySyllables(word);
  const vowelSounds: string[] = [];
  const consonantSounds: string[] = [];
  const prefixes: string[] = [];
  const suffixes: string[] = [];
  for (let i = 0; i < segments.length; i++) {
    if (i === 0 && PREFIXES.includes(segments[i])) {
      prefixes.push(segments[i]);
    } else if (i === segments.length - 1 && SUFFIXES.includes(segments[i])) {
      suffixes.push(segments[i]);
    } else if (/[aeiou]/.test(segments[i])) {
      vowelSounds.push(segments[i]);
    } else {
      consonantSounds.push(segments[i]);
    }
  }
  return {
    word,
    segments,
    syllableCount: segments.filter(s => /[aeiou]/.test(s)).length,
    vowelSounds,
    consonantSounds,
    prefixes,
    suffixes,
    pronunciationGuide: segments.join(' · '),
  };
} 