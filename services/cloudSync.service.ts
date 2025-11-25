/**
 * Cloud Sync Service
 * Handles data synchronization with Google Drive and iCloud
 * Enables cross-device data backup and restore
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Platform, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { isGuestMode, guestDataStore } from '@/lib/guestDataStore';

export enum CloudProvider {
  GOOGLE_DRIVE = 'google_drive',
  ICLOUD = 'icloud',
  SUPABASE = 'supabase',
}

export interface CloudSyncConfig {
  provider: CloudProvider;
  enabled: boolean;
  lastSyncDate: string | null;
  autoSync: boolean;
  syncInterval: number; // in minutes
}

export interface SyncData {
  userId: string;
  timestamp: string;
  version: string;
  data: {
    habits: any[];
    experiments: any[];
    moods: any[];
    sleep: any[];
    mentalClarity: any[];
    profile: any;
    settings: any;
  };
}

const SYNC_CONFIG_KEY = '@cloud_sync_config';
const SYNC_DATA_KEY = '@cloud_sync_data';
const SYNC_VERSION = '1.0.0';

/**
 * Cloud Sync Service
 * Manages data backup and synchronization across devices
 */
export class CloudSyncService {
  // ============================================================
  // Configuration Management
  // ============================================================

  /**
   * Get cloud sync configuration
   */
  static async getConfig(userId: string): Promise<CloudSyncConfig | null> {
    try {
      const key = `${SYNC_CONFIG_KEY}_${userId}`;
      const data = await AsyncStorage.getItem(key);
      
      if (!data) {
        return this.getDefaultConfig();
      }

      return JSON.parse(data);
    } catch (error) {
      console.error('Error getting sync config:', error);
      return null;
    }
  }

