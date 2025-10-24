import { Delivery } from '../../domain/entities/Delivery';
import type { GasStation } from '../../domain/entities/GasStation';
import type { DeliveryRepository } from '../../domain/repositories/DeliveryRepository';

interface DeliveryFilters {
    status?: string;
    startDate?: string;
    endDate?: string;
}

interface DeliveryAddress {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
}

interface DeliveryItem {
    productName: string;
    quantity: number;
    price: number;
}

interface DeliveryData {
    id?: string;
    gasStationId: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    deliveryAddress: DeliveryAddress;
    items: DeliveryItem[];
    totalAmount: number;
    status?: string;
}

interface DateRange {
    from?: Date;
    to?: Date;
}

interface InvoiceData {
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    customer: {
        name: string;
        phone: string;
        email?: string;
        address: DeliveryAddress;
    };
    gasStation: GasStation | undefined;
    items: DeliveryItem[];
    total: number;
    taxes: number;
    netTotal: number;
}

interface DeliveryStats {
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
}

/**
 * Delivery Service
 * Handles business logic for delivery operations
 */
export class DeliveryService {
    private deliveryRepository: DeliveryRepository;

    constructor(deliveryRepository: DeliveryRepository) {
        this.deliveryRepository = deliveryRepository;
    }

    /**
     * Get all deliveries for the current user
     * @param userId - User ID
     * @param filters - Optional filters
     * @returns Promise<Delivery[]>
     */
    async getDeliveriesForUser(userId: string, filters: DeliveryFilters = {}): Promise<Delivery[]> {
        try {
            return await this.deliveryRepository.getDeliveriesByUser(userId, filters);
        } catch (error) {
            console.error('Error in getDeliveriesForUser:', error);
            throw new Error('Erro ao carregar entregas');
        }
    }

    /**
     * Get deliveries for a specific gas station
     * @param gasStationId - Gas station ID
     * @param filters - Optional filters
     * @returns Promise<Delivery[]>
     */
    async getDeliveriesForGasStation(gasStationId: string, filters: DeliveryFilters = {}): Promise<Delivery[]> {
        try {
            return await this.deliveryRepository.getDeliveriesByGasStation(gasStationId, filters);
        } catch (error) {
            console.error('Error in getDeliveriesForGasStation:', error);
            throw new Error('Erro ao carregar entregas do posto');
        }
    }

    /**
     * Get delivery by ID
     * @param deliveryId - Delivery ID
     * @returns Promise<Delivery|null>
     */
    async getDeliveryById(deliveryId: string): Promise<Delivery | null> {
        try {
            return await this.deliveryRepository.getDeliveryById(deliveryId);
        } catch (error) {
            console.error('Error in getDeliveryById:', error);
            throw new Error('Erro ao carregar entrega');
        }
    }

    /**
     * Accept a delivery
     * @param deliveryId - Delivery ID
     * @returns Promise<Delivery>
     */
    async acceptDelivery(deliveryId: string): Promise<Delivery> {
        try {
            // First check if delivery exists and can be accepted
            const delivery = await this.deliveryRepository.getDeliveryById(deliveryId);
            if (!delivery) {
                throw new Error('Entrega não encontrada');
            }

            if (!delivery.canBeAccepted()) {
                throw new Error('Esta entrega não pode ser aceita');
            }

            // Update status to accepted
            return await this.deliveryRepository.updateDeliveryStatus(deliveryId, 'accepted');
        } catch (error) {
            console.error('Error in acceptDelivery:', error);
            throw error;
        }
    }

    /**
     * Reject a delivery
     * @param deliveryId - Delivery ID
     * @param reason - Rejection reason
     * @returns Promise<Delivery>
     */
    async rejectDelivery(deliveryId: string, reason: string = ''): Promise<Delivery> {
        try {
            // First check if delivery exists and can be rejected
            const delivery = await this.deliveryRepository.getDeliveryById(deliveryId);
            if (!delivery) {
                throw new Error('Entrega não encontrada');
            }

            if (!delivery.canBeRejected()) {
                throw new Error('Esta entrega não pode ser rejeitada');
            }

            // Update status to rejected with reason
            const additionalData = reason ? { notes: reason } : {};
            return await this.deliveryRepository.updateDeliveryStatus(deliveryId, 'rejected', additionalData);
        } catch (error) {
            console.error('Error in rejectDelivery:', error);
            throw error;
        }
    }

