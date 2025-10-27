import { useCallback, useEffect, useState } from 'react';
import { InvoiceService } from '../../application/services/InvoiceService';
import { OrderService } from '../../application/services/OrderService';
import { GasStation } from '../../domain/entities/GasStation';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeOrders } from './useRealtimeOrders';
import type { Order } from '../../domain/types/Order';

interface OrderStats {
    total: number;
    pending: number;
    confirmed: number;
    preparing: number;
    out_for_delivery: number;
    delivered: number;
    cancelled: number;
}

export const useOrders = () => {
    const { user } = useAuth();
    const [orderService] = useState(() => new OrderService(supabase));
    const [invoiceService] = useState(() => new InvoiceService(supabase));
    const [orders, setOrders] = useState<Order[]>([]);
    const [gasStations, setGasStations] = useState<GasStation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<OrderStats>({
        total: 0,
        pending: 0,
        confirmed: 0,
        preparing: 0,
        out_for_delivery: 0,
        delivered: 0,
        cancelled: 0
    });

    // Load orders when component mounts
    useEffect(() => {
        if (user) {
            loadOrders();
            loadGasStations();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load orders based on user type
            let ordersData: unknown;
            if (user?.userType === 'company') {
                // Company users see all orders (they are gas station owners)
                ordersData = await orderService.getAllOrders();
            } else {
                // Individual users see only their orders
                ordersData = await orderService.getUserOrders(user?.id || '');
            }

            setOrders(ordersData as Order[]);

            // Load statistics
            const statsData = await orderService.getOrderStats(
                user?.userType === 'individual' ? user.id : null
            );
            setStats(statsData);

        } catch (err) {
            console.error('Error loading orders:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const loadGasStations = async () => {
        try {
            // PRIORITY 1: RPC function that bypasses RLS
            try {
                const { data: rpcData, error: rpcError } = await supabase
                    .rpc('get_active_gas_stations_public');

                if (!rpcError && rpcData && rpcData.length > 0) {
                    setGasStations(rpcData);
                    return;
                }
            } catch {
                // Continue to fallback
            }

            // FALLBACK 1: Direct simple query
            const { data: directData, error: directError } = await supabase
                .from('gas_stations')
                .select('*')
                .eq('is_active', true)
                .order('name');

            if (!directError && directData && directData.length > 0) {
                setGasStations(directData);
                return;
            }

            // FALLBACK 2: OrderService
            const serviceData = await orderService.getGasStations();

            if (serviceData && serviceData.length > 0) {
                setGasStations(serviceData);
                return;
            }

            // If no source worked, set empty array
            setGasStations([]);

        } catch (err) {
            console.error('Error loading gas stations:', err);
            setGasStations([]);
        }
    };

    const createOrder = async (orderData: Record<string, unknown> & { gasStationId?: string; customerName?: string; totalAmount?: number }) => {
        try {
            console.log('Creating order for user:', {
                userId: user?.id,
                email: user?.email,
                userType: user?.userType
            });

            const newOrder = await orderService.createOrder({
                ...orderData,
                userId: user?.id
            } as never);

            // No need to reload - Realtime will add automatically
            // The useRealtimeOrders hook will detect the INSERT and add to the list

            return newOrder;
        } catch (err) {
            console.error('Error creating order:', err);
            throw err;
        }
    };

    const updateOrderStatus = async (orderId: number | string, status: string) => {
        try {
            await orderService.updateOrderStatus(String(orderId), status);
            
            // No need to reload - Realtime will update automatically
            // The useRealtimeOrders hook will detect the change and update the state
        } catch (err) {
            console.error('Error updating order status:', err);
            throw err;
        }
    };

    const generateInvoice = async (orderId: number | string) => {
        try {
            const invoice = await invoiceService.generateInvoice(String(orderId));
            return invoice;
        } catch (err) {
            console.error('Error generating invoice:', err);
            throw err;
        }
    };

    const refreshOrders = () => {
        if (user) {
            loadOrders();
        }
    };

    const refreshGasStations = () => {
        if (user) {
            loadGasStations();
        }
    };

    // Helper function to load only statistics
    const loadOrderStats = useCallback(async () => {
        try {
            const statsData = await orderService.getOrderStats(
                user?.userType === 'individual' ? user.id : null
            );
            setStats(statsData);
        } catch (err) {
            console.error('Error loading order stats:', err);
        }
    }, [orderService, user]);

    // Callback for real-time changes
    const handleRealtimeChange = useCallback(({ eventType, old, new: newRecord }: { eventType: 'INSERT' | 'UPDATE' | 'DELETE'; old: unknown; new: unknown }) => {
        console.log('🔄 Updating orders in real-time:', eventType);

        setOrders((currentOrders: Order[]) => {
            let updatedOrders = [...currentOrders];
            const newOrder = newRecord as Order;
            const oldOrder = old as Order;

            if (eventType === 'INSERT') {
                // New order created
                updatedOrders = [newOrder, ...updatedOrders];
                console.log('✅ New order added:', newOrder.id);
            } else if (eventType === 'UPDATE') {
                // Order updated - update smoothly without reload
                const index = updatedOrders.findIndex(o => o.id === newOrder.id);
                if (index !== -1) {
                    // Preserve order position in the list
                    updatedOrders[index] = newOrder;
                    console.log('✅ Order updated:', newOrder.id, 'Status:', newOrder.status);
                } else {
                    // If not found, it might be a new order for this user
                    updatedOrders = [newOrder, ...updatedOrders];
                }
            } else if (eventType === 'DELETE') {
                // Order deleted
                updatedOrders = updatedOrders.filter(o => o.id !== oldOrder.id);
                console.log('✅ Order removed:', oldOrder.id);
            }

            return updatedOrders;
        });

        // Update statistics asynchronously
        loadOrderStats();
    }, [loadOrderStats]);

    // Activate Realtime
    useRealtimeOrders(
        handleRealtimeChange,
        user?.id,
        user?.userType
    );

    return {
        orders,
        gasStations,
        loading,
        error,
        stats,
        createOrder,
        updateOrderStatus,
        generateInvoice,
        refreshOrders,
        refreshGasStations
    };
};
