import React, { useState, useEffect } from 'react';
import { StudentProfile, AdvancedGameId } from '../../types';
import { playSoundEffect } from '../../services/speechService';
import { GalaxyWarsGame } from './GalaxyWarsGame';
import { FarmHarvestGame } from './FarmHarvestGame';
import { BombSweeperGame } from './BombSweeperGame';
import { ProceduralMazeGame } from './ProceduralMazeGame';
import { WordSearchGame } from './WordSearchGame';
import { DominoGame } from './DominoGame';
import { CarRacingGame } from './CarRacingGame';
import { MotoJumpGame } from './MotoJumpGame';
import { TetrisGame } from './TetrisGame';
import {
  Gem,
  Clock,
  Lock,
  Unlock,
  Sparkles,
  Trophy,
  Gamepad2,
  AlertCircle,
  CheckCircle2,
  Flame,
  ArrowRight,
} from 'lucide-react';

interface AdvancedArcadeZoneProps {
  student: StudentProfile;
  onUpdateStudent: (student: StudentProfile | ((prev: StudentProfile) => StudentProfile)) => void;
  onAddToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateToMissions: () => void;
}

interface ExchangePackage {
  id: string;
  name: string;
  gemsCost: number;
  minutesAwarded: number;
  bonusText?: string;
  icon: string;
  badgeColor: string;
}

const EXCHANGE_PACKAGES: ExchangePackage[] = [
  {
    id: 'pack-1',
    name: 'Pase 1 Minuto',
    gemsCost: 30,
    minutesAwarded: 1,
    bonusText: '1 min de recreo',
    icon: '⏱️',
    badgeColor: 'border-blue-500/40 bg-blue-950/60 text-blue-300',
  },
  {
    id: 'pack-2',
    name: 'Partida Estándar (2 Min)',
    gemsCost: 60,
    minutesAwarded: 2,
    bonusText: 'Popular',
    icon: '🕹️',
    badgeColor: 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300',
  },
  {
    id: 'pack-3',
    name: 'Sesión Gamer (3 Min)',
    gemsCost: 90,
    minutesAwarded: 3,
    bonusText: '3 minutos',
    icon: '🏆',
    badgeColor: 'border-violet-500/40 bg-violet-950/60 text-violet-300',
  },
  {
    id: 'pack-4',
    name: 'Súper Pase VIP (5 Min)',
    gemsCost: 150,
    minutesAwarded: 5,
    bonusText: '5 minutos',
    icon: '👑',
    badgeColor: 'border-amber-500/40 bg-amber-950/60 text-amber-300',
  },
  {
    id: 'pack-5',
    name: 'Gran Pase Maestro (10 Min)',
    gemsCost: 280,
    minutesAwarded: 10,
    bonusText: 'Ahorra 20💎',
    icon: '💎',
    badgeColor: 'border-fuchsia-500/40 bg-fuchsia-950/60 text-fuchsia-300',
  },
  {
    id: 'pack-6',
    name: 'Pase Élite Ilimitado (20 Min)',
    gemsCost: 500,
    minutesAwarded: 20,
    bonusText: 'Máximo VIP',
    icon: '⚡',
    badgeColor: 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300',
  },
];

