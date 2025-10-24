import { AuthSession } from '../entities/AuthSession';

/**
 * Data required for user sign up
 */
export interface SignUpData {
  email: string;
  password: string;
  name?: string;
  avatarUrl?: string;
  options?: {
    data?: Record<string, unknown>;
    emailRedirectTo?: string;
  };
}

/**
 * Authentication Repository Interface
 * Following Dependency Inversion Principle (SOLID)
 */
export abstract class AuthRepository {
  /**
   * Sign in with email and password
   */
  abstract signIn(email: string, password: string): Promise<AuthSession>;

  /**
   * Sign up with user data
   */
  abstract signUp(userData: SignUpData): Promise<AuthSession>;

  /**
   * Sign out current user
   */
  abstract signOut(): Promise<void>;

  /**
   * Reset password
   */
  abstract resetPassword(email: string): Promise<void>;

  /**
   * Get current session
   */
  abstract getCurrentSession(): Promise<AuthSession | null>;

  /**
   * Listen to auth state changes
   */
  abstract onAuthStateChange(callback: (event: string, session: AuthSession | null) => void): () => void;
}
