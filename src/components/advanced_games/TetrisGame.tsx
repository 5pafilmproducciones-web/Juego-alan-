import React, { useState, useEffect, useRef, useCallback } from 'react';
import { playSoundEffect } from '../../services/speechService';
import {
  RotateCcw,
  Trophy,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Zap,
  Sparkles,
  Pause,
  Play,
} from 'lucide-react';

interface TetrisGameProps {
  onWin: (gems: number) => void;
  soundEnabled: boolean;
}

const COLS = 10;
const ROWS = 20;

// Tetromino Shapes and Colors
const SHAPES = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
};

const COLORS: Record<string, string> = {
  I: '#06B6D4', // Cyan
  J: '#3B82F6', // Blue
  L: '#F97316', // Orange
  O: '#FACC15', // Yellow
  S: '#22C55E', // Green
  T: '#A855F7', // Purple
  Z: '#EF4444', // Red
};

type TetrominoType = keyof typeof SHAPES;

interface CurrentPiece {
  type: TetrominoType;
  shape: number[][];
  x: number;
  y: number;
}

export const TetrisGame: React.FC<TetrisGameProps> = ({ onWin, soundEnabled }) => {
  const [grid, setGrid] = useState<string[][]>(() => createEmptyGrid());
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPiece, setCurrentPiece] = useState<CurrentPiece | null>(null);
  const [nextPieceType, setNextPieceType] = useState<TetrominoType>('T');
  const [holdPieceType, setHoldPieceType] = useState<TetrominoType | null>(null);
  const [canHold, setCanHold] = useState(true);

  const stateRef = useRef({
    grid: createEmptyGrid(),
    currentPiece: null as CurrentPiece | null,
    score: 0,
    lines: 0,
    level: 1,
    isOver: false,
    isPaused: false,
    nextType: 'T' as TetrominoType,
    holdType: null as TetrominoType | null,
    canHold: true,
  });

  function createEmptyGrid(): string[][] {
    return Array(ROWS)
      .fill(null)
      .map(() => Array(COLS).fill(''));
  }

  // Get random tetromino type
  const getRandomPieceType = (): TetrominoType => {
    const types: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
    return types[Math.floor(Math.random() * types.length)];
  };

  // Spawn new piece
  const spawnPiece = (type?: TetrominoType) => {
    const pieceType = type || stateRef.current.nextType;
    const nextType = getRandomPieceType();
    stateRef.current.nextType = nextType;
    setNextPieceType(nextType);

    const shape = SHAPES[pieceType];
    const newPiece: CurrentPiece = {
      type: pieceType,
      shape: shape.map((row) => [...row]),
      x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
      y: 0,
    };

    // Check collision at spawn (Game Over)
    if (checkCollision(newPiece, stateRef.current.grid, 0, 0)) {
      stateRef.current.isOver = true;
      setIsGameOver(true);
      if (soundEnabled) playSoundEffect('wrong');
      return;
    }

    stateRef.current.currentPiece = newPiece;
    stateRef.current.canHold = true;
    setCurrentPiece(newPiece);
    setCanHold(true);
  };

  // Check collision helper
  const checkCollision = (
    piece: CurrentPiece,
    boardGrid: string[][],
    offsetX = 0,
    offsetY = 0,
    newShape?: number[][]
  ): boolean => {
    const shape = newShape || piece.shape;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const targetX = piece.x + c + offsetX;
          const targetY = piece.y + r + offsetY;

          // Out of bounds
          if (targetX < 0 || targetX >= COLS || targetY >= ROWS) {
            return true;
          }
          // Hit locked block
          if (targetY >= 0 && boardGrid[targetY][targetX]) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // Rotate matrix 90 deg
  const rotateMatrix = (matrix: number[][]): number[][] => {
    const N = matrix.length;
    const result: number[][] = Array(N)
      .fill(0)
      .map(() => Array(N).fill(0));
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        result[c][N - 1 - r] = matrix[r][c];
      }
    }
    return result;
  };

  // Move current piece
  const movePiece = (dx: number, dy: number): boolean => {
    const p = stateRef.current.currentPiece;
    if (!p || stateRef.current.isOver || stateRef.current.isPaused) return false;

    if (!checkCollision(p, stateRef.current.grid, dx, dy)) {
      p.x += dx;
      p.y += dy;
      setCurrentPiece({ ...p });
      return true;
    }
    return false;
  };

  // Rotate action with wall-kick
  const rotateCurrentPiece = () => {
    const p = stateRef.current.currentPiece;
    if (!p || stateRef.current.isOver || stateRef.current.isPaused) return;

    const rotated = rotateMatrix(p.shape);

    // Basic rotation check
    if (!checkCollision(p, stateRef.current.grid, 0, 0, rotated)) {
      p.shape = rotated;
      setCurrentPiece({ ...p });
      if (soundEnabled) playSoundEffect('gem');
      return;
    }

    // Wall-kick Left
    if (!checkCollision(p, stateRef.current.grid, -1, 0, rotated)) {
      p.x -= 1;
      p.shape = rotated;
      setCurrentPiece({ ...p });
      if (soundEnabled) playSoundEffect('gem');
      return;
    }

    // Wall-kick Right
    if (!checkCollision(p, stateRef.current.grid, 1, 0, rotated)) {
      p.x += 1;
      p.shape = rotated;
      setCurrentPiece({ ...p });
      if (soundEnabled) playSoundEffect('gem');
    }
  };

  // Lock piece into grid & clear lines
  const lockPiece = () => {
    const p = stateRef.current.currentPiece;
    if (!p) return;

    const newGrid = stateRef.current.grid.map((row) => [...row]);
    const color = COLORS[p.type];

    for (let r = 0; r < p.shape.length; r++) {
      for (let c = 0; c < p.shape[r].length; c++) {
        if (p.shape[r][c]) {
          const gy = p.y + r;
          const gx = p.x + c;
          if (gy >= 0 && gy < ROWS && gx >= 0 && gx < COLS) {
            newGrid[gy][gx] = color;
          }
        }
      }
    }

    // Line clearing
    let linesCleared = 0;
    const filteredGrid = newGrid.filter((row) => {
      const isComplete = row.every((cell) => cell !== '');
      if (isComplete) linesCleared++;
      return !isComplete;
    });

    while (filteredGrid.length < ROWS) {
      filteredGrid.unshift(Array(COLS).fill(''));
    }

    // Scoring
    if (linesCleared > 0) {
      const linePoints = [0, 100, 300, 500, 800];
      const pts = (linePoints[linesCleared] || 100) * stateRef.current.level;
      stateRef.current.score += pts;
      stateRef.current.lines += linesCleared;
      stateRef.current.level = Math.floor(stateRef.current.lines / 5) + 1;

      setScore(stateRef.current.score);
      setLines(stateRef.current.lines);
      setLevel(stateRef.current.level);

      if (soundEnabled) playSoundEffect('correct');

      // Milestone rewards
      if (stateRef.current.lines % 10 === 0) {
        onWin(25);
      }
    } else {
      if (soundEnabled) playSoundEffect('gem');
    }

    stateRef.current.grid = filteredGrid;
    setGrid(filteredGrid);

    spawnPiece();
  };

  // Hard Drop
  const hardDrop = () => {
    const p = stateRef.current.currentPiece;
    if (!p || stateRef.current.isOver || stateRef.current.isPaused) return;

    while (movePiece(0, 1)) {
      // drop down until collision
    }
    lockPiece();
  };

  // Hold Piece
  const holdPiece = () => {
    const s = stateRef.current;
    if (!s.currentPiece || !s.canHold || s.isOver || s.isPaused) return;

    const currentType = s.currentPiece.type;
    if (s.holdType) {
      const swapType = s.holdType;
      s.holdType = currentType;
      s.canHold = false;
      setHoldPieceType(currentType);
      setCanHold(false);
      spawnPiece(swapType);
    } else {
      s.holdType = currentType;
      s.canHold = false;
      setHoldPieceType(currentType);
      setCanHold(false);
      spawnPiece();
    }
    if (soundEnabled) playSoundEffect('unlock');
  };

  // Initialize
  const handleReset = () => {
    const emptyGrid = createEmptyGrid();
    const firstType = getRandomPieceType();
    const secondType = getRandomPieceType();

    stateRef.current = {
      grid: emptyGrid,
      currentPiece: null,
      score: 0,
      lines: 0,
      level: 1,
      isOver: false,
      isPaused: false,
      nextType: secondType,
      holdType: null,
      canHold: true,
    };

    setGrid(emptyGrid);
    setScore(0);
    setLines(0);
    setLevel(1);
    setIsGameOver(false);
    setIsPaused(false);
    setNextPieceType(secondType);
    setHoldPieceType(null);
    setCanHold(true);

    spawnPiece(firstType);
    if (soundEnabled) playSoundEffect('gem');
  };

  useEffect(() => {
    handleReset();
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        movePiece(-1, 0);
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        movePiece(1, 0);
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        if (!movePiece(0, 1)) {
          lockPiece();
        }
      } else if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        rotateCurrentPiece();
      } else if (e.code === 'Space') {
        e.preventDefault();
        hardDrop();
      } else if (['KeyC', 'KeyH'].includes(e.code)) {
        e.preventDefault();
        holdPiece();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGameOver, isPaused]);

  // Game Gravity Loop (Speed decreases as level rises)
  useEffect(() => {
    if (isGameOver || isPaused) return;

    const dropInterval = Math.max(120, 800 - (level - 1) * 70);
    const timer = setInterval(() => {
      if (!movePiece(0, 1)) {
        lockPiece();
      }
    }, dropInterval);

    return () => clearInterval(timer);
  }, [level, isGameOver, isPaused]);

  // Construct display matrix blending grid + current falling piece
  const displayGrid = grid.map((row) => [...row]);
  if (currentPiece && !isGameOver) {
    for (let r = 0; r < currentPiece.shape.length; r++) {
      for (let c = 0; c < currentPiece.shape[r].length; c++) {
        if (currentPiece.shape[r][c]) {
          const gy = currentPiece.y + r;
          const gx = currentPiece.x + c;
          if (gy >= 0 && gy < ROWS && gx >= 0 && gx < COLS) {
            displayGrid[gy][gx] = COLORS[currentPiece.type];
          }
        }
      }
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-2xl border border-cyan-500/30">
            🧱
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>Tetris Retro Clásico VIP</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                Nivel {level}
              </span>
            </h4>
            <p className="text-xs text-slate-300">
              Encaja los tetrominós, completa líneas completas y gana gemas adicionales.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused((prev) => !prev)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-colors"
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'Reanudar' : 'Pausar'}</span>
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar</span>
          </button>
        </div>
      </div>

      {/* Tetris Layout: Left Side (Hold & Score), Center Matrix (10x20), Right Side (Next piece) */}
      <div className="flex justify-center items-start gap-4 flex-wrap">
        {/* Left Column: Hold Box & Stats */}
        <div className="w-24 sm:w-28 space-y-3">
          {/* Hold Box */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Guardar (C)</span>
            <div className="w-16 h-16 mx-auto flex items-center justify-center bg-slate-900 rounded-xl border border-slate-800">
              {holdPieceType ? (
                <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${SHAPES[holdPieceType][0].length}, 1fr)` }}>
                  {SHAPES[holdPieceType].map((row, r) =>
                    row.map((cell, c) => (
                      <div
                        key={`${r}-${c}`}
                        className="w-3 h-3 rounded-xs"
                        style={{ backgroundColor: cell ? COLORS[holdPieceType] : 'transparent' }}
                      />
                    ))
                  )}
                </div>
              ) : (
                <span className="text-xs text-slate-600">—</span>
              )}
            </div>
            <button
              onClick={holdPiece}
              disabled={!canHold || isGameOver || isPaused}
              className="w-full py-1 text-[10px] font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
            >
              Guardar
            </button>
          </div>

          {/* Score & Lines */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-center space-y-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Puntos</span>
              <span className="text-base font-mono font-black text-amber-400">{score}</span>
            </div>
            <div className="pt-1 border-t border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Líneas</span>
              <span className="text-base font-mono font-black text-cyan-400">{lines}</span>
            </div>
          </div>
        </div>

        {/* Center: 10x20 Grid Canvas / Matrix */}
        <div className="p-2 sm:p-3 bg-slate-950 rounded-3xl border-4 border-slate-800 shadow-2xl">
          <div
            className="grid gap-0.5 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden p-1"
            style={{
              gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
              width: '240px',
              height: '420px',
            }}
          >
            {displayGrid.map((row, r) =>
              row.map((color, c) => (
                <div
                  key={`${r}-${c}`}
                  className="rounded-xs transition-colors"
                  style={{
                    backgroundColor: color || '#0F172A',
                    boxShadow: color ? 'inset 0 0 0 1px rgba(255,255,255,0.2)' : 'none',
                  }}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Column: Next Piece Preview */}
        <div className="w-24 sm:w-28 space-y-3">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Siguiente</span>
            <div className="w-16 h-16 mx-auto flex items-center justify-center bg-slate-900 rounded-xl border border-slate-800">
              <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${SHAPES[nextPieceType][0].length}, 1fr)` }}>
                {SHAPES[nextPieceType].map((row, r) =>
                  row.map((cell, c) => (
                    <div
                      key={`${r}-${c}`}
                      className="w-3 h-3 rounded-xs"
                      style={{ backgroundColor: cell ? COLORS[nextPieceType] : 'transparent' }}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Nivel</span>
            <span className="text-xl font-mono font-black text-emerald-400">{level}</span>
          </div>
        </div>
      </div>

      {/* On-Screen Touch Controls Pad */}
      <div className="grid grid-cols-5 gap-2 max-w-sm mx-auto">
        <button
          onClick={() => movePiece(-1, 0)}
          className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white flex items-center justify-center shadow-md font-bold"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <button
          onClick={rotateCurrentPiece}
          className="p-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white flex items-center justify-center shadow-md font-bold"
        >
          <RotateCw className="w-5 h-5" />
        </button>

        <button
          onClick={() => {
            if (!movePiece(0, 1)) lockPiece();
          }}
          className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white flex items-center justify-center shadow-md font-bold"
        >
          <ArrowDown className="w-5 h-5" />
        </button>

        <button
          onClick={() => movePiece(1, 0)}
          className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white flex items-center justify-center shadow-md font-bold"
        >
          <ArrowRight className="w-5 h-5" />
        </button>

        <button
          onClick={hardDrop}
          className="p-3 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 flex items-center justify-center shadow-md font-black text-xs"
          title="Caída instantánea"
        >
          <Zap className="w-5 h-5" />
        </button>
      </div>

      {/* Game Over Modal */}
      {isGameOver && (
        <div className="p-4 rounded-2xl bg-rose-950/90 border border-rose-500 text-rose-200 shadow-2xl flex items-center justify-between gap-4">
          <div>
            <h5 className="font-black text-base text-white">¡Fin de la Partida Tetris!</h5>
            <p className="text-xs text-rose-300">
              Puntuación final: <strong>{score}</strong> · Líneas completadas: <strong>{lines}</strong>
            </p>
          </div>
          <button
            onClick={handleReset}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg uppercase"
          >
            Jugar de Nuevo
          </button>
        </div>
      )}
    </div>
  );
};
