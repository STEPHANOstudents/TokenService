import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  TOKEN_STORAGE_KEY,
  getStoredToken,
  loginAdmin,
  obtenerAdminActual,
} from '../services/api';
import type { UsuarioAdmin } from '../services/api';

interface AuthContextValue {
  admin: UsuarioAdmin | null;
  token: string | null;
  cargando: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [admin, setAdmin] = useState<UsuarioAdmin | null>(null);
  const [cargando, setCargando] = useState<boolean>(() => Boolean(getStoredToken()));

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {
      // ignorar
    }
    setToken(null);
    setAdmin(null);
  }, []);

  useEffect(() => {
    const stored = getStoredToken();
    if (!stored) {
      setCargando(false);
      return;
    }

    let cancelado = false;
    setCargando(true);

    obtenerAdminActual()
      .then((res) => {
        if (cancelado) return;
        setAdmin(res.admin);
        setToken(stored);
      })
      .catch(() => {
        if (cancelado) return;
        logout();
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [logout]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginAdmin(email, password);
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
    } catch {
      // ignorar
    }
    setToken(res.token);
    setAdmin(res.admin);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      admin,
      token,
      cargando,
      login,
      logout,
    }),
    [admin, token, cargando, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe utilizarse dentro de un AuthProvider.');
  }
  return ctx;
}
