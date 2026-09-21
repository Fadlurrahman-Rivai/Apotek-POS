'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, UserRole } from '@/database/schema';

// Akun bawaan sistem
export const DEFAULT_USERS: User[] = [
  {
    id: 'user-001',
    username: 'admin',
    password: 'admin123',
    name: 'Apoteker Pengelola (Admin)',
    role: UserRole.ADMIN,
    avatar: '👨‍⚕️',
  },
  {
    id: 'user-002',
    username: 'pegawai',
    password: 'pegawai123',
    name: 'Staf Kasir & Pelayanan',
    role: UserRole.PEGAWAI,
    avatar: '👩‍💼',
  },
];

const AUTH_STORAGE_KEY = 'apotek_auth_user';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isPegawai: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Ambil sesi user yang tersimpan di localStorage
    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Failed to parse auth user:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    const cleanUsername = username.trim().toLowerCase();
    const matchedUser = DEFAULT_USERS.find(
      (u) => u.username.toLowerCase() === cleanUsername && u.password === password
    );

    if (!matchedUser) {
      return {
        success: false,
        message: 'Username atau password salah! Pastikan kredensial Anda benar.',
      };
    }

    // Jangan simpan plain password di state/storage
    const safeUser: User = {
      id: matchedUser.id,
      username: matchedUser.username,
      name: matchedUser.name,
      role: matchedUser.role,
      avatar: matchedUser.avatar,
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(safeUser));
    setUser(safeUser);

    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    router.push('/login');
  };

  const isAdmin = user?.role === UserRole.ADMIN;
  const isPegawai = user?.role === UserRole.PEGAWAI;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        isPegawai,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
