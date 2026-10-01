import React, { useState, useEffect } from 'react';
import { LearningMission, ArcadeGameType } from '../types';
import { playSoundEffect } from '../services/speechService';
import { Sparkles, Trophy, RotateCcw, Volume2, Heart, Award } from 'lucide-react';
import { GalaxyWarsGame } from './advanced_games/GalaxyWarsGame';

interface ArcadeMiniGameProps {
  mission: LearningMission;
  onGameComplete: (gemsEarned: number) => void;
  soundEnabled: boolean;
}

export const ArcadeMiniGame: React.FC<ArcadeMiniGameProps> = ({
  mission,
  onGameComplete,
  soundEnabled,
}) => {
  const arcadeType = mission.arcadeType || 'memory';

  // State for Memory Game
  const [memoryCards, setMemoryCards] = useState<
    { id: number; icon: string; isFlipped: boolean; isMatched: boolean }[]
  >([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [memoryMatches, setMemoryMatches] = useState(0);

  // State for Bubble Pop Game
  const [bubbles, setBubbles] = useState<
    { id: number; x: number; y: number; color: string; size: number; icon: string }[]
  >([]);
  const [poppedCount, setPoppedCount] = useState(0);

  // State for Space Runner Game
  const [runnerLane, setRunnerLane] = useState<number>(1); // 0 (left), 1 (center), 2 (right)
  const [runnerScore, setRunnerScore] = useState(0);
  const [asteroidLane, setAsteroidLane] = useState(0);
  const [asteroidY, setAsteroidY] = useState(0);
  const [runnerGameOver, setRunnerGameOver] = useState(false);

  // State for Whack-a-Mole
  const [activeMoleIndex, setActiveMoleIndex] = useState<number | null>(null);
  const [whackScore, setWhackScore] = useState(0);

  // State for Animal Piano
  const [playedNotes, setPlayedNotes] = useState<string[]>([]);

  // State for Simon Says
  const [simonSequence, setSimonSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [simonActiveColor, setSimonActiveColor] = useState<number | null>(null);
  const [simonRound, setSimonRound] = useState(1);

  // State for Shape Sorter
  const [sortedShapes, setSortedShapes] = useState<string[]>([]);

  // Victory State
  const [isCompleted, setIsCompleted] = useState(false);

  // Initialize Memory Game
  useEffect(() => {
    if (arcadeType === 'memory') {
      initMemoryGame();
    } else if (arcadeType === 'bubble_pop') {
      initBubblePop();
    } else if (arcadeType === 'whack') {
      initWhackGame();
    } else if (arcadeType === 'simon_sound') {
      initSimonGame();
    }
    setIsCompleted(false);
  }, [arcadeType, mission.id]);

  // Memory Game Logic
  const initMemoryGame = () => {
    const icons = ['🚀', '⭐', '🪐', '👾', '🌈', '💎'];
    const deck = [...icons, ...icons]
      .sort(() => Math.random() - 0.5)
      .map((icon, idx) => ({
        id: idx,
        icon,
        isFlipped: false,
        isMatched: false,
      }));
    setMemoryCards(deck);
    setSelectedCards([]);
    setMemoryMatches(0);
  };

  const handleFlipCard = (index: number) => {
    if (selectedCards.length >= 2 || memoryCards[index].isFlipped || memoryCards[index].isMatched) {
      return;
    }

    playSoundEffect('feed');
    const newCards = [...memoryCards];
    newCards[index].isFlipped = true;
    setMemoryCards(newCards);

    const newSelected = [...selectedCards, index];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      const [first, second] = newSelected;
      if (newCards[first].icon === newCards[second].icon) {
        // Match!
        setTimeout(() => {
          playSoundEffect('correct');
          newCards[first].isMatched = true;
          newCards[second].isMatched = true;
          setMemoryCards([...newCards]);
          setSelectedCards([]);
          const newMatchCount = memoryMatches + 1;
          setMemoryMatches(newMatchCount);

          if (newMatchCount === 6) {
            handleVictory();
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          newCards[first].isFlipped = false;
          newCards[second].isFlipped = false;
          setMemoryCards([...newCards]);
          setSelectedCards([]);
        }, 900);
      }
    }
  };

  // Bubble Pop Game Logic
  const initBubblePop = () => {
    setPoppedCount(0);
    spawnBubbles();
  };

  const spawnBubbles = () => {
    const icons = ['✨', '💎', '🫧', '⭐', '🎈'];
    const colors = ['bg-violet-500', 'bg-pink-500', 'bg-cyan-500', 'bg-amber-500', 'bg-emerald-500'];
    const newBubbles = Array.from({ length: 10 }).map((_, i) => ({
      id: Date.now() + i,
      x: Math.floor(Math.random() * 80) + 5,
      y: Math.floor(Math.random() * 65) + 15,
      color: colors[i % colors.length],
      size: Math.floor(Math.random() * 20) + 48,
      icon: icons[i % icons.length],
    }));
    setBubbles(newBubbles);
  };

  const handlePopBubble = (id: number) => {
    playSoundEffect('gem');
    setBubbles((prev) => prev.filter((b) => b.id !== id));
    const nextCount = poppedCount + 1;
    setPoppedCount(nextCount);

    if (nextCount >= 10) {
      handleVictory();
    }
  };

  // Whack Game Logic
  const initWhackGame = () => {
    setWhackScore(0);
    const interval = setInterval(() => {
      const nextHole = Math.floor(Math.random() * 6);
      setActiveMoleIndex(nextHole);
      setTimeout(() => setActiveMoleIndex(null), 1200);
    }, 1500);

    return () => clearInterval(interval);
  };

  const handleWhackMole = (index: number) => {
    if (activeMoleIndex === index) {
      playSoundEffect('correct');
      setActiveMoleIndex(null);
      const nextScore = whackScore + 1;
      setWhackScore(nextScore);

      if (nextScore >= 6) {
        handleVictory();
      }
    }
  };

  // Animal Piano Notes with Web Audio API
  const playPianoNote = (noteName: string, freq: number, icon: string) => {
    if (typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      }
    }

    setPlayedNotes((prev) => [...prev.slice(-6), `${noteName} ${icon}`]);
    if (playedNotes.length >= 7) {
      handleVictory();
    }
  };

  // Simon Says
  const initSimonGame = () => {
    setSimonRound(1);
    const firstSeq = [Math.floor(Math.random() * 4)];
    setSimonSequence(firstSeq);
    setPlayerSequence([]);
    playSimonVisualSequence(firstSeq);
  };

  const playSimonVisualSequence = (seq: number[]) => {
    seq.forEach((col, idx) => {
      setTimeout(() => {
        setSimonActiveColor(col);
        playSoundEffect('feed');
        setTimeout(() => setSimonActiveColor(null), 400);
      }, (idx + 1) * 700);
    });
  };

  const handleSimonPlayerPress = (colorIndex: number) => {
    playSoundEffect('feed');
    const newSeq = [...playerSequence, colorIndex];
    setPlayerSequence(newSeq);

    const currentStep = newSeq.length - 1;
    if (newSeq[currentStep] !== simonSequence[currentStep]) {
      // Wrong sequence
      playSoundEffect('wrong');
      setPlayerSequence([]);
      playSimonVisualSequence(simonSequence);
      return;
    }

    if (newSeq.length === simonSequence.length) {
      playSoundEffect('correct');
      if (simonRound >= 3) {
        handleVictory();
      } else {
        setSimonRound((prev) => prev + 1);
        const nextSeq = [...simonSequence, Math.floor(Math.random() * 4)];
        setSimonSequence(nextSeq);
        setPlayerSequence([]);
        setTimeout(() => playSimonVisualSequence(nextSeq), 1000);
      }
    }
  };

  // Shape Sorter
  const handleSortShape = (shape: string) => {
    playSoundEffect('correct');
    const updated = [...sortedShapes, shape];
    setSortedShapes(updated);
    if (updated.length >= 4) {
      handleVictory();
    }
  };

  // Universal Victory Trigger
  const handleVictory = () => {
    setIsCompleted(true);
    playSoundEffect('levelUp');
    onGameComplete(mission.gemReward);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div>
          <span className="text-xs uppercase font-extrabold text-fuchsia-400 tracking-wider">
            Arcade Cósmico · Nivel {mission.level}
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white">{mission.title}</h3>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-violet-950/80 border border-violet-800 px-3 py-1.5 rounded-xl text-violet-300 font-bold text-xs">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span>+{mission.gemReward} Gemas</span>
          </div>
        </div>
      </div>

      {/* GAME 1: MEMORY MATCH */}
      {arcadeType === 'memory' && (
        <div className="space-y-4 max-w-lg mx-auto text-center">
          <p className="text-xs text-slate-300">
            Pares encontrados: <strong className="text-fuchsia-400 font-bold">{memoryMatches} / 6</strong>
          </p>

          <div className="grid grid-cols-4 gap-3">
            {memoryCards.map((card, idx) => (
              <button
                key={card.id}
                onClick={() => handleFlipCard(idx)}
                className={`h-20 sm:h-24 rounded-2xl text-3xl flex items-center justify-center font-bold transition-all transform duration-300 ${
                  card.isFlipped || card.isMatched
                    ? 'bg-violet-600/90 text-white border-2 border-violet-400 shadow-lg scale-105'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-500 border border-slate-800 hover:scale-95'
                }`}
              >
                {card.isFlipped || card.isMatched ? card.icon : '❓'}
              </button>
            ))}
          </div>

          <button
            onClick={initMemoryGame}
            className="flex items-center gap-1.5 mx-auto text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar Tablero</span>
          </button>
        </div>
      )}

      {/* GAME 2: BUBBLE POP */}
      {arcadeType === 'bubble_pop' && (
        <div className="space-y-4 text-center">
          <p className="text-xs text-slate-300">
            Burbujas reventadas: <strong className="text-cyan-400 font-bold">{poppedCount} / 10</strong>
          </p>

          <div className="relative h-72 bg-gradient-to-b from-indigo-950/40 via-purple-950/40 to-slate-950 rounded-2xl border border-slate-800 overflow-hidden select-none">
            {bubbles.map((b) => (
              <button
                key={b.id}
                onClick={() => handlePopBubble(b.id)}
                style={{
                  left: `${b.x}%`,
                  top: `${b.y}%`,
                  width: `${b.size}px`,
                  height: `${b.size}px`,
                }}
                className={`absolute rounded-full flex items-center justify-center text-xl shadow-lg border border-white/40 cursor-pointer transform hover:scale-125 active:scale-75 transition-transform animate-pulse ${b.color}`}
              >
                {b.icon}
              </button>
            ))}

            {bubbles.length === 0 && !isCompleted && (
              <div className="h-full flex items-center justify-center">
                <button
                  onClick={spawnBubbles}
                  className="px-4 py-2 rounded-xl bg-violet-600 text-white font-bold text-xs"
                >
                  Generar Más Burbujas
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* GAME 3: WHACK-A-MOLE ALIEN */}
      {arcadeType === 'whack' && (
        <div className="space-y-4 text-center max-w-md mx-auto">
          <p className="text-xs text-slate-300">
            Aliens atrapados: <strong className="text-emerald-400 font-bold">{whackScore} / 6</strong>
          </p>

          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, idx) => {
              const isActive = activeMoleIndex === idx;
              return (
                <div
                  key={idx}
                  onClick={() => handleWhackMole(idx)}
                  className="h-24 rounded-2xl bg-slate-950 border-2 border-slate-800 relative flex items-center justify-center cursor-pointer overflow-hidden group shadow-inner"
                >
                  <div className="absolute inset-x-2 bottom-1 h-3 rounded-full bg-slate-900 border border-slate-800" />
                  {isActive && (
                    <div className="text-4xl animate-bounce transform hover:scale-125 transition-transform">
                      👾
                    </div>
                  )}
                  {!isActive && <div className="text-xs text-slate-700">Cráter {idx + 1}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* GAME 4: ANIMAL PIANO */}
      {arcadeType === 'animal_piano' && (
        <div className="space-y-4 text-center max-w-lg mx-auto">
          <p className="text-xs text-slate-300">
            Toca las 7 notas para completar la melodía mágica ({playedNotes.length} / 7):
          </p>

          <div className="flex justify-center gap-1.5">
            {[
              { note: 'DO', freq: 261.63, color: 'bg-rose-600', icon: '🐶' },
              { note: 'RE', freq: 293.66, color: 'bg-orange-600', icon: '🐱' },
              { note: 'MI', freq: 329.63, color: 'bg-amber-600', icon: '🦁' },
              { note: 'FA', freq: 349.23, color: 'bg-emerald-600', icon: '🐸' },
              { note: 'SOL', freq: 392.0, color: 'bg-teal-600', icon: '🐬' },
              { note: 'LA', freq: 440.0, color: 'bg-blue-600', icon: '🐼' },
              { note: 'SI', freq: 493.88, color: 'bg-violet-600', icon: '🦄' },
            ].map((key) => (
              <button
                key={key.note}
                onClick={() => playPianoNote(key.note, key.freq, key.icon)}
                className={`flex-1 h-36 rounded-xl flex flex-col justify-end p-2 text-white font-bold transition-all transform hover:-translate-y-2 active:scale-95 shadow-lg border border-white/20 ${key.color}`}
              >
                <span className="text-2xl mb-2">{key.icon}</span>
                <span className="text-xs">{key.note}</span>
              </button>
            ))}
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 min-h-[38px]">
            Melodía: {playedNotes.join('  ')}
          </div>
        </div>
      )}

      {/* GAME 5: SIMON SAYS */}
      {arcadeType === 'simon_sound' && (
        <div className="space-y-4 text-center max-w-sm mx-auto">
          <p className="text-xs text-slate-300">
            Ronda: <strong className="text-amber-400 font-bold">{simonRound} / 3</strong> · Escucha y repite el patrón
          </p>

          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 0, color: 'bg-rose-500', name: 'Rojo' },
              { id: 1, color: 'bg-emerald-500', name: 'Verde' },
              { id: 2, color: 'bg-amber-500', name: 'Amarillo' },
              { id: 3, color: 'bg-blue-500', name: 'Azul' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => handleSimonPlayerPress(btn.id)}
                className={`h-28 rounded-2xl transition-all shadow-md ${
                  simonActiveColor === btn.id
                    ? `${btn.color} ring-4 ring-white scale-105`
                    : `${btn.color} opacity-80 hover:opacity-100`
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* GAME 6: SHAPE SORTER */}
      {arcadeType === 'shape_sorter' && (
        <div className="space-y-4 text-center max-w-md mx-auto">
          <p className="text-xs text-slate-300">
            Empareja las formas mágicas: <strong className="text-violet-400 font-bold">{sortedShapes.length} / 4</strong>
          </p>

          <div className="grid grid-cols-4 gap-3">
            {[
              { id: 'circle', icon: '⭕', name: 'Círculo' },
              { id: 'square', icon: '🟦', name: 'Cuadrado' },
              { id: 'triangle', icon: '🔺', name: 'Triángulo' },
              { id: 'star', icon: '⭐', name: 'Estrella' },
            ].map((shape) => {
              const isMatched = sortedShapes.includes(shape.id);
              return (
                <button
                  key={shape.id}
                  disabled={isMatched}
                  onClick={() => handleSortShape(shape.id)}
                  className={`h-24 rounded-2xl flex flex-col items-center justify-center p-2 text-3xl transition-all ${
                    isMatched
                      ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-400'
                      : 'bg-slate-950 border border-slate-800 hover:border-violet-500 active:scale-95'
                  }`}
                >
                  <span>{shape.icon}</span>
                  <span className="text-[10px] text-slate-400 mt-1 font-bold">{shape.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* GUERRA DE LAS GALAXIAS BASE DEFENSE */}
      {arcadeType === 'galaxia' && (
        <GalaxyWarsGame
          onWin={(gems) => {
            onGameComplete(gems);
            setIsCompleted(true);
          }}
          soundEnabled={soundEnabled}
        />
      )}

      {/* DEFAULT / RUNNER / PET CARE */}
      {['space_runner', 'apple_catcher', 'puzzle_slider', 'pet_care'].includes(arcadeType) && (
        <div className="text-center p-8 bg-slate-950/60 rounded-2xl border border-slate-800 max-w-md mx-auto space-y-4">
          <div className="text-6xl animate-bounce">
            {arcadeType === 'space_runner' ? '🚀' : arcadeType === 'apple_catcher' ? '🧺' : '🐉'}
          </div>
          <h4 className="text-lg font-bold text-white">¡Reto Arcade en Progreso!</h4>
          <p className="text-xs text-slate-300 leading-relaxed">{mission.question}</p>
          <button
            onClick={handleVictory}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold text-xs shadow-lg shadow-violet-600/30 transform hover:scale-105 transition-all"
          >
            ¡Superar Reto y Reclamar Gemas!
          </button>
        </div>
      )}

      {/* VICTORY MODAL OVERLAY */}
      {isCompleted && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fadeIn z-20">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-4xl mb-3 shadow-lg">
            🏆
          </div>
          <h4 className="text-2xl font-black text-white">¡Juego Completado!</h4>
          <p className="text-xs text-amber-300 mt-1">
            Has ganado +{mission.gemReward} gemas brillantes para tu alcancía.
          </p>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => setIsCompleted(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:text-white"
            >
              Jugar de Nuevo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
