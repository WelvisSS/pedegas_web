import { useEffect, useState, useMemo, type ReactNode } from 'react';
import { AuthService } from '../../application/services/AuthService';
import { SupabaseAuthRepository } from '../../infrastructure/repositories/SupabaseAuthRepository';
import { SupabaseCompanyRepository } from '../../infrastructure/repositories/SupabaseCompanyRepository';
import { SupabaseUserRepository } from '../../infrastructure/repositories/SupabaseUserRepository';
import { supabase } from '../../lib/supabaseClient';
import type { SignUpData } from '../../domain/usecases/SignUpUseCase';
import type { AuthSession } from '../../domain/entities/AuthSession';
import { User } from '../../domain/entities/User';
import { AuthContext, type AuthContextType } from '../contexts/AuthContext';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize services following Dependency Injection
  const authService = useMemo(() => {
    const authRepository = new SupabaseAuthRepository(supabase);
    const userRepository = new SupabaseUserRepository(supabase);
    const companyRepository = new SupabaseCompanyRepository(supabase);
    return new AuthService(authRepository, userRepository, companyRepository);
  }, []);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const currentSession = await authService.getCurrentSession();
        if (currentSession && currentSession.isValid) {
          setSession(currentSession);
          setUser(currentSession.user);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const unsubscribe = authService.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [authService]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await authService.signIn(email, password);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (userData: SignUpData) => {
    setLoading(true);
    try {
      const result = await authService.signUp(userData);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const result = await authService.signOut();
      setUser(null);
      setSession(null);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    return await authService.resetPassword(email);
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
