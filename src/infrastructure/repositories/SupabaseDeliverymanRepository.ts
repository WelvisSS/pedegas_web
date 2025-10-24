import { SupabaseClient } from '@supabase/supabase-js';
import Deliveryman from '../../domain/entities/Deliveryman';
import DeliverymanRepository from '../../domain/repositories/DeliverymanRepository';

/**
 * Supabase implementation of DeliverymanRepository
 * Following Dependency Inversion Principle
 */
class SupabaseDeliverymanRepository extends DeliverymanRepository {
    constructor(private supabase: SupabaseClient) {
        super();
    }

    async findAll(): Promise<Deliveryman[]> {
        try {
            const { data, error } = await this.supabase
                .from('deliverymen')
                .select(`
                    *,
                    gas_stations (
                        id,
                        name
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data?.map(row => Deliveryman.fromDatabase(row)).filter((d): d is Deliveryman => d !== null) || [];
        } catch (error) {
            console.error('Error fetching deliverymen:', error);
            throw error;
        }
    }

    async findById(id: string): Promise<Deliveryman | null> {
        try {
            const { data, error } = await this.supabase
                .from('deliverymen')
                .select(`
                    *,
                    gas_stations (
                        id,
                        name
                    )
                `)
                .eq('id', id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null;
                throw error;
            }

            return Deliveryman.fromDatabase(data);
        } catch (error) {
            console.error('Error fetching deliveryman by id:', error);
            throw error;
        }
    }

    async findByGasStationId(gasStationId: string): Promise<Deliveryman[]> {
        try {
            const { data, error } = await this.supabase
                .from('deliverymen')
                .select(`
                    *,
                    gas_stations (
                        id,
                        name
                    )
                `)
                .eq('gas_station_id', gasStationId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data?.map(row => Deliveryman.fromDatabase(row)).filter((d): d is Deliveryman => d !== null) || [];
        } catch (error) {
            console.error('Error fetching deliverymen by gas station:', error);
            throw error;
        }
    }

    async findByEmail(email: string): Promise<Deliveryman | null> {
        try {
            const { data, error } = await this.supabase
                .from('deliverymen')
                .select('*')
                .eq('email', email)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null;
                throw error;
            }

            return Deliveryman.fromDatabase(data);
        } catch (error) {
            console.error('Error fetching deliveryman by email:', error);
            throw error;
        }
    }

    async findByCpf(cpf: string): Promise<Deliveryman | null> {
        try {
            const { data, error } = await this.supabase
                .from('deliverymen')
                .select('*')
                .eq('cpf', cpf)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null;
                throw error;
            }

            return Deliveryman.fromDatabase(data);
        } catch (error) {
            console.error('Error fetching deliveryman by cpf:', error);
            throw error;
        }
    }

    async create(deliveryman: Deliveryman): Promise<Deliveryman> {
        try {
            const deliverymanData = deliveryman.toDatabase();
            delete deliverymanData.id;

            const { data, error } = await this.supabase
                .from('deliverymen')
                .insert([deliverymanData])
                .select()
                .single();

            if (error) throw error;

            const result = Deliveryman.fromDatabase(data);
            if (!result) {
                throw new Error('Failed to create deliveryman');
            }
            return result;
        } catch (error) {
            console.error('Error creating deliveryman:', error);
            throw error;
        }
    }

    async update(id: string, deliveryman: Deliveryman): Promise<Deliveryman> {
        try {
            const deliverymanData = deliveryman.toDatabase();
            deliverymanData.updated_at = new Date().toISOString();

            const { data, error } = await this.supabase
                .from('deliverymen')
                .update(deliverymanData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            const result = Deliveryman.fromDatabase(data);
            if (!result) {
                throw new Error('Failed to update deliveryman');
            }
            return result;
        } catch (error) {
            console.error('Error updating deliveryman:', error);
            throw error;
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            const { error } = await this.supabase
                .from('deliverymen')
                .delete()
                .eq('id', id);

            if (error) throw error;

            return true;
        } catch (error) {
            console.error('Error deleting deliveryman:', error);
            throw error;
        }
    }

    async activate(id: string): Promise<Deliveryman> {
        try {
            const { data, error } = await this.supabase
                .from('deliverymen')
                .update({
                    active: true,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            const result = Deliveryman.fromDatabase(data);
            if (!result) {
                throw new Error('Failed to activate deliveryman');
            }
            return result;
        } catch (error) {
            console.error('Error activating deliveryman:', error);
            throw error;
        }
    }

    async deactivate(id: string): Promise<Deliveryman> {
        try {
            const { data, error } = await this.supabase
                .from('deliverymen')
                .update({
                    active: false,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            const result = Deliveryman.fromDatabase(data);
            if (!result) {
                throw new Error('Failed to deactivate deliveryman');
            }
            return result;
        } catch (error) {
            console.error('Error deactivating deliveryman:', error);
            throw error;
        }
    }

    async updatePermissions(id: string, permissions: string[]): Promise<Deliveryman> {
        try {
            const { data, error } = await this.supabase
                .from('deliverymen')
                .update({
                    permissions: JSON.stringify(permissions),
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            const result = Deliveryman.fromDatabase(data);
            if (!result) {
                throw new Error('Failed to update deliveryman permissions');
            }
            return result;
        } catch (error) {
            console.error('Error updating deliveryman permissions:', error);
            throw error;
        }
    }
}

export default SupabaseDeliverymanRepository;
