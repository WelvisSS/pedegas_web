import { UserSubscriptionRepository } from '../repositories/UserSubscriptionRepository';
import { SubscriptionPlanRepository } from '../repositories/SubscriptionPlanRepository';

/**
 * Subscription Use Case
 * Single Responsibility: Handle subscription management logic
 */
export class SubscriptionUseCase {
  constructor(
    public userSubscriptionRepository: UserSubscriptionRepository,
    public subscriptionPlanRepository: SubscriptionPlanRepository
  ) {}

  async createSubscription(userId: string, planId: string) {
    // Validate plan exists
    const plan = await this.subscriptionPlanRepository.getById(planId);
    if (!plan) {
      throw new Error('Plano não encontrado');
    }

    // Check if user already has an active subscription
    const existingSubscription = await this.userSubscriptionRepository.getActiveByUserId(userId);
    if (existingSubscription) {
      throw new Error('Usuário já possui uma assinatura ativa');
    }

    // Determine subscription status based on plan
    const status = plan.trialDays > 0 ? 'trial' : 'active';

    // Create subscription
    const subscription = await this.userSubscriptionRepository.create({
      userId,
      planId,
      status,
      paymentStatus: 'pending',
    });

    return subscription;
  }

  async getUserActiveSubscription(userId: string) {
    return await this.userSubscriptionRepository.getActiveByUserId(userId);
  }

  async getUserSubscriptions(userId: string) {
    return await this.userSubscriptionRepository.getByUserId(userId);
  }

  async hasActiveSubscription(userId: string): Promise<boolean> {
    const subscription = await this.userSubscriptionRepository.getActiveByUserId(userId);
    return subscription !== null;
  }

  async getCurrentSubscription(userId: string) {
    const subscription = await this.userSubscriptionRepository.getActiveByUserId(userId);
    
    if (!subscription) {
      return null;
    }

    return {
      id: subscription.id,
      status: subscription.status,
      createdAt: subscription.createdAt,
      trialEndDate: subscription.trialEndDate,
      subscriptionEndDate: subscription.subscriptionEndDate,
      plan: subscription.plan ? {
        id: subscription.plan.id,
        name: subscription.plan.name,
        price: subscription.plan.price,
        description: subscription.plan.description,
        trialDays: subscription.plan.trialDays || 0,
      } : undefined,
    };
  }

  async changeSubscription(userId: string, newPlanId: string) {
    // Validate new plan exists
    const newPlan = await this.subscriptionPlanRepository.getById(newPlanId);
    if (!newPlan) {
      throw new Error('Plano não encontrado');
    }

    // Get current subscription
    const currentSubscription = await this.userSubscriptionRepository.getActiveByUserId(userId);
    if (!currentSubscription) {
      throw new Error('Nenhuma assinatura ativa encontrada');
    }

    if (!currentSubscription.id) {
      throw new Error('ID da assinatura não encontrado');
    }

    // Cancel current subscription
    await this.userSubscriptionRepository.update(currentSubscription.id, {
      status: 'cancelled',
    });

    // Create new subscription
    const status = newPlan.trialDays > 0 ? 'trial' : 'active';
    const newSubscription = await this.userSubscriptionRepository.create({
      userId,
      planId: newPlanId,
      status,
      paymentStatus: 'pending',
    });

    return newSubscription;
  }

  async cancelSubscription(userId: string) {
    const subscription = await this.userSubscriptionRepository.getActiveByUserId(userId);
    
    if (!subscription) {
      throw new Error('Nenhuma assinatura ativa encontrada');
    }

    await this.userSubscriptionRepository.cancelSubscription(userId);
  }
}
