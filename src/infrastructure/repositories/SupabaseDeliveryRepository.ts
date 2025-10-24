import { SupabaseClient } from '@supabase/supabase-js';
import { Delivery } from '../../domain/entities/Delivery';
import { DeliveryRepository } from '../../domain/repositories/DeliveryRepository';

interface DeliveryFilters {
    status?: string;
    priority?: string;
    gasStationId?: string;
    dateFrom?: Date;
    dateTo?: Date;
}


interface DeliveryUpdateData {
    status?: string;
    priority?: string;
    estimated_delivery?: string;
    delivered_at?: string;
    invoice_number?: string;
    invoice_generated_at?: string;
    notes?: string;
    updated_at?: string;
}

/**
 * Supabase Delivery Repository Implementation
 * Handles delivery data operations with Supabase
 */
export class SupabaseDeliveryRepository extends DeliveryRepository {
    constructor(private supabase: SupabaseClient) {
        super();
    }

    /**
     * Get all deliveries for a specific gas station
     */
    async getDeliveriesByGasStation(gasStationId: string, filters: DeliveryFilters = {}): Promise<Delivery[]> {
        try {
            let query = this.supabase
                .from('deliveries')
                .select('*')
                .eq('gas_station_id', gasStationId)
                .order('created_at', { ascending: false });

            // Apply filters
            if (filters.status) {
                query = query.eq('status', filters.status);
            }

            if (filters.priority) {
                query = query.eq('priority', filters.priority);
            }

            if (filters.dateFrom) {
                query = query.gte('created_at', filters.dateFrom.toISOString());
            }

            if (filters.dateTo) {
                query = query.lte('created_at', filters.dateTo.toISOString());
            }

            const { data, error } = await query;

            if (error) {
                throw new Error(`Error fetching deliveries: ${error.message}`);
            }

            return data.map(row => Delivery.fromDatabase(row));
        } catch (error) {
            console.error('Error in getDeliveriesByGasStation:', error);
            throw error;
        }
    }

    /**
     * Get all deliveries for a specific user (across all gas stations)
     */
    async getDeliveriesByUser(userId: string, filters: DeliveryFilters = {}): Promise<Delivery[]> {
        try {
            let query = this.supabase
                .from('deliveries')
                .select(`
                    *,
                    gas_stations!inner(
                        id,
                        name,
                        address,
                        city,
                        state,
                        phone,
                        contact_person
                    )
                `)
                .eq('gas_stations.user_id', userId)
                .order('created_at', { ascending: false });

            // Apply filters
            if (filters.status) {
                query = query.eq('status', filters.status);
            }

            if (filters.gasStationId) {
                query = query.eq('gas_station_id', filters.gasStationId);
            }

            if (filters.priority) {
                query = query.eq('priority', filters.priority);
            }

            if (filters.dateFrom) {
                query = query.gte('created_at', filters.dateFrom.toISOString());
            }

            if (filters.dateTo) {
                query = query.lte('created_at', filters.dateTo.toISOString());
            }

            const { data, error } = await query;

            if (error) {
                throw new Error(`Error fetching user deliveries: ${error.message}`);
            }

            // Transform data to include gas station info
            return data.map(row => {
                const delivery = Delivery.fromDatabase(row);
                delivery.gasStation = {
                    id: row.gas_stations.id,
                    name: row.gas_stations.name,
                    address: row.gas_stations.address,
                    city: row.gas_stations.city,
                    state: row.gas_stations.state,
                    phone: row.gas_stations.phone,
                    manager: row.gas_stations.contact_person
                } as unknown as typeof delivery.gasStation;
                return delivery;
            });
        } catch (error) {
            console.error('Error in getDeliveriesByUser:', error);
            throw error;
        }
    }

