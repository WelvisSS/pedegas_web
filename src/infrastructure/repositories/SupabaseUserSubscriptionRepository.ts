import { SupabaseClient } from '@supabase/supabase-js';
import { UserSubscription } from '../../domain/entities/UserSubscription';
import { UserSubscriptionRepository } from '../../domain/repositories/UserSubscriptionRepository';

/**
 * Supabase implementation of UserSubscriptionRepository
 * Following Dependency Inversion Principle
 */
export class SupabaseUserSubscriptionRepository extends UserSubscriptionRepository {
  constructor(private supabase: SupabaseClient) {
    super();
  }

  async getById(subscriptionId: string): Promise<UserSubscription | null> {
    const { data, error } = await this.supabase
      .from('user_subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(error.message);
    }

    return UserSubscription.fromJson(data);
  }

  async getByUserId(userId: string): Promise<UserSubscription[]> {
    const { data, error } = await this.supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data.map(subscription => UserSubscription.fromJson(subscription));
  }

  async create(subscription: UserSubscription): Promise<UserSubscription> {
    const { data, error } = await this.supabase
      .from('user_subscriptions')
      .insert(subscription.toJson())
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return UserSubscription.fromJson(data);
  }

  async update(subscriptionId: string, updates: Partial<UserSubscription>): Promise<UserSubscription> {
    const { data, error } = await this.supabase
      .from('user_subscriptions')
      .update(updates)
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return UserSubscription.fromJson(data);
  }

  async getActiveByUserId(userId: string): Promise<UserSubscription | null> {
    const { data, error } = await this.supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'trial'])
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      throw new Error(error.message);
    }

    if (data.length === 0) {
      return null;
    }

    return UserSubscription.fromJson(data[0]);
  }

  async delete(subscriptionId: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_subscriptions')
      .delete()
      .eq('id', subscriptionId);

    if (error) {
      throw new Error(error.message);
    }
  }

  async cancelSubscription(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_subscriptions')
      .update({ status: 'cancelled' })
      .eq('user_id', userId)
      .in('status', ['active', 'trial']);

    if (error) {
      throw new Error(error.message);
    }
  }
}
