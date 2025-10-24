import { Delivery } from '../entities/Delivery';

/**
 * Abstract Delivery Repository
 * Defines the contract for delivery data operations
 */

interface DeliveryFilters {
    status?: string;
    priority?: string;
    dateFrom?: Date;
    dateTo?: Date;
}

interface DeliveryStats {
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
}

interface DeliveryStatusUpdateData {
    estimatedDelivery?: string;
    deliveredAt?: string;
    notes?: string;
    priority?: string;
}

export abstract class DeliveryRepository {
    /**
     * Get all deliveries for a specific gas station
     * @param gasStationId - Gas station UUID
     * @param filters - Optional filters
     * @returns Promise<Delivery[]>
     */
    abstract getDeliveriesByGasStation(gasStationId: string, filters?: DeliveryFilters): Promise<Delivery[]>;

    /**
     * Get all deliveries for a specific user (across all gas stations)
     * @param userId - User UUID
     * @param filters - Optional filters
     * @returns Promise<Delivery[]>
     */
    abstract getDeliveriesByUser(userId: string, filters?: DeliveryFilters): Promise<Delivery[]>;

    /**
     * Get delivery by ID
     * @param deliveryId - Delivery UUID
     * @returns Promise<Delivery|null>
     */
    abstract getDeliveryById(deliveryId: string): Promise<Delivery | null>;

    /**
     * Create a new delivery
     * @param delivery - Delivery instance
     * @returns Promise<Delivery>
     */
    abstract createDelivery(delivery: Delivery): Promise<Delivery>;

    /**
     * Update delivery status
     * @param deliveryId - Delivery UUID
     * @param newStatus - New status
     * @param additionalData - Additional data to update
     * @returns Promise<Delivery>
     */
    abstract updateDeliveryStatus(deliveryId: string, newStatus: string, additionalData?: DeliveryStatusUpdateData): Promise<Delivery>;

    /**
     * Update delivery with invoice information
     * @param deliveryId - Delivery UUID
     * @param invoiceNumber - Invoice number
     * @returns Promise<Delivery>
     */
    abstract updateDeliveryInvoice(deliveryId: string, invoiceNumber: string): Promise<Delivery>;

    /**
     * Delete delivery
     * @param deliveryId - Delivery UUID
     * @returns Promise<boolean>
     */
    abstract deleteDelivery(deliveryId: string): Promise<boolean>;

    /**
     * Get delivery statistics for a gas station
     * @param gasStationId - Gas station UUID
     * @param dateRange - Date range for statistics
     * @returns Promise<Object>
     */
    abstract getDeliveryStats(gasStationId: string, dateRange?: { from?: Date; to?: Date }): Promise<DeliveryStats>;
}
