import {
  Client,
  TimeEntry,
  Invoice,
  LearningMission,
  StudentProfile,
  VirtualPet,
  AcademicRecord,
  StudentAccount,
} from '../types';
import { ALL_100_ALTERNATED_GAMES } from './combinedGamesData';

export const INITIAL_CLIENTS: Client[] = [
  { id: 'c1', name: 'Laura Martínez', email: 'laura@acme.com', company: 'Acme Design Corp', hourlyRate: 65, currency: 'USD' },
  { id: 'c2', name: 'Carlos Gómez', email: 'carlos@techsoft.io', company: 'TechSoft Solutions', hourlyRate: 80, currency: 'USD' },
  { id: 'c3', name: 'Elena Rostova', email: 'elena@creative.net', company: 'Creative Agency', hourlyRate: 50, currency: 'EUR' }
];

export const INITIAL_TIME_ENTRIES: TimeEntry[] = [
  { id: 't1', clientId: 'c1', description: 'Rediseño de Landing Page en Figma', durationMinutes: 180, hourlyRate: 65, isBilled: false, createdAt: '2026-08-15T10:00:00Z' },
  { id: 't2', clientId: 'c2', description: 'Integración API Stripe y Middleware', durationMinutes: 240, hourlyRate: 80, isBilled: true, createdAt: '2026-08-16T14:30:00Z' },
  { id: 't3', clientId: 'c1', description: 'Ajustes UX Mobile y Pruebas', durationMinutes: 90, hourlyRate: 65, isBilled: false, createdAt: '2026-08-17T09:15:00Z' }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-101',
    invoiceNumber: 'INV-2026-001',
    clientId: 'c2',
    clientName: 'TechSoft Solutions',
    issueDate: '2026-08-01',
    dueDate: '2026-08-15',
    subtotal: 320,
    taxRate: 16,
    taxAmount: 51.20,
    total: 371.20,
    status: 'paid',
    items: [
      { id: 'itm-1', description: 'Integración API Stripe y Middleware (4 hrs @ $80/hr)', quantity: 4, unitPrice: 80, amount: 320 }
    ]
  },
  {
    id: 'inv-102',
    invoiceNumber: 'INV-2026-002',
    clientId: 'c1',
    clientName: 'Acme Design Corp',
    issueDate: '2026-08-10',
    dueDate: '2026-08-25',
    subtotal: 195,
    taxRate: 16,
    taxAmount: 31.20,
    total: 226.20,
    status: 'sent',
    items: [
      { id: 'itm-2', description: 'Rediseño de Landing Page en Figma (3 hrs @ $65/hr)', quantity: 3, unitPrice: 65, amount: 195 }
    ]
  }
];

export const INITIAL_STUDENT_PROFILE: StudentProfile = {
  name: 'Mateo González',
  age: 7,
  avatar: '🚀',
  gems: 145,
  streakDays: 5,
  lastActiveDate: '2026-09-29',
  dailyScreenTimeLimitMinutes: 20,
  screenTimeUsedMinutes: 8,
  tutorPersona: 'lumi',
  voiceEnabled: true,
  soundEnabled: true,
  arcadeTimeSecondsRemaining: 60, // 1 minuto de tiempo de juego de recreo
  pin: '1234',
  panelBackground: 'nebula',
};

export const INITIAL_VIRTUAL_PET: VirtualPet = {
  name: 'Ignis',
  type: 'dragon',
  level: 3,
  hunger: 80,
  happiness: 90,
  energy: 85,
  health: 88,
  lastFed: 'Hace 30 minutos',
  favoriteFood: 'Fruta Estelar Solar 🍎',
  accessory: 'hat',
  daysAlive: 2,
  isAlive: true,
  survivalMinutes: 48,
  tricksKnown: ['Saludar 🐾', 'Giro 360° 🔄'],
  claimedMilestones: [],
  habitatBackground: 'nebula',
  unlockedPets: ['dragon', 'dog', 'cat'],
  unlockedAccessories: ['none', 'hat'],
  unlockedBackgrounds: ['nebula'],
};

export const INITIAL_LEARNING_MISSIONS: LearningMission[] = ALL_100_ALTERNATED_GAMES;

