import React, { useState, useEffect, useRef } from 'react';
import { playSoundEffect } from '../../services/speechService';
import {
  RotateCcw,
  Trophy,
  Zap,
  Shield,
  Sparkles,
  Rocket,
  Flame,
  Radio,
  Gem,
  AlertTriangle,
  Crosshair,
  Volume2,
} from 'lucide-react';

interface GalaxyWarsGameProps {
  onWin: (gems: number) => void;
  soundEnabled: boolean;
}

interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  isEnemy: boolean;
  color: string;
  damage: number;
}

type ThreatType =
  | 'alien_green'
  | 'alien_octopus'
  | 'alien_ufo'
  | 'alien_eyeball'
  | 'alien_squid'
  | 'meteorite_small'
  | 'meteorite_large'
  | 'boss_alien';

interface Threat {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  type: ThreatType;
  width: number;
  height: number;
  lastShot: number;
  scoreValue: number;
  wiggleOffset?: number;
}

interface PowerUp {
  id: number;
  x: number;
  y: number;
  type: 'shield_boost' | 'triple_laser' | 'emp_bomb' | 'gem_drop' | 'base_repair';
}

interface StarParticle {
  x: number;
  y: number;
  speed: number;
  size: number;
  alpha: number;
}

interface Explosion {
  id: number;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
}

