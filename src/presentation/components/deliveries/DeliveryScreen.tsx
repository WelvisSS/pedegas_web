import { useEffect, useState } from 'react';
import { InventoryService } from '../../../application/services/InventoryService';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { useOrders } from '../../hooks/useOrders.ts';
import type { Order, DeliveryAddress } from '../../../domain/types/Order';
import Alert from '../ui/Alert';
import Button from '../ui/Button';
import Card from '../ui/Card';
import InvoiceModal from '../ui/InvoiceModal';
import Sidebar from '../ui/Sidebar';
import DeliveryDetailsModal from './DeliveryDetailsModal';
import InvoicePreviewModal from './InvoicePreviewModal';

// Order types are now imported from domain layer

// Invoice data type definition
interface InvoiceData {
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    gasStation: {
        name: string;
        contactPerson: string;
        phone: string;
        address: string;
        city: string;
        state: string;
    };
    customer: {
        name: string;
        phone: string;
        email: string;
        address: {
            street: string;
            neighborhood: string;
            city: string;
            state: string;
            zipCode: string;
        };
    };
    items: Array<{
        product: string;
        quantity: number;
        price: number;
    }>;
    total: number;
    taxes: number;
    netTotal: number;
}

// Delivery type for DeliveryDetailsModal
interface DeliveryForModal {
    id: string | number;
    status: 'pending' | 'accepted' | 'in_progress' | 'delivered' | 'rejected';
    priority: 'high' | 'medium' | 'low';
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    gasStation?: {
        name: string;
        contactPerson: string;
        phone: string;
        address: string;
        city: string;
        state: string;
    };
    address: {
        street: string;
        neighborhood: string;
        city: string;
        state: string;
        zipCode: string;
    };
    items: Array<{
        product: string;
        quantity: number;
        price: number;
    }>;
    total: number;
    estimatedDelivery: string;
    orderDate: string;
    notes?: string;
    timeline?: Array<{
        event: string;
        timestamp: string;
        notes?: string;
    }>;
}

/**
 * Delivery Screen Component
 * Component for managing delivery orders
 * Following Single Responsibility Principle
 */
