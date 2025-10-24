import { SupabaseClient } from '@supabase/supabase-js';
import { AuthSession } from '../../domain/entities/AuthSession';
import { AuthRepository, type SignUpData } from '../../domain/repositories/AuthRepository';

/**
 * Supabase implementation of AuthRepository
 * Following Dependency Inversion Principle
 */
export class SupabaseAuthRepository extends AuthRepository {
  constructor(private supabase: SupabaseClient) {
    super();
  }

  async signIn(email: string, password: string): Promise<AuthSession> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    const session = AuthSession.fromSupabaseSession(data.session);
    if (!session) {
      throw new Error('Failed to create session');
    }

    return session;
  }

  async signUp(userData: SignUpData): Promise<AuthSession> {
    const { data, error } = await this.supabase.auth.signUp(userData);

    if (error) {
      throw new Error(error.message);
    }

    const session = AuthSession.fromSupabaseSession(data.session);
    if (!session) {
      throw new Error('Failed to create session');
    }

    return session;
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    const { data, error } = await this.supabase.auth.getSession();

    if (error) {
      throw new Error(error.message);
    }

    return AuthSession.fromSupabaseSession(data.session);
  }

  onAuthStateChange(callback: (event: string, session: AuthSession | null) => void): () => void {
    const {
      data: { subscription },
    } = this.supabase.auth.onAuthStateChange((event, session) => {
      const authSession = AuthSession.fromSupabaseSession(session);
      callback(event, authSession);
    });

    return () => subscription.unsubscribe();
  }
}
