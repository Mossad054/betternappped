import NetInfo from '@react-native-community/netinfo';
import { flushOfflineQueue, getOfflineQueueSize } from '@/lib/supabaseSafe';

export interface SyncStatus {
  isOnline: boolean;
  isConnected: boolean;
  pendingWrites: number;
  isSyncing: boolean;
  lastSyncTime?: string;
}

export interface SyncManager {
  status: SyncStatus;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  forceSync: () => Promise<{ success: number; failed: number }>;
  isOnline: () => boolean;
}

class SyncManagerImpl implements SyncManager {
  private listeners: Set<(status: SyncStatus) => void> = new Set();
  private unsubscribe?: () => void;
  private syncInProgress = false;
  
  public status: SyncStatus = {
    isOnline: true,
    isConnected: true,
    pendingWrites: 0,
    isSyncing: false,
  };

  constructor() {
    this.startMonitoring();
  }

  public startMonitoring = () => {
    this.unsubscribe = NetInfo.addEventListener(state => {
      const wasOnline = this.status.isOnline;
      const isNowOnline = state.isConnected && state.isInternetReachable;
      
      this.status = {
        ...this.status,
        isOnline: isNowOnline,
        isConnected: state.isConnected,
        pendingWrites: 0, // Will be updated by getPendingWrites
      };

      // Update pending writes count
      this.updatePendingWrites();

      // If we just came back online, trigger sync
      if (!wasOnline && isNowOnline) {
        console.log('🌐 Network restored, triggering sync...');
        this.forceSync();
      }

      // Notify listeners
      this.notifyListeners();
    });
  };

  public stopMonitoring = () => {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = undefined;
    }
  };

  public forceSync = async (): Promise<{ success: number; failed: number }> => {
    if (this.syncInProgress) {
      console.log('🔄 Sync already in progress, skipping...');
      return { success: 0, failed: 0 };
    }

    if (!this.status.isOnline) {
      console.log('📴 Offline, cannot sync');
      return { success: 0, failed: 0 };
    }

    this.syncInProgress = true;
    this.status.isSyncing = true;
    this.notifyListeners();

    try {
      console.log('🔄 Starting manual sync...');
      const result = await flushOfflineQueue();
      
      this.status.lastSyncTime = new Date().toISOString();
      this.status.pendingWrites = 0;
      
      console.log(`✅ Sync completed: ${result.success} successful, ${result.failed} failed`);
      
      return result;
    } catch (error) {
      console.error('❌ Sync failed:', error);
      return { success: 0, failed: 1 };
    } finally {
      this.syncInProgress = false;
      this.status.isSyncing = false;
      this.updatePendingWrites();
      this.notifyListeners();
    }
  };

  public isOnline = (): boolean => {
    return this.status.isOnline;
  };

  private updatePendingWrites = async () => {
    try {
      const count = await getOfflineQueueSize();
      this.status.pendingWrites = count;
    } catch (error) {
      console.error('Failed to get pending writes count:', error);
    }
  };

  private notifyListeners = () => {
    this.listeners.forEach(listener => {
      try {
        listener(this.status);
      } catch (error) {
        console.error('Error notifying sync listener:', error);
      }
    });
  };

  public addListener = (listener: (status: SyncStatus) => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  public removeListener = (listener: (status: SyncStatus) => void) => {
    this.listeners.delete(listener);
  };
}

// Singleton instance
let syncManagerInstance: SyncManagerImpl | null = null;

export const getSyncManager = (): SyncManager => {
  if (!syncManagerInstance) {
    syncManagerInstance = new SyncManagerImpl();
  }
  return syncManagerInstance;
};

// Utility functions
export const initializeSyncManager = (): SyncManager => {
  return getSyncManager();
};

export const cleanupSyncManager = () => {
  if (syncManagerInstance) {
    syncManagerInstance.stopMonitoring();
    syncManagerInstance = null;
  }
};

// Auto-initialize when module loads
if (typeof window !== 'undefined') {
  initializeSyncManager();
}





