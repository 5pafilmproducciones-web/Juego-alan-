import React, { useState, useEffect, useRef } from 'react';
import { VirtualPet, StudentProfile, PetType, PetMilestone } from '../types';
import { playSoundEffect } from '../services/speechService';
import {
  Heart,
  Sparkles,
  Award,
  Trophy,
  Gem,
  RotateCcw,
  Smile,
  Shield,
  Zap,
  Coffee,
  CheckCircle,
  Clock,
  Flame,
  Star,
  Gift,
  ShoppingBag,
  Palette,
  Crown,
  Check,
  Lock,
} from 'lucide-react';

interface VirtualPetCareZoneProps {
  pet: VirtualPet;
  onUpdatePet: (pet: VirtualPet | ((prev: VirtualPet) => VirtualPet)) => void;
  student: StudentProfile;
  onUpdateStudent: (student: StudentProfile | ((prev: StudentProfile) => StudentProfile)) => void;
  onAddToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
}

export interface PetSpeciesInfo {
  type: PetType;
  speciesName: string;
  defaultName: string;
  avatarEmoji: string;
  element: string;
  themeColor: string;
  bgGradient: string;
  favoriteFood: string;
  specialSkill: string;
  description: string;
  gemPrice: number;
}

export const PET_SPECIES: PetSpeciesInfo[] = [
  {
    type: 'dragon',
    speciesName: 'Dragón de Fuego Cósmico',
    defaultName: 'Ignis',
    avatarEmoji: '🐉',
    element: 'Fuego Celestial',
    themeColor: 'text-amber-400',
    bgGradient: 'from-amber-950/60 via-rose-950/50 to-slate-950',
    favoriteFood: 'Fruta Estelar Solar 🍎',
    specialSkill: 'Aliento de Fuego Brillante 🔥',
    description: 'Valiente, leal y lleno de energía. Le encanta volar entre cometas.',
    gemPrice: 0, // Inicial gratuito
  },
  {
    type: 'dog',
    speciesName: 'Perrito Galáctico',
    defaultName: 'Astro',
    avatarEmoji: '🐶',
    element: 'Energía Estelar',
    themeColor: 'text-blue-400',
    bgGradient: 'from-blue-950/60 via-indigo-950/50 to-slate-950',
    favoriteFood: 'Hueso de Meteorito 🦴',
    specialSkill: 'Doble Salto Espacial 🚀',
    description: 'Siempre listo para jugar y perseguir meteoritos. ¡El mejor amigo del explorador!',
    gemPrice: 0, // Inicial gratuito
  },
  {
    type: 'cat',
    speciesName: 'Gatita Astral',
    defaultName: 'Luna',
    avatarEmoji: '🐱',
    element: 'Gravedad Suave',
    themeColor: 'text-fuchsia-400',
    bgGradient: 'from-fuchsia-950/60 via-purple-950/50 to-slate-950',
    favoriteFood: 'Pescado Nebular 🐟',
    specialSkill: 'Ronroneo Sanador 💖',
    description: 'Elegante y juguetona. Ronronea con cada caricia y salta sin hacer ruido.',
    gemPrice: 0, // Inicial gratuito
  },
  {
    type: 'axolotl',
    speciesName: 'Ajolote Cósmico',
    defaultName: 'Nemo',
    avatarEmoji: '🦎',
    element: 'Agua Luminosa',
    themeColor: 'text-pink-400',
    bgGradient: 'from-pink-950/60 via-teal-950/50 to-slate-950',
    favoriteFood: 'Algas Fluorescentes 🌿',
    specialSkill: 'Burbujas Regenerativas 🫧',
    description: 'Super tierno, regenera vitalidad y flota alegremente en esferas de agua.',
    gemPrice: 60,
  },
  {
    type: 'panda',
    speciesName: 'Panda Sabio',
    defaultName: 'Bambú',
    avatarEmoji: '🐼',
    element: 'Naturaleza Zen',
    themeColor: 'text-emerald-400',
    bgGradient: 'from-emerald-950/60 via-slate-900/60 to-slate-950',
    favoriteFood: 'Bambú Dorado 🎋',
    specialSkill: 'Meditación Zen 🧘',
    description: 'Tranquilo, amoroso y paciente. Otorga calma y concentración para estudiar.',
    gemPrice: 80,
  },
  {
    type: 'phoenix',
    speciesName: 'Fénix Solar',
    defaultName: 'Sol',
    avatarEmoji: '🦅',
    element: 'Luz Eterna',
    themeColor: 'text-yellow-400',
    bgGradient: 'from-yellow-950/60 via-orange-950/50 to-slate-950',
    favoriteFood: 'Néctar Solar 🍯',
    specialSkill: 'Renacimiento Radiante ✨',
    description: 'Majestuoso pájaro de fuego brillante. Si pierde salud, ¡renace más fuerte!',
    gemPrice: 100,
  },
  {
    type: 'unicorn',
    speciesName: 'Unicornio de Cristal',
    defaultName: 'Starlight',
    avatarEmoji: '🦄',
    element: 'Magia de Aurora',
    themeColor: 'text-pink-300',
    bgGradient: 'from-fuchsia-950/60 via-pink-950/50 to-slate-950',
    favoriteFood: 'Golosinas Estelares 🍬',
    specialSkill: 'Destello de Arcoíris 🌈',
    description: 'Criatura mística y bondadosa. Deja un rastro de estrellas de colores al trotar.',
    gemPrice: 120,
  },
  {
    type: 'lion',
    speciesName: 'León Celestial Dorado',
    defaultName: 'Leo',
    avatarEmoji: '🦁',
    element: 'Valor Solar',
    themeColor: 'text-amber-300',
    bgGradient: 'from-amber-950/60 via-yellow-950/50 to-slate-950',
    favoriteFood: 'Carne Solar Mágica 🥩',
    specialSkill: 'Rugido de Fortaleza 👑',
    description: 'Orgulloso rey de las constelaciones. Su melena brilla como una supernova.',
    gemPrice: 140,
  },
  {
    type: 'shadow_dragon',
    speciesName: 'Dragón Sombrío Neón',
    defaultName: 'Kage',
    avatarEmoji: '🐲',
    element: 'Energía Cuántica',
    themeColor: 'text-purple-400',
    bgGradient: 'from-purple-950/70 via-indigo-950/60 to-slate-950',
    favoriteFood: 'Cristal de Sombra 🔮',
    specialSkill: 'Fuego Violeta Abisal ⚡',
    description: 'Legendario habitante del vacío estelar. Escamas de obsidiana con relámpagos violetas.',
    gemPrice: 180,
  },
  {
    type: 'kitsune',
    speciesName: 'Zorro Kitsune de 9 Colas',
    defaultName: 'Kitsune',
    avatarEmoji: '🦊',
    element: 'Fuego Espiritual',
    themeColor: 'text-orange-400',
    bgGradient: 'from-orange-950/60 via-rose-950/50 to-slate-950',
    favoriteFood: 'Bolas de Arroz Celestiales 🍙',
    specialSkill: 'Esferas Ilusorias 🌟',
    description: 'Espíritu legendario ancestral con nueve colas de fuego que protegen a los sabios.',
    gemPrice: 200,
  },
  {
    type: 'robot',
    speciesName: 'Robot Guardián Cibernético',
    defaultName: 'Spark-Bot',
    avatarEmoji: '🤖',
    element: 'Nanotecnología',
    themeColor: 'text-cyan-400',
    bgGradient: 'from-cyan-950/60 via-blue-950/50 to-slate-950',
    favoriteFood: 'Microchips de Energía 🔋',
    specialSkill: 'Barrera Láser Cuántica 🛡️',
    description: 'Droide de alta inteligencia con circuitos de plasma y corazón compasivo.',
    gemPrice: 220,
  },
];

