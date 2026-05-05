// Contexto global de autenticación v2 — con refresh token

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, AuthContextType } from '../types';
import api from '../services/api';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]   = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken   = localStorage.getItem('payflow_token');
    const savedUser    = localStorage.getItem('payflow_user');
    const savedRefresh = localStorage.getItem('payflow_refresh');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('payflow_token');
        localStorage.removeItem('payflow_user');
        localStorage.removeItem('payflow_refresh');
      }
    } else if (savedRefresh) {
      // Intentar renovar sesión automáticamente
      api.post('/auth/refresh', { refreshToken: savedRefresh })
        .then(({ data }) => {
          if (data.success && data.data) {
            localStorage.setItem('payflow_token', data.data.accessToken || data.data.token);
            localStorage.setItem('payflow_refresh', data.data.refreshToken || savedRefresh);
            setToken(data.data.accessToken || data.data.token);
          }
        })
        .catch(() => {
          localStorage.removeItem('payflow_refresh');
        });
    }
  }, []);

  const login = (newToken: string, newUser: User, refreshToken?: string) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('payflow_token', newToken);
    localStorage.setItem('payflow_user', JSON.stringify(newUser));
    if (refreshToken) localStorage.setItem('payflow_refresh', refreshToken);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('payflow_refresh');
    try {
      if (refreshToken) await api.post('/auth/logout', { refreshToken });
    } catch { /* ignorar error en logout */ }
    setToken(null);
    setUser(null);
    localStorage.removeItem('payflow_token');
    localStorage.removeItem('payflow_user');
    localStorage.removeItem('payflow_refresh');
  };

  return (
    <AuthContext.Provider value={{
      user, token, login, logout,
      isAuthenticated: !!token,
      isAdmin: user?.role === 'ADMIN',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
