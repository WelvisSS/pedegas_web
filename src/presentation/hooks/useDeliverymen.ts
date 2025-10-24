import { useEffect, useState } from 'react';
import DeliverymanService from '../../application/services/DeliverymanService';

export interface Deliveryman {
    id?: string;
    name: string;
    phone: string;
    email: string;
    cpf: string;
    gasStationId?: string;
    active: boolean;
    permissions?: string[];
}

interface DeliverymanData {
    name: string;
    phone: string;
    email: string;
    cpf: string;
    gasStationId: string;
    permissions: string[];
}

export interface Permission {
    key: string;
    label: string;
}

const useDeliverymen = (gasStationId: string | null = null) => {
    const [deliverymen, setDeliverymen] = useState<Deliveryman[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deliverymanService = new DeliverymanService();

    const fetchDeliverymen = async () => {
        try {
            setLoading(true);
            setError(null);

            let data;
            if (gasStationId) {
                data = await deliverymanService.getDeliverymenByGasStation(gasStationId);
            } else {
                data = await deliverymanService.getAllDeliverymen();
            }

            setDeliverymen(data);
        } catch (err) {
            console.error('Error fetching deliverymen:', err);
            setError(err instanceof Error ? err.message : 'Erro ao buscar entregadores');
        } finally {
            setLoading(false);
        }
    };

    const createDeliveryman = async (deliverymanData: DeliverymanData) => {
        try {
            setLoading(true);
            setError(null);

            const newDeliveryman = await deliverymanService.createDeliveryman(deliverymanData);
            setDeliverymen(prev => [newDeliveryman, ...prev]);

            return newDeliveryman;
        } catch (err) {
            console.error('Error creating deliveryman:', err);
            setError(err instanceof Error ? err.message : 'Erro ao criar entregador');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateDeliveryman = async (id: string, deliverymanData: Partial<DeliverymanData>) => {
        try {
            setLoading(true);
            setError(null);

            const updatedDeliveryman = await deliverymanService.updateDeliveryman(id, deliverymanData);
            setDeliverymen(prev =>
                prev.map(deliveryman =>
                    deliveryman.id === id ? updatedDeliveryman : deliveryman
                )
            );

            return updatedDeliveryman;
        } catch (err) {
            console.error('Error updating deliveryman:', err);
            setError(err instanceof Error ? err.message : 'Erro ao atualizar entregador');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteDeliveryman = async (id: string) => {
        try {
            setLoading(true);
            setError(null);

            await deliverymanService.deleteDeliveryman(id);
            setDeliverymen(prev => prev.filter(deliveryman => deliveryman.id !== id));

            return true;
        } catch (err) {
            console.error('Error deleting deliveryman:', err);
            setError(err instanceof Error ? err.message : 'Erro ao deletar entregador');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const activateDeliveryman = async (id: string) => {
        try {
            setLoading(true);
            setError(null);

            const updatedDeliveryman = await deliverymanService.activateDeliveryman(id);
            setDeliverymen(prev =>
                prev.map(deliveryman =>
                    deliveryman.id === id ? updatedDeliveryman : deliveryman
                )
            );

            return updatedDeliveryman;
        } catch (err) {
            console.error('Error activating deliveryman:', err);
            setError(err instanceof Error ? err.message : 'Erro ao ativar entregador');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deactivateDeliveryman = async (id: string) => {
        try {
            setLoading(true);
            setError(null);

            const updatedDeliveryman = await deliverymanService.deactivateDeliveryman(id);
            setDeliverymen(prev =>
                prev.map(deliveryman =>
                    deliveryman.id === id ? updatedDeliveryman : deliveryman
                )
            );

            return updatedDeliveryman;
        } catch (err) {
            console.error('Error deactivating deliveryman:', err);
            setError(err instanceof Error ? err.message : 'Erro ao desativar entregador');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updatePermissions = async (id: string, permissions: string[]) => {
        try {
            setLoading(true);
            setError(null);

            const updatedDeliveryman = await deliverymanService.updatePermissions(id, permissions);
            setDeliverymen(prev =>
                prev.map(deliveryman =>
                    deliveryman.id === id ? updatedDeliveryman : deliveryman
                )
            );

            return updatedDeliveryman;
        } catch (err) {
            console.error('Error updating permissions:', err);
            setError(err instanceof Error ? err.message : 'Erro ao atualizar permissões');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getAvailablePermissions = (): Permission[] => {
        return deliverymanService.getAvailablePermissions();
    };

    useEffect(() => {
        fetchDeliverymen();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gasStationId]);

    return {
        deliverymen,
        loading,
        error,
        fetchDeliverymen,
        createDeliveryman,
        updateDeliveryman,
        deleteDeliveryman,
        activateDeliveryman,
        deactivateDeliveryman,
        updatePermissions,
        getAvailablePermissions
    };
};

export default useDeliverymen;
