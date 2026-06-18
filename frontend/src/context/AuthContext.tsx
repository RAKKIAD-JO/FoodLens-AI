'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { apiFetch, setAccessToken, getAccessToken } from '../lib/api';
import { useRouter, usePathname } from 'next/navigation';

export interface User {
  id: string;
  email: string;
  name: string;
  age: number | null;
  gender: string | null;
  weight: number | null;
  height: number | null;
  activityLevel: string | null;
  goal: string | null;
  metrics?: {
    bmi: number | null;
    bmr: number | null;
    tdee: number | null;
    targetCalories: number | null;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();


  const refreshProfile = async () => {
    try {
      const res = await apiFetch('/users/profile');
      if (res.status === 'success') {
        setUser(res.data);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      setUser(null);
      setAccessToken(null);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getAccessToken();
      if (token) {
        await refreshProfile();
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Protected route navigation
  useEffect(() => {
    const publicRoutes = ['/', '/login', '/register'];
    if (!loading) {
      const isPublic = publicRoutes.includes(pathname);
      if (!user && !isPublic) {
        router.push('/login');
      } else if (user && (pathname === '/login' || pathname === '/register')) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, pathname, router]);

  const login = async (email: string, password: string) => {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      bodyData: { email, password },
    });

    if (res.status === 'success') {
      setAccessToken(res.data.accessToken);
      await refreshProfile();
      router.push('/dashboard');
    }
  };

  const register = async (email: string, name: string, password: string) => {
    await apiFetch('/auth/register', {
      method: 'POST',
      bodyData: { email, name, password },
    });
    router.push('/login');
  };

  const logout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      setAccessToken(null);
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
