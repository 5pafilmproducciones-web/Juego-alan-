import React, { useState } from 'react';
import { Mail, Lock, User, UserPlus, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface RegisterViewProps {
  onSuccess: (email: string) => void;
  onNavigateToLogin: () => void;
  defaultRole?: 'student' | 'parent';
}

export const RegisterView: React.FC<RegisterViewProps> = ({
  onSuccess,
  onNavigateToLogin,
  defaultRole = 'student',
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'student' | 'parent'>(defaultRole);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validaciones del lado del cliente
    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMsg('Por favor completa todos los campos requeridos.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener un mínimo de 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role: role,
          },
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          setErrorMsg('Este correo ya está registrado. Prueba iniciar sesión.');
        } else if (error.message.includes('Password should be')) {
          setErrorMsg('La contraseña debe contener al menos 6 caracteres.');
        } else {
          setErrorMsg(error.message);
        }
        return;
      }

      if (data?.user) {
        setRegisteredSuccess(true);
        onSuccess(data.user.email || email);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error inesperado durante el registro.');
    } finally {
      setLoading(false);
    }
  };

  if (registeredSuccess) {
    return (
      <div className="text-center space-y-4 py-4 animate-fadeIn">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40 animate-bounce">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-black text-white">¡Cuenta Creada Exitosamente!</h3>
          <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
            Tu cuenta para <span className="text-emerald-400 font-bold">{email}</span> ha sido
            registrada. Si tu proyecto tiene confirmación de correo habilitada, revisa tu buzón.
          </p>
        </div>
        <button
          onClick={onNavigateToLogin}
          className="py-2.5 px-6 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-md transition-all"
        >
          Ir a Iniciar Sesión
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="text-center space-y-1">
        <h3 className="text-xl font-black text-white">Crear Nueva Cuenta</h3>
        <p className="text-xs text-slate-400">
          Únete para proteger tu racha, gemas y progreso educativo
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2 animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-3">
        {/* Selector de Rol */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Tipo de Perfil
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                role === 'student'
                  ? 'bg-violet-600 text-white border-violet-500 shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
              }`}
            >
              <span>🚀 Alumno / Hijo</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('parent')}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                role === 'parent'
                  ? 'bg-violet-600 text-white border-violet-500 shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
              }`}
            >
              <span>👨‍👩‍👧 Padre / Tutor</span>
            </button>
          </div>
        </div>

        {/* Nombre Completo */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Nombre Completo
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ej: Mateo Explorador"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
            />
          </div>
        </div>

        {/* Correo */}
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

        {/* Contraseña */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Contraseña (mínimo 6 caracteres)
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirmar Contraseña */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Confirmar Contraseña
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
            />
          </div>
        </div>

        {/* Botón Registrarse */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span>Registrar Cuenta</span>
            </>
          )}
        </button>
      </form>

      {/* Pie de cambio a Login */}
      <div className="pt-3 border-t border-slate-800/80 text-center">
        <p className="text-xs text-slate-400">
          ¿Ya tienes una cuenta?{' '}
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="text-violet-400 hover:text-violet-300 font-bold hover:underline transition-colors"
          >
            Inicia sesión aquí
          </button>
        </p>
      </div>
    </div>
  );
};