const DeliveryScreen = ({ onNavigate, activeScreen = 'deliveries' }: { onNavigate?: (screen: string) => void; activeScreen?: string }) => {
    const { user, signOut } = useAuth();
    const [inventoryService] = useState(() => new InventoryService(supabase));
    const {
        orders: deliveries,
        gasStations,
        loading,
        error: deliveriesError,
        updateOrderStatus
    } = useOrders();

    const [actionLoading, setActionLoading] = useState(false);
    const [selectedDelivery, setSelectedDelivery] = useState<DeliveryForModal | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showInvoicePreview, setShowInvoicePreview] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [currentInvoiceData, setCurrentInvoiceData] = useState<InvoiceData | null>(null);
    const [filter, setFilter] = useState('all'); // all, pending, accepted, rejected
    const [gasStationFilter, setGasStationFilter] = useState('all'); // all, or gasStationId
    const [alert, setAlert] = useState<{ show: boolean; type: 'success' | 'error' | 'info' | 'warning' | undefined; message: string }>({ show: false, type: undefined, message: '' });

    // Sidebar states
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Show error alert if deliveries failed to load
    useEffect(() => {
        if (deliveriesError) {
            showAlert('error', deliveriesError);
        }
    }, [deliveriesError]);

    // Detect screen size
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

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
        } else if (screen === 'gas-stations') {
            onNavigate?.('gas-stations');
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

    const showAlert = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
        setAlert({ show: true, type, message });
        setTimeout(() => {
            setAlert({ show: false, type: undefined, message: '' });
        }, 5000);
    };

    const handleStatusChange = async (orderId: string | number, newStatus: string, actionName: string) => {
        setActionLoading(true);
        try {
            // If confirming order, check and decrement stock
            if (newStatus === 'confirmed') {
                const delivery = deliveries.find(d => d.id === orderId);
                if (!delivery) {
                    throw new Error('Pedido não encontrado');
                }

                if (!delivery.gas_station_id) {
                    throw new Error('Ponto de venda não identificado');
                }

                // Check stock availability
                const availability = await inventoryService.checkStockAvailability(
                    String(delivery.gas_station_id),
                    (delivery.items || []).map(item => ({
                        product: item.product_name || '',
                        quantity: item.quantity
                    }))
                );

                if (!availability.hasStock) {
                    const missingItems = availability.unavailableItems
                        .map((item: { product: string; reason: string }) => `${item.product}: ${item.reason}`)
                        .join('\n');
                    showAlert('error', `Não é possível confirmar o pedido:\n${missingItems}`);
                    setActionLoading(false);
                    return;
                }

                // Decrement stock
                await inventoryService.decrementStockForOrder(
                    String(delivery.gas_station_id),
                    (delivery.items || []).map(item => ({
                        product: item.product_name || '',
                        quantity: item.quantity
                    }))
                );
            }

            await updateOrderStatus(orderId, newStatus);
            showAlert('success', `Pedido ${actionName} com sucesso!`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : `Erro ao ${actionName.toLowerCase()} pedido.`;
            showAlert('error', errorMessage);
        } finally {
            setActionLoading(false);
        }
    };

    const handleCloseInvoicePreview = () => {
        setShowInvoicePreview(false);
        setCurrentInvoiceData(null);
    };

    const handleDownloadInvoice = () => {
        if (!currentInvoiceData) return;

        // Simulate PDF download
        showAlert('success', `Download da nota fiscal ${currentInvoiceData.invoiceNumber} iniciado!`);
    };

    const handlePrintInvoice = () => {
        if (!currentInvoiceData) return;

        // Usar window.print() diretamente sem modificar o DOM
        // Adicionar classes CSS para controlar o que é impresso
        window.print();
        
        // Mostrar feedback ao usuário
        showAlert('success', 'Impressão iniciada!');
    };

    const handleShowInvoice = (order: Order) => {
        setSelectedOrder(order);
        setShowInvoiceModal(true);
    };

    const handleShowDetails = (order: Order) => {
        const deliveryData = convertOrderToDelivery(order);
        setSelectedDelivery(deliveryData);
        setShowDetailsModal(true);
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'pending':
                return 'bg-amber-100 text-amber-800';
            case 'confirmed':
                return 'bg-blue-100 text-blue-800';
            case 'preparing':
                return 'bg-orange-100 text-orange-800';
            case 'out_for_delivery':
                return 'bg-purple-100 text-purple-800';
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status?: string) => {
        switch (status) {
            case 'pending':
                return 'Pendente';
            case 'confirmed':
                return 'Confirmado';
            case 'preparing':
                return 'Preparando';
            case 'out_for_delivery':
                return 'Saiu para Entrega';
            case 'delivered':
                return 'Entregue';
            case 'cancelled':
                return 'Cancelado';
            default:
                return 'Desconhecido';
        }
    };

    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case 'high':
                return 'text-red-600';
            case 'medium':
                return 'text-yellow-600';
            case 'low':
                return 'text-green-600';
            default:
                return 'text-gray-600';
        }
    };

    const getPriorityText = (priority?: string) => {
        switch (priority) {
            case 'high':
                return 'Alta';
            case 'medium':
                return 'Média';
            case 'low':
                return 'Baixa';
            default:
                return 'Normal';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('pt-BR');
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    // Helper function to convert Order to DeliveryForModal
    const convertOrderToDelivery = (order: Order): DeliveryForModal => {
        // Parse delivery address
        let parsedAddress = {
            street: '',
            neighborhood: '',
            city: '',
            state: '',
            zipCode: ''
        };

        if (order.delivery_address) {
            if (typeof order.delivery_address === 'string') {
                // If it's a string, try to parse or use as street
                parsedAddress.street = order.delivery_address;
            } else {
                parsedAddress = {
                    street: order.delivery_address.street || '',
                    neighborhood: order.delivery_address.neighborhood || '',
                    city: order.delivery_address.city || '',
                    state: order.delivery_address.state || '',
                    zipCode: order.delivery_address.zip_code || ''
                };
            }
        }

        // Parse items
        const parsedItems = (order.items || []).map(item => ({
            product: item.product_name || 'Produto',
            quantity: item.quantity || 0,
            price: item.price || 0
        }));

        // Map order status to delivery status
        const statusMap: Record<string, 'pending' | 'accepted' | 'in_progress' | 'delivered' | 'rejected'> = {
            'pending': 'pending',
            'confirmed': 'accepted',
            'preparing': 'in_progress',
            'out_for_delivery': 'in_progress',
            'delivered': 'delivered',
            'cancelled': 'rejected'
        };

        return {
            id: order.id,
            status: statusMap[order.status || 'pending'] || 'pending',
            priority: 'medium', // Default priority since Order doesn't have this field
            customerName: order.customer_name || 'Cliente',
            customerPhone: order.customer_phone || '',
            customerEmail: '', // Order doesn't have email field
            gasStation: order.gas_station ? {
                name: order.gas_station.name,
                contactPerson: '',
                phone: '',
                address: '',
                city: order.gas_station.city || '',
                state: order.gas_station.state || ''
            } : undefined,
            address: parsedAddress,
            items: parsedItems,
            total: order.total_amount || 0,
            estimatedDelivery: order.estimated_delivery || order.delivery_date || new Date().toISOString(),
            orderDate: order.created_at || new Date().toISOString(),
            notes: ''
        };
    };

    const filteredDeliveries = deliveries.filter(delivery => {
        // Filter by status
        let statusMatch = true;
        if (filter !== 'all') {
            statusMatch = delivery.status === filter;
        }

        // Filter by gas station
        let gasStationMatch = true;
        if (gasStationFilter !== 'all') {
            // Compare both string and number versions to handle type inconsistencies
            const filterValue = gasStationFilter.toString();
            const deliveryGasStationId = delivery.gas_station_id ? delivery.gas_station_id.toString() : '';
            gasStationMatch = deliveryGasStationId === filterValue;
        }

        return statusMatch && gasStationMatch;
    });

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
                        <p className="text-secondary-600">Carregando entregas...</p>
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
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h1 className="text-xl font-semibold text-secondary-900">
                                            Gerenciar Pedidos
                                        </h1>
                                        <p className="text-sm text-secondary-600">
                                            Controle o status e acompanhe todos os pedidos de gás
                                        </p>
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
                        <div className="mb-6">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-secondary-900">
                                        Gerenciar Entregas
                                    </h2>
                                    <p className="text-secondary-600 mt-1">
                                        Gerencie pedidos de entrega de gás
                                    </p>
                                </div>
                            </div>

                            {/* Gas Station Filter */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-secondary-700 mb-2">
                                    Filtrar por Ponto de Venda:
                                </label>
                                <select
                                    value={gasStationFilter}
                                    onChange={(e) => setGasStationFilter(e.target.value)}
                                    className="px-3 py-2 border border-secondary-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="all">Todos os Pontos de Venda</option>
                                    {gasStations.map(station => (
                                        <option key={station.id} value={station.id}>
                                            {station.name} - {station.contactPerson || station.address}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Status Filter Buttons */}
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant={filter === 'all' ? 'primary' : 'outline'}
                                    size="sm"
                                    onClick={() => setFilter('all')}
                                >
                                    Todos ({deliveries.length})
                                </Button>
                                <Button
                                    variant={filter === 'pending' ? 'primary' : 'outline'}
                                    size="sm"
                                    onClick={() => setFilter('pending')}
                                >
                                    Pendentes ({deliveries.filter(d => d.status === 'pending').length})
                                </Button>
                                <Button
                                    variant={filter === 'confirmed' ? 'primary' : 'outline'}
                                    size="sm"
                                    onClick={() => setFilter('confirmed')}
                                >
                                    Confirmados ({deliveries.filter(d => d.status === 'confirmed').length})
                                </Button>
                                <Button
                                    variant={filter === 'preparing' ? 'primary' : 'outline'}
                                    size="sm"
                                    onClick={() => setFilter('preparing')}
                                >
                                    Preparando ({deliveries.filter(d => d.status === 'preparing').length})
                                </Button>
                                <Button
                                    variant={filter === 'out_for_delivery' ? 'primary' : 'outline'}
                                    size="sm"
                                    onClick={() => setFilter('out_for_delivery')}
                                >
                                    Em Entrega ({deliveries.filter(d => d.status === 'out_for_delivery').length})
                                </Button>
                                <Button
                                    variant={filter === 'delivered' ? 'primary' : 'outline'}
                                    size="sm"
                                    onClick={() => setFilter('delivered')}
                                >
                                    Entregues ({deliveries.filter(d => d.status === 'delivered').length})
                                </Button>
                                <Button
                                    variant={filter === 'cancelled' ? 'primary' : 'outline'}
                                    size="sm"
                                    onClick={() => setFilter('cancelled')}
                                >
                                    Cancelados ({deliveries.filter(d => d.status === 'cancelled').length})
                                </Button>
                            </div>
                        </div>

                        {/* Deliveries Timeline */}
                        <div className="space-y-6">
                            {filteredDeliveries.length === 0 ? (
                                <Card>
                                    <div className="p-8 text-center">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-medium text-secondary-900 mb-2">
                                            Nenhuma entrega encontrada
                                        </h3>
                                        <p className="text-secondary-600">
                                            Não há entregas {filter !== 'all' ? `com status "${getStatusText(filter)}"` : ''} no momento.
                                        </p>
                                    </div>
                                </Card>
                            ) : (
                                filteredDeliveries.map((delivery, index) => {
                                    // Helper to format delivery address
                                    const formatDeliveryAddress = (addr: string | DeliveryAddress | undefined): string => {
                                        if (!addr) return 'N/A';
                                        if (typeof addr === 'string') return addr;
                                        return `${addr.street || ''}, ${addr.neighborhood || ''}`;
                                    };
                                    
                                    return (
                                    <Card key={delivery.id} className="relative">
                                        {/* Timeline connector */}
                                        {index < filteredDeliveries.length - 1 && (
                                            <div className="absolute left-6 top-20 w-0.5 h-16 bg-secondary-200 z-0"></div>
                                        )}

                                        <div className="p-6">
                                            <div className="flex items-start space-x-4">
                                                {/* Timeline dot with status-specific icons */}
                                                <div className={`
                                                    flex-shrink-0 w-12 h-12 rounded-full border-4 border-white shadow-lg flex items-center justify-center z-10
                                                    ${delivery.status === 'pending' ? 'bg-amber-500' :
                                                        delivery.status === 'confirmed' ? 'bg-blue-500' :
                                                            delivery.status === 'preparing' ? 'bg-orange-500' :
                                                                delivery.status === 'out_for_delivery' ? 'bg-purple-500' :
                                                                    delivery.status === 'delivered' ? 'bg-green-500' :
                                                                        delivery.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-500'}
                                                `}>
                                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        {delivery.status === 'pending' && (
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        )}
                                                        {delivery.status === 'confirmed' && (
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        )}
                                                        {delivery.status === 'preparing' && (
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                                        )}
                                                        {delivery.status === 'out_for_delivery' && (
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                                        )}
                                                        {delivery.status === 'delivered' && (
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                        )}
                                                        {delivery.status === 'cancelled' && (
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                        )}
                                                    </svg>
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-secondary-900">
                                                                Pedido #{delivery.id.toString().padStart(4, '0')}
                                                            </h3>
                                                            <p className="text-secondary-600">
                                                                {delivery.customer_name as string} • {delivery.customer_phone as string}
                                                            </p>
                                                            {delivery.gas_station && (
                                                                <p className="text-sm text-primary-600 font-medium">
                                                                    Ponto de Venda: {delivery.gas_station.name as string}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status as string)}`}>
                                                                {getStatusText(delivery.status as string)}
                                                            </span>
                                                            <span className={`text-xs font-medium ${getPriorityColor(delivery.priority as string)}`}>
                                                                Prioridade {getPriorityText(delivery.priority as string)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                                        <div>
                                                            <span className="text-sm font-medium text-secondary-500">Endereço:</span>
                                                            <p className="text-secondary-900 text-sm">
                                                                {formatDeliveryAddress(delivery.delivery_address as string | DeliveryAddress | undefined)}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="text-sm font-medium text-secondary-500">Valor Total:</span>
                                                            <p className="text-secondary-900 font-semibold">
                                                                {formatCurrency(delivery.total_amount as number)}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="text-sm font-medium text-secondary-500">Entrega Estimada:</span>
                                                            <p className="text-secondary-900 text-sm">
                                                                {delivery.estimated_delivery ? formatDate(delivery.estimated_delivery as string) : 'Não definida'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="text-sm font-medium text-secondary-500">Responsável:</span>
                                                            <p className="text-secondary-900 text-sm">
                                                                {'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col sm:flex-row gap-2">
                                                        {delivery.status === 'pending' && (
                                                            <>
                                                                <Button
                                                                    variant="primary"
                                                                    size="sm"
                                                                    onClick={() => handleStatusChange(delivery.id, 'confirmed', 'confirmado')}
                                                                    disabled={actionLoading}
                                                                    className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700"
                                                                >
                                                                    Confirmar
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleStatusChange(delivery.id, 'cancelled', 'cancelado')}
                                                                    disabled={actionLoading}
                                                                    className="flex-1 sm:flex-none text-red-600 border-red-300 hover:bg-red-50"
                                                                >
                                                                    Cancelar
                                                                </Button>
                                                            </>
                                                        )}

                                                        {delivery.status === 'confirmed' && (
                                                            <Button
                                                                variant="primary"
                                                                size="sm"
                                                                onClick={() => handleStatusChange(delivery.id, 'preparing', 'iniciado preparo')}
                                                                disabled={actionLoading}
                                                                className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-700"
                                                            >
                                                                Iniciar Preparo
                                                            </Button>
                                                        )}

                                                        {delivery.status === 'preparing' && (
                                                            <Button
                                                                variant="primary"
                                                                size="sm"
                                                                onClick={() => handleStatusChange(delivery.id, 'out_for_delivery', 'saiu para entrega')}
                                                                disabled={actionLoading}
                                                                className="flex-1 sm:flex-none bg-orange-600 hover:bg-orange-700"
                                                            >
                                                                Saiu para Entrega
                                                            </Button>
                                                        )}

                                                        {delivery.status === 'out_for_delivery' && (
                                                            <Button
                                                                variant="primary"
                                                                size="sm"
                                                                onClick={() => handleStatusChange(delivery.id, 'delivered', 'entregue')}
                                                                disabled={actionLoading}
                                                                className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700"
                                                            >
                                                                Marcar como Entregue
                                                            </Button>
                                                        )}

                                                        {delivery.status === 'delivered' && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleShowInvoice(delivery)}
                                                                disabled={actionLoading}
                                                                className="flex-1 sm:flex-none"
                                                            >
                                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                                Ver Nota Fiscal
                                                            </Button>
                                                        )}

                                                        {/* View Details button - available for all statuses */}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleShowDetails(delivery)}
                                                            disabled={actionLoading}
                                                            className="flex-1 sm:flex-none"
                                                        >
                                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            Ver Detalhes
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                )})
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Invoice Modal */}
            <InvoiceModal
                isOpen={showInvoiceModal}
                onClose={() => setShowInvoiceModal(false)}
                order={selectedOrder as Order & { id: string; created_at: string } | null}
            />

            {/* Details Modal */}
            {showDetailsModal && selectedDelivery && (
                <DeliveryDetailsModal
                    delivery={selectedDelivery}
                    onClose={() => {
                        setShowDetailsModal(false);
                        setSelectedDelivery(null);
                    }}
                />
            )}

            {/* Invoice Preview Modal */}
            {showInvoicePreview && currentInvoiceData && (
                <InvoicePreviewModal
                    invoiceData={currentInvoiceData}
                    onClose={handleCloseInvoicePreview}
                    onDownload={handleDownloadInvoice}
                    onPrint={handlePrintInvoice}
                />
            )}
        </div>
    );
};

export default DeliveryScreen;