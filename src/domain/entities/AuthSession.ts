import { User } from './User';
import type { SupabaseUser } from './User';

interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  user: SupabaseUser;
  expires_at?: number;
}

export interface AuthSessionData {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresAt: Date | null;
}

export class AuthSession {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresAt: Date | null;

  constructor({ accessToken, refreshToken, user, expiresAt }: AuthSessionData) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.user = user;
    this.expiresAt = expiresAt;
  }

  get isValid(): boolean {
    if (!this.accessToken || !this.user) return false;
    if (this.expiresAt && new Date() >= new Date(this.expiresAt)) return false;
    return true;
  }

  get isExpired(): boolean {
    return !this.isValid;
  }

  static fromSupabaseSession(session: SupabaseSession | null): AuthSession | null {
    if (!session) return null;

    return new AuthSession({
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      user: User.fromSupabaseUser(session.user),
      expiresAt: session.expires_at ? new Date(session.expires_at * 1000) : null,
    });
  }
}
