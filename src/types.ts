export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  hourlyRate: number;
  currency: string;
}

export interface TimeEntry {
  id: string;
  clientId: string;
  description: string;
  durationMinutes: number;
  hourlyRate: number;
  isBilled: boolean;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  items: InvoiceItem[];
}

export type TabType = 'dashboard' | 'operations' | 'records' | 'settings';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

// Domain Types for Educational & Gamification Platform
export type SubjectType = 'reading' | 'math' | 'tracing' | 'arcade' | 'grammar';

export type MissionDifficulty = 'facil' | 'medio' | 'avanzado';

export type ArcadeGameType =
  | 'memory'
  | 'bubble_pop'
  | 'space_runner'
  | 'whack'
  | 'pet_care'
  | 'animal_piano'
  | 'simon_sound'
  | 'shape_sorter'
  | 'apple_catcher'
  | 'puzzle_slider'
  | 'galaxia'
  | 'granja'
  | 'bombas'
  | 'laberinto'
  | 'sopa_letras'
  | 'domino'
  | 'autos'
  | 'motos'
  | 'tetris';

export type AdvancedGameId =
  | 'galaxia'
  | 'granja'
  | 'bombas'
  | 'laberinto'
  | 'sopa_letras'
  | 'domino'
  | 'autos'
  | 'motos'
  | 'tetris';

export interface LearningMission {
  id: string;
  title: string;
  subject: SubjectType;
  level: number;
  worldNumber?: number; // 1 to 5
  worldName?: string;
  category: string;
  description: string;
  gemReward: number;
  xpReward: number;
  completed: boolean;
  stars: number; // 0 to 3
  difficulty: MissionDifficulty;
  question: string;
  arcadeType?: ArcadeGameType;
  visualData?: {
    itemType?: 'apple' | 'star' | 'rocket' | 'cookie' | 'balloon' | 'gem' | 'pizza' | 'frog' | 'dino' | 'pencil';
    count1?: number;
    count2?: number;
    operator?: '+' | '-' | 'x' | '/';
    options?: (string | number)[];
    correctAnswer: string | number;
    missingWord?: string;
    targetLetter?: string;
    traceChar?: string;
    rhymePair?: string;
    shapeType?: string;
  };
  socraticHint: string;
}

export interface TutorMessage {
  id: string;
  sender: 'tutor' | 'student';
  text: string;
  timestamp: string;
  isAudioAvailable?: boolean;
}

export type PetType =
  | 'dragon'
  | 'dog'
  | 'cat'
  | 'axolotl'
  | 'panda'
  | 'phoenix'
  | 'fox'
  | 'owl'
  | 'unicorn'
  | 'lion'
  | 'shadow_dragon'
  | 'kitsune'
  | 'robot';

export interface PetMilestone {
  id: string;
  title: string;
  description: string;
  gemReward: number;
  badge: string;
  requiredDays?: number;
  requiredHealth?: number;
  requiredLevel?: number;
  requiredTricks?: number;
}

export interface VirtualPet {
  name: string;
  type: PetType;
  level: number;
  hunger: number; // 0 to 100 (100 = full)
  happiness: number; // 0 to 100
  energy: number; // 0 to 100
  health?: number; // 0 to 100 (overall vitality)
  lastFed: string;
  favoriteFood: string;
  accessory?: 'none' | 'hat' | 'crown' | 'glasses' | 'ribbon' | 'cape' | 'wings' | 'wand' | 'helmet' | 'aura' | string;
  survivalMinutes?: number;
  daysAlive?: number;
  isAlive?: boolean;
  tricksKnown?: string[];
  claimedMilestones?: string[];
  habitatBackground?: string; // e.g. 'nebula' | 'meadow' | 'cyberpunk' | 'ocean' | 'castle' | 'volcano'
  unlockedPets?: string[]; // IDs of purchased VIP species
  unlockedAccessories?: string[]; // IDs of purchased VIP accessories
  unlockedBackgrounds?: string[]; // IDs of purchased VIP habitat wallpapers
}

export interface StudentProfile {
  name: string;
  age: number;
  avatar: string;
  gems: number;
  streakDays: number;
  lastActiveDate: string;
  dailyScreenTimeLimitMinutes: number;
  screenTimeUsedMinutes: number;
  tutorPersona: 'lumi' | 'rex' | 'astra';
  voiceEnabled: boolean;
  soundEnabled: boolean;
  arcadeTimeSecondsRemaining?: number; // Minutes/seconds bought with gems
  pin?: string; // Clave simple numérica de 4 dígitos
  panelBackground?: string; // ID del fondo animado para su panel personal ('nebula' | 'meadow' | 'cyberpunk' | 'ocean' | 'castle' | 'volcano')
}

export interface StudentAccount {
  id: string;
  name: string;
  pin: string; // Clave simple (ej: "1234")
  avatar: string;
  age: number;
  profile: StudentProfile;
  pet: VirtualPet;
  missions: LearningMission[];
  records: AcademicRecord[];
}

export interface AcademicRecord {
  id: string;
  studentName: string;
  subject: string;
  activityName: string;
  score: number; // 0 - 100
  status: 'completado' | 'en_progreso' | 'pendiente_revision';
  gemsEarned: number;
  date: string;
  tutorFeedback: string;
}
