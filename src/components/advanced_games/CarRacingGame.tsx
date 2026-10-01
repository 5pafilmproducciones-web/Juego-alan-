import React, { useState, useEffect, useRef } from 'react';
import { playSoundEffect } from '../../services/speechService';
import {
  RotateCcw,
  Zap,
  ArrowLeft,
  ArrowRight,
  Shield,
  AlertTriangle,
  Sparkles,
  Clock,
  Trophy,
  Gauge,
  Flame,
} from 'lucide-react';

interface CarRacingGameProps {
  onWin: (gems: number) => void;
  soundEnabled: boolean;
}

type ObstacleType = 'car' | 'cones' | 'oil' | 'barrier' | 'rock' | 'truck';

interface RoadObstacle {
  id: number;
  x: number;
  y: number;
  lane: number;
  type: ObstacleType;
  color?: string;
  speed: number;
  width: number;
  height: number;
}

interface CollectibleItem {
  id: number;
  x: number;
  y: number;
  type: 'coin' | 'nitro' | 'gem' | 'shield' | 'time_bonus';
}

const TOTAL_RACE_DISTANCE = 2500; // 2,500 meters to reach the finish line (Circuito Extendido)
const RACE_TIME_LIMIT_SECONDS = 85; // Defined time limit to cross the finish line