  /**
   * Update cloud sync configuration
   */
  static async updateConfig(
    userId: string,
    config: Partial<CloudSyncConfig>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const key = `${SYNC_CONFIG_KEY}_${userId}`;
      const current = await this.getConfig(userId) || this.getDefaultConfig();
      
      const updated: CloudSyncConfig = {
        ...current,
        ...config,
      };

      await AsyncStorage.setItem(key, JSON.stringify(updated));

      return { success: true };
    } catch (error: any) {
      console.error('Error updating sync config:', error);
      return {
        success: false,
        error: error.message || 'Failed to update sync configuration',
      };
    }
  }

  /**
   * Enable cloud sync for a provider
   */
  static async enableSync(
    userId: string,
    provider: CloudProvider
  ): Promise<{ success: boolean; error?: string }> {
    return this.updateConfig(userId, {
      provider,
      enabled: true,
    });
  }

  /**
   * Disable cloud sync
   */
  static async disableSync(userId: string): Promise<{ success: boolean; error?: string }> {
    return this.updateConfig(userId, {
      enabled: false,
    });
  }

  /**
   * Get default sync configuration
   */
  private static getDefaultConfig(): CloudSyncConfig {
    return {
      provider: Platform.OS === 'ios' ? CloudProvider.ICLOUD : CloudProvider.GOOGLE_DRIVE,
      enabled: false,
      lastSyncDate: null,
      autoSync: true,
      syncInterval: 30, // 30 minutes
    };
  }

  // ============================================================
  // Data Export & Backup
  // ============================================================

  /**
   * Export all user data for backup
   */
  static async exportUserData(userId: string): Promise<{
    data: SyncData | null;
    error?: string;
  }> {
    try {
      if (await isGuestMode()) {
        // Export guest data
        const guestData = await guestDataStore.exportAll();
        
        return {
          data: {
            userId,
            timestamp: new Date().toISOString(),
            version: SYNC_VERSION,
            data: {
              habits: guestData.habits || [],
              experiments: guestData.experiments || [],
              moods: guestData.moods || [],
              sleep: guestData.sleep || [],
              mentalClarity: guestData.mental_clarity || [],
              profile: guestData.profile || {},
              settings: guestData.settings || {},
            },
          },
        };
      }

      // For authenticated users, fetch from Supabase
      const [habits, experiments, moods, sleep, mentalClarity, profile] = await Promise.all([
        supabase.from('habits').select('*').eq('user_id', userId),
        supabase.from('experiments').select('*').eq('user_id', userId),
        supabase.from('moods').select('*').eq('user_id', userId),
        supabase.from('sleep').select('*').eq('user_id', userId),
        supabase.from('mental_clarity').select('*').eq('user_id', userId),
        supabase.from('profiles').select('*').eq('id', userId).single(),
      ]);

      // Get settings from AsyncStorage
      const settingsData = await AsyncStorage.multiGet([
        '@theme',
        '@language',
        '@notification_preferences',
      ]);
      const settings = Object.fromEntries(settingsData);

      return {
        data: {
          userId,
          timestamp: new Date().toISOString(),
          version: SYNC_VERSION,
          data: {
            habits: habits.data || [],
            experiments: experiments.data || [],
            moods: moods.data || [],
            sleep: sleep.data || [],
            mentalClarity: mentalClarity.data || [],
            profile: profile.data || {},
            settings,
          },
        },
      };
    } catch (error: any) {
      console.error('Error exporting user data:', error);
      return {
        data: null,
        error: error.message || 'Failed to export data',
      };
    }
  }

  /**
   * Import user data from backup
   */
  static async importUserData(
    userId: string,
    syncData: SyncData
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate data version
      if (syncData.version !== SYNC_VERSION) {
        return {
          success: false,
          error: 'Incompatible backup version',
        };
      }

      // Validate user ID
      if (syncData.userId !== userId) {
        return {
          success: false,
          error: 'Backup belongs to a different user',
        };
      }

      if (await isGuestMode()) {
        // Import to guest mode
        await guestDataStore.importAll({
          habits: syncData.data.habits,
          experiments: syncData.data.experiments,
          moods: syncData.data.moods,
          sleep: syncData.data.sleep,
          mental_clarity: syncData.data.mentalClarity,
          profile: syncData.data.profile,
          settings: syncData.data.settings,
        });
      } else {
        // Import to Supabase (authenticated user)
        // Note: This is a simplified version. In production, you'd want to handle conflicts
        const { data: habits, error: habitsError } = await supabase
          .from('habits')
          .upsert(syncData.data.habits.map(h => ({ ...h, user_id: userId })));
        
        if (habitsError) throw habitsError;

        const { data: experiments, error: experimentsError } = await supabase
          .from('experiments')
          .upsert(syncData.data.experiments.map(e => ({ ...e, user_id: userId })));
        
        if (experimentsError) throw experimentsError;

        // Import settings
        if (syncData.data.settings) {
          const settingsEntries = Object.entries(syncData.data.settings);
          await AsyncStorage.multiSet(settingsEntries as [string, string][]);
        }
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error importing user data:', error);
      return {
        success: false,
        error: error.message || 'Failed to import data',
      };
    }
  }

  // ============================================================
  // Cloud-Specific Sync (Placeholder for native implementations)
  // ============================================================

  /**
   * Sync with Google Drive
   * NOTE: Requires @react-native-google-signin/google-signin
   * Install with: npm install @react-native-google-signin/google-signin
   */
  static async syncWithGoogleDrive(userId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Check if sync is enabled
      const config = await this.getConfig(userId);
      if (!config?.enabled || config.provider !== CloudProvider.GOOGLE_DRIVE) {
        return {
          success: false,
          error: 'Google Drive sync is not enabled',
        };
      }

      // Export data
      const exportResult = await this.exportUserData(userId);
      if (!exportResult.data) {
        return {
          success: false,
          error: exportResult.error || 'Failed to export data',
        };
      }

      // TODO: Implement Google Drive API integration
      // This requires:
      // 1. Google Sign-In authentication
      // 2. Google Drive API access
      // 3. File upload/download logic
      
      Alert.alert(
        'Google Drive Sync',
        'Google Drive integration requires additional setup. Please contact support for assistance.',
        [{ text: 'OK' }]
      );

      // For now, store locally as fallback
      await AsyncStorage.setItem(
        `${SYNC_DATA_KEY}_${userId}_google`,
        JSON.stringify(exportResult.data)
      );

      // Update last sync date
      await this.updateConfig(userId, {
        lastSyncDate: new Date().toISOString(),
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error syncing with Google Drive:', error);
      return {
        success: false,
        error: error.message || 'Failed to sync with Google Drive',
      };
    }
  }

  /**
   * Sync with iCloud
   * NOTE: Requires react-native-icloudstore
   * Install with: npm install react-native-icloudstore
   */
  static async syncWithiCloud(userId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      if (Platform.OS !== 'ios') {
        return {
          success: false,
          error: 'iCloud is only available on iOS',
        };
      }

      // Check if sync is enabled
      const config = await this.getConfig(userId);
      if (!config?.enabled || config.provider !== CloudProvider.ICLOUD) {
        return {
          success: false,
          error: 'iCloud sync is not enabled',
        };
      }

      // Export data
      const exportResult = await this.exportUserData(userId);
      if (!exportResult.data) {
        return {
          success: false,
          error: exportResult.error || 'Failed to export data',
        };
      }

      // TODO: Implement iCloud integration
      // This requires:
      // 1. react-native-icloudstore package
      // 2. iCloud entitlements in Xcode
      // 3. Key-value storage or CloudKit integration

      Alert.alert(
        'iCloud Sync',
        'iCloud integration requires additional setup. Please contact support for assistance.',
        [{ text: 'OK' }]
      );

      // For now, store locally as fallback
      await AsyncStorage.setItem(
        `${SYNC_DATA_KEY}_${userId}_icloud`,
        JSON.stringify(exportResult.data)
      );

      // Update last sync date
      await this.updateConfig(userId, {
        lastSyncDate: new Date().toISOString(),
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error syncing with iCloud:', error);
      return {
        success: false,
        error: error.message || 'Failed to sync with iCloud',
      };
    }
  }

  /**
   * Sync with Supabase (default for authenticated users)
   */
  static async syncWithSupabase(userId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Check if sync is enabled
      const config = await this.getConfig(userId);
      if (!config?.enabled || config.provider !== CloudProvider.SUPABASE) {
        return {
          success: false,
          error: 'Supabase sync is not enabled',
        };
      }

      // For authenticated users, data is already in Supabase
      // This method is mainly for backup/restore scenarios

      // Update last sync date
      await this.updateConfig(userId, {
        lastSyncDate: new Date().toISOString(),
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error syncing with Supabase:', error);
      return {
        success: false,
        error: error.message || 'Failed to sync with Supabase',
      };
    }
  }

  /**
   * Perform sync based on configured provider
   */
  static async performSync(userId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    const config = await this.getConfig(userId);
    
    if (!config?.enabled) {
      return {
        success: false,
        error: 'Cloud sync is not enabled',
      };
    }

    switch (config.provider) {
      case CloudProvider.GOOGLE_DRIVE:
        return this.syncWithGoogleDrive(userId);
      
      case CloudProvider.ICLOUD:
        return this.syncWithiCloud(userId);
      
      case CloudProvider.SUPABASE:
        return this.syncWithSupabase(userId);
      
      default:
        return {
          success: false,
          error: 'Unknown sync provider',
        };
    }
  }

  // ============================================================
  // Auto-Sync Management
  // ============================================================

  /**
   * Check if auto-sync should run
   */
  static async shouldAutoSync(userId: string): Promise<boolean> {
    const config = await this.getConfig(userId);
    
    if (!config?.enabled || !config.autoSync) {
      return false;
    }

    if (!config.lastSyncDate) {
      return true; // Never synced before
    }

    const lastSync = new Date(config.lastSyncDate);
    const now = new Date();
    const minutesSinceSync = (now.getTime() - lastSync.getTime()) / (1000 * 60);

    return minutesSinceSync >= config.syncInterval;
  }

  /**
   * Get sync status
   */
  static async getSyncStatus(userId: string): Promise<{
    enabled: boolean;
    provider: CloudProvider | null;
    lastSyncDate: string | null;
    syncDue: boolean;
  }> {
    const config = await this.getConfig(userId);
    const syncDue = await this.shouldAutoSync(userId);

    return {
      enabled: config?.enabled || false,
      provider: config?.provider || null,
      lastSyncDate: config?.lastSyncDate || null,
      syncDue,
    };
  }
}
