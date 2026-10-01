import React, { useState, useEffect } from 'react';
import { playSoundEffect } from '../../services/speechService';
import { RotateCcw, Trophy, Flag, Search, Bomb, Sparkles, Radio, ShieldCheck } from 'lucide-react';

interface BombSweeperGameProps {
  onWin: (gems: number) => void;
  soundEnabled: boolean;
}

interface Cell {
  r: number;
  c: number;
  isBomb: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentBombs: number;
}

type Difficulty = 'easy' | 'medium' | 'hard';

export const BombSweeperGame: React.FC<BombSweeperGameProps> = ({ onWin, soundEnabled }) => {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [radarCharges, setRadarCharges] = useState(2);
  const [radarActive, setRadarActive] = useState(false);

  const getDifficultySettings = (diff: Difficulty) => {
    switch (diff) {
      case 'easy':
        return { rows: 6, cols: 6, bombs: 4, reward: 25 };
      case 'hard':
        return { rows: 9, cols: 9, bombs: 12, reward: 45 };
      case 'medium':
      default:
        return { rows: 8, cols: 8, bombs: 8, reward: 35 };
    }
  };

  const { rows, cols, bombs, reward } = getDifficultySettings(difficulty);

  const [grid, setGrid] = useState<Cell[][]>([]);
  const [mode, setMode] = useState<'reveal' | 'flag'>('reveal');
  const [gameOver, setGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [firstClick, setFirstClick] = useState(true);
  const [flagsPlaced, setFlagsPlaced] = useState(0);
  const [message, setMessage] = useState('¡Detector de Bombas! Toca cualquier casilla para explorar con seguridad.');

  const initGrid = () => {
    const newGrid: Cell[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < cols; c++) {
        row.push({
          r,
          c,
          isBomb: false,
          isRevealed: false,
          isFlagged: false,
          adjacentBombs: 0,
        });
      }
      newGrid.push(row);
    }
    setGrid(newGrid);
    setGameOver(false);
    setHasWon(false);
    setFirstClick(true);
    setFlagsPlaced(0);
    setRadarCharges(2);
    setRadarActive(false);
    setMessage('¡Campo listo! El primer toque siempre es 100% seguro.');
  };

  useEffect(() => {
    initGrid();
  }, [difficulty]);

  // Place bombs avoiding the first clicked cell and its neighbors
  const populateBombsAndNumbers = (avoidR: number, avoidC: number, currentGrid: Cell[][]) => {
    const g = currentGrid.map((row) => row.map((cell) => ({ ...cell })));
    let placed = 0;

    while (placed < bombs) {
      const randR = Math.floor(Math.random() * rows);
      const randC = Math.floor(Math.random() * cols);

      // Do not place bomb on or adjacent to initial click
      const isNeighbor = Math.abs(randR - avoidR) <= 1 && Math.abs(randC - avoidC) <= 1;
      if (!g[randR][randC].isBomb && !isNeighbor) {
        g[randR][randC].isBomb = true;
        placed++;
      }
    }

    // Calculate adjacent bomb counts
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!g[r][c].isBomb) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && g[nr][nc].isBomb) {
                count++;
              }
            }
          }
          g[r][c].adjacentBombs = count;
        }
      }
    }

    return g;
  };

  // Cascade reveal empty cells (0 adjacent bombs)
  const revealCascade = (startR: number, startC: number, g: Cell[][]) => {
    const queue: [number, number][] = [[startR, startC]];
    g[startR][startC].isRevealed = true;

    while (queue.length > 0) {
      const [cr, cc] = queue.shift()!;
      if (g[cr][cc].adjacentBombs === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = cr + dr;
            const nc = cc + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
              const neighbor = g[nr][nc];
              if (!neighbor.isRevealed && !neighbor.isBomb && !neighbor.isFlagged) {
                neighbor.isRevealed = true;
                if (neighbor.adjacentBombs === 0) {
                  queue.push([nr, nc]);
                }
              }
            }
          }
        }
      }
    }
  };

  // Radar Scanner Power-up: scans a cell to safely check without exploding
  const handleRadarScan = (r: number, c: number, currentGrid: Cell[][]) => {
    if (radarCharges <= 0) return;
    setRadarCharges((prev) => prev - 1);
    setRadarActive(false);

    const cell = currentGrid[r][c];
    if (cell.isBomb) {
      // Mark as bomb with flag automatically!
      const nextGrid = currentGrid.map((row) => row.map((cl) => ({ ...cl })));
      nextGrid[r][c].isFlagged = true;
      setFlagsPlaced((prev) => prev + 1);
      setGrid(nextGrid);
      setMessage('📡 ¡Radar: ¡PELIGRO! Se detectó una bomba y fue marcada con bandera 🚩!');
      if (soundEnabled) playSoundEffect('correct');
      checkVictory(nextGrid);
    } else {
      // Safe: reveal it!
      const nextGrid = currentGrid.map((row) => row.map((cl) => ({ ...cl })));
      revealCascade(r, c, nextGrid);
      setGrid(nextGrid);
      setMessage('📡 Radar: ¡Casilla segura confirmada y despejada!');
      if (soundEnabled) playSoundEffect('unlock');
      checkVictory(nextGrid);
    }
  };

  const handleCellClick = (r: number, c: number) => {
    if (gameOver || hasWon) return;

    let currentGrid = grid;

    // First click guaranteed safe
    if (firstClick) {
      currentGrid = populateBombsAndNumbers(r, c, grid);
      setFirstClick(false);
    }

    // RADAR SCAN MODE
    if (radarActive) {
      handleRadarScan(r, c, currentGrid);
      return;
    }

    const cell = currentGrid[r][c];

    // FLAG MODE
    if (mode === 'flag') {
      if (cell.isRevealed) return;

      const nextGrid = currentGrid.map((row) => row.map((cl) => ({ ...cl })));
      const target = nextGrid[r][c];
      target.isFlagged = !target.isFlagged;

      const newFlagCount = target.isFlagged ? flagsPlaced + 1 : flagsPlaced - 1;
      setFlagsPlaced(newFlagCount);
      setGrid(nextGrid);

      if (soundEnabled) playSoundEffect('gem');
      setMessage(target.isFlagged ? '¡Bandera colocada! 🚩 Marcaste una posible bomba.' : 'Bandera retirada.');
      checkVictory(nextGrid);
      return;
    }

    // REVEAL MODE
    if (cell.isFlagged || cell.isRevealed) return;

    // Stepped on a bomb!
    if (cell.isBomb) {
      const explodedGrid = currentGrid.map((row) =>
        row.map((cl) => (cl.isBomb ? { ...cl, isRevealed: true } : { ...cl }))
      );
      setGrid(explodedGrid);
      setGameOver(true);
      if (soundEnabled) playSoundEffect('wrong');
      setMessage('💥 ¡BOOM! Descubriste una bomba sin desactivar. ¡Toca Reiniciar para volver a intentarlo!');
      return;
    }

    // Safe reveal
    const nextGrid = currentGrid.map((row) => row.map((cl) => ({ ...cl })));
    revealCascade(r, c, nextGrid);
    setGrid(nextGrid);

    if (soundEnabled) playSoundEffect('correct');
    setMessage('¡Zona segura despejada! Observa los números de pistas.');
    checkVictory(nextGrid);
  };

  const checkVictory = (g: Cell[][]) => {
    let unrevealedSafeCells = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!g[r][c].isBomb && !g[r][c].isRevealed) {
          unrevealedSafeCells++;
        }
      }
    }

    if (unrevealedSafeCells === 0) {
      setHasWon(true);
      if (soundEnabled) playSoundEffect('unlock');
      setMessage('🎉 ¡VICTORIA! Desactivaste todas las bombas del campo minado.');
      onWin(reward);
    }
  };

  const getNumberColor = (num: number) => {
    switch (num) {
      case 1:
        return 'text-blue-400 font-extrabold';
      case 2:
        return 'text-emerald-400 font-extrabold';
      case 3:
        return 'text-rose-400 font-extrabold';
      case 4:
        return 'text-purple-400 font-black';
      case 5:
        return 'text-amber-400 font-black';
      default:
        return 'text-pink-400 font-black';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xl border border-amber-500/30">
            💣
          </div>
          <div>
            <h4 className="text-base font-black text-white">
              Cazabombas · Detector de Minas Ocultas
            </h4>
            <p className="text-xs text-slate-400">{message}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Difficulty Selector */}
          <div className="flex items-center bg-slate-950 rounded-xl p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setDifficulty('easy')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                difficulty === 'easy' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Fácil
            </button>
            <button
              onClick={() => setDifficulty('medium')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                difficulty === 'medium' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Medio
            </button>
            <button
              onClick={() => setDifficulty('hard')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                difficulty === 'hard' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Difícil
            </button>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold">
            <span className="text-rose-400 font-mono">Bombas: {bombs - flagsPlaced} 💣</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400 font-mono">Banderas: {flagsPlaced} 🚩</span>
          </div>

          <button
            onClick={initGrid}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Nuevo Campo</span>
          </button>
        </div>
      </div>

      {/* Mode Selector & Power-Ups */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <button
          onClick={() => {
            setMode('reveal');
            setRadarActive(false);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
            mode === 'reveal' && !radarActive
              ? 'bg-violet-600 text-white ring-2 ring-violet-400/50 shadow-violet-600/30'
              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Modo Descubrir (Pisar)</span>
        </button>

        <button
          onClick={() => {
            setMode('flag');
            setRadarActive(false);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
            mode === 'flag' && !radarActive
              ? 'bg-rose-600 text-white ring-2 ring-rose-400/50 shadow-rose-600/30'
              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Flag className="w-4 h-4" />
          <span>Modo Bandera 🚩 (Marcar)</span>
        </button>

        <button
          onClick={() => {
            if (radarCharges > 0) {
              setRadarActive(!radarActive);
              setMessage('📡 Toca una casilla misteriosa para escanearla con el radar.');
            }
          }}
          disabled={radarCharges <= 0}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
            radarActive
              ? 'bg-cyan-600 text-white ring-2 ring-cyan-400 animate-pulse border-cyan-400'
              : 'bg-slate-950 text-cyan-400 border-cyan-800/50 hover:bg-cyan-950/40 disabled:opacity-40'
          }`}
          title="Escanea una casilla de forma 100% segura"
        >
          <Radio className="w-4 h-4" />
          <span>Escáner Radar ({radarCharges})</span>
        </button>
      </div>

      {/* Minesweeper Grid */}
      <div className="flex justify-center">
        <div className="p-3 bg-slate-950 rounded-2xl border-4 border-slate-800 shadow-2xl max-w-sm sm:max-w-md w-full">
          <div
            className="grid gap-1.5 rounded-xl overflow-hidden"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {grid.map((row, r) =>
              row.map((cell, c) => {
                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    disabled={gameOver || hasWon}
                    className={`aspect-square flex items-center justify-center rounded-lg text-sm sm:text-base font-black transition-all select-none transform active:scale-95 shadow-sm ${
                      cell.isRevealed
                        ? cell.isBomb
                          ? 'bg-rose-600 text-white animate-bounce ring-2 ring-rose-400'
                          : 'bg-slate-800/90 border border-slate-700/60'
                        : cell.isFlagged
                        ? 'bg-amber-950/80 border border-amber-600 text-amber-300'
                        : radarActive
                        ? 'bg-cyan-950/70 border border-cyan-500 hover:bg-cyan-900/80'
                        : 'bg-gradient-to-b from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 border border-slate-600/60'
                    }`}
                  >
                    {cell.isRevealed ? (
                      cell.isBomb ? (
                        '💣'
                      ) : cell.adjacentBombs > 0 ? (
                        <span className={getNumberColor(cell.adjacentBombs)}>
                          {cell.adjacentBombs}
                        </span>
                      ) : null
                    ) : cell.isFlagged ? (
                      '🚩'
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Game Over Banner */}
      {gameOver && (
        <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-300 flex items-center justify-between animate-fadeIn shadow-xl">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce">💥</span>
            <div>
              <h5 className="font-black text-sm">¡Una bomba ha detonado!</h5>
              <p className="text-xs text-rose-200">
                Observa los números de alrededor para deducir dónde se escondían.
              </p>
            </div>
          </div>
          <button
            onClick={initGrid}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Victory Celebration */}
      {hasWon && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 flex items-center justify-between animate-bounce shadow-xl">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-400" />
            <div>
              <h5 className="font-black text-sm">¡Campo Minado Desactivado con Éxito!</h5>
              <p className="text-xs text-emerald-200">
                Demostraste una lógica impecable. +{reward} gemas añadidas a tu alcancía.
              </p>
            </div>
          </div>
          <button
            onClick={initGrid}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
          >
            Nueva Misión
          </button>
        </div>
      )}
    </div>
  );
};
