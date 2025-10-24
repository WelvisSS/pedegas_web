import { SubscriptionPlan } from './SubscriptionPlan';

interface UserSubscriptionProps {
    id?: string;
    userId: string;
    planId: string;
    status?: string;
    trialStartDate?: string;
    trialEndDate?: string;
    subscriptionStartDate?: string;
    subscriptionEndDate?: string;
    paymentStatus?: string;
    stripeSubscriptionId?: string;
    createdAt?: string;
    updatedAt?: string;
    plan?: SubscriptionPlan; // Joined plan data from repository
}

export class UserSubscription {
    id?: string;
    userId: string;
    planId: string;
    status: string; // active, cancelled, expired, trial
    trialStartDate?: string;
    trialEndDate?: string;
    subscriptionStartDate?: string;
    subscriptionEndDate?: string;
    paymentStatus: string; // pending, paid, failed, refunded
    stripeSubscriptionId?: string;
    createdAt?: string;
    updatedAt?: string;
    plan?: SubscriptionPlan; // Joined plan data from repository

    constructor({
        id,
        userId,
        planId,
        status = 'active',
        trialStartDate,
        trialEndDate,
        subscriptionStartDate,
        subscriptionEndDate,
        paymentStatus = 'pending',
        stripeSubscriptionId,
        createdAt,
        updatedAt,
        plan
    }: UserSubscriptionProps) {
        this.id = id;
        this.userId = userId;
        this.planId = planId;
        this.status = status;
        this.trialStartDate = trialStartDate;
        this.trialEndDate = trialEndDate;
        this.subscriptionStartDate = subscriptionStartDate;
        this.subscriptionEndDate = subscriptionEndDate;
        this.paymentStatus = paymentStatus;
        this.stripeSubscriptionId = stripeSubscriptionId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.plan = plan;
    }

    get isActive(): boolean {
        return this.status === 'active' || this.status === 'trial';
    }

    get isTrial(): boolean {
        return this.status === 'trial';
    }

    get isExpired(): boolean {
        if (this.isTrial && this.trialEndDate) {
            return new Date() > new Date(this.trialEndDate);
        }
        if (this.subscriptionEndDate) {
            return new Date() > new Date(this.subscriptionEndDate);
        }
        return false;
    }

    get daysRemaining(): number {
        if (this.isTrial && this.trialEndDate) {
            const remaining = Math.ceil((new Date(this.trialEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            return Math.max(0, remaining);
        }
        if (this.subscriptionEndDate) {
            const remaining = Math.ceil((new Date(this.subscriptionEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            return Math.max(0, remaining);
        }
        return 0;
    }

    static fromJson(json: Record<string, unknown>): UserSubscription {
        return new UserSubscription({
            id: json.id as string | undefined,
            userId: json.user_id as string,
            planId: json.plan_id as string,
            status: json.status as string | undefined,
            trialStartDate: json.trial_start_date as string | undefined,
            trialEndDate: json.trial_end_date as string | undefined,
            subscriptionStartDate: json.subscription_start_date as string | undefined,
            subscriptionEndDate: json.subscription_end_date as string | undefined,
            paymentStatus: json.payment_status as string | undefined,
            stripeSubscriptionId: json.stripe_subscription_id as string | undefined,
            createdAt: json.created_at as string | undefined,
            updatedAt: json.updated_at as string | undefined
        });
    }

    toJson(): Record<string, unknown> {
        return {
            id: this.id,
            user_id: this.userId,
            plan_id: this.planId,
            status: this.status,
            trial_start_date: this.trialStartDate,
            trial_end_date: this.trialEndDate,
            subscription_start_date: this.subscriptionStartDate,
            subscription_end_date: this.subscriptionEndDate,
            payment_status: this.paymentStatus,
            stripe_subscription_id: this.stripeSubscriptionId,
            created_at: this.createdAt,
            updated_at: this.updatedAt
        };
    }
}
