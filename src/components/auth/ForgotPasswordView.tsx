import React, { useState } from 'react';
import { Mail, KeyRound, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface ForgotPasswordViewProps {
  onNavigateToLogin: () => void;
}

export const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({
  onNavigateToLogin,
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim()) {
      setErrorMsg('Ingresa el correo electrónico asociado a tu cuenta.');
      return;
    }

    setLoading(true);

    try {
      const redirectUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/reset-password`
          : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });

      if (error) {
        if (error.message.includes('rate limit')) {
          setErrorMsg('Demasiadas solicitudes seguidas. Por favor espera unos minutos.');
        } else {
          setErrorMsg(error.message);
        }
        return;
      }

      setEmailSent(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error inesperado al solicitar el restablecimiento.');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="text-center space-y-4 py-4 animate-fadeIn">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center border border-cyan-500/40 animate-bounce">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-black text-white">¡Enlace Enviado!</h3>
          <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
            Hemos enviado las instrucciones para restablecer tu contraseña a{' '}
            <span className="text-cyan-400 font-bold">{email}</span>. Revisa tu bandeja de
            entrada y tu carpeta de spam.
          </p>
        </div>
        <button
          onClick={onNavigateToLogin}
          className="py-2.5 px-6 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Inicio de Sesión</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="text-center space-y-1">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/30 mb-2">
          <KeyRound className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-black text-white">Recuperar Contraseña</h3>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          Ingresa tu correo electrónico registrado y te enviaremos un enlace seguro para crear una nueva
          contraseña
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2 animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleResetPassword} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Correo Electrónico Registrado
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
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <span>Enviar Enlace de Recuperación</span>
          )}
        </button>
      </form>

      <div className="pt-3 border-t border-slate-800/80 text-center">
        <button
          type="button"
          onClick={onNavigateToLogin}
          className="text-xs text-slate-400 hover:text-white font-bold flex items-center justify-center gap-1.5 mx-auto transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Recordé mi contraseña / Iniciar Sesión</span>
        </button>
      </div>
    </div>
  );
};
