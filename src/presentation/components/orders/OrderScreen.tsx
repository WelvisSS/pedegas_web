import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useOrders } from '../../hooks/useOrders';
import Alert from '../ui/Alert';
import Button from '../ui/Button';
import Card from '../ui/Card';
import InvoiceModal from '../ui/InvoiceModal';
import Modal from '../ui/Modal';
import Sidebar from '../ui/Sidebar';
import NewOrderForm from './NewOrderForm';
import type { Order, DeliveryAddress } from '../../../domain/types/Order';

interface OrderData extends Record<string, unknown> {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    deliveryAddress: string;
    items: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    notes?: string;
    estimatedDelivery?: string;
    gasStationId?: string;
    totalAmount: number;
}

interface OrderScreenProps {
    onNavigate?: (screen: string) => void;
    activeScreen?: string;
}

const OrderScreen = ({ onNavigate, activeScreen = 'orders' }: OrderScreenProps) => {
    const { user } = useAuth();
    const {
        orders,
        gasStations,
        stats,
        loading,
        error,
        createOrder
    } = useOrders();

    const [showNewOrderForm, setShowNewOrderForm] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });
    const [filter, setFilter] = useState('all');
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
        // Close sidebar on mobile after navigation
        if (isMobile) {
            closeSidebar();
        }
    };

    const showAlert = (type: string, message: string) => {
        setAlert({ show: true, type, message });
        setTimeout(() => {
            setAlert({ show: false, type: '', message: '' });
        }, 5000);
    };

    const handleCreateOrder = async (orderData: OrderData) => {
        try {
            await createOrder(orderData);
            setShowNewOrderForm(false);
            showAlert('success', 'Pedido criado com sucesso!');
        } catch {
            showAlert('error', 'Erro ao criar pedido. Tente novamente.');
        }
    };

    const handleShowInvoice = (order: Order) => {
        setSelectedOrder(order);
        setShowInvoiceModal(true);
    };

    const filteredOrders = orders.filter((order: Order) => {
        if (filter === 'all') return true;
        return order.status === filter;
    });

    const formatCurrency = (value?: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'confirmed': return 'bg-blue-100 text-blue-800';
            case 'preparing': return 'bg-purple-100 text-purple-800';
            case 'out_for_delivery': return 'bg-orange-100 text-orange-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status?: string) => {
        switch (status) {
            case 'pending': return 'Pendente';
            case 'confirmed': return 'Confirmado';
            case 'preparing': return 'Preparando';
            case 'out_for_delivery': return 'Saiu para Entrega';
            case 'delivered': return 'Entregue';
            case 'cancelled': return 'Cancelado';
            default: return status || 'N/A';
        }
    };

    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case 'low': return 'bg-gray-100 text-gray-800';
            case 'medium': return 'bg-blue-100 text-blue-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'urgent': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityText = (priority?: string) => {
        switch (priority) {
            case 'low': return 'Baixa';
            case 'medium': return 'Normal';
            case 'high': return 'Alta';
            case 'urgent': return 'Urgente';
            default: return priority || 'N/A';
        }
    };

    const parseDeliveryAddress = (address?: string | DeliveryAddress): DeliveryAddress | null => {
        if (!address) return null;
        if (typeof address === 'string') {
            try {
                return JSON.parse(address);
            } catch {
                return null;
            }
        }
        return address;
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
                        <p className="text-secondary-600">Carregando pedidos...</p>
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

            {/* Main Content */}
            <div className={`
                flex-1 flex flex-col transition-all duration-300 ease-in-out min-h-screen
                ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
            `}>
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-secondary-200 sticky top-0 z-40">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={handleMenuToggle}
                                    className="p-2 rounded-md text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
                                >
                                    <span className="sr-only">Open sidebar</span>
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                                <div>
                                    <h1 className="text-xl font-semibold text-secondary-900">Meus Pedidos</h1>
                                    <p className="text-sm text-secondary-600">Solicite gás e acompanhe seus pedidos</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Button
                                    onClick={() => setShowNewOrderForm(true)}
                                    className="bg-primary-600 hover:bg-primary-700 text-white"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Novo Pedido
                                </Button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Alert */}
                {alert.show && (
                    <div className="px-4 sm:px-6 lg:px-8 mt-4">
                        <Alert 
                            type={alert.type as 'success' | 'error' | 'warning' | 'info'} 
                            message={alert.message}
                            onClose={() => setAlert({ show: false, type: '', message: '' })} 
                        />
                    </div>
                )}

                {/* Content */}
                <main className="flex-1 py-6">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <Card className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-secondary-600">Total de Pedidos</p>
                                        <p className="text-2xl font-semibold text-secondary-900">{stats.total}</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-secondary-600">Pendentes</p>
                                        <p className="text-2xl font-semibold text-secondary-900">{stats.pending}</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-secondary-600">Entregues</p>
                                        <p className="text-2xl font-semibold text-secondary-900">{stats.delivered}</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-secondary-600">Cancelados</p>
                                        <p className="text-2xl font-semibold text-secondary-900">{stats.cancelled}</p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Filters */}
                        <div className="mb-6">
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    onClick={() => setFilter('all')}
                                    variant={filter === 'all' ? 'primary' : 'secondary'}
                                    className="text-sm"
                                >
                                    Todos
                                </Button>
                                <Button
                                    onClick={() => setFilter('pending')}
                                    variant={filter === 'pending' ? 'primary' : 'secondary'}
                                    className="text-sm"
                                >
                                    Pendentes
                                </Button>
                                <Button
                                    onClick={() => setFilter('confirmed')}
                                    variant={filter === 'confirmed' ? 'primary' : 'secondary'}
                                    className="text-sm"
                                >
                                    Confirmados
                                </Button>
                                <Button
                                    onClick={() => setFilter('preparing')}
                                    variant={filter === 'preparing' ? 'primary' : 'secondary'}
                                    className="text-sm"
                                >
                                    Preparando
                                </Button>
                                <Button
                                    onClick={() => setFilter('out_for_delivery')}
                                    variant={filter === 'out_for_delivery' ? 'primary' : 'secondary'}
                                    className="text-sm"
                                >
                                    Saiu para Entrega
                                </Button>
                                <Button
                                    onClick={() => setFilter('delivered')}
                                    variant={filter === 'delivered' ? 'primary' : 'secondary'}
                                    className="text-sm"
                                >
                                    Entregues
                                </Button>
                                <Button
                                    onClick={() => setFilter('cancelled')}
                                    variant={filter === 'cancelled' ? 'primary' : 'secondary'}
                                    className="text-sm"
                                >
                                    Cancelados
                                </Button>
                            </div>
                        </div>

                        {/* Orders List */}
                        {error && (
                            <Alert type="error" message={error} className="mb-6" />
                        )}

                        {filteredOrders.length === 0 ? (
                            <Card className="p-8">
                                <div className="text-center">
                                    <svg className="mx-auto h-12 w-12 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-secondary-900">Nenhum pedido encontrado</h3>
                                    <p className="mt-1 text-sm text-secondary-500">
                                        {filter === 'all'
                                            ? 'Comece criando seu primeiro pedido.'
                                            : 'Não há pedidos com este status.'}
                                    </p>
                                    {filter === 'all' && (
                                        <div className="mt-6">
                                            <Button
                                                onClick={() => setShowNewOrderForm(true)}
                                                className="bg-primary-600 hover:bg-primary-700 text-white"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                Criar Primeiro Pedido
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {filteredOrders.map((order: Order) => {
                                    const deliveryAddress = parseDeliveryAddress(order.delivery_address);
                                    
                                    return (
                                        <Card key={order.id} className="p-6">
                                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-4 mb-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-2 mb-2">
                                                                <h3 className="text-lg font-medium text-secondary-900">
                                                                    Pedido #{order.id.slice(0, 8)}
                                                                </h3>
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                                    {getStatusText(order.status)}
                                                                </span>
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}>
                                                                    {getPriorityText(order.priority)}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-secondary-600 mb-1">
                                                                Cliente: {order.customer_name}
                                                            </p>
                                                            <p className="text-sm text-secondary-600 mb-1">
                                                                Telefone: {order.customer_phone}
                                                            </p>
                                                            <p className="text-sm text-secondary-600 mb-2">
                                                                Criado em: {formatDate(order.created_at)}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-lg font-semibold text-secondary-900">
                                                                {formatCurrency(order.total_amount)}
                                                            </p>
                                                            <p className="text-sm text-secondary-600">
                                                                Posto: {order.gas_station?.name || 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Delivery Address */}
                                                    {deliveryAddress && (
                                                        <div className="mb-4 p-3 bg-secondary-50 rounded-lg">
                                                            <h4 className="text-sm font-medium text-secondary-900 mb-2">Endereço de Entrega:</h4>
                                                            <p className="text-sm text-secondary-600">
                                                                {deliveryAddress.street}, {deliveryAddress.number}
                                                                {deliveryAddress.complement && `, ${deliveryAddress.complement}`}
                                                                <br />
                                                                {deliveryAddress.neighborhood} - {deliveryAddress.city}, {deliveryAddress.state}
                                                                <br />
                                                                CEP: {deliveryAddress.zip_code}
                                                            </p>
                                                            {order.notes && (
                                                                <p className="text-sm text-secondary-600 mt-2">
                                                                    <span className="font-medium">Observações:</span> {order.notes}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Items */}
                                                    {order.items && order.items.length > 0 && (
                                                        <div className="mb-4">
                                                            <h4 className="text-sm font-medium text-secondary-900 mb-2">Itens:</h4>
                                                            <div className="space-y-1">
                                                                {order.items.map((item, index) => (
                                                                    <div key={index} className="flex justify-between items-center text-sm">
                                                                        <span className="text-secondary-600">
                                                                            {item.quantity}x {item.type} {item.brand} ({item.size})
                                                                        </span>
                                                                        <span className="text-secondary-900 font-medium">
                                                                            {formatCurrency(item.price * item.quantity)}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Action Buttons for Delivered Orders */}
                                                    {order.status === 'delivered' && (
                                                        <div className="flex gap-2 mt-4 pt-4 border-t border-secondary-200">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleShowInvoice(order)}
                                                                className="flex-1 sm:flex-none"
                                                            >
                                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                                Ver Nota Fiscal
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Modal para Nota Fiscal */}
            <InvoiceModal
                isOpen={showInvoiceModal}
                onClose={() => setShowInvoiceModal(false)}
                order={selectedOrder}
            />

            {/* Modal para Novo Pedido */}
            <Modal
                isOpen={showNewOrderForm}
                onClose={() => setShowNewOrderForm(false)}
                title="🛒 Novo Pedido"
                size="xlarge"
            >
                <div className="p-6">
                    <NewOrderForm
                        onSubmit={handleCreateOrder}
                        onCancel={() => setShowNewOrderForm(false)}
                        gasStations={gasStations}
                    />
                </div>
            </Modal>
        </div>
    );
};

export default OrderScreen;
