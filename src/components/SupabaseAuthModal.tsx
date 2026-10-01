import React, { useState } from 'react';
import {
  X,
  Cloud,
  CheckCircle,
  AlertCircle,
  LogOut,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { AuthContainer } from './auth/AuthContainer';

interface SupabaseAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGems: number;
  currentStudentName: string;
  onSyncGemsFromCloud?: (gems: number) => void;
  onAddToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
}

export const SupabaseAuthModal: React.FC<SupabaseAuthModalProps> = ({
  isOpen,
  onClose,
  currentGems,
  currentStudentName,
  onSyncGemsFromCloud,
  onAddToast,
}) => {
  const {
    user,
    profile,
    isConfigured,
    signOut,
    syncProfileToCloud,
  } = useSupabaseAuth();

  const [isSyncing, setIsSyncing] = useState(false);

  if (!isOpen) return null;

  const handleManualSync = async () => {
    setIsSyncing(true);
    const result = await syncProfileToCloud({
      name: currentStudentName,
      gems: currentGems,
    });
    setIsSyncing(false);

    if (result.success) {
      onAddToast('Sincronizado', 'Tu progreso y gemas están seguros en Supabase Cloud', 'success');
      if (profile?.gems && onSyncGemsFromCloud && profile.gems > currentGems) {
        onSyncGemsFromCloud(profile.gems);
      }
    } else {
      onAddToast('Error de sincronización', result.error, 'error');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onAddToast('Sesión cerrada', 'Has cerrado sesión de Supabase', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 relative max-h-[92vh] overflow-y-auto scrollbar-thin">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <span>Supabase Cloud</span>
              {isConfigured ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Conectado</span>
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>Modo Local</span>
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              Autenticación segura y sincronización de datos
            </p>
          </div>
        </div>

        {/* User Authenticated Profile Card */}
        {user ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Cuenta activa:</span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">
                  {profile?.role || 'student'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-600/30 border border-violet-500/50 flex items-center justify-center text-lg">
                  {profile?.avatar_url || '🎓'}
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-sm font-bold text-white truncate">
                    {profile?.full_name || currentStudentName || 'Alumno'}
                  </h4>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Gemas en Nube:</span>
                <span className="font-black text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{profile?.gems ?? currentGems} 💎</span>
                </span>
              </div>
            </div>

            {/* Actions: Sync & Logout */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Progreso'}</span>
              </button>

              <button
                onClick={handleSignOut}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 active:scale-95 transition-all"
                title="Cerrar sesión de Supabase"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>Salir</span>
              </button>
            </div>
          </div>
        ) : (
          /* Modular Full Auth Flow (Login, Register & Forgot Password) */
          <AuthContainer
            showBrandingHeader={false}
            onSuccess={(email) => {
              onAddToast('¡Bienvenido!', `Sesión activa con ${email}`, 'success');
              onClose();
            }}
          />
        )}
      </div>
    </div>
  );
};
