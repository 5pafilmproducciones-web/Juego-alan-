import React, { useState, useEffect, useCallback } from 'react';
import { playSoundEffect } from '../../services/speechService';
import { RotateCcw, Trophy, Sparkles, Compass, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface MazeGameProps {
  onWin: (gems: number) => void;
  soundEnabled: boolean;
}

export const ProceduralMazeGame: React.FC<MazeGameProps> = ({ onWin, soundEnabled }) => {
  const [size, setSize] = useState<number>(11); // 9, 11, 15 (must be odd)
  const [grid, setGrid] = useState<number[][]>([]); // 0 = path, 1 = wall
  const [playerPos, setPlayerPos] = useState<[number, number]>([1, 1]);
  const [goalPos, setGoalPos] = useState<[number, number]>([9, 9]);
  const [visitedTrail, setVisitedTrail] = useState<Set<string>>(new Set(['1,1']));
  const [steps, setSteps] = useState(0);
  const [hasWon, setHasWon] = useState(false);
  const [mazeSeed, setMazeSeed] = useState(1);

  // Generate a procedural maze using Depth-First Search with recursive backtracking
  const generateMaze = useCallback((dim: number) => {
    // 1. Initialize full wall grid (1 = wall, 0 = path)
    const maze: number[][] = Array(dim)
      .fill(0)
      .map(() => Array(dim).fill(1));

    // Carve passages from (1, 1)
    const stack: [number, number][] = [[1, 1]];
    maze[1][1] = 0;

    const directions = [
      [-2, 0],
      [2, 0],
      [0, -2],
      [0, 2],
    ];

    while (stack.length > 0) {
      const [r, c] = stack[stack.length - 1];

      // Shuffle directions for organic branching
      const shuffledDirs = [...directions].sort(() => Math.random() - 0.5);
      let carved = false;

      for (const [dr, dc] of shuffledDirs) {
        const nr = r + dr;
        const nc = c + dc;

        if (nr > 0 && nr < dim - 1 && nc > 0 && nc < dim - 1 && maze[nr][nc] === 1) {
          // Carve wall between
          maze[r + dr / 2][c + dc / 2] = 0;
          maze[nr][nc] = 0;
          stack.push([nr, nc]);
          carved = true;
          break;
        }
      }

      if (!carved) {
        stack.pop();
      }
    }

    // Set goal at opposite corner
    const endR = dim - 2;
    const endC = dim - 2;
    maze[endR][endC] = 0;

    setGrid(maze);
    setPlayerPos([1, 1]);
    setGoalPos([endR, endC]);
    setVisitedTrail(new Set(['1,1']));
    setSteps(0);
    setHasWon(false);
  }, []);

  // Initialize on mount or difficulty change
  useEffect(() => {
    generateMaze(size);
  }, [size, mazeSeed, generateMaze]);

  // Movement handler
  const movePlayer = useCallback(
    (dr: number, dc: number) => {
      if (hasWon || grid.length === 0) return;

      const [r, c] = playerPos;
      const nr = r + dr;
      const nc = c + dc;

      // Check bounds and wall collision
      if (nr >= 0 && nr < size && nc >= 0 && nc < size && grid[nr][nc] === 0) {
        const nextPos: [number, number] = [nr, nc];
        setPlayerPos(nextPos);
        setSteps((prev) => prev + 1);
        setVisitedTrail((prev) => new Set(prev).add(`${nr},${nc}`));

        if (soundEnabled) playSoundEffect('gem');

        // Check victory
        if (nr === goalPos[0] && nc === goalPos[1]) {
          setHasWon(true);
          if (soundEnabled) playSoundEffect('correct');
          const reward = size >= 15 ? 40 : size >= 11 ? 25 : 15;
          onWin(reward);
        }
      } else {
        if (soundEnabled) playSoundEffect('wrong');
      }
    },
    [playerPos, grid, size, goalPos, hasWon, soundEnabled, onWin]
  );

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        movePlayer(-1, 0);
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        movePlayer(1, 0);
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        movePlayer(0, -1);
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        movePlayer(0, 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-xl border border-emerald-500/30">
            🧭
          </div>
          <div>
            <h4 className="text-base font-black text-white">
              Laberinto Procedural Infinito · ¡Diferente Cada Vez!
            </h4>
            <p className="text-xs text-slate-400">
              Guía a tu explorador 🚀 hasta el cofre del tesoro 🏆 esquivando muros.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Difficulty selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setSize(9)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                size === 9 ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Fácil
            </button>
            <button
              onClick={() => setSize(11)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                size === 11 ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Medio
            </button>
            <button
              onClick={() => setSize(15)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                size === 15 ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Desafío
            </button>
          </div>

          <button
            onClick={() => setMazeSeed((s) => s + 1)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold border border-emerald-500/40 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nuevo Laberinto</span>
          </button>
        </div>
      </div>

      {/* Main Maze Canvas / Grid */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-6">
        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner max-w-sm sm:max-w-md w-full">
          <div
            className="grid gap-0.5 rounded-xl overflow-hidden border border-slate-800"
            style={{
              gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
            }}
          >
            {grid.map((row, r) =>
              row.map((val, c) => {
                const isPlayer = playerPos[0] === r && playerPos[1] === c;
                const isGoal = goalPos[0] === r && goalPos[1] === c;
                const isWall = val === 1;
                const isVisited = visitedTrail.has(`${r},${c}`);

                return (
                  <div
                    key={`${r}-${c}`}
                    className={`aspect-square flex items-center justify-center text-xs sm:text-sm font-bold select-none transition-colors ${
                      isWall
                        ? 'bg-slate-800 border border-slate-700/60 shadow-sm'
                        : isPlayer
                        ? 'bg-violet-600 text-white ring-2 ring-violet-300 z-10 scale-105'
                        : isGoal
                        ? 'bg-amber-500/30 text-amber-300 animate-pulse'
                        : isVisited
                        ? 'bg-violet-950/40 text-violet-500'
                        : 'bg-slate-900'
                    }`}
                  >
                    {isPlayer ? (
                      '🚀'
                    ) : isGoal ? (
                      '🏆'
                    ) : isVisited && !isWall ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500/50" />
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Controls & Stats panel */}
        <div className="space-y-4 text-center">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <span className="text-slate-400 block mb-1">Pasos Realizados:</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">{steps}</span>
          </div>

          {/* D-Pad Buttons for Touch / Tablet */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 inline-block shadow-lg">
            <span className="text-[10px] text-slate-500 font-bold block mb-2">Controles Táctiles</span>
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => movePlayer(-1, 0)}
                className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-violet-600 active:scale-95 text-white flex items-center justify-center border border-slate-700 transition-all shadow-md"
              >
                <ArrowUp className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => movePlayer(0, -1)}
                  className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-violet-600 active:scale-95 text-white flex items-center justify-center border border-slate-700 transition-all shadow-md"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => movePlayer(1, 0)}
                  className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-violet-600 active:scale-95 text-white flex items-center justify-center border border-slate-700 transition-all shadow-md"
                >
                  <ArrowDown className="w-6 h-6" />
                </button>
                <button
                  onClick={() => movePlayer(0, 1)}
                  className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-violet-600 active:scale-95 text-white flex items-center justify-center border border-slate-700 transition-all shadow-md"
                >
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Victory Banner */}
      {hasWon && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 flex items-center justify-between animate-bounce shadow-xl">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-400" />
            <div>
              <h5 className="font-black text-sm">¡Laberinto Superado con Éxito!</h5>
              <p className="text-xs text-emerald-200">
                Llegaste al tesoro en {steps} pasos. ¡Recompensa obtenida!
              </p>
            </div>
          </div>
          <button
            onClick={() => setMazeSeed((s) => s + 1)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
          >
            Siguiente Laberinto
          </button>
        </div>
      )}
    </div>
  );
};
