import { GasStationRepository } from '../repositories/GasStationRepository';
import { GasStation } from '../entities/GasStation';

/**
 * Gas Station Use Case
 * Single Responsibility: Handle gas station business logic
 * Following Clean Architecture principles
 */
export class GasStationUseCase {
    constructor(private gasStationRepository: GasStationRepository) {}

    async createGasStation(userId: string, gasStationData: Partial<GasStation>): Promise<GasStation> {
        // Validate required fields
        if (!gasStationData.name || !gasStationData.address || !gasStationData.city || !gasStationData.state) {
            throw new Error('Nome, endereço, cidade e estado são obrigatórios');
        }

        // Create gas station entity
        const gasStation = new GasStation({
            userId,
            name: gasStationData.name,
            address: gasStationData.address,
            city: gasStationData.city,
            state: gasStationData.state,
            zipCode: gasStationData.zipCode,
            phone: gasStationData.phone,
            email: gasStationData.email,
            cnpj: gasStationData.cnpj,
            contactPerson: gasStationData.contactPerson,
            capacityLiters: gasStationData.capacityLiters,
            storageType: gasStationData.storageType,
            licenseNumber: gasStationData.licenseNumber,
            licenseExpiry: gasStationData.licenseExpiry,
            operatingHours: gasStationData.operatingHours,
            services: gasStationData.services,
            paymentMethods: gasStationData.paymentMethods,
            coordinates: gasStationData.coordinates,
            isActive: gasStationData.isActive ?? true,
            notes: gasStationData.notes,
        });

        return await this.gasStationRepository.create(gasStation);
    }

    async updateGasStation(gasStationId: string, updates: Partial<GasStation>): Promise<GasStation> {
        // Validate gas station exists
        const existingGasStation = await this.gasStationRepository.getById(gasStationId);
        if (!existingGasStation) {
            throw new Error('Posto não encontrado');
        }

        return await this.gasStationRepository.update(gasStationId, updates);
    }

    async deleteGasStation(gasStationId: string): Promise<boolean> {
        // Validate gas station exists
        const existingGasStation = await this.gasStationRepository.getById(gasStationId);
        if (!existingGasStation) {
            throw new Error('Posto não encontrado');
        }

        return await this.gasStationRepository.delete(gasStationId);
    }

    async getGasStationsByUserId(userId: string): Promise<GasStation[]> {
        return await this.gasStationRepository.getByUserId(userId);
    }

    async getGasStationById(gasStationId: string): Promise<GasStation | null> {
        return await this.gasStationRepository.getById(gasStationId);
    }

    async getActiveGasStationsByUserId(userId: string): Promise<GasStation[]> {
        return await this.gasStationRepository.getActiveByUserId(userId);
    }

    async searchGasStationsByLocation(city: string, state: string): Promise<GasStation[]> {
        if (!city || !state) {
            throw new Error('Cidade e estado são obrigatórios para a busca');
        }

        return await this.gasStationRepository.searchByLocation(city, state);
    }

    async toggleGasStationStatus(gasStationId: string): Promise<GasStation> {
        // Get current gas station
        const gasStation = await this.gasStationRepository.getById(gasStationId);
        if (!gasStation) {
            throw new Error('Posto não encontrado');
        }

        // Toggle status
        const newStatus = !gasStation.isActive;
        return await this.gasStationRepository.update(gasStationId, { isActive: newStatus });
    }
}
