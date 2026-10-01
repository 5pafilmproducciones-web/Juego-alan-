import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface LoginViewProps {
  onSuccess: (userEmail: string) => void;
  onNavigateToRegister: () => void;
  onNavigateToForgotPassword: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onSuccess,
  onNavigateToRegister,
  onNavigateToForgotPassword,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('Por favor completa todos los campos requeridos.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        // Mensajes de error en español amigables
        if (error.message.includes('Invalid login credentials')) {
          setErrorMsg('Correo o contraseña incorrectos. Verifica tus datos.');
        } else if (error.message.includes('Email not confirmed')) {
          setErrorMsg('Tu correo aún no ha sido confirmado. Revisa tu bandeja de entrada.');
        } else if (error.message.includes('rate limit')) {
          setErrorMsg('Demasiados intentos seguidos. Espera un momento antes de volver a intentar.');
        } else {
          setErrorMsg(error.message);
        }
        return;
      }

      if (data?.user) {
        onSuccess(data.user.email || 'Usuario');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocurrió un error inesperado al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="text-center space-y-1">
        <h3 className="text-xl font-black text-white">¡Bienvenido de Nuevo!</h3>
        <p className="text-xs text-slate-400">
          Inicia sesión para sincronizar tus gemas, misiones y avances
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2 animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-3.5">
        {/* Campo Correo */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Correo Electrónico
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@correo.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
            />
          </div>
        </div>

        {/* Campo Contraseña */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300">Contraseña</label>
            <button
              type="button"
              onClick={onNavigateToForgotPassword}
              className="text-[11px] text-violet-400 hover:text-violet-300 hover:underline font-medium transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition-colors"
              title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Botón Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-violet-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Iniciar Sesión</span>
            </>
          )}
        </button>
      </form>

      {/* Pie de cambio a Registro */}
      <div className="pt-3 border-t border-slate-800/80 text-center">
        <p className="text-xs text-slate-400">
          ¿Aún no tienes cuenta?{' '}
          <button
            type="button"
            onClick={onNavigateToRegister}
            className="text-violet-400 hover:text-violet-300 font-bold hover:underline transition-colors"
          >
            Regístrate gratis
          </button>
        </p>
      </div>
    </div>
  );
};
