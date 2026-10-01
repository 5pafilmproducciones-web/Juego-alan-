import React, { useState, useEffect, useRef } from 'react';
import { playSoundEffect } from '../../services/speechService';
import { RotateCcw, Trophy, Zap, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Gem, Star } from 'lucide-react';

interface MotoJumpGameProps {
  onWin: (gems: number) => void;
  soundEnabled: boolean;
}

interface TrackPrize {
  id: number;
  x: number;
  y: number;
  type: 'gem' | 'star' | 'coin';
  collected: boolean;
}

export const MotoJumpGame: React.FC<MotoJumpGameProps> = ({ onWin, soundEnabled }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [flips, setFlips] = useState(0);
  const [gemsCollected, setGemsCollected] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWonTrack, setHasWonTrack] = useState(false);

  const TRACK_FINISH = 1800;

  // Height function of terrain based on world X
  const getGroundHeight = (wx: number) => {
    return (
      270 +
      Math.sin(wx * 0.008) * 35 +
      Math.sin(wx * 0.02) * 20 -
      (wx > 400 && wx < 550 ? Math.sin((wx - 400) * 0.02) * 60 : 0) -
      (wx > 900 && wx < 1100 ? Math.sin((wx - 900) * 0.015) * 80 : 0) -
      (wx > 1350 && wx < 1550 ? Math.sin((wx - 1350) * 0.02) * 70 : 0)
    );
  };

  // Generate airborne prizes placed high above the track
  const generatePrizes = (): TrackPrize[] => {
    const list: TrackPrize[] = [];
    const checkX = [
      180, 280, 420, 480, 600, 720, 850, 960, 1040, 1180, 1280, 1420, 1500, 1620, 1720,
    ];
    checkX.forEach((px, i) => {
      const gY = getGroundHeight(px);
      const prizeType: 'gem' | 'star' | 'coin' = i % 3 === 0 ? 'gem' : i % 3 === 1 ? 'star' : 'coin';
      // Elevate prize 55 to 90 px into the air above the terrain
      const elevation = 65 + (i % 2) * 25;
      list.push({
        id: i + 1,
        x: px,
        y: gY - elevation,
        type: prizeType,
        collected: false,
      });
    });
    return list;
  };

  const stateRef = useRef({
    x: 50,
    y: 220,
    vx: 0,
    vy: 0,
    angle: 0, // In radians
    vAngle: 0,
    gas: false,
    brake: false,
    tiltLeft: false,
    tiltRight: false,
    inAir: false,
    airRotation: 0,
    flips: 0,
    distance: 0,
    score: 0,
    gemsCollected: 0,
    prizes: generatePrizes(),
    isOver: false,
    won: false,
  });

  const handleReset = () => {
    const prizes = generatePrizes();
    stateRef.current = {
      x: 50,
      y: 220,
      vx: 0,
      vy: 0,
      angle: 0,
      vAngle: 0,
      gas: false,
      brake: false,
      tiltLeft: false,
      tiltRight: false,
      inAir: false,
      airRotation: 0,
      flips: 0,
      distance: 0,
      score: 0,
      gemsCollected: 0,
      prizes,
      isOver: false,
      won: false,
    };
    setScore(0);
    setDistance(0);
    setFlips(0);
    setGemsCollected(0);
    setIsGameOver(false);
    setHasWonTrack(false);
    if (soundEnabled) playSoundEffect('gem');
  };

  // Jump impulse mechanic (Allows leaping high into air to catch airborne prizes)
  const handleJump = () => {
    const s = stateRef.current;
    if (s.isOver || s.won) return;

    const groundY = getGroundHeight(s.x);
    // Can jump if on ground or near ground
    if (s.y >= groundY - 32) {
      s.vy = -8.8; // High vertical leap
      s.inAir = true;
      if (soundEnabled) playSoundEffect('unlock');
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (['ArrowUp', 'KeyW'].includes(e.code)) s.gas = true;
      if (['ArrowDown', 'KeyS'].includes(e.code)) s.brake = true;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) s.tiltLeft = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) s.tiltRight = true;
      if (['Space', 'KeyJ'].includes(e.code)) {
        e.preventDefault();
        handleJump();
      }
    };

    const handleUp = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (['ArrowUp', 'KeyW'].includes(e.code)) s.gas = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) s.brake = false;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) s.tiltLeft = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) s.tiltRight = false;
    };

    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
    };
  }, []);

  // Main 60fps Physics Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      const s = stateRef.current;
      if (s.isOver || s.won) return;

      // Physics integration
      const gravity = 0.35;
      s.vy += gravity;

      if (s.gas) {
        s.vx = Math.min(10.5, s.vx + 0.32);
      } else if (s.brake) {
        s.vx = Math.max(0, s.vx - 0.45);
      } else {
        s.vx = Math.max(0, s.vx - 0.05); // friction
      }

      // Air tilting
      if (s.tiltLeft) s.vAngle -= 0.04;
      if (s.tiltRight) s.vAngle += 0.04;
      s.vAngle *= 0.92;
      s.angle += s.vAngle;

      s.x += s.vx;
      s.y += s.vy;
      s.distance = Math.round(s.x);

      // Check ground collision
      const groundY = getGroundHeight(s.x);
      const groundSlope = (getGroundHeight(s.x + 5) - getGroundHeight(s.x - 5)) / 10;
      const targetAngle = Math.atan(groundSlope);

      if (s.y >= groundY - 14) {
        s.y = groundY - 14;
        s.vy = 0;

        // Check if landed upside down (crash)
        const normalizedAngle = ((s.angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        if (normalizedAngle > Math.PI * 0.55 && normalizedAngle < Math.PI * 1.45) {
          s.isOver = true;
          setIsGameOver(true);
          if (soundEnabled) playSoundEffect('wrong');
          return;
        }

        // Align smoothly to slope
        s.angle = s.angle * 0.8 + targetAngle * 0.2;
        s.vAngle = 0;
        s.inAir = false;
      } else {
        // In air
        if (!s.inAir) {
          s.inAir = true;
          s.airRotation = 0;
        }
        s.airRotation += s.vAngle;
        if (Math.abs(s.airRotation) >= Math.PI * 2) {
          s.flips += 1;
          s.score += 500;
          s.airRotation = 0;
          setFlips(s.flips);
          if (soundEnabled) playSoundEffect('gem');
        }
      }

      // Check Airborne Prize Collections
      for (const prize of s.prizes) {
        if (!prize.collected) {
          const distToPrize = Math.hypot(s.x - prize.x, s.y - prize.y);
          if (distToPrize < 32) {
            prize.collected = true;
            s.score += 250;
            s.gemsCollected += 1;
            setGemsCollected(s.gemsCollected);
            if (soundEnabled) playSoundEffect('correct');
          }
        }
      }

      // Check victory flag
      if (s.x >= TRACK_FINISH && !s.won) {
        s.won = true;
        setHasWonTrack(true);
        if (soundEnabled) playSoundEffect('correct');
        const finalGems = 40 + s.gemsCollected * 2;
        onWin(finalGems);
        return;
      }

      setScore(s.score + Math.round(s.x));
      setDistance(Math.min(TRACK_FINISH, Math.round(s.x)));

      // Render Camera centered on motorcycle X
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGrad.addColorStop(0, '#0F172A');
      skyGrad.addColorStop(1, '#312E81');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      const cameraX = s.x - 120;
      ctx.translate(-cameraX, 0);

      // Draw Terrain / Rolling Hills
      ctx.fillStyle = '#047857';
      ctx.beginPath();
      ctx.moveTo(cameraX - 50, canvas.height);
      for (let wx = cameraX - 50; wx <= cameraX + canvas.width + 50; wx += 10) {
        ctx.lineTo(wx, getGroundHeight(wx));
      }
      ctx.lineTo(cameraX + canvas.width + 50, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Top grass line
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Draw Airborne Prizes
      for (const prize of s.prizes) {
        if (!prize.collected) {
          ctx.save();
          // Draw hovering bounce
          const hoverY = prize.y + Math.sin(Date.now() * 0.005 + prize.id) * 4;

          // Prize Glow
          ctx.fillStyle = prize.type === 'gem' ? '#818CF8' : prize.type === 'star' ? '#FBBF24' : '#F59E0B';
          ctx.beginPath();
          ctx.arc(prize.x, hoverY, 14, 0, Math.PI * 2);
          ctx.globalAlpha = 0.25;
          ctx.fill();
          ctx.globalAlpha = 1.0;

          // Prize Emoji
          ctx.font = '20px sans-serif';
          const icon = prize.type === 'gem' ? '💎' : prize.type === 'star' ? '⭐' : '🪙';
          ctx.fillText(icon, prize.x - 10, hoverY + 7);
          ctx.restore();
        }
      }

      // Draw Finish Arch / Banner at TRACK_FINISH
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(TRACK_FINISH, getGroundHeight(TRACK_FINISH));
      ctx.lineTo(TRACK_FINISH, getGroundHeight(TRACK_FINISH) - 100);
      ctx.stroke();

      ctx.font = '26px sans-serif';
      ctx.fillText('🏁', TRACK_FINISH - 6, getGroundHeight(TRACK_FINISH) - 102);

      // Draw Motorcycle & Rider
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);

      // Rear Wheel
      ctx.fillStyle = '#0F172A';
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-14, 8, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Front Wheel
      ctx.beginPath();
      ctx.arc(14, 8, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Chassis & Exhaust
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-14, 8);
      ctx.lineTo(0, 0);
      ctx.lineTo(14, 8);
      ctx.stroke();

      // Rider body (Red suit)
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.roundRect(-4, -12, 10, 12, 3);
      ctx.fill();

      // Helmet (Yellow)
      ctx.fillStyle = '#FDE047';
      ctx.beginPath();
      ctx.arc(0, -18, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore(); // motorcycle
      ctx.restore(); // camera

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [soundEnabled, onWin]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold text-xl border border-amber-500/30">
            🏍️
          </div>
          <div>
            <h4 className="text-base font-black text-white flex items-center gap-2">
              <span>Moto X-Cross · Saltos & Premios en el Aire</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                Salto 🚀
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              ¡Usa el botón de <strong>SALTAR</strong> para atrapar las gemas y estrellas flotantes en el cielo!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-amber-400">Meta: {distance} / {TRACK_FINISH}m</span>
            <span className="text-slate-600">|</span>
            <span className="text-violet-300 flex items-center gap-1">
              <Gem className="w-3.5 h-3.5 fill-violet-400" />
              <span>{gemsCollected} Premios</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400">Acrobacias: {flips} 🔄</span>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar</span>
          </button>
        </div>
      </div>

      {/* Canvas World & Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        <div className="relative rounded-3xl overflow-hidden border-4 border-slate-800 shadow-2xl bg-slate-950 select-none">
          <canvas ref={canvasRef} width={340} height={320} className="block" />

          {/* Game Over Crash Overlay */}
          {isGameOver && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center space-y-3 animate-fadeIn">
              <span className="text-4xl">💥</span>
              <h5 className="text-lg font-black text-white">¡Aterrizaje Forzoso!</h5>
              <p className="text-xs text-slate-300">
                Avanzaste {distance} metros, atrapaste {gemsCollected} premios e hiciste {flips} acrobacias.
              </p>
              <button
                onClick={handleReset}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg transition-all"
              >
                Reintentar Circuito
              </button>
            </div>
          )}

          {/* Victory Finish Overlay */}
          {hasWonTrack && (
            <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center space-y-3 animate-fadeIn">
              <span className="text-4xl">🏆 🏁</span>
              <h5 className="text-lg font-black text-white">¡Meta de Campeones Cruzada!</h5>
              <p className="text-xs text-emerald-200">
                Completaste la pista con {gemsCollected} premios aéreos atrapados y {flips} acrobacias.
                ¡+{40 + gemsCollected * 2} gemas ganadas!
              </p>
              <button
                onClick={handleReset}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg transition-all"
              >
                Correr Nuevamente
              </button>
            </div>
          )}
        </div>

        {/* Touch Controls for Tablet / Mobile with PROMINENT JUMP BUTTON */}
        <div className="space-y-3 text-center max-w-xs w-full">
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs flex justify-around items-center">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Puntos</span>
              <span className="text-xl font-black text-amber-400 font-mono">{score}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Premios Aéreos</span>
              <span className="text-xl font-black text-violet-300 font-mono">{gemsCollected} ⭐</span>
            </div>
          </div>

          {/* Prominent High Jump Button */}
          <button
            onClick={handleJump}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 active:scale-95 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 border border-amber-400"
          >
            <Zap className="w-5 h-5 fill-slate-950" />
            <span>🚀 SALTAR AL AIRE (ESPACIO)</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onMouseDown={() => (stateRef.current.gas = true)}
              onMouseUp={() => (stateRef.current.gas = false)}
              onTouchStart={() => (stateRef.current.gas = true)}
              onTouchEnd={() => (stateRef.current.gas = false)}
              className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs flex flex-col items-center gap-1 shadow-md"
            >
              <ArrowUp className="w-5 h-5" />
              <span>Acelerar (W)</span>
            </button>

            <button
              onMouseDown={() => (stateRef.current.brake = true)}
              onMouseUp={() => (stateRef.current.brake = false)}
              onTouchStart={() => (stateRef.current.brake = true)}
              onTouchEnd={() => (stateRef.current.brake = false)}
              className="p-3 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-black text-xs flex flex-col items-center gap-1 shadow-md"
            >
              <ArrowDown className="w-5 h-5" />
              <span>Freno (S)</span>
            </button>

            <button
              onMouseDown={() => (stateRef.current.tiltLeft = true)}
              onMouseUp={() => (stateRef.current.tiltLeft = false)}
              onTouchStart={() => (stateRef.current.tiltLeft = true)}
              onTouchEnd={() => (stateRef.current.tiltLeft = false)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold text-xs flex flex-col items-center gap-1 border border-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Inclinar Atrás</span>
            </button>

            <button
              onMouseDown={() => (stateRef.current.tiltRight = true)}
              onMouseUp={() => (stateRef.current.tiltRight = false)}
              onTouchStart={() => (stateRef.current.tiltRight = true)}
              onTouchEnd={() => (stateRef.current.tiltRight = false)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold text-xs flex flex-col items-center gap-1 border border-slate-700"
            >
              <ArrowRight className="w-4 h-4" />
              <span>Inclinar Adelante</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
