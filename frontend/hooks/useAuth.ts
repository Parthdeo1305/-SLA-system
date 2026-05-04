'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import authApi, { AuthUser } from '@/services/api/auth';

const TOKEN_KEY = 'sts_token';
const USER_KEY = 'sts_user';

/**
 * useAuth — manages authentication state throughout the app.
 *
 * Reads the JWT and user from localStorage on mount.
 * Provides login, register, and logout functions.
 * Redirects to /dashboard on login and /login on logout.
 */
export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Initialise from localStorage ─────────────────────────────────────────
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    const storedToken = localStorage.getItem(TOKEN_KEY);

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
      }
    }
    setLoading(false);
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(
    async (email: string, password: string) => {
      setError(null);
      setLoading(true);
      try {
        const { token, user: authUser } = await authApi.login({ email, password });
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(authUser));
        setUser(authUser);
        router.push('/dashboard');
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          'Login failed. Please try again.';
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  // ── Register ──────────────────────────────────────────────────────────────
  const register = useCallback(
    async (name: string, email: string, password: string, role?: string) => {
      setError(null);
      setLoading(true);
      try {
        const { token, user: authUser } = await authApi.register({
          name,
          email,
          password,
          role,
        });
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(authUser));
        setUser(authUser);
        router.push('/dashboard');
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          'Registration failed. Please try again.';
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    router.push('/login');
  }, [router]);

  return { user, loading, error, login, register, logout, isAuthenticated: !!user };
}