export const INITIAL_ACADEMIC_RECORDS: AcademicRecord[] = [
  {
    id: 'rec-01',
    studentName: 'Mateo González',
    subject: 'Matemáticas',
    activityName: 'La Cosecha de Manzanas (Sumas)',
    score: 100,
    status: 'completado',
    gemsEarned: 15,
    date: '2026-09-29',
    tutorFeedback: '¡Excelente razonamiento visual! Contó las manzanas con paciencia y respondió al primer intento.',
  },
  {
    id: 'rec-02',
    studentName: 'Mateo González',
    subject: 'Lectura y Fonética',
    activityName: 'El Secreto de "GATO"',
    score: 95,
    status: 'completado',
    gemsEarned: 15,
    date: '2026-09-28',
    tutorFeedback: 'Identificó el fonema /A/ tras la guía socrática de pronunciación con boca abierta.',
  },
  {
    id: 'rec-03',
    studentName: 'Sofía Valdés',
    subject: 'Matemáticas',
    activityName: 'Flotas Espaciales (3 × 4)',
    score: 85,
    status: 'en_progreso',
    gemsEarned: 10,
    date: '2026-09-27',
    tutorFeedback: 'Comprendió el concepto de suma repetida (4+4+4) usando el mapa visual de cajitas.',
  },
  {
    id: 'rec-04',
    studentName: 'Lucas Mendoza',
    subject: 'Escritura y Caligrafía',
    activityName: 'Trazo de la Letra "S"',
    score: 90,
    status: 'completado',
    gemsEarned: 20,
    date: '2026-09-26',
    tutorFeedback: 'Mejora notable en el control motriz fino en pantalla táctil con soporte háptico/visual.',
  },
  {
    id: 'rec-05',
    studentName: 'Emma Morales',
    subject: 'Lectura y Fonética',
    activityName: 'Construyendo "LUNA"',
    score: 75,
    status: 'pendiente_revision',
    gemsEarned: 0,
    date: '2026-09-25',
    tutorFeedback: 'Requiere reforzar el sonido de la vocal /U/ mediante canciones fonéticas cortas.',
  },
];

export const INITIAL_STUDENT_ACCOUNTS: StudentAccount[] = [
  {
    id: 'student-mateo',
    name: 'Mateo González',
    pin: '1234',
    avatar: '🚀',
    age: 7,
    profile: INITIAL_STUDENT_PROFILE,
    pet: INITIAL_VIRTUAL_PET,
    missions: ALL_100_ALTERNATED_GAMES,
    records: INITIAL_ACADEMIC_RECORDS,
  },
  {
    id: 'student-sofia',
    name: 'Sofía Ramos',
    pin: '2222',
    avatar: '🦄',
    age: 8,
    profile: {
      name: 'Sofía Ramos',
      age: 8,
      avatar: '🦄',
      gems: 190,
      streakDays: 7,
      lastActiveDate: '2026-09-30',
      dailyScreenTimeLimitMinutes: 25,
      screenTimeUsedMinutes: 5,
      tutorPersona: 'lumi',
      voiceEnabled: true,
      soundEnabled: true,
      arcadeTimeSecondsRemaining: 60,
      pin: '2222',
    },
    pet: {
      name: 'Luna',
      type: 'cat',
      level: 4,
      hunger: 90,
      happiness: 95,
      energy: 80,
      health: 92,
      lastFed: 'Hace 10 minutos',
      favoriteFood: 'Pescado Nebular 🐟',
      accessory: 'crown',
      daysAlive: 3,
      isAlive: true,
      survivalMinutes: 65,
      tricksKnown: ['Saludar 🐾', 'Danza Cósmica 💃'],
      claimedMilestones: ['mile-1'],
    },
    missions: ALL_100_ALTERNATED_GAMES.map((m, i) =>
      i < 6 ? { ...m, completed: true, stars: 3 } : m
    ),
    records: [
      {
        id: 'rec-sofia-01',
        studentName: 'Sofía Ramos',
        subject: 'Matemáticas',
        activityName: 'Suma de Estrellas Fugaces',
        score: 100,
        status: 'completado',
        gemsEarned: 20,
        date: '2026-09-30',
        tutorFeedback: '¡Increíble rapidez de cálculo mental!',
      },
    ],
  },
  {
    id: 'student-lucas',
    name: 'Lucas Silva',
    pin: '3333',
    avatar: '🦁',
    age: 6,
    profile: {
      name: 'Lucas Silva',
      age: 6,
      avatar: '🦁',
      gems: 120,
      streakDays: 3,
      lastActiveDate: '2026-09-30',
      dailyScreenTimeLimitMinutes: 20,
      screenTimeUsedMinutes: 10,
      tutorPersona: 'lumi',
      voiceEnabled: true,
      soundEnabled: true,
      arcadeTimeSecondsRemaining: 60,
      pin: '3333',
    },
    pet: {
      name: 'Astro',
      type: 'dog',
      level: 2,
      hunger: 75,
      happiness: 80,
      energy: 85,
      health: 82,
      lastFed: 'Hace 1 hora',
      favoriteFood: 'Hueso de Meteorito 🦴',
      accessory: 'glasses',
      daysAlive: 1,
      isAlive: true,
      survivalMinutes: 30,
      tricksKnown: ['Saludar 🐾'],
      claimedMilestones: [],
    },
    missions: ALL_100_ALTERNATED_GAMES.map((m, i) =>
      i < 3 ? { ...m, completed: true, stars: 2 } : m
    ),
    records: [
      {
        id: 'rec-lucas-01',
        studentName: 'Lucas Silva',
        subject: 'Trazos y Grafomotricidad',
        activityName: 'El Laberinto del Ratón',
        score: 95,
        status: 'completado',
        gemsEarned: 15,
        date: '2026-09-30',
        tutorFeedback: '¡Gran precisión motriz y paciencia!',
      },
    ],
  },
];
