import React, { useState, useEffect } from 'react';
// 使用内联SVG图标替代heroicons
const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);
import { getAvailableWords, createWordStages, AvailableWord } from '../../services/learningApi';

interface WordSelectionProps {
  planId: number;
  onWordsSelected: (selectedWordIds: number[]) => void;
  onCancel: () => void;
}

const WordSelectionComponent: React.FC<WordSelectionProps> = ({
  planId,
  onWordsSelected,
  onCancel
}) => {
  const [words, setWords] = useState<AvailableWord[]>([]);
  const [selectedWords, setSelectedWords] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [stagedCount, setStagedCount] = useState(0);

  useEffect(() => {
    loadAvailableWords();
  }, [planId]);

  const loadAvailableWords = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAvailableWords(planId);
      setWords(response.words);
      setTotalCount(response.total_count);
      setStagedCount(response.staged_count);
    } catch (err) {
      setError('加载单词列表失败');
      console.error('Error loading available words:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleWordSelection = (wordId: number) => {
    const newSelected = new Set(selectedWords);
    if (newSelected.has(wordId)) {
      newSelected.delete(wordId);
    } else {
      newSelected.add(wordId);
    }
    setSelectedWords(newSelected);
  };

  const handleSelectAll = () => {
    const unstaged = words.filter(word => !word.has_stage);
    const unstagedIds = unstaged.map(word => word.id);
    setSelectedWords(new Set(unstagedIds));
  };

  const handleDeselectAll = () => {
    setSelectedWords(new Set());
  };

  const handleCreateStages = async () => {
    if (selectedWords.size === 0) {
      alert('请至少选择一个单词');
      return;
    }

    try {
      setCreating(true);
      const wordIds = Array.from(selectedWords);
      const result = await createWordStages(planId, wordIds);
      
      if (result.success) {
        // 刷新单词列表以显示更新后的状态
        await loadAvailableWords();
        // 通知父组件
        onWordsSelected(wordIds);
      } else {
        setError('创建学习阶段记录失败');
      }
    } catch (err) {
      setError('创建学习阶段记录失败');
      console.error('Error creating word stages:', err);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">加载单词列表...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadAvailableWords}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          重试
        </button>
      </div>
    );
  }

  const unstagedWords = words.filter(word => !word.has_stage);
  const selectedCount = selectedWords.size;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">选择要学习的单词</h2>
        <div className="text-sm text-gray-600 space-y-1">
          <p>词汇书总单词数：{totalCount}</p>
          <p>已创建学习记录：{stagedCount}</p>
          <p>可选择单词数：{unstagedWords.length}</p>
          <p>当前选择：{selectedCount} 个单词</p>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={handleSelectAll}
          disabled={unstagedWords.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          全选（{unstagedWords.length}个）
        </button>
        <button
          onClick={handleDeselectAll}
          disabled={selectedCount === 0}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          取消全选
        </button>
        <button
          onClick={handleCreateStages}
          disabled={selectedCount === 0 || creating}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
        >
          {creating && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
          开始学习选中的单词（{selectedCount}个）
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          取消
        </button>
      </div>

      {/* 单词列表 */}
      <div className="grid gap-3 max-h-96 overflow-y-auto border rounded-lg p-4">
        {words.map((word) => (
          <div
            key={word.id}
            className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
              word.has_stage
                ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
                : selectedWords.has(word.id)
                ? 'bg-blue-50 border-blue-300'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => !word.has_stage && toggleWordSelection(word.id)}
          >
            <div className="flex items-center flex-1">
              <div className="mr-3">
                {word.has_stage ? (
                  <div className="w-5 h-5 bg-gray-400 rounded flex items-center justify-center">
                    <CheckIcon className="w-3 h-3 text-white" />
                  </div>
                ) : selectedWords.has(word.id) ? (
                  <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                    <CheckIcon className="w-3 h-3 text-white" />
                  </div>
                ) : (
                  <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <span className={`font-medium ${word.has_stage ? 'text-gray-500' : 'text-gray-900'}`}>
                    {word.word}
                  </span>
                  <span className={`text-sm ${word.has_stage ? 'text-gray-400' : 'text-gray-600'}`}>
                    {typeof word.meaning === 'string' ? word.meaning : 
                     Array.isArray(word.meaning) && word.meaning.length > 0 ? word.meaning[0].meaning || word.meaning[0] :
                     '无释义'}
                  </span>
                  {word.phonetic && (
                    <span className={`text-xs ${word.has_stage ? 'text-gray-400' : 'text-gray-500'}`}>
                      {word.phonetic}
                    </span>
                  )}
                </div>
              </div>
              <div className={`text-xs ${word.has_stage ? 'text-gray-400' : 'text-gray-500'}`}>
                序号: {word.word_order}
              </div>
            </div>
            {word.has_stage && (
              <span className="text-xs text-gray-500 ml-2">已学习</span>
            )}
          </div>
        ))}
      </div>

      {words.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          没有可用的单词
        </div>
      )}
    </div>
  );
};

export default WordSelectionComponent; 