export const CarRacingGame: React.FC<CarRacingGameProps> = ({ onWin, soundEnabled }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [playerLane, setPlayerLane] = useState(1); // 0 = Left, 1 = Center, 2 = Right
  const [distanceRemaining, setDistanceRemaining] = useState(TOTAL_RACE_DISTANCE);
  const [timeLeft, setTimeLeft] = useState(RACE_TIME_LIMIT_SECONDS);
  const [speedKmh, setSpeedKmh] = useState(90);
  const [isAccelerating, setIsAccelerating] = useState(false);
  const [nitroActive, setNitroActive] = useState(false);
  const [shieldActive, setShieldActive] = useState(false);
  const [lives, setLives] = useState(3);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [obstaclesDodged, setObstaclesDodged] = useState(0);
  const [gemsEarnedInRace, setGemsEarnedInRace] = useState(0);
  const [gameOverReason, setGameOverReason] = useState<string>('');

  const stateRef = useRef({
    playerLane: 1,
    roadOffset: 0,
    obstacles: [] as RoadObstacle[],
    items: [] as CollectibleItem[],
    isAccelerating: false,
    nitro: false,
    shield: false,
    distanceCovered: 0,
    timeLeft: RACE_TIME_LIMIT_SECONDS,
    lives: 3,
    obstaclesDodged: 0,
    gemsEarned: 0,
    isOver: false,
    isWon: false,
    nextId: 1,
    finishLineY: -999, // Y position of the finish line banner when race is near end
    flashDamage: 0,
  });

  const laneXCoordinates = [60, 150, 240];

  const handleReset = () => {
    stateRef.current = {
      playerLane: 1,
      roadOffset: 0,
      obstacles: [],
      items: [],
      isAccelerating: false,
      nitro: false,
      shield: false,
      distanceCovered: 0,
      timeLeft: RACE_TIME_LIMIT_SECONDS,
      lives: 3,
      obstaclesDodged: 0,
      gemsEarned: 0,
      isOver: false,
      isWon: false,
      nextId: 1,
      finishLineY: -999,
      flashDamage: 0,
    };
    setPlayerLane(1);
    setDistanceRemaining(TOTAL_RACE_DISTANCE);
    setTimeLeft(RACE_TIME_LIMIT_SECONDS);
    setSpeedKmh(90);
    setIsAccelerating(false);
    setNitroActive(false);
    setShieldActive(false);
    setLives(3);
    setIsGameOver(false);
    setIsVictory(false);
    setObstaclesDodged(0);
    setGemsEarnedInRace(0);
    setGameOverReason('');
    if (soundEnabled) playSoundEffect('gem');
  };

  const moveLane = (dir: -1 | 1) => {
    if (stateRef.current.isOver || stateRef.current.isWon) return;
    const nextLane = Math.max(0, Math.min(2, stateRef.current.playerLane + dir));
    stateRef.current.playerLane = nextLane;
    setPlayerLane(nextLane);
    if (soundEnabled) playSoundEffect('gem');
  };

  const activateNitro = () => {
    if (stateRef.current.nitro || stateRef.current.isOver || stateRef.current.isWon) return;
    stateRef.current.nitro = true;
    setNitroActive(true);
    setSpeedKmh(220);
    if (soundEnabled) playSoundEffect('unlock');

    setTimeout(() => {
      stateRef.current.nitro = false;
      setNitroActive(false);
      setSpeedKmh(stateRef.current.isAccelerating ? 160 : 90);
    }, 3500);
  };

  // Accelerator controls (Touch or Keyboard)
  const startAccelerating = () => {
    stateRef.current.isAccelerating = true;
    setIsAccelerating(true);
    if (!stateRef.current.nitro) {
      setSpeedKmh(160);
    }
    if (soundEnabled) playSoundEffect('gem');
  };

  const stopAccelerating = () => {
    stateRef.current.isAccelerating = false;
    setIsAccelerating(false);
    if (!stateRef.current.nitro) {
      setSpeedKmh(90);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        moveLane(-1);
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        moveLane(1);
      } else if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        if (!stateRef.current.isAccelerating) {
          startAccelerating();
        }
      } else if (e.code === 'Space') {
        e.preventDefault();
        activateNitro();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        stopAccelerating();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isGameOver, isVictory]);

  // Second-based Countdown Timer for defined race time
  useEffect(() => {
    if (isGameOver || isVictory) return;

    const timer = setInterval(() => {
      stateRef.current.timeLeft -= 1;
      const curTime = stateRef.current.timeLeft;
      setTimeLeft(curTime);

      if (curTime <= 0) {
        stateRef.current.isOver = true;
        setIsGameOver(true);
        setGameOverReason('⏰ ¡Se agotó el tiempo antes de cruzar la meta! Acelera más a fondo la próxima vez.');
        if (soundEnabled) playSoundEffect('wrong');
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameOver, isVictory]);

  // Main 60fps Game Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastSpawn = Date.now();

    const loop = () => {
      const state = stateRef.current;
      if (state.isOver || state.isWon) return;

      // Base speed calculation:
      // Cruising: 7 px/frame (~90 km/h)
      // Accelerating: 13 px/frame (~160 km/h)
      // Nitro Turbo: 18 px/frame (~220 km/h)
      const currentSpeed = state.nitro ? 18 : state.isAccelerating ? 13 : 7;
      state.roadOffset = (state.roadOffset + currentSpeed) % 40;

      // Advance distance towards Finish Line
      state.distanceCovered += currentSpeed * 0.25;
      const remaining = Math.max(0, Math.round(TOTAL_RACE_DISTANCE - state.distanceCovered));
      setDistanceRemaining(remaining);

      // Check if finish line should be spawned on canvas
      if (remaining <= 50 && state.finishLineY === -999) {
        state.finishLineY = -40; // spawn finish line banner at top
      }

      // Move finish line if active
      if (state.finishLineY > -999) {
        state.finishLineY += currentSpeed;

        // Player car is at y = 350. When finish line reaches or passes 350: VICTORY!
        if (state.finishLineY >= 350 && !state.isWon) {
          state.isWon = true;
          setIsVictory(true);
          const finalGems = 50 + state.gemsEarned;
          onWin(finalGems);
          if (soundEnabled) playSoundEffect('correct');
          return;
        }
      }

      // Flash damage animation
      if (state.flashDamage > 0) {
        state.flashDamage--;
      }

      // Obstacle / Item spawning
      const now = Date.now();
      const spawnInterval = state.nitro ? 600 : state.isAccelerating ? 750 : 950;
      if (now - lastSpawn > spawnInterval && remaining > 60) {
        lastSpawn = now;
        const lane = Math.floor(Math.random() * 3);

        if (Math.random() < 0.72) {
          // Obstacle roll
          const roll = Math.random();
          if (roll < 0.25) {
            // Rival fast car
            const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
            state.obstacles.push({
              id: state.nextId++,
              x: laneXCoordinates[lane],
              y: -60,
              lane,
              type: 'car',
              color: colors[Math.floor(Math.random() * colors.length)],
              speed: Math.random() * 2 + 2,
              width: 32,
              height: 54,
            });
          } else if (roll < 0.42) {
            // Traffic cones
            state.obstacles.push({
              id: state.nextId++,
              x: laneXCoordinates[lane],
              y: -30,
              lane,
              type: 'cones',
              speed: 0,
              width: 30,
              height: 28,
            });
          } else if (roll < 0.58) {
            // Oil slick
            state.obstacles.push({
              id: state.nextId++,
              x: laneXCoordinates[lane],
              y: -30,
              lane,
              type: 'oil',
              speed: 0,
              width: 38,
              height: 22,
            });
          } else if (roll < 0.74) {
            // Construction hazard barrier
            state.obstacles.push({
              id: state.nextId++,
              x: laneXCoordinates[lane],
              y: -30,
              lane,
              type: 'barrier',
              speed: 0,
              width: 44,
              height: 22,
            });
          } else if (roll < 0.88) {
            // Heavy truck
            state.obstacles.push({
              id: state.nextId++,
              x: laneXCoordinates[lane],
              y: -80,
              lane,
              type: 'truck',
              color: '#D97706',
              speed: 1.5,
              width: 36,
              height: 72,
            });
          } else {
            // Rock
            state.obstacles.push({
              id: state.nextId++,
              x: laneXCoordinates[lane],
              y: -30,
              lane,
              type: 'rock',
              speed: 0,
              width: 32,
              height: 26,
            });
          }
        } else {
          // Collectible item: Gem, Nitro, Shield, Time bonus (+3s)
          const itemRoll = Math.random();
          const itemType: 'coin' | 'nitro' | 'gem' | 'shield' | 'time_bonus' =
            itemRoll < 0.3
              ? 'gem'
              : itemRoll < 0.55
              ? 'time_bonus'
              : itemRoll < 0.8
              ? 'nitro'
              : 'shield';

          state.items.push({
            id: state.nextId++,
            x: laneXCoordinates[lane],
            y: -40,
            type: itemType,
          });
        }
      }

      // Update obstacles & collisions
      for (let i = state.obstacles.length - 1; i >= 0; i--) {
        const obs = state.obstacles[i];
        obs.y += currentSpeed - obs.speed;

        // Collision check with player (player at y = 350)
        const playerX = laneXCoordinates[state.playerLane];
        const isSameLane = Math.abs(playerX - obs.x) < 30;
        const isHittingY = obs.y > 310 && obs.y < 385;

        if (isSameLane && isHittingY) {
          // If shield is active, absorb collision!
          if (state.shield) {
            state.shield = false;
            setShieldActive(false);
            state.obstacles.splice(i, 1);
            if (soundEnabled) playSoundEffect('unlock');
            continue;
          }

          // If nitro is active, player smashes through obstacles!
          if (state.nitro) {
            state.obstacles.splice(i, 1);
            state.obstaclesDodged++;
            setObstaclesDodged(state.obstaclesDodged);
            if (soundEnabled) playSoundEffect('gem');
            continue;
          }

          // Take damage: lose 1 life and penalize 4 seconds of time limit!
          state.lives -= 1;
          state.timeLeft = Math.max(1, state.timeLeft - 4);
          state.flashDamage = 18;
          setLives(state.lives);
          setTimeLeft(state.timeLeft);
          state.obstacles.splice(i, 1);

          if (soundEnabled) playSoundEffect('wrong');

          if (state.lives <= 0) {
            state.isOver = true;
            setIsGameOver(true);
            setGameOverReason('💥 ¡Vehículo averiado tras múltiples colisiones! Repara tu coche y vuelve a intentarlo.');
            return;
          }
          continue;
        }

        // Passed safely: count as dodged!
        if (obs.y > 430) {
          state.obstaclesDodged++;
          setObstaclesDodged(state.obstaclesDodged);
          state.obstacles.splice(i, 1);
        }
      }

      // Update Collectibles
      for (let i = state.items.length - 1; i >= 0; i--) {
        const item = state.items[i];
        item.y += currentSpeed;

        const playerX = laneXCoordinates[state.playerLane];
        const isSameLane = Math.abs(playerX - item.x) < 32;
        const isHittingY = item.y > 320 && item.y < 380;

        if (isSameLane && isHittingY) {
          if (item.type === 'gem') {
            state.gemsEarned += 2;
            setGemsEarnedInRace(state.gemsEarned);
            if (soundEnabled) playSoundEffect('gem');
          } else if (item.type === 'time_bonus') {
            state.timeLeft = Math.min(RACE_TIME_LIMIT_SECONDS, state.timeLeft + 3);
            setTimeLeft(state.timeLeft);
            if (soundEnabled) playSoundEffect('unlock');
          } else if (item.type === 'nitro') {
            activateNitro();
          } else if (item.type === 'shield') {
            state.shield = true;
            setShieldActive(true);
            if (soundEnabled) playSoundEffect('correct');
          }
          state.items.splice(i, 1);
          continue;
        }

        if (item.y > 430) {
          state.items.splice(i, 1);
        }
      }

      // RENDER CANVAS SCENE
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Road background (Dark asphalt)
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(20, 0, 260, canvas.height);

      // Road borders (Curbs with red/white stripes)
      for (let y = -40; y < canvas.height; y += 20) {
        const stripeY = (y + state.roadOffset) % 40;
        ctx.fillStyle = stripeY < 20 ? '#EF4444' : '#FFFFFF';
        ctx.fillRect(15, y + (state.roadOffset % 20), 5, 10);
        ctx.fillRect(280, y + (state.roadOffset % 20), 5, 10);
      }

      // Lane separator dashes
      ctx.strokeStyle = '#FCD34D';
      ctx.lineWidth = 3;
      ctx.setLineDash([16, 16]);
      ctx.lineDashOffset = -state.roadOffset;

      ctx.beginPath();
      ctx.moveTo(105, 0);
      ctx.lineTo(105, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(195, 0);
      ctx.lineTo(195, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Finish Line if on screen
      if (state.finishLineY > -50 && state.finishLineY < canvas.height + 50) {
        const fy = state.finishLineY;
        const blockW = 10;
        for (let bx = 20; bx < 280; bx += blockW) {
          const isBlack = (Math.floor(bx / blockW) % 2) === 0;
          ctx.fillStyle = isBlack ? '#000000' : '#FFFFFF';
          ctx.fillRect(bx, fy, blockW, 10);
          ctx.fillStyle = isBlack ? '#FFFFFF' : '#000000';
          ctx.fillRect(bx, fy + 10, blockW, 10);
        }
        ctx.fillStyle = '#F59E0B';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('🏁 META DE LLEGADA 🏁', 75, fy - 6);
      }

      // Draw Obstacles
      for (const obs of state.obstacles) {
        if (obs.type === 'cones') {
          ctx.font = '22px sans-serif';
          ctx.fillText('🚧', obs.x - 12, obs.y + 18);
        } else if (obs.type === 'oil') {
          ctx.font = '22px sans-serif';
          ctx.fillText('🛢️', obs.x - 12, obs.y + 18);
        } else if (obs.type === 'barrier') {
          ctx.font = '22px sans-serif';
          ctx.fillText('🛑', obs.x - 12, obs.y + 18);
        } else if (obs.type === 'rock') {
          ctx.font = '22px sans-serif';
          ctx.fillText('🪨', obs.x - 12, obs.y + 18);
        } else if (obs.type === 'truck') {
          ctx.font = '30px sans-serif';
          ctx.fillText('🚚', obs.x - 15, obs.y + 24);
        } else {
          // Rival Car
          ctx.font = '28px sans-serif';
          ctx.fillText('🏎️', obs.x - 14, obs.y + 22);
        }
      }

      // Draw Items
      for (const item of state.items) {
        if (item.type === 'gem') {
          ctx.font = '20px sans-serif';
          ctx.fillText('💎', item.x - 10, item.y + 16);
        } else if (item.type === 'time_bonus') {
          ctx.font = '20px sans-serif';
          ctx.fillText('⏱️', item.x - 10, item.y + 16);
        } else if (item.type === 'nitro') {
          ctx.font = '20px sans-serif';
          ctx.fillText('🚀', item.x - 10, item.y + 16);
        } else if (item.type === 'shield') {
          ctx.font = '20px sans-serif';
          ctx.fillText('🛡️', item.x - 10, item.y + 16);
        }
      }

      // Draw Player Car
      const px = laneXCoordinates[state.playerLane];
      const py = 350;

      // Exhaust Flames when accelerating or nitro
      if (state.nitro || state.isAccelerating) {
        ctx.font = state.nitro ? '24px sans-serif' : '18px sans-serif';
        ctx.fillText(state.nitro ? '🔥' : '💨', px - 8, py + 48);
      }

      // Shield Aura
      if (state.shield) {
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(px, py + 12, 26, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Player Car Emoji
      ctx.font = '32px sans-serif';
      ctx.fillText('🚗', px - 16, py + 24);

      // Damage Flash
      if (state.flashDamage > 0) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isGameOver, isVictory]);

  const raceProgressPercent = Math.min(
    100,
    Math.round(((TOTAL_RACE_DISTANCE - distanceRemaining) / TOTAL_RACE_DISTANCE) * 100)
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
      {/* Top HUD: Speed, Timer, Meta Progress & Lives */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-2xl border border-amber-500/30">
            🏎️
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>Circuito Gran Prix · Carrera por la Meta</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                2,500 Metros
              </span>
            </h4>
            <p className="text-xs text-slate-300">
              ¡Acelera a fondo, esquiva los obstáculos y cruza la meta antes de que el tiempo se agote!
            </p>
          </div>
        </div>

        {/* Lives Counter & Restart */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold">
            <span className="text-slate-400">Vidas:</span>
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className={i < lives ? 'text-rose-500' : 'text-slate-700'}>
                ❤️
              </span>
            ))}
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar</span>
          </button>
        </div>
      </div>

      {/* Primary Race Metrics HUD */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
        {/* Speedometer */}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-950/80 text-amber-400 border border-amber-800/40">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Velocidad</span>
            <span className="text-base font-mono font-black text-amber-400">{speedKmh} km/h</span>
          </div>
        </div>

        {/* Countdown Timer to Meta */}
        <div className="flex items-center gap-2">
          <div
            className={`p-2 rounded-xl border ${
              timeLeft <= 10
                ? 'bg-rose-950 text-rose-400 border-rose-800 animate-pulse'
                : 'bg-blue-950 text-blue-400 border-blue-800/40'
            }`}
          >
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Tiempo Límite</span>
            <span
              className={`text-base font-mono font-black ${
                timeLeft <= 10 ? 'text-rose-400 animate-pulse' : 'text-white'
              }`}
            >
              00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}s
            </span>
          </div>
        </div>

        {/* Distance Remaining to Meta */}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
            🏁
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Distancia Meta</span>
            <span className="text-base font-mono font-black text-emerald-400">
              {distanceRemaining} m
            </span>
          </div>
        </div>

        {/* Dodged & Gems */}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-violet-950/80 text-violet-400 border border-violet-800/40">
            💎
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Esquivados</span>
            <span className="text-base font-mono font-black text-violet-300">
              {obstaclesDodged} (Bonus: +{gemsEarnedInRace}💎)
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar towards Finish Line */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs font-bold text-slate-300">
          <span>🏁 Salida (0m)</span>
          <span className="text-amber-400 font-extrabold">{raceProgressPercent}% del recorrido</span>
          <span>🏁 META (2,500m)</span>
        </div>
        <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 relative">
          <div
            className="bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-400 h-full rounded-full transition-all duration-150"
            style={{ width: `${raceProgressPercent}%` }}
          />
        </div>
      </div>

      {/* Canvas Game Stage */}
      <div className="flex justify-center relative select-none">
        <div className="relative rounded-3xl overflow-hidden border-4 border-slate-800 shadow-2xl bg-slate-950">
          <canvas ref={canvasRef} width={300} height={420} className="block" />

          {/* Nitro Active Overlay Badge */}
          {nitroActive && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black text-xs px-3 py-1 rounded-full shadow-lg animate-pulse flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              <span>NITRO MÁXIMO (220 KM/H)</span>
            </div>
          )}

          {/* Accelerating Indicator */}
          {isAccelerating && !nitroActive && (
            <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-full shadow-lg flex items-center gap-1">
              <Flame className="w-3 h-3" />
              <span>ACELERANDO</span>
            </div>
          )}

          {/* Shield Active Badge */}
          {shieldActive && (
            <div className="absolute bottom-3 left-3 bg-sky-950/90 border border-sky-400 text-sky-300 font-bold text-xs px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Escudo Protector</span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Controls Bar: Left / Right, ACCELERATE (HOLD), and Nitro */}
      <div className="grid grid-cols-4 gap-2.5 max-w-md mx-auto">
        <button
          onClick={() => moveLane(-1)}
          className="p-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold rounded-2xl border border-slate-700 shadow-lg flex flex-col items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 mb-0.5" />
          <span className="text-[11px]">Izq (A)</span>
        </button>

        {/* Throttle / Accelerate Button (Hold to Accelerate) */}
        <button
          onMouseDown={startAccelerating}
          onMouseUp={stopAccelerating}
          onTouchStart={startAccelerating}
          onTouchEnd={stopAccelerating}
          className={`col-span-2 p-3 font-black text-xs uppercase tracking-wider rounded-2xl border shadow-xl flex items-center justify-center gap-2 transition-all transform active:scale-95 ${
            isAccelerating
              ? 'bg-amber-400 text-slate-950 border-amber-300 ring-4 ring-amber-400/40 scale-102'
              : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 border-amber-400'
          }`}
        >
          <Flame className="w-5 h-5 fill-slate-950" />
          <span>{isAccelerating ? '¡A FONDO! ⚡' : 'ACELERAR (MANTENER)'}</span>
        </button>

        <button
          onClick={() => moveLane(1)}
          className="p-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold rounded-2xl border border-slate-700 shadow-lg flex flex-col items-center justify-center"
        >
          <ArrowRight className="w-5 h-5 mb-0.5" />
          <span className="text-[11px]">Der (D)</span>
        </button>
      </div>

      {/* Nitro Trigger Button */}
      <div className="max-w-md mx-auto">
        <button
          onClick={activateNitro}
          disabled={nitroActive || isGameOver || isVictory}
          className="w-full py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4" />
          <span>Activar Turbo Nitro (Barra Espaciadora)</span>
        </button>
      </div>

      {/* Victory Screen Modal Banner */}
      {isVictory && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950 to-teal-950 border-2 border-emerald-400 text-emerald-200 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-bounce">
          <div className="flex items-center gap-4">
            <Trophy className="w-12 h-12 text-amber-400 flex-shrink-0" />
            <div>
              <h5 className="font-black text-lg text-white">
                🏆 ¡CRUZASTE LA META A TIEMPO! ¡GRAN CAMPEÓN!
              </h5>
              <p className="text-xs text-emerald-300 mt-1">
                Completaste los 1,000 metros con {timeLeft}s restantes. ¡Has ganado +{50 + gemsEarnedInRace} Gemas!
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg uppercase tracking-wider"
          >
            Correr de Nuevo
          </button>
        </div>
      )}

      {/* Game Over Screen Modal Banner */}
      {isGameOver && (
        <div className="p-5 rounded-2xl bg-rose-950/90 border-2 border-rose-500 text-rose-200 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <AlertTriangle className="w-12 h-12 text-rose-400 flex-shrink-0" />
            <div>
              <h5 className="font-black text-lg text-white">Fin de la Carrera</h5>
              <p className="text-xs text-rose-300 mt-1">{gameOverReason}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Te faltaron {distanceRemaining} metros para la meta. Esquivaste {obstaclesDodged} obstáculos.
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg uppercase tracking-wider"
          >
            Intentar de Nuevo
          </button>
        </div>
      )}
    </div>
  );
};
