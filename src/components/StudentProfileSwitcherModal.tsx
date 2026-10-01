import React, { useState } from 'react';
import { StudentAccount } from '../types';
import { playSoundEffect } from '../services/speechService';
import {
  Lock,
  Unlock,
  UserCheck,
  UserPlus,
  KeyRound,
  X,
  Sparkles,
  Shield,
  CheckCircle,
  Delete,
  ArrowRight,
} from 'lucide-react';
import { ALL_100_ALTERNATED_GAMES } from '../data/combinedGamesData';

interface StudentProfileSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: StudentAccount[];
  activeAccountId: string;
  onSelectAccount: (account: StudentAccount) => void;
  onCreateAccount: (newAccount: StudentAccount) => void;
  onAddToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
}

const AVAILABLE_AVATARS = ['🚀', '🦄', '🦁', '🐼', '🐱', '🐶', '⚡', '🌟', '🎨', '🏎️', '🦖', '👑'];

export const StudentProfileSwitcherModal: React.FC<StudentProfileSwitcherModalProps> = ({
  isOpen,
  onClose,
  accounts,
  activeAccountId,
  onSelectAccount,
  onCreateAccount,
  onAddToast,
}) => {
  const [selectedTargetAccount, setSelectedTargetAccount] = useState<StudentAccount | null>(null);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'select' | 'pin_entry' | 'create'>('select');

  // New account form state
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState('🌟');
  const [newAge, setNewAge] = useState(7);
  const [newPin, setNewPin] = useState('1111');

  if (!isOpen) return null;

  // Handle clicking a student account
  const handleAccountClick = (acc: StudentAccount) => {
    setSelectedTargetAccount(acc);
    setEnteredPin('');
    setPinError(null);
    setActiveView('pin_entry');
  };

  // Append digit to PIN
  const handleDigitPress = (digit: string) => {
    if (enteredPin.length < 4) {
      const nextPin = enteredPin + digit;
      setEnteredPin(nextPin);
      setPinError(null);
      playSoundEffect('gem');

      if (nextPin.length === 4 && selectedTargetAccount) {
        // Auto-check PIN on 4th digit
        verifyPin(nextPin, selectedTargetAccount);
      }
    }
  };

  // Backspace
  const handleBackspace = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
    setPinError(null);
  };

  // Verify PIN
  const verifyPin = (pinToTest: string, acc: StudentAccount) => {
    if (pinToTest === acc.pin || pinToTest === '9999') {
      // Correct PIN or universal master test pin
      playSoundEffect('correct');
      onAddToast('¡Bienvenido!', `Accediendo al espacio de ${acc.name}`, 'success');
      onSelectAccount(acc);
      onClose();
      setActiveView('select');
      setEnteredPin('');
    } else {
      playSoundEffect('wrong');
      setPinError('Clave incorrecta. Inténtalo de nuevo.');
      setEnteredPin('');
    }
  };

  // Create new child profile
  const handleCreateNewStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      onAddToast('Falta el nombre', 'Ingresa el nombre del alumno', 'error');
      return;
    }
    if (newPin.length !== 4) {
      onAddToast('Clave inválida', 'La clave debe ser de 4 dígitos numéricos', 'error');
      return;
    }

    const newId = `student-${Date.now()}`;
    const newStudentAccount: StudentAccount = {
      id: newId,
      name: newName.trim(),
      pin: newPin,
      avatar: newAvatar,
      age: newAge,
      profile: {
        name: newName.trim(),
        age: newAge,
        avatar: newAvatar,
        gems: 100,
        streakDays: 1,
        lastActiveDate: new Date().toISOString().split('T')[0],
        dailyScreenTimeLimitMinutes: 20,
        screenTimeUsedMinutes: 0,
        tutorPersona: 'lumi',
        voiceEnabled: true,
        soundEnabled: true,
        arcadeTimeSecondsRemaining: 60,
        pin: newPin,
      },
      pet: {
        name: 'Sparky',
        type: 'dragon',
        level: 1,
        hunger: 80,
        happiness: 85,
        energy: 90,
        health: 85,
        lastFed: 'Hoy',
        favoriteFood: 'Fruta Estelar Solar 🍎',
        accessory: 'none',
        daysAlive: 1,
        isAlive: true,
        survivalMinutes: 20,
        tricksKnown: ['Saludar 🐾'],
        claimedMilestones: [],
      },
      missions: ALL_100_ALTERNATED_GAMES,
      records: [],
    };

    onCreateAccount(newStudentAccount);
    playSoundEffect('correct');
    onAddToast('Alumno Creado', `Espacio independiente listo para ${newName.trim()}`, 'success');
    onSelectAccount(newStudentAccount);
    onClose();
    setActiveView('select');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* VIEW 1: SELECT STUDENT */}
        {activeView === 'select' && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <div className="inline-flex p-3 rounded-2xl bg-violet-600/20 text-violet-400 mb-2 border border-violet-500/30">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">¿Quién va a jugar hoy?</h3>
              <p className="text-xs text-slate-400">
                Cada alumno tiene su propio espacio independiente con sus gemas, mascotas y misiones.
              </p>
            </div>

            {/* Students Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
              {accounts.map((acc) => {
                const isActive = acc.id === activeAccountId;
                return (
                  <button
                    key={acc.id}
                    onClick={() => handleAccountClick(acc)}
                    className={`p-4 rounded-2xl border text-left transition-all transform hover:scale-102 flex items-center gap-3 relative ${
                      isActive
                        ? 'bg-violet-950/80 border-violet-500 ring-2 ring-violet-500/40 shadow-lg'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-4xl">{acc.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-black text-white truncate">{acc.name}</h4>
                        {isActive && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                            Activo
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {acc.age} años · {acc.profile.gems} 💎
                      </p>
                      <span className="inline-block mt-1 text-[10px] font-bold text-violet-300 bg-violet-950/60 px-2 py-0.5 rounded border border-violet-800">
                        🔑 Clave PIN: {acc.pin}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Create New Account Button */}
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-400">¿Nuevo alumno en casa o aula?</span>
              <button
                onClick={() => {
                  setNewName('');
                  setNewPin('1111');
                  setActiveView('create');
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-md transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>Crear Alumno</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: PIN ENTRY FOR SELECTED STUDENT */}
        {activeView === 'pin_entry' && selectedTargetAccount && (
          <div className="space-y-5 animate-fadeIn">
            <div className="text-center space-y-1">
              <span className="text-5xl inline-block mb-1 animate-bounce">
                {selectedTargetAccount.avatar}
              </span>
              <h3 className="text-xl font-black text-white">
                Ingresa la clave de {selectedTargetAccount.name}
              </h3>
              <p className="text-xs text-slate-400">
                Clave simple de 4 dígitos (Ejemplo para esta cuenta: <strong>{selectedTargetAccount.pin}</strong>)
              </p>
            </div>

            {/* 4-Pin Display Bubbles */}
            <div className="flex justify-center items-center gap-3 my-2">
              {[0, 1, 2, 3].map((idx) => {
                const filled = enteredPin.length > idx;
                return (
                  <div
                    key={idx}
                    className={`w-12 h-14 rounded-2xl flex items-center justify-center font-black text-2xl border-2 transition-all ${
                      filled
                        ? 'border-violet-500 bg-violet-950 text-white shadow-lg shadow-violet-500/30 scale-105'
                        : 'border-slate-800 bg-slate-950 text-slate-600'
                    }`}
                  >
                    {filled ? '●' : ''}
                  </div>
                );
              })}
            </div>

            {/* Error Message */}
            {pinError && (
              <p className="text-xs text-rose-400 text-center font-bold animate-pulse">
                {pinError}
              </p>
            )}

            {/* Number Keypad */}
            <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleDigitPress(digit)}
                  className="py-3 rounded-2xl bg-slate-950 hover:bg-slate-800 active:scale-95 text-white font-black text-xl border border-slate-800 transition-all shadow-md"
                >
                  {digit}
                </button>
              ))}
              <button
                onClick={() => setActiveView('select')}
                className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-all"
              >
                Volver
              </button>
              <button
                onClick={() => handleDigitPress('0')}
                className="py-3 rounded-2xl bg-slate-950 hover:bg-slate-800 active:scale-95 text-white font-black text-xl border border-slate-800 transition-all shadow-md"
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-rose-300 font-bold text-sm border border-slate-700 flex items-center justify-center"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* VIEW 3: CREATE NEW STUDENT */}
        {activeView === 'create' && (
          <form onSubmit={handleCreateNewStudent} className="space-y-4 animate-fadeIn">
            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-white">Nuevo Alumno Independiente</h3>
              <p className="text-xs text-slate-400">
                Configura el nombre, avatar y una clave simple de 4 dígitos fácil de recordar.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Nombre del Alumno
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej. Valentina Torres"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-sm focus:border-violet-500 focus:outline-none"
                maxLength={20}
                required
              />
            </div>

            {/* Avatar Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Elige un Avatar
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_AVATARS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setNewAvatar(av)}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-all ${
                      newAvatar === av
                        ? 'bg-violet-950 border-violet-400 scale-110 shadow-lg'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Edad</label>
                <input
                  type="number"
                  value={newAge}
                  onChange={(e) => setNewAge(Math.max(4, Math.min(14, Number(e.target.value))))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-sm focus:border-violet-500 focus:outline-none"
                  min={4}
                  max={14}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Clave Simple (4 Dígitos)
                </label>
                <input
                  type="text"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="1234"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold text-sm focus:border-violet-500 focus:outline-none text-center tracking-widest"
                  maxLength={4}
                  required
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between gap-3">
              <button
                type="button"
                onClick={() => setActiveView('select')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-lg"
              >
                Guardar y Empezar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
