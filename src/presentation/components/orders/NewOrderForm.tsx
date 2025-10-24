import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Alert from '../ui/Alert';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface DeliveryAddress {
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
}

interface OrderItem {
    type: string;
    product: string;
    quantity: number;
    price: number;
    brand: string;
}

interface FormData {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    deliveryAddress: DeliveryAddress;
    items: OrderItem[];
    priority: 'low' | 'medium' | 'high' | 'urgent';
    notes: string;
    estimatedDelivery: string;
    gasStationId: string;
}

interface GasStation {
    id?: string;
    name: string;
    city?: string;
    state?: string;
}

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

interface NewOrderFormProps {
    onSubmit: (orderData: OrderData) => Promise<void>;
    onCancel: () => void;
    gasStations?: GasStation[];
}

const NewOrderForm: React.FC<NewOrderFormProps> = ({ onSubmit, onCancel, gasStations }) => {
    const { user } = useAuth();

    const [formData, setFormData] = useState<FormData>({
        // Dados do cliente
        customerName: '',
        customerPhone: '',
        customerEmail: '',

        // Endereço de entrega
        deliveryAddress: {
            street: '',
            number: '',
            complement: '',
            neighborhood: '',
            city: '',
            state: '',
            zipCode: ''
        },

        // Itens do pedido
        items: [
            {
                type: 'gas_cylinder',
                product: 'P13',
                quantity: 1,
                price: 0,
                brand: 'Ultragaz'
            }
        ],

        // Configurações do pedido
        priority: 'medium',
        notes: '',
        estimatedDelivery: '',
        gasStationId: ''
    });

    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });

    // Preços base dos produtos
    const productPrices: Record<string, number> = {
        'P13': 95.00,
        'P20': 135.00,
        'P45': 280.00
    };

    const gasTypes = [
        { value: 'P13', label: 'Botijão P13 (13kg)', description: 'Ideal para residências' },
        { value: 'P20', label: 'Botijão P20 (20kg)', description: 'Ideal para comércios pequenos' },
        { value: 'P45', label: 'Botijão P45 (45kg)', description: 'Ideal para restaurantes e indústrias' }
    ];

    const gasBrands = [
        'Ultragaz',
        'Liquigás',
        'Copagaz',
        'Consigaz',
        'Supergasbras'
    ];

    const priorities = [
        { value: 'low' as const, label: 'Baixa', description: 'Entrega em até 3 dias' },
        { value: 'medium' as const, label: 'Normal', description: 'Entrega em até 24h' },
        { value: 'high' as const, label: 'Alta', description: 'Entrega em até 12h' },
        { value: 'urgent' as const, label: 'Urgente', description: 'Entrega em até 4h' }
    ];

    // Preencher dados do usuário automaticamente
    useEffect(() => {
        if (user) {
            const fullName = user.name || user.email?.split('@')[0] || '';
            const email = user.email || '';

            setFormData(prev => ({
                ...prev,
                customerName: fullName,
                customerEmail: email,
                // Phone is not available in the User entity, leave it empty
                customerPhone: ''
            }));
        }
    }, [user]);

    const handleInputChange = (field: string, value: string) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setFormData(prev => {
                if (parent === 'deliveryAddress') {
                    return {
                        ...prev,
                        deliveryAddress: {
                            ...prev.deliveryAddress,
                            [child]: value
                        }
                    };
                }
                return prev;
            });
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleItemChange = (index: number, field: keyof OrderItem, value: string | number) => {
        const newItems = [...formData.items];
        newItems[index] = {
            ...newItems[index],
            [field]: value
        };

        // Atualizar preço automaticamente quando o produto muda
        if (field === 'product') {
            newItems[index].price = productPrices[value as string] || 0;
        }

        setFormData(prev => ({
            ...prev,
            items: newItems
        }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [
                ...prev.items,
                {
                    type: 'gas_cylinder',
                    product: 'P13',
                    quantity: 1,
                    price: productPrices['P13'],
                    brand: 'Ultragaz'
                }
            ]
        }));
    };

    const removeItem = (index: number) => {
        if (formData.items.length > 1) {
            setFormData(prev => ({
                ...prev,
                items: prev.items.filter((_, i) => i !== index)
            }));
        }
    };

    const calculateTotal = () => {
        return formData.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const validateForm = () => {
        const errors: string[] = [];

        if (!formData.customerName.trim()) errors.push('Nome do cliente é obrigatório');
        if (!formData.customerPhone.trim()) errors.push('Telefone é obrigatório');
        if (!formData.deliveryAddress.street.trim()) errors.push('Endereço é obrigatório');
        if (!formData.deliveryAddress.city.trim()) errors.push('Cidade é obrigatória');
        if (!formData.gasStationId) errors.push('Posto de combustível é obrigatório');

        return errors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const errors = validateForm();
        if (errors.length > 0) {
            setAlert({
                show: true,
                type: 'error',
                message: errors.join(', ')
            });
            return;
        }

        setLoading(true);

        try {
            const orderData = {
                ...formData,
                totalAmount: calculateTotal(),
                deliveryAddress: JSON.stringify(formData.deliveryAddress),
                items: JSON.stringify(formData.items),
                estimatedDelivery: formData.estimatedDelivery || undefined,
                notes: formData.notes || undefined,
                gasStationId: formData.gasStationId || undefined
            };

            await onSubmit(orderData);
        } catch (error) {
            console.error('Error creating order:', error);
            setAlert({
                show: true,
                type: 'error',
                message: 'Erro ao criar pedido. Tente novamente.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <form onSubmit={handleSubmit} className="space-y-6">
                {alert.show && (
                    <Alert
                        type={alert.type as 'success' | 'error' | 'warning' | 'info'}
                        message={alert.message}
                        onClose={() => setAlert({ show: false, type: '', message: '' })}
                    />
                )}

                {/* Dados do Cliente */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            📝 Dados do Cliente
                        </h3>
                        {user && (formData.customerName || formData.customerEmail || formData.customerPhone) && (
                            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                🔒 Dados da sua conta
                            </span>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label={`Nome Completo *${user && formData.customerName ? ' 🔒' : ''}`}
                            value={formData.customerName}
                            onChange={(e) => handleInputChange('customerName', e.target.value)}
                            placeholder="Digite o nome completo"
                            disabled={!!(user && formData.customerName)}
                            className={user && formData.customerName ? "bg-gray-50 cursor-not-allowed" : ""}
                        />
                        <Input
                            label={`Telefone *${user && formData.customerPhone ? ' 🔒' : ''}`}
                            value={formData.customerPhone}
                            onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                            placeholder="(11) 99999-9999"
                            disabled={!!(user && formData.customerPhone)}
                            className={user && formData.customerPhone ? "bg-gray-50 cursor-not-allowed" : ""}
                        />
                        <Input
                            label={`E-mail${user && formData.customerEmail ? ' 🔒' : ''}`}
                            type="email"
                            value={formData.customerEmail}
                            onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                            placeholder="cliente@email.com"
                            disabled={!!(user && formData.customerEmail)}
                            className={`md:col-span-2 ${user && formData.customerEmail ? "bg-gray-50 cursor-not-allowed" : ""}`}
                        />
                    </div>
                </div>

                {/* Endereço de Entrega */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        📍 Endereço de Entrega
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Input
                            label="CEP"
                            value={formData.deliveryAddress.zipCode}
                            onChange={(e) => handleInputChange('deliveryAddress.zipCode', e.target.value)}
                            placeholder="00000-000"
                        />
                        <Input
                            label="Rua/Avenida *"
                            value={formData.deliveryAddress.street}
                            onChange={(e) => handleInputChange('deliveryAddress.street', e.target.value)}
                            placeholder="Nome da rua"
                            className="md:col-span-2"
                        />
                        <Input
                            label="Número *"
                            value={formData.deliveryAddress.number}
                            onChange={(e) => handleInputChange('deliveryAddress.number', e.target.value)}
                            placeholder="123"
                        />
                        <Input
                            label="Complemento"
                            value={formData.deliveryAddress.complement}
                            onChange={(e) => handleInputChange('deliveryAddress.complement', e.target.value)}
                            placeholder="Apto, casa, etc."
                        />
                        <Input
                            label="Bairro"
                            value={formData.deliveryAddress.neighborhood}
                            onChange={(e) => handleInputChange('deliveryAddress.neighborhood', e.target.value)}
                            placeholder="Nome do bairro"
                        />
                        <Input
                            label="Cidade *"
                            value={formData.deliveryAddress.city}
                            onChange={(e) => handleInputChange('deliveryAddress.city', e.target.value)}
                            placeholder="São Paulo"
                        />
                        <Input
                            label="Estado"
                            value={formData.deliveryAddress.state}
                            onChange={(e) => handleInputChange('deliveryAddress.state', e.target.value)}
                            placeholder="SP"
                        />
                    </div>
                </div>

                {/* Itens do Pedido */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            🛒 Itens do Pedido
                        </h3>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={addItem}
                        >
                            + Adicionar Item
                        </Button>
                    </div>

                    {formData.items.map((item, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                            <div className="flex justify-between items-start mb-4">
                                <h4 className="font-medium text-gray-900">Item {index + 1}</h4>
                                {formData.items.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="danger"
                                        size="sm"
                                        onClick={() => removeItem(index)}
                                    >
                                        Remover
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tipo de Gás
                                    </label>
                                    <select
                                        value={item.product}
                                        onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                                    >
                                        {gasTypes.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {gasTypes.find(t => t.value === item.product)?.description}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Marca
                                    </label>
                                    <select
                                        value={item.brand}
                                        onChange={(e) => handleItemChange(index, 'brand', e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                                    >
                                        {gasBrands.map(brand => (
                                            <option key={brand} value={brand}>
                                                {brand}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <Input
                                    label="Quantidade"
                                    type="number"
                                    min="1"
                                    value={item.quantity.toString()}
                                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                                />

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Preço Unitário
                                    </label>
                                    <div className="text-lg font-semibold text-primary-600">
                                        {formatCurrency(item.price)}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Total: {formatCurrency(item.price * item.quantity)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="text-right pt-4 border-t border-gray-200">
                        <div className="text-xl font-bold text-primary-600">
                            Total Geral: {formatCurrency(calculateTotal())}
                        </div>
                    </div>
                </div>

                {/* Configurações do Pedido */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        ⚙️ Configurações do Pedido
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Posto de Combustível *
                            </label>
                            <select
                                value={formData.gasStationId}
                                onChange={(e) => handleInputChange('gasStationId', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="">Selecione um posto</option>
                                {gasStations && gasStations.length > 0 ? (
                                    gasStations.map(station => (
                                        <option key={station.id} value={station.id}>
                                            {station.name} - {station.city} {station.state ? `/${station.state}` : ''}
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>
                                        {gasStations === undefined ? 'Carregando postos...' : 'Nenhum posto disponível'}
                                    </option>
                                )}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Prioridade
                            </label>
                            <select
                                value={formData.priority}
                                onChange={(e) => handleInputChange('priority', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                            >
                                {priorities.map(priority => (
                                    <option key={priority.value} value={priority.value}>
                                        {priority.label} - {priority.description}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Input
                            label="Data/Hora Estimada de Entrega"
                            type="datetime-local"
                            value={formData.estimatedDelivery}
                            onChange={(e) => handleInputChange('estimatedDelivery', e.target.value)}
                            className="md:col-span-2"
                        />

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Observações
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                rows={3}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                                placeholder="Instruções especiais, pontos de referência, etc."
                            />
                        </div>
                    </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex justify-end space-x-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={loading}
                    >
                        {loading ? 'Criando Pedido...' : `Criar Pedido - ${formatCurrency(calculateTotal())}`}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default NewOrderForm;
