import { useCallback, useEffect, useState } from 'react';
import { SubscriptionService } from '../../../application/services/SubscriptionService.ts';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import Alert from '../ui/Alert';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Sidebar from '../ui/Sidebar';

interface Plan {
    id: string;
    name: string;
    price: number;
    description: string;
    trialDays: number;
}

interface Subscription {
    id: string;
    status: string;
    createdAt: string;
    plan?: Plan;
}

interface SubscriptionScreenProps {
    onNavigate?: (screen: string) => void;
    activeScreen?: string;
}

/**
 * Subscription Screen Component
 * Component for managing user subscription
 * Following Single Responsibility Principle
 */
const SubscriptionScreen = ({ onNavigate, activeScreen = 'subscription' }: SubscriptionScreenProps) => {
    const { user, signOut } = useAuth();
    const [subscriptionService] = useState(() => new SubscriptionService(supabase));
    const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
    const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [showChangePlanDialog, setShowChangePlanDialog] = useState(false);
    const [selectedNewPlan, setSelectedNewPlan] = useState<Plan | null>(null);
    const [alert, setAlert] = useState<{ show: boolean; type: 'info' | 'success' | 'error' | 'warning'; message: string }>({ show: false, type: 'info', message: '' });

    // Sidebar states
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Detect screen size
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const loadSubscriptionData = useCallback(async () => {
        try {
            setLoading(true);

            if (!user) return;

            // Load current subscription
            const subscription = await subscriptionService.getCurrentSubscription(user.id);
            setCurrentSubscription(subscription);

            // Load available plans
            const plans = await subscriptionService.getAvailablePlans();
            setAvailablePlans(plans);

        } catch (error) {
            console.error('Error loading subscription data:', error);
            showAlert('error', 'Erro ao carregar dados da assinatura');
        } finally {
            setLoading(false);
        }
    }, [user, subscriptionService]);

    useEffect(() => {
        loadSubscriptionData();
    }, [loadSubscriptionData]);

    const showAlert = (type: 'info' | 'success' | 'error' | 'warning', message: string) => {
        setAlert({ show: true, type, message });
        setTimeout(() => {
            setAlert({ show: false, type: 'info', message: '' });
        }, 5000);
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    const toggleSidebarCollapse = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const handleMenuToggle = () => {
        if (isMobile) {
            toggleSidebar();
        } else {
            toggleSidebarCollapse();
        }
    };

    const handleNavigation = (screen: string) => {
        if (screen === 'dashboard') {
            onNavigate?.('dashboard');
        } else if (screen === 'gas-stations') {
            onNavigate?.('gas-stations');
        } else if (screen === 'deliveries') {
            onNavigate?.('deliveries');
        } else if (screen === 'deliverymen') {
            onNavigate?.('deliverymen');
        } else if (screen === 'orders') {
            onNavigate?.('orders');
        }
        // Close sidebar on mobile after navigation
        if (isMobile) {
            closeSidebar();
        }
    };

    const handleChangePlan = (newPlanId: string) => {
        const plan = availablePlans.find(p => p.id === newPlanId);
        if (plan) {
            setSelectedNewPlan(plan);
            setShowChangePlanDialog(true);
        }
    };

    const confirmChangePlan = async () => {
        if (!selectedNewPlan || !user) return;

        try {
            setActionLoading(true);

            await subscriptionService.changeSubscription(user.id, selectedNewPlan.id);

            showAlert('success', 'Plano alterado com sucesso!');
            setShowChangePlanDialog(false);
            setSelectedNewPlan(null);
            await loadSubscriptionData();

        } catch (error) {
            console.error('Error changing plan:', error);
            showAlert('error', 'Erro ao alterar plano. Tente novamente.');
        } finally {
            setActionLoading(false);
        }
    };

    const cancelChangePlan = () => {
        setShowChangePlanDialog(false);
        setSelectedNewPlan(null);
    };

    const handleCancelSubscription = () => {
        setShowCancelDialog(true);
    };

    const confirmCancelSubscription = async () => {
        if (!user) return;

        try {
            setActionLoading(true);

            await subscriptionService.cancelSubscription(user.id);

            showAlert('success', 'Assinatura cancelada com sucesso!');
            setShowCancelDialog(false);
            await loadSubscriptionData();

        } catch (error) {
            console.error('Error canceling subscription:', error);
            showAlert('error', 'Erro ao cancelar assinatura. Tente novamente.');
        } finally {
            setActionLoading(false);
        }
    };

    const cancelCancelSubscription = () => {
        setShowCancelDialog(false);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const calculateEndDate = (subscription: Subscription | null) => {
        if (!subscription) return null;

        const startDate = new Date(subscription.createdAt);
        const plan = subscription.plan;

        if (!plan) return null;

        // Se for plano de teste (trialDays > 0), adiciona 15 dias
        if (plan.trialDays > 0) {
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 15);
            return endDate.toISOString();
        }

        // Se for plano pago (trialDays = 0), adiciona 30 dias
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 30);
        return endDate.toISOString();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'text-green-600 bg-green-100';
            case 'trial':
                return 'text-blue-600 bg-blue-100';
            case 'cancelled':
                return 'text-red-600 bg-red-100';
            case 'expired':
                return 'text-gray-600 bg-gray-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active':
                return 'Ativa';
            case 'trial':
                return 'Período de Teste';
            case 'cancelled':
                return 'Cancelada';
            case 'expired':
                return 'Expirada';
            default:
                return 'Desconhecido';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-secondary-50">
                {/* Sidebar */}
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={closeSidebar}
                    isCollapsed={sidebarCollapsed}
                    onToggle={toggleSidebarCollapse}
                    userType={user?.userType || 'individual'}
                    onNavigate={handleNavigation}
                    activeScreen={activeScreen}
                />

                {/* Loading Area */}
                <div className={`
                    flex-1 flex items-center justify-center min-h-screen transition-all duration-300 ease-in-out
                    ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
                `}>
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        <p className="text-secondary-600">Carregando assinatura...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary-50">
            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                onClose={closeSidebar}
                isCollapsed={sidebarCollapsed}
                onToggle={toggleSidebarCollapse}
                userType={user?.userType || 'individual'}
                onNavigate={handleNavigation}
                activeScreen={activeScreen}
            />

            {/* Main Content Area */}
            <div className={`
                flex-1 flex flex-col transition-all duration-300 ease-in-out min-h-screen
                ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
            `}>
                {/* Header - Fixed */}
                <header className="bg-white shadow-sm border-b border-secondary-200 sticky top-0 z-40">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center">
                                {/* Mobile menu toggle button only */}
                                {isMobile && (
                                    <button
                                        onClick={handleMenuToggle}
                                        className="p-2 rounded-md text-secondary-400 hover:text-secondary-500 hover:bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 mr-3"
                                    >
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                    </button>
                                )}

                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h1 className="text-xl font-semibold text-secondary-900">
                                            Minha Assinatura
                                        </h1>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="text-sm text-secondary-600">
                                    Olá, <span className="font-medium text-secondary-900">{user?.name || user?.email}</span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={signOut}
                                >
                                    Sair
                                </Button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content - Scrollable */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {alert.show && (
                            <div className="mb-6">
                                <Alert type={alert.type} message={alert.message} />
                            </div>
                        )}

                        {/* Current Subscription */}
                        <Card className="mb-8">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-bold text-secondary-900">
                                        Assinatura Atual
                                    </h2>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentSubscription?.status || '')}`}>
                                        {getStatusText(currentSubscription?.status || '')}
                                    </span>
                                </div>

                                {currentSubscription ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                                                {currentSubscription.plan?.name || 'Plano não encontrado'}
                                            </h3>
                                            <p className="text-secondary-600 mb-4">
                                                {currentSubscription.plan?.description || 'Descrição não disponível'}
                                            </p>
                                            <div className="text-3xl font-bold text-primary-600">
                                                R$ {currentSubscription.plan?.price?.toFixed(2) || '0,00'}
                                                <span className="text-lg font-normal text-secondary-500">
                                                    /{currentSubscription.plan?.trialDays && currentSubscription.plan.trialDays > 0 ? `${currentSubscription.plan?.trialDays} dias` : 'mês'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <span className="text-sm font-medium text-secondary-500">Data de Início:</span>
                                                <p className="text-secondary-900">
                                                    {formatDate(currentSubscription.createdAt)}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-secondary-500">Data de Vencimento:</span>
                                                <p className="text-secondary-900">
                                                    {calculateEndDate(currentSubscription) && formatDate(calculateEndDate(currentSubscription)!)}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-secondary-500">Status:</span>
                                                <p className={`font-medium ${getStatusColor(currentSubscription.status).split(' ')[0]}`}>
                                                    {getStatusText(currentSubscription.status)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-medium text-secondary-900 mb-2">
                                            Nenhuma assinatura ativa
                                        </h3>
                                        <p className="text-secondary-600 mb-4">
                                            Você não possui uma assinatura ativa no momento.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Available Plans Section */}
                        <Card>
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-secondary-900 mb-6">
                                    Planos Disponíveis
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {availablePlans.map((plan) => (
                                        <div
                                            key={plan.id}
                                            className={`border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 ${plan.id === currentSubscription?.plan?.id
                                                ? 'border-primary-500 bg-primary-50'
                                                : 'border-secondary-200 hover:border-primary-300 hover:shadow-md'
                                                }`}
                                            onClick={() => plan.id !== currentSubscription?.plan?.id && handleChangePlan(plan.id)}
                                        >
                                            <div className="text-center">
                                                <h4 className="text-lg font-semibold text-secondary-900 mb-2">
                                                    {plan.name}
                                                </h4>
                                                <p className="text-secondary-600 text-sm mb-4">
                                                    {plan.description}
                                                </p>
                                                <div className="text-2xl font-bold text-primary-600 mb-2">
                                                    R$ {plan.price.toFixed(2)}
                                                    <span className="text-sm font-normal text-secondary-500">
                                                        /{plan.trialDays > 0 ? `${plan.trialDays} dias` : 'mês'}
                                                    </span>
                                                </div>

                                                {plan.id === currentSubscription?.plan?.id ? (
                                                    <div className="text-sm text-primary-600 font-medium">
                                                        Plano Atual
                                                    </div>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        disabled={actionLoading}
                                                        className="w-full"
                                                    >
                                                        Selecionar
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        {/* Cancel Subscription - Discrete at bottom */}
                        {currentSubscription && currentSubscription.status === 'active' && (
                            <div className="mt-12 pt-8 border-t border-secondary-200">
                                <div className="text-center">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleCancelSubscription}
                                        disabled={actionLoading}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        Cancelar Assinatura
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Change Plan Dialog */}
            {showChangePlanDialog && selectedNewPlan && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="p-6">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-secondary-900">
                                    Alterar Plano
                                </h3>
                            </div>

                            <div className="mb-6">
                                <p className="text-secondary-600 mb-4">
                                    Você está prestes a alterar seu plano de assinatura. Esta ação resultará em mudanças na cobrança.
                                </p>

                                {/* Current Plan */}
                                <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-4">
                                    <h4 className="text-sm font-medium text-gray-800 mb-2">Plano Atual</h4>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-900">{currentSubscription?.plan?.name || 'N/A'}</span>
                                        <span className="text-gray-600">R$ {currentSubscription?.plan?.price?.toFixed(2) || '0,00'}</span>
                                    </div>
                                </div>

                                {/* New Plan */}
                                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                                    <h4 className="text-sm font-medium text-blue-800 mb-2">Novo Plano</h4>
                                    <div className="flex justify-between items-center">
                                        <span className="text-blue-900">{selectedNewPlan.name}</span>
                                        <span className="text-blue-600 font-semibold">R$ {selectedNewPlan.price.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Billing Information */}
                                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h4 className="text-sm font-medium text-yellow-800">
                                                Informações de Cobrança
                                            </h4>
                                            <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                                                <li>• A cobrança será ajustada imediatamente</li>
                                                <li>• O novo valor será aplicado no próximo ciclo</li>
                                                <li>• Você receberá um e-mail de confirmação</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <Button
                                    variant="outline"
                                    onClick={cancelChangePlan}
                                    disabled={actionLoading}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={confirmChangePlan}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? 'Alterando...' : 'Confirmar Alteração'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Subscription Dialog */}
            {showCancelDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="p-6">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-secondary-900">
                                    Cancelar Assinatura
                                </h3>
                            </div>

                            <div className="mb-6">
                                <p className="text-secondary-600 mb-4">
                                    Tem certeza que deseja cancelar sua assinatura? Esta ação não pode ser desfeita.
                                </p>
                                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h4 className="text-sm font-medium text-yellow-800">
                                                Aviso Importante
                                            </h4>
                                            <p className="text-sm text-yellow-700 mt-1">
                                                Após o cancelamento, você perderá acesso aos recursos premium e sua assinatura será encerrada na data de vencimento.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <Button
                                    variant="outline"
                                    onClick={cancelCancelSubscription}
                                    disabled={actionLoading}
                                >
                                    Manter Assinatura
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={confirmCancelSubscription}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? 'Cancelando...' : 'Sim, Cancelar'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscriptionScreen;
