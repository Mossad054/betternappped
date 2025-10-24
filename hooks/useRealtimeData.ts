import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

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

  useEffect(() => {
    if (!userId) return;

    const newChannel = supabase
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
          onInsert?.(payload);
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
          onUpdate?.(payload);
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
          onDelete?.(payload);
        }
      )
      .subscribe((status) => {
        console.log(`Realtime subscription status for ${table}:`, status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    setChannel(newChannel);

    return () => {
      if (newChannel) {
        supabase.removeChannel(newChannel);
      }
    };
  }, [table, userId, onInsert, onUpdate, onDelete]);

  return {
    isConnected,
    channel,
  };
}

// Specific hooks for different data types
export function useRealtimeMoods(userId: string, onDataChange?: () => void) {
  return useRealtimeData({
    table: 'moods',
    userId,
    onInsert: onDataChange,
    onUpdate: onDataChange,
    onDelete: onDataChange,
  });
}

export function useRealtimeActivities(userId: string, onDataChange?: () => void) {
  return useRealtimeData({
    table: 'activities',
    userId,
    onInsert: onDataChange,
    onUpdate: onDataChange,
    onDelete: onDataChange,
  });
}

export function useRealtimeSleep(userId: string, onDataChange?: () => void) {
  return useRealtimeData({
    table: 'sleep',
    userId,
    onInsert: onDataChange,
    onUpdate: onDataChange,
    onDelete: onDataChange,
  });
}

export function useRealtimeHabits(userId: string, onDataChange?: () => void) {
  return useRealtimeData({
    table: 'habits',
    userId,
    onInsert: onDataChange,
    onUpdate: onDataChange,
    onDelete: onDataChange,
  });
}

export function useRealtimeExperiments(userId: string, onDataChange?: () => void) {
  return useRealtimeData({
    table: 'experiments',
    userId,
    onInsert: onDataChange,
    onUpdate: onDataChange,
    onDelete: onDataChange,
  });
}
