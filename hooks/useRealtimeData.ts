import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { isGuestMode } from '@/lib/guestDataStore';

interface RealtimeDataOptions {
  table: string;
  userId: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
}

export function useRealtimeData({
  table,
  userId,
  onInsert,
  onUpdate,
  onDelete,
}: RealtimeDataOptions) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const onInsertRef = useRef(onInsert);
  const onUpdateRef = useRef(onUpdate);
  const onDeleteRef = useRef(onDelete);
  onInsertRef.current = onInsert;
  onUpdateRef.current = onUpdate;
  onDeleteRef.current = onDelete;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    let newChannel: RealtimeChannel | null = null;
    // Skip realtime for guest mode
    const subscribe = async () => {
      const isGuest = await isGuestMode();
      if (cancelled || isGuest) {
        return;
      }
      newChannel = supabase
        .channel(`${table}_changes`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: table,
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            console.log('INSERT event:', payload);
            onInsertRef.current?.(payload);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: table,
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            console.log('UPDATE event:', payload);
            onUpdateRef.current?.(payload);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: table,
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            console.log('DELETE event:', payload);
            onDeleteRef.current?.(payload);
          }
        )
        .subscribe((status) => {
          console.log(`Realtime subscription status for ${table}:`, status);
          setIsConnected(status === 'SUBSCRIBED');
        });
      setChannel(newChannel);
    };
    subscribe();
    return () => {
      cancelled = true;
      if (newChannel) {
        supabase.removeChannel(newChannel);
      }
    };
  }, [table, userId]);

  return {
    isConnected,
    channel,
  };
}

// Specific hooks for different data types
export function useRealtimeMoods(userId: string, onDataChange?: () => void) {
  return useRealtimeData({
    table: 'mood_logs', // Fixed table name
    userId,
    onInsert: onDataChange,
    onUpdate: onDataChange,
    onDelete: onDataChange,
  });
}

export function useRealtimeActivities(userId: string, onDataChange?: () => void) {
  return useRealtimeData({
    table: 'activities', // Correct table name
    userId,
    onInsert: onDataChange,
    onUpdate: onDataChange,
    onDelete: onDataChange,
  });
}

export function useRealtimeSleep(userId: string, onDataChange?: () => void) {
  return useRealtimeData({
    table: 'sleep_logs', // Fixed table name
    userId,
    onInsert: onDataChange,
    onUpdate: onDataChange,
    onDelete: onDataChange,
  });
}

export function useRealtimeHabits(userId: string, onDataChange?: () => void) {
  return useRealtimeData({
    table: 'habits', // Correct table name
    userId,
    onInsert: onDataChange,
    onUpdate: onDataChange,
    onDelete: onDataChange,
  });
}

export function useRealtimeExperiments(userId: string, onDataChange?: () => void) {
  return useRealtimeData({
    table: 'experiments', // Correct table name
    userId,
    onInsert: onDataChange,
    onUpdate: onDataChange,
    onDelete: onDataChange,
  });
}
