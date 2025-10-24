import { SupabaseClient } from '@supabase/supabase-js';
import { Inventory } from '../../domain/entities/Inventory';
import { InventoryRepository } from '../../domain/repositories/InventoryRepository';

/**
 * Supabase implementation of InventoryRepository
 * Following Dependency Inversion Principle
 */
export class SupabaseInventoryRepository extends InventoryRepository {
    constructor(private supabase: SupabaseClient) {
        super();
    }

    async getByGasStationId(gasStationId: string): Promise<Inventory[]> {
        const { data, error } = await this.supabase
            .from('inventory')
            .select(`
                *,
                gas_stations (
                    id,
                    name,
                    city,
                    state
                )
            `)
            .eq('gas_station_id', gasStationId)
            .order('product_type', { ascending: true });

        if (error) {
            throw new Error(error.message);
        }

        return data.map(item => Inventory.fromJson(item));
    }

    async getById(id: string): Promise<Inventory> {
        const { data, error } = await this.supabase
            .from('inventory')
            .select(`
                *,
                gas_stations (
                    id,
                    name,
                    city,
                    state
                )
            `)
            .eq('id', id)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return Inventory.fromJson(data);
    }

    async create(inventory: Inventory): Promise<Inventory> {
        const { data, error } = await this.supabase
            .from('inventory')
            .insert(inventory.toJson())
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return Inventory.fromJson(data);
    }

    async update(id: string, updates: Partial<Inventory>): Promise<Inventory> {
        // Convert camelCase updates to snake_case for database
        const convertedUpdates: Record<string, unknown> = {};
        Object.keys(updates).forEach(key => {
            switch (key) {
                case 'gasStationId':
                    convertedUpdates.gas_station_id = updates[key as keyof Inventory];
                    break;
                case 'productType':
                    convertedUpdates.product_type = updates[key as keyof Inventory];
                    break;
                case 'minQuantity':
                    convertedUpdates.min_quantity = updates[key as keyof Inventory];
                    break;
                case 'maxQuantity':
                    convertedUpdates.max_quantity = updates[key as keyof Inventory];
                    break;
                case 'unitPrice':
                    convertedUpdates.unit_price = updates[key as keyof Inventory];
                    break;
                case 'lastRestockDate':
                    convertedUpdates.last_restock_date = updates[key as keyof Inventory];
                    break;
                case 'nextRestockDate':
                    convertedUpdates.next_restock_date = updates[key as keyof Inventory];
                    break;
                case 'createdAt':
                    convertedUpdates.created_at = updates[key as keyof Inventory];
                    break;
                case 'updatedAt':
                    convertedUpdates.updated_at = updates[key as keyof Inventory];
                    break;
                default:
                    // For fields that don't need conversion (quantity, status, supplier, notes)
                    convertedUpdates[key] = updates[key as keyof Inventory];
            }
        });

        const { data, error } = await this.supabase
            .from('inventory')
            .update({
                ...convertedUpdates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return Inventory.fromJson(data);
    }

    async delete(id: string): Promise<boolean> {
        const { error } = await this.supabase
            .from('inventory')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(error.message);
        }

        return true;
    }

    async getByProductType(gasStationId: string, productType: string): Promise<Inventory | null> {
        const { data, error } = await this.supabase
            .from('inventory')
            .select('*')
            .eq('gas_station_id', gasStationId)
            .eq('product_type', productType)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // No rows returned
                return null;
            }
            throw new Error(error.message);
        }

        return Inventory.fromJson(data);
    }

    async getLowStockItems(gasStationId: string): Promise<Inventory[]> {
        const { data, error } = await this.supabase
            .from('inventory')
            .select(`
                *,
                gas_stations (
                    id,
                    name,
                    city,
                    state
                )
            `)
            .eq('gas_station_id', gasStationId)
            .eq('status', 'low_stock')
            .order('quantity', { ascending: true });

        if (error) {
            throw new Error(error.message);
        }

        return data.map(item => Inventory.fromJson(item));
    }

    async getOutOfStockItems(gasStationId: string): Promise<Inventory[]> {
        const { data, error } = await this.supabase
            .from('inventory')
            .select(`
                *,
                gas_stations (
                    id,
                    name,
                    city,
                    state
                )
            `)
            .eq('gas_station_id', gasStationId)
            .eq('status', 'out_of_stock')
            .order('product_type', { ascending: true });

        if (error) {
            throw new Error(error.message);
        }

        return data.map(item => Inventory.fromJson(item));
    }

    async updateQuantity(id: string, quantity: number): Promise<Inventory> {
        // Get current inventory to calculate new status
        const current = await this.getById(id);
        current.quantity = quantity;
        const newStatus = current.calculateStatus();

        const { data, error } = await this.supabase
            .from('inventory')
            .update({
                quantity,
                status: newStatus,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return Inventory.fromJson(data);
    }
}
