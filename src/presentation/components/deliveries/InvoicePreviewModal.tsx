import Button from '../ui/Button';

interface InvoiceItem {
    product: string;
    quantity: number;
    price: number;
}

interface CustomerAddress {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
}

interface Customer {
    name: string;
    phone: string;
    email: string;
    address: CustomerAddress;
}

interface GasStation {
    name: string;
    contactPerson: string;
    phone: string;
    address: string;
    city: string;
    state: string;
}

interface InvoiceData {
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    gasStation: GasStation;
    customer: Customer;
    items: InvoiceItem[];
    total: number;
    taxes: number;
    netTotal: number;
}

interface InvoicePreviewModalProps {
    invoiceData: InvoiceData | null;
    onClose: () => void;
    onDownload: () => void;
    onPrint: () => void;
}

/**
 * Invoice Preview Modal Component
 * Modal for displaying and managing invoice preview
 */
const InvoicePreviewModal = ({ invoiceData, onClose, onDownload, onPrint }: InvoicePreviewModalProps) => {
    if (!invoiceData) return null;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Preview da Nota Fiscal
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

                {/* Invoice Content */}
                <div className="p-8 bg-white" id="invoice-content">
                    {/* Header da Nota Fiscal */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">NOTA FISCAL DE SERVIÇO</h1>
                        <p className="text-lg text-gray-600">Entrega de Gás</p>
                    </div>

                    {/* Informações da Nota */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-800 mb-3">Dados da Nota Fiscal</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Número:</span>
                                    <span className="font-medium">{invoiceData.invoiceNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Data de Emissão:</span>
                                    <span className="font-medium">{formatDate(invoiceData.issueDate)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Data de Vencimento:</span>
                                    <span className="font-medium">{formatDate(invoiceData.dueDate)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-primary-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-800 mb-3">Prestador de Serviço</h3>
                            <div className="space-y-2">
                                <div>
                                    <span className="text-gray-600">Empresa:</span>
                                    <p className="font-medium">{invoiceData.gasStation.name}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Responsável:</span>
                                    <p className="font-medium">{invoiceData.gasStation.contactPerson}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Telefone:</span>
                                    <p className="font-medium">{invoiceData.gasStation.phone}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Endereço:</span>
                                    <p className="font-medium">{invoiceData.gasStation.address}, {invoiceData.gasStation.city} - {invoiceData.gasStation.state}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Informações do Cliente */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-8">
                        <h3 className="font-semibold text-gray-800 mb-3">Dados do Cliente</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <span className="text-gray-600">Nome:</span>
                                <p className="font-medium">{invoiceData.customer.name}</p>
                            </div>
                            <div>
                                <span className="text-gray-600">Telefone:</span>
                                <p className="font-medium">{invoiceData.customer.phone}</p>
                            </div>
                            <div>
                                <span className="text-gray-600">Email:</span>
                                <p className="font-medium">{invoiceData.customer.email}</p>
                            </div>
                            <div>
                                <span className="text-gray-600">Endereço de Entrega:</span>
                                <p className="font-medium">
                                    {invoiceData.customer.address.street}, {invoiceData.customer.address.neighborhood}<br />
                                    {invoiceData.customer.address.city} - {invoiceData.customer.address.state}<br />
                                    CEP: {invoiceData.customer.address.zipCode}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Itens da Nota Fiscal */}
                    <div className="mb-8">
                        <h3 className="font-semibold text-gray-800 mb-4">Discriminação dos Serviços</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-300">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-gray-300 px-4 py-2 text-left">Descrição</th>
                                        <th className="border border-gray-300 px-4 py-2 text-center">Quantidade</th>
                                        <th className="border border-gray-300 px-4 py-2 text-right">Valor Unitário</th>
                                        <th className="border border-gray-300 px-4 py-2 text-right">Valor Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoiceData.items.map((item: InvoiceItem, index: number) => (
                                        <tr key={index}>
                                            <td className="border border-gray-300 px-4 py-2">
                                                Entrega de {item.product}
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">
                                                {item.quantity}
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2 text-right">
                                                {formatCurrency(item.price)}
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2 text-right">
                                                {formatCurrency(item.price * item.quantity)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Totais */}
                    <div className="flex justify-end mb-8">
                        <div className="w-full max-w-md">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span className="font-medium">{formatCurrency(invoiceData.total)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Impostos (18%):</span>
                                        <span className="font-medium">{formatCurrency(invoiceData.taxes)}</span>
                                    </div>
                                    <div className="border-t border-gray-300 pt-2">
                                        <div className="flex justify-between">
                                            <span className="text-lg font-semibold text-gray-800">Total Geral:</span>
                                            <span className="text-lg font-semibold text-gray-800">{formatCurrency(invoiceData.netTotal)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Observações */}
                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-800 mb-2">Observações</h3>
                        <p className="text-gray-600 text-sm">
                            • Esta nota fiscal refere-se ao serviço de entrega de gás realizado no endereço especificado.<br />
                            • O pagamento deve ser efetuado até a data de vencimento.<br />
                            • Em caso de dúvidas, entre em contato através do telefone {invoiceData.gasStation.phone}.
                        </p>
                    </div>
                </div>

                {/* Footer com botões */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                    <Button
                        variant="outline"
                        onClick={onClose}
                    >
                        Fechar
                    </Button>
                    <Button
                        variant="outline"
                        onClick={onPrint}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Imprimir
                    </Button>
                    <Button
                        variant="primary"
                        onClick={onDownload}
                        className="bg-green-600 hover:bg-green-700 border-green-600"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Baixar PDF
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default InvoicePreviewModal;