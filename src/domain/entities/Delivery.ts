import { GasStation } from './GasStation';

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

interface DeliveryDatabaseRow {
    id?: string;
    gas_station_id: string;
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    delivery_address: DeliveryAddress;
    items: DeliveryItem[];
    total_amount: string | number;
    status?: string;
    priority?: string;
    estimated_delivery?: string;
    order_date?: string;
    delivered_at?: string;
    invoice_number?: string;
    invoice_generated_at?: string;
    notes?: string;
    created_at?: string;
    updated_at?: string;
    gas_station?: GasStation;
}

interface DeliveryProps {
    id?: string;
    gasStationId: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    deliveryAddress: DeliveryAddress;
    items: DeliveryItem[];
    totalAmount: number;
    status?: string;
    priority?: string;
    estimatedDelivery?: string;
    orderDate?: string;
    deliveredAt?: string;
    invoiceNumber?: string;
    invoiceGeneratedAt?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
    gasStation?: GasStation;
}

export class Delivery {
    id?: string;
    gasStationId: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    deliveryAddress: DeliveryAddress;
    items: DeliveryItem[];
    totalAmount: number;
    status: string;
    priority: string;
    estimatedDelivery?: string;
    orderDate?: string;
    deliveredAt?: string;
    invoiceNumber?: string;
    invoiceGeneratedAt?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
    gasStation?: GasStation;

    constructor({
        id,
        gasStationId,
        customerName,
        customerPhone,
        customerEmail,
        deliveryAddress,
        items,
        totalAmount,
        status = 'pending',
        priority = 'medium',
        estimatedDelivery,
        orderDate,
        deliveredAt,
        invoiceNumber,
        invoiceGeneratedAt,
        notes,
        createdAt,
        updatedAt,
        gasStation
    }: DeliveryProps) {
        this.id = id;
        this.gasStationId = gasStationId;
        this.customerName = customerName;
        this.customerPhone = customerPhone;
        this.customerEmail = customerEmail;
        this.deliveryAddress = deliveryAddress;
        this.items = items;
        this.totalAmount = totalAmount;
        this.status = status; // pending, accepted, in_progress, delivered, rejected
        this.priority = priority; // low, medium, high
        this.estimatedDelivery = estimatedDelivery;
        this.orderDate = orderDate;
        this.deliveredAt = deliveredAt;
        this.invoiceNumber = invoiceNumber;
        this.invoiceGeneratedAt = invoiceGeneratedAt;
        this.notes = notes;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.gasStation = gasStation;
    }

    /**
     * Validates if delivery data is complete for creation
     */
    isValid(): boolean {
        return !!(
            this.gasStationId &&
            this.customerName &&
            this.customerPhone &&
            this.deliveryAddress &&
            this.items &&
            this.items.length > 0 &&
            this.totalAmount > 0
        );
    }

    /**
     * Returns formatted total amount in BRL
     */
    getFormattedTotal(): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(this.totalAmount);
    }

    /**
     * Returns formatted delivery address as string
     */
    getFormattedAddress(): string {
        if (!this.deliveryAddress) return '';

        const { street, neighborhood, city, state, zipCode } = this.deliveryAddress;
        return `${street}, ${neighborhood} - ${city}/${state} - CEP: ${zipCode}`;
    }

    /**
     * Checks if delivery can be accepted
     */
    canBeAccepted(): boolean {
        return this.status === 'pending';
    }

    /**
     * Checks if delivery can be rejected
     */
    canBeRejected(): boolean {
        return this.status === 'pending';
    }

    /**
     * Checks if invoice can be generated
     */
    canGenerateInvoice(): boolean {
        return this.status === 'accepted' && !this.invoiceNumber;
    }

    /**
     * Returns status in Portuguese
     */
    getStatusText(): string {
        const statusMap: Record<string, string> = {
            'pending': 'Pendente',
            'accepted': 'Aceito',
            'in_progress': 'Em Andamento',
            'delivered': 'Entregue',
            'rejected': 'Rejeitado'
        };
        return statusMap[this.status] || this.status;
    }

    /**
     * Returns priority in Portuguese
     */
    getPriorityText(): string {
        const priorityMap: Record<string, string> = {
            'low': 'Baixa',
            'medium': 'Média',
            'high': 'Alta'
        };
        return priorityMap[this.priority] || this.priority;
    }

    /**
     * Creates a new Delivery instance from database row
     */
    static fromDatabase(row: DeliveryDatabaseRow): Delivery {
        return new Delivery({
            id: row.id,
            gasStationId: row.gas_station_id,
            customerName: row.customer_name,
            customerPhone: row.customer_phone,
            customerEmail: row.customer_email,
            deliveryAddress: row.delivery_address,
            items: row.items,
            totalAmount: typeof row.total_amount === 'number' ? row.total_amount : parseFloat(row.total_amount),
            status: row.status,
            priority: row.priority,
            estimatedDelivery: row.estimated_delivery,
            orderDate: row.order_date,
            deliveredAt: row.delivered_at,
            invoiceNumber: row.invoice_number,
            invoiceGeneratedAt: row.invoice_generated_at,
            notes: row.notes,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            gasStation: row.gas_station
        });
    }

    /**
     * Converts delivery to database format
     */
    toDatabase(): Omit<DeliveryDatabaseRow, 'id' | 'gas_station' | 'created_at' | 'updated_at'> {
        return {
            gas_station_id: this.gasStationId,
            customer_name: this.customerName,
            customer_phone: this.customerPhone,
            customer_email: this.customerEmail,
            delivery_address: this.deliveryAddress,
            items: this.items,
            total_amount: this.totalAmount,
            status: this.status,
            priority: this.priority,
            estimated_delivery: this.estimatedDelivery,
            order_date: this.orderDate,
            delivered_at: this.deliveredAt,
            invoice_number: this.invoiceNumber,
            invoice_generated_at: this.invoiceGeneratedAt,
            notes: this.notes
        };
    }
}
