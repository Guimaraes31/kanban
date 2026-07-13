'use client';

import { useCallback, useEffect, useState } from 'react';
import * as store from '@/lib/store';

interface AuthState {
  isAuthenticated: boolean;
  email: string;
  fullName: string;
  businessName: string;
  loading: boolean;
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    email: '',
    fullName: '',
    businessName: '',
    loading: true,
  });

  useEffect(() => {
    const session = store.getSession();
    if (session) {
      setAuth({
        isAuthenticated: true,
        email: session.email,
        fullName: session.fullName,
        businessName: session.businessName,
        loading: false,
      });
    } else {
      setAuth((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  const login = useCallback((email: string, password: string) => {
    const session = store.login(email, password);
    setAuth({
      isAuthenticated: true,
      email: session.email,
      fullName: session.fullName,
      businessName: session.businessName,
      loading: false,
    });
    return session;
  }, []);

  const register = useCallback(
    (email: string, password: string, fullName: string, businessName: string) => {
      const session = store.register(email, password, fullName, businessName);
      setAuth({
        isAuthenticated: true,
        email: session.email,
        fullName: session.fullName,
        businessName: session.businessName,
        loading: false,
      });
      return session;
    },
    []
  );

  const logout = useCallback(() => {
    store.logout();
    setAuth({
      isAuthenticated: false,
      email: '',
      fullName: '',
      businessName: '',
      loading: false,
    });
  }, []);

  return { ...auth, login, register, logout };
}