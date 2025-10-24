import { SubscriptionPlan } from '../entities/SubscriptionPlan';

/**
 * Subscription Plan Repository Interface
 * Following Dependency Inversion Principle (SOLID)
 */
export abstract class SubscriptionPlanRepository {
  abstract getById(planId: string): Promise<SubscriptionPlan | null>;
  abstract getAll(): Promise<SubscriptionPlan[]>;
  abstract getActivePlans(): Promise<SubscriptionPlan[]>;
  abstract create(plan: Omit<SubscriptionPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<SubscriptionPlan>;
  abstract update(planId: string, updates: Partial<SubscriptionPlan>): Promise<SubscriptionPlan>;
  abstract delete(planId: string): Promise<void>;
}
