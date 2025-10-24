import type { SupabaseClient } from '@supabase/supabase-js';

interface InvoiceResult {
    success: boolean;
    invoiceNumber?: string;
    invoiceUrl?: string;
    message?: string;
    error?: string;
}

/**
 * Invoice Service
 * Service for handling invoice generation and management
 * Following Single Responsibility Principle
 */
export class InvoiceService {
    private supabase: SupabaseClient;

    constructor(supabaseClient: SupabaseClient) {
        this.supabase = supabaseClient;
    }

    /**
     * Generate invoice for an order
     * @param orderId - Order ID
     * @returns Invoice generation result
     */
    async generateInvoice(orderId: string): Promise<InvoiceResult> {
        try {
            // Get order details
            const { data: order, error: orderError } = await this.supabase
                .from('orders')
                .select(`
                    *,
                    gas_stations (
                        id,
                        name,
                        cnpj,
                        address,
                        city,
                        state,
                        zip_code,
                        phone,
                        email
                    )
                `)
                .eq('id', orderId)
                .single();

            if (orderError) {
                throw new Error(orderError.message);
            }

            if (!order) {
                throw new Error('Pedido não encontrado');
            }

            // Check if order is delivered
            if (order.status !== 'delivered') {
                throw new Error('Nota fiscal só pode ser gerada para pedidos entregues');
            }

            // Generate invoice number if not exists
            const invoiceNumber = this.generateInvoiceNumber(order.created_at, order.id);

            // For demonstration, we'll create a mock PDF URL
            // In a real implementation, you would:
            // 1. Generate PDF using a library like jsPDF or puppeteer
            // 2. Upload to cloud storage (Supabase Storage, AWS S3, etc.)
            // 3. Return the public URL

            const mockInvoiceUrl = this.generateMockInvoiceUrl(invoiceNumber);

            // Update order with invoice URL
            const { error: updateError } = await this.supabase
                .from('orders')
                .update({
                    invoice_url: mockInvoiceUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('id', orderId);

            if (updateError) {
                throw new Error(updateError.message);
            }

            return {
                success: true,
                invoiceNumber,
                invoiceUrl: mockInvoiceUrl,
                message: 'Nota fiscal gerada com sucesso!'
            };

        } catch (error: unknown) {
            console.error('Error generating invoice:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erro desconhecido ao gerar nota fiscal'
            };
        }
    }

    /**
     * Get invoice for an order
     * @param orderId - Order ID
     * @returns Invoice data
     */
    async getInvoice(orderId: string): Promise<InvoiceResult> {
        try {
            const { data: order, error } = await this.supabase
                .from('orders')
                .select('invoice_url, id, created_at')
                .eq('id', orderId)
                .single();

            if (error) {
                throw new Error(error.message);
            }

            if (!order.invoice_url) {
                throw new Error('Nota fiscal não encontrada para este pedido');
            }

            return {
                success: true,
                invoiceUrl: order.invoice_url
            };

        } catch (error: unknown) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erro desconhecido ao buscar nota fiscal'
            };
        }
    }

    /**
     * Generate invoice number
     * @param createdAt - Order creation date
     * @param orderId - Order ID
     * @returns Invoice number
     */
    generateInvoiceNumber(createdAt: string, orderId: string): string {
        const date = new Date(createdAt);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const orderShort = orderId.slice(-6).toUpperCase();

        return `NF-${year}${month}-${orderShort}`;
    }

    /**
     * Generate mock invoice URL for demonstration
     * @param invoiceNumber - Invoice number
     * @returns Mock invoice URL
     */
    generateMockInvoiceUrl(invoiceNumber: string): string {
        // In a real implementation, this would be the actual PDF URL
        // For now, we'll use a sample PDF URL for demonstration
        return `https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf#invoice=${invoiceNumber}`;
    }

    /**
     * Download invoice
     * @param invoiceUrl - Invoice URL
     * @param filename - Filename for download
     */
    async downloadInvoice(invoiceUrl: string, filename: string): Promise<void> {
        try {
            const response = await fetch(invoiceUrl);
            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erro ao baixar nota fiscal:', error);
            throw new Error('Erro ao baixar nota fiscal');
        }
    }
}
