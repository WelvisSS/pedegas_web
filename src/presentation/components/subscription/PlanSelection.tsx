import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface Plan {
    id: string;
    name: string;
    price: number;
    period: string;
    description: string;
    features: string[];
    popular: boolean;
    color: string;
}

interface PlanSelectionProps {
    onPlanSelect: (plan: Plan) => void;
    loading?: boolean;
}

/**
 * Plan Selection Component
 * Component for selecting subscription plans
 * Following Single Responsibility Principle
 */
const PlanSelection = ({ onPlanSelect, loading = false }: PlanSelectionProps) => {
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const { signOut, user } = useAuth();

    const plans: Plan[] = [
        {
            id: 'trial',
            name: 'Teste Grátis',
            price: 0,
            period: '15 dias',
            description: 'Experimente todas as funcionalidades gratuitamente',
            features: [
                'Acesso completo por 15 dias',
                'Todas as funcionalidades',
                'Suporte por email',
                'Sem compromisso'
            ],
            popular: false,
            color: 'blue'
        },
        {
            id: 'basic',
            name: 'Plano Básico',
            price: 79.50,
            period: 'mês',
            description: 'Ideal para pequenas empresas',
            features: [
                'Acesso completo',
                'Suporte prioritário',
                'Relatórios avançados',
                'Integração com APIs',
                'Até 5 usuários'
            ],
            popular: true,
            color: 'green'
        },
        {
            id: 'ultra',
            name: 'Plano Ultra',
            price: 129.50,
            period: 'mês',
            description: 'Para empresas que precisam de mais',
            features: [
                'Acesso completo',
                'Suporte 24/7',
                'Relatórios personalizados',
                'Integração completa',
                'Treinamento personalizado',
                'Usuários ilimitados'
            ],
            popular: false,
            color: 'purple'
        }
    ];

    const handlePlanSelect = (plan: Plan) => {
        setSelectedPlan(plan.id);
    };

    const handleContinue = () => {
        if (selectedPlan) {
            const plan = plans.find(p => p.id === selectedPlan);
            if (plan) {
                onPlanSelect(plan);
            }
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const getPlanColorClasses = (color: string, isSelected: boolean) => {
        const baseClasses = 'border-2 transition-all duration-200 ';

        if (isSelected) {
            switch (color) {
                case 'blue':
                    return baseClasses + 'border-blue-500 bg-blue-50';
                case 'green':
                    return baseClasses + 'border-green-500 bg-green-50';
                case 'purple':
                    return baseClasses + 'border-purple-500 bg-purple-50';
                default:
                    return baseClasses + 'border-primary-500 bg-primary-50';
            }
        }

        return baseClasses + 'border-secondary-200 hover:border-secondary-300';
    };

    return (
        <div className="min-h-screen bg-secondary-50 flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-secondary-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h1 className="text-xl font-semibold text-secondary-900">
                                    PedeGás
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="text-sm text-secondary-600">
                                Olá, <span className="font-medium text-secondary-900">{user?.user_metadata?.first_name || user?.email}</span>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSignOut}
                            >
                                Sair
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="max-w-6xl w-full">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-secondary-900 mb-4">
                            Escolha seu plano
                        </h1>
                        <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
                            Selecione o plano que melhor se adequa às necessidades da sua empresa.
                            Você pode começar com o teste grátis e migrar quando quiser.
                        </p>
                    </div>

                    {/* Plans Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {plans.map((plan) => (
                            <Card
                                key={plan.id}
                                className={`relative ${getPlanColorClasses(plan.color, selectedPlan === plan.id)}`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                                            Mais Popular
                                        </span>
                                    </div>
                                )}

                                <div className="p-6">
                                    {/* Plan Header */}
                                    <div className="text-center mb-6">
                                        <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                                            {plan.name}
                                        </h3>
                                        <p className="text-secondary-600 text-sm mb-4">
                                            {plan.description}
                                        </p>

                                        {/* Price */}
                                        <div className="mb-4">
                                            <span className="text-4xl font-bold text-secondary-900">
                                                R$ {plan.price.toFixed(2).replace('.', ',')}
                                            </span>
                                            <span className="text-secondary-600 ml-1">
                                                /{plan.period}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <ul className="space-y-3 mb-6">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-start">
                                                <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-secondary-700 text-sm">
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Select Button */}
                                    <Button
                                        variant={selectedPlan === plan.id ? "primary" : "outline"}
                                        className="w-full"
                                        onClick={() => handlePlanSelect(plan)}
                                    >
                                        {selectedPlan === plan.id ? 'Selecionado' : 'Selecionar'}
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Continue Button */}
                    <div className="text-center">
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={handleContinue}
                            disabled={!selectedPlan || loading}
                            loading={loading}
                            className="px-8"
                        >
                            Continuar com o plano selecionado
                        </Button>

                        {!selectedPlan && (
                            <p className="text-secondary-500 text-sm mt-2">
                                Selecione um plano para continuar
                            </p>
                        )}
                    </div>

                    {/* Footer Info */}
                    <div className="text-center mt-8 text-sm text-secondary-500">
                        <p>
                            Todos os planos incluem suporte técnico e atualizações automáticas.
                        </p>
                        <p className="mt-1">
                            Você pode cancelar ou alterar seu plano a qualquer momento.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlanSelection;
