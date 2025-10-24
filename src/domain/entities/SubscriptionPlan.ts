interface SubscriptionPlanProps {
    id?: string;
    name: string;
    description?: string;
    price: number;
    currency?: string;
    billingPeriod?: string;
    trialDays?: number;
    features?: string[];
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

interface SubscriptionPlanJson {
    id?: string;
    name: string;
    description?: string;
    price: number | string;
    currency?: string;
    billing_period?: string;
    trial_days?: number;
    features?: string[];
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export class SubscriptionPlan {
    id?: string;
    name: string;
    description?: string;
    price: number;
    currency: string;
    billingPeriod: string;
    trialDays: number;
    features: string[];
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;

    constructor({
        id,
        name,
        description,
        price,
        currency = 'BRL',
        billingPeriod = 'monthly',
        trialDays = 0,
        features = [],
        isActive = true,
        createdAt,
        updatedAt
    }: SubscriptionPlanProps) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.currency = currency;
        this.billingPeriod = billingPeriod;
        this.trialDays = trialDays;
        this.features = features;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    get formattedPrice(): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: this.currency
        }).format(this.price);
    }

    get hasTrial(): boolean {
        return this.trialDays > 0;
    }

    static fromJson(json: SubscriptionPlanJson): SubscriptionPlan {
        return new SubscriptionPlan({
            id: json.id,
            name: json.name,
            description: json.description,
            price: typeof json.price === 'string' ? parseFloat(json.price) : json.price,
            currency: json.currency,
            billingPeriod: json.billing_period,
            trialDays: json.trial_days,
            features: json.features || [],
            isActive: json.is_active,
            createdAt: json.created_at,
            updatedAt: json.updated_at
        });
    }

    toJson(): SubscriptionPlanJson {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            price: this.price,
            currency: this.currency,
            billing_period: this.billingPeriod,
            trial_days: this.trialDays,
            features: this.features,
            is_active: this.isActive,
            created_at: this.createdAt,
            updated_at: this.updatedAt
        };
    }
}
