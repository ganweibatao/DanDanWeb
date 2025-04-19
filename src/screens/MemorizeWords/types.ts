export interface DisplayVocabularyWord {
  id: number;
  book_id?: number | null;
  word: string;
  translation?: string | null;
  part_of_speech?: string | null;
  pronunciation?: string | null;
  example?: string | null;
  phonetic?: string | null;
  definition?: string | null;
  word_basic_id?: number;
  examples?: string | null;
  derivatives?: string | null;
  notes?: string | null;
  example_sentence?: string | null;
} 