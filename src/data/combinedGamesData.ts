import { LearningMission } from '../types';
import { MATH_50_GAMES } from './mathGamesData';
import { GRAMMAR_50_GAMES } from './grammarGamesData';

export const WORLDS_100_INFO = [
  {
    number: 1,
    name: 'Isla de los Primeros Pasos (Números & Palabras)',
    icon: '🏝️',
    description: 'Sumas básicas, animales, sustantivos, adjetivos y conteo',
    range: [1, 20],
  },
  {
    number: 2,
    name: 'Bosque de los Retos Lógicos & Frases',
    icon: '🌳',
    description: 'Restas, singulares, plurales, tablas del 2 y 3, verbos y rimas',
    range: [21, 40],
  },
  {
    number: 3,
    name: 'Galaxia de Multiplicación & Sintaxis',
    icon: '🚀',
    description: 'Tablas espaciales del 4 y 5, tiempos verbales y mayúsculas',
    range: [41, 60],
  },
  {
    number: 4,
    name: 'Valle de Geometría, Relojes & Ortografía',
    icon: '🏰',
    description: 'Horas, fracciones, figuras, sinónimos, antónimos y acentuación',
    range: [61, 80],
  },
  {
    number: 5,
    name: 'Cumbre de los Grandes Maestros (100 Retos)',
    icon: '👑',
    description: 'Los desafíos supremos de razonamiento matemático y gramatical',
    range: [81, 100],
  },
];

// Helper to create the alternated alternating list of 100 games
export function generateAlternatedGames(): LearningMission[] {
  const result: LearningMission[] = [];
  const total = Math.max(MATH_50_GAMES.length, GRAMMAR_50_GAMES.length);

  for (let i = 0; i < total; i++) {
    // 1. Math Game
    if (i < MATH_50_GAMES.length) {
      const mathGame = { ...MATH_50_GAMES[i] };
      const currentLevel = result.length + 1;
      const worldNum = Math.min(5, Math.floor((currentLevel - 1) / 20) + 1);

      result.push({
        ...mathGame,
        level: currentLevel,
        worldNumber: worldNum,
        worldName: WORLDS_100_INFO[worldNum - 1].name,
      });
    }

    // 2. Grammar Game
    if (i < GRAMMAR_50_GAMES.length) {
      const gramGame = { ...GRAMMAR_50_GAMES[i] };
      const currentLevel = result.length + 1;
      const worldNum = Math.min(5, Math.floor((currentLevel - 1) / 20) + 1);

      result.push({
        ...gramGame,
        level: currentLevel,
        worldNumber: worldNum,
        worldName: WORLDS_100_INFO[worldNum - 1].name,
      });
    }
  }

  return result;
}

// Deterministic pseudo-random shuffle that keeps them nicely alternated
export function shuffleAlternatedGames(games: LearningMission[]): LearningMission[] {
  const mathGames = games.filter((g) => g.subject === 'math');
  const grammarGames = games.filter((g) => g.subject === 'grammar');
  const otherGames = games.filter((g) => g.subject !== 'math' && g.subject !== 'grammar');

  // Randomize both groups
  const shuffledMath = [...mathGames].sort(() => Math.random() - 0.5);
  const shuffledGrammar = [...grammarGames].sort(() => Math.random() - 0.5);

  const combined: LearningMission[] = [];
  const maxLen = Math.max(shuffledMath.length, shuffledGrammar.length);

  for (let i = 0; i < maxLen; i++) {
    if (i < shuffledMath.length) combined.push(shuffledMath[i]);
    if (i < shuffledGrammar.length) combined.push(shuffledGrammar[i]);
  }

  // Append any others if present
  combined.push(...otherGames);

  // Re-index levels 1 to N
  return combined.map((g, idx) => {
    const level = idx + 1;
    const worldNum = Math.min(5, Math.floor((level - 1) / 20) + 1);
    return {
      ...g,
      level,
      worldNumber: worldNum,
      worldName: WORLDS_100_INFO[worldNum - 1]?.name || 'Mundo Cósmico',
    };
  });
}

export const ALL_100_ALTERNATED_GAMES: LearningMission[] = generateAlternatedGames();
