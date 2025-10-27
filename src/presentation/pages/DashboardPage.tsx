import { useCallback, useEffect, useState } from 'react';
import { SubscriptionService } from '../../application/services/SubscriptionService';
import { SubscriptionPlan } from '../../domain/entities/SubscriptionPlan';
import { supabase } from '../../lib/supabaseClient';
import DeliveryScreen from '../components/deliveries/DeliveryScreen';
import DeliverymanScreen from '../components/deliverymen/DeliverymanScreen';
import GasStationScreen from '../components/gas-stations/GasStationScreen';
import InventoryScreen from '../components/inventory/InventoryScreen';
import OrderScreen from '../components/orders/OrderScreen';
import PlanSelection from '../components/subscription/PlanSelection';
import SubscriptionScreen from '../components/subscription/SubscriptionScreen';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Sidebar from '../components/ui/Sidebar';
import { useAuth } from '../contexts/AuthContext';

interface Plan {
    id: string;
    name: string;
    price?: number;
    features?: string[];
}

/**
 * Dashboard Page
 * Main page for authenticated users
 * Following Single Responsibility Principle
 */
const DashboardPage = () => {
    const { user, signOut, loading } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showPlanSelection, setShowPlanSelection] = useState(false);
    const [showSubscriptionScreen, setShowSubscriptionScreen] = useState(false);
    const [showGasStationScreen, setShowGasStationScreen] = useState(false);
    const [showInventoryScreen, setShowInventoryScreen] = useState(false);
    const [showDeliveryScreen, setShowDeliveryScreen] = useState(false);
    const [showOrderScreen, setShowOrderScreen] = useState(false);
    const [showDeliverymanScreen, setShowDeliverymanScreen] = useState(false);
    const [activeScreen, setActiveScreen] = useState('dashboard'); // Track active screen
    const [subscriptionLoading, setSubscriptionLoading] = useState(false);
    const [checkingSubscription, setCheckingSubscription] = useState(false);
    const [subscriptionChecked, setSubscriptionChecked] = useState(false);
    const [subscriptionService] = useState(() => new SubscriptionService(supabase));

    // Detect screen size
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Handle visibility change to prevent unnecessary re-checks
    useEffect(() => {
        const handleVisibilityChange = () => {
            // When tab becomes visible again, don't re-check subscription
            // unless it's the first time or user has changed
            if (document.visibilityState === 'visible' && subscriptionChecked) {
                // Tab is visible and subscription already checked, do nothing
                return;
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [subscriptionChecked]);

    // Memoize the subscription check function to avoid recreating it
    const checkSubscriptionStatus = useCallback(async () => {
        // Only check if we have a user and haven't checked yet
        if (!user || subscriptionChecked) {
            return;
        }

        if (user.userType === 'company') {
            try {
                setCheckingSubscription(true);

                // Get current subscription to check if it's still valid
                const currentSubscription = await subscriptionService.getCurrentSubscription(user.id);

                if (!currentSubscription) {
                    // No subscription at all, show plan selection
                    setShowPlanSelection(true);
                } else {
                    // Check if subscription is still valid (even if cancelled)
                    const endDateString = currentSubscription.subscriptionEndDate || currentSubscription.trialEndDate;
                    
                    if (!endDateString) {
                        // No end date set, treat as expired
                        setShowPlanSelection(true);
                    } else {
                        const now = new Date();
                        const endDate = new Date(endDateString);

                        if (now > endDate) {
                            // Subscription has expired, show plan selection
                            setShowPlanSelection(true);
                        } else {
                            // Subscription is still valid (even if cancelled), show dashboard
                            setShowPlanSelection(false);
                        }
                    }
                }

            } catch (error) {
                console.error('Error checking subscription status:', error);
                // If there's an error, show plan selection as fallback
                setShowPlanSelection(true);
            } finally {
                setCheckingSubscription(false);
                setSubscriptionChecked(true);
            }
        } else {
            // For individual users, no need to check subscription
            setCheckingSubscription(false);
            setSubscriptionChecked(true);
        }
    }, [user, subscriptionChecked, subscriptionService]);

    // Check if user needs to select a plan
    useEffect(() => {
        checkSubscriptionStatus();
    }, [checkSubscriptionStatus]);

    const handleSignOut = async () => {
        try {
            // Reset subscription state before signing out
            setSubscriptionChecked(false);
            setCheckingSubscription(false);
            setShowPlanSelection(false);
            setShowSubscriptionScreen(false);
            setShowGasStationScreen(false);
            setShowInventoryScreen(false);

            await signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
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
        setActiveScreen(screen); // Update active screen

        // Impedir que pessoas jurídicas acessem a tela de pedidos
        if (screen === 'orders' && user?.userType === 'company') {
            console.warn('Acesso negado: Pessoas jurídicas não podem acessar a tela de pedidos');
            return;
        }

        if (screen === 'subscription') {
            setShowSubscriptionScreen(true);
            setShowGasStationScreen(false);
            setShowInventoryScreen(false);
            setShowDeliveryScreen(false);
            setShowOrderScreen(false);
            setShowDeliverymanScreen(false);
        } else if (screen === 'gas-stations') {
            setShowGasStationScreen(true);
            setShowSubscriptionScreen(false);
            setShowInventoryScreen(false);
            setShowDeliveryScreen(false);
            setShowOrderScreen(false);
            setShowDeliverymanScreen(false);
        } else if (screen === 'inventory') {
            setShowInventoryScreen(true);
            setShowSubscriptionScreen(false);
            setShowGasStationScreen(false);
            setShowDeliveryScreen(false);
            setShowOrderScreen(false);
            setShowDeliverymanScreen(false);
        } else if (screen === 'deliveries') {
            setShowDeliveryScreen(true);
            setShowSubscriptionScreen(false);
            setShowGasStationScreen(false);
            setShowInventoryScreen(false);
            setShowOrderScreen(false);
            setShowDeliverymanScreen(false);
        } else if (screen === 'orders') {
            setShowOrderScreen(true);
            setShowSubscriptionScreen(false);
            setShowGasStationScreen(false);
            setShowInventoryScreen(false);
            setShowDeliveryScreen(false);
            setShowDeliverymanScreen(false);
        } else if (screen === 'deliverymen') {
            setShowDeliverymanScreen(true);
            setShowSubscriptionScreen(false);
            setShowGasStationScreen(false);
            setShowInventoryScreen(false);
            setShowDeliveryScreen(false);
            setShowOrderScreen(false);
        } else if (screen === 'dashboard') {
            setShowSubscriptionScreen(false);
            setShowGasStationScreen(false);
            setShowInventoryScreen(false);
            setShowDeliveryScreen(false);
            setShowOrderScreen(false);
            setShowDeliverymanScreen(false);
        } else {
            setShowSubscriptionScreen(false);
            setShowGasStationScreen(false);
            setShowInventoryScreen(false);
            setShowDeliveryScreen(false);
            setShowOrderScreen(false);
            setShowDeliverymanScreen(false);
        }
    };

    const handlePlanSelect = async (plan: Plan) => {
        setSubscriptionLoading(true);
        try {
            // Get the actual plan ID from database
            const plans = await subscriptionService.getAvailablePlans();
            console.log('Available plans:', plans);
            console.log('Selected plan:', plan);

            // Map plan names to find the correct database plan
            const planMapping: Record<string, string> = {
                'teste grátis': 'trial',
                'plano básico': 'basic',
                'plano ultra': 'ultra'
            };

            const selectedPlan = plans.find((p: SubscriptionPlan) => {
                const planName = p.name.toLowerCase();
                const selectedPlanName = plan.name.toLowerCase();

                // Try exact match first
                if (planName === selectedPlanName) return true;

                // Try mapping
                const mappedId = planMapping[selectedPlanName];
                if (mappedId && p.name.toLowerCase().includes(mappedId)) return true;

                // Try partial match
                return planName.includes(selectedPlanName) || selectedPlanName.includes(planName);
            });

            console.log('Found plan:', selectedPlan);

            if (!selectedPlan) {
                throw new Error('Plano não encontrado');
            }

            if (!selectedPlan.id) {
                throw new Error('ID do plano não encontrado');
            }

            if (!user) {
                throw new Error('Usuário não autenticado');
            }

            const userId = user.id;

            // Create subscription with real plan ID
            await subscriptionService.createSubscription(userId, selectedPlan.id);

            // Hide plan selection and show dashboard
            setShowPlanSelection(false);

        } catch (error) {
            console.error('Error creating subscription:', error);
            alert('Erro ao criar assinatura. Tente novamente.');
        } finally {
            setSubscriptionLoading(false);
        }
    };

    // Show loading while checking subscription status
    if (checkingSubscription) {
        return (
            <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-secondary-600">Verificando assinatura...</p>
                </div>
            </div>
        );
    }

    // Show plan selection for company users without subscription
    if (showPlanSelection) {
        return (
            <PlanSelection
                onPlanSelect={handlePlanSelect}
                loading={subscriptionLoading}
            />
        );
    }

    // Show subscription screen
    if (showSubscriptionScreen) {
        return <SubscriptionScreen onNavigate={handleNavigation} activeScreen={activeScreen} />;
    }

    // Show gas station screen
    if (showGasStationScreen) {
        return <GasStationScreen onNavigate={handleNavigation} activeScreen={activeScreen} />;
    }

    // Show inventory screen
    if (showInventoryScreen) {
        return <InventoryScreen onNavigate={handleNavigation} activeScreen={activeScreen} />;
    }

    // Show delivery screen
    if (showDeliveryScreen) {
        return <DeliveryScreen onNavigate={handleNavigation} activeScreen={activeScreen} />;
    }

    // Show order screen
    if (showOrderScreen) {
        return <OrderScreen onNavigate={handleNavigation} activeScreen={activeScreen} />;
    }

    // Show deliveryman screen
    if (showDeliverymanScreen) {
        return <DeliverymanScreen onNavigate={handleNavigation} activeScreen={activeScreen} />;
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
                                <button
                                    onClick={handleMenuToggle}
                                    className="lg:hidden p-2 rounded-md text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 mr-2"
                                    title={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="text-sm text-secondary-600">
                                    Olá, <span className="font-medium text-secondary-900">{user?.name || user?.email}</span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSignOut}
                                    loading={loading}
                                >
                                    Sair
                                </Button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content - Scrollable */}
                <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 overflow-y-auto">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-secondary-900">
                            Dashboard
                        </h2>
                        <p className="text-secondary-600 mt-1">
                            Bem-vindo ao sistema de gestão de pedidos
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Connection Status Card */}
                        <Card>
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-secondary-900">
                                        Conexão Estabelecida
                                    </p>
                                    <p className="text-sm text-secondary-500">
                                        Sistema funcionando normalmente
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* User Info Card */}
                        <Card>
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-secondary-900">
                                        Perfil do Usuário
                                    </p>
                                    <p className="text-sm text-secondary-500">
                                        {user?.email}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* Features Card */}
                        <Card>
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-secondary-900">
                                        Funcionalidades
                                    </p>
                                    <p className="text-sm text-secondary-500">
                                        Em desenvolvimento
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Welcome Message */}
                    <Card className="mt-8">
                        <div className="text-center py-8">
                            <svg className="mx-auto h-12 w-12 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="mt-4 text-lg font-medium text-secondary-900">
                                Sistema Configurado com Sucesso!
                            </h3>
                            <p className="mt-2 text-secondary-600">
                                A autenticação está funcionando corretamente. Clean Architecture implementada seguindo os princípios SOLID.
                            </p>
                            <div className="mt-6">
                                <p className="text-sm text-secondary-500">
                                    <strong>Arquitetura implementada:</strong>
                                </p>
                                <ul className="mt-2 text-sm text-secondary-600 space-y-1">
                                    <li>✓ Entidades de domínio (User, Company, AuthSession)</li>
                                    <li>✓ Casos de uso (SignIn, SignUp, ResetPassword)</li>
                                    <li>✓ Repositórios com inversão de dependência</li>
                                    <li>✓ Serviços de aplicação</li>
                                    <li>✓ Componentes de apresentação reutilizáveis</li>
                                    <li>✓ Validações seguindo Clean Code</li>
                                </ul>
                            </div>
                        </div>
                    </Card>
                </main>
            </div>
        </div>
    );
};

export default DashboardPage;
