import React from 'react';
import { TabType, StudentProfile } from '../types';
import {
  Sparkles,
  RotateCcw,
  LayoutDashboard,
  Gamepad2,
  FolderOpen,
  Settings,
  Volume2,
  VolumeX,
  Flame,
  Gem,
  Cloud,
} from 'lucide-react';

interface HeaderProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  onResetSeedData: () => void;
  student: StudentProfile;
  onToggleSound: () => void;
  onOpenReportModal: () => void;
  onOpenProfileSwitcher: () => void;
  onOpenAuthModal?: () => void;
  isCloudAuthenticated?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  onResetSeedData,
  student,
  onToggleSound,
  onOpenReportModal,
  onOpenProfileSwitcher,
  onOpenAuthModal,
  isCloudAuthenticated = false,
}) => {
  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'operations' as TabType, label: 'Operaciones Core', icon: Gamepad2 },
    { id: 'records' as TabType, label: 'Directorio / Registros', icon: FolderOpen },
    { id: 'settings' as TabType, label: 'Ajustes', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                  Aventura<span className="text-violet-400">Educa</span>
                </span>
                {/* Visual Status Pill: Servicios Locales Activos */}
                <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>Servicios Locales Activos</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Pre-MVP Tutoría Socrática Gemini & Gamificación
              </p>
            </div>
          </div>

          {/* Gamification Bar Quick Stats (Gems & Streak) & Profile Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Student Profile / Account Switcher Button with PIN */}
            <button
              onClick={onOpenProfileSwitcher}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-950/80 hover:bg-violet-900 border border-violet-700/60 shadow-md transition-all group"
              title="Cambiar de alumno o perfil con clave PIN"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">{student.avatar}</span>
              <div className="text-left hidden sm:block">
                <span className="text-xs font-black text-white block leading-tight truncate max-w-[110px]">
                  {student.name}
                </span>
                <span className="text-[10px] text-violet-300 font-semibold block">
                  Cambiar (PIN 🔑)
                </span>
              </div>
            </button>

            <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-violet-950/60 border border-violet-800/50 text-violet-300">
              <Gem className="w-4 h-4 text-violet-400 fill-violet-400 animate-bounce" />
              <span className="font-bold text-sm text-violet-200">{student.gems}</span>
              <span className="text-xs text-violet-400 hidden md:inline">gemas</span>
            </div>

            <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-950/60 border border-amber-800/50 text-amber-300">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-bold text-sm text-amber-200">{student.streakDays}</span>
              <span className="text-xs text-amber-400 hidden md:inline">días racha</span>
            </div>

            {/* Supabase Cloud Connection & Auth Button */}
            {onOpenAuthModal && (
              <button
                onClick={onOpenAuthModal}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                  isCloudAuthenticated
                    ? 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-500/50 text-emerald-300 shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                }`}
                title="Autenticación y Sincronización en la Nube con Supabase"
              >
                <Cloud className={`w-4 h-4 ${isCloudAuthenticated ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="hidden xl:inline">
                  {isCloudAuthenticated ? 'Supabase Nube' : 'Nube'}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isCloudAuthenticated ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                  }`}
                />
              </button>
            )}

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-slate-800"
              title={student.soundEnabled ? 'Silenciar sonidos' : 'Activar sonido y voz'}
            >
              {student.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-violet-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {/* Report/Certificate Quick Action */}
            <button
              onClick={onOpenReportModal}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors shadow-sm"
            >
              Exportar Reporte
            </button>

            {/* Reset Seed Data Button */}
            <button
              onClick={onResetSeedData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 transition-all shadow-sm"
              title="Restablecer datos originales de prueba"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Restablecer Datos Semilla</span>
              <span className="sm:hidden">Reset</span>
            </button>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-4 border-t border-slate-900/80 overflow-x-auto py-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.id === 'operations' && (
                  <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded bg-violet-400/20 text-violet-200 font-bold">
                    En Vivo
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
