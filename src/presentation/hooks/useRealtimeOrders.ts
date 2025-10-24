import { useEffect, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabaseClient';

interface RealtimePayload {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    old: Record<string, unknown>;
    new: Record<string, unknown>;
}

/**
 * Hook to manage real-time subscriptions for orders
 * Listens to changes in the 'orders' table and updates automatically
 */
export const useRealtimeOrders = (
    onOrderChange: (payload: RealtimePayload) => void,
    userId?: string,
    userType?: string
) => {
    const channelRef = useRef<RealtimeChannel | null>(null);

    useEffect(() => {
        if (!userId) return;

        // Create realtime channel
        const channel = supabase
            .channel('orders-changes')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to INSERT, UPDATE, DELETE
                    schema: 'public',
                    table: 'orders',
                    // Filter by user_id if individual user
                    ...(userType === 'individual' && {
                        filter: `user_id=eq.${userId}`
                    })
                },
                (payload) => {
                    // Call callback with event type and data
                    if (onOrderChange) {
                        onOrderChange({
                            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
                            old: payload.old,
                            new: payload.new
                        });
                    }
                }
            )
            .subscribe();

        channelRef.current = channel;

        // Cleanup: remove subscription when component unmounts
        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
            }
        };
    }, [userId, userType, onOrderChange]);

    return channelRef;
};
