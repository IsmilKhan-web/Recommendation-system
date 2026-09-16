import { createContext, useContext, useEffect, useMemo, useState, ReactNode, useCallback } from 'react';
import { api, setToken } from '../lib/api';
import { Profile, Role } from '../types';

interface AuthContextValue {
  user: Profile | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (params: { email: string; password: string; fullName: string; role: Role; department?: string }) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string, role: Role) => Promise<{ error: string | null }>;
  signOut: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    api.getMe()
      .then(({ profile }) => {
        setUser(profile);
        setProfile(profile);
      })
      .catch(() => {
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const signUp = useCallback<AuthContextValue['signUp']>(async ({ email, password, fullName, role, department }) => {
    try {
      const { token, profile: prof } = await api.signup({
        email, password, fullName, role, department,
      });
      setToken(token);
      setUser(prof);
      setProfile(prof);
      return { error: null };
    } catch (err) {
      return { error: (err as Error).message };
    }
  }, []);

  const signIn = useCallback<AuthContextValue['signIn']>(async (email, password, role) => {
    try {
      const { token, profile: prof } = await api.login(email, password, role);
      setToken(token);
      setUser(prof);
      setProfile(prof);
      return { error: null };
    } catch (err) {
      return { error: (err as Error).message };
    }
  }, []);

  const signOut = useCallback(() => {
    setToken(null);
    setUser(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const { profile: prof } = await api.getMe();
      setUser(prof);
      setProfile(prof);
    } catch {
      // ignore
    }
  }, []);

  const contextValue = useMemo(() => ({
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  }), [user, profile, loading, signUp, signIn, signOut, refreshProfile]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
