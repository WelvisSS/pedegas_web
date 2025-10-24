import type { SupabaseClient } from '@supabase/supabase-js';
import { SubscriptionUseCase } from '../../domain/usecases/SubscriptionUseCase';
import { SupabaseSubscriptionPlanRepository } from '../../infrastructure/repositories/SupabaseSubscriptionPlanRepository';
import { SupabaseUserSubscriptionRepository } from '../../infrastructure/repositories/SupabaseUserSubscriptionRepository';

/**
 * Subscription Service
 * Application service for subscription management
 * Following Dependency Injection Principle
 */
export class SubscriptionService {
    private subscriptionUseCase: SubscriptionUseCase;

    constructor(supabaseClient: SupabaseClient) {
        const subscriptionPlanRepository = new SupabaseSubscriptionPlanRepository(supabaseClient);
        const userSubscriptionRepository = new SupabaseUserSubscriptionRepository(supabaseClient);

        this.subscriptionUseCase = new SubscriptionUseCase(
            userSubscriptionRepository,
            subscriptionPlanRepository
        );
    }

    async createSubscription(userId: string, planId: string) {
        return await this.subscriptionUseCase.createSubscription(userId, planId);
    }

    async getUserActiveSubscription(userId: string) {
        return await this.subscriptionUseCase.getUserActiveSubscription(userId);
    }

    async getUserSubscriptions(userId: string) {
        return await this.subscriptionUseCase.getUserSubscriptions(userId);
    }

    async hasActiveSubscription(userId: string) {
        return await this.subscriptionUseCase.hasActiveSubscription(userId);
    }

    async getAvailablePlans() {
        return await this.subscriptionUseCase.subscriptionPlanRepository.getActivePlans();
    }

    async getCurrentSubscription(userId: string) {
        return await this.subscriptionUseCase.getCurrentSubscription(userId);
    }

    async changeSubscription(userId: string, newPlanId: string) {
        return await this.subscriptionUseCase.changeSubscription(userId, newPlanId);
    }

    async cancelSubscription(userId: string) {
        return await this.subscriptionUseCase.cancelSubscription(userId);
    }
}
