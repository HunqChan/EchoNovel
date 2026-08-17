import { createContext, useContext, useState, type ReactNode } from 'react';
import type { UserResponse } from '../types';

interface AuthContextType {
  user: UserResponse | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isVip: boolean;
  login: (token: string, refreshToken: string, user: UserResponse) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [refreshToken, setRefreshToken] = useState<string | null>(() => localStorage.getItem('refreshToken'));
  const [user, setUser] = useState<UserResponse | null>(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        return null;
      }
    }
    return null;
  });

  const login = (newToken: string, newRefreshToken: string, newUser: UserResponse) => {
    setToken(newToken);
    setRefreshToken(newRefreshToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('refreshToken', newRefreshToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = async () => {
    try {
      const storedRefreshToken = localStorage.getItem('refreshToken');
      if (storedRefreshToken) {
        // dynamic import to avoid circular dependency if api.ts imports AuthContext
        const { authService } = await import('../services/authService');
        await authService.logout({ refreshToken: storedRefreshToken });
      }
    } catch (error) {
      console.error('Logout failed on backend:', error);
    } finally {
      setToken(null);
      setRefreshToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  };

  const value: AuthContextType = {
    user,
    token,
    refreshToken,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'ADMIN',
    isVip: user?.isVip ?? false,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
