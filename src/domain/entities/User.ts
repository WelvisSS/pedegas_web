export interface SupabaseUser {
  id: string;
  email?: string;
  phone?: string;
  user_metadata?: {
    name?: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    phone?: string;
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
  phone?: string;
  avatarUrl?: string;
  userType?: 'individual' | 'company';
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  avatarUrl?: string;
  userType?: 'individual' | 'company';
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: UserData) {
    this.id = data.id;
    this.email = data.email;
    this.name = data.name;
    this.phone = data.phone;
    this.avatarUrl = data.avatarUrl;
    this.userType = data.userType;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static fromSupabaseUser(user: SupabaseUser): User {
    if (!user.email) {
      throw new Error('User email is required');
    }
    
    // Construir o nome completo a partir dos metadados
    const fullName = user.user_metadata?.full_name ||
      (user.user_metadata?.first_name && user.user_metadata?.last_name
        ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`.trim()
        : user.user_metadata?.name || user.email.split('@')[0]);
    
    // Buscar telefone dos metadados ou do campo phone do Supabase
    const phone = user.user_metadata?.phone || user.phone || undefined;
    
    return new User({
      id: user.id,
      email: user.email,
      name: fullName,
      phone: phone,
      avatarUrl: user.user_metadata?.avatar_url,
      userType: user.user_metadata?.user_type || 'individual',
      createdAt: user.created_at ? new Date(user.created_at) : undefined,
      updatedAt: user.updated_at ? new Date(user.updated_at) : undefined,
    });
  }
}
