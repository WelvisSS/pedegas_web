import { SupabaseClient } from '@supabase/supabase-js';
import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';

interface UserJson {
  id?: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Supabase implementation of UserRepository
 * Following Dependency Inversion Principle
 */
export class SupabaseUserRepository extends UserRepository {
  constructor(private supabase: SupabaseClient) {
    super();
  }

  async getById(userId: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(error.message);
    }

    return this.fromJson(data);
  }

  async create(user: User): Promise<User> {
    const { data, error } = await this.supabase
      .from('profiles')
      .insert(this.toJson(user))
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return this.fromJson(data);
  }

  async update(userId: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await this.supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return this.fromJson(data);
  }

  async delete(userId: string): Promise<void> {
    const { error } = await this.supabase.from('profiles').delete().eq('id', userId);

    if (error) {
      throw new Error(error.message);
    }
  }

  private fromJson(json: UserJson): User {
    return new User({
      id: json.id!,
      email: json.email,
      name: json.name,
      avatarUrl: json.avatar_url,
      createdAt: json.created_at ? new Date(json.created_at) : undefined,
      updatedAt: json.updated_at ? new Date(json.updated_at) : undefined
    });
  }

  private toJson(user: User): UserJson {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatarUrl,
      created_at: user.createdAt?.toISOString(),
      updated_at: user.updatedAt?.toISOString()
    };
  }
}
