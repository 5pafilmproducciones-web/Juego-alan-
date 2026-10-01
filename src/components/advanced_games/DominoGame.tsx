import React, { useState } from 'react';
import { playSoundEffect } from '../../services/speechService';
import { RotateCcw, Trophy, Sparkles, Layers } from 'lucide-react';

interface DominoTile {
  id: string;
  left: number;
  right: number;
}

interface DominoGameProps {
  onWin: (gems: number) => void;
  soundEnabled: boolean;
}

export const DominoGame: React.FC<DominoGameProps> = ({ onWin, soundEnabled }) => {
  const [boardChain, setBoardChain] = useState<DominoTile[]>([]);
  const [playerHand, setPlayerHand] = useState<DominoTile[]>([]);
  const [lumiHand, setLumiHand] = useState<DominoTile[]>([]);
  const [boneyard, setBoneyard] = useState<DominoTile[]>([]);
  const [turn, setTurn] = useState<'player' | 'lumi'>('player');
  const [winner, setWinner] = useState<'player' | 'lumi' | null>(null);
  const [message, setMessage] = useState('¡Empieza la partida de Dominó! Coloca una ficha que coincida.');

  // Initialize Domino Double-6 Set
  const initGame = () => {
    const allTiles: DominoTile[] = [];
    let count = 0;
    for (let i = 0; i <= 6; i++) {
      for (let j = i; j <= 6; j++) {
        allTiles.push({ id: `dom-${count++}`, left: i, right: j });
      }
    }

    // Shuffle deck
    const shuffled = [...allTiles].sort(() => Math.random() - 0.5);

    const initialBoard = [shuffled[0]];
    const pHand = shuffled.slice(1, 7);
    const lHand = shuffled.slice(7, 13);
    const bone = shuffled.slice(13);

    setBoardChain(initialBoard);
    setPlayerHand(pHand);
    setLumiHand(lHand);
    setBoneyard(bone);
    setTurn('player');
    setWinner(null);
    setMessage(`Ficha inicial colocada: [${initialBoard[0].left}|${initialBoard[0].right}].`);
  };

  React.useEffect(() => {
    initGame();
  }, []);

  const openLeft = boardChain.length > 0 ? boardChain[0].left : 0;
  const openRight = boardChain.length > 0 ? boardChain[boardChain.length - 1].right : 0;

  // Check if player tile can match
  const canPlayTile = (tile: DominoTile) => {
    return (
      tile.left === openLeft ||
      tile.right === openLeft ||
      tile.left === openRight ||
      tile.right === openRight
    );
  };

  // Play tile to board
  const handlePlayTile = (tile: DominoTile) => {
    if (turn !== 'player' || winner) return;

    if (!canPlayTile(tile)) {
      setMessage(`Esta ficha [${tile.left}|${tile.right}] no coincide con los extremos [${openLeft}] ni [${openRight}].`);
      if (soundEnabled) playSoundEffect('wrong');
      return;
    }

    let newChain = [...boardChain];

    // Connect to Right end if matches
    if (tile.left === openRight) {
      newChain.push(tile);
    } else if (tile.right === openRight) {
      newChain.push({ ...tile, left: tile.right, right: tile.left });
    } else if (tile.right === openLeft) {
      newChain.unshift(tile);
    } else if (tile.left === openLeft) {
      newChain.unshift({ ...tile, left: tile.right, right: tile.left });
    }

    const newHand = playerHand.filter((t) => t.id !== tile.id);
    setBoardChain(newChain);
    setPlayerHand(newHand);
    if (soundEnabled) playSoundEffect('gem');

    // Check Player Victory
    if (newHand.length === 0) {
      setWinner('player');
      setMessage('¡DOMINÓ! ¡Te has quedado sin fichas y ganas la partida!');
      onWin(35);
      return;
    }

    setMessage('Has jugado tu ficha. Turno de Lumi...');
    setTurn('lumi');
    setTimeout(() => executeLumiTurn(newChain, lumiHand, boneyard), 900);
  };

  // Draw from Boneyard
  const handleDrawBoneyard = () => {
    if (boneyard.length === 0) {
      setMessage('El pozo de fichas está vacío. Pasa el turno a Lumi.');
      setTurn('lumi');
      setTimeout(() => executeLumiTurn(boardChain, lumiHand, boneyard), 900);
      return;
    }

    const drawn = boneyard[0];
    const newBone = boneyard.slice(1);
    setBoneyard(newBone);
    setPlayerHand([...playerHand, drawn]);
    if (soundEnabled) playSoundEffect('feed');
    setMessage(`Has robado la ficha [${drawn.left}|${drawn.right}].`);
  };

  // Lumi Bot Turn
  const executeLumiTurn = (chain: DominoTile[], currentLumiHand: DominoTile[], currentBone: DominoTile[]) => {
    const curOpenL = chain[0].left;
    const curOpenR = chain[chain.length - 1].right;

    const playable = currentLumiHand.find(
      (t) => t.left === curOpenL || t.right === curOpenL || t.left === curOpenR || t.right === curOpenR
    );

    if (playable) {
      let updatedChain = [...chain];
      if (playable.left === curOpenR) {
        updatedChain.push(playable);
      } else if (playable.right === curOpenR) {
        updatedChain.push({ ...playable, left: playable.right, right: playable.left });
      } else if (playable.right === curOpenL) {
        updatedChain.unshift(playable);
      } else if (playable.left === curOpenL) {
        updatedChain.unshift({ ...playable, left: playable.right, right: playable.left });
      }

      const updatedLHand = currentLumiHand.filter((t) => t.id !== playable.id);
      setBoardChain(updatedChain);
      setLumiHand(updatedLHand);

      if (updatedLHand.length === 0) {
        setWinner('lumi');
        setMessage('Lumi ha colocado su última ficha y gana la partida.');
        return;
      }

      setMessage(`Lumi jugó la ficha [${playable.left}|${playable.right}]. ¡Tu turno!`);
      setTurn('player');
    } else if (currentBone.length > 0) {
      // Lumi draws
      const drawn = currentBone[0];
      const newBone = currentBone.slice(1);
      setBoneyard(newBone);
      const newLumiHand = [...currentLumiHand, drawn];
      setLumiHand(newLumiHand);
      setMessage('Lumi no tenía ficha jugable y robó del pozo. ¡Tu turno!');
      setTurn('player');
    } else {
      setMessage('Lumi pasa el turno. ¡Tu turno!');
      setTurn('player');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center font-bold text-xl border border-violet-500/30">
            🀄
          </div>
          <div>
            <h4 className="text-base font-black text-white">Dominó Clásico Infantil · Doble 6</h4>
            <p className="text-xs text-slate-400">{message}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-violet-300">Tus Fichas: {playerHand.length}</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Lumi: {lumiHand.length}</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400">Pozo: {boneyard.length}</span>
          </div>

          <button
            onClick={initGame}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar</span>
          </button>
        </div>
      </div>

      {/* Domino Table Board */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 min-h-[160px] flex items-center overflow-x-auto shadow-inner">
        <div className="flex items-center gap-2 mx-auto py-2">
          {boardChain.map((tile, idx) => (
            <div
              key={`${tile.id}-${idx}`}
              className="flex items-center bg-white text-slate-950 font-black rounded-lg border-2 border-slate-300 shadow-md divide-x divide-slate-400 px-2 py-1 select-none"
            >
              <span className="px-1.5 text-sm">{tile.left}</span>
              <span className="px-1.5 text-sm">{tile.right}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Player Hand & Draw Options */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-300">Tus Fichas (Haz clic para colocar):</span>
          <button
            onClick={handleDrawBoneyard}
            disabled={turn !== 'player' || boneyard.length === 0 || winner !== null}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold disabled:opacity-40 transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Robar del Pozo ({boneyard.length})</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {playerHand.map((tile) => {
            const isPlayable = canPlayTile(tile) && turn === 'player';
            return (
              <button
                key={tile.id}
                onClick={() => handlePlayTile(tile)}
                disabled={turn !== 'player' || winner !== null}
                className={`flex items-center bg-white text-slate-950 font-black rounded-xl border-2 px-3 py-2 select-none shadow-lg divide-x divide-slate-300 transition-all transform hover:-translate-y-1 ${
                  isPlayable
                    ? 'ring-4 ring-emerald-400 border-emerald-500 animate-pulse'
                    : 'border-slate-300 opacity-80'
                }`}
              >
                <span className="px-2 text-base">{tile.left}</span>
                <span className="px-2 text-base">{tile.right}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Winner Celebration */}
      {winner && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between border animate-bounce ${
            winner === 'player'
              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
              : 'bg-rose-950/80 border-rose-500 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-400" />
            <div>
              <h5 className="font-black text-sm">
                {winner === 'player' ? '¡Victoria en Dominó Infantil!' : 'Partida finalizada.'}
              </h5>
              {winner === 'player' && (
                <p className="text-xs text-emerald-200">+35 gemas añadidas a tu alcancía virtual.</p>
              )}
            </div>
          </div>
          <button
            onClick={initGame}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
          >
            Nueva Partida
          </button>
        </div>
      )}
    </div>
  );
};