const ADVANCED_GAMES = [
  {
    id: 'galaxia' as AdvancedGameId,
    title: 'Guerra de las Galaxias',
    icon: '🚀',
    description: 'Defiende tu base espacial de meteoritos y naves enemigas usando el teclado, escudos y bombas EMP.',
    category: 'Defensa Espacial VIP',
    difficulty: 'Épico VIP',
    color: 'from-indigo-600 via-purple-600 to-pink-600',
  },
  {
    id: 'granja' as AdvancedGameId,
    title: 'Granja de Animales & Cosecha',
    icon: '🌾',
    description: 'Siembra zanahorias, fresas y trigo, cuida a los animalitos del establo y entrega pedidos.',
    category: 'Simulación & Estrategia',
    difficulty: 'Creativo VIP',
    color: 'from-emerald-600 to-green-500',
  },
  {
    id: 'tetris' as AdvancedGameId,
    title: 'Tetris Retro Clásico',
    icon: '🧱',
    description: 'Encaja las 7 piezas geométricas, completa líneas completas y desafía la gravedad.',
    category: 'Lógica & Reflejos',
    difficulty: 'Retro Clásico',
    color: 'from-cyan-600 to-indigo-600',
  },
  {
    id: 'bombas' as AdvancedGameId,
    title: 'Cazabombas',
    icon: '💣',
    description: 'Detector de minas ocultas: usa pistas numéricas y el radar detector para desactivar bombas sin detonarlas.',
    category: 'Lógica & Deducción',
    difficulty: 'Agilidad Mental',
    color: 'from-amber-600 to-rose-600',
  },
  {
    id: 'laberinto' as AdvancedGameId,
    title: 'Laberinto Infinito',
    icon: '🧭',
    description: 'Generación procedural algorítmica: ¡un laberinto nuevo y único cada vez!',
    category: 'Lógica & Exploración',
    difficulty: 'Procedural',
    color: 'from-emerald-600 to-teal-600',
  },
  {
    id: 'sopa_letras' as AdvancedGameId,
    title: 'Sopa de Letras Mágica',
    icon: '🔤',
    description: 'Generador procedural de palabras con temas de animales, espacio y frutas.',
    category: 'Agilidad Verbal',
    difficulty: 'Procedural',
    color: 'from-fuchsia-600 to-purple-600',
  },
  {
    id: 'domino' as AdvancedGameId,
    title: 'Dominó Doble 6',
    icon: '🀄',
    description: 'Empareja los extremos de la cadena y roba del pozo hasta hacer dominó.',
    category: 'Juego de Mesa',
    difficulty: 'Clásico',
    color: 'from-violet-600 to-indigo-600',
  },
  {
    id: 'autos' as AdvancedGameId,
    title: 'Autos Turbo 2D',
    icon: '🏎️',
    description: 'Esquiva tráfico a alta velocidad, activa nitro y recolecta monedas en pista.',
    category: 'Carreras & Reflejos',
    difficulty: 'Acción',
    color: 'from-red-600 to-rose-700',
  },
  {
    id: 'motos' as AdvancedGameId,
    title: 'Moto X-Cross Saltos',
    icon: '🏍️',
    description: 'Acelera por colinas y rampas, realiza acrobacias aéreas y balancea tu moto.',
    category: 'Física & Acrobacias',
    difficulty: 'Habilidad',
    color: 'from-amber-600 to-yellow-600',
  },
];

