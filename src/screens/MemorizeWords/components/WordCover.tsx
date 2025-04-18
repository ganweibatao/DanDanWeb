import React from "react";

interface WordCoverProps {
  showCover: boolean;
  coverPosition: number;
  isDragging: boolean;
  handleCoverDragStart: (e: React.MouseEvent | React.TouchEvent) => void;
  darkMode?: boolean;
}

export const WordCover: React.FC<WordCoverProps> = ({
  showCover,
  coverPosition,
  isDragging,
  handleCoverDragStart,
  darkMode = false,
}) => {
  if (!showCover) return null;
  return (
    <>
      <style>{`
        .word-revealed {
          position: relative;
          z-index: 20;
        }
        .cover-draggable {
          cursor: url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%2732%27%20height%3D%2732%27%20viewBox%3D%270%200%2032%2032%27%20fill%3D%27none%27%3E%3Cpath%20d%3D%27M4%2016%20C%206%2015.8%2C%2026%2015.8%2C%2028%2016%27%20stroke%3D%27${darkMode ? '%23eee' : '%23333'}%27%20stroke-width%3D%274%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27/%3E%3Cpath%20d%3D%27M10%2010%20C%208%2011%2C%205%2015%2C%204%2016%27%20stroke%3D%27${darkMode ? '%23eee' : '%23333'}%27%20stroke-width%3D%274%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27/%3E%3Cpath%20d%3D%27M10%2022%20C%208%2021%2C%205%2017%2C%204%2016%27%20stroke%3D%27${darkMode ? '%23eee' : '%23333'}%27%20stroke-width%3D%274%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27/%3E%3Cpath%20d%3D%27M22%2010%20C%2024%2011%2C%2027%2015%2C%2028%2016%27%20stroke%3D%27${darkMode ? '%23eee' : '%23333'}%27%20stroke-width%3D%274%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27/%3E%3Cpath%20d%3D%27M22%2022%20C%2024%2021%2C%2027%2017%2C%2028%2016%27%20stroke%3D%27${darkMode ? '%23eee' : '%23333'}%27%20stroke-width%3D%274%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27/%3E%3C/svg%3E") 16 16, ew-resize;
        }
      `}</style>
      <div
        className={`cover-draggable absolute top-0 bottom-0 ${darkMode ? 'dark' : ''} bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm z-10 ${isDragging ? '' : 'transition-all ease-in-out duration-300'}`}
        style={{
          left: `${coverPosition}%`,
          width: '50%',
          borderLeft: '2px dashed rgba(107, 114, 128, 0.5)',
        }}
        onMouseDown={handleCoverDragStart}
        onTouchStart={handleCoverDragStart}
      />
    </>
  );
}; 