    /**
     * Get delivery by ID
     */
    async getDeliveryById(deliveryId: string): Promise<Delivery | null> {
        try {
            const { data, error } = await this.supabase
                .from('deliveries')
                .select(`
                    *,
                    gas_stations(
                        id,
                        name,
                        address,
                        city,
                        state,
                        phone,
                        contact_person
                    )
                `)
                .eq('id', deliveryId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return null; // Not found
                }
                throw new Error(`Error fetching delivery: ${error.message}`);
            }

            const delivery = Delivery.fromDatabase(data);
            if (data.gas_stations) {
                delivery.gasStation = {
                    id: data.gas_stations.id,
                    name: data.gas_stations.name,
                    address: data.gas_stations.address,
                    city: data.gas_stations.city,
                    state: data.gas_stations.state,
                    phone: data.gas_stations.phone,
                    manager: data.gas_stations.contact_person
                } as unknown as typeof delivery.gasStation;
            }

            return delivery;
        } catch (error) {
            console.error('Error in getDeliveryById:', error);
            throw error;
        }
    }

    /**
     * Create a new delivery
     */
    async createDelivery(delivery: Delivery): Promise<Delivery> {
        try {
            if (!delivery.isValid()) {
                throw new Error('Invalid delivery data');
            }

            const deliveryData = delivery.toDatabase();

            const { data, error } = await this.supabase
                .from('deliveries')
                .insert(deliveryData)
                .select()
                .single();

            if (error) {
                throw new Error(`Error creating delivery: ${error.message}`);
            }

            return Delivery.fromDatabase(data);
        } catch (error) {
            console.error('Error in createDelivery:', error);
            throw error;
        }
    }

    /**
     * Update delivery status
     */
    async updateDeliveryStatus(deliveryId: string, newStatus: string, additionalData: Partial<DeliveryUpdateData> = {}): Promise<Delivery> {
        try {
            const updateData: DeliveryUpdateData = {
                status: newStatus,
                updated_at: new Date().toISOString(),
                ...additionalData
            };

            // Add delivered_at if status is delivered
            if (newStatus === 'delivered') {
                updateData.delivered_at = new Date().toISOString();
            }

            const { data, error } = await this.supabase
                .from('deliveries')
                .update(updateData)
                .eq('id', deliveryId)
                .select()
                .single();

            if (error) {
                throw new Error(`Error updating delivery status: ${error.message}`);
            }

            return Delivery.fromDatabase(data);
        } catch (error) {
            console.error('Error in updateDeliveryStatus:', error);
            throw error;
        }
    }

    /**
     * Update delivery with invoice information
     */
    async updateDeliveryInvoice(deliveryId: string, invoiceNumber: string): Promise<Delivery> {
        try {
            const updateData = {
                invoice_number: invoiceNumber,
                invoice_generated_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data, error } = await this.supabase
                .from('deliveries')
                .update(updateData)
                .eq('id', deliveryId)
                .select()
                .single();

            if (error) {
                throw new Error(`Error updating delivery invoice: ${error.message}`);
            }

            return Delivery.fromDatabase(data);
        } catch (error) {
            console.error('Error in updateDeliveryInvoice:', error);
            throw error;
        }
    }

    /**
     * Delete delivery
     */
    async deleteDelivery(deliveryId: string): Promise<boolean> {
        try {
            const { error } = await this.supabase
                .from('deliveries')
                .delete()
                .eq('id', deliveryId);

            if (error) {
                throw new Error(`Error deleting delivery: ${error.message}`);
            }

            return true;
        } catch (error) {
            console.error('Error in deleteDelivery:', error);
            throw error;
        }
    }

    /**
     * Get delivery statistics for a gas station
     */
    async getDeliveryStats(gasStationId: string, dateRange?: { from?: Date; to?: Date }): Promise<{ total: number; byStatus: Record<string, number>; byPriority: Record<string, number> }> {
        try {
            let query = this.supabase
                .from('deliveries')
                .select('status, priority')
                .eq('gas_station_id', gasStationId);

            if (dateRange?.from) {
                query = query.gte('created_at', dateRange.from.toISOString());
            }

            if (dateRange?.to) {
                query = query.lte('created_at', dateRange.to.toISOString());
            }

            const { data, error } = await query;

            if (error) {
                throw new Error(`Error fetching delivery stats: ${error.message}`);
            }

            // Calculate statistics by status
            const byStatus: Record<string, number> = {};
            const byPriority: Record<string, number> = {};

            data.forEach(delivery => {
                // Count by status
                if (delivery.status) {
                    byStatus[delivery.status] = (byStatus[delivery.status] || 0) + 1;
                }
                // Count by priority
                if (delivery.priority) {
                    byPriority[delivery.priority] = (byPriority[delivery.priority] || 0) + 1;
                }
            });

            return {
                total: data.length,
                byStatus,
                byPriority
            };
        } catch (error) {
            console.error('Error in getDeliveryStats:', error);
            throw error;
        }
    }
}