    /**
     * Mark delivery as in progress
     * @param deliveryId - Delivery ID
     * @returns Promise<Delivery>
     */
    async startDelivery(deliveryId: string): Promise<Delivery> {
        try {
            const delivery = await this.deliveryRepository.getDeliveryById(deliveryId);
            if (!delivery) {
                throw new Error('Entrega não encontrada');
            }

            if (delivery.status !== 'accepted') {
                throw new Error('Só é possível iniciar entregas aceitas');
            }

            return await this.deliveryRepository.updateDeliveryStatus(deliveryId, 'in_progress');
        } catch (error) {
            console.error('Error in startDelivery:', error);
            throw error;
        }
    }

    /**
     * Mark delivery as completed
     * @param deliveryId - Delivery ID
     * @returns Promise<Delivery>
     */
    async completeDelivery(deliveryId: string): Promise<Delivery> {
        try {
            const delivery = await this.deliveryRepository.getDeliveryById(deliveryId);
            if (!delivery) {
                throw new Error('Entrega não encontrada');
            }

            if (delivery.status !== 'in_progress') {
                throw new Error('Só é possível completar entregas em andamento');
            }

            return await this.deliveryRepository.updateDeliveryStatus(deliveryId, 'delivered');
        } catch (error) {
            console.error('Error in completeDelivery:', error);
            throw error;
        }
    }

    /**
     * Generate invoice for delivery
     * @param deliveryId - Delivery ID
     * @returns Promise<{delivery: Delivery, invoiceData: InvoiceData}>
     */
    async generateInvoice(deliveryId: string): Promise<{ delivery: Delivery; invoiceData: InvoiceData }> {
        try {
            const delivery = await this.deliveryRepository.getDeliveryById(deliveryId);
            if (!delivery) {
                throw new Error('Entrega não encontrada');
            }

            if (!delivery.canGenerateInvoice()) {
                throw new Error('Não é possível gerar nota fiscal para esta entrega');
            }

            if (!delivery.id) {
                throw new Error('Entrega sem ID válido');
            }

            // Generate unique invoice number
            const invoiceNumber = `NF-${delivery.id.toString().padStart(6, '0')}-${new Date().getFullYear()}`;

            // Update delivery with invoice info
            const updatedDelivery = await this.deliveryRepository.updateDeliveryInvoice(deliveryId, invoiceNumber);

            // Generate invoice data
            const invoiceData = {
                invoiceNumber: invoiceNumber,
                issueDate: new Date().toLocaleDateString('pt-BR'),
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
                customer: {
                    name: updatedDelivery.customerName,
                    phone: updatedDelivery.customerPhone,
                    email: updatedDelivery.customerEmail,
                    address: updatedDelivery.deliveryAddress
                },
                gasStation: updatedDelivery.gasStation,
                items: updatedDelivery.items,
                total: updatedDelivery.totalAmount,
                taxes: updatedDelivery.totalAmount * 0.18, // 18% de impostos
                netTotal: updatedDelivery.totalAmount * 1.18
            };

            return {
                delivery: updatedDelivery,
                invoiceData
            };
        } catch (error) {
            console.error('Error in generateInvoice:', error);
            throw error;
        }
    }

    /**
     * Create a new delivery
     * @param deliveryData - Delivery data
     * @returns Promise<Delivery>
     */
    async createDelivery(deliveryData: DeliveryData): Promise<Delivery> {
        try {
            const delivery = new Delivery(deliveryData);

            if (!delivery.isValid()) {
                throw new Error('Dados da entrega inválidos');
            }

            return await this.deliveryRepository.createDelivery(delivery);
        } catch (error) {
            console.error('Error in createDelivery:', error);
            throw error;
        }
    }

    /**
     * Get delivery statistics
     * @param gasStationId - Gas station ID
     * @param dateRange - Date range for statistics
     * @returns Promise<DeliveryStats>
     */
    async getDeliveryStats(gasStationId: string, dateRange: DateRange = {}): Promise<DeliveryStats> {
        try {
            return await this.deliveryRepository.getDeliveryStats(gasStationId, dateRange);
        } catch (error) {
            console.error('Error in getDeliveryStats:', error);
            throw new Error('Erro ao carregar estatísticas');
        }
    }
}
