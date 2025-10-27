import type { ChangeEvent, FormEvent } from 'react';
import { useState } from 'react';
import type { InventoryData } from '../../../application/services/InventoryService';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';

interface InventoryItem {
    id?: string;
    productName: string;
    productType: string;
    quantity: number;
    minQuantity: number;
    maxQuantity: number;
    unitPrice: number;
    supplier?: string;
    nextRestockDate?: string;
    notes?: string;
}

interface InventoryFormProps {
    item?: InventoryItem | null;
    onSubmit: (data: InventoryData) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

interface FormState {
    productName: string;
    productType: string;
    quantity: number;
    minQuantity: number;
    maxQuantity: number;
    unitPrice: number;
    supplier: string;
    nextRestockDate: string;
    notes: string;
}

interface FormErrors {
    [key: string]: string;
}

/**
 * Inventory Form Component
 * Form for creating and editing inventory items
 */
const InventoryForm = ({ item, onSubmit, onCancel, loading }: InventoryFormProps) => {
    const [formData, setFormData] = useState<FormState>({
        productName: item?.productName || '',
        productType: item?.productType || '',
        quantity: item?.quantity || 0,
        minQuantity: item?.minQuantity || 0,
        maxQuantity: item?.maxQuantity || 100,
        unitPrice: item?.unitPrice || 0,
        supplier: item?.supplier || '',
        nextRestockDate: item?.nextRestockDate ? item.nextRestockDate.split('T')[0] : '',
        notes: item?.notes || ''
    });

    const [errors, setErrors] = useState<FormErrors>({});

    const productTypes = [
        { value: 'p13', label: 'Botijão P13 (13kg)' },
        { value: 'p20', label: 'Botijão P20 (20kg)' },
        { value: 'p45', label: 'Botijão P45 (45kg)' },
        { value: 'p90', label: 'Botijão P90 (90kg)' }
    ];

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: FormState) => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors((prev: FormErrors) => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validate = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.productName) {
            newErrors.productName = 'Nome do produto é obrigatório';
        }

        if (!formData.productType) {
            newErrors.productType = 'Tipo de produto é obrigatório';
        }

        if (formData.quantity < 0) {
            newErrors.quantity = 'Quantidade não pode ser negativa';
        }

        if (formData.minQuantity < 0) {
            newErrors.minQuantity = 'Quantidade mínima não pode ser negativa';
        }

        if (formData.maxQuantity < 0) {
            newErrors.maxQuantity = 'Quantidade máxima não pode ser negativa';
        }

        if (formData.minQuantity > formData.maxQuantity) {
            newErrors.minQuantity = 'Quantidade mínima não pode ser maior que a máxima';
        }

        if (formData.unitPrice < 0) {
            newErrors.unitPrice = 'Preço unitário não pode ser negativo';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        // Map form data to InventoryData interface
        const submitData: InventoryData = {
            productName: formData.productName,
            productType: formData.productType,
            quantity: parseInt(String(formData.quantity)) || 0,
            unit: 'unidade', // Default unit
            minStockLevel: parseInt(String(formData.minQuantity)) || 0,
            price: parseFloat(String(formData.unitPrice)) || 0
        };

        await onSubmit(submitData);
    };

    return (
        <Modal
            isOpen={true}
            onClose={onCancel}
            title={item ? 'Editar Item de Estoque' : 'Novo Item de Estoque'}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Nome do Produto *"
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleChange}
                    error={errors.productName}
                    disabled={loading}
                    placeholder="Ex: Botijão de Gás"
                />

                <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Tipo de Produto *
                    </label>
                    <select
                        name="productType"
                        value={formData.productType}
                        onChange={handleChange}
                        disabled={!!item || loading}
                        className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-secondary-100"
                    >
                        <option value="">Selecione um tipo</option>
                        {productTypes.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                    {errors.productType && (
                        <p className="mt-1 text-sm text-red-600">{errors.productType}</p>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <Input
                        label="Quantidade Atual *"
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        error={errors.quantity}
                        disabled={loading}
                        min="0"
                    />
                    <Input
                        label="Quantidade Mínima *"
                        type="number"
                        name="minQuantity"
                        value={formData.minQuantity}
                        onChange={handleChange}
                        error={errors.minQuantity}
                        disabled={loading}
                        min="0"
                    />
                    <Input
                        label="Quantidade Máxima *"
                        type="number"
                        name="maxQuantity"
                        value={formData.maxQuantity}
                        onChange={handleChange}
                        error={errors.maxQuantity}
                        disabled={loading}
                        min="0"
                    />
                </div>

                <Input
                    label="Preço Unitário (R$)"
                    type="number"
                    name="unitPrice"
                    value={formData.unitPrice}
                    onChange={handleChange}
                    error={errors.unitPrice}
                    disabled={loading}
                    min="0"
                    step="0.01"
                />

                <Input
                    label="Fornecedor"
                    type="text"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleChange}
                    error={errors.supplier}
                    disabled={loading}
                    placeholder="Nome do fornecedor"
                />

                <Input
                    label="Próxima Reposição"
                    type="date"
                    name="nextRestockDate"
                    value={formData.nextRestockDate}
                    onChange={handleChange}
                    error={errors.nextRestockDate}
                    disabled={loading}
                />

                <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Observações
                    </label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        disabled={loading}
                        rows={3}
                        className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-secondary-100"
                        placeholder="Observações adicionais sobre o item"
                    />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
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
                        loading={loading}
                    >
                        {item ? 'Atualizar' : 'Criar'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default InventoryForm;
