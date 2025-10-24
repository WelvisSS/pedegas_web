import type { SupabaseClient } from '@supabase/supabase-js';
import { GasStationUseCase } from '../../domain/usecases/GasStationUseCase.js';
import { SupabaseGasStationRepository } from '../../infrastructure/repositories/SupabaseGasStationRepository.js';

interface GasStationData {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode?: string;
    phone?: string;
    email?: string;
    cnpj?: string;
    isActive?: boolean;
}

/**
 * Gas Station Service
 * Application service for gas station management
 * Following Dependency Injection Principle
 */
export class GasStationService {
    private gasStationUseCase: GasStationUseCase;

    constructor(supabaseClient: SupabaseClient) {
        const gasStationRepository = new SupabaseGasStationRepository(supabaseClient);
        this.gasStationUseCase = new GasStationUseCase(gasStationRepository);
    }

    async createGasStation(userId: string, gasStationData: GasStationData) {
        return await this.gasStationUseCase.createGasStation(userId, gasStationData);
    }

    async updateGasStation(gasStationId: string, updates: Partial<GasStationData>) {
        return await this.gasStationUseCase.updateGasStation(gasStationId, updates);
    }

    async deleteGasStation(gasStationId: string) {
        return await this.gasStationUseCase.deleteGasStation(gasStationId);
    }

    async getGasStationsByUserId(userId: string) {
        return await this.gasStationUseCase.getGasStationsByUserId(userId);
    }

    async getGasStationsByUser(userId: string) {
        return await this.gasStationUseCase.getGasStationsByUserId(userId);
    }

    async getGasStationById(gasStationId: string) {
        return await this.gasStationUseCase.getGasStationById(gasStationId);
    }

    async getActiveGasStationsByUserId(userId: string) {
        return await this.gasStationUseCase.getActiveGasStationsByUserId(userId);
    }

    async searchGasStationsByLocation(city: string, state: string) {
        return await this.gasStationUseCase.searchGasStationsByLocation(city, state);
    }

    async toggleGasStationStatus(gasStationId: string) {
        return await this.gasStationUseCase.toggleGasStationStatus(gasStationId);
    }
}
