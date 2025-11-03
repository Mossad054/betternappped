import { useState, useEffect, useCallback } from 'react';
import { getSyncManager, SyncStatus } from '@/lib/syncManager';

export interface UseOfflineSyncReturn {
  status: SyncStatus;
  forceSync: () => Promise<{ success: number; failed: number }>;
  isOnline: boolean;
  pendingWrites: number;
  isSyncing: boolean;
  lastSyncTime?: string;
}

export const useOfflineSync = (): UseOfflineSyncReturn => {
  const [status, setStatus] = useState<SyncStatus>(() => {
    const syncManager = getSyncManager();
    return syncManager.status;
  });

  const syncManager = getSyncManager();

  useEffect(() => {
    const unsubscribe = syncManager.addListener((newStatus) => {
      setStatus(newStatus);
    });

    return unsubscribe;
  }, [syncManager]);

  const forceSync = useCallback(async () => {
    return await syncManager.forceSync();
  }, [syncManager]);

  return {
    status,
    forceSync,
    isOnline: status.isOnline,
    pendingWrites: status.pendingWrites,
    isSyncing: status.isSyncing,
    lastSyncTime: status.lastSyncTime,
  };
};

// Hook for components that need to show offline status
export const useOfflineStatus = () => {
  const { isOnline, pendingWrites, isSyncing } = useOfflineSync();
  
  return {
    isOnline,
    pendingWrites,
    isSyncing,
    showOfflineIndicator: !isOnline || pendingWrites > 0,
  };
};

// Hook for components that need sync functionality
export const useSyncActions = () => {
  const { forceSync, isSyncing } = useOfflineSync();
  
  return {
    sync: forceSync,
    isSyncing,
    canSync: !isSyncing,
  };
};





