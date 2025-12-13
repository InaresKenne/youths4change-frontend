import { createContext, useContext, useState, useEffect} from 'react';
import type {ReactNode } from 'react';
import api from '@/services/api';
import type { Admin } from '@/types';

interface AuthContextType {
  admin: Admin | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only check auth if we're on an admin route
    if (window.location.pathname.startsWith('/admin')) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get('/api/auth/me');
      if (response.data.authenticated) {
        setAdmin(response.data.user);
      }
    } catch (error: any) {
      // Silently handle authentication errors - this is expected when not logged in
      if (error.response?.status === 401) {
        // Expected - user not authenticated
      }
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    const response = await api.post('/api/auth/login', { username, password });
    if (response.data.success) {
      setAdmin(response.data.user);
    }
  };

  const logout = async () => {
    await api.post('/api/auth/logout');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}