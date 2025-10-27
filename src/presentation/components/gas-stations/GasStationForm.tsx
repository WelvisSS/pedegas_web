import { useEffect, useState, FormEvent } from 'react';
import { GasStation } from '../../../domain/entities/GasStation';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface GasStationFormProps {
    gasStation: GasStation | null;
    onSubmit: (gasStationData: Partial<GasStation>) => void;
    onCancel: () => void;
    loading: boolean;
}

interface OperatingHours {
    [key: string]: {
        open: string;
        close: string;
    };
}

interface Coordinates {
    lat: string;
    lng: string;
}

interface FormData {
    name: string;
    cnpj: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    email: string;
    contactPerson: string;
    capacityLiters: string;
    storageType: string;
    licenseNumber: string;
    licenseExpiry: string;
    operatingHours: OperatingHours;
    services: string[];
    paymentMethods: string[];
    coordinates: Coordinates;
    notes: string;
}

interface FormErrors {
    [key: string]: string;
}

/**
 * Gas Station Form Component
 * Component for creating and editing gas stations
 * Following Single Responsibility Principle
 */
const GasStationForm = ({ gasStation, onSubmit, onCancel, loading }: GasStationFormProps) => {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        cnpj: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        phone: '',
        email: '',
        contactPerson: '',
        capacityLiters: '',
        storageType: 'underground',
        licenseNumber: '',
        licenseExpiry: '',
        operatingHours: {
            monday: { open: '08:00', close: '18:00' },
            tuesday: { open: '08:00', close: '18:00' },
            wednesday: { open: '08:00', close: '18:00' },
            thursday: { open: '08:00', close: '18:00' },
            friday: { open: '08:00', close: '18:00' },
            saturday: { open: '08:00', close: '18:00' },
            sunday: { open: '08:00', close: '18:00' }
        },
        services: [],
        paymentMethods: [],
        coordinates: { lat: '', lng: '' },
        notes: ''
    });

    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
        if (gasStation) {
            setFormData({
                name: gasStation.name || '',
                cnpj: gasStation.cnpj || '',
                address: gasStation.address || '',
                city: gasStation.city || '',
                state: gasStation.state || '',
                zipCode: gasStation.zipCode || '',
                phone: gasStation.phone || '',
                email: gasStation.email || '',
                contactPerson: gasStation.contactPerson || '',
                capacityLiters: gasStation.capacityLiters?.toString() || '',
                storageType: gasStation.storageType || 'underground',
                licenseNumber: gasStation.licenseNumber || '',
                licenseExpiry: gasStation.licenseExpiry || '',
                operatingHours: gasStation.operatingHours || {
                    monday: { open: '08:00', close: '18:00' },
                    tuesday: { open: '08:00', close: '18:00' },
                    wednesday: { open: '08:00', close: '18:00' },
                    thursday: { open: '08:00', close: '18:00' },
                    friday: { open: '08:00', close: '18:00' },
                    saturday: { open: '08:00', close: '18:00' },
                    sunday: { open: '08:00', close: '18:00' }
                },
                services: gasStation.services || [],
                paymentMethods: gasStation.paymentMethods || [],
                coordinates: gasStation.coordinates ? { 
                    lat: gasStation.coordinates.lat?.toString() || '', 
                    lng: gasStation.coordinates.lng?.toString() || '' 
                } : { lat: '', lng: '' },
                notes: gasStation.notes || ''
            });
        }
    }, [gasStation]);

    const handleInputChange = (field: keyof FormData, value: string | string[] | Coordinates) => {
        setFormData((prev: FormData) => ({
            ...prev,
            [field]: value
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev: FormErrors) => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handleArrayChange = (field: 'services' | 'paymentMethods', value: string[]) => {
        setFormData((prev: FormData) => ({
            ...prev,
            [field]: value
        }));
    };

    const handleOperatingHoursChange = (day: keyof OperatingHours, field: 'open' | 'close', value: string) => {
        setFormData((prev: FormData) => ({
            ...prev,
            operatingHours: {
                ...prev.operatingHours,
                [day]: {
                    ...prev.operatingHours[day],
                    [field]: value
                }
            }
        }));
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
        if (!formData.address.trim()) newErrors.address = 'Endereço é obrigatório';
        if (!formData.city.trim()) newErrors.city = 'Cidade é obrigatória';
        if (!formData.state.trim()) newErrors.state = 'Estado é obrigatório';
        if (!formData.zipCode.trim()) newErrors.zipCode = 'CEP é obrigatório';

        if (formData.cnpj && !isValidCNPJ(formData.cnpj)) {
            newErrors.cnpj = 'CNPJ inválido';
        }

        if (formData.email && !isValidEmail(formData.email)) {
            newErrors.email = 'E-mail inválido';
        }

        if (formData.phone && !isValidPhone(formData.phone)) {
            newErrors.phone = 'Telefone inválido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const isValidCNPJ = (cnpj: string): boolean => {
        const cleanCnpj = cnpj.replace(/[^\d]/g, '');
        return cleanCnpj.length === 14;
    };

    const isValidEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const isValidPhone = (phone: string): boolean => {
        const cleanPhone = phone.replace(/[^\d]/g, '');
        return cleanPhone.length >= 10 && cleanPhone.length <= 11;
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Convert capacity to number
        const dataToSubmit: Partial<GasStation> = {
            ...formData,
            capacityLiters: formData.capacityLiters ? parseInt(formData.capacityLiters) : undefined,
            coordinates: {
                lat: formData.coordinates.lat ? parseFloat(formData.coordinates.lat) : undefined,
                lng: formData.coordinates.lng ? parseFloat(formData.coordinates.lng) : undefined
            }
        };

        onSubmit(dataToSubmit);
    };

    const storageTypes = [
        { value: 'underground', label: 'Subterrâneo' },
        { value: 'above_ground', label: 'Superfície' },
        { value: 'mobile', label: 'Móvel' }
    ];

    const serviceOptions = [
        { value: 'delivery', label: 'Entrega' },
        { value: 'pickup', label: 'Retirada' },
        { value: 'emergency', label: 'Emergência' },
        { value: 'bulk', label: 'Atacado' }
    ];

    const paymentMethodOptions = [
        { value: 'cash', label: 'Dinheiro' },
        { value: 'credit', label: 'Cartão de Crédito' },
        { value: 'debit', label: 'Cartão de Débito' },
        { value: 'pix', label: 'PIX' },
        { value: 'transfer', label: 'Transferência' }
    ];

    const days: Array<{ key: keyof OperatingHours; label: string }> = [
        { key: 'monday', label: 'Segunda-feira' },
        { key: 'tuesday', label: 'Terça-feira' },
        { key: 'wednesday', label: 'Quarta-feira' },
        { key: 'thursday', label: 'Quinta-feira' },
        { key: 'friday', label: 'Sexta-feira' },
        { key: 'saturday', label: 'Sábado' },
        { key: 'sunday', label: 'Domingo' }
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-secondary-900">
                            {gasStation ? 'Editar Ponto de Venda' : 'Novo Ponto de Venda'}
                        </h2>
                        <button
                            onClick={onCancel}
                            className="text-secondary-400 hover:text-secondary-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-2">
                                    Nome do Ponto de Venda *
                                </label>
                                <Input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    error={errors.name}
                                    placeholder="Ex: Posto Central"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-2">
                                    CNPJ
                                </label>
                                <Input
                                    type="text"
                                    value={formData.cnpj}
                                    onChange={(e) => handleInputChange('cnpj', e.target.value)}
                                    error={errors.cnpj}
                                    placeholder="00.000.000/0000-00"
                                />
                            </div>
                        </div>

                        {/* Address Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-secondary-700 mb-2">
                                    Endereço *
                                </label>
                                <Input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                    error={errors.address}
                                    placeholder="Rua, número, bairro"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-2">
                                    Cidade *
                                </label>
                                <Input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => handleInputChange('city', e.target.value)}
                                    error={errors.city}
                                    placeholder="São Paulo"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-2">
                                    Estado *
                                </label>
                                <Input
                                    type="text"
                                    value={formData.state}
                                    onChange={(e) => handleInputChange('state', e.target.value)}
                                    error={errors.state}
                                    placeholder="SP"
                                    maxLength={2}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-2">
                                    CEP *
                                </label>
                                <Input
                                    type="text"
                                    value={formData.zipCode}
                                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                                    error={errors.zipCode}
                                    placeholder="00000-000"
                                />
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-2">
                                    Telefone
                                </label>
                                <Input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    error={errors.phone}
                                    placeholder="(11) 99999-9999"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-2">
                                    E-mail
                                </label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    error={errors.email}
                                    placeholder="contato@exemplo.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-2">
                                    Pessoa de Contato
                                </label>
                                <Input
                                    type="text"
                                    value={formData.contactPerson}
                                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                                    placeholder="Nome do responsável"
                                />
                            </div>
                        </div>

                        {/* Technical Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-2">
                                    Capacidade (Litros)
                                </label>
                                <Input
                                    type="number"
                                    value={formData.capacityLiters}
                                    onChange={(e) => handleInputChange('capacityLiters', e.target.value)}
                                    placeholder="10000"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-2">
                                    Tipo de Armazenamento
                                </label>
                                <select
                                    value={formData.storageType}
                                    onChange={(e) => handleInputChange('storageType', e.target.value)}
                                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                >
                                    {storageTypes.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-2">
                                    Número da Licença
                                </label>
                                <Input
                                    type="text"
                                    value={formData.licenseNumber}
                                    onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                                    placeholder="123456789"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-2">
                                    Vencimento da Licença
                                </label>
                                <Input
                                    type="date"
                                    value={formData.licenseExpiry}
                                    onChange={(e) => handleInputChange('licenseExpiry', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Services */}
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-2">
                                Serviços Oferecidos
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {serviceOptions.map(service => (
                                    <label key={service.value} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.services.includes(service.value)}
                                            onChange={(e) => {
                                                const newServices = e.target.checked
                                                    ? [...formData.services, service.value]
                                                    : formData.services.filter(s => s !== service.value);
                                                handleArrayChange('services', newServices);
                                            }}
                                            className="mr-2"
                                        />
                                        <span className="text-sm text-secondary-700">{service.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-2">
                                Formas de Pagamento
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                {paymentMethodOptions.map(method => (
                                    <label key={method.value} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.paymentMethods.includes(method.value)}
                                            onChange={(e) => {
                                                const newMethods = e.target.checked
                                                    ? [...formData.paymentMethods, method.value]
                                                    : formData.paymentMethods.filter(m => m !== method.value);
                                                handleArrayChange('paymentMethods', newMethods);
                                            }}
                                            className="mr-2"
                                        />
                                        <span className="text-sm text-secondary-700">{method.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Operating Hours */}
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-2">
                                Horário de Funcionamento
                            </label>
                            <div className="space-y-2">
                                {days.map(day => (
                                    <div key={day.key} className="flex items-center space-x-2">
                                        <div className="w-24 text-sm text-secondary-700">{day.label}:</div>
                                        <Input
                                            type="time"
                                            value={formData.operatingHours[day.key]?.open || ''}
                                            onChange={(e) => handleOperatingHoursChange(day.key, 'open', e.target.value)}
                                            className="w-24"
                                        />
                                        <span className="text-secondary-500">até</span>
                                        <Input
                                            type="time"
                                            value={formData.operatingHours[day.key]?.close || ''}
                                            onChange={(e) => handleOperatingHoursChange(day.key, 'close', e.target.value)}
                                            className="w-24"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Coordinates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-2">
                                    Latitude
                                </label>
                                <Input
                                    type="number"
                                    step="any"
                                    value={formData.coordinates.lat}
                                    onChange={(e) => handleInputChange('coordinates', { ...formData.coordinates, lat: e.target.value })}
                                    placeholder="-23.5505"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-2">
                                    Longitude
                                </label>
                                <Input
                                    type="number"
                                    step="any"
                                    value={formData.coordinates.lng}
                                    onChange={(e) => handleInputChange('coordinates', { ...formData.coordinates, lng: e.target.value })}
                                    placeholder="-46.6333"
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-2">
                                Observações
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                placeholder="Informações adicionais sobre o ponto de venda..."
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end space-x-3 pt-6 border-t border-secondary-200">
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
                                disabled={loading}
                            >
                                {loading ? 'Salvando...' : (gasStation ? 'Atualizar' : 'Criar')}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default GasStationForm;
