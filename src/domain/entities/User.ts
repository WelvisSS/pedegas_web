export interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
    user_type?: 'individual' | 'company';
  };
  created_at?: string;
  updated_at?: string;
}

export interface UserData {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  userType?: 'individual' | 'company';
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  userType?: 'individual' | 'company';
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: UserData) {
    this.id = data.id;
    this.email = data.email;
    this.name = data.name;
    this.avatarUrl = data.avatarUrl;
    this.userType = data.userType;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static fromSupabaseUser(user: SupabaseUser): User {
    if (!user.email) {
      throw new Error('User email is required');
    }
    
    return new User({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email.split('@')[0],
      avatarUrl: user.user_metadata?.avatar_url,
      userType: user.user_metadata?.user_type || 'individual',
      createdAt: user.created_at ? new Date(user.created_at) : undefined,
      updatedAt: user.updated_at ? new Date(user.updated_at) : undefined,
    });
  }
}
