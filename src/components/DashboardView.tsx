import React from 'react';
import {
  StudentProfile,
  LearningMission,
  VirtualPet,
  Invoice,
  TimeEntry,
  AcademicRecord,
  TabType,
} from '../types';
import {
  Gem,
  Award,
  Flame,
  Clock,
  ArrowUpRight,
  Sparkles,
  BookOpen,
  DollarSign,
  TrendingUp,
  BrainCircuit,
  Heart,
  Calendar,
} from 'lucide-react';

interface DashboardViewProps {
  student: StudentProfile;
  missions: LearningMission[];
  pet: VirtualPet;
  invoices: Invoice[];
  timeEntries: TimeEntry[];
  records: AcademicRecord[];
  onNavigateToTab: (tab: TabType) => void;
  onSelectMission: (missionId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  student,
  missions,
  pet,
  invoices,
  timeEntries,
  records,
  onNavigateToTab,
  onSelectMission,
}) => {
  // Reactive Calculations
  const completedMissionsCount = missions.filter((m) => m.completed).length;
  const totalMissionsCount = missions.length;
  const completionPercentage = Math.round((completedMissionsCount / totalMissionsCount) * 100);

  const totalBilled = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);

  const pendingBilling = invoices
    .filter((inv) => inv.status === 'sent')
    .reduce((sum, inv) => sum + inv.total, 0);

  const totalMinutesLogged = timeEntries.reduce((sum, t) => sum + t.durationMinutes, 0);
  const totalHoursLogged = (totalMinutesLogged / 60).toFixed(1);

  // Subject breakdowns
  const mathMissions = missions.filter((m) => m.subject === 'math');
  const mathCompleted = mathMissions.filter((m) => m.completed).length;

  const grammarMissions = missions.filter((m) => m.subject === 'grammar');
  const grammarCompleted = grammarMissions.filter((m) => m.completed).length;

  const readingMissions = missions.filter((m) => m.subject === 'reading');
  const readingCompleted = readingMissions.filter((m) => m.completed).length;

  const tracingMissions = missions.filter((m) => m.subject === 'tracing');
  const tracingCompleted = tracingMissions.filter((m) => m.completed).length;

  const arcadeMissions = missions.filter((m) => m.subject === 'arcade');
  const arcadeCompleted = arcadeMissions.filter((m) => m.completed).length;

  // Next recommended mission
  const nextPendingMission = missions.find((m) => !m.completed) || missions[0];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-900/60 via-purple-900/40 to-slate-900 border border-violet-800/40 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{student.avatar}</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                ¡Hola, {student.name}!
              </h2>
            </div>
            <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
              Tu tutor virtual <strong className="text-violet-300">Lumi</strong> está listo para la
              misión de hoy. Resuelve retos socráticos, gana gemas y mantén feliz a tu dragón{' '}
              <strong className="text-fuchsia-300">{pet.name}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                onNavigateToTab('operations');
                if (nextPendingMission) onSelectMission(nextPendingMission.id);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm shadow-lg shadow-violet-600/30 transition-all transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Continuar Retos ({nextPendingMission.title})</span>
            </button>

            <button
              onClick={() => onNavigateToTab('operations')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5"
            >
              <span>🚀 Guerra de las Galaxias (Defensa Base)</span>
            </button>

            <button
              onClick={() => onNavigateToTab('operations')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 transition-all transform hover:-translate-y-0.5"
            >
              <span>🏪 Tienda VIP de Mascotas & Fondos</span>
            </button>

            <button
              onClick={() => onNavigateToTab('operations')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5"
            >
              <span>🕹️ Juegos Avanzados</span>
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 4 Reactively Calculated KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Gemas Acumuladas */}
        <div className="bg-slate-900/80 border border-slate-800/80 hover:border-violet-500/40 rounded-xl p-5 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Alcancía de Gemas
            </span>
            <div className="p-2 rounded-lg bg-violet-950/80 text-violet-400 border border-violet-800/40">
              <Gem className="w-5 h-5 fill-violet-400/20" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{student.gems}</span>
            <span className="text-xs text-violet-400 font-medium">💎 acumuladas</span>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex items-center justify-between">
            <span>Mascota {pet.name}: Nivel {pet.level}</span>
            <span className="text-emerald-400 font-semibold flex items-center">
              <Heart className="w-3 h-3 mr-0.5 fill-rose-500 text-rose-500" /> {pet.happiness}%
            </span>
          </div>
        </div>

        {/* KPI 2: Misiones y Progreso */}
        <div className="bg-slate-900/80 border border-slate-800/80 hover:border-violet-500/40 rounded-xl p-5 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Retos Superados
            </span>
            <div className="p-2 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {completedMissionsCount}
              <span className="text-base text-slate-500 font-normal"> / {totalMissionsCount}</span>
            </span>
            <span className="text-xs text-emerald-400 font-medium">{completionPercentage}%</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* KPI 3: Racha de Estudio & Enfoque */}
        <div className="bg-slate-900/80 border border-slate-800/80 hover:border-violet-500/40 rounded-xl p-5 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Racha de Estudio
            </span>
            <div className="p-2 rounded-lg bg-amber-950/80 text-amber-400 border border-amber-800/40">
              <Flame className="w-5 h-5 fill-amber-400/20" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{student.streakDays}</span>
            <span className="text-xs text-amber-400 font-medium">días consecutivos</span>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex items-center justify-between">
            <span>Tiempo pantalla hoy:</span>
            <span className="text-slate-300 font-medium">
              {student.screenTimeUsedMinutes} / {student.dailyScreenTimeLimitMinutes} min
            </span>
          </div>
        </div>

        {/* KPI 4: Panel Operativo Tutorías / Facturación */}
        <div className="bg-slate-900/80 border border-slate-800/80 hover:border-violet-500/40 rounded-xl p-5 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Tutoría & Facturación
            </span>
            <div className="p-2 rounded-lg bg-blue-950/80 text-blue-400 border border-blue-800/40">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">${totalBilled.toFixed(2)}</span>
            <span className="text-xs text-blue-400 font-medium">cobrado</span>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex items-center justify-between">
            <span>{totalHoursLogged} hrs de soporte</span>
            <span className="text-amber-400 font-medium">${pendingBilling.toFixed(2)} pendiente</span>
          </div>
        </div>
      </div>

      {/* Grid: Academic Subject Progress & Live Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Mastery & Subject Distribution (2 Columns) */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-violet-400" />
                <span>Distribución de Competencias Cognitivas</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Dominio pedagógico por áreas evaluadas mediante tutoría socrática
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('operations')}
              className="text-xs text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1"
            >
              <span>Abrir Mapa</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Progress Bars */}
          <div className="space-y-4">
            {/* Matemáticas */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-200">
                  Matemáticas (Sumas, Restas, Multiplicación & Retos)
                </span>
                <span className="text-violet-300 font-bold">
                  {mathCompleted} de {mathMissions.length} misiones
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-violet-600 to-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(mathCompleted / (mathMissions.length || 1)) * 100}%` }}
                />
              </div>
            </div>

            {/* Gramática & Ortografía */}
            {grammarMissions.length > 0 && (
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-200">
                    Gramática & Ortografía (Sustantivos, Verbos, Acentuación)
                  </span>
                  <span className="text-fuchsia-300 font-bold">
                    {grammarCompleted} de {grammarMissions.length} misiones
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-fuchsia-600 to-pink-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(grammarCompleted / (grammarMissions.length || 1)) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Lectura & Fonética */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-200">
                  Lectura & Fonética (Reconocimiento y Sílabas)
                </span>
                <span className="text-emerald-300 font-bold">
                  {readingCompleted} de {readingMissions.length} misiones
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-600 to-teal-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(readingCompleted / (readingMissions.length || 1)) * 100}%` }}
                />
              </div>
            </div>

            {/* Trazos & Caligrafía Táctil */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-200">
                  Prácticas de Trazo Táctil & Pizarra
                </span>
                <span className="text-amber-300 font-bold">
                  {tracingCompleted} de {tracingMissions.length} juegos
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(tracingCompleted / (tracingMissions.length || 1)) * 100}%` }}
                />
              </div>
            </div>

            {/* Minijuegos Arcade & Recreo */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-200">
                  Parque de Recreo & Minijuegos Arcade
                </span>
                <span className="text-fuchsia-300 font-bold">
                  {arcadeCompleted} de {arcadeMissions.length} juegos
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-fuchsia-500 to-pink-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(arcadeCompleted / (arcadeMissions.length || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Mission Launch Cards */}
          <div className="border-t border-slate-800 pt-5">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Misiones Rápidas Disponibles
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {missions.slice(0, 4).map((mission) => (
                <div
                  key={mission.id}
                  onClick={() => {
                    onNavigateToTab('operations');
                    onSelectMission(mission.id);
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    mission.completed
                      ? 'bg-slate-900/40 border-emerald-900/50 hover:border-emerald-500/50'
                      : 'bg-slate-900/90 border-slate-800 hover:border-violet-500/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate">{mission.title}</span>
                    <span className="text-[11px] font-semibold text-violet-400">
                      +{mission.gemReward} 💎
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">
                    {mission.category} · {mission.difficulty}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Recent Pedagogical & Activity Log (1 Column) */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-violet-400" />
                <span>Actividad Reciente</span>
              </h3>
              <button
                onClick={() => onNavigateToTab('records')}
                className="text-xs text-slate-400 hover:text-white"
              >
                Ver todos
              </button>
            </div>

            <div className="space-y-3">
              {records.slice(0, 4).map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 truncate">{rec.activityName}</span>
                    <span
                      className={`text-[10px] font-bold ${
                        rec.status === 'completado'
                          ? 'text-emerald-400'
                          : rec.status === 'en_progreso'
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {rec.status === 'completado'
                        ? 'Completado'
                        : rec.status === 'en_progreso'
                        ? 'En Progreso'
                        : 'Revisión'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 italic line-clamp-2">
                    "{rec.tutorFeedback}"
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/60 text-[10px] text-slate-500">
                    <span>{rec.studentName}</span>
                    <span className="text-violet-400 font-bold">+{rec.gemsEarned} gemas</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Modo Tutor: Socrático Empático</span>
              <span className="text-emerald-400 font-semibold">Gemini 3.8 Conectado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
