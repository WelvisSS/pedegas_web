import { SupabaseClient } from '@supabase/supabase-js';
import { SubscriptionPlan } from '../../domain/entities/SubscriptionPlan';
import { SubscriptionPlanRepository } from '../../domain/repositories/SubscriptionPlanRepository';

/**
 * Supabase implementation of SubscriptionPlanRepository
 * Following Dependency Inversion Principle
 */
export class SupabaseSubscriptionPlanRepository extends SubscriptionPlanRepository {
  constructor(private supabase: SupabaseClient) {
    super();
  }

  async getAll(): Promise<SubscriptionPlan[]> {
    const { data, error } = await this.supabase
      .from('subscription_plans')
      .select('*')
      .order('price', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return data.map(plan => SubscriptionPlan.fromJson(plan));
  }

  async getById(planId: string): Promise<SubscriptionPlan | null> {
    const { data, error } = await this.supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(error.message);
    }

    return SubscriptionPlan.fromJson(data);
  }

  async getActivePlans(): Promise<SubscriptionPlan[]> {
    const { data, error } = await this.supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return data.map(plan => SubscriptionPlan.fromJson(plan));
  }

  async create(plan: Omit<SubscriptionPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<SubscriptionPlan> {
    const planData = {
      name: plan.name,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      billing_period: plan.billingPeriod,
      trial_days: plan.trialDays,
      features: plan.features,
      is_active: plan.isActive
    };

    const { data, error } = await this.supabase
      .from('subscription_plans')
      .insert(planData)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return SubscriptionPlan.fromJson(data);
  }

  async update(planId: string, updates: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    const updateData: Record<string, string | number | string[] | boolean | undefined> = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.price !== undefined) updateData.price = updates.price;
    if (updates.currency !== undefined) updateData.currency = updates.currency;
    if (updates.billingPeriod !== undefined) updateData.billing_period = updates.billingPeriod;
    if (updates.trialDays !== undefined) updateData.trial_days = updates.trialDays;
    if (updates.features !== undefined) updateData.features = updates.features;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

    const { data, error } = await this.supabase
      .from('subscription_plans')
      .update(updateData)
      .eq('id', planId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return SubscriptionPlan.fromJson(data);
  }

  async delete(planId: string): Promise<void> {
    const { error } = await this.supabase
      .from('subscription_plans')
      .delete()
      .eq('id', planId);

    if (error) {
      throw new Error(error.message);
    }
  }
}
