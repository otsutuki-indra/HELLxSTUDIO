'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const router = useRouter();

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  };

  const setToken = (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      // Also set as cookie for middleware
      document.cookie = `auth_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`;
    }
  };

  const logout = async () => {
    const token = getToken();
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        console.error('[v0] Logout error:', error);
      }
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      document.cookie = 'auth_token=; path=/; max-age=0';
    }
    router.push('/');
  };

  return { getToken, setToken, logout };
}
