import React, { useState, useEffect, useRef } from "react";
// @ts-ignore
import "./WordSnake.css";
import { useSoundEffects } from "../../hooks/useSoundEffects";
import { useLocation, useNavigate } from "react-router-dom";
import { DisplayVocabularyWord } from "../MemorizeWords/types";
// import { toast } from 'sonner'; //确保导入 toast -- 将不再使用toast

interface SnakePart {
  x: number;
  y: number;
}

// Reverting to WordObj for multiple target words
interface WordObj {
  id: number;
  word: string;
  translation: string;
  x: number;
  y: number;
  color: string;
  eaten?: boolean;
}

// + Helper type for word source
type WordSource = { word: string; translation: string };

export const WordSnake = () => {
  const location = useLocation();
  const autoFullscreen = location.state?.autoFullscreen ?? false; // 新增，读取全屏状态

  const gridSize = 20;
  const [canvasSize, setCanvasSize] = useState<number>(600); // 初始值，将根据屏幕尺寸调整
  const [cellSize, setCellSize] = useState<number>(canvasSize / gridSize);
  const gameSpeed = 180; // Can be adjusted

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<SnakePart[]>([{ x: 10, y: 10 }]);
  const [direction, setDirection] = useState<string>("right");
  
  // States for smooth animation
  const [previousSnake, setPreviousSnake] = useState<SnakePart[] | null>(null);
  const [lastMoveTime, setLastMoveTime] = useState<number | null>(null);
  const snakeRef = useRef(snake);

  // Word-specific states
  const [targetWords, setTargetWords] = useState<WordObj[]>([]);
  const [remainingWords, setRemainingWords] = useState<WordObj[]>([]); // 新增：剩余待生成的单词池
  const [currentTargetWordIndex, setCurrentTargetWordIndex] = useState<number>(0);
  const [gameWon, setGameWon] = useState<boolean>(false);

  const [gameOver, setGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [isMoving, setIsMoving] = useState<boolean>(false);

  // 新增：记录游戏用时
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);

  const { playEatAppleSound, playSnakeHissSound, playBonkSound, playSuccessSound } = useSoundEffects();
  const navigate = useNavigate();

  const defaultVocabulary: WordSource[] = [
    { word: "hello", translation: "你好" },
    { word: "world", translation: "世界" },
    { word: "apple", translation: "苹果" },
    { word: "learn", translation: "学习" },
    { word: "snake", translation: "蛇" },
    { word: "code", translation: "代码" },
    { word: "game", translation: "游戏" },
    { word: "color", translation: "颜色" },
  ];

  const wordColors = ["#64B5F6", "#FF8A65", "#81C784", "#FFD54F", "#9575CD", "#4DB6AC", "#F06292", "#A1887F"];

  // 调整画布大小函数
  const resizeCanvas = () => {
    if (!containerRef.current) return;
    
    // 获取容器宽度
    const containerWidth = containerRef.current.clientWidth;
    
    // 计算合适的画布大小（响应式，且保持一定的最小值）
    const newSize = Math.max(400, Math.min(containerWidth - 20, window.innerHeight - 150));
    
    setCanvasSize(newSize);
    setCellSize(newSize / gridSize);
  };

  // 监听窗口大小变化
  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  function generateRandomPosition(): number {
    return Math.floor(Math.random() * gridSize);
  }

  const initializeWords = (maxOnField: number, currentSnake: SnakePart[]) => {
    const passedWords = location.state?.words as DisplayVocabularyWord[] | undefined;
    let wordsToUse: WordSource[] = defaultVocabulary;

    if (passedWords && passedWords.length > 0) {
      wordsToUse = passedWords.map(w => ({
        word: w.word,
        translation: w.translation || "N/A"
      }));
    }

    if (wordsToUse.length === 0) {
      console.warn("WordSnake: No words available to initialize.");
      setTargetWords([]);
      setRemainingWords([]);
      setCurrentTargetWordIndex(0);
      return;
    }

    // 随机打乱所有单词
    const shuffled = [...wordsToUse].sort(() => Math.random() - 0.5);
    const initialWords = shuffled.slice(0, maxOnField);
    const restWords = shuffled.slice(maxOnField);

    const occupiedPositions = new Set<string>(currentSnake.map(p => `${p.x},${p.y}`));
    let wordIdCounter = 0;
    const makeWordObj = (wordData: WordSource, arrayIndex: number): WordObj => {
      let pos_x, pos_y, positionKey;
      do {
        pos_x = generateRandomPosition();
        pos_y = generateRandomPosition();
        positionKey = `${pos_x},${pos_y}`;
      } while (occupiedPositions.has(positionKey));
      occupiedPositions.add(positionKey);
      return {
        id: wordIdCounter++,
        word: wordData.word,
        translation: wordData.translation,
        x: pos_x,
        y: pos_y,
        color: wordColors[arrayIndex % wordColors.length],
        eaten: false,
      };
    };

    const initialTargetWords: WordObj[] = initialWords.map(makeWordObj);
    const remainingWordObjs: WordObj[] = restWords.map(makeWordObj);

    setTargetWords(initialTargetWords);
    setRemainingWords(remainingWordObjs);
    setCurrentTargetWordIndex(0);
  };

  const startGame = () => {
    const initialSnakePos = [{ x: Math.floor(gridSize / 2), y: Math.floor(gridSize / 2) }];
    setSnake(initialSnakePos);
    setPreviousSnake(initialSnakePos); // Initialize previousSnake to the same starting position
    setLastMoveTime(null); // No movement has occurred yet
    setDirection("right");
    initializeWords(5, initialSnakePos); // Setup 5 words on field
    setGameOver(false);
    setGameWon(false);
    setScore(0);
    setIsMoving(false);
    setGameStarted(true);
    setStartTime(Date.now()); // 记录开始时间
    setEndTime(null); // 重置结束时间
    if (canvasRef.current) canvasRef.current.focus();
  };

  const checkCollision = (head: SnakePart): { type: string; word?: WordObj } => {
    if (head.x < 0 || head.y < 0 || head.x >= gridSize || head.y >= gridSize) return { type: "wall" };
    for (let i = 1; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) return { type: "self" };
    }
    const currentTarget = targetWords[currentTargetWordIndex];
    for (const wordObj of targetWords) {
      if (!wordObj.eaten && head.x === wordObj.x && head.y === wordObj.y) {
        return wordObj.id === currentTarget?.id ? { type: "correct_word", word: wordObj } : { type: "wrong_word", word: wordObj };
      }
    }
    return { type: "none" };
  };

  const moveSnake = () => {
    if (gameOver || gameWon || !gameStarted || !isMoving) return;
    const currentActualSnake = snakeRef.current; // Use ref for current snake state before update
    const head = { ...currentActualSnake[0] };
    switch (direction) {
      case "up": head.y -= 1; break; case "down": head.y += 1; break;
      case "left": head.x -= 1; break; case "right": head.x += 1; break;
      default: break;
    }
    const collisionResult = checkCollision(head);
    let nextLogicalSnake: SnakePart[] = [head, ...currentActualSnake.slice(0, -1)];
    switch (collisionResult.type) {
      case "wall": 
        setGameOver(true); 
        setEndTime(Date.now()); // 记录结束时间
        playBonkSound();
        return;
      case "self": case "wrong_word": 
        setGameOver(true); 
        setEndTime(Date.now()); // 记录结束时间
        return;
      case "correct_word":
        if (collisionResult.word) {
          playEatAppleSound();
          nextLogicalSnake = [head, ...currentActualSnake]; // Snake grows
          setScore((prevScore) => prevScore + 10);
          setTargetWords(prevWords => {
            // 标记当前单词为 eaten
            const updated = prevWords.map(w => w.id === collisionResult.word!.id ? { ...w, eaten: true } : w);
            // 检查是否需要补充新单词
            const uneatenCount = updated.filter(w => !w.eaten).length;
            if (uneatenCount < 5 && remainingWords.length > 0) {
              // 从池子补充一个新单词
              const [nextWord, ...rest] = remainingWords;
              // 随机生成新位置，避免和蛇、其他单词重叠
              let pos_x, pos_y, positionKey;
              const occupied = new Set([
                ...snake.map(p => `${p.x},${p.y}`),
                ...updated.filter(w => !w.eaten).map(w => `${w.x},${w.y}`)
              ]);
              do {
                pos_x = generateRandomPosition();
                pos_y = generateRandomPosition();
                positionKey = `${pos_x},${pos_y}`;
              } while (occupied.has(positionKey));
              const newWord = { ...nextWord, x: pos_x, y: pos_y, eaten: false };
              setRemainingWords(rest);
              return [...updated, newWord];
            }
            return updated;
          });
          // 判断游戏是否胜利
          setTimeout(() => {
            setTargetWords(current => {
              const allEaten = current.every(w => w.eaten);
              if (allEaten && remainingWords.length === 0) {
                setGameWon(true);
                setEndTime(Date.now()); // 记录结束时间
                playSuccessSound();
              }
              return current;
            });
          }, 0);
        }
        break;
      default:
        break;
    }
    setPreviousSnake(currentActualSnake);
    setSnake(nextLogicalSnake);
    setLastMoveTime(Date.now());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    if (!gameStarted && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      // This is the first key press to start movement if game hasn't formally started via button
      // but snake is on screen.
      if (!isMoving) {
        setPreviousSnake(snakeRef.current); 
        setLastMoveTime(Date.now());
      }
      setIsMoving(true);
    }
    if (gameOver || gameWon || !gameStarted) return;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
    
    if (!isMoving) { // First directional key press after game has started or snake stopped
      setIsMoving(true);
      setPreviousSnake(snakeRef.current);
      setLastMoveTime(Date.now());
    }
    
    // 播放蛇嘶嘶声音
    let directionChanged = false;
    
    switch (e.key) {
      case "ArrowUp": 
        if (direction !== "down") {
          setDirection("up");
          directionChanged = true;
        }
        break;
      case "ArrowDown": 
        if (direction !== "up") {
          setDirection("down");
          directionChanged = true;
        }
        break;
      case "Left": 
      case "ArrowLeft": 
        if (direction !== "right") {
          setDirection("left");
          directionChanged = true;
        }
        break;
      case "Right": 
      case "ArrowRight": 
        if (direction !== "left") {
          setDirection("right");
          directionChanged = true;
        }
        break;
      default: 
        break;
    }
    
    // 如果方向改变，播放嘶嘶声
    if (directionChanged) {
      playSnakeHissSound();
    }
  };

  const drawGame = () => {
    if (!canvasRef.current || targetWords.length === 0) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    drawBackground(ctx, canvasSize, canvasSize);

    const currentTime = Date.now();
    let t = 1.0; // Default to target position (no interpolation)

    if (previousSnake && lastMoveTime && isMoving && !gameOver && !gameWon) {
      const elapsed = currentTime - lastMoveTime;
      t = Math.min(elapsed / gameSpeed, 1.0);
    }

    const snakeBlue = "#3C79E6"; 
    const segmentRadius = cellSize * 0.35;

    snake.forEach((targetPart, index) => {
      const targetPixelX = targetPart.x * cellSize;
      const targetPixelY = targetPart.y * cellSize;

      let drawPixelX = targetPixelX;
      let drawPixelY = targetPixelY;

      if (t < 1.0 && previousSnake) { // Interpolate if t is less than 1 and previousSnake exists
        let sourcePart: SnakePart | undefined = undefined;

        if (index < previousSnake.length) { // Common case, or if snake shrunk (not current logic)
          sourcePart = previousSnake[index];
        } else if (index === previousSnake.length && index > 0) { 
          // Snake grew, this is the new tail. Animate from old tail's position.
          sourcePart = previousSnake[index - 1];
        }
        // If snake grew and index === 0 (new head), sourcePart will be previousSnake[0] (old head) by the first condition.
        
        if (sourcePart) {
          const sourcePixelX = sourcePart.x * cellSize;
          const sourcePixelY = sourcePart.y * cellSize;
          drawPixelX = sourcePixelX * (1 - t) + targetPixelX * t;
          drawPixelY = sourcePixelY * (1 - t) + targetPixelY * t;
        }
      }
      
      // 1. Draw Shadow for the segment
      const shadowOffsetX = cellSize * 0.12;
      const shadowOffsetY = cellSize * 0.12;
      ctx.fillStyle = "rgba(0, 0, 0, 0.25)"; // Darker shadow color (was 0.1)
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(drawPixelX + shadowOffsetX, drawPixelY + shadowOffsetY, cellSize, cellSize, segmentRadius);
      } else {
        ctx.fillRect(drawPixelX + shadowOffsetX, drawPixelY + shadowOffsetY, cellSize, cellSize);
      }
      ctx.fill();

      // 2. Draw segment body
      ctx.fillStyle = snakeBlue;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(drawPixelX, drawPixelY, cellSize, cellSize, segmentRadius);
      else ctx.fillRect(drawPixelX, drawPixelY, cellSize, cellSize);
      ctx.fill();

      // Draw eyes on the head (index === 0)
      if (index === 0) { 
        const eyeRadiusFactor = 0.35, pupilRadiusFactor = 0.21, eyeSeparationFactor = 0.23, eyeForwardFactor = 0.68, pupilOffsetFactor = 0.4;
        const currentEyeRadius = cellSize * eyeRadiusFactor, currentPupilRadius = cellSize * pupilRadiusFactor;
        const actualEyeSeparation = cellSize * eyeSeparationFactor, actualEyePlacement = cellSize * eyeForwardFactor;
        let eye1_x, eye1_y, eye2_x, eye2_y, pupil_actual_offsetX = 0, pupil_actual_offsetY = 0;
        // Use drawPixelX and drawPixelY as the base for eye calculations
        const midX = drawPixelX + cellSize / 2; 
        const midY = drawPixelY + cellSize / 2;
        switch (direction) { // direction state is still the logical direction
          case "right": eye1_x = drawPixelX + actualEyePlacement; eye2_x = eye1_x; eye1_y = midY - actualEyeSeparation; eye2_y = midY + actualEyeSeparation; pupil_actual_offsetX = currentPupilRadius * pupilOffsetFactor; break;
          case "left": eye1_x = drawPixelX + (cellSize - actualEyePlacement); eye2_x = eye1_x; eye1_y = midY - actualEyeSeparation; eye2_y = midY + actualEyeSeparation; pupil_actual_offsetX = -currentPupilRadius * pupilOffsetFactor; break;
          case "up": eye1_y = drawPixelY + (cellSize - actualEyePlacement); eye2_y = eye1_y; eye1_x = midX - actualEyeSeparation; eye2_x = midX + actualEyeSeparation; pupil_actual_offsetY = -currentPupilRadius * pupilOffsetFactor; break;
          case "down": eye1_y = drawPixelY + actualEyePlacement; eye2_y = eye1_y; eye1_x = midX - actualEyeSeparation; eye2_x = midX + actualEyeSeparation; pupil_actual_offsetY = currentPupilRadius * pupilOffsetFactor; break;
          default: eye1_x = midX; eye1_y = midY; eye2_x = midX; eye2_y = midY; break;
        }
        ctx.fillStyle = "white";
        ctx.beginPath(); ctx.arc(eye1_x, eye1_y, currentEyeRadius, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(eye2_x, eye2_y, currentEyeRadius, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "black";
        ctx.beginPath(); ctx.arc(eye1_x + pupil_actual_offsetX, eye1_y + pupil_actual_offsetY, currentPupilRadius, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(eye2_x + pupil_actual_offsetX, eye2_y + pupil_actual_offsetY, currentPupilRadius, 0, Math.PI * 2); ctx.fill();
      }
    });

    targetWords.forEach(wordObj => {
      if (!wordObj.eaten) {
        const appleX = wordObj.x * cellSize;
        const appleY = wordObj.y * cellSize;
        const appleRadius = cellSize / 1.33; // Current (e.g. /2.0) * 1.5 = /1.33
        const centerX = appleX + cellSize / 2;
        const centerY = appleY + cellSize / 2;

        // 1. Draw Shadow (underneath the apple)
        ctx.fillStyle = "rgba(0, 0, 0, 0.15)"; // Soft, semi-transparent black for shadow
        ctx.beginPath();
        // Ellipse for a slightly squashed shadow effect
        ctx.ellipse(centerX, centerY + appleRadius * 0.85, appleRadius * 0.9, appleRadius * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw Apple Graphic (body, stem, leaf) - Renamed to 2. Draw Apple Body for clarity
        ctx.fillStyle = "#D9453D"; // Apple body color (all apples are red)
        ctx.beginPath();
        ctx.arc(centerX, centerY, appleRadius, 0, Math.PI * 2); // Use centerX, centerY
        ctx.fill();

        // 3. Draw Highlight (Smaller)
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)"; // Slightly less opaque
        ctx.beginPath();
        // Smaller arc for highlight
        const highlightRadius = appleRadius * 0.35; // Reduced radius for highlight
        const highlightX = centerX - appleRadius * 0.35; // Use centerX
        const highlightY = centerY - appleRadius * 0.4; // Use centerY
        ctx.arc(highlightX, highlightY, highlightRadius, Math.PI * 1.7, Math.PI * 0.45, false); // Adjusted angles for a smaller shape
        ctx.fill();
        
        // 4. Draw Stem (already exists, ensure it's fine)
        const stemWidth = cellSize / 7;
        const stemHeight = cellSize / 3.5; // Adjusted from cellSize / 4 to make it longer
        const stemX = centerX - stemWidth / 2; // Use centerX
        const stemY = centerY - appleRadius - stemHeight * 0.5; // Use centerY, This will use the new stemHeight
        ctx.fillStyle = "#8B4513"; // Stem color
        ctx.beginPath(); 
        if(ctx.roundRect) ctx.roundRect(stemX, stemY, stemWidth, stemHeight, stemWidth / 3); 
        else ctx.fillRect(stemX, stemY, stemWidth, stemHeight); // Fallback for stem
        ctx.fill();
        
        const leafWidth = cellSize / 2.2;
        const leafHeight = cellSize / 3.3;
        const leafX = centerX + stemWidth; // Use centerX
        const leafY = centerY - appleRadius - stemHeight * 0.3; // Use centerY
        const leafAngle = Math.PI / 4;
        ctx.fillStyle = "#69B46F"; // Leaf color
        ctx.beginPath(); 
        if(ctx.ellipse) ctx.ellipse(leafX, leafY, leafWidth / 2, leafHeight / 2, leafAngle, 0, Math.PI * 2); 
        else { // Fallback for ellipse (e.g., a small rotated rectangle or circle)
            const fallbackLeafRadius = Math.min(leafWidth, leafHeight) / 2;
            ctx.arc(leafX, leafY, fallbackLeafRadius, 0, Math.PI * 2);
        }
        ctx.fill();

        // 5.5 Add Apple Navel (肚脐眼)
        ctx.fillStyle = "rgba(0, 0, 0, 0.15)"; // Darker, slightly transparent for navel
        const navelRadius = appleRadius * 0.1;
        const navelX = centerX; // Use centerX
        const navelY = centerY + appleRadius * 0.8; // Use centerY, Position at the bottom
        ctx.beginPath();
        ctx.arc(navelX, navelY, navelRadius, 0, Math.PI * 2);
        ctx.fill();

        // 6. Draw English word on the apple - 动态调整字体大小
        ctx.fillStyle = "white"; // Word text color for good contrast on red apple
        const fontSize = Math.max(10, cellSize / 1.5); // Current (e.g. /2.3) * 1.5 = /1.53, using /1.5
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Calculate text width
        const textMetrics = ctx.measureText(wordObj.word);
        const textWidth = textMetrics.width;
        
        let textDrawX = centerX; // Default to centerX
        const padding = 5;

        // Adjust textDrawX if text goes out of bounds
        if (centerX - textWidth / 2 < padding) { // Too close to left edge
            textDrawX = textWidth / 2 + padding;
        } else if (centerX + textWidth / 2 > canvasSize - padding) { // Too close to right edge
            textDrawX = canvasSize - textWidth / 2 - padding;
        }

        // 先描边，再填充，提升可读性
        ctx.lineWidth = 4;
        ctx.strokeStyle = "rgba(0,0,0,0.7)";
        ctx.strokeText(wordObj.word, textDrawX, centerY + fontSize * 0.05);
        ctx.fillStyle = "white";
        ctx.fillText(wordObj.word, textDrawX, centerY + fontSize * 0.05);
      }
    });
  };
  
  const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const color1 = "#AAD751", color2 = "#A2D149";
    for (let r = 0; r < gridSize; r++) for (let c = 0; c < gridSize; c++) { ctx.fillStyle = (r + c) % 2 === 0 ? color1 : color2; ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize); }
  };

  useEffect(() => {
    if (gameOver || gameWon || !gameStarted || !isMoving) return;
    const gameLoop = setInterval(moveSnake, gameSpeed);
    return () => clearInterval(gameLoop);
  }, [snake, direction, gameOver, gameWon, gameStarted, isMoving, targetWords, currentTargetWordIndex]);

  useEffect(() => {
    let animationFrameId: number;
    const render = () => { drawGame(); animationFrameId = requestAnimationFrame(render); };
    if (gameStarted) {
        render();
    } else if (canvasRef.current) { 
        const ctx = canvasRef.current.getContext("2d"); 
        if (ctx) { 
            ctx.clearRect(0, 0, canvasSize, canvasSize); 
            drawBackground(ctx, canvasSize, canvasSize); 
        }
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [snake, targetWords, score, gameOver, gameWon, gameStarted, direction, isMoving, currentTargetWordIndex, canvasSize, cellSize]);

  useEffect(() => {
    if (gameStarted && canvasRef.current) canvasRef.current.focus();
    const handleGlobalKeyDown = (e: KeyboardEvent) => { if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key) && (gameStarted || !isMoving)) e.preventDefault(); };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [gameStarted, gameOver, gameWon, isMoving]); // Added gameWon

  useEffect(() => {
    snakeRef.current = snake;
  }, [snake]);

  useEffect(() => {
    // 每次 targetWords 变化时，自动指向下一个未吃掉的单词
    const nextIdx = targetWords.findIndex(w => !w.eaten);
    if (nextIdx !== -1) {
      setCurrentTargetWordIndex(nextIdx);
    }
  }, [targetWords]);

  const currentTargetDisplay = targetWords[currentTargetWordIndex];

  // 响应式样式计算
  const topBarFontSize = Math.max(14, Math.min(18, canvasSize / 30));
  const targetWordFontSize = Math.max(14, Math.min(18, canvasSize / 33));
  const gameOverMessageFontSize = Math.max(14, Math.min(22, canvasSize / 27));
  
  // + 新增：离开游戏的处理函数
  const handleLeaveGame = () => {
    // 从 location.state 获取 cameFromPage，并指定类型
    const cameFromPage = (location.state as { cameFromPage?: number } | undefined)?.cameFromPage;

    if (typeof cameFromPage === 'number') {
      sessionStorage.setItem('snakeCameFromPage', cameFromPage.toString());
    } else {
      sessionStorage.removeItem('snakeCameFromPage'); // 如果没有有效的页码，确保清除旧值
    }

    // 新增：带回autoFullscreen状态
    sessionStorage.setItem('memorizeAutoFullscreen', autoFullscreen ? 'true' : 'false');

    // @ts-ignore 
    navigate(-1); // 不再通过 state 传递
  };
  
  // 计算用时（秒）
  const durationSeconds = startTime && endTime ? Math.round((endTime - startTime) / 1000) : 0;
  
  return (
    <div className="google-snake-game-container" ref={containerRef}>
      <div 
        className="top-bar" 
        style={{ 
          fontSize: `${topBarFontSize}px`, 
          width: canvasSize, // Set width to canvasSize
          margin: '0 auto 10px auto' // Add margin for centering and bottom spacing
        }}
      >
        <div className="score-section">
          <span className="icon-apple">🎯</span> 
          <span className="score-value">{score}</span>
          {gameStarted && !gameOver && !gameWon && currentTargetDisplay && (
            <span className="target-hint-text" style={{ marginLeft: '20px', fontSize: `${targetWordFontSize}px` }}>
              目标 {currentTargetWordIndex + 1}/{targetWords.length}: {currentTargetDisplay.translation}
            </span>
          )}
          {gameWon && (
            <span style={{ marginLeft: '20px', fontSize: `${targetWordFontSize}px`, fontWeight: 'bold', color: '#4CAF50' }}>
              挑战成功!
            </span>
          )}
        </div>
        <div className="controls-section">
          {/* Icons removed as per user request */}
          {/* + 新增离开按钮 */}
          <button onClick={handleLeaveGame} className="leave-button" style={{fontSize: `${topBarFontSize}px`}}>
            离开游戏
          </button>
        </div>
      </div>
      <div 
        className="canvas-area-wrapper"
        style={{ width: canvasSize, height: canvasSize, margin: '0 auto' }}
      >
        <canvas 
          ref={canvasRef} 
          width={canvasSize} 
          height={canvasSize} 
          onKeyDown={handleKeyDown} 
          tabIndex={0} 
          className={`game-canvas ${gameOver ? 'game-over-border' : ''} ${gameWon ? 'game-won-border' : ''}`}
          style={{ maxWidth: '100%', height: 'auto' }}
        />
        {!gameStarted && (<button className="start-button" onClick={startGame}>开始游戏</button>)}
        {gameWon && (
          <div className="game-over-message game-won" style={{ fontSize: `${gameOverMessageFontSize}px` }}> 
            <h2>挑战成功!</h2>
            <p>你完成了所有 {targetWords.length} 个单词!</p>
            <p>最终分数: {score}</p>
            <p>用时: {durationSeconds} 秒</p>
            <button onClick={startGame}>再来一轮</button>
          </div>
        )}
        {gameOver && !gameWon && (
          <div className="game-over-message" style={{ fontSize: `${gameOverMessageFontSize}px` }}>
            <h2>游戏结束</h2> <p>最终分数: {score}</p> <p>用时: {durationSeconds} 秒</p> <button onClick={startGame}>重新开始</button>
          </div>
        )}
      </div>
    </div>
  );
}; 