export const AdvancedArcadeZone: React.FC<AdvancedArcadeZoneProps> = ({
  student,
  onUpdateStudent,
  onAddToast,
  onNavigateToMissions,
}) => {
  const [selectedGameId, setSelectedGameId] = useState<AdvancedGameId>('galaxia');
  const [showExchangeModal, setShowExchangeModal] = useState(false);

  // Time remaining in seconds
  const timeSeconds = student.arcadeTimeSecondsRemaining ?? 0;

  // Real-time countdown timer while playing
  useEffect(() => {
    if (timeSeconds <= 0) return;

    const interval = setInterval(() => {
      onUpdateStudent((prev) => {
        const curTime = prev.arcadeTimeSecondsRemaining ?? 0;
        if (curTime <= 1) {
          clearInterval(interval);
          onAddToast(
            '¡Tiempo de juego agotado!',
            'Has completado tus minutos de recreo. ¡Gana más gemas en matemáticas o gramática para seguir jugando!',
            'info'
          );
          return {
            ...prev,
            arcadeTimeSecondsRemaining: 0,
            screenTimeUsedMinutes: Math.min(
              prev.dailyScreenTimeLimitMinutes,
              prev.screenTimeUsedMinutes + 1
            ),
          };
        }
        return {
          ...prev,
          arcadeTimeSecondsRemaining: curTime - 1,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeSeconds, onUpdateStudent, onAddToast]);

  const handleBuyTime = (pkg: ExchangePackage) => {
    if (student.gems < pkg.gemsCost) {
      onAddToast(
        'Gemas insuficientes',
        `Necesitas ${pkg.gemsCost} gemas para este paquete. Tienes ${student.gems} gemas. ¡Resuelve más retos educativos!`,
        'error'
      );
      if (student.soundEnabled) playSoundEffect('wrong');
      return;
    }

    const additionalSeconds = Math.round(pkg.minutesAwarded * 60);

    onUpdateStudent((prev) => ({
      ...prev,
      gems: prev.gems - pkg.gemsCost,
      arcadeTimeSecondsRemaining: (prev.arcadeTimeSecondsRemaining ?? 0) + additionalSeconds,
    }));

    if (student.soundEnabled) playSoundEffect('correct');
    onAddToast(
      '¡Tiempo de Juego Desbloqueado!',
      `Canjeaste ${pkg.gemsCost} gemas por +${pkg.minutesAwarded} minutos de recreo. ¡A divertirse!`,
      'success'
    );
    setShowExchangeModal(false);
  };

  const handleWinReward = (rewardGems: number) => {
    onUpdateStudent((prev) => ({
      ...prev,
      gems: prev.gems + rewardGems,
    }));
    onAddToast(
      '¡Recompensa de Juego!',
      `+${rewardGems} gemas ganadas por tu brillante desempeño en el juego.`,
      'success'
    );
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const selectedGame = ADVANCED_GAMES.find((g) => g.id === selectedGameId) || ADVANCED_GAMES[0];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Gem-Exchange & Time HUD Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-950 via-slate-900 to-indigo-950 border border-violet-800/40 p-5 sm:p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🕹️</span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Zona de Recreo VIP & Juegos Avanzados
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Intercambia tus gemas ganadas en retos educativos por tiempo de juego (30 gemas = 1 minuto de recreo) en
              Damas mejoradas, Cazabombas, Laberintos procedurales, Sopa de letras, Dominó, Autos con obstáculos y Motos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Student Gems Counter */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950/80 border border-violet-700/50 shadow-inner">
              <Gem className="w-5 h-5 text-violet-400 fill-violet-400 animate-pulse" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Tus Gemas</span>
                <span className="text-base font-black text-white">{student.gems}</span>
              </div>
            </div>

            {/* Arcade Time Gauge */}
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border shadow-inner transition-all ${
                timeSeconds > 0
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 ring-2 ring-emerald-500/20'
                  : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
              }`}
            >
              <Clock className="w-5 h-5" />
              <div>
                <span className="text-[10px] uppercase font-bold block">Tiempo de Recreo</span>
                <span className="text-base font-mono font-black">{formatTime(timeSeconds)}</span>
              </div>
            </div>

            {/* Quick 1 Min Instant Top-Up */}
            <button
              onClick={() => handleBuyTime(EXCHANGE_PACKAGES[0])}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-violet-600/20 transition-all transform hover:scale-105 active:scale-95"
              title="Canjear 1 minuto exacto por 30 gemas"
            >
              <Gem className="w-3.5 h-3.5 fill-white" />
              <span>+1 Minuto (30 Gemas)</span>
            </button>

            {/* Exchange Button */}
            <button
              onClick={() => setShowExchangeModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all transform hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>Bolsa de Canjes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Game Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
        {ADVANCED_GAMES.map((game) => {
          const isSelected = selectedGameId === game.id;
          return (
            <button
              key={game.id}
              onClick={() => setSelectedGameId(game.id)}
              className={`p-3 rounded-2xl border text-left transition-all transform hover:-translate-y-1 flex flex-col justify-between ${
                isSelected
                  ? 'bg-violet-950/80 border-violet-400 ring-2 ring-violet-500/40 shadow-lg'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-2xl mb-1.5">
                <span>{game.icon}</span>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
                )}
              </div>
              <div>
                <h4 className="font-extrabold text-white text-xs line-clamp-1">{game.title}</h4>
                <span className="text-[9px] font-semibold text-slate-400 mt-0.5 block line-clamp-1">
                  {game.category}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Game Stage OR Lock Screen if Time is 0 */}
      {timeSeconds > 0 ? (
        <div className="space-y-4 animate-fadeIn">
          {selectedGameId === 'galaxia' && (
            <GalaxyWarsGame onWin={handleWinReward} soundEnabled={student.soundEnabled} />
          )}
          {selectedGameId === 'granja' && (
            <FarmHarvestGame onWin={handleWinReward} soundEnabled={student.soundEnabled} />
          )}
          {selectedGameId === 'tetris' && (
            <TetrisGame onWin={handleWinReward} soundEnabled={student.soundEnabled} />
          )}
          {selectedGameId === 'bombas' && (
            <BombSweeperGame onWin={handleWinReward} soundEnabled={student.soundEnabled} />
          )}
          {selectedGameId === 'laberinto' && (
            <ProceduralMazeGame onWin={handleWinReward} soundEnabled={student.soundEnabled} />
          )}
          {selectedGameId === 'sopa_letras' && (
            <WordSearchGame onWin={handleWinReward} soundEnabled={student.soundEnabled} />
          )}
          {selectedGameId === 'domino' && (
            <DominoGame onWin={handleWinReward} soundEnabled={student.soundEnabled} />
          )}
          {selectedGameId === 'autos' && (
            <CarRacingGame onWin={handleWinReward} soundEnabled={student.soundEnabled} />
          )}
          {selectedGameId === 'motos' && (
            <MotoJumpGame onWin={handleWinReward} soundEnabled={student.soundEnabled} />
          )}
        </div>
      ) : (
        /* Motivating Lock Screen */
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center text-4xl shadow-inner animate-pulse">
            🔒
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h3 className="text-xl sm:text-2xl font-black text-white">
              ¡Tiempo de Recreo Agotado!
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Para jugar a <strong className="text-violet-300">{selectedGame.title}</strong> necesitas
              canjear tus gemas por minutos de juego.
            </p>
          </div>

          {/* Quick Canje Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto pt-2">
            {EXCHANGE_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left flex flex-col justify-between space-y-3 hover:border-violet-500 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between text-2xl mb-1">
                    <span>{pkg.icon}</span>
                    {pkg.bonusText && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {pkg.bonusText}
                      </span>
                    )}
                  </div>
                  <h5 className="font-extrabold text-white text-xs">{pkg.name}</h5>
                  <span className="text-sm font-black text-emerald-400">
                    +{pkg.minutesAwarded} Minutos
                  </span>
                </div>

                <button
                  onClick={() => handleBuyTime(pkg)}
                  disabled={student.gems < pkg.gemsCost}
                  className="w-full py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                >
                  <Gem className="w-3.5 h-3.5 fill-white" />
                  <span>{pkg.gemsCost} Gemas</span>
                </button>
              </div>
            ))}
          </div>

          {/* Motivation Link back to Learning Missions */}
          <div className="pt-4 border-t border-slate-800 max-w-md mx-auto">
            <button
              onClick={onNavigateToMissions}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all"
            >
              <span>Resolver Retos de Matemáticas & Gramática (+Gemas)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Exchange Modal Popup */}
      {showExchangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl font-bold border border-amber-500/30">
                  🎟️
                </div>
                <div>
                  <h4 className="text-lg font-black text-white">Bolsa de Canje · Fichas de Recreo</h4>
                  <p className="text-xs text-slate-400">
                    Tienes <strong className="text-violet-300 font-bold">{student.gems} gemas</strong> en
                    tu alcancía
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowExchangeModal(false)}
                className="text-slate-400 hover:text-white p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EXCHANGE_PACKAGES.map((pkg) => (
                <div
                  key={pkg.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-2xl mb-1 block">{pkg.icon}</span>
                      <h5 className="font-extrabold text-white text-sm">{pkg.name}</h5>
                      <span className="text-xs text-emerald-400 font-bold">
                        +{pkg.minutesAwarded} Minutos de Juego
                      </span>
                    </div>
                    {pkg.bonusText && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {pkg.bonusText}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleBuyTime(pkg)}
                    disabled={student.gems < pkg.gemsCost}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Gem className="w-4 h-4 fill-slate-950" />
                    <span>Canjear {pkg.gemsCost} Gemas</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => {
                  setShowExchangeModal(false);
                  onNavigateToMissions();
                }}
                className="text-xs text-violet-400 hover:text-violet-300 underline font-semibold"
              >
                ¿Quieres más gemas? Supera retos de Matemáticas y Gramática
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
