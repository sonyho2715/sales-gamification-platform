'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/authStore';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { fetchUser } = useAuthStore();

  useEffect(() => {
    // Check if user has a token in localStorage on mount
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Fetch user data to restore auth state
      fetchUser().catch(() => {
        // If fetch fails, token is invalid, clear it
        localStorage.removeItem('accessToken');
      });
    }
  }, [fetchUser]);

  return <>{children}</>;
}
