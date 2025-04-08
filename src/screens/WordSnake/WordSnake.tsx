import React, { useState, useEffect, useRef } from "react";
// @ts-ignore
import "./WordSnake.css";

interface SnakePart {
  x: number;
  y: number;
}

interface WordObj {
  word: string;
  translation: string;
  x: number;
  y: number;
  color: string;
  id: number;
  eaten?: boolean;
}

export const WordSnake = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<SnakePart[]>([{ x: 10, y: 10 }]);
  const [direction, setDirection] = useState<string>("right");
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [targetWords, setTargetWords] = useState<WordObj[]>([]);
  const [currentTargetWordIndex, setCurrentTargetWordIndex] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 词汇表示例
  const vocabulary = [
    { word: "apple", translation: "苹果" },
    { word: "banana", translation: "香蕉" },
    { word: "orange", translation: "橙子" },
    { word: "book", translation: "书" },
    { word: "computer", translation: "电脑" },
    { word: "phone", translation: "手机" },
    { word: "water", translation: "水" },
    { word: "school", translation: "学校" },
    { word: "pen", translation: "钢笔" },
    { word: "teacher", translation: "老师" },
  ];

  // 游戏配置
  const gridSize = 20;
  const canvasSize = 600;
  const cellSize = canvasSize / gridSize;
  const gameSpeed = 200; // 毫秒

  // 预定义一些颜色
  const wordColors = [
    "#64B5F6", "#FF8A65", "#81C784", "#FFD54F", "#9575CD",
    "#4DB6AC", "#F06292", "#A1887F", "#BA68C8", "#7986CB"
  ];

  // 生成随机位置
  const generateRandomPosition = () => {
    return Math.floor(Math.random() * (gridSize - 2)) + 1;
  };

  // 修改 initializeWords 函数签名和逻辑
  const initializeWords = (numWords: number, initialSnakeHead: SnakePart) => {
    if (vocabulary.length < numWords) {
      console.error("词汇量不足以开始游戏");
      return;
    }

    const selectedIndices = new Set<number>();
    while (selectedIndices.size < numWords) {
      selectedIndices.add(Math.floor(Math.random() * vocabulary.length));
    }

    const initialTargetWords: WordObj[] = [];
    const occupiedPositions = new Set<string>();
    // 使用传入的初始蛇头位置
    occupiedPositions.add(`${initialSnakeHead.x},${initialSnakeHead.y}`);

    let wordId = 0;
    selectedIndices.forEach((index, i) => {
      const wordData = vocabulary[index];
      let pos_x, pos_y;
      let positionKey;
      do {
        pos_x = generateRandomPosition();
        pos_y = generateRandomPosition();
        positionKey = `${pos_x},${pos_y}`;
      } while (occupiedPositions.has(positionKey));

      occupiedPositions.add(positionKey);

      initialTargetWords.push({
        id: wordId++,
        word: wordData.word,
        translation: wordData.translation,
        x: pos_x,
        y: pos_y,
        color: wordColors[i % wordColors.length],
        eaten: false // 显式设置 eaten 为 false
      });
    });

    setTargetWords(initialTargetWords);
    setCurrentTargetWordIndex(0);
  };

  // 修改 startGame 函数
  const startGame = () => {
    const initialSnakePos = { x: 10, y: 10 };
    setSnake([initialSnakePos]);
    setDirection("right");
    setGameOver(false);
    setGameWon(false);
    setScore(0);
    setIsMoving(false);
    setElapsedTime(0);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const numberOfWordsToPlay = 5;
    initializeWords(numberOfWordsToPlay, initialSnakePos);
    setGameStarted(true);

    if (canvasRef.current) {
      canvasRef.current.focus();
    }
  };

  // 检查碰撞
  const checkCollision = (head: SnakePart): { type: string; word?: WordObj } => {
    // 撞墙检测
    if (head.x < 0 || head.y < 0 || head.x >= gridSize || head.y >= gridSize) {
      return { type: "wall" };
    }

    // 撞自己检测
    for (let i = 1; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
        return { type: "self" };
      }
    }

    // 检查是否撞到了任何一个单词
    const currentTarget = targetWords[currentTargetWordIndex];
    for (const wordObj of targetWords) {
      // 只检查未被吃掉的单词
      if (!wordObj.eaten && head.x === wordObj.x && head.y === wordObj.y) {
        // 碰到了一个单词，判断是不是当前目标
        if (currentTarget && wordObj.id === currentTarget.id) {
          // 是当前目标单词
          return { type: "correct_word", word: wordObj };
        } else {
          // 不是当前目标单词（吃错了）
          return { type: "wrong_word", word: wordObj };
        }
      }
    }

    // 没有撞到任何东西
    return { type: "none" };
  };

  // 移动蛇
  const moveSnake = () => {
    if (gameOver || gameWon || !gameStarted || !isMoving) return;

    const currentSnake = [...snake];
    const head = { ...currentSnake[0] };

    switch (direction) {
      case "up": head.y -= 1; break;
      case "down": head.y += 1; break;
      case "left": head.x -= 1; break;
      case "right": head.x += 1; break;
      default: break;
    }

    const collisionResult = checkCollision(head);
    let nextSnake: SnakePart[];

    switch (collisionResult.type) {
      case "wall":
      case "self":
      case "wrong_word": // 新增：吃错单词也导致游戏结束
        setGameOver(true);
        return; // 直接返回，不更新蛇的状态

      case "correct_word":
        if (collisionResult.word) { // 确保 word 存在
          nextSnake = [head, ...currentSnake]; // 蛇变长
          setScore((prevScore) => prevScore + 10);

          // 标记当前单词为已吃掉
          const eatenWordId = collisionResult.word.id;
          setTargetWords(prevWords =>
            prevWords.map(word =>
              word.id === eatenWordId ? { ...word, eaten: true } : word
            )
          );

          const nextWordIndex = currentTargetWordIndex + 1;

          if (nextWordIndex >= targetWords.length) {
            // 吃完了所有单词
            setGameWon(true);
          } else {
            // 移动到下一个目标单词
            setCurrentTargetWordIndex(nextWordIndex);
          }
          setSnake(nextSnake); // 更新蛇的状态
        }
        break; // 跳出 switch

      case "none":
      default: // 默认情况，即 "none"
        const body = currentSnake.slice(0, -1); // 正常移动，移除尾巴
        nextSnake = [head, ...body];
        setSnake(nextSnake); // 更新蛇的状态
        break; // 跳出 switch
    }

    // 注意：setSnake 现在在 switch 内部处理，避免游戏结束后还移动一下
  };

  // 处理键盘按键事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    if (gameOver || !gameStarted) return;

    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
      e.preventDefault();
    }

    if (!isMoving) {
      setIsMoving(true);
    }

    switch (e.key) {
      case "ArrowUp": if (direction !== "down") setDirection("up"); break;
      case "ArrowDown": if (direction !== "up") setDirection("down"); break;
      case "Left": case "ArrowLeft": if (direction !== "right") setDirection("left"); break;
      case "Right": case "ArrowRight": if (direction !== "left") setDirection("right"); break;
      default: break;
    }
  };

  // 绘制游戏
  const drawGame = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground(ctx, canvas.width, canvas.height);

    snake.forEach((part, index) => {
      if (index === 0) {
        ctx.fillStyle = "#D32F2F";
        ctx.fillRect(part.x * cellSize, part.y * cellSize, cellSize, cellSize);
        
        ctx.fillStyle = "#FFFFFF";
        
        const eyeSize = cellSize / 4;
        const eyePadding = cellSize / 6;
        
        if (direction === "right") {
          ctx.fillRect(part.x * cellSize + cellSize - eyePadding - eyeSize, part.y * cellSize + eyePadding, eyeSize, eyeSize);
          ctx.fillRect(part.x * cellSize + cellSize - eyePadding - eyeSize, part.y * cellSize + cellSize - eyePadding - eyeSize, eyeSize, eyeSize);
        } else if (direction === "left") {
          ctx.fillRect(part.x * cellSize + eyePadding, part.y * cellSize + eyePadding, eyeSize, eyeSize);
          ctx.fillRect(part.x * cellSize + eyePadding, part.y * cellSize + cellSize - eyePadding - eyeSize, eyeSize, eyeSize);
        } else if (direction === "up") {
          ctx.fillRect(part.x * cellSize + eyePadding, part.y * cellSize + eyePadding, eyeSize, eyeSize);
          ctx.fillRect(part.x * cellSize + cellSize - eyePadding - eyeSize, part.y * cellSize + eyePadding, eyeSize, eyeSize);
        } else if (direction === "down") {
          ctx.fillRect(part.x * cellSize + eyePadding, part.y * cellSize + cellSize - eyePadding - eyeSize, eyeSize, eyeSize);
          ctx.fillRect(part.x * cellSize + cellSize - eyePadding - eyeSize, part.y * cellSize + cellSize - eyePadding - eyeSize, eyeSize, eyeSize);
        }
        
        ctx.fillStyle = "#000000";
        const pupilSize = eyeSize / 2;
        
        if (direction === "right") {
          ctx.fillRect(part.x * cellSize + cellSize - eyePadding - eyeSize + eyeSize/4, part.y * cellSize + eyePadding + eyeSize/4, pupilSize, pupilSize);
          ctx.fillRect(part.x * cellSize + cellSize - eyePadding - eyeSize + eyeSize/4, part.y * cellSize + cellSize - eyePadding - eyeSize + eyeSize/4, pupilSize, pupilSize);
        } else if (direction === "left") {
          ctx.fillRect(part.x * cellSize + eyePadding + eyeSize/4, part.y * cellSize + eyePadding + eyeSize/4, pupilSize, pupilSize);
          ctx.fillRect(part.x * cellSize + eyePadding + eyeSize/4, part.y * cellSize + cellSize - eyePadding - eyeSize + eyeSize/4, pupilSize, pupilSize);
        } else if (direction === "up") {
          ctx.fillRect(part.x * cellSize + eyePadding + eyeSize/4, part.y * cellSize + eyePadding + eyeSize/4, pupilSize, pupilSize);
          ctx.fillRect(part.x * cellSize + cellSize - eyePadding - eyeSize + eyeSize/4, part.y * cellSize + eyePadding + eyeSize/4, pupilSize, pupilSize);
        } else if (direction === "down") {
          ctx.fillRect(part.x * cellSize + eyePadding + eyeSize/4, part.y * cellSize + cellSize - eyePadding - eyeSize + eyeSize/4, pupilSize, pupilSize);
          ctx.fillRect(part.x * cellSize + cellSize - eyePadding - eyeSize + eyeSize/4, part.y * cellSize + cellSize - eyePadding - eyeSize + eyeSize/4, pupilSize, pupilSize);
        }
      } else {
        ctx.fillStyle = "#4CAF50";
        ctx.fillRect(part.x * cellSize, part.y * cellSize, cellSize, cellSize);
      }
    });

    targetWords.forEach((wordObj, index) => {
      if (!wordObj.eaten) {
        const isCurrentTarget = index === currentTargetWordIndex && !gameWon;

        ctx.fillStyle = wordObj.color;
        ctx.fillRect(wordObj.x * cellSize, wordObj.y * cellSize, cellSize, cellSize);

        if (isCurrentTarget) {
          ctx.strokeStyle = "#FFEB3B";
          ctx.lineWidth = 3;
          ctx.strokeRect(wordObj.x * cellSize + 1.5, wordObj.y * cellSize + 1.5, cellSize - 3, cellSize - 3);
          ctx.lineWidth = 1;
        }

        ctx.fillStyle = "#FFF";
        ctx.font = "bold 12px Arial";
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 3;

        ctx.fillText(
          wordObj.word,
          wordObj.x * cellSize + cellSize / 2,
          wordObj.y * cellSize + cellSize / 2 + 5
        );
        ctx.shadowColor = "rgba(0, 0, 0, 0)";
        ctx.textAlign = "left";
      }
    });

    ctx.fillStyle = "#000";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "left";

    const currentTarget = targetWords[currentTargetWordIndex];
    const currentWordText = currentTarget && !gameWon ? currentTarget.translation : (gameWon ? "完成!" : "...");
    const progressText = gameWon ? `完成所有 ${targetWords.length} 个单词!` : `目标 ${currentTargetWordIndex + 1} / ${targetWords.length}:`;

    ctx.fillText(`${progressText} ${currentWordText}`, 10, 30);

    ctx.textAlign = "right";
    ctx.fillText(`分数: ${score}`, canvas.width - 10, 30);
    ctx.textAlign = "left";
  };
  
  // 绘制游戏背景
  const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, "#E8F5E9");
    bgGradient.addColorStop(1, "#C8E6C9");
    
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = "rgba(76, 175, 80, 0.2)";
    
    for (let x = 0; x <= width; x += cellSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= height; y += cellSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    for (let i = 0; i < 8; i++) {
      const x = Math.floor(Math.random() * gridSize) * cellSize;
      const y = Math.floor(Math.random() * gridSize) * cellSize;
      
      let overlap = false;
      
      for (const part of snake) {
        if (part.x * cellSize === x && part.y * cellSize === y) {
          overlap = true;
          break;
        }
      }
      
      if (!overlap) {
        for (const word of targetWords) {
          if (word.x * cellSize === x && word.y * cellSize === y) {
            overlap = true;
            break;
          }
        }
      }
      
      if (!overlap) {
        ctx.fillStyle = "rgba(76, 175, 80, 0.1)";
        ctx.font = "bold 18px Arial";
        
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const letter = letters[Math.floor(Math.random() * letters.length)];
        
        ctx.fillText(letter, x + cellSize / 4, y + cellSize / 1.5);
      }
    }
  };

  // 游戏循环
  useEffect(() => {
    if (gameOver || gameWon || !gameStarted || !isMoving) return;
    const gameLoop = setInterval(moveSnake, gameSpeed);
    return () => clearInterval(gameLoop);
  }, [snake, direction, gameOver, gameWon, gameStarted, isMoving, currentTargetWordIndex, targetWords]);

  // 绘制循环
  useEffect(() => {
    let animationFrameId: number;
    const render = () => {
      drawGame();
      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [snake, targetWords, score, gameOver, gameWon, gameStarted, direction, currentTargetWordIndex]);

  // 键盘事件监听
  useEffect(() => {
    if (gameStarted && canvasRef.current) {
      canvasRef.current.focus();
    }
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (gameStarted && !gameOver && !gameWon && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [gameStarted, gameOver, gameWon]);

  // 获取当前目标翻译用于界面提示
  const currentTargetTranslation = targetWords[currentTargetWordIndex]?.translation || "";

  // 新增：格式化时间的辅助函数
  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // 新增：处理计时器的 useEffect
  useEffect(() => {
    // 条件：游戏已开始、蛇在移动、游戏未结束、游戏未胜利
    if (gameStarted && isMoving && !gameOver && !gameWon) {
      // 只有当计时器未运行时才启动
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          setElapsedTime(prevTime => prevTime + 1);
        }, 1000); // 每秒更新一次
      }
    } else {
      // 如果条件不满足（游戏结束、胜利、未开始或未移动），且计时器正在运行，则清除它
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    // 清理函数：组件卸载或依赖项变化时确保清除计时器
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    // 依赖项：这些状态的变化会触发 effect 的重新评估
  }, [gameStarted, isMoving, gameOver, gameWon]);

  return (
    <div className="word-snake-container">
      <h1>单词贪吃蛇 (挑战模式)</h1>

      {/* 新增：包裹提示和游戏区域的容器 */}
      <div className="game-area">

        {/* 左侧：游戏提示信息 - 调整内部结构 */}
        <div className="game-info">

          {/* 主要信息区：文本在左，控制在右 */}
          <div className="info-main">
            {/* 左侧文本块 */}
            <div className="info-text-block">
              <p className="target-info">
                按顺序吃掉单词！当前目标: <span style={{color: '#1976D2', fontWeight: 'bold'}}>{currentTargetTranslation}</span> ({currentTargetWordIndex + 1}/{targetWords.length})
              </p>
              {/* 将规则放在一个 div 中，方便样式控制 */}
              <div className="rules-block">
                <span className="rule-correct">吃到目标：+10分，蛇变长</span>
                {/* 可以用 CSS ::after 添加分隔符，或者直接用 span */}
                 <span className="rule-separator"> | </span>
                <span className="rule-wrong">撞墙/自己/吃错单词：游戏结束</span>
              </div>
              {/* 分数和时间放在同一行，用 flex 对齐 */}
              <div className="stats-row">
                <span>分数: {score}</span>
                <span>时间: {formatTime(elapsedTime)}</span>
              </div>
            </div>

            {/* 右侧控制按键块 */}
            <div className="info-controls-block">
              <div className="keyboard-controls">
                <span className="key">↑</span>
                <div>
                  <span className="key">←</span>
                  <span className="key">↓</span>
                  <span className="key">→</span>
                </div>
              </div>
            </div>
          </div>

          {/* 开始提示信息，放在主区域下方居中 */}
          {gameStarted && !isMoving && !gameOver && !gameWon && (
            <p className="start-hint">按任意方向键开始移动</p>
          )}
        </div> {/* 结束 game-info */}

        {/* 右侧：画布和下方的按钮/信息 */}
        <div className="canvas-and-messages">
          <canvas
            ref={canvasRef}
            width={canvasSize}
            height={canvasSize}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            className={`game-canvas ${gameWon ? 'game-won-border' : ''} ${gameOver ? 'game-over-border' : ''}`}
          />

          {!gameStarted && (
            <button className="start-button" onClick={startGame}>
              开始游戏
            </button>
          )}

          {gameWon && (
            <div className="game-over game-won">
              <h2>挑战成功!</h2>
              <p>你完成了所有 {targetWords.length} 个单词!</p>
              <p>最终分数: {score}</p>
              <p>用时: {formatTime(elapsedTime)}</p>
              <button onClick={startGame}>再来一轮</button>
            </div>
          )}

          {gameOver && !gameWon && (
            <div className="game-over">
              <h2>游戏结束</h2>
              <p>最终分数: {score}</p>
              <p>用时: {formatTime(elapsedTime)}</p>
              <button onClick={startGame}>重新开始</button>
            </div>
          )}
        </div> {/* 结束 canvas-and-messages */}

      </div> {/* 结束 game-area */}
    </div> // 结束 word-snake-container
  );
}; 