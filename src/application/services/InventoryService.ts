import type { SupabaseClient } from '@supabase/supabase-js';
import { InventoryUseCase } from '../../domain/usecases/InventoryUseCase.js';
import { SupabaseInventoryRepository } from '../../infrastructure/repositories/SupabaseInventoryRepository.js';

export interface InventoryData {
    productName: string;
    productType: string;
    quantity: number;
    unit: string;
    minStockLevel?: number;
    price?: number;
}

interface OrderItem {
    product: string;
    quantity: number;
}

/**
 * Inventory Service
 * Application service for inventory management
 * Following Dependency Injection Principle
 */
export class InventoryService {
    private inventoryUseCase: InventoryUseCase;

    constructor(supabaseClient: SupabaseClient) {
        const inventoryRepository = new SupabaseInventoryRepository(supabaseClient);
        this.inventoryUseCase = new InventoryUseCase(inventoryRepository);
    }

    async createInventoryItem(gasStationId: string, inventoryData: InventoryData) {
        return await this.inventoryUseCase.createInventoryItem(gasStationId, inventoryData);
    }

    async updateInventoryItem(inventoryId: string, updates: Partial<InventoryData>) {
        return await this.inventoryUseCase.updateInventoryItem(inventoryId, updates);
    }

    async deleteInventoryItem(inventoryId: string) {
        return await this.inventoryUseCase.deleteInventoryItem(inventoryId);
    }

    async getInventoryByGasStationId(gasStationId: string) {
        return await this.inventoryUseCase.getInventoryByGasStationId(gasStationId);
    }

    async getInventoryById(inventoryId: string) {
        return await this.inventoryUseCase.getInventoryById(inventoryId);
    }

    async getLowStockItems(gasStationId: string) {
        return await this.inventoryUseCase.getLowStockItems(gasStationId);
    }

    async getOutOfStockItems(gasStationId: string) {
        return await this.inventoryUseCase.getOutOfStockItems(gasStationId);
    }

    async addStock(inventoryId: string, quantity: number) {
        return await this.inventoryUseCase.addStock(inventoryId, quantity);
    }

    async removeStock(inventoryId: string, quantity: number) {
        return await this.inventoryUseCase.removeStock(inventoryId, quantity);
    }

    async getInventoryStats(gasStationId: string) {
        return await this.inventoryUseCase.getInventoryStats(gasStationId);
    }

    async checkStockAvailability(gasStationId: string, orderItems: OrderItem[]) {
        return await this.inventoryUseCase.checkStockAvailability(gasStationId, orderItems);
    }

    async decrementStockForOrder(gasStationId: string, orderItems: OrderItem[]) {
        return await this.inventoryUseCase.decrementStockForOrder(gasStationId, orderItems);
    }
}
