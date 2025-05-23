import React, { createContext, useContext, useState, useMemo } from 'react';
import type { VocabularyBook } from '../hooks/useVocabulary';

interface StudentPlanContextType {
  currentLearningBook: VocabularyBook | null;
  setCurrentLearningBook: (book: VocabularyBook | null) => void;
  wordsPerDay: number;
  setWordsPerDay: (n: number) => void;
  inputWordsPerDay: string;
  setInputWordsPerDay: (s: string) => void;
}

const StudentPlanContext = createContext<StudentPlanContextType | undefined>(undefined);

export const StudentPlanProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [currentLearningBook, setCurrentLearningBook] = useState<VocabularyBook | null>(null);
  const [wordsPerDay, setWordsPerDay] = useState<number>(20);
  const [inputWordsPerDay, setInputWordsPerDay] = useState<string>('20');

  const contextValue = useMemo(() => ({
    currentLearningBook,
    setCurrentLearningBook,
    wordsPerDay,
    setWordsPerDay,
    inputWordsPerDay,
    setInputWordsPerDay
  }), [
    currentLearningBook,
    wordsPerDay,
    inputWordsPerDay
  ]);

  return (
    <StudentPlanContext.Provider value={contextValue}>
      {children}
    </StudentPlanContext.Provider>
  );
};

export function useStudentPlanContext() {
  const ctx = useContext(StudentPlanContext);
  if (!ctx) throw new Error('useStudentPlanContext must be used within StudentPlanProvider');
  return ctx;
} 