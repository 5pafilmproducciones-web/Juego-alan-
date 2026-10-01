import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getEnvVar = (key: string): string => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || '';
  }
  return '';
};

const supabaseUrl =
  getEnvVar('SUPABASE_URL') ||
  getEnvVar('NEXT_PUBLIC_SUPABASE_URL') ||
  getEnvVar('VITE_SUPABASE_URL');

const supabaseServiceKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');

export const isSupabaseServerConfigured = Boolean(
  supabaseUrl &&
    supabaseServiceKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('placeholder')
);

/**
 * Cliente de Supabase para el entorno de Servidor / Backend (Node.js/Express).
 * Utiliza la Service Role Key para operaciones administrativas, eludiendo RLS cuando sea necesario.
 *
 * IMPORTANTE: Este cliente solo debe ser importado y ejecutado en el backend (server.ts / api routes).
 * NUNCA debe importarse en componentes de frontend expuestos al navegador.
 */
export const supabaseAdmin: SupabaseClient | null = isSupabaseServerConfigured
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;
