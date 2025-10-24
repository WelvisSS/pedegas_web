import { useState } from 'react';
import Button from './Button';
import Modal from './Modal';
import type { Order, DeliveryAddress } from '../../../domain/types/Order';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

const InvoiceModal = ({ isOpen, onClose, order }: InvoiceModalProps) => {
  const [loading, setLoading] = useState(false);

  const handlePrint = () => {
    const printContent = document.getElementById('invoice-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Nota Fiscal - ${generateInvoiceNumber()}</title>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>
                        @page {
                            margin: 1cm;
                            size: A4;
                        }
                        body { 
                            font-family: Arial, sans-serif; 
                            color: #000; 
                            background: white;
                            line-height: 1.4;
                        }
                        .no-print { display: none !important; }
                        .text-sm { font-size: 0.875rem; }
                        .text-lg { font-size: 1.125rem; }
                        .text-xl { font-size: 1.25rem; }
                        .text-2xl { font-size: 1.5rem; }
                        .font-bold { font-weight: 700; }
                        .font-semibold { font-weight: 600; }
                        .text-center { text-align: center; }
                        .text-right { text-align: right; }
                        .border-b-2 { border-bottom: 2px solid #000; }
                        .border-black { border-color: #000; }
                        .border { border: 1px solid #e5e7eb; }
                        .border-collapse { border-collapse: collapse; }
                        .p-8 { padding: 2rem; }
                        .p-4 { padding: 1rem; }
                        .p-2 { padding: 0.5rem; }
                        .pb-6 { padding-bottom: 1.5rem; }
                        .pt-2 { padding-top: 0.5rem; }
                        .pt-4 { padding-top: 1rem; }
                        .mb-2 { margin-bottom: 0.5rem; }
                        .mb-3 { margin-bottom: 0.75rem; }
                        .mb-4 { margin-bottom: 1rem; }
                        .mb-6 { margin-bottom: 1.5rem; }
                        .mt-2 { margin-top: 0.5rem; }
                        .mt-8 { margin-top: 2rem; }
                        .bg-gray-100 { background-color: #f3f4f6; }
                        .bg-yellow-50 { background-color: #fefce8; }
                        .border-yellow-200 { border-color: #fde047; }
                        .border-gray-300 { border-color: #d1d5db; }
                        .text-gray-600 { color: #4b5563; }
                        .text-xs { font-size: 0.75rem; }
                        .space-y-1 > * + * { margin-top: 0.25rem; }
                        .space-y-2 > * + * { margin-top: 0.5rem; }
                        .grid { display: grid; }
                        .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
                        .gap-4 { gap: 1rem; }
                        .gap-8 { gap: 2rem; }
                        .w-full { width: 100%; }
                        .rounded { border-radius: 0.25rem; }
                        .flex { display: flex; }
                        .justify-between { justify-content: space-between; }
                        .pl-4 { padding-left: 1rem; }
                        .whitespace-pre-line { white-space: pre-line; }
                        .border-t-2 { border-top: 2px solid #000; }
                        
                        @media print {
                            .no-print { display: none !important; }
                            .max-h-\\[70vh\\] { max-height: none !important; }
                            .overflow-y-auto { overflow: visible !important; }
                            body { margin: 0; padding: 0; }
                            .bg-yellow-50 { background-color: #fefce8 !important; -webkit-print-color-adjust: exact; }
                            .bg-gray-100 { background-color: #f3f4f6 !important; -webkit-print-color-adjust: exact; }
                            .border-yellow-200 { border-color: #fde047 !important; }
                            .text-gray-600 { color: #4b5563 !important; }
                        }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                </body>
                </html>
            `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      const invoiceNumber = generateInvoiceNumber();
      const link = document.createElement('a');
      link.href = '#';
      link.download = `nota-fiscal-${invoiceNumber}.pdf`;

      alert(`Nota fiscal ${invoiceNumber} seria baixada em uma implementação real.`);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Erro ao baixar a nota fiscal. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string | Date) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const generateInvoiceNumber = () => {
    if (!order) return 'NF-000000';
    const date = new Date(order.created_at);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const orderShort = order.id.slice(-6).toUpperCase();
    return `NF-${year}${month}-${orderShort}`;
  };

  const calculateTotals = () => {
    if (!order?.items) return { subtotal: 0, taxes: 0, total: 0 };

    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxes = subtotal * 0.18; // 18% de impostos (ICMS + PIS/COFINS)
    const total = subtotal + taxes;

    return { subtotal, taxes, total };
  };

  const formatAddress = (address: string | DeliveryAddress | undefined) => {
    if (!address) return 'Endereço de entrega';

    if (typeof address === 'string') return address;

    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.number) parts.push(address.number);
    if (address.complement) parts.push(address.complement);

    const streetLine = parts.join(', ');
    const cityLine = [address.neighborhood, address.city, address.state].filter(Boolean).join(' - ');
    const zipLine = address.zip_code ? `CEP: ${address.zip_code}` : '';

    return [streetLine, cityLine, zipLine].filter(Boolean).join('\n');
  };

  const { subtotal, taxes, total } = calculateTotals();

  if (!order) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="large">
        <div className="p-6">
          <div className="text-center">
            <p className="text-gray-500">Nenhum pedido selecionado</p>
            <Button variant="outline" onClick={onClose} className="mt-4">
              Fechar
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xlarge">
      <div className="p-6">
        {/* Header with actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Nota Fiscal</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Imprimir
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleDownload}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              )}
              Baixar PDF
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>

        {/* Invoice Content */}
        <div
          id="invoice-content"
          className="bg-white border border-gray-200 p-8 text-sm max-h-[70vh] overflow-y-auto"
        >
          {/* Invoice Header */}
          <div className="text-center border-b-2 border-black pb-6 mb-6">
            <h1 className="text-2xl font-bold mb-2">NOTA FISCAL DE VENDA</h1>
            <h2 className="text-xl font-semibold mb-4">PEDEGAS - ENTREGA DE GÁS</h2>
            <div className="text-lg font-bold">Nº {generateInvoiceNumber()}</div>
          </div>

          {/* Company Info */}
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-3">DADOS DA EMPRESA:</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p>
                  <strong>Razão Social:</strong> PedeGás Distribuidora de Gás Ltda.
                </p>
                <p>
                  <strong>CNPJ:</strong> 12.345.678/0001-90
                </p>
                <p>
                  <strong>Inscrição Estadual:</strong> 123.456.789.123
                </p>
                <p>
                  <strong>Inscrição Municipal:</strong> 9876543
                </p>
              </div>
              <div>
                <p>
                  <strong>Endereço:</strong> Rua das Distribuidoras, 123
                </p>
                <p>
                  <strong>Bairro:</strong> Centro - São Paulo/SP
                </p>
                <p>
                  <strong>CEP:</strong> 01234-567
                </p>
                <p>
                  <strong>Telefone:</strong> (11) 1234-5678
                </p>
              </div>
            </div>
          </div>

          {/* Invoice and Customer Info */}
          <div className="grid grid-cols-2 gap-8 mb-6">
            <div>
              <h3 className="font-bold text-lg mb-3">DADOS DA NOTA:</h3>
              <p>
                <strong>Data de Emissão:</strong> {formatDate(order?.created_at)}
              </p>
              <p>
                <strong>Data de Entrega:</strong>{' '}
                {order?.delivery_date ? formatDate(order.delivery_date) : formatDate(order?.created_at)}
              </p>
              <p>
                <strong>Horário de Entrega:</strong> {order?.delivery_time || 'A agendar'}
              </p>
              <p>
                <strong>Tipo de Operação:</strong> Venda de Mercadoria
              </p>
              <p>
                <strong>Natureza da Operação:</strong> Venda de Gás GLP
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-3">DADOS DO CLIENTE:</h3>
              <p>
                <strong>Nome:</strong> {order?.customer_name || 'Cliente'}
              </p>
              <p>
                <strong>Telefone:</strong> {order?.customer_phone || '(11) 99999-9999'}
              </p>
              <p>
                <strong>CPF:</strong> 123.456.789-00
              </p>
              <p>
                <strong>Endereço de Entrega:</strong>
              </p>
              <div className="whitespace-pre-line pl-4">{formatAddress(order?.delivery_address)}</div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-3">PRODUTOS/SERVIÇOS:</h3>
            <table className="w-full border-collapse border border-black">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black p-2 text-left">Item</th>
                  <th className="border border-black p-2 text-left">Descrição do Produto</th>
                  <th className="border border-black p-2 text-center">Qtd</th>
                  <th className="border border-black p-2 text-center">Unid.</th>
                  <th className="border border-black p-2 text-right">Valor Unit.</th>
                  <th className="border border-black p-2 text-right">Valor Total</th>
                </tr>
              </thead>
              <tbody>
                {order?.items?.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-black p-2 text-center">{index + 1}</td>
                    <td className="border border-black p-2">
                      <strong>{item.product_name || `Botijão de Gás ${item.size || '13kg'}`}</strong>
                      <br />
                      <small className="text-gray-600">
                        Gás Liquefeito de Petróleo (GLP) - Recipiente de {item.size || '13kg'}
                        <br />
                        NCM: 2711.12.10 | CEST: 06.001.00
                      </small>
                    </td>
                    <td className="border border-black p-2 text-center">{item.quantity}</td>
                    <td className="border border-black p-2 text-center">UN</td>
                    <td className="border border-black p-2 text-right">{formatCurrency(item.price)}</td>
                    <td className="border border-black p-2 text-right">
                      {formatCurrency(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-lg mb-3">INFORMAÇÕES FISCAIS:</h3>
                <p>
                  <strong>Base de Cálculo ICMS:</strong> {formatCurrency(subtotal)}
                </p>
                <p>
                  <strong>Valor ICMS (18%):</strong> {formatCurrency(taxes * 0.7)}
                </p>
                <p>
                  <strong>Base de Cálculo PIS/COFINS:</strong> {formatCurrency(subtotal)}
                </p>
                <p>
                  <strong>Valor PIS/COFINS (3,65%):</strong> {formatCurrency(taxes * 0.3)}
                </p>
                <p className="text-sm text-gray-600 mt-2">Regime tributário: Lucro Presumido</p>
              </div>

              <div className="text-right">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total de Impostos:</span>
                    <span>{formatCurrency(taxes)}</span>
                  </div>
                  <div className="flex justify-between border-t-2 border-black pt-2 text-lg font-bold">
                    <span>VALOR TOTAL:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gas Safety Information */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h3 className="font-bold text-lg mb-2">⚠️ INFORMAÇÕES DE SEGURANÇA - GÁS GLP:</h3>
            <div className="text-sm space-y-1">
              <p>• Mantenha o botijão em local ventilado, longe de fontes de calor</p>
              <p>• Verifique sempre as conexões e mangueiras antes do uso</p>
              <p>• Em caso de vazamento, feche o registro e procure assistência técnica</p>
              <p>• Botijão vazio deve ser devolvido para troca ou recarga</p>
              <p>• Validade do produto: 5 anos a partir da data de fabricação</p>
            </div>
          </div>

          {/* Footer Information */}
          <div className="mt-8 pt-4 border-t border-gray-300 text-xs text-gray-600">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p>
                  <strong>Forma de Pagamento:</strong> {order?.payment_method || 'Dinheiro'}
                </p>
                <p>
                  <strong>Status do Pagamento:</strong>{' '}
                  {order?.payment_status === 'paid' ? 'Pago' : 'Pendente'}
                </p>
                <p>
                  <strong>Entregador:</strong>{' '}
                  {order?.deliverymen?.name || order?.delivery_person || 'A designar'}
                </p>
              </div>
              <div className="text-right">
                <p>Documento emitido em: {formatDateTime(new Date())}</p>
                <p>Sistema: PedeGás v1.0</p>
                <p className="mt-2 text-xs">Esta nota fiscal é válida com assinatura digital</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default InvoiceModal;
