import Deliveryman from '../../domain/entities/Deliveryman';
import SupabaseDeliverymanRepository from '../../infrastructure/repositories/SupabaseDeliverymanRepository';
import supabase from '../../lib/supabaseClient';

interface DeliverymanData {
    id?: string;
    name: string;
    email: string;
    cpf: string;
    phone: string;
    gasStationId?: string;
    isActive?: boolean;
    permissions?: string[];
    createdAt?: string;
    updatedAt?: string;
}

class DeliverymanService {
    private deliverymanRepository: SupabaseDeliverymanRepository;

    constructor() {
        this.deliverymanRepository = new SupabaseDeliverymanRepository(supabase);
    }

    async getAllDeliverymen(): Promise<Deliveryman[]> {
        try {
            return await this.deliverymanRepository.findAll();
        } catch (error) {
            console.error('Error in getAllDeliverymen:', error);
            throw new Error('Failed to fetch deliverymen');
        }
    }

    async getDeliverymanById(id: string): Promise<Deliveryman | null> {
        try {
            if (!id) {
                throw new Error('Deliveryman ID is required');
            }

            return await this.deliverymanRepository.findById(id);
        } catch (error) {
            console.error('Error in getDeliverymanById:', error);
            throw new Error('Failed to fetch deliveryman');
        }
    }

    async getDeliverymenByGasStation(gasStationId: string): Promise<Deliveryman[]> {
        try {
            if (!gasStationId) {
                throw new Error('Gas station ID is required');
            }

            return await this.deliverymanRepository.findByGasStationId(gasStationId);
        } catch (error) {
            console.error('Error in getDeliverymenByGasStation:', error);
            throw new Error('Failed to fetch deliverymen for gas station');
        }
    }

    async createDeliveryman(deliverymanData: DeliverymanData): Promise<Deliveryman> {
        try {
            // Create new deliveryman instance
            const deliveryman = new Deliveryman({
                ...deliverymanData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            // Validate the deliveryman data
            const errors = deliveryman.validate();
            if (errors.length > 0) {
                throw new Error(`Validation failed: ${errors.join(', ')}`);
            }

            // Check if email already exists
            const existingByEmail = await this.deliverymanRepository.findByEmail(deliveryman.email);
            if (existingByEmail) {
                throw new Error('Email already registered');
            }

            // Check if CPF already exists
            const existingByCpf = await this.deliverymanRepository.findByCpf(deliveryman.cpf);
            if (existingByCpf) {
                throw new Error('CPF already registered');
            }

            return await this.deliverymanRepository.create(deliveryman);
        } catch (error) {
            console.error('Error in createDeliveryman:', error);
            throw error;
        }
    }

    async updateDeliveryman(id: string, deliverymanData: Partial<DeliverymanData>): Promise<Deliveryman> {
        try {
            if (!id) {
                throw new Error('Deliveryman ID is required');
            }

            // Get existing deliveryman
            const existingDeliveryman = await this.deliverymanRepository.findById(id);
            if (!existingDeliveryman) {
                throw new Error('Deliveryman not found');
            }

            // Create updated deliveryman instance
            const updatedDeliveryman = new Deliveryman({
                ...existingDeliveryman,
                ...deliverymanData,
                id: existingDeliveryman.id,
                updatedAt: new Date().toISOString()
            });

            // Validate the updated data
            const errors = updatedDeliveryman.validate();
            if (errors.length > 0) {
                throw new Error(`Validation failed: ${errors.join(', ')}`);
            }

            // Check for email conflicts (excluding current deliveryman)
            if (deliverymanData.email && deliverymanData.email !== existingDeliveryman.email) {
                const existingByEmail = await this.deliverymanRepository.findByEmail(deliverymanData.email);
                if (existingByEmail && existingByEmail.id !== id) {
                    throw new Error('Email already registered');
                }
            }

            // Check for CPF conflicts (excluding current deliveryman)
            if (deliverymanData.cpf && deliverymanData.cpf !== existingDeliveryman.cpf) {
                const existingByCpf = await this.deliverymanRepository.findByCpf(deliverymanData.cpf);
                if (existingByCpf && existingByCpf.id !== id) {
                    throw new Error('CPF already registered');
                }
            }

            return await this.deliverymanRepository.update(id, updatedDeliveryman);
        } catch (error) {
            console.error('Error in updateDeliveryman:', error);
            throw error;
        }
    }

    async deleteDeliveryman(id: string): Promise<boolean> {
        try {
            if (!id) {
                throw new Error('Deliveryman ID is required');
            }

            const existingDeliveryman = await this.deliverymanRepository.findById(id);
            if (!existingDeliveryman) {
                throw new Error('Deliveryman not found');
            }

            return await this.deliverymanRepository.delete(id);
        } catch (error) {
            console.error('Error in deleteDeliveryman:', error);
            throw error;
        }
    }

    async activateDeliveryman(id: string): Promise<Deliveryman> {
        try {
            if (!id) {
                throw new Error('Deliveryman ID is required');
            }

            const existingDeliveryman = await this.deliverymanRepository.findById(id);
            if (!existingDeliveryman) {
                throw new Error('Deliveryman not found');
            }

            return await this.deliverymanRepository.activate(id);
        } catch (error) {
            console.error('Error in activateDeliveryman:', error);
            throw error;
        }
    }

    async deactivateDeliveryman(id: string): Promise<Deliveryman> {
        try {
            if (!id) {
                throw new Error('Deliveryman ID is required');
            }

            const existingDeliveryman = await this.deliverymanRepository.findById(id);
            if (!existingDeliveryman) {
                throw new Error('Deliveryman not found');
            }

            return await this.deliverymanRepository.deactivate(id);
        } catch (error) {
            console.error('Error in deactivateDeliveryman:', error);
            throw error;
        }
    }

    async updatePermissions(id: string, permissions: string[]): Promise<Deliveryman> {
        try {
            if (!id) {
                throw new Error('Deliveryman ID is required');
            }

            if (!Array.isArray(permissions)) {
                throw new Error('Permissions must be an array');
            }

            const existingDeliveryman = await this.deliverymanRepository.findById(id);
            if (!existingDeliveryman) {
                throw new Error('Deliveryman not found');
            }

            return await this.deliverymanRepository.updatePermissions(id, permissions);
        } catch (error) {
            console.error('Error in updatePermissions:', error);
            throw error;
        }
    }

    // Helper method to get available permissions
    getAvailablePermissions(): Array<{ key: string; label: string }> {
        return [
            { key: 'view_orders', label: 'Visualizar Pedidos' },
            { key: 'update_deliveries', label: 'Atualizar Entregas' },
            { key: 'manage_invoices', label: 'Gerenciar Notas Fiscais' },
            { key: 'view_customers', label: 'Visualizar Clientes' },
            { key: 'access_reports', label: 'Acessar Relatórios' }
        ];
    }
}

export default DeliverymanService;
