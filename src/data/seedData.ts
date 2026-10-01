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
  name: '',
  age: 6,
  avatar: '🌟',
  gems: 0,
  streakDays: 0,
  lastActiveDate: '',
  dailyScreenTimeLimitMinutes: 25,
  screenTimeUsedMinutes: 0,
  tutorPersona: 'lumi',
  voiceEnabled: true,
  soundEnabled: true,
  arcadeTimeSecondsRemaining: 60,
  pin: '1234',
  panelBackground: 'nebula',
};

export const INITIAL_VIRTUAL_PET: VirtualPet = {
  name: 'Sparky',
  type: 'dragon',
  level: 1,
  hunger: 80,
  happiness: 85,
  energy: 90,
  health: 90,
  lastFed: 'Hoy',
  favoriteFood: 'Fruta Estelar Solar 🍎',
  accessory: 'none',
  daysAlive: 1,
  isAlive: true,
  survivalMinutes: 10,
  tricksKnown: ['Saludar 🐾'],
  claimedMilestones: [],
  habitatBackground: 'nebula',
  unlockedPets: ['dragon', 'dog', 'cat'],
  unlockedAccessories: ['none', 'hat'],
  unlockedBackgrounds: ['nebula'],
};

export const INITIAL_LEARNING_MISSIONS: LearningMission[] = ALL_100_ALTERNATED_GAMES;

export const INITIAL_ACADEMIC_RECORDS: AcademicRecord[] = [];

export const INITIAL_STUDENT_ACCOUNTS: StudentAccount[] = [];

