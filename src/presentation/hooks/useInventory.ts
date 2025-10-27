import { useCallback, useEffect, useMemo, useState } from 'react';
import { InventoryService, type InventoryData } from '../../application/services/InventoryService';
import { Inventory } from '../../domain/entities/Inventory';
import { supabase } from '../../lib/supabaseClient';

interface InventoryStats {
    totalItems: number;
    totalValue: number;
    lowStock: number;
    outOfStock: number;
}

/**
 * Custom hook for inventory management
 * Provides inventory CRUD operations and state management
 */
const useInventory = (gasStationId: string | null = null) => {
    const [inventory, setInventory] = useState<Inventory[]>([]);
    const [stats, setStats] = useState<InventoryStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const inventoryService = useMemo(() => new InventoryService(supabase), []);

    const fetchInventory = useCallback(async () => {
        if (!gasStationId) return;

        try {
            setLoading(true);
            setError(null);

            const data: Inventory[] = await inventoryService.getInventoryByGasStationId(gasStationId);
            setInventory(data);

            // Fetch stats
            const statsData: InventoryStats = await inventoryService.getInventoryStats(gasStationId);
            setStats(statsData);
        } catch (err: unknown) {
            console.error('Error fetching inventory:', err);
            setError(err instanceof Error ? err.message : 'An error occurred while fetching inventory');
        } finally {
            setLoading(false);
        }
    }, [gasStationId, inventoryService]);

    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    const createInventoryItem = async (inventoryData: InventoryData) => {
        try {
            setLoading(true);
            setError(null);

            const newItem: Inventory = await inventoryService.createInventoryItem(gasStationId!, inventoryData);
            setInventory((prev: Inventory[]) => [...prev, newItem]);

            // Refresh stats
            const statsData: InventoryStats = await inventoryService.getInventoryStats(gasStationId!);
            setStats(statsData);

            return newItem;
        } catch (err: unknown) {
            console.error('Error creating inventory item:', err);
            setError(err instanceof Error ? err.message : 'An error occurred while creating inventory item');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateInventoryItem = async (inventoryId: string, updates: Partial<InventoryData>) => {
        try {
            setLoading(true);
            setError(null);

            const updatedItem: Inventory = await inventoryService.updateInventoryItem(inventoryId, updates);
            setInventory((prev: Inventory[]) =>
                prev.map((item: Inventory) =>
                    item.id === inventoryId ? updatedItem : item
                )
            );

            // Refresh stats
            const statsData = await inventoryService.getInventoryStats(gasStationId!);
            setStats(statsData);

            return updatedItem;
        } catch (err: unknown) {
            console.error('Error updating inventory item:', err);
            setError(err instanceof Error ? err.message : 'An error occurred while updating inventory item');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteInventoryItem = async (inventoryId: string) => {
        try {
            setLoading(true);
            setError(null);

            await inventoryService.deleteInventoryItem(inventoryId);
            setInventory((prev: Inventory[]) => prev.filter(item => item.id !== inventoryId));

            // Refresh stats
            const statsData = await inventoryService.getInventoryStats(gasStationId!);
            setStats(statsData);

            return true;
        } catch (err: unknown) {
            console.error('Error deleting inventory item:', err);
            setError(err instanceof Error ? err.message : 'An error occurred while deleting inventory item');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const addStock = async (inventoryId: string, quantity: number) => {
        try {
            setLoading(true);
            setError(null);

            const updatedItem = await inventoryService.addStock(inventoryId, quantity);
            setInventory((prev: Inventory[]) =>
                prev.map(item =>
                    item.id === inventoryId ? updatedItem : item
                )
            );

            // Refresh stats
            const statsData = await inventoryService.getInventoryStats(gasStationId!);
            setStats(statsData);

            return updatedItem;
        } catch (err: unknown) {
            console.error('Error adding stock:', err);
            setError(err instanceof Error ? err.message : 'An error occurred while adding stock');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const removeStock = async (inventoryId: string, quantity: number) => {
        try {
            setLoading(true);
            setError(null);

            const updatedItem = await inventoryService.removeStock(inventoryId, quantity);
            setInventory((prev: Inventory[]) =>
                prev.map(item =>
                    item.id === inventoryId ? updatedItem : item
                )
            );

            // Refresh stats
            const statsData = await inventoryService.getInventoryStats(gasStationId!);
            setStats(statsData);

            return updatedItem;
        } catch (err: unknown) {
            console.error('Error removing stock:', err);
            setError(err instanceof Error ? err.message : 'An error occurred while removing stock');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getLowStockItems = async () => {
        try {
            setError(null);
            return await inventoryService.getLowStockItems(gasStationId!);
        } catch (err: unknown) {
            console.error('Error getting low stock items:', err);
            setError(err instanceof Error ? err.message : 'An error occurred while getting low stock items');
            throw err;
        }
    };

    const getOutOfStockItems = async () => {
        try {
            setError(null);
            return await inventoryService.getOutOfStockItems(gasStationId!);
        } catch (err: unknown) {
            console.error('Error getting out of stock items:', err);
            setError(err instanceof Error ? err.message : 'An error occurred while getting out of stock items');
            throw err;
        }
    };

    const refreshInventory = () => {
        fetchInventory();
    };

    return {
        inventory,
        stats,
        loading,
        error,
        createInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        addStock,
        removeStock,
        getLowStockItems,
        getOutOfStockItems,
        refreshInventory
    };
};

export default useInventory;
