import { createContext, useContext } from 'react';
import type { SignUpData } from '../../domain/usecases/SignUpUseCase';
import type { AuthSession } from '../../domain/entities/AuthSession';
import { User } from '../../domain/entities/User';

export interface AuthContextType {
  user: User | null;
  session: AuthSession | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; message: string; session?: AuthSession }>;
  signUp: (userData: SignUpData) => Promise<{ success: boolean; message: string; session?: AuthSession }>;
  signOut: () => Promise<{ success: boolean; message: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
