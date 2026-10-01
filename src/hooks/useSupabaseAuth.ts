import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: 'student' | 'parent' | 'admin';
  gems: number;
}

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isConfigured] = useState<boolean>(isSupabaseConfigured);

  // Fetch user profile from public.profiles
  const fetchProfile = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn('Error loading Supabase profile:', error.message);
        return null;
      }

      if (data) {
        setProfile(data as UserProfile);
        return data as UserProfile;
      }
    } catch (err) {
      console.warn('Network error fetching profile:', err);
    }
    return null;
  }, []);

  // Sync / update profile in public.profiles
  const syncProfileToCloud = useCallback(
    async (updates: {
      name?: string;
      gems?: number;
      avatar?: string;
      role?: 'student' | 'parent' | 'admin';
    }) => {
      if (!isSupabaseConfigured || !user) return { success: false };

      try {
        const payload: Record<string, any> = {
          id: user.id,
          email: user.email,
          updated_at: new Date().toISOString(),
        };

        if (updates.name !== undefined) payload.full_name = updates.name;
        if (updates.gems !== undefined) payload.gems = updates.gems;
        if (updates.avatar !== undefined) payload.avatar_url = updates.avatar;
        if (updates.role !== undefined) payload.role = updates.role;

        const { error } = await supabase.from('profiles').upsert(payload);

        if (error) {
          console.error('Error syncing profile to Supabase:', error.message);
          return { success: false, error: error.message };
        }

        // Refresh local profile state
        await fetchProfile(user.id);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Error de red' };
      }
    },
    [user, fetchProfile]
  );

  // Initialize session and listen for changes
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // 2. Listen to Auth events (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Sign out
  const signOut = async () => {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  // Sign in with password
  const signInWithPassword = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { data: null, error: new Error('Supabase no está configurado en .env') };
    }
    return await supabase.auth.signInWithPassword({ email, password });
  };

  // Sign up with password
  const signUpWithPassword = async (email: string, password: string, fullName?: string) => {
    if (!isSupabaseConfigured) {
      return { data: null, error: new Error('Supabase no está configurado en .env') };
    }
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
          role: 'student',
        },
      },
    });
  };

  return {
    user,
    session,
    profile,
    loading,
    isConfigured,
    fetchProfile,
    syncProfileToCloud,
    signInWithPassword,
    signUpWithPassword,
    signOut,
  };
}
