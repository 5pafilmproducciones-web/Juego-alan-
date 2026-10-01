import React, { useState } from 'react';
import { LoginView } from './LoginView';
import { RegisterView } from './RegisterView';
import { ForgotPasswordView } from './ForgotPasswordView';
import { Cloud, Sparkles } from 'lucide-react';

export type AuthMode = 'login' | 'register' | 'forgot_password';

interface AuthContainerProps {
  initialMode?: AuthMode;
  onSuccess?: (userEmail: string) => void;
  onCancel?: () => void;
  showBrandingHeader?: boolean;
}

export const AuthContainer: React.FC<AuthContainerProps> = ({
  initialMode = 'login',
  onSuccess,
  onCancel,
  showBrandingHeader = true,
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Branding Header */}
      {showBrandingHeader && (
        <div className="flex items-center justify-center gap-3 pb-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-fuchsia-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight">
              Aventura<span className="text-violet-400">Educa</span>
            </h2>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
              <Cloud className="w-3.5 h-3.5" />
              <span>Autenticación Segura Supabase</span>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic View Display */}
      {mode === 'login' && (
        <LoginView
          onSuccess={(email) => {
            if (onSuccess) onSuccess(email);
          }}
          onNavigateToRegister={() => setMode('register')}
          onNavigateToForgotPassword={() => setMode('forgot_password')}
        />
      )}

      {mode === 'register' && (
        <RegisterView
          onSuccess={(email) => {
            if (onSuccess) onSuccess(email);
          }}
          onNavigateToLogin={() => setMode('login')}
        />
      )}

      {mode === 'forgot_password' && (
        <ForgotPasswordView onNavigateToLogin={() => setMode('login')} />
      )}
    </div>
  );
};
