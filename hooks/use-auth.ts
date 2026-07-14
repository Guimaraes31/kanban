'use client';

import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

interface AuthState {
  isAuthenticated: boolean;
  userId: string;
  email: string;
  fullName: string;
  businessName: string;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, businessName: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const EMPTY_AUTH: AuthState = {
  isAuthenticated: false,
  userId: '',
  email: '',
  fullName: '',
  businessName: '',
  loading: true,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    ...EMPTY_AUTH,
  });

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      queueMicrotask(() => setAuth({ ...EMPTY_AUTH, loading: false }));
      return;
    }

    const loadUser = async (userId?: string) => {
      if (!userId) {
        setAuth({ ...EMPTY_AUTH, loading: false });
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name, business_name')
        .eq('id', userId)
        .single();
      setAuth({
        isAuthenticated: true,
        userId,
        email: profile?.email ?? '',
        fullName: profile?.full_name ?? '',
        businessName: profile?.business_name ?? '',
        loading: false,
      });
    };

    void (async () => {
      const result = await supabase.auth.getSession();
      await loadUser(result.data.session?.user.id);
    })();
    const { data: listener } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      void loadUser(session?.user.id);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const supabase = createClient();
    if (!supabase) throw new Error('Supabase não está configurado.');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const register = useCallback(
    async (email: string, password: string, fullName: string, businessName: string) => {
      const supabase = createClient();
      if (!supabase) throw new Error('Supabase não está configurado.');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, business_name: businessName } },
      });
      if (error) throw error;
      return Boolean(data.session);
    },
    []
  );

  const logout = useCallback(async () => {
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
  }, []);

  const value = useMemo(() => ({ ...auth, login, register, logout }), [auth, login, register, logout]);
  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  return context;
}
