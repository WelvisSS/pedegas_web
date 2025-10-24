interface InventoryProps {
    id?: string;
    gasStationId: string;
    productType: string;
    quantity?: number;
    minQuantity?: number;
    maxQuantity?: number;
    unitPrice?: number;
    supplier?: string;
    lastRestockDate?: string;
    nextRestockDate?: string;
    status?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface InventoryJson {
    id?: string;
    gas_station_id: string;
    product_type: string;
    quantity?: number;
    min_quantity?: number;
    max_quantity?: number;
    unit_price?: number;
    supplier?: string;
    last_restock_date?: string;
    next_restock_date?: string;
    status?: string;
    notes?: string;
    created_at?: string;
    updated_at?: string;
}

/**
 * Inventory Entity
 * Represents inventory items for gas stations
 * Following Domain-Driven Design principles
 */
export class Inventory {
    id?: string;
    gasStationId: string;
    productType: string; // p13, p20, p45, p90
    quantity: number;
    minQuantity: number;
    maxQuantity: number;
    unitPrice: number;
    supplier?: string;
    lastRestockDate?: string;
    nextRestockDate?: string;
    status: string; // in_stock, low_stock, out_of_stock, overstocked
    notes?: string;
    createdAt?: string;
    updatedAt?: string;

    constructor({
        id,
        gasStationId,
        productType,
        quantity,
        minQuantity,
        maxQuantity,
        unitPrice,
        supplier,
        lastRestockDate,
        nextRestockDate,
        status,
        notes,
        createdAt,
        updatedAt
    }: InventoryProps) {
        this.id = id;
        this.gasStationId = gasStationId;
        this.productType = productType;
        this.quantity = quantity || 0;
        this.minQuantity = minQuantity || 0;
        this.maxQuantity = maxQuantity || 0;
        this.unitPrice = unitPrice || 0;
        this.supplier = supplier;
        this.lastRestockDate = lastRestockDate;
        this.nextRestockDate = nextRestockDate;
        this.status = status || this.calculateStatus();
        this.notes = notes;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    /**
     * Calculate inventory status based on quantity
     */
    calculateStatus(): string {
        if (this.quantity === 0) return 'out_of_stock';
        if (this.quantity < this.minQuantity) return 'low_stock';
        if (this.quantity > this.maxQuantity) return 'overstocked';
        return 'in_stock';
    }

    /**
     * Check if inventory needs restock
     */
    get needsRestock(): boolean {
        return this.quantity <= this.minQuantity;
    }

    /**
     * Check if inventory is overstocked
     */
    get isOverstocked(): boolean {
        return this.quantity > this.maxQuantity;
    }

    /**
     * Get percentage of stock level
     */
    get stockPercentage(): number {
        if (this.maxQuantity === 0) return 0;
        return Math.round((this.quantity / this.maxQuantity) * 100);
    }

    /**
     * Get total inventory value
     */
    get totalValue(): number {
        return this.quantity * this.unitPrice;
    }

    /**
     * Get formatted product name
     */
    get productName(): string {
        const names: Record<string, string> = {
            p13: 'Botijão P13 (13kg)',
            p20: 'Botijão P20 (20kg)',
            p45: 'Botijão P45 (45kg)',
            p90: 'Botijão P90 (90kg)'
        };
        return names[this.productType] || this.productType;
    }

    /**
     * Get status color for UI
     */
    get statusColor(): string {
        const colors: Record<string, string> = {
            in_stock: 'green',
            low_stock: 'yellow',
            out_of_stock: 'red',
            overstocked: 'orange'
        };
        return colors[this.status] || 'gray';
    }

    /**
     * Get status text in Portuguese
     */
    get statusText(): string {
        const texts: Record<string, string> = {
            in_stock: 'Em Estoque',
            low_stock: 'Estoque Baixo',
            out_of_stock: 'Sem Estoque',
            overstocked: 'Excesso de Estoque'
        };
        return texts[this.status] || this.status;
    }

    /**
     * Check if restock is due
     */
    get isRestockDue(): boolean {
        if (!this.nextRestockDate) return false;
        return new Date() >= new Date(this.nextRestockDate);
    }

    /**
     * Add quantity to inventory
     */
    addStock(quantity: number): void {
        this.quantity += quantity;
        this.status = this.calculateStatus();
        this.lastRestockDate = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }

    /**
     * Remove quantity from inventory
     */
    removeStock(quantity: number): void {
        this.quantity = Math.max(0, this.quantity - quantity);
        this.status = this.calculateStatus();
        this.updatedAt = new Date().toISOString();
    }

    /**
     * Create Inventory from JSON
     */
    static fromJson(json: InventoryJson): Inventory {
        return new Inventory({
            id: json.id,
            gasStationId: json.gas_station_id,
            productType: json.product_type,
            quantity: json.quantity,
            minQuantity: json.min_quantity,
            maxQuantity: json.max_quantity,
            unitPrice: json.unit_price,
            supplier: json.supplier,
            lastRestockDate: json.last_restock_date,
            nextRestockDate: json.next_restock_date,
            status: json.status,
            notes: json.notes,
            createdAt: json.created_at,
            updatedAt: json.updated_at
        });
    }

    /**
     * Convert Inventory to JSON
     */
    toJson(): InventoryJson {
        return {
            id: this.id,
            gas_station_id: this.gasStationId,
            product_type: this.productType,
            quantity: this.quantity,
            min_quantity: this.minQuantity,
            max_quantity: this.maxQuantity,
            unit_price: this.unitPrice,
            supplier: this.supplier,
            last_restock_date: this.lastRestockDate,
            next_restock_date: this.nextRestockDate,
            status: this.status,
            notes: this.notes,
            created_at: this.createdAt,
            updated_at: this.updatedAt
        };
    }
}
