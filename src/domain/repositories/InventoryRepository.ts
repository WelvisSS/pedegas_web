import { Inventory } from '../entities/Inventory';

/**
 * Type for creating new inventory items (without id, createdAt, updatedAt)
 */
export type CreateInventoryDTO = Omit<Inventory, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Type for updating inventory items (all fields optional except id)
 */
export type UpdateInventoryDTO = Partial<Omit<Inventory, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * Inventory Repository Interface
 * Abstract class defining inventory data operations
 * Following Dependency Inversion Principle
 * 
 * This is an abstract repository that must be implemented by concrete repositories.
 * All methods throw errors by design to enforce implementation in child classes.
 */
export abstract class InventoryRepository {
    /**
     * Get all inventory items for a specific gas station
     * @param gasStationId - The gas station ID
     * @returns Array of inventory items
     */
    abstract getByGasStationId(gasStationId: string): Promise<Inventory[]>;

    /**
     * Get a single inventory item by ID
     * @param id - The inventory item ID
     * @returns Inventory item
     */
    abstract getById(id: string): Promise<Inventory | null>;

    /**
     * Create a new inventory item
     * @param inventory - Inventory item to create
     * @returns Created inventory item
     */
    abstract create(inventory: CreateInventoryDTO): Promise<Inventory>;

    /**
     * Update an inventory item
     * @param id - The inventory item ID
     * @param updates - Fields to update
     * @returns Updated inventory item
     */
    abstract update(id: string, updates: UpdateInventoryDTO): Promise<Inventory>;

    /**
     * Delete an inventory item
     * @param id - The inventory item ID
     * @returns Success status
     */
    abstract delete(id: string): Promise<boolean>;

    /**
     * Get inventory item by gas station and product type
     * @param gasStationId - The gas station ID
     * @param productType - The product type (p13, p20, p45, p90)
     * @returns Inventory item or null
     */
    abstract getByProductType(gasStationId: string, productType: string): Promise<Inventory | null>;

    /**
     * Get all low stock items for a gas station
     * @param gasStationId - The gas station ID
     * @returns Array of low stock items
     */
    abstract getLowStockItems(gasStationId: string): Promise<Inventory[]>;

    /**
     * Get all out of stock items for a gas station
     * @param gasStationId - The gas station ID
     * @returns Array of out of stock items
     */
    abstract getOutOfStockItems(gasStationId: string): Promise<Inventory[]>;

    /**
     * Update quantity of an inventory item
     * @param id - The inventory item ID
     * @param quantity - New quantity
     * @returns Updated inventory item
     */
    abstract updateQuantity(id: string, quantity: number): Promise<Inventory>;
}