export interface AccessoryItem {
  id: string;
  label: string;
  icon: string;
  price: number;
  description: string;
}

export const AVAILABLE_ACCESSORIES: AccessoryItem[] = [
  { id: 'none', label: 'Sin Accesorio', icon: '❌', price: 0, description: 'Aspecto natural' },
  { id: 'hat', label: 'Gorro de Mago', icon: '🧙', price: 0, description: 'Estilo aprendiz' },
  { id: 'crown', label: 'Corona Real VIP', icon: '👑', price: 35, description: 'Oro puro & gemas' },
  { id: 'glasses', label: 'Gafas Láser Neón', icon: '🕶️', price: 40, description: 'Visión cibernética' },
  { id: 'ribbon', label: 'Lazo Encantado', icon: '🎀', price: 30, description: 'Seda mágica suave' },
  { id: 'cape', label: 'Capa de Héroe', icon: '🦸', price: 50, description: 'Ondea con el viento' },
  { id: 'wings', label: 'Alas de Dragón', icon: '🪽', price: 70, description: 'Plumas luminosas' },
  { id: 'wand', label: 'Varita de Estrellas', icon: '🪄', price: 65, description: 'Canaliza hechizos' },
  { id: 'helmet', label: 'Casco Astronauta', icon: '🧑‍🚀', price: 85, description: 'Exploración espacial' },
  { id: 'aura', label: 'Aura de Fuego', icon: '🔥', price: 95, description: 'Llamas celestiales' },
];

export interface VIPWallpaper {
  id: string;
  name: string;
  icon: string;
  price: number;
  previewGradient: string;
  panelClass: string;
  description: string;
}

export const VIP_WALLPAPERS: VIPWallpaper[] = [
  {
    id: 'nebula',
    name: 'Galaxia de Nebulosas Cósmicas',
    icon: '🌌',
    price: 0,
    previewGradient: 'from-violet-950 via-purple-900 to-slate-950',
    panelClass: 'from-slate-950 via-indigo-950/40 to-slate-950',
    description: 'Estrellas titilantes, nebulosas violetas y atmósfera espacial infinita.',
  },
  {
    id: 'meadow',
    name: 'Pradera Mágica con Luciérnagas',
    icon: '🌿',
    price: 50,
    previewGradient: 'from-emerald-950 via-teal-900 to-slate-950',
    panelClass: 'from-slate-950 via-emerald-950/40 to-teal-950/30',
    description: 'Luciérnagas esmeralda flotantes, brisa mágica y flores resplandecientes.',
  },
  {
    id: 'cyberpunk',
    name: 'Ciberpunk Futurista Neón',
    icon: '🏙️',
    price: 75,
    previewGradient: 'from-cyan-950 via-blue-900 to-fuchsia-950',
    panelClass: 'from-slate-950 via-cyan-950/40 to-fuchsia-950/30',
    description: 'Rejilla holográfica de neón azul, rayos de datos ciberpunk y energía cuántica.',
  },
  {
    id: 'ocean',
    name: 'Acuario Cósmico Submarino',
    icon: '🌊',
    price: 80,
    previewGradient: 'from-blue-950 via-cyan-900 to-slate-950',
    panelClass: 'from-slate-950 via-blue-950/40 to-cyan-950/30',
    description: 'Burbujas bioluminiscentes, arrecifes luminosos y serenidad abisal.',
  },
  {
    id: 'castle',
    name: 'Castillo Celestial en las Nubes',
    icon: '🏰',
    price: 100,
    previewGradient: 'from-amber-950 via-orange-900 to-purple-950',
    panelClass: 'from-slate-950 via-amber-950/40 to-purple-950/30',
    description: 'Torres flotantes doradas al atardecer, nubes místicas y magia real.',
  },
  {
    id: 'volcano',
    name: 'Volcán Legendario de Gemas',
    icon: '🌋',
    price: 120,
    previewGradient: 'from-red-950 via-rose-900 to-amber-950',
    panelClass: 'from-slate-950 via-rose-950/40 to-amber-950/30',
    description: 'Brasas ardientes flotantes, cristales incandescentes y poder ígneo supremo.',
  },
];

const SURVIVAL_MILESTONES: PetMilestone[] = [
  {
    id: 'mile-1',
    title: 'Primeros Cuidados',
    description: 'Mantén la salud general por encima del 70%',
    gemReward: 30,
    badge: '🌱 Cuidador Novato',
    requiredHealth: 70,
  },
  {
    id: 'mile-2',
    title: 'Día Completo con Vida',
    description: 'Sobrevive 1 día manteniendo a tu mascota alegre',
    gemReward: 50,
    badge: '🛡️ Guardián de Criaturas',
    requiredDays: 1,
  },
  {
    id: 'mile-3',
    title: 'Maestro de la Vitalidad',
    description: 'Alcanza el 90% de salud y nivel 4 de mascota',
    gemReward: 80,
    badge: '👑 Corona de Vitalidad',
    requiredHealth: 90,
    requiredLevel: 4,
  },
  {
    id: 'mile-4',
    title: 'Acróbata Espacial',
    description: 'Enseña 3 trucos a tu mascota para divertirte',
    gemReward: 100,
    badge: '🎪 Domador Legendario',
    requiredTricks: 3,
  },
  {
    id: 'mile-5',
    title: 'Vínculo Inmortal',
    description: 'Mantén a tu mascota viva durante 3 días seguidos',
    gemReward: 150,
    badge: '🏆 Gran Campeón Cuidador',
    requiredDays: 3,
  },
];