export const GalaxyWarsGame: React.FC<GalaxyWarsGameProps> = ({ onWin, soundEnabled }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // React state for HUD
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [aliensDefeated, setAliensDefeated] = useState(0);
  const [baseHealth, setBaseHealth] = useState(100);
  const [baseShield, setBaseShield] = useState(100);
  const [empBombs, setEmpBombs] = useState(2);
  const [gemsEarned, setGemsEarned] = useState(0);
  const [tripleLaserTimer, setTripleLaserTimer] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  // Dynamic Difficulty Progression states
  const [threatLevel, setThreatLevel] = useState(1);
  const [speedDisplay, setSpeedDisplay] = useState(1.0);
  const [levelNotice, setLevelNotice] = useState<string | null>(null);

  // Fast animation state in ref
  const stateRef = useRef({
    playerX: 240,
    playerY: 420,
    playerSpeed: 7.5,
    movingLeft: false,
    movingRight: false,
    movingUp: false,
    movingDown: false,
    isFiring: false,
    lastPlayerShot: 0,

    baseHealth: 100,
    baseShield: 100,
    baseShieldActive: false,
    baseShieldTimer: 0,
    empBombs: 2,
    empWaveRadius: 0,
    isEmpActive: false,

    tripleLaser: false,
    tripleLaserDuration: 0,

    score: 0,
    wave: 1,
    aliensDefeated: 0,
    gemsEarned: 0,
    lastThreatLevel: 1,
    isOver: false,
    isWon: false,

    threats: [] as Threat[],
    bullets: [] as Bullet[],
    powerUps: [] as PowerUp[],
    stars: [] as StarParticle[],
    explosions: [] as Explosion[],

    nextId: 1,
    bossSpawned: false,
  });

  // Init starry background
  const initStars = (width: number, height: number) => {
    const list: StarParticle[] = [];
    for (let i = 0; i < 90; i++) {
      list.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: Math.random() * 2 + 0.8,
        size: Math.random() * 2.2 + 0.8,
        alpha: Math.random() * 0.7 + 0.3,
      });
    }
    return list;
  };

  // Generate initial fleet of aliens so there is ALWAYS something on screen from frame 0
  const createInitialThreats = (width: number, speedMultiplier = 1.0) => {
    const list: Threat[] = [];
    const types: ThreatType[] = [
      'alien_green',
      'alien_octopus',
      'alien_ufo',
      'alien_squid',
      'meteorite_small',
      'alien_eyeball',
      'alien_green',
      'alien_ufo',
    ];

    for (let i = 0; i < types.length; i++) {
      const tType = types[i];
      const col = i % 4;
      const row = Math.floor(i / 4);
      const x = 70 + col * 95;
      const y = 50 + row * 65;
      const hp = tType === 'alien_ufo' ? 2 : tType === 'alien_squid' ? 3 : 1;

      list.push({
        id: stateRef.current.nextId++,
        x,
        y,
        vx: (Math.random() - 0.5) * 1.6 * Math.min(2.0, speedMultiplier * 0.9),
        vy: (Math.random() * 0.7 + 1.2) * speedMultiplier,
        hp,
        maxHp: hp,
        type: tType,
        width: 36,
        height: 36,
        lastShot: Date.now() + Math.random() * 2000,
        scoreValue: hp * 50,
        wiggleOffset: Math.random() * 10,
      });
    }
    return list;
  };

  // Reset Game
  const handleReset = () => {
    stateRef.current = {
      playerX: 240,
      playerY: 420,
      playerSpeed: 7.5,
      movingLeft: false,
      movingRight: false,
      movingUp: false,
      movingDown: false,
      isFiring: false,
      lastPlayerShot: 0,

      baseHealth: 100,
      baseShield: 100,
      baseShieldActive: false,
      baseShieldTimer: 0,
      empBombs: 2,
      empWaveRadius: 0,
      isEmpActive: false,

      tripleLaser: false,
      tripleLaserDuration: 0,

      score: 0,
      wave: 1,
      aliensDefeated: 0,
      gemsEarned: 0,
      lastThreatLevel: 1,
      isOver: false,
      isWon: false,

      threats: createInitialThreats(480, 1.0),
      bullets: [],
      powerUps: [],
      stars: initStars(480, 520),
      explosions: [],

      nextId: 1,
      bossSpawned: false,
    };

    setScore(0);
    setWave(1);
    setAliensDefeated(0);
    setBaseHealth(100);
    setBaseShield(100);
    setEmpBombs(2);
    setGemsEarned(0);
    setTripleLaserTimer(0);
    setThreatLevel(1);
    setSpeedDisplay(1.0);
    setLevelNotice(null);
    setIsGameOver(false);
    setIsVictory(false);

    if (soundEnabled) playSoundEffect('gem');
  };

  // Trigger EMP Bomb
  const triggerEmpBomb = () => {
    const s = stateRef.current;
    if (s.empBombs <= 0 || s.isOver || s.isWon) return;

    s.empBombs -= 1;
    setEmpBombs(s.empBombs);
    s.isEmpActive = true;
    s.empWaveRadius = 10;

    if (soundEnabled) playSoundEffect('unlock');

    // Destroy all incoming hostile missiles and meteorites/aliens
    for (const t of s.threats) {
      if (t.type === 'boss_alien') {
        t.hp -= 20;
      } else {
        t.hp = 0;
        s.aliensDefeated++;
      }
      s.explosions.push({
        id: s.nextId++,
        x: t.x,
        y: t.y,
        radius: 10,
        maxRadius: 35,
        color: '#38BDF8',
        alpha: 1,
      });
    }

    setAliensDefeated(s.aliensDefeated);
    s.bullets = s.bullets.filter((b) => !b.isEnemy);
  };

  // Trigger Base Energy Shield Overcharge
  const triggerBaseShield = () => {
    const s = stateRef.current;
    if (s.baseShield < 25 || s.baseShieldActive || s.isOver || s.isWon) return;

    s.baseShieldActive = true;
    s.baseShieldTimer = 300; // ~5 seconds (60fps)
    s.baseShield = Math.max(0, s.baseShield - 25);
    setBaseShield(s.baseShield);

    if (soundEnabled) playSoundEffect('correct');
  };

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      const s = stateRef.current;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) s.movingLeft = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) s.movingRight = true;
      if (['ArrowUp', 'KeyW'].includes(e.code)) s.movingUp = true;
      if (['ArrowDown', 'KeyS'].includes(e.code)) s.movingDown = true;
      if (['Space', 'KeyJ', 'Enter'].includes(e.code)) s.isFiring = true;

      if (['KeyB', 'Digit1', 'Numpad1'].includes(e.code)) {
        triggerBaseShield();
      }
      if (['KeyE', 'Digit2', 'Numpad2'].includes(e.code)) {
        triggerEmpBomb();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) s.movingLeft = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) s.movingRight = false;
      if (['ArrowUp', 'KeyW'].includes(e.code)) s.movingUp = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) s.movingDown = false;
      if (['Space', 'KeyJ', 'Enter'].includes(e.code)) s.isFiring = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [soundEnabled]);

  // Main 60FPS Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let spawnTimer = 0;

    canvas.width = 480;
    canvas.height = 520;

    stateRef.current.stars = initStars(canvas.width, canvas.height);
    if (stateRef.current.threats.length === 0) {
      stateRef.current.threats = createInitialThreats(canvas.width, 1.0);
    }

    const loop = () => {
      const s = stateRef.current;
      const now = Date.now();

      // DYNAMIC DIFFICULTY PROGRESSION CALCULATED IN REAL-TIME FROM SCORE:
      // 1) Speed Multiplier: 1.0x at 0 score -> +0.15 for every 250 points (scales smoothly up to 3.2x)
      const currentSpeedMult = Math.min(3.2, 1.0 + (s.score / 250) * 0.15);

      // 2) Spawn Interval: 45 frames (~0.75s) at start -> drops to 12 frames (~0.2s) as score increases
      const currentSpawnInterval = Math.max(12, Math.round(45 - Math.min(33, (s.score / 200) * 3)));
      const currentQuickInterval = Math.max(7, Math.round(18 - Math.min(11, (s.score / 250) * 2)));

      // 3) Maximum concurrent aliens on screen increases from 8 up to 15
      const currentMaxThreats = Math.min(15, 8 + Math.floor(s.score / 450));

      // 4) Threat Alert Level (1 to 10+)
      const currentThreatLevel = 1 + Math.floor(s.score / 400);

      // Check for Threat Level Up
      if (currentThreatLevel > s.lastThreatLevel) {
        s.lastThreatLevel = currentThreatLevel;
        setThreatLevel(currentThreatLevel);
        setSpeedDisplay(Number(currentSpeedMult.toFixed(1)));
        setLevelNotice(`⚡ ¡NIVEL DE AMENAZA ${currentThreatLevel}! Flota Alienígena Acelerada (${currentSpeedMult.toFixed(1)}x)`);
        if (soundEnabled) playSoundEffect('unlock');
        setTimeout(() => setLevelNotice(null), 3000);
      }

      // Sync display every ~30 frames
      if (Math.random() < 0.04) {
        setSpeedDisplay(Number(currentSpeedMult.toFixed(1)));
      }

      // 1. UPDATE STARS BACKGROUND
      for (const star of s.stars) {
        star.y += star.speed * (1 + (currentSpeedMult - 1) * 0.25);
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
      }

      if (!s.isOver && !s.isWon) {
        // 2. PLAYER MOVEMENT (Player gets slight speed boost as game speeds up so it stays very agile)
        const effectivePlayerSpeed = s.playerSpeed * (1 + (currentSpeedMult - 1) * 0.12);
        if (s.movingLeft) s.playerX = Math.max(30, s.playerX - effectivePlayerSpeed);
        if (s.movingRight) s.playerX = Math.min(canvas.width - 30, s.playerX + effectivePlayerSpeed);
        if (s.movingUp) s.playerY = Math.max(260, s.playerY - effectivePlayerSpeed);
        if (s.movingDown) s.playerY = Math.min(440, s.playerY + effectivePlayerSpeed);

        // 3. BASE SHIELD RECHARGE & TIMER
        if (s.baseShieldActive) {
          s.baseShieldTimer -= 1;
          if (s.baseShieldTimer <= 0) s.baseShieldActive = false;
        } else if (s.baseShield < 100) {
          s.baseShield = Math.min(100, s.baseShield + 0.06);
          setBaseShield(Math.round(s.baseShield));
        }

        // 4. TRIPLE LASER TIMER
        if (s.tripleLaser) {
          s.tripleLaserDuration -= 1;
          if (s.tripleLaserDuration <= 0) {
            s.tripleLaser = false;
            setTripleLaserTimer(0);
          } else {
            setTripleLaserTimer(Math.ceil(s.tripleLaserDuration / 60));
          }
        }

        // 5. EMP SHOCKWAVE EXPANSION
        if (s.isEmpActive) {
          s.empWaveRadius += 18;
          if (s.empWaveRadius > canvas.width * 1.4) {
            s.isEmpActive = false;
            s.empWaveRadius = 0;
          }
        }

        // 6. FIRING DEFENSE LASERS
        const shotCooldown = s.tripleLaser ? 130 : 180;
        if (s.isFiring && now - s.lastPlayerShot > shotCooldown) {
          s.lastPlayerShot = now;
          if (soundEnabled) playSoundEffect('feed');

          if (s.tripleLaser) {
            s.bullets.push(
              { id: s.nextId++, x: s.playerX, y: s.playerY - 20, vx: 0, vy: -12, isEnemy: false, color: '#38BDF8', damage: 1 },
              { id: s.nextId++, x: s.playerX - 14, y: s.playerY - 14, vx: -2.8, vy: -11, isEnemy: false, color: '#F472B6', damage: 1 },
              { id: s.nextId++, x: s.playerX + 14, y: s.playerY - 14, vx: 2.8, vy: -11, isEnemy: false, color: '#F472B6', damage: 1 }
            );
          } else {
            s.bullets.push(
              { id: s.nextId++, x: s.playerX - 10, y: s.playerY - 20, vx: 0, vy: -11, isEnemy: false, color: '#38BDF8', damage: 1 },
              { id: s.nextId++, x: s.playerX + 10, y: s.playerY - 20, vx: 0, vy: -11, isEnemy: false, color: '#38BDF8', damage: 1 }
            );
          }
        }

        // 7. SPAWN LOGIC SCALED BY SCORE DIFFICULTY
        spawnTimer++;
        const targetInterval = s.threats.length < 5 ? currentQuickInterval : currentSpawnInterval;

        if (spawnTimer >= targetInterval && s.threats.length < currentMaxThreats) {
          spawnTimer = 0;

          const alienTypes: ThreatType[] = [
            'alien_green',
            'alien_octopus',
            'alien_ufo',
            'alien_eyeball',
            'alien_squid',
            'meteorite_small',
            'meteorite_large',
          ];
          const chosen = alienTypes[Math.floor(Math.random() * alienTypes.length)];
          const hp = chosen === 'alien_ufo' ? 2 : chosen === 'alien_squid' || chosen === 'meteorite_large' ? 3 : 1;

          // Speed scaled directly by currentSpeedMult
          const baseVy = Math.random() * 1.2 + 1.2;
          const vy = baseVy * currentSpeedMult;
          const vx = (Math.random() - 0.5) * 1.8 * Math.min(2.2, currentSpeedMult * 0.9);

          s.threats.push({
            id: s.nextId++,
            x: Math.random() * (canvas.width - 80) + 40,
            y: -25,
            vx,
            vy,
            hp,
            maxHp: hp,
            type: chosen,
            width: chosen === 'meteorite_large' ? 44 : 36,
            height: chosen === 'meteorite_large' ? 44 : 36,
            lastShot: now + Math.random() * 1500,
            scoreValue: hp * 50,
            wiggleOffset: Math.random() * 10,
          });
        }

        // Spawn Boss on Wave 3 after 25 aliens are defeated
        if (s.wave === 3 && s.aliensDefeated >= 25 && !s.bossSpawned) {
          s.bossSpawned = true;
          s.threats.push({
            id: s.nextId++,
            x: canvas.width / 2,
            y: -60,
            vx: 1.5 * Math.min(2.0, currentSpeedMult * 0.7),
            vy: 0.9 * currentSpeedMult,
            hp: 35,
            maxHp: 35,
            type: 'boss_alien',
            width: 72,
            height: 60,
            lastShot: now + 600,
            scoreValue: 1200,
          });
          if (soundEnabled) playSoundEffect('wrong');
        }

        // 8. UPDATE THREATS & BASE DAMAGE
        for (let i = s.threats.length - 1; i >= 0; i--) {
          const t = s.threats[i];
          t.x += t.vx;
          t.y += t.vy;

          // Wall bounce
          if (t.x < 30 || t.x > canvas.width - 30) {
            t.vx = -t.vx;
          }

          // Alien shooting plasma at base (Shoot frequency also accelerates with score)
          const shootInterval = Math.max(
            850,
            (t.type === 'boss_alien' ? 1000 : 2000) - Math.min(1000, s.score * 0.4)
          );

          if (
            ['alien_ufo', 'alien_eyeball', 'alien_green', 'boss_alien'].includes(t.type) &&
            now - t.lastShot > shootInterval
          ) {
            t.lastShot = now;
            s.bullets.push({
              id: s.nextId++,
              x: t.x,
              y: t.y + 18,
              vx: (Math.random() - 0.5) * (1.8 * Math.min(2.0, currentSpeedMult * 0.9)),
              vy: Math.min(8.0, 5.0 * (1 + (currentSpeedMult - 1) * 0.3)),
              isEnemy: true,
              color: t.type === 'alien_green' ? '#22C55E' : '#EF4444',
              damage: 8,
            });
          }

          // Threat reaching base (y >= 460)
          if (t.y >= 460) {
            const impactDamage = t.type === 'boss_alien' ? 35 : t.type === 'meteorite_large' ? 20 : 12;

            if (s.baseShieldActive) {
              if (soundEnabled) playSoundEffect('gem');
            } else if (s.baseShield > 0) {
              const absorb = Math.min(s.baseShield, impactDamage);
              s.baseShield -= absorb;
              const remainingDamage = impactDamage - absorb;
              s.baseHealth = Math.max(0, s.baseHealth - remainingDamage);
            } else {
              s.baseHealth = Math.max(0, s.baseHealth - impactDamage);
            }

            setBaseHealth(Math.round(s.baseHealth));
            setBaseShield(Math.round(s.baseShield));

            s.explosions.push({
              id: s.nextId++,
              x: t.x,
              y: 470,
              radius: 10,
              maxRadius: 36,
              color: '#F97316',
              alpha: 1,
            });

            if (soundEnabled) playSoundEffect('wrong');

            s.threats.splice(i, 1);

            if (s.baseHealth <= 0) {
              s.isOver = true;
              setIsGameOver(true);
              if (soundEnabled) playSoundEffect('wrong');
            }
          }
        }

        // 9. UPDATE BULLETS
        for (let i = s.bullets.length - 1; i >= 0; i--) {
          const b = s.bullets[i];
          b.x += b.vx;
          b.y += b.vy;

          if (b.y < -10 || b.y > canvas.height + 10 || b.x < -10 || b.x > canvas.width + 10) {
            s.bullets.splice(i, 1);
            continue;
          }

          // Enemy bullet hits player defense ship
          if (b.isEnemy) {
            const distToPlayer = Math.hypot(b.x - s.playerX, b.y - s.playerY);
            if (distToPlayer < 24) {
              s.bullets.splice(i, 1);
              s.explosions.push({
                id: s.nextId++,
                x: s.playerX,
                y: s.playerY,
                radius: 4,
                maxRadius: 18,
                color: '#38BDF8',
                alpha: 1,
              });
              if (s.baseShield > 5) {
                s.baseShield = Math.max(0, s.baseShield - 8);
                setBaseShield(Math.round(s.baseShield));
              }
              continue;
            }

            // Hits base directly
            if (b.y >= 465) {
              s.bullets.splice(i, 1);
              if (!s.baseShieldActive) {
                if (s.baseShield > 0) {
                  s.baseShield = Math.max(0, s.baseShield - b.damage);
                } else {
                  s.baseHealth = Math.max(0, s.baseHealth - b.damage);
                }
                setBaseHealth(Math.round(s.baseHealth));
                setBaseShield(Math.round(s.baseShield));
              }

              if (s.baseHealth <= 0) {
                s.isOver = true;
                setIsGameOver(true);
              }
              continue;
            }
          }

          // Player bullet hits threat (aliens / meteorites)
          if (!b.isEnemy) {
            for (let j = s.threats.length - 1; j >= 0; j--) {
              const t = s.threats[j];
              const dist = Math.hypot(b.x - t.x, b.y - t.y);

              if (dist < t.width / 2 + 8) {
                t.hp -= b.damage;
                s.bullets.splice(i, 1);

                s.explosions.push({
                  id: s.nextId++,
                  x: b.x,
                  y: b.y,
                  radius: 3,
                  maxRadius: 12,
                  color: '#FDE047',
                  alpha: 1,
                });

                if (t.hp <= 0) {
                  s.score += t.scoreValue;
                  setScore(s.score);
                  s.aliensDefeated++;
                  setAliensDefeated(s.aliensDefeated);

                  s.explosions.push({
                    id: s.nextId++,
                    x: t.x,
                    y: t.y,
                    radius: 8,
                    maxRadius: t.type === 'boss_alien' ? 50 : 28,
                    color: t.type.includes('alien') ? '#22C55E' : '#FB923C',
                    alpha: 1,
                  });

                  // If large meteorite splits in two smaller
                  if (t.type === 'meteorite_large') {
                    s.threats.push(
                      {
                        id: s.nextId++,
                        x: t.x - 12,
                        y: t.y,
                        vx: -1.6 * currentSpeedMult,
                        vy: 2.2 * currentSpeedMult,
                        hp: 1,
                        maxHp: 1,
                        type: 'meteorite_small',
                        width: 24,
                        height: 24,
                        lastShot: 0,
                        scoreValue: 40,
                      },
                      {
                        id: s.nextId++,
                        x: t.x + 12,
                        y: t.y,
                        vx: 1.6 * currentSpeedMult,
                        vy: 2.2 * currentSpeedMult,
                        hp: 1,
                        maxHp: 1,
                        type: 'meteorite_small',
                        width: 24,
                        height: 24,
                        lastShot: 0,
                        scoreValue: 40,
                      }
                    );
                  }

                  // Drop power-ups or gems
                  const dropChance = Math.random();
                  if (dropChance < 0.32 || t.type === 'boss_alien') {
                    const powerTypes: PowerUp['type'][] = [
                      'shield_boost',
                      'triple_laser',
                      'emp_bomb',
                      'gem_drop',
                      'base_repair',
                    ];
                    const chosen = powerTypes[Math.floor(Math.random() * powerTypes.length)];
                    s.powerUps.push({
                      id: s.nextId++,
                      x: t.x,
                      y: t.y,
                      type: chosen,
                    });
                  }

                  s.threats.splice(j, 1);
                  if (soundEnabled) playSoundEffect('correct');

                  // Wave progression check
                  if (s.aliensDefeated === 10 && s.wave === 1) {
                    s.wave = 2;
                    setWave(2);
                    s.gemsEarned += 15;
                    setGemsEarned(s.gemsEarned);
                    onWin(15);
                    if (soundEnabled) playSoundEffect('unlock');
                  } else if (s.aliensDefeated === 22 && s.wave === 2) {
                    s.wave = 3;
                    setWave(3);
                    s.gemsEarned += 20;
                    setGemsEarned(s.gemsEarned);
                    onWin(20);
                    if (soundEnabled) playSoundEffect('unlock');
                  } else if (t.type === 'boss_alien') {
                    // Victory! Boss defeated!
                    s.isWon = true;
                    setIsVictory(true);
                    s.gemsEarned += 40;
                    setGemsEarned(s.gemsEarned);
                    onWin(40);
                    if (soundEnabled) playSoundEffect('correct');
                  }
                }
                break;
              }
            }
          }
        }

        // 10. UPDATE POWER-UPS
        for (let i = s.powerUps.length - 1; i >= 0; i--) {
          const p = s.powerUps[i];
          p.y += 2.0;

          const distToPlayer = Math.hypot(p.x - s.playerX, p.y - s.playerY);
          if (distToPlayer < 30) {
            if (p.type === 'shield_boost') {
              s.baseShield = Math.min(100, s.baseShield + 35);
              setBaseShield(Math.round(s.baseShield));
            } else if (p.type === 'triple_laser') {
              s.tripleLaser = true;
              s.tripleLaserDuration = 600; // 10s
              setTripleLaserTimer(10);
            } else if (p.type === 'emp_bomb') {
              s.empBombs = Math.min(4, s.empBombs + 1);
              setEmpBombs(s.empBombs);
            } else if (p.type === 'gem_drop') {
              s.gemsEarned += 10;
              setGemsEarned(s.gemsEarned);
              onWin(10);
            } else if (p.type === 'base_repair') {
              s.baseHealth = Math.min(100, s.baseHealth + 25);
              setBaseHealth(Math.round(s.baseHealth));
            }

            s.powerUps.splice(i, 1);
            if (soundEnabled) playSoundEffect('gem');
            continue;
          }

          if (p.y > canvas.height + 20) {
            s.powerUps.splice(i, 1);
          }
        }
      }

      // 11. UPDATE EXPLOSIONS
      for (let i = s.explosions.length - 1; i >= 0; i--) {
        const exp = s.explosions[i];
        exp.radius += 2.5;
        exp.alpha -= 0.04;
        if (exp.alpha <= 0) {
          s.explosions.splice(i, 1);
        }
      }

      // 12. RENDER CANVAS
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Deep space atmospheric background
      const spaceGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      spaceGrad.addColorStop(0, '#060814');
      spaceGrad.addColorStop(0.7, '#0F172A');
      spaceGrad.addColorStop(1, '#1E1B4B');
      ctx.fillStyle = spaceGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Stars
      for (const st of s.stars) {
        ctx.fillStyle = `rgba(255, 255, 255, ${st.alpha})`;
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // EMP Shockwave Ring
      if (s.isEmpActive) {
        ctx.save();
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 6;
        ctx.shadowColor = '#0284C7';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, 480, s.empWaveRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Draw PowerUps
      for (const p of s.powerUps) {
        ctx.font = '24px sans-serif';
        const icon =
          p.type === 'shield_boost'
            ? '🛡️'
            : p.type === 'triple_laser'
            ? '⚡'
            : p.type === 'emp_bomb'
            ? '💣'
            : p.type === 'gem_drop'
            ? '💎'
            : '🔧';
        ctx.fillText(icon, p.x - 12, p.y + 8);
      }

      // Draw Threats (Aliens & Meteorites)
      for (const t of s.threats) {
        ctx.save();
        ctx.translate(t.x, t.y);

        let icon = '👽';
        let fontSize = '32px';

        if (t.type === 'alien_green') {
          icon = '👽';
          fontSize = '32px';
        } else if (t.type === 'alien_octopus') {
          icon = '👾';
          fontSize = '34px';
        } else if (t.type === 'alien_ufo') {
          icon = '🛸';
          fontSize = '34px';
        } else if (t.type === 'alien_eyeball') {
          icon = '👁️';
          fontSize = '30px';
        } else if (t.type === 'alien_squid') {
          icon = '🐙';
          fontSize = '32px';
        } else if (t.type === 'meteorite_small') {
          icon = '☄️';
          fontSize = '26px';
        } else if (t.type === 'meteorite_large') {
          icon = '🪨';
          fontSize = '40px';
        } else if (t.type === 'boss_alien') {
          icon = '👾';
          fontSize = '58px';
        }

        ctx.font = `${fontSize} sans-serif`;
        ctx.fillText(icon, -t.width / 2, t.height / 3);

        // Extra crown on Boss
        if (t.type === 'boss_alien') {
          ctx.font = '22px sans-serif';
          ctx.fillText('👑', -11, -t.height / 2 - 10);
        }

        // HP bar for durable enemies & Boss
        if (t.maxHp > 1) {
          const hpW = Math.min(50, t.width);
          const hpPct = Math.max(0, t.hp / t.maxHp);
          ctx.fillStyle = '#0F172A';
          ctx.fillRect(-hpW / 2, -t.height / 2 - 8, hpW, 4);
          ctx.fillStyle = t.type === 'boss_alien' ? '#EC4899' : '#EF4444';
          ctx.fillRect(-hpW / 2, -t.height / 2 - 8, hpW * hpPct, 4);
        }

        ctx.restore();
      }

      // Draw Explosions
      for (const exp of s.explosions) {
        ctx.save();
        ctx.fillStyle = exp.color;
        ctx.globalAlpha = Math.max(0, exp.alpha);
        ctx.beginPath();
        ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw Bullets
      for (const b of s.bullets) {
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.isEnemy ? 4 : 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Mobile Player Defense Ship
      ctx.save();
      ctx.translate(s.playerX, s.playerY);

      // Thruster flame
      ctx.font = '16px sans-serif';
      ctx.fillText('🔥', -8, 26);

      // Ship
      ctx.font = '32px sans-serif';
      ctx.fillText('🚀', -16, 12);

      // Aiming crosshair guide
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.lineTo(0, -180);
      ctx.stroke();

      ctx.restore();

      // 13. DRAW PLANETARY DEFENSE BASE AT BOTTOM
      ctx.save();

      // Planetary surface horizon arc
      ctx.fillStyle = '#1E1B4B';
      ctx.beginPath();
      ctx.moveTo(0, 480);
      ctx.quadraticCurveTo(canvas.width / 2, 465, canvas.width, 480);
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.fill();

      // Base structures
      ctx.font = '32px sans-serif';
      ctx.fillText('🏛️', canvas.width / 2 - 20, 500);
      ctx.font = '24px sans-serif';
      ctx.fillText('📡', canvas.width / 2 - 80, 500);
      ctx.fillText('⚡', canvas.width / 2 + 55, 500);
      ctx.fillText('🛡️', canvas.width / 2 - 140, 505);
      ctx.fillText('🛡️', canvas.width / 2 + 115, 505);

      // Base Shield Dome Effect
      if (s.baseShieldActive || s.baseShield > 0) {
        ctx.strokeStyle = s.baseShieldActive
          ? 'rgba(56, 189, 248, 0.85)'
          : `rgba(56, 189, 248, ${0.15 + (s.baseShield / 100) * 0.4})`;
        ctx.lineWidth = s.baseShieldActive ? 5 : 2;
        ctx.shadowColor = '#38BDF8';
        ctx.shadowBlur = s.baseShieldActive ? 25 : 8;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, 500, canvas.width / 2 - 20, Math.PI, 0);
        ctx.stroke();
      }

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [soundEnabled, onWin]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 max-w-4xl mx-auto">
      {/* Top Header & Base Vitality HUD */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center font-bold text-2xl shadow-lg shadow-indigo-500/30">
            👽
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>Guerra de las Galaxias · ¡Invasión Alienígena!</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold">
                Oleada {wave}/3
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              ¡A mayor puntuación, los alienígenas se mueven más rápido y atacan con mayor frecuencia!
            </p>
          </div>
        </div>

        {/* Score & Aliens Count Badge & Dynamic Difficulty Badge */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-right">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">Puntos</span>
            <span className="text-sm font-black text-white">{score}</span>
          </div>

          {/* DYNAMIC DIFFICULTY PROGRESSION BADGE */}
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-right">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">Amenaza / Velocidad</span>
            <span
              className={`text-sm font-black flex items-center gap-1 ${
                threatLevel >= 5
                  ? 'text-pink-400 animate-pulse'
                  : threatLevel >= 3
                  ? 'text-amber-400'
                  : 'text-cyan-400'
              }`}
            >
              <span>Nivel {threatLevel}</span>
              <span className="text-xs font-bold text-slate-400">({speedDisplay}x vel)</span>
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-right">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">Alienígenas</span>
            <span className="text-sm font-black text-emerald-400">👽 {aliensDefeated}</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-amber-500/40 text-right">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">Gemas Ganadas</span>
            <span className="text-sm font-black text-amber-300 flex items-center gap-1">
              <Gem className="w-3.5 h-3.5 fill-amber-400" />
              <span>+{gemsEarned}</span>
            </span>
          </div>

          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Reiniciar partida"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Base Defense Status Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
        {/* Base Health */}
        <div>
          <div className="flex justify-between text-xs mb-1 font-bold">
            <span className="text-rose-300 flex items-center gap-1">
              <span>🏛️ Salud de la Base</span>
            </span>
            <span className={baseHealth > 40 ? 'text-emerald-400' : 'text-rose-400 font-black animate-pulse'}>
              {baseHealth}%
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                baseHealth > 50
                  ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                  : baseHealth > 25
                  ? 'bg-amber-400'
                  : 'bg-rose-500 animate-pulse'
              }`}
              style={{ width: `${baseHealth}%` }}
            />
          </div>
        </div>

        {/* Base Shield */}
        <div>
          <div className="flex justify-between text-xs mb-1 font-bold">
            <span className="text-cyan-300 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Escudo Planetario</span>
            </span>
            <span className="text-cyan-400">{baseShield}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${baseShield}%` }}
            />
          </div>
        </div>

        {/* Super Abilities Status */}
        <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
          <button
            onClick={triggerBaseShield}
            disabled={baseShield < 25}
            className="px-2.5 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold hover:bg-cyan-900 disabled:opacity-30 transition-all flex items-center gap-1 text-[11px]"
          >
            <span>[B] Escudo Base</span>
          </button>

          <button
            onClick={triggerEmpBomb}
            disabled={empBombs <= 0}
            className="px-2.5 py-1.5 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 font-bold hover:bg-indigo-900 disabled:opacity-30 transition-all flex items-center gap-1 text-[11px]"
          >
            <span>[E] Bomba EMP ({empBombs})</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative flex justify-center items-center bg-black/95 rounded-2xl overflow-hidden border-2 border-slate-800 shadow-inner">
        <canvas ref={canvasRef} className="block max-w-full h-auto cursor-crosshair" />

        {/* On-Screen Threat Level Acceleration Notice */}
        {levelNotice && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/90 to-rose-600/90 text-slate-950 font-black text-xs sm:text-sm shadow-2xl border-2 border-white/40 animate-bounce flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 fill-slate-950 text-amber-300" />
            <span>{levelNotice}</span>
          </div>
        )}

        {/* Game Over Modal Screen */}
        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4 animate-fadeIn z-30">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-3xl border border-rose-500/40 animate-pulse">
              💥
            </div>
            <h3 className="text-2xl font-black text-white">¡Los Alienígenas Invadieron la Base!</h3>
            <p className="text-xs text-slate-300 max-w-xs">
              Alcanzaste el Nivel de Amenaza {threatLevel} ({speedDisplay}x vel) y derrotaste a {aliensDefeated} alienígenas.
            </p>
            <div className="text-sm font-bold text-amber-300">Puntuación Final: {score} Puntos</div>
            <button
              onClick={handleReset}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl hover:scale-105 transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Defender la Base de Nuevo</span>
            </button>
          </div>
        )}

        {/* Victory Modal Screen */}
        {isVictory && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4 animate-fadeIn z-30">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-3xl border border-amber-500/40 animate-bounce">
              🏆
            </div>
            <h3 className="text-2xl font-black text-amber-300">¡Victoria Espacial Total!</h3>
            <p className="text-xs text-slate-300 max-w-sm">
              Has defendido con éxito la base espacial frente a la aceleración alienígena extrema,
              derrotado al Emperador Alienígena y desintegrado la invasión extraterrestre.
            </p>
            <div className="flex items-center gap-4 bg-slate-900 p-3 rounded-2xl border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Puntaje Final</span>
                <span className="text-lg font-black text-white">{score}</span>
              </div>
              <div className="w-px h-8 bg-slate-800" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Nivel Amenaza</span>
                <span className="text-lg font-black text-cyan-400">Nv.{threatLevel}</span>
              </div>
              <div className="w-px h-8 bg-slate-800" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Gemas Ganadas</span>
                <span className="text-lg font-black text-amber-400">+{gemsEarned} 💎</span>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-sm shadow-xl hover:scale-105 transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Jugar Siguiente Ronda</span>
            </button>
          </div>
        )}
      </div>

      {/* Keyboard Controls Guide & Touch Action Controls */}
      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
        {/* Onscreen Keyboard Guide */}
        <div className="flex items-center justify-between text-xs text-slate-300 flex-wrap gap-2">
          <span className="font-bold text-white flex items-center gap-1.5">
            <span>⌨️ Controles de Teclado:</span>
          </span>
          <div className="flex items-center gap-2 flex-wrap text-[11px]">
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-cyan-300 font-bold">
              [←] [→] o [A] [D]
            </span>
            <span className="text-slate-400">Mover Nave</span>
            <span className="text-slate-600">·</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-pink-300 font-bold">
              [Espacio]
            </span>
            <span className="text-slate-400">Disparar Láser</span>
            <span className="text-slate-600">·</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-amber-300 font-bold">
              [B]
            </span>
            <span className="text-slate-400">Escudo Base</span>
            <span className="text-slate-600">·</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-indigo-300 font-bold">
              [E]
            </span>
            <span className="text-slate-400">Bomba EMP</span>
          </div>
        </div>

        {/* Touch Controls for Tablet & Mobile Users */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-900">
          <div className="flex items-center gap-2">
            <button
              onMouseDown={() => (stateRef.current.movingLeft = true)}
              onMouseUp={() => (stateRef.current.movingLeft = false)}
              onTouchStart={() => (stateRef.current.movingLeft = true)}
              onTouchEnd={() => (stateRef.current.movingLeft = false)}
              className="w-12 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-sm shadow active:scale-95"
            >
              ◀
            </button>
            <button
              onMouseDown={() => (stateRef.current.movingRight = true)}
              onMouseUp={() => (stateRef.current.movingRight = false)}
              onTouchStart={() => (stateRef.current.movingRight = true)}
              onTouchEnd={() => (stateRef.current.movingRight = false)}
              className="w-12 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-sm shadow active:scale-95"
            >
              ▶
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={triggerBaseShield}
              disabled={baseShield < 25}
              className="px-3.5 py-2 rounded-xl bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold text-xs active:scale-95"
            >
              🛡️ Escudo
            </button>
            <button
              onClick={triggerEmpBomb}
              disabled={empBombs <= 0}
              className="px-3.5 py-2 rounded-xl bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold text-xs active:scale-95"
            >
              💣 EMP ({empBombs})
            </button>
            <button
              onMouseDown={() => (stateRef.current.isFiring = true)}
              onMouseUp={() => (stateRef.current.isFiring = false)}
              onTouchStart={() => (stateRef.current.isFiring = true)}
              onTouchEnd={() => (stateRef.current.isFiring = false)}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg shadow-rose-600/30 active:scale-95 flex items-center gap-1"
            >
              <span>🔥 Disparar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
