import { useEffect, useState } from 'react';
import { GasStationService } from '../../../application/services/GasStationService';
import type { InventoryData } from '../../../application/services/InventoryService';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { GasStation } from '../../../domain/entities/GasStation';
import useInventory from '../../../presentation/hooks/useInventory';
import Alert from '../ui/Alert';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import Sidebar from '../ui/Sidebar';
import InventoryForm from './InventoryForm.tsx';
import InventoryList from './InventoryList.tsx';

interface InventoryItem {
    id: string;
    productName: string;
    productType: string;
    quantity: number;
    minQuantity: number;
    maxQuantity: number;
    unitPrice: number;
    supplier?: string;
    status: string;
    statusText: string;
    stockPercentage: number;
    totalValue: number;
}

interface AlertState {
    show: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
}

interface InventoryScreenProps {
    onNavigate?: (screen: string) => void;
    activeScreen?: string;
}

/**
 * Inventory Screen Component
 * Main screen for managing inventory
 */
const InventoryScreen = ({ onNavigate, activeScreen = 'inventory' }: InventoryScreenProps) => {
    const { user, signOut } = useAuth();
    const [gasStationService] = useState(() => new GasStationService(supabase));
    const [gasStations, setGasStations] = useState<GasStation[]>([]);
    const [selectedGasStationId, setSelectedGasStationId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [showStockModal, setShowStockModal] = useState(false);
    const [stockModalType, setStockModalType] = useState<'add' | 'remove'>('add');
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [stockQuantity, setStockQuantity] = useState<number>(0);
    const [alert, setAlert] = useState<AlertState>({ show: false, type: 'info', message: '' });
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);

    const {
        inventory,
        stats,
        loading,
        error,
        createInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        addStock,
        removeStock
    } = useInventory(selectedGasStationId);

    // Sidebar states
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Load gas stations
    useEffect(() => {
        const loadGasStations = async () => {
            try {
                if (user?.id) {
                    const stations = await gasStationService.getGasStationsByUserId(user.id);
                    setGasStations(stations);
                    if (stations.length > 0 && !selectedGasStationId && stations[0].id) {
                        setSelectedGasStationId(stations[0].id);
                    }
                }
            } catch (err) {
                console.error('Error loading gas stations:', err);
                showAlert('error', 'Erro ao carregar pontos de venda');
            }
        };

        loadGasStations();
    }, [user, gasStationService, selectedGasStationId]);

    // Detect screen size
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const showAlert = (type: AlertState['type'], message: string) => {
        setAlert({ show: true, type, message });
        setTimeout(() => {
            setAlert({ show: false, type: 'info', message: '' });
        }, 5000);
    };

    // Show error alert
    useEffect(() => {
        if (error) {
            showAlert('error', error);
        }
    }, [error]);

    // Transform Inventory entities to InventoryItem format for UI
    const inventoryItems: InventoryItem[] = inventory
        .filter(item => item.id !== undefined)
        .map(item => ({
            id: item.id!,
            productName: item.productName,
            productType: item.productType,
            quantity: item.quantity,
            minQuantity: item.minQuantity,
            maxQuantity: item.maxQuantity,
            unitPrice: item.unitPrice,
            supplier: item.supplier,
            status: item.status,
            statusText: item.statusText,
            stockPercentage: item.stockPercentage,
            totalValue: item.totalValue
        }));

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
        if (onNavigate) {
            onNavigate(screen);
        }
        if (isMobile) {
            closeSidebar();
        }
    };

    const handleCreateItem = () => {
        setEditingItem(null);
        setShowForm(true);
    };

    const handleEditItem = (item: InventoryItem) => {
        setEditingItem(item);
        setShowForm(true);
    };

    const handleDeleteItem = (item: InventoryItem) => {
        setItemToDelete(item);
        setShowDeleteDialog(true);
    };

    const confirmDeleteItem = async () => {
        if (!itemToDelete) return;

        try {
            await deleteInventoryItem(itemToDelete.id);
            showAlert('success', 'Item excluído com sucesso!');
            setShowDeleteDialog(false);
            setItemToDelete(null);
        } catch {
            showAlert('error', 'Erro ao excluir item');
        }
    };

    const cancelDeleteItem = () => {
        setShowDeleteDialog(false);
        setItemToDelete(null);
    };

    const handleFormSubmit = async (formData: InventoryData) => {
        try {
            if (editingItem) {
                await updateInventoryItem(editingItem.id, formData);
                showAlert('success', 'Item atualizado com sucesso!');
            } else {
                await createInventoryItem(formData);
                showAlert('success', 'Item criado com sucesso!');
            }
            setShowForm(false);
            setEditingItem(null);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar item';
            showAlert('error', errorMessage);
        }
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingItem(null);
    };

    const handleAddStock = (item: InventoryItem) => {
        setSelectedItem(item);
        setStockModalType('add');
        setStockQuantity(0);
        setShowStockModal(true);
    };

    const handleRemoveStock = (item: InventoryItem) => {
        setSelectedItem(item);
        setStockModalType('remove');
        setStockQuantity(0);
        setShowStockModal(true);
    };

    const handleStockModalSubmit = async () => {
        try {
            if (stockQuantity <= 0) {
                showAlert('error', 'Quantidade deve ser maior que zero');
                return;
            }

            if (!selectedItem) return;

            if (stockModalType === 'add') {
                await addStock(selectedItem.id, parseInt(String(stockQuantity)));
                showAlert('success', 'Estoque adicionado com sucesso!');
            } else {
                await removeStock(selectedItem.id, parseInt(String(stockQuantity)));
                showAlert('success', 'Estoque removido com sucesso!');
            }

            setShowStockModal(false);
            setSelectedItem(null);
            setStockQuantity(0);
        } catch (error) {
            showAlert('error', error instanceof Error ? error.message : 'Erro ao atualizar estoque');
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    };

    if (loading && !inventory.length) {
        return (
            <div className="min-h-screen bg-secondary-50">
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={closeSidebar}
                    isCollapsed={sidebarCollapsed}
                    onToggle={toggleSidebarCollapse}
                    userType={user?.userType || 'company'}
                    onNavigate={handleNavigation}
                    activeScreen={activeScreen}
                />

                <div className={`
                    flex-1 flex items-center justify-center min-h-screen transition-all duration-300 ease-in-out
                    ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
                `}>
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        <p className="text-secondary-600">Carregando estoque...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary-50">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={closeSidebar}
                isCollapsed={sidebarCollapsed}
                onToggle={toggleSidebarCollapse}
                userType={user?.userType || 'company'}
                onNavigate={handleNavigation}
                activeScreen={activeScreen}
            />

            <div className={`
                flex-1 flex flex-col transition-all duration-300 ease-in-out min-h-screen
                ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
            `}>
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-secondary-200 sticky top-0 z-40">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center">
                                {isMobile && (
                                    <button
                                        onClick={handleMenuToggle}
                                        className="p-2 rounded-md text-secondary-400 hover:text-secondary-500 hover:bg-secondary-100 mr-3"
                                    >
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                    </button>
                                )}

                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h1 className="text-xl font-semibold text-secondary-900">
                                            Gerenciar Estoque
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

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-4 sm:p-6 lg:p-8">
                        {alert.show && (
                            <div className="mb-6">
                                <Alert type={alert.type} message={alert.message} />
                            </div>
                        )}

                        {/* Gas Station Selector */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-secondary-700 mb-2">
                                Ponto de Venda
                            </label>
                            <select
                                value={selectedGasStationId || ''}
                                onChange={(e) => setSelectedGasStationId(e.target.value)}
                                className="w-full md:w-96 px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                {gasStations.map(station => station.id && (
                                    <option key={station.id} value={station.id}>
                                        {station.name} - {station.city}/{station.state}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Stats Cards */}
                        {stats && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                                <Card>
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-secondary-500">Total de Itens</p>
                                            <p className="text-2xl font-semibold text-secondary-900">{stats.totalItems}</p>
                                        </div>
                                    </div>
                                </Card>

                                <Card>
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-secondary-500">Valor Total</p>
                                            <p className="text-2xl font-semibold text-secondary-900">{formatCurrency(stats.totalValue)}</p>
                                        </div>
                                    </div>
                                </Card>

                                <Card>
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-secondary-500">Estoque Baixo</p>
                                            <p className="text-2xl font-semibold text-secondary-900">{stats.lowStock}</p>
                                        </div>
                                    </div>
                                </Card>

                                <Card>
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-secondary-500">Sem Estoque</p>
                                            <p className="text-2xl font-semibold text-secondary-900">{stats.outOfStock}</p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        )}

                        {/* Header Actions */}
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-secondary-900">
                                    Itens do Estoque
                                </h2>
                                <p className="text-secondary-600 mt-1">
                                    Gerencie o estoque de produtos do ponto de venda
                                </p>
                            </div>
                            <Button
                                onClick={handleCreateItem}
                                disabled={!selectedGasStationId || loading}
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Novo Item
                            </Button>
                        </div>

                        {/* Inventory List */}
                        <InventoryList
                            inventory={inventoryItems}
                            onEdit={handleEditItem}
                            onDelete={handleDeleteItem}
                            onAddStock={handleAddStock}
                            onRemoveStock={handleRemoveStock}
                            loading={loading}
                        />
                    </div>
                </div>
            </div>

            {/* Inventory Form Modal */}
            {showForm && (
                <InventoryForm
                    item={editingItem}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                    loading={loading}
                />
            )}

            {/* Stock Adjustment Modal */}
            {showStockModal && (
                <Modal
                    isOpen={true}
                    onClose={() => setShowStockModal(false)}
                    title={stockModalType === 'add' ? 'Adicionar Estoque' : 'Remover Estoque'}
                >
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-secondary-600 mb-4">
                                {selectedItem?.productName}
                            </p>
                            <p className="text-sm text-secondary-600 mb-4">
                                Estoque atual: <span className="font-semibold">{selectedItem?.quantity} unidades</span>
                            </p>
                        </div>

                        <Input
                            label={`Quantidade a ${stockModalType === 'add' ? 'adicionar' : 'remover'}`}
                            type="number"
                            value={stockQuantity}
                            onChange={(e) => setStockQuantity(Number(e.target.value))}
                            min="1"
                            max={stockModalType === 'remove' ? selectedItem?.quantity : undefined}
                        />

                        <div className="flex justify-end space-x-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowStockModal(false)}
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                onClick={handleStockModalSubmit}
                                loading={loading}
                            >
                                Confirmar
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="p-6">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-secondary-900">
                                    Excluir Item do Estoque
                                </h3>
                            </div>

                            <div className="mb-6">
                                <p className="text-secondary-600 mb-4">
                                    Tem certeza que deseja excluir <span className="font-semibold">{itemToDelete?.productName}</span> do estoque? Esta ação não pode ser desfeita.
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
                                                Ao excluir este item, você perderá todo o histórico e informações relacionadas a este produto no estoque.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <Button
                                    variant="outline"
                                    onClick={cancelDeleteItem}
                                    disabled={loading}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={confirmDeleteItem}
                                    disabled={loading}
                                >
                                    {loading ? 'Excluindo...' : 'Sim, Excluir'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryScreen;
