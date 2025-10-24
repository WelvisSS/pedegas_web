import Button from '../ui/Button';

interface DeliveryItem {
    product: string;
    quantity: number;
    price: number;
}

interface DeliveryAddress {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
}

interface GasStation {
    name: string;
    contactPerson: string;
    phone: string;
    address: string;
    city: string;
    state: string;
}

interface TimelineEvent {
    event: string;
    timestamp: string;
    notes?: string;
}

interface Delivery {
    id: string | number;
    status: 'pending' | 'accepted' | 'in_progress' | 'delivered' | 'rejected';
    priority: 'high' | 'medium' | 'low';
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    gasStation?: GasStation;
    address: DeliveryAddress;
    items: DeliveryItem[];
    total: number;
    estimatedDelivery: string;
    orderDate: string;
    notes?: string;
    timeline?: TimelineEvent[];
}

interface DeliveryDetailsModalProps {
    delivery: Delivery;
    onClose: () => void;
}

/**
 * Delivery Details Modal Component
 * Modal for displaying detailed information about a delivery order
 */
const DeliveryDetailsModal = ({ delivery, onClose }: DeliveryDetailsModalProps) => {
    if (!delivery) return null;

    const getStatusColor = (status: Delivery['status']) => {
        switch (status) {
            case 'pending':
                return 'text-yellow-600 bg-yellow-100';
            case 'accepted':
                return 'text-blue-600 bg-blue-100';
            case 'in_progress':
                return 'text-indigo-600 bg-indigo-100';
            case 'delivered':
                return 'text-green-600 bg-green-100';
            case 'rejected':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusText = (status: Delivery['status']) => {
        switch (status) {
            case 'pending':
                return 'Pendente';
            case 'accepted':
                return 'Aceito';
            case 'in_progress':
                return 'Em Andamento';
            case 'delivered':
                return 'Entregue';
            case 'rejected':
                return 'Rejeitado';
            default:
                return status;
        }
    };

    const getPriorityColor = (priority: Delivery['priority']) => {
        switch (priority) {
            case 'high':
                return 'text-red-600 bg-red-100';
            case 'medium':
                return 'text-yellow-600 bg-yellow-100';
            case 'low':
                return 'text-green-600 bg-green-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getPriorityText = (priority: Delivery['priority']) => {
        switch (priority) {
            case 'high':
                return 'Alta';
            case 'medium':
                return 'Média';
            case 'low':
                return 'Baixa';
            default:
                return priority;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('pt-BR');
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(amount);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Detalhes do Pedido #{delivery.id}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Status and Priority */}
                    <div className="flex flex-wrap gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(delivery.status)}`}>
                            {getStatusText(delivery.status)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(delivery.priority)}`}>
                            Prioridade {getPriorityText(delivery.priority)}
                        </span>
                    </div>

                    {/* Customer Information */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-800 mb-3">Informações do Cliente</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Nome</p>
                                <p className="font-medium text-gray-800">{delivery.customerName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Telefone</p>
                                <p className="font-medium text-gray-800">{delivery.customerPhone}</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-sm text-gray-600">Email</p>
                                <p className="font-medium text-gray-800">{delivery.customerEmail}</p>
                            </div>
                        </div>
                    </div>

                    {/* Gas Station Information */}
                    {delivery.gasStation && (
                        <div className="bg-primary-50 rounded-lg p-4">
                            <h3 className="text-lg font-medium text-gray-800 mb-3">Ponto de Venda Responsável</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Nome do Posto</p>
                                    <p className="font-medium text-gray-800">{delivery.gasStation.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Responsável</p>
                                    <p className="font-medium text-gray-800">{delivery.gasStation.contactPerson}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Telefone</p>
                                    <p className="font-medium text-gray-800">{delivery.gasStation.phone}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Endereço</p>
                                    <p className="font-medium text-gray-800">
                                        {delivery.gasStation.address}, {delivery.gasStation.city} - {delivery.gasStation.state}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Delivery Address */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-800 mb-3">Endereço de Entrega</h3>
                        <div className="space-y-2">
                            <p className="font-medium text-gray-800">{delivery.address.street}</p>
                            <p className="text-gray-600">{delivery.address.neighborhood}</p>
                            <p className="text-gray-600">
                                {delivery.address.city}, {delivery.address.state} - {delivery.address.zipCode}
                            </p>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-800 mb-3">Itens do Pedido</h3>
                        <div className="space-y-3">
                            {delivery.items.map((item, index) => (
                                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                                    <div>
                                        <p className="font-medium text-gray-800">{item.product}</p>
                                        <p className="text-sm text-gray-600">Quantidade: {item.quantity}</p>
                                    </div>
                                    <p className="font-medium text-gray-800">{formatCurrency(item.price * item.quantity)}</p>
                                </div>
                            ))}
                            <div className="flex justify-between items-center pt-3 border-t border-gray-300">
                                <p className="text-lg font-semibold text-gray-800">Total</p>
                                <p className="text-lg font-semibold text-gray-800">{formatCurrency(delivery.total)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Information */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-800 mb-3">Informações da Entrega</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Previsão de Entrega</p>
                                <p className="font-medium text-gray-800">{formatDate(delivery.estimatedDelivery)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Data do Pedido</p>
                                <p className="font-medium text-gray-800">{formatDate(delivery.orderDate)}</p>
                            </div>
                            {delivery.notes && (
                                <div className="md:col-span-2">
                                    <p className="text-sm text-gray-600">Observações</p>
                                    <p className="font-medium text-gray-800">{delivery.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Timeline */}
                    {delivery.timeline && delivery.timeline.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="text-lg font-medium text-gray-800 mb-3">Histórico</h3>
                            <div className="space-y-3">
                                {delivery.timeline.map((event, index) => (
                                    <div key={index} className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                                        <div>
                                            <p className="font-medium text-gray-800">{event.event}</p>
                                            <p className="text-sm text-gray-600">{formatDate(event.timestamp)}</p>
                                            {event.notes && (
                                                <p className="text-sm text-gray-600 mt-1">{event.notes}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end p-6 border-t border-gray-200 space-x-3">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                    >
                        Fechar
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DeliveryDetailsModal;