import { useCallback, useEffect, useState } from 'react';
import { GasStationService } from '../../../application/services/GasStationService';
import { GasStation } from '../../../domain/entities/GasStation';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import Alert from '../ui/Alert';
import Button from '../ui/Button';
import Sidebar from '../ui/Sidebar';
import GasStationForm from './GasStationForm.tsx';
import GasStationList from './GasStationList.tsx';

interface GasStationScreenProps {
    onNavigate?: (screen: string) => void;
    activeScreen?: string;
}

interface AlertState {
    show: boolean;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
}

/**
 * Gas Station Screen Component
 * Component for managing gas stations
 * Following Single Responsibility Principle
 */
const GasStationScreen = ({ onNavigate, activeScreen = 'gas-stations' }: GasStationScreenProps) => {
    const { user, signOut } = useAuth();
    const [gasStationService] = useState(() => new GasStationService(supabase));
    const [gasStations, setGasStations] = useState<GasStation[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingGasStation, setEditingGasStation] = useState<GasStation | null>(null);
    const [alert, setAlert] = useState<AlertState>({ show: false, type: 'info', message: '' });

    // Sidebar states
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const loadGasStations = useCallback(async () => {
        try {
            setLoading(true);
            if (user?.id) {
                const stations = await gasStationService.getGasStationsByUserId(user.id);
                setGasStations(stations);
            }
        } catch (error) {
            console.error('Error loading gas stations:', error);
            showAlert('error', 'Erro ao carregar pontos de venda');
        } finally {
            setLoading(false);
        }
    }, [user?.id, gasStationService]);

    useEffect(() => {
        loadGasStations();
    }, [loadGasStations]);

    // Detect screen size
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const showAlert = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
        setAlert({ show: true, type, message });
        setTimeout(() => {
            setAlert({ show: false, type: 'info', message: '' });
        }, 5000);
    };

    const handleCreateGasStation = () => {
        setEditingGasStation(null);
        setShowForm(true);
    };

    const handleEditGasStation = (gasStation: GasStation) => {
        setEditingGasStation(gasStation);
        setShowForm(true);
    };

    const handleDeleteGasStation = async (gasStationId: string) => {
        if (!window.confirm('Tem certeza que deseja excluir este ponto de venda?')) {
            return;
        }

        try {
            setActionLoading(true);
            await gasStationService.deleteGasStation(gasStationId);
            showAlert('success', 'Ponto de venda excluído com sucesso!');
            await loadGasStations();
        } catch (error) {
            console.error('Error deleting gas station:', error);
            showAlert('error', 'Erro ao excluir ponto de venda');
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggleStatus = async (gasStationId: string) => {
        try {
            setActionLoading(true);
            await gasStationService.toggleGasStationStatus(gasStationId);
            showAlert('success', 'Status alterado com sucesso!');
            await loadGasStations();
        } catch (error) {
            console.error('Error toggling gas station status:', error);
            showAlert('error', 'Erro ao alterar status');
        } finally {
            setActionLoading(false);
        }
    };

    const handleFormSubmit = async (gasStationData: Partial<GasStation>) => {
        try {
            setActionLoading(true);

            if (editingGasStation?.id && user?.id) {
                await gasStationService.updateGasStation(editingGasStation.id, gasStationData);
                showAlert('success', 'Ponto de venda atualizado com sucesso!');
            } else if (user?.id) {
                // Extract required fields for creation
                const { name, address, city, state, zipCode, phone, email, cnpj, isActive } = gasStationData;
                
                // Ensure required fields are present
                if (!name || !address || !city || !state) {
                    throw new Error('Campos obrigatórios não preenchidos');
                }
                
                const createData = {
                    name,
                    address,
                    city,
                    state,
                    zipCode,
                    phone,
                    email,
                    cnpj,
                    isActive
                };
                
                await gasStationService.createGasStation(user.id, createData);
                showAlert('success', 'Ponto de venda criado com sucesso!');
            }

            setShowForm(false);
            setEditingGasStation(null);
            await loadGasStations();

        } catch (error) {
            console.error('Error saving gas station:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar ponto de venda';
            showAlert('error', errorMessage);
        } finally {
            setActionLoading(false);
        }
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingGasStation(null);
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
        } else if (screen === 'subscription') {
            onNavigate?.('subscription');
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
                        <p className="text-secondary-600">Carregando pontos de venda...</p>
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
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h1 className="text-xl font-semibold text-secondary-900">
                                            Pontos de Venda
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
                    <div className="p-4 sm:p-6 lg:p-8">
                        {alert.show && (
                            <div className="mb-6">
                                <Alert type={alert.type} message={alert.message} />
                            </div>
                        )}

                        {/* Header Actions */}
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-secondary-900">
                                    Gerenciar Pontos de Venda
                                </h2>
                                <p className="text-secondary-600 mt-1">
                                    Cadastre e gerencie seus pontos de distribuição de gás
                                </p>
                            </div>
                            <Button
                                onClick={handleCreateGasStation}
                                disabled={actionLoading}
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Novo Ponto de Venda
                            </Button>
                        </div>

                        {/* Gas Stations List */}
                        <GasStationList
                            gasStations={gasStations}
                            onEdit={handleEditGasStation}
                            onDelete={handleDeleteGasStation}
                            onToggleStatus={handleToggleStatus}
                            loading={actionLoading}
                        />
                    </div>
                </div>
            </div>

            {/* Gas Station Form Modal */}
            {showForm && (
                <GasStationForm
                    gasStation={editingGasStation}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                    loading={actionLoading}
                />
            )}
        </div>
    );
};

export default GasStationScreen;