export const VirtualPetCareZone: React.FC<VirtualPetCareZoneProps> = ({
  pet,
  onUpdatePet,
  student,
  onUpdateStudent,
  onAddToast,
}) => {
  // Current species info
  const currentSpecies = PET_SPECIES.find((s) => s.type === pet.type) || PET_SPECIES[0];

  // Active interaction animation states
  const [currentAnim, setCurrentAnim] = useState<
    'idle' | 'happy' | 'eating' | 'playing' | 'sleeping' | 'bathing' | 'petting' | 'trick'
  >('idle');
  const [floatingParticles, setFloatingParticles] = useState<
    { id: number; char: string; left: number }[]
  >([]);
  const [pettingStreak, setPettingStreak] = useState(0);

  // Active main tab
  const [activeTab, setActiveTab] = useState<
    'care' | 'vip_shop' | 'switch_pet' | 'rewards' | 'minigame'
  >('care');

  // VIP Shop category filter
  const [shopCategory, setShopCategory] = useState<'species' | 'accessories' | 'backgrounds'>('species');

  // Custom pet name
  const [customNameInput, setCustomNameInput] = useState(pet.name);
  const [isEditingName, setIsEditingName] = useState(false);

  // Mini-game state ("Atrapa las Frutas")
  const [isMinigameActive, setIsMinigameActive] = useState(false);
  const [minigameScore, setMinigameScore] = useState(0);
  const [minigameTimeLeft, setMinigameTimeLeft] = useState(20);
  const [minigameBasketX, setMinigameBasketX] = useState(50);
  const [fallingItems, setFallingItems] = useState<{ id: number; x: number; y: number; char: string }[]>(
    []
  );

  // Calculate Overall Health (0-100)
  const healthPercent = Math.round(pet.hunger * 0.35 + pet.happiness * 0.4 + pet.energy * 0.25);
  const isHealthy = healthPercent >= 70;
  const isCritical = healthPercent < 25;

  // Defaults & Unlocks
  const daysAlive = pet.daysAlive || 1;
  const tricksKnown = pet.tricksKnown || ['Saludar 🐾'];
  const claimedMilestones = pet.claimedMilestones || [];
  const currentAccessory = pet.accessory || 'none';
  const unlockedPets = pet.unlockedPets || ['dragon', 'dog', 'cat'];
  const unlockedAccessories = pet.unlockedAccessories || ['none', 'hat'];
  const unlockedBackgrounds = pet.unlockedBackgrounds || ['nebula'];
  const activeBackgroundId = pet.habitatBackground || 'nebula';

  // Get active wallpaper object
  const activeWallpaper =
    VIP_WALLPAPERS.find((w) => w.id === activeBackgroundId) || VIP_WALLPAPERS[0];

  // Spawn floating particle effect helper
  const spawnParticles = (char: string, count = 5) => {
    const newItems = Array.from({ length: count }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      char,
      left: 20 + Math.random() * 60,
    }));
    setFloatingParticles((prev) => [...prev, ...newItems]);
    setTimeout(() => {
      setFloatingParticles((prev) => prev.filter((p) => !newItems.some((n) => n.id === p.id)));
    }, 1800);
  };

  // Petting interaction (touch / click directly on pet)
  const handlePetDirect = () => {
    setPettingStreak((prev) => prev + 1);
    setCurrentAnim('petting');
    spawnParticles('💖', 4);
    if (student.soundEnabled) playSoundEffect('gem');

    onUpdatePet((prev) => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + 3),
      health: Math.min(100, (prev.health || 80) + 2),
    }));

    if (pettingStreak > 0 && pettingStreak % 5 === 0) {
      onAddToast(
        '¡Ronroneo Cósmico! 💕',
        `A ${pet.name} le encantan tus caricias. Felicidad al máximo.`,
        'success'
      );
      if (student.soundEnabled) playSoundEffect('correct');
    }

    setTimeout(() => setCurrentAnim('idle'), 1500);
  };

  // Perform Care Action
  const handleCareAction = (
    action: 'feed' | 'play' | 'sleep' | 'bath' | 'trick',
    cost: number,
    label: string
  ) => {
    if (student.gems < cost) {
      onAddToast(
        'Gemas insuficientes',
        `Necesitas ${cost} gemas para ${label}. ¡Supera retos educativos para conseguir más gemas!`,
        'error'
      );
      if (student.soundEnabled) playSoundEffect('wrong');
      return;
    }

    if (cost > 0) {
      onUpdateStudent((prev) => ({
        ...prev,
        gems: prev.gems - cost,
      }));
    }

    if (action === 'feed') {
      setCurrentAnim('eating');
      spawnParticles('🍎', 4);
      if (student.soundEnabled) playSoundEffect('feed');
      onUpdatePet((prev) => ({
        ...prev,
        hunger: Math.min(100, prev.hunger + 35),
        happiness: Math.min(100, prev.happiness + 15),
        lastFed: 'Justo ahora',
      }));
      onAddToast('¡Bien alimentado!', `${pet.name} devoró su comida favorita con alegría.`, 'success');
    } else if (action === 'play') {
      setCurrentAnim('playing');
      spawnParticles('⚽', 4);
      if (student.soundEnabled) playSoundEffect('gem');
      onUpdatePet((prev) => ({
        ...prev,
        happiness: Math.min(100, prev.happiness + 30),
        energy: Math.max(10, prev.energy - 15),
      }));
      onAddToast('¡A jugar!', `${pet.name} dio piruetas en el aire y está superfeliz.`, 'success');
    } else if (action === 'sleep') {
      setCurrentAnim('sleeping');
      spawnParticles('💤', 4);
      if (student.soundEnabled) playSoundEffect('unlock');
      onUpdatePet((prev) => ({
        ...prev,
        energy: Math.min(100, prev.energy + 45),
        happiness: Math.min(100, prev.happiness + 10),
      }));
      onAddToast('¡Dulces sueños!', `${pet.name} durmió una siesta mágica y recargó energía.`, 'info');
    } else if (action === 'bath') {
      setCurrentAnim('bathing');
      spawnParticles('🫧', 4);
      if (student.soundEnabled) playSoundEffect('correct');
      onUpdatePet((prev) => ({
        ...prev,
        happiness: Math.min(100, prev.happiness + 20),
        level: prev.level + 1,
      }));
      onAddToast('¡Baño reluciente!', `${pet.name} quedó limpio, radiante y subió de nivel.`, 'success');
    } else if (action === 'trick') {
      setCurrentAnim('trick');
      spawnParticles('✨', 6);
      if (student.soundEnabled) playSoundEffect('correct');
      const allPossibleTricks = [
        'Saludar 🐾',
        'Giro 360° 🔄',
        'Volar en Espiral 🌪️',
        'Rugido Luminoso ⚡',
        'Salto Cósmico 🚀',
        'Danza de Estrellas 🌟',
      ];
      const unlearned = allPossibleTricks.filter((t) => !tricksKnown.includes(t));
      const nextTrick = unlearned[0] || 'Acrobacia Épica 🎭';
      onUpdatePet((prev) => ({
        ...prev,
        happiness: Math.min(100, prev.happiness + 25),
        tricksKnown: prev.tricksKnown ? [...new Set([...prev.tricksKnown, nextTrick])] : [nextTrick],
      }));
      onAddToast('¡Nuevo Truco Dominado!', `${pet.name} aprendió: "${nextTrick}" con maestría.`, 'success');
    }

    setTimeout(() => setCurrentAnim('idle'), 2500);
  };

  // Switch pet species directly
  const handleSwitchPet = (species: PetSpeciesInfo) => {
    onUpdatePet((prev) => ({
      ...prev,
      type: species.type,
      name: species.defaultName,
      favoriteFood: species.favoriteFood,
    }));
    setCustomNameInput(species.defaultName);
    onAddToast(
      '¡Compañero Cambiado!',
      `Ahora tu mascota activa es ${species.speciesName} (${species.defaultName})`,
      'success'
    );
    if (student.soundEnabled) playSoundEffect('correct');
    setActiveTab('care');
  };

  // Buy VIP Species with Gems
  const handleBuyVipSpecies = (species: PetSpeciesInfo) => {
    if (student.gems < species.gemPrice) {
      onAddToast(
        'Gemas Insuficientes',
        `Necesitas ${species.gemPrice} gemas para adoptar a ${species.speciesName}. Tienes ${student.gems} gemas.`,
        'error'
      );
      if (student.soundEnabled) playSoundEffect('wrong');
      return;
    }

    // Deduct gems and unlock
    onUpdateStudent((prev) => ({
      ...prev,
      gems: prev.gems - species.gemPrice,
    }));

    onUpdatePet((prev) => {
      const nextUnlocked = [...new Set([...(prev.unlockedPets || ['dragon', 'dog', 'cat']), species.type])];
      return {
        ...prev,
        type: species.type,
        name: species.defaultName,
        favoriteFood: species.favoriteFood,
        unlockedPets: nextUnlocked,
      };
    });

    setCustomNameInput(species.defaultName);
    onAddToast(
      '🎉 ¡Mascota VIP Desbloqueada!',
      `Has gastado ${species.gemPrice} gemas y ahora ${species.speciesName} te acompaña en tu aventura.`,
      'success'
    );
    if (student.soundEnabled) playSoundEffect('unlock');
  };

  // Buy VIP Accessory with Gems
  const handleBuyVipAccessory = (acc: AccessoryItem) => {
    if (student.gems < acc.price) {
      onAddToast(
        'Gemas Insuficientes',
        `Necesitas ${acc.price} gemas para comprar ${acc.label}. Tienes ${student.gems} gemas.`,
        'error'
      );
      if (student.soundEnabled) playSoundEffect('wrong');
      return;
    }

    onUpdateStudent((prev) => ({
      ...prev,
      gems: prev.gems - acc.price,
    }));

    onUpdatePet((prev) => {
      const nextUnlocked = [...new Set([...(prev.unlockedAccessories || ['none', 'hat']), acc.id])];
      return {
        ...prev,
        accessory: acc.id,
        unlockedAccessories: nextUnlocked,
      };
    });

    onAddToast(
      '✨ ¡Accesorio VIP Equipado!',
      `Has comprado ${acc.label} (${acc.icon}) y ya lo luce tu mascota.`,
      'success'
    );
    if (student.soundEnabled) playSoundEffect('unlock');
  };

  // Equip already unlocked accessory
  const handleEquipAccessory = (accId: string) => {
    onUpdatePet((prev) => ({ ...prev, accessory: accId }));
    onAddToast('Accesorio Cambiado', 'Tu mascota ahora luce un nuevo accesorio', 'info');
    if (student.soundEnabled) playSoundEffect('gem');
  };

  // Buy or Equip VIP Animated Wallpaper for Personal Panel
  const handleSelectWallpaper = (wallpaper: VIPWallpaper) => {
    const isUnlocked = unlockedBackgrounds.includes(wallpaper.id) || wallpaper.price === 0;

    if (!isUnlocked) {
      // Must buy with gems
      if (student.gems < wallpaper.price) {
        onAddToast(
          'Gemas Insuficientes',
          `Necesitas ${wallpaper.price} gemas para desbloquear el fondo animado ${wallpaper.name}.`,
          'error'
        );
        if (student.soundEnabled) playSoundEffect('wrong');
        return;
      }

      // Deduct gems
      onUpdateStudent((prev) => ({
        ...prev,
        gems: prev.gems - wallpaper.price,
        panelBackground: wallpaper.id,
      }));

      onUpdatePet((prev) => ({
        ...prev,
        habitatBackground: wallpaper.id,
        unlockedBackgrounds: [...new Set([...(prev.unlockedBackgrounds || ['nebula']), wallpaper.id])],
      }));

      onAddToast(
        '🌌 ¡Fondo Animado Desbloqueado!',
        `Has aplicado ${wallpaper.name} a tu panel personal y al hábitat de tu mascota.`,
        'success'
      );
      if (student.soundEnabled) playSoundEffect('unlock');
    } else {
      // Already unlocked, simply equip
      onUpdatePet((prev) => ({
        ...prev,
        habitatBackground: wallpaper.id,
      }));

      onUpdateStudent((prev) => ({
        ...prev,
        panelBackground: wallpaper.id,
      }));

      onAddToast(
        'Fondo Aplicado',
        `El fondo animado "${wallpaper.name}" ahora está activo en tu panel personal.`,
        'success'
      );
      if (student.soundEnabled) playSoundEffect('gem');
    }
  };

  // Claim survival reward milestone
  const handleClaimMilestone = (m: PetMilestone) => {
    if (claimedMilestones.includes(m.id)) return;

    onUpdateStudent((prev) => ({
      ...prev,
      gems: prev.gems + m.gemReward,
    }));

    onUpdatePet((prev) => ({
      ...prev,
      claimedMilestones: [...(prev.claimedMilestones || []), m.id],
    }));

    onAddToast(
      '🏆 ¡Recompensa Reclamada!',
      `Has ganado +${m.gemReward} Gemas y la insignia "${m.badge}" por cuidar tan bien a tu mascota.`,
      'success'
    );
    if (student.soundEnabled) playSoundEffect('correct');
  };

  // Save customized pet name
  const handleSaveName = () => {
    if (!customNameInput.trim()) return;
    onUpdatePet((prev) => ({ ...prev, name: customNameInput.trim() }));
    setIsEditingName(false);
    onAddToast('Nombre Guardado', `Tu mascota ahora se llama ${customNameInput.trim()}`, 'success');
  };

  // Start mini-game
  const startMinigame = () => {
    setIsMinigameActive(true);
    setMinigameScore(0);
    setMinigameTimeLeft(20);
    setActiveTab('minigame');
  };

  // Mini-game timer & falling fruits loop
  useEffect(() => {
    if (!isMinigameActive || minigameTimeLeft <= 0) return;

    const timer = setInterval(() => {
      setMinigameTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsMinigameActive(false);
          const earned = Math.max(10, minigameScore * 3);
          onUpdateStudent((s) => ({ ...s, gems: s.gems + earned }));
          onAddToast(
            '¡Minijuego Terminado!',
            `Atrapaste ${minigameScore} frutas y ganaste +${earned} Gemas para tu mascota.`,
            'success'
          );
          if (student.soundEnabled) playSoundEffect('correct');
          return 0;
        }
        return prev - 1;
      });

      // Spawn falling fruit
      if (Math.random() > 0.3) {
        const fruits = ['🍎', '🍓', '🍉', '🍌', '🍒', '🍊', '⭐'];
        const chosen = fruits[Math.floor(Math.random() * fruits.length)];
        setFallingItems((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            x: Math.floor(Math.random() * 80) + 10,
            y: 0,
            char: chosen,
          },
        ]);
      }

      // Update positions & check catch
      setFallingItems((prev) =>
        prev
          .map((item) => {
            const nextY = item.y + 15;
            if (nextY >= 80 && Math.abs(item.x - minigameBasketX) < 18) {
              setMinigameScore((s) => s + 1);
              if (student.soundEnabled) playSoundEffect('gem');
              return null;
            }
            if (nextY > 100) return null;
            return { ...item, y: nextY };
          })
          .filter(Boolean) as { id: number; x: number; y: number; char: string }[]
      );
    }, 400);

    return () => clearInterval(timer);
  }, [isMinigameActive, minigameTimeLeft, minigameBasketX, minigameScore]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-6 relative overflow-hidden">
      {/* Top Banner & Title with Student Gem Display */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-amber-500 flex items-center justify-center text-3xl shadow-lg shadow-violet-500/30">
              {currentSpecies.avatarEmoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                {isEditingName ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={customNameInput}
                      onChange={(e) => setCustomNameInput(e.target.value)}
                      className="px-2 py-1 bg-slate-950 border border-violet-500 rounded-lg text-white font-bold text-base focus:outline-none focus:ring-1 focus:ring-violet-400"
                      maxLength={18}
                    />
                    <button
                      onClick={handleSaveName}
                      className="px-2.5 py-1 bg-violet-600 text-white rounded-lg text-xs font-bold hover:bg-violet-500"
                    >
                      Guardar
                    </button>
                  </div>
                ) : (
                  <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                    <span>{pet.name}</span>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="text-xs text-slate-400 hover:text-violet-300 font-normal underline"
                    >
                      (Editar nombre)
                    </button>
                  </h3>
                )}
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-violet-950 text-violet-300 border border-violet-800">
                  {currentSpecies.speciesName}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentSpecies.description} · ¡Toca a tu mascota para acariciarla y ver sus reacciones animadas!
              </p>
            </div>
          </div>
        </div>

        {/* Gems Balance & Active Wallpaper indicator */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="px-3.5 py-2 rounded-2xl bg-slate-950 border border-amber-500/40 flex items-center gap-2 shadow-inner">
            <Gem className="w-4 h-4 text-amber-400 fill-amber-400" />
            <div className="text-left">
              <span className="text-[10px] text-slate-400 uppercase font-black block leading-none">
                Tus Gemas
              </span>
              <span className="text-base font-black text-amber-300">{student.gems} 💎</span>
            </div>
          </div>

          <div className="px-3 py-2 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2">
            <span className="text-lg">{activeWallpaper.icon}</span>
            <div className="text-left">
              <span className="text-[10px] text-slate-400 uppercase font-black block leading-none">
                Fondo Activo
              </span>
              <span className="text-xs font-bold text-violet-300 truncate max-w-[110px] block">
                {activeWallpaper.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Sub-Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveTab('care')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'care'
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
              : 'bg-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          <Heart className="w-3.5 h-3.5 text-rose-400" />
          <span>Hábitat & Cuidados</span>
        </button>

        {/* VIP SHOP BUTTON (FEATURED) */}
        <button
          onClick={() => setActiveTab('vip_shop')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'vip_shop'
              ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white shadow-lg shadow-purple-600/30 ring-2 ring-amber-400'
              : 'bg-gradient-to-r from-amber-500/20 via-purple-600/20 to-slate-800 text-amber-300 hover:text-white border border-amber-500/40 hover:scale-102'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
          <span>Tienda VIP de Gemas</span>
          <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
            NUEVO
          </span>
        </button>

        <button
          onClick={() => setActiveTab('rewards')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'rewards'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 font-black'
              : 'bg-slate-800 text-amber-300 hover:text-white'
          }`}
        >
          <Gift className="w-3.5 h-3.5 fill-amber-400" />
          <span>Premios de Supervivencia</span>
        </button>

        <button
          onClick={() => setActiveTab('switch_pet')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'switch_pet'
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
              : 'bg-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          <span>🐾 Mis Criaturas</span>
        </button>

        <button
          onClick={startMinigame}
          className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md hover:scale-105"
        >
          <span>🎮 Minijuego Frutas</span>
        </button>
      </div>

      {/* VIEW 1: HABITAT & CARE (MAIN) */}
      {activeTab === 'care' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Pet Animated Stage (7 cols) */}
          <div
            className={`lg:col-span-7 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between border border-slate-800 bg-gradient-to-b ${currentSpecies.bgGradient} shadow-2xl`}
          >
            {/* Ambient Background Theme Effect */}
            {activeBackgroundId === 'meadow' && (
              <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
            )}
            {activeBackgroundId === 'cyberpunk' && (
              <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#06b6d4_1px,transparent_1px),linear-gradient(to_bottom,#06b6d4_1px,transparent_1px)] [background-size:24px_24px]" />
            )}
            {activeBackgroundId === 'ocean' && (
              <div className="absolute inset-0 pointer-events-none opacity-25 bg-gradient-to-t from-cyan-900/40 via-blue-900/30 to-transparent animate-pulse" />
            )}
            {activeBackgroundId === 'volcano' && (
              <div className="absolute inset-0 pointer-events-none opacity-25 bg-gradient-to-t from-rose-950/60 via-amber-950/30 to-transparent" />
            )}

            {/* Top Badges & Status */}
            <div className="flex items-center justify-between gap-2 z-10">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-bold text-white flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>Nivel {pet.level}</span>
                </span>
                <span className="px-3 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{daysAlive} {daysAlive === 1 ? 'día' : 'días'} con vida</span>
                </span>
              </div>

              {/* Health Gauge Pill */}
              <div
                className={`px-3 py-1 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md border ${
                  isHealthy
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                    : isCritical
                    ? 'bg-rose-950/80 text-rose-300 border-rose-500/50 animate-pulse'
                    : 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isHealthy ? 'fill-emerald-400' : 'fill-rose-400'}`} />
                <span>Salud Vital: {healthPercent}%</span>
              </div>
            </div>

            {/* Central Animated Pet Stage */}
            <div
              onClick={handlePetDirect}
              className="my-8 flex flex-col items-center justify-center relative cursor-pointer select-none group"
              title="¡Haz clic o toca para acariciar a tu mascota!"
            >
              {/* Floating Reaction Particles */}
              {floatingParticles.map((p) => (
                <div
                  key={p.id}
                  className="absolute pointer-events-none text-2xl animate-floatUp z-30 transition-all font-bold"
                  style={{ left: `${p.left}%`, bottom: '40%' }}
                >
                  {p.char}
                </div>
              ))}

              {/* Accessory rendered on top of pet head */}
              <div className="text-4xl mb--3 z-20 transform transition-transform group-hover:scale-125 filter drop-shadow-lg">
                {currentAccessory === 'hat' && '🧙'}
                {currentAccessory === 'crown' && '👑'}
                {currentAccessory === 'glasses' && '🕶️'}
                {currentAccessory === 'ribbon' && '🎀'}
                {currentAccessory === 'cape' && '🦸'}
                {currentAccessory === 'wings' && '🪽'}
                {currentAccessory === 'wand' && '🪄'}
                {currentAccessory === 'helmet' && '🧑‍🚀'}
                {currentAccessory === 'aura' && '🔥'}
              </div>

              {/* Pet Body with CSS animations based on state */}
              <div
                className={`relative flex items-center justify-center transition-all duration-300 transform ${
                  currentAnim === 'idle'
                    ? 'animate-pulse hover:scale-110'
                    : currentAnim === 'eating'
                    ? 'scale-125 animate-bounce'
                    : currentAnim === 'playing'
                    ? 'scale-125 rotate-12 animate-bounce'
                    : currentAnim === 'sleeping'
                    ? 'opacity-85 translate-y-3'
                    : currentAnim === 'bathing'
                    ? 'animate-wiggle scale-110'
                    : currentAnim === 'petting'
                    ? 'scale-125 animate-bounce'
                    : currentAnim === 'trick'
                    ? 'rotate-[360deg] scale-125 transition-transform duration-700'
                    : 'hover:scale-110'
                }`}
              >
                {/* Aura Glow */}
                <div
                  className={`absolute w-36 h-36 rounded-full blur-2xl opacity-40 -z-10 ${
                    isHealthy ? 'bg-amber-400' : isCritical ? 'bg-rose-600' : 'bg-violet-500'
                  }`}
                />

                {/* Pet Emoji Character */}
                <span className="text-8xl sm:text-9xl filter drop-shadow-2xl">
                  {currentAnim === 'sleeping' ? '😴' : currentSpecies.avatarEmoji}
                </span>

                {/* Sub status emoji reaction badge */}
                {currentAnim === 'eating' && (
                  <span className="absolute -top-2 -right-4 text-3xl animate-bounce">🍎</span>
                )}
                {currentAnim === 'bathing' && (
                  <span className="absolute -top-4 -left-4 text-3xl animate-pulse">🫧</span>
                )}
                {currentAnim === 'playing' && (
                  <span className="absolute -bottom-2 -right-4 text-3xl animate-spin">⚽</span>
                )}
                {currentAnim === 'sleeping' && (
                  <span className="absolute -top-6 right-2 text-2xl font-bold text-sky-300 animate-pulse">
                    Zzz...
                  </span>
                )}
                {currentAnim === 'petting' && (
                  <span className="absolute -top-6 text-3xl animate-bounce">💖</span>
                )}
              </div>

              {/* Touch hint */}
              <p className="text-[11px] text-slate-400 mt-4 opacity-75 group-hover:opacity-100 flex items-center gap-1 font-semibold">
                <span>💕 Toca para acariciar y consentir (+Felicidad)</span>
              </p>
            </div>

            {/* Vitality Bars */}
            <div className="space-y-2.5 bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 z-10">
              {/* Hunger */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-bold">
                  <span className="text-amber-300 flex items-center gap-1">
                    <span>🍎 Nutrición / Hambre</span>
                  </span>
                  <span className="text-amber-400">{pet.hunger}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${pet.hunger}%` }}
                  />
                </div>
              </div>

              {/* Happiness */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-bold">
                  <span className="text-rose-300 flex items-center gap-1">
                    <span>💖 Felicidad</span>
                  </span>
                  <span className="text-rose-400">{pet.happiness}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-rose-500 to-pink-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${pet.happiness}%` }}
                  />
                </div>
              </div>

              {/* Energy */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-bold">
                  <span className="text-blue-300 flex items-center gap-1">
                    <span>⚡ Energía</span>
                  </span>
                  <span className="text-blue-400">{pet.energy}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${pet.energy}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Center & Quick Wardrobe (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            {/* Quick Actions List */}
            <div className="space-y-2">
              <h4 className="text-sm font-black text-white flex items-center justify-between">
                <span>Acciones de Cuidado:</span>
                <span className="text-xs text-amber-400 font-bold">Gemas: {student.gems} 💎</span>
              </h4>

              {/* Feed */}
              <button
                onClick={() => handleCareAction('feed', 10, 'Alimentar')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/60 transition-all text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center text-lg border border-amber-500/30">
                    🍎
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white group-hover:text-amber-300">
                      Alimentar con {currentSpecies.favoriteFood}
                    </h5>
                    <p className="text-[11px] text-slate-400">+35 Hambre, +15 Felicidad</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-violet-300 bg-violet-950 px-2 py-1 rounded-lg border border-violet-800">
                  10 💎
                </span>
              </button>

              {/* Play */}
              <button
                onClick={() => handleCareAction('play', 15, 'Jugar')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-rose-500/60 transition-all text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center text-lg border border-rose-500/30">
                    ⚽
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white group-hover:text-rose-300">
                      Jugar a la Pelota Cósmica
                    </h5>
                    <p className="text-[11px] text-slate-400">+30 Felicidad, -15 Energía</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-violet-300 bg-violet-950 px-2 py-1 rounded-lg border border-violet-800">
                  15 💎
                </span>
              </button>

              {/* Sleep */}
              <button
                onClick={() => handleCareAction('sleep', 5, 'Siesta')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-emerald-500/60 transition-all text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-lg border border-emerald-500/30">
                    💤
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white group-hover:text-emerald-300">
                      Siesta Bajo las Estrellas
                    </h5>
                    <p className="text-[11px] text-slate-400">+45 Energía Reparadora</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-violet-300 bg-violet-950 px-2 py-1 rounded-lg border border-violet-800">
                  5 💎
                </span>
              </button>

              {/* Bath */}
              <button
                onClick={() => handleCareAction('bath', 20, 'Baño de Burbujas')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-blue-500/60 transition-all text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center text-lg border border-blue-500/30">
                    🫧
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white group-hover:text-blue-300">
                      Baño de Burbujas Mágicas
                    </h5>
                    <p className="text-[11px] text-slate-400">+20 Felicidad, Sube de Nivel</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-violet-300 bg-violet-950 px-2 py-1 rounded-lg border border-violet-800">
                  20 💎
                </span>
              </button>

              {/* Trick */}
              <button
                onClick={() => handleCareAction('trick', 25, 'Entrenar Truco')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-fuchsia-500/60 transition-all text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-fuchsia-500/20 text-fuchsia-300 flex items-center justify-center text-lg border border-fuchsia-500/30">
                    🎪
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white group-hover:text-fuchsia-300">
                      Entrenar Nuevo Truco Acrobático
                    </h5>
                    <p className="text-[11px] text-slate-400">
                      Aprende trucos · {tricksKnown.length} dominados
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-violet-300 bg-violet-950 px-2 py-1 rounded-lg border border-violet-800">
                  25 💎
                </span>
              </button>
            </div>

            {/* Quick Accessory Wardrobe */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-slate-300">Accesorios Disponibles:</h5>
                <button
                  onClick={() => {
                    setActiveTab('vip_shop');
                    setShopCategory('accessories');
                  }}
                  className="text-[10px] text-amber-400 hover:underline font-bold"
                >
                  Ver Tienda VIP +
                </button>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {AVAILABLE_ACCESSORIES.filter(
                  (acc) => unlockedAccessories.includes(acc.id) || acc.price === 0
                ).map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => handleEquipAccessory(acc.id)}
                    className={`p-1.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                      currentAccessory === acc.id
                        ? 'bg-violet-950 border-violet-400 text-white font-bold ring-1 ring-violet-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="text-base">{acc.icon}</span>
                    <span className="text-[8px] mt-0.5 truncate w-full">{acc.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: TIENDA VIP DE GEMAS (FEATURED REQUEST) */}
      {activeTab === 'vip_shop' && (
        <div className="space-y-6">
          {/* Shop Hero Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/60 via-purple-950/60 to-rose-950/60 border-2 border-amber-500/50 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-2 max-w-xl z-10">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider">
                  Tienda VIP Exclusiva
                </span>
                <span className="text-xs text-amber-300">¡Gasta tus gemas acumuladas!</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Bazar Mágico de Mascotas & Fondos VIP
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Desbloquea nuevas especies de criaturas míticas, viste a tu mascota con accesorios de lujo
                y personaliza todo tu panel educativo con fondos animados resplandecientes.
              </p>
            </div>

            <div className="px-6 py-4 bg-slate-950/90 rounded-2xl border-2 border-amber-400/80 shadow-2xl text-center z-10 shrink-0">
              <span className="text-[11px] font-black uppercase text-slate-400 block">Gemas Disponibles</span>
              <span className="text-2xl sm:text-3xl font-black text-amber-300 flex items-center justify-center gap-1.5 mt-0.5">
                <Gem className="w-6 h-6 fill-amber-400 text-amber-400" />
                <span>{student.gems}</span>
              </span>
            </div>
          </div>

          {/* Shop Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
            <button
              onClick={() => setShopCategory('species')}
              className={`flex-1 py-2 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
                shopCategory === 'species'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🐾 Nuevas Especies de Mascotas ({PET_SPECIES.length})</span>
            </button>

            <button
              onClick={() => setShopCategory('accessories')}
              className={`flex-1 py-2 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
                shopCategory === 'accessories'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>👑 Accesorios Exclusivos ({AVAILABLE_ACCESSORIES.length})</span>
            </button>

            <button
              onClick={() => setShopCategory('backgrounds')}
              className={`flex-1 py-2 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
                shopCategory === 'backgrounds'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🌌 Fondos Animados para Panel ({VIP_WALLPAPERS.length})</span>
            </button>
          </div>

          {/* CATEGORY 1: VIP SPECIES */}
          {shopCategory === 'species' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <span>Criaturas Míticas & Especies Legendarias</span>
                </h4>
                <span className="text-xs text-slate-400">
                  {unlockedPets.length} de {PET_SPECIES.length} desbloqueadas
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {PET_SPECIES.map((species) => {
                  const isUnlocked = unlockedPets.includes(species.type) || species.gemPrice === 0;
                  const isCurrent = pet.type === species.type;
                  const canAfford = student.gems >= species.gemPrice;

                  return (
                    <div
                      key={species.type}
                      className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-gradient-to-b from-violet-950/80 to-slate-900 border-violet-400 ring-2 ring-violet-400/40 shadow-xl'
                          : isUnlocked
                          ? 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                          : 'bg-slate-950/90 border-slate-800/80 hover:border-amber-500/50'
                      }`}
                    >
                      <div>
                        {/* Avatar & Element */}
                        <div className="flex items-center justify-between text-4xl mb-3">
                          <span className="transform transition-transform hover:scale-125 block">
                            {species.avatarEmoji}
                          </span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800">
                            {species.element}
                          </span>
                        </div>

                        <h5 className="text-base font-black text-white">{species.speciesName}</h5>
                        <p className="text-xs text-violet-300 font-semibold mt-0.5">
                          Nombre: {species.defaultName}
                        </p>
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed">{species.description}</p>

                        <div className="mt-3 space-y-1 text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                          <p>
                            🍽️ <strong>Comida:</strong> {species.favoriteFood}
                          </p>
                          <p>
                            ✨ <strong>Habilidad:</strong> {species.specialSkill}
                          </p>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="mt-4 pt-3 border-t border-slate-800">
                        {isCurrent ? (
                          <span className="block text-center py-2 bg-emerald-950 text-emerald-300 font-bold text-xs rounded-xl border border-emerald-800">
                            ✓ Compañero Activo
                          </span>
                        ) : isUnlocked ? (
                          <button
                            onClick={() => handleSwitchPet(species)}
                            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all hover:scale-102 flex items-center justify-center gap-1.5"
                          >
                            <span>Elegir como Compañero</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBuyVipSpecies(species)}
                            disabled={!canAfford}
                            className={`w-full py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md ${
                              canAfford
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:scale-102 shadow-amber-500/20 animate-pulse'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            <Gem className="w-3.5 h-3.5 fill-current" />
                            <span>Desbloquear por {species.gemPrice} Gemas</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CATEGORY 2: VIP ACCESSORIES */}
          {shopCategory === 'accessories' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <span>Accesorios Exclusivos para lucir en tu Mascota</span>
                </h4>
                <span className="text-xs text-slate-400">
                  {unlockedAccessories.length} de {AVAILABLE_ACCESSORIES.length} desbloqueados
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                {AVAILABLE_ACCESSORIES.map((acc) => {
                  const isUnlocked = unlockedAccessories.includes(acc.id) || acc.price === 0;
                  const isEquipped = currentAccessory === acc.id;
                  const canAfford = student.gems >= acc.price;

                  return (
                    <div
                      key={acc.id}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between text-center ${
                        isEquipped
                          ? 'bg-violet-950/80 border-violet-400 ring-2 ring-violet-400/40 shadow-xl'
                          : isUnlocked
                          ? 'bg-slate-950/80 border-slate-800'
                          : 'bg-slate-950 border-slate-800/80 hover:border-amber-500/40'
                      }`}
                    >
                      <div>
                        <div className="text-4xl my-2 filter drop-shadow">{acc.icon}</div>
                        <h6 className="text-xs font-black text-white">{acc.label}</h6>
                        <p className="text-[10px] text-slate-400 mt-0.5">{acc.description}</p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800">
                        {isEquipped ? (
                          <span className="block text-center py-1 bg-violet-900 text-violet-200 text-[10px] font-bold rounded-lg">
                            ✓ Equipado
                          </span>
                        ) : isUnlocked ? (
                          <button
                            onClick={() => handleEquipAccessory(acc.id)}
                            className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] rounded-lg transition-all"
                          >
                            Equipar
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBuyVipAccessory(acc)}
                            disabled={!canAfford}
                            className={`w-full py-1.5 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-1 ${
                              canAfford
                                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            <Gem className="w-3 h-3 fill-current" />
                            <span>{acc.price} 💎</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CATEGORY 3: VIP ANIMATED BACKGROUNDS FOR PERSONAL PANEL */}
          {shopCategory === 'backgrounds' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h4 className="text-sm font-black text-cyan-300 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    <span>Fondos Animados Especiales para tu Panel Personal</span>
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Al desbloquear un fondo, transforma la apariencia de todo tu panel de estudiante y el
                    hábitat de tu mascota con efectos ambientales únicos.
                  </p>
                </div>
                <span className="text-xs font-bold text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded-xl border border-cyan-800">
                  {unlockedBackgrounds.length} de {VIP_WALLPAPERS.length} desbloqueados
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {VIP_WALLPAPERS.map((wall) => {
                  const isUnlocked = unlockedBackgrounds.includes(wall.id) || wall.price === 0;
                  const isActive = activeBackgroundId === wall.id;
                  const canAfford = student.gems >= wall.price;

                  return (
                    <div
                      key={wall.id}
                      className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                        isActive
                          ? 'bg-slate-950 border-cyan-400 ring-2 ring-cyan-400/40 shadow-xl'
                          : isUnlocked
                          ? 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                          : 'bg-slate-950 border-slate-800/80 hover:border-amber-500/50'
                      }`}
                    >
                      <div>
                        {/* Wallpaper Visual Preview Card */}
                        <div
                          className={`h-24 rounded-xl bg-gradient-to-br ${wall.previewGradient} border border-slate-700/60 p-3 flex flex-col justify-between relative overflow-hidden shadow-inner mb-3`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-2xl">{wall.icon}</span>
                            {isActive && (
                              <span className="px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow">
                                <Check className="w-3 h-3" /> Activo en tu Panel
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-black text-white/90 drop-shadow">
                            Efecto Ambiental Dinámico
                          </span>
                        </div>

                        <h5 className="text-base font-black text-white">{wall.name}</h5>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{wall.description}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800">
                        {isActive ? (
                          <span className="block text-center py-2 bg-cyan-950 text-cyan-300 font-bold text-xs rounded-xl border border-cyan-800">
                            ✓ Activo en tu Panel Personal
                          </span>
                        ) : isUnlocked ? (
                          <button
                            onClick={() => handleSelectWallpaper(wall)}
                            className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl transition-all shadow-md hover:scale-102 flex items-center justify-center gap-1.5"
                          >
                            <span>Aplicar a mi Panel Personal</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSelectWallpaper(wall)}
                            disabled={!canAfford}
                            className={`w-full py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md ${
                              canAfford
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:scale-102 shadow-amber-500/20 animate-pulse'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            <Gem className="w-3.5 h-3.5 fill-current" />
                            <span>Desbloquear por {wall.price} Gemas</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: RECOMPENSAS DE SUPERVIVENCIA */}
      {activeTab === 'rewards' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/50 via-slate-900 to-indigo-950/50 border border-amber-500/30 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h4 className="text-base font-black text-amber-300 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>Salón de Premios por Supervivencia</span>
              </h4>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                ¡Mantén viva y saludable a tu criatura mágica para desbloquear cofres con decenas de gemas
                adicionales y medallas legendarias!
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center px-4 py-2 bg-slate-950/80 rounded-xl border border-amber-500/40">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Salud Actual</span>
                <span className="text-lg font-black text-amber-300">{healthPercent}%</span>
              </div>
              <div className="text-center px-4 py-2 bg-slate-950/80 rounded-xl border border-emerald-500/40">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Días Vivo</span>
                <span className="text-lg font-black text-emerald-300">{daysAlive} d</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {SURVIVAL_MILESTONES.map((m) => {
              const isClaimed = claimedMilestones.includes(m.id);
              let isEligible = true;
              if (m.requiredHealth && healthPercent < m.requiredHealth) isEligible = false;
              if (m.requiredDays && daysAlive < m.requiredDays) isEligible = false;
              if (m.requiredLevel && pet.level < m.requiredLevel) isEligible = false;
              if (m.requiredTricks && tricksKnown.length < m.requiredTricks) isEligible = false;

              return (
                <div
                  key={m.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isClaimed
                      ? 'bg-slate-950/50 border-emerald-900/60 opacity-80'
                      : isEligible
                      ? 'bg-gradient-to-br from-amber-950/40 to-slate-900 border-amber-500/80 ring-2 ring-amber-500/30 shadow-xl'
                      : 'bg-slate-950/80 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-xl font-bold border border-amber-500/30">
                        {isClaimed ? '✅' : '🎁'}
                      </div>
                      <div>
                        <h5 className="text-sm font-black text-white">{m.title}</h5>
                        <p className="text-xs text-slate-400 mt-0.5">{m.description}</p>
                        <span className="inline-block mt-1 text-[11px] font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-800">
                          Insignia: {m.badge}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-amber-400 block">+{m.gemReward}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Gemas</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {isClaimed ? 'Recompensa ya entregada' : isEligible ? '¡Meta alcanzada!' : 'En progreso'}
                    </span>

                    {isClaimed ? (
                      <span className="px-3 py-1 bg-emerald-950 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-800 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Reclamado
                      </span>
                    ) : (
                      <button
                        onClick={() => handleClaimMilestone(m)}
                        disabled={!isEligible}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                          isEligible
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg hover:scale-105 animate-pulse'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Gift className="w-3.5 h-3.5" />
                        <span>Reclamar Premio</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 4: SWITCH PET (MIS CRIATURAS DESBLOQUEADAS) */}
      {activeTab === 'switch_pet' && (
        <div className="space-y-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h4 className="text-base font-black text-white">Santuario de Mis Mascotas Desbloqueadas</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Selecciona cuál de tus criaturas te acompañará hoy. ¡Desbloquea más en la Tienda VIP!
              </p>
            </div>
            <button
              onClick={() => {
                setActiveTab('vip_shop');
                setShopCategory('species');
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400"
            >
              + Desbloquear Nuevas Especies
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PET_SPECIES.filter(
              (species) => unlockedPets.includes(species.type) || species.gemPrice === 0
            ).map((species) => {
              const isCurrent = pet.type === species.type;
              return (
                <div
                  key={species.type}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-violet-950/80 border-violet-400 ring-2 ring-violet-400/40 shadow-xl'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-4xl mb-3">
                      <span>{species.avatarEmoji}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800">
                        {species.element}
                      </span>
                    </div>

                    <h5 className="text-base font-black text-white">{species.speciesName}</h5>
                    <p className="text-xs text-violet-300 font-semibold mt-0.5">
                      Nombre por defecto: {species.defaultName}
                    </p>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{species.description}</p>

                    <div className="mt-3 space-y-1 text-[11px] text-slate-300 bg-slate-900/50 p-2 rounded-xl">
                      <p>
                        🍽️ <strong>Comida:</strong> {species.favoriteFood}
                      </p>
                      <p>
                        ✨ <strong>Habilidad:</strong> {species.specialSkill}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800">
                    {isCurrent ? (
                      <span className="block text-center py-2 bg-emerald-950 text-emerald-300 font-bold text-xs rounded-xl border border-emerald-800">
                        ✓ Compañero Activo
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSwitchPet(species)}
                        className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl shadow-md transition-all hover:scale-102"
                      >
                        Activar a {species.defaultName}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 5: MINIJUEGO ("ATRAPA LAS FRUTAS CÓSMICAS") */}
      {activeTab === 'minigame' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
            <div>
              <h4 className="text-base font-black text-white flex items-center gap-2">
                <span>🍎 Atrapa las Frutas Cósmicas con {pet.name}</span>
              </h4>
              <p className="text-xs text-slate-400">
                Usa los botones o flechas para mover la canasta y alimentar a tu mascota mientras caen del cielo.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-300">
                Puntos: {minigameScore} 🍎
              </span>
              <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-rose-300">
                Tiempo: {minigameTimeLeft}s
              </span>
            </div>
          </div>

          {/* Minigame Canvas Area */}
          <div className="relative h-64 bg-slate-950 rounded-2xl border-2 border-violet-800/60 overflow-hidden select-none">
            {/* Falling items */}
            {fallingItems.map((item) => (
              <div
                key={item.id}
                className="absolute text-2xl transition-all"
                style={{ left: `${item.x}%`, top: `${item.y}%` }}
              >
                {item.char}
              </div>
            ))}

            {/* Basket & Pet at bottom */}
            <div
              className="absolute bottom-2 transform -translate-x-1/2 flex flex-col items-center transition-all duration-75"
              style={{ left: `${minigameBasketX}%` }}
            >
              <span className="text-3xl animate-bounce">{currentSpecies.avatarEmoji}</span>
              <div className="w-16 h-6 rounded-b-xl bg-amber-700 border-2 border-amber-400 shadow-xl flex items-center justify-center text-[10px] text-white font-bold">
                🧺
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setMinigameBasketX((prev) => Math.max(10, prev - 15))}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 text-sm"
            >
              ◀ Izquierda
            </button>
            <button
              onClick={() => setMinigameBasketX((prev) => Math.min(90, prev + 15))}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 text-sm"
            >
              Derecha ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
