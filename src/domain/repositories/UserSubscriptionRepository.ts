import { UserSubscription } from '../entities/UserSubscription';

/**
 * User Subscription Repository Interface
 * Following Dependency Inversion Principle (SOLID)
 */

export interface CreateUserSubscriptionInput {
  userId: string;
  planId: string;
  status: string;
  paymentStatus: string;
  trialStartDate?: string;
  trialEndDate?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  stripeSubscriptionId?: string;
}

export abstract class UserSubscriptionRepository {
  abstract getById(subscriptionId: string): Promise<UserSubscription | null>;
  abstract getByUserId(userId: string): Promise<UserSubscription[]>;
  abstract getActiveByUserId(userId: string): Promise<UserSubscription | null>;
  abstract create(subscription: CreateUserSubscriptionInput): Promise<UserSubscription>;
  abstract update(subscriptionId: string, updates: Partial<UserSubscription>): Promise<UserSubscription | null>;
  abstract delete(subscriptionId: string): Promise<void>;
  abstract cancelSubscription(userId: string): Promise<void>;
}
