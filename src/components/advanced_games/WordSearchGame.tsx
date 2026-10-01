import React, { useState, useEffect } from 'react';
import { playSoundEffect } from '../../services/speechService';
import { RotateCcw, Trophy, Check, Sparkles, BookOpen } from 'lucide-react';

interface WordSearchGameProps {
  onWin: (gems: number) => void;
  soundEnabled: boolean;
}

const THEMES = [
  {
    name: 'Animales Mágicos',
    icon: '🦁',
    words: ['LEON', 'TIGRE', 'DELFIN', 'OSO', 'PANDA', 'ZORRO'],
  },
  {
    name: 'Misión Espacial',
    icon: '🚀',
    words: ['COHETE', 'LUNA', 'SOL', 'PLANETA', 'COMETA', 'ESTRELLA'],
  },
  {
    name: 'Naturaleza & Bosque',
    icon: '🌳',
    words: ['ARBOL', 'FLOR', 'RIO', 'MONTE', 'VIENTO', 'LLUVIA'],
  },
  {
    name: 'Frutas Deliciosas',
    icon: '🍓',
    words: ['MANZANA', 'PLATANO', 'FRESA', 'UVA', 'LIMON', 'PERA'],
  },
];

export const WordSearchGame: React.FC<WordSearchGameProps> = ({ onWin, soundEnabled }) => {
  const [themeIndex, setThemeIndex] = useState(0);
  const [grid, setGrid] = useState<string[][]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selectedCells, setSelectedCells] = useState<[number, number][]>([]);
  const [placedWordCoords, setPlacedWordCoords] = useState<{ word: string; cells: [number, number][] }[]>([]);
  const [hasWon, setHasWon] = useState(false);

  const currentTheme = THEMES[themeIndex % THEMES.length];

  // Procedural Word Search Generator
  const generateWordSearch = () => {
    const size = 10;
    const matrix: string[][] = Array(size)
      .fill('')
      .map(() => Array(size).fill(''));

    const coordsList: { word: string; cells: [number, number][] }[] = [];
    const directions = [
      [0, 1], // horizontal
      [1, 0], // vertical
      [1, 1], // diagonal down-right
    ];

    for (const word of currentTheme.words) {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 100) {
        attempts++;
        const dir = directions[Math.floor(Math.random() * directions.length)];
        const dr = dir[0];
        const dc = dir[1];

        const maxR = size - dr * word.length;
        const maxC = size - dc * word.length;

        if (maxR < 0 || maxC < 0) continue;

        const startR = Math.floor(Math.random() * (maxR + 1));
        const startC = Math.floor(Math.random() * (maxC + 1));

        // Check if fits without collision
        let canPlace = true;
        for (let i = 0; i < word.length; i++) {
          const r = startR + dr * i;
          const c = startC + dc * i;
          if (matrix[r][c] !== '' && matrix[r][c] !== word[i]) {
            canPlace = false;
            break;
          }
        }

        if (canPlace) {
          const wordCells: [number, number][] = [];
          for (let i = 0; i < word.length; i++) {
            const r = startR + dr * i;
            const c = startC + dc * i;
            matrix[r][c] = word[i];
            wordCells.push([r, c]);
          }
          coordsList.push({ word, cells: wordCells });
          placed = true;
        }
      }
    }

    // Fill empty cells with random letters A-Z
    const alphabet = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!matrix[r][c]) {
          matrix[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }
    }

    setGrid(matrix);
    setPlacedWordCoords(coordsList);
    setFoundWords([]);
    setSelectedCells([]);
    setHasWon(false);
  };

  useEffect(() => {
    generateWordSearch();
  }, [themeIndex]);

  // Handle cell click / selection
  const handleCellClick = (r: number, c: number) => {
    if (hasWon) return;

    // Check if cell is already part of selection
    const existsIndex = selectedCells.findIndex((cell) => cell[0] === r && cell[1] === c);
    let newSelection: [number, number][];

    if (existsIndex >= 0) {
      newSelection = selectedCells.filter((_, idx) => idx !== existsIndex);
    } else {
      newSelection = [...selectedCells, [r, c]];
    }

    setSelectedCells(newSelection);

    // Check if current selection matches any unplaced word
    const selectedString = newSelection.map(([cr, cc]) => grid[cr][cc]).join('');
    const reversedString = selectedString.split('').reverse().join('');

    const matchedWordObj = placedWordCoords.find(
      (w) =>
        !foundWords.includes(w.word) &&
        (w.word === selectedString || w.word === reversedString) &&
        w.cells.length === newSelection.length
    );

    if (matchedWordObj) {
      const updatedFound = [...foundWords, matchedWordObj.word];
      setFoundWords(updatedFound);
      setSelectedCells([]);
      if (soundEnabled) playSoundEffect('correct');

      if (updatedFound.length >= currentTheme.words.length) {
        setHasWon(true);
        onWin(30);
      }
    } else if (soundEnabled) {
      playSoundEffect('gem');
    }
  };

  const isCellInFoundWord = (r: number, c: number) => {
    return placedWordCoords
      .filter((w) => foundWords.includes(w.word))
      .some((w) => w.cells.some(([cr, cc]) => cr === r && cc === c));
  };

  const isCellSelected = (r: number, c: number) => {
    return selectedCells.some(([cr, cc]) => cr === r && cc === c);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-fuchsia-600/20 text-fuchsia-400 flex items-center justify-center font-bold text-xl border border-fuchsia-500/30">
            {currentTheme.icon}
          </div>
          <div>
            <h4 className="text-base font-black text-white">
              Sopa de Letras Mágica · {currentTheme.name}
            </h4>
            <p className="text-xs text-slate-400">
              Toca las letras en orden para formar las palabras secretas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setThemeIndex((t) => t + 1)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600/30 hover:bg-violet-600/50 text-violet-300 text-xs font-bold border border-violet-500/40 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cambiar Tema</span>
          </button>

          <button
            onClick={() => generateWordSearch()}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Generar nueva sopa de letras"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Letter Grid (7 Cols) */}
        <div className="md:col-span-7 flex justify-center">
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner max-w-sm sm:max-w-md w-full">
            <div className="grid grid-cols-10 gap-1 rounded-xl overflow-hidden">
              {grid.map((row, r) =>
                row.map((letter, c) => {
                  const isFound = isCellInFoundWord(r, c);
                  const isSelected = isCellSelected(r, c);

                  return (
                    <button
                      key={`${r}-${c}`}
                      onClick={() => handleCellClick(r, c)}
                      className={`aspect-square flex items-center justify-center text-xs sm:text-sm font-black rounded-lg transition-all transform active:scale-90 ${
                        isFound
                          ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                          : isSelected
                          ? 'bg-fuchsia-600 text-white ring-2 ring-fuchsia-300 scale-105 shadow-md'
                          : 'bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                      }`}
                    >
                      {letter}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Word Checklist & Progress (5 Cols) */}
        <div className="md:col-span-5 space-y-4">
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold border-b border-slate-800 pb-2">
              <span className="text-slate-400">Palabras a Encontrar:</span>
              <span className="text-emerald-400">
                {foundWords.length} de {currentTheme.words.length}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {currentTheme.words.map((word) => {
                const isFound = foundWords.includes(word);
                return (
                  <div
                    key={word}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isFound
                        ? 'bg-emerald-950/70 border border-emerald-800 text-emerald-300 line-through opacity-80'
                        : 'bg-slate-900 border border-slate-800 text-white'
                    }`}
                  >
                    <span>{word}</span>
                    {isFound && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                );
              })}
            </div>

            {selectedCells.length > 0 && (
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Seleccionando:</span>
                <span className="text-xs font-mono font-bold text-fuchsia-300 bg-fuchsia-950/80 px-2 py-0.5 rounded border border-fuchsia-800/60">
                  {selectedCells.map(([r, c]) => grid[r][c]).join('')}
                </span>
                <button
                  onClick={() => setSelectedCells([])}
                  className="text-[10px] text-rose-400 hover:underline"
                >
                  Limpiar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Victory Celebration */}
      {hasWon && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 flex items-center justify-between animate-bounce shadow-xl">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-400" />
            <div>
              <h5 className="font-black text-sm">¡Sopa de Letras Completada!</h5>
              <p className="text-xs text-emerald-200">
                Encontraste todas las palabras de {currentTheme.name}. +30 gemas añadidas.
              </p>
            </div>
          </div>
          <button
            onClick={() => setThemeIndex((t) => t + 1)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
          >
            Siguiente Tema
          </button>
        </div>
      )}
    </div>
  );
};
