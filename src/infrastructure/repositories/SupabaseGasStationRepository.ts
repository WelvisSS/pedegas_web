import { SupabaseClient } from '@supabase/supabase-js';
import { GasStation } from '../../domain/entities/GasStation';
import { GasStationRepository } from '../../domain/repositories/GasStationRepository';

/**
 * Supabase implementation of GasStationRepository
 * Following Dependency Inversion Principle
 */
export class SupabaseGasStationRepository extends GasStationRepository {
    constructor(private supabase: SupabaseClient) {
        super();
    }

    async getByUserId(userId: string): Promise<GasStation[]> {
        const { data, error } = await this.supabase
            .from('gas_stations')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        return data.map(gasStation => GasStation.fromJson(gasStation));
    }

    async getById(id: string): Promise<GasStation> {
        const { data, error } = await this.supabase
            .from('gas_stations')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return GasStation.fromJson(data);
    }

    async create(gasStation: GasStation): Promise<GasStation> {
        const { data, error } = await this.supabase
            .from('gas_stations')
            .insert(gasStation.toJson())
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return GasStation.fromJson(data);
    }

    async update(id: string, updates: Partial<GasStation>): Promise<GasStation> {
        // Convert camelCase updates to snake_case for database
        const convertedUpdates: Record<string, unknown> = {};
        Object.keys(updates).forEach(key => {
            switch (key) {
                case 'isActive':
                    convertedUpdates.is_active = updates[key as keyof GasStation];
                    break;
                case 'updatedAt':
                    convertedUpdates.updated_at = updates[key as keyof GasStation];
                    break;
                case 'userId':
                    convertedUpdates.user_id = updates[key as keyof GasStation];
                    break;
                case 'zipCode':
                    convertedUpdates.zip_code = updates[key as keyof GasStation];
                    break;
                case 'contactPerson':
                    convertedUpdates.contact_person = updates[key as keyof GasStation];
                    break;
                case 'capacityLiters':
                    convertedUpdates.capacity_liters = updates[key as keyof GasStation];
                    break;
                case 'storageType':
                    convertedUpdates.storage_type = updates[key as keyof GasStation];
                    break;
                case 'licenseNumber':
                    convertedUpdates.license_number = updates[key as keyof GasStation];
                    break;
                case 'licenseExpiry':
                    convertedUpdates.license_expiry = updates[key as keyof GasStation];
                    break;
                case 'operatingHours':
                    convertedUpdates.operating_hours = updates[key as keyof GasStation];
                    break;
                case 'paymentMethods':
                    convertedUpdates.payment_methods = updates[key as keyof GasStation];
                    break;
                case 'createdAt':
                    convertedUpdates.created_at = updates[key as keyof GasStation];
                    break;
                default:
                    // For fields that don't need conversion (name, cnpj, address, city, state, phone, email, services, coordinates, notes)
                    convertedUpdates[key] = updates[key as keyof GasStation];
            }
        });

        const { data, error } = await this.supabase
            .from('gas_stations')
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

        return GasStation.fromJson(data);
    }

    async delete(id: string): Promise<boolean> {
        const { error } = await this.supabase
            .from('gas_stations')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(error.message);
        }

        return true;
    }

    async searchByLocation(city: string, state: string): Promise<GasStation[]> {
        const { data, error } = await this.supabase
            .from('gas_stations')
            .select('*')
            .ilike('city', `%${city}%`)
            .ilike('state', `%${state}%`)
            .eq('is_active', true)
            .order('name', { ascending: true });

        if (error) {
            throw new Error(error.message);
        }

        return data.map(gasStation => GasStation.fromJson(gasStation));
    }

    async getActiveByUserId(userId: string): Promise<GasStation[]> {
        const { data, error } = await this.supabase
            .from('gas_stations')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        return data.map(gasStation => GasStation.fromJson(gasStation));
    }
}
