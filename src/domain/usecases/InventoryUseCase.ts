import { Inventory } from '../entities/Inventory';
import type { InventoryRepository, CreateInventoryDTO, UpdateInventoryDTO } from '../repositories/InventoryRepository';

interface OrderItem {
    product: string;
    quantity: number;
}

interface StockAvailabilityResult {
    hasStock: boolean;
    availableItems: Array<{
        product: string;
        productType: string;
        inventoryId: string;
        requested: number;
        available: number;
    }>;
    unavailableItems: Array<{
        product: string;
        requested: number;
        available: number;
        reason: string;
    }>;
}

interface InventoryStats {
    totalItems: number;
    totalValue: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
    overstocked: number;
    needsRestock: number;
}

/**
 * Inventory Use Case
 * Business logic for inventory management
 * Following Single Responsibility Principle
 */
export class InventoryUseCase {
    constructor(private inventoryRepository: InventoryRepository) {}

    async createInventoryItem(gasStationId: string, inventoryData: Partial<CreateInventoryDTO>): Promise<Inventory> {
        try {
            // Validate required fields
            if (!inventoryData.productType) {
                throw new Error('Tipo de produto é obrigatório');
            }

            if (!gasStationId) {
                throw new Error('ID do ponto de venda é obrigatório');
            }

            // Validate product type
            const validProductTypes = ['p13', 'p20', 'p45', 'p90'];
            if (!validProductTypes.includes(inventoryData.productType)) {
                throw new Error('Tipo de produto inválido. Use: p13, p20, p45 ou p90');
            }

            // Check if product already exists for this gas station
            const existing = await this.inventoryRepository.getByProductType(
                gasStationId,
                inventoryData.productType
            );

            if (existing) {
                throw new Error('Este produto já existe no estoque deste ponto de venda');
            }

            // Validate quantities
            if (inventoryData.quantity !== undefined && inventoryData.quantity < 0) {
                throw new Error('Quantidade não pode ser negativa');
            }

            if (inventoryData.minQuantity !== undefined && inventoryData.minQuantity < 0) {
                throw new Error('Quantidade mínima não pode ser negativa');
            }

            if (inventoryData.maxQuantity !== undefined && inventoryData.maxQuantity < 0) {
                throw new Error('Quantidade máxima não pode ser negativa');
            }

            if (
                inventoryData.minQuantity !== undefined &&
                inventoryData.maxQuantity !== undefined &&
                inventoryData.minQuantity > inventoryData.maxQuantity
            ) {
                throw new Error('Quantidade mínima não pode ser maior que a máxima');
            }

            // Validate unit price
            if (inventoryData.unitPrice !== undefined && inventoryData.unitPrice < 0) {
                throw new Error('Preço unitário não pode ser negativo');
            }

            // Create inventory entity
            const inventory = new Inventory({
                ...inventoryData,
                gasStationId,
                productType: inventoryData.productType,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            return await this.inventoryRepository.create(inventory);

        } catch (error) {
            throw new Error(`Erro ao criar item de estoque: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }

    async updateInventoryItem(inventoryId: string, updates: UpdateInventoryDTO): Promise<Inventory> {
        try {
            // Get existing inventory item
            const existingItem = await this.inventoryRepository.getById(inventoryId);
            if (!existingItem) {
                throw new Error('Item de estoque não encontrado');
            }

            // Validate quantities if provided
            if (updates.quantity !== undefined && updates.quantity < 0) {
                throw new Error('Quantidade não pode ser negativa');
            }

            if (updates.minQuantity !== undefined && updates.minQuantity < 0) {
                throw new Error('Quantidade mínima não pode ser negativa');
            }

            if (updates.maxQuantity !== undefined && updates.maxQuantity < 0) {
                throw new Error('Quantidade máxima não pode ser negativa');
            }

            // Validate unit price if provided
            if (updates.unitPrice !== undefined && updates.unitPrice < 0) {
                throw new Error('Preço unitário não pode ser negativo');
            }

            // Recalculate status if quantity changed
            const updatedData: UpdateInventoryDTO = { ...updates };
            if (updates.quantity !== undefined) {
                const updatedItem = new Inventory({
                    ...existingItem,
                    ...updates
                });
                updatedData.status = updatedItem.calculateStatus();
            }

            return await this.inventoryRepository.update(inventoryId, updatedData);

        } catch (error) {
            throw new Error(`Erro ao atualizar item de estoque: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }

    async deleteInventoryItem(inventoryId: string): Promise<boolean> {
        try {
            const existingItem = await this.inventoryRepository.getById(inventoryId);
            if (!existingItem) {
                throw new Error('Item de estoque não encontrado');
            }

            return await this.inventoryRepository.delete(inventoryId);

        } catch (error) {
            throw new Error(`Erro ao excluir item de estoque: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }

    async getInventoryByGasStationId(gasStationId: string): Promise<Inventory[]> {
        try {
            if (!gasStationId) {
                throw new Error('ID do ponto de venda é obrigatório');
            }

            return await this.inventoryRepository.getByGasStationId(gasStationId);

        } catch (error) {
            throw new Error(`Erro ao buscar estoque: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }

    async getInventoryById(inventoryId: string): Promise<Inventory> {
        try {
            const item = await this.inventoryRepository.getById(inventoryId);
            if (!item) {
                throw new Error('Item de estoque não encontrado');
            }

            return item;

        } catch (error) {
            throw new Error(`Erro ao buscar item de estoque: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }

    async getLowStockItems(gasStationId: string): Promise<Inventory[]> {
        try {
            if (!gasStationId) {
                throw new Error('ID do ponto de venda é obrigatório');
            }

            return await this.inventoryRepository.getLowStockItems(gasStationId);

        } catch (error) {
            throw new Error(`Erro ao buscar itens com estoque baixo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }

    async getOutOfStockItems(gasStationId: string): Promise<Inventory[]> {
        try {
            if (!gasStationId) {
                throw new Error('ID do ponto de venda é obrigatório');
            }

            return await this.inventoryRepository.getOutOfStockItems(gasStationId);

        } catch (error) {
            throw new Error(`Erro ao buscar itens sem estoque: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }

    async addStock(inventoryId: string, quantity: number): Promise<Inventory> {
        try {
            if (quantity <= 0) {
                throw new Error('Quantidade deve ser maior que zero');
            }

            const item = await this.inventoryRepository.getById(inventoryId);
            if (!item) {
                throw new Error('Item de estoque não encontrado');
            }

            const newQuantity = item.quantity + quantity;

            return await this.inventoryRepository.updateQuantity(inventoryId, newQuantity);

        } catch (error) {
            throw new Error(`Erro ao adicionar estoque: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }

    async removeStock(inventoryId: string, quantity: number): Promise<Inventory> {
        try {
            if (quantity <= 0) {
                throw new Error('Quantidade deve ser maior que zero');
            }

            const item = await this.inventoryRepository.getById(inventoryId);
            if (!item) {
                throw new Error('Item de estoque não encontrado');
            }

            if (item.quantity < quantity) {
                throw new Error('Quantidade insuficiente em estoque');
            }

            const newQuantity = item.quantity - quantity;

            return await this.inventoryRepository.updateQuantity(inventoryId, newQuantity);

        } catch (error) {
            throw new Error(`Erro ao remover estoque: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }

    async getInventoryStats(gasStationId: string): Promise<InventoryStats> {
        try {
            const items = await this.inventoryRepository.getByGasStationId(gasStationId);

            const stats: InventoryStats = {
                totalItems: items.length,
                totalValue: items.reduce((sum, item) => sum + item.totalValue, 0),
                inStock: items.filter(item => item.status === 'in_stock').length,
                lowStock: items.filter(item => item.status === 'low_stock').length,
                outOfStock: items.filter(item => item.status === 'out_of_stock').length,
                overstocked: items.filter(item => item.status === 'overstocked').length,
                needsRestock: items.filter(item => item.needsRestock).length
            };

            return stats;

        } catch (error) {
            throw new Error(`Erro ao calcular estatísticas de estoque: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }

    /**
     * Check if there is enough stock for order items
     * @param gasStationId - Gas station ID
     * @param orderItems - Array of order items with product and quantity
     * @returns Validation result with available status and missing items
     */
    async checkStockAvailability(gasStationId: string, orderItems: OrderItem[]): Promise<StockAvailabilityResult> {
        try {
            if (!gasStationId) {
                throw new Error('ID do ponto de venda é obrigatório');
            }

            if (!orderItems || orderItems.length === 0) {
                throw new Error('Itens do pedido são obrigatórios');
            }

            const unavailableItems: StockAvailabilityResult['unavailableItems'] = [];
            const availableItems: StockAvailabilityResult['availableItems'] = [];

            for (const orderItem of orderItems) {
                // Map product name to product type (p13, p20, p45, p90)
                const productType = this.mapProductNameToType(orderItem.product);
                
                if (!productType) {
                    unavailableItems.push({
                        product: orderItem.product,
                        requested: orderItem.quantity,
                        available: 0,
                        reason: 'Produto não encontrado no catálogo'
                    });
                    continue;
                }

                // Get inventory item for this product
                const inventoryItem = await this.inventoryRepository.getByProductType(
                    gasStationId,
                    productType
                );

                if (!inventoryItem) {
                    unavailableItems.push({
                        product: orderItem.product,
                        requested: orderItem.quantity,
                        available: 0,
                        reason: 'Produto não cadastrado no estoque'
                    });
                    continue;
                }

                if (inventoryItem.quantity < orderItem.quantity) {
                    unavailableItems.push({
                        product: orderItem.product,
                        requested: orderItem.quantity,
                        available: inventoryItem.quantity,
                        reason: `Estoque insuficiente (disponível: ${inventoryItem.quantity})`
                    });
                } else {
                    availableItems.push({
                        product: orderItem.product,
                        productType,
                        inventoryId: inventoryItem.id!,
                        requested: orderItem.quantity,
                        available: inventoryItem.quantity
                    });
                }
            }

            return {
                hasStock: unavailableItems.length === 0,
                availableItems,
                unavailableItems
            };

        } catch (error) {
            throw new Error(`Erro ao verificar disponibilidade de estoque: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }

    /**
     * Decrement stock for confirmed order
     * @param gasStationId - Gas station ID
     * @param orderItems - Array of order items with product and quantity
     * @returns Updated inventory items
     */
    async decrementStockForOrder(gasStationId: string, orderItems: OrderItem[]): Promise<Inventory[]> {
        try {
            // First check if stock is available
            const availability = await this.checkStockAvailability(gasStationId, orderItems);

            if (!availability.hasStock) {
                const missingItems = availability.unavailableItems
                    .map(item => `${item.product}: ${item.reason}`)
                    .join(', ');
                throw new Error(`Estoque insuficiente: ${missingItems}`);
            }

            // Decrement stock for each item
            const updatedItems: Inventory[] = [];
            for (const item of availability.availableItems) {
                const updatedItem = await this.removeStock(item.inventoryId, item.requested);
                updatedItems.push(updatedItem);
            }

            return updatedItems;

        } catch (error) {
            throw new Error(`Erro ao decrementar estoque: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }

    /**
     * Map product name to product type
     * @param productName - Product name from order
     * @returns Product type (p13, p20, p45, p90) or null
     */
    mapProductNameToType(productName: string): string | null {
        if (!productName) return null;

        const normalizedName = productName.toLowerCase();

        if (normalizedName.includes('p13') || normalizedName.includes('13kg') || normalizedName.includes('13 kg')) {
            return 'p13';
        }
        if (normalizedName.includes('p20') || normalizedName.includes('20kg') || normalizedName.includes('20 kg')) {
            return 'p20';
        }
        if (normalizedName.includes('p45') || normalizedName.includes('45kg') || normalizedName.includes('45 kg')) {
            return 'p45';
        }
        if (normalizedName.includes('p90') || normalizedName.includes('90kg') || normalizedName.includes('90 kg')) {
            return 'p90';
        }

        return null;
    }
}
