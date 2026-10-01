import React from 'react';
import { StudentProfile } from '../types';
import {
  Settings,
  User,
  Volume2,
  Clock,
  ShieldCheck,
  RotateCcw,
  Bot,
  Sparkles,
  Cloud,
} from 'lucide-react';

interface SettingsViewProps {
  student: StudentProfile;
  onUpdateStudent: (student: StudentProfile | ((prev: StudentProfile) => StudentProfile)) => void;
  onResetSeedData: () => void;
  onAddToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
  onOpenAuthModal?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  student,
  onUpdateStudent,
  onResetSeedData,
  onAddToast,
  onOpenAuthModal,
}) => {
  const tutorOptions = [
    {
      id: 'lumi' as const,
      name: 'Lumi el Búho Sabio',
      icon: '🦉',
      tagline: 'Paciente y reflexivo, ideal para sumas y lectura guiada.',
    },
    {
      id: 'rex' as const,
      name: 'Rex el Dino Curioso',
      icon: '🦖',
      tagline: 'Entusiasta y juguetón, ideal para retos y aventuras espaciales.',
    },
    {
      id: 'astra' as const,
      name: 'Astra la Maga Estelar',
      icon: '🧙‍♀️',
      tagline: 'Mágica e inspiradora, experta en trazos luminosos y palabras.',
    },
  ];

  const avatarChoices = ['🚀', '🌟', '🦄', '🦁', '🐬', '🎨'];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Settings Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center border border-violet-500/30">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Ajustes & Control Parental</h3>
            <p className="text-xs text-slate-400">
              Personaliza el tutor pedagógico, perfil del alumno y límites de tiempo saludable
            </p>
          </div>
        </div>
      </div>

      {/* Student Profile Settings */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-violet-400" />
          <span>Perfil del Alumno (Explorador)</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Nombre</label>
            <input
              type="text"
              value={student.name}
              onChange={(e) =>
                onUpdateStudent((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Edad (5 a 9 años)
            </label>
            <input
              type="number"
              min={5}
              max={9}
              value={student.age}
              onChange={(e) =>
                onUpdateStudent((prev) => ({ ...prev, age: Number(e.target.value) }))
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>

        {/* Avatar selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2">
            Selecciona tu Avatar
          </label>
          <div className="flex flex-wrap gap-3">
            {avatarChoices.map((av) => (
              <button
                key={av}
                onClick={() => {
                  onUpdateStudent((prev) => ({ ...prev, avatar: av }));
                  onAddToast('Avatar Actualizado', `Tu avatar ahora es ${av}`, 'success');
                }}
                className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all ${
                  student.avatar === av
                    ? 'bg-violet-600 ring-2 ring-violet-400 shadow-lg'
                    : 'bg-slate-950 border border-slate-800 hover:bg-slate-800'
                }`}
              >
                {av}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tutor Persona Selection */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Bot className="w-4 h-4 text-violet-400" />
          <span>Elige la Personalidad de tu Profesor Virtual (Gemini)</span>
        </h4>
        <p className="text-xs text-slate-400">
          Cada tutor adopta un método socrático con su propio tono estimulante y cariñoso.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {tutorOptions.map((tutor) => {
            const isSelected = student.tutorPersona === tutor.id;
            return (
              <div
                key={tutor.id}
                onClick={() => {
                  onUpdateStudent((prev) => ({ ...prev, tutorPersona: tutor.id }));
                  onAddToast('Tutor Seleccionado', `${tutor.name} te acompañará`, 'info');
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-violet-950/60 border-violet-500 ring-2 ring-violet-500/40 shadow-lg'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="text-3xl mb-2">{tutor.icon}</div>
                <h5 className="font-bold text-white text-sm">{tutor.name}</h5>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{tutor.tagline}</p>
                <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] font-bold text-violet-400">
                  {isSelected ? '✓ Seleccionado' : 'Elegir este tutor'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Parental Controls & Screen Time Limits */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Control Parental: Tiempo Saludable de Pantalla</span>
        </h4>
        <p className="text-xs text-slate-400">
          Transforma el ocio digital pasivo en tiempo de calidad con límites diarios automáticos.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Límite Diario de Uso ({student.dailyScreenTimeLimitMinutes} minutos)
            </label>
            <input
              type="range"
              min={10}
              max={60}
              step={5}
              value={student.dailyScreenTimeLimitMinutes}
              onChange={(e) =>
                onUpdateStudent((prev) => ({
                  ...prev,
                  dailyScreenTimeLimitMinutes: Number(e.target.value),
                }))
              }
              className="w-full accent-violet-600"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>10 min (Corto)</span>
              <span>20 min (Recomendado)</span>
              <span>60 min (Máximo)</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Uso Registrado Hoy
            </span>
            <div className="text-xl font-bold text-white">
              {student.screenTimeUsedMinutes} min{' '}
              <span className="text-xs text-slate-400 font-normal">
                de {student.dailyScreenTimeLimitMinutes} min permitidos
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    (student.screenTimeUsedMinutes / student.dailyScreenTimeLimitMinutes) * 100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Voice and Speech Synthesis Settings */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-violet-400" />
          <span>Voz y Lectura Asistida (TTS & Reconocimiento STT)</span>
        </h4>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
          <div>
            <div className="font-semibold text-xs text-white">Voz Amigable del Tutor en Español</div>
            <div className="text-[11px] text-slate-400">
              Lumi lee las preguntas y pistas en voz alta para facilitar el aprendizaje
            </div>
          </div>
          <button
            onClick={() =>
              onUpdateStudent((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
            }
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
              student.soundEnabled ? 'bg-violet-600' : 'bg-slate-800'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                student.soundEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Cloud & Supabase Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Supabase Cloud Sync & Autenticación</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                  Nube Activa
                </span>
              </h4>
              <p className="text-xs text-slate-400">
                Guarda el progreso de tu hijo, gemas y racha en la base de datos de Supabase
              </p>
            </div>
          </div>

          {onOpenAuthModal && (
            <button
              onClick={onOpenAuthModal}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>Gestionar Cuenta Nube</span>
            </button>
          )}
        </div>
      </div>

      {/* Danger Zone: Reset Seed Data */}
      <div className="bg-rose-950/20 border border-rose-900/40 rounded-2xl p-6 shadow-xl space-y-3">
        <h4 className="text-sm font-bold text-rose-300 flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-rose-400" />
          <span>Restablecer Datos Semilla (Demostración)</span>
        </h4>
        <p className="text-xs text-slate-300">
          Restaura las misiones de muestra, el estado de la mascota Sparky, las gemas iniciales y las
          facturas precargadas para una presentación limpia ante clientes o inversores.
        </p>

        <button
          onClick={onResetSeedData}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restablecer Todo a Datos Semilla Iniciales</span>
        </button>
      </div>
    </div>
  );
};
