import Card from '../ui/Card';

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

interface InventoryListProps {
    inventory: InventoryItem[];
    onEdit: (item: InventoryItem) => void;
    onDelete: (item: InventoryItem) => void;
    onAddStock: (item: InventoryItem) => void;
    onRemoveStock: (item: InventoryItem) => void;
    loading?: boolean;
}

/**
 * Inventory List Component
 * Displays inventory items in a table format
 */
const InventoryList = ({ inventory, onEdit, onDelete, onAddStock, onRemoveStock, loading }: InventoryListProps) => {
    const getStatusBadgeClass = (status: string): string => {
        switch (status) {
            case 'in_stock':
                return 'bg-green-100 text-green-800';
            case 'low_stock':
                return 'bg-yellow-100 text-yellow-800';
            case 'out_of_stock':
                return 'bg-red-100 text-red-800';
            case 'overstocked':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    };

    if (inventory.length === 0) {
        return (
            <Card>
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-secondary-900">Nenhum item no estoque</h3>
                    <p className="mt-1 text-sm text-secondary-500">
                        Comece adicionando produtos ao estoque.
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <Card>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-secondary-200">
                    <thead className="bg-secondary-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                                Produto
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                                Quantidade
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                                Estoque
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                                Preço Unit.
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                                Valor Total
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-secondary-200">
                        {inventory.map((item) => (
                            <tr key={item.id} className="hover:bg-secondary-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-secondary-900">
                                        {item.productName}
                                    </div>
                                    {item.supplier && (
                                        <div className="text-sm text-secondary-500">
                                            Fornecedor: {item.supplier}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-secondary-900">
                                        {item.quantity} unidades
                                    </div>
                                    <div className="text-xs text-secondary-500">
                                        {item.stockPercentage}% do máximo
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-secondary-900">
                                        Mín: {item.minQuantity}
                                    </div>
                                    <div className="text-sm text-secondary-500">
                                        Máx: {item.maxQuantity}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                                    {formatCurrency(item.unitPrice)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                                    {formatCurrency(item.totalValue)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(item.status)}`}>
                                        {item.statusText}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <button
                                        onClick={() => onAddStock(item)}
                                        disabled={loading}
                                        className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                        title="Adicionar estoque"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => onRemoveStock(item)}
                                        disabled={loading || item.quantity === 0}
                                        className="text-orange-600 hover:text-orange-900 disabled:opacity-50"
                                        title="Remover estoque"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => onEdit(item)}
                                        disabled={loading}
                                        className="text-primary-600 hover:text-primary-900 disabled:opacity-50"
                                        title="Editar"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => onDelete(item)}
                                        disabled={loading}
                                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                        title="Excluir"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default InventoryList;
